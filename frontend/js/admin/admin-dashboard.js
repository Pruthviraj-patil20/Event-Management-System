/**
 * EventSphere — Admin Dashboard
 */

const AdminDashboard = {
  charts: {},
  currentPeriod: '30d',
  data: null,

  init() {
    if (!AdminLayout.init({ page: 'dashboard', title: 'Dashboard', crumb: ['Dashboard'] })) return;
    this.setGreeting();
    this.load();
    document.addEventListener('admin:themechange', () => this.renderCharts());
  },

  setGreeting() {
    const h = new Date().getHours();
    const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    const name = (API.getCurrentUser()?.name || 'Admin').split(' ')[0];
    const el = document.querySelector('[data-greeting]');
    if (el) el.textContent = `${greet}, ${name} 👋`;
    const dateEl = document.querySelector('[data-greet-date]');
    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
      });
    }
  },

  async load() {
    try {
      const data = await API.get('/admin/dashboard');
      this.data = data;
      this.renderStats(data.stats);
      this.renderRecentEvents(data.recentEvents || []);
      this.renderRecentUsers(data.recentUsers || []);
      this.renderPendingApprovals(data.pendingEvents || []);
      this.renderActivity(data.recentActivity || []);
      this.renderAttention(data.stats);
      this.renderCharts(data);
      this.bindPeriods();
    } catch (err) {
      AdminLayout.handleApiError(err);
      document.querySelector('#statGrid').innerHTML =
        AdminLayout.errorState({ code: '500', title: 'Dashboard unavailable', desc: err.message });
    }
  },

  async renderCharts(data = null) {
    if (!data) data = this.data;
    if (!data) return;

    try {
      const analytics = await API.get('/admin/analytics', { period: this.currentPeriod });
      this.renderRevenueChart(analytics, data.stats);
      this.renderRegistrationChart(data.registrationTrend);
      this.renderEventStatusChart(data.eventStatus);
    } catch (err) {
      AdminLayout.toast(`Charts failed to load: ${err.message}`, 'error');
    }
  },

  renderRevenueChart(analytics, stats) {
    const el = document.getElementById('revenueChart');
    if (!el) return;
    const { theme, grid, text } = AdminLayout.chartTheme();
    const C = AdminLayout.chartBaseColors();
    const labels = (analytics.revenue || []).map((r) => r._id);

    const revTotal = (analytics.revenue || []).reduce((s, r) => s + r.revenue, 0);
    const revAvg = (analytics.revenue || []).length
      ? revTotal / analytics.revenue.length
      : 0;
    const growth = (stats && stats.growth && stats.growth.revenue) || 0;

    document.getElementById('revTotal').textContent = AdminLayout.money(revTotal);
    document.getElementById('revAvg').textContent = AdminLayout.money(revAvg);
    const growthEl = document.getElementById('revGrowth');
    growthEl.textContent = `${growth >= 0 ? '+' : ''}${growth}%`;
    growthEl.style.color = growth >= 0 ? 'var(--color-success)' : 'var(--color-error)';

    const ctx = el.getContext('2d');
    if (this.charts.revenue) this.charts.revenue.destroy();
    this.charts.revenue = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Revenue',
            data: (analytics.revenue || []).map((r) => r.revenue),
            borderColor: C.indigo,
            backgroundColor: (ctx2) => {
              const g = ctx2.chart.ctx.createLinearGradient(0, 0, 0, 260);
              g.addColorStop(0, 'rgba(99,102,241,0.22)');
              g.addColorStop(1, 'rgba(99,102,241,0)');
              return g;
            },
            fill: true,
            tension: 0.4,
            borderWidth: 2.5,
            pointRadius: 3,
            pointHoverRadius: 5
          },
          {
            label: 'Ticket Sales',
            data: (analytics.tickets || []).map((t) => t.count),
            borderColor: C.cyan,
            backgroundColor: 'transparent',
            borderDash: [5, 4],
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            yAxisID: 'y2'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { labels: { color: text, usePointStyle: true, boxWidth: 8 } },
          tooltip: {
            callbacks: {
              label: (c) => {
                const v = c.datasetIndex === 0 ? AdminLayout.money(c.parsed.y) : `${c.parsed.y} tickets`;
                return ` ${c.dataset.label}: ${v}`;
              }
            }
          }
        },
        scales: {
          x: { grid: { color: grid }, ticks: { color: text, maxTicksLimit: 8 } },
          y: { grid: { color: grid }, ticks: { color: text, callback: (v) => AdminLayout.money(v) } },
          y2: {
            position: 'right', grid: { drawOnChartArea: false }, ticks: { color: text }
          }
        }
      }
    });
  },

  renderRegistrationChart(trend) {
    const el = document.getElementById('registrationChart');
    if (!el) return;
    const { grid, text } = AdminLayout.chartTheme();
    const C = AdminLayout.chartBaseColors();
    const ctx = el.getContext('2d');
    if (this.charts.registration) this.charts.registration.destroy();
    this.charts.registration = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: (trend.labels || []),
        datasets: [{
          label: 'Registrations',
          data: (trend.values || []),
          backgroundColor: 'rgba(16,185,129,0.7)',
          hoverBackgroundColor: C.emerald,
          borderRadius: 6,
          maxBarThickness: 28
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => ` ${c.parsed.y} registrations` } }
        },
        scales: {
          x: { grid: { color: grid }, ticks: { color: text, maxTicksLimit: 6 } },
          y: { grid: { color: grid }, ticks: { color: text, precision: 0 } }
        }
      }
    });
  },

  renderEventStatusChart(dist) {
    const el = document.getElementById('eventStatusChart');
    if (!el) return;
    const { text } = AdminLayout.chartTheme();
    const C = AdminLayout.chartBaseColors();
    const colors = { published: C.emerald, pending: C.amber, draft: C.slate, cancelled: C.rose, completed: C.indigo };
    const ctx = el.getContext('2d');
    if (this.charts.eventStatus) this.charts.eventStatus.destroy();
    this.charts.eventStatus = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: (dist.labels || []),
        datasets: [{
          data: (dist.values || []),
          backgroundColor: (dist.labels || []).map((l) => colors[l] || C.slate),
          borderWidth: 2,
          borderColor: 'transparent',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: { position: 'bottom', labels: { color: text, usePointStyle: true, boxWidth: 8, padding: 14 } },
          tooltip: { callbacks: { label: (c) => ` ${c.label}: ${c.parsed}` } }
        }
      }
    });
  },

  renderStats(s) {
    const esc = Utils.escapeHtml;
    const g = s.growth || {};
    const delta = (val) => {
      const v = Number(val) || 0;
      const cls = v > 0 ? 'up' : v < 0 ? 'down' : 'flat';
      const arrow = v > 0 ? '▲' : v < 0 ? '▼' : '◆';
      return `<span class="admin-stat-delta ${cls}">${arrow} ${Math.abs(v)}% <span style="font-weight:400;opacity:.7;margin-left:2px;">vs 30d</span></span>`;
    };

    const cards = [
      { icon: '👥', tone: 'indigo', label: 'Total Users', value: s.totalUsers, delta: delta(g.users) },
      { icon: '🏢', tone: 'purple', label: 'Organizers', value: s.totalOrganizers, delta: delta(g.organizers) },
      { icon: '📅', tone: 'cyan', label: 'Total Events', value: s.totalEvents, sub: `${s.publishedEvents} published · ${s.pendingEvents} pending` },
      { icon: '💰', tone: 'emerald', label: 'Total Revenue', value: AdminLayout.money(s.totalRevenue), delta: delta(g.revenue) },
      { icon: '🎟️', tone: 'amber', label: 'Tickets Sold', value: s.totalTickets, delta: delta(g.tickets) },
      { icon: '📝', tone: 'pink', label: 'Registrations', value: s.totalRegistrations, delta: delta(g.registrations) },
      { icon: '⚡', tone: 'blue', label: 'Active Events', value: s.activeEvents, sub: 'Live & upcoming' },
      { icon: '⏳', tone: 'rose', label: 'Pending Approvals', value: s.pendingApprovals, sub: s.failedPayments ? `${s.failedPayments} failed payments` : 'Queue healthy' }
    ];

    document.getElementById('statGrid').innerHTML = cards.map((c) => `
      <div class="admin-stat-card">
        <div class="admin-stat-icon tone-${c.tone}">${c.icon}</div>
        <div class="admin-stat-body">
          <div class="admin-stat-label">${c.label}</div>
          <div class="admin-stat-value">${c.value}</div>
          ${c.delta || (c.sub ? `<div class="admin-text-muted" style="font-size:var(--font-size-xs);margin-top:6px;">${esc(c.sub)}</div>` : '')}
        </div>
      </div>
    `).join('');
  },

  renderRecentEvents(events) {
    const tbody = document.getElementById('recentEventsTable');
    if (!tbody) return;
    if (!events.length) {
      tbody.innerHTML = `<tr><td colspan="6">${AdminLayout.emptyState({ icon: '📅', title: 'No events found', desc: 'No events have been created yet.' })}</td></tr>`;
      return;
    }
    tbody.innerHTML = events.map((e) => `
      <tr>
        <td>
          <div class="admin-user-cell">
            <img class="admin-event-thumb" src="${e.image || ''}" alt="">
            <div class="meta">
              <strong>${Utils.escapeHtml(e.title)}</strong>
              <span>${Utils.escapeHtml(e.category || '')}${e.featured ? ' · ⭐ Featured' : ''}</span>
            </div>
          </div>
        </td>
        <td>${Utils.escapeHtml(e.organizer?.name || '—')}</td>
        <td>${Utils.formatDate(e.date)}</td>
        <td>${e.capacity - (e.availableSeats ?? e.capacity)} / ${e.capacity}</td>
        <td>${AdminLayout.statusBadge(e.status)}</td>
        <td style="text-align:right;">
          <div class="admin-row-actions" style="justify-content:flex-end;">
            <a class="admin-action-btn indigo" href="/event-details.html?id=${e._id}" title="View">${AdminLayout.ICONS.eye}</a>
            <button class="admin-action-btn amber" data-feature="${e._id}" data-featured="${e.featured ? '1' : ''}" title="Toggle Featured">${AdminLayout.ICONS.star}</button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-feature]').forEach((btn) => {
      btn.addEventListener('click', () => this.toggleFeatured(btn.dataset.feature, btn.dataset.featured === '1'));
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

  renderRecentUsers(users) {
    const tbody = document.getElementById('recentUsersTable');
    if (!tbody) return;
    if (!users.length) {
      tbody.innerHTML = `<tr><td colspan="5">${AdminLayout.emptyState({ icon: '👥', title: 'No users found', desc: 'No accounts exist yet.' })}</td></tr>`;
      return;
    }
    tbody.innerHTML = users.map((u) => `
      <tr class="${u.isActive ? '' : 'admin-row-suspended'}">
        <td>
          <div class="admin-user-cell">
            <img class="admin-avatar" src="${u.profileImage || ''}" alt="">
            <div class="meta">
              <strong>${Utils.escapeHtml(u.name)}</strong>
              <span>${Utils.escapeHtml(u.email)}</span>
            </div>
          </div>
        </td>
        <td>${AdminLayout.roleBadge(u.role)}</td>
        <td>${AdminLayout.timeAgo(u.createdAt)}</td>
        <td>${u.isActive ? AdminLayout.statusBadge('active') : AdminLayout.statusBadge('suspended')}</td>
        <td style="text-align:right;">
          <div class="admin-row-actions" style="justify-content:flex-end;">
            <a class="admin-action-btn indigo" href="/admin/users.html?view=${u._id}" title="View">${AdminLayout.ICONS.eye}</a>
          </div>
        </td>
      </tr>
    `).join('');
  },

  renderPendingApprovals(events) {
    const el = document.getElementById('pendingApprovalsList');
    if (!el) return;
    if (!events.length) {
      el.innerHTML = `<div class="admin-card-body">${AdminLayout.emptyState({ icon: '🎉', title: 'All caught up', desc: 'No events are waiting for review.' })}</div>`;
      return;
    }
    el.innerHTML = events.map((e) => `
      <div class="admin-approval-item">
        <img class="admin-event-thumb" src="${e.image || ''}" alt="">
        <div class="grow">
          <div class="cell-main">${Utils.escapeHtml(e.title)}</div>
          <div class="cell-sub">${Utils.escapeHtml(e.organizer?.name || '')} · ${Utils.formatDate(e.date, 'short')}</div>
        </div>
        <div class="admin-approval-actions">
          <a class="admin-btn admin-btn-secondary admin-btn-sm" href="/admin/event-approvals.html">Review</a>
        </div>
      </div>
    `).join('');
  },

  renderActivity(activities) {
    const el = document.getElementById('activityTimeline');
    if (!el) return;
    if (!activities.length) {
      el.innerHTML = `<div class="admin-text-muted" style="font-size:var(--font-size-sm);">No admin activity recorded yet.</div>`;
      return;
    }
    el.innerHTML = activities.map((a) => {
      const tone = a.action.includes('REJECT') || a.action.includes('DELETE') || a.action.includes('SUSPEND') ? 'red'
        : a.action.includes('APPROVE') || a.action.includes('ACTIVATE') || a.action.includes('VERIFY') ? 'green'
        : 'amber';
      return `
        <div class="admin-timeline-item">
          <span class="admin-timeline-dot ${tone}"></span>
          <div class="tl-title">${Utils.escapeHtml((a.action || 'ACTION').replace(/_/g, ' ').toLowerCase())}</div>
          <div class="tl-desc">${Utils.escapeHtml(a.details || a.targetLabel || '')}</div>
          <div class="tl-time">${AdminLayout.timeAgo(a.createdAt)}</div>
        </div>
      `;
    }).join('');
  },

  renderAttention(stats) {
    const el = document.getElementById('attentionList');
    if (!el) return;
    const items = [];
    if (stats.pendingApprovals > 0) {
      items.push({ icon: '⏳', tone: 'amber', text: `<strong>${stats.pendingApprovals}</strong> events pending approval`, href: '/admin/event-approvals.html' });
    }
    if (stats.failedPayments > 0) {
      items.push({ icon: '💳', tone: 'red', text: `<strong>${stats.failedPayments}</strong> failed payments to investigate`, href: '/admin/payments.html?status=failed' });
    }
    if (stats.hiddenReviews > 0) {
      items.push({ icon: '⭐', tone: 'blue', text: `<strong>${stats.hiddenReviews}</strong> hidden reviews awaiting decision`, href: '/admin/reviews.html?status=hidden' });
    }
    if (!items.length) {
      el.innerHTML = `<div class="admin-text-muted" style="font-size:var(--font-size-sm);">Everything looks healthy. Nothing needs attention. ✅</div>`;
      return;
    }
    el.innerHTML = items.map((i) => `
      <a href="${i.href}" class="admin-list-item" style="text-decoration:none;border-radius:var(--radius-md);border:1px solid var(--border-subtle);">
        <span class="admin-stat-icon tone-${i.tone}" style="width:38px;height:38px;font-size:16px;">${i.icon}</span>
        <span class="grow cell-main" style="flex:1;min-width:0;">${i.text}</span>
      </a>
    `).join('');
  },

  bindPeriods() {
    document.querySelectorAll('[data-period]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-period]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentPeriod = btn.dataset.period;
        this.renderCharts();
      });
    });
  }
};

document.addEventListener('DOMContentLoaded', () => AdminDashboard.init());
window.AdminDashboard = AdminDashboard;
