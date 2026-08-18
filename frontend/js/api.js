/**
 * EventSphere — Unified API Client
 */

const API = {
  BASE_URL: '/api',

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

  async request(endpoint, options = {}) {
    const url = `${this.BASE_URL}${endpoint}`;
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

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 && !endpoint.includes('/auth/login')) {
          // Token expired or invalid
          this.setToken(null);
          this.setCurrentUser(null);
        }
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (err) {
      throw err;
    }
  },

  get(endpoint, params = {}) {
    const query = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        query.append(key, params[key]);
      }
    });
    const queryString = query.toString();
    return this.request(`${endpoint}${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  },

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};

window.API = API;