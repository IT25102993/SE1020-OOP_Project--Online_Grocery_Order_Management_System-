const API = '';
let cartCount = 0; // Moved to global scope to be accessible by all functions

document.addEventListener('DOMContentLoaded', function() {
  const authLink = document.getElementById('auth-link');
  const adminContainer = document.getElementById('admin-link-container');
  const adminBadge = document.getElementById('admin-badge');
  const currentUser = sessionStorage.getItem('loggedInUser');
  const role = sessionStorage.getItem('userRole');

  if (currentUser) {
    let authHtml = `Logged in: <b>${currentUser}</b> | <a href="profile.html" style="color: #2a5298; text-decoration:none; margin-left:10px;">Profile</a> | <span id="logout-btn" style="cursor:pointer; color: #2a5298; margin-left: 10px;">Logout</span>`;
    authLink.innerHTML = authHtml;
    if (role === 'admin') {
      if (adminContainer) adminContainer.innerHTML = '<a href="admin.html" style="color: #c62828; font-weight: bold; margin-right: 15px;">Admin Panel</a>';
      if (adminBadge) adminBadge.innerHTML = ' <span style="color: #c62828; font-size: 14px;">(Admin)</span>';
    }
    document.getElementById('logout-btn').addEventListener('click', () => {
      sessionStorage.removeItem('loggedInUser');
      sessionStorage.removeItem('userRole');
      window.location.reload();
    });
  }

  loadProducts();
  categoryFilters();

  // --- Dynamic Island Cart System ---
  const island = document.getElementById("cart-island");
  const islandCount = document.getElementById("island-count");
  const expandedView = document.getElementById("island-expanded");
  const islandItemName = document.getElementById("expanded-item-name");
  const islandQtyInput = document.getElementById("island-qty");
  const islandBuyBtn = document.getElementById("island-buy-now");
  const qtyMinus = document.getElementById("qty-minus");
  const qtyPlus = document.getElementById("qty-plus");

  let currentIslandItemId = null;

  // Modified updateIsland to handle guest/login logic
  // forcedShow is true when we explicitly want the island to appear (e.g. after adding an item)
  window.updateIsland = function(forcedShow = false) {
    const currentUser = sessionStorage.getItem('loggedInUser');
    let cart = [];
    
    // Logic: Guests use sessionStorage (survives refreshes), Members use localStorage
    if (currentUser) {
      cart = JSON.parse(localStorage.getItem('cart')) || [];
    } else {
      cart = JSON.parse(sessionStorage.getItem('sessionCart')) || [];
    }
    
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    const island = document.getElementById("cart-island");
    const islandCount = document.getElementById("island-count");

    if (islandCount) islandCount.innerText = count;
    
    // Visibility Rule: 
    // - Guests: show if count > 0 (always)
    // - Members: show ONLY if just added (forcedShow) or if island is already active
    if (count > 0 && island) {
        if (!currentUser || forcedShow || island.classList.contains('active')) {
            island.classList.add("active");
        }
        
        if (!currentIslandItemId && cart.length > 0) {
            const lastItem = cart[cart.length - 1];
            currentIslandItemId = lastItem.id;
            if (islandItemName) islandItemName.innerText = lastItem.name;
            if (islandQtyInput) islandQtyInput.value = lastItem.quantity;
        }
    } else if (island) {
      island.classList.remove("active");
      island.classList.remove("expanded");
      currentIslandItemId = null;
    }
  }
  updateIsland(false); // Initial load check

  // Re-defining global addToCart to handle both UI and Island
  window.addToCart = function (button, name, price, id) {
    const currentUser = sessionStorage.getItem('loggedInUser');
    
    let cart = [];
    if (currentUser) {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } else {
        cart = JSON.parse(sessionStorage.getItem('sessionCart')) || [];
    }

    const itemIndex = cart.findIndex(item => item.id === id);
    let currentQty = 1;

    if (itemIndex > -1) {
      cart[itemIndex].quantity++;
      currentQty = cart[itemIndex].quantity;
    } else {
      cart.push({ id, name, price: parseFloat(price), quantity: 1 });
    }
    
    // Save based on status
    if (currentUser) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      sessionStorage.setItem('sessionCart', JSON.stringify(cart));
    }
    
    updateIsland(true); // Forced show on addition

    // Update Island Expanded Info
    if (islandItemName) islandItemName.innerText = name + " added!";
    if (islandQtyInput) islandQtyInput.value = currentQty;
    currentIslandItemId = id;

    // Pulse feedback
    const island = document.getElementById("cart-island");
    if (island) {
      island.classList.remove("pulse");
      void island.offsetWidth; // Force reflow
      island.classList.add("pulse");
    }

    // Button Feedback
    if (button) {
        const originalText = button.innerText;
        button.innerText = "Added ✓";
        button.style.background = "#23b236";
        button.disabled = true;

        setTimeout(() => {
          button.innerText = originalText;
          button.style.background = "#2a5298";
          button.disabled = false;
        }, 800);
    }
  };

  if (island) {
    island.addEventListener("click", (e) => {
      // Prevent expansion if clicking buttons
      if (e.target.closest('.qty-controls') || e.target.id === 'island-buy-now') return;
      island.classList.toggle("expanded");
    });
  }

  if (qtyMinus) {
    qtyMinus.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!currentIslandItemId) return;
        const currentUser = sessionStorage.getItem('loggedInUser');
        let cart = [];
        if (currentUser) {
          cart = JSON.parse(localStorage.getItem('cart')) || [];
        } else {
          cart = JSON.parse(sessionStorage.getItem('sessionCart')) || [];
        }
        
        const itemIndex = cart.findIndex(item => item.id === currentIslandItemId);
        if (itemIndex > -1 && cart[itemIndex].quantity > 1) {
            cart[itemIndex].quantity--;
            if (currentUser) localStorage.setItem('cart', JSON.stringify(cart));
            else sessionStorage.setItem('sessionCart', JSON.stringify(cart));
            islandQtyInput.value = cart[itemIndex].quantity;
            updateIsland(true);
        } else if (itemIndex > -1 && cart[itemIndex].quantity === 1) {
            cart.splice(itemIndex, 1);
            if (currentUser) localStorage.setItem('cart', JSON.stringify(cart));
            else sessionStorage.setItem('sessionCart', JSON.stringify(cart));
            island.classList.remove("expanded");
            updateIsland(true);
        }
    });
  }

  if (qtyPlus) {
    qtyPlus.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!currentIslandItemId) return;
        const currentUser = sessionStorage.getItem('loggedInUser');
        let cart = [];
        if (currentUser) {
          cart = JSON.parse(localStorage.getItem('cart')) || [];
        } else {
          cart = JSON.parse(sessionStorage.getItem('sessionCart')) || [];
        }

        const itemIndex = cart.findIndex(item => item.id === currentIslandItemId);
        if (itemIndex > -1) {
            cart[itemIndex].quantity++;
            if (currentUser) localStorage.setItem('cart', JSON.stringify(cart));
            else sessionStorage.setItem('sessionCart', JSON.stringify(cart));
            islandQtyInput.value = cart[itemIndex].quantity;
            updateIsland(true);
        }
    });
  }

  if (islandBuyBtn) {
    islandBuyBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const currentUser = sessionStorage.getItem('loggedInUser');
        if (!currentUser) {
            alert("Please log in to your account before placing an order.");
            window.location.href = "login.html";
            return;
        }
        window.location.href = "cart.html"; 
    });
  }

  // --- Scroll to Top ---
  const topBtn = document.getElementById("topBtn");
  window.addEventListener("scroll", () => {
    if (topBtn) topBtn.style.display = window.scrollY > 200 ? "block" : "none";
  });

  if (topBtn) {
    topBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}); 

