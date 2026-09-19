/**
 * EventSphere — Modular UI Components Generator
 */

const Components = {
  // Render Dynamic Navigation Bar
  renderNavbar(activePage = '') {
    const user = API.getCurrentUser();
    const navEl = document.getElementById('navbar');
    if (!navEl) return;

    let authSectionHtml = '';

    if (user) {
      const isOrganizer = user.role === 'organizer';
      const isAdmin = user.role === 'admin';
      const dashboardLink = isAdmin 
        ? '/admin/admin-dashboard.html' 
        : isOrganizer 
          ? '/dashboard/dashboard.html' 
          : '/dashboard/tickets.html';

      const dashboardLabel = isAdmin ? 'Admin Panel' : isOrganizer ? 'Organizer Portal' : 'My Tickets';

      authSectionHtml = `
        <div class="user-menu-wrap">
          <button class="user-profile-btn" id="userMenuBtn" aria-label="User Profile Menu">
            <img src="${user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}" alt="${Utils.escapeHtml(user.name)}" class="user-avatar">
            <span style="font-size: 0.875rem; font-weight: 600; padding: 0 4px;">${Utils.escapeHtml(user.name.split(' ')[0])}</span>
            <span style="font-size: 0.75rem; opacity: 0.7;">▼</span>
          </button>
          <div class="user-menu-dropdown" id="userDropdown">
            <div class="dropdown-header">
              <div class="dropdown-user-name">${Utils.escapeHtml(user.name)}</div>
              <div class="dropdown-user-email">${Utils.escapeHtml(user.email)}</div>
              <span class="badge ${isAdmin ? 'badge-danger' : isOrganizer ? 'badge-warning' : 'badge-primary'}" style="margin-top: 4px;">
                ${user.role.toUpperCase()}
              </span>
            </div>
            <a href="${dashboardLink}" class="dropdown-item">📊 ${dashboardLabel}</a>
            ${isOrganizer ? '<a href="/dashboard/create-event.html" class="dropdown-item">➕ Create Event</a>' : ''}
            <a href="/dashboard/notifications.html" class="dropdown-item">🔔 Notifications</a>
            <a href="/dashboard/settings.html" class="dropdown-item">⚙️ Profile Settings</a>
            <a href="javascript:void(0)" onclick="if (typeof AvatarModal !== 'undefined') { AvatarModal.open(); } else { window.location.href='/dashboard/settings.html'; }" class="dropdown-item">✨ Change Avatar</a>
            <div class="dropdown-divider"></div>
            <a href="javascript:void(0)" onclick="Auth.logout()" class="dropdown-item" style="color: var(--color-error);">🚪 Sign Out</a>
          </div>
        </div>
      `;
    } else {
      authSectionHtml = `
        <a href="/auth/login.html" class="btn btn-ghost btn-sm">Sign In</a>
        <a href="/auth/register.html" class="btn btn-primary btn-sm">Get Started</a>
      `;
    }

    navEl.innerHTML = `
      <div class="container nav-container">
        <a href="/index.html" class="brand-logo">
          <div class="logo-symbol">✦</div>
          <span class="brand-name">EventSphere</span>
        </a>

        <div class="nav-menu">
          <a href="/index.html" class="nav-link ${activePage === 'home' ? 'active' : ''}">Home</a>
          <a href="/events.html" class="nav-link ${activePage === 'events' ? 'active' : ''}">Explore Events</a>
          <a href="/about.html" class="nav-link ${activePage === 'about' ? 'active' : ''}">About</a>
          <a href="/contact.html" class="nav-link ${activePage === 'contact' ? 'active' : ''}">Contact</a>
          <a href="/events.html?format=Online" class="nav-link" style="color: #ef4444; font-weight: bold;">LIVE Events 🔴</a>
        </div>

        <div class="nav-actions">
          <a href="#" onclick="window.requestLiveLocation(event)" class="nav-link" style="font-weight: 600; font-size: 1.5rem; line-height: 1;" aria-label="Location">📍</a>
          <button class="theme-toggle-btn" aria-label="Toggle Theme">🌙</button>
          ${authSectionHtml}
          <button class="mobile-nav-toggle" id="mobileMenuBtn" aria-label="Open Mobile Menu">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>
        </div>
      </div>

      <!-- Mobile Drawer -->
      <div class="mobile-drawer" id="mobileDrawer">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <div class="brand-logo">
              <div class="logo-symbol">✦</div>
              <span class="brand-name">EventSphere</span>
            </div>
            <button id="closeDrawerBtn" style="font-size: 1.5rem; color: var(--text-muted);">&times;</button>
          </div>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <a href="/index.html" class="nav-link ${activePage === 'home' ? 'active' : ''}">Home</a>
            <a href="/events.html" class="nav-link ${activePage === 'events' ? 'active' : ''}">Explore Events</a>
            <a href="/about.html" class="nav-link ${activePage === 'about' ? 'active' : ''}">About</a>
            <a href="/contact.html" class="nav-link ${activePage === 'contact' ? 'active' : ''}">Contact</a>
            <a href="/events.html?format=Online" class="nav-link" style="color: #ef4444; font-weight: bold;">LIVE Events 🔴</a>
            <a href="#" onclick="window.requestLiveLocation(event)" class="nav-link" style="font-weight: 600; font-size: 1.5rem; line-height: 1;" aria-label="Location">📍</a>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle);">
          ${user 
            ? `<a href="${user.role === 'admin' ? '/admin/admin-dashboard.html' : '/dashboard/dashboard.html'}" class="btn btn-primary btn-full">Go to Dashboard</a>
               <button onclick="Auth.logout()" class="btn btn-secondary btn-full" style="color: var(--color-error);">Sign Out</button>`
            : `<a href="/auth/login.html" class="btn btn-secondary btn-full">Sign In</a>
               <a href="/auth/register.html" class="btn btn-primary btn-full">Get Started</a>`
          }
        </div>
      </div>
      <div class="drawer-overlay" id="drawerOverlay"></div>
    `;

    // Bind dropdown & drawer events
    const menuBtn = document.getElementById('userMenuBtn');
    const dropdown = document.getElementById('userDropdown');
    if (menuBtn && dropdown) {
      menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
      });
      document.addEventListener('click', () => dropdown.classList.remove('active'));
    }

    const mobileBtn = document.getElementById('mobileMenuBtn');
    const drawer = document.getElementById('mobileDrawer');
    const overlay = document.getElementById('drawerOverlay');
    const closeBtn = document.getElementById('closeDrawerBtn');

    if (mobileBtn && drawer && overlay) {
      mobileBtn.addEventListener('click', () => {
        drawer.classList.add('open');
        overlay.classList.add('active');
      });
      const close = () => {
        drawer.classList.remove('open');
        overlay.classList.remove('active');
      };
      if (closeBtn) closeBtn.addEventListener('click', close);
      overlay.addEventListener('click', close);
    }

    // Refresh theme toggle icons
    if (window.ThemeManager) {
      ThemeManager.updateToggleIcons(document.documentElement.getAttribute('data-theme') || 'light');
    }
  },

  // Render Consistent Footer
  renderFooter() {
    const footerEl = document.getElementById('footer');
    if (!footerEl) return;

    footerEl.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand-col">
            <a href="/index.html" class="brand-logo" style="margin-bottom: 0.5rem;">
              <div class="logo-symbol">✦</div>
              <span class="brand-name">EventSphere</span>
            </a>
            <p class="footer-tagline">Plan. Discover. Experience. The premier SaaS platform for unforgettable events, summits, conferences and music festivals worldwide.</p>
            <div class="footer-social-links">
              <a href="#" class="social-icon-btn" aria-label="Twitter">𝕏</a>
              <a href="#" class="social-icon-btn" aria-label="LinkedIn">in</a>
              <a href="#" class="social-icon-btn" aria-label="Instagram">📸</a>
              <a href="#" class="social-icon-btn" aria-label="GitHub">🐙</a>
            </div>
          </div>

          <div>
            <div class="footer-heading">Product</div>
            <div class="footer-links-list">
              <a href="/events.html" class="footer-link">Explore Events</a>
              <a href="/dashboard/create-event.html" class="footer-link">Create an Event</a>
              <a href="/events.html?category=Technology" class="footer-link">Tech Conferences</a>
              <a href="/events.html?category=Music" class="footer-link">Live Music</a>
            </div>
          </div>

          <div>
            <div class="footer-heading">Company</div>
            <div class="footer-links-list">
              <a href="/about.html" class="footer-link">About Us</a>
              <a href="/contact.html" class="footer-link">Contact Support</a>
              <a href="/about.html#careers" class="footer-link">Careers</a>
              <a href="/about.html#press" class="footer-link">Press Kit</a>
            </div>
          </div>

          <div>
            <div class="footer-heading">Legal & Help</div>
            <div class="footer-links-list">
              <a href="#" class="footer-link">Terms of Service</a>
              <a href="#" class="footer-link">Privacy Policy</a>
              <a href="#" class="footer-link">Cookie Preferences</a>
              <a href="#" class="footer-link">Security Audits</a>
            </div>
          </div>

          <div>
            <div class="footer-heading">Stay Connected</div>
            <p style="font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 0.75rem;">Subscribe to get early access tickets and curated event drops.</p>
            <form onsubmit="event.preventDefault(); Components.showToast('Thank you for subscribing to EventSphere updates!', 'success'); this.reset();" class="newsletter-box">
              <input type="email" required placeholder="Enter your email" class="input-control" style="font-size: 0.8125rem; padding: 0.5rem 0.75rem;">
              <button type="submit" class="btn btn-primary btn-sm">Join</button>
            </form>
          </div>
        </div>

        <div class="footer-bottom">
          <div class="footer-copyright">© ${new Date().getFullYear()} EventSphere Inc. All rights reserved.</div>
          <div class="footer-credits">
            Designed &amp; Developed by <span class="footer-credit-author">Pruthviraj Patil</span> and <span class="footer-credit-author">Divya Gavali</span>
          </div>
        </div>
      </div>
    `;
  },

  // Render Event Card HTML
  renderEventCard(event, isFavorite = false) {
    const minPrice = event.ticketTypes && event.ticketTypes.length > 0 
      ? Math.min(...event.ticketTypes.map(t => t.price)) 
      : 0;

    const formattedDate = Utils.formatDate(event.date, 'short');
    const cityName = event.venueDetails?.city || (event.venue && event.venue.city) || 'Bangalore';
    const venueName = event.venueDetails?.name || (event.venue && event.venue.name) || 'City Hall';

    return `
      <div class="event-card animate-fade-in-up" data-event-id="${event._id}">
        <div class="event-card-media">
          <img src="${event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}" 
               alt="${Utils.escapeHtml(event.title)}" 
               class="event-card-img" 
               loading="lazy">
          <span class="badge badge-primary event-card-badge">${Utils.escapeHtml(event.category)}</span>
          <button class="event-card-fav-btn ${isFavorite ? 'active' : ''}" 
                  onclick="EventsHandler.toggleFavorite('${event._id}', this, event)" 
                  title="Bookmark Event">
            ♥
          </button>
        </div>

        <div class="event-card-body">
          <div class="event-card-meta">
            <span>📅 ${formattedDate}</span>
            <span>•</span>
            <span>⏰ ${event.startTime || '10:00 AM'}</span>
          </div>

          <h3 class="event-card-title">
            <a href="/event-details.html?id=${event._id}">${Utils.escapeHtml(event.title)}</a>
          </h3>

          <div class="event-card-venue">
            <span class="event-card-venue-icon">📍</span>
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${Utils.escapeHtml(venueName)}, ${Utils.escapeHtml(cityName)}
            </span>
          </div>

          <div class="event-card-footer">
            <div>
              <span class="event-price-label">Starts at</span>
              <span class="event-price-value">${Utils.formatCurrency(minPrice)}</span>
            </div>
            <a href="/event-details.html?id=${event._id}" class="btn btn-primary btn-sm">View Details</a>
          </div>
        </div>
      </div>
    `;
  },

  // Toast Notification System
  showToast(message, type = 'info', title = '') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    const titles = {
      success: title || 'Success',
      error: title || 'Error',
      warning: title || 'Notice',
      info: title || 'Information'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || 'ℹ️'}</div>
      <div class="toast-content">
        <div class="toast-title">${Utils.escapeHtml(titles[type])}</div>
        <div class="toast-message">${Utils.escapeHtml(message)}</div>
      </div>
      <div class="toast-close" onclick="this.parentElement.remove()">&times;</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  },

  // Skeletons
  renderEventSkeletons(count = 6) {
    return Array.from({ length: count })
      .map(
        () => `
      <div class="card-base" style="overflow: hidden;">
        <div class="skeleton" style="height: 180px; width: 100%;"></div>
        <div style="padding: 1.25rem;">
          <div class="skeleton" style="height: 14px; width: 40%; margin-bottom: 0.75rem;"></div>
          <div class="skeleton" style="height: 20px; width: 85%; margin-bottom: 0.5rem;"></div>
          <div class="skeleton" style="height: 14px; width: 60%; margin-bottom: 1.5rem;"></div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="skeleton" style="height: 20px; width: 30%;"></div>
            <div class="skeleton" style="height: 32px; width: 35%; border-radius: 8px;"></div>
          </div>
        </div>
      </div>
    `
      )
      .join('');
  },

  // Empty State
  renderEmptyState(title = 'No Events Found', desc = 'Try adjusting your search criteria or category filter.', actionBtn = '') {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">🎟️</div>
        <h3 class="empty-state-title">${Utils.escapeHtml(title)}</h3>
        <p class="empty-state-desc">${Utils.escapeHtml(desc)}</p>
        ${actionBtn}
      </div>
    `;
  }
};

