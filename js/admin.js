// ========== ADMIN PANEL JS (MongoDB API) ==========

document.addEventListener('DOMContentLoaded', () => {
  // ========== ONBOARDING PARTICLES ==========
  function createOnboardingParticles() {
    const container = document.getElementById('onboardingParticles');
    if (!container) return;
    for (let i = 0; i < 40; i++) {
      const p = document.createElement('div');
      p.className = 'ob-particle';
      const size = Math.random() * 4 + 1;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDuration = (Math.random() * 20 + 15) + 's';
      p.style.animationDelay = (Math.random() * 15) + 's';
      container.appendChild(p);
    }
  }
  createOnboardingParticles();

  // ========== TOAST ==========
  function toast(msg, type = 'success') {
    const c = document.getElementById('toastContainer');
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${msg}`;
    c.appendChild(t);
    setTimeout(() => { t.classList.add('fade-out'); setTimeout(() => t.remove(), 300); }, 3000);
  }

  // ========== CONFIRM ==========
  function confirmDialog(title, msg) {
    return new Promise((resolve) => {
      const m = document.getElementById('confirmModal');
      document.getElementById('confirmTitle').textContent = title;
      document.getElementById('confirmMessage').textContent = msg;
      m.classList.add('active');
      const close = () => { m.classList.remove('active'); resolve(false); };
      document.getElementById('confirmOk').onclick = () => { m.classList.remove('active'); resolve(true); };
      document.getElementById('confirmCancel').onclick = close;
      m.onclick = (e) => { if (e.target === m) close(); };
    });
  }

  // ========== AUTH SCREEN ==========
  const authScreen = document.getElementById('authScreen');
  const authChoice = document.getElementById('authChoice');
  const loginFormWrap = document.getElementById('loginFormWrap');
  const signupFormWrap = document.getElementById('signupFormWrap');
  const signupSuccess = document.getElementById('signupSuccess');
  const adminDashboard = document.getElementById('adminDashboard');
  const obData = {};

  // Show auth screen by default, hide if session is valid
  authScreen.style.display = 'flex';

  // Check session on page load
  fetch('/api/auth/me').then(r => r.json()).then(data => {
    if (data.id) {
      if (data.role === 'admin') showDashboard();
      else { window.location.href = 'shop.html'; }
    }
  }).catch(() => {});
  document.getElementById('showLoginCard')?.addEventListener('click', () => {
    authChoice.style.display = 'none';
    loginFormWrap.style.display = 'flex';
    signupFormWrap.style.display = 'none';
    signupSuccess.style.display = 'none';
    setTimeout(() => document.getElementById('loginUser')?.focus(), 200);
  });

  // Navigate to signup form
  document.getElementById('showSignupCard')?.addEventListener('click', () => {
    authChoice.style.display = 'none';
    loginFormWrap.style.display = 'none';
    signupFormWrap.style.display = 'flex';
    signupSuccess.style.display = 'none';
    setTimeout(() => document.getElementById('ob_name')?.focus(), 200);
  });

  // Admin login shortcut
  document.getElementById('showAdminLogin')?.addEventListener('click', (e) => {
    e.preventDefault();
    authChoice.style.display = 'none';
    loginFormWrap.style.display = 'flex';
    signupFormWrap.style.display = 'none';
    signupSuccess.style.display = 'none';
    setTimeout(() => document.getElementById('loginUser')?.focus(), 200);
  });

  // Back buttons
  document.getElementById('loginBack')?.addEventListener('click', () => {
    loginFormWrap.style.display = 'none';
    authChoice.style.display = 'flex';
    document.getElementById('loginError')?.classList.remove('show');
  });

  document.getElementById('signupBack')?.addEventListener('click', () => {
    signupFormWrap.style.display = 'none';
    authChoice.style.display = 'flex';
    document.getElementById('signupError')?.classList.remove('show');
  });

  // Category selection in signup
  document.querySelectorAll('#obCategoryOptions .ob-option').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#obCategoryOptions .ob-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      obData.category = btn.dataset.value;
    });
  });

  // Password match hint
  document.getElementById('ob_confirm')?.addEventListener('input', (e) => {
    const hint = document.getElementById('obPassMatch');
    const pass = document.getElementById('ob_password')?.value;
    if (!hint) return;
    if (e.target.value && e.target.value === pass) {
      hint.textContent = 'Passwords match!';
      hint.className = 'onboard-hint success';
    } else if (e.target.value) {
      hint.textContent = 'Passwords do not match';
      hint.className = 'onboard-hint error';
    } else {
      hint.textContent = '';
      hint.className = 'onboard-hint';
    }
  });

  // Shake animation
  function shakeInput(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.animation = 'none'; el.offsetHeight;
    el.style.animation = 'shake 0.4s ease';
    el.style.borderColor = 'rgba(225, 112, 85, 0.6)';
    setTimeout(() => { el.style.borderColor = ''; el.style.animation = ''; }, 600);
  }

  const shakeStyle = document.createElement('style');
  shakeStyle.textContent = `@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }`;
  document.head.appendChild(shakeStyle);

  // Signup form submit
  document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('ob_name').value.trim();
    const shop = document.getElementById('ob_shop').value.trim();
    const phone = document.getElementById('ob_phone').value.trim();
    const pass = document.getElementById('ob_password').value;
    const confirm = document.getElementById('ob_confirm').value;

    if (!name) { shakeInput('ob_name'); return; }
    if (!shop) { shakeInput('ob_shop'); return; }
    if (!obData.category) {
      document.getElementById('signupError').innerHTML = '<i class="fas fa-exclamation-circle"></i> Please select a category.';
      document.getElementById('signupError').classList.add('show');
      return;
    }
    if (!phone) { shakeInput('ob_phone'); return; }
    if (!pass || pass.length < 4) { shakeInput('ob_password'); return; }
    if (pass !== confirm) { shakeInput('ob_confirm'); return; }

    document.getElementById('signupError')?.classList.remove('show');

    try {
      const username = name.toLowerCase().replace(/\s/g, '');
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, name, shop, category: obData.category, phone, password: pass })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      // Also create the shop in the DB
      await DB.addShop({
        name: shop, owner: name, category: obData.category,
        phone: phone, address: '', description: '', image: '',
        status: 'active', plan: 'basic'
      });

      signupFormWrap.style.display = 'none';
      signupSuccess.style.display = 'flex';
      e.target.reset();
      document.querySelectorAll('#obCategoryOptions .ob-option').forEach(b => b.classList.remove('selected'));
      obData.category = null;
      toast('Shop registered successfully!');
    } catch (err) {
      document.getElementById('signupError').innerHTML = '<i class="fas fa-exclamation-circle"></i> ' + err.message;
      document.getElementById('signupError').classList.add('show');
    }
  });

  // Go to login from success
  document.getElementById('goToLoginFromSuccess')?.addEventListener('click', () => {
    signupSuccess.style.display = 'none';
    loginFormWrap.style.display = 'flex';
    document.getElementById('loginUser')?.focus();
  });

  // ========== LOGIN ==========
  document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUser').value;
    const password = document.getElementById('loginPass').value;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      document.getElementById('loginError').classList.remove('show');
      if (data.role === 'admin') {
        showDashboard();
      } else {
        window.location.href = 'shop.html';
      }
    } catch (err) {
      document.getElementById('loginError').innerHTML = '<i class="fas fa-exclamation-circle"></i> ' + err.message;
      document.getElementById('loginError').classList.add('show');
    }
  });

  function showDashboard() {
    authScreen.style.display = 'none';
    adminDashboard.style.display = 'flex';
    loadAll();
  }

  document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
    e.preventDefault();
    await fetch('/api/auth/logout', { method: 'POST' });
    location.reload();
  });

  // ========== PASSWORD TOGGLE ==========
  document.getElementById('togglePass')?.addEventListener('click', function() {
    const input = document.getElementById('loginPass');
    const icon = this.querySelector('i');
    if (input.type === 'password') { input.type = 'text'; icon.classList.replace('fa-eye', 'fa-eye-slash'); }
    else { input.type = 'password'; icon.classList.replace('fa-eye-slash', 'fa-eye'); }
  });

  // ========== FORGOT PASSWORD ==========
  const forgotModal = document.getElementById('forgotModal');
  document.querySelector('.forgot-pass')?.addEventListener('click', (e) => {
    e.preventDefault();
    forgotModal.classList.add('active');
    document.getElementById('forgotFormStep1').style.display = 'block';
    document.getElementById('forgotFormStep2').style.display = 'none';
    document.getElementById('forgotFormStep3').style.display = 'none';
  });
  document.getElementById('forgotClose')?.addEventListener('click', () => forgotModal.classList.remove('active'));
  forgotModal?.addEventListener('click', (e) => { if (e.target === forgotModal) forgotModal.classList.remove('active'); });

  document.getElementById('forgotSendBtn')?.addEventListener('click', async () => {
    const emailOrUser = document.getElementById('forgotEmail').value.trim();
    if (!emailOrUser) { document.getElementById('forgotEmail').style.borderColor = 'var(--red)'; return; }
    try {
      const res = await fetch('/api/auth/forgot-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: emailOrUser })
      });
      if (!res.ok) throw new Error();
      sessionStorage.setItem('sl_reset_user', emailOrUser);
      document.getElementById('forgotFormStep1').style.display = 'none';
      document.getElementById('forgotFormStep2').style.display = 'block';
    } catch (err) { toast('No account found', 'error'); }
  });

  document.getElementById('forgotDoneBtn')?.addEventListener('click', () => {
    document.getElementById('forgotFormStep2').style.display = 'none';
    document.getElementById('forgotFormStep3').style.display = 'block';
  });

  document.getElementById('forgotResetBtn')?.addEventListener('click', async () => {
    const newPass = document.getElementById('forgotNewPass').value;
    const confirmPass = document.getElementById('forgotConfirmPass').value;
    const resetUser = sessionStorage.getItem('sl_reset_user');
    if (newPass.length < 4) { toast('Min 4 characters', 'error'); return; }
    if (newPass !== confirmPass) { toast('Passwords do not match', 'error'); return; }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: resetUser, password: newPass })
      });
      if (!res.ok) throw new Error();
      sessionStorage.removeItem('sl_reset_user');
      forgotModal.classList.remove('active');
      toast('Password reset! You can now login.');
    } catch (err) {
      toast('Failed to reset password', 'error');
    }
  });

  // ========== SIDEBAR NAV ==========
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  const tabs = document.querySelectorAll('.admin-tab');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.dataset.tab;
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      tabs.forEach(t => t.classList.remove('active'));
      document.getElementById(`tab-${tab}`)?.classList.add('active');
      document.getElementById('sidebar').classList.remove('active');
      document.getElementById('sidebarOverlay')?.classList.remove('active');
    });
  });
  document.getElementById('menuToggle')?.addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
  });
  document.getElementById('sidebarOverlay')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('active');
    document.getElementById('sidebarOverlay')?.classList.remove('active');
  });
  document.getElementById('sidebarCollapse')?.addEventListener('click', () => document.getElementById('sidebar').classList.toggle('collapsed'));

  // ========== HELPERS ==========
  function timeAgo(date) {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  }

  function relativeDay(dateStr) {
    const today = new Date(); today.setHours(0,0,0,0);
    const d = new Date(dateStr); d.setHours(0,0,0,0);
    const diff = Math.round((d - today) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  }

  // ========== DASHBOARD ==========
  async function loadDashboard() {
    try {
      const [shops, inquiries, testimonials, tasks, events] = await Promise.all([
        DB.getShops(), DB.getInquiries(), DB.getTestimonials(), DB.getTasks(), DB.getEvents()
      ]);

      document.getElementById('totalShops').textContent = shops.length;
      document.getElementById('activeShops').textContent = shops.filter(s => s.status === 'active').length;
      document.getElementById('totalInquiries').textContent = inquiries.length;
      document.getElementById('totalTestimonials').textContent = testimonials.length;

      // Agenda
      const today = new Date().toISOString().split('T')[0];
      const todayEvents = events.filter(e => e.date === today);
      document.getElementById('agendaDate').textContent = relativeDay(today);
      const agendaList = document.getElementById('agendaList');
      agendaList.innerHTML = todayEvents.length > 0 ? todayEvents.map(e => `
        <div class="agenda-item"><span class="agenda-time">${e.time}</span><span class="agenda-badge badge-${e.type}">${e.type}</span><span class="agenda-text">${e.title}</span></div>
      `).join('') : '<p style="color:var(--text-muted);font-size:0.85rem;padding:20px 0;">No events today.</p>';

      // Tasks overview
      const totalTasks = tasks.length;
      const openTasks = tasks.filter(t => !t.done).length;
      const doneTasks = tasks.filter(t => t.done).length;
      const openPct = totalTasks ? Math.round((openTasks / totalTasks) * 100) : 0;
      const donePct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;
      document.getElementById('tasksOverviewSub').textContent = `${totalTasks} tasks total`;
      document.getElementById('tasksOpenCount').textContent = openTasks;
      document.getElementById('tasksDoneCount').textContent = doneTasks;
      document.getElementById('tasksOverdueCount').textContent = 0;
      document.getElementById('tasksOpenPct').textContent = openPct + '%';
      document.getElementById('tasksDonePct').textContent = donePct + '%';
      document.getElementById('tasksOverduePct').textContent = '0%';
      document.getElementById('progressOpen').style.width = openPct + '%';
      document.getElementById('progressDone').style.width = donePct + '%';

      // Activity
      const activities = [];
      shops.slice(0, 3).forEach(s => activities.push({ type: 'shop', title: s.name, desc: s.category, badge: s.status, time: s.createdAt }));
      inquiries.slice(0, 3).forEach(i => activities.push({ type: 'inquiry', title: i.shopName, desc: i.ownerName, badge: 'new', time: i.createdAt }));
      testimonials.slice(0, 3).forEach(t => activities.push({ type: 'review', title: `${t.name} → ${t.shop}`, desc: '★'.repeat(t.rating), badge: 'complete', time: t.createdAt }));
      tasks.slice(0, 4).forEach(t => activities.push({ type: 'task', title: t.title, desc: t.description || '', badge: t.done ? 'complete' : 'open', time: t.createdAt }));
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));

      const icons = { shop: 'fa-store', inquiry: 'fa-envelope', review: 'fa-star', task: 'fa-check-circle' };
      const badgeLabels = { active: 'Active', pending: 'Pending', inactive: 'Inactive', new: 'New', open: 'Open', complete: 'Done' };
      document.getElementById('activityList').innerHTML = activities.slice(0, 8).map(a => `
        <div class="activity-item">
          <div class="activity-icon icon-${a.type}"><i class="fas ${icons[a.type]}"></i></div>
          <div class="activity-info"><div class="activity-title">${a.title}</div><div class="activity-desc">${a.desc}</div></div>
          <span class="activity-badge badge-${a.badge}">${badgeLabels[a.badge] || a.badge}</span>
          <span class="activity-time">${timeAgo(a.time)}</span>
        </div>
      `).join('');
    } catch (err) { console.error('Dashboard load error:', err); }
  }

  // ========== SHOPS ==========
  async function loadShops(filter = '', statusFilter = 'all') {
    try {
      let shops = await DB.getShops();
      if (filter) shops = shops.filter(s => s.name.toLowerCase().includes(filter) || s.owner.toLowerCase().includes(filter));
      if (statusFilter !== 'all') shops = shops.filter(s => s.status === statusFilter);
      document.getElementById('shopsTable').innerHTML = shops.map(s => `
        <tr>
          <td><strong>${s.name}</strong></td><td>${s.owner}</td><td>${s.category}</td><td>${s.phone}</td>
          <td><span class="status-badge status-active">${s.plan}</span></td>
          <td><span class="status-badge status-${s.status}">${s.status}</span></td>
          <td class="table-actions">
            <button class="btn-edit" onclick="editShop('${s._id}')"><i class="fas fa-pen"></i></button>
            <button class="btn-delete" onclick="deleteShop('${s._id}')"><i class="fas fa-trash"></i></button>
          </td>
        </tr>
      `).join('');
    } catch (err) { console.error('Shops load error:', err); }
  }

  document.getElementById('shopSearch')?.addEventListener('input', (e) => loadShops(e.target.value.toLowerCase()));
  document.getElementById('shopStatusFilter')?.addEventListener('change', (e) => loadShops('', e.target.value));

  window.deleteShop = async function(id) {
    if (await confirmDialog('Delete Shop', 'Are you sure?')) {
      await DB.deleteShop(id); loadShops(); loadDashboard(); toast('Shop deleted');
    }
  };

  const sfm = document.getElementById('shopFormModal');
  async function populateCats() {
    try {
      const cats = await DB.getCategories();
      document.getElementById('sf_category').innerHTML = '<option value="">Select</option>' + cats.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    } catch (e) {}
  }

  document.getElementById('addShopBtn')?.addEventListener('click', async () => {
    document.getElementById('shopFormTitle').textContent = 'Add New Shop';
    document.getElementById('editShopId').value = '';
    document.getElementById('shopForm').reset();
    await populateCats();
    sfm.classList.add('active');
  });

  window.editShop = async function(id) {
    const s = await DB.getShop(id);
    if (!s) return;
    document.getElementById('shopFormTitle').textContent = 'Edit Shop';
    document.getElementById('editShopId').value = id;
    await populateCats();
    ['name', 'owner', 'category', 'phone', 'address', 'description', 'image', 'status', 'plan'].forEach(f => {
      const el = document.getElementById('sf_' + f); if (el) el.value = s[f] || '';
    });
    sfm.classList.add('active');
  };

  [document.getElementById('shopFormClose'), document.getElementById('shopFormCancel')].forEach(b => b?.addEventListener('click', () => sfm.classList.remove('active')));
  sfm?.addEventListener('click', (e) => { if (e.target === sfm) sfm.classList.remove('active'); });

  document.getElementById('shopForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const editId = document.getElementById('editShopId').value;
    const data = {};
    ['name', 'owner', 'category', 'phone', 'address', 'description', 'image', 'status', 'plan'].forEach(f => data[f] = document.getElementById('sf_' + f).value);
    try {
      if (editId) { await DB.updateShop(editId, data); toast('Shop updated'); }
      else { await DB.addShop(data); toast('Shop added'); }
      sfm.classList.remove('active'); loadShops(); loadDashboard();
    } catch (err) { toast('Error: ' + err.message, 'error'); }
  });

  // ========== CATEGORIES ==========
  async function loadCategories() {
    try {
      const cats = await DB.getCategories();
      const shops = await DB.getShops();
      document.getElementById('categoriesGrid').innerHTML = cats.map(c => {
        const count = shops.filter(s => s.category === c.name).length;
        return `<div class="category-card"><div class="cat-actions"><button class="btn-edit" onclick="editCategory('${c._id}')"><i class="fas fa-pen"></i></button><button class="btn-delete" onclick="deleteCategory('${c._id}')"><i class="fas fa-trash"></i></button></div><div class="cat-icon"><i class="${c.icon}"></i></div><h4>${c.name}</h4><p class="cat-count">${count} shop${count !== 1 ? 's' : ''}</p></div>`;
      }).join('');
    } catch (e) {}
  }

  const cfm = document.getElementById('categoryFormModal');
  document.getElementById('addCategoryBtn')?.addEventListener('click', () => {
    document.getElementById('categoryFormTitle').textContent = 'Add Category';
    document.getElementById('editCategoryId').value = '';
    document.getElementById('categoryForm').reset();
    cfm.classList.add('active');
  });

  window.editCategory = function(id) {
    document.getElementById('categoryFormTitle').textContent = 'Edit Category';
    document.getElementById('editCategoryId').value = id;
    cfm.classList.add('active');
  };

  window.deleteCategory = async function(id) {
    if (await confirmDialog('Delete Category', 'Delete this category?')) {
      await DB.deleteCategory(id); loadCategories(); toast('Category deleted');
    }
  };

  [document.getElementById('categoryFormClose'), document.getElementById('categoryFormCancel')].forEach(b => b?.addEventListener('click', () => cfm.classList.remove('active')));
  cfm?.addEventListener('click', (e) => { if (e.target === cfm) cfm.classList.remove('active'); });

  document.getElementById('categoryForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const editId = document.getElementById('editCategoryId').value;
    const data = { name: document.getElementById('cf_name').value, icon: document.getElementById('cf_icon').value || 'fas fa-tag' };
    try {
      if (editId) { await DB.updateCategory(editId, data); toast('Category updated'); }
      else { await DB.addCategory(data); toast('Category added'); }
      cfm.classList.remove('active'); loadCategories();
    } catch (err) { toast('Error', 'error'); }
  });

  // ========== INQUIRIES ==========
  async function loadInquiries() {
    try {
      const items = await DB.getInquiries();
      document.getElementById('inquiriesTable').innerHTML = items.map(i => `
        <tr><td><strong>${i.shopName}</strong></td><td>${i.ownerName}</td><td>${i.phone}</td><td>${i.category}</td><td>${new Date(i.createdAt).toLocaleDateString()}</td>
        <td class="table-actions"><button class="btn-delete" onclick="deleteInquiry('${i._id}')"><i class="fas fa-trash"></i></button></td></tr>
      `).join('');
    } catch (e) {}
  }

  window.deleteInquiry = async function(id) {
    if (await confirmDialog('Delete Inquiry', 'Delete this?')) {
      await DB.deleteInquiry(id); loadInquiries(); loadDashboard(); toast('Deleted');
    }
  };

  // ========== TASKS ==========
  async function loadTasks() {
    try {
      const tasks = await DB.getTasks();
      document.getElementById('tasksList').innerHTML = tasks.map(t => `
        <div class="task-item">
          <button class="task-check ${t.done ? 'done' : ''}" onclick="toggleTask('${t._id}', ${!t.done})">${t.done ? '<i class="fas fa-check"></i>' : ''}</button>
          <div class="task-info"><div class="task-title ${t.done ? 'done' : ''}">${t.title}</div><div class="task-meta">${t.description || ''}${t.dueDate ? ' · Due ' + relativeDay(t.dueDate) : ''}</div></div>
          <span class="task-priority priority-${t.priority}">${t.priority}</span>
          <div class="table-actions"><button class="btn-edit" onclick="editTask('${t._id}')"><i class="fas fa-pen"></i></button><button class="btn-delete" onclick="deleteTask('${t._id}')"><i class="fas fa-trash"></i></button></div>
        </div>
      `).join('');
    } catch (e) {}
  }

  window.toggleTask = async function(id, done) { await DB.updateTask(id, { done }); loadTasks(); loadDashboard(); };
  window.editTask = function(id) { document.getElementById('taskFormTitle').textContent = 'Edit Task'; document.getElementById('editTaskId').value = id; document.getElementById('taskFormModal').classList.add('active'); };

  window.deleteTask = async function(id) {
    if (await confirmDialog('Delete Task', 'Delete?')) {
      await DB.deleteTask(id); loadTasks(); loadDashboard(); toast('Deleted');
    }
  };

  const tfm = document.getElementById('taskFormModal');
  document.getElementById('addTaskBtn')?.addEventListener('click', () => {
    document.getElementById('taskFormTitle').textContent = 'Add Task';
    document.getElementById('editTaskId').value = '';
    document.getElementById('taskForm').reset();
    tfm.classList.add('active');
  });
  [document.getElementById('taskFormClose'), document.getElementById('taskFormCancel')].forEach(b => b?.addEventListener('click', () => tfm.classList.remove('active')));
  tfm?.addEventListener('click', (e) => { if (e.target === tfm) tfm.classList.remove('active'); });

  document.getElementById('taskForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const editId = document.getElementById('editTaskId').value;
    const data = { title: document.getElementById('tf_title').value, description: document.getElementById('tf_desc').value, priority: document.getElementById('tf_priority').value, dueDate: document.getElementById('tf_due').value, done: false };
    try {
      if (editId) { await DB.updateTask(editId, data); toast('Task updated'); }
      else { await DB.addTask(data); toast('Task added'); }
      tfm.classList.remove('active'); loadTasks(); loadDashboard();
    } catch (err) { toast('Error', 'error'); }
  });

  // ========== CALENDAR ==========
  let calMonth = new Date().getMonth(), calYear = new Date().getFullYear();
  async function loadCalendar() {
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    document.getElementById('calMonth').textContent = `${monthNames[calMonth]} ${calYear}`;
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const today = new Date();
    let events = [];
    try { events = await DB.getEvents(); } catch (e) {}
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    let html = days.map(d => `<div class="cal-header">${d}</div>`).join('');
    for (let i = 0; i < firstDay; i++) html += '<div class="cal-day empty"></div>';
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const isToday = d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
      const hasEvent = events.some(e => e.date === dateStr);
      html += `<div class="cal-day${isToday ? ' today' : ''}">${d}${hasEvent ? '<div class="cal-dot"></div>' : ''}</div>`;
    }
    document.getElementById('calendarGrid').innerHTML = html;
  }

  document.getElementById('calPrev')?.addEventListener('click', () => { calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; } loadCalendar(); });
  document.getElementById('calNext')?.addEventListener('click', () => { calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; } loadCalendar(); });

  // ========== NOTES ==========
  async function loadNotes() {
    try {
      const notes = await DB.getNotes();
      document.getElementById('notesGrid').innerHTML = notes.map(n => `
        <div class="note-card"><div class="note-stripe" style="background:${n.color}"></div>
        <div class="note-actions"><button class="btn-edit" onclick="editNote('${n._id}')"><i class="fas fa-pen"></i></button><button class="btn-delete" onclick="deleteNote('${n._id}')"><i class="fas fa-trash"></i></button></div>
        <h4>${n.title}</h4><p>${(n.content || '').replace(/\n/g, '<br>')}</p><div class="note-date">${new Date(n.createdAt).toLocaleDateString()}</div></div>
      `).join('');
    } catch (e) {}
  }

  window.editNote = function(id) { document.getElementById('noteFormTitle').textContent = 'Edit Note'; document.getElementById('editNoteId').value = id; document.getElementById('noteFormModal').classList.add('active'); };
  window.deleteNote = async function(id) { if (await confirmDialog('Delete Note', 'Delete?')) { await DB.deleteNote(id); loadNotes(); toast('Deleted'); } };

  const nfm = document.getElementById('noteFormModal');
  document.getElementById('addNoteBtn')?.addEventListener('click', () => {
    document.getElementById('noteFormTitle').textContent = 'Add Note';
    document.getElementById('editNoteId').value = '';
    document.getElementById('noteForm').reset();
    nfm.classList.add('active');
  });
  [document.getElementById('noteFormClose'), document.getElementById('noteFormCancel')].forEach(b => b?.addEventListener('click', () => nfm.classList.remove('active')));
  nfm?.addEventListener('click', (e) => { if (e.target === nfm) nfm.classList.remove('active'); });

  document.getElementById('noteForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const editId = document.getElementById('editNoteId').value;
    const data = { title: document.getElementById('nf_title').value, content: document.getElementById('nf_content').value, color: document.querySelector('input[name="noteColor"]:checked')?.value || '#6c5ce7' };
    try {
      if (editId) { await DB.updateNote(editId, data); toast('Note updated'); }
      else { await DB.addNote(data); toast('Note added'); }
      nfm.classList.remove('active'); loadNotes();
    } catch (err) { toast('Error', 'error'); }
  });

  // ========== TESTIMONIALS ==========
  async function loadTestimonials() {
    try {
      const items = await DB.getTestimonials();
      document.getElementById('testimonialsTable').innerHTML = items.map(t => `
        <tr><td><strong>${t.name}</strong></td><td>${t.shop}</td><td>${'★'.repeat(t.rating)}${'☆'.repeat(5-t.rating)}</td><td>${t.review.substring(0, 50)}...</td>
        <td class="table-actions"><button class="btn-edit" onclick="editTestimonial('${t._id}')"><i class="fas fa-pen"></i></button><button class="btn-delete" onclick="deleteTestimonial('${t._id}')"><i class="fas fa-trash"></i></button></td></tr>
      `).join('');
    } catch (e) {}
  }

  const ttm = document.getElementById('testimonialFormModal');
  document.getElementById('addTestimonialBtn')?.addEventListener('click', () => {
    document.getElementById('testimonialFormTitle').textContent = 'Add Testimonial';
    document.getElementById('editTestimonialId').value = '';
    document.getElementById('testimonialForm').reset();
    ttm.classList.add('active');
  });

  window.editTestimonial = function(id) { document.getElementById('testimonialFormTitle').textContent = 'Edit Testimonial'; document.getElementById('editTestimonialId').value = id; ttm.classList.add('active'); };
  window.deleteTestimonial = async function(id) { if (await confirmDialog('Delete Review', 'Delete?')) { await DB.deleteTestimonial(id); loadTestimonials(); loadDashboard(); toast('Deleted'); } };

  [document.getElementById('testimonialFormClose'), document.getElementById('testimonialFormCancel')].forEach(b => b?.addEventListener('click', () => ttm.classList.remove('active')));
  ttm?.addEventListener('click', (e) => { if (e.target === ttm) ttm.classList.remove('active'); });

  document.getElementById('testimonialForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const editId = document.getElementById('editTestimonialId').value;
    const data = { name: document.getElementById('tf_name').value, shop: document.getElementById('tf_shop').value, rating: parseInt(document.getElementById('tf_rating').value), review: document.getElementById('tf_review').value };
    try {
      if (editId) { await DB.updateTestimonial(editId, data); toast('Updated'); }
      else { await DB.addTestimonial(data); toast('Added'); }
      ttm.classList.remove('active'); loadTestimonials(); loadDashboard();
    } catch (err) { toast('Error', 'error'); }
  });

  // ========== CUSTOMERS ==========
  async function loadCustomers() {
    try {
      const shops = await DB.getShops();
      document.getElementById('customersTable').innerHTML = shops.map(s => `
        <tr><td><strong>${s.owner}</strong></td><td>${s.name}</td><td>${s.category}</td><td>${s.phone}</td><td>${new Date(s.createdAt).toLocaleDateString()}</td></tr>
      `).join('');
    } catch (e) {}
  }

  // ========== ANALYTICS ==========
  async function loadAnalytics() {
    try {
      const [shops, inquiries] = await Promise.all([DB.getShops(), DB.getInquiries()]);
      const catMap = {}; shops.forEach(s => { catMap[s.category] = (catMap[s.category] || 0) + 1; });
      const maxCat = Math.max(...Object.values(catMap), 1);
      document.getElementById('analyticsCategories').innerHTML = Object.entries(catMap).map(([n, c]) => `<div class="analytics-row"><span class="analytics-label">${n}</span><div class="analytics-bar-wrap"><div class="analytics-bar" style="width:${(c/maxCat)*100}%"></div></div><span class="analytics-count">${c}</span></div>`).join('') || '<p style="color:var(--text-muted)">No data</p>';

      const planMap = {}; shops.forEach(s => { planMap[s.plan] = (planMap[s.plan] || 0) + 1; });
      const maxPlan = Math.max(...Object.values(planMap), 1);
      document.getElementById('analyticsPlans').innerHTML = Object.entries(planMap).map(([n, c]) => `<div class="analytics-row"><span class="analytics-label">${n}</span><div class="analytics-bar-wrap"><div class="analytics-bar" style="width:${(c/maxPlan)*100}%;background:var(--green)"></div></div><span class="analytics-count">${c}</span></div>`).join('') || '<p style="color:var(--text-muted)">No data</p>';

      document.getElementById('analyticsSignups').innerHTML = shops.slice(0, 5).map(s => `<div class="analytics-row"><span class="analytics-label">${s.name}</span><span style="font-size:0.8rem;color:var(--text-muted)">${new Date(s.createdAt).toLocaleDateString()}</span></div>`).join('') || '<p style="color:var(--text-muted)">No data</p>';

      const inqMap = {}; inquiries.forEach(i => { inqMap[i.category] = (inqMap[i.category] || 0) + 1; });
      const maxInq = Math.max(...Object.values(inqMap), 1);
      document.getElementById('analyticsInquiries').innerHTML = Object.entries(inqMap).map(([n, c]) => `<div class="analytics-row"><span class="analytics-label">${n}</span><div class="analytics-bar-wrap"><div class="analytics-bar" style="width:${(c/maxInq)*100}%;background:var(--orange)"></div></div><span class="analytics-count">${c}</span></div>`).join('') || '<p style="color:var(--text-muted)">No data</p>';
    } catch (e) {}
  }

  // ========== SETTINGS ==========
  document.getElementById('changePasswordForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: document.getElementById('newPass').value })
      });
      e.target.reset(); toast('Password changed');
    } catch (err) { toast('Error', 'error'); }
  });

  document.getElementById('resetDataBtn')?.addEventListener('click', async () => {
    if (await confirmDialog('Reset Data', 'Reset all data to defaults?')) {
      toast('Data reset - restart server to seed');
    }
  });

  // ========== AGENDA NAV ==========
  let agendaDate = new Date();
  async function updateAgenda() {
    const dateStr = agendaDate.toISOString().split('T')[0];
    document.getElementById('agendaDate').textContent = relativeDay(dateStr);
    try {
      const events = await DB.getEvents();
      const dayEvents = events.filter(e => e.date === dateStr);
      document.getElementById('agendaList').innerHTML = dayEvents.length > 0 ? dayEvents.map(e => `<div class="agenda-item"><span class="agenda-time">${e.time}</span><span class="agenda-badge badge-${e.type}">${e.type}</span><span class="agenda-text">${e.title}</span></div>`).join('') : '<p style="color:var(--text-muted);font-size:0.85rem;padding:20px 0;">No events.</p>';
    } catch (e) {}
  }

  document.getElementById('agendaPrev')?.addEventListener('click', () => { agendaDate.setDate(agendaDate.getDate() - 1); updateAgenda(); });
  document.getElementById('agendaNext')?.addEventListener('click', () => { agendaDate.setDate(agendaDate.getDate() + 1); updateAgenda(); });
  document.getElementById('agendaToday')?.addEventListener('click', () => { agendaDate = new Date(); updateAgenda(); });

  // ========== GLOBAL SEARCH ==========
  document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); document.getElementById('globalSearch')?.focus(); } });

  // ========== ANNOUNCEMENTS ==========
  document.getElementById('announcementForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('announceTitle').value.trim();
    const message = document.getElementById('announceMessage').value.trim();
    const color = document.getElementById('announceColor').value;
    if (!title || !message) return;
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, color })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast('Announcement broadcasted to all channels!');
      document.getElementById('announceTitle').value = '';
      document.getElementById('announceMessage').value = '';
    } catch (err) {
      toast('Failed: ' + err.message, 'error');
    }
  });

  document.getElementById('testDiscordBtn')?.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/announcements/test', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast('Test notification sent!', 'success');
    } catch (err) {
      toast('Test failed: ' + err.message, 'error');
    }
  });

  // ========== ANNOUNCEMENTS TAB ==========
  document.getElementById('announcementFormTab')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('announceTitleTab').value.trim();
    const message = document.getElementById('announceMessageTab').value.trim();
    const color = document.getElementById('announceColorTab').value;
    if (!title || !message) return;
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, color })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast('Announcement broadcasted to all channels!');
      document.getElementById('announceTitleTab').value = '';
      document.getElementById('announceMessageTab').value = '';
    } catch (err) {
      toast('Failed: ' + err.message, 'error');
    }
  });

  document.getElementById('testDiscordBtnTab')?.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/announcements/test', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast('Test notification sent to bot-tester-feed!', 'success');
    } catch (err) {
      toast('Test failed: ' + err.message, 'error');
    }
  });

  // Load channel list
  async function loadChannels() {
    try {
      const res = await fetch('/api/announcements/channels');
      const channels = await res.json();
      const list = document.getElementById('channelList');
      if (!list) return;
      list.innerHTML = channels.map(ch => `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--bg);border-radius:8px;border:1px solid var(--border);">
          <span style="width:8px;height:8px;border-radius:50%;background:${ch.configured ? 'var(--green)' : 'var(--red)'};flex-shrink:0;"></span>
          <span style="font-size:0.85rem;font-weight:500;">#${ch.name}</span>
          <span style="font-size:0.75rem;color:var(--text-muted);margin-left:auto;">${ch.configured ? 'Connected' : 'Not configured'}</span>
        </div>
      `).join('');
    } catch (err) {}
  }
  loadChannels();

  // ========== LOAD ALL ==========
  async function loadAll() {
    await Promise.all([
      loadDashboard(), loadShops(), loadCategories(), loadInquiries(),
      loadTasks(), loadCalendar(), loadNotes(), loadTestimonials(),
      loadCustomers(), loadAnalytics(), loadChannels()
    ]);
  }

  loadAll();
});