async function loadProducts() {
  const productGrid = document.getElementById('product-grid');
    if (!productGrid) return;
    try {
        const res = await fetch(API + '/api/products');
    const list = await res.json();
    if (!list || list.length === 0) {
      productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">No products available.</p>';
      return;
    }
    productGrid.innerHTML = '';
    list.forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.dataset.category = p.category || 'grocery';
      const imgSrc = p.imagePath ? (API + p.imagePath) : '';
      const placeholder = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="#eee" width="200" height="200"/><text x="50%" y="50%" fill="#999" font-size="14" text-anchor="middle" dy=".3em">No image</text></svg>');
      card.innerHTML = `
        <img src="${imgSrc || placeholder}" alt="${p.name}" onerror="this.src='${placeholder}'">
        <small style="color:gray;">ID: ${p.productId}</small>
        <h3>${p.name}</h3>
        <p>Rs. ${p.price != null ? p.price : 0}</p>
        <button onclick="addToCart(this, '${p.name.replace(/'/g, "\\'")}', ${p.price != null ? p.price : 0}, '${p.productId}')">Add to Cart</button>
      `;
      productGrid.appendChild(card);
      setTimeout(() => card.classList.add('show'), i * 80);
    });
  } catch (err) {
    if (productGrid) productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">Could not load products. Start the server (port 8080).</p>';
  }
}

function categoryFilters() {
  const buttons = document.querySelectorAll('.category-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.category;
      document.querySelectorAll('.product-card').forEach(card => {
        card.style.display = (cat === 'all' || card.dataset.category === cat) ? 'block' : 'none';
      });
    });
  });
}