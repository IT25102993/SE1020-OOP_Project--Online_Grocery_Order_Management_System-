document.addEventListener("DOMContentLoaded", function () {
    // --- Existing Authentication Logic ---
    const authLink = document.getElementById("auth-link");
    const adminContainer = document.getElementById("admin-link-container");
    const currentUser = sessionStorage.getItem('loggedInUser');

    if (currentUser) {
        authLink.innerHTML = `Logged in as: <b>${currentUser}</b> | <span id="logout-btn" style="cursor:pointer; color: #3b58ff; margin-left: 10px;">Logout</span>`;
        if (currentUser === "admin@gmail.com") {
            adminContainer.innerHTML = `<a href="add_products.html" style="color: red; font-weight: bold; margin-right:15px;">Add Products</a>`;
        }
        document.getElementById("logout-btn").addEventListener("click", () => {
            sessionStorage.removeItem('loggedInUser');
            window.location.reload();
        });
    }

    // --- Load Saved Products ---
    const productGrid = document.querySelector(".products");
    const savedInventory = JSON.parse(localStorage.getItem('inventory')) || [];

    savedInventory.forEach(product => {
        const card = document.createElement('div');
        card.className = "product-card show";
        card.setAttribute('data-category', product.category);

        card.innerHTML = `
            <img src="images/products_pics/PRNF.png" alt="${product.name}">
            <small style="color:gray;">ID: ${product.id}</small>
            <h3>${product.name}</h3>
            <p>Rs.${product.price}.00</p>
            <p style="font-size:12px;">Stock: <b>${product.stock}</b></p>
            <button onclick="addToCart(this)" ${parseInt(product.stock) <= 0 ? 'disabled' : ''}>
                ${parseInt(product.stock) > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
        `;
        productGrid.appendChild(card);
    });

    // --- Category Filtering ---
    const buttons = document.querySelectorAll(".category-btn");
    buttons.forEach(button => {
        button.addEventListener("click", () => {
            buttons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            const category = button.dataset.category;
            document.querySelectorAll(".product-card").forEach(p => {
                p.style.display = (category === "all" || p.dataset.category === category) ? "block" : "none";
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
        island.classList.add("active");
        island.classList.remove("pulse");
        void island.offsetWidth; // Restart animation
        island.classList.add("pulse");

        button.innerText = "Added ✓";
        button.style.background = "green";
        setTimeout(() => {
            button.innerText = "Add to Cart";
            button.style.background = "#2a5298";
        }, 800);
    };
});