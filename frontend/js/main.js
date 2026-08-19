/**
 * EventSphere — Main Entry & Landing Page Interactions
 */

const App = {
  init() {
    this.bindNavbarScroll();
    this.initHeroSearch();
    this.initCounterAnimations();
    this.loadFeaturedEvents();
  },

  bindNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  },

  initHeroSearch() {
    const heroForm = document.getElementById('heroSearchForm');
    if (!heroForm) return;

    // Initialize cascading state & city dropdowns
    if (typeof Locations !== 'undefined' && Locations.setupCascadingDropdown) {
      Locations.setupCascadingDropdown({
        stateSelect: '#heroStateSelect',
        citySelect: '#heroCitySelect',
        defaultState: 'All',
        defaultCity: 'All',
        statePlaceholder: 'All States',
        cityPlaceholder: 'All Cities'
      });
    }

    heroForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.navigateHeroSearch();
    });

    const heroTerm = document.getElementById('heroSearchTerm');
    Utils.bindDebouncedSearch(heroTerm, () => this.previewHeroSearch(), 400);
  },

  navigateHeroSearch() {
    const search = document.getElementById('heroSearchTerm')?.value.trim() || '';
    const state = document.getElementById('heroStateSelect')?.value || 'All';
    const city = document.getElementById('heroCitySelect')?.value || 'All';
    const category = document.getElementById('heroCategorySelect')?.value || 'All';

    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (state && state !== 'All') params.append('state', state);
    if (city && city !== 'All') params.append('city', city);
    if (category && category !== 'All') params.append('category', category);

    window.location.href = `/events.html?${params.toString()}`;
  },

  async previewHeroSearch() {
    const term = document.getElementById('heroSearchTerm')?.value.trim() || '';
    const box = document.getElementById('heroSearchSuggestions');
    if (!box) return;

    if (term.length < 2) {
      box.hidden = true;
      box.innerHTML = '';
      return;
    }

    box.hidden = false;
    box.innerHTML = `<div class="hero-suggestion-status"><span class="spinner spinner-primary spinner-inline"></span> Searching…</div>`;
    box.setAttribute('aria-busy', 'true');

    try {
      const data = await API.get('/events', { search: term, limit: 5, page: 1 }, { silent: true });
      const events = data.events || [];
      if (!events.length) {
        box.innerHTML = `<div class="hero-suggestion-status">No matches for “${Utils.escapeHtml(term)}”</div>`;
        return;
      }
      box.innerHTML = events.map((e) => `
        <a class="hero-suggestion-item" href="/event-details.html?id=${e._id}">
          <strong>${Utils.escapeHtml(e.title)}</strong>
          <span>${Utils.escapeHtml(e.category || '')} · ${Utils.escapeHtml(e.venueDetails?.city || '')}</span>
        </a>
      `).join('') + `<a class="hero-suggestion-item hero-suggestion-all" href="/events.html?search=${encodeURIComponent(term)}">See all results for “${Utils.escapeHtml(term)}”</a>`;
    } catch (err) {
      box.innerHTML = `<div class="hero-suggestion-status">Search unavailable. ${Utils.escapeHtml(err.message)}</div>`;
    } finally {
      box.setAttribute('aria-busy', 'false');
    }
  },

  async loadFeaturedEvents() {
    const container = document.getElementById('featuredEventsGrid');
    if (!container) return;

    container.innerHTML = Components.renderEventSkeletons(4);

    try {
      const data = await API.get('/events/featured');
      const events = data.events || [];

      if (events.length === 0) {
        container.innerHTML = Components.renderEmptyState('No featured events at this time');
        return;
      }

      const currentUser = API.getCurrentUser();
      const userFavorites = currentUser?.favorites || [];

      container.innerHTML = events
        .slice(0, 4)
        .map(e => Components.renderEventCard(e, userFavorites.includes(e._id)))
        .join('');
      Utils.enhanceLazyImages(container);
    } catch (err) {
      container.innerHTML = Components.renderEmptyState('Failed to load events', err.message);
    }
  },

  initCounterAnimations() {
    const statsSection = document.getElementById('statsSection');
    if (!statsSection) return;

    let animated = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          this.animateNumbers();
        }
      });
    }, { threshold: 0.3 });

    observer.observe(statsSection);
  },

  animateNumbers() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target') || '0', 10);
      const suffix = counter.getAttribute('data-suffix') || '';
      const duration = 1500; // ms
      const stepTime = 20;
      const steps = duration / stepTime;
      const increment = target / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          counter.textContent = `${target.toLocaleString()}${suffix}`;
          clearInterval(timer);
        } else {
          counter.textContent = `${Math.floor(current).toLocaleString()}${suffix}`;
        }
      }, stepTime);
    });
  }
};

window.App = App;
