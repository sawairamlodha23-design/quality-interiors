/**
 * Quality Interiors — Consultation & Lead Booking Form Engine
 * Handles Validation, Interactive Submission Feedback & Success Modal
 */

document.addEventListener('DOMContentLoaded', () => {
  initConsultationForm();
  initPrivacyModal();
});

function initConsultationForm() {
  const form = document.getElementById('project-booking-form');
  const successModal = document.getElementById('booking-success-modal');
  if (!form) return;

  const submitBtn = form.querySelector('.form-submit-btn');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const isValid = validateForm(form);
    if (!isValid) {
      const firstError = form.querySelector('.form-group.has-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Show loading state
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = `
      <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 0.8s linear infinite;">
        <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="12"></circle>
      </svg>
      <span>Scheduling Consultation...</span>
    `;
    submitBtn.disabled = true;

    // Simulate reliable API response
    setTimeout(() => {
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;

      // Extract details for the success modal
      const name = document.getElementById('form-name')?.value || 'Client';
      const projectType = document.getElementById('form-project-type')?.value || 'Interior Project';
      const date = document.getElementById('form-date')?.value || 'Upcoming Week';

      document.getElementById('success-client-name').textContent = name;
      document.getElementById('success-project-type').textContent = projectType;
      document.getElementById('success-pref-date').textContent = date;

      if (successModal) {
        successModal.classList.add('is-active');
        document.body.classList.add('no-scroll');
      }

      form.reset();
      clearErrors(form);
    }, 1200);
  });

  // Clear errors on input
  form.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('input', () => {
      const group = input.closest('.form-group');
      if (group && group.classList.contains('has-error')) {
        group.classList.remove('has-error');
      }
    });
  });

  // Success modal close handler
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
  }
}

function validateForm(form) {
  let isValid = true;
  clearErrors(form);

  const nameInput = document.getElementById('form-name');
  const phoneInput = document.getElementById('form-phone');
  const emailInput = document.getElementById('form-email');
  const cityInput = document.getElementById('form-city');
  const projectTypeSelect = document.getElementById('form-project-type');

  if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
    showError(nameInput, 'Please enter your full name');
    isValid = false;
  }

  const phoneRegex = /^[0-9+\s\-]{8,15}$/;
  if (!phoneInput.value.trim() || !phoneRegex.test(phoneInput.value.trim())) {
    showError(phoneInput, 'Please enter a valid phone number');
    isValid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
    showError(emailInput, 'Please enter a valid email address');
    isValid = false;
  }

  if (!cityInput.value.trim()) {
    showError(cityInput, 'Please enter your city or project location');
    isValid = false;
  }

  if (!projectTypeSelect.value) {
    showError(projectTypeSelect, 'Please select a project type');
    isValid = false;
  }

  return isValid;
}

function showError(element, message) {
  const group = element.closest('.form-group');
  if (!group) return;
  group.classList.add('has-error');
  const errorEl = group.querySelector('.form-error');
  if (errorEl) {
    errorEl.textContent = message;
  }
}

function clearErrors(form) {
  form.querySelectorAll('.form-group.has-error').forEach(g => {
    g.classList.remove('has-error');
  });
}

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
}
