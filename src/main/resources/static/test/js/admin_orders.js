document.addEventListener('DOMContentLoaded', () => {
    const ordersList = document.getElementById('admin-orders-list');
    const addDriverBtn = document.getElementById('add-driver-btn');
    let drivers = [];

    // --- Driver Management ---
    async function loadDrivers() {
        try {
            const res = await fetch('/api/orders/drivers');
            drivers = await res.json();
            renderDrivers(); // Always try to render if list exists
        } catch (err) { console.error("Drivers load error:", err); }
    }

    function renderDrivers() {
        const driverList = document.getElementById('driver-list');
        if (!driverList) return;

        if (drivers.length === 0) {
            driverList.innerHTML = '<p style="color: #666;">No drivers registered yet.</p>';
            return;
        }

        driverList.innerHTML = '';
        drivers.forEach(d => {
            const card = document.createElement('div');
            card.style.cssText = 'background: white; padding: 15px; border-radius: 10px; border-left: 5px solid #23b236; box-shadow: 0 2px 5px rgba(0,0,0,0.05);';
            card.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px;">
                    <i class='bx bxs-user-circle' style="font-size: 40px; color: #2a5298;"></i>
                    <div style="flex: 1;">
                        <h4 style="margin: 0; color: #14284a;">${d.name}</h4>
                        <p style="margin: 5px 0 0; font-size: 13px; color: #666;">
                            <i class='bx bxs-phone' style="font-size: 12px;"></i> ${d.phone}<br>
                            <i class='bx bxs-truck' style="font-size: 12px;"></i> ${d.vehicle} (${d.vehicleNo})
                        </p>
                    </div>
                </div>
            `;
            driverList.appendChild(card);
        });
    }

    if (addDriverBtn) {
        addDriverBtn.addEventListener('click', async () => {
            const name = document.getElementById('driver-name').value;
            const phone = document.getElementById('driver-phone').value;
            const vehicle = document.getElementById('driver-vehicle').value;
            const vNo = document.getElementById('driver-vehicle-no').value;

            if (!name || !phone) { alert("Name and Phone are required"); return; }

            try {
                const res = await fetch('/api/orders/drivers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, phone, vehicle, vehicleNo: vNo })
                });
                if (res.ok) {
                    alert("Driver added!");
                    location.reload();
                }
            } catch (err) { alert("Failed to add driver"); }
        });
    }

    // --- Order Management ---
    const statusFlow = ['REQUESTED', 'PROCESSED', 'DELIVERY_STARTED', 'ARRIVED', 'COMPLETED'];

    async function updateOrderStatus(orderId, newStatus) {
        try {
            const res = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) loadOrders();
        } catch (err) { alert("Failed to update status"); }
    }

    async function assignDriver(orderId, driverId) {
        try {
            const res = await fetch(`/api/orders/${orderId}/assign-driver`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ driverId: parseInt(driverId) })
            });
            if (res.ok) loadOrders();
        } catch (err) { alert("Failed to assign driver"); }
    }

    async function loadOrders() {
        if (!ordersList) return;
        try {
            const res = await fetch('/api/orders');
            const orders = await res.json();
            await loadDrivers();

            if (orders.length === 0) {
                ordersList.innerHTML = '<p>No orders found.</p>';
                return;
            }

            ordersList.innerHTML = '';
            orders.sort((a, b) => b.id - a.id).forEach(order => {
                const card = document.createElement('div');
                card.className = 'order-item-card';
                
                let driverOptions = `<option value="">Select Driver</option>`;
                drivers.forEach(d => {
                    driverOptions += `<option value="${d.id}" ${order.driver && order.driver.id === d.id ? 'selected' : ''}>${d.name} (${d.vehicle})</option>`;
                });

                const nextStatus = statusFlow[statusFlow.indexOf(order.status) + 1];
                const actionBtn = nextStatus ? 
                    `<button class="admin-btn" onclick="window.adminUpdateStatus(${order.id}, '${nextStatus}')">Move to ${nextStatus}</button>` : '';

                const itemsHtml = order.items.map(i => {
                    const imgSrc = i.product.imagePath ? i.product.imagePath : '';
                    return `
                    <div style="display: flex; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f0; gap: 12px;">
                        <img src="${imgSrc}" alt="${i.product.name}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover; background: #f5f5f5;">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: #14284a;">${i.product.name}</div>
                            <div style="font-size: 0.85em; color: #666;">Unit Price: Rs. ${i.price.toFixed(2)}</div>
                        </div>
                        <div style="font-weight: bold; color: #23b236;">x${i.quantity}</div>
                    </div>
                    `;
                }).join('');

                let driverDetailsHtml = '';
                if (order.driver) {
                    driverDetailsHtml = `
                        <div style="background: #f9f9f9; padding: 10px; border-radius: 8px; margin-top: 10px; border-left: 4px solid #2a5298;">
                            <strong>Driver Details:</strong><br>
                            Name: ${order.driver.name}<br>
                            Phone: ${order.driver.phone}<br>
                            Vehicle: ${order.driver.vehicle} (${order.driver.vehicleNo})
                        </div>
                    `;
                }

                const currentStep = statusFlow.indexOf(order.status);
                const statusLabels = [
                    'Order Requested',
                    'Processed',
                    'Delivery Started',
                    'Arrived',
                    'Completed'
                ];

                card.innerHTML = `
                    <div class="order-header" style="${order.status === 'COMPLETED' ? 'justify-content: center; flex-direction: column; text-align: center;' : ''}">
                        <div style="${order.status === 'COMPLETED' ? 'margin-bottom: 15px;' : ''}">
                            <strong>Order #${order.id}</strong> | <span>${order.customer.name} (${order.customer.email})</span><br>
                            <small>${new Date(order.orderDate).toLocaleString()}</small>
                        </div>
                        <span class="status-badge status-${order.status}" style="${order.status === 'COMPLETED' ? 'font-size: 1.2em; padding: 8px 20px;' : ''}">${order.status}</span>
                    </div>

                    <div class="status-track" style="margin-top: 20px; margin-bottom: 30px;">
                        ${statusLabels.map((label, index) => `
                            <div class="step ${index <= currentStep ? 'active' : ''}">
                                ${index + 1}
                                <span class="label">${label}</span>
                            </div>
                        `).join('')}
                    </div>

                    <div style="font-size: 0.9em; margin-bottom: 10px;">
                        <strong>Items:</strong>
                        <div style="margin-top: 5px; background: white; padding: 10px; border-radius: 8px; border: 1px solid #eee;">
                            ${itemsHtml}
                        </div>
                    </div>
                    ${driverDetailsHtml}
                    <div class="order-actions" style="margin-top: 15px;">
                        <strong>Assign/Change Driver:</strong>
                        <select class="driver-select" onchange="window.adminAssignDriver(${order.id}, this.value)">
                            ${driverOptions}
                        </select>
                        ${actionBtn}
                        <strong style="margin-left: auto; color: #23b236; font-size: 1.1em;">Total: Rs. ${order.totalAmount.toFixed(2)}</strong>
                    </div>
                `;
                ordersList.appendChild(card);
            });
        } catch (err) { ordersList.innerHTML = '<p>Error loading orders.</p>'; }
    }

    window.adminUpdateStatus = updateOrderStatus;
    window.adminAssignDriver = assignDriver;

    loadOrders();
    setInterval(loadOrders, 10000); // UI Refresh
});
