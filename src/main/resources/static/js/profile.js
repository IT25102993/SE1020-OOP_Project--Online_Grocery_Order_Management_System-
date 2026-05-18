document.addEventListener('DOMContentLoaded', async () => {
    const emailInput = document.getElementById('profile-email');
    const nameInput = document.getElementById('profile-name');
    const addressInput = document.getElementById('profile-address');
    const profileForm = document.getElementById('profile-form');
    const message = document.getElementById('profile-message');
    
    const displayName = document.getElementById('display-name');
    const displayEmail = document.getElementById('display-email');
    const profileImg = document.getElementById('profile-img');
    const avatarContainer = document.getElementById('avatar-container');
    const profileUpload = document.getElementById('profile-upload');
    const membershipBadge = document.getElementById('membership-badge');
    const membershipSelect = document.getElementById('profile-membership');

    const currentUserEmail = sessionStorage.getItem('loggedInUser');
    if (!currentUserEmail) {
        window.location.href = 'login.html';
        return;
    }

    let originalName = '';
    let originalAddress = '';
    let originalMembership = '';
    let hasPaidPremium = false;

    const verificationWrap = document.getElementById('verification-wrap');
    const profileCodeInput = document.getElementById('profile-code');
    const btnSendCode = document.getElementById('btn-send-code');
    const btnSave = document.getElementById('btn-save');
    const timerDisplay = document.getElementById('profile-timer');

    let countdownInterval = null;

    // Load current data
    async function fetchUserData() {
        try {
            const res = await fetch(`/api/customer/by-email/${encodeURIComponent(currentUserEmail)}`);
            if (res.ok) {
                const user = await res.json();
                emailInput.value = user.email;
                nameInput.value = user.name || '';
                addressInput.value = user.address || '';
                displayName.textContent = user.name || 'User';
                displayEmail.textContent = user.email;
                
                originalName = user.name || '';
                originalAddress = user.address || '';
                originalMembership = user.customerType || 'REGULAR';
                
                if (user.profilePicture) {
                    profileImg.src = user.profilePicture;
                } else {
                    profileImg.src = 'images/profile_avatar.png';
                }

                // Render Badge and Select Dropdown
                if (user.customerType === 'PREMIUM') {
                    if (membershipBadge) {
                        membershipBadge.textContent = 'freshmartGOLD (Premium)';
                        membershipBadge.className = 'badge-gold';
                    }
                    if (membershipSelect) membershipSelect.value = 'PREMIUM';
                } else {
                    if (membershipBadge) {
                        membershipBadge.textContent = 'freshmartSilver (Regular)';
                        membershipBadge.className = 'badge-silver';
                    }
                    if (membershipSelect) membershipSelect.value = 'REGULAR';
                }
                
                checkEdits();
            }
        } catch (err) {
            console.error("User data fetch error:", err);
        }
    }

    await fetchUserData();

    // --- Profile Picture Upload ---
    avatarContainer.addEventListener('click', () => {
        profileUpload.click();
    });

    profileUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('email', currentUserEmail);
        formData.append('image', file);

        try {
            message.textContent = 'Uploading picture...';
            message.style.color = '#2a5298';

            const res = await fetch('/api/customer/upload-profile-pic', {
                method: 'POST',
                body: formData
            });

            const result = await res.json();
            if (result.success) {
                profileImg.src = result.imagePath + '?t=' + new Date().getTime();
                message.textContent = 'Profile picture updated!';
                message.style.color = '#1fa831';
            } else {
                message.textContent = result.message || 'Upload failed.';
                message.style.color = '#ff4d4d';
            }
        } catch (err) {
            console.error("Upload error:", err);
            message.textContent = 'Network error during upload.';
            message.style.color = '#ff4d4d';
        }
    });

    // --- Edit checks & Premium Upgrade Flow ---
    function checkEdits() {
        const nameChanged = nameInput.value !== originalName;
        const addressChanged = addressInput.value !== originalAddress;
        const membershipChanged = membershipSelect.value !== originalMembership;

        if (verificationWrap.style.display === 'block') {
            btnSendCode.style.display = 'none';
        } else if (nameChanged || addressChanged || membershipChanged) {
            btnSendCode.style.display = 'block';
        } else {
            btnSendCode.style.display = 'none';
        }
    }

    nameInput.addEventListener('input', checkEdits);
    addressInput.addEventListener('input', checkEdits);
    
    if (membershipSelect) {
        membershipSelect.addEventListener('change', (e) => {
            const selectedValue = e.target.value;
            if (selectedValue === 'PREMIUM' && originalMembership !== 'PREMIUM' && !hasPaidPremium) {
                openPaymentModal();
            } else {
                checkEdits();
            }
        });
    }

    // Modal elements
    const paymentModal = document.getElementById('payment-modal');
    const paymentForm = document.getElementById('payment-form');
    const btnClosePayment = document.getElementById('btn-close-payment');
    const payStatus = document.getElementById('payment-status-message');

    const cardNameInput = document.getElementById('card-name');
    const cardNumberInput = document.getElementById('card-number');
    const cardExpiryInput = document.getElementById('card-expiry');
    const cardCvvInput = document.getElementById('card-cvv');

    const previewName = document.getElementById('preview-card-name');
    const previewNumber = document.getElementById('preview-card-number');
    const previewExpiry = document.getElementById('preview-card-expiry');

    function openPaymentModal() {
        paymentModal.style.display = 'flex';
        payStatus.innerHTML = '';
        paymentForm.style.display = 'block';
        
        cardNameInput.value = '';
        cardNumberInput.value = '';
        cardExpiryInput.value = '';
        cardCvvInput.value = '';
        
        previewName.textContent = 'CARDHOLDER NAME';
        previewNumber.textContent = '•••• •••• •••• ••••';
        previewExpiry.textContent = 'MM/YY';
    }

    function closePaymentModal() {
        paymentModal.style.display = 'none';
        if (!hasPaidPremium) {
            membershipSelect.value = originalMembership;
        }
        checkEdits();
    }

    if (btnClosePayment) {
        btnClosePayment.addEventListener('click', closePaymentModal);
    }

    if (cardNameInput) {
        cardNameInput.addEventListener('input', (e) => {
            previewName.textContent = e.target.value.toUpperCase() || 'CARDHOLDER NAME';
        });
    }

    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            let formatted = '';
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    formatted += ' ';
                }
                formatted += value[i];
            }
            e.target.value = formatted;
            previewNumber.textContent = formatted || '•••• •••• •••• ••••';
        });
    }

    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 2) {
                e.target.value = value.substring(0, 2) + '/' + value.substring(2, 4);
            } else {
                e.target.value = value;
            }
            previewExpiry.textContent = e.target.value || 'MM/YY';
        });
    }

    if (paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nameVal = cardNameInput.value.trim();
            const numVal = cardNumberInput.value.replace(/\s/g, '');
            const expVal = cardExpiryInput.value.trim();
            const cvvVal = cardCvvInput.value.trim();

            if (!nameVal || numVal.length < 16 || expVal.length < 5 || cvvVal.length < 3) {
                payStatus.style.color = '#ff4d4d';
                payStatus.textContent = 'Please enter valid credit card details.';
                return;
            }

            paymentForm.style.display = 'none';
            payStatus.style.color = '#1fa831';
            payStatus.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <i class='bx bx-loader-alt bx-spin' style='font-size: 3em; color: #e5a900;'></i>
                    <p style="margin-top: 15px; font-weight: 600; color: #14284a;">Processing Card Payment...</p>
                </div>
            `;

            setTimeout(() => {
                hasPaidPremium = true;
                payStatus.innerHTML = `
                    <div style="text-align: center; padding: 10px;">
                        <div class="success-checkmark">
                            <div class="check-icon">
                                <span class="icon-line line-tip"></span>
                                <span class="icon-line line-long"></span>
                            </div>
                        </div>
                        <h4 style="color: #1fa831; margin-top: 15px; font-weight: bold;">Rs. 1,500.00 Paid Successfully!</h4>
                        <p style="color: #666; font-size: 0.9em; margin-top: 5px;">Your FreshMart premium upgrade is unlocked.</p>
                    </div>
                `;
                
                setTimeout(() => {
                    paymentModal.style.display = 'none';
                    membershipSelect.value = 'PREMIUM';
                    checkEdits();
                }, 2500);

            }, 2000);
        });
    }

    // --- Verification Code Logic ---
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
            customerType: membershipSelect ? membershipSelect.value : 'REGULAR',
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
                message.style.color = '#1fa831';
                message.innerText = 'Profile updated successfully!';
                verificationWrap.style.display = 'none';
                
                // Hide Send OTP button because changes are successfully saved
                btnSendCode.style.display = 'none';
                btnSendCode.disabled = false;
                btnSendCode.innerText = 'Send Verification Code';
                btnSave.style.display = 'none';
                if (countdownInterval) clearInterval(countdownInterval);
                timerDisplay.textContent = '';
                
                // Save new values as original baseline references
                originalName = updateData.name;
                originalAddress = updateData.address;
                originalMembership = updateData.customerType;
                hasPaidPremium = false;
                
                displayName.textContent = updateData.name;

                // Update badge immediately without full reload
                if (updateData.customerType === 'PREMIUM') {
                    if (membershipBadge) {
                        membershipBadge.textContent = 'freshmartGOLD (Premium)';
                        membershipBadge.className = 'badge-gold';
                    }
                } else {
                    if (membershipBadge) {
                        membershipBadge.textContent = 'freshmartSilver (Regular)';
                        membershipBadge.className = 'badge-silver';
                    }
                }
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
                ordersList.innerHTML = '<p style="opacity: 0.6; text-align: center; padding: 20px;">You have no orders yet.</p>';
                return;
            }

            // Keep track of which orders were expanded
            const expandedOrders = new Set();
            document.querySelectorAll('.order-card.active').forEach(card => {
                expandedOrders.add(card.dataset.orderId);
            });

            ordersList.innerHTML = '';
            orders.forEach(order => {
                const currentStep = statusMap[order.status] || 0;
                let orderDateStr = order.orderDate;
                if (Array.isArray(order.orderDate)) {
                    const [y, m, d, hr, min, sec] = order.orderDate;
                    orderDateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(hr).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec || 0).padStart(2, '0')}`;
                }
                const orderDate = orderDateStr ? new Date(orderDateStr).toLocaleString() : '—';
                const isExpanded = expandedOrders.has(order.id.toString());
                
                let driverSection = '';
                if (order.driver && currentStep >= statusMap['DELIVERY_STARTED']) {
                    driverSection = `
                        <div class="driver-box">
                            <i class='bx bxs-truck'></i>
                            <div class="driver-info">
                                <h5>Driver Assigned: ${order.driver.name}</h5>
                                <p>Phone: ${order.driver.phone} | Vehicle: ${order.driver.vehicle} (${order.driver.vehicleNo})</p>
                            </div>
                        </div>
                    `;
                }

                const orderCard = document.createElement('div');
                orderCard.className = `order-card ${isExpanded ? 'active' : ''}`;
                orderCard.dataset.orderId = order.id;
                orderCard.innerHTML = `
                    <div class="order-header" onclick="this.parentElement.classList.toggle('active')">
                        <div class="order-info">
                            <h4>Order #${order.id}</h4>
                            <span>Ordered on ${orderDate}</span>
                        </div>
                        <div class="order-amount">
                            <strong>Rs. ${order.totalAmount.toFixed(2)}</strong>
                            <i class='bx bx-chevron-down toggle-icon'></i>
                        </div>
                    </div>

                    <div class="order-details">
                        <div class="status-track">
                            ${statusLabels.map((label, index) => `
                                <div class="step ${index <= currentStep ? 'active' : ''}">
                                    ${index + 1}
                                    <span class="label">${label}</span>
                                </div>
                            `).join('')}
                        </div>

                        ${driverSection}

                        <div class="items-list">
                            <h5>Ordered Items</h5>
                            ${order.items.map(item => `
                                <div class="item-row">
                                    <img src="${item.product.imagePath || 'images/default-product.png'}">
                                    <div class="item-info">
                                        <h6>${item.product.name}</h6>
                                        <span>Rs. ${item.price.toFixed(2)} each</span>
                                    </div>
                                    <div class="item-qty">x${item.quantity}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                ordersList.appendChild(orderCard);
            });
        } catch (err) {
            console.error("Orders load error:", err);
            ordersList.innerHTML = '<p style="color: #ff4d4d; text-align: center;">Failed to load orders.</p>';
        }
    }

    loadOrders();
    // Refresh orders periodically
    setInterval(loadOrders, 10000);
});
