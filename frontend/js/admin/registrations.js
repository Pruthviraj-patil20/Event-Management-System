/**
 * EventSphere — Admin Registration Management
 */

const AdminRegistrations = {
  state: {
    page: 1,
    limit: 15,
    search: '',
    status: 'all',
    total: 0,
    totalPages: 1,
    registrations: []
  },

  init() {
    if (!AdminLayout.init({ page: 'registrations', title: 'Registrations', crumb: ['Registrations'] })) return;

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
    const tbody = document.getElementById('registrationsTable');
    tbody.innerHTML = AdminLayout.skeletonRows(9, 5);

    try {
      const data = await API.get('/admin/registrations', {
        page: this.state.page,
        limit: this.state.limit,
        search: this.state.search,
        status: this.state.status
      });
      this.state.total = data.total;
      this.state.totalPages = data.totalPages;
      this.state.registrations = data.registrations || [];
      this.render();
    } catch (err) {
      AdminLayout.handleApiError(err);
      tbody.innerHTML = `<tr><td colspan="9">${AdminLayout.errorState({ code: '500', title: 'Failed to load registrations', desc: err.message, action: '<button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="AdminRegistrations.load()">Retry</button>' })}</td></tr>`;
    }
  },

  render() {
    const tbody = document.getElementById('registrationsTable');
    const counts = document.querySelectorAll('[data-count]');

    if (!this.state.registrations.length) {
      tbody.innerHTML = `<tr><td colspan="9">${AdminLayout.emptyState({ icon: '📝', title: 'No registrations found', desc: 'No registrations match your search or filters.' })}</td></tr>`;
      counts.forEach((c) => (c.textContent = '0 registrations'));
      document.querySelector('[data-pagination]').innerHTML = '';
      return;
    }

    tbody.innerHTML = this.state.registrations.map((r) => {
      const items = (r.items || []).reduce((s, i) => s + (i.quantity || 0), 0);
      return `
        <tr>
          <td>
            <div class="meta">
              <strong style="font-family:var(--font-mono);font-size:var(--font-size-xs);">${Utils.escapeHtml(r.registrationNumber)}</strong>
              <span class="admin-text-muted" style="font-size:var(--font-size-xs);">#${r.id.slice(-6)}</span>
            </div>
          </td>
          <td>
            <div class="admin-user-cell">
              <img class="admin-avatar admin-avatar-sm" src="${r.user?.profileImage || ''}" alt="">
              <div class="meta">
                <strong>${Utils.escapeHtml(r.attendeeInfo?.name || r.user?.name || '—')}</strong>
                <span>${Utils.escapeHtml(r.attendeeInfo?.email || '')}</span>
              </div>
            </div>
          </td>
          <td>${Utils.escapeHtml(r.event?.title || '—')}</td>
          <td>${items}</td>
          <td>${AdminLayout.money(r.totalAmount)}</td>
          <td>${AdminLayout.statusBadge(r.paymentStatus)}</td>
          <td>${r.checkedIn ? AdminLayout.statusBadge('used') : '<span class="admin-badge admin-badge-gray">Not in</span>'}</td>
          <td>${AdminLayout.timeAgo(r.createdAt)}</td>
          <td style="text-align:right;">
            <div class="admin-row-actions" style="justify-content:flex-end;">
              <button class="admin-action-btn indigo" data-view="${r.id}" title="View">${AdminLayout.ICONS.eye}</button>
              ${r.paymentStatus !== 'refunded' ? `<button class="admin-action-btn danger" data-cancel="${r.id}" title="Cancel & refund">✕</button>` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    counts.forEach((c) => (c.textContent = `${this.state.total} registration${this.state.total === 1 ? '' : 's'} · Page ${this.state.page} of ${this.state.totalPages || 1}`));

    const pag = document.querySelector('[data-pagination]');
    pag.innerHTML = AdminLayout.paginationHtml(this.state.totalPages, this.state.page, (p) => {
      this.state.page = p;
      this.load();
    });
    AdminLayout.bindPagination(pag);

    tbody.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => this.openView(b.dataset.view)));
    tbody.querySelectorAll('[data-cancel]').forEach((b) => b.addEventListener('click', () => this.cancel(b.dataset.cancel)));
  },

  find(id) {
    return this.state.registrations.find((r) => r.id === id);
  },

  openView(id) {
    const r = this.find(id);
    if (!r) return;
    const items = (r.items || []).map((i) =>
      `<div class="admin-detail-row"><dt>${Utils.escapeHtml(i.ticketType)} × ${i.quantity}</dt><dd>${AdminLayout.money(i.subtotal)}</dd></div>`
    ).join('');
    AdminLayout.openModal({
      title: 'Registration Details',
      subtitle: r.registrationNumber,
      body: `
        <div class="admin-modal-section">
          <h4>Attendee</h4>
          <dl class="admin-detail-row"><dt>Name</dt><dd>${Utils.escapeHtml(r.attendeeInfo?.name || '—')}</dd></dl>
          <dl class="admin-detail-row"><dt>Email</dt><dd>${Utils.escapeHtml(r.attendeeInfo?.email || '—')}</dd></dl>
          <dl class="admin-detail-row"><dt>Phone</dt><dd>${Utils.escapeHtml(r.attendeeInfo?.phone || '—')}</dd></dl>
        </div>
        <div class="admin-modal-section">
          <h4>Order</h4>
          <dl class="admin-detail-row"><dt>Event</dt><dd>${Utils.escapeHtml(r.event?.title || '—')}</dd></dl>
          ${items}
          <dl class="admin-detail-row"><dt>Total</dt><dd><strong>${AdminLayout.money(r.totalAmount)}</strong></dd></dl>
        </div>
        <div class="admin-modal-section">
          <h4>Payment</h4>
          <dl class="admin-detail-row"><dt>Status</dt><dd>${AdminLayout.statusBadge(r.paymentStatus)}</dd></dl>
          <dl class="admin-detail-row"><dt>Method</dt><dd>${Utils.escapeHtml(r.paymentMethod || '—')}</dd></dl>
          <dl class="admin-detail-row"><dt>Reference</dt><dd style="font-family:var(--font-mono);font-size:var(--font-size-xs);">${Utils.escapeHtml(r.paymentId || '—')}</dd></dl>
          <dl class="admin-detail-row"><dt>Check-in</dt><dd>${r.checkedIn ? AdminLayout.statusBadge('used') : AdminLayout.statusBadge('draft')}</dd></dl>
          <dl class="admin-detail-row"><dt>Registered</dt><dd>${Utils.formatDate(r.createdAt)}</dd></dl>
        </div>
      `,
      footer: `
        <button class="admin-btn admin-btn-secondary admin-btn-sm" data-close>Close</button>
        ${r.paymentStatus !== 'refunded' ? `<button class="admin-btn admin-btn-danger admin-btn-sm" data-cancel>Cancel & Refund</button>` : ''}
      `,
      onOpen: (modal) => {
        modal.querySelector('[data-close]').addEventListener('click', () => AdminLayout.closeModal());
        const cancelBtn = modal.querySelector('[data-cancel]');
        if (cancelBtn) cancelBtn.addEventListener('click', () => { AdminLayout.closeModal(); this.cancel(id); });
      }
    });
  },

  cancel(id) {
    const r = this.find(id);
    AdminLayout.confirm({
      title: 'Cancel Registration?',
      message: `This will cancel <strong>${Utils.escapeHtml(r?.registrationNumber || 'this registration')}</strong> and mark it as refunded.`,
      confirmText: 'Cancel & Refund',
      danger: true,
      onConfirm: async () => {
        try {
          const data = await API.post(`/admin/registrations/${id}/cancel`, {});
          AdminLayout.toast(data.message, 'success');
          this.load();
        } catch (err) {
          AdminLayout.handleApiError(err);
        }
      }
    });
  },

  exportCsv() {
    const headers = ['Registration No', 'Attendee', 'Email', 'Event', 'Items', 'Total', 'Payment', 'Checked In', 'Registered'];
    const rows = this.state.registrations.map((r) => [
      r.registrationNumber, r.attendeeInfo?.name, r.attendeeInfo?.email, r.event?.title || '',
      (r.items || []).reduce((s, i) => s + (i.quantity || 0), 0),
      r.totalAmount, r.paymentStatus, r.checkedIn ? 'Yes' : 'No', new Date(r.createdAt).toISOString()
    ]);
    AdminLayout.exportCSV('registrations.csv', headers, rows);
    AdminLayout.toast('CSV exported', 'success');
  }
};

document.addEventListener('DOMContentLoaded', () => AdminRegistrations.init());
window.AdminRegistrations = AdminRegistrations;