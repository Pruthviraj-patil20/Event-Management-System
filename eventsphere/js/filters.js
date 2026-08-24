/**
 * EVENTSPHERE — MULTI-CRITERIA FILTERING & SEARCH ENGINE
 * Pure Vanilla JavaScript ES6+
 */

class EventFilterEngine {
  constructor(events, options = {}) {
    this.events = events;
    this.container = options.container || null;
    this.countElement = options.countElement || null;
    this.emptyElement = options.emptyElement || null;
    
    // Active Filter State
    this.filters = {
      search: '',
      state: 'all',
      city: 'all',
      category: 'all',
      dateRange: 'all',
      priceType: 'all', // 'all', 'free', 'paid'
      maxPrice: 5000,
      onlyBookmarked: false,
      sortBy: 'date-asc'
    };

    this.init();
  }

  init() {
    this.readURLParams();
    this.bindDOMInputs();
    this.applyFilters();
  }

  readURLParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('search')) this.filters.search = params.get('search');
    if (params.has('category')) this.filters.category = params.get('category');
    if (params.has('state')) this.filters.state = params.get('state');
    if (params.has('city')) this.filters.city = params.get('city');
    if (params.has('bookmarked')) this.filters.onlyBookmarked = params.get('bookmarked') === 'true';
  }

  bindDOMInputs() {
    // Search inputs
    const searchInputs = document.querySelectorAll('[data-filter="search"]');
    searchInputs.forEach(input => {
      if (this.filters.search) input.value = this.filters.search;
      input.addEventListener('input', (e) => {
        this.filters.search = e.target.value.trim().toLowerCase();
        this.applyFilters();
      });
    });

    // State select inputs (with cascading city logic)
    const stateSelects = document.querySelectorAll('[data-filter="state"]');
    stateSelects.forEach(select => {
      this.populateStates(select);
      if (this.filters.state && this.filters.state !== 'all') {
        select.value = this.filters.state;
      }
      select.addEventListener('change', (e) => {
        this.filters.state = e.target.value;
        this.filters.city = 'all';
        this.updateCitySelects(e.target.value);
        this.applyFilters();
      });
    });

    // City select inputs
    const citySelects = document.querySelectorAll('[data-filter="city"]');
    citySelects.forEach(select => {
      select.addEventListener('change', (e) => {
        this.filters.city = e.target.value;
        this.applyFilters();
      });
    });

    // Category Buttons / Select
    const categoryEls = document.querySelectorAll('[data-filter="category"]');
    categoryEls.forEach(el => {
      if (el.tagName === 'SELECT') {
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
          
          // Update active styling
          categoryEls.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.applyFilters();
        });
      }
    });

    // Price Slider
    const priceSlider = document.querySelector('[data-filter="price-range"]');
    const priceDisplay = document.querySelector('[data-display="price-value"]');
    if (priceSlider) {
      priceSlider.addEventListener('input', (e) => {
        this.filters.maxPrice = Number(e.target.value);
        if (priceDisplay) priceDisplay.textContent = `₹${this.filters.maxPrice.toLocaleString('en-IN')}`;
        this.applyFilters();
      });
    }

    // Price Type Radio / Checkboxes (Free vs Paid)
    const priceTypeRadios = document.querySelectorAll('input[name="price-type"]');
    priceTypeRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.filters.priceType = e.target.value;
        this.applyFilters();
      });
    });

    // Sort Dropdown
    const sortSelect = document.querySelector('[data-filter="sort"]');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.filters.sortBy = e.target.value;
        this.applyFilters();
      });
    }

    // Reset Filters Buttons
    const resetBtns = document.querySelectorAll('[data-action="reset-filters"]');
    resetBtns.forEach(btn => {
      btn.addEventListener('click', () => this.resetFilters());
    });
  }

  populateStates(selectElement) {
    if (!selectElement) return;
    selectElement.innerHTML = '<option value="all">All States / UTs</option>';
    Object.keys(LOCATIONS_MAP).forEach(state => {
      const opt = document.createElement('option');
      opt.value = state;
      opt.textContent = state;
      selectElement.appendChild(opt);
    });
  }

  updateCitySelects(stateName) {
    const citySelects = document.querySelectorAll('[data-filter="city"]');
    citySelects.forEach(select => {
      select.innerHTML = '<option value="all">All Cities</option>';
      if (stateName !== 'all' && LOCATIONS_MAP[stateName]) {
        LOCATIONS_MAP[stateName].forEach(city => {
          const opt = document.createElement('option');
          opt.value = city;
          opt.textContent = city;
          select.appendChild(opt);
        });
      }
    });
  }

  resetFilters() {
    this.filters = {
      search: '',
      state: 'all',
      city: 'all',
      category: 'all',
      dateRange: 'all',
      priceType: 'all',
      maxPrice: 5000,
      onlyBookmarked: false,
      sortBy: 'date-asc'
    };

    // Reset inputs
    document.querySelectorAll('[data-filter="search"]').forEach(i => i.value = '');
    document.querySelectorAll('[data-filter="state"]').forEach(s => s.value = 'all');
    document.querySelectorAll('[data-filter="city"]').forEach(c => {
      c.innerHTML = '<option value="all">All Cities</option>';
      c.value = 'all';
    });
    document.querySelectorAll('[data-filter="category"]').forEach(c => {
      if (c.tagName === 'SELECT') c.value = 'all';
      else c.classList.toggle('active', c.dataset.category === 'all');
    });

    this.applyFilters();
  }

  applyFilters() {
    const bookmarkedIds = JSON.parse(localStorage.getItem('eventsphere_bookmarks') || '[]');

    let results = this.events.filter(event => {
      // Keyword search (title, description, location, city)
      if (this.filters.search) {
        const q = this.filters.search;
        const matchesTitle = event.title.toLowerCase().includes(q);
        const matchesDesc = event.description.toLowerCase().includes(q);
        const matchesCity = event.city.toLowerCase().includes(q);
        const matchesLoc = event.location.toLowerCase().includes(q);
        const matchesCat = event.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCity && !matchesLoc && !matchesCat) {
          return false;
        }
      }

      // Category
      if (this.filters.category !== 'all' && event.category.toLowerCase() !== this.filters.category.toLowerCase()) {
        return false;
      }

      // State
      if (this.filters.state !== 'all' && event.state.toLowerCase() !== this.filters.state.toLowerCase()) {
        return false;
      }

      // City
      if (this.filters.city !== 'all' && event.city.toLowerCase() !== this.filters.city.toLowerCase()) {
        return false;
      }

      // Price Type
      if (this.filters.priceType === 'free' && !event.isFree) return false;
      if (this.filters.priceType === 'paid' && event.isFree) return false;

      // Price Range
      if (!event.isFree && event.price > this.filters.maxPrice) return false;

      // Bookmarked Only
      if (this.filters.onlyBookmarked && !bookmarkedIds.includes(event.id)) {
        return false;
      }

      return true;
    });

    // Sorting
    results = this.sortResults(results);

    // Render results
    this.render(results, bookmarkedIds);
  }

  sortResults(items) {
    switch (this.filters.sortBy) {
      case 'price-low':
        return items.sort((a, b) => a.price - b.price);
      case 'price-high':
        return items.sort((a, b) => b.price - a.price);
      case 'date-desc':
        return items.sort((a, b) => new Date(b.date) - new Date(a.date));
      case 'date-asc':
      default:
        return items.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
  }

  render(items, bookmarkedIds) {
    if (!this.container) return;

    if (this.countElement) {
      this.countElement.textContent = `Showing ${items.length} ${items.length === 1 ? 'event' : 'events'}`;
    }

    if (items.length === 0) {
      this.container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <h3 class="empty-state-title">No matching experiences found</h3>
          <p class="empty-state-text">We couldn't find any events matching your current filters. Try relaxing your search terms or resetting filters.</p>
          <button class="btn btn-primary" data-action="reset-filters">Reset All Filters</button>
        </div>
      `;
      // re-bind reset button
      const resetBtn = this.container.querySelector('[data-action="reset-filters"]');
      if (resetBtn) resetBtn.addEventListener('click', () => this.resetFilters());
      return;
    }

    this.container.innerHTML = items
      .map(event => createEventCardHTML(event, bookmarkedIds.includes(event.id)))
      .join('');
  }
}
