document.addEventListener('DOMContentLoaded', async () => {
    const emailInput = document.getElementById('profile-email');
    const nameInput = document.getElementById('profile-name');
    const addressInput = document.getElementById('profile-address');
    const profileForm = document.getElementById('profile-form');
    const message = document.getElementById('profile-message');

    const currentUserEmail = sessionStorage.getItem('loggedInUser');
    if (!currentUserEmail) {
        window.location.href = 'login.html';
        return;
    }

    const verificationWrap = document.getElementById('verification-wrap');
    const profileCodeInput = document.getElementById('profile-code');
    const btnSendCode = document.getElementById('btn-send-code');
    const btnSave = document.getElementById('btn-save');
    const timerDisplay = document.getElementById('profile-timer');

    let countdownInterval = null;

    // Load current data
    try {
        const res = await fetch('/api/auth/customer/all');
        const customers = await res.json();
        const user = customers.find(c => c.email === currentUserEmail);
        
        if (user) {
            emailInput.value = user.email;
            nameInput.value = user.name || '';
            addressInput.value = user.address || '';
        }
    } catch (err) {
        console.error(err);
    }

    if (btnSendCode) {
        btnSendCode.addEventListener('click', async () => {
            btnSendCode.disabled = true;
            btnSendCode.innerText = 'Sending...';

            try {
                const res = await fetch('/api/auth/customer/send-update-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: currentUserEmail })
                });
                const data = await res.json();
                
                if (data.success) {
                    alert("Verification code sent to your email!");
                    verificationWrap.style.display = 'block';
                    btnSendCode.style.display = 'none';
                    btnSave.style.display = 'block';
                    startTimer(120);
                } else {
                    alert(data.message || "Failed to send code.");
                    btnSendCode.disabled = false;
                    btnSendCode.innerText = 'Send Verification Code';
                }
            } catch (err) {
                alert("Network error.");
                btnSendCode.disabled = false;
                btnSendCode.innerText = 'Send Verification Code';
            }
        });
    }

    function startTimer(seconds) {
        let timeLeft = seconds;
        if (countdownInterval) clearInterval(countdownInterval);
        
        const updateDisplay = (time) => {
            const mins = Math.floor(time / 60);
            const secs = time % 60;
            timerDisplay.textContent = `(${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')})`;
        };

        updateDisplay(timeLeft);
        
        countdownInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                timerDisplay.textContent = "(Expired)";
                btnSave.disabled = true;
                alert("Verification code expired. Please resend the code.");
            } else {
                updateDisplay(timeLeft);
            }
        }, 1000);
    }

    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const updateData = {
            email: emailInput.value,
            name: nameInput.value,
            address: addressInput.value,
            verificationCode: profileCodeInput.value.trim()
        };

        if (!updateData.verificationCode) {
            alert("Please enter the verification code.");
            return;
        }

        try {
            const res = await fetch('/api/auth/customer/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });

            const result = await res.json();
            if (result.success) {
                message.style.color = '#89ec8e';
                message.innerText = 'Profile updated successfully!';
                verificationWrap.style.display = 'none';
                btnSendCode.style.display = 'block';
                btnSendCode.disabled = false;
                btnSendCode.innerText = 'Send Verification Code';
                btnSave.style.display = 'none';
                if (countdownInterval) clearInterval(countdownInterval);
                timerDisplay.textContent = '';
            } else {
                message.style.color = '#ff4d4d';
                message.innerText = result.message || 'Update failed.';
            }
        } catch (err) {
            message.style.color = '#ff4d4d';
            message.innerText = 'Server error.';
        }
    });
    // --- Order History Logic ---
    const ordersList = document.getElementById('orders-list');

    const statusMap = {
        'REQUESTED': 0,
        'PROCESSED': 1,
        'DELIVERY_STARTED': 2,
        'ARRIVED': 3,
        'COMPLETED': 4
    };

    const statusLabels = [
        'Order Requested',
        'Processed',
        'Delivery Started',
        'Arrived',
        'Completed'
    ];

    async function loadOrders() {
        if (!ordersList) return;
        try {
            const res = await fetch(`/api/orders/customer/${currentUserEmail}`);
            const orders = await res.json();

            if (orders.length === 0) {
                ordersList.innerHTML = '<p style="opacity: 0.6;">You have no orders yet.</p>';
                return;
            }

            ordersList.innerHTML = '';
            orders.forEach(order => {
                const currentStep = statusMap[order.status] || 0;
                const orderDate = new Date(order.orderDate).toLocaleString();
                
                let driverSection = '';
                if (order.driver) {
                    driverSection = `
                        <div class="driver-info">
                            <span class="driver-icon">🚚</span>
                            <div>
                                <strong>Driver Assigned: ${order.driver.name}</strong><br>
                                <small>Phone: ${order.driver.phone} | Vehicle: ${order.driver.vehicle} (${order.driver.vehicleNo})</small>
                            </div>
                        </div>
                    `;
                }

                const orderCard = document.createElement('div');
                orderCard.className = 'order-card';
                orderCard.innerHTML = `
                    <div class="order-header">
                        <div>
                            <strong>Order #${order.id}</strong><br>
                            <small style="opacity:0.7">${orderDate}</small>
                        </div>
                        <div style="text-align: right;">
                            <strong style="color: #89ec8e;">Rs. ${order.totalAmount.toFixed(2)}</strong><br>
                            <small>${order.status}</small>
                        </div>
                    </div>

                    <div class="order-status-track">
                        ${statusLabels.map((label, index) => `
                            <div class="status-step ${index <= currentStep ? 'active' : ''} ${index === currentStep && order.status !== 'COMPLETED' ? 'playback-animation' : ''}">
                                ${index + 1}
                                <span class="status-label">${label}</span>
                            </div>
                        `).join('')}
                    </div>

                    ${driverSection}

                    <div style="margin-top: 25px; font-size: 0.9em;">
                        <strong style="display: block; margin-bottom: 10px; color: #2a5298;">Ordered Items:</strong>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            ${order.items.map(item => `
                                <div style="display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.05); padding: 8px; border-radius: 10px;">
                                    <img src="${item.product.imagePath || ''}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 8px; background: #333;">
                                    <div style="flex: 1;">
                                        <div style="font-weight: bold; color: #fff;">${item.product.name}</div>
                                        <div style="font-size: 0.8em; opacity: 0.7;">Rs. ${item.price.toFixed(2)} each</div>
                                    </div>
                                    <div style="font-weight: bold; color: #89ec8e;">x${item.quantity}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                ordersList.appendChild(orderCard);
            });
        } catch (err) {
            console.error("Orders load error:", err);
            ordersList.innerHTML = '<p style="color: #ff4d4d;">Failed to load orders.</p>';
        }
    }

    loadOrders();
    // Refresh orders periodically
    setInterval(loadOrders, 10000);
});
