/* ============================================================
   KALINGA TRAILS — script.js
   Sections:
   01. Navbar scroll behavior
   02. Mobile menu
   03. Interactive Konark Wheel
   04. Scroll-reveal (IntersectionObserver)
   05. Active nav link tracking
   06. Contact form
============================================================ */


/* ── 01. Navbar scroll behavior ────────────────────────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 80);
  }, { passive: true });
})();


/* ── 02. Mobile menu ────────────────────────────────────── */
(function initMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  if (!menu) return;

  window.toggleMobileMenu = function () {
    const isOpen = menu.classList.toggle('open');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      if (menu.classList.contains('open')) window.toggleMobileMenu();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();


/* ── 03. Interactive Konark Wheel ───────────────────────── */
(function initWheel() {
  const hero = document.getElementById('home');
  const wheel = document.querySelector('.hero-wheel');
  if (!hero || !wheel) return;

  const DEFAULT_DURATION = 120;
  const MIN_DURATION = 5;
  const INACTIVITY_MS = 3000;
  const RAMP_SPEED = 0.45;

  let currentDuration = DEFAULT_DURATION;
  let targetDuration = DEFAULT_DURATION;
  let inactivityTimer = null;
  let rafId = null;
  let angle = 0;
  let lastTime = null;

  wheel.style.animation = 'none';
  wheel.style.transformOrigin = '50% 50%';

  function tick(now) {
    if (!lastTime) lastTime = now;
    const delta = (now - lastTime) / 1000;
    lastTime = now;

    const diff = targetDuration - currentDuration;
    if (Math.abs(diff) > 0.05) {
      currentDuration += diff * RAMP_SPEED * delta * 12;
    } else {
      currentDuration = targetDuration;
    }

    const dps = 360 / currentDuration;
    angle = (angle + dps * delta) % 360;
    wheel.style.transform = `rotate(${angle}deg)`;

    if (currentDuration < 60) {
      wheel.classList.add('fast');
    } else {
      wheel.classList.remove('fast');
    }

    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);

  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      targetDuration = DEFAULT_DURATION;
    }, INACTIVITY_MS);
  }

  function handleInteraction(e) {
    if (e.type === 'click') {
      targetDuration = Math.max(MIN_DURATION, targetDuration - 35);
    }

    resetInactivityTimer();
  }

  hero.addEventListener('click', handleInteraction);

  hero.addEventListener('mousemove', () => {
    if (targetDuration < DEFAULT_DURATION) {
      resetInactivityTimer();
    }
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
      lastTime = null;
    } else {
      rafId = requestAnimationFrame(tick);
    }
  });
})();


/* ── 04. Scroll-reveal ──────────────────────────────────── */
(function initScrollReveal() {
  const SELECTORS = [
    '.destination-card',
    '.culture-art-card',
    '.food-card',
    '.about-highlight',
    '.reason-card',
    '.tip-card',
    '.culture-feature',
    '.konark-dance-feature',
    '.culture-video-panel',
  ].join(', ');

  const elements = document.querySelectorAll(SELECTORS);
  elements.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      setTimeout(() => entry.target.classList.add('visible'), i * 70);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08 });

  elements.forEach(el => observer.observe(el));
})();


/* ── 05. Active nav link tracking ──────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 130) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      const matches = link.getAttribute('href') === '#' + current;
      link.classList.toggle('active', matches);
    });
  }, { passive: true });
})();


/* ── 06. Contact form (Google Sheets Integration) ───────── */
(function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const scriptURL = "https://script.google.com/macros/s/AKfycbxGAcQ2lAMCQT34LsK1S1iaOhdY2xI8vQ1-Esvo876KnfxPOrBHdbbJwBoLpk7IhNxXew/exec";

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const btn = this.querySelector('.form-submit');
    const originalBtnText = btn.textContent;

    btn.textContent = 'Sending... ⏳';
    btn.disabled = true;

    const formData = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      travelDate: document.getElementById("travelDate").value,
      travelers: document.getElementById("travelers").value,
      interests: Array.from(
        document.querySelectorAll('input[name="interests"]:checked')
      ).map(el => el.value),
      requirements: document.getElementById("requirements").value
    };

    fetch(scriptURL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(formData),
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      }
    })
      .then(() => {
        btn.textContent = 'Request Received! ✓';
        btn.style.background = 'linear-gradient(135deg, #2D6A4F, #40916C)';

        setTimeout(() => {
          btn.textContent = originalBtnText;
          btn.style.background = '';
          btn.disabled = false;
          form.reset();
        }, 3500);
      })
      .catch(err => {
        console.error('Submission Error:', err);
        btn.textContent = 'Error! Try again. ❌';
        btn.style.background = '#e53e3e';

        setTimeout(() => {
          btn.textContent = originalBtnText;
          btn.style.background = '';
          btn.disabled = false;
        }, 3000);
      });
  });
})();


