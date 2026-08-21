/**
 * EventSphere — Admin Events Management
 */

const AdminEvents = {
  CATEGORIES: ['Technology', 'Music', 'Business', 'Sports', 'Education', 'Workshop', 'Conference', 'Festival'],

  state: {
    page: 1,
    limit: 100,
    search: '',
    category: 'all',
    status: 'all',
    sort: 'newest',
    total: 0,
    totalPages: 1,
    events: []
  },

  init() {
    if (!AdminLayout.init({ page: 'events', title: 'Events', crumb: ['Events'] })) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get('search')) {
      this.state.search = params.get('search');
      const input = document.querySelector('[data-search]');
      if (input) input.value = this.state.search;
    }

    const catSelect = document.querySelector('[data-filter-category]');
    this.CATEGORIES.forEach((c) => {
      catSelect.insertAdjacentHTML('beforeend', `<option value="${c}">${c}</option>`);
    });

    this.bindEvents();
    this.load();
  },

  bindEvents() {
    document.querySelector('[data-search]').addEventListener('input', Utils.debounce((e) => {
      this.state.search = e.target.value.trim();
      this.state.page = 1;
      this.load();
    }, 300));

    document.querySelector('[data-filter-category]').addEventListener('change', (e) => {
      this.state.category = e.target.value;
      this.state.page = 1;
      this.load();
    });

    document.querySelector('[data-filter-status]').addEventListener('change', (e) => {
      this.state.status = e.target.value;
      this.state.page = 1;
      this.load();
    });

    document.querySelector('[data-filter-sort]').addEventListener('change', (e) => {
      this.state.sort = e.target.value;
      this.load();
    });

    document.querySelector('[data-export-csv]').addEventListener('click', () => this.exportCsv());
  },

  async load() {
    const tbody = document.getElementById('eventsTable');
    tbody.innerHTML = AdminLayout.skeletonRows(8, 5);

    try {
      const data = await API.get('/admin/events', {
        page: this.state.page,
        limit: this.state.limit,
        search: this.state.search,
        category: this.state.category,
        status: this.state.status,
        sort: this.state.sort
      });
      this.state.total = data.total;
      this.state.totalPages = data.totalPages;
      this.state.events = data.events || [];
      this.render();
    } catch (err) {
      AdminLayout.handleApiError(err);
      tbody.innerHTML = `<tr><td colspan="8">${AdminLayout.errorState({ code: '500', title: 'Failed to load events', desc: err.message, action: '<button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="AdminEvents.load()">Retry</button>' })}</td></tr>`;
    }
  },

  rowHtml(e) {
    return `
      <tr>
        <td>
          <div class="admin-user-cell">
            <img class="admin-event-thumb lazy-img" src="${Utils.PLACEHOLDER_IMG}" data-src="${e.image || ''}" alt="" loading="lazy" decoding="async">
            <div class="meta">
              <strong>${Utils.escapeHtml(e.title)} ${e.featured ? '<span class="admin-star-badge">⭐ Featured</span>' : ''}</strong>
              <span>${Utils.escapeHtml(e.venue?.name || e.venueDetails?.name || '')} · ${Utils.escapeHtml(e.venue?.city || e.venueDetails?.city || '')}</span>
            </div>
          </div>
        </td>
        <td>${Utils.escapeHtml(e.organizer?.name || '—')}</td>
        <td>${Utils.escapeHtml(e.category)}</td>
        <td>${Utils.formatDate(e.date)}</td>
        <td>${e.ticketsSold} / ${e.capacity}</td>
        <td>${AdminLayout.money(e.revenue)}</td>
        <td>${AdminLayout.statusBadge(e.status)}</td>
        <td style="text-align:right;">
          <div class="admin-row-actions" style="justify-content:flex-end;">
            <a class="admin-action-btn indigo" href="/event-details.html?id=${e.id}" target="_blank" title="View">${AdminLayout.ICONS.eye}</a>
            <button class="admin-action-btn blue" data-review="${e.id}" title="Review">${AdminLayout.ICONS.search}</button>
            <button class="admin-action-btn amber" data-feature="${e.id}" data-featured="${e.featured ? '1' : ''}" title="${e.featured ? 'Unfeature' : 'Feature'}">${AdminLayout.ICONS.star}</button>
            ${e.status === 'pending'
              ? `<button class="admin-action-btn success" data-approve="${e.id}" title="Approve">✓</button>
                 <button class="admin-action-btn danger" data-reject="${e.id}" title="Reject">✕</button>`
              : ''}
            <button class="admin-action-btn danger" data-delete="${e.id}" title="Delete">🗑</button>
          </div>
        </td>
      </tr>
    `;
  },

  bindRowActions(tbody) {
    tbody.querySelectorAll('[data-feature]').forEach((b) => b.addEventListener('click', () => this.toggleFeatured(b.dataset.feature, b.dataset.featured === '1')));
    tbody.querySelectorAll('[data-review]').forEach((b) => b.addEventListener('click', () => this.openReview(b.dataset.review)));
    tbody.querySelectorAll('[data-approve]').forEach((b) => b.addEventListener('click', () => this.approve(b.dataset.approve)));
    tbody.querySelectorAll('[data-reject]').forEach((b) => b.addEventListener('click', () => this.openReject(b.dataset.reject)));
    tbody.querySelectorAll('[data-delete]').forEach((b) => b.addEventListener('click', () => this.del(b.dataset.delete)));
    Utils.enhanceLazyImages(tbody);
  },

  render() {
    const tbody = document.getElementById('eventsTable');
    const counts = document.querySelectorAll('[data-count]');

    if (!this.state.events.length) {
      tbody.innerHTML = `<tr><td colspan="8">${AdminLayout.emptyState({ icon: '📅', title: 'No events found', desc: 'No events match your search or filters.', action: '<button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="AdminEvents.resetFilters()">Clear Filters</button>' })}</td></tr>`;
      counts.forEach((c) => (c.textContent = '0 events'));
      document.querySelector('[data-pagination]').innerHTML = '';
      return;
    }

    if (this._virtualHandle) this._virtualHandle.destroy();
    this._virtualHandle = VirtualList.renderTableRows({
      tbody,
      items: this.state.events,
      itemHeight: 72,
      colSpan: 8,
      renderRow: (e) => this.rowHtml(e),
      onPaint: (el) => this.bindRowActions(el)
    });

    const virtualNote = VirtualList.shouldVirtualize(this.state.events.length) ? ' · virtual scroll' : '';
    counts.forEach((c) => (c.textContent = `${this.state.total} event${this.state.total === 1 ? '' : 's'} · Page ${this.state.page} of ${this.state.totalPages || 1}${virtualNote}`));

    const pag = document.querySelector('[data-pagination]');
    pag.innerHTML = AdminLayout.paginationHtml(this.state.totalPages, this.state.page, (p) => {
      this.state.page = p;
      this.load();
    });
    AdminLayout.bindPagination(pag);
  },

  resetFilters() {
    this.state = { ...this.state, page: 1, search: '', category: 'all', status: 'all', sort: 'newest' };
    document.querySelector('[data-search]').value = '';
    document.querySelector('[data-filter-category]').value = 'all';
    document.querySelector('[data-filter-status]').value = 'all';
    document.querySelector('[data-filter-sort]').value = 'newest';
    this.load();
  },

  openReview(id) {
    const e = this.state.events.find((x) => x.id === id);
    if (!e) return;
    const tickets = (e.ticketTypes || []).map((t) =>
      `<div class="admin-detail-row"><dt>${Utils.escapeHtml(t.name)}</dt><dd>${AdminLayout.money(t.price)} · ${t.availableQuantity ?? t.quantity} left</dd></div>`
    ).join('');
    AdminLayout.openModal({
      title: 'Event Review',
      subtitle: 'Full submission preview',
      size: 'lg',
      body: `
        <img src="${e.image || ''}" alt="" style="width:100%;height:200px;object-fit:cover;border-radius:var(--radius-md);margin-bottom:var(--space-5);">
        <div class="admin-modal-section">
          <h4>${Utils.escapeHtml(e.title)} ${e.featured ? '<span class="admin-star-badge">⭐ Featured</span>' : ''}</h4>
          <div class="admin-text-muted" style="font-size:var(--font-size-sm);margin-bottom:var(--space-3);">
            by ${Utils.escapeHtml(e.organizer?.name || 'Unknown')} · ${AdminLayout.statusBadge(e.status)}
          </div>
          <p style="font-size:var(--font-size-sm);color:var(--text-secondary);line-height:var(--line-height-relaxed);">${Utils.escapeHtml(e.description || e.shortDescription || 'No description provided.')}</p>
        </div>
        <div class="admin-modal-section">
          <h4>Details</h4>
          <dl class="admin-detail-row"><dt>Category</dt><dd>${Utils.escapeHtml(e.category)}</dd></dl>
          <dl class="admin-detail-row"><dt>Date & Time</dt><dd>${Utils.formatDate(e.date)} · ${Utils.escapeHtml(e.startTime || '')}</dd></dl>
          <dl class="admin-detail-row"><dt>Venue</dt><dd>${Utils.escapeHtml(e.venue?.name || e.venueDetails?.name || '')}, ${Utils.escapeHtml(e.venue?.city || e.venueDetails?.city || '')}</dd></dl>
          <dl class="admin-detail-row"><dt>Capacity</dt><dd>${e.capacity} seats</dd></dl>
          <dl class="admin-detail-row"><dt>Submitted</dt><dd>${AdminLayout.timeAgo(e.createdAt)}</dd></dl>
        </div>
        ${tickets ? `<div class="admin-modal-section"><h4>Ticket Information</h4>${tickets}</div>` : ''}
        ${e.tags && e.tags.length ? `<div class="admin-modal-section"><h4>Tags</h4><div style="display:flex;gap:6px;flex-wrap:wrap;">${e.tags.map((t) => `<span class="admin-badge admin-badge-indigo">${Utils.escapeHtml(t)}</span>`).join('')}</div></div>` : ''}
      `,
      footer: `
        <button class="admin-btn admin-btn-secondary admin-btn-sm" data-close>Close</button>
        ${e.status === 'pending' ? `
          <button class="admin-btn admin-btn-danger admin-btn-sm" data-reject>Reject</button>
          <button class="admin-btn admin-btn-primary admin-btn-sm" data-approve>Approve</button>` : ''}
      `,
      onOpen: (modal) => {
        modal.querySelector('[data-close]').addEventListener('click', () => AdminLayout.closeModal());
        const approveBtn = modal.querySelector('[data-approve]');
        const rejectBtn = modal.querySelector('[data-reject]');
        if (approveBtn) approveBtn.addEventListener('click', () => { AdminLayout.closeModal(); this.approve(id); });
        if (rejectBtn) rejectBtn.addEventListener('click', () => { AdminLayout.closeModal(); this.openReject(id); });
      }
    });
  },

  async toggleFeatured(id, isFeatured) {
    try {
      const data = await API.put(`/admin/events/${id}/feature`, {});
      AdminLayout.toast(data.message, 'success');
      this.load();
    } catch (err) {
      AdminLayout.handleApiError(err);
    }
  },

  async approve(id) {
    const e = this.state.events.find((x) => x.id === id);
    AdminLayout.confirm({
      title: 'Approve event?',
      message: `<strong>${Utils.escapeHtml(e?.title || 'This event')}</strong> will be published and visible to attendees.`,
      confirmText: 'Approve & Publish',
      onConfirm: async () => {
        try {
          const data = await API.put(`/admin/events/${id}/approve`, {});
          AdminLayout.toast(data.message, 'success');
          this.load();
        } catch (err) {
          AdminLayout.handleApiError(err);
        }
      }
    });
  },

  openReject(id) {
    const e = this.state.events.find((x) => x.id === id);
    AdminLayout.openModal({
      title: 'Reject Event',
      subtitle: 'Provide a reason the organizer will receive',
      body: `
        <div class="admin-form">
          <div class="admin-form-group">
            <label class="admin-form-label">Rejection Reason <span class="req">*</span></label>
            <textarea class="admin-textarea" data-reason placeholder="e.g. Event description does not provide sufficient venue information."></textarea>
          </div>
        </div>
      `,
      footer: `
        <button class="admin-btn admin-btn-secondary admin-btn-sm" data-cancel>Cancel</button>
        <button class="admin-btn admin-btn-danger admin-btn-sm" data-submit>Reject Event</button>
      `,
      onOpen: (modal) => {
        const textarea = modal.querySelector('[data-reason]');
        modal.querySelector('[data-cancel]').addEventListener('click', () => AdminLayout.closeModal());
        modal.querySelector('[data-submit]').addEventListener('click', async (btn) => {
          const reason = textarea.value.trim();
          if (!reason) {
            textarea.style.borderColor = 'var(--color-error)';
            AdminLayout.toast('A rejection reason is required', 'warning');
            return;
          }
          btn.disabled = true;
          btn.innerHTML = `${AdminLayout.spinnerHtml(14)} Rejecting...`;
          try {
            const data = await API.put(`/admin/events/${id}/reject`, { reason });
            AdminLayout.toast(data.message, 'success');
            AdminLayout.closeModal();
            this.load();
          } catch (err) {
            AdminLayout.handleApiError(err);
            btn.disabled = false;
            btn.innerHTML = 'Reject Event';
          }
        });
      }
    });
  },

  del(id) {
    const e = this.state.events.find((x) => x.id === id);
    AdminLayout.confirm({
      title: 'Delete Event?',
      message: `This will permanently delete <strong>${Utils.escapeHtml(e?.title || 'this event')}</strong>. This action cannot be undone.`,
      confirmText: 'Delete Event',
      danger: true,
      onConfirm: async () => {
        try {
          const data = await API.delete(`/admin/events/${id}`);
          AdminLayout.toast(data.message, 'success');
          this.load();
        } catch (err) {
          AdminLayout.handleApiError(err);
        }
      }
    });
  },

  exportCsv() {
    const headers = ['Title', 'Organizer', 'Category', 'Date', 'Venue', 'Capacity', 'Tickets Sold', 'Revenue', 'Status', 'Featured'];
    const rows = this.state.events.map((e) => [
      e.title, e.organizer?.name || '', e.category, new Date(e.date).toISOString(),
      e.venue?.name || e.venueDetails?.name || '', e.capacity, e.ticketsSold, e.revenue, e.status, e.featured ? 'Yes' : 'No'
    ]);
    AdminLayout.exportCSV('events.csv', headers, rows);
    AdminLayout.toast('CSV exported', 'success');
  }
};

document.addEventListener('DOMContentLoaded', () => AdminEvents.init());
window.AdminEvents = AdminEvents;
