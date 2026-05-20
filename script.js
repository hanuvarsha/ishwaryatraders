/* =========================================================
   script.js — Balaji Traders Website
   ========================================================= */

// ── State ─────────────────────────────────────────────────
let allProducts = [];
let allReviews  = [];
let activeCategory = 'All';
let searchQuery    = '';
let sortOrder      = 'default';
let adminData      = [];  // working copy for admin edits

// ── Fetch products.json ───────────────────────────────────
async function loadData() {
  try {
    const res  = await fetch('products.json');
    const json = await res.json();
    allProducts = json.products || [];
    allReviews  = json.reviews  || [];
    adminData   = JSON.parse(JSON.stringify(allProducts)); // deep copy
    renderProductGrid();
    renderFeatured();
    renderReviews();
  } catch (e) {
    console.error('Could not load products.json:', e);
    document.getElementById('productGrid').innerHTML =
      '<p style="color:#ef4444;text-align:center;padding:40px">⚠️ Could not load products. Make sure products.json is in the same folder.</p>';
  }
}

// ── Filters & Search ─────────────────────────────────────
function getFilteredProducts() {
  let list = [...allProducts];
  if (activeCategory !== 'All') {
    list = list.filter(p => p.category === activeCategory);
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }
  switch (sortOrder) {
    case 'price-asc':  list.sort((a,b) => a.price - b.price); break;
    case 'price-desc': list.sort((a,b) => b.price - a.price); break;
    case 'name-asc':   list.sort((a,b) => a.name.localeCompare(b.name)); break;
  }
  return list;
}

// ── Render Product Card ───────────────────────────────────
function createProductCard(product, delay = 0) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.style.animationDelay = `${delay * 60}ms`;
  card.innerHTML = `
    <div class="product-img-wrap">
      <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'"/>
      ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
      <span class="product-cat-tag">${product.category}</span>
    </div>
    <div class="product-body">
      <div class="product-name">${product.name}</div>
      <div class="product-desc">${product.description}</div>
      <div class="product-price-row">
        <span class="product-price">₹${product.price.toLocaleString('en-IN')}</span>
        <span class="product-unit">${product.unit}</span>
      </div>
    </div>
    <div class="product-actions">
      <button class="btn-enquire" onclick="openModal(${product.id})">View Details</button>
      <a href="${waLink(product)}" target="_blank" class="btn-wa-card">💬 WhatsApp</a>
    </div>`;
  return card;
}

function waLink(product) {
  const msg = encodeURIComponent(
    `Hello Balaji Traders, I am interested in *${product.name}* (₹${product.price} ${product.unit}). Please provide more details.`
  );
  return `https://wa.me/917810019295?text=${msg}`;
}

// ── Render Product Grid ───────────────────────────────────
function renderProductGrid() {
  const grid = document.getElementById('productGrid');
  const none = document.getElementById('noResults');
  const filtered = getFilteredProducts();

  grid.innerHTML = '';
  if (filtered.length === 0) {
    grid.style.display = 'none';
    none.style.display = 'block';
  } else {
    grid.style.display = 'grid';
    none.style.display = 'none';
    filtered.forEach((p, i) => grid.appendChild(createProductCard(p, i)));
  }
}

// ── Render Featured Products ──────────────────────────────
function renderFeatured() {
  const grid = document.getElementById('featuredGrid');
  const featured = allProducts.filter(p => p.featured);
  featured.forEach((p, i) => grid.appendChild(createProductCard(p, i)));
}

// ── Render Reviews ────────────────────────────────────────
function renderReviews() {
  const grid = document.getElementById('reviewsGrid');
  allReviews.forEach((r, i) => {
    const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
    const initial = r.name.charAt(0).toUpperCase();
    const card = document.createElement('div');
    card.className = 'review-card';
    card.style.animationDelay = `${i * 80}ms`;
    card.innerHTML = `
      <div class="review-stars">${stars}</div>
      <div class="review-text">"${r.text}"</div>
      <div class="review-author">
        <div class="review-avatar">${initial}</div>
        <div>
          <div class="review-name">${r.name}</div>
          <div class="review-location">📍 ${r.location}</div>
        </div>
        <div class="review-date">${r.date}</div>
      </div>`;
    grid.appendChild(card);
  });
}

// ── Modal ─────────────────────────────────────────────────
function openModal(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;
  const content = document.getElementById('modalContent');
  content.innerHTML = `
    <img class="modal-img" src="${product.image}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop'"/>
    <div class="modal-body">
      <div class="modal-cat">${product.category}</div>
      <h2>${product.name}</h2>
      <div class="modal-price">₹${product.price.toLocaleString('en-IN')} <span>${product.unit}</span></div>
      <p>${product.description}</p>
      <div class="modal-actions">
        <a href="tel:7810019295" class="btn-call">📞 Call Now</a>
        <a href="${waLink(product)}" target="_blank" class="btn-wa">💬 WhatsApp Order</a>
      </div>
    </div>`;
  document.getElementById('productModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('productModal').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});
function closeModal() {
  document.getElementById('productModal').style.display = 'none';
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ── Navbar: scroll + hamburger ─────────────────────────────
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ── Category chips ─────────────────────────────────────────
document.getElementById('categoryChips').addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  activeCategory = chip.dataset.cat;
  renderProductGrid();
  document.getElementById('products').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ── Search ─────────────────────────────────────────────────
const searchInput = document.getElementById('searchInput');
const clearBtn    = document.getElementById('clearSearch');

searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value.trim();
  clearBtn.style.display = searchQuery ? 'block' : 'none';
  renderProductGrid();
});
clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  searchQuery = '';
  clearBtn.style.display = 'none';
  renderProductGrid();
});
document.activeElement.blur();

