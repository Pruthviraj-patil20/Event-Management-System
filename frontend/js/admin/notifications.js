/**
 * EventSphere — Admin Notification Center
 */

const AdminNotifications = {
  notifications: [],
  unread: 0,

  init() {
    if (!AdminLayout.init({ page: 'notifications', title: 'Notifications', crumb: ['Notifications'] })) return;

    document.querySelector('[data-mark-all]').addEventListener('click', () => this.markAll());
    this.load();
  },

  async load() {
    const el = document.getElementById('notificationsList');
    el.innerHTML = AdminLayout.skeletonCards(4);

    try {
      const data = await API.get('/admin/notifications');
      this.notifications = data.notifications || [];
      this.unread = data.unread || 0;
      this.render();
      if (window.AdminLayout && AdminLayout.refreshNotifications) AdminLayout.refreshNotifications();
    } catch (err) {
      AdminLayout.handleApiError(err);
      el.innerHTML = AdminLayout.errorState({ code: '500', title: 'Failed to load notifications', desc: err.message, action: '<button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="AdminNotifications.load()">Retry</button>' });
    }
  },

  render() {
    const el = document.getElementById('notificationsList');
    const count = document.querySelector('[data-count]');

    if (!this.notifications.length) {
      el.innerHTML = AdminLayout.emptyState({ icon: '🔕', title: 'No notifications', desc: 'You are all caught up. Nothing to review.' });
      count.textContent = '0 notifications';
      return;
    }

    const typeIcons = { approval: '✅', rejection: '❌', system: '⚙️', payment: '💳', registration: '📝', ticket_confirmed: '🎟️', reminder: '⏰', event_update: '📅' };

    el.innerHTML = this.notifications.map((n) => `
      <div class="admin-list-item ${n.isRead ? '' : 'admin-unread'}" data-id="${n._id}" style="${n.isRead ? '' : 'background:var(--primary-50, rgba(99,102,241,0.06));'}">
        <span class="admin-stat-icon tone-indigo" style="width:38px;height:38px;font-size:16px;">${typeIcons[n.type] || 'ℹ️'}</span>
        <div class="grow">
          <div class="cell-main">${Utils.escapeHtml(n.title)}</div>
          <div class="cell-sub">${Utils.escapeHtml(n.message)}</div>
          <div class="cell-sub">${AdminLayout.timeAgo(n.createdAt)} · ${Utils.escapeHtml(n.type.replace(/_/g, ' '))}</div>
        </div>
        ${!n.isRead ? '<span class="admin-badge admin-badge-blue">New</span>' : ''}
        <div class="admin-row-actions">
          <button class="admin-action-btn indigo" data-view="${n._id}" title="View">${AdminLayout.ICONS.eye}</button>
          ${!n.isRead ? `<button class="admin-action-btn success" data-read="${n._id}" title="Mark read">✓</button>` : ''}
          <button class="admin-action-btn danger" data-delete="${n._id}" title="Delete">🗑</button>
        </div>
      </div>
    `).join('');

    count.textContent = `${this.notifications.length} notification${this.notifications.length === 1 ? '' : 's'} · ${this.unread} unread`;

    el.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => this.view(b.dataset.view)));
    el.querySelectorAll('[data-read]').forEach((b) => b.addEventListener('click', () => this.markOne(b.dataset.read)));
    el.querySelectorAll('[data-delete]').forEach((b) => b.addEventListener('click', () => this.del(b.dataset.delete)));
  },

  find(id) {
    return this.notifications.find((n) => n._id === id);
  },

  view(id) {
    const n = this.find(id);
    if (!n) return;
    AdminLayout.openModal({
      title: n.title,
      subtitle: `${n.type.replace(/_/g, ' ')} · ${Utils.formatDate(n.createdAt)}`,
      body: `
        <p style="color:var(--text-secondary);font-size:var(--font-size-sm);line-height:var(--line-height-relaxed);">${Utils.escapeHtml(n.message)}</p>
        <div style="margin-top:var(--space-4);">
          ${n.isRead ? AdminLayout.statusBadge('confirmed') : AdminLayout.statusBadge('unverified')}
        </div>
        ${n.link ? `<a class="admin-btn admin-btn-secondary admin-btn-sm" style="margin-top:var(--space-4);" href="${Utils.escapeHtml(n.link)}">Open related page</a>` : ''}
      `,
      footer: `<button class="admin-btn admin-btn-secondary admin-btn-sm" data-close>Close</button>`,
      onOpen: (modal) => {
        modal.querySelector('[data-close]').addEventListener('click', () => AdminLayout.closeModal());
        if (!n.isRead) this.markOne(id);
      }
    });
  },

  async markOne(id) {
    try {
      await API.put(`/admin/notifications/${id}/read`, {});
      this.load();
    } catch (err) {
      AdminLayout.handleApiError(err);
    }
  },

  async markAll() {
    try {
      const data = await API.put('/admin/notifications/read-all', {});
      AdminLayout.toast(data.message, 'success');
      this.load();
    } catch (err) {
      AdminLayout.handleApiError(err);
    }
  },

  del(id) {
    const n = this.find(id);
    AdminLayout.confirm({
      title: 'Delete notification?',
      message: `Remove <strong>${Utils.escapeHtml(n?.title || 'this notification')}</strong>?`,
      confirmText: 'Delete',
      danger: true,
      onConfirm: async () => {
        try {
          const data = await API.delete(`/admin/notifications/${id}`);
          AdminLayout.toast(data.message, 'success');
          this.load();
        } catch (err) {
          AdminLayout.handleApiError(err);
        }
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => AdminNotifications.init());
window.AdminNotifications = AdminNotifications;