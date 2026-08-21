/**
 * EventSphere — Event Explorer & Search Filtering Controller
 */

const EventsHandler = {
  state: {
    events: [],
    total: 0,
    page: 1,
    limit: 9,
    category: 'All',
    state: 'All',
    city: 'All',
    search: '',
    minPrice: '',
    maxPrice: '',
    sort: 'upcoming',
    viewMode: 'grid',
    loading: false
  },
  locationSelector: null,
  _fetchController: null,
  _virtualHandle: null,

  async init() {
    const urlCategory = Utils.getUrlParam('category');
    const urlSearch = Utils.getUrlParam('search');
    const urlState = Utils.getUrlParam('state');
    const urlCity = Utils.getUrlParam('city');

    if (urlCategory) this.state.category = urlCategory;
    if (urlSearch) this.state.search = urlSearch;
    if (urlState) this.state.state = urlState;
    if (urlCity) {
      this.state.city = urlCity;
      if (!urlState && typeof Locations !== 'undefined') {
        const detected = Locations.findStateForCity(urlCity);
        if (detected) this.state.state = detected;
      }
    }

    this.initLocationSelector();
    this.bindFilterEvents();
    this.syncFilterInputs();
    await this.fetchEvents();
  },

  initLocationSelector() {
    if (typeof Locations !== 'undefined' && Locations.setupCascadingDropdown) {
      this.locationSelector = Locations.setupCascadingDropdown({
        stateSelect: '#stateFilter',
        citySelect: '#cityFilter',
        defaultState: this.state.state,
        defaultCity: this.state.city,
        statePlaceholder: 'All States',
        cityPlaceholder: 'All Cities',
        onStateChange: (selectedState) => {
          this.state.state = selectedState;
          this.state.city = 'All';
          this.state.page = 1;
          this.fetchEvents();
        },
        onCityChange: (selectedCity) => {
          this.state.city = selectedCity;
          this.state.page = 1;
          this.fetchEvents();
        }
      });
    }
  },

  syncFilterInputs() {
    const searchInput = document.getElementById('eventSearchInput');
    const categorySelect = document.getElementById('categoryFilter');
    const sortSelect = document.getElementById('sortSelect');

    if (searchInput && this.state.search) searchInput.value = this.state.search;
    if (categorySelect && this.state.category) categorySelect.value = this.state.category;
    if (sortSelect && this.state.sort) sortSelect.value = this.state.sort;

    if (this.locationSelector) {
      this.locationSelector.setState(this.state.state, this.state.city);
    }
  },

  bindFilterEvents() {
    const searchInput = document.getElementById('eventSearchInput');
    Utils.bindDebouncedSearch(searchInput, (e) => {
      this.state.search = e.target.value.trim();
      this.state.page = 1;
      this.fetchEvents();
    }, 400);

    const categorySelect = document.getElementById('categoryFilter');
    if (categorySelect) {
      categorySelect.addEventListener('change', (e) => {
        this.state.category = e.target.value;
        this.state.page = 1;
        this.fetchEvents();
      });
    }

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.state.sort = e.target.value;
        this.fetchEvents();
      });
    }

    const priceMin = document.getElementById('priceMinInput');
    const priceMax = document.getElementById('priceMaxInput');
    const applyPriceBtn = document.getElementById('applyPriceFilter');

    if (applyPriceBtn) {
      applyPriceBtn.addEventListener('click', () => {
        this.state.minPrice = priceMin ? priceMin.value : '';
        this.state.maxPrice = priceMax ? priceMax.value : '';
        this.state.page = 1;
        this.fetchEvents();
      });
    }

    const filtersForm = document.getElementById('eventFiltersForm');
    if (filtersForm) {
      filtersForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.state.search = searchInput ? searchInput.value.trim() : this.state.search;
        this.state.category = categorySelect ? categorySelect.value : this.state.category;
        this.state.page = 1;
        this.fetchEvents();
      });
    }

    const resetBtn = document.getElementById('resetFiltersBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.state.category = 'All';
        this.state.state = 'All';
        this.state.city = 'All';
        this.state.search = '';
        this.state.minPrice = '';
        this.state.maxPrice = '';
        this.state.page = 1;
        if (this.locationSelector) {
          this.locationSelector.reset();
        }
        this.syncFilterInputs();
        if (priceMin) priceMin.value = '';
        if (priceMax) priceMax.value = '';
        this.fetchEvents();
      });
    }
  },

  setListLoading(isLoading) {
    this.state.loading = isLoading;
    const container = document.getElementById('eventsGrid');
    const explorer = document.querySelector('.events-explorer-wrap');
    const countEl = document.getElementById('resultsCount');
    const sidebar = document.querySelector('.filter-sidebar');

    if (container) container.setAttribute('aria-busy', isLoading ? 'true' : 'false');
    if (explorer) explorer.classList.toggle('is-loading', isLoading);
    if (sidebar) sidebar.classList.toggle('filters-disabled', isLoading);

    if (countEl) {
      if (isLoading) {
        countEl.innerHTML = `<span class="spinner spinner-primary spinner-inline"></span> Updating results…`;
      }
    }
  },

  async fetchEvents() {
    const container = document.getElementById('eventsGrid');
    if (!container) return;

    if (this._fetchController) this._fetchController.abort();
    this._fetchController = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const requestId = (this._fetchId = (this._fetchId || 0) + 1);

    this.setListLoading(true);
    container.innerHTML = Components.renderEventSkeletons(this.state.limit);

    try {
      const params = {
        page: this.state.page,
        limit: this.state.limit,
        sort: this.state.sort
      };

      if (this.state.search) params.search = this.state.search;
      if (this.state.category && this.state.category !== 'All') params.category = this.state.category;
      if (this.state.state && this.state.state !== 'All') params.state = this.state.state;
      if (this.state.city && this.state.city !== 'All') params.city = this.state.city;
      if (this.state.minPrice) params.minPrice = this.state.minPrice;
      if (this.state.maxPrice) params.maxPrice = this.state.maxPrice;

      const data = await API.get('/events', params, {
        signal: this._fetchController ? this._fetchController.signal : undefined
      });

      this.state.events = data.events || [];
      this.state.total = data.total || 0;

      if (this.state.total > VirtualList.THRESHOLD && this.state.events.length <= VirtualList.THRESHOLD) {
        const full = await API.get('/events', { ...params, page: 1, limit: Math.min(this.state.total, 200) }, {
          signal: this._fetchController ? this._fetchController.signal : undefined
        });
        this.state.events = full.events || this.state.events;
        this.state.total = full.total || this.state.total;
      }

      this.renderEventsList();
      this.renderPagination(data.totalPages, data.currentPage);
      this.updateResultsCount();
    } catch (err) {
      if (err.name === 'AbortError') return;
      container.innerHTML = Components.renderEmptyState(
        'Failed to load events',
        err.message,
        '<button type="button" class="btn btn-secondary btn-sm" style="margin-top: 1rem;" onclick="EventsHandler.fetchEvents()">Retry</button>'
      );
    } finally {
      if (this._fetchId === requestId) this.setListLoading(false);
    }
  },

  gridColumnCount() {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1100) return 2;
    return 3;
  },

  renderEventsList() {
    const container = document.getElementById('eventsGrid');
    if (!container) return;

    if (this._virtualHandle) {
      this._virtualHandle.destroy();
      this._virtualHandle = null;
    }

    if (this.state.events.length === 0) {
      container.classList.remove('virtual-list-viewport');
      container.innerHTML = Components.renderEmptyState(
        'No Events Matching Your Filters',
        'Try clearing your search filters or exploring another category.',
        '<button onclick="EventsHandler.resetFilters()" class="btn btn-secondary btn-sm" style="margin-top: 1rem;">Reset Filters</button>'
      );
      return;
    }

    const currentUser = API.getCurrentUser();
    const userFavorites = currentUser?.favorites || [];
    const renderCard = (event) => Components.renderEventCard(event, userFavorites.includes(event._id));

    if (VirtualList.shouldVirtualize(this.state.events.length)) {
      this._virtualHandle = VirtualList.mount({
        viewport: container,
        items: this.state.events,
        itemHeight: 420,
        columns: this.gridColumnCount(),
        renderItems: (windowEl, slice) => {
          windowEl.className = 'virtual-list-window grid-3';
          windowEl.innerHTML = slice.map(renderCard).join('');
          Utils.enhanceLazyImages(windowEl);
        }
      });
      return;
    }

    container.classList.remove('virtual-list-viewport');
    container.innerHTML = this.state.events.map(renderCard).join('');
    Utils.enhanceLazyImages(container);
  },

  renderPagination(totalPages = 1, currentPage = 1) {
    const paginationEl = document.getElementById('eventsPagination');
    if (!paginationEl) return;

    if (VirtualList.shouldVirtualize(this.state.events.length) || totalPages <= 1) {
      paginationEl.innerHTML = VirtualList.shouldVirtualize(this.state.events.length)
        ? `<p class="virtual-list-hint">Showing ${this.state.events.length} events with virtual scrolling</p>`
        : '';
      return;
    }

    let buttonsHtml = '';
    for (let i = 1; i <= totalPages; i++) {
      buttonsHtml += `
        <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="EventsHandler.goToPage(${i})">
          ${i}
        </button>
      `;
    }

    paginationEl.innerHTML = `
      <div class="pagination-wrap">
        <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="EventsHandler.goToPage(${currentPage - 1})">‹</button>
        ${buttonsHtml}
        <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="EventsHandler.goToPage(${currentPage + 1})">›</button>
      </div>
    `;
  },

  goToPage(pageNumber) {
    this.state.page = pageNumber;
    this.fetchEvents();
    window.scrollTo({ top: 300, behavior: 'smooth' });
  },

  updateResultsCount() {
    const countEl = document.getElementById('resultsCount');
    if (countEl) {
      countEl.innerHTML = `Showing <strong>${this.state.events.length}</strong> of <strong>${this.state.total}</strong> events`;
    }
  },

  resetFilters() {
    const resetBtn = document.getElementById('resetFiltersBtn');
    if (resetBtn) resetBtn.click();
  },

  async toggleFavorite(eventId, btnEl, event) {
    if (event) event.stopPropagation();
    const user = API.getCurrentUser();
    if (!user) {
      Components.showToast('Please sign in to save your favorite events.', 'warning');
      return;
    }

    const wasActive = btnEl ? btnEl.classList.contains('active') : false;
    const prevFavorites = Array.isArray(user.favorites) ? [...user.favorites] : [];

    try {
      const data = await Utils.optimistic(
        () => {
          if (btnEl) btnEl.classList.toggle('active', !wasActive);
          user.favorites = wasActive
            ? prevFavorites.filter((id) => id !== eventId)
            : [...prevFavorites, eventId];
          API.setCurrentUser(user);
        },
        () => API.post(`/users/favorites/${eventId}`, {}),
        () => {
          if (btnEl) btnEl.classList.toggle('active', wasActive);
          user.favorites = prevFavorites;
          API.setCurrentUser(user);
        }
      );

      if (data && Array.isArray(data.favorites)) {
        const latest = API.getCurrentUser() || user;
        latest.favorites = data.favorites;
        API.setCurrentUser(latest);
        if (btnEl) btnEl.classList.toggle('active', data.isFavorite);
      }
      Components.showToast(wasActive ? 'Removed from favorites' : 'Saved to favorites', 'success');
    } catch (err) {
      Components.showToast(err.message, 'error');
    }
  }
};

window.EventsHandler = EventsHandler;
