/**
 * EventSphere — Admin Profile
 */

const AdminProfile = {
  user: null,

  init() {
    if (!AdminLayout.init({ page: 'profile', title: 'My Profile', crumb: ['My Profile'] })) return;

    document.querySelector('[data-save-profile]').addEventListener('click', () => this.saveProfile());
    document.querySelector('[data-change-password]').addEventListener('click', () => this.changePassword());

    const avatar = document.querySelector('[data-preview]');
    if (avatar) {
      document.querySelector('[data-p="profileImage"]').addEventListener('input', (e) => {
        if (e.target.value) avatar.src = e.target.value;
      });
    }

    this.load();
  },

  async load() {
    try {
      const data = await API.get('/admin/profile');
      this.user = data.user;
      this.render();
    } catch (err) {
      AdminLayout.handleApiError(err);
    }
  },

  render() {
    const u = this.user || {};
    document.querySelector('[data-name]').textContent = u.name || '—';
    const avatar = document.querySelector('[data-preview]');
    avatar.src = u.profileImage || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(u.name || 'A') + '&background=6366f1&color=fff';
    document.querySelector('[data-p="name"]').value = u.name || '';
    document.querySelector('[data-p="email"]').value = u.email || '';
    document.querySelector('[data-p="phone"]').value = u.phone || '';
    document.querySelector('[data-p="organizationName"]').value = u.organizationName || '';
    document.querySelector('[data-p="profileImage"]').value = u.profileImage || '';
    document.querySelector('[data-p="bio"]').value = u.bio || '';
  },

  async saveProfile() {
    const payload = {};
    document.querySelectorAll('[data-p]').forEach((el) => {
      if (!el.disabled) payload[el.dataset.p] = el.value.trim();
    });
    const btn = document.querySelector('[data-save-profile]');
    btn.disabled = true;
    try {
      const data = await API.put('/admin/profile', payload);
      this.user = data.user;
      this.render();
      AdminLayout.toast(data.message, 'success');
    } catch (err) {
      AdminLayout.handleApiError(err);
    } finally {
      btn.disabled = false;
    }
  },

  async changePassword() {
    const current = document.querySelector('[data-pass="currentPassword"]').value;
    const next = document.querySelector('[data-pass="newPassword"]').value;
    const confirm = document.querySelector('[data-pass="confirmPassword"]').value;

    if (!current || !next) {
      AdminLayout.toast('Fill in both password fields', 'warning');
      return;
    }
    if (next.length < 6) {
      AdminLayout.toast('Password must be at least 6 characters', 'warning');
      return;
    }
    if (next !== confirm) {
      AdminLayout.toast('Passwords do not match', 'warning');
      return;
    }

    const btn = document.querySelector('[data-change-password]');
    btn.disabled = true;
    try {
      const data = await API.post('/admin/profile/password', { currentPassword: current, newPassword: next });
      AdminLayout.toast(data.message, 'success');
      document.querySelectorAll('[data-pass]').forEach((el) => (el.value = ''));
    } catch (err) {
      AdminLayout.handleApiError(err);
    } finally {
      btn.disabled = false;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => AdminProfile.init());
window.AdminProfile = AdminProfile;