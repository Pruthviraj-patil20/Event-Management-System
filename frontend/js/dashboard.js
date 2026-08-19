/**
 * EventSphere — Organizer & SaaS Dashboard Controller
 */

const Dashboard = {
  async initOverview() {
    if (!Auth.requireAuth(['organizer', 'admin'])) return;

    try {
      const data = await API.get('/analytics/overview');
      this.renderOverviewStats(data.stats);
      this.renderRecentRegistrations(data.recentRegistrations || []);
    } catch (err) {
      Components.showToast(`Failed to load dashboard metrics: ${err.message}`, 'error');
    }
  },

  renderOverviewStats(stats) {
    if (!stats) return;

    const totalEventsEl = document.getElementById('statTotalEvents');
    const ticketsSoldEl = document.getElementById('statTicketsSold');
    const attendeesEl = document.getElementById('statTotalAttendees');
    const revenueEl = document.getElementById('statTotalRevenue');

    if (totalEventsEl) totalEventsEl.textContent = stats.totalEvents || 0;
    if (ticketsSoldEl) ticketsSoldEl.textContent = stats.ticketsSold || 0;
    if (attendeesEl) attendeesEl.textContent = stats.checkedInCount || 0;
    if (revenueEl) revenueEl.textContent = Utils.formatCurrency(stats.totalRevenue || 0);
  },

  renderRecentRegistrations(registrations = []) {
    const tbody = document.getElementById('recentRegistrationsTable');
    if (!tbody) return;

    if (registrations.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">No recent bookings recorded.</td></tr>`;
      return;
    }

    tbody.innerHTML = registrations.map(reg => `
      <tr>
        <td>
          <div class="table-user-cell">
            <img src="${reg.user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}" class="table-avatar" alt="Avatar">
            <div>
              <div class="table-title-main">${Utils.escapeHtml(reg.attendeeInfo?.name || reg.user?.name || 'Attendee')}</div>
              <div class="table-sub-text">${Utils.escapeHtml(reg.attendeeInfo?.email || reg.user?.email || '')}</div>
            </div>
          </div>
        </td>
        <td>
          <div class="table-title-main">${Utils.escapeHtml(reg.event?.title || 'Event')}</div>
          <div class="table-sub-text">${Utils.formatDate(reg.event?.date, 'short')}</div>
        </td>
        <td>
          <span class="badge badge-primary">${reg.items?.map(i => `${i.quantity}x ${i.ticketType}`).join(', ') || 'Ticket'}</span>
        </td>
        <td style="font-weight: 700;">
          ${Utils.formatCurrency(reg.totalAmount)}
        </td>
        <td>
          <span class="badge badge-success">Paid</span>
        </td>
      </tr>
    `).join('');
  },

  // My Events List
  async initMyEvents() {
    if (!Auth.requireAuth(['organizer', 'admin'])) return;

    const tbody = document.getElementById('myEventsTableBody');
    if (!tbody) return;

    try {
      const data = await API.get('/events/my/created');
      const events = data.events || [];

      if (events.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-muted);">You haven't published any events yet. <a href="/dashboard/create-event.html" class="btn btn-primary btn-sm" style="margin-left: 0.5rem;">Create Event</a></td></tr>`;
        return;
      }

      tbody.innerHTML = events.map(e => `
        <tr>
          <td>
            <div class="table-user-cell">
              <img src="${e.image}" style="width: 48px; height: 48px; border-radius: var(--radius-sm); object-fit: cover;" alt="Cover">
              <div>
                <div class="table-title-main">${Utils.escapeHtml(e.title)}</div>
                <div class="table-sub-text">${Utils.escapeHtml(e.category)} • ${Utils.escapeHtml(e.venueDetails?.name || 'Main Hall')}</div>
              </div>
            </div>
          </td>
          <td>${Utils.formatDate(e.date)}</td>
          <td>${e.capacity - e.availableSeats} / ${e.capacity}</td>
          <td>
            <span class="badge ${e.status === 'published' ? 'badge-success' : e.status === 'pending' ? 'badge-warning' : 'badge-neutral'}">
              ${e.status.toUpperCase()}
            </span>
          </td>
          <td>
            <div class="table-actions">
              <a href="/event-details.html?id=${e._id}" class="table-action-btn" title="View Public Page">👁️</a>
              <a href="/dashboard/edit-event.html?id=${e._id}" class="table-action-btn" title="Edit Event">✏️</a>
              <button onclick="Dashboard.deleteEvent('${e._id}')" class="table-action-btn" style="color: var(--color-error);" title="Delete Event">🗑️</button>
            </div>
          </td>
        </tr>
      `).join('');
    } catch (err) {
      Components.showToast(err.message, 'error');
    }
  },

  async deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    try {
      await API.delete(`/events/${eventId}`);
      Components.showToast('Event deleted successfully', 'success');
      this.initMyEvents();
    } catch (err) {
      Components.showToast(err.message, 'error');
    }
  },

  // Create Event Form Handler
  initCreateEventForm() {
    if (!Auth.requireAuth(['organizer', 'admin'])) return;

    const form = document.getElementById('createEventForm');
    if (!form) return;

    // Image URL preview sync
    const imgInput = document.getElementById('eventImageUrl');
    const previewBox = document.getElementById('imagePreviewBox');
    const previewImg = document.getElementById('imagePreviewImg');

    if (imgInput && previewBox && previewImg) {
      imgInput.addEventListener('input', (e) => {
        if (e.target.value.trim().length > 5) {
          previewImg.src = e.target.value;
          previewBox.style.display = 'block';
        } else {
          previewBox.style.display = 'none';
        }
      });
    }

    if (typeof Locations !== 'undefined' && Locations.setupCascadingDropdown) {
      Locations.setupCascadingDropdown({
        stateSelect: '#venueState',
        citySelect: '#venueCity',
        defaultState: 'Maharashtra',
        defaultCity: 'Mumbai',
        statePlaceholder: 'Select State / UT',
        cityPlaceholder: 'Select City'
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Creating Event...';
      }

      try {
        const payload = {
          title: document.getElementById('eventTitle').value,
          category: document.getElementById('eventCategory').value,
          description: document.getElementById('eventDescription').value,
          shortDescription: document.getElementById('eventShortDescription')?.value || '',
          date: document.getElementById('eventDate').value,
          startTime: document.getElementById('eventStartTime').value,
          endTime: document.getElementById('eventEndTime').value,
          venueName: document.getElementById('venueName').value,
          venueAddress: document.getElementById('venueAddress').value,
          venueState: document.getElementById('venueState')?.value || '',
          venueCity: document.getElementById('venueCity')?.value || '',
          capacity: parseInt(document.getElementById('eventCapacity').value, 10),
          image: document.getElementById('eventImageUrl').value || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
          ticketTypes: [
            {
              name: 'Standard',
              price: Number(document.getElementById('stdTicketPrice')?.value || 499),
              quantity: Math.floor(parseInt(document.getElementById('eventCapacity').value, 10) * 0.7) || 100,
              description: 'Standard session pass and refreshments'
            },
            {
              name: 'VIP',
              price: Number(document.getElementById('vipTicketPrice')?.value || 1499),
              quantity: Math.floor(parseInt(document.getElementById('eventCapacity').value, 10) * 0.3) || 30,
              description: 'Priority seating and VIP lounge pass'
            }
          ],
          tags: document.getElementById('eventTags')?.value ? document.getElementById('eventTags').value.split(',').map(t => t.trim()) : []
        };

        const result = await API.post('/events', payload);
        Components.showToast('Event created successfully! 🚀', 'success');

        setTimeout(() => {
          window.location.href = '/dashboard/my-events.html';
        }, 800);
      } catch (err) {
        Components.showToast(err.message, 'error');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Publish Event';
        }
      }
    });
  },

  // Attendees Roster
  async initAttendees() {
    if (!Auth.requireAuth(['organizer', 'admin'])) return;

    const tbody = document.getElementById('attendeesTableBody');
    if (!tbody) return;

    try {
      const data = await API.get('/attendees');
      const attendees = data.attendees || [];

      if (attendees.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 3rem; color: var(--text-muted);">No attendee registrations found yet.</td></tr>`;
        return;
      }

      tbody.innerHTML = attendees.map(t => `
        <tr>
          <td>
            <div class="table-user-cell">
              <div style="font-weight: 700; font-family: var(--font-mono);">${Utils.escapeHtml(t.ticketNumber)}</div>
            </div>
          </td>
          <td>
            <div class="table-title-main">${Utils.escapeHtml(t.attendeeName)}</div>
            <div class="table-sub-text">${Utils.escapeHtml(t.attendeeEmail)}</div>
          </td>
          <td>${Utils.escapeHtml(t.event?.title || 'N/A')}</td>
          <td><span class="badge badge-primary">${Utils.escapeHtml(t.ticketType)}</span></td>
          <td>${Utils.formatCurrency(t.price)}</td>
          <td>
            <span class="badge ${t.status === 'used' ? 'badge-success' : 'badge-warning'}">
              ${t.status === 'used' ? 'Checked In' : 'Confirmed'}
            </span>
          </td>
          <td>
            <button onclick="Dashboard.checkInTicket('${t._id}', this)" class="btn btn-secondary btn-sm" ${t.status === 'used' ? 'disabled' : ''}>
              ${t.status === 'used' ? '✓ In' : 'Check In'}
            </button>
          </td>
        </tr>
      `).join('');
    } catch (err) {
      Components.showToast(err.message, 'error');
    }
  },

  async checkInTicket(ticketId, btn) {
    if (!btn || btn.disabled) return;
    const row = btn.closest('tr');
    const badge = row ? row.querySelector('.badge') : null;
    const prevHtml = btn.innerHTML;
    const prevDisabled = btn.disabled;
    const prevBadge = badge ? badge.outerHTML : '';

    try {
      await Utils.optimistic(
        () => {
          Utils.setButtonLoading(btn, true, 'Checking in...');
          if (badge) {
            badge.className = 'badge badge-success';
            badge.textContent = 'Checked In';
          }
        },
        () => API.post(`/tickets/${ticketId}/checkin`, {}),
        () => {
          btn.innerHTML = prevHtml;
          btn.disabled = prevDisabled;
          btn.removeAttribute('aria-busy');
          delete btn.dataset.idleHtml;
          if (badge && prevBadge) badge.outerHTML = prevBadge;
        }
      );
      btn.disabled = true;
      delete btn.dataset.idleHtml;
      btn.removeAttribute('aria-busy');
      btn.textContent = '✓ In';
      Components.showToast('Attendee checked in', 'success');
    } catch (err) {
      Components.showToast(err.message, 'error');
    }
  }
};

window.Dashboard = Dashboard;
