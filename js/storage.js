const Storage = {
    KEYS: {
        ROOMS: 'rental_rooms',
        TENANTS: 'rental_tenants',
        BILLS: 'rental_bills',
        SETTINGS: 'rental_settings'
    },

    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Storage get error:', e);
            return null;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Storage set error:', e);
        }
    },

    getRooms() {
        return this.get(this.KEYS.ROOMS) || [];
    },

    saveRooms(rooms) {
        this.set(this.KEYS.ROOMS, rooms);
    },

    getTenants() {
        return this.get(this.KEYS.TENANTS) || [];
    },

    saveTenants(tenants) {
        this.set(this.KEYS.TENANTS, tenants);
    },

    getBills() {
        return this.get(this.KEYS.BILLS) || {};
    },

    saveBills(bills) {
        this.set(this.KEYS.BILLS, bills);
    },

    getSettings() {
        return this.get(this.KEYS.SETTINGS) || {
            electricPrice: 4000,
            waterPrice: 100000,
            wifiPrice: 100000,
            garbagePrice: 15000
        };
    },

    saveSettings(settings) {
        this.set(this.KEYS.SETTINGS, settings);
    },

    exportData() {
        const data = {
            rooms: this.getRooms(),
            tenants: this.getTenants(),
            bills: this.getBills(),
            settings: this.getSettings(),
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rental-backup-${Utils.today()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    importData() {
        const fileInput = document.getElementById('importFile');
        const file = fileInput.files[0];
        if (!file) {
            alert('Vui lòng chọn file JSON');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.rooms) this.saveRooms(data.rooms);
                if (data.tenants) this.saveTenants(data.tenants);
                if (data.bills) this.saveBills(data.bills);
                if (data.settings) this.saveSettings(data.settings);
                alert('Import dữ liệu thành công!');
                location.reload();
            } catch (err) {
                alert('File không hợp lệ!');
            }
        };
        reader.readAsText(file);
    }
};
