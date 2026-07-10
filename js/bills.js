const Bills = {
    openCards: new Set(),

    render() {
        const month = parseInt(document.getElementById('selectMonth').value);
        const year = parseInt(document.getElementById('selectYear').value);
        const key = Utils.getKey(month, year);
        const bills = Storage.getBills();
        const monthBills = bills[key] || {};
        const rooms = Storage.getRooms();
        const settings = Storage.getSettings();

        document.getElementById('billMonth').textContent = `${Utils.getMonthName(month)} ${year}`;

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

            return `
                <div class="bill-card">
                    <div class="bill-card-header ${isOpen ? 'expanded' : ''}" onclick="Bills.toggle('${room.id}')">
                        <div class="bill-info">
                            <div class="bill-room-icon">${room.name.substring(0, 3)}</div>
                            <div>
                                <div class="bill-room-name">${room.name}</div>
                                <div class="bill-amount">${total > 0 ? Utils.formatCurrency(total) : 'Chưa nhập chỉ số'}</div>
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
                        <div class="section-title">Tiền Phòng & Điện</div>
                        <div class="row g-3 mb-3">
                            <div class="col-md-6">
                                <label class="form-label">Tiền phòng (đ)</label>
                                <input type="number" class="form-control" value="${bill.roomFee || ''}"
                                    oninput="Bills.updateField('${room.id}', 'roomFee', this.value)" placeholder="0">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">Điện đầu</label>
                                <input type="number" class="form-control" value="${bill.electricStart || ''}"
                                    oninput="Bills.updateField('${room.id}', 'electricStart', this.value)">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">Điện cuối</label>
                                <input type="number" class="form-control" value="${bill.electricEnd || ''}"
                                    oninput="Bills.updateField('${room.id}', 'electricEnd', this.value)"
                                    onblur="Bills.onElectricEndBlur('${room.id}', this.value)">
                                <small class="text-muted" style="font-size:0.7rem">Tự điền điện đầu tháng sau</small>
                            </div>
                        </div>
                        <div class="electric-info text-muted mb-3" style="font-size:0.85rem;${bill.electricKwh ? '' : 'display:none'}">${bill.electricKwh ? `${bill.electricKwh} kWh × ${Utils.formatNumber(settings.electricPrice)} = ${Utils.formatCurrency(bill.electricTotal || 0)}` : ''}</div>

                        <div class="section-title">Nước</div>
                        <div class="row g-3 mb-3">
                            <div class="col-md-3">
                                <label class="form-label">Nước đầu</label>
                                <input type="number" class="form-control" value="${bill.waterStart || ''}"
                                    oninput="Bills.updateField('${room.id}', 'waterStart', this.value)">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">Nước cuối</label>
                                <input type="number" class="form-control" value="${bill.waterEnd || ''}"
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
                            <div class="col-md-6">
                                <label class="form-label">WiFi</label>
                                <div class="wifi-info" style="padding:6px 0;font-weight:500">
                                    ${this.renderWifiInfo(room.id, settings)}
                                </div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Rác (đ)</label>
                                <input type="number" class="form-control" value="${bill.garbage || settings.garbagePrice}"
                                    oninput="Bills.updateField('${room.id}', 'garbage', this.value)">
                            </div>
                        </div>

                        <div class="section-title">Phí Khác & Ghi Chú</div>
                        <div class="row g-3 mb-4">
                            <div class="col-md-4">
                                <label class="form-label">Giữ xe (đ)</label>
                                <input type="number" class="form-control" value="${bill.parking || ''}"
                                    oninput="Bills.updateField('${room.id}', 'parking', this.value)" placeholder="0">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Vệ sinh (đ)</label>
                                <input type="number" class="form-control" value="${bill.cleaning || ''}"
                                    oninput="Bills.updateField('${room.id}', 'cleaning', this.value)" placeholder="0">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Khác (đ)</label>
                                <input type="number" class="form-control" value="${bill.other || ''}"
                                    oninput="Bills.updateField('${room.id}', 'other', this.value)" placeholder="0">
                            </div>
                            <div class="col-12">
                                <label class="form-label">Ghi chú</label>
                                <textarea class="form-control" rows="2" placeholder="Ghi chú thêm..."
                                    oninput="Bills.updateField('${room.id}', 'note', this.value)">${bill.note || ''}</textarea>
                            </div>
                        </div>

                        <div class="d-flex justify-content-between align-items-center pt-3" style="border-top: 1px solid var(--border)">
                            <h5 class="mb-0" style="color: var(--primary)">Tổng: <strong class="bill-total">${Utils.formatCurrency(total)}</strong></h5>
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

        const numValue = parseFloat(value) || 0;
        bills[key][roomId][field] = numValue;

        this.calculateTotal(bills[key][roomId], roomId);
        Storage.saveBills(bills);
        this.updateRealtime(roomId, bills[key][roomId]);
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

    renderWifiInfo(roomId, settings) {
        const count = Tenants.getTenantCount(roomId);
        const pricePerPerson = settings.wifiPricePerPerson || 20000;
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

    calculateTotal(bill, roomId) {
        const settings = Storage.getSettings();
        let total = 0;

        total += parseFloat(bill.roomFee) || 0;

        if (bill.electricStart && bill.electricEnd) {
            bill.electricKwh = Math.max(0, bill.electricEnd - bill.electricStart);
            bill.electricTotal = Utils.calculateElectricBill(bill.electricKwh, settings.electricPrice);
            total += bill.electricTotal;
        } else {
            bill.electricKwh = 0;
            bill.electricTotal = 0;
        }

        if (bill.waterStart !== undefined && bill.waterEnd !== undefined) {
            bill.waterM3 = Math.max(0, (parseFloat(bill.waterEnd) || 0) - (parseFloat(bill.waterStart) || 0));
        } else {
            bill.waterM3 = parseFloat(bill.waterM3) || 0;
        }
        bill.waterTotal = Utils.calculateWaterBill(bill.waterM3, settings.waterPrice);
        total += bill.waterTotal;

        const tenantCount = roomId ? Tenants.getTenantCount(roomId) : 0;
        bill.wifi = tenantCount * (settings.wifiPricePerPerson || 20000);
        total += bill.wifi;

        total += parseFloat(bill.garbage) || settings.garbagePrice;
        total += parseFloat(bill.parking) || 0;
        total += parseFloat(bill.cleaning) || 0;
        total += parseFloat(bill.other) || 0;

        bill.total = total;
    },

    updateRealtime(roomId, bill) {
        const settings = Storage.getSettings();
        const card = document.querySelector(`#bill-body-${roomId}`)?.closest('.bill-card');
        if (!card) return;

        const amountEl = card.querySelector('.bill-amount');
        if (amountEl && bill.total) {
            amountEl.textContent = Utils.formatCurrency(bill.total);
        }

        const kwInfo = card.querySelector('.electric-info');
        if (kwInfo) {
            if (bill.electricKwh) {
                kwInfo.textContent = `${bill.electricKwh} kWh × ${Utils.formatNumber(settings.electricPrice)} = ${Utils.formatCurrency(bill.electricTotal || 0)}`;
                kwInfo.style.display = '';
            } else {
                kwInfo.style.display = 'none';
            }
        }

        const waterInfo = card.querySelector('.water-info');
        if (waterInfo) {
            waterInfo.textContent = bill.waterTotal ? Utils.formatCurrency(bill.waterTotal) : '0 đ';
        }

        const waterM3Input = card.querySelector('input[readonly]');
        if (waterM3Input && bill.waterM3 !== undefined) {
            waterM3Input.value = bill.waterM3;
        }

        const wifiInfo = card.querySelector('.wifi-info');
        if (wifiInfo) {
            wifiInfo.innerHTML = this.renderWifiInfo(roomId, settings);
        }

        const totalEl = card.querySelector('.bill-total');
        if (totalEl) {
            totalEl.textContent = Utils.formatCurrency(bill.total);
        }
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
                if (bill && (bill.electricStart || bill.electricEnd || bill.roomFee || bill.waterStart || bill.waterEnd || bill.waterM3 || bill.total)) {
                    hasData = true;
                    if (bill.total) {
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
        const bills = Storage.getBills();

        if (bills[key] && bills[key][roomId]) {
            bills[key][roomId].paid = !bills[key][roomId].paid;
            Storage.saveBills(bills);
            this.render();
        }
    },

    markAllPaid() {
        const month = parseInt(document.getElementById('selectMonth').value);
        const year = parseInt(document.getElementById('selectYear').value);
        const key = Utils.getKey(month, year);
        const bills = Storage.getBills();

        if (!bills[key]) return;

        Object.keys(bills[key]).forEach(roomId => {
            bills[key][roomId].paid = true;
        });

        Storage.saveBills(bills);
        this.render();
    },

    printBill(roomId) {
        const month = parseInt(document.getElementById('selectMonth').value);
        const year = parseInt(document.getElementById('selectYear').value);
        const key = Utils.getKey(month, year);
        const bills = Storage.getBills();
        const bill = bills[key]?.[roomId] || {};
        const roomName = Rooms.getRoomName(roomId);
        const settings = Storage.getSettings();
        const tenantCount = Tenants.getTenantCount(roomId);
        const wifiTotal = tenantCount * (settings.wifiPricePerPerson || 20000);

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
                    <div class="section-title">Phòng & Điện</div>
                    <div class="row"><span>Tiền phòng:</span><span>${Utils.formatCurrency(bill.roomFee || 0)}</span></div>
                    <div class="row"><span>Điện (${bill.electricKwh || 0} kWh × ${Utils.formatNumber(settings.electricPrice)}):</span><span>${Utils.formatCurrency(bill.electricTotal || 0)}</span></div>
                </div>
                <div class="section">
                    <div class="section-title">Nước</div>
                    <div class="row"><span>Số đầu:</span><span>${bill.waterStart || 0}</span></div>
                    <div class="row"><span>Số cuối:</span><span>${bill.waterEnd || 0}</span></div>
                    <div class="row"><span>Tiêu thụ (${bill.waterM3 || 0} m³ × ${Utils.formatNumber(settings.waterPrice)}):</span><span>${Utils.formatCurrency(bill.waterTotal || 0)}</span></div>
                </div>
                <div class="section">
                    <div class="section-title">Dịch Vụ</div>
                    <div class="row"><span>WiFi (${tenantCount} người × ${Utils.formatNumber(settings.wifiPricePerPerson || 20000)}):</span><span>${Utils.formatCurrency(wifiTotal)}</span></div>
                    <div class="row"><span>Rác:</span><span>${Utils.formatCurrency(bill.garbage || 0)}</span></div>
                </div>
                <div class="section">
                    <div class="section-title">Phí Khác</div>
                    <div class="row"><span>Giữ xe:</span><span>${Utils.formatCurrency(bill.parking || 0)}</span></div>
                    <div class="row"><span>Vệ sinh:</span><span>${Utils.formatCurrency(bill.cleaning || 0)}</span></div>
                    <div class="row"><span>Khác:</span><span>${Utils.formatCurrency(bill.other || 0)}</span></div>
                </div>
                <div class="row total"><span>TỔNG CỘNG:</span><span>${Utils.formatCurrency(bill.total || 0)}</span></div>
                <script>window.onload = function() { window.print(); }</script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }
};
