/**
 * EventSphere — Authentication & User State Manager
 */

const Auth = {
  async login(email, password) {
    try {
      const data = await API.post('/auth/login', { email, password });
      API.setToken(data.token);
      API.setCurrentUser(data.user);
      Components.showToast('Signed in successfully! Welcome back.', 'success');

      const redirect = sessionStorage.getItem('redirect_after_login');
      setTimeout(() => {
        if (redirect) {
          sessionStorage.removeItem('redirect_after_login');
          window.location.href = redirect;
        } else if (data.user.role === 'admin') {
          window.location.href = '/admin/admin-dashboard.html';
        } else if (data.user.role === 'organizer') {
          window.location.href = '/dashboard/dashboard.html';
        } else {
          window.location.href = '/events.html';
        }
      }, 700);
      return data;
    } catch (err) {
      Components.showToast(err.message, 'error');
      throw err;
    }
  },

  async googleLogin(credential) {
    try {
      const data = await API.post('/auth/google', { credential });
      API.setToken(data.token);
      API.setCurrentUser(data.user);
      Components.showToast('Signed in with Google successfully!', 'success');

      const redirect = sessionStorage.getItem('redirect_after_login');
      setTimeout(() => {
        if (redirect) {
          sessionStorage.removeItem('redirect_after_login');
          window.location.href = redirect;
        } else if (data.user.role === 'admin') {
          window.location.href = '/admin/admin-dashboard.html';
        } else if (data.user.role === 'organizer') {
          window.location.href = '/dashboard/dashboard.html';
        } else {
          window.location.href = '/events.html';
        }
      }, 700);
      return data;
    } catch (err) {
      Components.showToast(err.message, 'error');
      throw err;
    }
  },

  async register(userData) {
    try {
      const data = await API.post('/auth/register', userData);
      API.setToken(data.token);
      API.setCurrentUser(data.user);
      Components.showToast('Account created successfully! Welcome to EventSphere.', 'success');

      const redirect = sessionStorage.getItem('redirect_after_login');
      setTimeout(() => {
        if (redirect) {
          sessionStorage.removeItem('redirect_after_login');
          window.location.href = redirect;
        } else if (data.user.role === 'organizer') {
          window.location.href = '/dashboard/dashboard.html';
        } else {
          window.location.href = '/events.html';
        }
      }, 700);
      return data;
    } catch (err) {
      Components.showToast(err.message, 'error');
      throw err;
    }
  },

  logout() {
    API.setToken(null);
    API.setCurrentUser(null);
    Components.showToast('Signed out successfully.', 'info');
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 400);
  },

  // Role-based route guard
  requireAuth(allowedRoles = []) {
    const user = API.getCurrentUser();
    const token = API.getToken();

    if (!user || !token) {
      Components.showToast('Please sign in to access this page.', 'warning');
      sessionStorage.setItem('redirect_after_login', window.location.href);
      window.location.href = '/auth/login.html';
      return false;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      Components.showToast('Access denied: You do not have permission for this portal.', 'error');
      window.location.href = '/index.html';
      return false;
    }

    return true;
  },

  // Password visibility toggles
  initPasswordToggles() {
    document.querySelectorAll('.input-password-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = btn.previousElementSibling;
        if (input && input.type === 'password') {
          input.type = 'text';
          btn.textContent = '👁️';
        } else if (input) {
          input.type = 'password';
          btn.textContent = '👁️‍🗨️';
        }
      });
    });
  }
};

window.Auth = Auth;

// Global callback for Google Identity Services
window.handleGoogleResponse = async function(response) {
  if (response && response.credential) {
    const btn = document.getElementById('submitLoginBtn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Authenticating...';
    }
    try {
      await Auth.googleLogin(response.credential);
    } catch (e) {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Sign In 🚀';
      }
    }
  }
};
