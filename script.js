import { supabase } from './supabase.js'

// ──────────────── App State ────────────────
const PRODUCTS = []
let cart        = {}
let wishlist    = new Set()
let currentCategory = 'all'
let currentSearch   = ''
let currentSort     = 'default'
let discountApplied = false
const DELIVERY_FEE        = 30
const FREE_DELIVERY_ABOVE = 299
const COUPON              = 'FRESH20'
const DISCOUNT_PCT        = 20

// ──────────────── Init ────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await loadProductsFromDB()
  document.getElementById('searchInput').addEventListener('input', (e) => {
    currentSearch = e.target.value.trim().toLowerCase()
    renderProducts()
  })
  document.getElementById('searchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch()
  })
})

// ──────────────── Load from Supabase ────────────────
async function loadProductsFromDB() {
  const grid = document.getElementById('productGrid')
  grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--ink-soft)">
    <div style="font-size:2rem">⏳</div><p>Loading products...</p>
  </div>`

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('in_stock', true)
    .order('category')

  if (error) {
    console.error('Supabase error:', error)
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:red">
      Failed to load products. Please refresh.
    </div>`
    return
  }

  PRODUCTS.length = 0
  data.forEach(p => PRODUCTS.push(p))
  renderProducts()
}

// ──────────────── Render Products ────────────────
function renderProducts() {
  const grid  = document.getElementById('productGrid')
  const empty = document.getElementById('emptyState')
  const title = document.getElementById('sectionTitle')

  let filtered = PRODUCTS.filter(p => {
    const matchCat    = currentCategory === 'all' || p.category === currentCategory
    const matchSearch = p.name.toLowerCase().includes(currentSearch) ||
                        p.category.toLowerCase().includes(currentSearch)
    return matchCat && matchSearch
  })

  if (currentSort === 'price-asc')  filtered.sort((a, b) => a.price - b.price)
  if (currentSort === 'price-desc') filtered.sort((a, b) => b.price - a.price)
  if (currentSort === 'name')       filtered.sort((a, b) => a.name.localeCompare(b.name))

  const catLabel = currentCategory === 'all' ? 'All Products' :
    currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)
  title.textContent = currentSearch ? `Results for "${currentSearch}"` : catLabel

  grid.innerHTML = ''
  if (filtered.length === 0) {
    empty.style.display = 'block'
    return
  }
  empty.style.display = 'none'

  filtered.forEach((p, i) => {
    const card = createProductCard(p, i)
    grid.appendChild(card)
  })
}

function createProductCard(p, index) {
  const card = document.createElement('div')
  card.className = 'product-card'
  card.style.animationDelay = `${index * 0.04}s`

  const inCart = cart[p.id] || 0
  const liked  = wishlist.has(p.id)

  card.innerHTML = `
    ${p.badge ? `<div class="card-badge ${p.badge}">${p.badge === 'hot' ? '🔥 Hot' : '🏷️ Sale'}</div>` : ''}
    <div class="card-img-wrap">
      <span>${p.emoji}</span>
      <button class="wishlist-btn ${liked ? 'active' : ''}"
              onclick="toggleWishlist(${p.id}, this)">
        <i class="fa${liked ? 's' : 'r'} fa-heart"></i>
      </button>
    </div>
    <div class="card-body">
      <div class="card-category">${p.category}</div>
      <div class="card-name">${p.name}</div>
      <div class="card-weight">${p.weight}</div>
      <div class="card-price-row">
        <span class="card-price">₹${p.price}</span>
        <span class="card-mrp">₹${p.mrp}</span>
        <span class="card-discount">${p.discount}% off</span>
      </div>
    </div>
    <div class="card-footer" id="card-footer-${p.id}">
      ${inCart === 0
        ? `<button class="add-btn" onclick="addToCart(${p.id})">
             <i class="fa fa-plus"></i> Add to Cart
           </button>`
        : `<div class="qty-stepper">
             <button onclick="changeQty(${p.id}, -1)">−</button>
             <span class="qty-num">${inCart}</span>
             <button onclick="changeQty(${p.id}, 1)">+</button>
           </div>`
      }
    </div>
  `
  return card
}

// ──────────────── Cart Logic ────────────────
function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1
  updateCardFooter(id)
  updateCartUI()
  const p = PRODUCTS.find(p => p.id === id)
  showToast(`${p.emoji} ${p.name} added to cart!`)
}

function changeQty(id, delta) {
  cart[id] = (cart[id] || 0) + delta
  if (cart[id] <= 0) delete cart[id]
  updateCardFooter(id)
  updateCartUI()
}

function updateCardFooter(id) {
  const footer = document.getElementById(`card-footer-${id}`)
  if (!footer) return
  const qty = cart[id] || 0
  if (qty === 0) {
    footer.innerHTML = `<button class="add-btn" onclick="addToCart(${id})">
      <i class="fa fa-plus"></i> Add to Cart
    </button>`
  } else {
    footer.innerHTML = `<div class="qty-stepper">
      <button onclick="changeQty(${id}, -1)">−</button>
      <span class="qty-num">${qty}</span>
      <button onclick="changeQty(${id}, 1)">+</button>
    </div>`
  }
}

