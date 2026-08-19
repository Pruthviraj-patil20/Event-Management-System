/**
 * EventSphere — Admin Layout Engine
 * Shared shell: auth guard, sidebar, topbar, global search,
 * toasts, modals, confirm dialogs, skeletons, badges & pagination.
 */

const AdminLayout = {
  SIDEBAR_KEY: 'eventsphere_admin_sidebar',

  ICONS: {
    dashboard: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
    users: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    organizers: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
    events: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>',
    approvals: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"/><path d="M20.4 12.4a2.5 2.5 0 0 0-1.6-1.4l-1.3-.3-.3-1.3a2.5 2.5 0 0 0-4.4-1.2L12 9l-1.4-1.2a2.5 2.5 0 0 0-4.4 1.2l-.3 1.3-1.3.3a2.5 2.5 0 0 0-1.6 1.4L3.5 12l-.4 1.4a2.5 2.5 0 0 0 1.2 2.6l1.2.7.2 1.3a2.5 2.5 0 0 0 4.4 1.2L12 17.8l1.4 1.1a2.5 2.5 0 0 0 4.4-1.2l.2-1.3 1.2-.7a2.5 2.5 0 0 0 1.2-2.6L20.4 12.4z"/></svg>',
    venues: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M9 7h1"/><path d="M14 7h1"/><path d="M9 11h1"/><path d="M14 11h1"/><path d="M9 15h1"/><path d="M14 15h1"/></svg>',
    tickets: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v3a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-3a3 3 0 0 1 0-6V6a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>',
    registrations: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>',
    payments: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>',
    reviews: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>',
    analytics: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>',
    reports: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/></svg>',
    notifications: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    settings: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    profile: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    logout: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>',
    search: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>',
    bell: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    sun: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/></svg>',
    moon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
    chevronLeft: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
    eye: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    plus: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>',
    star: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>',
    dot: '<svg viewBox="0 0 24 24" width="8" height="8" fill="currentColor"><circle cx="12" cy="12" r="6"/></svg>'
  },

  NAV: [
    {
      section: 'Overview',
      items: [{ key: 'dashboard', label: 'Dashboard', href: '/admin/admin-dashboard.html', icon: 'dashboard' }]
    },
    {
      section: 'Management',
      items: [
        { key: 'users', label: 'Users', href: '/admin/users.html', icon: 'users' },
        { key: 'organizers', label: 'Organizers', href: '/admin/organizers.html', icon: 'organizers' },
        { key: 'events', label: 'Events', href: '/admin/events.html', icon: 'events' },
        { key: 'event-approvals', label: 'Event Approvals', href: '/admin/event-approvals.html', icon: 'approvals', badge: 'approvals' },
        { key: 'venues', label: 'Venues', href: '/admin/venues.html', icon: 'venues' },
        { key: 'tickets', label: 'Tickets', href: '/admin/tickets.html', icon: 'tickets' },
        { key: 'registrations', label: 'Registrations', href: '/admin/registrations.html', icon: 'registrations' },
        { key: 'payments', label: 'Payments', href: '/admin/payments.html', icon: 'payments' },
        { key: 'reviews', label: 'Reviews', href: '/admin/reviews.html', icon: 'reviews' }
      ]
    },
    {
      section: 'Insights',
      items: [
        { key: 'analytics', label: 'Analytics', href: '/admin/analytics.html', icon: 'analytics' },
        { key: 'reports', label: 'Reports', href: '/admin/reports.html', icon: 'reports' }
      ]
    },
    {
      section: 'System',
      items: [
        { key: 'notifications', label: 'Notifications', href: '/admin/notifications.html', icon: 'notifications' },
        { key: 'settings', label: 'Settings', href: '/admin/settings.html', icon: 'settings' },
        { key: 'profile', label: 'Admin Profile', href: '/admin/profile.html', icon: 'profile' }
      ]
    }
  ],

  _user: null,
  _config: { page: '', title: '', subtitle: '', crumb: [] },
  _approvalsBadge: 0,

  /* -------------------------------------------------------------
     PUBLIC API
     ------------------------------------------------------------- */
  init(config = {}) {
    if (!Auth.requireAuth(['admin'])) return false;

    this._config = config;
    this._user = API.getCurrentUser();

    const app = document.querySelector('.admin-app');
    if (!app) {
      console.error('AdminLayout: missing .admin-app container');
      return false;
    }

    app.classList.add('sidebar-collapsed');

    const collapsed = localStorage.getItem(this.SIDEBAR_KEY) === 'collapsed';
    app.classList.toggle('sidebar-collapsed', collapsed);
    app.classList.remove('sidebar-collapsed');
    app.classList.toggle('sidebar-collapsed', collapsed);

    this.renderSidebar(app);
    this.renderTopbar(app);
    this.bindShellEvents(app);
    this.bindGlobalSearch();

    if (config.title) {
      const el = document.querySelector('[data-page-title]');
      if (el) el.textContent = config.title;
    }

    this.refreshNotifications();
    this.refreshApprovalsBadge();

    return true;
  },

  /* -------------------------------------------------------------
     AUTH / SESSION HELPERS
     ------------------------------------------------------------- */
  handleApiError(err, opts = {}) {
    const msg = (err && err.message) || 'Something went wrong';
    this.toast(msg, 'error');
    const isAuthIssue = /(session expired|invalid token|not authorized|log in|unauthorized|no longer exists)/i.test(msg);
    if (isAuthIssue && opts.redirect !== false) {
      setTimeout(() => { Auth.logout(); }, 900);
    }
  },

  /* -------------------------------------------------------------
     SIDEBAR
     ------------------------------------------------------------- */
  renderSidebar(app) {
    const mount = app.querySelector('[data-admin-sidebar]');
    if (!mount) return;

    const user = this._user || {};
    const page = this._config.page;

    const groups = this.NAV.map((group) => {
      const links = group.items
        .map((item) => {
          const badge = item.badge ? `<span class="admin-nav-badge" data-nav-badge="${item.badge}" style="display:none"></span>` : '';
          return `
            <a href="${item.href}" class="admin-nav-link ${page === item.key ? 'active' : ''}" data-nav="${item.key}" title="${item.label}">
              <span class="nav-icon">${this.ICONS[item.icon] || ''}</span>
              <span class="nav-label">${item.label}</span>
              ${badge}
            </a>
          `;
        })
        .join('');
      return `
        <div class="admin-nav-section-label">${group.section}</div>
        ${links}
      `;
    }).join('');

    mount.innerHTML = `
      <div class="admin-sidebar-brand">
        <a href="/admin/admin-dashboard.html" style="display:flex;align-items:center;gap:12px;text-decoration:none;min-width:0;">
          <div class="admin-brand-logo">✦</div>
          <div class="admin-brand-text">
            <strong>EventSphere</strong>
            <span>Admin Portal</span>
          </div>
        </a>
      </div>

      <nav class="admin-nav" aria-label="Admin navigation">
        ${groups}
      </nav>

      <div class="admin-sidebar-footer">
        <div class="admin-profile-card">
          <img class="admin-profile-avatar" src="${user.profileImage || ''}" alt="${Utils.escapeHtml(user.name || 'Admin')}">
          <div class="admin-profile-meta">
            <strong>${Utils.escapeHtml(user.name || 'Admin')}</strong>
            <span>${Utils.escapeHtml(user.role || 'admin')}</span>
          </div>
          <button class="admin-action-btn" data-admin-logout title="Logout" style="margin-left:auto;color:#F87171;" aria-label="Logout">${this.ICONS.logout}</button>
        </div>
      </div>
    `;
  },

  /* -------------------------------------------------------------
     TOPBAR
     ------------------------------------------------------------- */
  renderTopbar(app) {
    const mount = app.querySelector('[data-admin-topbar]');
    if (!mount) return;

    const user = this._user || {};
    const config = this._config;
    const crumb = (config.crumb || []).map((c, i) =>
      `<span class="crumb-sep">/</span><span class="crumb-current">${Utils.escapeHtml(c)}</span>`
    ).join('');

    mount.innerHTML = `
      <button class="admin-sidebar-toggle" data-sidebar-toggle aria-label="Toggle sidebar">${this.ICONS.menu}</button>

      <div class="admin-breadcrumb">
        <span>Admin</span>
        ${crumb || `<span class="crumb-sep">/</span><span class="crumb-current">${Utils.escapeHtml(config.title || 'Dashboard')}</span>`}
      </div>

      <div class="admin-topbar-actions">
        <div class="admin-topbar-search" data-search-wrap>
          <span class="search-icon">${this.ICONS.search}</span>
          <input type="text" data-global-search placeholder="Search anything..." aria-label="Global search" autocomplete="off">
          <div class="admin-search-results" data-search-results hidden></div>
        </div>

        <button class="admin-icon-btn theme-toggle-btn" data-admin-theme aria-label="Toggle theme">${this.ICONS.sun}</button>

        <button class="admin-icon-btn" data-admin-notifications aria-label="Notifications">
          ${this.ICONS.bell}
          <span class="admin-notif-dot" data-notif-badge style="display:none">0</span>
        </button>

        <div style="position:relative;">
          <button class="admin-avatar-btn" data-admin-avatar aria-label="Account menu">
            <img src="${user.profileImage || ''}" alt="${Utils.escapeHtml(user.name || 'Admin')}">
            <span class="chev">${this.ICONS.chevron}</span>
          </button>
          <div class="admin-topbar-dropdown" data-admin-dropdown hidden>
            <div class="admin-dropdown-header">
              <strong>${Utils.escapeHtml(user.name || 'Admin')}</strong>
              <span>${Utils.escapeHtml(user.email || '')}</span>
            </div>
            <a href="/admin/profile.html" class="admin-dropdown-item"><span class="dd-icon">${this.ICONS.profile}</span> View Profile</a>
            <a href="/admin/settings.html" class="admin-dropdown-item"><span class="dd-icon">${this.ICONS.settings}</span> Account Settings</a>
            <a href="/admin/notifications.html" class="admin-dropdown-item"><span class="dd-icon">${this.ICONS.notifications}</span> Activity Log</a>
            <div class="admin-dropdown-sep"></div>
            <button class="admin-dropdown-item danger" data-admin-logout><span class="dd-icon">${this.ICONS.logout}</span> Logout</button>
          </div>
        </div>
      </div>
    `;
  },

  bindShellEvents(app) {
    // Sidebar collapse toggle
    const toggle = app.querySelector('[data-sidebar-toggle]');
    toggle && toggle.addEventListener('click', () => {
      const collapsed = app.classList.toggle('sidebar-collapsed');
      localStorage.setItem(this.SIDEBAR_KEY, collapsed ? 'collapsed' : 'open');
    });

    // Logout
    app.querySelectorAll('[data-admin-logout]').forEach((btn) => {
      btn.addEventListener('click', () => this.confirm({
        title: 'Sign out?',
        message: 'You will be returned to the public site.',
        confirmText: 'Sign Out',
        danger: true,
        onConfirm: () => Auth.logout()
      }));
    });

    // Avatar dropdown
    const avatarBtn = app.querySelector('[data-admin-avatar]');
    const dropdown = app.querySelector('[data-admin-dropdown]');
    if (avatarBtn && dropdown) {
      avatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.hidden = !dropdown.hidden;
      });
      document.addEventListener('click', (e) => {
        if (!e.target.closest('[data-admin-avatar]')) dropdown.hidden = true;
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') dropdown.hidden = true;
      });
    }

    // Notifications bell → page
    const bell = app.querySelector('[data-admin-notifications]');
    bell && bell.addEventListener('click', () => {
      window.location.href = '/admin/notifications.html';
    });

    // Theme toggle (admin-specific icon swap)
    const themeBtn = app.querySelector('[data-admin-theme]');
    if (themeBtn) {
      const sync = () => {
        const theme = document.documentElement.getAttribute('data-theme') || 'light';
        themeBtn.innerHTML = theme === 'dark' ? this.ICONS.sun : this.ICONS.moon;
      };
      sync();
      themeBtn.addEventListener('click', () => {
        const theme = (document.documentElement.getAttribute('data-theme') || 'light') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('eventsphere_theme', theme);
        sync();
        this.refreshCharts();
      });
    }

    // Keyboard: "/" focuses search
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const input = app.querySelector('[data-global-search]');
        if (input) input.focus();
      }
    });
  },

  /* -------------------------------------------------------------
     GLOBAL SEARCH (debounced, grouped results)
     ------------------------------------------------------------- */
  bindGlobalSearch() {
    const wrap = document.querySelector('[data-search-wrap]');
    if (!wrap) return;
    const input = wrap.querySelector('[data-global-search]');
    const results = wrap.querySelector('[data-search-results]');

    input.addEventListener('input', Utils.debounce(async () => {
      const q = input.value.trim();
      if (q.length < 2) {
        results.hidden = true;
        return;
      }
      try {
        const data = await API.get('/admin/search', { q });
        results.innerHTML = this.renderSearchResults(data);
        results.hidden = false;
      } catch (err) {
        results.innerHTML = `<div class="sr-item" style="color:var(--text-muted)">Search failed: ${Utils.escapeHtml(err.message)}</div>`;
        results.hidden = false;
      }
    }, 250));

    input.addEventListener('focus', () => {
      if (input.value.trim().length >= 2) results.hidden = false;
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('[data-search-wrap]')) results.hidden = true;
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') results.hidden = true;
    });
  },

  renderSearchResults(data) {
    const esc = Utils.escapeHtml;
    const sections = [];
    const userHref = (u) => `/admin/users.html?search=${encodeURIComponent(u.email)}`;
    const eventHref = (ev) => `/admin/events.html?search=${encodeURIComponent(ev.title)}`;
    const venueHref = (v) => `/admin/venues.html?search=${encodeURIComponent(v.name)}`;

    if (data.users && data.users.length) {
      sections.push(`
        <div class="sr-section">Users</div>
        ${data.users.map((u) => `
          <a class="sr-item" href="${userHref(u)}">
            <img src="${u.profileImage || ''}" alt="">
            <div><div class="sr-title">${esc(u.name)}</div><div class="sr-sub">${esc(u.email)} · ${esc(u.role)}</div></div>
          </a>`).join('')}
      `);
    }
    if (data.events && data.events.length) {
      sections.push(`
        <div class="sr-section">Events</div>
        ${data.events.map((ev) => `
          <a class="sr-item" href="${eventHref(ev)}">
            <img src="${ev.image || ''}" alt="">
            <div><div class="sr-title">${esc(ev.title)}</div><div class="sr-sub">${esc(ev.category)} · ${esc(ev.status)}</div></div>
          </a>`).join('')}
      `);
    }
    if (data.venues && data.venues.length) {
      sections.push(`
        <div class="sr-section">Venues</div>
        ${data.venues.map((v) => `
          <a class="sr-item" href="${venueHref(v)}">
            <img src="${v.image || ''}" alt="">
            <div><div class="sr-title">${esc(v.name)}</div><div class="sr-sub">${esc(v.city)} · Cap ${v.capacity || 0}</div></div>
          </a>`).join('')}
      `);
    }
    if (!sections.length) {
      return `<div class="sr-section">No results for your search</div>`;
    }
    return sections.join('');
  },

  /* -------------------------------------------------------------
     NOTIFICATION & APPROVAL BADGES
     ------------------------------------------------------------- */
  async refreshNotifications() {
    try {
      const data = await API.get('/admin/notifications', { limit: 1 });
      const badge = document.querySelector('[data-notif-badge]');
      if (badge) {
        badge.textContent = data.unread || 0;
        badge.style.display = data.unread > 0 ? 'grid' : 'none';
      }
    } catch (err) {
      /* silent */
    }
  },

  async refreshApprovalsBadge() {
    try {
      const data = await API.get('/admin/dashboard');
      const count = data.stats && data.stats.pendingApprovals ? data.stats.pendingApprovals : 0;
      this._approvalsBadge = count;
      const badge = document.querySelector('[data-nav-badge="approvals"]');
      if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'grid' : 'none';
      }
    } catch (err) {
      /* silent */
    }
  },

  /* -------------------------------------------------------------
     TOASTS
     ------------------------------------------------------------- */
  toast(message, type = 'info', title = '') {
    let container = document.querySelector('.admin-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'admin-toast-container';
      document.body.appendChild(container);
    }
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const titles = { success: title || 'Success', error: title || 'Error', warning: title || 'Notice', info: title || 'Information' };

    const toast = document.createElement('div');
    toast.className = `admin-toast ${type}`;
    toast.setAttribute('role', 'status');
    toast.innerHTML = `
      <div class="admin-toast-icon">${icons[type] || 'ℹ️'}</div>
      <div class="admin-toast-body">
        <div class="admin-toast-title">${Utils.escapeHtml(titles[type])}</div>
        <div class="admin-toast-msg">${Utils.escapeHtml(message)}</div>
      </div>
      <button class="admin-toast-close" aria-label="Dismiss">✕</button>
    `;
    toast.querySelector('.admin-toast-close').addEventListener('click', () => toast.remove());
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 350);
    }, 4500);
  },

  /* -------------------------------------------------------------
     MODAL SYSTEM (dynamic)
     ------------------------------------------------------------- */
  openModal({ title = '', subtitle = '', size = '', body = '', footer = '', onOpen } = {}) {
    this.closeModal();

    const overlay = document.createElement('div');
    overlay.className = 'admin-modal-overlay show';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', title);
    overlay.innerHTML = `
      <div class="admin-modal ${size}">
        ${title ? `
          <div class="admin-modal-header">
            <div>
              <h3 class="admin-modal-title">${title}</h3>
              ${subtitle ? `<div class="admin-modal-subtitle">${subtitle}</div>` : ''}
            </div>
            <button class="admin-modal-close" data-modal-close aria-label="Close">✕</button>
          </div>` : ''}
        ${body ? `<div class="admin-modal-body">${body}</div>` : ''}
        ${footer ? `<div class="admin-modal-footer">${footer}</div>` : ''}
      </div>
    `;
    document.body.appendChild(overlay);

    const close = () => {
      overlay.classList.remove('show');
      setTimeout(() => overlay.remove(), 200);
      document.removeEventListener('keydown', escHandler);
    };
    const escHandler = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', escHandler);
    overlay.querySelectorAll('[data-modal-close]').forEach((b) => b.addEventListener('click', close));
    overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) close(); });

    if (typeof onOpen === 'function') onOpen(overlay, close);
    return { overlay, close };
  },

  closeModal() {
    document.querySelectorAll('.admin-modal-overlay').forEach((o) => {
      o.classList.remove('show');
      setTimeout(() => o.remove(), 200);
    });
  },

  confirm({ title = 'Are you sure?', message = '', confirmText = 'Confirm', cancelText = 'Cancel', danger = false, onConfirm } = {}) {
    const { close } = this.openModal({
      title,
      size: 'sm',
      body: `
        <div class="admin-confirm-icon ${danger ? 'danger' : 'warning'}">${danger ? '⚠️' : '❓'}</div>
        <p class="admin-confirm-text">${message}</p>
      `,
      footer: `
        <button class="admin-btn admin-btn-secondary" data-confirm-cancel>${cancelText}</button>
        <button class="admin-btn ${danger ? 'admin-btn-danger' : 'admin-btn-primary'}" data-confirm-ok>${confirmText}</button>
      `
    });
    const modal = close.overlay;
    modal.querySelector('[data-confirm-cancel]').addEventListener('click', close.close);
    modal.querySelector('[data-confirm-ok]').addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      const original = btn.textContent;
      btn.disabled = true;
      btn.innerHTML = `${this.spinnerHtml()} Working...`;
      if (typeof onConfirm === 'function') {
        await onConfirm();
      }
      btn.disabled = false;
      btn.textContent = original;
      close.close();
    });
  },

  /* -------------------------------------------------------------
     STATUS / FORMAT HELPERS
     ------------------------------------------------------------- */
  statusBadge(status) {
    const map = {
      published: ['green', 'Published'],
      pending: ['amber', 'Pending'],
      draft: ['gray', 'Draft'],
      rejected: ['red', 'Rejected'],
      cancelled: ['gray', 'Cancelled'],
      completed: ['blue', 'Completed'],
      active: ['green', 'Active'],
      suspended: ['red', 'Suspended'],
      unverified: ['amber', 'Unverified'],
      confirmed: ['green', 'Confirmed'],
      used: ['blue', 'Used'],
      refunded: ['gray', 'Refunded'],
      failed: ['red', 'Failed'],
      success: ['green', 'Success'],
      hidden: ['gray', 'Hidden']
    };
    const [tone, label] = map[status] || ['gray', status || 'N/A'];
    return `<span class="admin-badge admin-badge-${tone}">${label}</span>`;
  },

  roleBadge(role) {
    const map = {
      admin: 'indigo',
      organizer: 'amber',
      attendee: 'blue'
    };
    const tone = map[role] || 'gray';
    const label = role ? role[0].toUpperCase() + role.slice(1) : 'N/A';
    return `<span class="admin-badge admin-badge-${tone}">${label}</span>`;
  },

  stars(rating) {
    const r = Number(rating) || 0;
    const full = '★'.repeat(Math.round(r));
    const empty = '☆'.repeat(5 - Math.round(r));
    return `<span class="admin-stars">${full}${empty}</span> <span class="admin-text-muted" style="font-size:12px;">${r.toFixed(1)}</span>`;
  },

  money(amount) {
    return Utils.formatCurrency(amount);
  },

  timeAgo(date) {
    if (!date) return '';
    const d = new Date(date);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return Utils.formatDate(date, 'short');
  },

  paginationHtml(totalPages, currentPage, onChange) {
    this._paginationOnChange = onChange;
    if (totalPages <= 1) return '';
    const btns = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
        btns.push(`<button class="admin-page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`);
      } else if (btns[btns.length - 1] !== '…') {
        btns.push('…');
      }
    }
    const html = `
      <button class="admin-page-btn" data-page="${currentPage - 1}" ${currentPage <= 1 ? 'disabled' : ''}>‹</button>
      ${btns.join('')}
      <button class="admin-page-btn" data-page="${currentPage + 1}" ${currentPage >= totalPages ? 'disabled' : ''}>›</button>
    `;
    return html;
  },

  bindPagination(container, onChange) {
    if (!container) return;
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-page]');
      if (!btn || btn.disabled) return;
      const page = parseInt(btn.dataset.page, 10);
      const handler = onChange || this._paginationOnChange;
      if (typeof handler === 'function') handler(page);
    });
  },

  /* -------------------------------------------------------------
     SKELETON / EMPTY / ERROR STATES
     ------------------------------------------------------------- */
  skeletonRows(colspan, rows = 5) {
    let html = '';
    for (let i = 0; i < rows; i++) {
      html += `<tr><td colspan="${colspan}"><div class="admin-skeleton admin-skeleton-row"></div></td></tr>`;
    }
    return html;
  },

  skeletonCards(count = 4) {
    return Array.from({ length: count }).map(() =>
      `<div class="admin-skeleton admin-skeleton-card"></div>`).join('');
  },

  emptyState({ icon = '🗂️', title = 'Nothing here', desc = 'No records found.', action = '' } = {}) {
    return `
      <div class="admin-empty">
        <div class="admin-empty-icon">${icon}</div>
        <div class="admin-empty-title">${Utils.escapeHtml(title)}</div>
        <div class="admin-empty-desc">${Utils.escapeHtml(desc)}</div>
        ${action}
      </div>
    `;
  },

  errorState({ code = '500', title = 'Something went wrong', desc = 'Please try again.', action = '' } = {}) {
    return `
      <div class="admin-error-state">
        <div class="code">${code}</div>
        <div class="admin-empty-title">${Utils.escapeHtml(title)}</div>
        <div class="admin-empty-desc">${Utils.escapeHtml(desc)}</div>
        ${action}
      </div>
    `;
  },

  spinnerHtml(size = 18) {
    return `<span class="admin-spinner" style="width:${size}px;height:${size}px;"></span>`;
  },

  setBtnLoading(btn, loading, label) {
    if (!btn) return;
    if (loading) {
      btn.dataset.label = btn.textContent;
      btn.disabled = true;
      btn.innerHTML = `${this.spinnerHtml(14)} ${label || 'Working...'}`;
    } else {
      btn.disabled = false;
      btn.innerHTML = btn.dataset.label || 'Save';
    }
  },

  /* -------------------------------------------------------------
     CSV EXPORT
     ------------------------------------------------------------- */
  exportCSV(filename, headers, rows) {
    const esc = (v) => `"${String(v === undefined || v === null ? '' : v).replace(/"/g, '""')}"`;
    const csv = [headers.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /* -------------------------------------------------------------
     CHART HELPERS
     ------------------------------------------------------------- */
  chartTheme() {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    const grid = getComputedStyle(document.documentElement).getPropertyValue('--border-subtle').trim() || 'rgba(148,163,184,0.2)';
    const text = theme === 'dark' ? '#94A3B8' : '#64748B';
    return { theme, grid, text };
  },

  chartBaseColors() {
    return {
      indigo: '#6366F1',
      purple: '#8B5CF6',
      emerald: '#10B981',
      amber: '#F59E0B',
      rose: '#EF4444',
      cyan: '#06B6D4',
      pink: '#EC4899',
      blue: '#3B82F6',
      slate: '#64748B'
    };
  },

  refreshCharts() {
    document.dispatchEvent(new CustomEvent('admin:themechange'));
  }
};

window.AdminLayout = AdminLayout;
