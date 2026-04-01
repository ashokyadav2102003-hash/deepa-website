/* ═══════════════════════════════════════════════
   FRESHMART – script.js
   All logic: products data, cart, search,
   filter, sort, coupon, wishlist, checkout
═══════════════════════════════════════════════ */

// ──────────────── Product Data ────────────────
const PRODUCTS = [
  // kitchen
  { id: 1,  name: "aata",        category: "kitchen",     emoji: "🌾", price: 125, mrp: 180, weight: "5 kg",  badge: "hot",  discount: 17 },
  { id: 2,  name: "rice",        category: "kitchen",     emoji: "🍚", price: 49,  mrp: 60,  weight: "500 g", badge: "",     discount: 18 },
  { id: 3,  name: "sugar",       category: "kitchen",     emoji: "🍚 ", price: 45, mrp: 240, weight: "1 kg",  badge: "hot",  discount: 17 },
  { id: 4,  name: "ghee",        category: "kitchen",     emoji: "🧈", price: 250, mrp: 160, weight: "500 g", badge: "",     discount: 19 },
  { id: 5,  name: "chill",              category: "kitchen",     emoji: "🌶️", price: 89,  mrp: 110, weight: "300 gm",  badge: "",     discount: 19 },
  { id: 6,  name: "salt",          category: "kitchen",     emoji: "🧂", price: 30,  mrp: 99,  weight: "1 kg",  badge: "sale", discount: 20 },

  // Vegetables
  { id: 7,  name: "Fresh Tomatoes",      category: "vegetables", emoji: "🍅", price: 39,  mrp: 55,  weight: "500 g", badge: "",     discount: 29 },
  { id: 8,  name: "Broccoli",            category: "vegetables", emoji: "🥦", price: 69,  mrp: 90,  weight: "500 g", badge: "hot",  discount: 23 },
  { id: 9,  name: "Carrots",             category: "vegetables", emoji: "🥕", price: 35,  mrp: 45,  weight: "500 g", badge: "",     discount: 22 },
  { id: 10, name: "Onions",              category: "vegetables", emoji: "🧅", price: 29,  mrp: 40,  weight: "1 kg",  badge: "",     discount: 27 },
  { id: 11, name: "Bell Peppers",        category: "vegetables", emoji: "🫑", price: 89,  mrp: 110, weight: "250 g", badge: "",     discount: 19 },
  { id: 12, name: "Spinach",             category: "vegetables", emoji: "🥬", price: 25,  mrp: 35,  weight: "250 g", badge: "",     discount: 28 },
  { id: 13, name: "Potatoes",            category: "vegetables", emoji: "🥔", price: 35,  mrp: 45,  weight: "1 kg",  badge: "",     discount: 22 },
  { id: 14, name: "Ginger",              category: "vegetables", emoji: "🫚", price: 45,  mrp: 60,  weight: "200 g", badge: "",     discount: 25 },

  // Dairy
  { id: 15, name: "Full Cream Milk",     category: "dairy",      emoji: "🥛", price: 68,  mrp: 72,  weight: "1 L",   badge: "",     discount: 5  },
  { id: 16, name: "Paneer",              category: "dairy",      emoji: "🧀", price: 89,  mrp: 100, weight: "200 g", badge: "hot",  discount: 11 },
  { id: 17, name: "Curd (Dahi)",         category: "dairy",      emoji: "🍶", price: 45,  mrp: 52,  weight: "400 g", badge: "",     discount: 13 },
  { id: 18, name: "Butter",              category: "dairy",      emoji: "🧈", price: 55,  mrp: 60,  weight: "100 g", badge: "",     discount: 8  },
  { id: 19, name: "Eggs (Farm Fresh)",   category: "dairy",      emoji: "🥚", price: 89,  mrp: 100, weight: "12 pcs",badge: "",     discount: 11 },

  // Grains
  { id: 20, name: "Basmati Rice",        category: "grains",     emoji: "🌾", price: 199, mrp: 240, weight: "2 kg",  badge: "hot",  discount: 17 },
  { id: 21, name: "Whole Wheat Atta",    category: "grains",     emoji: "🌿", price: 149, mrp: 180, weight: "5 kg",  badge: "",     discount: 17 },
  { id: 22, name: "Toor Dal",            category: "grains",     emoji: "🫘", price: 129, mrp: 155, weight: "1 kg",  badge: "",     discount: 16 },
  { id: 23, name: "Moong Dal",           category: "grains",     emoji: "🟡", price: 119, mrp: 145, weight: "1 kg",  badge: "",     discount: 17 },
  { id: 24, name: "Chana Dal",           category: "grains",     emoji: "🟤", price: 109, mrp: 130, weight: "1 kg",  badge: "sale", discount: 16 },

  // Snacks
  { id: 25, name: "Aloo Bhujia",         category: "snacks",     emoji: "🍿", price: 49,  mrp: 60,  weight: "200 g", badge: "",     discount: 18 },
  { id: 26, name: "Khakhra (Masala)",    category: "snacks",     emoji: "🫓", price: 69,  mrp: 80,  weight: "180 g", badge: "",     discount: 13 },
  { id: 27, name: "Mixed Namkeen",       category: "snacks",     emoji: "🥜", price: 89,  mrp: 110, weight: "250 g", badge: "hot",  discount: 19 },
  { id: 28, name: "Dark Chocolate",      category: "snacks",     emoji: "🍫", price: 99,  mrp: 120, weight: "100 g", badge: "",     discount: 17 },

  // Beverages
  { id: 29, name: "Mango Juice",         category: "beverages",  emoji: "🧃", price: 89,  mrp: 110, weight: "1 L",   badge: "",     discount: 19 },
  { id: 30, name: "Green Tea",           category: "beverages",  emoji: "🍵", price: 149, mrp: 175, weight: "100 g", badge: "hot",  discount: 14 },
  { id: 31, name: "Coconut Water",       category: "beverages",  emoji: "🥥", price: 59,  mrp: 75,  weight: "500 ml",badge: "",     discount: 21 },
  { id: 32, name: "Cold Coffee",         category: "beverages",  emoji: "☕", price: 129, mrp: 150, weight: "200 ml",badge: "",     discount: 14 },
];

