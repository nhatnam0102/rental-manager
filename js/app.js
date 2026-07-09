const App = {
    currentPage: 'dashboard',

    init() {
        this.initMonthSelector();
        this.bindEvents();
        this.navigateTo('dashboard');
    },

    initMonthSelector() {
        const monthSelect = document.getElementById('selectMonth');
        const yearSelect = document.getElementById('selectYear');
        const now = new Date();

        for (let i = 1; i <= 12; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = Utils.getMonthName(i);
            if (i === now.getMonth() + 1) option.selected = true;
            monthSelect.appendChild(option);
        }

        const currentYear = now.getFullYear();
        for (let y = currentYear - 5; y <= currentYear + 1; y++) {
            const option = document.createElement('option');
            option.value = y;
            option.textContent = y;
            if (y === currentYear) option.selected = true;
            yearSelect.appendChild(option);
        }
    },

    bindEvents() {
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo(link.dataset.page);
            });
        });

        document.getElementById('selectMonth').addEventListener('change', () => this.refreshCurrentPage());
        document.getElementById('selectYear').addEventListener('change', () => this.refreshCurrentPage());

        document.getElementById('toggleSidebar').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('show');
            document.querySelector('.sidebar-overlay')?.classList.toggle('show');
        });

        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.addEventListener('click', () => {
            document.getElementById('sidebar').classList.remove('show');
            overlay.classList.remove('show');
        });
        document.body.appendChild(overlay);
    },

    navigateTo(page) {
        this.currentPage = page;

        document.querySelectorAll('.page').forEach(p => p.classList.add('d-none'));
        document.getElementById(`page-${page}`).classList.remove('d-none');

        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        document.getElementById('sidebar').classList.remove('show');
        document.querySelector('.sidebar-overlay')?.classList.remove('show');

        this.refreshCurrentPage();
    },

    refreshCurrentPage() {
        switch (this.currentPage) {
            case 'dashboard':
                Dashboard.render();
                break;
            case 'rooms':
                Rooms.render();
                break;
            case 'tenants':
                Tenants.render();
                break;
            case 'bills':
                Bills.render();
                break;
            case 'settings':
                Settings.render();
                break;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
