/**
 * EventSphere — System Administrator Management Panel
 */

const Admin = {
  async initDashboard() {
    if (!Auth.requireAuth(['admin'])) return;

    try {
      const data = await API.get('/analytics/admin');
      this.renderAdminMetrics(data.stats);
      this.loadPendingModerationEvents();
      this.loadRecentUsers();
    } catch (err) {
      Components.showToast(`Error loading admin analytics: ${err.message}`, 'error');
    }
  },

  renderAdminMetrics(stats) {
    if (!stats) return;
    const usersEl = document.getElementById('adminTotalUsers');
    const eventsEl = document.getElementById('adminTotalEvents');
    const revenueEl = document.getElementById('adminTotalRevenue');
    const ticketsEl = document.getElementById('adminTotalTickets');

    if (usersEl) usersEl.textContent = stats.totalUsers || 0;
    if (eventsEl) eventsEl.textContent = stats.totalEvents || 0;
    if (revenueEl) revenueEl.textContent = Utils.formatCurrency(stats.totalRevenue || 0);
    if (ticketsEl) ticketsEl.textContent = stats.totalTickets || 0;
  },

  async loadPendingModerationEvents() {
    const tbody = document.getElementById('adminModerationTable');
    if (!tbody) return;

    try {
      const data = await API.get('/events', { status: 'pending' });
      const events = data.events || [];

      if (events.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">✅ Moderation queue clear! No pending events.</td></tr>`;
        return;
      }

      tbody.innerHTML = events.map(e => `
        <tr>
          <td>
            <div class="table-user-cell">
              <img src="${e.image}" style="width: 44px; height: 44px; border-radius: var(--radius-sm); object-fit: cover;" alt="Event">
              <div>
                <div class="table-title-main">${Utils.escapeHtml(e.title)}</div>
                <div class="table-sub-text">${Utils.escapeHtml(e.category)} • ${Utils.formatDate(e.date, 'short')}</div>
              </div>
            </div>
          </td>
          <td>${Utils.escapeHtml(e.organizer?.name || 'Organizer')}</td>
          <td>${Utils.escapeHtml(e.venueDetails?.name || 'City Hall')}</td>
          <td><span class="badge badge-warning">PENDING REVIEW</span></td>
          <td>
            <div class="table-actions">
              <button onclick="Admin.moderateEvent('${e._id}', 'published')" class="btn btn-primary btn-sm">Approve</button>
              <button onclick="Admin.openRejectModal('${e._id}')" class="btn btn-secondary btn-sm" style="color: var(--color-error);">Reject</button>
            </div>
          </td>
        </tr>
      `).join('');
    } catch (err) {
      Components.showToast(err.message, 'error');
    }
  },

  async moderateEvent(eventId, status, rejectionReason = '') {
    try {
      const data = await API.put(`/events/${eventId}/moderate`, { status, rejectionReason });
      Components.showToast(data.message, 'success');
      this.loadPendingModerationEvents();
      if (document.getElementById('rejectModal')) {
        document.getElementById('rejectModal').classList.remove('active');
      }
    } catch (err) {
      Components.showToast(err.message, 'error');
    }
  },

  openRejectModal(eventId) {
    const modal = document.getElementById('rejectModal');
    if (!modal) return;
    modal.classList.add('active');
    const form = document.getElementById('rejectForm');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const reason = document.getElementById('rejectReasonInput')?.value || 'Event guidelines not met';
        this.moderateEvent(eventId, 'rejected', reason);
      };
    }
  },

  async loadRecentUsers() {
    const tbody = document.getElementById('adminUsersTable');
    if (!tbody) return;

    try {
      const data = await API.get('/users', { limit: 10 });
      const users = data.users || [];

      tbody.innerHTML = users.map(u => `
        <tr>
          <td>
            <div class="table-user-cell">
              <img src="${u.profileImage}" class="table-avatar" alt="Avatar">
              <div>
                <div class="table-title-main">${Utils.escapeHtml(u.name)}</div>
                <div class="table-sub-text">${Utils.escapeHtml(u.email)}</div>
              </div>
            </div>
          </td>
          <td>
            <span class="badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'organizer' ? 'badge-warning' : 'badge-primary'}">
              ${u.role.toUpperCase()}
            </span>
          </td>
          <td>${Utils.formatDate(u.createdAt, 'short')}</td>
          <td><span class="badge ${u.isVerified ? 'badge-success' : 'badge-neutral'}">${u.isVerified ? 'Verified' : 'Pending'}</span></td>
          <td>
            <div class="table-actions">
              <button onclick="Admin.deleteUser('${u._id}')" class="table-action-btn" style="color: var(--color-error);" title="Delete User">🗑️</button>
            </div>
          </td>
        </tr>
      `).join('');
    } catch (err) {
      Components.showToast(err.message, 'error');
    }
  },

  async deleteUser(userId) {
    if (!confirm('Are you sure you want to remove this user?')) return;
    try {
      await API.delete(`/users/${userId}`);
      Components.showToast('User removed successfully', 'success');
      this.loadRecentUsers();
    } catch (err) {
      Components.showToast(err.message, 'error');
    }
  }
};

window.Admin = Admin;
