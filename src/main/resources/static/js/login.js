// 1. Get references outside of the events
const toggle = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password'); // Fixed: was missing
const loginForm = document.getElementById('loginForm');

// 2. Show / Hide password logic (Moved outside the submit listener)
if (toggle && passwordInput) {
  toggle.addEventListener('click', function() {
    const isPassword = passwordInput.getAttribute('type') === 'password';
    const type = isPassword ? 'text' : 'password';

    passwordInput.setAttribute('type', type);
    // Toggle the icon image
    this.src = isPassword ? 'images/view.png' : 'images/hidden.png';
  });
}

// 3. Login Submission Logic
loginForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  const rawEmail = document.getElementById('email').value.trim();
  const password = passwordInput.value;

  let role = 'customer';
  let email = rawEmail;

  // Handle Admin Prefix
  if (rawEmail.toLowerCase().startsWith('admin:')) {
    role = 'admin';
    email = rawEmail.substring(6).trim();
  }

  const endpoint = role === 'admin' ? '/api/auth/admin/login' : '/api/auth/customer/login';

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      // Migrate guest cart to member cart
      const guestCart = JSON.parse(sessionStorage.getItem('sessionCart'));
      if (guestCart && guestCart.length > 0 && role === 'customer') {
          for (const gItem of guestCart) {
              try {
                  await fetch('/api/cart/add', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                          customerEmail: data.email,
                          productId: gItem.id,
                          quantity: gItem.quantity
                      })
                  });
              } catch (error) {
                  console.error("Failed to migrate cart item:", gItem, error);
              }
          }
          sessionStorage.removeItem('sessionCart');
      }

      // Store user info
      sessionStorage.setItem('loggedInUser', data.email);
      sessionStorage.setItem('userRole', data.role);

      // Redirect based on role
      window.location.href = (data.role === 'admin') ? 'admin.html' : 'order.html';
    } else {
      alert(data.message || 'Login failed');
    }
  } catch (err) {
    console.error('Login error:', err);
    alert('Network error. Is the server running on port 8080?');
  }
});