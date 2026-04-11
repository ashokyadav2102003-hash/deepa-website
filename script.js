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
  ${p.image_url
    ? `<img src="${p.image_url}" alt="${p.name}"
            style="width:100%;height:100%;object-fit:cover;border-radius:0"/>`
    : `<span>${p.emoji}</span>`
  }
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
  saveCartToDB()
}

function changeQty(id, delta) {
  cart[id] = (cart[id] || 0) + delta
  if (cart[id] <= 0) delete cart[id]
  updateCardFooter(id)
  updateCartUI()
  saveCartToDB()
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

  const cartCountEl  = document.getElementById('cartCount')
  const cartItemsEl  = document.getElementById('cartItems')
  const cartEmptyEl  = document.getElementById('cartEmpty')
  const cartFooterEl = document.getElementById('cartFooter')

  if (!cartItemsEl || !cartFooterEl || !cartEmptyEl) return
  if (cartCountEl) cartCountEl.textContent = totalItems

  if (ids.length === 0) {
    cartItemsEl.innerHTML = ''
    cartItemsEl.appendChild(cartEmptyEl)
    cartEmptyEl.style.display  = 'flex'
    cartFooterEl.style.display = 'none'
    return
  }

  cartEmptyEl.style.display  = 'none'
  cartFooterEl.style.display = 'flex'

  // Remove old cart items but keep cartEmpty element safe
  Array.from(cartItemsEl.children).forEach(child => {
    if (child.id !== 'cartEmpty') cartItemsEl.removeChild(child)
  })

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
// ──────────────── Supabase Cart Persistence ────────────────
async function saveCartToDB() {
  if (!currentUser) return
  const ids = Object.keys(cart).map(Number)

  // Delete existing cart first
  await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', currentUser.id)

  if (ids.length === 0) return

  // Insert all current cart items
  const rows = ids.map(id => ({
    user_id:    currentUser.id,
    product_id: id,
    quantity:   cart[id]
  }))

  await supabase.from('cart_items').insert(rows)
}

async function loadCartFromDB() {
  if (!currentUser) return

  const { data, error } = await supabase
    .from('cart_items')
    .select('product_id, quantity')
    .eq('user_id', currentUser.id)

  if (error || !data) return

  // Restore cart state
  data.forEach(item => {
    cart[item.product_id] = item.quantity
  })

  updateCartUI()
  // Update all card footers
  Object.keys(cart).map(Number).forEach(id => updateCardFooter(id))
  showToast(`🛒 Cart restored (${data.length} items)`)
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
// ──────────────── Checkout ────────────────
async function checkout() {
  if (Object.keys(cart).length === 0) {
    showToast('Your cart is empty!')
    return
  }
  if (!currentUser) {
    showToast('Please login to place an order 👤')
    openAuthModal()
    return
  }
  if (userInRange === false) {
    showToast('❌ Sorry! We do not deliver to your area.')
    openLocationModal()
    return
  }

  const ids      = Object.keys(cart).map(Number)
  const subtotal = ids.reduce((s, id) =>
    s + PRODUCTS.find(p => p.id === id).price * cart[id], 0)
  const delivery = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE
  const discount = discountApplied
    ? Math.round(subtotal * DISCOUNT_PCT / 100) : 0
  const total    = subtotal - discount + delivery

  // Build items snapshot
  const items = ids.map(id => {
    const p = PRODUCTS.find(p => p.id === id)
    return {
      id:       p.id,
      name:     p.name,
      emoji:    p.emoji,
      price:    p.price,
      quantity: cart[id]
    }
  })

  // Save order to Supabase
  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id:  currentUser.id,
      items:    items,
      subtotal: subtotal,
      discount: discount,
      delivery: delivery,
      total:    total,
      status:   'placed'
    })
    .select()
    .single()

  if (error) {
    console.error('Order error:', error)
    showToast('Failed to place order. Try again.')
    return
  }

  // Clear Supabase cart
  await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', currentUser.id)

  const orderId = 'FM' + String(data.id).padStart(6, '0')
  document.getElementById('orderId').textContent = `Order ID: ${orderId}`
  document.getElementById('orderModal').style.display = 'flex'
  clearCart()
  toggleCart()
  showToast('🎉 Order placed successfully!')
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
  const email = user.email || 'User'
  document.getElementById('loginBtnText').textContent    = '👤 Hi!'
  document.getElementById('loggedInMsg').textContent     = `Logged in as ${email}`
  document.getElementById('authStepPhone').style.display = 'none'
  document.getElementById('authStepOTP').style.display   = 'none'
  document.getElementById('authStepDone').style.display  = 'block'
  document.getElementById('ordersBtn').style.display     = 'flex'
  loadCartFromDB()
}