// ──────────────── App State ────────────────
let cart        = {};        // { id: qty }
let wishlist    = new Set();
let currentCategory = "all";
let currentSearch   = "";
let currentSort     = "default";
let discountApplied = false;
const DELIVERY_FEE  = 30;
const FREE_DELIVERY_ABOVE = 299;
const COUPON        = "FRESH20";
const DISCOUNT_PCT  = 20;

// ──────────────── Init ────────────────
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  document.getElementById("searchInput").addEventListener("input", (e) => {
    currentSearch = e.target.value.trim().toLowerCase();
    renderProducts();
  });
  document.getElementById("searchInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSearch();
  });
});

// ──────────────── Render Products ────────────────
function renderProducts() {
  const grid = document.getElementById("productGrid");
  const empty = document.getElementById("emptyState");
  const title = document.getElementById("sectionTitle");

  let filtered = PRODUCTS.filter(p => {
    const matchCat    = currentCategory === "all" || p.category === currentCategory;
    const matchSearch = p.name.toLowerCase().includes(currentSearch) ||
                        p.category.toLowerCase().includes(currentSearch);
    return matchCat && matchSearch;
  });

  // Sort
  if (currentSort === "price-asc")  filtered.sort((a, b) => a.price - b.price);
  if (currentSort === "price-desc") filtered.sort((a, b) => b.price - a.price);
  if (currentSort === "name")       filtered.sort((a, b) => a.name.localeCompare(b.name));

  // Title
  const catLabel = currentCategory === "all" ? "All Products" :
    currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
  title.textContent = currentSearch
    ? `Results for "${currentSearch}"`
    : catLabel;

  grid.innerHTML = "";
  if (filtered.length === 0) {
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  filtered.forEach((p, i) => {
    const card = createProductCard(p, i);
    grid.appendChild(card);
  });
}

function createProductCard(p, index) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.style.animationDelay = `${index * 0.04}s`;

  const inCart = cart[p.id] || 0;
  const liked  = wishlist.has(p.id);

  card.innerHTML = `
    ${p.badge ? `<div class="card-badge ${p.badge}">${p.badge === "hot" ? "🔥 Hot" : p.badge === "sale" ? "🏷️ Sale" : p.badge}</div>` : ""}

    <div class="card-img-wrap">
      <span>${p.emoji}</span>
      <button class="wishlist-btn ${liked ? "active" : ""}"
              onclick="toggleWishlist(${p.id}, this)"
              title="${liked ? "Remove from wishlist" : "Add to wishlist"}">
        <i class="fa${liked ? "s" : "r"} fa-heart"></i>
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
  `;
  return card;
}

// ──────────────── Cart Logic ────────────────
function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  updateCardFooter(id);
  updateCartUI();
  const p = PRODUCTS.find(p => p.id === id);
  showToast(`${p.emoji} ${p.name} added to cart!`);
}

function changeQty(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  updateCardFooter(id);
  updateCartUI();
}

function updateCardFooter(id) {
  const footer = document.getElementById(`card-footer-${id}`);
  if (!footer) return;
  const qty = cart[id] || 0;
  if (qty === 0) {
    footer.innerHTML = `<button class="add-btn" onclick="addToCart(${id})">
      <i class="fa fa-plus"></i> Add to Cart
    </button>`;
  } else {
    footer.innerHTML = `<div class="qty-stepper">
      <button onclick="changeQty(${id}, -1)">−</button>
      <span class="qty-num">${qty}</span>
      <button onclick="changeQty(${id}, 1)">+</button>
    </div>`;
  }
}

