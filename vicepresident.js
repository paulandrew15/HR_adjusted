// vicepresident.js
document.addEventListener('DOMContentLoaded', () => {
  const requestList = document.getElementById("request-list");
  if (!requestList) return;

  const roleKey = 'staff'; // VP sees staff requests
  function loadVPRequests() {
    requestList.innerHTML = '';
    Object.keys(localStorage).forEach(key => {
      if (!key.startsWith(`${roleKey}-request-`)) return;
      const req   = JSON.parse(localStorage.getItem(key));
      const date  = key.replace(`${roleKey}-request-`, '');
      const card  = document.createElement('div');
      card.className = 'request-card';
      card.innerHTML = `
        <h3>${date}</h3>
        <p><a href="${req.fileData}" download="${req.fileName}">
             ${req.fileName}
           </a></p>
        <div class="actions">
          <button class="approve" data-key="${key}">Approve</button>
          <button class="deny"    data-key="${key}">Deny</button>
          <span class="status">${req.status}</span>
        </div>`;
      requestList.appendChild(card);
    });
  }

  // delegate approve/deny
  requestList.addEventListener('click', e =>{
    const btn = e.target;
    if (!btn.matches('button.approve, button.deny')) return;
    const key = btn.dataset.key;
    const req = JSON.parse(localStorage.getItem(key));
    req.status = btn.matches('.approve') ? 'approved' : 'denied';
    localStorage.setItem(key, JSON.stringify(req));
    loadVPRequests();
  });

  loadVPRequests();
});
