// ========== MAIN LANDING PAGE JS ==========

document.addEventListener('DOMContentLoaded', () => {
  // ========== NAVBAR ==========
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  hamburger?.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });

  navLinks?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('active'));
  });

  // ========== SCROLL PROGRESS BAR ==========
  const scrollProgress = document.createElement('div');
  scrollProgress.className = 'scroll-progress';
  document.body.appendChild(scrollProgress);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    scrollProgress.style.width = scrollPercent + '%';
  });

  // ========== PARTICLES ==========
  function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      const size = Math.random() * 8 + 2;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
      particle.style.animationDelay = (Math.random() * 10) + 's';
      container.appendChild(particle);
    }
  }
  createParticles();

  // ========== COUNTER ANIMATION ==========
  function animateCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    counters.forEach(counter => {
      if (counter.dataset.animated) return;
      const target = parseInt(counter.dataset.target);
      const duration = 2000;
      const step = target / (duration / 16);
      let current = 0;

      const update = () => {
        current += step;
        if (current < target) {
          counter.textContent = Math.floor(current).toLocaleString();
          requestAnimationFrame(update);
        } else {
          counter.textContent = target.toLocaleString();
          counter.dataset.animated = 'true';
        }
      };
      update();
    });
  }

  // ========== SCROLL REVEAL ==========
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, parseInt(delay));

        if (entry.target.closest('.hero-stats') || entry.target.closest('.hero')) {
          animateCounters();
        }
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.scroll-reveal').forEach(el => {
    revealObserver.observe(el);
  });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) animateCounters();
      });
    }, { threshold: 0.5 });
    statsObserver.observe(heroStats);
  }

  // ========== RENDER SHOPS ==========
  const shopsGrid = document.getElementById('shopsGrid');
  const shopsEmpty = document.getElementById('shopsEmpty');

  function getShopCardIcon(category) {
    const icons = {
      'Food & Drinks': 'fas fa-utensils',
      'Fashion': 'fas fa-tshirt',
      'Grocery': 'fas fa-shopping-basket',
      'Beauty': 'fas fa-spa',
      'Services': 'fas fa-tools',
      'Electronics': 'fas fa-laptop'
    };
    return icons[category] || 'fas fa-store';
  }

  function getGradient(category) {
    const gradients = {
      'Food & Drinks': 'linear-gradient(135deg, #e17055, #fdcb6e)',
      'Fashion': 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
      'Grocery': 'linear-gradient(135deg, #00b894, #55efc4)',
      'Beauty': 'linear-gradient(135deg, #fd79a8, #e84393)',
      'Services': 'linear-gradient(135deg, #0984e3, #74b9ff)',
      'Electronics': 'linear-gradient(135deg, #636e72, #b2bec3)'
    };
    return gradients[category] || 'linear-gradient(135deg, #6c5ce7, #00cec9)';
  }

  async function renderShops(filter = 'all') {
    try {
      const allShops = await DB.getShops();
      const shops = allShops.filter(s => s.status === 'active');
      const filtered = filter === 'all' ? shops : shops.filter(s => {
        const cat = s.category.toLowerCase();
        if (filter === 'food') return cat.includes('food');
        if (filter === 'fashion') return cat.includes('fashion');
        if (filter === 'grocery') return cat.includes('grocery');
        if (filter === 'beauty') return cat.includes('beauty');
        if (filter === 'services') return cat.includes('service');
        if (filter === 'electronics') return cat.includes('electronics');
        return true;
      });

      if (filtered.length === 0) {
        shopsGrid.innerHTML = '';
        shopsEmpty.style.display = 'block';
        return;
      }

      shopsEmpty.style.display = 'none';
      shopsGrid.innerHTML = filtered.map((shop, i) => `
        <div class="shop-card scroll-reveal hover-lift" data-delay="${i * 100}" onclick="openShopModal('${shop._id}')">
          <div class="shop-card-image" style="background: ${shop.image ? 'none' : getGradient(shop.category)}">
            ${shop.image
              ? `<img src="${shop.image}" alt="${shop.name}">`
              : `<i class="${getShopCardIcon(shop.category)} placeholder-icon"></i>`
            }
            <span class="shop-badge badge-${shop.status}">${shop.status}</span>
            <span class="shop-plan-badge">${shop.plan}</span>
          </div>
          <div class="shop-card-body">
            <h3>${shop.name}</h3>
            <p class="owner"><i class="fas fa-user"></i> ${shop.owner}</p>
            <p class="description">${shop.description || 'No description available.'}</p>
            <div class="shop-card-meta">
              <span class="shop-category-tag">${shop.category}</span>
              <span class="shop-phone"><i class="fas fa-phone"></i> ${shop.phone}</span>
            </div>
          </div>
        </div>
      `).join('');

      shopsGrid.querySelectorAll('.scroll-reveal').forEach(el => revealObserver.observe(el));
    } catch (err) {
      console.error('Failed to load shops:', err);
    }
  }

  renderShops();

  // ========== FILTER SHOPS ==========
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderShops(btn.dataset.filter);
    });
  });

  // ========== SHOP MODAL ==========
  window.openShopModal = async function(id) {
    try {
      const shop = await DB.getShop(id);
      if (!shop) return;

      const modal = document.getElementById('shopModal');
      const body = document.getElementById('modalBody');

      body.innerHTML = `
        <div style="height: 250px; background: ${shop.image ? 'none' : getGradient(shop.category)}; border-radius: 16px; overflow: hidden; margin-bottom: 24px; display: flex; align-items: center; justify-content: center;">
          ${shop.image
            ? `<img src="${shop.image}" alt="${shop.name}" style="width:100%;height:100%;object-fit:cover;">`
            : `<i class="${getShopCardIcon(shop.category)}" style="font-size: 5rem; color: rgba(255,255,255,0.3);"></i>`
          }
        </div>
        <span class="status-badge status-${shop.status}" style="margin-bottom:12px;display:inline-block;">${shop.status.toUpperCase()}</span>
        <h2 style="font-size:1.6rem;margin-bottom:8px;">${shop.name}</h2>
        <p style="color:var(--gray);margin-bottom:20px;">${shop.description || 'No description available.'}</p>
        <div style="display:flex;flex-direction:column;gap:16px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;background:rgba(108,92,231,0.1);border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--primary);"><i class="fas fa-user"></i></div>
            <div><strong>Owner:</strong> ${shop.owner}</div>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;background:rgba(0,184,148,0.1);border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--success);"><i class="fas fa-phone"></i></div>
            <div><strong>Phone:</strong> ${shop.phone}</div>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;background:rgba(253,121,168,0.1);border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--accent);"><i class="fas fa-map-marker-alt"></i></div>
            <div><strong>Address:</strong> ${shop.address}</div>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;background:rgba(108,92,231,0.1);border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--primary);"><i class="fas fa-tag"></i></div>
            <div><strong>Category:</strong> ${shop.category}</div>
          </div>
        </div>
      `;

      modal.classList.add('active');
    } catch (err) {
      console.error('Failed to open shop modal:', err);
    }
  };

  document.getElementById('modalClose')?.addEventListener('click', () => {
    document.getElementById('shopModal').classList.remove('active');
  });

  document.getElementById('shopModal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      e.currentTarget.classList.remove('active');
    }
  });

  // ========== TESTIMONIALS SLIDER ==========
  const track = document.getElementById('testimonialTrack');
  const dotsContainer = document.getElementById('sliderDots');
  let currentSlide = 0;
  let testimonials = [];

  async function renderTestimonials() {
    try {
      testimonials = await DB.getTestimonials();
      if (testimonials.length === 0) return;

      track.innerHTML = testimonials.map(t => `
        <div class="testimonial-card">
          <div class="testimonial-inner">
            <div class="testimonial-stars">
              ${Array(t.rating).fill('<i class="fas fa-star"></i>').join('')}
              ${Array(5 - t.rating).fill('<i class="far fa-star"></i>').join('')}
            </div>
            <p class="testimonial-text">${t.review}</p>
            <div class="testimonial-author">
              <div class="testimonial-avatar">${t.name.charAt(0)}</div>
              <div class="testimonial-info">
                <h4>${t.name}</h4>
                <p>${t.shop}</p>
              </div>
            </div>
          </div>
        </div>
      `).join('');

      dotsContainer.innerHTML = testimonials.map((_, i) => `
        <div class="slider-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>
      `).join('');

      dotsContainer.querySelectorAll('.slider-dot').forEach(dot => {
        dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.index)));
      });
    } catch (err) {
      console.error('Failed to load testimonials:', err);
    }
  }

  function goToSlide(index) {
    if (index < 0) index = testimonials.length - 1;
    if (index >= testimonials.length) index = 0;
    currentSlide = index;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    dotsContainer.querySelectorAll('.slider-dot').forEach((d, i) => {
      d.classList.toggle('active', i === currentSlide);
    });
  }

  document.getElementById('prevBtn')?.addEventListener('click', () => goToSlide(currentSlide - 1));
  document.getElementById('nextBtn')?.addEventListener('click', () => goToSlide(currentSlide + 1));

  renderTestimonials();

  setInterval(() => goToSlide(currentSlide + 1), 5000);

  // ========== BACK TO TOP ==========
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    backToTop?.classList.toggle('visible', window.scrollY > 500);
  });
  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ========== CONTACT FORM ==========
  document.getElementById('contactForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await DB.addInquiry({
        shopName: document.getElementById('shopName').value,
        ownerName: document.getElementById('ownerName').value,
        phone: document.getElementById('phone').value,
        category: document.getElementById('shopCategory').value,
        address: document.getElementById('shopAddress').value,
        description: document.getElementById('shopDescription').value
      });
      e.target.reset();
      showToast('Thank you! Your inquiry has been submitted. We will contact you soon.', 'success');
    } catch (err) {
      showToast('Something went wrong. Please try again.', 'error');
    }
  });

  function showToast(message, type = 'info') {
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.setAttribute('role', 'alert');
    t.setAttribute('aria-live', 'polite');
    t.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${message}`;
    document.body.appendChild(t);
    
    // Trigger animation
    requestAnimationFrame(() => {
      t.classList.add('show');
    });
    
    setTimeout(() => {
      t.classList.add('fade-out');
      setTimeout(() => t.remove(), 300);
    }, 4000);
  }

  // ========== SMOOTH SCROLL ==========
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ========== TILT EFFECT ON CARDS ==========
  document.querySelectorAll('.shop-card, .pricing-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 15;
      const rotateY = (centerX - x) / 15;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ========== RIPPLE EFFECT ON BUTTONS ==========
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: rippleEffect 0.6s ease-out;
        pointer-events: none;
      `;
      
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // ========== MAGNETIC BUTTON EFFECT ==========
  document.querySelectorAll('.btn-primary, .nav-btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  // ========== SMOOTH REVEAL ON SCROLL ==========
  const revealElements = document.querySelectorAll('.feature-item, .contact-item, .pricing-features li');
  const revealObserver2 = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateX(0)';
        }, index * 100);
      }
    });
  }, { threshold: 0.2 });

  revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-20px)';
    el.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    revealObserver2.observe(el);
  });

  // ========== PARALLAX EFFECT ON HERO ==========
  const hero = document.querySelector('.hero');
  const heroContent = document.querySelector('.hero-content');
  
  if (hero && heroContent) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
        heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
      }
    });
  }

  // ========== MOUSE MOVE PARALLAX ON HERO ==========
  if (hero) {
    hero.addEventListener('mousemove', (e) => {
      const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
      const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
      
      document.querySelectorAll('.floating-card').forEach((card, i) => {
        const speed = (i + 1) * 0.5;
        card.style.transform = `translate(${moveX * speed}px, ${moveY * speed}px)`;
      });
    });
  }

  // ========== SMOOTH SECTION TRANSITIONS ==========
  // Sections are now visible by default - no hiding needed

  // ========== NEWSLETTER ==========
  document.querySelector('.newsletter-form button')?.addEventListener('click', async (e) => {
    e.preventDefault();
    const input = document.querySelector('.newsletter-form input');
    const email = input?.value.trim();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    try {
      await DB.addInquiry({
        shopName: 'Newsletter',
        ownerName: email,
        phone: '',
        category: 'Newsletter',
        address: '',
        description: 'Newsletter subscription'
      });
      input.value = '';
      showToast('Subscribed successfully! Thank you.', 'success');
    } catch (err) {
      showToast('Something went wrong. Please try again.', 'error');
    }
  });

  // ========== COUNTER ANIMATION WITH EASING ==========
  function animateValue(el, start, end, duration) {
    const startTime = performance.now();
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (end - start) * easeProgress);
      el.textContent = current.toLocaleString();
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    
    requestAnimationFrame(update);
  }

  // ========== FLOATING ANIMATION ON SCROLL ==========
  const floatingCards = document.querySelectorAll('.floating-card');
  let ticking = false;
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        floatingCards.forEach((card, i) => {
          const speed = (i + 1) * 0.1;
          const yPos = -(window.scrollY * speed);
          card.style.transform = `translateY(${yPos}px)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  });

  // ========== HOVER SOUND EFFECT (VISUAL) ==========
  document.querySelectorAll('.btn, .filter-btn, .social-links a').forEach(el => {
    el.addEventListener('mouseenter', function() {
      this.style.transition = 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)';
    });
  });

  // ========== SMOOTH COUNT UP ANIMATION ==========
  const statNumbers = document.querySelectorAll('.stat-number');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        const target = parseInt(entry.target.dataset.target);
        entry.target.dataset.animated = 'true';
        animateValue(entry.target, 0, target, 2000);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(num => statObserver.observe(num));

  // ========== NAVBAR ANIMATION ON SCROLL ==========
  // Simple scroll-based navbar styling - no hide/show needed
});
