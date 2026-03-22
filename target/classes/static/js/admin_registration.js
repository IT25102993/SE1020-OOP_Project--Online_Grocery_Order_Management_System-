document.getElementById('adminRegisterForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirm = document.getElementById('confirmPassword').value;

  if (password !== confirm) {
    alert('Passwords do not match');
    return;
  }

  const endpoint = '/api/auth/admin/register';
  const body = { email, password };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.success) {
      alert('Admin Registration successful. Please login using the admin: prefix.');
      window.location.href = 'login.html';
    } else {
      alert(data.message || 'Registration failed');
    }
  } catch (err) {
    alert('Network error. Is the server running on port 8080?');
  }
});
