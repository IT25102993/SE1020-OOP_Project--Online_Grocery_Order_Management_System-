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

    async function loadSummary() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            alert("Your cart is empty!");
            window.location.href = "order.html";
            return;
        }

        try {
            const reqBody = {
                customerEmail: currentUser,
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price
                }))
            };

            const response = await fetch('/api/orders/calculate-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reqBody)
            });

            if (!response.ok) {
                throw new Error("Failed to load checkout summary");
            }

            const data = await response.json();

            // Populate items list
            summaryList.innerHTML = '';
            data.items.forEach(item => {
                let discountText = '';
                if (item.hasDiscount) {
                    discountText = ` <span style="color:#e53e3e; font-size:11px; font-weight:600;">(5% Repeats Disc.)</span>`;
                }
                summaryList.innerHTML += `
                    <div class="summary-item" style="display:flex; justify-content:space-between; margin-bottom:10px; font-size: 14px;">
                        <span>${item.name} x ${item.quantity}${discountText}</span>
                        <span>Rs. ${item.itemTotal.toFixed(2)}</span>
                    </div>
                `;
            });

            // Populate numeric fields
            document.getElementById('summary-subtotal').innerText = data.subtotal.toFixed(2);
            
            const discountRow = document.getElementById('summary-discount-row');
            if (data.discount > 0) {
                discountRow.style.display = 'flex';
                document.getElementById('summary-discount').innerText = data.discount.toFixed(2);
            } else {
                discountRow.style.display = 'none';
            }

            document.getElementById('summary-delivery').innerText = data.deliveryCharge.toFixed(2);
            totalAmountSpan.innerText = data.total.toFixed(2);

        } catch (error) {
            console.error("Calculate summary error:", error);
            alert("Error loading checkout details. Please try again.");
        }
    }

    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const total = totalAmountSpan.innerText;

        const paymentMethodEl = document.getElementById('payment-method');
        const cardBankEl = document.getElementById('card-bank');
        const cardNumberEl = document.getElementById('card-number');
        const cardExpiryEl = document.getElementById('card-expiry');
        const cardCvvEl = document.getElementById('card-cvv');
        const cardNameEl = document.getElementById('card-name');

        const paymentMethod = paymentMethodEl ? paymentMethodEl.value.toUpperCase() : 'COD';
        const cardBank = (paymentMethod === 'CARD' && cardBankEl) ? cardBankEl.value : null;

        const orderRequest = {
            customerEmail: currentUser,
            totalAmount: parseFloat(total),
            paymentMethod: paymentMethod,
            cardBank: cardBank,
            cardNumber: (paymentMethod === 'CARD' && cardNumberEl) ? cardNumberEl.value : null,
            cardExpiry: (paymentMethod === 'CARD' && cardExpiryEl) ? cardExpiryEl.value : null,
            cardCvv: (paymentMethod === 'CARD' && cardCvvEl) ? cardCvvEl.value : null,
            cardName: (paymentMethod === 'CARD' && cardNameEl) ? cardNameEl.value : null,
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

    async function populateUserDetails() {
        const fullNameInput = document.getElementById('full-name');
        const addressInput = document.getElementById('address');
        
        try {
            const res = await fetch(`/api/customer/by-email/${encodeURIComponent(currentUser)}`);
            if (res.ok) {
                const user = await res.json();
                if (fullNameInput && user.name) {
                    fullNameInput.value = user.name;
                }
                if (addressInput && user.address) {
                    addressInput.value = user.address;
                }
            }
        } catch (error) {
            console.error("Failed to populate user details:", error);
        }
    }

    loadSummary();
    populateUserDetails();
});
