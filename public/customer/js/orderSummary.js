// public/customer/js/orderSummary.js
let currentOrderSummaryItems = [];
let currentSubtotal = 0.0;
let appliedPromoDiscount = 0.0;
let appliedLoyaltyDiscount = 0.0;
let selectedPaymentMethod = 'Cash on Pick-Up';
let availableLoyaltyPoints = 0.0;
let lastPlacedOrderData = null;

let currentRecipient = {
  name: '',
  email: ''
};

// Kumuha o gumawa ng unique Guest Session ID sa localStorage
function getGuestSessionId() {
  let sid = localStorage.getItem('mm_guest_session_id');
  if (!sid) {
    sid = 'guest_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('mm_guest_session_id', sid);
  }
  return sid;
}

document.addEventListener('DOMContentLoaded', () => {
  loadRecipientInfoFromSession();
});

function loadRecipientInfoFromSession() {
  const localUser = JSON.parse(localStorage.getItem('mm_user') || '{}');
  if (localUser.customer_id) {
    currentRecipient.name = localUser.full_name || localUser.username || '';
    currentRecipient.email = localUser.email || '';
  } else {
    // Kung Guest, kuhanin mula sa naisave sa local storage o iwanang blanko
    const savedGuest = JSON.parse(localStorage.getItem('mm_guest_recipient') || '{}');
    currentRecipient.name = savedGuest.name || '';
    currentRecipient.email = savedGuest.email || '';
  }
  renderRecipientDetails();
}

function renderRecipientDetails() {
  const wrapper = document.getElementById('recipientDetailsWrapper');
  if (!wrapper) return;

  const hasName = currentRecipient.name && currentRecipient.name.trim() !== '';
  const hasEmail = currentRecipient.email && currentRecipient.email.trim() !== '';

  const nameDisplay = hasName 
    ? currentRecipient.name 
    : '<span style="color: #d32f2f; font-weight: 600;">Not set (Click edit to add)</span>';
  const emailDisplay = hasEmail 
    ? currentRecipient.email 
    : '<span style="color: #d32f2f; font-weight: 600;">Not set (Click edit to add)</span>';

  wrapper.innerHTML = `
    <div class="recipient-input-card" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #FFFDFD; border: 1.5px solid ${(!hasName || !hasEmail) ? '#F48A8E' : '#FCE1DD'}; border-radius: 16px;">
      <div class="recipient-display-col" style="display: flex; flex-direction: column; gap: 3px;">
        <div style="font-size: 13.5px; color: #594A42;"><strong>Name:</strong> ${nameDisplay}</div>
        <div style="font-size: 13.5px; color: #594A42;"><strong>Email:</strong> ${emailDisplay}</div>
      </div>
      <button type="button" class="btn-edit-recipient" onclick="openRecipientModal()" title="Edit Details" style="background: none; border: none; color: #F48A8E; font-size: 17px; cursor: pointer;">
        <i class="fa-regular fa-pen-to-square"></i>
      </button>
    </div>
  `;
}