function setLoggedOut() {
  currentUser = null
  document.getElementById('loginBtnText').textContent    = 'Login'
  document.getElementById('authStepPhone').style.display = 'block'
  document.getElementById('authStepOTP').style.display   = 'none'
  document.getElementById('authStepDone').style.display  = 'none'
  document.getElementById('ordersBtn').style.display     = 'none'
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
  const email = document.getElementById('emailInput').value.trim()
  if (!email || !email.includes('@')) {
    showToast('Please enter a valid email address')
    return
  }
  const btn = document.getElementById('sendOtpBtn')
  btn.textContent = 'Sending...'
  btn.disabled    = true
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true }
  })
  btn.textContent = 'Send OTP →'
  btn.disabled    = false
  if (error) { showToast('Error: ' + error.message); return }
  document.getElementById('otpSentMsg').textContent      = `OTP sent to ${email}`
  document.getElementById('authStepPhone').style.display = 'none'
  document.getElementById('authStepOTP').style.display   = 'block'
  showToast('OTP sent! Check your email 📧')
}

async function verifyOTP() {
  const email = document.getElementById('emailInput').value.trim()
  const token = document.getElementById('otpInput').value.trim()
  if (token.length !== 6) { showToast('Please enter the 6-digit OTP'); return }
  const btn = document.getElementById('verifyOtpBtn')
  btn.textContent = 'Verifying...'
  btn.disabled    = true
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  })
  btn.textContent = 'Verify & Login →'
  btn.disabled    = false
  if (error) { showToast('Wrong OTP, please try again ❌'); return }
  closeAuthModal()
  showToast('🎉 Login successful! Welcome!')
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

// ──────────────── Order History ────────────────
function openOrderHistory() {
  document.getElementById('ordersDrawer').classList.add('open')
  document.getElementById('ordersOverlay').classList.add('open')
  loadOrderHistory()
}

function closeOrderHistory() {
  document.getElementById('ordersDrawer').classList.remove('open')
  document.getElementById('ordersOverlay').classList.remove('open')
}

async function loadOrderHistory() {
  const list = document.getElementById('ordersList')
  list.innerHTML = `<div class="orders-loading">⏳ Loading orders...</div>`

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false })

  if (error || !data || data.length === 0) {
    list.innerHTML = `
      <div class="cart-empty">
        <div style="font-size:3rem">📦</div>
        <p>No orders yet</p>
        <small>Your order history will appear here</small>
      </div>`
    return
  }

  list.innerHTML = ''
  data.forEach(order => {
    const date  = new Date(order.created_at).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
    const orderId    = 'FM' + String(order.id).padStart(6, '0')
    const itemsText  = order.items.map(i =>
      `${i.emoji} ${i.name} × ${i.quantity}`).join(', ')

    const card = document.createElement('div')
    card.className = 'order-card'
    card.innerHTML = `
      <div class="order-card-header">
        <span class="order-id-text">${orderId}</span>
        <span class="order-status">${order.status}</span>
      </div>
      <div class="order-date">🕐 ${date}</div>
      <div class="order-items-preview">${itemsText}</div>
      <div class="order-total-row">
        <span>Total Paid</span>
        <span>₹${order.total}</span>
      </div>
    `
    list.appendChild(card)
  })
}
// ──────────────── Delivery Location ────────────────
const SHOP_LAT  = 27.534315
const SHOP_LNG  = 76.071914
const MAX_KM    = 5
let   userInRange = null

// Show location modal on page load after 2 seconds
setTimeout(() => {
  if (!sessionStorage.getItem('locationChecked')) {
    openLocationModal()
  }
}, 2000)

function openLocationModal() {
  document.getElementById('locationModal').style.display = 'flex'
  document.getElementById('locationOverlay').classList.add('open')
}

