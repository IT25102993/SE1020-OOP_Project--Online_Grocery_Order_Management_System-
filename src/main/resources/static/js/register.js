// 1. Element Selectors
const toggle = document.getElementById('togglePassword');
const passwordInput = document.getElementById('regPassword');
const registerForm = document.getElementById('registerForm');
const btnSendCode = document.getElementById('btnSendCode');
const btnRegister = document.getElementById('btnRegister');
const verificationWrap = document.getElementById('verificationWrap');
const regValidationCode = document.getElementById('regValidationCode');
const timerDisplay = document.getElementById('timerDisplay');

let codeSent = false;
let countdownInterval = null;

// 2. Password Visibility Toggle Logic
if (toggle && passwordInput) {
  toggle.addEventListener('click', function() {
    const isPassword = passwordInput.getAttribute('type') === 'password';
    passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
    this.src = isPassword ? 'images/view.png' : 'images/hidden.png';
  });
}

// 3. Send Verification Code Logic
if (btnSendCode) {
  btnSendCode.addEventListener('click', async function() {
    const email = document.getElementById('regEmail').value.trim();
    if (!email) {
      alert("Please enter your email first.");
      return;
    }

    btnSendCode.disabled = true;
    btnSendCode.textContent = 'Sending...';

    try {
      const res = await fetch('/api/auth/customer/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (data.success) {
        alert("Verification code sent to your email!");
        codeSent = true;
        
        // Show verification input and Register button
        verificationWrap.style.display = 'block';
        btnSendCode.style.display = 'none';
        btnRegister.style.display = 'block';
        
        startTimer(120); // 2 minutes
      } else {
        alert(data.message || "Failed to send code.");
        btnSendCode.disabled = false;
        btnSendCode.textContent = 'Send Verification Code';
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
      btnSendCode.disabled = false;
      btnSendCode.textContent = 'Send Verification Code';
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
      btnRegister.disabled = true;
      alert("Verification code expired. Please refresh to try again.");
    } else {
      updateDisplay(timeLeft);
    }
  }, 1000);
}

// 4. Form Submission Logic
if (registerForm) {
  registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!codeSent) {
      alert("Please send the verification code first.");
      return;
    }

    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const address = document.getElementById('regAddress').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    const verificationCode = regValidationCode.value.trim();

    if (password !== confirm) {
      alert('Passwords do not match');
      return;
    }
    
    if (!verificationCode) {
      alert("Please enter the verification code sent to your email.");
      return;
    }

    const body = { name, email, address, password, verificationCode };
    const endpoint = '/api/auth/customer/register';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (data.success) {
        alert('Registration successful. Please login.');
        window.location.href = 'login.html';
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration Error:', err);
      alert('Network error. Is the server running on port 8080?');
    }
  });
}