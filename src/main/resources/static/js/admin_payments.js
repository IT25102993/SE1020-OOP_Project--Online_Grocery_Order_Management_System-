document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('payments-table-body');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const totalRevenue = document.getElementById('total-revenue');
    const totalPaid = document.getElementById('total-paid');
    const totalPending = document.getElementById('total-pending');

    let allPayments = [];

    async function loadPayments() {
        if (!tableBody) return;
        try {
            const res = await fetch('/api/payments');
            allPayments = await res.json();
            updateStats(allPayments);
            // Re-apply active filter
            const activeFilter = document.querySelector('.filter-btn.active');
            const filter = activeFilter ? activeFilter.dataset.filter : 'all';
            const filtered = filter === 'all' ? allPayments : allPayments.filter(p => p.status === filter);
            renderTable(filtered);
        } catch (err) {
            tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#ff4d4d;">Failed to load payments.</td></tr>';
        }
    }

    function updateStats(payments) {
        const revenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const paid = payments.filter(p => p.status === 'PAID').length;
        const pending = payments.filter(p => p.status === 'PENDING').length;
        if (totalRevenue) totalRevenue.textContent = 'Rs. ' + revenue.toFixed(2);
        if (totalPaid) totalPaid.textContent = paid;
        if (totalPending) totalPending.textContent = pending;
    }

    function renderTable(payments) {
        if (!tableBody) return;
        if (payments.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center;opacity:0.6;padding:30px;">No payments found.</td></tr>';
            return;
        }
        tableBody.innerHTML = payments.map(p => {
            let dateStr = p.paymentDate;
            if (Array.isArray(p.paymentDate)) {
                const [y, m, d, hr, min, sec] = p.paymentDate;
                dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(hr).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec || 0).padStart(2, '0')}`;
            }
            const date = dateStr ? new Date(dateStr).toLocaleString() : '—';
            const methodBadge = p.paymentMethod === 'CARD'
                ? `<span class="method-badge card" title="${p.cardName ? 'Name: ' + p.cardName : ''}\n${p.cardNumber ? 'Card: ' + p.cardNumber : ''}\n${p.cardExpiry ? 'Exp: ' + p.cardExpiry : ''}"><i class='bx bxs-credit-card'></i> CARD${p.cardBank ? ' — ' + p.cardBank : ''}</span>`
                : `<span class="method-badge cod"><i class='bx bx-money'></i> COD</span>`;
            const statusBadge = p.status === 'PAID'
                ? `<span class="pay-status paid">✔ PAID</span>`
                : `<span class="pay-status pending">⏳ PENDING</span>`;
            const toggleBtn = p.status === 'PAID'
                ? `<button class="toggle-btn pending-btn" onclick="window.togglePayment(${p.id}, 'PENDING')">Mark Pending</button>`
                : `<button class="toggle-btn paid-btn" onclick="window.togglePayment(${p.id}, 'PAID')">Mark as Paid</button>`;
            return `
                <tr>
                    <td>#${p.id}</td>
                    <td>#${p.order ? p.order.id : '—'}</td>
                    <td>${p.order && p.order.customer ? p.order.customer.name : '—'}</td>
                    <td>${p.order && p.order.customer ? p.order.customer.email : '—'}</td>
                    <td><strong>Rs. ${(p.amount || 0).toFixed(2)}</strong></td>
                    <td>${methodBadge}</td>
                    <td>${statusBadge}</td>
                    <td>${date}</td>
                    <td>${toggleBtn}</td>
                </tr>
            `;
        }).join('');
    }

    window.togglePayment = async function(id, newStatus) {
        try {
            const res = await fetch(`/api/payments/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const result = await res.json();
            if (result.success) {
                loadPayments();
            } else {
                alert('Failed: ' + (result.message || 'Unknown error'));
            }
        } catch (err) {
            alert('Network error. Please try again.');
        }
    };

    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            const filtered = filter === 'all' ? allPayments : allPayments.filter(p => p.status === filter);
            renderTable(filtered);
        });
    });

    loadPayments();
    setInterval(loadPayments, 15000);
});
