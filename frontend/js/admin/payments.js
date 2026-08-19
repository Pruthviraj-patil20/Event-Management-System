/**
 * EventSphere — Admin Payment Management
 */

const AdminPayments = {
  state: {
    page: 1,
    limit: 15,
    search: '',
    status: 'all',
    from: '',
    to: '',
    total: 0,
    totalPages: 1,
    payments: [],
    summary: null
  },

  init() {
    if (!AdminLayout.init({ page: 'payments', title: 'Payments', crumb: ['Payments'] })) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get('status') && ['completed', 'pending', 'failed', 'refunded'].includes(params.get('status'))) {
      this.state.status = params.get('status');
      document.querySelector('[data-filter-status]').value = this.state.status;
    }

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

    document.querySelector('[data-filter-from]').addEventListener('change', (e) => {
      this.state.from = e.target.value;
      this.state.page = 1;
      this.load();
    });

    document.querySelector('[data-filter-to]').addEventListener('change', (e) => {
      this.state.to = e.target.value;
      this.state.page = 1;
      this.load();
    });

    document.querySelector('[data-export-csv]').addEventListener('click', () => this.exportCsv());
    this.load();
  },

  async load() {
    const tbody = document.getElementById('paymentsTable');
    tbody.innerHTML = AdminLayout.skeletonRows(8, 5);

    try {
      const data = await API.get('/admin/payments', {
        page: this.state.page,
        limit: this.state.limit,
        search: this.state.search,
        status: this.state.status,
        from: this.state.from,
        to: this.state.to
      });
      this.state.total = data.total;
      this.state.totalPages = data.totalPages;
      this.state.payments = data.payments || [];
      this.state.summary = data.summary;
      this.renderSummary();
      this.render();
    } catch (err) {
      AdminLayout.handleApiError(err);
      tbody.innerHTML = `<tr><td colspan="8">${AdminLayout.errorState({ code: '500', title: 'Failed to load payments', desc: err.message, action: '<button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="AdminPayments.load()">Retry</button>' })}</td></tr>`;
    }
  },

  renderSummary() {
    const s = this.state.summary;
    if (!s) return;
    const cards = [
      { icon: '💰', tone: 'emerald', label: 'Total Revenue', value: AdminLayout.money(s.totalRevenue) },
      { icon: '📆', tone: 'cyan', label: "Today's Revenue", value: AdminLayout.money(s.todayRevenue) },
      { icon: '📅', tone: 'indigo', label: 'This Month', value: AdminLayout.money(s.monthRevenue) },
      { icon: '🗓️', tone: 'purple', label: 'This Year', value: AdminLayout.money(s.yearRevenue) },
      { icon: '↩️', tone: 'rose', label: 'Refunds', value: AdminLayout.money(s.refunds) },
      { icon: '⚖️', tone: 'amber', label: 'Net Revenue', value: AdminLayout.money(s.netRevenue) }
    ];
    document.getElementById('revenueGrid').innerHTML = cards.map((c) => `
      <div class="admin-stat-card">
        <div class="admin-stat-icon tone-${c.tone}">${c.icon}</div>
        <div class="admin-stat-body">
          <div class="admin-stat-label">${c.label}</div>
          <div class="admin-stat-value" style="font-size:1.3rem;">${c.value}</div>
        </div>
      </div>
    `).join('');
  },

  render() {
    const tbody = document.getElementById('paymentsTable');
    const counts = document.querySelectorAll('[data-count]');

    if (!this.state.payments.length) {
      tbody.innerHTML = `<tr><td colspan="8">${AdminLayout.emptyState({ icon: '💳', title: 'No payment transactions found', desc: 'No transactions match your filters.', action: '<button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="AdminPayments.resetFilters()">Clear Filters</button>' })}</td></tr>`;
      counts.forEach((c) => (c.textContent = '0 transactions'));
      document.querySelector('[data-pagination]').innerHTML = '';
      return;
    }

    tbody.innerHTML = this.state.payments.map((p) => `
      <tr>
        <td>
          <div class="meta">
            <strong style="font-family:var(--font-mono);font-size:var(--font-size-xs);">${Utils.escapeHtml(p.transactionId)}</strong>
            <span class="admin-text-muted" style="font-size:var(--font-size-xs);">${p.currency || 'INR'}</span>
          </div>
        </td>
        <td>${Utils.escapeHtml(p.user?.name || '—')}</td>
        <td>${Utils.escapeHtml(p.event?.title || '—')}</td>
        <td><strong>${AdminLayout.money(p.amount)}</strong></td>
        <td>${Utils.escapeHtml(p.paymentMethod || '—')}</td>
        <td>${AdminLayout.timeAgo(p.createdAt)}</td>
        <td>${AdminLayout.statusBadge(p.status)}</td>
        <td style="text-align:right;">
          <button class="admin-action-btn indigo" data-view="${p._id}" title="View">${AdminLayout.ICONS.eye}</button>
        </td>
      </tr>
    `).join('');

    counts.forEach((c) => (c.textContent = `${this.state.total} transaction${this.state.total === 1 ? '' : 's'} · Page ${this.state.page} of ${this.state.totalPages || 1}`));

    const pag = document.querySelector('[data-pagination]');
    pag.innerHTML = AdminLayout.paginationHtml(this.state.totalPages, this.state.page, (p) => {
      this.state.page = p;
      this.load();
    });
    AdminLayout.bindPagination(pag);

    tbody.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => this.openView(b.dataset.view)));
  },

  resetFilters() {
    this.state = { ...this.state, page: 1, search: '', status: 'all', from: '', to: '' };
    document.querySelector('[data-search]').value = '';
    document.querySelector('[data-filter-status]').value = 'all';
    document.querySelector('[data-filter-from]').value = '';
    document.querySelector('[data-filter-to]').value = '';
    this.load();
  },

  find(id) {
    return this.state.payments.find((p) => p._id === id);
  },

  openView(id) {
    const p = this.find(id);
    if (!p) return;
    const gateway = p.gatewayResponse || {};
    const gw = Object.keys(gateway).length
      ? Object.entries(gateway).slice(0, 5).map(([k, v]) =>
          `<div class="admin-detail-row"><dt>${Utils.escapeHtml(k)}</dt><dd style="font-family:var(--font-mono);font-size:var(--font-size-xs);">${Utils.escapeHtml(String(v))}</dd></div>`
        ).join('')
      : '';
    AdminLayout.openModal({
      title: 'Transaction Details',
      subtitle: p.transactionId,
      body: `
        <div class="admin-modal-section">
          <h4>Transaction</h4>
          <dl class="admin-detail-row"><dt>User</dt><dd>${Utils.escapeHtml(p.user?.name || '—')} (${Utils.escapeHtml(p.user?.email || '')})</dd></dl>
          <dl class="admin-detail-row"><dt>Event</dt><dd>${Utils.escapeHtml(p.event?.title || '—')}</dd></dl>
          <dl class="admin-detail-row"><dt>Amount</dt><dd><strong>${AdminLayout.money(p.amount)}</strong></dd></dl>
          <dl class="admin-detail-row"><dt>Method</dt><dd>${Utils.escapeHtml(p.paymentMethod || '—')}</dd></dl>
          <dl class="admin-detail-row"><dt>Status</dt><dd>${AdminLayout.statusBadge(p.status)}</dd></dl>
          <dl class="admin-detail-row"><dt>Date</dt><dd>${Utils.formatDate(p.createdAt)}</dd></dl>
        </div>
        ${gw ? `<div class="admin-modal-section"><h4>Gateway Response</h4>${gw}</div>` : ''}
      `,
      footer: `<button class="admin-btn admin-btn-secondary admin-btn-sm" data-close>Close</button>`,
      onOpen: (modal) => modal.querySelector('[data-close]').addEventListener('click', () => AdminLayout.closeModal())
    });
  },

  exportCsv() {
    const headers = ['Transaction ID', 'User', 'Email', 'Event', 'Amount', 'Currency', 'Method', 'Status', 'Date'];
    const rows = this.state.payments.map((p) => [
      p.transactionId, p.user?.name || '', p.user?.email || '', p.event?.title || '',
      p.amount, p.currency || 'INR', p.paymentMethod, p.status, new Date(p.createdAt).toISOString()
    ]);
    AdminLayout.exportCSV('payments.csv', headers, rows);
    AdminLayout.toast('CSV exported', 'success');
  }
};

document.addEventListener('DOMContentLoaded', () => AdminPayments.init());
window.AdminPayments = AdminPayments;