const Settings = {
    render() {
        const settings = Storage.getSettings();
        document.getElementById('priceElectric').value = settings.electricPrice;
        document.getElementById('priceWater').value = settings.waterPrice;
        document.getElementById('priceWifi').value = settings.wifiPricePerPerson;
        document.getElementById('priceGarbage').value = settings.garbagePrice;
    },

    save() {
        // Cho phép giá 0 (vd. miễn WiFi); chỉ ô trống hoặc sai mới về mặc định.
        const read = (id, def) => {
            const v = parseFloat(document.getElementById(id).value);
            return Number.isFinite(v) && v >= 0 ? v : def;
        };
        const settings = {
            electricPrice: read('priceElectric', 4000),
            waterPrice: read('priceWater', 100000),
            wifiPricePerPerson: read('priceWifi', 20000),
            garbagePrice: read('priceGarbage', 15000)
        };

        Storage.saveSettings(settings);
        Bills.syncAll();
        alert('Đã lưu cài đặt!');
    }
};
