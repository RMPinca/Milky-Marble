// js/home.js - Milky Marble Customer Portal Logic// [cite: 8]

const PRESET_SIGNATURES = [// [cite: 8]
  {
    id: 1,
    title: "Chocolatey Coffee\nNoodly Jelly",
    flavor: "Coffee",
    variation: "Spaghetti",
    toppings: ["Nuts", "Chocolate Chips"],
    accent_color: "#664638",
    image: "images/Chocolatey Coffee Noodly Jelly.png",
    price_8oz: 15.00,
    price_12oz: 19.00,
    rating: "0.0"
  },
  {
    id: 2,
    title: "Cheesy Pandan Cubes",
    flavor: "Buko Pandan",
    variation: "Cubes",
    toppings: ["Cheese", "Tapioca Pearls"],
    accent_color: "#8bb35c",
    image: "images/Cheesy Pandan Cubes.png",
    price_8oz: 15.00,
    price_12oz: 19.00,
    rating: "0.0"
  },
  {
    id: 3,
    title: "Bubbly Coffee Jelly",
    flavor: "Coffee",
    variation: "Cubes",
    toppings: ["Marshmallows", "Tapioca Pearls"],
    accent_color: "#664638",
    image: "images/Bubbly Coffee Jelly.png",
    price_8oz: 15.00,
    price_12oz: 19.00,
    rating: "0.0"
  },
  {
    id: 4,
    title: "Strawberry String Party",
    flavor: "Strawberry",
    variation: "Spaghetti",
    toppings: ["Marshmallows", "Sprinkles (Assorted)"],
    accent_color: "#f48a8e",
    image: "images/Strawberry String Party.png",
    price_8oz: 15.00,
    price_12oz: 19.00,
    rating: "0.0"
  }
];// [cite: 8]

const AVAILABLE_TOPPINGS = ['Cheese', 'Tapioca', 'Marshmallow', 'Nuts', 'Assorted Sprinkles', 'Choco Sprinkles', 'Choco Chips'];// [cite: 8]
const TOPPING_PRICES = {// [cite: 8]
  'Cheese': 2.00,
  'Tapioca': 2.00,
  'Marshmallow': 2.00,
  'Nuts': 2.00,
  'Assorted Sprinkles': 2.00,
  'Choco Sprinkles': 2.00,
  'Choco Chips': 5.00,
  'Condensed Milk': 5.00
};// [cite: 8]

const STAGE_CHOICES = {// [cite: 8]
  flavor: [
    { id: 'Strawberry', label: 'Strawberry' },
    { id: 'Pandan', label: 'Pandan' },
    { id: 'Coffee', label: 'Coffee' }
  ],
  jelly: [
    { id: 'Spaghetti', label: 'Spaghetti' },
    { id: 'Cube', label: 'Cube' },
    { id: 'Whole', label: 'Whole' }
  ]
};// [cite: 8]

const STAGES = ['cup', 'flavor', 'jelly', 'toppings', 'addons'];// [cite: 8]
let currentStageIndex = 0;// [cite: 8]

let customConfig = {// [cite: 8]
  size: '12oz',
  flavor: 'Pandan',
  jelly: 'Cube',
  toppings: [],
  activeToppingSlot: 0,
  addonsMap: {},
  utensils: 'No Spoon',
  basePrice: 19.00
};// [cite: 8]

let currentModalDrink = null;// [cite: 8]
let currentModalSize = null;// [cite: 8]
let currentModalQty = 1;// [cite: 8]
let activeModalAllReviews = [];// [cite: 8]

function getGuestSessionId() {// [cite: 8]
  let sid = localStorage.getItem('mm_guest_session_id');// [cite: 8]
  if (!sid) {// [cite: 8]
    sid = 'guest_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);// [cite: 8]
    localStorage.setItem('mm_guest_session_id', sid);// [cite: 8]
  }
  return sid;// [cite: 8]
}

function showSweetAlert(options) {// [cite: 8]
  if (typeof Swal === 'undefined') return Promise.resolve({ isConfirmed: false });// [cite: 8]
  return Swal.fire({// [cite: 8]
    target: document.body,// [cite: 8]
    customClass: {// [cite: 8]
      container: 'mm-swal-container-top',// [cite: 8]
      popup: 'mm-swal-popup',// [cite: 8]
      title: 'mm-swal-title',// [cite: 8]
      htmlContainer: 'mm-swal-html',// [cite: 8]
      actions: 'mm-swal-actions',// [cite: 8]
      confirmButton: 'mm-swal-confirm-btn',// [cite: 8]
      cancelButton: 'mm-swal-cancel-btn'// [cite: 8]
    },// [cite: 8]
    buttonsStyling: false,// [cite: 8]
    ...options// [cite: 8]
  });// [cite: 8]
}

const CartAlert = {// [cite: 8]
  showModal: function ({// [cite: 8]
    title = 'Cup',// [cite: 8]
    size = '12oz',// [cite: 8]
    image = '',// [cite: 8]
    flavor_img = '',// [cite: 8]
    toppings_img = '',// [cite: 8]
    cup_img = '',// [cite: 8]
    accent_color = '#F48A8E',// [cite: 8]
    onCheckout = null// [cite: 8]
  } = {}) {// [cite: 8]
    const resolvedCup = cup_img || (size === '8oz' ? 'images/Layer 3/Small Cup.png' : 'images/Layer 3/Large Cup.png');// [cite: 8]
    let thumbHTML = '';// [cite: 8]

    if (image) {// [cite: 8]
      thumbHTML = `
        <div class="mm-swal-thumb-box" style="background: ${accent_color}22;">
          <img src="${image}" class="mm-swal-img" alt="Drink">
        </div>
      `;// [cite: 8]
    } else if (flavor_img || resolvedCup) {// [cite: 8]
      thumbHTML = `
        <div class="mm-swal-thumb-box" style="background: ${accent_color}22;">
          <div class="composite-cart-thumb notif-thumb-composite">
            ${flavor_img ? `<img src="${flavor_img}" class="cart-layer-flavor" alt="Flavor">` : ''}
            ${toppings_img ? `<img src="${toppings_img}" class="cart-layer-toppings" alt="Toppings">` : ''}
            <img src="${resolvedCup}" class="cart-layer-cup" alt="Cup">
          </div>
        </div>
      `;// [cite: 8]
    }

    return showSweetAlert({// [cite: 8]
      icon: 'success',// [cite: 8]
      title: 'Added to Sweet Bag!',// [cite: 8]
      html: `
        ${thumbHTML}
        <div class="mm-swal-item-name">${size} ${title}</div>
        <p class="mm-swal-item-sub">Ready to pop the straw or craving more treats?</p>
      `,// [cite: 8]
      showCancelButton: true,// [cite: 8]
      confirmButtonText: 'View Cart',// [cite: 8]
      cancelButtonText: 'Keep Browsing',// [cite: 8]
      reverseButtons: true// [cite: 8]
    }).then((result) => {// [cite: 8]
      if (result.isConfirmed) {// [cite: 8]
        if (typeof onCheckout === 'function') {// [cite: 8]
          onCheckout();// [cite: 8]
        } else {// [cite: 8]
          window.location.href = 'cart.html';// [cite: 8]
        }
      }
    });// [cite: 8]
  }
};// [cite: 8]

