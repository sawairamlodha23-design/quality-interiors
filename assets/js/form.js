/**
 * Quality Interiors — Consultation & Lead Booking Form Engine
 * Real Backend Submission to Google Apps Script + Google Sheets Lead Database
 * Google Analytics Conversion Tracking & Anti-Spam Protection
 */

// =============================================================================
// BACKEND CONFIGURATION
// Paste your deployed Google Apps Script Web App URL here after deployment.
// =============================================================================
const GOOGLE_SCRIPT_URL = "PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";

document.addEventListener('DOMContentLoaded', () => {
  initConsultationForm();
  initPrivacyModal();
});

/**
 * Main Consultation Form Handler
 */
function initConsultationForm() {
  const form = document.getElementById('project-booking-form');
  const successModal = document.getElementById('booking-success-modal');
  const alertContainer = document.getElementById('form-alert-msg');
  if (!form) return;

  const submitBtn = form.querySelector('.form-submit-btn');
  let isSubmitting = false;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Prevent duplicate clicks while a request is already in-flight
    if (isSubmitting) return;

    // Reset previous general alert
    hideAlert(alertContainer);

    // Validate form fields
    const isValid = validateForm(form);
    if (!isValid) {
      const firstError = form.querySelector('.form-group.has-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Honeypot spam check
    const honeypotInput = document.getElementById('form-website-field');
    const honeypotVal = honeypotInput ? honeypotInput.value.trim() : '';
    if (honeypotVal) {
      // Silently drop spam submission without submitting
      showAlert(
        alertContainer,
        'Submission received. Thank you.',
        'info'
      );
      form.reset();
      return;
    }

    // Capture Form Field Values
    const nameInput = document.getElementById('form-name');
    const phoneInput = document.getElementById('form-phone');
    const emailInput = document.getElementById('form-email');
    const cityInput = document.getElementById('form-city');
    const projectTypeSelect = document.getElementById('form-project-type');
    const budgetSelect = document.getElementById('form-budget');
    const dateInput = document.getElementById('form-date');
    const detailsInput = document.getElementById('form-details');

    const fullName = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const city = cityInput ? cityInput.value.trim() : '';
    const projectType = projectTypeSelect ? projectTypeSelect.value : '';
    const budget = budgetSelect ? budgetSelect.value : 'Flexible';
    const preferredDate = dateInput ? dateInput.value : '';
    const projectDetails = detailsInput ? detailsInput.value.trim() : '';

    // Capture UTM Parameters & Page URL
    const utmParams = getUrlParams();
    const pageUrl = window.location.href;

    const payload = {
      fullName,
      phone,
      email,
      city,
      projectType,
      budget,
      preferredDate,
      projectDetails,
      pageUrl,
      utmSource: utmParams.utmSource,
      utmMedium: utmParams.utmMedium,
      utmCampaign: utmParams.utmCampaign,
      honeypot: honeypotVal
    };

    // Check if Google Apps Script URL has been configured
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL === "PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE") {
      showAlert(
        alertContainer,
        'Backend configuration required: Please deploy the Google Apps Script Web App and paste its URL into GOOGLE_SCRIPT_URL in assets/js/form.js.',
        'info'
      );
      return;
    }

    // Enter Loading State
    isSubmitting = true;
    const originalBtnHtml = submitBtn.innerHTML;
    submitBtn.innerHTML = `
      <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 0.8s linear infinite; margin-right: 8px;">
        <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="12"></circle>
      </svg>
      <span>Scheduling Consultation...</span>
    `;
    submitBtn.disabled = true;

    try {
      // Send real POST request to Google Apps Script Web App
      // Using text/plain content-type prevents CORS preflight failure with Google Apps Script
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload),
        redirect: 'follow'
      });

      let responseData = null;
      const responseText = await response.text();

      try {
        responseData = JSON.parse(responseText);
      } catch (parseErr) {
        // In case Google Apps Script returned formatted plain text
        if (responseText && (responseText.includes('"success":true') || responseText.includes('"success": true'))) {
          responseData = { success: true };
        }
      }

      if (responseData && responseData.success === true) {
        // =====================================================================
        // SUCCESS FLOW
        // =====================================================================

        // 1. Populate details into the existing success modal
        const clientNameEl = document.getElementById('success-client-name');
        const projectTypeEl = document.getElementById('success-project-type');
        const prefDateEl = document.getElementById('success-pref-date');

        if (clientNameEl) clientNameEl.textContent = fullName || 'Client';
        if (projectTypeEl) projectTypeEl.textContent = projectType || 'Interior Project';
        if (prefDateEl) prefDateEl.textContent = preferredDate || 'Upcoming Week';

        // 2. Display success modal
        if (successModal) {
          successModal.classList.add('is-active');
          document.body.classList.add('no-scroll');
        }

        // 3. Fire Google Analytics conversion event (NO PII sent)
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'consultation_request', {
            event_category: 'lead_generation',
            event_label: 'consultation_form'
          });
        }

        // 4. Reset form & clear validation errors
        form.reset();
        clearErrors(form);
        hideAlert(alertContainer);
      } else {
        // Server returned failure response
        const serverMessage = responseData?.message || 'Unable to submit your request at this moment.';
        showAlert(
          alertContainer,
          `${serverMessage} Please try again or contact us directly at +91 98223 97417 or qualityinteriors93@gmail.com.`,
          'error'
        );
      }
    } catch (networkError) {
      // Network failure, offline, or script execution error
      showAlert(
        alertContainer,
        'Something went wrong while submitting your request. Please check your connection or contact us directly at +91 98223 97417 or qualityinteriors93@gmail.com.',
        'error'
      );
    } finally {
      // Restore submit button state
      submitBtn.innerHTML = originalBtnHtml;
      submitBtn.disabled = false;
      isSubmitting = false;
    }
  });

  // Clear errors when the user interacts with input fields
  form.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('input', () => {
      const group = input.closest('.form-group');
      if (group && group.classList.contains('has-error')) {
        group.classList.remove('has-error');
      }
      hideAlert(alertContainer);
    });

    if (input.tagName === 'SELECT') {
      input.addEventListener('change', () => {
        const group = input.closest('.form-group');
        if (group && group.classList.contains('has-error')) {
          group.classList.remove('has-error');
        }
        hideAlert(alertContainer);
      });
    }
  });

  // Success modal dismiss handlers
  if (successModal) {
    const closeBtn = successModal.querySelector('.modal-close-btn');
    const dismissBtn = successModal.querySelector('.modal-dismiss-btn');

    const closeModal = () => {
      successModal.classList.remove('is-active');
      document.body.classList.remove('no-scroll');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (dismissBtn) dismissBtn.addEventListener('click', closeModal);

    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && successModal.classList.contains('is-active')) {
        closeModal();
      }
    });
  }
}

