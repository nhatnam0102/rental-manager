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
                        <div class="row g-3 mb-4">
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
                                    oninput="Bills.updateField('${room.id}', 'electricEnd', this.value)">
                            </div>
                        </div>
                        ${bill.electricKwh ? `<div class="text-muted mb-3" style="font-size:0.85rem">${bill.electricKwh} kWh × ${Utils.formatNumber(settings.electricPrice)} = ${Utils.formatCurrency(bill.electricTotal || 0)}</div>` : ''}

                        <div class="section-title">Nước, WiFi, Rác</div>
                        <div class="row g-3 mb-4">
                            <div class="col-md-4">
                                <label class="form-label">Nước (m³)</label>
                                <input type="number" class="form-control" value="${bill.waterM3 || ''}"
                                    oninput="Bills.updateField('${room.id}', 'waterM3', this.value)" placeholder="0">
                                ${bill.waterTotal ? `<small class="text-muted">= ${Utils.formatCurrency(bill.waterTotal)}</small>` : ''}
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">WiFi (đ)</label>
                                <input type="number" class="form-control" value="${bill.wifi || settings.wifiPrice}"
                                    oninput="Bills.updateField('${room.id}', 'wifi', this.value)">
                            </div>
                            <div class="col-md-4">
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
                            <h5 class="mb-0" style="color: var(--primary)">Tổng: <strong>${Utils.formatCurrency(total)}</strong></h5>
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

        this.calculateTotal(bills[key][roomId]);
        Storage.saveBills(bills);

        const bill = bills[key][roomId];
        const totalEl = document.querySelector(`#bill-body-${roomId}`)?.closest('.bill-card')?.querySelector('.bill-amount');
        if (totalEl && bill.total) {
            totalEl.textContent = Utils.formatCurrency(bill.total);
        }

        const settings = Storage.getSettings();
        const electricInfo = document.querySelector(`#bill-body-${roomId}`)?.querySelector('.text-muted');
        if (bill.electricKwh && electricInfo) {
            electricInfo.textContent = `${bill.electricKwh} kWh × ${Utils.formatNumber(settings.electricPrice)} = ${Utils.formatCurrency(bill.electricTotal || 0)}`;
        }

        const totalDisplay = document.querySelector(`#bill-body-${roomId}`)?.querySelector('h5 strong');
        if (totalDisplay) {
            totalDisplay.textContent = Utils.formatCurrency(bill.total);
        }
    },

    calculateTotal(bill) {
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

        bill.waterTotal = Utils.calculateWaterBill(parseFloat(bill.waterM3) || 0, settings.waterPrice);
        total += bill.waterTotal;

        total += parseFloat(bill.wifi) || settings.wifiPrice;
        total += parseFloat(bill.garbage) || settings.garbagePrice;
        total += parseFloat(bill.parking) || 0;
        total += parseFloat(bill.cleaning) || 0;
        total += parseFloat(bill.other) || 0;

        bill.total = total;
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
        const electricPrice = Storage.getSettings().electricPrice;

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
                    <div class="row"><span>Điện (${bill.electricKwh || 0} kWh × ${Utils.formatNumber(electricPrice)}):</span><span>${Utils.formatCurrency(bill.electricTotal || 0)}</span></div>
                </div>
                <div class="section">
                    <div class="section-title">Dịch Vụ</div>
                    <div class="row"><span>Nước (${bill.waterM3 || 0} m³):</span><span>${Utils.formatCurrency(bill.waterTotal || 0)}</span></div>
                    <div class="row"><span>WiFi:</span><span>${Utils.formatCurrency(bill.wifi || 0)}</span></div>
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
