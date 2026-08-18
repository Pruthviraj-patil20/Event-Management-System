/**
 * EventSphere — Digital Tickets Wallet & QR Pass Engine
 */

const Tickets = {
  tickets: [],

  async init() {
    if (!Auth.requireAuth()) return;

    const container = document.getElementById('myTicketsGrid');
    if (!container) return;

    try {
      const data = await API.get('/tickets/my');
      this.tickets = data.tickets || [];
      this.renderTicketsList();
    } catch (err) {
      container.innerHTML = Components.renderEmptyState('Failed to load tickets', err.message);
    }
  },

  renderTicketsList() {
    const container = document.getElementById('myTicketsGrid');
    if (!container) return;

    if (this.tickets.length === 0) {
      container.innerHTML = Components.renderEmptyState(
        'No Tickets in Your Wallet',
        'You have not booked any events yet. Explore upcoming experiences happening around you!',
        '<a href="/events.html" class="btn btn-primary btn-sm" style="margin-top: 1rem;">Explore Events</a>'
      );
      return;
    }

    container.innerHTML = this.tickets.map(t => `
      <div class="card-base animate-fade-in-up" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <span class="badge ${t.status === 'confirmed' ? 'badge-success' : 'badge-neutral'}">${t.status.toUpperCase()}</span>
            <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted);">${Utils.escapeHtml(t.ticketNumber)}</span>
          </div>

          <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.5rem; line-height: 1.3;">
            ${Utils.escapeHtml(t.event?.title || 'Event Pass')}
          </h3>

          <div style="font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 0.75rem;">
            <div>📅 ${Utils.formatDate(t.event?.date)}</div>
            <div>📍 ${Utils.escapeHtml(t.event?.venueDetails?.name || (t.event?.venue && t.event.venue.name) || 'Main Venue')}</div>
            <div>🎟️ ${Utils.escapeHtml(t.ticketType)} Pass (${Utils.formatCurrency(t.price)})</div>
          </div>
        </div>

        <div style="display: flex; gap: 0.5rem; margin-top: 1rem; border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
          <button onclick="Tickets.openQRModal('${t._id}')" class="btn btn-primary btn-sm" style="flex: 1;">
            📱 View QR Pass
          </button>
          <a href="/event-details.html?id=${t.event?._id}" class="btn btn-secondary btn-sm" title="View Event">
            ℹ️
          </a>
        </div>
      </div>
    `).join('');
  },

  openQRModal(ticketId) {
    const ticket = this.tickets.find(t => t._id === ticketId);
    if (!ticket) return;

    const modal = document.getElementById('ticketQRModal');
    if (!modal) return;

    const modalTitle = document.getElementById('passEventTitle');
    const modalQR = document.getElementById('passQRCodeImg');
    const modalNum = document.getElementById('passTicketNum');
    const modalAttendee = document.getElementById('passAttendeeName');
    const modalTier = document.getElementById('passTier');
    const modalDate = document.getElementById('passDate');
    const modalVenue = document.getElementById('passVenue');

    if (modalTitle) modalTitle.textContent = ticket.event?.title || 'Event Pass';
    if (modalQR) modalQR.src = ticket.qrCodeData;
    if (modalNum) modalNum.textContent = ticket.ticketNumber;
    if (modalAttendee) modalAttendee.textContent = ticket.attendeeName;
    if (modalTier) modalTier.textContent = `${ticket.ticketType} (${ticket.seatNumber || 'General'})`;
    if (modalDate) modalDate.textContent = Utils.formatDate(ticket.event?.date);
    if (modalVenue) modalVenue.textContent = ticket.event?.venueDetails?.name || 'Main Hall';

    modal.classList.add('active');
  },

  printTicket() {
    window.print();
  }
};

window.Tickets = Tickets;