/**
 * Validate all required fields
 */
function validateForm(form) {
  let isValid = true;
  clearErrors(form);

  const nameInput = document.getElementById('form-name');
  const phoneInput = document.getElementById('form-phone');
  const emailInput = document.getElementById('form-email');
  const cityInput = document.getElementById('form-city');
  const projectTypeSelect = document.getElementById('form-project-type');

  // 1. Full Name: min 2 characters
  if (!nameInput || !nameInput.value.trim() || nameInput.value.trim().length < 2) {
    showError(nameInput, 'Please enter your full name (at least 2 characters)');
    isValid = false;
  }

  // 2. Phone: Indian phone format (supports +91, spaces, hyphens, min 10 digits)
  if (!phoneInput || !validatePhoneNumber(phoneInput.value.trim())) {
    showError(phoneInput, 'Please enter a valid 10-digit phone number');
    isValid = false;
  }

  // 3. Email: valid email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailInput || !emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
    showError(emailInput, 'Please enter a valid email address');
    isValid = false;
  }

  // 4. City / Location: not empty
  if (!cityInput || !cityInput.value.trim()) {
    showError(cityInput, 'Please enter your city or project location');
    isValid = false;
  }

  // 5. Project Type: must be selected
  if (!projectTypeSelect || !projectTypeSelect.value) {
    showError(projectTypeSelect, 'Please select a project type');
    isValid = false;
  }

  return isValid;
}

/**
 * Validates Indian & international phone formats
 */
function validatePhoneNumber(phone) {
  if (!phone) return false;
  // Strip spaces, hyphens, parens, plus
  const digitsOnly = phone.replace(/[^0-9]/g, '');
  // Should have between 10 and 13 digits
  return digitsOnly.length >= 10 && digitsOnly.length <= 13;
}

/**
 * Display field-level error
 */
function showError(element, message) {
  if (!element) return;
  const group = element.closest('.form-group');
  if (!group) return;
  group.classList.add('has-error');
  const errorEl = group.querySelector('.form-error');
  if (errorEl) {
    errorEl.textContent = message;
  }
}

/**
 * Clear all field-level errors
 */
function clearErrors(form) {
  form.querySelectorAll('.form-group.has-error').forEach(g => {
    g.classList.remove('has-error');
  });
}

/**
 * Show general form status alert
 */
function showAlert(container, message, type = 'error') {
  if (!container) return;
  container.className = `form-alert-container ${type === 'error' ? 'form-alert-error' : 'form-alert-info'}`;
  
  const icon = type === 'error' 
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="8"></line></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="8"></line></svg>`;

  container.innerHTML = `${icon}<span>${message}</span>`;
  container.style.display = 'flex';
  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Hide general form alert
 */
function hideAlert(container) {
  if (!container) return;
  container.style.display = 'none';
  container.innerHTML = '';
}

/**
 * Extract UTM query parameters from URL safely
 */
function getUrlParams() {
  try {
    const params = new URLSearchParams(window.location.search);
    return {
      utmSource: params.get('utm_source') || '',
      utmMedium: params.get('utm_medium') || '',
      utmCampaign: params.get('utm_campaign') || ''
    };
  } catch (e) {
    return { utmSource: '', utmMedium: '', utmCampaign: '' };
  }
}

/**
 * Privacy Policy Modal Handler
 */
function initPrivacyModal() {
  const privacyModal = document.getElementById('privacy-modal');
  const privacyLinks = document.querySelectorAll('.privacy-link-trigger');

  if (!privacyModal || !privacyLinks.length) return;

  const closeBtn = privacyModal.querySelector('.modal-close-btn');

  privacyLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      privacyModal.classList.add('is-active');
      document.body.classList.add('no-scroll');
    });
  });

  const closeModal = () => {
    privacyModal.classList.remove('is-active');
    document.body.classList.remove('no-scroll');
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  privacyModal.addEventListener('click', (e) => {
    if (e.target === privacyModal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && privacyModal.classList.contains('is-active')) {
      closeModal();
    }
  });
}
