// common.js

// — Helpers —
function goToLogin(role) {
    localStorage.setItem('selectedRole', role);
    window.location.href = 'login.html';
}
function goBackToRoleSelect() {
    window.location.href = 'index.html';
}
function redirectToRolePage() {
    const role = localStorage.getItem('selectedRole');
    if (role === 'Vice President') return 'vicepresident.html';
    if (role === 'Faculty') return 'faculty.html';
    return 'staff.html';
}
function showView(id) {
    ['dashboard-view', 'leave-view', 'account-view'].forEach(v => {
        const el = document.getElementById(v);
        if (el) el.style.display = v === id ? 'block' : 'none';
    });
    document.querySelectorAll('.sidebar a').forEach(a => {
        a.classList.toggle('active', (a.getAttribute('onclick') || '').includes(id));
    });
}
function logout() {
    localStorage.removeItem('selectedRole');
    window.location.href = 'index.html';
}

// — Main initializer —
document.addEventListener('DOMContentLoaded', () => {
    // Login page logic
    const loginForm = document.querySelector('form[onsubmit*="login"]');
  if (loginForm) {
    loginForm.addEventListener('submit', event => {
      event.preventDefault();
      const userId = document.getElementById('id').value;
      localStorage.setItem('userId', userId);
      window.location.href = redirectToRolePage();
    });
  }

    // Role title on login
    const titleEl = document.getElementById('role-title');
    const role = localStorage.getItem('selectedRole');
    if (titleEl && role) titleEl.innerText = 'Login as ' + role;

    // LOGIN eye-toggle
    const pw = document.getElementById('password');
    const toggle = document.getElementById('togglePassword');
    if (pw && toggle) {
        toggle.addEventListener('click', e => {
            e.preventDefault();
            const hidden = pw.type === 'password';
            pw.type = hidden ? 'text' : 'password';
            toggle.style.opacity = hidden ? '1' : '0.6';
        });
    }

    // ACCOUNT-SETTINGS eye-toggles
    document.querySelectorAll('#account-view .password-wrapper').forEach(w => {
        const inp = w.querySelector('input');
        const btn = w.querySelector('.eye-btn');
        if (!inp || !btn) return;
        btn.addEventListener('click', e => {
            if (btn.disabled) return;
            e.preventDefault();
            const hidden = inp.type === 'password';
            inp.type = hidden ? 'text' : 'password';
            btn.style.opacity = hidden ? '1' : '0.6';
        });
    });

    // Multi-view pages
    if (document.getElementById('dashboard-view')) {
        showView('dashboard-view');
        document.querySelectorAll('.sidebar a').forEach(a => {
            if ((a.getAttribute('onclick') || '').includes('logout')) {
                a.addEventListener('click', e => { e.preventDefault(); logout(); });
            }
        });

        // Prefill account settings
        const roleDisp = document.getElementById('employeeRole');
        const headerId = document.querySelector('#account-view .employee-id');
        const headerName = document.querySelector('#account-view .account-header h1');
        if (roleDisp) roleDisp.value = localStorage.getItem('selectedRole') || '';
        if (headerId) headerId.textContent = 'ID: ' + (localStorage.getItem('userId') || '');
        if (headerName) headerName.textContent = localStorage.getItem('fullName') || headerName.textContent;

        // Edit/Save toggle + disable eye buttons initially
        const editBtn = document.querySelector('.btn-edit');
        const eyeBtns = document.querySelectorAll('#account-view .eye-btn');
        eyeBtns.forEach(b => b.disabled = true);
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                const editing = editBtn.textContent.trim() === 'Edit';
                // toggle fields
                document.querySelectorAll('#account-view .account-form input, #account-view .account-form select')
                    .forEach(f => f.disabled = !editing);
                eyeBtns.forEach(b => b.disabled = !editing);
                editBtn.textContent = editing ? 'Save' : 'Edit';
                if (!editing) {
                    // on Save, persist fullName and update header
                    const fullNameInput = document.getElementById('fullName');
                    if (fullNameInput && headerName) {
                        localStorage.setItem('fullName', fullNameInput.value);
                        headerName.textContent = fullNameInput.value;
                    }
                }
            });
        }

        // Add Email button
        const addEmail = document.querySelector('#account-view .add-email-btn');
        const emailSec = document.querySelector('#account-view .email-section');
        if (addEmail && emailSec) {
            addEmail.addEventListener('click', () => {
                const email = prompt('Enter new email address:');
                if (!email) return;
                const div = document.createElement('div');
                div.className = 'email-item';
                div.innerHTML = `
          <div class="email-left">
            <input type="checkbox" disabled>
            <label>${email}</label>
          </div>
          <span class="email-timestamp">just now</span>
        `;
                emailSec.insertBefore(div, addEmail);
            });
        }
    }
});
