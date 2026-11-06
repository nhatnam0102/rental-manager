const Bills = {
    openCards: new Set(),

    render() {
        const month = parseInt(document.getElementById('selectMonth').value);
        const year = parseInt(document.getElementById('selectYear').value);
        const key = Utils.getKey(month, year);
        const bills = this.syncAll();
        const monthBills = bills[key] || {};
        const rooms = Storage.getRooms();
        const settings = Storage.getSettings();

        document.getElementById('billMonth').textContent = `${Utils.getMonthName(month)} ${year}`;

        this.renderElectricSummary();

        if (rooms.length === 0) {
            document.getElementById('billsList').innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><i class="bi bi-receipt"></i></div>
                    <p>Chưa có phòng nào. Hãy thêm phòng trước.</p>
                </div>`;
            return;
        }

        document.getElementById('billsList').innerHTML = rooms.map(room => {
            const bill = monthBills[room.id] || {};
            const total = bill.total || 0;
            const isPaid = bill.paid || false;
            const isOpen = this.openCards.has(room.id);
            const tenantCount = Tenants.getTenantCount(room.id);
            const v = x => x ?? '';

            return `
                <div class="bill-card">
                    <div class="bill-card-header ${isOpen ? 'expanded' : ''}" onclick="Bills.toggle('${room.id}')">
                        <div class="bill-info">
                            <div class="bill-room-icon">${Utils.esc(room.name.substring(0, 3))}</div>
                            <div>
                                <div class="bill-room-name">${Utils.esc(room.name)}</div>
                                <div class="bill-amount">${this.isEntered(bill) ? Utils.formatCurrency(total) : 'Chưa nhập chỉ số'}</div>
                            </div>
                        </div>
                        <div class="bill-actions">
                            <span class="badge ${isPaid ? 'badge-paid' : 'badge-unpaid'}">
                                ${isPaid ? 'Đã đóng' : 'Chưa đóng'}
                            </span>
                            <i class="bi bi-chevron-down chevron"></i>
                        </div>
                    </div>
                    <div class="bill-card-body ${isOpen ? 'show' : ''}" id="bill-body-${room.id}">
                        <div class="section-title">Tiền Phòng</div>
                        <div class="row g-3 mb-3">
                            <div class="col-md-12">
                                <label class="form-label">Tiền phòng (đ)</label>
                                <input type="number" class="form-control" value="${v(bill.roomFee)}"
                                    oninput="Bills.updateField('${room.id}', 'roomFee', this.value)" placeholder="0">
                            </div>
                        </div>

                        <div class="section-title">Điện</div>
                        <div class="row g-3 mb-3">
                            <div class="col-md-3">
                                <label class="form-label">Điện đầu</label>
                                <input type="number" class="form-control" value="${v(bill.electricStart)}"
                                    oninput="Bills.updateField('${room.id}', 'electricStart', this.value)">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">Điện cuối</label>
                                <input type="number" class="form-control" value="${v(bill.electricEnd)}"
                                    oninput="Bills.updateField('${room.id}', 'electricEnd', this.value)"
                                    onblur="Bills.onElectricEndBlur('${room.id}', this.value)">
                                <small class="text-muted" style="font-size:0.7rem">Tự điền điện đầu tháng sau</small>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">Tiêu thụ</label>
                                <input type="text" class="form-control" value="${bill.electricKwh || '0'}" readonly
                                    style="background:#f1f5f9; font-weight:600">
                                <small class="text-muted" style="font-size:0.7rem">kWh (cuối - đầu)</small>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">Thành tiền</label>
                                <div class="electric-info" style="padding:6px 0;font-weight:600;color:var(--primary)">${bill.electricTotal ? Utils.formatCurrency(bill.electricTotal) : '0 đ'}</div>
                            </div>
                        </div>

                        <div class="section-title">Nước</div>
                        <div class="row g-3 mb-3">
                            <div class="col-md-3">
                                <label class="form-label">Nước đầu</label>
                                <input type="number" class="form-control" value="${v(bill.waterStart)}"
                                    oninput="Bills.updateField('${room.id}', 'waterStart', this.value)">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">Nước cuối</label>
                                <input type="number" class="form-control" value="${v(bill.waterEnd)}"
                                    oninput="Bills.updateField('${room.id}', 'waterEnd', this.value)"
                                    onblur="Bills.onWaterEndBlur('${room.id}', this.value)">
                                <small class="text-muted" style="font-size:0.7rem">Tự điền nước đầu tháng sau</small>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">Tiêu thụ</label>
                                <input type="text" class="form-control" value="${bill.waterM3 || '0'}" readonly
                                    style="background:#f1f5f9; font-weight:600">
                                <small class="text-muted" style="font-size:0.7rem">m³ (cuối - đầu)</small>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">Thành tiền</label>
                                <div class="water-info" style="padding:6px 0;font-weight:600;color:var(--primary)">${bill.waterTotal ? Utils.formatCurrency(bill.waterTotal) : '0 đ'}</div>
                            </div>
                        </div>

                        <div class="section-title">WiFi & Rác</div>
                        <div class="row g-3 mb-3">
                            <div class="col-md-3">
                                <label class="form-label">Số người (WiFi)</label>
                                <input type="number" min="0" class="form-control" value="${bill.people ?? tenantCount}"
                                    oninput="Bills.updateField('${room.id}', 'people', this.value)">
                                <small class="text-muted people-hint" style="font-size:0.7rem">${this.peopleHint(room.id, bill, key, tenantCount)}</small>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">WiFi</label>
                                <div class="wifi-info" style="padding:6px 0;font-weight:500">
                                    ${this.renderWifiInfo(bill, settings, tenantCount)}
                                </div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Rác (đ)</label>
                                <input type="number" class="form-control" value="${this.garbageOf(bill, settings)}"
                                    oninput="Bills.updateField('${room.id}', 'garbage', this.value)">
                            </div>
                        </div>

                        <div class="section-title">Phí Khác & Ghi Chú</div>
                        <div class="row g-3 mb-4">
                            <div class="col-md-4">
                                <label class="form-label">Giữ xe (đ)</label>
                                <input type="number" class="form-control" value="${v(bill.parking)}"
                                    oninput="Bills.updateField('${room.id}', 'parking', this.value)" placeholder="0">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Vệ sinh (đ)</label>
                                <input type="number" class="form-control" value="${v(bill.cleaning)}"
                                    oninput="Bills.updateField('${room.id}', 'cleaning', this.value)" placeholder="0">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Khác (đ)</label>
                                <input type="number" class="form-control" value="${v(bill.other)}"
                                    oninput="Bills.updateField('${room.id}', 'other', this.value)" placeholder="0">
                            </div>
                            <div class="col-12">
                                <label class="form-label">Ghi chú</label>
                                <textarea class="form-control" rows="2" placeholder="Ghi chú thêm..."
                                    oninput="Bills.updateField('${room.id}', 'note', this.value)">${Utils.esc(typeof bill.note === 'string' ? bill.note : '')}</textarea>
                            </div>
                        </div>

                        <div class="section-title">Khấu Trừ</div>
                        <div class="row g-3 mb-3">
                            <div class="col-md-6">
                                <label class="form-label">Tiền cọc (đ)</label>
                                <input type="number" class="form-control" value="${v(bill.deposit)}"
                                    oninput="Bills.updateField('${room.id}', 'deposit', this.value)" placeholder="0">
                                <small class="text-muted" style="font-size:0.7rem">Nhập số dương nếu khách đã cọc</small>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Phí mua đồ (đ)</label>
                                <input type="number" class="form-control" value="${v(bill.purchases)}"
                                    oninput="Bills.updateField('${room.id}', 'purchases', this.value)" placeholder="0">
                                <small class="text-muted" style="font-size:0.7rem">Tiền khách mua đồ, trừ vào tổng</small>
                            </div>
                        </div>

                        <div class="d-flex justify-content-between align-items-center pt-3" style="border-top: 1px solid var(--border)">
                            <div>
                                <h5 class="mb-0" style="color: var(--primary)">Tổng: <strong class="bill-total">${Utils.formatCurrency(total)}</strong></h5>
                                ${((parseFloat(bill.deposit) || 0) + (parseFloat(bill.purchases) || 0)) > 0 ?
                                    `<small class="text-muted bill-deduction" style="font-size:0.75rem">Đã trừ: -${Utils.formatCurrency((parseFloat(bill.deposit) || 0) + (parseFloat(bill.purchases) || 0))}</small>` :
                                    `<small class="text-muted bill-deduction" style="font-size:0.75rem;display:none"></small>`}
                            </div>
                            <div class="d-flex gap-2">
                                <button class="btn btn-sm btn-outline-secondary" onclick="Bills.printBill('${room.id}')">
                                    <i class="bi bi-printer"></i> In
                                </button>
                                <button class="btn btn-sm ${isPaid ? 'btn-outline-warning' : 'btn-success'}" onclick="Bills.togglePaid('${room.id}')">
                                    <i class="bi ${isPaid ? 'bi-x-circle' : 'bi-check-circle'}"></i>
                                    ${isPaid ? 'Hủy đóng' : 'Đã đóng'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>`;
        }).join('');

        this.renderMonthList();
    },

    renderElectricSummary() {
        const container = document.getElementById('electricSummary');
        if (!container) return;

        const month = parseInt(document.getElementById('selectMonth').value);
        const year = parseInt(document.getElementById('selectYear').value);
        const key = Utils.getKey(month, year);
        const monthBills = this.syncAll()[key] || {};
        const rooms = Storage.getRooms();
        const settings = Storage.getSettings();

        if (rooms.length === 0) {
            container.innerHTML = `
                <div class="electric-summary-icon"><i class="bi bi-lightning-charge"></i></div>
                <div class="electric-summary-main">
                    <span class="electric-summary-label">Tổng tiền điện tất cả phòng</span>
                    <span class="electric-summary-total">0 đ</span>
                </div>
                <span class="electric-summary-empty">Chưa có phòng nào</span>`;
            return;
        }

        let totalKwh = 0;
        let totalAmount = 0;
        let enteredCount = 0;
        let paidAmount = 0;

        rooms.forEach(room => {
            const bill = monthBills[room.id];
            if (!bill) return;

            if (bill.electricEnd !== undefined) enteredCount++;
            if (!this.isEntered(bill)) return;

            const kwh = bill.electricKwh || 0;
            const amount = bill.electricTotal || 0;
            totalKwh += kwh;
            totalAmount += amount;
            if (bill.paid) paidAmount += amount;
        });

        container.innerHTML = `
            <div class="electric-summary-icon"><i class="bi bi-lightning-charge-fill"></i></div>
            <div class="electric-summary-main">
                <span class="electric-summary-label">Tổng tiền điện tất cả phòng · ${Utils.getMonthName(month)} ${year}</span>
                <span class="electric-summary-total">${Utils.formatCurrency(totalAmount)}</span>
            </div>
            <div class="electric-summary-items">
                <div class="electric-summary-item">
                    <span class="electric-summary-label">Tổng tiêu thụ</span>
                    <span class="electric-summary-value">${Utils.formatNumber(totalKwh)} kWh</span>
                </div>
                <div class="electric-summary-item">
                    <span class="electric-summary-label">Giá điện</span>
                    <span class="electric-summary-value">${Utils.formatNumber(settings.electricPrice || 0)} đ/kWh</span>
                </div>
                <div class="electric-summary-item">
                    <span class="electric-summary-label">Phòng đã nhập chỉ số</span>
                    <span class="electric-summary-value">${enteredCount}/${rooms.length}</span>
                </div>
                <div class="electric-summary-item">
                    <span class="electric-summary-label">Tiền điện đã đóng</span>
                    <span class="electric-summary-value electric-summary-paid">${Utils.formatCurrency(paidAmount)}</span>
                </div>
            </div>`;
    },

    toggle(roomId) {
        const body = document.getElementById(`bill-body-${roomId}`);
        const header = body.previousElementSibling;

        if (this.openCards.has(roomId)) {
            this.openCards.delete(roomId);
            body.classList.remove('show');
            header.classList.remove('expanded');
        } else {
            this.openCards.add(roomId);
            body.classList.add('show');
            header.classList.add('expanded');
        }
    },

    updateField(roomId, field, value) {
        const month = parseInt(document.getElementById('selectMonth').value);
        const year = parseInt(document.getElementById('selectYear').value);
        const key = Utils.getKey(month, year);
        const bills = Storage.getBills();

        if (!bills[key]) bills[key] = {};
        if (!bills[key][roomId]) bills[key][roomId] = {};
        const bill = bills[key][roomId];
        const tenantCount = Tenants.getTenantCount(roomId);

        if (field === 'note') {
            bill.note = value;
        } else if (field === 'people') {
            // Xoá trống ô số người = quay lại theo danh sách khách.
            const n = parseInt(value);
            bill.peopleManual = Number.isFinite(n) && n >= 0;
            bill.people = bill.peopleManual ? n : tenantCount;
            bill.touched = true;
        } else {
            // Ô trống thì bỏ trường (chưa nhập), để phân biệt với số 0 thật.
            if (value === '') delete bill[field];
            else bill[field] = parseFloat(value) || 0;
            bill.touched = true;
        }

        this.syncBill(bill, roomId, key, Storage.getSettings(), tenantCount);
        Storage.saveBills(bills);
        this.updateRealtime(roomId, bill, key);
    },

    usePeopleFromTenants(roomId) {
        this.updateField(roomId, 'people', '');
        this.render();
    },

    peopleHint(roomId, bill, key, tenantCount) {
        const people = bill.people ?? tenantCount;
        if (people !== tenantCount) {
            return `Danh sách khách hiện có ${tenantCount} người · <a href="#" onclick="event.preventDefault(); Bills.usePeopleFromTenants('${roomId}')">Dùng ${tenantCount}</a>`;
        }
        if (bill.paid) return 'Giữ nguyên theo lúc đóng tiền';
        return this.isLive(bill, key) ? 'Tự theo danh sách khách' : 'Giữ nguyên số người của tháng này';
    },

    onElectricEndBlur(roomId, value) {
        const month = parseInt(document.getElementById('selectMonth').value);
        const year = parseInt(document.getElementById('selectYear').value);
        const numValue = parseFloat(value) || 0;

        if (numValue > 0) {
            const bills = Storage.getBills();
            this.autoFillNextMonth(roomId, numValue, month, year, bills);
            Storage.saveBills(bills);
        }
    },

    autoFillNextMonth(roomId, electricEnd, currentMonth, currentYear, bills) {
        let nextMonth = currentMonth + 1;
        let nextYear = currentYear;
        if (nextMonth > 12) {
            nextMonth = 1;
            nextYear++;
        }

        const nextKey = Utils.getKey(nextMonth, nextYear);
        if (!bills[nextKey]) bills[nextKey] = {};
        if (!bills[nextKey][roomId]) bills[nextKey][roomId] = {};

        const nextBill = bills[nextKey][roomId];
        if (!nextBill.electricStart || nextBill.electricStart === 0) {
            nextBill.electricStart = electricEnd;
            this.showToast(`Tự điền điện đầu ${Utils.getMonthName(nextMonth)} ${nextYear}: ${Utils.formatNumber(electricEnd)}`);
        }
    },

    renderWifiInfo(bill, settings, tenantCount) {
        const count = bill.people ?? tenantCount;
        const pricePerPerson = bill.prices?.wifi ?? settings.wifiPricePerPerson;
        const total = count * pricePerPerson;
        if (count === 0) return `<span class="text-muted" style="font-size:0.85rem">Chưa có khách (${Utils.formatCurrency(pricePerPerson)}/người)</span>`;
        return `${count} người × ${Utils.formatCurrency(pricePerPerson)} = <strong style="color:var(--primary)">${Utils.formatCurrency(total)}</strong>`;
    },

    onWaterEndBlur(roomId, value) {
        const month = parseInt(document.getElementById('selectMonth').value);
        const year = parseInt(document.getElementById('selectYear').value);
        const numValue = parseFloat(value) || 0;

        if (numValue > 0) {
            const bills = Storage.getBills();
            this.autoFillNextMonthWater(roomId, numValue, month, year, bills);
            Storage.saveBills(bills);
        }
    },

    autoFillNextMonthWater(roomId, waterEnd, currentMonth, currentYear, bills) {
        let nextMonth = currentMonth + 1;
        let nextYear = currentYear;
        if (nextMonth > 12) {
            nextMonth = 1;
            nextYear++;
        }

        const nextKey = Utils.getKey(nextMonth, nextYear);
        if (!bills[nextKey]) bills[nextKey] = {};
        if (!bills[nextKey][roomId]) bills[nextKey][roomId] = {};

        const nextBill = bills[nextKey][roomId];
        if (!nextBill.waterStart || nextBill.waterStart === 0) {
            nextBill.waterStart = waterEnd;
            this.showToast(`Tự điền nước đầu ${Utils.getMonthName(nextMonth)} ${nextYear}: ${Utils.formatNumber(waterEnd)}`);
        }
    },

    showToast(message) {
        const existing = document.querySelector('.toast-msg');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast-msg';
        toast.innerHTML = `<i class="bi bi-check-circle-fill"></i> ${message}`;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Hoá đơn "còn sống" (tháng này trở đi, chưa đóng tiền) thì theo số người và bảng giá hiện tại.
    // Tháng đã qua hoặc đã đóng thì giữ số người và giá lúc đó, để sổ sách cũ không tự đổi
    // khi thêm/bớt khách hay sửa giá (chủ trọ thường nhập hoá đơn tháng trước vào đầu tháng sau).
    isLive(bill, key) {
        return !bill.paid && key >= Utils.currentKey();
    },

    // Hoá đơn chỉ có điện/nước đầu do tháng trước tự điền thì chưa tính là đã nhập.
    isEntered(bill) {
        return !!bill && (bill.touched || bill.total !== undefined);
    },

    pricesFrom(settings) {
        return {
            electric: settings.electricPrice,
            water: settings.waterPrice,
            wifi: settings.wifiPricePerPerson,
            garbage: settings.garbagePrice
        };
    },

    syncBill(bill, roomId, key, settings, tenantCount) {
        const live = this.isLive(bill, key);

        if (!bill.prices) {
            // Hoá đơn từ bản cũ chưa lưu giá: suy giá từ số tiền đã tính lúc đó để tổng tháng cũ không nhảy.
            const p = this.pricesFrom(settings);
            if (!live) {
                if (bill.electricKwh > 0 && bill.electricTotal > 0) p.electric = bill.electricTotal / bill.electricKwh;
                if (bill.waterM3 > 0 && bill.waterTotal > 0) p.water = bill.waterTotal / bill.waterM3;
            }
            // Bản cũ coi rác = 0 là "dùng giá mặc định".
            if (bill.garbage === 0) delete bill.garbage;
            bill.prices = p;
            if (bill.people === undefined && !live && bill.wifi !== undefined && p.wifi > 0) {
                bill.people = Math.round(bill.wifi / p.wifi);
                bill.peopleManual = bill.people !== tenantCount;
            }
            if (bill.total !== undefined) bill.touched = true;
        } else if (live) {
            bill.prices = this.pricesFrom(settings);
        }

        if (bill.people === undefined || (live && !bill.peopleManual)) bill.people = tenantCount;

        if (bill.touched) this.calculateTotal(bill);
    },

    // Đồng bộ mọi hoá đơn với danh sách khách và bảng giá; gọi trước khi vẽ và sau mỗi lần đổi khách/giá.
    syncAll() {
        const bills = Storage.getBills();
        const settings = Storage.getSettings();
        const counts = {};
        Storage.getTenants().forEach(t => {
            if (t.roomId) counts[t.roomId] = (counts[t.roomId] || 0) + 1;
        });

        const before = JSON.stringify(bills);
        Object.entries(bills).forEach(([key, monthBills]) => {
            Object.entries(monthBills).forEach(([roomId, bill]) => {
                this.syncBill(bill, roomId, key, settings, counts[roomId] || 0);
            });
        });
        if (JSON.stringify(bills) !== before) Storage.saveBills(bills);
        return bills;
    },

    garbageOf(bill, settings) {
        return bill.garbage ?? bill.prices?.garbage ?? settings.garbagePrice;
    },

    calculateTotal(bill) {
        const p = bill.prices;
        const num = v => parseFloat(v) || 0;
        let total = num(bill.roomFee);

        // Điện đầu = 0 là hợp lệ (công tơ mới), nên chỉ cần đã nhập cả hai số.
        if (bill.electricStart !== undefined && bill.electricEnd !== undefined) {
            bill.electricKwh = Math.max(0, num(bill.electricEnd) - num(bill.electricStart));
        } else {
            bill.electricKwh = 0;
        }
        bill.electricTotal = Math.round(Utils.calculateElectricBill(bill.electricKwh, p.electric));
        total += bill.electricTotal;

        if (bill.waterStart !== undefined && bill.waterEnd !== undefined) {
            bill.waterM3 = Math.max(0, num(bill.waterEnd) - num(bill.waterStart));
        } else {
            bill.waterM3 = 0;
        }
        bill.waterTotal = Math.round(Utils.calculateWaterBill(bill.waterM3, p.water));
        total += bill.waterTotal;

        bill.wifi = bill.people * p.wifi;
        total += bill.wifi;

        total += num(bill.garbage ?? p.garbage);
        total += num(bill.parking);
        total += num(bill.cleaning);
        total += num(bill.other);

        total -= num(bill.deposit);
        total -= num(bill.purchases);

        bill.total = total;
    },

    updateRealtime(roomId, bill, key) {
        const settings = Storage.getSettings();
        const card = document.querySelector(`#bill-body-${roomId}`)?.closest('.bill-card');
        if (!card) return;
        const tenantCount = Tenants.getTenantCount(roomId);

        // Tổng có thể về 0 hoặc âm (trừ cọc) nên không lọc theo bill.total.
        const amountEl = card.querySelector('.bill-amount');
        if (amountEl && this.isEntered(bill)) {
            amountEl.textContent = Utils.formatCurrency(bill.total);
        }

        const peopleHint = card.querySelector('.people-hint');
        if (peopleHint) peopleHint.innerHTML = this.peopleHint(roomId, bill, key, tenantCount);

        const electricKwhInput = card.querySelector('.electric-info')?.closest('.row')?.querySelector('input[readonly]');
        const electricInfo = card.querySelector('.electric-info');
        if (electricKwhInput && bill.electricKwh !== undefined) {
            electricKwhInput.value = bill.electricKwh;
        }
        if (electricInfo) {
            electricInfo.textContent = bill.electricTotal ? Utils.formatCurrency(bill.electricTotal) : '0 đ';
        }

        const waterInfo = card.querySelector('.water-info');
        if (waterInfo) {
            waterInfo.textContent = bill.waterTotal ? Utils.formatCurrency(bill.waterTotal) : '0 đ';
        }

        const waterM3Input = card.querySelectorAll('input[readonly]')[1];
        if (waterM3Input && bill.waterM3 !== undefined) {
            waterM3Input.value = bill.waterM3;
        }

        const wifiInfo = card.querySelector('.wifi-info');
        if (wifiInfo) {
            wifiInfo.innerHTML = this.renderWifiInfo(bill, settings, tenantCount);
        }

        const totalEl = card.querySelector('.bill-total');
        if (totalEl) {
            totalEl.textContent = Utils.formatCurrency(bill.total);
        }

        const deductionEl = card.querySelector('.bill-deduction');
        const totalDeduction = (parseFloat(bill.deposit) || 0) + (parseFloat(bill.purchases) || 0);
        if (deductionEl) {
            if (totalDeduction > 0) {
                deductionEl.textContent = `Đã trừ: -${Utils.formatCurrency(totalDeduction)}`;
                deductionEl.style.display = '';
            } else {
                deductionEl.style.display = 'none';
            }
        }

        this.renderElectricSummary();
    },

    renderMonthList() {
        const bills = Storage.getBills();
        const rooms = Storage.getRooms();
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const selectedMonth = parseInt(document.getElementById('selectMonth').value);
        const selectedYear = parseInt(document.getElementById('selectYear').value);

        const months = [];
        let hasCurrentMonth = false;

        for (let i = 11; i >= 0; i--) {
            let m = currentMonth - i;
            let y = currentYear;
            while (m <= 0) { m += 12; y--; }

            const key = Utils.getKey(m, y);
            const monthBills = bills[key] || {};

            let hasData = false;
            let totalRevenue = 0;
            let paidCount = 0;
            let totalCount = 0;

            rooms.forEach(room => {
                const bill = monthBills[room.id];
                if (bill && (bill.electricStart || bill.electricEnd || bill.roomFee || bill.waterStart || bill.waterEnd || this.isEntered(bill))) {
                    hasData = true;
                    if (this.isEntered(bill)) {
                        totalRevenue += bill.total;
                        totalCount++;
                        if (bill.paid) paidCount++;
                    }
                }
            });

            const isCurrent = m === currentMonth && y === currentYear;
            if (isCurrent) hasCurrentMonth = true;

            if (!hasData && !isCurrent) continue;

            months.push({
                month: m,
                year: y,
                key,
                totalRevenue,
                paidCount,
                totalCount,
                isSelected: m === selectedMonth && y === selectedYear
            });
        }

        const container = document.getElementById('monthList');
        if (!container) return;

        if (months.length === 0) {
            container.innerHTML = `<div class="text-center text-muted py-3" style="font-size:0.85rem">Chưa có dữ liệu</div>`;
            return;
        }

        container.innerHTML = months.map(m => `
            <div class="month-item ${m.isSelected ? 'active' : ''}" onclick="App.selectMonth(${m.month}, ${m.year})">
                <div class="month-item-header">
                    <span class="month-name">${Utils.getMonthName(m.month)}</span>
                    <span class="month-year">${m.year}</span>
                </div>
                <div class="month-item-body">
                    <span class="month-revenue">${m.totalRevenue > 0 ? Utils.formatCurrency(m.totalRevenue) : '-'}</span>
                    <span class="month-status ${m.totalCount > 0 && m.paidCount === m.totalCount ? 'all-paid' : ''}">
                        ${m.totalCount > 0 ? `${m.paidCount}/${m.totalCount}` : '-'}
                    </span>
                </div>
            </div>
        `).join('');
    },

    togglePaid(roomId) {
        const month = parseInt(document.getElementById('selectMonth').value);
        const year = parseInt(document.getElementById('selectYear').value);
        const key = Utils.getKey(month, year);
        const bills = this.syncAll();

        if (bills[key] && bills[key][roomId]) {
            bills[key][roomId].paid = !bills[key][roomId].paid;
            Storage.saveBills(bills);
            this.syncAll();
            this.render();
        }
    },

    markAllPaid() {
        const month = parseInt(document.getElementById('selectMonth').value);
        const year = parseInt(document.getElementById('selectYear').value);
        const key = Utils.getKey(month, year);
        const bills = this.syncAll();

        if (!bills[key]) return;

        // Chỉ phòng còn tồn tại và đã nhập hoá đơn.
        const roomIds = new Set(Storage.getRooms().map(r => r.id));
        Object.entries(bills[key]).forEach(([roomId, bill]) => {
            if (roomIds.has(roomId) && this.isEntered(bill)) bill.paid = true;
        });

        Storage.saveBills(bills);
        this.render();
    },

    printBill(roomId) {
        const month = parseInt(document.getElementById('selectMonth').value);
        const year = parseInt(document.getElementById('selectYear').value);
        const key = Utils.getKey(month, year);
        const bills = this.syncAll();
        const bill = bills[key]?.[roomId] || {};
        const roomName = Utils.esc(Rooms.getRoomName(roomId));
        const settings = Storage.getSettings();
        const prices = bill.prices || this.pricesFrom(settings);
        const tenantCount = bill.people ?? Tenants.getTenantCount(roomId);
        const wifiTotal = tenantCount * prices.wifi;
        const garbage = this.garbageOf(bill, settings);

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Hóa Đơn - ${roomName} - ${Utils.getMonthName(month)} ${year}</title>
                <style>
                    body { font-family: 'Segoe UI', sans-serif; padding: 24px; max-width: 400px; margin: 0 auto; color: #1e293b; }
                    h2 { text-align: center; margin-bottom: 4px; font-size: 1.2rem; }
                    h4 { text-align: center; color: #64748b; margin-bottom: 24px; font-weight: 400; font-size: 0.9rem; }
                    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 0.9rem; }
                    .total { font-size: 1.15em; font-weight: 700; border-top: 2px solid #1e293b; margin-top: 12px; padding-top: 12px; border-bottom: none; }
                    .section { margin: 16px 0; }
                    .section-title { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 8px; font-weight: 600; }
                </style>
            </head>
            <body>
                <h2>HÓA ĐƠN TIỀN PHÒNG</h2>
                <h4>${roomName} - ${Utils.getMonthName(month)} ${year}</h4>
                <div class="section">
                    <div class="section-title">Tiền Phòng</div>
                    <div class="row"><span>Tiền phòng:</span><span>${Utils.formatCurrency(bill.roomFee || 0)}</span></div>
                </div>
                <div class="section">
                    <div class="section-title">Điện</div>
                    <div class="row"><span>Số đầu:</span><span>${bill.electricStart || 0}</span></div>
                    <div class="row"><span>Số cuối:</span><span>${bill.electricEnd || 0}</span></div>
                    <div class="row"><span>Tiêu thụ (${bill.electricKwh || 0} kWh × ${Utils.formatNumber(prices.electric)}):</span><span>${Utils.formatCurrency(bill.electricTotal || 0)}</span></div>
                </div>
                <div class="section">
                    <div class="section-title">Nước</div>
                    <div class="row"><span>Số đầu:</span><span>${bill.waterStart || 0}</span></div>
                    <div class="row"><span>Số cuối:</span><span>${bill.waterEnd || 0}</span></div>
                    <div class="row"><span>Tiêu thụ (${bill.waterM3 || 0} m³ × ${Utils.formatNumber(prices.water)}):</span><span>${Utils.formatCurrency(bill.waterTotal || 0)}</span></div>
                </div>
                <div class="section">
                    <div class="section-title">Dịch Vụ</div>
                    <div class="row"><span>WiFi (${tenantCount} người × ${Utils.formatNumber(prices.wifi)}):</span><span>${Utils.formatCurrency(wifiTotal)}</span></div>
                    <div class="row"><span>Rác:</span><span>${Utils.formatCurrency(garbage)}</span></div>
                </div>
                <div class="section">
                    <div class="section-title">Phí Khác</div>
                    <div class="row"><span>Giữ xe:</span><span>${Utils.formatCurrency(bill.parking || 0)}</span></div>
                    <div class="row"><span>Vệ sinh:</span><span>${Utils.formatCurrency(bill.cleaning || 0)}</span></div>
                    <div class="row"><span>Khác:</span><span>${Utils.formatCurrency(bill.other || 0)}</span></div>
                </div>
                ${((parseFloat(bill.deposit) || 0) + (parseFloat(bill.purchases) || 0)) > 0 ? `
                <div class="section">
                    <div class="section-title">Khấu Trừ</div>
                    ${bill.deposit ? `<div class="row"><span>Tiền cọc:</span><span>-${Utils.formatCurrency(bill.deposit)}</span></div>` : ''}
                    ${bill.purchases ? `<div class="row"><span>Phí mua đồ:</span><span>-${Utils.formatCurrency(bill.purchases)}</span></div>` : ''}
                </div>` : ''}
                <div class="row total"><span>TỔNG CỘNG:</span><span>${Utils.formatCurrency(bill.total || 0)}</span></div>
                <script>window.onload = function() { window.print(); }</script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }
};
