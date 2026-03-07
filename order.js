document.addEventListener("DOMContentLoaded", function () {
    // --- Existing Authentication Logic (Kept from your original) ---
    const authLink = document.getElementById("auth-link");
    const adminContainer = document.getElementById("admin-link-container");
    const currentUser = sessionStorage.getItem('loggedInUser');

    if (currentUser) {
        authLink.innerHTML = `Logged in as: <b>${currentUser}</b> | <span id="logout-btn" style="cursor:pointer; color: #3b58ff; margin-left: 10px;">Logout</span>`;
        authLink.href = "javascript:void(0)";
        
        if (currentUser === "admin@gmail.com") {
            adminContainer.innerHTML = `<a href="admin.html" style="color: red; text-align:center; font-weight: bold;">Admin Panel</a>`;
        }

        document.getElementById("logout-btn").addEventListener("click", () => {
            sessionStorage.removeItem('loggedInUser');
            window.location.reload();
        });
    }
    const cards = document.querySelectorAll(".product-card");
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add("show");
        }, index * 100);
    });
        const buttons = document.querySelectorAll(".category-btn");
    const products = document.querySelectorAll(".product-card");

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            buttons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            const category = button.dataset.category;
            products.forEach(product => {
                product.style.display = (category === "all" || product.dataset.category === category) ? "block" : "none";
            });
        });
    });

        // --- Dynamic Island Cart System ---
    let cartCount = 0;
    const island = document.getElementById("cart-island");
    const islandCount = document.getElementById("island-count");

    window.addToCart = function (button) {
        cartCount++;
        islandCount.innerText = cartCount;

        // Show island and pulse
        island.classList.add("active");
        island.classList.remove("pulse");
        void island.offsetWidth; // Force reflow to restart animation
        island.classList.add("pulse");

        // Button Feedback
        button.innerText = "Added ✓";
        button.style.background = "green";
        setTimeout(() => {
            button.innerText = "Add to Cart";
            button.style.background = "#2a5298";
        }, 800);
    };

    // Island Click Redirection
    island.addEventListener("click", () => {
        window.location.href = "checkout.html";
    });

    // --- Scroll to Top ---
    const topBtn = document.getElementById("topBtn");
    window.addEventListener("scroll", () => {
        topBtn.style.display = window.scrollY > 200 ? "block" : "none";
    });
    topBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
});

    // --- Load Products from Inventory ---
    const productGrid = document.querySelector(".products");
    const savedInventory = JSON.parse(localStorage.getItem('inventory')) || [];

    savedInventory.forEach(product => {
        const card = document.createElement('div');
        card.className = "product-card show";
        card.setAttribute('data-category', product.category);

        // Display the image saved with the Product ID
        card.innerHTML = `
            <img src="${product.imagePath}" alt="${product.name}">
            <small style="color:gray;">ID: ${product.id} | ${product.category}</small>
            <h3>${product.name}</h3>
            <p>Rs.${product.price}.00</p>
            <p style="font-size:12px;">Stock: <b>${product.stock}</b></p>
            <button onclick="addToCart(this)" ${parseInt(product.stock) <= 0 ? 'disabled' : ''}>
                ${parseInt(product.stock) > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
        `;
        productGrid.appendChild(card);
    });

    // --- (Your existing Category Filter and Cart Island logic continues here) ---
});