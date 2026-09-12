document.addEventListener('DOMContentLoaded', () => {// [cite: 7]
  let currentStep = 1;// [cite: 7]

  // Form DOM elements// [cite: 7]
  const signupForm = document.getElementById('signupForm');// [cite: 7]
  const steps = document.querySelectorAll('.form-step');// [cite: 7]
  const dots = document.querySelectorAll('.step-dot');// [cite: 7]
  const serverError = document.getElementById('server-error-msg');// [cite: 7]
  const submitBtn = document.getElementById('submitBtn');// [cite: 7]

  // Input fields// [cite: 7]
  const fullnameInput = document.getElementById('fullname');// [cite: 7]
  const usernameInput = document.getElementById('username');// [cite: 7]
  const emailInput = document.getElementById('email');// [cite: 7]
  const passwordInput = document.getElementById('password');// [cite: 7]
  const confirmPasswordInput = document.getElementById('confirm_password');// [cite: 7]

  // Error containers// [cite: 7]
  const fullnameError = document.getElementById('fullname-error');// [cite: 7]
  const usernameError = document.getElementById('username-error');// [cite: 7]
  const emailError = document.getElementById('email-error');// [cite: 7]
  const passwordError = document.getElementById('password-error');// [cite: 7]
  const confirmPasswordError = document.getElementById('confirm-password-error');// [cite: 7]

  // Advance step or submit on Enter key press// [cite: 7]
  signupForm.addEventListener('keydown', (e) => {// [cite: 7]
    if (e.key === 'Enter') {// [cite: 7]
      e.preventDefault();// [cite: 7]
      if (currentStep < 3) {// [cite: 7]
        if (validateStep(currentStep)) {// [cite: 7]
          goToStep(currentStep + 1);// [cite: 7]
        }
      } else {// [cite: 7]
        handleFinalSubmit();// [cite: 7]
      }
    }
  });

  // Next step navigation trigger// [cite: 7]
  document.querySelectorAll('[data-next]').forEach((btn) => {// [cite: 7]
    btn.addEventListener('click', (e) => {// [cite: 7]
      e.preventDefault();// [cite: 7]
      if (validateStep(currentStep)) {// [cite: 7]
        goToStep(currentStep + 1);// [cite: 7]
      }
    });
  });

  // Previous step navigation trigger// [cite: 7]
  document.querySelectorAll('[data-back]').forEach((btn) => {// [cite: 7]
    btn.addEventListener('click', (e) => {// [cite: 7]
      e.preventDefault();// [cite: 7]
      goToStep(currentStep - 1);// [cite: 7]
    });
  });

  // Switch visible form step and update step indicators// [cite: 7]
  function goToStep(stepNumber) {// [cite: 7]
    currentStep = stepNumber;// [cite: 7]

    steps.forEach((step) => {// [cite: 7]
      const stepIndex = parseInt(step.getAttribute('data-step'), 10);// [cite: 7]
      step.hidden = stepIndex !== currentStep;// [cite: 7]
    });

    dots.forEach((dot) => {// [cite: 7]
      const dotIndex = parseInt(dot.getAttribute('data-dot'), 10);// [cite: 7]
      dot.classList.toggle('active', dotIndex <= currentStep);// [cite: 7]
    });

    clearServerError();// [cite: 7]
  }

  // Validate fields for steps 1 and 2// [cite: 7]
  function validateStep(step) {// [cite: 7]
    let isValid = true;// [cite: 7]

    if (step === 1) {// [cite: 7]
      if (!fullnameInput.value.trim()) {// [cite: 7]
        showFieldError(fullnameError, fullnameInput, 'Full name is required.');// [cite: 7]
        isValid = false;// [cite: 7]
      } else {// [cite: 7]
        clearFieldError(fullnameError, fullnameInput);// [cite: 7]
      }

      if (!usernameInput.value.trim()) {// [cite: 7]
        showFieldError(usernameError, usernameInput, 'Username is required.');// [cite: 7]
        isValid = false;// [cite: 7]
      } else if (usernameInput.value.trim().length < 3) {// [cite: 7]
        showFieldError(usernameError, usernameInput, 'Username must be at least 3 characters.');// [cite: 7]
        isValid = false;// [cite: 7]
      } else {// [cite: 7]
        clearFieldError(usernameError, usernameInput);// [cite: 7]
      }
    }

    if (step === 2) {// [cite: 7]
      const emailVal = emailInput.value.trim();// [cite: 7]
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;// [cite: 7]
      if (!emailVal) {// [cite: 7]
        showFieldError(emailError, emailInput, 'Email address is required.');// [cite: 7]
        isValid = false;// [cite: 7]
      } else if (!emailRegex.test(emailVal)) {// [cite: 7]
        showFieldError(emailError, emailInput, 'Please enter a valid email address.');// [cite: 7]
        isValid = false;// [cite: 7]
      } else {// [cite: 7]
        clearFieldError(emailError, emailInput);// [cite: 7]
      }
    }

    return isValid;// [cite: 7]
  }

  // Validate passwords on final step// [cite: 7]
  function validateStep3() {// [cite: 7]
    let isValid = true;// [cite: 7]
    const pass = passwordInput.value;// [cite: 7]
    const confirmPass = confirmPasswordInput.value;// [cite: 7]

    if (!pass) {// [cite: 7]
      showFieldError(passwordError, passwordInput, 'Password is required.');// [cite: 7]
      isValid = false;// [cite: 7]
    } else if (pass.length < 6) {// [cite: 7]
      showFieldError(passwordError, passwordInput, 'Password must be at least 6 characters.');// [cite: 7]
      isValid = false;// [cite: 7]
    } else {// [cite: 7]
      clearFieldError(passwordError, passwordInput);// [cite: 7]
    }

    if (!confirmPass) {// [cite: 7]
      showFieldError(confirmPasswordError, confirmPasswordInput, 'Please confirm your password.');// [cite: 7]
      isValid = false;// [cite: 7]
    } else if (pass !== confirmPass) {// [cite: 7]
      showFieldError(confirmPasswordError, confirmPasswordInput, 'Passwords do not match.');// [cite: 7]
      isValid = false;// [cite: 7]
    } else {// [cite: 7]
      clearFieldError(confirmPasswordError, confirmPasswordInput);// [cite: 7]
    }

    return isValid;// [cite: 7]
  }

  function showFieldError(elem, input, msg) {// [cite: 7]
    if (elem) elem.innerText = msg;// [cite: 7]
    if (input) input.style.borderColor = '#ea7b82';// [cite: 7]
  }

  function clearFieldError(elem, input) {// [cite: 7]
    if (elem) elem.innerText = '';// [cite: 7]
    if (input) input.style.borderColor = '';// [cite: 7]
  }

  function showServerError(msg) {// [cite: 7]
    if (serverError) {// [cite: 7]
      serverError.innerText = msg;// [cite: 7]
      serverError.style.display = 'block';// [cite: 7]
    }
  }

  function clearServerError() {// [cite: 7]
    if (serverError) {// [cite: 7]
      serverError.innerText = '';// [cite: 7]
      serverError.style.display = 'none';// [cite: 7]
    }
  }

  // Toggle password field input visibility// [cite: 7]
  document.querySelectorAll('.toggle-password').forEach((btn) => {// [cite: 7]
    btn.addEventListener('click', (e) => {// [cite: 7]
      e.preventDefault();// [cite: 7]
      const targetId = btn.getAttribute('data-target');// [cite: 7]
      const input = document.getElementById(targetId);// [cite: 7]
      const eyeOpen = btn.querySelector('.eye-open');// [cite: 7]
      const eyeClosed = btn.querySelector('.eye-closed');// [cite: 7]

      if (input.type === 'password') {// [cite: 7]
        input.type = 'text';// [cite: 7]
        if (eyeOpen) eyeOpen.style.display = 'block';// [cite: 7]
        if (eyeClosed) eyeClosed.style.display = 'none';// [cite: 7]
      } else {// [cite: 7]
        input.type = 'password';// [cite: 7]
        if (eyeOpen) eyeOpen.style.display = 'none';// [cite: 7]
        if (eyeClosed) eyeClosed.style.display = 'block';// [cite: 7]
      }
    });
  });

  // Submit form trigger handlers// [cite: 7]
  signupForm.addEventListener('submit', (e) => {// [cite: 7]
    e.preventDefault();// [cite: 7]
    handleFinalSubmit();// [cite: 7]
  });

  if (submitBtn) {// [cite: 7]
    submitBtn.addEventListener('click', (e) => {// [cite: 7]
      e.preventDefault();// [cite: 7]
      handleFinalSubmit();// [cite: 7]
    });
  }

  // Submit registration payload to Express backend// [cite: 7]
  async function handleFinalSubmit() {// [cite: 7]
    if (!validateStep3()) return;// [cite: 7]

    const originalText = submitBtn.innerHTML;// [cite: 7]
    submitBtn.disabled = true;// [cite: 7]
    submitBtn.innerText = 'Creating account...';// [cite: 7]
    clearServerError();// [cite: 7]

    const guestSessionId = localStorage.getItem('mm_guest_session_id') || null;

    const payload = {// [cite: 7]
      fullname: fullnameInput.value.trim(),// [cite: 7]
      username: usernameInput.value.trim(),// [cite: 7]
      email: emailInput.value.trim(),// [cite: 7]
      password: passwordInput.value,// [cite: 7]
      guest_session_id: guestSessionId
    };

    try {// [cite: 7]
      const response = await fetch('/api/auth/signup', {// [cite: 7]
        method: 'POST',// [cite: 7]
        headers: { 'Content-Type': 'application/json' },// [cite: 7]
        body: JSON.stringify(payload)// [cite: 7]
      });

      const result = await response.json();// [cite: 7]

      if (!response.ok || result.status !== 'success') {// [cite: 7]
        throw new Error(result.message || 'Signup failed. Please try again.');// [cite: 7]
      }

      // Persist user session to localStorage for auto-login// [cite: 7]
      localStorage.setItem('mm_user', JSON.stringify(result.user));// [cite: 7]

      // Clear guest session data after migrating to new account
      localStorage.removeItem('mm_guest_session_id');
      localStorage.removeItem('mm_guest_recipient');
      localStorage.removeItem('mm_cart');

      // Redirect directly to home portal// [cite: 7]
      window.location.href = 'home.html?login=success';// [cite: 7]
    } catch (err) {// [cite: 7]
      showServerError(err.message);// [cite: 7]
    } finally {// [cite: 7]
      submitBtn.disabled = false;// [cite: 7]
      submitBtn.innerHTML = originalText;// [cite: 7]
    }
  }
});