// ==========================================
// RENDER ORDER SUMMARY MODAL
// ==========================================
window.renderOrderSummaryModal = async function(items = []) {
  currentOrderSummaryItems = items;
  appliedPromoDiscount = 0.0;
  appliedLoyaltyDiscount = 0.0;
  selectedPaymentMethod = 'Cash on Pick-Up';

  loadRecipientInfoFromSession();

  // Reset payment method buttons
  document.querySelectorAll('.payment-method-pill').forEach(btn => {
    btn.classList.toggle('active', btn.innerText.trim() === 'Cash on Pick-Up');
  });

  // Reset promo code inputs
  const promoInput = document.getElementById('promoCodeInput');
  if (promoInput) promoInput.value = '';
  const promoMsg = document.getElementById('promoAppliedMsg');
  if (promoMsg) promoMsg.style.display = 'none';

  // Synchronize Loyalty Points
  await syncCustomerLoyaltyPoints();

  // Reset Loyalty Points Toggle
  const togglePoints = document.getElementById('toggleUseLoyaltyPoints');
  if (togglePoints) togglePoints.checked = false;
  const loyaltyRow = document.getElementById('summaryLoyaltyDiscountRow');
  if (loyaltyRow) loyaltyRow.style.display = 'none';

  setNextDefaultPickupDate();

  // Render bawat Cup item sa modal
  const cupsList = document.getElementById('summaryCupsList');
  if (cupsList) {
    cupsList.innerHTML = items.map(item => {
      const lineTotal = (item.unit_price || 15.00) * (item.quantity || 1);
      const thumbSrc = item.image || item.flavor_img || 'images/1.jpg';

      return `
        <div class="summary-cup-item" style="display: flex; align-items: center; justify-content: space-between; background: #FFF4F2; border-radius: 18px; padding: 12px 16px; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="${thumbSrc}" alt="Cup" style="width: 50px; height: 50px; object-fit: contain;" onerror="this.src='images/1.jpg'">
            <div style="display: flex; flex-direction: column;">
              <h4 style="font-size: 14.5px; font-weight: 800; color: #594A42; margin: 0;">${item.size || '12oz'} ${item.title}</h4>
              <span style="font-size: 12px; font-weight: 600; color: #7C4F38;">${item.toppings || ''} ${item.addons || ''}</span>
              <span style="display: inline-block; width: fit-content; background: #F48A8E; color: #fff; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 99px; margin-top: 4px;">${item.quantity || 1}x</span>
            </div>
          </div>
          <div style="font-size: 17px; font-weight: 800; color: #594A42;">₱ ${lineTotal.toFixed(2)}</div>
        </div>
      `;
    }).join('');
  }

  currentSubtotal = items.reduce((sum, it) => sum + ((it.unit_price || 15.00) * (it.quantity || 1)), 0);
  updateSummaryTotals();

  const modal = document.getElementById('orderSummaryModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

window.closeOrderSummaryModal = function() {
  const modal = document.getElementById('orderSummaryModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
};

// ==========================================
// LOYALTY POINTS LOGIC & CALCULATIONS
// ==========================================
async function syncCustomerLoyaltyPoints() {
  const localUser = JSON.parse(localStorage.getItem('mm_user') || '{}');
  const togglePoints = document.getElementById('toggleUseLoyaltyPoints');
  const availableSubtext = document.getElementById('summaryLoyaltyAvailable');

  // KUNG GUEST USER: I-disable ang Loyalty Points Section
  if (!localUser.customer_id) {
    availableLoyaltyPoints = 0.0;
    if (availableSubtext) {
      availableSubtext.innerText = 'Available: 0.0 pts (Sign up to earn points!)';
    }
    if (togglePoints) {
      togglePoints.checked = false;
      togglePoints.disabled = true;
    }
    return;
  }

  if (togglePoints) togglePoints.disabled = false;

  try {
    const res = await fetch(`/api/customer/profile?customer_id=${localUser.customer_id}`);
    const result = await res.json();

    if (res.ok && result.status === 'success') {
      const data = result.data || result.customer || {};
      availableLoyaltyPoints = parseFloat(data.loyalty_points || 0);

      const formattedPts = availableLoyaltyPoints.toFixed(1);
      const pesoEquiv = (availableLoyaltyPoints * 1.0).toFixed(2);

      if (availableSubtext) {
        availableSubtext.innerText = `Available: ${formattedPts} pts (₱${pesoEquiv})`;
      }

      const ptsHeader = document.getElementById('displayLoyaltyPoints');
      const pesoHeader = document.getElementById('displayLoyaltyPeso');
      if (ptsHeader) ptsHeader.innerText = `${formattedPts} pts`;
      if (pesoHeader) pesoHeader.innerText = `(₱${pesoEquiv})`;
    }
  } catch (err) {
    console.warn('Could not sync points in order summary:', err);
  }
}

window.handleToggleLoyaltyPoints = function(isChecked) {
  const loyaltyRow = document.getElementById('summaryLoyaltyDiscountRow');
  const loyaltyDisplay = document.getElementById('summaryLoyaltyDiscount');

  if (isChecked) {
    if (availableLoyaltyPoints <= 0) {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'info',
          title: 'No Points Available',
          text: 'You have 0 loyalty points. Complete orders to earn points (every ₱10 = 0.1 pts)!'
        });
      }
      document.getElementById('toggleUseLoyaltyPoints').checked = false;
      appliedLoyaltyDiscount = 0.0;
      if (loyaltyRow) loyaltyRow.style.display = 'none';
      updateSummaryTotals();
      return;
    }

    const maxDiscountAllowed = availableLoyaltyPoints * 1.0;
    const remainingToDiscount = Math.max(0, currentSubtotal - appliedPromoDiscount);
    appliedLoyaltyDiscount = Math.min(remainingToDiscount, maxDiscountAllowed);

    if (loyaltyRow) loyaltyRow.style.display = 'flex';
    if (loyaltyDisplay) loyaltyDisplay.innerText = `- ₱ ${appliedLoyaltyDiscount.toFixed(2)}`;
  } else {
    appliedLoyaltyDiscount = 0.0;
    if (loyaltyRow) loyaltyRow.style.display = 'none';
  }

  updateSummaryTotals();
};