function updateCartUI() {
  const ids        = Object.keys(cart).map(Number)
  const totalItems = ids.reduce((s, id) => s + cart[id], 0)
  document.getElementById('cartCount').textContent = totalItems

  const cartItemsEl  = document.getElementById('cartItems')
  const cartEmptyEl  = document.getElementById('cartEmpty')
  const cartFooterEl = document.getElementById('cartFooter')

  if (ids.length === 0) {
    cartItemsEl.innerHTML = ''
    cartItemsEl.appendChild(cartEmptyEl)
    cartEmptyEl.style.display  = 'flex'
    cartFooterEl.style.display = 'none'
    return
  }

  cartEmptyEl.style.display  = 'none'
  cartFooterEl.style.display = 'flex'
  cartItemsEl.innerHTML = ''

  ids.forEach(id => {
    const p   = PRODUCTS.find(p => p.id === id)
    const qty = cart[id]
    const el  = document.createElement('div')
    el.className = 'cart-item'
    el.innerHTML = `
      <span class="ci-emoji">${p.emoji}</span>
      <div class="ci-info">
        <div class="ci-name">${p.name}</div>
        <div class="ci-price">₹${p.price} × ${qty} = ₹${p.price * qty}</div>
      </div>
      <div class="ci-stepper">
        <button onclick="changeQty(${id}, -1)">−</button>
        <span>${qty}</span>
        <button onclick="changeQty(${id}, 1)">+</button>
      </div>
      <button class="ci-remove" onclick="removeFromCart(${id})">
        <i class="fa fa-trash"></i>
      </button>
    `
    cartItemsEl.appendChild(el)
  })

  const subtotal = ids.reduce((s, id) => s + PRODUCTS.find(p => p.id === id).price * cart[id], 0)
  const delivery = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE
  const discount = discountApplied ? Math.round(subtotal * DISCOUNT_PCT / 100) : 0
  const total    = subtotal - discount + delivery

  document.getElementById('subtotal').textContent    = `₹${subtotal}`
  document.getElementById('deliveryFee').textContent = delivery === 0 ? 'FREE' : `₹${delivery}`
  document.getElementById('discountAmt').textContent = `-₹${discount}`
  document.getElementById('total').textContent       = `₹${total}`
  document.getElementById('discountRow').style.display = discountApplied ? 'flex' : 'none'
}

function removeFromCart(id) {
  delete cart[id]
  updateCardFooter(id)
  updateCartUI()
}

function clearCart() {
  const ids = Object.keys(cart).map(Number)
  ids.forEach(id => { delete cart[id]; updateCardFooter(id) })
  cart = {}
  discountApplied = false
  document.getElementById('couponInput').value   = ''
  document.getElementById('couponMsg').textContent = ''
  updateCartUI()
}

// ──────────────── Cart Drawer ────────────────
function toggleCart() {
  document.getElementById('cartDrawer').classList.toggle('open')
  document.getElementById('cartOverlay').classList.toggle('open')
}

// ──────────────── Coupon ────────────────
function applyCoupon() {
  const code = document.getElementById('couponInput').value.trim().toUpperCase()
  const msg  = document.getElementById('couponMsg')
  if (discountApplied) {
    msg.className   = 'coupon-msg error'
    msg.textContent = 'Coupon already applied.'
    return
  }
  if (code === COUPON) {
    discountApplied = true
    msg.className   = 'coupon-msg success'
    msg.textContent = `✅ ${DISCOUNT_PCT}% discount applied!`
    updateCartUI()
  } else {
    msg.className   = 'coupon-msg error'
    msg.textContent = '❌ Invalid coupon code.'
  }
}

// ──────────────── Checkout ────────────────
function checkout() {
  if (Object.keys(cart).length === 0) {
    showToast('Your cart is empty!')
    return
  }
  const orderId = 'FM' + Date.now().toString().slice(-8).toUpperCase()
  document.getElementById('orderId').textContent = `Order ID: ${orderId}`
  document.getElementById('orderModal').style.display = 'flex'
  clearCart()
  toggleCart()
}

function closeModal() {
  document.getElementById('orderModal').style.display = 'none'
}

// ──────────────── Search & Filter ────────────────
function handleSearch() {
  currentSearch = document.getElementById('searchInput').value.trim().toLowerCase()
  renderProducts()
}

function filterCategory(cat, btn) {
  currentCategory = cat
  document.querySelectorAll('.cat-pill').forEach(el => el.classList.remove('active'))
  if (btn) btn.classList.add('active')
  renderProducts()
}

function sortProducts() {
  currentSort = document.getElementById('sortSelect').value
  renderProducts()
}

