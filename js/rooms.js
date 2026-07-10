const Rooms = {
    render() {
        const rooms = Storage.getRooms();
        const tenants = Storage.getTenants();
        const tbody = document.getElementById('roomsList');

        if (rooms.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="5">
                    <div class="empty-state">
                        <div class="empty-icon"><i class="bi bi-door-open"></i></div>
                        <p>Chưa có phòng nào</p>
                    </div>
                </td></tr>`;
            return;
        }

        tbody.innerHTML = rooms.map(room => {
            const roomTenants = tenants.filter(t => t.roomId === room.id);
            const count = roomTenants.length;
            const tenantNames = roomTenants.map(t => t.name).join(', ');
            const phones = roomTenants.map(t => t.phone).join(', ');
            return `
                <tr>
                    <td><strong>${room.name}</strong></td>
                    <td>${count > 0 ? `${tenantNames} <span class="text-muted" style="font-size:0.8rem">(${count} người)</span>` : '<span class="text-muted">Trống</span>'}</td>
                    <td>${count > 0 ? phones : '-'}</td>
                    <td>
                        <span class="badge ${count > 0 ? 'badge-occupied' : 'badge-available'}">
                            ${count > 0 ? `${count} người` : 'Trống'}
                        </span>
                    </td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="Rooms.showEdit('${room.id}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="Rooms.delete('${room.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>`;
        }).join('');
    },

    showAdd() {
        document.getElementById('modalTitle').textContent = 'Thêm Phòng Mới';
        document.getElementById('modalBody').innerHTML = `
            <div class="mb-3">
                <label class="form-label">Tên Phòng</label>
                <input type="text" class="form-control" id="roomName" placeholder="VD: P101, A1, B2...">
            </div>
            <div class="mb-3">
                <label class="form-label">Ghi Chú</label>
                <input type="text" class="form-control" id="roomNote" placeholder="Tầng 1, cửa sổ lớn...">
            </div>`;

        document.getElementById('modalSave').onclick = () => this.save();
        new bootstrap.Modal(document.getElementById('mainModal')).show();
    },

    showEdit(id) {
        const rooms = Storage.getRooms();
        const room = rooms.find(r => r.id === id);
        if (!room) return;

        document.getElementById('modalTitle').textContent = 'Sửa Phòng';
        document.getElementById('modalBody').innerHTML = `
            <div class="mb-3">
                <label class="form-label">Tên Phòng</label>
                <input type="text" class="form-control" id="roomName" value="${room.name}">
            </div>
            <div class="mb-3">
                <label class="form-label">Ghi Chú</label>
                <input type="text" class="form-control" id="roomNote" value="${room.note || ''}">
            </div>`;

        document.getElementById('modalSave').onclick = () => this.update(id);
        new bootstrap.Modal(document.getElementById('mainModal')).show();
    },

    save() {
        const name = document.getElementById('roomName').value.trim();
        const note = document.getElementById('roomNote').value.trim();

        if (!name) {
            alert('Vui lòng nhập tên phòng');
            return;
        }

        const rooms = Storage.getRooms();
        rooms.push({
            id: Utils.generateId(),
            name,
            note,
            createdAt: Utils.today()
        });

        Storage.saveRooms(rooms);
        bootstrap.Modal.getInstance(document.getElementById('mainModal')).hide();
        this.render();
    },

    update(id) {
        const name = document.getElementById('roomName').value.trim();
        const note = document.getElementById('roomNote').value.trim();

        if (!name) {
            alert('Vui lòng nhập tên phòng');
            return;
        }

        const rooms = Storage.getRooms();
        const index = rooms.findIndex(r => r.id === id);
        if (index === -1) return;

        rooms[index].name = name;
        rooms[index].note = note;

        Storage.saveRooms(rooms);
        bootstrap.Modal.getInstance(document.getElementById('mainModal')).hide();
        this.render();
    },

    delete(id) {
        if (!confirm('Bạn muốn xóa phòng này?')) return;

        let rooms = Storage.getRooms();
        rooms = rooms.filter(r => r.id !== id);
        Storage.saveRooms(rooms);

        let tenants = Storage.getTenants();
        tenants = tenants.filter(t => t.roomId !== id);
        Storage.saveTenants(tenants);

        this.render();
    },

    getRoomName(roomId) {
        const rooms = Storage.getRooms();
        const room = rooms.find(r => r.id === roomId);
        return room ? room.name : 'N/A';
    }
};
