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

    heroForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const search = document.getElementById('heroSearchTerm')?.value.trim() || '';
      const city = document.getElementById('heroCitySelect')?.value || 'All';
      const category = document.getElementById('heroCategorySelect')?.value || 'All';

      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (city && city !== 'All') params.append('city', city);
      if (category && category !== 'All') params.append('category', category);

      window.location.href = `/events.html?${params.toString()}`;
    });
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
