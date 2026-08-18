/**
 * EventSphere — Notifications Controller
 */

const Notifications = {
  async init() {
    if (!Auth.requireAuth()) return;

    const listEl = document.getElementById('notificationsFeed');
    if (!listEl) return;

    try {
      const data = await API.get('/notifications');
      this.renderNotificationsList(data.notifications || []);
    } catch (err) {
      listEl.innerHTML = Components.renderEmptyState('Failed to load notifications', err.message);
    }
  },

  renderNotificationsList(notifications = []) {
    const listEl = document.getElementById('notificationsFeed');
    if (!listEl) return;

    if (notifications.length === 0) {
      listEl.innerHTML = Components.renderEmptyState(
        'All Caught Up! 🔔',
        'You have no new notifications right now. Check back when booking events or receiving updates.'
      );
      return;
    }

    const typeIcons = {
      ticket_confirmed: '🎟️',
      registration: '👤',
      event_approval: '✅',
      event_rejection: '⚠️',
      reminder: '⏰',
      system: '✦'
    };

    listEl.innerHTML = notifications.map(n => `
      <div class="notification-item ${!n.isRead ? 'unread' : ''}" id="notif-${n._id}">
        <div class="notification-icon-wrap">
          ${typeIcons[n.type] || '✦'}
        </div>
        <div class="notification-body">
          <div class="notification-title">${Utils.escapeHtml(n.title)}</div>
          <div class="notification-desc">${Utils.escapeHtml(n.message)}</div>
          <div class="notification-time">${Utils.formatDate(n.createdAt)}</div>
        </div>
        ${!n.isRead ? `
          <button onclick="Notifications.markAsRead('${n._id}')" class="btn btn-ghost btn-sm" title="Mark as read">
            ✓ Read
          </button>
        ` : ''}
      </div>
    `).join('');
  },

  async markAsRead(id) {
    try {
      await API.put(`/notifications/${id}/read`, {});
      const item = document.getElementById(`notif-${id}`);
      if (item) {
        item.classList.remove('unread');
        const btn = item.querySelector('button');
        if (btn) btn.remove();
      }
      Components.showToast('Notification marked as read', 'info');
    } catch (err) {
      Components.showToast(err.message, 'error');
    }
  },

  async markAllAsRead() {
    try {
      await API.put('/notifications/read-all', {});
      Components.showToast('All notifications marked as read', 'success');
      this.init();
    } catch (err) {
      Components.showToast(err.message, 'error');
    }
  }
};

window.Notifications = Notifications;
