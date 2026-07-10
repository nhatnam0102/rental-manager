const Tenants = {
    render() {
        const tenants = Storage.getTenants();
        const rooms = Storage.getRooms();
        const tbody = document.getElementById('tenantsList');

        if (tenants.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="6">
                    <div class="empty-state">
                        <div class="empty-icon"><i class="bi bi-people"></i></div>
                        <p>Chưa có khách thuê nào</p>
                    </div>
                </td></tr>`;
            return;
        }

        tbody.innerHTML = tenants.map(tenant => {
            const room = rooms.find(r => r.id === tenant.roomId);
            return `
                <tr>
                    <td><strong>${tenant.name}</strong></td>
                    <td>${tenant.phone}</td>
                    <td>${tenant.cccd || '-'}</td>
                    <td>${room ? room.name : '<span class="text-muted">Chưa gán</span>'}</td>
                    <td>${tenant.moveInDate || '-'}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="Tenants.showEdit('${tenant.id}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="Tenants.delete('${tenant.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>`;
        }).join('');
    },

    getRoomOptions(selectedId) {
        const rooms = Storage.getRooms();
        const tenants = Storage.getTenants();

        let options = '<option value="">-- Chọn phòng --</option>';
        rooms.forEach(room => {
            const count = tenants.filter(t => t.roomId === room.id).length;
            const isSelected = room.id === selectedId ? 'selected' : '';
            const suffix = count > 0 ? ` (${count} người)` : '';
            options += `<option value="${room.id}" ${isSelected}>${room.name}${suffix}</option>`;
        });
        return options;
    },

    showAdd() {
        document.getElementById('modalTitle').textContent = 'Thêm Khách Thuê';
        document.getElementById('modalBody').innerHTML = `
            <div class="mb-3">
                <label class="form-label">Họ Tên</label>
                <input type="text" class="form-control" id="tenantName">
            </div>
            <div class="mb-3">
                <label class="form-label">Số Điện Thoại</label>
                <input type="tel" class="form-control" id="tenantPhone">
            </div>
            <div class="mb-3">
                <label class="form-label">CCCD</label>
                <input type="text" class="form-control" id="tenantCCCD">
            </div>
            <div class="mb-3">
                <label class="form-label">Phòng</label>
                <select class="form-select" id="tenantRoom">${this.getRoomOptions()}</select>
            </div>
            <div class="mb-3">
                <label class="form-label">Ngày Vào</label>
                <input type="date" class="form-control" id="tenantMoveIn" value="${Utils.today()}">
            </div>`;

        document.getElementById('modalSave').onclick = () => this.save();
        new bootstrap.Modal(document.getElementById('mainModal')).show();
    },

    showEdit(id) {
        const tenants = Storage.getTenants();
        const tenant = tenants.find(t => t.id === id);
        if (!tenant) return;

        document.getElementById('modalTitle').textContent = 'Sửa Khách Thuê';
        document.getElementById('modalBody').innerHTML = `
            <div class="mb-3">
                <label class="form-label">Họ Tên</label>
                <input type="text" class="form-control" id="tenantName" value="${tenant.name}">
            </div>
            <div class="mb-3">
                <label class="form-label">Số Điện Thoại</label>
                <input type="tel" class="form-control" id="tenantPhone" value="${tenant.phone}">
            </div>
            <div class="mb-3">
                <label class="form-label">CCCD</label>
                <input type="text" class="form-control" id="tenantCCCD" value="${tenant.cccd || ''}">
            </div>
            <div class="mb-3">
                <label class="form-label">Phòng</label>
                <select class="form-select" id="tenantRoom">${this.getRoomOptions(tenant.roomId)}</select>
            </div>
            <div class="mb-3">
                <label class="form-label">Ngày Vào</label>
                <input type="date" class="form-control" id="tenantMoveIn" value="${tenant.moveInDate || ''}">
            </div>`;

        document.getElementById('modalSave').onclick = () => this.update(id);
        new bootstrap.Modal(document.getElementById('mainModal')).show();
    },

    save() {
        const name = document.getElementById('tenantName').value.trim();
        const phone = document.getElementById('tenantPhone').value.trim();
        const cccd = document.getElementById('tenantCCCD').value.trim();
        const roomId = document.getElementById('tenantRoom').value;
        const moveInDate = document.getElementById('tenantMoveIn').value;

        if (!name || !phone) {
            alert('Vui lòng nhập họ tên và số điện thoại');
            return;
        }

        const tenants = Storage.getTenants();
        tenants.push({
            id: Utils.generateId(),
            name,
            phone,
            cccd,
            roomId,
            moveInDate,
            createdAt: Utils.today()
        });

        Storage.saveTenants(tenants);
        bootstrap.Modal.getInstance(document.getElementById('mainModal')).hide();
        this.render();
        Rooms.render();
    },

    update(id) {
        const name = document.getElementById('tenantName').value.trim();
        const phone = document.getElementById('tenantPhone').value.trim();
        const cccd = document.getElementById('tenantCCCD').value.trim();
        const roomId = document.getElementById('tenantRoom').value;
        const moveInDate = document.getElementById('tenantMoveIn').value;

        if (!name || !phone) {
            alert('Vui lòng nhập họ tên và số điện thoại');
            return;
        }

        const tenants = Storage.getTenants();
        const index = tenants.findIndex(t => t.id === id);
        if (index === -1) return;

        tenants[index] = { ...tenants[index], name, phone, cccd, roomId, moveInDate };

        Storage.saveTenants(tenants);
        bootstrap.Modal.getInstance(document.getElementById('mainModal')).hide();
        this.render();
        Rooms.render();
    },

    delete(id) {
        if (!confirm('Bạn muốn xóa khách thuê này?')) return;

        let tenants = Storage.getTenants();
        tenants = tenants.filter(t => t.id !== id);
        Storage.saveTenants(tenants);
        this.render();
        Rooms.render();
    },

    getTenantByRoom(roomId) {
        const tenants = Storage.getTenants();
        return tenants.find(t => t.roomId === roomId);
    },

    getTenantsByRoom(roomId) {
        const tenants = Storage.getTenants();
        return tenants.filter(t => t.roomId === roomId);
    },

    getTenantCount(roomId) {
        const tenants = Storage.getTenants();
        return tenants.filter(t => t.roomId === roomId).length;
    }
};
