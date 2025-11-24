const products = [
  { id: 'CSH01', name: 'Cold Brew Honey', category: 'Kopi', price: 28000, meta: 'Signature', accent: '#8ef6e4' },
  { id: 'CSH02', name: 'Latte Velvet', category: 'Kopi', price: 32000, meta: 'Arabica blend', accent: '#9c6bff' },
  { id: 'TCH01', name: 'Matcha Cloud', category: 'Teh', price: 26000, meta: 'Ceremonial grade', accent: '#77e0c6' },
  { id: 'DSR01', name: 'Kombucha Roselle', category: 'Mocktail', price: 35000, meta: 'Fermentasi 48h', accent: '#ff8bb3' },
  { id: 'FOD01', name: 'Croissant Almond', category: 'Pastry', price: 24000, meta: 'Buttery & flaky', accent: '#ffc28c' },
  { id: 'FOD02', name: 'Bruschetta Truffle', category: 'Snack', price: 38000, meta: 'Savory special', accent: '#b0a8ff' },
  { id: 'FOD03', name: 'Avocado Toast', category: 'Snack', price: 33000, meta: 'Premium sourdough', accent: '#a0e9ff' },
  { id: 'DSR02', name: 'Sparkling Lychee', category: 'Mocktail', price: 30000, meta: 'Zero sugar', accent: '#f9d371' },
  { id: 'DSR03', name: 'Mineral Spark', category: 'Minuman', price: 12000, meta: 'Botol 350ml', accent: '#9ce0ff' },
  { id: 'ADD01', name: 'Syrup Vanilla', category: 'Add-on', price: 7000, meta: 'Organic', accent: '#ffd2e2' },
  { id: 'ADD02', name: 'Extra Shot', category: 'Add-on', price: 8000, meta: 'Espresso', accent: '#ffb38a' },
  { id: 'ADD03', name: 'Non-Dairy Milk', category: 'Add-on', price: 9000, meta: 'Oat / Soy', accent: '#c1f0d5' },
];

const cart = new Map();
const productGrid = document.getElementById('productGrid');
const cartList = document.getElementById('cartList');
const subtotalEl = document.getElementById('subtotal');
const taxEl = document.getElementById('tax');
const grandTotalEl = document.getElementById('grandTotal');
const discountRange = document.getElementById('discountRange');
const discountLabel = document.getElementById('discountLabel');
const categoryChips = document.getElementById('categoryChips');
const searchInput = document.getElementById('searchInput');
const toast = document.getElementById('toast');
const receiptCustomer = document.getElementById('receiptCustomer');
const receiptMethod = document.getElementById('receiptMethod');
const receiptTime = document.getElementById('receiptTime');
const receiptItems = document.getElementById('receiptItems');
const receiptSubtotal = document.getElementById('receiptSubtotal');
const receiptTax = document.getElementById('receiptTax');
const receiptDiscount = document.getElementById('receiptDiscount');
const receiptGrand = document.getElementById('receiptGrand');
const checkoutBtn = document.getElementById('checkoutBtn');
const clock = document.getElementById('clock');

let activeCategory = 'Semua';

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
}

function renderChips() {
  const categories = ['Semua', ...new Set(products.map((p) => p.category))];
  categoryChips.innerHTML = '';
  categories.forEach((cat) => {
    const chip = document.createElement('div');
    chip.className = `chip ${activeCategory === cat ? 'active' : ''}`;
    chip.textContent = cat;
    chip.onclick = () => {
      activeCategory = cat;
      renderChips();
      renderProducts();
    };
    categoryChips.appendChild(chip);
  });
}

