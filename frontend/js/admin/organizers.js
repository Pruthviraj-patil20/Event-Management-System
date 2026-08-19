/**
 * EventSphere — Admin Organizers Management
 */

const AdminOrganizers = {
  state: {
    page: 1,
    limit: 15,
    search: '',
    total: 0,
    totalPages: 1,
    organizers: []
  },

  init() {
    if (!AdminLayout.init({ page: 'organizers', title: 'Organizers', crumb: ['Organizers'] })) return;
    this.bindEvents();
    this.load();
  },

  bindEvents() {
    const search = document.querySelector('[data-search]');
    search && search.addEventListener('input', Utils.debounce((e) => {
      this.state.search = e.target.value.trim();
      this.state.page = 1;
      this.load();
    }, 300));

    document.querySelector('[data-export-csv]').addEventListener('click', () => this.exportCsv());
  },

  async load() {
    const tbody = document.getElementById('organizersTable');
    tbody.innerHTML = AdminLayout.skeletonRows(7, 5);

    try {
      const data = await API.get('/admin/organizers', {
        page: this.state.page,
        limit: this.state.limit,
        search: this.state.search
      });
      this.state.total = data.total;
      this.state.totalPages = data.totalPages;
      this.state.organizers = data.organizers || [];
      this.render();
    } catch (err) {
      AdminLayout.handleApiError(err);
      tbody.innerHTML = `<tr><td colspan="7">${AdminLayout.errorState({ code: '500', title: 'Failed to load organizers', desc: err.message, action: '<button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="AdminOrganizers.load()">Retry</button>' })}</td></tr>`;
    }
  },

  render() {
    const tbody = document.getElementById('organizersTable');
    const counts = document.querySelectorAll('[data-count]');

    if (!this.state.organizers.length) {
      tbody.innerHTML = `<tr><td colspan="7">${AdminLayout.emptyState({ icon: '🏢', title: 'No organizers found', desc: 'No organizer accounts match your search.' })}</td></tr>`;
      counts.forEach((c) => (c.textContent = '0 organizers'));
      document.querySelector('[data-pagination]').innerHTML = '';
      return;
    }

    tbody.innerHTML = this.state.organizers.map((o) => `
      <tr class="${o.isActive ? '' : 'admin-row-suspended'}">
        <td>
          <div class="admin-user-cell">
            <img class="admin-avatar" src="${o.profileImage || ''}" alt="">
            <div class="meta">
              <strong>${Utils.escapeHtml(o.name)} ${o.isVerified ? '✓' : ''}</strong>
              <span>${Utils.escapeHtml(o.organizationName || o.email)}</span>
            </div>
          </div>
        </td>
        <td>${o.stats.eventCount}</td>
        <td>${o.stats.ticketsSold}</td>
        <td>${AdminLayout.money(o.stats.revenue)}</td>
        <td>${AdminLayout.stars(o.stats.averageRating)}</td>
        <td>
          ${o.isActive ? AdminLayout.statusBadge('active') : AdminLayout.statusBadge('suspended')}
          ${o.isVerified ? '' : AdminLayout.statusBadge('unverified')}
        </td>
        <td style="text-align:right;">
          <div class="admin-row-actions" style="justify-content:flex-end;">
            <button class="admin-action-btn indigo" data-view="${o.id}" title="View">${AdminLayout.ICONS.eye}</button>
            <button class="admin-action-btn blue" data-verify="${o.id}" data-verified="${o.isVerified ? '1' : ''}" title="${o.isVerified ? 'Unverify' : 'Verify'}">✓</button>
            <button class="admin-action-btn ${o.isActive ? 'amber' : 'success'}" data-toggle="${o.id}" data-active="${o.isActive ? '1' : ''}" title="${o.isActive ? 'Suspend' : 'Activate'}">${o.isActive ? '⏸' : '▶'}</button>
          </div>
        </td>
      </tr>
    `).join('');

    counts.forEach((c) => (c.textContent = `${this.state.total} organizer${this.state.total === 1 ? '' : 's'} · Page ${this.state.page} of ${this.state.totalPages || 1}`));

    const pag = document.querySelector('[data-pagination]');
    pag.innerHTML = AdminLayout.paginationHtml(this.state.totalPages, this.state.page, (p) => {
      this.state.page = p;
      this.load();
    });
    AdminLayout.bindPagination(pag);

    tbody.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => this.openModal(b.dataset.view)));
    tbody.querySelectorAll('[data-verify]').forEach((b) => b.addEventListener('click', () => this.toggleVerify(b.dataset.verify, b.dataset.verified === '1')));
    tbody.querySelectorAll('[data-toggle]').forEach((b) => b.addEventListener('click', () => this.toggleActive(b.dataset.toggle, b.dataset.active === '1')));
  },

  openModal(id) {
    const o = this.state.organizers.find((x) => x.id === id);
    if (!o) return;
    const s = o.stats;
    AdminLayout.openModal({
      title: 'Organizer Profile',
      subtitle: 'Performance snapshot',
      size: 'lg',
      body: `
        <div style="display:flex;align-items:center;gap:var(--space-4);margin-bottom:var(--space-5);">
          <img class="admin-avatar admin-avatar-lg" src="${o.profileImage || ''}" alt="">
          <div>
            <h3 style="font-family:var(--font-heading);font-weight:var(--font-weight-bold);">${Utils.escapeHtml(o.name)}</h3>
            <div class="admin-text-muted" style="font-size:var(--font-size-sm);">${Utils.escapeHtml(o.organizationName || o.email)}</div>
            <div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap;">
              ${AdminLayout.roleBadge('organizer')}
              ${o.isVerified ? AdminLayout.statusBadge('confirmed') : AdminLayout.statusBadge('unverified')}
              ${o.isActive ? AdminLayout.statusBadge('active') : AdminLayout.statusBadge('suspended')}
            </div>
          </div>
        </div>
        <div class="admin-grid-4" style="margin-bottom:var(--space-5);">
          <div class="admin-stat-card" style="padding:var(--space-4);flex-direction:column;align-items:flex-start;gap:6px;">
            <div class="admin-stat-label">Events</div>
            <div class="admin-stat-value" style="font-size:1.4rem;">${s.eventCount}</div>
          </div>
          <div class="admin-stat-card" style="padding:var(--space-4);flex-direction:column;align-items:flex-start;gap:6px;">
            <div class="admin-stat-label">Tickets Sold</div>
            <div class="admin-stat-value" style="font-size:1.4rem;">${s.ticketsSold}</div>
          </div>
          <div class="admin-stat-card" style="padding:var(--space-4);flex-direction:column;align-items:flex-start;gap:6px;">
            <div class="admin-stat-label">Revenue</div>
            <div class="admin-stat-value" style="font-size:1.4rem;">${AdminLayout.money(s.revenue)}</div>
          </div>
          <div class="admin-stat-card" style="padding:var(--space-4);flex-direction:column;align-items:flex-start;gap:6px;">
            <div class="admin-stat-label">Rating</div>
            <div class="admin-stat-value" style="font-size:1.4rem;">${Number(s.averageRating).toFixed(1)} ★</div>
          </div>
        </div>
        <div class="admin-modal-section">
          <h4>Contact</h4>
          <dl class="admin-detail-row"><dt>Email</dt><dd>${Utils.escapeHtml(o.email)}</dd></dl>
          <dl class="admin-detail-row"><dt>Phone</dt><dd>${Utils.escapeHtml(o.phone || '—')}</dd></dl>
          <dl class="admin-detail-row"><dt>Member since</dt><dd>${Utils.formatDate(o.createdAt)}</dd></dl>
        </div>
      `,
      footer: `<button class="admin-btn admin-btn-secondary admin-btn-sm" data-close>Close</button>`,
      onOpen: (modal) => {
        modal.querySelector('[data-close]').addEventListener('click', () => AdminLayout.closeModal());
      }
    });
  },

  async toggleVerify(id, verified) {
    try {
      const data = await API.put(`/admin/users/${id}/verify`, {});
      AdminLayout.toast(data.message, 'success');
      this.load();
    } catch (err) {
      AdminLayout.handleApiError(err);
    }
  },

  async toggleActive(id, isActive) {
    AdminLayout.confirm({
      title: isActive ? 'Suspend organizer?' : 'Activate organizer?',
      message: `Are you sure you want to ${isActive ? 'suspend' : 'activate'} this organizer account?`,
      confirmText: isActive ? 'Suspend' : 'Activate',
      danger: isActive,
      onConfirm: async () => {
        try {
          const data = await API.put(`/admin/users/${id}/status`, { isActive: !isActive });
          AdminLayout.toast(data.message, 'success');
          this.load();
        } catch (err) {
          AdminLayout.handleApiError(err);
        }
      }
    });
  },

  exportCsv() {
    const headers = ['Name', 'Email', 'Organization', 'Events', 'Attendees', 'Revenue', 'Rating', 'Verified', 'Active'];
    const rows = this.state.organizers.map((o) => [
      o.name, o.email, o.organizationName,
      o.stats.eventCount, o.stats.ticketsSold, o.stats.revenue,
      o.stats.averageRating, o.isVerified ? 'Yes' : 'No', o.isActive ? 'Yes' : 'No'
    ]);
    AdminLayout.exportCSV('organizers.csv', headers, rows);
    AdminLayout.toast('CSV exported', 'success');
  }
};

document.addEventListener('DOMContentLoaded', () => AdminOrganizers.init());
window.AdminOrganizers = AdminOrganizers;
