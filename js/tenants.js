const Tenants = {
    render() {
        const tenants = Storage.getTenants();
        const rooms = Storage.getRooms();
        const container = document.getElementById('tenantsList');

        if (tenants.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><i class="bi bi-people"></i></div>
                    <p>Chưa có khách thuê nào</p>
                </div>`;
            return;
        }

        const grouped = {};
        rooms.forEach(room => {
            const roomTenants = tenants.filter(t => t.roomId === room.id);
            if (roomTenants.length > 0) {
                grouped[room.id] = { room, tenants: roomTenants };
            }
        });

        const unassigned = tenants.filter(t => !t.roomId);
        let html = '';

        Object.values(grouped).forEach(({ room, tenants: list }) => {
            html += `
                <div class="tenant-group">
                    <div class="tenant-group-header">
                        <div class="tenant-group-title">
                            <div class="room-mini-icon">${room.name.substring(0, 3)}</div>
                            ${room.name}
                            <span class="badge badge-occupied" style="margin-left:4px">${list.length}</span>
                        </div>
                        <button class="btn btn-sm btn-outline-primary" onclick="Tenants.showAddToRoom('${room.id}')">
                            <i class="bi bi-plus-lg"></i>
                        </button>
                    </div>
                    ${list.map(t => `
                        <div class="tenant-row">
                            <div class="tenant-row-name">${t.name}</div>
                            <div class="tenant-row-phone">${t.phone}</div>
                            <div class="tenant-row-cccd">${t.cccd || '-'}</div>
                            <div class="tenant-row-date">${t.moveInDate || '-'}</div>
                            <div class="tenant-row-actions">
                                <button class="btn btn-sm btn-outline-secondary" onclick="Tenants.showEdit('${t.id}')">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="Tenants.delete('${t.id}')">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>`;
        });

        if (unassigned.length > 0) {
            html += `
                <div class="tenant-group">
                    <div class="tenant-group-header">
                        <div class="tenant-group-title" style="color:var(--text-muted)">
                            <i class="bi bi-person-x" style="font-size:1rem"></i>
                            Chưa gán phòng
                            <span class="badge badge-available" style="margin-left:4px">${unassigned.length}</span>
                        </div>
                    </div>
                    ${unassigned.map(t => `
                        <div class="tenant-row">
                            <div class="tenant-row-name">${t.name}</div>
                            <div class="tenant-row-phone">${t.phone}</div>
                            <div class="tenant-row-cccd">${t.cccd || '-'}</div>
                            <div class="tenant-row-date">${t.moveInDate || '-'}</div>
                            <div class="tenant-row-actions">
                                <button class="btn btn-sm btn-outline-secondary" onclick="Tenants.showEdit('${t.id}')">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="Tenants.delete('${t.id}')">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>`;
        }

        container.innerHTML = html;
    },

    getRoomOptions(selectedId) {
        const rooms = Storage.getRooms();
        const tenants = Storage.getTenants();
        let options = '<option value="">-- Chọn phòng --</option>';
        rooms.forEach(room => {
            const count = tenants.filter(t => t.roomId === room.id).length;
            const suffix = count > 0 ? ` (${count})` : '';
            const selected = room.id === selectedId ? 'selected' : '';
            options += `<option value="${room.id}" ${selected}>${room.name}${suffix}</option>`;
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

    showAddToRoom(roomId) {
        const room = Storage.getRooms().find(r => r.id === roomId);
        document.getElementById('modalTitle').textContent = `Thêm Khách Vào ${room ? room.name : ''}`;
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
                <select class="form-select" id="tenantRoom">${this.getRoomOptions(roomId)}</select>
            </div>
            <div class="mb-3">
                <label class="form-label">Ngày Vào</label>
                <input type="date" class="form-control" id="tenantMoveIn" value="${Utils.today()}">
            </div>`;
        document.getElementById('modalSave').onclick = () => this.save();
        new bootstrap.Modal(document.getElementById('mainModal')).show();
    },

    showEdit(id) {
        const tenant = Storage.getTenants().find(t => t.id === id);
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

        if (!name || !phone) { alert('Vui lòng nhập họ tên và số điện thoại'); return; }

        const tenants = Storage.getTenants();
        tenants.push({ id: Utils.generateId(), name, phone, cccd, roomId, moveInDate, createdAt: Utils.today() });
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

        if (!name || !phone) { alert('Vui lòng nhập họ tên và số điện thoại'); return; }

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
        return Storage.getTenants().find(t => t.roomId === roomId);
    },

    getTenantsByRoom(roomId) {
        return Storage.getTenants().filter(t => t.roomId === roomId);
    },

    getTenantCount(roomId) {
        return Storage.getTenants().filter(t => t.roomId === roomId).length;
    }
};
