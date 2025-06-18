// === helper functions (always available) ===

// Save selected role and go to login
function goToLogin(role) {
  localStorage.setItem('selectedRole', role);
  window.location.href = 'login.html';
}

// Back button handler
function goBackToRoleSelect() {
  window.location.href = 'index.html';
}

// Handle login (no credential check; just redirect)
function login(event) {
  event.preventDefault();
  const role = localStorage.getItem('selectedRole');
  const pageMap = {
    'Vice President': 'vicepresident.html',
    'Faculty'       : 'faculty.html',
    'Staff'         : 'staff.html',
  };
  window.location.href = pageMap[role] || 'index.html';
}

// Logout handler
function logout() {
  localStorage.removeItem('selectedRole');
  window.location.href = 'index.html';
}

// === DOM wiring ===
document.addEventListener('DOMContentLoaded', () => {
  // 1) Set the role title on login page
  if (window.location.pathname.includes('login.html')) {
    const titleEl = document.getElementById('role-title');
    const role = localStorage.getItem('selectedRole');
    if (titleEl && role) {
      titleEl.innerText = 'Login as ' + role;
    }
  }

  // 2) Wire the show/hide password toggle
  const pwField   = document.getElementById('password');
  const toggleBtn = document.getElementById('togglePassword');
  if (pwField && toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isHidden = pwField.type === 'password';
      pwField.type   = isHidden ? 'text' : 'password';
      toggleBtn.style.opacity = isHidden ? '1' : '0.6';
      // optional: swap icon with toggleBtn.textContent = isHidden ? '🙈' : '👁';
    });
  }
});
