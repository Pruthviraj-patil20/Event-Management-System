/**
 * EventSphere — Utility Functions & Helpers
 */

const Utils = {
  // Format Date (e.g., "Sat, Oct 24, 2026")
  formatDate(dateString, format = 'medium') {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    if (format === 'short') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    if (format === 'month-day') {
      return {
        month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
        day: date.getDate()
      };
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  },

  // Format Currency (₹ / INR / USD)
  formatCurrency(amount, currency = 'INR') {
    const num = Number(amount) || 0;
    if (num === 0) return 'Free';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(num);
  },

  // Debounce helper for search inputs (supports .cancel())
  debounce(func, wait = 300) {
    let timeout;
    const debounced = function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
    debounced.cancel = () => {
      clearTimeout(timeout);
      timeout = null;
    };
    return debounced;
  },

  throttle(func, wait = 100) {
    let last = 0;
    let timer = null;
    return function (...args) {
      const now = Date.now();
      const remaining = wait - (now - last);
      if (remaining <= 0) {
        clearTimeout(timer);
        timer = null;
        last = now;
        func.apply(this, args);
      } else if (!timer) {
        timer = setTimeout(() => {
          last = Date.now();
          timer = null;
          func.apply(this, args);
        }, remaining);
      }
    };
  },

  /**
   * Bind a debounced input handler once (skips if already bound).
   */
  bindDebouncedSearch(input, handler, wait = 400) {
    if (!input || input.dataset.debounceBound === '1') return null;
    const debounced = this.debounce((e) => handler(e), wait);
    input.addEventListener('input', debounced);
    input.dataset.debounceBound = '1';
    return debounced;
  },

  setBusy(element, busy, busyText) {
    if (!element) return;
    element.setAttribute('aria-busy', busy ? 'true' : 'false');
    element.classList.toggle('is-loading', !!busy);
    if (busy) {
      if (!element.dataset.idleHtml && busyText) {
        element.dataset.idleHtml = element.innerHTML;
        element.innerHTML = busyText;
      }
    } else if (element.dataset.idleHtml) {
      element.innerHTML = element.dataset.idleHtml;
      delete element.dataset.idleHtml;
    }
  },

  setButtonLoading(btn, loading, label = 'Working...') {
    if (!btn) return;
    if (loading) {
      if (!btn.dataset.idleHtml) btn.dataset.idleHtml = btn.innerHTML;
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      btn.innerHTML = `<span class="spinner spinner-inline"></span> ${this.escapeHtml(label)}`;
    } else {
      btn.disabled = false;
      btn.removeAttribute('aria-busy');
      if (btn.dataset.idleHtml) {
        btn.innerHTML = btn.dataset.idleHtml;
        delete btn.dataset.idleHtml;
      }
    }
  },

  /**
   * Run an optimistic UI mutation. Applies immediately, rolls back if request fails.
   */
  async optimistic(apply, request, rollback) {
    try {
      apply();
      return await request();
    } catch (err) {
      if (typeof rollback === 'function') rollback();
      throw err;
    }
  },

  PLACEHOLDER_IMG:
    'data:image/svg+xml,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450"><rect fill="#e5e7eb" width="100%" height="100%"/></svg>'
    ),

  enhanceLazyImages(root = typeof document !== 'undefined' ? document : null) {
    if (!root || typeof IntersectionObserver === 'undefined') {
      if (root) {
        root.querySelectorAll('img[data-src]').forEach((img) => {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          img.classList.add('is-loaded');
        });
      }
      return;
    }

    const imgs = root.querySelectorAll('img[data-src], img.lazy-img');
    if (!imgs.length) return;

    if (!this._lazyObserver) {
      this._lazyObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const img = entry.target;
            const src = img.dataset.src;
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
            }
            img.classList.add('is-loaded');
            this._lazyObserver.unobserve(img);
          });
        },
        { rootMargin: '240px 0px', threshold: 0.01 }
      );
    }

    imgs.forEach((img) => this._lazyObserver.observe(img));
  },

  // Sanitize text strings against XSS in DOM rendering
  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  // Get URL Query Parameter
  getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }
};

/**
 * Windowed rendering for long lists / admin tables (enabled when item count > 50).
 */