function updateCartUI() {
  const ids = Object.keys(cart).map(Number);
  const totalItems = ids.reduce((s, id) => s + cart[id], 0);
  document.getElementById("cartCount").textContent = totalItems;

  const cartItemsEl = document.getElementById("cartItems");
  const cartEmptyEl = document.getElementById("cartEmpty");
  const cartFooterEl = document.getElementById("cartFooter");

  if (ids.length === 0) {
    cartItemsEl.innerHTML = "";
    cartItemsEl.appendChild(cartEmptyEl);
    cartEmptyEl.style.display = "flex";
    cartFooterEl.style.display = "none";
    return;
  }

  cartEmptyEl.style.display = "none";
  cartFooterEl.style.display = "flex";

  // Build cart item list
  cartItemsEl.innerHTML = "";
  ids.forEach(id => {
    const p   = PRODUCTS.find(p => p.id === id);
    const qty = cart[id];
    const el  = document.createElement("div");
    el.className = "cart-item";
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
      <button class="ci-remove" onclick="removeFromCart(${id})" title="Remove">
        <i class="fa fa-trash"></i>
      </button>
    `;
    cartItemsEl.appendChild(el);
  });

  // Pricing
  const subtotal = ids.reduce((s, id) => s + PRODUCTS.find(p => p.id === id).price * cart[id], 0);
  const delivery = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  const discount = discountApplied ? Math.round(subtotal * DISCOUNT_PCT / 100) : 0;
  const total    = subtotal - discount + delivery;

  document.getElementById("subtotal").textContent    = `₹${subtotal}`;
  document.getElementById("deliveryFee").textContent = delivery === 0 ? "FREE" : `₹${delivery}`;
  document.getElementById("discountAmt").textContent = `-₹${discount}`;
  document.getElementById("total").textContent        = `₹${total}`;
  document.getElementById("discountRow").style.display = discountApplied ? "flex" : "none";
}

function removeFromCart(id) {
  delete cart[id];
  updateCardFooter(id);
  updateCartUI();
}

function clearCart() {
  const ids = Object.keys(cart).map(Number);
  ids.forEach(id => { delete cart[id]; updateCardFooter(id); });
  cart = {};
  discountApplied = false;
  document.getElementById("couponInput").value = "";
  document.getElementById("couponMsg").textContent = "";
  updateCartUI();
}

// ──────────────── Cart Drawer Toggle ────────────────
function toggleCart() {
  const drawer  = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartOverlay");
  drawer.classList.toggle("open");
  overlay.classList.toggle("open");
}

// ──────────────── Coupon ────────────────
function applyCoupon() {
  const code = document.getElementById("couponInput").value.trim().toUpperCase();
  const msg  = document.getElementById("couponMsg");
  if (discountApplied) {
    msg.className = "coupon-msg error";
    msg.textContent = "Coupon already applied.";
    return;
  }
  if (code === COUPON) {
    discountApplied = true;
    msg.className = "coupon-msg success";
    msg.textContent = `✅ ${DISCOUNT_PCT}% discount applied!`;
    updateCartUI();
  } else {
    msg.className = "coupon-msg error";
    msg.textContent = "❌ Invalid coupon code.";
  }
}

// ──────────────── Checkout ────────────────
function checkout() {
  if (Object.keys(cart).length === 0) {
    showToast("Your cart is empty!");
    return;
  }
  const orderId = "FM" + Date.now().toString().slice(-8).toUpperCase();
  document.getElementById("orderId").textContent = `Order ID: ${orderId}`;
  document.getElementById("orderModal").style.display = "flex";
  clearCart();
  toggleCart();
}

function closeModal() {
  document.getElementById("orderModal").style.display = "none";
}

// ──────────────── Search & Filter ────────────────
function handleSearch() {
  currentSearch = document.getElementById("searchInput").value.trim().toLowerCase();
  renderProducts();
}

function filterCategory(cat, btn) {
  currentCategory = cat;
  // Update active pill
  document.querySelectorAll(".cat-pill").forEach(el => el.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderProducts();
}

function sortProducts() {
  currentSort = document.getElementById("sortSelect").value;
  renderProducts();
}

// ──────────────── Wishlist ────────────────
function toggleWishlist(id, btn) {
  if (wishlist.has(id)) {
    wishlist.delete(id);
    btn.classList.remove("active");
    btn.innerHTML = `<i class="far fa-heart"></i>`;
    showToast("Removed from wishlist");
  } else {
    wishlist.add(id);
    btn.classList.add("active");
    btn.innerHTML = `<i class="fas fa-heart"></i>`;
    const p = PRODUCTS.find(p => p.id === id);
    showToast(`${p.emoji} Added to wishlist!`);
  }
}

// ──────────────── Toast ────────────────
let toastTimer;
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
}

// ──────────────── Close modal on overlay click ────────────────
document.getElementById("orderModal")?.addEventListener("click", function(e) {
  if (e.target === this) closeModal();
});