// ── Sort ───────────────────────────────────────────────────
document.getElementById('sortSelect').addEventListener('change', e => {
  sortOrder = e.target.value;
  renderProductGrid();
});

// ── Contact form → WhatsApp ───────────────────────────────
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const name     = document.getElementById('formName').value.trim();
  const phone    = document.getElementById('formPhone').value.trim();
  const category = document.getElementById('formCategory').value;
  const message  = document.getElementById('formMessage').value.trim();
  if (!name || !phone) { alert('Please fill in your name and phone number.'); return; }
  const text = encodeURIComponent(
    `Hello Balaji Traders,\n\nName: ${name}\nPhone: ${phone}\nInterested In: ${category}\n${message ? 'Message: ' + message : ''}\n\nPlease get back to me. Thank you!`
  );
  window.open(`https://wa.me/917810019295?text=${text}`, '_blank');
});

// ── Hero Particles ─────────────────────────────────────────
function createParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 14; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 8 + 4;
    p.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${Math.random() * 100}%;
      animation-duration: ${Math.random() * 8 + 7}s;
      animation-delay: ${Math.random() * 6}s;
      opacity: ${Math.random() * .5 + .1};
    `;
    container.appendChild(p);
  }
}

// ── Admin Panel ────────────────────────────────────────────
const ADMIN_PASSWORD = 'balaji2025';

document.getElementById('adminLoginBtn').addEventListener('click', () => {
  if (document.getElementById('adminPass').value === ADMIN_PASSWORD) {
    document.getElementById('adminLogin').style.display  = 'none';
    document.getElementById('adminPanel').style.display  = 'block';
    renderAdminTable(adminData);
  } else {
    alert('Incorrect password. Try again.');
    document.getElementById('adminPass').value = '';
  }
});
document.getElementById('adminPass').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('adminLoginBtn').click();
});

document.getElementById('adminLogout').addEventListener('click', () => {
  document.getElementById('adminLogin').style.display  = 'block';
  document.getElementById('adminPanel').style.display  = 'none';
  document.getElementById('adminPass').value = '';
  document.getElementById('saveStatus').textContent = '';
});

function renderAdminTable(data) {
  const wrap = document.getElementById('adminTable');
  if (data.length === 0) {
    wrap.innerHTML = '<p style="color:rgba(255,255,255,.5);padding:20px">No products match your search.</p>';
    return;
  }
  const rows = data.map(p => `
    <tr>
      <td>${p.id}</td>
      <td><input type="text" value="${p.name}" data-id="${p.id}" data-field="name" /></td>
      <td>
        <select data-id="${p.id}" data-field="category" style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:6px;padding:6px 10px;color:#fff;font-family:inherit;width:100%;outline:none;">
          ${['Pipes','Plumbing Materials','Sanitary Wares','Water Tanks','Pumps','Borewell Items'].map(c =>
            `<option value="${c}" ${p.category === c ? 'selected' : ''}>${c}</option>`
          ).join('')}
        </select>
      </td>
      <td><input type="number" value="${p.price}" data-id="${p.id}" data-field="price" style="width:100px"/></td>
      <td><input type="text" value="${p.unit}" data-id="${p.id}" data-field="unit" /></td>
      <td>
        <select data-id="${p.id}" data-field="featured" style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:6px;padding:6px 10px;color:#fff;font-family:inherit;width:80px;outline:none;">
          <option value="true"  ${p.featured ? 'selected':''}>Yes</option>
          <option value="false" ${!p.featured ? 'selected':''}>No</option>
        </select>
      </td>
    </tr>`).join('');

  wrap.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>ID</th><th>Product Name</th><th>Category</th><th>Price (₹)</th><th>Unit</th><th>Featured</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;

  wrap.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('change', () => {
      const id    = parseInt(el.dataset.id);
      const field = el.dataset.field;
      const prod  = adminData.find(p => p.id === id);
      if (!prod) return;
      if (field === 'price') prod[field] = parseFloat(el.value) || 0;
      else if (field === 'featured') prod[field] = el.value === 'true';
      else prod[field] = el.value;
      document.getElementById('saveStatus').textContent = '⚠️ Unsaved changes';
    });
  });
}

// Admin search filter
document.getElementById('adminSearch').addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  const filtered = adminData.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q)
  );
  renderAdminTable(filtered);
});

// Save changes (applies to live page, not file)
document.getElementById('saveChangesBtn').addEventListener('click', () => {
  allProducts = JSON.parse(JSON.stringify(adminData));
  renderProductGrid();
  renderFeatured();
  document.getElementById('saveStatus').textContent = '✅ Changes saved to this session!';
  setTimeout(() => document.getElementById('saveStatus').textContent = '', 4000);
});

// Export updated JSON
document.getElementById('exportBtn').addEventListener('click', () => {
  const exportData = { products: adminData };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'products.json';
  a.click(); URL.revokeObjectURL(url);
});

// ── Intersection Observer for animations ──────────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

function observeCards() {
  document.querySelectorAll('.product-card, .review-card').forEach(card => {
    card.style.animationPlayState = 'paused';
    observer.observe(card);
  });
}

// ── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  createParticles();
  loadData().then(() => {
    setTimeout(observeCards, 100);
  });
});