// ==========================================
// PRESET SIGNATURE DRINKS
// ==========================================
function renderSignatureDrinks() {// [cite: 8]
  const container = document.getElementById('productsGridContainer');// [cite: 8]
  if (!container) return;// [cite: 8]

  container.innerHTML = PRESET_SIGNATURES.map((drink) => {// [cite: 8]
    const searchKeywords = (drink.title + ' ' + drink.flavor + ' ' + drink.variation + ' ' + drink.toppings.join(' ')).toLowerCase();// [cite: 8]
    const encodedData = encodeURIComponent(JSON.stringify(drink));// [cite: 8]

    return `
      <div class="product-card" data-search-keywords="${searchKeywords}" onclick="openProductModal('${encodedData}')">
        <div class="product-img-wrapper" style="--thumb-accent: ${drink.accent_color};">
          <img src="${drink.image}" alt="${drink.title.replace('\n', ' ')}" class="product-img">
        </div>
        <div class="product-details">
          <h2 class="product-title">${drink.title.replace('\n', '<br>')}</h2>
          <div class="product-specs">
            <div class="spec-line">Flavor: <span class="spec-val">${drink.flavor}</span></div>
            <div class="spec-line">Variation: <span class="spec-val">${drink.variation}</span></div>
            <div class="spec-line">Toppings:</div>
            <ul class="toppings-list">
              ${drink.toppings.map(t => `<li>${t}</li>`).join('')}
            </ul>
          </div>
          <div class="product-footer" onclick="event.stopPropagation()">
            <div class="rating-badge">
              <i class="fa-regular fa-star"></i>
              <span id="card-rating-${drink.id}">${drink.rating}</span>
            </div>
            <div class="product-actions">
              <button type="button" class="btn-buy" onclick="openProductModal('${encodedData}')">Buy Now</button>
              <button type="button" class="btn-cart-add" title="Add to Cart" onclick="openProductModal('${encodedData}')">
                <i class="fa-solid fa-cart-plus"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;// [cite: 8]
  }).join('');// [cite: 8]
}

async function loadLiveRatingsSummary() {// [cite: 8]
  try {// [cite: 8]
    const res = await fetch('/api/ratings/summary');// [cite: 8]
    const data = await res.json();// [cite: 8]

    if (res.ok && data.status === 'success') {// [cite: 8]
      const ratingsMap = data.ratings || {};// [cite: 8]

      PRESET_SIGNATURES.forEach(drink => {// [cite: 8]
        const cleanKey = drink.title.replace(/\r?\n|\r/g, ' ').trim().toLowerCase();// [cite: 8]
        let matchedScore = null;// [cite: 8]

        if (ratingsMap[cleanKey] !== undefined) {// [cite: 8]
          matchedScore = ratingsMap[cleanKey];// [cite: 8]
        } else {// [cite: 8]
          const foundKey = Object.keys(ratingsMap).find(k => cleanKey.includes(k) || k.includes(cleanKey));// [cite: 8]
          if (foundKey) {// [cite: 8]
            matchedScore = ratingsMap[foundKey];// [cite: 8]
          }
        }

        drink.rating = (matchedScore !== null && matchedScore > 0) ? matchedScore.toFixed(1) : "0.0";// [cite: 8]

        const cardRatingEl = document.getElementById(`card-rating-${drink.id}`);// [cite: 8]
        if (cardRatingEl) {// [cite: 8]
          cardRatingEl.innerText = drink.rating;// [cite: 8]
        }
      });// [cite: 8]
    }
  } catch (err) {// [cite: 8]
    console.warn('Could not load ratings summary:', err);// [cite: 8]
  }
}

window.openProductModal = function (encodedData) {// [cite: 8]
  const drink = JSON.parse(decodeURIComponent(encodedData));// [cite: 8]
  currentModalDrink = drink;// [cite: 8]
  currentModalSize = null;// [cite: 8]
  currentModalQty = 1;// [cite: 8]

  const sizeErr = document.getElementById('modalSizeRequiredMsg');// [cite: 8]
  if (sizeErr) sizeErr.style.display = 'none';// [cite: 8]

  document.getElementById('modalDrinkImg').src = drink.image;// [cite: 8]
  document.getElementById('modalDrinkBox').style.setProperty('--thumb-accent', drink.accent_color || '#F48A8E');// [cite: 8]
  document.getElementById('modalDrinkTitle').innerText = drink.title.replace('\n', ' ');// [cite: 8]
  document.getElementById('modalDrinkRating').innerText = drink.rating;// [cite: 8]
  document.getElementById('modalDrinkFlavor').innerText = drink.flavor;// [cite: 8]
  document.getElementById('modalDrinkVariation').innerText = drink.variation;// [cite: 8]

  const toppingsList = document.getElementById('modalDrinkToppings');// [cite: 8]
  toppingsList.innerHTML = drink.toppings.map(t => `<li>${t}</li>`).join('');// [cite: 8]

  document.querySelectorAll('.size-pill').forEach(btn => btn.classList.remove('active'));// [cite: 8]
  document.getElementById('modalQtyDisplay').innerText = currentModalQty;// [cite: 8]

  updateModalPrice();// [cite: 8]

  fetchLiveProductReviews(drink.title.replace('\n', ' '));// [cite: 8]

  const modal = document.getElementById('productModal');// [cite: 8]
  modal.classList.add('active');// [cite: 8]
  document.body.style.overflow = 'hidden';// [cite: 8]
};

window.closeProductModal = function () {// [cite: 8]
  const modal = document.getElementById('productModal');// [cite: 8]
  if (modal) modal.classList.remove('active');// [cite: 8]
  document.body.style.overflow = '';// [cite: 8]
};

window.selectModalSize = function (size, btn) {// [cite: 8]
  currentModalSize = size;// [cite: 8]
  document.querySelectorAll('.size-pill').forEach(b => b.classList.remove('active'));// [cite: 8]
  btn.classList.add('active');// [cite: 8]

  const sizeErr = document.getElementById('modalSizeRequiredMsg');// [cite: 8]
  if (sizeErr) sizeErr.style.display = 'none';// [cite: 8]

  updateModalPrice();// [cite: 8]
};

window.changeModalQty = function (delta) {// [cite: 8]
  currentModalQty = Math.max(1, currentModalQty + delta);// [cite: 8]
  document.getElementById('modalQtyDisplay').innerText = currentModalQty;// [cite: 8]
  updateModalPrice();// [cite: 8]
};

function updateModalPrice() {// [cite: 8]
  if (!currentModalDrink) return;// [cite: 8]
  if (!currentModalSize) {// [cite: 8]
    document.getElementById('modalDrinkPrice').innerText = `₱ ${currentModalDrink.price_8oz.toFixed(2)} - ₱ ${currentModalDrink.price_12oz.toFixed(2)}`;// [cite: 8]
    return;// [cite: 8]
  }
  const unit = currentModalSize === '12oz' ? currentModalDrink.price_12oz : currentModalDrink.price_8oz;// [cite: 8]
  document.getElementById('modalDrinkPrice').innerText = `₱ ${(unit * currentModalQty).toFixed(2)}`;// [cite: 8]
}

window.addModalItemToCart = async function () {// [cite: 8]
  if (!currentModalDrink) return;// [cite: 8]
  if (!currentModalSize) {// [cite: 8]
    const err = document.getElementById('modalSizeRequiredMsg');// [cite: 8]
    if (err) err.style.display = 'block';// [cite: 8]
    return;// [cite: 8]
  }

  const unitPrice = currentModalSize === '12oz' ? currentModalDrink.price_12oz : currentModalDrink.price_8oz;// [cite: 8]
  const titleClean = currentModalDrink.title.replace('\n', ' ');// [cite: 8]

  const payload = {// [cite: 8]
    title: titleClean,
    size: currentModalSize,
    flavor: currentModalDrink.flavor,
    variation: currentModalDrink.variation,
    toppings: currentModalDrink.toppings.join(', '),
    addons: '',
    unit_price: unitPrice,
    quantity: currentModalQty,
    accent_color: currentModalDrink.accent_color,
    image: currentModalDrink.image
  };// [cite: 8]

  const user = JSON.parse(localStorage.getItem('mm_user') || '{}');// [cite: 8]

  try {// [cite: 8]
    const res = await fetch('/api/cart', {// [cite: 8]
      method: 'POST',// [cite: 8]
      headers: { 'Content-Type': 'application/json' },// [cite: 8]
      body: JSON.stringify({// [cite: 8]
        action: 'add',
        item: payload,
        customer_id: user.customer_id || null,
        session_id: !user.customer_id ? getGuestSessionId() : null
      })// [cite: 8]
    });// [cite: 8]
    if (!res.ok) throw new Error('Failed to add to cart');// [cite: 8]
  } catch (e) {// [cite: 8]
    console.error('Add to cart error:', e);// [cite: 8]
  }

  closeProductModal();// [cite: 8]
  CartAlert.showModal({// [cite: 8]
    title: payload.title,
    size: payload.size,
    image: payload.image,
    accent_color: payload.accent_color
  });// [cite: 8]
  updateCartCount();// [cite: 8]
};

window.proceedToOrderSummary = function () {// [cite: 8]
  if (!currentModalDrink) return;// [cite: 8]
  if (!currentModalSize) {// [cite: 8]
    const err = document.getElementById('modalSizeRequiredMsg');// [cite: 8]
    if (err) {// [cite: 8]
      err.style.display = 'block';// [cite: 8]
      err.scrollIntoView({ behavior: 'smooth', block: 'nearest' });// [cite: 8]
    }
    return;// [cite: 8]
  }

  closeProductModal();// [cite: 8]

  const unitPrice = currentModalSize === '12oz'// [cite: 8]
    ? (currentModalDrink.price_12oz || 19.00)// [cite: 8]
    : (currentModalDrink.price_8oz || 15.00);// [cite: 8]

  const resolvedCup = (currentModalSize === '8oz')// [cite: 8]
    ? 'images/Layer 3/Small Cup.png'// [cite: 8]
    : 'images/Layer 3/Large Cup.png';// [cite: 8]

  const items = [{// [cite: 8]
    title: currentModalDrink.title.replace('\n', ' '),
    size: currentModalSize,
    is_custom: false,
    image: currentModalDrink.image,
    flavor_img: currentModalDrink.image,
    toppings_img: '',
    cup_img: resolvedCup,
    accent_color: currentModalDrink.accent_color,
    toppings: '+ ' + currentModalDrink.toppings.join(' + '),
    addons: '',
    unit_price: unitPrice,
    quantity: currentModalQty
  }];// [cite: 8]

  if (typeof renderOrderSummaryModal === 'function') {// [cite: 8]
    renderOrderSummaryModal(items);// [cite: 8]
  }
};

// ==========================================
// LIVE RATINGS & REVIEWS ENGINE
// ==========================================
function fetchLiveProductReviews(title) {// [cite: 8]
  const listEl = document.getElementById('modalReviewsList');// [cite: 8]
  if (!listEl) return;// [cite: 8]

  listEl.innerHTML = '<div style="padding: 20px; color: #7C4F38; text-align: center;"><i class="fa-solid fa-spinner fa-spin"></i> Loading sweet reviews...</div>';// [cite: 8]

  fetch('/api/ratings?title=' + encodeURIComponent(title))// [cite: 8]
    .then(res => res.json())// [cite: 8]
    .then(data => {// [cite: 8]
      if (data.status === 'success') {// [cite: 8]
        activeModalAllReviews = data.reviews || [];// [cite: 8]
        const count = data.review_count || activeModalAllReviews.length;// [cite: 8]
        const score = parseFloat(data.average_score) || 0.0;// [cite: 8]

        const displayScore = (count > 0 && score > 0) ? score.toFixed(1) : "0.0";// [cite: 8]
        document.getElementById('modalReviewScore').innerText = displayScore;// [cite: 8]
        document.getElementById('modalDrinkRating').innerText = displayScore;// [cite: 8]

        renderReviewStarsHeader(parseFloat(displayScore));// [cite: 8]
        renderFilteredReviewCards(activeModalAllReviews);// [cite: 8]
      } else {// [cite: 8]
        listEl.innerHTML = '<div style="padding: 20px; color: #888; text-align: center;">No reviews available.</div>';// [cite: 8]
      }
    })
    .catch(() => {// [cite: 8]
      listEl.innerHTML = '<div style="padding: 20px; color: #888; text-align: center;">Could not load reviews.</div>';// [cite: 8]
    });
}

function renderReviewStarsHeader(score) {// [cite: 8]
  const container = document.getElementById('modalStarsRow');// [cite: 8]
  if (!container) return;// [cite: 8]
  container.innerHTML = '';// [cite: 8]

  if (score === 0) {// [cite: 8]
    for (let i = 1; i <= 5; i++) {// [cite: 8]
      container.innerHTML += '<i class="fa-regular fa-star" style="color: #f7a93b;"></i>';// [cite: 8]
    }
    return;// [cite: 8]
  }

  for (let i = 1; i <= 5; i++) {// [cite: 8]
    if (score >= i) {// [cite: 8]
      container.innerHTML += '<i class="fa-solid fa-star" style="color: #f7a93b;"></i>';// [cite: 8]
    } else if (score >= i - 0.5) {// [cite: 8]
      container.innerHTML += '<i class="fa-solid fa-star-half-stroke" style="color: #f7a93b;"></i>';// [cite: 8]
    } else {// [cite: 8]
      container.innerHTML += '<i class="fa-regular fa-star" style="color: #f7a93b;"></i>';// [cite: 8]
    }
  }
}

window.filterModalReviews = function (stars, btnElement) {// [cite: 8]
  document.querySelectorAll('.rating-filter-pill').forEach(p => p.classList.remove('active'));// [cite: 8]
  btnElement.classList.add('active');// [cite: 8]

  if (stars === 'all') {// [cite: 8]
    renderFilteredReviewCards(activeModalAllReviews);// [cite: 8]
  } else {// [cite: 8]
    const filtered = activeModalAllReviews.filter(r => parseInt(r.rating_score, 10) === parseInt(stars, 10));// [cite: 8]
    renderFilteredReviewCards(filtered);// [cite: 8]
  }
};

function renderFilteredReviewCards(reviewsList) {// [cite: 8]
  const listEl = document.getElementById('modalReviewsList');// [cite: 8]
  if (!listEl) return;// [cite: 8]
  listEl.innerHTML = '';// [cite: 8]

  if (!reviewsList || reviewsList.length === 0) {// [cite: 8]
    listEl.innerHTML = `
      <div style="text-align: center; padding: 24px 16px; color: #999;">
        <i class="fa-regular fa-star" style="font-size: 1.8rem; color: #d4c8c1; margin-bottom: 6px;"></i>
        <p style="font-size: 0.95rem; font-weight: 700; color: #664638; margin: 0;">No reviews yet for this filter.</p>
        <p style="font-size: 0.85rem; margin-top: 4px; color: #7C4F38;">Be the first to pop the straw and rate your sip!</p>
      </div>
    `;// [cite: 8]
    return;// [cite: 8]
  }

  reviewsList.forEach(rev => {// [cite: 8]
    let starIcons = '';// [cite: 8]
    const score = parseInt(rev.rating_score, 10) || 5;// [cite: 8]
    for (let s = 1; s <= 5; s++) {// [cite: 8]
      starIcons += `<i class="${s <= score ? 'fa-solid' : 'fa-regular'} fa-star" style="color: #f7a93b; font-size: 12px;"></i>`;// [cite: 8]
    }

    let tagBadges = '';// [cite: 8]
    if (rev.experience_tags) {// [cite: 8]
      const tagArr = typeof rev.experience_tags === 'string' ? rev.experience_tags.split(',') : rev.experience_tags;// [cite: 8]
      tagArr.forEach(tg => {// [cite: 8]
        if (String(tg).trim()) {// [cite: 8]
          tagBadges += `<span style="display: inline-block; padding: 2px 8px; background: #faf4ef; border: 1px solid #eddcd1; border-radius: 99px; font-size: 11px; font-weight: 700; color: #664638; margin-right: 4px; margin-top: 4px;">${String(tg).trim()}</span>`;// [cite: 8]
        }
      });
    }

    const dateStr = rev.created_at// [cite: 8]
      ? new Date(rev.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })// [cite: 8]
      : '';// [cite: 8]

    listEl.innerHTML += `
      <div class="modal-review-card" style="margin-bottom: 12px; padding: 12px 14px; background: #fff; border: 1.5px solid #FCE1DD; border-radius: 18px; display: flex; align-items: flex-start; gap: 12px;">
        <div class="review-avatar" style="width: 36px; height: 36px; border-radius: 50%; background: #F48A8E; display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; margin-top: 2px;">
          <i class="fa-solid fa-user" style="font-size: 15px;"></i>
        </div>
        <div class="review-body" style="flex: 1; min-width: 0;">
          <div class="review-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
            <span class="review-username" style="font-weight: 800; font-size: 13.5px; color: #4a3427;">${rev.reviewer_name || 'Customer'}</span>
            <div class="review-star-rate" style="display: flex; align-items: center; gap: 2px;">
              ${starIcons}
            </div>
          </div>
          ${tagBadges ? `<div style="margin-bottom: 6px;">${tagBadges}</div>` : ''}
          <p class="review-text" style="font-size: 13px; color: #594A42; margin: 0; line-height: 1.4; font-weight: 600;">${rev.review_text || 'Enjoyed this sweet cup!'}</p>
          ${dateStr ? `<span style="font-size: 11px; color: #a8948d; margin-top: 4px; display: block; font-weight: 500;">${dateStr}</span>` : ''}
        </div>
      </div>
    `;// [cite: 8]
  });
}

// ==========================================
// CUSTOMIZER CORE ENGINE
// ==========================================
function getToppingUnitPrice(toppingName) {// [cite: 8]
  if (TOPPING_PRICES && TOPPING_PRICES[toppingName] !== undefined) {// [cite: 8]
    return parseFloat(TOPPING_PRICES[toppingName]);// [cite: 8]
  }
  return (toppingName === 'Choco Chips' || toppingName === 'Condensed Milk') ? 5.00 : 2.00;// [cite: 8]
}

function getLayer1ImagePath(flavor, jelly, isLarge) {// [cite: 8]
  const folder = isLarge ? 'Large Flavors' : 'Small Flavors';// [cite: 8]
  const fName = (flavor || 'Pandan').toLowerCase();// [cite: 8]
  const jName = (jelly || 'Cube').toLowerCase();// [cite: 8]
  return `images/Layer 1/${folder}/${fName} ${jName}.png`;// [cite: 8]
}

function getLayer2ToppingPath(toppingName, isLarge) {// [cite: 8]
  if (!toppingName || toppingName === 'None' || toppingName === 'Condensed Milk') return null;// [cite: 8]
  const folder = isLarge ? 'Large Toppings' : 'Small Toppings';// [cite: 8]
  let fileName = toppingName === 'Marshmallow' ? 'Mashmallow' : toppingName;// [cite: 8]
  return `images/Layer 2/${folder}/${fileName}.png`;// [cite: 8]
}

function getLayer3CupPath(isLarge) {// [cite: 8]
  return isLarge ? 'images/Layer 3/Large Cup.png' : 'images/Layer 3/Small Cup.png';// [cite: 8]
}

function buildLayeredCupHTML(configOverride = {}, stackClass = 'tall-stack') {// [cite: 8]
  const cfg = Object.assign({}, customConfig, configOverride);// [cite: 8]
  const isLarge = cfg.size === '12oz';// [cite: 8]

  const l1Src = getLayer1ImagePath(cfg.flavor, cfg.jelly, isLarge);// [cite: 8]
  const l3Src = getLayer3CupPath(isLarge);// [cite: 8]

  let activeToppings = [...(cfg.toppings || [])];// [cite: 8]
  if (cfg.addonsMap) {// [cite: 8]
    Object.keys(cfg.addonsMap).forEach(ad => {// [cite: 8]
      if (cfg.addonsMap[ad] > 0 && ad !== 'Condensed Milk') activeToppings.push(ad);// [cite: 8]
    });
  }

  let l2ImagesHTML = '';// [cite: 8]
  activeToppings.forEach(t => {// [cite: 8]
    const tSrc = getLayer2ToppingPath(t, isLarge);// [cite: 8]
    if (tSrc) {// [cite: 8]
      l2ImagesHTML += `<img src="${tSrc}" class="layer-2-toppings" alt="${t}">`;// [cite: 8]
    }
  });

  return `
    <div class="cup-layer-stack ${stackClass}">
      <img src="${l1Src}" class="layer-1-flavor" alt="${cfg.flavor} ${cfg.jelly}">
      <div class="layer-2-containment-box">
        ${l2ImagesHTML}
      </div>
      <img src="${l3Src}" class="layer-3-cup" alt="Cup ${cfg.size}">
    </div>
  `;// [cite: 8]
}

function calculateCustomTotal() {// [cite: 8]
  customConfig.basePrice = customConfig.size === '12oz' ? 19.00 : 15.00;// [cite: 8]
  let addOnCost = 0;// [cite: 8]
  Object.keys(customConfig.addonsMap).forEach(ad => {// [cite: 8]
    const qty = customConfig.addonsMap[ad] || 0;// [cite: 8]
    addOnCost += (getToppingUnitPrice(ad) * qty);// [cite: 8]
  });
  const total = customConfig.basePrice + addOnCost;// [cite: 8]
  const totalEl = document.getElementById('customTotalPrice');// [cite: 8]
  if (totalEl) totalEl.innerText = '₱ ' + total.toFixed(2);// [cite: 8]
  return total;// [cite: 8]
}

function updateCanvasHeaders() {// [cite: 8]
  const title = document.getElementById('canvasTitle');// [cite: 8]
  const toppingsSubtitle = document.getElementById('canvasToppingsSubtitle');// [cite: 8]
  const addonsSubtitle = document.getElementById('canvasAddonsSubtitle');// [cite: 8]

  if (title) {// [cite: 8]
    title.innerText = `${customConfig.size} ${customConfig.flavor} Jelly ${customConfig.jelly === 'Cube' ? 'Cubes' : customConfig.jelly}`;// [cite: 8]
  }

  if (toppingsSubtitle) {// [cite: 8]
    if (customConfig.toppings.length > 0) {// [cite: 8]
      toppingsSubtitle.style.display = 'block';// [cite: 8]
      toppingsSubtitle.innerText = '+ ' + customConfig.toppings.join(' + ');// [cite: 8]
    } else {// [cite: 8]
      toppingsSubtitle.style.display = 'none';// [cite: 8]
    }
  }

  if (addonsSubtitle) {// [cite: 8]
    let addonTextArr = [];// [cite: 8]
    Object.keys(customConfig.addonsMap).forEach(ad => {// [cite: 8]
      const count = customConfig.addonsMap[ad];// [cite: 8]
      if (count > 0) addonTextArr.push(`Extra ${ad} (x${count})`);// [cite: 8]
    });
    if (customConfig.utensils && customConfig.utensils !== 'No Spoon') {// [cite: 8]
      addonTextArr.push(customConfig.utensils);// [cite: 8]
    }

    if (addonTextArr.length > 0) {// [cite: 8]
      addonsSubtitle.style.display = 'block';// [cite: 8]
      addonsSubtitle.innerText = '+ ' + addonTextArr.join(' + ');// [cite: 8]
    } else {// [cite: 8]
      addonsSubtitle.style.display = 'none';// [cite: 8]
    }
  }
}

function rotateActiveTopping(direction) {// [cite: 8]
  if (customConfig.toppings.length === 0) {// [cite: 8]
    addToppingSlot();// [cite: 8]
    return;// [cite: 8]
  }
  const currentSelected = customConfig.toppings[customConfig.activeToppingSlot] || AVAILABLE_TOPPINGS[0];// [cite: 8]
  let idx = AVAILABLE_TOPPINGS.indexOf(currentSelected);// [cite: 8]
  idx = (idx + direction + AVAILABLE_TOPPINGS.length) % AVAILABLE_TOPPINGS.length;// [cite: 8]
  customConfig.toppings[customConfig.activeToppingSlot] = AVAILABLE_TOPPINGS[idx];// [cite: 8]
}

window.nextCustomizerChoice = function () {// [cite: 8]
  const stage = STAGES[currentStageIndex];// [cite: 8]
  if (stage === 'cup') {// [cite: 8]
    customConfig.size = '8oz';// [cite: 8]
  } else if (stage === 'flavor') {// [cite: 8]
    const choices = STAGE_CHOICES.flavor;// [cite: 8]
    let idx = choices.findIndex(c => c.id === customConfig.flavor);// [cite: 8]
    customConfig.flavor = choices[(idx + 1) % choices.length].id;// [cite: 8]
  } else if (stage === 'jelly') {// [cite: 8]
    const choices = STAGE_CHOICES.jelly;// [cite: 8]
    let idx = choices.findIndex(c => c.id === customConfig.jelly);// [cite: 8]
    customConfig.jelly = choices[(idx + 1) % choices.length].id;// [cite: 8]
  } else if (stage === 'toppings') {// [cite: 8]
    rotateActiveTopping(1);// [cite: 8]
  }
  renderCustomizerUI();// [cite: 8]
};

window.prevCustomizerChoice = function () {// [cite: 8]
  const stage = STAGES[currentStageIndex];// [cite: 8]
  if (stage === 'cup') {// [cite: 8]
    customConfig.size = '12oz';// [cite: 8]
  } else if (stage === 'flavor') {// [cite: 8]
    const choices = STAGE_CHOICES.flavor;// [cite: 8]
    let idx = choices.findIndex(c => c.id === customConfig.flavor);// [cite: 8]
    customConfig.flavor = choices[(idx - 1 + choices.length) % choices.length].id;// [cite: 8]
  } else if (stage === 'jelly') {// [cite: 8]
    const choices = STAGE_CHOICES.jelly;// [cite: 8]
    let idx = choices.findIndex(c => c.id === customConfig.jelly);// [cite: 8]
    customConfig.jelly = choices[(idx - 1 + choices.length) % choices.length].id;// [cite: 8]
  } else if (stage === 'toppings') {// [cite: 8]
    rotateActiveTopping(-1);// [cite: 8]
  }
  renderCustomizerUI();// [cite: 8]
};

window.switchCustomStage = function (stageName) {// [cite: 8]
  currentStageIndex = STAGES.indexOf(stageName);// [cite: 8]
  if (currentStageIndex === -1) currentStageIndex = 0;// [cite: 8]
  renderCustomizerUI();// [cite: 8]
};

function renderCustomizerUI() {// [cite: 8]
  const currentStage = STAGES[currentStageIndex];// [cite: 8]
  const sidebar = document.getElementById('customizerSidebarContent');// [cite: 8]
  const stageContainer = document.getElementById('stageItemsContainer');// [cite: 8]

  document.querySelectorAll('.stage-pill').forEach((pill, idx) => {// [cite: 8]
    pill.classList.toggle('active', idx === currentStageIndex);// [cite: 8]
  });

  calculateCustomTotal();// [cite: 8]
  updateCanvasHeaders();// [cite: 8]

  const isLarge = customConfig.size === '12oz';// [cite: 8]
  const stackClass = isLarge ? 'tall-stack' : 'short-stack';// [cite: 8]

  if (sidebar) {// [cite: 8]
    if (currentStage === 'cup') {// [cite: 8]
      sidebar.innerHTML = `
        <h3 class="sidebar-title">Sizes</h3>
        <div class="size-options-list">
          <label class="custom-radio-label">
            <input type="radio" name="custom_cup" value="12oz" ${customConfig.size === '12oz' ? 'checked' : ''} onchange="selectCustomSize('12oz')">
            <span class="radio-mark"></span>
            <span class="radio-text">12oz</span>
          </label>
          <label class="custom-radio-label">
            <input type="radio" name="custom_cup" value="8oz" ${customConfig.size === '8oz' ? 'checked' : ''} onchange="selectCustomSize('8oz')">
            <span class="radio-mark"></span>
            <span class="radio-text">8oz</span>
          </label>
        </div>
      `;// [cite: 8]
    } else if (currentStage === 'flavor') {// [cite: 8]
      sidebar.innerHTML = `
        <h3 class="sidebar-title">Flavor</h3>
        <div class="size-options-list">
          ${STAGE_CHOICES.flavor.map(f => `
            <label class="custom-radio-label">
              <input type="radio" name="custom_flavor" value="${f.id}" ${customConfig.flavor === f.id ? 'checked' : ''} onchange="selectCustomFlavor('${f.id}')">
              <span class="radio-mark"></span>
              <span class="radio-text">${f.label}</span>
            </label>
          `).join('')}
        </div>
      `;// [cite: 8]
    } else if (currentStage === 'jelly') {// [cite: 8]
      sidebar.innerHTML = `
        <h3 class="sidebar-title">Jelly</h3>
        <div class="size-options-list">
          ${STAGE_CHOICES.jelly.map(j => `
            <label class="custom-radio-label">
              <input type="radio" name="custom_jelly" value="${j.id}" ${customConfig.jelly === j.id ? 'checked' : ''} onchange="selectCustomJelly('${j.id}')">
              <span class="radio-mark"></span>
              <span class="radio-text">${j.label}</span>
            </label>
          `).join('')}
        </div>
      `;// [cite: 8]
    } else if (currentStage === 'toppings') {// [cite: 8]
      let toppingSlotsHTML = '';// [cite: 8]
      customConfig.toppings.forEach((top, idx) => {// [cite: 8]
        const price = getToppingUnitPrice(top);// [cite: 8]
        toppingSlotsHTML += `
          <div class="topping-slot-card ${customConfig.activeToppingSlot === idx ? 'active-slot' : ''}" onclick="selectToppingSlot(${idx})">
            <div class="slot-info">
              <span class="slot-number">Topping #${idx + 1}</span>
              <span class="slot-value">${top} (+₱${price.toFixed(2)})</span>
            </div>
            <button type="button" class="btn-remove-slot" onclick="removeToppingSlot(${idx}, event)">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        `;// [cite: 8]
      });

      let addSlotButtonHTML = '';// [cite: 8]
      if (customConfig.toppings.length < 2) {// [cite: 8]
        addSlotButtonHTML = `
          <button type="button" class="btn-add-topping-slot" onclick="addToppingSlot()">
            <i class="fa-solid fa-plus"></i> Add Topping (${customConfig.toppings.length}/2)
          </button>
        `;// [cite: 8]
      }

      let toppingPickerHTML = '';// [cite: 8]
      if (customConfig.toppings.length > 0) {// [cite: 8]
        const currentActiveVal = customConfig.toppings[customConfig.activeToppingSlot];// [cite: 8]
        toppingPickerHTML = `
          <div class="toppings-selection-list">
            <span class="sidebar-instruction">Choose for Slot #${customConfig.activeToppingSlot + 1}:</span>
            ${AVAILABLE_TOPPINGS.map(t => {// [cite: 8]
          const price = getToppingUnitPrice(t);// [cite: 8]
          return `
                <label class="custom-radio-label">
                  <input type="radio" name="slot_topping" value="${t}" ${currentActiveVal === t ? 'checked' : ''} onchange="setToppingForActiveSlot('${t}')">
                  <span class="radio-mark"></span>
                  <span class="radio-text">${t} (+₱${price.toFixed(2)})</span>
                </label>
              `;// [cite: 8]
        }).join('')}
          </div>
        `;// [cite: 8]
      }

      sidebar.innerHTML = `
        <h3 class="sidebar-title">Toppings</h3>
        <div class="toppings-slot-manager">
          ${toppingSlotsHTML}
          ${addSlotButtonHTML}
        </div>
        ${toppingPickerHTML}
      `;// [cite: 8]
    } else if (currentStage === 'addons') {// [cite: 8]
      const regularAddons = AVAILABLE_TOPPINGS.filter(a => a !== 'Choco Chips');// [cite: 8]
      sidebar.innerHTML = `
        <h3 class="sidebar-title">Add ons</h3>
        <span class="sidebar-price-tag">Extra Toppings</span>
        <div class="addons-qty-list">
          ${regularAddons.map(ad => {// [cite: 8]
        const count = customConfig.addonsMap[ad] || 0;// [cite: 8]
        return `
              <div class="addon-qty-row">
                <span class="addon-name">${ad} (+₱${getToppingUnitPrice(ad).toFixed(2)})</span>
                <div class="addon-qty-control">
                  <button type="button" class="btn-addon-qty" onclick="changeAddonQty('${ad}', -1)">-</button>
                  <span class="addon-qty-num">${count}</span>
                  <button type="button" class="btn-addon-qty" onclick="changeAddonQty('${ad}', 1)">+</button>
                </div>
              </div>
            `;// [cite: 8]
      }).join('')}
        </div>
        
        <span class="sidebar-price-tag" style="margin-top: 8px;">Premium Add-ons</span>
        <div class="addons-qty-list">
          <div class="addon-qty-row">
            <span class="addon-name">Choco Chips (+₱${getToppingUnitPrice('Choco Chips').toFixed(2)})</span>
            <div class="addon-qty-control">
              <button type="button" class="btn-addon-qty" onclick="changeAddonQty('Choco Chips', -1)">-</button>
              <span class="addon-qty-num">${customConfig.addonsMap['Choco Chips'] || 0}</span>
              <button type="button" class="btn-addon-qty" onclick="changeAddonQty('Choco Chips', 1)">+</button>
            </div>
          </div>
          <div class="addon-qty-row">
            <span class="addon-name">Condensed Milk (+₱${getToppingUnitPrice('Condensed Milk').toFixed(2)})</span>
            <div class="addon-qty-control">
              <button type="button" class="btn-addon-qty" onclick="changeAddonQty('Condensed Milk', -1)">-</button>
              <span class="addon-qty-num">${customConfig.addonsMap['Condensed Milk'] || 0}</span>
              <button type="button" class="btn-addon-qty" onclick="changeAddonQty('Condensed Milk', 1)">+</button>
            </div>
          </div>
        </div>

        <span class="sidebar-price-tag" style="margin-top: 8px;">Utensils:</span>
        <div class="size-options-list">
          <label class="custom-radio-label">
            <input type="radio" name="custom_utensil" value="No Spoon" ${customConfig.utensils === 'No Spoon' ? 'checked' : ''} onchange="selectUtensil('No Spoon')">
            <span class="radio-mark"></span>
            <span class="radio-text">No Spoon</span>
          </label>
          <label class="custom-radio-label">
            <input type="radio" name="custom_utensil" value="Spoon" ${customConfig.utensils === 'Spoon' ? 'checked' : ''} onchange="selectUtensil('Spoon')">
            <span class="radio-mark"></span>
            <span class="radio-text">Spoon</span>
          </label>
        </div>
      `;// [cite: 8]
    }
  }

  if (stageContainer) {// [cite: 8]
    if (currentStage === 'cup') {// [cite: 8]
      if (customConfig.size === '12oz') {// [cite: 8]
        stageContainer.innerHTML = `
          <div class="layered-cup-display-item empty-slot"></div>
          <div class="layered-cup-display-item active-cup-choice">
            <span class="cup-label-top">12oz</span>
            ${buildLayeredCupHTML({ size: '12oz' }, 'tall-stack')}
          </div>
          <div class="layered-cup-display-item" onclick="selectCustomSize('8oz')">
            <span class="cup-label-top">8oz</span>
            ${buildLayeredCupHTML({ size: '8oz' }, 'short-stack')}
          </div>
        `;// [cite: 8]
      } else {// [cite: 8]
        stageContainer.innerHTML = `
          <div class="layered-cup-display-item" onclick="selectCustomSize('12oz')">
            <span class="cup-label-top">12oz</span>
            ${buildLayeredCupHTML({ size: '12oz' }, 'tall-stack')}
          </div>
          <div class="layered-cup-display-item active-cup-choice">
            <span class="cup-label-top">8oz</span>
            ${buildLayeredCupHTML({ size: '8oz' }, 'short-stack')}
          </div>
          <div class="layered-cup-display-item empty-slot"></div>
        `;// [cite: 8]
      }
    } else if (currentStage === 'flavor') {// [cite: 8]
      const choices = STAGE_CHOICES.flavor;// [cite: 8]
      const idx = choices.findIndex(c => c.id === customConfig.flavor);// [cite: 8]
      const prev = choices[(idx - 1 + choices.length) % choices.length];// [cite: 8]
      const next = choices[(idx + 1) % choices.length];// [cite: 8]

      stageContainer.innerHTML = `
        <div class="layered-cup-display-item" onclick="selectCustomFlavor('${prev.id}')">
          <span class="cup-label-top">${prev.label}</span>
          ${buildLayeredCupHTML({ flavor: prev.id }, stackClass)}
        </div>
        <div class="layered-cup-display-item active-cup-choice">
          <span class="cup-label-top">${choices[idx].label}</span>
          ${buildLayeredCupHTML({ flavor: choices[idx].id }, stackClass)}
        </div>
        <div class="layered-cup-display-item" onclick="selectCustomFlavor('${next.id}')">
          <span class="cup-label-top">${next.label}</span>
          ${buildLayeredCupHTML({ flavor: next.id }, stackClass)}
        </div>
      `;// [cite: 8]
    } else if (currentStage === 'jelly') {// [cite: 8]
      const choices = STAGE_CHOICES.jelly;// [cite: 8]
      const idx = choices.findIndex(c => c.id === customConfig.jelly);// [cite: 8]
      const prev = choices[(idx - 1 + choices.length) % choices.length];// [cite: 8]
      const next = choices[(idx + 1) % choices.length];// [cite: 8]

      stageContainer.innerHTML = `
        <div class="layered-cup-display-item" onclick="selectCustomJelly('${prev.id}')">
          <span class="cup-label-top">${prev.label}</span>
          ${buildLayeredCupHTML({ jelly: prev.id }, stackClass)}
        </div>
        <div class="layered-cup-display-item active-cup-choice">
          <span class="cup-label-top">${choices[idx].label}</span>
          ${buildLayeredCupHTML({ jelly: choices[idx].id }, stackClass)}
        </div>
        <div class="layered-cup-display-item" onclick="selectCustomJelly('${next.id}')">
          <span class="cup-label-top">${next.label}</span>
          ${buildLayeredCupHTML({ jelly: next.id }, stackClass)}
        </div>
      `;// [cite: 8]
    } else if (currentStage === 'toppings') {// [cite: 8]
      const currentTop = customConfig.toppings[customConfig.activeToppingSlot] || AVAILABLE_TOPPINGS[0];// [cite: 8]
      const tIdx = AVAILABLE_TOPPINGS.indexOf(currentTop);// [cite: 8]
      const prevTop = AVAILABLE_TOPPINGS[(tIdx - 1 + AVAILABLE_TOPPINGS.length) % AVAILABLE_TOPPINGS.length];// [cite: 8]
      const nextTop = AVAILABLE_TOPPINGS[(tIdx + 1) % AVAILABLE_TOPPINGS.length];// [cite: 8]

      const prevScatter = getLayer2ToppingPath(prevTop, isLarge);// [cite: 8]
      const nextScatter = getLayer2ToppingPath(nextTop, isLarge);// [cite: 8]

      stageContainer.innerHTML = `
        <div class="layered-cup-display-item" onclick="setToppingForActiveSlot('${prevTop}')">
          <span class="cup-label-top">${prevTop}</span>
          <div class="toppings-scatter-preview">
            ${prevScatter ? `<img src="${prevScatter}" class="scatter-img" alt="${prevTop}">` : ''}
          </div>
        </div>
        <div class="layered-cup-display-item active-cup-choice">
          <span class="cup-label-top">${customConfig.toppings.length > 0 ? customConfig.toppings.join(' + ') : 'No Toppings'}</span>
          ${buildLayeredCupHTML({}, stackClass)}
        </div>
        <div class="layered-cup-display-item" onclick="setToppingForActiveSlot('${nextTop}')">
          <span class="cup-label-top">${nextTop}</span>
          <div class="toppings-scatter-preview">
            ${nextScatter ? `<img src="${nextScatter}" class="scatter-img" alt="${nextTop}">` : ''}
          </div>
        </div>
      `;// [cite: 8]
    } else if (currentStage === 'addons') {// [cite: 8]
      const regularAddons = AVAILABLE_TOPPINGS.filter(a => a !== 'Choco Chips');// [cite: 8]
      const activeAddonKeys = Object.keys(customConfig.addonsMap).filter(k => customConfig.addonsMap[k] > 0);// [cite: 8]

      const prevAddon = regularAddons[0] || 'Cheese';// [cite: 8]
      const nextAddon = regularAddons[1] || 'Tapioca';// [cite: 8]
      const prevScatter = getLayer2ToppingPath(prevAddon, isLarge);// [cite: 8]
      const nextScatter = getLayer2ToppingPath(nextAddon, isLarge);// [cite: 8]

      stageContainer.innerHTML = `
        <div class="layered-cup-display-item" onclick="changeAddonQty('${prevAddon}', 1)">
          <span class="cup-label-top">${prevAddon}</span>
          <div class="toppings-scatter-preview">
            ${prevScatter ? `<img src="${prevScatter}" class="scatter-img" alt="${prevAddon}">` : ''}
          </div>
        </div>
        <div class="layered-cup-display-item active-cup-choice">
          <span class="cup-label-top">${activeAddonKeys.length > 0 ? activeAddonKeys.join(' + ') : 'No Add-ons'}</span>
          ${buildLayeredCupHTML({}, stackClass)}
        </div>
        <div class="layered-cup-display-item" onclick="changeAddonQty('${nextAddon}', 1)">
          <span class="cup-label-top">${nextAddon}</span>
          <div class="toppings-scatter-preview">
            ${nextScatter ? `<img src="${nextScatter}" class="scatter-img" alt="${nextAddon}">` : ''}
          </div>
        </div>
      `;// [cite: 8]
    }
  }
}

window.selectCustomSize = function (size) {// [cite: 8]
  customConfig.size = size;// [cite: 8]
  renderCustomizerUI();// [cite: 8]
};

window.selectCustomFlavor = function (flavor) {// [cite: 8]
  customConfig.flavor = flavor;// [cite: 8]
  renderCustomizerUI();// [cite: 8]
};

window.selectCustomJelly = function (jelly) {// [cite: 8]
  customConfig.jelly = jelly;// [cite: 8]
  renderCustomizerUI();// [cite: 8]
};

window.addToppingSlot = function () {// [cite: 8]
  if (customConfig.toppings.length < 2) {// [cite: 8]
    const nextDefault = AVAILABLE_TOPPINGS.find(t => !customConfig.toppings.includes(t)) || AVAILABLE_TOPPINGS[0];// [cite: 8]
    customConfig.toppings.push(nextDefault);// [cite: 8]
    customConfig.activeToppingSlot = customConfig.toppings.length - 1;// [cite: 8]
    renderCustomizerUI();// [cite: 8]
  }
};

window.removeToppingSlot = function (slotIndex, event) {// [cite: 8]
  if (event) event.stopPropagation();// [cite: 8]
  customConfig.toppings.splice(slotIndex, 1);// [cite: 8]
  customConfig.activeToppingSlot = Math.max(0, customConfig.toppings.length - 1);// [cite: 8]
  renderCustomizerUI();// [cite: 8]
};

window.selectToppingSlot = function (slotIndex) {// [cite: 8]
  customConfig.activeToppingSlot = slotIndex;// [cite: 8]
  renderCustomizerUI();// [cite: 8]
};

window.setToppingForActiveSlot = function (toppingName) {// [cite: 8]
  if (customConfig.toppings.length === 0) {// [cite: 8]
    customConfig.toppings.push(toppingName);// [cite: 8]
    customConfig.activeToppingSlot = 0;// [cite: 8]
  } else {// [cite: 8]
    customConfig.toppings[customConfig.activeToppingSlot] = toppingName;// [cite: 8]
  }
  renderCustomizerUI();// [cite: 8]
};

window.changeAddonQty = function (addonName, delta) {// [cite: 8]
  const current = customConfig.addonsMap[addonName] || 0;// [cite: 8]
  const updated = Math.max(0, current + delta);// [cite: 8]
  if (updated === 0) {// [cite: 8]
    delete customConfig.addonsMap[addonName];// [cite: 8]
  } else {// [cite: 8]
    customConfig.addonsMap[addonName] = updated;// [cite: 8]
  }
  renderCustomizerUI();// [cite: 8]
};

window.selectUtensil = function (utensil) {// [cite: 8]
  customConfig.utensils = utensil;// [cite: 8]
  renderCustomizerUI();// [cite: 8]
};

// ==========================================
// CHECKOUT & CART FOR CUSTOM CUPS
// ==========================================
window.addCustomCupToCart = async function () {// [cite: 8]
  const isLarge = customConfig.size === '12oz';// [cite: 8]
  let accentColor = '#664638';// [cite: 8]
  if (customConfig.flavor === 'Strawberry') accentColor = '#f48a8e';// [cite: 8]
  if (customConfig.flavor === 'Pandan') accentColor = '#8bb35c';// [cite: 8]

  let addonStr = [];// [cite: 8]
  Object.keys(customConfig.addonsMap).forEach(a => {// [cite: 8]
    if (customConfig.addonsMap[a] > 0) addonStr.push(`Extra ${a} (x${customConfig.addonsMap[a]})`);// [cite: 8]
  });
  if (customConfig.utensils && customConfig.utensils !== 'No Spoon') {// [cite: 8]
    addonStr.push(customConfig.utensils);// [cite: 8]
  }

  const itemTitle = `${customConfig.flavor} Jelly ${customConfig.jelly === 'Cube' ? 'Cubes' : customConfig.jelly}`;// [cite: 8]
  const l1Src = getLayer1ImagePath(customConfig.flavor, customConfig.jelly, isLarge);// [cite: 8]
  const l3Src = getLayer3CupPath(isLarge);// [cite: 8]
  const firstTop = customConfig.toppings[0] || null;// [cite: 8]
  const l2Src = firstTop ? getLayer2ToppingPath(firstTop, isLarge) : '';// [cite: 8]

  const payload = {// [cite: 8]
    title: itemTitle,
    size: customConfig.size,
    flavor: customConfig.flavor,
    variation: customConfig.jelly,
    toppings: customConfig.toppings,
    addons: addonStr.join(', '),
    unit_price: calculateCustomTotal(),
    quantity: 1,
    accent_color: accentColor,
    image: l1Src,
    flavor_img: l1Src,
    toppings_img: l2Src,
    cup_img: l3Src
  };// [cite: 8]

  const user = JSON.parse(localStorage.getItem('mm_user') || '{}');// [cite: 8]

  try {// [cite: 8]
    const res = await fetch('/api/cart', {// [cite: 8]
      method: 'POST',// [cite: 8]
      headers: { 'Content-Type': 'application/json' },// [cite: 8]
      body: JSON.stringify({// [cite: 8]
        action: 'add',
        item: payload,
        customer_id: user.customer_id || null,
        session_id: !user.customer_id ? getGuestSessionId() : null
      })// [cite: 8]
    });// [cite: 8]
    if (!res.ok) throw new Error('Network error');// [cite: 8]
  } catch (err) {// [cite: 8]
    console.error('Custom cup cart add error:', err);// [cite: 8]
  }

  CartAlert.showModal({// [cite: 8]
    title: itemTitle,
    size: customConfig.size,
    flavor_img: l1Src,
    toppings_img: l2Src,
    cup_img: l3Src,
    accent_color: accentColor,
    onCheckout: () => { window.location.href = 'cart.html'; }
  });// [cite: 8]
  updateCartCount();// [cite: 8]
};

window.proceedCustomOrderSummary = function () {// [cite: 8]
  const isLarge = customConfig.size === '12oz';// [cite: 8]
  let addonStr = [];// [cite: 8]
  Object.keys(customConfig.addonsMap).forEach(a => {// [cite: 8]
    if (customConfig.addonsMap[a] > 0) addonStr.push(`Extra ${a} (x${customConfig.addonsMap[a]})`);// [cite: 8]
  });
  if (customConfig.utensils && customConfig.utensils !== 'No Spoon') {// [cite: 8]
    addonStr.push(customConfig.utensils);// [cite: 8]
  }

  const l1Src = getLayer1ImagePath(customConfig.flavor, customConfig.jelly, isLarge);// [cite: 8]
  const l3Src = getLayer3CupPath(isLarge);// [cite: 8]
  const firstTop = customConfig.toppings[0] || null;// [cite: 8]
  const l2Src = firstTop ? getLayer2ToppingPath(firstTop, isLarge) : '';// [cite: 8]

  let accentColor = '#664638';// [cite: 8]
  if (customConfig.flavor === 'Strawberry') accentColor = '#f48a8e';// [cite: 8]
  if (customConfig.flavor === 'Pandan') accentColor = '#8bb35c';// [cite: 8]

  const items = [{// [cite: 8]
    title: `${customConfig.flavor} Jelly ${customConfig.jelly === 'Cube' ? 'Cubes' : customConfig.jelly}`,
    size: customConfig.size,
    is_custom: true,
    image: l1Src,
    flavor_img: l1Src,
    toppings_img: l2Src,
    cup_img: l3Src,
    accent_color: accentColor,
    toppings: customConfig.toppings.length > 0 ? '+ ' + customConfig.toppings.join(' + ') : '',
    addons: addonStr.length > 0 ? '+ ' + addonStr.join(' + ') : '',
    unit_price: calculateCustomTotal(),
    quantity: 1
  }];// [cite: 8]

  if (typeof renderOrderSummaryModal === 'function') {// [cite: 8]
    renderOrderSummaryModal(items);// [cite: 8]
  }
};

// ==========================================
// ORDER RECENT & CARD HELPERS
// ==========================================
function getOrderDrinkMetadata(itemTitle) {// [cite: 8]
  const titleClean = (itemTitle || '').toLowerCase();// [cite: 8]

  const found = PRESET_SIGNATURES.find(p => {// [cite: 8]
    const pTitle = p.title.replace(/\r?\n|\r/g, ' ').toLowerCase();// [cite: 8]
    return titleClean.includes(pTitle) || pTitle.includes(cleanKey => titleClean.includes(cleanKey));// [cite: 8]
  });

  if (found) {// [cite: 8]
    return {
      image: found.image,
      accent: found.accent_color || '#F48A8E',
      title: found.title.replace('\n', ' ')
    };
  }

  if (titleClean.includes('pandan')) {// [cite: 8]
    return { image: 'images/Cheesy Pandan Cubes.png', accent: '#8bb35c', title: itemTitle };// [cite: 8]
  } else if (titleClean.includes('coffee') || titleClean.includes('chocolatey')) {// [cite: 8]
    return { image: 'images/Chocolatey Coffee Noodly Jelly.png', accent: '#664638', title: itemTitle };// [cite: 8]
  } else if (titleClean.includes('strawberry')) {// [cite: 8]
    return { image: 'images/Strawberry String Party.png', accent: '#f48a8e', title: itemTitle };// [cite: 8]
  }

  return { image: 'images/Cheesy Pandan Cubes.png', accent: '#8bb35c', title: itemTitle || 'Special Blend Cup' };// [cite: 8]
}

function formatOrderStatus(status) {// [cite: 8]
  if (!status) return 'Pending';// [cite: 8]
  const s = status.toUpperCase().trim();// [cite: 8]
  if (s === 'PAID_VERIFIED' || s === 'PREPARING') return 'Preparing';// [cite: 8]
  if (s === 'PENDING_PAYMENT' || s === 'PENDING') return 'Pending';// [cite: 8]
  if (s === 'READY_FOR_PICKUP') return 'Ready for Pick-Up';// [cite: 8]
  if (s === 'COMPLETED') return 'Completed';// [cite: 8]
  if (s === 'CONFIRMED') return 'Confirmed';// [cite: 8]
  if (s === 'CANCELLED') return 'Cancelled';// [cite: 8]
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();// [cite: 8]
}

function getOrderStatusClass(status) {// [cite: 8]
  if (!status) return 'pending';// [cite: 8]
  const s = status.toUpperCase().trim();// [cite: 8]
  if (s === 'PAID_VERIFIED' || s === 'PREPARING') return 'preparing';// [cite: 8]
  if (s === 'PENDING_PAYMENT' || s === 'PENDING') return 'pending';// [cite: 8]
  if (s === 'READY_FOR_PICKUP') return 'ready-for-pickup';// [cite: 8]
  if (s === 'COMPLETED') return 'completed';// [cite: 8]
  if (s === 'CONFIRMED') return 'confirmed';// [cite: 8]
  if (s === 'CANCELLED') return 'cancelled';// [cite: 8]
  return s.toLowerCase().replace(/_/g, '-');// [cite: 8]
}

window.copyOrderNumber = function (orderNum) {// [cite: 8]
  if (navigator.clipboard && navigator.clipboard.writeText) {// [cite: 8]
    navigator.clipboard.writeText(orderNum);// [cite: 8]
  }
  if (typeof Swal !== 'undefined') {// [cite: 8]
    Swal.fire({// [cite: 8]
      toast: true,// [cite: 8]
      position: 'top-end',// [cite: 8]
      icon: 'success',// [cite: 8]
      title: 'Order ID copied!',// [cite: 8]
      showConfirmButton: false,// [cite: 8]
      timer: 1500// [cite: 8]
    });// [cite: 8]
  }
};

window.buyAgainOrder = function (rawTitleEncoded) {// [cite: 8]
  const title = decodeURIComponent(rawTitleEncoded).toLowerCase();// [cite: 8]
  const match = PRESET_SIGNATURES.find(p => p.title.replace('\n', ' ').toLowerCase() === title);// [cite: 8]
  if (match) {// [cite: 8]
    openProductModal(encodeURIComponent(JSON.stringify(match)));// [cite: 8]
  } else {// [cite: 8]
    window.location.href = '#drinks';// [cite: 8]
  }
};

// GUEST RATING RESTRICTION MODAL
function showGuestRatingModal() {// [cite: 8]
  if (typeof Swal !== 'undefined') {// [cite: 8]
    Swal.fire({// [cite: 8]
      icon: 'info',// [cite: 8]
      title: 'Register to Rate',// [cite: 8]
      html: 'Only registered Marble family members can rate our sips!<br>Sign up now to share your sweet review.',// [cite: 8]
      showCancelButton: true,// [cite: 8]
      confirmButtonText: 'Sign Up Now',// [cite: 8]
      cancelButtonText: 'Maybe Later',// [cite: 8]
      confirmButtonColor: '#F48A8E',// [cite: 8]
      cancelButtonColor: '#888'// [cite: 8]
    }).then((result) => {// [cite: 8]
      if (result.isConfirmed) {// [cite: 8]
        window.location.href = 'signup.html';// [cite: 8]
      }
    });
  }
}

window.rateOrderSips = function (orderNumber, rawTitleEncoded) {// [cite: 8]
  const user = JSON.parse(localStorage.getItem('mm_user') || '{}');// [cite: 8]
  if (!user || !user.customer_id) {// [cite: 8]
    showGuestRatingModal();// [cite: 8]
    return;// [cite: 8]
  }

  const title = decodeURIComponent(rawTitleEncoded);// [cite: 8]
  const match = PRESET_SIGNATURES.find(p => p.title.replace('\n', ' ').toLowerCase() === title.toLowerCase());// [cite: 8]
  if (match) {// [cite: 8]
    openProductModal(encodeURIComponent(JSON.stringify(match)));// [cite: 8]
    setTimeout(() => {// [cite: 8]
      const el = document.querySelector('.modal-ratings-section');// [cite: 8]
      if (el) el.scrollIntoView({ behavior: 'smooth' });// [cite: 8]
    }, 300);
  } else {// [cite: 8]
    window.location.href = 'orders.html';// [cite: 8]
  }
};

// ==========================================
// RECENT ORDERS & SEARCH
// ==========================================
async function loadRecentOrders() {// [cite: 8]
  const container = document.getElementById('homeOrdersContainer');// [cite: 8]
  if (!container) return;// [cite: 8]
  const user = JSON.parse(localStorage.getItem('mm_user') || 'null');// [cite: 8]

  if (!user || !user.customer_id) {// [cite: 8]
    container.innerHTML = `
      <div style="text-align: center; padding: 42px 20px; background: #FFFFFF; border-radius: 20px; border: 1.5px solid #FCE1DD; color: #777;">
        <i class="fa-solid fa-receipt" style="font-size: 2.6rem; color: #b8a69d; margin-bottom: 12px;"></i>
        <p style="font-size: 1.15rem; font-weight: 700; color: #4a3427; margin-bottom: 6px;">No recent orders found</p>
        <p style="font-size: 0.92rem; margin-bottom: 16px; color: #7C4F38;">You are currently browsing as a guest. Log in to track your sweet cups!</p>
        <a href="login.html" style="display: inline-block; padding: 9px 22px; background: #F48A8E; color: #ffffff; text-decoration: none; border-radius: 99px; font-weight: 700;">Log In to View</a>
      </div>
    `;// [cite: 8]
    return;// [cite: 8]
  }

  try {// [cite: 8]
    const res = await fetch(`/api/orders/recent?customer_id=${user.customer_id}`);// [cite: 8]
    const data = await res.json();// [cite: 8]

    if (!data.orders || data.orders.length === 0) {// [cite: 8]
      container.innerHTML = `
        <div style="text-align: center; padding: 42px 20px; background: #FFFFFF; border-radius: 20px; border: 1.5px solid #FCE1DD;">
          <p style="font-weight: 700; color: #4a3427;">You haven't placed any drink orders yet.</p>
          <a href="#drinks" style="display: inline-block; margin-top: 10px; padding: 8px 20px; background: #F48A8E; color: #fff; border-radius: 99px; text-decoration: none; font-weight:700;">Order a Drink</a>
        </div>
      `;// [cite: 8]
      return;// [cite: 8]
    }

    const cardsHTML = data.orders.map(order => {// [cite: 8]
      let totalCups = order.total_cups;// [cite: 8]
      if (totalCups === undefined || totalCups === null) {// [cite: 8]
        if (Array.isArray(order.items) && order.items.length > 0) {// [cite: 8]
          totalCups = order.items.reduce((sum, it) => sum + (parseInt(it.quantity, 10) || 1), 0);// [cite: 8]
        } else {// [cite: 8]
          totalCups = 1;// [cite: 8]
        }
      }
      const totalCupsDisplay = `${totalCups} ${totalCups === 1 ? 'Cup' : 'Cups'}`;// [cite: 8]

      const rawTitle = order.title || (order.items && order.items[0] && order.items[0].item_label) || 'Special Blend Cup';// [cite: 8]
      const meta = getOrderDrinkMetadata(rawTitle);// [cite: 8]

      const rawStatus = order.status || 'PENDING_PAYMENT';// [cite: 8]
      const displayStatus = formatOrderStatus(rawStatus);// [cite: 8]
      const statusClass = getOrderStatusClass(rawStatus);// [cite: 8]

      let schedule = order.pickup_date || 'N/A';// [cite: 8]
      if (schedule === 'N/A' && order.placed_at) {// [cite: 8]
        schedule = new Date(order.placed_at).toISOString().split('T')[0];// [cite: 8]
      }

      const isCompleted = displayStatus.toLowerCase() === 'completed';// [cite: 8]
      let actionsHTML = '';// [cite: 8]
      if (isCompleted) {// [cite: 8]
        actionsHTML = `
          <button type="button" class="home-btn-action-primary" onclick="event.stopPropagation(); buyAgainOrder('${encodeURIComponent(rawTitle)}')">Buy Again</button>
          <button type="button" class="home-btn-action-secondary" onclick="event.stopPropagation(); rateOrderSips('${order.order_number}', '${encodeURIComponent(rawTitle)}')">Rate your Sips</button>
        `;// [cite: 8]
      }

      return `
        <article class="home-order-card" data-status="${statusClass}" onclick="window.location.href='orders.html'">
          <div class="home-order-card-inner">
            <div class="home-order-thumb-wrapper" style="--card-thumb-bg: ${meta.accent};">
              <img src="${meta.image}" class="home-order-thumb-img" alt="${meta.title}">
            </div>
            <div class="home-order-details-col">
              <div class="home-order-header-row">
                <h2 class="home-order-title">${meta.title}</h2>
                <span class="home-order-status-badge status-${statusClass}">${displayStatus}</span>
              </div>
              <div class="home-order-meta-grid">
                <div class="home-order-meta-col">
                  <span class="home-meta-label">ORDER ID</span>
                  <span class="home-meta-value">
                    ${order.order_number}
                    <button type="button" class="btn-copy-ref" onclick="event.stopPropagation(); copyOrderNumber('${order.order_number}')" title="Copy Order ID">
                      <i class="fa-regular fa-copy"></i>
                    </button>
                  </span>
                </div>
                <div class="home-order-meta-col">
                  <span class="home-meta-label">TOTAL CUPS</span>
                  <span class="home-meta-value">${totalCupsDisplay}</span>
                </div>
                <div class="home-order-meta-col">
                  <span class="home-meta-label">PICK-UP SCHEDULE</span>
                  <span class="home-meta-value">${schedule}</span>
                </div>
              </div>
              <div class="home-order-card-footer">
                <div class="home-order-actions-group">
                  ${actionsHTML}
                </div>
                <div class="home-order-total-block">
                  <span class="home-total-label">Total:</span>
                  <span class="home-total-value">₱ ${parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </article>
      `;// [cite: 8]
    }).join('');// [cite: 8]

    container.innerHTML = `
      ${cardsHTML}
      <div class="view-all-container" style="text-align: center; margin-top: 18px;">
        <a href="orders.html" class="btn-view-all">View All Orders</a>
      </div>
    `;// [cite: 8]
  } catch (err) {// [cite: 8]
    console.error('Recent orders error:', err);// [cite: 8]
  }
}

window.filterDrinks = function (q) {// [cite: 8]
  const query = (q || '').toLowerCase().trim();// [cite: 8]
  document.querySelectorAll('.products-grid .product-card').forEach(card => {// [cite: 8]
    const text = card.getAttribute('data-search-keywords') || '';// [cite: 8]
    card.style.display = (!query || text.includes(query)) ? '' : 'none';// [cite: 8]
  });
};

function updateCartCount() {// [cite: 8]
  const countBadge = document.getElementById('navCartCount');// [cite: 8]
  if (!countBadge) return;// [cite: 8]
  const user = JSON.parse(localStorage.getItem('mm_user') || '{}');// [cite: 8]
  const customerId = user.customer_id || null;// [cite: 8]
  const sessionId = !customerId ? getGuestSessionId() : null;// [cite: 8]

  const url = customerId// [cite: 8]
    ? `/api/cart/count?customer_id=${customerId}`// [cite: 8]
    : `/api/cart/count?session_id=${sessionId}`;// [cite: 8]

  fetch(url)// [cite: 8]
    .then(res => res.json())// [cite: 8]
    .then(data => {// [cite: 8]
      const count = parseInt(data.count, 10) || 0;// [cite: 8]
      countBadge.innerText = count;// [cite: 8]
      countBadge.style.display = count > 0 ? 'inline-block' : 'none';// [cite: 8]
    })
    .catch(() => { countBadge.innerText = 0; });// [cite: 8]
}

// =========================================================================
// LOYALTY POINTS ENGINE
// =========================================================================
let userLoyaltyPoints = 0.0;// [cite: 8]
let loyaltyDiscountApplied = 0.0;// [cite: 8]

async function fetchCustomerLoyaltyPoints() {// [cite: 8]
  const localUser = JSON.parse(localStorage.getItem('mm_user') || '{}');// [cite: 8]
  if (!localUser.customer_id) {// [cite: 8]
    renderLoyaltyPoints(0.0);// [cite: 8]
    return;// [cite: 8]
  }

  try {// [cite: 8]
    const res = await fetch(`/api/customer/profile?customer_id=${localUser.customer_id}`);// [cite: 8]
    const result = await res.json();// [cite: 8]
    if (res.ok && result.status === 'success') {// [cite: 8]
      const data = result.data || result.customer || {};// [cite: 8]
      userLoyaltyPoints = parseFloat(data.loyalty_points || 0);// [cite: 8]
      renderLoyaltyPoints(userLoyaltyPoints);// [cite: 8]
    }
  } catch (err) {// [cite: 8]
    console.warn('Could not load customer loyalty points:', err);// [cite: 8]
  }
}

function renderLoyaltyPoints(points) {// [cite: 8]
  const formattedPts = points.toFixed(1);// [cite: 8]
  const pesoVal = (points * 1.0).toFixed(2);// [cite: 8]

  const ptsEl = document.getElementById('displayLoyaltyPoints');// [cite: 8]
  const pesoEl = document.getElementById('displayLoyaltyPeso');// [cite: 8]
  if (ptsEl) ptsEl.innerText = `${formattedPts} pts`;// [cite: 8]
  if (pesoEl) pesoEl.innerText = `(₱${pesoVal})`;// [cite: 8]

  const summaryAvail = document.getElementById('summaryLoyaltyAvailable');// [cite: 8]
  if (summaryAvail) {// [cite: 8]
    summaryAvail.innerText = `Available: ${formattedPts} pts (₱${pesoVal})`;// [cite: 8]
  }
}

// ==========================================
// WELCOME BACK MODAL ENGINE
// ==========================================
function checkWelcomeBackModal() {// [cite: 8]
  const userRaw = localStorage.getItem('mm_user');// [cite: 8]
  if (!userRaw) return;// [cite: 8]

  try {// [cite: 8]
    const user = JSON.parse(userRaw);// [cite: 8]
    if (!user.customer_id) return; // Wag ipakita sa guest// [cite: 8]

    const displayName = user.full_name || user.username || 'Sample User';// [cite: 8]

    const alreadyWelcomed = sessionStorage.getItem('mm_welcomed');// [cite: 8]
    const urlParams = new URLSearchParams(window.location.search);// [cite: 8]
    const isFromLogin = urlParams.get('login') === 'success' || sessionStorage.getItem('just_logged_in') === 'true';// [cite: 8]

    if (!alreadyWelcomed || isFromLogin) {// [cite: 8]
      sessionStorage.setItem('mm_welcomed', 'true');// [cite: 8]
      sessionStorage.removeItem('just_logged_in');// [cite: 8]

      if (urlParams.has('login')) {// [cite: 8]
        window.history.replaceState({}, document.title, window.location.pathname);// [cite: 8]
      }

      showSweetAlert({// [cite: 8]
        icon: 'success',// [cite: 8]
        title: 'Welcome Back!',// [cite: 8]
        html: `Yay, you're logged in as <strong>${displayName}</strong>!<br>Ready to pop the straw and build your sweet sips?`,// [cite: 8]
        showCancelButton: false,// [cite: 8]
        confirmButtonText: "Let's Sip!",// [cite: 8]
        reverseButtons: false,// [cite: 8]
        focusConfirm: false,// [cite: 8]
        didOpen: () => {// [cite: 8]
          const cancelBtn = document.querySelector('.mm-swal-cancel-btn');// [cite: 8]
          if (cancelBtn) {// [cite: 8]
            cancelBtn.style.setProperty('display', 'none', 'important');// [cite: 8]
          }
        }
      }).then((result) => {// [cite: 8]
        if (result.isConfirmed) {// [cite: 8]
          const drinksSection = document.getElementById('drinks');// [cite: 8]
          if (drinksSection) {// [cite: 8]
            drinksSection.scrollIntoView({ behavior: 'smooth' });// [cite: 8]
          }
        }
      });
    }
  } catch (err) {// [cite: 8]
    console.error('Error showing welcome popup:', err);// [cite: 8]
  }
}

