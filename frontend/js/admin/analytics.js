/**
 * EventSphere — Admin Analytics
 */

const AdminAnalytics = {
  charts: {},
  period: '30d',

  init() {
    if (!AdminLayout.init({ page: 'analytics', title: 'Analytics', crumb: ['Analytics'] })) return;
    this.bindPeriods();
    this.load();
    document.addEventListener('admin:themechange', () => this.load());
  },

  bindPeriods() {
    document.querySelectorAll('[data-period]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.dataset.period === 'custom') {
          this.openCustomRange();
          return;
        }
        document.querySelectorAll('[data-period]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.period = btn.dataset.period;
        this.load();
      });
    });
  },

  openCustomRange() {
    AdminLayout.openModal({
      title: 'Custom Date Range',
      body: `
        <div class="admin-form-grid">
          <div class="admin-form-group">
            <label class="admin-form-label">From</label>
            <input type="date" class="admin-input" data-from>
          </div>
          <div class="admin-form-group">
            <label class="admin-form-label">To</label>
            <input type="date" class="admin-input" data-to>
          </div>
        </div>
      `,
      footer: `
        <button class="admin-btn admin-btn-secondary admin-btn-sm" data-cancel>Cancel</button>
        <button class="admin-btn admin-btn-primary admin-btn-sm" data-apply>Apply</button>
      `,
      onOpen: (modal) => {
        modal.querySelector('[data-cancel]').addEventListener('click', () => AdminLayout.closeModal());
        modal.querySelector('[data-apply]').addEventListener('click', () => {
          const from = modal.querySelector('[data-from]').value;
          const to = modal.querySelector('[data-to]').value;
          AdminLayout.closeModal();
          if (!from && !to) return;
          document.querySelectorAll('[data-period]').forEach((b) => b.classList.remove('active'));
          document.querySelector('[data-period="custom"]').classList.add('active');
          this.custom = { from, to };
          this.load();
        });
      }
    });
  },

  async load() {
    const params = { period: this.period };
    if (this.period === 'custom' && this.custom) {
      params.from = this.custom.from;
      params.to = this.custom.to;
    }

    try {
      const data = await API.get('/admin/analytics', params);
      const label = document.querySelector('[data-range-label]');
      if (label) {
        label.textContent = this.period === 'custom'
          ? `Custom range: ${this.custom.from || 'start'} → ${this.custom.to || 'now'}`
          : `Completed payments over the selected period`;
      }
      this.renderRevenue(data.revenue || []);
      this.renderSeries('userChart', data.userGrowth || [], 'User Growth');
      this.renderSeries('eventChart', data.eventGrowth || [], 'Event Growth');
      this.renderSeries('registrationChart', data.registrations || [], 'Registrations');
      this.renderSeries('ticketChart', data.tickets || [], 'Ticket Sales');
      this.renderCategories(data.categories || []);
      this.renderTopEvents(data.topEvents || []);
      this.renderTopOrganizers(data.topOrganizers || []);
    } catch (err) {
      AdminLayout.handleApiError(err);
    }
  },

  renderRevenue(rows) {
    const el = document.getElementById('revenueChart');
    if (!el) return;
    const { grid, text } = AdminLayout.chartTheme();
    const C = AdminLayout.chartBaseColors();
    const ctx = el.getContext('2d');
    if (this.charts.revenue) this.charts.revenue.destroy();
    this.charts.revenue = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: rows.map((r) => r._id),
        datasets: [{
          label: 'Revenue',
          data: rows.map((r) => r.revenue),
          backgroundColor: C.indigo + 'cc',
          hoverBackgroundColor: C.indigo,
          borderRadius: 8,
          maxBarThickness: 42
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => ` ${AdminLayout.money(c.parsed.y)}` } }
        },
        scales: {
          x: { grid: { color: grid }, ticks: { color: text, maxTicksLimit: 10 } },
          y: { grid: { color: grid }, ticks: { color: text, callback: (v) => AdminLayout.money(v) } }
        }
      }
    });
  },

  renderSeries(id, rows, label) {
    const el = document.getElementById(id);
    if (!el) return;
    const { grid, text } = AdminLayout.chartTheme();
    const C = AdminLayout.chartBaseColors();
    const color = { 'userChart': C.indigo, 'eventChart': C.cyan, 'registrationChart': C.emerald, 'ticketChart': C.purple }[id];
    const ctx = el.getContext('2d');
    if (this.charts[id]) this.charts[id].destroy();
    this.charts[id] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: rows.map((r) => r._id),
        datasets: [{
          label,
          data: rows.map((r) => r.count),
          borderColor: color,
          backgroundColor: color + '22',
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}: ${c.parsed.y}` } }
        },
        scales: {
          x: { grid: { color: grid }, ticks: { color: text, maxTicksLimit: 8 } },
          y: { grid: { color: grid }, ticks: { color: text, precision: 0 } }
        }
      }
    });
  },

  renderCategories(categories) {
    const el = document.getElementById('categoryChart');
    if (!el) return;
    const { grid, text } = AdminLayout.chartTheme();
    const C = AdminLayout.chartBaseColors();
    const palette = Object.values(C);
    const ctx = el.getContext('2d');
    if (this.charts.categories) this.charts.categories.destroy();
    this.charts.categories = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: categories.map((c) => c._id),
        datasets: [{
          label: 'Events',
          data: categories.map((c) => c.count),
          backgroundColor: categories.map((_, i) => palette[i % palette.length] + 'bb'),
          borderRadius: 8,
          maxBarThickness: 34
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => ` ${c.parsed.x} events` } }
        },
        scales: {
          x: { grid: { color: grid }, ticks: { color: text, precision: 0 } },
          y: { grid: { display: false }, ticks: { color: text } }
        }
      }
    });
  },

  renderTopEvents(events) {
    const tbody = document.getElementById('topEventsTable');
    if (!tbody) return;
    if (!events.length) {
      tbody.innerHTML = `<tr><td colspan="4">${AdminLayout.emptyState({ icon: '🏆', title: 'No event data', desc: 'No registrations recorded yet.' })}</td></tr>`;
      return;
    }
    tbody.innerHTML = events.map((e) => `
      <tr>
        <td class="cell-main">${Utils.escapeHtml(e.title)}</td>
        <td>${Utils.escapeHtml(e.category || '—')}</td>
        <td>${e.registrations}</td>
        <td>${AdminLayout.money(e.revenue)}</td>
      </tr>
    `).join('');
  },

  renderTopOrganizers(orgs) {
    const tbody = document.getElementById('topOrganizersTable');
    if (!tbody) return;
    if (!orgs.length) {
      tbody.innerHTML = `<tr><td colspan="3">${AdminLayout.emptyState({ icon: '🏢', title: 'No organizer data', desc: 'No payments recorded yet.' })}</td></tr>`;
      return;
    }
    tbody.innerHTML = orgs.map((o) => `
      <tr>
        <td class="cell-main">${Utils.escapeHtml(o.name)}</td>
        <td>${o.sales}</td>
        <td>${AdminLayout.money(o.revenue)}</td>
      </tr>
    `).join('');
  }
};

document.addEventListener('DOMContentLoaded', () => AdminAnalytics.init());
window.AdminAnalytics = AdminAnalytics;