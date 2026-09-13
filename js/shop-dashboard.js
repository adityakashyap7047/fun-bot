// ========== SHOP OWNER DASHBOARD - PLAN-BASED ==========

document.addEventListener('DOMContentLoaded', () => {

  // ========== IMAGE UPLOAD HELPERS ==========
  window.switchImageTab = function(prefix, tab) {
    document.querySelectorAll(`.image-upload-tabs .img-tab`).forEach(t => t.classList.remove('active'));
    document.querySelector(`#${prefix}-upload-tab`).parentElement.parentElement.querySelector(`.img-tab[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(`${prefix}-upload-tab`).style.display = tab === 'upload' ? 'block' : 'none';
    document.getElementById(`${prefix}-url-tab`).style.display = tab === 'url' ? 'block' : 'none';
  };

  window.handleFilePreview = function(input, prefix) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById(`${prefix}-preview-img`).src = e.target.result;
      document.getElementById(`${prefix}-preview`).style.display = 'block';
      input.closest('.file-upload-area').style.display = 'none';
    };
    reader.readAsDataURL(file);
  };

  window.removePreview = function(prefix) {
    document.getElementById(`${prefix}-preview`).style.display = 'none';
    document.getElementById(`${prefix}-preview-img`).src = '';
    document.getElementById(`${prefix}-file`).value = '';
    document.getElementById(`${prefix}-upload-tab`).querySelector('.file-upload-area').style.display = 'flex';
  };

  async function uploadFile(fileInput) {
    if (!fileInput || !fileInput.files[0]) return null;
    const form = new FormData();
    form.append('image', fileInput.files[0]);
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data.url;
  }

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

  function shakeInput(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.animation = 'none'; el.offsetHeight;
    el.style.animation = 'shake 0.4s ease';
    setTimeout(() => { el.style.animation = ''; }, 600);
  }

  const shakeStyle = document.createElement('style');
  shakeStyle.textContent = `@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }`;
  document.head.appendChild(shakeStyle);

  // ========== PLAN DEFINITIONS ==========
  const PLANS = {
    basic: {
      label: 'Basic', price: 99, color: 'var(--text-dim)',
      features: [
        { name: 'Shop listing on website', icon: 'fas fa-store', active: true },
        { name: 'Contact information display', icon: 'fas fa-phone', active: true },
        { name: 'Basic profile customization', icon: 'fas fa-id-card', active: true },
        { name: 'Customer reviews (view only)', icon: 'fas fa-star', active: true },
        { name: 'Social media promotion', icon: 'fas fa-share-alt', active: false },
        { name: 'Advanced analytics', icon: 'fas fa-chart-line', active: false },
        { name: 'Priority listing', icon: 'fas fa-sort-amount-up', active: false },
        { name: 'Multiple shop listings', icon: 'fas fa-layer-group', active: false },
        { name: 'Custom branding', icon: 'fas fa-palette', active: false },
        { name: 'Newsletter promotion', icon: 'fas fa-newspaper', active: false },
        { name: 'Dedicated support', icon: 'fas fa-headset', active: false }
      ],
      navTabs: ['overview', 'myshop', 'reviews', 'settings']
    },
    pro: {
      label: 'Pro', price: 299, color: 'var(--primary)',
      features: [
        { name: 'Shop listing on website', icon: 'fas fa-store', active: true },
        { name: 'Contact information display', icon: 'fas fa-phone', active: true },
        { name: 'Basic profile customization', icon: 'fas fa-id-card', active: true },
        { name: 'Customer reviews (view & respond)', icon: 'fas fa-star', active: true },
        { name: 'Social media promotion (2/month)', icon: 'fas fa-share-alt', active: true },
        { name: 'Advanced analytics & insights', icon: 'fas fa-chart-line', active: true },
        { name: 'Priority listing placement', icon: 'fas fa-sort-amount-up', active: true },
        { name: 'Featured shop badge', icon: 'fas fa-award', active: true },
        { name: 'Multiple shop listings', icon: 'fas fa-layer-group', active: false },
        { name: 'Custom branding', icon: 'fas fa-palette', active: false },
        { name: 'Dedicated support', icon: 'fas fa-headset', active: false }
      ],
      navTabs: ['overview', 'myshop', 'promotions', 'analytics', 'reviews', 'settings']
    },
    enterprise: {
      label: 'Enterprise', price: 499, color: 'var(--orange)',
      features: [
        { name: 'Shop listing on website', icon: 'fas fa-store', active: true },
        { name: 'Contact information display', icon: 'fas fa-phone', active: true },
        { name: 'Full profile customization', icon: 'fas fa-id-card', active: true },
        { name: 'Customer reviews (full management)', icon: 'fas fa-star', active: true },
        { name: 'Social media promotion (unlimited)', icon: 'fas fa-share-alt', active: true },
        { name: 'Advanced analytics & insights', icon: 'fas fa-chart-line', active: true },
        { name: 'Top priority listing', icon: 'fas fa-sort-amount-up', active: true },
        { name: 'Featured shop badge', icon: 'fas fa-award', active: true },
        { name: 'Multiple shop listings (up to 5)', icon: 'fas fa-layer-group', active: true },
        { name: 'Custom branding & logo', icon: 'fas fa-palette', active: true },
        { name: 'Newsletter promotion (10K+ subs)', icon: 'fas fa-newspaper', active: true },
        { name: 'Local TV/Radio mentions', icon: 'fas fa-tv', active: true },
        { name: 'Dedicated account manager', icon: 'fas fa-headset', active: true }
      ],
      navTabs: ['overview', 'myshop', 'promotions', 'analytics', 'reviews', 'multishop', 'branding', 'support', 'settings']
    }
  };

  // ========== AUTH STATE ==========
  const authScreen = document.getElementById('authScreen');
  const authChoice = document.getElementById('authChoice');
  const loginFormWrap = document.getElementById('loginFormWrap');
  const signupFormWrap = document.getElementById('signupFormWrap');
  const signupSuccess = document.getElementById('signupSuccess');
  const shopDashboard = document.getElementById('shopDashboard');
  const obData = {};
  let currentShop = null;
  let currentUser = null;

  authScreen.style.display = 'flex';

  // Check session
  fetch('/api/auth/me').then(r => r.json()).then(data => {
    if (data.id) {
      if (data.role === 'admin') { window.location.href = 'admin.html'; return; }
      currentUser = data;
      loadDashboard();
    }
  }).catch(() => {});

  // ========== AUTH UI ==========
  document.getElementById('showLoginCard')?.addEventListener('click', () => {
    authChoice.style.display = 'none';
    loginFormWrap.style.display = 'flex';
    signupFormWrap.style.display = 'none';
    signupSuccess.style.display = 'none';
    setTimeout(() => document.getElementById('loginUser')?.focus(), 200);
  });

  document.getElementById('showSignupCard')?.addEventListener('click', () => {
    authChoice.style.display = 'none';
    loginFormWrap.style.display = 'none';
    signupFormWrap.style.display = 'flex';
    signupSuccess.style.display = 'none';
    setTimeout(() => document.getElementById('ob_name')?.focus(), 200);
  });

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

  // Category selection
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
    if (e.target.value && e.target.value === pass) { hint.textContent = 'Passwords match!'; hint.className = 'onboard-hint success'; }
    else if (e.target.value) { hint.textContent = 'Passwords do not match'; hint.className = 'onboard-hint error'; }
    else { hint.textContent = ''; hint.className = 'onboard-hint'; }
  });

  // Signup
  document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('ob_name').value.trim();
    const shop = document.getElementById('ob_shop').value.trim();
    const phone = document.getElementById('ob_phone').value.trim();
    const address = document.getElementById('ob_address').value.trim();
    const image = document.getElementById('ob_image').value.trim();
    const pass = document.getElementById('ob_password').value;
    const confirm = document.getElementById('ob_confirm').value;

    if (!name) { shakeInput('ob_name'); return; }
    if (!shop) { shakeInput('ob_shop'); return; }
    if (!obData.category) { document.getElementById('signupError').innerHTML = '<i class="fas fa-exclamation-circle"></i> Please select a category.'; document.getElementById('signupError').classList.add('show'); return; }
    if (!phone) { shakeInput('ob_phone'); return; }
    if (!address) { shakeInput('ob_address'); return; }
    if (!pass || pass.length < 8) { shakeInput('ob_password'); document.getElementById('signupError').innerHTML = '<i class="fas fa-exclamation-circle"></i> Password must be at least 8 characters with uppercase, lowercase, and a number.'; document.getElementById('signupError').classList.add('show'); return; }
    if (!/[A-Z]/.test(pass) || !/[a-z]/.test(pass) || !/[0-9]/.test(pass)) { shakeInput('ob_password'); document.getElementById('signupError').innerHTML = '<i class="fas fa-exclamation-circle"></i> Password must contain uppercase, lowercase, and a number.'; document.getElementById('signupError').classList.add('show'); return; }
    if (pass !== confirm) { shakeInput('ob_confirm'); return; }

    document.getElementById('signupError')?.classList.remove('show');

    try {
      const username = name.toLowerCase().replace(/\s/g, '');
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, name, shop, category: obData.category, phone, password: pass })
      });
      const regData = await regRes.json();
      if (!regRes.ok) throw new Error(regData.error || 'Registration failed');
      let imageUrl = document.getElementById('ob_image').value.trim();
      const obFile = document.getElementById('ob_file');
      if (obFile.files[0]) {
        imageUrl = await uploadFile(obFile);
      }
      await DB.addShop({ name: shop, owner: name, category: obData.category, phone, address, description: '', image: imageUrl || '', status: 'active', plan: 'basic' });
      signupFormWrap.style.display = 'none';
      signupSuccess.style.display = 'flex';
      e.target.reset();
      document.querySelectorAll('#obCategoryOptions .ob-option').forEach(b => b.classList.remove('selected'));
      obData.category = null;
      toast('Shop registered successfully!');
    } catch (err) {
      const msg = err.message === 'Failed to fetch'
        ? 'Cannot connect to server. Make sure the server is running (node server.js) and you are accessing via http://localhost:5000/shop'
        : err.message;
      document.getElementById('signupError').innerHTML = '<i class="fas fa-exclamation-circle"></i> ' + msg;
      document.getElementById('signupError').classList.add('show');
    }
  });

  document.getElementById('goToLoginFromSuccess')?.addEventListener('click', () => {
    signupSuccess.style.display = 'none';
    loginFormWrap.style.display = 'flex';
    document.getElementById('loginUser')?.focus();
  });

  // Login
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
      if (data.role === 'admin') { window.location.href = 'admin.html'; return; }
      currentUser = data;
      loadDashboard();
    } catch (err) {
      const msg = err.message === 'Failed to fetch'
        ? 'Cannot connect to server. Make sure the server is running (node server.js) and you are accessing via http://localhost:5000/shop'
        : err.message;
      document.getElementById('loginError').innerHTML = '<i class="fas fa-exclamation-circle"></i> ' + msg;
      document.getElementById('loginError').classList.add('show');
    }
  });

  document.getElementById('togglePass')?.addEventListener('click', function() {
    const input = document.getElementById('loginPass');
    const icon = this.querySelector('i');
    if (input.type === 'password') { input.type = 'text'; icon.classList.replace('fa-eye', 'fa-eye-slash'); }
    else { input.type = 'password'; icon.classList.replace('fa-eye-slash', 'fa-eye'); }
  });

  document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
    e.preventDefault();
    await fetch('/api/auth/logout', { method: 'POST' });
    location.reload();
  });

  // ========== FORGOT PASSWORD ==========
  const forgotModal = document.getElementById('forgotModal');
  document.getElementById('forgotPassLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    forgotModal.classList.add('active');
    document.getElementById('forgotFormStep1').style.display = 'block';
    document.getElementById('forgotFormStep2').style.display = 'none';
    document.getElementById('forgotFormStep3').style.display = 'none';
    document.getElementById('forgotUsername').value = '';
  });
  document.getElementById('forgotClose')?.addEventListener('click', () => forgotModal.classList.remove('active'));
  forgotModal?.addEventListener('click', (e) => { if (e.target === forgotModal) forgotModal.classList.remove('active'); });

  document.getElementById('forgotSendBtn')?.addEventListener('click', async () => {
    const username = document.getElementById('forgotUsername').value.trim();
    if (!username) { document.getElementById('forgotUsername').style.borderColor = 'var(--red)'; return; }
    try {
      const res = await fetch('/api/auth/forgot-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      if (!res.ok) throw new Error();
      sessionStorage.setItem('sl_reset_user', username);
      document.getElementById('forgotFormStep1').style.display = 'none';
      document.getElementById('forgotFormStep2').style.display = 'block';
    } catch (err) { toast('No account found', 'error'); }
  });

  document.getElementById('forgotResetBtn')?.addEventListener('click', async () => {
    const newPass = document.getElementById('forgotNewPass').value;
    const confirmPass = document.getElementById('forgotConfirmPass').value;
    const resetUser = sessionStorage.getItem('sl_reset_user');
    if (newPass.length < 8) { toast('Min 8 characters required', 'error'); return; }
    if (!/[A-Z]/.test(newPass) || !/[a-z]/.test(newPass) || !/[0-9]/.test(newPass)) { toast('Password must contain uppercase, lowercase, and a number', 'error'); return; }
    if (newPass !== confirmPass) { toast('Passwords do not match', 'error'); return; }
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: resetUser, password: newPass })
      });
      if (!res.ok) throw new Error();
      sessionStorage.removeItem('sl_reset_user');
      document.getElementById('forgotFormStep2').style.display = 'none';
      document.getElementById('forgotFormStep3').style.display = 'block';
    } catch (err) {
      toast('Failed to reset password', 'error');
    }
  });

  document.getElementById('forgotDoneBtn')?.addEventListener('click', () => {
    forgotModal.classList.remove('active');
    document.getElementById('loginUser')?.focus();
  });

  // ========== LOAD DASHBOARD ==========
  async function loadDashboard() {
    authScreen.style.display = 'none';
    shopDashboard.style.display = 'flex';

    try {
      const shops = await DB.getShops();
      currentShop = shops.find(s => s.owner === currentUser.name || s.owner.toLowerCase().replace(/\s/g, '') === currentUser.username);
      if (!currentShop) { toast('Shop not found. Please contact admin.', 'error'); return; }

      const plan = currentShop.plan || 'basic';
      const planDef = PLANS[plan] || PLANS.basic;

      // Update header
      document.getElementById('shopBrandName').textContent = currentShop.name;
      document.getElementById('shopAvatar').textContent = currentShop.name.charAt(0);
      document.getElementById('topbarLogoIcon').textContent = currentShop.name.charAt(0);
      document.getElementById('shopPlanBadge').textContent = planDef.label;
      document.getElementById('shopPlanBadge').className = 'brand-status plan-' + plan;
      document.getElementById('topbarPlanBadge').textContent = planDef.label;
      document.getElementById('topbarPlanBadge').className = 'plan-badge-top ' + plan;
      document.getElementById('topbarAvatar').textContent = currentShop.owner.charAt(0);

      // Restrict sidebar nav by plan
      restrictNav(plan);
      // Load all sections
      loadOverview(currentShop, plan);
      loadShopProfile(currentShop, plan);
      loadPromotions(plan);
      loadAnalytics(plan);
      loadReviews(currentShop, plan);
      loadMultiShop(plan);
      loadBranding(plan);
      loadSupport(plan);
      loadSettings(currentShop);

    } catch (err) {
      console.error('Dashboard load error:', err);
      toast('Failed to load dashboard', 'error');
    }
  }

  // ========== NAV RESTRICTION ==========
  function restrictNav(plan) {
    const navItems = document.querySelectorAll('#sidebarNav .nav-item');
    const planOrder = { basic: 0, pro: 1, enterprise: 2 };
    const userLevel = planOrder[plan] || 0;

    navItems.forEach(item => {
      const requiredPlan = item.dataset.plan;
      if (requiredPlan) {
        const reqLevel = planOrder[requiredPlan] || 0;
        if (userLevel < reqLevel) {
          item.style.opacity = '0.3';
          item.style.pointerEvents = 'none';
          item.title = `Requires ${requiredPlan} plan`;
        } else {
          item.style.opacity = '1';
          item.style.pointerEvents = 'auto';
          item.title = '';
        }
      }
    });
  }

  // ========== OVERVIEW ==========
  async function loadOverview(shop, plan) {
    const planDef = PLANS[plan] || PLANS.basic;
    const views = shop.views || 0;
    const inquiries = shop.inquiryCount || 0;
    const rating = plan === 'enterprise' ? '4.8' : plan === 'pro' ? '4.5' : '4.2';

    // Plan banner
    const bannerEl = document.getElementById('planBanner');
    if (plan === 'basic') {
      bannerEl.className = 'plan-banner basic';
      bannerEl.style.display = 'block';
      bannerEl.innerHTML = `<div class="plan-banner-content">
        <div class="plan-banner-icon"><i class="fas fa-rocket"></i></div>
        <div class="plan-banner-text"><h3>Upgrade to Pro — ₹299/month</h3><p>Unlock social media promotion, advanced analytics, priority listing, and featured badge.</p></div>
        <button class="btn btn-primary" onclick="openUpgradeModal()">Upgrade Now</button>
      </div>`;
    } else if (plan === 'pro') {
      bannerEl.className = 'plan-banner pro';
      bannerEl.style.display = 'block';
      bannerEl.innerHTML = `<div class="plan-banner-content">
        <div class="plan-banner-icon"><i class="fas fa-crown"></i></div>
        <div class="plan-banner-text"><h3>Go Enterprise — ₹499/month</h3><p>Get multiple shop listings, custom branding, newsletter promotion, and dedicated support.</p></div>
        <button class="btn btn-primary" onclick="openUpgradeModal()">Upgrade to Enterprise</button>
      </div>`;
    } else {
      bannerEl.className = 'plan-banner enterprise';
      bannerEl.style.display = 'block';
      bannerEl.innerHTML = `<div class="plan-banner-content">
        <div class="plan-banner-icon"><i class="fas fa-gem"></i></div>
        <div class="plan-banner-text"><h3>You're on the Enterprise plan!</h3><p>You have access to all features. Need help? Contact your dedicated account manager.</p></div>
      </div>`;
    }

    // Stats
    document.getElementById('overviewStats').innerHTML = `
      <div class="stat-card"><div class="stat-card-header"><span class="stat-card-title">Views</span></div><div class="stat-card-value">${views}</div><div class="stat-card-sub">profile views this month</div></div>
      <div class="stat-card"><div class="stat-card-header"><span class="stat-card-title">Inquiries</span></div><div class="stat-card-value">${inquiries}</div><div class="stat-card-sub">messages received</div></div>
      <div class="stat-card"><div class="stat-card-header"><span class="stat-card-title">Rating</span></div><div class="stat-card-value">${rating}</div><div class="stat-card-sub">average rating</div></div>
      <div class="stat-card"><div class="stat-card-header"><span class="stat-card-title">Plan</span></div><div class="stat-card-value" style="font-size:1.1rem;color:${planDef.color}">${planDef.label}</div><div class="stat-card-sub">${plan === 'enterprise' ? 'full access' : plan === 'pro' ? 'enhanced features' : 'starter plan'}</div></div>
    `;

    // Plan features
    document.getElementById('featuresSubtitle').textContent = `${planDef.label} plan (₹${planDef.price}/month)`;
    document.getElementById('planFeatures').innerHTML = planDef.features.map(f => `
      <div class="plan-feature ${f.active ? 'active' : 'locked'}">
        <div class="plan-feature-icon"><i class="${f.icon}"></i></div>
        <div class="plan-feature-text">${f.name}${!f.active ? ' <i class="fas fa-lock" style="margin-left:4px;font-size:0.7rem;color:var(--text-muted)"></i>' : ''}</div>
      </div>
    `).join('');

    // Activity
    document.getElementById('shopActivityList').innerHTML = `
      <div class="activity-item"><div class="activity-icon icon-shop"><i class="fas fa-store"></i></div><div class="activity-info"><div class="activity-title">Shop listed</div><div class="activity-desc">${escapeHtml(shop.name)} is live on ShopLocal</div></div><span class="activity-badge badge-active">Active</span></div>
      <div class="activity-item"><div class="activity-icon icon-review"><i class="fas fa-crown"></i></div><div class="activity-info"><div class="activity-title">Plan: ${planDef.label}</div><div class="activity-desc">₹${planDef.price}/month — ${plan === 'enterprise' ? 'all features unlocked' : plan === 'pro' ? 'enhanced access' : 'upgrade for more'}</div></div><span class="activity-badge badge-complete">Current</span></div>
      ${plan === 'basic' ? '<div class="activity-item"><div class="activity-icon icon-task"><i class="fas fa-lightbulb"></i></div><div class="activity-info"><div class="activity-title">Tip</div><div class="activity-desc">Upgrade to Pro for social media promotion and analytics</div></div></div>' : ''}
    `;
  }

  // ========== SHOP PROFILE ==========
  function loadShopProfile(shop, plan) {
    const gradients = {
      'Food & Drinks': 'linear-gradient(135deg, #e17055, #fdcb6e)',
      'Fashion': 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
      'Grocery': 'linear-gradient(135deg, #00b894, #55efc4)',
      'Beauty': 'linear-gradient(135deg, #fd79a8, #e84393)',
      'Services': 'linear-gradient(135deg, #0984e3, #74b9ff)',
      'Electronics': 'linear-gradient(135deg, #636e72, #b2bec3)'
    };
    const icons = { 'Food & Drinks': 'fas fa-utensils', 'Fashion': 'fas fa-tshirt', 'Grocery': 'fas fa-shopping-basket', 'Beauty': 'fas fa-spa', 'Services': 'fas fa-tools', 'Electronics': 'fas fa-laptop' };

    document.getElementById('shopProfile').innerHTML = `
      <div class="shop-profile-header">
        <div class="shop-profile-image" style="background: ${shop.image ? 'none' : (gradients[shop.category] || 'linear-gradient(135deg, #6c5ce7, #00cec9)')}">
          ${shop.image ? `<img src="${escapeHtml(shop.image)}" alt="${escapeHtml(shop.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:16px">` : `<i class="${icons[shop.category] || 'fas fa-store'}"></i>`}
        </div>
        <div class="shop-profile-info">
          <h2>${escapeHtml(shop.name)} ${plan === 'pro' || plan === 'enterprise' ? '<span style="font-size:0.7rem;padding:4px 10px;border-radius:20px;background:var(--primary-bg);color:var(--primary);vertical-align:middle;margin-left:8px"><i class="fas fa-award"></i> Featured</span>' : ''}</h2>
          <div class="shop-category-tag">${escapeHtml(shop.category)}</div>
          <div class="shop-profile-detail"><i class="fas fa-user"></i> ${escapeHtml(shop.owner)}</div>
          <div class="shop-profile-detail"><i class="fas fa-phone"></i> ${escapeHtml(shop.phone)}</div>
          <div class="shop-profile-detail"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(shop.address || 'No address set')}</div>
          <div class="shop-profile-detail"><i class="fas fa-info-circle"></i> ${escapeHtml(shop.description || 'No description')}</div>
          <div class="shop-profile-detail"><i class="fas fa-tag"></i> Plan: <strong style="margin-left:4px">${PLANS[plan]?.label || 'Basic'}</strong></div>
        </div>
      </div>
    `;

    // Edit modal
    document.getElementById('editShopBtn')?.addEventListener('click', () => {
      document.getElementById('shopFormTitle').textContent = 'Edit Shop';
      document.getElementById('editShopId').value = shop._id;
      document.getElementById('sf_name').value = shop.name;
      document.getElementById('sf_description').value = shop.description || '';
      document.getElementById('sf_address').value = shop.address || '';
      document.getElementById('sf_phone').value = shop.phone || '';
      document.getElementById('sf_owner').value = shop.owner || '';
      document.getElementById('sf_image').value = shop.image || '';
      document.getElementById('sf_file').value = '';
      document.getElementById('sf-preview').style.display = 'none';
      document.getElementById('sf-upload-tab').querySelector('.file-upload-area').style.display = 'flex';
      if (shop.image) {
        document.getElementById('sf-preview-img').src = shop.image;
        document.getElementById('sf-preview').style.display = 'block';
        document.getElementById('sf-upload-tab').querySelector('.file-upload-area').style.display = 'none';
        switchImageTab('sf', 'upload');
      } else {
        switchImageTab('sf', 'upload');
      }
      populateCats().then(() => {
        document.getElementById('sf_category').value = shop.category || '';
      });
      document.getElementById('shopFormModal').classList.add('active');
    });
  }

  // ========== PROMOTIONS (Pro / Enterprise) ==========
  function loadPromotions(plan) {
    if (plan === 'basic') {
      document.getElementById('promoContent').innerHTML = `<div class="locked-overlay"><i class="fas fa-lock"></i><h3>Pro Feature</h3><p>Upgrade to Pro to access social media promotion, featured listing, and more.</p><button class="btn btn-primary" onclick="openUpgradeModal()">Upgrade to Pro</button></div>`;
      return;
    }

    const isEnterprise = plan === 'enterprise';
    const shareText = encodeURIComponent(`Check out ${currentShop.name} on ShopLocal! ${currentShop.description || ''}`);
    const shareUrl = encodeURIComponent(window.location.origin);
    document.getElementById('promoContent').innerHTML = `
      <div class="promo-card">
        <h3><i class="fab fa-instagram" style="color:#E1306C"></i> Social Media Promotion</h3>
        <p>We'll promote your shop on our Instagram and Facebook pages. ${isEnterprise ? 'Unlimited posts per month.' : '2 posts per month included.'}</p>
        <div class="promo-social-grid">
          <div class="promo-social-card" onclick="window.open('https://www.instagram.com/create/text/?url=${shareUrl}&caption=${shareText}', '_blank')"><i class="fab fa-instagram" style="color:#E1306C"></i><h4>Instagram</h4><p>Feed post</p></div>
          <div class="promo-social-card" onclick="window.open('https://www.facebook.com/sharer/sharer.php?quote=${shareText}&u=${shareUrl}', '_blank')"><i class="fab fa-facebook" style="color:#1877F2"></i><h4>Facebook</h4><p>Share post</p></div>
          <div class="promo-social-card" onclick="window.open('https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}', '_blank')"><i class="fab fa-twitter" style="color:#1DA1F2"></i><h4>Twitter</h4><p>Tweet</p></div>
          ${isEnterprise ? `<div class="promo-social-card" onclick="window.open('https://wa.me/?text=${shareText}%20${shareUrl}', '_blank')"><i class="fab fa-whatsapp" style="color:#25D366"></i><h4>WhatsApp</h4><p>Share</p></div>` : ''}
        </div>
      </div>
      <div class="promo-card">
        <h3><i class="fas fa-award" style="color:var(--orange)"></i> Featured Listing</h3>
        <p>Your shop appears at the top of search results and gets a featured badge on the homepage.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <span style="padding:6px 14px;border-radius:20px;background:var(--primary-bg);color:var(--primary);font-size:0.8rem;font-weight:500"><i class="fas fa-check"></i> Enabled</span>
          <span style="padding:6px 14px;border-radius:20px;background:var(--green-bg);color:var(--green);font-size:0.8rem;font-weight:500"><i class="fas fa-award"></i> Featured Badge</span>
        </div>
      </div>
      <div class="promo-card ${isEnterprise ? '' : 'promo-locked'}">
        <h3><i class="fas fa-newspaper" style="color:var(--green)"></i> Newsletter Promotion</h3>
        <p>${isEnterprise ? 'Get featured in our weekly newsletter sent to 10,000+ local subscribers. Your shop reaches customers directly in their inbox.' : 'Upgrade to Enterprise to be included in our weekly newsletter.'}</p>
      </div>
      <div class="promo-card ${isEnterprise ? '' : 'promo-locked'}">
        <h3><i class="fas fa-tv" style="color:var(--blue)"></i> Local TV / Radio</h3>
        <p>${isEnterprise ? 'Get featured in local media partnerships. We collaborate with TV and radio stations to promote top Enterprise shops.' : 'Enterprise exclusive — get mentioned in local media.'}</p>
      </div>
    `;
  }

  // ========== ANALYTICS (Pro / Enterprise) ==========
  async function loadAnalytics(plan) {
    if (plan === 'basic') {
      document.getElementById('analyticsContent').innerHTML = `<div class="locked-overlay"><i class="fas fa-lock"></i><h3>Pro Feature</h3><p>Upgrade to Pro to view detailed analytics about your shop performance, traffic sources, and conversion rates.</p><button class="btn btn-primary" onclick="openUpgradeModal()">Upgrade to Pro</button></div>`;
      return;
    }

    const isEnterprise = plan === 'enterprise';
    let viewsData = [0, 0, 0, 0, 0, 0, 0];
    let inquiriesData = [0, 0, 0, 0, 0, 0, 0];
    let totalViews = 0;
    let totalInquiries = 0;
    let conversionRate = '0.0';

    try {
      const analytics = await DB.getShopAnalytics(currentShop._id, 7);
      viewsData = analytics.daily.map(d => d.views);
      inquiriesData = analytics.daily.map(d => d.inquiries);
      totalViews = analytics.summary.totalViews;
      totalInquiries = analytics.summary.totalInquiries;
      conversionRate = analytics.summary.conversionRate;
    } catch (e) {
      // Fallback to shop-level data
      totalViews = currentShop.views || 0;
      totalInquiries = currentShop.inquiryCount || 0;
    }

    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const maxViews = Math.max(...viewsData, 1);

    document.getElementById('analyticsContent').innerHTML = `
      <div class="analytics-grid">
        <div class="analytics-card">
          <h4><i class="fas fa-eye" style="color:var(--primary);margin-right:6px"></i> Profile Views (Last 7 Days)</h4>
          <div class="analytics-chart">${viewsData.map((h,i) => `<div class="analytics-chart-bar" data-value="${h} views" style="background:linear-gradient(to top,var(--primary),rgba(79,110,247,0.5));height:${(h/maxViews)*100}%"></div>`).join('')}</div>
          <div class="analytics-days">${days.map(d => `<span>${d}</span>`).join('')}</div>
          <div style="text-align:center;margin-top:8px;font-size:0.85rem;color:var(--text-dim)">Total: ${totalViews} views</div>
        </div>
        <div class="analytics-card">
          <h4><i class="fas fa-envelope" style="color:var(--green);margin-right:6px"></i> Inquiries (Last 7 Days)</h4>
          <div class="analytics-chart">${inquiriesData.map(h => `<div class="analytics-chart-bar" data-value="${h} inquiries" style="background:linear-gradient(to top,var(--green),rgba(34,181,115,0.5));height:${(h/Math.max(...inquiriesData, 1))*100}%"></div>`).join('')}</div>
          <div class="analytics-days">${days.map(d => `<span>${d}</span>`).join('')}</div>
          <div style="text-align:center;margin-top:8px;font-size:0.85rem;color:var(--text-dim)">Total: ${totalInquiries} inquiries</div>
        </div>
        <div class="analytics-card">
          <h4><i class="fas fa-chart-pie" style="color:var(--orange);margin-right:6px"></i> Traffic Sources</h4>
          <div style="margin-top:8px">
            <div class="analytics-row"><span class="analytics-label">Direct</span><div class="analytics-bar-wrap"><div class="analytics-bar" style="width:60%"></div></div><span class="analytics-count">60%</span></div>
            <div class="analytics-row"><span class="analytics-label">Social Media</span><div class="analytics-bar-wrap"><div class="analytics-bar" style="width:25%;background:var(--primary)"></div></div><span class="analytics-count">25%</span></div>
            <div class="analytics-row"><span class="analytics-label">Search</span><div class="analytics-bar-wrap"><div class="analytics-bar" style="width:15%;background:var(--orange)"></div></div><span class="analytics-count">15%</span></div>
          </div>
        </div>
        <div class="analytics-card">
          <h4><i class="fas fa-funnel-dollar" style="color:var(--green);margin-right:6px"></i> Conversion Rate</h4>
          <div class="analytics-stat-big"><div class="value" style="color:var(--green)">${conversionRate}%</div><div class="label">views to inquiries</div></div>
        </div>
        ${isEnterprise ? `
        <div class="analytics-card">
          <h4><i class="fas fa-users" style="color:var(--blue);margin-right:6px"></i> Customer Demographics</h4>
          <div style="margin-top:8px">
            <div class="analytics-row"><span class="analytics-label">18-24</span><div class="analytics-bar-wrap"><div class="analytics-bar" style="width:20%;background:var(--pink)"></div></div><span class="analytics-count">20%</span></div>
            <div class="analytics-row"><span class="analytics-label">25-34</span><div class="analytics-bar-wrap"><div class="analytics-bar" style="width:40%;background:var(--primary)"></div></div><span class="analytics-count">40%</span></div>
            <div class="analytics-row"><span class="analytics-label">35-44</span><div class="analytics-bar-wrap"><div class="analytics-bar" style="width:25%;background:var(--green)"></div></div><span class="analytics-count">25%</span></div>
            <div class="analytics-row"><span class="analytics-label">45+</span><div class="analytics-bar-wrap"><div class="analytics-bar" style="width:15%;background:var(--orange)"></div></div><span class="analytics-count">15%</span></div>
          </div>
        </div>
        <div class="analytics-card">
          <h4><i class="fas fa-map-marked-alt" style="color:var(--red);margin-right:6px"></i> Top Locations</h4>
          <div style="margin-top:8px">
            <div class="analytics-row"><span class="analytics-label">Within 2km</span><div class="analytics-bar-wrap"><div class="analytics-bar" style="width:55%"></div></div><span class="analytics-count">55%</span></div>
            <div class="analytics-row"><span class="analytics-label">2-5km</span><div class="analytics-bar-wrap"><div class="analytics-bar" style="width:30%;background:var(--primary)"></div></div><span class="analytics-count">30%</span></div>
            <div class="analytics-row"><span class="analytics-label">5-10km</span><div class="analytics-bar-wrap"><div class="analytics-bar" style="width:10%;background:var(--orange)"></div></div><span class="analytics-count">10%</span></div>
            <div class="analytics-row"><span class="analytics-label">10km+</span><div class="analytics-bar-wrap"><div class="analytics-bar" style="width:5%;background:var(--pink)"></div></div><span class="analytics-count">5%</span></div>
          </div>
        </div>` : ''}
      </div>
    `;
  }

  // ========== REVIEWS (All Plans) ==========
  function loadReviews(shop, plan) {
    DB.getTestimonials().then(async (testimonials) => {
      const shopReviews = testimonials.filter(t => t.shop === shop.name);
      if (shopReviews.length === 0) {
        document.getElementById('reviewsContent').innerHTML = '<div class="empty-state"><i class="fas fa-star"></i><h3>No reviews yet</h3><p>When customers leave reviews, they will appear here.</p></div>';
        return;
      }

      // Load replies for each review
      const reviewsWithReplies = await Promise.all(shopReviews.map(async (t) => {
        let replies = [];
        try { replies = await DB.getReplies(t._id); } catch (e) {}
        return { ...t, replies };
      }));

      document.getElementById('reviewsContent').innerHTML = reviewsWithReplies.map(t => `
        <div class="review-item">
          <div class="review-header">
            <div class="review-avatar">${t.name.charAt(0)}</div>
            <div class="review-meta"><h4>${escapeHtml(t.name)}</h4><span class="review-date">${new Date(t.createdAt).toLocaleDateString()}</span></div>
          </div>
          <div class="review-stars">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div>
          <div class="review-text">${escapeHtml(t.review)}</div>
          ${t.replies.length > 0 ? `
            <div class="review-replies" style="margin-top:12px;padding-left:20px;border-left:2px solid var(--primary)">
              ${t.replies.map(r => `
                <div style="margin-bottom:8px">
                  <div style="font-size:0.8rem;font-weight:600;color:var(--primary)">${escapeHtml(r.repliedBy)}</div>
                  <div style="font-size:0.85rem;color:var(--text-dim)">${escapeHtml(r.reply)}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${(plan === 'pro' || plan === 'enterprise') ? `
            <div style="margin-top:12px">
              <button class="btn btn-ghost" style="font-size:0.8rem;padding:6px 12px" onclick="replyToReview('${t._id}')"><i class="fas fa-reply"></i> Reply</button>
            </div>
          ` : ''}
        </div>
      `).join('');
    });
  }

  window.replyToReview = async function(reviewId) {
    const reply = prompt('Enter your reply:');
    if (!reply || !reply.trim()) return;
    try {
      await DB.addReply(reviewId, reply.trim());
      toast('Reply posted!');
      loadReviews(currentShop, currentShop.plan || 'basic');
    } catch (err) {
      toast('Failed to post reply', 'error');
    }
  };

  async function populateCats() {
    try {
      const cats = await DB.getCategories();
      document.getElementById('sf_category').innerHTML = '<option value="">Select</option>' + cats.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    } catch (e) {}
  }

  // ========== MULTI-SHOP (Enterprise Only) ==========
  function loadMultiShop(plan) {
    if (plan !== 'enterprise') {
      document.getElementById('multiShopContent').innerHTML = `<div class="locked-overlay"><i class="fas fa-lock"></i><h3>Enterprise Feature</h3><p>Manage multiple shop listings from a single dashboard. Upgrade to Enterprise for up to 5 shops.</p><button class="btn btn-primary" onclick="openUpgradeModal()">Upgrade to Enterprise</button></div>`;
      return;
    }

    DB.getShops().then(shops => {
      const myShops = shops.filter(s => s.owner === currentUser.name || s.owner.toLowerCase().replace(/\s/g, '') === currentUser.username);
      const gradients = {
        'Food & Drinks': 'linear-gradient(135deg, #e17055, #fdcb6e)',
        'Fashion': 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
        'Grocery': 'linear-gradient(135deg, #00b894, #55efc4)',
        'Beauty': 'linear-gradient(135deg, #fd79a8, #e84393)',
        'Services': 'linear-gradient(135deg, #0984e3, #74b9ff)',
        'Electronics': 'linear-gradient(135deg, #636e72, #b2bec3)'
      };
      const icons = { 'Food & Drinks': 'fas fa-utensils', 'Fashion': 'fas fa-tshirt', 'Grocery': 'fas fa-shopping-basket', 'Beauty': 'fas fa-spa', 'Services': 'fas fa-tools', 'Electronics': 'fas fa-laptop' };

      document.getElementById('multiShopContent').innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <p style="color:var(--text-dim);font-size:0.9rem">${myShops.length}/5 shops listed</p>
          ${myShops.length < 5 ? '<button class="btn btn-primary" onclick="openAddShopModal()"><i class="fas fa-plus"></i> Add Shop</button>' : '<span style="font-size:0.8rem;color:var(--text-muted)"><i class="fas fa-info-circle"></i> Maximum 5 shops reached</span>'}
        </div>
        <div class="multi-shop-grid">
          ${myShops.map(shop => `
            <div class="multi-shop-card">
              <div class="multi-shop-header">
                <div class="multi-shop-icon" style="background:${gradients[shop.category] || 'linear-gradient(135deg, #6c5ce7, #00cec9)'}"><i class="${icons[shop.category] || 'fas fa-store'}"></i></div>
                <div class="multi-shop-info"><h3>${escapeHtml(shop.name)}</h3><p>${escapeHtml(shop.category)} · ${escapeHtml(shop.phone)}</p></div>
              </div>
              <div class="multi-shop-stats">
                <div class="multi-shop-stat"><div class="val">${shop.views || 0}</div><div class="lbl">Views</div></div>
                <div class="multi-shop-stat"><div class="val">${shop.inquiryCount || 0}</div><div class="lbl">Inquiries</div></div>
                <div class="multi-shop-stat"><div class="val">${shop.status}</div><div class="lbl">Status</div></div>
              </div>
              <div class="multi-shop-actions">
                <button class="btn btn-ghost" style="flex:1;font-size:0.8rem" onclick="editMultiShop('${shop._id}')"><i class="fas fa-pen"></i> Edit</button>
                <button class="btn btn-ghost" style="flex:1;font-size:0.8rem" onclick="window.open('index.html','_blank')"><i class="fas fa-eye"></i> View</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    });
  }

  window.openAddShopModal = async function() {
    await populateCats();
    document.getElementById('shopFormTitle').textContent = 'Add New Shop';
    document.getElementById('editShopId').value = '';
    document.getElementById('shopForm').reset();
    document.getElementById('sf-preview').style.display = 'none';
    document.getElementById('sf-upload-tab').querySelector('.file-upload-area').style.display = 'flex';
    document.getElementById('shopFormModal').classList.add('active');
  };

  window.editMultiShop = async function(shopId) {
    try {
      const shop = await DB.getShop(shopId);
      if (!shop) return;
      await populateCats();
      document.getElementById('shopFormTitle').textContent = 'Edit Shop';
      document.getElementById('editShopId').value = shop._id;
      document.getElementById('sf_name').value = shop.name;
      document.getElementById('sf_description').value = shop.description || '';
      document.getElementById('sf_address').value = shop.address || '';
      document.getElementById('sf_phone').value = shop.phone || '';
      document.getElementById('sf_owner').value = shop.owner || '';
      document.getElementById('sf_image').value = shop.image || '';
      document.getElementById('sf_category').value = shop.category || '';
      document.getElementById('sf_file').value = '';
      document.getElementById('sf-preview').style.display = 'none';
      document.getElementById('sf-upload-tab').querySelector('.file-upload-area').style.display = 'flex';
      if (shop.image) {
        document.getElementById('sf-preview-img').src = shop.image;
        document.getElementById('sf-preview').style.display = 'block';
        document.getElementById('sf-upload-tab').querySelector('.file-upload-area').style.display = 'none';
        switchImageTab('sf', 'upload');
      }
      document.getElementById('shopFormModal').classList.add('active');
    } catch (err) {
      toast('Failed to load shop', 'error');
    }
  };

  // ========== BRANDING (Enterprise Only) ==========
  function loadBranding(plan) {
    if (plan !== 'enterprise') {
      document.getElementById('brandingContent').innerHTML = `<div class="locked-overlay"><i class="fas fa-lock"></i><h3>Enterprise Feature</h3><p>Customize your shop's branding with your own logo, colors, and tagline. Upgrade to Enterprise.</p><button class="btn btn-primary" onclick="openUpgradeModal()">Upgrade to Enterprise</button></div>`;
      return;
    }

    const branding = currentShop.branding || {};
    document.getElementById('brandingContent').innerHTML = `
      <div class="card" style="margin-bottom:20px">
        <div class="card-header"><h3>Brand Preview</h3></div>
        <div class="branding-preview">
          <div class="branding-preview-logo" id="brandLogo" style="background:${branding.primaryColor || '#4f6ef7'}"><i class="${currentShop ? 'fas fa-store' : 'fas fa-store'}"></i></div>
          <div class="branding-preview-name" id="brandPreviewName">${currentShop?.name || 'My Shop'}</div>
          <div class="branding-preview-tagline" id="brandPreviewTagline">${branding.tagline || 'Your tagline here'}</div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3>Customize Colors</h3></div>
        <div style="padding:24px">
          <div class="color-picker-grid">
            <div class="color-picker-item"><label>Primary Color</label><input type="color" id="brandPrimary" value="${branding.primaryColor || '#4f6ef7'}" onchange="document.getElementById('brandLogo').style.background=this.value"></div>
            <div class="color-picker-item"><label>Accent Color</label><input type="color" id="brandAccent" value="${branding.accentColor || '#22b573'}"></div>
            <div class="color-picker-item"><label>Background Color</label><input type="color" id="brandBg" value="${branding.bgColor || '#ffffff'}"></div>
            <div class="color-picker-item"><label>Text Color</label><input type="color" id="brandText" value="${branding.textColor || '#1a1a2e'}"></div>
          </div>
          <div class="form-group" style="margin-top:20px"><label>Tagline</label><input type="text" id="brandTagline" value="${escapeHtml(branding.tagline || '')}" placeholder="e.g., Best food in town!" oninput="document.getElementById('brandPreviewTagline').textContent=this.value || 'Your tagline here'"></div>
          <button class="btn btn-primary" style="margin-top:12px" onclick="saveBranding()"><i class="fas fa-save"></i> Save Branding</button>
        </div>
      </div>
    `;
  }

  window.saveBranding = async function() {
    if (!currentShop) return;
    try {
      await DB.updateShop(currentShop._id, {
        branding: {
          primaryColor: document.getElementById('brandPrimary').value,
          accentColor: document.getElementById('brandAccent').value,
          bgColor: document.getElementById('brandBg').value,
          textColor: document.getElementById('brandText').value,
          tagline: document.getElementById('brandTagline').value
        }
      });
      toast('Branding saved!', 'success');
      currentShop.branding = {
        primaryColor: document.getElementById('brandPrimary').value,
        accentColor: document.getElementById('brandAccent').value,
        bgColor: document.getElementById('brandBg').value,
        textColor: document.getElementById('brandText').value,
        tagline: document.getElementById('brandTagline').value
      };
    } catch (err) {
      toast('Failed to save branding', 'error');
    }
  };

  // ========== SUPPORT (Enterprise Only) ==========
  function loadSupport(plan) {
    if (plan !== 'enterprise') {
      document.getElementById('supportContent').innerHTML = `<div class="locked-overlay"><i class="fas fa-lock"></i><h3>Enterprise Feature</h3><p>Get priority support with a dedicated account manager. Upgrade to Enterprise.</p><button class="btn btn-primary" onclick="openUpgradeModal()">Upgrade to Enterprise</button></div>`;
      return;
    }

    document.getElementById('supportContent').innerHTML = `
      <div style="margin-bottom:20px;padding:20px;border-radius:var(--radius);background:var(--green-bg);border:1px solid rgba(34,181,115,0.2);display:flex;align-items:center;gap:12px">
        <i class="fas fa-check-circle" style="font-size:1.5rem;color:var(--green)"></i>
        <div><strong style="color:var(--text)">Priority Support Active</strong><p style="font-size:0.85rem;color:var(--text-dim);margin:0">Your dedicated account manager will respond within 2 hours.</p></div>
      </div>
      <div class="support-channels">
        <div class="support-card">
          <i class="fas fa-comments"></i>
          <h3>Live Chat</h3>
          <p>Chat with your dedicated account manager in real-time.</p>
          <button class="btn btn-primary" onclick="window.open('mailto:support@shoplocal.com?subject=Support Request - ${encodeURIComponent(currentShop?.name || '')}', '_blank')">Start Chat via Email</button>
        </div>
        <div class="support-card">
          <i class="fas fa-phone-alt"></i>
          <h3>Phone Support</h3>
          <p>Call us directly for immediate assistance.</p>
          <p style="font-size:1rem;font-weight:600;color:var(--text);margin-bottom:0">+91 98765 43210</p>
        </div>
        <div class="support-card">
          <i class="fas fa-envelope"></i>
          <h3>Email Support</h3>
          <p>Send us an email. We respond within 2 hours.</p>
          <p style="font-size:0.9rem;font-weight:500;color:var(--primary);margin-bottom:0">priority@shoplocal.com</p>
        </div>
      </div>
    `;
  }

  // ========== SETTINGS (All Plans) ==========
  function loadSettings(shop) {
    document.getElementById('setShopName').value = shop.name;
    document.getElementById('setShopPhone').value = shop.phone;
    document.getElementById('setShopAddress').value = shop.address || '';
    document.getElementById('setShopDesc').value = shop.description || '';

    document.getElementById('shopProfileForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await DB.updateShop(shop._id, {
        name: document.getElementById('setShopName').value,
        phone: document.getElementById('setShopPhone').value,
        address: document.getElementById('setShopAddress').value,
        description: document.getElementById('setShopDesc').value
      });
      toast('Profile updated!');
      loadDashboard();
    });

    document.getElementById('changePasswordForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const currentPass = document.getElementById('currentPass')?.value;
      const newPass = document.getElementById('newPass').value;
      const confirmPass = document.getElementById('confirmPass').value;
      if (newPass.length < 8) { toast('Min 8 characters required', 'error'); return; }
      if (!/[A-Z]/.test(newPass) || !/[a-z]/.test(newPass) || !/[0-9]/.test(newPass)) {
        toast('Password must contain uppercase, lowercase, and a number', 'error'); return;
      }
      if (newPass !== confirmPass) { toast('Passwords do not match', 'error'); return; }
      if (!currentPass) { toast('Current password is required', 'error'); return; }
      try {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: newPass, currentPassword: currentPass })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        toast('Password updated!');
        e.target.reset();
      } catch (err) { toast('Failed: ' + err.message, 'error'); }
    });

    // Delete Account
    document.getElementById('deleteAccountBtn')?.addEventListener('click', async () => {
      if (await confirmDialog('Delete Account', 'This will permanently delete your shop and account. Are you sure?')) {
        try {
          await fetch(`/api/shops/${shop._id}`, { method: 'DELETE' });
          await fetch('/api/auth/logout', { method: 'POST' });
          toast('Account deleted');
          setTimeout(() => location.reload(), 1000);
        } catch (err) { toast('Failed to delete account', 'error'); }
      }
    });
  }

  // ========== UPGRADE MODAL ==========
  window.openUpgradeModal = function() {
    if (!currentShop) return;
    const currentPlan = currentShop.plan || 'basic';

    document.getElementById('upgradePlans').innerHTML = Object.entries(PLANS).map(([key, p]) => `
      <div class="upgrade-plan-card ${key === currentPlan ? 'current' : ''}" onclick="upgradePlan('${key}')">
        ${key === currentPlan ? '<span class="current-badge">Current Plan</span>' : ''}
        <div class="plan-name">${p.label}</div>
        <div class="plan-price">₹${p.price}<span>/month</span></div>
        <ul class="plan-feature-list">${p.features.slice(0, 6).map(f => `<li><i class="fas fa-check"></i> ${f.name}</li>`).join('')}</ul>
      </div>
    `).join('');

    document.getElementById('upgradeModal').classList.add('active');
  };

  window.upgradePlan = async function(newPlan) {
    if (!currentShop) return;
    const currentPlan = currentShop.plan || 'basic';
    if (newPlan === currentPlan) { toast('Already on this plan', 'info'); return; }
    await DB.updateShop(currentShop._id, { plan: newPlan });
    document.getElementById('upgradeModal').classList.remove('active');
    toast(`Upgraded to ${PLANS[newPlan]?.label || newPlan}!`);
    loadDashboard();
  };

  document.getElementById('upgradeClose')?.addEventListener('click', () => document.getElementById('upgradeModal').classList.remove('active'));
  document.getElementById('upgradeModal')?.addEventListener('click', (e) => { if (e.target.id === 'upgradeModal') document.getElementById('upgradeModal').classList.remove('active'); });

  // ========== EDIT/ADD SHOP MODAL ==========
  document.getElementById('shopFormClose')?.addEventListener('click', () => document.getElementById('shopFormModal').classList.remove('active'));
  document.getElementById('shopFormCancel')?.addEventListener('click', () => document.getElementById('shopFormModal').classList.remove('active'));
  document.getElementById('shopFormModal')?.addEventListener('click', (e) => { if (e.target.id === 'shopFormModal') document.getElementById('shopFormModal').classList.remove('active'); });

  document.getElementById('shopForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editShopId').value;
    let imageUrl = document.getElementById('sf_image')?.value.trim() || '';
    const sfFile = document.getElementById('sf_file');
    if (sfFile && sfFile.files[0]) {
      imageUrl = await uploadFile(sfFile);
    }

    const shopData = {
      name: document.getElementById('sf_name').value,
      category: document.getElementById('sf_category')?.value || '',
      phone: document.getElementById('sf_phone')?.value || currentShop.phone,
      owner: document.getElementById('sf_owner')?.value || currentUser.name,
      description: document.getElementById('sf_description')?.value || '',
      address: document.getElementById('sf_address')?.value || '',
      image: imageUrl || '',
      status: 'active',
      plan: 'basic'
    };

    if (id) {
      await DB.updateShop(id, {
        name: shopData.name,
        description: shopData.description,
        address: shopData.address,
        image: shopData.image,
        category: shopData.category,
        phone: shopData.phone
      });
      toast('Shop updated!');
    } else {
      await DB.addShop(shopData);
      toast('New shop added!');
    }
    document.getElementById('shopFormModal').classList.remove('active');
    loadDashboard();
  });

  // ========== SIDEBAR NAV ==========
  const navItems = document.querySelectorAll('#sidebarNav .nav-item');
  const tabs = document.querySelectorAll('.admin-tab');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.dataset.tab;
      const plan = currentShop ? currentShop.plan || 'basic' : 'basic';
      const planOrder = { basic: 0, pro: 1, enterprise: 2 };
      const requiredPlan = item.dataset.plan;
      if (requiredPlan && (planOrder[plan] || 0) < (planOrder[requiredPlan] || 0)) {
        toast(`Upgrade to ${requiredPlan} to access this feature`, 'info');
        return;
      }
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

  // ========== LOCATION TAB ==========
  let locationMap = null;
  let locationMarker = null;
  let locationAutocomplete = null;
  let selectedLocation = { lat: null, lng: null };

  window.initLocationMap = function() {
    const defaultLoc = { lat: 20.5937, lng: 78.9629 };
    locationMap = new google.maps.Map(document.getElementById('locationMap'), {
      center: defaultLoc,
      zoom: 5,
      mapTypeControl: true,
      streetViewControl: false
    });

    locationAutocomplete = new google.maps.places.Autocomplete(
      document.getElementById('locationSearchInput'),
      { types: ['address'], componentRestrictions: { country: 'in' } }
    );

    locationAutocomplete.addListener('place_changed', () => {
      const place = locationAutocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const loc = place.geometry.location;
        selectedLocation.lat = loc.lat();
        selectedLocation.lng = loc.lng();
        locationMap.setCenter(loc);
        locationMap.setZoom(15);
        placeLocationMarker(loc);
        extractCityState(place);
      }
    });

    locationMap.addListener('click', (e) => {
      selectedLocation.lat = e.latLng.lat();
      selectedLocation.lng = e.latLng.lng();
      placeLocationMarker(e.latLng);
      reverseGeocode(e.latLng);
    });

    if (currentShop && currentShop.location && currentShop.location.lat && currentShop.location.lng) {
      const savedLoc = { lat: currentShop.location.lat, lng: currentShop.location.lng };
      locationMap.setCenter(savedLoc);
      locationMap.setZoom(15);
      placeLocationMarker(savedLoc);
      document.getElementById('locationCity').value = currentShop.location.city || '';
      document.getElementById('locationState').value = currentShop.location.state || '';
      selectedLocation = { lat: savedLoc.lat, lng: savedLoc.lng };
    }
  };

  function placeLocationMarker(position) {
    if (locationMarker) locationMarker.setMap(null);
    locationMarker = new google.maps.Marker({
      position: position,
      map: locationMap,
      draggable: true,
      title: 'Shop Location'
    });
    locationMarker.addListener('dragend', (e) => {
      selectedLocation.lat = e.latLng.lat();
      selectedLocation.lng = e.latLng.lng();
      reverseGeocode(e.latLng);
    });
  }

  function extractCityState(place) {
    let city = '', state = '';
    place.address_components.forEach(comp => {
      if (comp.types.includes('locality')) city = comp.long_name;
      if (comp.types.includes('administrative_area_level_1')) state = comp.long_name;
    });
    if (city) document.getElementById('locationCity').value = city;
    if (state) document.getElementById('locationState').value = state;
  }

  function reverseGeocode(latlng) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === 'OK' && results[0]) {
        extractCityState(results[0]);
      }
    });
  }

  document.getElementById('locationSearchBtn')?.addEventListener('click', () => {
    const input = document.getElementById('locationSearchInput');
    if (input.value.trim()) {
      google.maps.event.trigger(locationAutocomplete, 'place_changed');
    }
  });

  document.getElementById('locationUseMyBtn')?.addEventListener('click', () => {
    if (!navigator.geolocation) {
      toast('Geolocation is not supported by your browser', 'error');
      return;
    }
    toast('Detecting your location...', 'info');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        selectedLocation.lat = loc.lat;
        selectedLocation.lng = loc.lng;
        locationMap.setCenter(loc);
        locationMap.setZoom(15);
        placeLocationMarker(loc);
        reverseGeocode(loc);
        toast('Location detected!');
      },
      () => toast('Unable to detect location. Please search manually.', 'error')
    );
  });

  document.getElementById('locationSaveBtn')?.addEventListener('click', async () => {
    if (!selectedLocation.lat || !selectedLocation.lng) {
      toast('Please set a location first', 'error');
      return;
    }
    try {
      await DB.updateShop(currentShop._id, {
        location: {
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          city: document.getElementById('locationCity').value.trim(),
          state: document.getElementById('locationState').value.trim()
        }
      });
      document.getElementById('locationStatus').textContent = 'Location saved successfully!';
      toast('Location saved!');
      currentShop.location = selectedLocation;
    } catch (err) {
      toast('Failed to save location', 'error');
    }
  });

});

