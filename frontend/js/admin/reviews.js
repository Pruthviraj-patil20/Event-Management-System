/**
 * EventSphere — Admin Review Moderation
 */

const AdminReviews = {
  state: {
    page: 1,
    limit: 15,
    search: '',
    status: 'all',
    total: 0,
    totalPages: 1,
    reviews: []
  },

  init() {
    if (!AdminLayout.init({ page: 'reviews', title: 'Reviews', crumb: ['Reviews'] })) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'hidden' || params.get('status') === 'active') {
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

    this.load();
  },

  async load() {
    const tbody = document.getElementById('reviewsTable');
    tbody.innerHTML = AdminLayout.skeletonRows(7, 5);

    try {
      const data = await API.get('/admin/reviews', {
        page: this.state.page,
        limit: this.state.limit,
        search: this.state.search,
        status: this.state.status
      });
      this.state.total = data.total;
      this.state.totalPages = data.totalPages;
      this.state.reviews = data.reviews || [];
      this.render();
    } catch (err) {
      AdminLayout.handleApiError(err);
      tbody.innerHTML = `<tr><td colspan="7">${AdminLayout.errorState({ code: '500', title: 'Failed to load reviews', desc: err.message, action: '<button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="AdminReviews.load()">Retry</button>' })}</td></tr>`;
    }
  },

  render() {
    const tbody = document.getElementById('reviewsTable');
    const counts = document.querySelectorAll('[data-count]');

    if (!this.state.reviews.length) {
      tbody.innerHTML = `<tr><td colspan="7">${AdminLayout.emptyState({ icon: '⭐', title: 'No reviews found', desc: 'No reviews match your filters.' })}</td></tr>`;
      counts.forEach((c) => (c.textContent = '0 reviews'));
      document.querySelector('[data-pagination]').innerHTML = '';
      return;
    }

    tbody.innerHTML = this.state.reviews.map((r) => `
      <tr class="${r.status === 'hidden' ? 'admin-row-suspended' : ''}">
        <td>
          <div class="admin-user-cell">
            <img class="admin-avatar" src="${r.user?.profileImage || ''}" alt="">
            <div class="meta">
              <strong>${Utils.escapeHtml(r.user?.name || '—')}</strong>
              <span>${Utils.escapeHtml(r.user?.email || '')}</span>
            </div>
          </div>
        </td>
        <td>${Utils.escapeHtml(r.event?.title || '—')}</td>
        <td>${AdminLayout.stars(r.rating)}</td>
        <td style="max-width:280px;">
          <div class="cell-main">${Utils.escapeHtml(r.title || '')}</div>
          <div class="cell-sub" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${Utils.escapeHtml(r.comment)}</div>
        </td>
        <td>${AdminLayout.timeAgo(r.createdAt)}</td>
        <td>${r.status === 'active' ? AdminLayout.statusBadge('active') : AdminLayout.statusBadge('hidden')}</td>
        <td style="text-align:right;">
          <div class="admin-row-actions" style="justify-content:flex-end;">
            <button class="admin-action-btn indigo" data-view="${r._id}" title="View">${AdminLayout.ICONS.eye}</button>
            <button class="admin-action-btn ${r.status === 'active' ? 'amber' : 'success'}" data-toggle="${r._id}" data-status="${r.status}" title="${r.status === 'active' ? 'Hide' : 'Approve / Restore'}">
              ${r.status === 'active' ? '🙈' : '✓'}
            </button>
            <button class="admin-action-btn danger" data-delete="${r._id}" title="Delete">🗑</button>
          </div>
        </td>
      </tr>
    `).join('');

    counts.forEach((c) => (c.textContent = `${this.state.total} review${this.state.total === 1 ? '' : 's'} · Page ${this.state.page} of ${this.state.totalPages || 1}`));

    const pag = document.querySelector('[data-pagination]');
    pag.innerHTML = AdminLayout.paginationHtml(this.state.totalPages, this.state.page, (p) => {
      this.state.page = p;
      this.load();
    });
    AdminLayout.bindPagination(pag);

    tbody.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => this.view(b.dataset.view)));
    tbody.querySelectorAll('[data-toggle]').forEach((b) => b.addEventListener('click', () => this.toggle(b.dataset.toggle, b.dataset.status)));
    tbody.querySelectorAll('[data-delete]').forEach((b) => b.addEventListener('click', () => this.del(b.dataset.delete)));
  },

  find(id) {
    return this.state.reviews.find((r) => r._id === id);
  },

  view(id) {
    const r = this.find(id);
    if (!r) return;
    AdminLayout.openModal({
      title: 'Review Details',
      subtitle: `${Utils.escapeHtml(r.event?.title || '')} · ${Utils.formatDate(r.createdAt)}`,
      body: `
        <div style="display:flex;align-items:center;gap:var(--space-4);margin-bottom:var(--space-5);">
          <img class="admin-avatar admin-avatar-lg" src="${r.user?.profileImage || ''}" alt="">
          <div>
            <strong>${Utils.escapeHtml(r.user?.name || '—')}</strong>
            <div>${AdminLayout.stars(r.rating)}</div>
          </div>
        </div>
        <p style="color:var(--text-secondary);font-size:var(--font-size-sm);line-height:var(--line-height-relaxed);">${Utils.escapeHtml(r.comment)}</p>
      `,
      footer: `<button class="admin-btn admin-btn-secondary admin-btn-sm" data-close>Close</button>`,
      onOpen: (modal) => modal.querySelector('[data-close]').addEventListener('click', () => AdminLayout.closeModal())
    });
  },

  async toggle(id, status) {
    const target = status === 'active' ? 'hidden' : 'active';
    try {
      const data = await API.put(`/admin/reviews/${id}/status`, { status: target });
      AdminLayout.toast(data.message, 'success');
      this.load();
    } catch (err) {
      AdminLayout.handleApiError(err);
    }
  },

  del(id) {
    const r = this.find(id);
    AdminLayout.confirm({
      title: 'Delete review?',
      message: `This will permanently remove this review by <strong>${Utils.escapeHtml(r?.user?.name || 'this user')}</strong>.`,
      confirmText: 'Delete Review',
      danger: true,
      onConfirm: async () => {
        try {
          const data = await API.delete(`/admin/reviews/${id}`);
          AdminLayout.toast(data.message, 'success');
          this.load();
        } catch (err) {
          AdminLayout.handleApiError(err);
        }
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => AdminReviews.init());
window.AdminReviews = AdminReviews;