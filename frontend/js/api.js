/**
 * EventSphere — Unified API Client
 * Loading-state tracking, retry, and offline detection.
 */

const API = {
  BASE_URL: '/api',
  MAX_RETRIES: 2,
  RETRY_BASE_MS: 400,

  _pending: 0,
  _listeners: [],
  _lastFailed: null,
  _retryQueue: [],

  getToken() {
    return localStorage.getItem('eventsphere_token');
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('eventsphere_token', token);
    } else {
      localStorage.removeItem('eventsphere_token');
    }
  },

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('eventsphere_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem('eventsphere_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('eventsphere_user');
    }
  },

  isOnline() {
    return typeof navigator === 'undefined' ? true : navigator.onLine !== false;
  },

  isLoading() {
    return this._pending > 0;
  },

  onLoadingChange(fn) {
    this._listeners.push(fn);
    return () => {
      this._listeners = this._listeners.filter((l) => l !== fn);
    };
  },

  _setPending(delta) {
    this._pending = Math.max(0, this._pending + delta);
    const loading = this.isLoading();
    this._listeners.forEach((fn) => {
      try {
        fn(loading, this._pending);
      } catch (e) {
        /* ignore listener errors */
      }
    });
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('api-loading', loading);
      const bar = document.getElementById('apiLoadingBar');
      if (bar) bar.classList.toggle('active', loading);
    }
  },

  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  _isRetryable(err, method, status) {
    if (status && status >= 400 && status < 500) return false;
    if (method && method !== 'GET') return false;
    const msg = (err && err.message) || '';
    return (
      err?.name === 'TypeError' ||
      /failed to fetch|network|offline|load failed|abort/i.test(msg)
    );
  },

  async request(endpoint, options = {}) {
    const url = `${this.BASE_URL}${endpoint}`;
    const method = (options.method || 'GET').toUpperCase();
    const retries = options.retries ?? (method === 'GET' ? this.MAX_RETRIES : 0);
    const silent = !!options.silent;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };
    delete config.retries;
    delete config.silent;

    if (config.body && typeof config.body === 'object' && !(typeof FormData !== 'undefined' && config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    if (!this.isOnline() && method !== 'GET') {
      const offlineErr = new Error('You are offline. Reconnect and retry.');
      offlineErr.code = 'OFFLINE';
      this._lastFailed = { endpoint, options, method };
      if (typeof UX !== 'undefined') UX.showOfflineBanner();
      throw offlineErr;
    }

    if (!silent) this._setPending(1);

    let lastError;
    try {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          if (attempt > 0) {
            await this._sleep(this.RETRY_BASE_MS * Math.pow(2, attempt - 1));
          }

          const response = await fetch(url, config);

          let data = {};
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            data = await response.json();
          } else {
            const text = await response.text();
            try {
              data = text ? JSON.parse(text) : {};
            } catch (e) {
              data = { message: text || 'Unexpected response' };
            }
          }

          if (!response.ok) {
            if (response.status === 401 && !endpoint.includes('/auth/login')) {
              this.setToken(null);
              this.setCurrentUser(null);
            }
            const err = new Error(data.message || `Request failed with status ${response.status}`);
            err.status = response.status;
            if (!this._isRetryable(err, method, response.status)) {
              throw err;
            }
            lastError = err;
            continue;
          }

          this._lastFailed = null;
          return data;
        } catch (err) {
          lastError = err;
          if (err.name === 'AbortError') throw err;
          if (attempt >= retries || !this._isRetryable(err, method, err.status)) {
            throw err;
          }
        }
      }
      throw lastError;
    } catch (err) {
      this._lastFailed = { endpoint, options, method };
      if (!this.isOnline() && typeof UX !== 'undefined') UX.showOfflineBanner();
      throw err;
    } finally {
      if (!silent) this._setPending(-1);
    }
  },

  get(endpoint, params = {}, options = {}) {
    const query = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        query.append(key, params[key]);
      }
    });
    const queryString = query.toString();
    return this.request(`${endpoint}${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      ...options
    });
  },

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { method: 'POST', body, ...options });
  },

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { method: 'PUT', body, ...options });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  },

  retryLast() {
    if (this._lastFailed) {
      const { endpoint, options } = this._lastFailed;
      return this.request(endpoint, options || {});
    }
    if (typeof window !== 'undefined') window.location.reload();
    return Promise.resolve();
  }
};

window.API = API;

/**
 * Global UX: offline banner, top loading bar, service worker, lazy images.
 */
const UX = {
  _bound: false,

  init() {
    if (this._bound || typeof document === 'undefined') return;
    this._bound = true;
    this.injectChrome();
    this.bindOffline();
    this.registerServiceWorker();
    Utils.enhanceLazyImages(document);
    this.observeNewImages();
  },

  injectChrome() {
    if (!document.getElementById('apiLoadingBar')) {
      const bar = document.createElement('div');
      bar.id = 'apiLoadingBar';
      bar.className = 'api-loading-bar';
      bar.setAttribute('role', 'progressbar');
      bar.setAttribute('aria-hidden', 'true');
      document.body.appendChild(bar);
    }

    if (!document.getElementById('offlineBanner')) {
      const banner = document.createElement('div');
      banner.id = 'offlineBanner';
      banner.className = 'offline-banner';
      banner.hidden = true;
      banner.setAttribute('role', 'status');
      banner.innerHTML = `
        <span class="offline-banner-text">You are offline. Changes will retry when the connection returns.</span>
        <button type="button" class="btn btn-sm btn-secondary" id="offlineRetryBtn">Retry</button>
      `;
      document.body.prepend(banner);
      banner.querySelector('#offlineRetryBtn')?.addEventListener('click', () => this.retry());
    }
  },

  bindOffline() {
    const sync = () => {
      if (API.isOnline()) this.hideOfflineBanner();
      else this.showOfflineBanner();
    };
    window.addEventListener('online', () => {
      this.hideOfflineBanner();
      if (typeof Components !== 'undefined') {
        Components.showToast('Back online. Retrying…', 'success');
      }
      this.retry();
    });
    window.addEventListener('offline', () => this.showOfflineBanner());
    sync();
  },

  showOfflineBanner() {
    const banner = document.getElementById('offlineBanner');
    if (banner) {
      banner.hidden = false;
      banner.classList.add('visible');
    }
    document.documentElement.classList.add('is-offline');
  },

  hideOfflineBanner() {
    const banner = document.getElementById('offlineBanner');
    if (banner) {
      banner.hidden = true;
      banner.classList.remove('visible');
    }
    document.documentElement.classList.remove('is-offline');
  },

  retry() {
    if (!API.isOnline()) {
      this.showOfflineBanner();
      return;
    }
    this.hideOfflineBanner();
    API.retryLast().catch(() => {});
  },

  registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    const swUrl = '/sw.js';
    navigator.serviceWorker.register(swUrl).catch(() => {
      /* SW is progressive — ignore failures on file:// or unsupported hosts */
    });
  },

  observeNewImages() {
    if (typeof MutationObserver === 'undefined') return;
    const obs = new MutationObserver(() => Utils.enhanceLazyImages(document));
    obs.observe(document.body, { childList: true, subtree: true });
  }
};

window.UX = UX;

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => UX.init());
  } else {
    UX.init();
  }
}