const VirtualList = {
  THRESHOLD: 50,
  DEFAULT_OVERSCAN: 4,

  shouldVirtualize(count) {
    return Number(count) > this.THRESHOLD;
  },

  getVisibleRange({
    scrollTop = 0,
    viewportHeight = 600,
    itemCount = 0,
    itemHeight = 72,
    overscan = 4,
    columns = 1
  } = {}) {
    const col = Math.max(1, columns);
    const rowHeight = itemHeight;
    const rowCount = Math.ceil(itemCount / col);
    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const visibleRows = Math.ceil(viewportHeight / rowHeight) + overscan * 2;
    const endRow = Math.min(rowCount, startRow + visibleRows);
    const startIndex = startRow * col;
    const endIndex = Math.min(itemCount, endRow * col);
    const offsetY = startRow * rowHeight;
    const totalHeight = rowCount * rowHeight;
    return { startRow, endRow, startIndex, endIndex, offsetY, totalHeight, rowCount };
  },

  mount(options) {
    const {
      viewport,
      items = [],
      itemHeight = 380,
      columns = 1,
      overscan = this.DEFAULT_OVERSCAN,
      renderItems
    } = options;

    if (!viewport || typeof renderItems !== 'function') return { destroy() {} };

    viewport.classList.add('virtual-list-viewport');
    viewport.innerHTML = `
      <div class="virtual-list-spacer" data-virtual-spacer></div>
      <div class="virtual-list-window" data-virtual-window></div>
    `;
    const spacer = viewport.querySelector('[data-virtual-spacer]');
    const windowEl = viewport.querySelector('[data-virtual-window]');

    const paint = () => {
      const range = this.getVisibleRange({
        scrollTop: viewport.scrollTop,
        viewportHeight: viewport.clientHeight || 600,
        itemCount: items.length,
        itemHeight,
        overscan,
        columns
      });
      spacer.style.height = `${range.totalHeight}px`;
      windowEl.style.transform = `translateY(${range.offsetY}px)`;
      const slice = items.slice(range.startIndex, range.endIndex);
      renderItems(windowEl, slice, range);
    };

    const onScroll = Utils.throttle(paint, 32);
    viewport.addEventListener('scroll', onScroll, { passive: true });
    paint();

    return {
      refresh: paint,
      destroy() {
        viewport.removeEventListener('scroll', onScroll);
      }
    };
  },

  renderTableRows({ tbody, items, itemHeight = 64, colSpan = 8, viewport, renderRow, overscan = 6, onPaint }) {
    if (!tbody) return { destroy() {} };

    const afterPaint = () => {
      if (typeof onPaint === 'function') onPaint(tbody);
    };

    if (!this.shouldVirtualize(items.length)) {
      tbody.innerHTML = items.map(renderRow).join('');
      afterPaint();
      return { destroy() {} };
    }

    const scroller = viewport || tbody.closest('.admin-table-scroll') || tbody.parentElement;
    scroller.classList.add('virtual-table-scroll');
    if (!scroller.style.maxHeight) scroller.style.maxHeight = '70vh';

    const paint = () => {
      const range = this.getVisibleRange({
        scrollTop: scroller.scrollTop,
        viewportHeight: scroller.clientHeight || 480,
        itemCount: items.length,
        itemHeight,
        overscan,
        columns: 1
      });
      const slice = items.slice(range.startIndex, range.endIndex);
      const padTop = range.offsetY;
      const padBottom = Math.max(0, range.totalHeight - padTop - slice.length * itemHeight);
      tbody.innerHTML =
        `<tr class="virtual-pad-row" aria-hidden="true"><td colspan="${colSpan}" style="height:${padTop}px;padding:0;border:0;"></td></tr>` +
        slice.map(renderRow).join('') +
        `<tr class="virtual-pad-row" aria-hidden="true"><td colspan="${colSpan}" style="height:${padBottom}px;padding:0;border:0;"></td></tr>`;
      afterPaint();
    };

    const onScroll = Utils.throttle(paint, 32);
    scroller.addEventListener('scroll', onScroll, { passive: true });
    paint();
    return {
      refresh: paint,
      destroy() {
        scroller.removeEventListener('scroll', onScroll);
      }
    };
  }
};

window.Utils = Utils;
window.VirtualList = VirtualList;
