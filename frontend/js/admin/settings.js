/**
 * EventSphere — Admin Settings
 */

const AdminSettings = {
  init() {
    if (!AdminLayout.init({ page: 'settings', title: 'Settings', crumb: ['Settings'] })) return;

    document.querySelector('[data-save]').addEventListener('click', () => this.save());
    this.load();
  },

  async load() {
    try {
      const data = await API.get('/admin/settings');
      this.settings = data.settings;
      this.render();
    } catch (err) {
      AdminLayout.handleApiError(err);
      document.querySelectorAll('[data-s]').forEach((el) => { el.disabled = true; });
    }
  },

  render() {
    const s = this.settings || {};
    document.querySelectorAll('[data-s]').forEach((el) => {
      const [section, field] = el.dataset.s.split('.');
      let val = s?.[section]?.[field];
      if (el.type === 'checkbox') {
        el.checked = !!val;
        el.addEventListener('change', () => {
          const [sec, f] = el.dataset.s.split('.');
          this.settings[sec][f] = el.checked;
        });
      } else {
        if (val === undefined || val === null) val = '';
        el.value = val;
        el.addEventListener('input', () => {
          const [sec, f] = el.dataset.s.split('.');
          let v = el.value;
          if (el.type === 'number') v = Number(v) || 0;
          this.settings[sec][f] = v;
        });
      }
    });
  },

  async save() {
    const btn = document.querySelector('[data-save]');
    btn.disabled = true;
    btn.textContent = 'Saving…';
    try {
      const data = await API.put('/admin/settings', this.settings);
      this.settings = data.settings;
      AdminLayout.toast(data.message, 'success');
    } catch (err) {
      AdminLayout.handleApiError(err);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Save Changes';
    }
  }
};

document.addEventListener('DOMContentLoaded', () => AdminSettings.init());
window.AdminSettings = AdminSettings;