function renderProducts() {
  const query = searchInput.value.toLowerCase();
  productGrid.innerHTML = '';
  products
    .filter((p) => activeCategory === 'Semua' || p.category === activeCategory)
    .filter((p) => `${p.name} ${p.category} ${p.id}`.toLowerCase().includes(query))
    .forEach((product) => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <div class="product-top">
          <div>
            <p class="product-chip">${product.category}</p>
            <h3 class="product-title">${product.name}</h3>
            <p class="product-meta">${product.meta}</p>
          </div>
          <div class="pill" style="color:${product.accent}">${product.id}</div>
        </div>
        <div class="product-price">
          <strong>${formatCurrency(product.price)}</strong>
          <span class="muted">per item</span>
        </div>
        <div class="quick-add">
          <span class="pill">Warna aksen</span>
          <button class="add-btn" style="box-shadow: 0 15px 35px ${product.accent}40" data-id="${product.id}">Tambah</button>
        </div>
      `;
      card.querySelector('.add-btn').onclick = () => addToCart(product.id);
      productGrid.appendChild(card);
    });
}

function addToCart(id) {
  const product = products.find((p) => p.id === id);
  if (!product) return;
  const item = cart.get(id) || { ...product, qty: 0 };
  item.qty += 1;
  cart.set(id, item);
  renderCart();
  showToast(`${product.name} ditambahkan`);
}

function updateQty(id, delta) {
  const item = cart.get(id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart.delete(id);
  } else {
    cart.set(id, item);
  }
  renderCart();
}

function renderCart() {
  cartList.innerHTML = '';
  if (cart.size === 0) {
    cartList.innerHTML = '<p class="muted">Keranjang masih kosong. Pilih produk untuk memulai.</p>';
  }

  cart.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div>
        <p class="name">${item.name}</p>
        <p class="meta">${item.category} • ${item.id}</p>
      </div>
      <div class="qty-control">
        <button aria-label="Kurangi" onclick="updateQty('${item.id}', -1)">-</button>
        <span>${item.qty}</span>
        <button aria-label="Tambah" onclick="updateQty('${item.id}', 1)">+</button>
      </div>
      <div style="text-align:right">
        <p>${formatCurrency(item.price * item.qty)}</p>
        <button class="remove-btn" onclick="removeItem('${item.id}')">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `;
    cartList.appendChild(row);
  });

  updateSummary();
  updateReceipt();
}

function removeItem(id) {
  cart.delete(id);
  renderCart();
}

function updateSummary() {
  const subtotal = Array.from(cart.values()).reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountPercent = Number(discountRange.value);
  const discountAmount = subtotal * (discountPercent / 100);
  const taxable = Math.max(subtotal - discountAmount, 0);
  const tax = taxable * 0.1;
  const total = taxable + tax;

  subtotalEl.textContent = formatCurrency(subtotal);
  taxEl.textContent = formatCurrency(tax);
  discountLabel.textContent = `${discountPercent}%`;
  grandTotalEl.textContent = formatCurrency(total);
}

function updateReceipt() {
  const now = new Date();
  receiptTime.textContent = now.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
  const customer = document.getElementById('customerName').value || 'Walk-in Guest';
  const method = document.getElementById('paymentMethod').value;
  receiptCustomer.textContent = customer;
  receiptMethod.textContent = method;

  receiptItems.innerHTML = '';
  let subtotal = 0;
  cart.forEach((item) => {
    subtotal += item.price * item.qty;
    const line = document.createElement('div');
    line.className = 'receipt-item';
    line.innerHTML = `<span>${item.name} × ${item.qty}</span><span>${formatCurrency(item.price * item.qty)}</span>`;
    receiptItems.appendChild(line);
  });

  const discountPercent = Number(discountRange.value);
  const discountAmount = subtotal * (discountPercent / 100);
  const taxable = Math.max(subtotal - discountAmount, 0);
  const tax = taxable * 0.1;
  const total = taxable + tax;

  receiptSubtotal.textContent = formatCurrency(subtotal);
  receiptDiscount.textContent = `-${formatCurrency(discountAmount)}`;
  receiptTax.textContent = formatCurrency(tax);
  receiptGrand.textContent = formatCurrency(total);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

function checkout() {
  if (cart.size === 0) {
    showToast('Keranjang masih kosong.');
    return;
  }
  const method = document.getElementById('paymentMethod').value;
  const customer = document.getElementById('customerName').value || 'Walk-in Guest';
  showToast(`Transaksi atas nama ${customer} via ${method} diproses.`);
  updateReceipt();
}

function startClock() {
  const tick = () => {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    requestAnimationFrame(tick);
  };
  tick();
}

// Event bindings
searchInput.addEventListener('input', renderProducts);
discountRange.addEventListener('input', () => {
  discountLabel.textContent = `${discountRange.value}%`;
  updateSummary();
  updateReceipt();
});
checkoutBtn.addEventListener('click', checkout);

renderChips();
renderProducts();
renderCart();
startClock();