// ==========================================
// INITIALIZATION & AVATAR / DROPDOWN HANDLER
// ==========================================
document.addEventListener('DOMContentLoaded', () => {// [cite: 8]
  renderSignatureDrinks();// [cite: 8]
  loadLiveRatingsSummary();// [cite: 8]
  renderCustomizerUI();// [cite: 8]
  loadRecentOrders();// [cite: 8]
  updateCartCount();// [cite: 8]
  fetchCustomerLoyaltyPoints();// [cite: 8]
  checkWelcomeBackModal();// [cite: 8]

  // Event listener for user slot / dropdown menu// [cite: 8]
  const navSlot = document.getElementById('navUserSlot');// [cite: 8]
  if (navSlot) {// [cite: 8]
    navSlot.addEventListener('click', (e) => {// [cite: 8]
      const localUser = JSON.parse(localStorage.getItem('mm_user') || '{}');// [cite: 8]

      // 1. REGISTERED USER: Handle dropdown item clicks// [cite: 8]
      if (localUser.customer_id) {// [cite: 8]
        // Trigger SweetAlert confirmation specifically when clicking 'Logout' inside the dropdown// [cite: 8]
        const logoutItem = e.target.closest('.logout-btn, #btnLogout, [href*="logout"], .dropdown-logout');// [cite: 8]
        if (logoutItem || e.target.innerText.trim().toLowerCase() === 'logout') {// [cite: 8]
          e.preventDefault();// [cite: 8]
          e.stopPropagation();// [cite: 8]
          confirmUserLogout();// [cite: 8]
          return;// [cite: 8]
        }

        // Allow default link navigation for 'My Profile' and 'Account Settings'// [cite: 8]
        const linkItem = e.target.closest('a');// [cite: 8]
        if (linkItem) {// [cite: 8]
          return;// [cite: 8]
        }

        // Toggle dropdown menu visibility if clicking avatar trigger// [cite: 8]
        const dropdownMenu = navSlot.querySelector('.nav-user-dropdown, .user-menu-dropdown, .dropdown-card');// [cite: 8]
        if (dropdownMenu && e.target.closest('.nav-user-avatar, .user-avatar, img')) {// [cite: 8]
          dropdownMenu.classList.toggle('active');// [cite: 8]
          dropdownMenu.classList.toggle('show');// [cite: 8]
        }
        return;// [cite: 8]
      }

      // 2. GUEST USER: Open Guest Session SweetAlert Modal// [cite: 8]
      e.preventDefault();// [cite: 8]
      e.stopPropagation();// [cite: 8]
      window.handleAvatarClick(e);// [cite: 8]
    });
  }
});

