/**
 * EVENTSPHERE — MAIN APPLICATION ORCHESTRATOR
 * Pure Vanilla JavaScript ES6+
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  init() {
    this.initTheme();
    this.initNavbar();
    this.initMobileDrawer();
    this.initUserDropdown();
    this.initBookmarks();
    this.initQuickViewListeners();
    this.initScrollReveal();
    this.highlightActiveNavLink();
    
    // Initialize UI micro-features
    if (typeof UI !== 'undefined') {
      UI.initAnimatedCounters();
      UI.initFAQAccordion();
    }
  },

  /**
   * Theme Manager (Dark / Light mode persisted in localStorage)
   */
  initTheme() {
    const savedTheme = localStorage.getItem('eventsphere_theme') || 'dark'; // Defaulting to sleek dark for modern SaaS vibe
    document.documentElement.setAttribute('data-theme', savedTheme);

    const toggleBtns = document.querySelectorAll('[data-action="toggle-theme"]');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('eventsphere_theme', newTheme);
        if (typeof UI !== 'undefined') {
          UI.showToast(`Switched to ${newTheme === 'dark' ? 'Dark 🌙' : 'Light ☀️'} mode`, 'info', 1800);
        }
      });
    });
  },

  /**
   * Sticky Navbar on Scroll
   */
  initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  },

  /**
   * Mobile Hamburger Menu
   */
  initMobileDrawer() {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const drawer = document.querySelector('.mobile-nav-drawer');
    if (!hamburgerBtn || !drawer) return;

    hamburgerBtn.addEventListener('click', () => {
      const isOpen = drawer.classList.toggle('open');
      hamburgerBtn.classList.toggle('active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on navigation link click
    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
        hamburgerBtn.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  },

  /**
   * User Avatar Profile Dropdown
   */
  initUserDropdown() {
    const userBtn = document.querySelector('.user-avatar-btn');
    const dropdown = document.querySelector('.user-dropdown');
    if (!userBtn || !dropdown) return;

    userBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      dropdown.classList.remove('show');
    });
  },

  /**
   * Bookmarks & Wishlist Manager
   */
  initBookmarks() {
    this.updateBookmarkBadge();

    document.addEventListener('click', (e) => {
      const bookmarkBtn = e.target.closest('[data-action="bookmark"]');
      if (!bookmarkBtn) return;

      e.preventDefault();
      e.stopPropagation();

      const eventId = Number(bookmarkBtn.dataset.id);
      let bookmarks = JSON.parse(localStorage.getItem('eventsphere_bookmarks') || '[]');

      if (bookmarks.includes(eventId)) {
        bookmarks = bookmarks.filter(id => id !== eventId);
        bookmarkBtn.classList.remove('bookmarked');
        bookmarkBtn.querySelector('svg').setAttribute('fill', 'none');
        if (typeof UI !== 'undefined') UI.showToast('Event removed from saved list', 'info');
      } else {
        bookmarks.push(eventId);
        bookmarkBtn.classList.add('bookmarked');
        bookmarkBtn.querySelector('svg').setAttribute('fill', 'currentColor');
        bookmarkBtn.classList.add('heart-pop');
        setTimeout(() => bookmarkBtn.classList.remove('heart-pop'), 400);
        if (typeof UI !== 'undefined') UI.showToast('Event saved to your wishlist! ❤️', 'success');
      }

      localStorage.setItem('eventsphere_bookmarks', JSON.stringify(bookmarks));
      this.updateBookmarkBadge();
    });
  },

  updateBookmarkBadge() {
    const bookmarks = JSON.parse(localStorage.getItem('eventsphere_bookmarks') || '[]');
    const badge = document.querySelector('.bookmark-counter');
    if (badge) {
      badge.textContent = bookmarks.length;
      badge.style.display = bookmarks.length > 0 ? 'flex' : 'none';
    }
  },

  /**
   * Quick View Modal Listener Delegation
   */
  initQuickViewListeners() {
    document.addEventListener('click', (e) => {
      const quickViewBtn = e.target.closest('[data-action="quick-view"]');
      if (quickViewBtn && typeof UI !== 'undefined') {
        const eventId = quickViewBtn.dataset.id;
        UI.openQuickView(eventId);
      }
    });
  },

  /**
   * Intersection Observer for Smooth Scroll Reveals
   */
  initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal-on-scroll');
    if (revealEls.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(el => observer.observe(el));
  },

  /**
   * Highlight current active page link in navbar
   */
  highlightActiveNavLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPath || (currentPath === '' && href === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
};
