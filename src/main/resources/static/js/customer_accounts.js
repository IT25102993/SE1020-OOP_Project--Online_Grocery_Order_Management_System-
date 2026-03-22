document.addEventListener('DOMContentLoaded', async () => {
  const role = sessionStorage.getItem('userRole');
  if (role !== 'admin') {
    alert('Access denied. Admin only.');
    window.location.href = 'login.html';
    return;
  }

  try {
    const res = await fetch('/api/auth/customer/all');
    if (!res.ok) throw new Error('Failed to fetch customer accounts');
    const data = await res.json();
    
    const tbody = document.querySelector('#customersTable tbody');
    tbody.innerHTML = '';
    
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3">No customers found.</td></tr>';
      return;
    }

    data.forEach(customer => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${customer.name || '-'}</td>
        <td>${customer.email || '-'}</td>
        <td>${customer.address || '-'}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    alert('Error loading customer accounts.');
  }
});
