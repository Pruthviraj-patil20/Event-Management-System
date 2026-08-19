/**
 * EventSphere — Admin Users Management
 */

const AdminUsers = {
  state: {
    page: 1,
    limit: 15,
    search: '',
    role: 'all',
    status: 'all',
    total: 0,
    totalPages: 1,
    users: []
  },

  init() {
    if (!AdminLayout.init({ page: 'users', title: 'Users', crumb: ['Users'] })) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get('search')) {
      this.state.search = params.get('search');
      const input = document.querySelector('[data-search]');
      if (input) input.value = this.state.search;
    }

    this.bindEvents();
    this.load();

    if (params.get('view')) {
      this.load().then(() => this.openUserModal(params.get('view')));
    }
  },

  bindEvents() {
    const search = document.querySelector('[data-search]');
    search && search.addEventListener('input', Utils.debounce((e) => {
      this.state.search = e.target.value.trim();
      this.state.page = 1;
      this.load();
    }, 300));

    document.querySelector('[data-filter-role]').addEventListener('change', (e) => {
      this.state.role = e.target.value;
      this.state.page = 1;
      this.load();
    });

    document.querySelector('[data-filter-status]').addEventListener('change', (e) => {
      this.state.status = e.target.value;
      this.state.page = 1;
      this.load();
    });

    document.querySelector('[data-export-csv]').addEventListener('click', () => this.exportCsv());
  },

  async load() {
    const tbody = document.getElementById('usersTable');
    tbody.innerHTML = AdminLayout.skeletonRows(7, 5);

    try {
      const data = await API.get('/admin/users', {
        page: this.state.page,
        limit: this.state.limit,
        search: this.state.search,
        role: this.state.role,
        status: this.state.status
      });
      this.state.total = data.total;
      this.state.totalPages = data.totalPages;
      this.state.users = data.users || [];
      this.render();
    } catch (err) {
      AdminLayout.handleApiError(err);
      tbody.innerHTML = `<tr><td colspan="7">${AdminLayout.errorState({ code: '500', title: 'Failed to load users', desc: err.message, action: '<button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="AdminUsers.load()">Retry</button>' })}</td></tr>`;
    }
  },

  render() {
    const tbody = document.getElementById('usersTable');
    const counts = document.querySelectorAll('[data-count]');

    if (!this.state.users.length) {
      tbody.innerHTML = `<tr><td colspan="7">${AdminLayout.emptyState({ icon: '👥', title: 'No users found', desc: 'No users match your search.', action: '<button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="AdminUsers.resetFilters()">Clear Filters</button>' })}</td></tr>`;
      counts.forEach((c) => (c.textContent = '0 users'));
      document.querySelector('[data-pagination]').innerHTML = '';
      return;
    }

    tbody.innerHTML = this.state.users.map((u) => `
      <tr class="${u.isActive ? '' : 'admin-row-suspended'}" data-user-id="${u.id}">
        <td>
          <div class="admin-user-cell">
            <img class="admin-avatar" src="${u.profileImage || ''}" alt="">
            <div class="meta">
              <strong>${Utils.escapeHtml(u.name)}</strong>
              <span>${Utils.escapeHtml(u.email)}</span>
            </div>
          </div>
        </td>
        <td>
          <select class="admin-select sm" data-role="${u.id}" aria-label="Change role" style="text-transform:capitalize;">
            ${['admin', 'organizer', 'attendee'].map((r) =>
              `<option value="${r}" ${u.role === r ? 'selected' : ''}>${r}</option>`).join('')}
          </select>
        </td>
        <td>${u.eventCount}</td>
        <td>${u.registrationCount}</td>
        <td>
          ${AdminLayout.roleBadge(u.isVerified ? 'active' : 'unverified')}
          ${u.isActive ? '' : AdminLayout.statusBadge('suspended')}
        </td>
        <td>${AdminLayout.timeAgo(u.createdAt)}</td>
        <td style="text-align:right;">
          <div class="admin-row-actions" style="justify-content:flex-end;">
            <button class="admin-action-btn indigo" data-view="${u.id}" title="View">${AdminLayout.ICONS.eye}</button>
            <button class="admin-action-btn ${u.isActive ? 'amber' : 'success'}" data-toggle="${u.id}" data-active="${u.isActive ? '1' : ''}" title="${u.isActive ? 'Suspend' : 'Activate'}">
              ${u.isActive ? '⏸' : '▶'}
            </button>
            <button class="admin-action-btn danger" data-delete="${u.id}" title="Delete">🗑</button>
          </div>
        </td>
      </tr>
    `).join('');

    counts.forEach((c) => (c.textContent = `${this.state.total} user${this.state.total === 1 ? '' : 's'} · Page ${this.state.page} of ${this.state.totalPages || 1}`));

    const pag = document.querySelector('[data-pagination]');
    pag.innerHTML = AdminLayout.paginationHtml(this.state.totalPages, this.state.page, (p) => {
      this.state.page = p;
      this.load();
    });
    AdminLayout.bindPagination(pag);

    tbody.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => this.openUserModal(b.dataset.view)));
    tbody.querySelectorAll('[data-toggle]').forEach((b) => b.addEventListener('click', () => this.toggleUser(b.dataset.toggle, b.dataset.active === '1')));
    tbody.querySelectorAll('[data-delete]').forEach((b) => b.addEventListener('click', () => this.deleteUser(b.dataset.delete)));
    tbody.querySelectorAll('[data-role]').forEach((sel) => sel.addEventListener('change', () => this.changeRole(sel.dataset.role, sel.value)));
  },

  resetFilters() {
    this.state = { ...this.state, page: 1, search: '', role: 'all', status: 'all' };
    document.querySelector('[data-search]').value = '';
    document.querySelector('[data-filter-role]').value = 'all';
    document.querySelector('[data-filter-status]').value = 'all';
    this.load();
  },

  openUserModal(id) {
    const user = this.state.users.find((u) => u.id === id);
    if (!user) return;

    AdminLayout.openModal({
      title: 'User Profile',
      subtitle: 'Detailed account overview',
      size: 'lg',
      body: `
        <div style="display:flex;align-items:center;gap:var(--space-4);margin-bottom:var(--space-5);">
          <img class="admin-avatar admin-avatar-lg" src="${user.profileImage || ''}" alt="">
          <div>
            <h3 style="font-family:var(--font-heading);font-weight:var(--font-weight-bold);">${Utils.escapeHtml(user.name)}</h3>
            <div class="admin-text-muted" style="font-size:var(--font-size-sm);">${Utils.escapeHtml(user.email)}</div>
            <div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap;">
              ${AdminLayout.roleBadge(user.role)}
              ${user.isActive ? AdminLayout.statusBadge('active') : AdminLayout.statusBadge('suspended')}
              ${user.isVerified ? AdminLayout.statusBadge('confirmed') : AdminLayout.statusBadge('unverified')}
            </div>
          </div>
        </div>
        <div class="admin-modal-section">
          <h4>Account Details</h4>
          <dl class="admin-detail-row"><dt>Phone</dt><dd>${Utils.escapeHtml(user.phone || '—')}</dd></dl>
          <dl class="admin-detail-row"><dt>Organization</dt><dd>${Utils.escapeHtml(user.organizationName || '—')}</dd></dl>
          <dl class="admin-detail-row"><dt>Events hosted</dt><dd>${user.eventCount}</dd></dl>
          <dl class="admin-detail-row"><dt>Registrations</dt><dd>${user.registrationCount}</dd></dl>
          <dl class="admin-detail-row"><dt>Joined</dt><dd>${Utils.formatDate(user.createdAt)}</dd></dl>
          <dl class="admin-detail-row"><dt>Bio</dt><dd style="text-align:left;max-width:340px;">${Utils.escapeHtml(user.bio || '—')}</dd></dl>
        </div>
      `,
      footer: `
        <button class="admin-btn admin-btn-secondary admin-btn-sm" data-admin-close>Close</button>
        <button class="admin-btn ${user.isActive ? 'admin-btn-secondary' : 'admin-btn-primary'} admin-btn-sm" data-user-toggle>${user.isActive ? 'Suspend' : 'Activate'}</button>
        <button class="admin-btn admin-btn-danger admin-btn-sm" data-user-delete>Delete User</button>
      `,
      onOpen: (modal) => {
      modal.querySelector('[data-admin-close]').addEventListener('click', () => AdminLayout.closeModal());
      modal.querySelector('[data-user-toggle]').addEventListener('click', () => {
        this.toggleUser(user.id, user.isActive);
        AdminLayout.closeModal();
      });
      modal.querySelector('[data-user-delete]').addEventListener('click', () => {
        AdminLayout.closeModal();
        this.deleteUser(user.id);
      });
    }
    });
  },

  async toggleUser(id, currentlyActive) {
    AdminLayout.confirm({
      title: currentlyActive ? 'Suspend user?' : 'Activate user?',
      message: `You are about to ${currentlyActive ? 'suspend' : 'activate'} this account.`,
      confirmText: currentlyActive ? 'Suspend' : 'Activate',
      danger: currentlyActive,
      onConfirm: async () => {
        try {
          const data = await API.put(`/admin/users/${id}/status`, { isActive: !currentlyActive });
          AdminLayout.toast(data.message, 'success');
          this.load();
        } catch (err) {
          AdminLayout.handleApiError(err);
        }
      }
    });
  },

  async changeRole(id, role) {
    try {
      const data = await API.put(`/admin/users/${id}/role`, { role });
      AdminLayout.toast(data.message, 'success');
      this.load();
    } catch (err) {
      AdminLayout.handleApiError(err);
    }
  },

  async deleteUser(id) {
    const user = this.state.users.find((u) => u.id === id);
    AdminLayout.confirm({
      title: 'Delete User?',
      message: `This will permanently remove <strong>${Utils.escapeHtml(user?.name || 'this user')}</strong>. This action cannot be undone.`,
      confirmText: 'Delete User',
      danger: true,
      onConfirm: async () => {
        try {
          const data = await API.delete(`/admin/users/${id}`);
          AdminLayout.toast(data.message, 'success');
          this.load();
        } catch (err) {
          AdminLayout.handleApiError(err);
        }
      }
    });
  },

  exportCsv() {
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Organization', 'Events', 'Registrations', 'Verified', 'Active', 'Joined'];
    const rows = this.state.users.map((u) => [
      u.name, u.email, u.phone, u.role, u.organizationName,
      u.eventCount, u.registrationCount, u.isVerified ? 'Yes' : 'No',
      u.isActive ? 'Yes' : 'No', new Date(u.createdAt).toISOString()
    ]);
    AdminLayout.exportCSV('users.csv', headers, rows);
    AdminLayout.toast('CSV exported', 'success');
  }
};

document.addEventListener('DOMContentLoaded', () => AdminUsers.init());
window.AdminUsers = AdminUsers;
