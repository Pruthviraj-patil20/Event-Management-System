/**
 * EVENTSPHERE — LIVE & UPCOMING MULTI-CRITERIA FILTERING ENGINE
 * Pure Vanilla JavaScript ES6+
 * Supports Real-Time Statuses, India-Wide Cities, Date Ranges, and Async Data Layer
 */

class EventFilterEngine {
  constructor(options = {}) {
    this.container = options.container || null;
    this.featuredContainer = options.featuredContainer || null;
    this.countElement = options.countElement || null;
    this.events = [];
    this.isLoading = false;
    this.debounceTimer = null;

    // Active Filter State
    this.filters = {
      tab: 'all', // 'all', 'live', 'upcoming'
      city: 'All India',
      state: 'all',
      category: 'all',
      search: '',
      dateRange: 'all', // 'all', 'today', 'tomorrow', 'this-week', 'this-weekend', 'next-week', 'this-month'
      priceType: 'all', // 'all', 'free', 'paid'
      maxPrice: 5000,
      onlyBookmarked: false,
      sortBy: 'recommended' // 'recommended', 'happening-now', 'starting-soon', 'nearest-date', 'most-popular', 'price-low', 'price-high'
    };

    this.init();
  }

  async init() {
    this.readURLParams();
    this.bindDOMInputs();
    await this.loadEvents();
  }

  readURLParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('tab')) this.filters.tab = params.get('tab');
    if (params.has('search')) this.filters.search = params.get('search');
    if (params.has('category')) this.filters.category = params.get('category');
    if (params.has('city')) this.filters.city = params.get('city');
    if (params.has('state')) this.filters.state = params.get('state');
    if (params.has('date')) this.filters.dateRange = params.get('date');
    if (params.has('bookmarked')) this.filters.onlyBookmarked = params.get('bookmarked') === 'true';

    // If no tab in URL, check if a tab is marked active in DOM
    if (!params.has('tab')) {
      const activeTabEl = document.querySelector('[data-filter="tab"].active');
      if (activeTabEl && activeTabEl.dataset.tab) {
        this.filters.tab = activeTabEl.dataset.tab;
      }
    }

    // If no city in URL, check if city chip is marked active in DOM
    if (!params.has('city')) {
      const activeCityEl = document.querySelector('[data-filter="city-chip"].active');
      if (activeCityEl && activeCityEl.dataset.city) {
        this.filters.city = activeCityEl.dataset.city;
      }
    }
  }

  async loadEvents() {
    this.isLoading = true;
    this.renderSkeletons();

    try {
      // Fetch via async data access layer (getEvents)
      const fetchFn = typeof getEvents === 'function' ? getEvents : (typeof window.getEvents === 'function' ? window.getEvents : null);
      if (fetchFn) {
        this.events = await fetchFn();
      } else {
        this.events = window.MOCK_EVENTS || window.EVENT_DATASET || [];
      }
      this.isLoading = false;
      this.applyFilters();
    } catch (err) {
      console.error("Failed to load events:", err);
      this.isLoading = false;
      this.renderError();
    }
  }

  bindDOMInputs() {
    // 1. Dual Mode Tabs (LIVE NOW vs UPCOMING vs ALL)
    const tabBtns = document.querySelectorAll('[data-filter="tab"]');
    tabBtns.forEach(btn => {
      if (btn.dataset.tab === this.filters.tab) {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
      btn.addEventListener('click', (e) => {
        tabBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.filters.tab = e.currentTarget.dataset.tab;
        this.applyFilters();
      });
    });

    // 2. City Chips & Selectors
    const cityChips = document.querySelectorAll('[data-filter="city-chip"]');
    cityChips.forEach(chip => {
      if (chip.dataset.city === this.filters.city) {
        cityChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      }
      chip.addEventListener('click', (e) => {
        cityChips.forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.filters.city = e.currentTarget.dataset.city;
        this.applyFilters();
      });
    });

    // "Use My Location" Trigger (UI placeholder)
    const geoBtns = document.querySelectorAll('[data-action="use-my-location"]');
    geoBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // UI-safe simulation: default to Pune / Mumbai
        this.filters.city = 'Pune';
        cityChips.forEach(c => c.classList.toggle('active', c.dataset.city === 'Pune'));
        if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
          UI.showToast('📍 Located near Pune, Maharashtra (Simulated)', 'info');
        }
        this.applyFilters();
      });
    });

    // City Select dropdowns
    const citySelects = document.querySelectorAll('[data-filter="city"]');
    citySelects.forEach(select => {
      this.populateCityDropdown(select);
      if (this.filters.city) select.value = this.filters.city;
      select.addEventListener('change', (e) => {
        this.filters.city = e.target.value;
        cityChips.forEach(c => c.classList.toggle('active', c.dataset.city === e.target.value));
        this.applyFilters();
      });
    });

    // 3. Debounced Keyword Search
    const searchInputs = document.querySelectorAll('[data-filter="search"]');
    searchInputs.forEach(input => {
      if (this.filters.search) input.value = this.filters.search;
      input.addEventListener('input', (e) => {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.filters.search = e.target.value.trim().toLowerCase();
          this.applyFilters();
        }, 200);
      });
    });

    // 4. Category Filters
    const categoryEls = document.querySelectorAll('[data-filter="category"]');
    categoryEls.forEach(el => {
      if (el.tagName === 'SELECT') {
        this.populateCategoryDropdown(el);
        if (this.filters.category) el.value = this.filters.category;
        el.addEventListener('change', (e) => {
          this.filters.category = e.target.value;
          this.applyFilters();
        });
      } else {
        el.addEventListener('click', (e) => {
          const btn = e.currentTarget;
          const category = btn.dataset.category || 'all';
          this.filters.category = category;
          categoryEls.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.applyFilters();
        });
      }
    });

    // 5. Date Filters
    const dateSelects = document.querySelectorAll('[data-filter="date"]');
    dateSelects.forEach(select => {
      if (this.filters.dateRange) select.value = this.filters.dateRange;
      select.addEventListener('change', (e) => {
        this.filters.dateRange = e.target.value;
        this.applyFilters();
      });
    });

    // 6. Price Slider
    const priceSlider = document.querySelector('[data-filter="price-range"]');
    const priceDisplay = document.querySelector('[data-display="price-value"]');
    if (priceSlider) {
      priceSlider.addEventListener('input', (e) => {
        this.filters.maxPrice = Number(e.target.value);
        if (priceDisplay) priceDisplay.textContent = `₹${this.filters.maxPrice.toLocaleString('en-IN')}`;
        this.applyFilters();
      });
    }

    // 7. Price Type Radio
    const priceTypeRadios = document.querySelectorAll('input[name="price-type"]');
    priceTypeRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.filters.priceType = e.target.value;
        this.applyFilters();
      });
    });

    // 8. Sort Select
    const sortSelects = document.querySelectorAll('[data-filter="sort"]');
    sortSelects.forEach(select => {
      if (this.filters.sortBy) select.value = this.filters.sortBy;
      select.addEventListener('change', (e) => {
        this.filters.sortBy = e.target.value;
        this.applyFilters();
      });
    });

    // 9. Reset / Clear Filter Actions
    const resetBtns = document.querySelectorAll('[data-action="reset-filters"], [data-action="clear-filters"]');
    resetBtns.forEach(btn => {
      btn.addEventListener('click', () => this.resetFilters());
    });

    // 10. Mobile Filter Bottom Sheet
    this.initMobileFilterSheet();
  }

  populateCityDropdown(select) {
    if (!select) return;
    const cities = window.INDIA_CITIES || INDIA_CITIES || [];
    select.innerHTML = '<option value="All India">All India</option>';
    cities.filter(c => c !== 'All India').forEach(city => {
      const opt = document.createElement('option');
      opt.value = city;
      opt.textContent = city;
      select.appendChild(opt);
    });
  }

  populateCategoryDropdown(select) {
    if (!select) return;
    const categories = window.ALL_CATEGORIES || ALL_CATEGORIES || [];
    select.innerHTML = '<option value="all">All Categories</option>';
    categories.filter(c => c.id !== 'all').forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.name;
      opt.textContent = `${cat.icon} ${cat.name}`;
      select.appendChild(opt);
    });
  }

  initMobileFilterSheet() {
    const trigger = document.querySelector('[data-action="open-mobile-filters"]');
    const sheet = document.querySelector('.mobile-filter-sheet');
    if (!trigger || !sheet) return;

    trigger.addEventListener('click', () => {
      sheet.classList.add('open');
      document.body.style.overflow = 'hidden';
    });

    const closeBtns = sheet.querySelectorAll('[data-action="close-mobile-filters"]');
    closeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sheet.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    sheet.addEventListener('click', (e) => {
      if (e.target === sheet) {
        sheet.classList.remove('open');
        document.body.style.overflow = '';
      }
    });

    const applyBtn = sheet.querySelector('[data-action="apply-mobile-filters"]');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        sheet.classList.remove('open');
        document.body.style.overflow = '';
        this.applyFilters();
      });
    }
  }

  resetFilters() {
    this.filters = {
      tab: 'all',
      city: 'All India',
      state: 'all',
      category: 'all',
      search: '',
      dateRange: 'all',
      priceType: 'all',
      maxPrice: 5000,
      onlyBookmarked: false,
      sortBy: 'recommended'
    };

    // Reset UI Elements
    document.querySelectorAll('[data-filter="search"]').forEach(i => i.value = '');
    document.querySelectorAll('[data-filter="city"]').forEach(s => s.value = 'All India');
    document.querySelectorAll('[data-filter="city-chip"]').forEach(c => {
      c.classList.toggle('active', c.dataset.city === 'All India');
    });
    document.querySelectorAll('[data-filter="tab"]').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === 'all');
    });
    document.querySelectorAll('[data-filter="category"]').forEach(c => {
      if (c.tagName === 'SELECT') c.value = 'all';
      else c.classList.toggle('active', c.dataset.category === 'all');
    });
    document.querySelectorAll('[data-filter="date"]').forEach(d => d.value = 'all');
    document.querySelectorAll('input[name="price-type"]').forEach(r => r.checked = r.value === 'all');
    document.querySelectorAll('[data-filter="sort"]').forEach(s => s.value = 'recommended');

    const priceSlider = document.querySelector('[data-filter="price-range"]');
    if (priceSlider) priceSlider.value = 5000;
    const priceDisplay = document.querySelector('[data-display="price-value"]');
    if (priceDisplay) priceDisplay.textContent = '₹5,000';

    this.applyFilters();
    if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
      UI.showToast('Filters reset to default', 'info');
    }
  }

  applyFilters() {
    const bookmarkedIds = JSON.parse(localStorage.getItem('eventsphere_bookmarks') || '[]');
    const now = new Date();

    const statusFn = typeof getEventStatus === 'function' ? getEventStatus : (typeof window.getEventStatus === 'function' ? window.getEventStatus : () => 'UPCOMING');

    let results = (this.events || []).filter(event => {
      const status = statusFn(event);
      const start = new Date(event.startDateTime);

      // 1. Live vs Upcoming Tab
      if (this.filters.tab === 'live' && status !== 'LIVE') return false;
      if (this.filters.tab === 'upcoming' && status === 'ENDED') return false;

      // 2. City Filter
      if (this.filters.city && this.filters.city !== 'All India' && this.filters.city !== 'all') {
        if (event.city.toLowerCase() !== this.filters.city.toLowerCase()) {
          return false;
        }
      }

      // 3. Category Filter
      if (this.filters.category && this.filters.category !== 'all') {
        if (event.category.toLowerCase() !== this.filters.category.toLowerCase()) {
          return false;
        }
      }

      // 4. Keyword Search (title, city, venue, category, organizer, description)
      if (this.filters.search) {
        const q = this.filters.search;
        const matchesTitle = (event.title || '').toLowerCase().includes(q);
        const matchesCity = (event.city || '').toLowerCase().includes(q);
        const matchesVenue = (event.venue || event.location || '').toLowerCase().includes(q);
        const matchesCat = (event.category || '').toLowerCase().includes(q);
        const matchesDesc = (event.description || '').toLowerCase().includes(q);
        const matchesOrg = (event.organizer?.name || '').toLowerCase().includes(q);

        if (!matchesTitle && !matchesCity && !matchesVenue && !matchesCat && !matchesDesc && !matchesOrg) {
          return false;
        }
      }

      // 5. Date Filter
      if (this.filters.dateRange !== 'all') {
        const diffDays = Math.floor((start - now) / (1000 * 60 * 60 * 24));
        const isSameDay = start.toDateString() === now.toDateString();

        if (this.filters.dateRange === 'today' && !isSameDay) return false;
        if (this.filters.dateRange === 'tomorrow') {
          const tomorrow = new Date();
          tomorrow.setDate(now.getDate() + 1);
          if (start.toDateString() !== tomorrow.toDateString()) return false;
        }
        if (this.filters.dateRange === 'this-week' && (diffDays < 0 || diffDays > 7)) return false;
        if (this.filters.dateRange === 'this-weekend') {
          const day = start.getDay(); // 0 is Sunday, 6 is Saturday
          if (day !== 0 && day !== 6) return false;
        }
        if (this.filters.dateRange === 'this-month' && (start.getMonth() !== now.getMonth() || start.getFullYear() !== now.getFullYear())) {
          return false;
        }
      }

      // 6. Price Type
      if (this.filters.priceType === 'free' && !event.isFree) return false;
      if (this.filters.priceType === 'paid' && event.isFree) return false;

      // 7. Max Price
      if (!event.isFree && event.price > this.filters.maxPrice) return false;

      // 8. Bookmarks Only
      if (this.filters.onlyBookmarked && !bookmarkedIds.includes(event.id)) return false;

      return true;
    });

    // Sort Results
    results = this.sortResults(results);

    // Render Grid & Featured Spotlight
    this.render(results, bookmarkedIds);
  }

  sortResults(items) {
    const statusFn = typeof getEventStatus === 'function' ? getEventStatus : (typeof window.getEventStatus === 'function' ? window.getEventStatus : () => 'UPCOMING');

    switch (this.filters.sortBy) {
      case 'happening-now':
        return items.sort((a, b) => (statusFn(b) === 'LIVE' ? 1 : 0) - (statusFn(a) === 'LIVE' ? 1 : 0));
      case 'starting-soon':
      case 'nearest-date':
        return items.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
      case 'most-popular':
        return items.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      case 'price-low':
        return items.sort((a, b) => (a.isFree ? 0 : a.price) - (b.isFree ? 0 : b.price));
      case 'price-high':
        return items.sort((a, b) => (b.isFree ? 0 : b.price) - (a.isFree ? 0 : a.price));
      case 'recommended':
      default:
        // Prioritize Live first, then Featured, then upcoming date
        return items.sort((a, b) => {
          const aLive = statusFn(a) === 'LIVE' ? 2 : 0;
          const bLive = statusFn(b) === 'LIVE' ? 2 : 0;
          const aFeat = a.featured ? 1 : 0;
          const bFeat = b.featured ? 1 : 0;
          if (bLive + bFeat !== aLive + aFeat) {
            return (bLive + bFeat) - (aLive + aFeat);
          }
          return new Date(a.startDateTime) - new Date(b.startDateTime);
        });
    }
  }

  renderSkeletons() {
    if (this.container) {
      this.container.innerHTML = Array(6).fill(0).map(() => `
        <div class="skeleton-card">
          <div class="skeleton skeleton-img"></div>
          <div class="skeleton-content">
            <div class="skeleton skeleton-line short"></div>
            <div class="skeleton skeleton-line title"></div>
            <div class="skeleton skeleton-line"></div>
            <div class="skeleton skeleton-line short" style="margin-top: 10px;"></div>
          </div>
        </div>
      `).join('');
    }
  }

  renderError() {
    if (this.container) {
      this.container.innerHTML = `
        <div class="error-state">
          <div class="error-state-icon">⚠️</div>
          <h3 class="error-state-title">We couldn't load events right now</h3>
          <p class="error-state-text">There was an unexpected error fetching the discovery catalog. Please try again.</p>
          <button class="btn btn-primary" onclick="window.homeFilterEngine?.loadEvents(); window.exploreFilterEngine?.loadEvents();">Try Again ⟳</button>
        </div>
      `;
    }
  }

  render(items, bookmarkedIds) {
    const statusFn = typeof getEventStatus === 'function' ? getEventStatus : (typeof window.getEventStatus === 'function' ? window.getEventStatus : () => 'UPCOMING');
    const cardFn = typeof createEventCardHTML === 'function' ? createEventCardHTML : (typeof window.createEventCardHTML === 'function' ? window.createEventCardHTML : null);
    const liveCardFn = typeof createFeaturedLiveCardHTML === 'function' ? createFeaturedLiveCardHTML : (typeof window.createFeaturedLiveCardHTML === 'function' ? window.createFeaturedLiveCardHTML : null);

    // 1. Update Results Count Text
    if (this.countElement) {
      const cityLabel = this.filters.city && this.filters.city !== 'All India' ? ` in ${this.filters.city}` : ' across India';
      this.countElement.textContent = `Showing ${items.length} ${items.length === 1 ? 'event' : 'events'}${cityLabel}`;
    }

    // 2. Render Featured Spotlight (if container provided)
    if (this.featuredContainer && liveCardFn) {
      const liveEvents = items.filter(e => statusFn(e) === 'LIVE');
      const spotlightEvents = liveEvents.length > 0 ? liveEvents.slice(0, 2) : items.slice(0, 2);

      if (spotlightEvents.length > 0) {
        this.featuredContainer.innerHTML = spotlightEvents
          .map(e => liveCardFn(e, bookmarkedIds.includes(e.id)))
          .join('');
        this.featuredContainer.style.display = 'grid';
      } else {
        this.featuredContainer.style.display = 'none';
      }
    }

    // 3. Render Main Grid / Empty State
    if (!this.container || !cardFn) return;

    if (items.length === 0) {
      this.container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <h3 class="empty-state-title">No events found</h3>
          <p class="empty-state-text">Try changing your location, date, category, or search query to explore more experiences.</p>
          <button class="btn btn-primary" data-action="clear-filters">Clear All Filters</button>
        </div>
      `;
      const clearBtn = this.container.querySelector('[data-action="clear-filters"]');
      if (clearBtn) clearBtn.addEventListener('click', () => this.resetFilters());
      return;
    }

    this.container.innerHTML = items
      .map(event => cardFn(event, bookmarkedIds.includes(event.id)))
      .join('');
  }
}

// Expose globally on window
if (typeof window !== 'undefined') {
  window.EventFilterEngine = EventFilterEngine;
}
