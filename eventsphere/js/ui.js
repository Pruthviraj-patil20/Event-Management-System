/**
 * EVENTSPHERE — UI COMPONENTS, MODALS, AND MICRO-INTERACTIONS
 * Pure Vanilla JavaScript ES6+
 */

const UI = {
  /**
   * Initializes Toast notification container
   */
  initToasts() {
    if (!document.querySelector('.toast-container')) {
      const container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
  },

  /**
   * Shows a toast message
   * @param {string} message 
   * @param {string} type 'success' | 'info' | 'error'
   * @param {number} duration 
   */
  showToast(message, type = 'success', duration = 3200) {
    this.initToasts();
    const container = document.querySelector('.toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' ? '✓' : (type === 'error' ? '✕' : 'ℹ');
    toast.innerHTML = `
      <span style="font-weight: 800; color: ${type === 'success' ? 'var(--accent-emerald)' : 'var(--accent-blue)'};">${icon}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  /**
   * Quick View Event Modal
   */
  openQuickView(eventId) {
    const allEvents = window.EVENT_DATASET || window.MOCK_EVENTS || (typeof EVENT_DATASET !== 'undefined' ? EVENT_DATASET : (typeof MOCK_EVENTS !== 'undefined' ? MOCK_EVENTS : []));
    const event = allEvents.find(e => e.id === Number(eventId));
    if (!event) return;

    let backdrop = document.getElementById('quickViewModal');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'quickViewModal';
      backdrop.className = 'modal-backdrop';
      document.body.appendChild(backdrop);
    }

    const status = typeof getEventStatus === 'function' ? getEventStatus(event) : (typeof window.getEventStatus === 'function' ? window.getEventStatus(event) : 'UPCOMING');
    const timeInfo = typeof formatEventTimeRange === 'function' 
      ? formatEventTimeRange(event.startDateTime, event.endDateTime) 
      : (typeof window.formatEventTimeRange === 'function' ? window.formatEventTimeRange(event.startDateTime, event.endDateTime) : { date: event.formattedDate || 'Upcoming', timeRange: event.time || '' });
    const countdown = typeof getTimeRemainingString === 'function' 
      ? getTimeRemainingString(event) 
      : (typeof window.getTimeRemainingString === 'function' ? window.getTimeRemainingString(event) : '');
    const priceText = event.isFree ? 'FREE ENTRY' : `₹${event.price.toLocaleString('en-IN')}`;

    let statusBadgeHTML = '';
    if (status === 'LIVE') {
      statusBadgeHTML = `<span class="badge-live-now"><span class="live-pulse-dot"></span> LIVE NOW</span>`;
    } else {
      statusBadgeHTML = `<span class="badge-upcoming">${countdown}</span>`;
    }

    backdrop.innerHTML = `
      <div class="modal-container" role="dialog" aria-modal="true">
        <button class="modal-close-btn" aria-label="Close modal">✕</button>
        <div style="position: relative; height: 240px; overflow: hidden; border-radius: var(--radius-xl) var(--radius-xl) 0 0;">
          <img src="${event.image}" alt="${event.title}" style="width: 100%; height: 100%; object-fit: cover;" />
          <div style="position: absolute; top: 16px; left: 16px; display: flex; gap: 8px; z-index: 2;">
            ${statusBadgeHTML}
            <span class="event-category-pill">${event.category}</span>
          </div>
        </div>
        <div style="padding: 28px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
            <span style="font-size: 0.8125rem; font-weight: 700; color: ${status === 'LIVE' ? '#ef4444' : 'var(--accent-indigo)'};">
              📅 ${timeInfo.date} • ⏰ ${timeInfo.timeRange}
            </span>
            <span style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: ${event.isFree ? 'var(--accent-emerald)' : 'var(--text-primary)'};">${priceText}</span>
          </div>
          <h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 10px; line-height: 1.25;">${event.title}</h2>
          <p style="font-size: 0.875rem; color: var(--text-tertiary); margin-bottom: 14px; display: flex; align-items: center; gap: 6px;">
            📍 <span><strong>${event.city}</strong>, ${event.state} • ${event.venue || event.location}</span>
          </p>
          <p style="font-size: 0.9375rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px;">
            ${event.description}
          </p>
          <div style="display: flex; gap: 10px; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid var(--border-subtle); flex-wrap: wrap;">
            <a href="https://maps.google.com/?q=${encodeURIComponent((event.venue || event.location) + ' ' + event.city)}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost btn-sm" style="color: var(--accent-blue);">
              🗺️ Get Directions ↗
            </a>
            <div style="display: flex; gap: 10px;">
              <a href="event-details.html?id=${event.id}" class="btn btn-secondary">
                View Full Details
              </a>
              <button class="btn btn-primary" onclick="UI.openBookingModal(${event.id})">
                Get Tickets →
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Close listeners
    const closeBtn = backdrop.querySelector('.modal-close-btn');
    closeBtn.addEventListener('click', () => UI.closeModal(backdrop));
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) UI.closeModal(backdrop);
    });
  },

  /**
   * Ticket Booking Checkout & QR Generator Modal
   */
  openBookingModal(eventId, selectedTier = 'General') {
    const allEvents = window.EVENT_DATASET || window.MOCK_EVENTS || (typeof EVENT_DATASET !== 'undefined' ? EVENT_DATASET : (typeof MOCK_EVENTS !== 'undefined' ? MOCK_EVENTS : []));
    const event = allEvents.find(e => e.id === Number(eventId));
    if (!event) return;

    // Close any previous open modal
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));

    let backdrop = document.getElementById('bookingModal');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'bookingModal';
      backdrop.className = 'modal-backdrop';
      document.body.appendChild(backdrop);
    }

    const basePrice = event.isFree ? 0 : event.price;
    const tierMultiplier = selectedTier === 'VIP' ? 2 : (selectedTier === 'All-Access' ? 3 : 1);
    const initialTotal = basePrice * tierMultiplier;

    backdrop.innerHTML = `
      <div class="modal-container" role="dialog" aria-modal="true">
        <button class="modal-close-btn" aria-label="Close modal">✕</button>
        <div style="padding: 32px;" id="bookingFlowContainer">
          <div style="text-align: center; margin-bottom: 24px;">
            <span class="section-badge">Fast Checkout</span>
            <h2 style="font-size: 1.5rem; font-weight: 800; margin-top: 6px;">Reserve Your Spot</h2>
            <p style="font-size: 0.875rem; color: var(--text-secondary);">${event.title}</p>
          </div>

          <form id="checkoutForm">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input type="text" class="form-input" id="buyerName" placeholder="e.g. Raj Patil" required />
            </div>
            <div class="form-group">
              <label class="form-label">Email Address (for QR ticket delivery)</label>
              <input type="email" class="form-input" id="buyerEmail" placeholder="raj@example.com" required />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
              <div>
                <label class="form-label">Pass Tier</label>
                <select class="form-select" id="buyerTier">
                  <option value="General" ${selectedTier === 'General' ? 'selected' : ''}>General Access (1x)</option>
                  <option value="VIP" ${selectedTier === 'VIP' ? 'selected' : ''}>VIP Lounge Pass (2x)</option>
                  <option value="All-Access" ${selectedTier === 'All-Access' ? 'selected' : ''}>All-Access VIP + Workshop (3x)</option>
                </select>
              </div>
              <div>
                <label class="form-label">Quantity</label>
                <select class="form-select" id="buyerQty">
                  <option value="1">1 Ticket</option>
                  <option value="2">2 Tickets</option>
                  <option value="3">3 Tickets</option>
                  <option value="4">4 Tickets</option>
                </select>
              </div>
            </div>

            <div style="background: var(--bg-tertiary); padding: 16px 20px; border-radius: var(--radius-md); margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 0.8125rem; color: var(--text-tertiary);">Total Amount</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Includes all taxes & entry access</div>
              </div>
              <div style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: var(--accent-blue);" id="modalTotalPrice">
                ${event.isFree ? 'FREE' : `₹${initialTotal.toLocaleString('en-IN')}`}
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">
              Complete Booking & Generate Pass ✨
            </button>
          </form>
        </div>
      </div>
    `;

    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Interactive price calculations
    const tierSelect = backdrop.querySelector('#buyerTier');
    const qtySelect = backdrop.querySelector('#buyerQty');
    const totalEl = backdrop.querySelector('#modalTotalPrice');

    const updatePrice = () => {
      if (event.isFree) {
        totalEl.textContent = 'FREE';
        return;
      }
      const tMult = tierSelect.value === 'VIP' ? 2 : (tierSelect.value === 'All-Access' ? 3 : 1);
      const qty = Number(qtySelect.value);
      const total = basePrice * tMult * qty;
      totalEl.textContent = `₹${total.toLocaleString('en-IN')}`;
    };

    tierSelect.addEventListener('change', updatePrice);
    qtySelect.addEventListener('change', updatePrice);

    // Checkout submission
    const form = backdrop.querySelector('#checkoutForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = backdrop.querySelector('#buyerName').value.trim();
      const email = backdrop.querySelector('#buyerEmail').value.trim();
      const tier = tierSelect.value;
      const qty = qtySelect.value;
      const passId = 'ESP-' + Math.random().toString(36).substring(2, 9).toUpperCase();

      const flowContainer = backdrop.querySelector('#bookingFlowContainer');
      flowContainer.innerHTML = `
        <div style="text-align: center;">
          <div style="font-size: 2.5rem; margin-bottom: 8px;">🎉</div>
          <span class="section-badge" style="background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald);">Booking Confirmed!</span>
          <h2 style="font-size: 1.4rem; font-weight: 800; margin-top: 8px;">You're Going to ${event.title}!</h2>
          <p style="font-size: 0.875rem; color: var(--text-secondary);">Confirmation email sent to <strong>${email}</strong></p>

          <div class="ticket-qr-pass">
            <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.8;">EventSphere Digital Pass</div>
            <h3 style="font-size: 1.125rem; font-weight: 700; margin: 4px 0 12px; color: #fff;">${event.title}</h3>
            
            <!-- Dynamic SVG QR Code Simulation -->
            <div class="ticket-qr-code">
              <svg viewBox="0 0 100 100" width="100%" height="100%" fill="#0a0d14">
                <rect x="0" y="0" width="30" height="30" fill="#000"/>
                <rect x="5" y="5" width="20" height="20" fill="#fff"/>
                <rect x="10" y="10" width="10" height="10" fill="#000"/>
                
                <rect x="70" y="0" width="30" height="30" fill="#000"/>
                <rect x="75" y="5" width="20" height="20" fill="#fff"/>
                <rect x="80" y="10" width="10" height="10" fill="#000"/>

                <rect x="0" y="70" width="30" height="30" fill="#000"/>
                <rect x="5" y="75" width="20" height="20" fill="#fff"/>
                <rect x="10" y="80" width="10" height="10" fill="#000"/>

                <rect x="35" y="10" width="10" height="10" fill="#000"/>
                <rect x="50" y="20" width="10" height="15" fill="#000"/>
                <rect x="35" y="45" width="30" height="15" fill="#000"/>
                <rect x="75" y="45" width="15" height="10" fill="#000"/>
                <rect x="40" y="70" width="20" height="10" fill="#000"/>
                <rect x="70" y="75" width="15" height="15" fill="#000"/>
              </svg>
            </div>

            <div style="font-family: monospace; font-size: 0.8125rem; letter-spacing: 0.1em; color: #94a3b8;">PASS ID: ${passId}</div>
            <div style="font-size: 0.75rem; color: #cbd5e1; margin-top: 6px;">Attendee: <strong>${name}</strong> • ${qty}x ${tier} Pass</div>
          </div>

          <div style="margin-top: 24px; display: flex; gap: 12px; justify-content: center;">
            <button class="btn btn-secondary" onclick="window.print()">
              🖨️ Print Pass
            </button>
            <button class="btn btn-primary" onclick="UI.closeModal(document.getElementById('bookingModal'))">
              Done
            </button>
          </div>
        </div>
      `;

      UI.showToast(`Pass issued for ${name}! Check your email.`, 'success');
    });

    const closeBtn = backdrop.querySelector('.modal-close-btn');
    closeBtn.addEventListener('click', () => UI.closeModal(backdrop));
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) UI.closeModal(backdrop);
    });
  },

  /**
   * Closes open modal
   */
  closeModal(modalElement) {
    if (!modalElement) return;
    modalElement.classList.remove('open');
    document.body.style.overflow = '';
  },

  /**
   * Animated Counter Engine for About page & Stats banners
   */
  initAnimatedCounters() {
    const counters = document.querySelectorAll('[data-target]');
    if (counters.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = Number(el.dataset.target);
          const suffix = el.dataset.suffix || '';
          const prefix = el.dataset.prefix || '';
          let count = 0;
          const step = Math.ceil(target / 45);

          const interval = setInterval(() => {
            count += step;
            if (count >= target) {
              count = target;
              clearInterval(interval);
            }
            el.textContent = `${prefix}${count.toLocaleString('en-IN')}${suffix}`;
          }, 30);

          observer.unobserve(el);
        }
      });
    }, { threshold: 0.2 });

    counters.forEach(c => observer.observe(c));
  },

  /**
   * FAQ Accordion Handler
   */
  initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const header = item.querySelector('.faq-header');
      if (header) {
        header.addEventListener('click', () => {
          const isOpen = item.classList.contains('active');
          faqItems.forEach(i => i.classList.remove('active'));
          if (!isOpen) {
            item.classList.add('active');
          }
        });
      }
    });
  }
};

// Global ESC key listener to dismiss modals
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-backdrop.open').forEach(m => UI.closeModal(m));
  }
});

// Expose globally on window
if (typeof window !== 'undefined') {
  window.UI = UI;
}
