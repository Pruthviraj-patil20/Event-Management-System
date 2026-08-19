/**
 * EventSphere — Admin Venue Management (CRUD)
 */

const AdminVenues = {
  state: {
    page: 1,
    limit: 15,
    search: '',
    city: 'all',
    total: 0,
    totalPages: 1,
    venues: []
  },

  init() {
    if (!AdminLayout.init({ page: 'venues', title: 'Venues', crumb: ['Venues'] })) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get('search')) {
      this.state.search = params.get('search');
      const input = document.querySelector('[data-search]');
      if (input) input.value = this.state.search;
    }

    document.querySelector('[data-search]').addEventListener('input', Utils.debounce((e) => {
      this.state.search = e.target.value.trim();
      this.state.page = 1;
      this.load();
    }, 300));

    document.querySelector('[data-filter-city]').addEventListener('change', (e) => {
      this.state.city = e.target.value;
      this.state.page = 1;
      this.load();
    });

    document.querySelector('[data-add-venue]').addEventListener('click', () => this.openForm());

    this.load();
  },

  async load() {
    const tbody = document.getElementById('venuesTable');
    tbody.innerHTML = AdminLayout.skeletonRows(6, 5);

    try {
      const data = await API.get('/admin/venues', {
        page: this.state.page,
        limit: this.state.limit,
        search: this.state.search,
        city: this.state.city
      });
      this.state.total = data.total;
      this.state.totalPages = data.totalPages;
      this.state.venues = data.venues || [];

      const citySelect = document.querySelector('[data-filter-city]');
      const cities = [...new Set(this.state.venues.map((v) => v.city).filter(Boolean))];
      cities.forEach((c) => {
        if (![...citySelect.options].some((o) => o.value === c)) {
          citySelect.insertAdjacentHTML('beforeend', `<option value="${c}">${c}</option>`);
        }
      });

      this.render();
    } catch (err) {
      AdminLayout.handleApiError(err);
      tbody.innerHTML = `<tr><td colspan="6">${AdminLayout.errorState({ code: '500', title: 'Failed to load venues', desc: err.message, action: '<button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="AdminVenues.load()">Retry</button>' })}</td></tr>`;
    }
  },

  render() {
    const tbody = document.getElementById('venuesTable');
    const counts = document.querySelectorAll('[data-count]');

    if (!this.state.venues.length) {
      tbody.innerHTML = `<tr><td colspan="6">${AdminLayout.emptyState({ icon: '🏛️', title: 'No venues found', desc: 'No venues match your search.', action: '<button class="admin-btn admin-btn-primary admin-btn-sm" onclick="AdminVenues.openForm()">Add Venue</button>' })}</td></tr>`;
      counts.forEach((c) => (c.textContent = '0 venues'));
      document.querySelector('[data-pagination]').innerHTML = '';
      return;
    }

    tbody.innerHTML = this.state.venues.map((v) => `
      <tr>
        <td>
          <div class="admin-user-cell">
            <img class="admin-event-thumb" src="${v.image || ''}" alt="">
            <div class="meta">
              <strong>${Utils.escapeHtml(v.name)}</strong>
              <span>${Utils.escapeHtml(v.address || '')}</span>
            </div>
          </div>
        </td>
        <td>${Utils.escapeHtml(v.city)}${v.state ? `, ${Utils.escapeHtml(v.state)}` : ''}</td>
        <td>${v.capacity.toLocaleString()} seats</td>
        <td>
          <div style="font-size:var(--font-size-xs);">${Utils.escapeHtml(v.contactEmail || '—')}</div>
          <div style="font-size:var(--font-size-xs);color:var(--text-muted);">${Utils.escapeHtml(v.contactPhone || '')}</div>
        </td>
        <td>${v.isApproved ? AdminLayout.statusBadge('confirmed') : AdminLayout.statusBadge('unverified')}</td>
        <td style="text-align:right;">
          <div class="admin-row-actions" style="justify-content:flex-end;">
            <button class="admin-action-btn indigo" data-view="${v._id}" title="View">${AdminLayout.ICONS.eye}</button>
            <button class="admin-action-btn blue" data-edit="${v._id}" title="Edit">✏️</button>
            <button class="admin-action-btn danger" data-delete="${v._id}" title="Delete">🗑</button>
          </div>
        </td>
      </tr>
    `).join('');

    counts.forEach((c) => (c.textContent = `${this.state.total} venue${this.state.total === 1 ? '' : 's'} · Page ${this.state.page} of ${this.state.totalPages || 1}`));

    const pag = document.querySelector('[data-pagination]');
    pag.innerHTML = AdminLayout.paginationHtml(this.state.totalPages, this.state.page, (p) => {
      this.state.page = p;
      this.load();
    });
    AdminLayout.bindPagination(pag);

    tbody.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => this.openView(b.dataset.view)));
    tbody.querySelectorAll('[data-edit]').forEach((b) => b.addEventListener('click', () => this.openForm(b.dataset.edit)));
    tbody.querySelectorAll('[data-delete]').forEach((b) => b.addEventListener('click', () => this.del(b.dataset.delete)));
  },

  find(id) {
    return this.state.venues.find((v) => v._id === id);
  },

  openView(id) {
    const v = this.find(id);
    if (!v) return;
    const amenities = (v.amenities || []).map((a) => `<span class="admin-badge admin-badge-gray">${Utils.escapeHtml(a)}</span>`).join(' ');
    AdminLayout.openModal({
      title: 'Venue Details',
      subtitle: v.name,
      size: 'lg',
      body: `
        <img src="${v.image || ''}" alt="" style="width:100%;height:180px;object-fit:cover;border-radius:var(--radius-md);margin-bottom:var(--space-5);">
        <div class="admin-modal-section">
          <h4>Location</h4>
          <dl class="admin-detail-row"><dt>Address</dt><dd>${Utils.escapeHtml(v.address || '—')}</dd></dl>
          <dl class="admin-detail-row"><dt>City</dt><dd>${Utils.escapeHtml(v.city)}</dd></dl>
          <dl class="admin-detail-row"><dt>State / Country</dt><dd>${Utils.escapeHtml(v.state || '')}${v.state ? ', ' : ''}${Utils.escapeHtml(v.country || '')}</dd></dl>
          <dl class="admin-detail-row"><dt>Postal Code</dt><dd>${Utils.escapeHtml(v.postalCode || '—')}</dd></dl>
        </div>
        <div class="admin-modal-section">
          <h4>Facility</h4>
          <dl class="admin-detail-row"><dt>Capacity</dt><dd>${v.capacity.toLocaleString()} seats</dd></dl>
          <dl class="admin-detail-row"><dt>Status</dt><dd>${v.isApproved ? AdminLayout.statusBadge('confirmed') : AdminLayout.statusBadge('unverified')}</dd></dl>
          ${amenities ? `<dl class="admin-detail-row"><dt>Amenities</dt><dd style="text-align:right;max-width:260px;">${amenities}</dd></dl>` : ''}
        </div>
        <div class="admin-modal-section">
          <h4>Contact</h4>
          <dl class="admin-detail-row"><dt>Email</dt><dd>${Utils.escapeHtml(v.contactEmail || '—')}</dd></dl>
          <dl class="admin-detail-row"><dt>Phone</dt><dd>${Utils.escapeHtml(v.contactPhone || '—')}</dd></dl>
        </div>
      `,
      footer: `<button class="admin-btn admin-btn-secondary admin-btn-sm" data-close>Close</button>`,
      onOpen: (modal) => modal.querySelector('[data-close]').addEventListener('click', () => AdminLayout.closeModal())
    });
  },

  openForm(id) {
    const v = id ? this.find(id) : null;
    const isEdit = !!v;
    const f = (name) => v?.[name] ?? '';

    AdminLayout.openModal({
      title: isEdit ? 'Edit Venue' : 'Add Venue',
      subtitle: isEdit ? v.name : 'Create a new venue record',
      size: 'lg',
      body: `
        <div class="admin-form">
          <div class="admin-form-grid">
            <div class="admin-form-group">
              <label class="admin-form-label">Venue Name <span class="req">*</span></label>
              <input class="admin-input" data-f="name" value="${Utils.escapeHtml(f('name'))}" placeholder="Grand Arena Hall">
            </div>
            <div class="admin-form-group">
              <label class="admin-form-label">Capacity <span class="req">*</span></label>
              <input class="admin-input" data-f="capacity" type="number" min="1" value="${f('capacity') || ''}" placeholder="500">
            </div>
            <div class="admin-form-group" style="grid-column:1 / -1;">
              <label class="admin-form-label">Address <span class="req">*</span></label>
              <input class="admin-input" data-f="address" value="${Utils.escapeHtml(f('address'))}" placeholder="42 MG Road">
            </div>
            <div class="admin-form-group">
              <label class="admin-form-label">City <span class="req">*</span></label>
              <input class="admin-input" data-f="city" value="${Utils.escapeHtml(f('city'))}" placeholder="Bengaluru">
            </div>
            <div class="admin-form-group">
              <label class="admin-form-label">State</label>
              <input class="admin-input" data-f="state" value="${Utils.escapeHtml(f('state'))}" placeholder="Karnataka">
            </div>
            <div class="admin-form-group">
              <label class="admin-form-label">Country</label>
              <input class="admin-input" data-f="country" value="${Utils.escapeHtml(f('country'))}" placeholder="India">
            </div>
            <div class="admin-form-group">
              <label class="admin-form-label">Postal Code</label>
              <input class="admin-input" data-f="postalCode" value="${Utils.escapeHtml(f('postalCode'))}" placeholder="560001">
            </div>
            <div class="admin-form-group">
              <label class="admin-form-label">Contact Email</label>
              <input class="admin-input" data-f="contactEmail" value="${Utils.escapeHtml(f('contactEmail'))}" placeholder="bookings@venue.com">
            </div>
            <div class="admin-form-group">
              <label class="admin-form-label">Contact Phone</label>
              <input class="admin-input" data-f="contactPhone" value="${Utils.escapeHtml(f('contactPhone'))}" placeholder="+91 90000 00000">
            </div>
            <div class="admin-form-group" style="grid-column:1 / -1;">
              <label class="admin-form-label">Image URL</label>
              <input class="admin-input" data-f="image" value="${Utils.escapeHtml(f('image'))}" placeholder="https://…">
            </div>
            <div class="admin-form-group" style="grid-column:1 / -1;">
              <label class="admin-form-label">Amenities (comma separated)</label>
              <input class="admin-input" data-f="amenities" value="${Utils.escapeHtml((v?.amenities || []).join(', '))}" placeholder="Parking, Wi-Fi, Projector">
            </div>
          </div>
        </div>
      `,
      footer: `
        <button class="admin-btn admin-btn-secondary admin-btn-sm" data-cancel>Cancel</button>
        <button class="admin-btn admin-btn-primary admin-btn-sm" data-save>${isEdit ? 'Save Changes' : 'Create Venue'}</button>
      `,
      onOpen: (modal) => {
        modal.querySelector('[data-cancel]').addEventListener('click', () => AdminLayout.closeModal());
        modal.querySelector('[data-save]').addEventListener('click', async (btn) => {
          const get = (key) => (modal.querySelector(`[data-f="${key}"]`) || {}).value;
          const payload = {
            name: get('name').trim(),
            address: get('address').trim(),
            city: get('city').trim(),
            state: get('state').trim(),
            country: get('country').trim() || 'India',
            postalCode: get('postalCode').trim(),
            capacity: Number(get('capacity')),
            contactEmail: get('contactEmail').trim(),
            contactPhone: get('contactPhone').trim(),
            image: get('image').trim(),
            amenities: get('amenities').split(',').map((s) => s.trim()).filter(Boolean)
          };
          if (!payload.name || !payload.address || !payload.city || !payload.capacity) {
            AdminLayout.toast('Name, address, city and capacity are required', 'warning');
            return;
          }
          btn.disabled = true;
          btn.innerHTML = `${AdminLayout.spinnerHtml(14)} Saving...`;
          try {
            const data = isEdit
              ? await API.put(`/admin/venues/${id}`, payload)
              : await API.post('/admin/venues', payload);
            AdminLayout.toast(data.message, 'success');
            AdminLayout.closeModal();
            this.load();
          } catch (err) {
            AdminLayout.handleApiError(err);
            btn.disabled = false;
            btn.innerHTML = isEdit ? 'Save Changes' : 'Create Venue';
          }
        });
      }
    });
  },

  del(id) {
    const v = this.find(id);
    AdminLayout.confirm({
      title: 'Delete Venue?',
      message: `This will permanently remove <strong>${Utils.escapeHtml(v?.name || 'this venue')}</strong>. This action cannot be undone.`,
      confirmText: 'Delete Venue',
      danger: true,
      onConfirm: async () => {
        try {
          const data = await API.delete(`/admin/venues/${id}`);
          AdminLayout.toast(data.message, 'success');
          this.load();
        } catch (err) {
          AdminLayout.handleApiError(err);
        }
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => AdminVenues.init());
window.AdminVenues = AdminVenues;
