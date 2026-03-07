document.addEventListener("DOMContentLoaded", function () {
    // --- 1. Authentication Logic ---
    const authLink = document.getElementById("auth-link");
    const adminContainer = document.getElementById("admin-link-container");
    const admin = document.getElementById("admin-link");
    const currentUser = sessionStorage.getItem('loggedInUser');

    if (currentUser) {
        authLink.innerHTML = `Logged in as: <b>${currentUser}</b> | <span id="logout-btn" style="cursor:pointer; color: #3b58ff; margin-left: 10px;">Logout</span>`;
        authLink.href = "javascript:void(0)";
        
        // Show Admin Panel / Add Products link if admin
        if (currentUser === "admin@gmail.com") {
            adminContainer.innerHTML = `<a href="admin.html" target="_blank" style="color: red; font-weight: bold; margin-right:15px;">Add Products</a>`;
        }
        if (currentUser === "admin@gmail.com") {
            admin.innerHTML = `<h4 style="color: red;">Admin</h4>`;
        }

        document.getElementById("logout-btn").addEventListener("click", () => {
            sessionStorage.removeItem('loggedInUser');
            window.location.reload();
        });
    }

    //ADMIN next to FreshMart

    // --- 2. Load Products from Inventory (Local Storage) ---
    const productGrid = document.getElementById("product-grid");
    const savedInventory = JSON.parse(localStorage.getItem('inventory')) || [];

    savedInventory.forEach(product => {
        const card = document.createElement('div');
        card.className = "product-card"; // Animation handled below
        card.setAttribute('data-category', product.category);
        
        card.innerHTML = `
            <img src="${product.imagePath || 'images/products_pics/PRNF.png'}" alt="${product.name}">
            <small style="color:gray; display:block; margin-top:5px;">ID: ${product.id} | ${product.category}</small>
            <h3>${product.name}</h3>
            <p>Rs.${product.price}.00</p>
            <p style="font-size:12px;">Stock: <b>${product.stock}</b></p>
            <button onclick="addToCart(this)" ${parseInt(product.stock) <= 0 ? 'disabled' : ''}>
                ${parseInt(product.stock) > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
        `;
        productGrid.appendChild(card);
    });

    // --- 3. Product Animation (Applies to Hardcoded + Dynamic) ---
    const allCards = document.querySelectorAll(".product-card");
    allCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add("show");
        }, index * 100);
    });

    // --- 4. Category Filtering ---
    const buttons = document.querySelectorAll(".category-btn");
    buttons.forEach(button => {
        button.addEventListener("click", () => {
            buttons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            const category = button.dataset.category;
            
            allCards.forEach(product => {
                product.style.display = (category === "all" || product.dataset.category === category) ? "block" : "none";
            });
        });
    });

    // --- 5. Dynamic Island Cart System ---
    let cartCount = 0;
    const island = document.getElementById("cart-island");
    const islandCount = document.getElementById("island-count");

    window.addToCart = function (button) {
        cartCount++;
        islandCount.innerText = cartCount;

        // Show island and pulse
        island.classList.add("active");
        island.classList.remove("pulse");
        void island.offsetWidth; // Force reflow
        island.classList.add("pulse");

        // Button Feedback
        const originalText = button.innerText;
        button.innerText = "Added ✓";
        button.style.background = "green";
        setTimeout(() => {
            button.innerText = originalText;
            button.style.background = "#2a5298";
        }, 800);
    };

    island.addEventListener("click", () => {
        window.location.href = "checkout.html";
    });

    // --- 6. Scroll to Top ---
    const topBtn = document.getElementById("topBtn");
    window.addEventListener("scroll", () => {
        topBtn.style.display = window.scrollY > 200 ? "block" : "none";
    });
    topBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
});