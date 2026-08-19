/**
 * EventSphere — Admin Event Approval Center
 */

const AdminApprovals = {
  state: {
    page: 1,
    limit: 15,
    search: '',
    total: 0,
    totalPages: 1,
    events: []
  },

  init() {
    if (!AdminLayout.init({ page: 'event-approvals', title: 'Event Approvals', crumb: ['Event Approvals'] })) return;

    document.querySelector('[data-search]').addEventListener('input', Utils.debounce((e) => {
      this.state.search = e.target.value.trim();
      this.state.page = 1;
      this.load();
    }, 300));

    this.load();
  },

  async load() {
    const tbody = document.getElementById('approvalsTable');
    tbody.innerHTML = AdminLayout.skeletonRows(8, 4);

    try {
      const data = await API.get('/admin/events', {
        page: this.state.page,
        limit: this.state.limit,
        search: this.state.search,
        status: 'pending'
      });
      this.state.total = data.total;
      this.state.totalPages = data.totalPages;
      this.state.events = data.events || [];
      this.render();

      const q = document.querySelector('[data-queue-count]');
      if (q) q.textContent = `${data.total} awaiting review`;
      if (window.AdminLayout && AdminLayout.refreshApprovalsBadge) AdminLayout.refreshApprovalsBadge();
    } catch (err) {
      AdminLayout.handleApiError(err);
      tbody.innerHTML = `<tr><td colspan="8">${AdminLayout.errorState({ code: '500', title: 'Failed to load queue', desc: err.message, action: '<button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="AdminApprovals.load()">Retry</button>' })}</td></tr>`;
    }
  },

  render() {
    const tbody = document.getElementById('approvalsTable');
    const counts = document.querySelectorAll('[data-count]');

    if (!this.state.events.length) {
      tbody.innerHTML = `<tr><td colspan="8">${AdminLayout.emptyState({ icon: '🎉', title: 'Moderation queue clear', desc: 'No events are waiting for approval. Everything is reviewed.', action: '<a class="admin-btn admin-btn-secondary admin-btn-sm" href="/admin/events.html">View All Events</a>' })}</td></tr>`;
      counts.forEach((c) => (c.textContent = 'Queue clear'));
      document.querySelector('[data-pagination]').innerHTML = '';
      return;
    }

    tbody.innerHTML = this.state.events.map((e) => {
      const minPrice = (e.ticketTypes || []).length
        ? Math.min(...e.ticketTypes.map((t) => t.price))
        : 0;
      return `
        <tr>
          <td>
            <div class="admin-user-cell">
              <img class="admin-event-thumb" src="${e.image || ''}" alt="">
              <div class="meta">
                <strong>${Utils.escapeHtml(e.title)}</strong>
                <span>${Utils.escapeHtml(e.tags?.length ? e.tags.slice(0, 3).join(', ') : e.category)}</span>
              </div>
            </div>
          </td>
          <td>${Utils.escapeHtml(e.organizer?.name || '—')}</td>
          <td>${Utils.escapeHtml(e.category)}</td>
          <td>${Utils.formatDate(e.date)}</td>
          <td>${Utils.escapeHtml(e.venue?.name || e.venueDetails?.name || '—')}</td>
          <td>${AdminLayout.money(minPrice)}</td>
          <td>${AdminLayout.timeAgo(e.createdAt)}</td>
          <td style="text-align:right;">
            <div class="admin-row-actions" style="justify-content:flex-end;">
              <button class="admin-action-btn indigo" data-review="${e.id}" title="Review">${AdminLayout.ICONS.eye}</button>
              <button class="admin-action-btn success" data-approve="${e.id}" title="Approve">✓</button>
              <button class="admin-action-btn danger" data-reject="${e.id}" title="Reject">✕</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    counts.forEach((c) => (c.textContent = `${this.state.total} pending · Page ${this.state.page} of ${this.state.totalPages || 1}`));

    const pag = document.querySelector('[data-pagination]');
    pag.innerHTML = AdminLayout.paginationHtml(this.state.totalPages, this.state.page, (p) => {
      this.state.page = p;
      this.load();
    });
    AdminLayout.bindPagination(pag);

    tbody.querySelectorAll('[data-review]').forEach((b) => b.addEventListener('click', () => this.openReview(b.dataset.review)));
    tbody.querySelectorAll('[data-approve]').forEach((b) => b.addEventListener('click', () => this.approve(b.dataset.approve)));
    tbody.querySelectorAll('[data-reject]').forEach((b) => b.addEventListener('click', () => this.openReject(b.dataset.reject)));
  },

  find(id) {
    return this.state.events.find((x) => x.id === id);
  },

  openReview(id) {
    const e = this.find(id);
    if (!e) return;
    const tickets = (e.ticketTypes || []).map((t) =>
      `<div class="admin-detail-row"><dt>${Utils.escapeHtml(t.name)}</dt><dd>${AdminLayout.money(t.price)} · ${t.availableQuantity ?? t.quantity} available</dd></div>`
    ).join('');
    AdminLayout.openModal({
      title: 'Event Preview',
      subtitle: 'Complete submission for review',
      size: 'lg',
      body: `
        <img src="${e.image || ''}" alt="" style="width:100%;height:220px;object-fit:cover;border-radius:var(--radius-md);margin-bottom:var(--space-5);">
        <div class="admin-modal-section">
          <h4>${Utils.escapeHtml(e.title)}</h4>
          <div class="admin-text-muted" style="font-size:var(--font-size-sm);margin-bottom:var(--space-3);">by ${Utils.escapeHtml(e.organizer?.name || 'Unknown')}</div>
          <p style="font-size:var(--font-size-sm);color:var(--text-secondary);line-height:var(--line-height-relaxed);">${Utils.escapeHtml(e.description || e.shortDescription || 'No description provided.')}</p>
        </div>
        <div class="admin-modal-section">
          <h4>Event Details</h4>
          <dl class="admin-detail-row"><dt>Category</dt><dd>${Utils.escapeHtml(e.category)}</dd></dl>
          <dl class="admin-detail-row"><dt>Date & Time</dt><dd>${Utils.formatDate(e.date)} · ${Utils.escapeHtml(e.startTime || '')} – ${Utils.escapeHtml(e.endTime || '')}</dd></dl>
          <dl class="admin-detail-row"><dt>Venue</dt><dd>${Utils.escapeHtml(e.venue?.name || e.venueDetails?.name || '—')}</dd></dl>
          <dl class="admin-detail-row"><dt>Capacity</dt><dd>${e.capacity} seats</dd></dl>
          <dl class="admin-detail-row"><dt>Registration Deadline</dt><dd>${Utils.formatDate(e.date, 'short')}</dd></dl>
          <dl class="admin-detail-row"><dt>Submitted</dt><dd>${Utils.formatDate(e.createdAt)}</dd></dl>
        </div>
        ${tickets ? `<div class="admin-modal-section"><h4>Ticket Information</h4>${tickets}</div>` : ''}
        ${e.tags && e.tags.length ? `<div class="admin-modal-section"><h4>Event Tags</h4><div style="display:flex;gap:6px;flex-wrap:wrap;">${e.tags.map((t) => `<span class="admin-badge admin-badge-indigo">${Utils.escapeHtml(t)}</span>`).join('')}</div></div>` : ''}
      `,
      footer: `
        <button class="admin-btn admin-btn-secondary admin-btn-sm" data-close>Close</button>
        <button class="admin-btn admin-btn-danger admin-btn-sm" data-reject>Reject</button>
        <button class="admin-btn admin-btn-primary admin-btn-sm" data-approve>Approve</button>
      `,
      onOpen: (modal) => {
        modal.querySelector('[data-close]').addEventListener('click', () => AdminLayout.closeModal());
        modal.querySelector('[data-approve]').addEventListener('click', () => { AdminLayout.closeModal(); this.approve(id); });
        modal.querySelector('[data-reject]').addEventListener('click', () => { AdminLayout.closeModal(); this.openReject(id); });
      }
    });
  },

  approve(id) {
    const e = this.find(id);
    AdminLayout.confirm({
      title: 'Approve Event?',
      message: `<strong>${Utils.escapeHtml(e?.title || 'This event')}</strong> will be approved and published to attendees.`,
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
    const e = this.find(id);
    AdminLayout.openModal({
      title: 'Reject Event',
      subtitle: 'The organizer will be notified with this reason',
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
  }
};

document.addEventListener('DOMContentLoaded', () => AdminApprovals.init());
window.AdminApprovals = AdminApprovals;