// Dedicated Logout Confirmation Modal for Registered Users// [cite: 8]
function confirmUserLogout() {// [cite: 8]
  showSweetAlert({// [cite: 8]
    title: 'Confirm Log Out',// [cite: 8]
    html: `
      <div class="mm-swal-thumb-box" style="background: #FFF0EE;">
        <i class="fa-solid fa-right-from-bracket" style="font-size: 38px; color: #F48A8E;"></i>
      </div>
      <div class="mm-swal-item-name">Logging Out?</div>
      <p class="mm-swal-item-sub">Are you sure you want to log out of your account?</p>
    `,// [cite: 8]
    showCancelButton: true,// [cite: 8]
    confirmButtonText: 'Yes, Log Out',// [cite: 8]
    cancelButtonText: 'Cancel',// [cite: 8]
    reverseButtons: true// [cite: 8]
  }).then((logoutConfirm) => {// [cite: 8]
    if (logoutConfirm.isConfirmed) {// [cite: 8]
      localStorage.removeItem('mm_user');// [cite: 8]
      sessionStorage.removeItem('mm_welcomed');// [cite: 8]
      window.location.href = 'login.html';// [cite: 8]
    }
  });
}

// Handler for Guest Session / Avatar Click// [cite: 8]
window.handleAvatarClick = function (e) {// [cite: 8]
  if (e) e.preventDefault();// [cite: 8]

  const localUser = JSON.parse(localStorage.getItem('mm_user') || '{}');// [cite: 8]

  // If registered user clicks avatar, toggle dropdown menu// [cite: 8]
  if (localUser.customer_id) {// [cite: 8]
    const dropdown = document.querySelector('.nav-user-dropdown, .user-menu-dropdown, .dropdown-card');// [cite: 8]
    if (dropdown) {// [cite: 8]
      dropdown.classList.toggle('active');// [cite: 8]
      dropdown.classList.toggle('show');// [cite: 8]
    } else {// [cite: 8]
      window.location.href = 'profile.html';// [cite: 8]
    }
    return;// [cite: 8]
  }

  // Guest User Modal// [cite: 8]
  showSweetAlert({// [cite: 8]
    title: 'Guest Session',// [cite: 8]
    html: `
      <div class="mm-swal-thumb-box">
        <i class="fa-solid fa-user-gear" style="font-size: 38px; color: #F48A8E;"></i>
      </div>
      <div class="mm-swal-item-name">Browsing as Guest</div>
      <p class="mm-swal-item-sub">You are currently browsing as a guest. Would you like to create an account or exit your guest session?</p>
    `,// [cite: 8]
    showCancelButton: true,// [cite: 8]
    confirmButtonText: 'Sign Up',// [cite: 8]
    cancelButtonText: 'Exit Guest',// [cite: 8]
    reverseButtons: true// [cite: 8]
  }).then((result) => {// [cite: 8]
    if (result.isConfirmed) {// [cite: 8]
      window.location.href = 'signup.html';// [cite: 8]
    } else if (result.dismiss === Swal.DismissReason.cancel) {// [cite: 8]
      showSweetAlert({// [cite: 8]
        title: 'Confirm Exit',// [cite: 8]
        html: `
          <div class="mm-swal-thumb-box" style="background: #FFF0EE;">
            <i class="fa-solid fa-arrow-right-from-bracket" style="font-size: 38px; color: #F48A8E;"></i>
          </div>
          <div class="mm-swal-item-name">Exit Guest Session?</div>
          <p class="mm-swal-item-sub">Are you sure you want to exit? Exiting will clear your guest session and current cart.</p>
        `,// [cite: 8]
        showCancelButton: true,// [cite: 8]
        confirmButtonText: 'Yes, Exit',// [cite: 8]
        cancelButtonText: 'Stay as Guest',// [cite: 8]
        reverseButtons: true// [cite: 8]
      }).then((exitConfirm) => {// [cite: 8]
        if (exitConfirm.isConfirmed) {// [cite: 8]
          // Wipe all guest session & local cart data
          localStorage.removeItem('mm_guest_session_id');// [cite: 8]
          localStorage.removeItem('mm_guest_recipient');// [cite: 8]
          localStorage.removeItem('mm_cart');
          window.location.href = 'index.html';// [cite: 8]
        }
      });
    }
  });
};