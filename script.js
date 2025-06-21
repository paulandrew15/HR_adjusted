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
    'Faculty': 'faculty.html',
    'Staff': 'staff.html',
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
  const pwField = document.getElementById('password');
  const toggleBtn = document.getElementById('togglePassword');
  if (pwField && toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isHidden = pwField.type === 'password';
      pwField.type = isHidden ? 'text' : 'password';
      toggleBtn.style.opacity = isHidden ? '1' : '0.6';
      // optional: swap icon with toggleBtn.textContent = isHidden ? '🙈' : '👁';
    });
  }
});

function showView(id) {
  const views = ['dashboard-view', 'leave-view', 'account-view'];
  views.forEach(v => {
    const el = document.getElementById(v);
    if (!el) return;
    el.style.display = (v === id) ? 'block' : 'none';
  });
  // Highlight active sidebar link
  document.querySelectorAll('.sidebar a').forEach(a => {
    const onclick = a.getAttribute('onclick') || '';
    a.classList.toggle('active', onclick.includes(id));
  });
}

// Clears session and goes back to role select
function logout() {
  localStorage.removeItem('selectedRole');
  window.location.href = 'index.html';
}

// =======================
// DOM Ready Wiring
// =======================
document.addEventListener('DOMContentLoaded', () => {

  // 1) If this is the multi-view page, default to dashboard:
  if (document.getElementById('dashboard-view')) {
    showView('dashboard-view');
  }

  // 2) Login page: eye-toggle for #password
  const pwField = document.getElementById('password');
  const togglePw = document.getElementById('togglePassword');
  if (pwField && togglePw) {
    togglePw.addEventListener('click', () => {
      const isHidden = pwField.type === 'password';
      pwField.type = isHidden ? 'text' : 'password';
      togglePw.style.opacity = isHidden ? '1' : '0.6';
    });
  }

  // 3) Account Settings: Edit ↔ Save
  const editBtn = document.querySelector('.btn-edit');
  const accountFields = document.querySelectorAll(
    '#account-view .account-form input, ' +
    '#account-view .account-form select'
  );
  if (editBtn && accountFields.length) {
    // disable all by default
    accountFields.forEach(f => f.disabled = true);

    editBtn.addEventListener('click', () => {
      const nowEditing = editBtn.textContent.trim() === 'Edit';
      // toggle disabled state
      accountFields.forEach(f => f.disabled = !nowEditing);
      // swap label
      editBtn.textContent = nowEditing ? 'Save' : 'Edit';
      if (!nowEditing) {
        // just clicked Save — gather data
        const data = {};
        accountFields.forEach(f => { data[f.id] = f.value; });
        console.log('Account data saved:', data);
        // TODO: POST to server here
      }
    });
  }

  // 4) Account Settings: + Add Email Address
  const addEmailBtn = document.querySelector('#account-view .add-email-btn');
  const emailSection = document.querySelector('#account-view .email-section');
  if (addEmailBtn && emailSection) {
    addEmailBtn.addEventListener('click', () => {
      const email = prompt('Enter new email address:');
      if (!email) return;
      const item = document.createElement('div');
      item.className = 'email-item';
      item.innerHTML = `
        <div class="email-left">
          <input type="checkbox" disabled>
          <label>${email}</label>
        </div>
        <span class="email-timestamp">just now</span>
      `;
      emailSection.insertBefore(item, addEmailBtn);
    });
  }

  // === Weekly‐Quota Calendar Persistence ===
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  // Determine role to namespace keys
  const roleKey = (localStorage.getItem('selectedRole') || 'staff').toLowerCase();

  days.forEach(day => {
    const input = document.getElementById(`quota-${day}`);
    if (!input) return;
    const storageKey = `${roleKey}-quota-${day}`;

    // load saved value or default to 0
    input.value = localStorage.getItem(storageKey) ?? '0';

    // save on change
    input.addEventListener('change', () => {
      localStorage.setItem(storageKey, input.value);
    });
  });
  // inside DOMContentLoaded, after roleKey is set:
  ; (function buildMonthlyCalendar() {
    const calEl = document.getElementById('monthly-calendar');
    if (!calEl) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();                   // 0 = Jan
    const firstDow = new Date(year, month, 1).getDay(); // 0=Sun–6=Sat
    const daysInMon = new Date(year, month + 1, 0).getDate();
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Start building table HTML
    let html = '<table><thead><tr>';
    weekdays.forEach(d => html += `<th>${d}</th>`);
    // using single‐quotes
    html += '</tr></thead><tbody><tr>';

    // Blank cells before day 1
    for (let i = 0; i < firstDow; i++) html += '<td></td>';

    // Fill in each day cell
    for (let day = 1; day <= daysInMon; day++) {
      const key = `${roleKey}-quota-${year}-${month + 1}-${day}`;
      const val = localStorage.getItem(key) || '0';
      html += `<td>
      <div>${day}</div>
      <input type="number" min="0" value="${val}" data-key="${key}">
    </td>`;
      // New row after Saturday
      if ((firstDow + day) % 7 === 0 && day !== daysInMon) {
        html += '</tr><tr>';
      }
    }

    // Blank cells after last day
    const tail = (firstDow + daysInMon) % 7;
    if (tail !== 0) {
      for (let i = tail; i < 7; i++) html += '<td></td>';
    }

    html += '</tr></tbody></table>';
    calEl.innerHTML = html;

    // Wire up persistence
    calEl.querySelectorAll('input[type="number"]').forEach(input => {
      input.addEventListener('change', () => {
        localStorage.setItem(input.dataset.key, input.value);
      });
    });
  })();

  ; (function buildMonthlyCalendar() {
    const calEl = document.getElementById('monthly-calendar');
    const titleEl = document.getElementById('calendar-title');
    if (!calEl || !titleEl) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();       // 0 = Jan
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    // set the header
    titleEl.textContent = `${monthNames[month]} ${year}`;

    const firstDow = new Date(year, month, 1).getDay();      // 0=Sun
    const daysInMon = new Date(year, month + 1, 0).getDate();
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // build table
    let html = '<table><thead><tr>';
    weekdays.forEach(d => html += `<th>${d}</th>`);
    html += '</tr></thead><tbody><tr>';

    // blanks before day 1
    for (let i = 0; i < firstDow; i++) html += '<td></td>';

    for (let day = 1; day <= daysInMon; day++) {
      // storage key per day
      const key = `${roleKey}-quota-${year}-${month + 1}-${day}`;
      const val = localStorage.getItem(key) || '0';

      html += `<td>
      <div>${day}</div>
      <span class="quota-text">${val}</span>
    </td>`;

      // new row every Saturday
      if ((firstDow + day) % 7 === 0 && day !== daysInMon) {
        html += '</tr><tr>';
      }
    }

    // blanks after last day
    const tail = (firstDow + daysInMon) % 7;
    if (tail !== 0) {
      for (let i = tail; i < 7; i++) html += '<td></td>';
    }

    html += '</tr></tbody></table>';
    calEl.innerHTML = html;

    // make the spans editable on click
    calEl.querySelectorAll('.quota-text').forEach(span => {
      span.addEventListener('click', () => {
        const current = span.textContent;
        const input = document.createElement('input');
        // configure the ephemeral input
        input.type = 'number';
        input.min = '0';
        input.value = current;
        input.style.width = '40px';
        // on blur, save back to span & localStorage
        input.addEventListener('blur', () => {
          const newVal = input.value;
          const key = span.parentElement
            .querySelector('input, span')
            .dataset?.key || key;
          span.textContent = newVal;
          localStorage.setItem(key, newVal);
          input.replaceWith(span);
        });
        // swap span → input
        span.replaceWith(input);
        input.focus();
      });
    });

  })();

  // fill in the role display on account-view
  const roleDisplay = document.getElementById('employeeRole');
  const role = localStorage.getItem('selectedRole') || '';
  if (roleDisplay) {
    roleDisplay.value = role;
  }

});

