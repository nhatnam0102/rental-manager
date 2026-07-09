const Utils = {
    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
    },

    formatNumber(num) {
        return new Intl.NumberFormat('vi-VN').format(num);
    },

    getMonthName(month) {
        const months = [
            'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
            'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
            'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
        ];
        return months[month - 1];
    },

    getKey(month, year) {
        return `${year}-${String(month).padStart(2, '0')}`;
    },

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    calculateElectricBill(kwh, pricePerKwh) {
        return kwh * pricePerKwh;
    },

    calculateWaterBill(m3, pricePerM3) {
        return m3 * pricePerM3;
    },

    today() {
        return new Date().toISOString().split('T')[0];
    }
};