function updateSummaryTotals() {
  const subtotalEl = document.getElementById('summarySubtotal');
  const promoEl = document.getElementById('summaryDiscount');
  const finalEl = document.getElementById('summaryFinalTotal');

  if (subtotalEl) subtotalEl.innerText = `₱ ${currentSubtotal.toFixed(2)}`;
  if (promoEl) promoEl.innerText = `- ₱ ${appliedPromoDiscount.toFixed(2)}`;

  const finalTotal = Math.max(0, currentSubtotal - appliedPromoDiscount - appliedLoyaltyDiscount);
  if (finalEl) finalEl.innerText = `₱ ${finalTotal.toFixed(2)}`;
}

// ==========================================
// PAYMENT METHOD & PICKUP DATE VALIDATION
// ==========================================
window.selectPaymentMethod = function(btnElement) {
  document.querySelectorAll('.payment-method-pill').forEach(b => b.classList.remove('active'));
  btnElement.classList.add('active');
  selectedPaymentMethod = btnElement.innerText.trim();
};

function setNextDefaultPickupDate() {
  const input = document.getElementById('pickupDateInput');
  if (!input) return;

  const date = new Date();
  date.setDate(date.getDate() + 1);

  while (date.getDay() !== 1 && date.getDay() !== 2 && date.getDay() !== 4) {
    date.setDate(date.getDate() + 1);
  }

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  input.value = `${yyyy}-${mm}-${dd}`;
}

window.validatePickupDate = function(input) {
  const dateReq = document.getElementById('dateRequiredMsg');
  const dateErr = document.getElementById('dateErrorMsg');
  if (dateReq) dateReq.style.display = 'none';
  if (dateErr) dateErr.style.display = 'none';

  if (!input.value) return;

  const selected = new Date(input.value);
  const day = selected.getUTCDay();

  if (day !== 1 && day !== 2 && day !== 4) {
    if (dateErr) dateErr.style.display = 'block';
    input.value = '';
  }
};

window.openDatePicker = function() {
  const input = document.getElementById('pickupDateInput');
  if (input) {
    if (typeof input.showPicker === 'function') {
      input.showPicker();
    } else {
      input.focus();
    }
  }
};

// ==========================================
// PROMO CODE APPLICATION
// ==========================================
window.applyPromo = function() {
  const input = document.getElementById('promoCodeInput');
  const msg = document.getElementById('promoAppliedMsg');
  const code = (input.value || '').trim().toUpperCase();

  if (!code) {
    if (typeof Swal !== 'undefined') {
      Swal.fire({ icon: 'warning', title: 'Empty Promo', text: 'Please enter a promo code first.' });
    }
    return;
  }

  if (code === 'MILKY10') {
    appliedPromoDiscount = currentSubtotal * 0.10;
    if (msg) {
      msg.innerText = '10% discount promo applied!';
      msg.style.display = 'block';
      msg.style.color = '#2e7d32';
    }
  } else {
    appliedPromoDiscount = 0.0;
    if (msg) {
      msg.innerText = 'Invalid promo code.';
      msg.style.display = 'block';
      msg.style.color = '#d32f2f';
    }
  }

  const isPointsToggled = document.getElementById('toggleUseLoyaltyPoints')?.checked || false;
  if (isPointsToggled) {
    handleToggleLoyaltyPoints(true);
  } else {
    updateSummaryTotals();
  }
};

// ==========================================
// RECIPIENT EDIT MODAL
// ==========================================
window.openRecipientModal = function() {
  document.getElementById('inputRecipientName').value = currentRecipient.name;
  document.getElementById('inputRecipientEmail').value = currentRecipient.email;
  document.getElementById('recipientEditModal').classList.add('active');
};

window.closeRecipientModal = function() {
  document.getElementById('recipientEditModal').classList.remove('active');
};

window.saveRecipientDetails = function(event) {
  event.preventDefault();
  const nameVal = document.getElementById('inputRecipientName').value.trim();
  const emailVal = document.getElementById('inputRecipientEmail').value.trim();

  if (!nameVal || !emailVal) return;

  currentRecipient.name = nameVal;
  currentRecipient.email = emailVal;

  const localUser = JSON.parse(localStorage.getItem('mm_user') || '{}');
  if (localUser.customer_id) {
    localUser.full_name = nameVal;
    localUser.email = emailVal;
    localStorage.setItem('mm_user', JSON.stringify(localUser));
  } else {
    localStorage.setItem('mm_guest_recipient', JSON.stringify({ name: nameVal, email: emailVal }));
  }

  renderRecipientDetails();
  closeRecipientModal();
};

