/**
 * EventSphere — Event Details & Live Ticket Booking Engine
 */

const EventDetails = {
  event: null,
  selectedTier: null,
  quantity: 1,

  async init() {
    const eventId = Utils.getUrlParam('id');
    if (!eventId) {
      window.location.href = '/events.html';
      return;
    }

    const container = document.getElementById('detailsContainer');
    if (container) {
      container.setAttribute('aria-busy', 'true');
      container.classList.add('is-loading');
    }

    try {
      const data = await API.get(`/events/${eventId}`);
      this.event = data.event;
      this.renderEventDetails(data.event);
      this.renderTicketTiers(data.event.ticketTypes);
      this.renderReviews(data.reviews || []);
      this.renderRelatedEvents(data.relatedEvents || []);
      this.bindBookingEvents();
    } catch (err) {
      Components.showToast(`Error: ${err.message}`, 'error');
      const container = document.getElementById('detailsContainer');
      if (container) {
        container.innerHTML = Components.renderEmptyState(
          'Event Not Found',
          'Looks like this event took a wrong turn or was removed.',
          '<a href="/events.html" class="btn btn-primary btn-sm" style="margin-top: 1rem;">Back to Events</a>'
        );
      }
    } finally {
      if (container) {
        container.setAttribute('aria-busy', 'false');
        container.classList.remove('is-loading');
      }
    }
  },

  renderEventDetails(event) {
    document.title = `${event.title} — EventSphere`;

    // Hero Image & Overlay
    const heroImg = document.getElementById('eventHeroImg');
    const heroTitle = document.getElementById('eventHeroTitle');
    const heroCategory = document.getElementById('eventCategoryBadge');
    const heroDate = document.getElementById('eventDateText');
    const heroTime = document.getElementById('eventTimeText');
    const heroVenue = document.getElementById('eventVenueText');

    if (heroImg) {
      heroImg.loading = 'eager';
      heroImg.decoding = 'async';
      heroImg.src = event.image;
    }
    if (heroTitle) heroTitle.textContent = event.title;
    if (heroCategory) heroCategory.textContent = event.category;
    if (heroDate) heroDate.textContent = Utils.formatDate(event.date);
    if (heroTime) heroTime.textContent = `${event.startTime} - ${event.endTime}`;
    if (heroVenue) heroVenue.textContent = `${event.venueDetails?.name || 'Grand Venue'}, ${event.venueDetails?.city || ''}`;

    // Description & Tags
    const descEl = document.getElementById('eventDescription');
    if (descEl) descEl.textContent = event.description;

    const tagsEl = document.getElementById('eventTagsList');
    if (tagsEl && event.tags) {
      tagsEl.innerHTML = event.tags.map(t => `<span class="badge badge-neutral">#${Utils.escapeHtml(t)}</span>`).join('');
    }

    // Organizer profile
    const orgAvatar = document.getElementById('orgAvatar');
    const orgName = document.getElementById('orgName');
    const orgOrg = document.getElementById('orgOrganization');
    const orgBio = document.getElementById('orgBio');

    if (orgAvatar && event.organizer) orgAvatar.src = event.organizer.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
    if (orgName && event.organizer) orgName.textContent = event.organizer.name;
    if (orgOrg && event.organizer) orgOrg.textContent = event.organizer.organizationName || 'Event Host';
    if (orgBio && event.organizer) orgBio.textContent = event.organizer.bio || 'Passionate event curator creating inspiring gathering spaces.';

    // Venue Details Card
    const venueNameEl = document.getElementById('venueDetailName');
    const venueAddrEl = document.getElementById('venueDetailAddress');
    const venueCapEl = document.getElementById('venueDetailCapacity');

    if (venueNameEl) venueNameEl.textContent = event.venueDetails?.name || (event.venue && event.venue.name) || 'City Convention Hall';
    if (venueAddrEl) venueAddrEl.textContent = `${event.venueDetails?.address || ''}, ${event.venueDetails?.city || ''}`;
    if (venueCapEl) venueCapEl.textContent = `${event.capacity} Attendees Capacity`;
  },

  renderTicketTiers(tiers = []) {
    const container = document.getElementById('ticketTiersList');
    if (!container) return;

    if (!tiers || tiers.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.875rem;">Tickets currently not available.</p>';
      return;
    }

    this.selectedTier = tiers[0];

    container.innerHTML = tiers.map((tier, idx) => `
      <div class="ticket-tier-card ${idx === 0 ? 'selected' : ''}" data-tier-name="${tier.name}" data-tier-price="${tier.price}">
        <div class="ticket-tier-head">
          <span class="ticket-tier-name">${Utils.escapeHtml(tier.name)} Pass</span>
          <span class="ticket-tier-price">${Utils.formatCurrency(tier.price)}</span>
        </div>
        <p class="ticket-tier-desc">${Utils.escapeHtml(tier.description || 'Full session access and event badge')}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-muted);">
          <span>Seats Left: <strong>${tier.availableQuantity}</strong></span>
          <span style="color: var(--color-success);">Instant QR Pass</span>
        </div>
      </div>
    `).join('');

    this.updateOrderSummary();

    // Bind tier card selection click
    container.querySelectorAll('.ticket-tier-card').forEach((card, i) => {
      card.addEventListener('click', () => {
        container.querySelectorAll('.ticket-tier-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedTier = tiers[i];
        this.updateOrderSummary();
      });
    });
  },

  updateOrderSummary() {
    const subtotalEl = document.getElementById('ticketSubtotal');
    const totalEl = document.getElementById('ticketTotal');
    const qtyValEl = document.getElementById('ticketQtyVal');

    if (!this.selectedTier) return;

    const subtotal = this.selectedTier.price * this.quantity;
    if (subtotalEl) subtotalEl.textContent = Utils.formatCurrency(subtotal);
    if (totalEl) totalEl.textContent = Utils.formatCurrency(subtotal);
    if (qtyValEl) qtyValEl.textContent = this.quantity;
  },

  bindBookingEvents() {
    const decBtn = document.getElementById('qtyDecBtn');
    const incBtn = document.getElementById('qtyIncBtn');
    const bookBtn = document.getElementById('openCheckoutModalBtn');

    if (decBtn) {
      decBtn.addEventListener('click', () => {
        if (this.quantity > 1) {
          this.quantity--;
          this.updateOrderSummary();
        }
      });
    }

    if (incBtn) {
      incBtn.addEventListener('click', () => {
        if (this.selectedTier && this.quantity < this.selectedTier.availableQuantity && this.quantity < 10) {
          this.quantity++;
          this.updateOrderSummary();
        } else {
          Components.showToast('Maximum available quantity reached for this tier.', 'warning');
        }
      });
    }

    if (bookBtn) {
      bookBtn.addEventListener('click', () => this.openCheckoutModal());
    }

    // Review submission form
    const reviewForm = document.getElementById('addReviewForm');
    if (reviewForm) {
      reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = API.getCurrentUser();
        if (!user) {
          Components.showToast('Please sign in to post a review.', 'warning');
          return;
        }

        const rating = reviewForm.querySelector('input[name="rating"]:checked')?.value || 5;
        const comment = document.getElementById('reviewCommentInput')?.value;
        const submitBtn = reviewForm.querySelector('button[type="submit"]');
        Utils.setButtonLoading(submitBtn, true, 'Posting review...');

        try {
          await API.post(`/events/${this.event._id}/reviews`, {
            rating: Number(rating),
            comment
          });
          Components.showToast('Review submitted successfully! Thank you.', 'success');
          reviewForm.reset();
          setTimeout(() => window.location.reload(), 800);
        } catch (err) {
          Components.showToast(err.message, 'error');
          Utils.setButtonLoading(submitBtn, false);
        }
      });
    }
  },

  openCheckoutModal() {
    const user = API.getCurrentUser();
    if (!user) {
      Components.showToast('Please sign in to book your tickets.', 'warning');
      sessionStorage.setItem('redirect_after_login', window.location.href);
      setTimeout(() => window.location.href = '/auth/login.html', 600);
      return;
    }

    const modal = document.getElementById('checkoutModal');
    if (!modal) return;

    // Prefill user details in modal
    const nameInput = document.getElementById('checkoutName');
    const emailInput = document.getElementById('checkoutEmail');
    const phoneInput = document.getElementById('checkoutPhone');
    const modalSummaryTier = document.getElementById('modalSummaryTier');
    const modalSummaryTotal = document.getElementById('modalSummaryTotal');

    if (nameInput) nameInput.value = user.name;
    if (emailInput) emailInput.value = user.email;
    if (phoneInput) phoneInput.value = user.phone || '';

    if (modalSummaryTier && this.selectedTier) {
      modalSummaryTier.textContent = `${this.quantity}x ${this.selectedTier.name} Pass`;
    }
    if (modalSummaryTotal && this.selectedTier) {
      modalSummaryTotal.textContent = Utils.formatCurrency(this.selectedTier.price * this.quantity);
    }

    modal.classList.add('active');

    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = checkoutForm.querySelector('button[type="submit"]');
        const statusEl = document.getElementById('checkoutStatus');
        const confirmPanel = document.getElementById('checkoutOptimistic');
        const prevQty = this.selectedTier ? this.selectedTier.availableQuantity : null;

        const applyOptimistic = () => {
          Utils.setButtonLoading(submitBtn, true, 'Confirming booking...');
          checkoutForm.classList.add('is-submitting');
          if (statusEl) {
            statusEl.hidden = false;
            statusEl.textContent = 'Passes reserved — confirming payment…';
          }
          if (confirmPanel) {
            confirmPanel.hidden = false;
            confirmPanel.textContent = `${this.quantity}× ${this.selectedTier?.name || 'Event'} pass added to your wallet.`;
          }
          if (this.selectedTier) {
            this.selectedTier.availableQuantity = Math.max(0, (prevQty || 0) - this.quantity);
          }
        };

        const rollbackOptimistic = () => {
          if (this.selectedTier && prevQty != null) {
            this.selectedTier.availableQuantity = prevQty;
          }
          checkoutForm.classList.remove('is-submitting');
          Utils.setButtonLoading(submitBtn, false);
          if (confirmPanel) confirmPanel.hidden = true;
        };

        try {
          const payload = {
            eventId: this.event._id,
            items: [
              {
                ticketType: this.selectedTier.name,
                quantity: this.quantity
              }
            ],
            attendeeInfo: {
              name: nameInput.value,
              email: emailInput.value,
              phone: phoneInput.value
            },
            paymentMethod: document.getElementById('checkoutPaymentMethod')?.value || 'Credit Card'
          };

          await Utils.optimistic(
            applyOptimistic,
            () => API.post('/tickets/purchase', payload),
            rollbackOptimistic
          );

          modal.classList.remove('active');
          Components.showToast('Tickets Booked Successfully! 🎉 Redirecting to wallet...', 'success');

          setTimeout(() => {
            window.location.href = '/dashboard/tickets.html';
          }, 1000);
        } catch (err) {
          Components.showToast(err.message, 'error');
          if (statusEl) {
            statusEl.hidden = false;
            statusEl.textContent = err.message;
          }
        }
      };
    }
  },

  renderReviews(reviews = []) {
    const listEl = document.getElementById('reviewsList');
    if (!listEl) return;

    if (reviews.length === 0) {
      listEl.innerHTML = '<p style="color: var(--text-muted); font-size: 0.875rem;">No reviews yet. Be the first attendee to review!</p>';
      return;
    }

    listEl.innerHTML = reviews.map(r => `
      <div class="review-item">
        <div class="review-header">
          <div class="review-user-wrap">
            <img src="${r.user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}" class="review-user-avatar" alt="Avatar">
            <div>
              <div style="font-size: 0.875rem; font-weight: 600;">${Utils.escapeHtml(r.user?.name || 'Verified Attendee')}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${Utils.formatDate(r.createdAt, 'short')}</div>
            </div>
          </div>
          <div class="star-rating">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
        </div>
        <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.5;">${Utils.escapeHtml(r.comment)}</p>
      </div>
    `).join('');
  },

  renderRelatedEvents(events = []) {
    const container = document.getElementById('relatedEventsGrid');
    if (!container || events.length === 0) return;

    container.innerHTML = events.map(e => Components.renderEventCard(e)).join('');
    Utils.enhanceLazyImages(container);
  }
};

window.EventDetails = EventDetails;