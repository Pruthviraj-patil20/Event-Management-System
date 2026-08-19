/**
 * EventSphere — Admin Ticket Management
 */

const AdminTickets = {
  state: {
    page: 1,
    limit: 15,
    search: '',
    status: 'all',
    total: 0,
    totalPages: 1,
    tickets: []
  },

  init() {
    if (!AdminLayout.init({ page: 'tickets', title: 'Tickets', crumb: ['Tickets'] })) return;

    document.querySelector('[data-search]').addEventListener('input', Utils.debounce((e) => {
      this.state.search = e.target.value.trim();
      this.state.page = 1;
      this.load();
    }, 300));

    document.querySelector('[data-filter-status]').addEventListener('change', (e) => {
      this.state.status = e.target.value;
      this.state.page = 1;
      this.load();
    });

    document.querySelector('[data-export-csv]').addEventListener('click', () => this.exportCsv());
    this.load();
  },

  async load() {
    const tbody = document.getElementById('ticketsTable');
    tbody.innerHTML = AdminLayout.skeletonRows(9, 5);

    try {
      const data = await API.get('/admin/tickets', {
        page: this.state.page,
        limit: this.state.limit,
        search: this.state.search,
        status: this.state.status
      });
      this.state.total = data.total;
      this.state.totalPages = data.totalPages;
      this.state.tickets = data.tickets || [];
      this.render();
    } catch (err) {
      AdminLayout.handleApiError(err);
      tbody.innerHTML = `<tr><td colspan="9">${AdminLayout.errorState({ code: '500', title: 'Failed to load tickets', desc: err.message, action: '<button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="AdminTickets.load()">Retry</button>' })}</td></tr>`;
    }
  },

  render() {
    const tbody = document.getElementById('ticketsTable');
    const counts = document.querySelectorAll('[data-count]');

    if (!this.state.tickets.length) {
      tbody.innerHTML = `<tr><td colspan="9">${AdminLayout.emptyState({ icon: '🎟️', title: 'No tickets found', desc: 'No tickets match your search or filters.' })}</td></tr>`;
      counts.forEach((c) => (c.textContent = '0 tickets'));
      document.querySelector('[data-pagination]').innerHTML = '';
      return;
    }

    tbody.innerHTML = this.state.tickets.map((t) => `
      <tr>
        <td>
          <div class="meta">
            <strong style="font-family:var(--font-mono);font-size:var(--font-size-xs);">${Utils.escapeHtml(t.ticketNumber)}</strong>
            <span class="admin-text-muted" style="font-size:var(--font-size-xs);">#${Utils.escapeHtml(t.registration?.registrationNumber || t._id.slice(-6))}</span>
          </div>
        </td>
        <td>${Utils.escapeHtml(t.event?.title || '—')}</td>
        <td>
          <div class="admin-user-cell">
            <img class="admin-avatar admin-avatar-sm" src="${t.user?.profileImage || ''}" alt="">
            <div class="meta">
              <strong>${Utils.escapeHtml(t.attendeeName || t.user?.name || '—')}</strong>
              <span>${Utils.escapeHtml(t.attendeeEmail || '')}</span>
            </div>
          </div>
        </td>
        <td>${Utils.escapeHtml(t.ticketType)}</td>
        <td>${AdminLayout.money(t.price)}</td>
        <td>${AdminLayout.statusBadge(t.registration?.paymentStatus || 'pending')}</td>
        <td>${AdminLayout.statusBadge(t.status)}</td>
        <td>${AdminLayout.timeAgo(t.createdAt)}</td>
        <td style="text-align:right;">
          <div class="admin-row-actions" style="justify-content:flex-end;">
            <button class="admin-action-btn indigo" data-view="${t._id}" title="View">${AdminLayout.ICONS.eye}</button>
            ${t.status !== 'cancelled' ? `
              <button class="admin-action-btn ${t.checkedInAt ? 'amber' : 'success'}" data-checkin="${t._id}" data-checked="${t.checkedInAt ? '1' : ''}" title="${t.checkedInAt ? 'Revert check-in' : 'Mark check-in'}">
                ${t.checkedInAt ? '↩' : '✓'}
              </button>` : ''}
          </div>
        </td>
      </tr>
    `).join('');

    counts.forEach((c) => (c.textContent = `${this.state.total} ticket${this.state.total === 1 ? '' : 's'} · Page ${this.state.page} of ${this.state.totalPages || 1}`));

    const pag = document.querySelector('[data-pagination]');
    pag.innerHTML = AdminLayout.paginationHtml(this.state.totalPages, this.state.page, (p) => {
      this.state.page = p;
      this.load();
    });
    AdminLayout.bindPagination(pag);

    tbody.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => this.openView(b.dataset.view)));
    tbody.querySelectorAll('[data-checkin]').forEach((b) => b.addEventListener('click', () => this.checkin(b.dataset.checkin, b.dataset.checked === '1')));
  },

  find(id) {
    return this.state.tickets.find((t) => t._id === id);
  },

  openView(id) {
    const t = this.find(id);
    if (!t) return;
    AdminLayout.openModal({
      title: 'Ticket Details',
      subtitle: t.ticketNumber,
      body: `
        <div class="admin-modal-section">
          <h4>Attendee</h4>
          <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-3);">
            <img class="admin-avatar admin-avatar-lg" src="${t.user?.profileImage || ''}" alt="">
            <div>
              <strong>${Utils.escapeHtml(t.attendeeName || t.user?.name || '—')}</strong>
              <div class="admin-text-muted" style="font-size:var(--font-size-xs);">${Utils.escapeHtml(t.attendeeEmail || '')}</div>
            </div>
          </div>
        </div>
        <div class="admin-modal-section">
          <h4>Ticket</h4>
          <dl class="admin-detail-row"><dt>Event</dt><dd>${Utils.escapeHtml(t.event?.title || '—')}</dd></dl>
          <dl class="admin-detail-row"><dt>Type</dt><dd>${Utils.escapeHtml(t.ticketType)}</dd></dl>
          <dl class="admin-detail-row"><dt>Price</dt><dd>${AdminLayout.money(t.price)}</dd></dl>
          <dl class="admin-detail-row"><dt>Payment</dt><dd>${AdminLayout.statusBadge(t.registration?.paymentStatus || 'pending')}</dd></dl>
          <dl class="admin-detail-row"><dt>Status</dt><dd>${AdminLayout.statusBadge(t.status)}</dd></dl>
          <dl class="admin-detail-row"><dt>Seat</dt><dd>${Utils.escapeHtml(t.seatNumber || '—')}</dd></dl>
          <dl class="admin-detail-row"><dt>Purchased</dt><dd>${Utils.formatDate(t.createdAt)}</dd></dl>
          <dl class="admin-detail-row"><dt>Checked in</dt><dd>${t.checkedInAt ? Utils.formatDate(t.checkedInAt) : '—'}</dd></dl>
        </div>
      `,
      footer: `<button class="admin-btn admin-btn-secondary admin-btn-sm" data-close>Close</button>`,
      onOpen: (modal) => modal.querySelector('[data-close]').addEventListener('click', () => AdminLayout.closeModal())
    });
  },

  async checkin(id, isChecked) {
    try {
      const data = await API.post(`/admin/tickets/${id}/checkin`, {});
      AdminLayout.toast(data.message, 'success');
      this.load();
    } catch (err) {
      AdminLayout.handleApiError(err);
    }
  },

  exportCsv() {
    const headers = ['Ticket Number', 'Event', 'Attendee', 'Email', 'Type', 'Price', 'Status', 'Checked In', 'Purchased'];
    const rows = this.state.tickets.map((t) => [
      t.ticketNumber, t.event?.title || '', t.attendeeName, t.attendeeEmail,
      t.ticketType, t.price, t.status, t.checkedInAt ? new Date(t.checkedInAt).toISOString() : '',
      new Date(t.createdAt).toISOString()
    ]);
    AdminLayout.exportCSV('tickets.csv', headers, rows);
    AdminLayout.toast('CSV exported', 'success');
  }
};

document.addEventListener('DOMContentLoaded', () => AdminTickets.init());
window.AdminTickets = AdminTickets;