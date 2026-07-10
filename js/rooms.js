const Rooms = {
    render() {
        const rooms = Storage.getRooms();
        const tenants = Storage.getTenants();
        const container = document.getElementById('roomsList');

        if (rooms.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><i class="bi bi-door-open"></i></div>
                    <p>Chưa có phòng nào</p>
                </div>`;
            return;
        }

        container.innerHTML = rooms.map(room => {
            const roomTenants = tenants.filter(t => t.roomId === room.id);
            const count = roomTenants.length;

            const peopleHTML = count > 0
                ? `<div class="room-card-people">
                    ${roomTenants.map(t => `
                        <span class="room-person-tag">
                            <i class="bi bi-person-fill"></i>${t.name}
                        </span>`).join('')}
                   </div>`
                : '<div class="room-empty">Chưa có khách thuê</div>';

            return `
                <div class="room-card">
                    <div class="room-card-top">
                        <div class="room-card-left">
                            <div class="room-card-icon">${room.name.substring(0, 3)}</div>
                            <div>
                                <div class="room-card-name">${room.name}</div>
                                ${room.note ? `<div class="room-card-note">${room.note}</div>` : ''}
                            </div>
                        </div>
                        <span class="badge ${count > 0 ? 'badge-occupied' : 'badge-available'}">
                            ${count > 0 ? `${count} người` : 'Trống'}
                        </span>
                    </div>
                    ${peopleHTML}
                    <div class="room-card-bottom">
                        <button class="btn btn-sm btn-outline-primary" onclick="Tenants.showAddToRoom('${room.id}')">
                            <i class="bi bi-plus-lg"></i> Thêm khách
                        </button>
                        <div class="room-card-actions">
                            <button class="btn btn-sm btn-outline-secondary" onclick="Rooms.showEdit('${room.id}')">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="Rooms.delete('${room.id}')">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>`;
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
        if (!name) { alert('Vui lòng nhập tên phòng'); return; }

        const rooms = Storage.getRooms();
        rooms.push({ id: Utils.generateId(), name, note, createdAt: Utils.today() });
        Storage.saveRooms(rooms);
        bootstrap.Modal.getInstance(document.getElementById('mainModal')).hide();
        this.render();
    },

    update(id) {
        const name = document.getElementById('roomName').value.trim();
        const note = document.getElementById('roomNote').value.trim();
        if (!name) { alert('Vui lòng nhập tên phòng'); return; }

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