/* ── 07. Like Button — Neon PostgreSQL + FingerprintJS ─────────────────
   Requirements met:
   ✔ FingerprintJS for anonymous unique user detection
   ✔ No authentication/login
   ✔ One user can like only once (enforced by DB UNIQUE + client cache)
   ✔ Global like store in Neon PostgreSQL (table: Kalinga_trails)
   ✔ Real-time like count via fetch API
   ✔ Node.js/Vercel serverless backend at /api/like
   ✔ Duplicate like prevention (fingerprint uniqueness)
   ✔ JSON API responses
─────────────────────────────────────────────────────────────────────── */
(function initLikeButton() {
  const likeBtn      = document.getElementById('likeBtn');
  const likeCountEl  = document.getElementById('likeCount');
  if (!likeBtn || !likeCountEl) return;

  const API_URL    = '/api/like';          // Vercel serverless route
  const CACHE_KEY  = 'kt_fp_liked_v2';    // localStorage key (v2 = fingerprint-based)

  let visitorFingerprint = null;
  let hasLiked = false;

  /* ── Fetch live like count ─────────────────────────────────────────── */
  function fetchLikeCount() {
    fetch(API_URL)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data && typeof data.likes === 'number') {
          likeCountEl.textContent = data.likes.toLocaleString();
        }
      })
      .catch(err => {
        console.warn('[Like] Count fetch failed:', err.message);
        // Fallback: keep whatever count is showing
      });
  }

  /* ── Update button visual state ────────────────────────────────────── */
  function updateUI() {
    const textEl = likeBtn.querySelector('.like-text');
    if (hasLiked) {
      likeBtn.classList.add('active');
      likeBtn.setAttribute('aria-pressed', 'true');
      if (textEl) textEl.textContent = 'Liked! Thanks ❤';
    } else {
      likeBtn.classList.remove('active');
      likeBtn.setAttribute('aria-pressed', 'false');
      if (textEl) textEl.textContent = 'Love the creativity?';
    }
  }

  /* ── Animate heart on like ─────────────────────────────────────────── */
  function animateHeart() {
    const icon = likeBtn.querySelector('.like-icon');
    if (!icon) return;
    icon.style.transform = 'scale(1.6)';
    icon.style.transition = 'transform 0.15s ease';
    setTimeout(() => {
      icon.style.transform = 'scale(1)';
    }, 200);
  }

  /* ── Send like to Neon via API ─────────────────────────────────────── */
  function submitLike(fp) {
    likeBtn.disabled = true;

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fingerprint: fp })
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.alreadyLiked) {
          // DB says duplicate — mark liked locally
          hasLiked = true;
          localStorage.setItem(CACHE_KEY, fp);
          updateUI();
          console.info('[Like] Already liked from this device (server confirmed).');
        } else if (data.success) {
          hasLiked = true;
          localStorage.setItem(CACHE_KEY, fp);
          animateHeart();
          updateUI();
        }
        // Update count from server response
        if (typeof data.likes === 'number') {
          likeCountEl.textContent = data.likes.toLocaleString();
        }
        likeBtn.disabled = hasLiked; // keep disabled only if liked
      })
      .catch(err => {
        console.error('[Like] Submit failed:', err.message);
        likeBtn.disabled = false;
        // Optimistic local update to not frustrate user
        hasLiked = true;
        localStorage.setItem(CACHE_KEY, fp || 'unknown');
        animateHeart();
        updateUI();
      });
  }

  /* ── Initialise FingerprintJS ──────────────────────────────────────── */
  async function initFingerprint() {
    try {
      // FingerprintJS v4 loaded via CDN (window.FingerprintJS)
      const FP = window.FingerprintJS;
      if (!FP) throw new Error('FingerprintJS not loaded');

      const fp = await FP.load();
      const result = await fp.get();
      visitorFingerprint = result.visitorId;

      // Check if this fingerprint already liked (local cache)
      const cachedFP = localStorage.getItem(CACHE_KEY);
      if (cachedFP === visitorFingerprint) {
        hasLiked = true;
        likeBtn.disabled = true;
      }

      updateUI();
    } catch (err) {
      console.warn('[Like] FingerprintJS init failed, using fallback:', err.message);
      // Fallback: random UUID stored in localStorage
      let fallback = localStorage.getItem(CACHE_KEY + '_fb');
      if (!fallback) {
        fallback = crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem(CACHE_KEY + '_fb', fallback);
      }
      visitorFingerprint = 'fb_' + fallback;
      updateUI();
    }
  }

  /* ── Click handler ─────────────────────────────────────────────────── */
  likeBtn.addEventListener('click', () => {
    if (hasLiked || likeBtn.disabled) return;
    if (!visitorFingerprint) {
      console.warn('[Like] Fingerprint not ready yet.');
      return;
    }
    submitLike(visitorFingerprint);
  });

  /* ── Boot sequence ─────────────────────────────────────────────────── */
  fetchLikeCount();         // Load live count immediately
  initFingerprint();        // Then set up fingerprint & UI state

  // Refresh count every 30 seconds for "real-time" feel
  setInterval(fetchLikeCount, 30_000);
})();