const Dashboard = {
    chart: null,

    render() {
        const month = parseInt(document.getElementById('selectMonth').value);
        const year = parseInt(document.getElementById('selectYear').value);
        const key = Utils.getKey(month, year);
        const bills = Storage.getBills();
        const monthBills = bills[key] || {};
        const rooms = Storage.getRooms();
        const tenants = Storage.getTenants();

        let totalRevenue = 0;
        let paidCount = 0;
        let unpaidCount = 0;

        rooms.forEach(room => {
            const bill = monthBills[room.id];
            if (bill && bill.total) {
                totalRevenue += bill.total;
                if (bill.paid) {
                    paidCount++;
                } else {
                    unpaidCount++;
                }
            }
        });

        document.getElementById('stat-revenue').textContent = Utils.formatCurrency(totalRevenue);
        document.getElementById('stat-paid').textContent = `${paidCount} phòng`;
        document.getElementById('stat-unpaid').textContent = `${unpaidCount} phòng`;
        document.getElementById('stat-total').textContent = `${rooms.length} phòng`;

        this.renderUnpaidList(monthBills, rooms);
        this.renderChart(bills, year, month);
    },

    renderUnpaidList(monthBills, rooms) {
        const unpaidRooms = rooms.filter(room => {
            const bill = monthBills[room.id];
            return bill && bill.total && !bill.paid;
        });

        const container = document.getElementById('unpaidList');

        if (unpaidRooms.length === 0) {
            container.innerHTML = `
                <div class="empty-state py-3">
                    <div class="empty-icon" style="background:#d1fae5;color:#065f46;width:48px;height:48px;font-size:1.2rem"><i class="bi bi-check-circle"></i></div>
                    <p class="mb-0 mt-2">Tất cả đã đóng tiền</p>
                </div>`;
            return;
        }

        container.innerHTML = unpaidRooms.map(room => {
            const bill = monthBills[room.id];
            return `
                <div class="unpaid-item">
                    <div class="d-flex align-items-center gap-3">
                        <div class="room-badge">${room.name.substring(0, 3)}</div>
                        <div>
                            <strong style="font-size:0.9rem">${room.name}</strong>
                            <div style="font-size:0.8rem;color:var(--text-muted)">${Utils.formatCurrency(bill.total)}</div>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-outline-success" onclick="Bills.togglePaid('${room.id}'); Dashboard.render();">
                        <i class="bi bi-check-lg"></i>
                    </button>
                </div>`;
        }).join('');
    },

    renderChart(bills, currentYear, currentMonth) {
        const labels = [];
        const data = [];

        for (let i = 5; i >= 0; i--) {
            let m = currentMonth - i;
            let y = currentYear;
            while (m <= 0) { m += 12; y--; }

            labels.push(`${Utils.getMonthName(m)} ${y}`);

            const key = Utils.getKey(m, y);
            const monthBills = bills[key] || {};
            let total = 0;
            Object.values(monthBills).forEach(bill => {
                total += bill.total || 0;
            });
            data.push(total);
        }

        const ctx = document.getElementById('revenueChart').getContext('2d');

        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Doanh thu (đ)',
                    data,
                    backgroundColor: 'rgba(99, 102, 241, 0.7)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 1,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => Utils.formatCurrency(ctx.raw)
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => Utils.formatCurrency(value)
                        }
                    }
                }
            }
        });
    }
};
