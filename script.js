/**
 * ============================================================================
 * BUSINESS: Shoreline Private Parking (தனியார் வாகனக் காப்பகம்)
 * LOCATION: Kayalpattinam Beach, Tamil Nadu
 * SCRIPT:   Interactive Client Functionality (Vanilla JS)
 * VERSION:  2.0.0 - Integrated with Real Photos, Videos & WhatsApp Dispatch
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* -------------------------------------------------------------------------- */
  /*  1. SELECTORS & STATE                                                      */
  /* -------------------------------------------------------------------------- */
  const header = document.getElementById('site-header');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const backToTopBtn = document.getElementById('back-to-top');

  // Booking elements
  const reservationForm = document.getElementById('reservation-form');
  const planSelect = document.getElementById('book-plan');
  const spotsSelect = document.getElementById('book-spots');
  const arrivalInput = document.getElementById('book-arrival');
  const departureInput = document.getElementById('book-departure');
  const addonEv = document.getElementById('addon-ev');
  const addonWash = document.getElementById('addon-wash');
  const priceDisplay = document.getElementById('price-estimate-total');
  const priceBreakdown = document.getElementById('price-calculation-breakdown');
  const planButtons = document.querySelectorAll('.select-plan-btn');

  // Lightbox elements
  const lightbox = document.getElementById('lightbox');
  const lightboxMedia = document.getElementById('lightbox-media');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const lightboxBackdrop = document.getElementById('lightbox-backdrop');
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  const galleryFilters = document.querySelectorAll('.gallery-filter-btn');

  // Confirmation modal elements
  const bookingModal = document.getElementById('booking-modal');
  const bookingModalClose = document.getElementById('booking-modal-close');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const receiptContainer = document.getElementById('modal-receipt-content');

  // Contact form
  const contactForm = document.getElementById('contact-inquiry-form');

  let activeGalleryList = [...galleryItems];
  let currentLightboxIndex = 0;
  let lastActiveElement = null;

  /* -------------------------------------------------------------------------- */
  /*  2. STICKY HEADER & SCROLL BEHAVIOR                                       */
  /* -------------------------------------------------------------------------- */
  const handleScroll = () => {
    const scrollPos = window.scrollY || window.pageYOffset;

    if (header) {
      if (scrollPos > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    if (backToTopBtn) {
      if (scrollPos > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* -------------------------------------------------------------------------- */
  /*  3. MOBILE NAVIGATION TOGGLE                                              */
  /* -------------------------------------------------------------------------- */
  const toggleMobileMenu = (forceState) => {
    const isOpen = typeof forceState === 'boolean' 
      ? forceState 
      : navMenu.classList.contains('open');

    if (isOpen) {
      navMenu.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    } else {
      navMenu.classList.add('open');
      navToggle.classList.add('open');
      navToggle.setAttribute('aria-expanded', 'true');
    }
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => toggleMobileMenu());

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        toggleMobileMenu(true);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        toggleMobileMenu(true);
        navToggle.focus();
      }
    });
  }

  /* -------------------------------------------------------------------------- */
  /*  4. SCROLL SPY ACTIVE NAV LINK                                            */
  /* -------------------------------------------------------------------------- */
  const sections = document.querySelectorAll('section[id]');
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => navObserver.observe(section));

  /* -------------------------------------------------------------------------- */
  /*  5. DEFAULT DATES INITIALIZATION (CURRENT TIME + OFFSET)                   */
  /* -------------------------------------------------------------------------- */
  const formatDateTimeLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const initializeDates = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(0);
    now.setSeconds(0);

    const departure = new Date(now.getTime());
    departure.setHours(departure.getHours() + 4);

    if (arrivalInput && !arrivalInput.value) {
      arrivalInput.value = formatDateTimeLocal(now);
      arrivalInput.min = formatDateTimeLocal(new Date());
    }
    if (departureInput && !departureInput.value) {
      departureInput.value = formatDateTimeLocal(departure);
      departureInput.min = arrivalInput.value;
    }
  };

  initializeDates();

  /* -------------------------------------------------------------------------- */
  /*  6. LIVE DYNAMIC PRICE CALCULATOR (INR ₹)                                  */
  /* -------------------------------------------------------------------------- */
  const calculateEstimatedPrice = () => {
    if (!planSelect || !priceDisplay) return;

    const plan = planSelect.value;
    const spotsCount = parseInt(spotsSelect.value, 10) || 1;
    const isEvCharging = addonEv && addonEv.checked ? 100.00 : 0.00;
    const isCarWash = addonWash && addonWash.checked ? 150.00 : 0.00;

    let baseRate = 0;
    let breakdownText = '';

    const arrival = new Date(arrivalInput.value);
    const departure = new Date(departureInput.value);
    const durationMs = departure - arrival;
    const durationHours = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60)));
    const durationDays = Math.max(1, Math.ceil(durationHours / 24));

    if (plan === 'hourly') {
      const extraHours = Math.max(0, durationHours - 3);
      baseRate = 50.00 + (extraHours * 20.00);
      breakdownText = `${durationHours} hrs total (${spotsCount} car${spotsCount > 1 ? 's' : ''})`;
    } else if (plan === 'daily') {
      baseRate = durationDays * 150.00;
      breakdownText = `${durationDays} day(s) Full Beach Pass`;
    } else if (plan === 'monthly') {
      baseRate = 1200.00;
      breakdownText = `Monthly 24/7 dedicated stall pass`;
    }

    const subtotal = (baseRate * spotsCount) + isEvCharging + isCarWash;
    priceDisplay.textContent = `₹${subtotal.toFixed(2)}`;

    let addonsList = [];
    if (isEvCharging > 0) addonsList.push('+ ₹100 EV Fast Charge');
    if (isCarWash > 0) addonsList.push('+ ₹150 Car Wash');
    if (addonsList.length > 0) {
      breakdownText += ' (' + addonsList.join(', ') + ')';
    }

    if (priceBreakdown) {
      priceBreakdown.textContent = breakdownText;
    }
  };

  [planSelect, spotsSelect, arrivalInput, departureInput, addonEv, addonWash].forEach(input => {
    if (input) {
      input.addEventListener('change', calculateEstimatedPrice);
      input.addEventListener('input', calculateEstimatedPrice);
    }
  });

  calculateEstimatedPrice();

  /* -------------------------------------------------------------------------- */
  /*  7. SYNC PRICING BUTTONS WITH BOOKING FORM                                 */
  /* -------------------------------------------------------------------------- */
  planButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedPlan = btn.getAttribute('data-plan');
      if (planSelect && selectedPlan) {
        planSelect.value = selectedPlan;
        calculateEstimatedPrice();

        const bookingSection = document.getElementById('booking');
        if (bookingSection) {
          bookingSection.scrollIntoView({ behavior: 'smooth' });
          planSelect.focus();
          planSelect.classList.add('is-focused');
          setTimeout(() => planSelect.classList.remove('is-focused'), 1200);
        }
      }
    });
  });

  /* -------------------------------------------------------------------------- */
  /*  8. CLIENT-SIDE RESERVATION FORM VALIDATION & CONFIRMATION                 */
  /* -------------------------------------------------------------------------- */
  const validateField = (input, errorEl, condition, message) => {
    if (!condition) {
      input.classList.add('is-invalid');
      input.setAttribute('aria-invalid', 'true');
      if (errorEl) errorEl.textContent = message;
      return false;
    } else {
      input.classList.remove('is-invalid');
      input.removeAttribute('aria-invalid');
      if (errorEl) errorEl.textContent = '';
      return true;
    }
  };

  if (reservationForm) {
    reservationForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('book-name');
      const phoneInput = document.getElementById('book-phone');
      const vehicleInput = document.getElementById('book-vehicle');
      const plateInput = document.getElementById('book-plate');

      const errName = document.getElementById('error-name');
      const errPhone = document.getElementById('error-phone');
      const errVehicle = document.getElementById('error-vehicle');
      const errPlate = document.getElementById('error-plate');
      const errDeparture = document.getElementById('error-departure');

      const isNameValid = validateField(
        nameInput, errName,
        nameInput.value.trim().length >= 2,
        'Please enter your full name.'
      );

      const phoneRegex = /^[\d\s\(\)\-\+\.]{7,15}$/;
      const isPhoneValid = validateField(
        phoneInput, errPhone,
        phoneRegex.test(phoneInput.value.trim()),
        'Please enter a valid phone/WhatsApp number.'
      );

      const isVehicleValid = validateField(
        vehicleInput, errVehicle,
        vehicleInput.value.trim().length >= 2,
        'Please specify your vehicle model.'
      );

      const isPlateValid = validateField(
        plateInput, errPlate,
        plateInput.value.trim().length >= 2,
        'Vehicle registration number is required for gate entry.'
      );

      const arrivalDate = new Date(arrivalInput.value);
      const departureDate = new Date(departureInput.value);

      const isDatesValid = validateField(
        departureInput, errDeparture,
        departureDate > arrivalDate,
        'Departure time must be after arrival time.'
      );

      if (isNameValid && isPhoneValid && isVehicleValid && isPlateValid && isDatesValid) {
        const refNumber = 'SPP-' + Math.floor(10000 + Math.random() * 90000);
        const planText = planSelect.options[planSelect.selectedIndex].text;
        const totalCost = priceDisplay.textContent;

        const addonsSummary = [];
        if (addonEv && addonEv.checked) addonsSummary.push('EV Fast Charge (+ ₹100)');
        if (addonWash && addonWash.checked) addonsSummary.push('Freshwater Car Wash (+ ₹150)');

        renderReceiptModal({
          ref: refNumber,
          name: nameInput.value.trim(),
          phone: phoneInput.value.trim(),
          vehicle: vehicleInput.value.trim(),
          plate: plateInput.value.trim().toUpperCase(),
          plan: planText,
          arrival: arrivalDate.toLocaleString(),
          departure: departureDate.toLocaleString(),
          spots: spotsSelect.value,
          addons: addonsSummary.length > 0 ? addonsSummary.join(', ') : 'Standard Parking Bay',
          total: totalCost
        });

        reservationForm.reset();
        initializeDates();
        calculateEstimatedPrice();
      } else {
        const firstInvalid = reservationForm.querySelector('.is-invalid');
        if (firstInvalid) firstInvalid.focus();
      }
    });
  }

  const renderReceiptModal = (data) => {
    if (!receiptContainer || !bookingModal) return;

    const rawAmount = (data.total || '').replace(/[^\d.]/g, '') || '150';
    const upiPayUri = `upi://pay?pa=visitkhaja@okicici&pn=Shoreline%20Private%20Parking&am=${encodeURIComponent(rawAmount)}&cu=INR&tn=Booking-${encodeURIComponent(data.ref)}`;

    const whatsappMessage = encodeURIComponent(
      `*Shoreline Private Parking - Booking Confirmation*\n` +
      `Pass Ref: ${data.ref}\n` +
      `Driver: ${data.name}\n` +
      `Phone: ${data.phone}\n` +
      `Vehicle: ${data.vehicle} (${data.plate})\n` +
      `Plan: ${data.plan}\n` +
      `Arrival: ${data.arrival}\n` +
      `Departure: ${data.departure}\n` +
      `Services: ${data.addons}\n` +
      `Total: ${data.total}\n` +
      `Payment UPI ID: visitkhaja@okicici (Central Bank of India)\n` +
      `Location: Kayalpattinam Beach, Tamil Nadu`
    );

    receiptContainer.innerHTML = `
      <div class="receipt-card">
        <div class="receipt-header">
          <div class="receipt-success-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 id="modal-confirm-title" style="font-size: 1.45rem; margin-bottom: 4px;">Reservation Confirmed!</h2>
          <p style="color: var(--color-text-muted); font-size: 0.88rem;">Shoreline Private Parking &bull; Kayalpattinam Beach</p>
          <div class="receipt-ref-code">${data.ref}</div>
        </div>

        <div class="receipt-body">
          <div class="receipt-row"><span>Driver:</span> <strong>${data.name}</strong></div>
          <div class="receipt-row"><span>Phone:</span> <strong>${data.phone}</strong></div>
          <div class="receipt-row"><span>Vehicle:</span> <strong>${data.vehicle} (${data.plate})</strong></div>
          <div class="receipt-row"><span>Plan:</span> <strong>${data.plan}</strong></div>
          <div class="receipt-row"><span>Arrival:</span> <strong>${data.arrival}</strong></div>
          <div class="receipt-row"><span>Departure:</span> <strong>${data.departure}</strong></div>
          <div class="receipt-row"><span>Services:</span> <strong>${data.addons}</strong></div>
          <div class="receipt-row" style="font-size: 1.15rem; color: var(--color-primary-900); font-weight: 800; border-top: 1px dashed var(--color-border); padding-top: 8px;">
            <span>Estimated Total:</span>
            <span style="color: #00A896;">${data.total}</span>
          </div>
        </div>

        <!-- Official Payment QR Section -->
        <div class="receipt-payment-qr-box">
          <div class="receipt-qr-header">
            <span class="qr-title">Scan & Pay via UPI</span>
            <span class="qr-subtitle">Google Pay &bull; PhonePe &bull; Paytm &bull; BHIM</span>
          </div>
          <div class="receipt-qr-img-wrapper">
            <img src="assets/images/payment-qr.png" alt="Scan to pay parking pass via UPI" class="receipt-qr-img" width="175" height="184">
          </div>
          <div class="receipt-upi-id-badge">
            <span class="upi-label">UPI ID:</span>
            <span class="upi-val">visitkhaja@okicici</span>
            <button type="button" class="btn-copy-sm" id="modal-copy-upi-btn" title="Copy UPI ID to clipboard">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <span>Copy</span>
            </button>
          </div>
          <div class="receipt-bank-note">Central Bank of India &bull; A/C ending 4085</div>
          <a href="${upiPayUri}" class="btn--upi-pay-now">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            <span>Pay ${data.total} via UPI App (Mobile)</span>
          </a>
        </div>

        <div class="receipt-barcode">
          ||| | ||||| || |||||| | ||| |||| | |||
          <div style="font-size: 0.72rem; letter-spacing: 1px; margin-top: 4px;">SHOW AT KAYALPATTINAM BEACH ENTRANCE</div>
        </div>

        <div class="receipt-actions">
          <a href="https://wa.me/919994548247?text=${whatsappMessage}" target="_blank" rel="noopener noreferrer" class="btn btn--whatsapp-lg btn--block">
            <span>Send Pass to WhatsApp</span>
          </a>
          <button type="button" class="btn btn--outline btn--block" onclick="window.print()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            <span>Print Parking Pass</span>
          </button>
        </div>
      </div>
    `;

    const modalCopyBtn = document.getElementById('modal-copy-upi-btn');
    if (modalCopyBtn) {
      modalCopyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText('visitkhaja@okicici').then(() => {
          const span = modalCopyBtn.querySelector('span');
          if (span) {
            span.textContent = 'Copied!';
            setTimeout(() => { span.textContent = 'Copy'; }, 2000);
          }
        }).catch(() => {});
      });
    }

    openModal(bookingModal);
  };

  /* -------------------------------------------------------------------------- */
  /*  9. MODAL HANDLERS & ACCESSIBLE FOCUS TRAP                                */
  /* -------------------------------------------------------------------------- */
  const openModal = (modalEl) => {
    lastActiveElement = document.activeElement;
    modalEl.classList.add('active');
    modalEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const closeBtn = modalEl.querySelector('button');
    if (closeBtn) closeBtn.focus();
  };

  const closeModal = (modalEl) => {
    modalEl.classList.remove('active');
    modalEl.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastActiveElement) lastActiveElement.focus();
  };

  if (bookingModalClose) {
    bookingModalClose.addEventListener('click', () => closeModal(bookingModal));
  }
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', () => closeModal(bookingModal));
  }

  /* -------------------------------------------------------------------------- */
  /*  10. LIGHTBOX FUNCTIONALITY (PHOTOS & VIDEOS)                             */
  /* -------------------------------------------------------------------------- */
  const updateLightboxContent = (index) => {
    if (!activeGalleryList[index]) return;
    currentLightboxIndex = index;
    const item = activeGalleryList[index];
    const type = item.getAttribute('data-type') || 'image';
    const src = item.getAttribute('data-src');
    const caption = item.getAttribute('data-caption') || '';

    lightboxMedia.innerHTML = '';

    if (type === 'video') {
      const videoEl = document.createElement('video');
      videoEl.setAttribute('controls', 'true');
      videoEl.setAttribute('autoplay', 'true');
      videoEl.setAttribute('playsinline', 'true');
      videoEl.style.width = '100%';
      videoEl.style.maxHeight = '70vh';
      const poster = item.getAttribute('data-poster');
      if (poster) videoEl.setAttribute('poster', poster);

      const sourceEl = document.createElement('source');
      sourceEl.setAttribute('src', src);
      sourceEl.setAttribute('type', 'video/mp4');

      videoEl.appendChild(sourceEl);
      lightboxMedia.appendChild(videoEl);
    } else {
      const imgEl = document.createElement('img');
      imgEl.setAttribute('src', src);
      imgEl.setAttribute('alt', caption);
      lightboxMedia.appendChild(imgEl);
    }

    if (lightboxCaption) lightboxCaption.textContent = caption;
    if (lightboxCounter) {
      lightboxCounter.textContent = `${index + 1} of ${activeGalleryList.length}`;
    }
  };

  const openLightbox = (index) => {
    updateLightboxContent(index);
    openModal(lightbox);
  };

  const closeLightbox = () => {
    const video = lightboxMedia.querySelector('video');
    if (video) video.pause();
    lightboxMedia.innerHTML = '';
    closeModal(lightbox);
  };

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);

  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', () => {
      const prevIndex = (currentLightboxIndex - 1 + activeGalleryList.length) % activeGalleryList.length;
      updateLightboxContent(prevIndex);
    });
  }

  if (lightboxNext) {
    lightboxNext.addEventListener('click', () => {
      const nextIndex = (currentLightboxIndex + 1) % activeGalleryList.length;
      updateLightboxContent(nextIndex);
    });
  }

  galleryItems.forEach((item) => {
    const triggerAction = () => {
      const index = activeGalleryList.indexOf(item);
      if (index !== -1) {
        openLightbox(index);
      }
    };

    item.addEventListener('click', triggerAction);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerAction();
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      lightboxPrev.click();
    } else if (e.key === 'ArrowRight') {
      lightboxNext.click();
    }
  });

  /* -------------------------------------------------------------------------- */
  /*  11. GALLERY FILTER TABS                                                  */
  /* -------------------------------------------------------------------------- */
  galleryFilters.forEach(filterBtn => {
    filterBtn.addEventListener('click', () => {
      galleryFilters.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      });
      filterBtn.classList.add('active');
      filterBtn.setAttribute('aria-selected', 'true');

      const filterValue = filterBtn.getAttribute('data-filter');

      activeGalleryList = [];
      galleryItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (filterValue === 'all' || itemCategory === filterValue) {
          item.classList.remove('hidden');
          activeGalleryList.push(item);
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  /* -------------------------------------------------------------------------- */
  /*  12. QUICK INQUIRY FORM HANDLER (WHATSAPP DISPATCH)                        */
  /* -------------------------------------------------------------------------- */
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('contact-name');
      const phoneInput = document.getElementById('contact-phone');
      const messageInput = document.getElementById('contact-message');

      const errName = document.getElementById('error-contact-name');
      const errPhone = document.getElementById('error-contact-phone');
      const errMessage = document.getElementById('error-contact-message');

      const isNameOk = validateField(nameInput, errName, nameInput.value.trim().length >= 2, 'Please enter your name.');
      const isPhoneOk = validateField(phoneInput, errPhone, phoneInput.value.trim().length >= 7, 'Please enter a valid phone number.');
      const isMsgOk = validateField(messageInput, errMessage, messageInput.value.trim().length >= 5, 'Please enter your enquiry message.');

      if (isNameOk && isPhoneOk && isMsgOk) {
        const msg = encodeURIComponent(
          `*Enquiry for Shoreline Private Parking (Kayalpattinam Beach)*\n` +
          `Name: ${nameInput.value.trim()}\n` +
          `Phone: ${phoneInput.value.trim()}\n` +
          `Message: ${messageInput.value.trim()}`
        );

        window.open(`https://wa.me/919994548247?text=${msg}`, '_blank');
        contactForm.reset();
      }
    });
  }

  /* -------------------------------------------------------------------------- */
  /*  13. STANDALONE UPI ID COPY HANDLER                                        */
  /* -------------------------------------------------------------------------- */
  const copyUpiBtn = document.getElementById('copy-upi-btn');
  if (copyUpiBtn) {
    copyUpiBtn.addEventListener('click', () => {
      const upiField = document.getElementById('upi-id-field');
      const val = upiField ? upiField.value : 'visitkhaja@okicici';
      navigator.clipboard.writeText(val).then(() => {
        const span = copyUpiBtn.querySelector('span');
        if (span) {
          span.textContent = 'Copied!';
          setTimeout(() => { span.textContent = 'Copy'; }, 2000);
        }
      }).catch(() => {});
    });
  }

});

