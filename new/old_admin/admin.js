document.addEventListener("DOMContentLoaded", function () {
    // --- 1. Authentication Logic ---
    const authLink = document.getElementById("auth-link");
    const adminContainer = document.getElementById("admin-link-container");
    const admin = document.getElementById("admin-link");
    const currentUser = sessionStorage.getItem('loggedInUser');

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
});