// ──────────────── Wishlist ────────────────
function toggleWishlist(id, btn) {
  if (wishlist.has(id)) {
    wishlist.delete(id)
    btn.classList.remove('active')
    btn.innerHTML = '<i class="far fa-heart"></i>'
    showToast('Removed from wishlist')
  } else {
    wishlist.add(id)
    btn.classList.add('active')
    btn.innerHTML = '<i class="fas fa-heart"></i>'
    const p = PRODUCTS.find(p => p.id === id)
    showToast(`${p.emoji} Added to wishlist!`)
  }
}

// ──────────────── Toast ────────────────
let toastTimer
function showToast(msg) {
  const t = document.getElementById('toast')
  t.textContent = msg
  t.classList.add('show')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800)
}

// ──────────────── Modal close on overlay ────────────────
document.getElementById('orderModal')?.addEventListener('click', function(e) {
  if (e.target === this) closeModal()
})
// ──────────────── Expose functions to global scope ────────────────
window.filterCategory  = filterCategory
window.handleSearch    = handleSearch
window.sortProducts    = sortProducts
window.addToCart       = addToCart
window.changeQty       = changeQty
window.removeFromCart  = removeFromCart
window.clearCart       = clearCart
window.toggleCart      = toggleCart
window.applyCoupon     = applyCoupon
window.checkout        = checkout
window.closeModal      = closeModal
window.toggleWishlist  = toggleWishlist

// ──────────────── Auth State ────────────────
let currentUser = null

supabase.auth.getSession().then(({ data: { session } }) => {
  if (session) setLoggedIn(session.user)
})

supabase.auth.onAuthStateChange((_event, session) => {
  if (session) setLoggedIn(session.user)
  else setLoggedOut()
})

function setLoggedIn(user) {
  currentUser = user
  const phone = user.phone ? user.phone.replace('+91', '') : 'User'
  document.getElementById('loginBtnText').textContent = '👤 Hi!'
  document.getElementById('loggedInMsg').textContent  = `Logged in as +91 ${phone}`
  document.getElementById('authStepPhone').style.display = 'none'
  document.getElementById('authStepOTP').style.display   = 'none'
  document.getElementById('authStepDone').style.display  = 'block'
}

function setLoggedOut() {
  currentUser = null
  document.getElementById('loginBtnText').textContent    = 'Login'
  document.getElementById('authStepPhone').style.display = 'block'
  document.getElementById('authStepOTP').style.display   = 'none'
  document.getElementById('authStepDone').style.display  = 'none'
}

function openAuthModal() {
  document.getElementById('authModal').classList.add('open')
  document.getElementById('authOverlay').classList.add('open')
}

function closeAuthModal() {
  document.getElementById('authModal').classList.remove('open')
  document.getElementById('authOverlay').classList.remove('open')
}

function backToPhone() {
  document.getElementById('authStepOTP').style.display   = 'none'
  document.getElementById('authStepPhone').style.display = 'block'
}

async function sendOTP() {
  const phone = '+91' + document.getElementById('phoneInput').value.trim()
  if (phone.length < 13) {
    showToast('Please enter a valid 10-digit number')
    return
  }
  const btn = document.getElementById('sendOtpBtn')
  btn.textContent = 'Sending...'
  btn.disabled    = true

  const { error } = await supabase.auth.signInWithOtp({ phone })

  btn.textContent = 'Send OTP →'
  btn.disabled    = false

  if (error) {
    showToast('Error: ' + error.message)
    return
  }

  document.getElementById('otpSentMsg').textContent =
    `OTP sent to ${phone}`
  document.getElementById('authStepPhone').style.display = 'none'
  document.getElementById('authStepOTP').style.display   = 'block'
  showToast('OTP sent! Check your phone 📱')
}

async function verifyOTP() {
  const phone = '+91' + document.getElementById('phoneInput').value.trim()
  const token = document.getElementById('otpInput').value.trim()

  if (token.length !== 6) {
    showToast('Please enter the 6-digit OTP')
    return
  }

  const btn = document.getElementById('verifyOtpBtn')
  btn.textContent = 'Verifying...'
  btn.disabled    = true

  const { error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms'
  })

  btn.textContent = 'Verify & Login →'
  btn.disabled    = false

  if (error) {
    showToast('Wrong OTP, please try again ❌')
    return
  }

  closeAuthModal()
  showToast('🎉 Login successful! Welcome to FreshMart')
}

async function signOut() {
  await supabase.auth.signOut()
  closeAuthModal()
  showToast('Logged out. See you soon! 👋')
}

// ──────────────── Add new functions to window scope ────────────────
window.openAuthModal  = openAuthModal
window.closeAuthModal = closeAuthModal
window.sendOTP        = sendOTP
window.verifyOTP      = verifyOTP
window.signOut        = signOut
window.backToPhone    = backToPhone