window.Components = Components;

// Global helper for Live Location Button
window.requestLiveLocation = function(e) {
  if (e) e.preventDefault();
  
  if (!navigator.geolocation) {
    if (window.Components && window.Components.showToast) {
      window.Components.showToast('Geolocation is not supported by your browser.', 'error');
    }
    return;
  }
  
  if (window.Components && window.Components.showToast) {
    window.Components.showToast('Locating you... 📍', 'info');
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    try {
      const { latitude, longitude } = position.coords;
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      if (!res.ok) throw new Error('Failed to reverse geocode');
      const data = await res.json();
      
      const city = data.address.city || data.address.town || data.address.village || data.address.county || data.address.state_district;
      if (city) {
        if (window.Components && window.Components.showToast) {
          window.Components.showToast(`Found you near ${city}! Redirecting...`, 'success');
        }
        setTimeout(() => {
          window.location.href = `/events.html?city=${encodeURIComponent(city)}`;
        }, 1000);
      } else {
        throw new Error('City not found in location data');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      if (window.Components && window.Components.showToast) {
        window.Components.showToast('Could not determine your precise city.', 'error');
      }
    }
  }, (err) => {
    console.warn('Geolocation error:', err);
    if (window.Components && window.Components.showToast) {
      window.Components.showToast('Location access denied or unavailable.', 'warning');
    }
  }, { timeout: 10000 });
};
