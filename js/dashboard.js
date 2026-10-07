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
        let totalElectric = 0;
        let paidCount = 0;
        let unpaidCount = 0;

        rooms.forEach(room => {
            const bill = monthBills[room.id];
            if (bill && bill.total) {
                totalRevenue += bill.total;
                totalElectric += bill.electricTotal || 0;
                if (bill.paid) {
                    paidCount++;
                } else {
                    unpaidCount++;
                }
            }
        });

        document.getElementById('stat-revenue').textContent = Utils.formatCurrency(totalRevenue);
        document.getElementById('stat-electric').textContent = Utils.formatCurrency(totalElectric);
        document.getElementById('stat-paid').textContent = `${paidCount} phòng`;
        document.getElementById('stat-unpaid').textContent = `${unpaidCount} phòng`;
        document.getElementById('stat-total').textContent = `${rooms.length} phòng`;

        const unpaidBadge = document.getElementById('unpaidCount');
        if (unpaidBadge) {
            unpaidBadge.textContent = unpaidCount;
            unpaidBadge.style.display = unpaidCount > 0 ? '' : 'none';
        }

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
                <div class="dash-unpaid-empty">
                    <div class="dash-unpaid-empty-icon">
                        <i class="bi bi-check2-all"></i>
                    </div>
                    <p>Tất cả đã đóng tiền</p>
                </div>`;
            return;
        }

        container.innerHTML = unpaidRooms.map(room => {
            const bill = monthBills[room.id];
            const tenantCount = Tenants.getTenantCount(room.id);
            return `
                <div class="dash-unpaid-item">
                    <div class="dash-unpaid-left">
                        <div class="dash-unpaid-icon">${room.name.substring(0, 2)}</div>
                        <div class="dash-unpaid-info">
                            <span class="dash-unpaid-name">${room.name}</span>
                            <span class="dash-unpaid-detail">${Utils.formatCurrency(bill.total)}${tenantCount > 0 ? ` · ${tenantCount} người` : ''}</span>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-outline-success" onclick="Bills.togglePaid('${room.id}'); Dashboard.render();" title="Đánh dấu đã đóng">
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

            labels.push(`Th${m}`);

            const key = Utils.getKey(m, y);
            const monthBills = bills[key] || {};
            let total = 0;
            Object.values(monthBills).forEach(bill => {
                total += bill.total || 0;
            });
            data.push(total);
        }

        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;

        if (this.chart) {
            this.chart.destroy();
        }

        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 260);
        gradient.addColorStop(0, 'rgba(79, 110, 247, 0.25)');
        gradient.addColorStop(1, 'rgba(79, 110, 247, 0.01)');

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Doanh thu',
                    data,
                    borderColor: '#4f6ef7',
                    borderWidth: 2.5,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#4f6ef7',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointHoverBorderWidth: 3,
                    pointHoverBackgroundColor: '#4f6ef7',
                    pointHoverBorderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1a1f36',
                        titleFont: { size: 12, weight: '500' },
                        bodyFont: { size: 13, weight: '600' },
                        padding: 10,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: (ctx) => Utils.formatCurrency(ctx.raw)
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        border: { display: false },
                        ticks: {
                            font: { size: 11, weight: '500' },
                            color: '#9098ad'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.04)',
                            drawBorder: false
                        },
                        border: { display: false },
                        ticks: {
                            font: { size: 11 },
                            color: '#9098ad',
                            callback: (value) => {
                                if (value >= 1000000) return (value / 1000000).toFixed(0) + 'tr';
                                if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
                                return value;
                            }
                        }
                    }
                }
            }
        });
    }
};
