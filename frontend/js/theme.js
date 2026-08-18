/**
 * EventSphere — Theme Controller (Light / Dark Mode Engine)
 */

const ThemeManager = {
  THEME_KEY: 'eventsphere_theme',

  init() {
    const savedTheme = localStorage.getItem(this.THEME_KEY) || 
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    this.setTheme(savedTheme);
    this.bindEvents();
  },

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.THEME_KEY, theme);
    this.updateToggleIcons(theme);
  },

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  },

  updateToggleIcons(theme) {
    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    toggleBtns.forEach(btn => {
      btn.innerHTML = theme === 'dark' 
        ? '☀️' 
        : '🌙';
      btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    });
  },

  bindEvents() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.theme-toggle-btn');
      if (btn) {
        this.toggleTheme();
      }
    });
  }
};

// Initialize Theme as early as possible
ThemeManager.init();
window.ThemeManager = ThemeManager;