function closeLocationModal() {
  document.getElementById('locationModal').style.display = 'none'
  document.getElementById('locationOverlay').classList.remove('open')
}

function skipLocation() {
  sessionStorage.setItem('locationChecked', 'true')
  closeLocationModal()
}

function closeBanner() {
  document.getElementById('deliveryBanner').style.display = 'none'
}

// ── GPS Detection ──
function detectGPS() {
  const btn    = document.getElementById('gpsBtn')
  const result = document.getElementById('locationResult')
  result.style.display  = 'block'
  result.className      = 'location-result loading'
  result.textContent    = '📡 Detecting your location...'
  btn.disabled          = true
  btn.textContent       = 'Detecting...'

  if (!navigator.geolocation) {
    result.className   = 'location-result error'
    result.textContent = '❌ GPS not supported. Please enter address manually.'
    btn.disabled       = false
    btn.innerHTML      = '<i class="fa fa-location-crosshairs"></i> Use My Current Location'
    return
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const dist = getDistanceKm(
        pos.coords.latitude,
        pos.coords.longitude,
        SHOP_LAT,
        SHOP_LNG
      )
      btn.disabled  = false
      btn.innerHTML = '<i class="fa fa-location-crosshairs"></i> Use My Current Location'
      handleDistanceResult(dist, result)
    },
    (err) => {
      result.className   = 'location-result error'
      result.textContent = '❌ Could not get GPS. Please enter your area below.'
      btn.disabled       = false
      btn.innerHTML      = '<i class="fa fa-location-crosshairs"></i> Use My Current Location'
    },
    { timeout: 10000 }
  )
}

// ── Manual Address Check ──
async function checkManualAddress() {
  const address = document.getElementById('manualAddress').value.trim()
  const result  = document.getElementById('locationResult')

  if (!address) {
    showToast('Please enter your area name')
    return
  }

  result.style.display = 'block'
  result.className     = 'location-result loading'
  result.textContent   = '🔍 Searching your location...'

  try {
    const query    = encodeURIComponent(address + ', Rajasthan, India')
    const url      = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`
    const response = await fetch(url)
    const data     = await response.json()

    if (!data || data.length === 0) {
      result.className   = 'location-result error'
      result.textContent = '❌ Area not found. Try a nearby village or city name.'
      return
    }

    const dist = getDistanceKm(
      parseFloat(data[0].lat),
      parseFloat(data[0].lon),
      SHOP_LAT,
      SHOP_LNG
    )
    handleDistanceResult(dist, result)

  } catch (e) {
    result.className   = 'location-result error'
    result.textContent = '❌ Could not check location. Please try again.'
  }
}

// ── Distance Result Handler ──
function handleDistanceResult(dist, resultEl) {
  sessionStorage.setItem('locationChecked', 'true')
  const banner = document.getElementById('deliveryBanner')
  const msg    = document.getElementById('deliveryBannerMsg')
  const km     = dist.toFixed(1)

  if (dist <= MAX_KM) {
    userInRange            = true
    resultEl.className     = 'location-result success'
    resultEl.textContent   = `✅ Great! We deliver to your area (${km} km away)`
    banner.style.display   = 'block'
    banner.classList.remove('outside')
    msg.textContent        = `✅ We deliver to your area — ${km} km from our shop`
    setTimeout(closeLocationModal, 2000)
  } else {
    userInRange            = false
    resultEl.className     = 'location-result error'
    resultEl.textContent   = `❌ Sorry! You are ${km} km away. We deliver within ${MAX_KM} km only.`
    banner.style.display   = 'block'
    banner.classList.add('outside')
    msg.textContent        = `❌ Outside delivery area — ${km} km from our shop (max ${MAX_KM} km)`
  }
}

// ── Haversine Distance Formula ──
function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R    = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a    = Math.sin(dLat/2) * Math.sin(dLat/2) +
               Math.cos(lat1 * Math.PI / 180) *
               Math.cos(lat2 * Math.PI / 180) *
               Math.sin(dLng/2) * Math.sin(dLng/2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}
// ──────────────── Expose new functions to window ────────────────
window.openOrderHistory  = openOrderHistory
window.closeOrderHistory = closeOrderHistory
window.detectGPS          = detectGPS
window.checkManualAddress = checkManualAddress
window.skipLocation       = skipLocation
window.closeBanner        = closeBanner
