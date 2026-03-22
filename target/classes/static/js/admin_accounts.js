document.addEventListener('DOMContentLoaded', async () => {
  const role = sessionStorage.getItem('userRole');
  if (role !== 'admin') {
    alert('Access denied. Admin only.');
    window.location.href = 'login.html';
    return;
  }

  try {
    const res = await fetch('/api/auth/admin/all');
    if (!res.ok) throw new Error('Failed to fetch admin accounts');
    const data = await res.json();
    
    const tbody = document.querySelector('#adminsTable tbody');
    tbody.innerHTML = '';
    
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="1">No admins found.</td></tr>';
      return;
    }

    data.forEach(admin => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${admin.email}</td>`;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    alert('Error loading admin accounts.');
  }
});
