document.addEventListener('DOMContentLoaded', () => {
    const summaryList = document.getElementById('summary-items-list');
    const totalAmountSpan = document.getElementById('summary-total-amount');
    const checkoutForm = document.getElementById('checkout-form');

    const currentUser = sessionStorage.getItem('loggedInUser');
    if (!currentUser) {
        alert("Please log in to proceed to checkout.");
        window.location.href = "login.html";
        return;
    }

    function loadSummary() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            alert("Your cart is empty!");
            window.location.href = "order.html";
            return;
        }

        summaryList.innerHTML = '';
        let total = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            summaryList.innerHTML += `
                <div class="summary-item">
                    <span>${item.name} x ${item.quantity}</span>
                    <span>Rs. ${itemTotal.toFixed(2)}</span>
                </div>
            `;
        });

        totalAmountSpan.innerText = total.toFixed(2);
    }

    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const total = totalAmountSpan.innerText;

        const orderRequest = {
            customerEmail: currentUser,
            totalAmount: parseFloat(total),
            items: cart.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.price
            }))
        };

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderRequest)
            });

            const result = await response.json();

            if (result.success) {
                // Success message
                alert(`Thank you! Your order has been placed successfully.`);
                
                // Clear cart
                localStorage.removeItem('cart');
                
                // Redirect to profile to see orders
                window.location.href = "profile.html";
            } else {
                alert("Failed to place order: " + (result.message || "Unknown error"));
            }
        } catch (error) {
            console.error("Order error:", error);
            alert("An error occurred while placing your order. Please try again.");
        }
    });

    loadSummary();
});
