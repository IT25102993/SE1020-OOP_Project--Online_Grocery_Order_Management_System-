document.addEventListener('DOMContentLoaded', () => {
    const itemsContainer = document.getElementById('cart-items-container');
    const summaryDiv = document.getElementById('cart-summary');
    const emptyDiv = document.getElementById('cart-empty');
    const totalSpan = document.getElementById('cart-total-amount');
    const currentUser = sessionStorage.getItem('loggedInUser');

    function mapBackendItem(item) {
        return {
            id: item.product.productId,
            name: item.product.name,
            price: item.product.price || 0,
            quantity: item.quantity
        };
    }

    async function getCartItems() {
        if (!currentUser) {
            return JSON.parse(sessionStorage.getItem('sessionCart')) || [];
        }

        const response = await fetch(`/api/cart/${encodeURIComponent(currentUser)}`);
        const items = await response.json();
        return items.map(mapBackendItem);
    }

    async function updateBackendQty(productId, quantity) {
        const response = await fetch('/api/cart/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerEmail: currentUser,
                productId: productId,
                quantity: quantity
            })
        });
        return response.json();
    }

    async function removeBackendItem(productId) {
        const params = new URLSearchParams({
            customerEmail: currentUser,
            productId: productId
        });
        const response = await fetch(`/api/cart/remove?${params.toString()}`, {
            method: 'DELETE'
        });
        return response.json();
    }

    async function renderCart() {
        let cart = [];

        try {
            cart = await getCartItems();
        } catch (error) {
            console.error("Cart load error:", error);
            itemsContainer.innerHTML = '<p style="color:#ff4d4d;">Could not load cart items.</p>';
            return;
        }
        
        if (cart.length === 0) {
            itemsContainer.innerHTML = '';
            summaryDiv.style.display = 'none';
            emptyDiv.style.display = 'block';
            return;
        }

        emptyDiv.style.display = 'none';
        summaryDiv.style.display = 'block';
        itemsContainer.innerHTML = '';

        let total = 0;
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <div class="item-info">
                    <h3>${item.name}</h3>
                    <p>Price: Rs. ${item.price.toFixed(2)}</p>
                </div>
                <div class="quantity-controls">
                    <button class="qty-btn" onclick="updateQty(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
                    <span class="remove-btn" onclick="removeItem(${index})">Remove</span>
                </div>
            `;
            itemsContainer.appendChild(itemEl);
        });

        if (totalSpan) totalSpan.innerText = total.toFixed(2);
        if (typeof window.updateIsland === 'function') {
            window.updateIsland();
        }
    }

    window.updateQty = async (index, delta) => {
        let cart = await getCartItems();
        cart[index].quantity += delta;
        if (cart[index].quantity < 1) cart[index].quantity = 1;

        if (currentUser) {
            const result = await updateBackendQty(cart[index].id, cart[index].quantity);
            if (!result.success) {
                alert(result.message || "Could not update cart item.");
                return;
            }
        } else {
            sessionStorage.setItem('sessionCart', JSON.stringify(cart));
        }

        renderCart();
    };

    window.removeItem = async (index) => {
        let cart = await getCartItems();
        const item = cart[index];

        if (currentUser) {
            const result = await removeBackendItem(item.id);
            if (!result.success) {
                alert(result.message || "Could not remove cart item.");
                return;
            }
        } else {
            cart.splice(index, 1);
            sessionStorage.setItem('sessionCart', JSON.stringify(cart));
        }

        renderCart();
    };

    renderCart();
});
