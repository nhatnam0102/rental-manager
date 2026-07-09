const Settings = {
    render() {
        const settings = Storage.getSettings();
        document.getElementById('priceElectric').value = settings.electricPrice;
        document.getElementById('priceWater').value = settings.waterPrice;
        document.getElementById('priceWifi').value = settings.wifiPrice;
        document.getElementById('priceGarbage').value = settings.garbagePrice;
    },

    save() {
        const settings = {
            electricPrice: parseFloat(document.getElementById('priceElectric').value) || 4000,
            waterPrice: parseFloat(document.getElementById('priceWater').value) || 100000,
            wifiPrice: parseFloat(document.getElementById('priceWifi').value) || 100000,
            garbagePrice: parseFloat(document.getElementById('priceGarbage').value) || 15000
        };

        Storage.saveSettings(settings);
        alert('Đã lưu cài đặt!');
    }
};
