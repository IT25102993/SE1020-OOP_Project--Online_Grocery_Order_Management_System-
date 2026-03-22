document.addEventListener('DOMContentLoaded', () => {
    const itemsContainer = document.getElementById('cart-items-container');
    const summaryDiv = document.getElementById('cart-summary');
    const emptyDiv = document.getElementById('cart-empty');
    const totalSpan = document.getElementById('cart-total-amount');

    function renderCart() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
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
                    <p>Price: Rs. ${item.price}</p>
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

        if (totalSpan) totalSpan.innerText = total;
        if (typeof window.updateIsland === 'function') {
            window.updateIsland();
        }
    }

    window.updateQty = (index, delta) => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart[index].quantity += delta;
        if (cart[index].quantity < 1) cart[index].quantity = 1;
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
    };

    window.removeItem = (index) => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
    };

    renderCart();
});