// ==========================================
// CONFIRM PLACE ORDER (SUPPORT FOR REGISTERED & GUEST)
// ==========================================
window.confirmPlaceOrder = async function() {
  // 1. VALIDATION FOR RECIPIENT DETAILS
  if (!currentRecipient.name || !currentRecipient.name.trim() || !currentRecipient.email || !currentRecipient.email.trim()) {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'warning',
        title: 'Recipient Details Required',
        text: 'Please complete Recipient Details (Full Name and Email) before placing your order.',
        confirmButtonText: 'Set Details',
        confirmButtonColor: '#F48A8E'
      }).then(() => {
        openRecipientModal();
      });
    } else {
      openRecipientModal();
    }
    return;
  }

  // 2. VALIDATION FOR PICK-UP DATE
  const pickupInput = document.getElementById('pickupDateInput');
  const dateReq = document.getElementById('dateRequiredMsg');

  if (!pickupInput || !pickupInput.value) {
    if (dateReq) dateReq.style.display = 'block';
    return;
  }

  const localUser = JSON.parse(localStorage.getItem('mm_user') || '{}');
  const isGuest = !localUser.customer_id;
  const isPointsToggled = document.getElementById('toggleUseLoyaltyPoints')?.checked || false;

  const pointsToUse = (!isGuest && isPointsToggled) ? appliedLoyaltyDiscount : 0.0;
  const finalPayableTotal = Math.max(0, currentSubtotal - appliedPromoDiscount - pointsToUse);

  const isCustomCup = currentOrderSummaryItems.some(it => it.is_custom);
  const orderTypeVal = isCustomCup ? 'custom_build' : 'preset';

  const payload = {
    customer_id: isGuest ? null : localUser.customer_id,
    session_id: isGuest ? getGuestSessionId() : null,
    guest_name: currentRecipient.name,
    guest_email: currentRecipient.email,
    items: currentOrderSummaryItems,
    subtotal: currentSubtotal,
    discount_amount: appliedPromoDiscount,
    points_used: pointsToUse,
    order_type: orderTypeVal,
    total_amount: finalPayableTotal,
    payment_method: selectedPaymentMethod,
    pickup_date: pickupInput.value,
    pickup_instructions: `Pick-up: ${pickupInput.value}`
  };

  const submitBtn = document.getElementById('btnPlaceOrderSubmit');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = 'Placing Order...';
  }

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.ok && data.status === 'success') {
      closeOrderSummaryModal();

      lastPlacedOrderData = {
        ...data.order,
        items: currentOrderSummaryItems,
        points_used: data.points_used,
        points_earned: data.points_earned,
        total_amount: finalPayableTotal,
        pickup_date: pickupInput.value
      };

      if (!isGuest) {
        const updatedBalance = parseFloat(data.new_loyalty_points || 0);
        availableLoyaltyPoints = updatedBalance;

        const ptsHeader = document.getElementById('displayLoyaltyPoints');
        const pesoHeader = document.getElementById('displayLoyaltyPeso');
        if (ptsHeader) ptsHeader.innerText = `${updatedBalance.toFixed(1)} pts`;
        if (pesoHeader) pesoHeader.innerText = `(₱${(updatedBalance * 1.0).toFixed(2)})`;
      }

      if (typeof loadRecentOrders === 'function') {
        loadRecentOrders();
      }

      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'success',
          title: 'Order Confirmed!',
          html: `
            <p style="color: #7C4F38; font-size: 14px; margin-bottom: 8px;">Order No: <strong>${data.order.order_number}</strong></p>
            ${!isGuest && data.points_used > 0 ? `<p style="color: #E27D80; font-weight: 700; margin: 4px 0;">Points Used: -${data.points_used.toFixed(1)} pts</p>` : ''}
            ${!isGuest ? `
              <div style="background: #FFF5F4; border-radius: 12px; padding: 10px; margin: 10px 0; font-weight: 800; color: #594A42;">
                🎉 You earned +${Number(data.points_earned || 0).toFixed(1)} loyalty points!
              </div>
            ` : `
              <div style="background: #FFF5F4; border-radius: 12px; padding: 10px; margin: 10px 0; font-size: 12.5px; color: #7C4F38;">
                📧 An order confirmation has been logged for <strong>${currentRecipient.email}</strong>. Use your Order ID to track your sips!
              </div>
            `}
          `,
          confirmButtonText: 'Got It!',
          confirmButtonColor: '#594A42'
        });
      }
    } else {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'error',
          title: 'Failed to Place Order',
          text: data.message || 'Could not save your order.'
        });
      }
    }
  } catch (err) {
    console.error('Order error:', err);
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'Could not connect to the server.'
      });
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerText = 'Place Order';
    }
  }
};