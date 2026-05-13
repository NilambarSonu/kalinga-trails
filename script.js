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

  /* Smooth scroll + close on link click */
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
/*
   Behaviour:
   - Default speed: 120 s / revolution (slow, meditative)
   - On LEFT CLICK: ramps UP speed (decreases duration by 15s per click)
   - Min duration: 10 s (12x faster than default)
   - After 3 s of inactivity: slowly ramps BACK to 120 s
   - Speed interpolation is frame-by-frame (smooth, not instant)
*/
(function initWheel() {
  const hero  = document.getElementById('home');
  const wheel = document.querySelector('.hero-wheel');
  if (!hero || !wheel) return;

  const DEFAULT_DURATION = 120; /* seconds at rest */
  const MIN_DURATION     = 5;   /* faster maximum speed */
  const INACTIVITY_MS    = 3000;/* ms before slowing */
  const RAMP_SPEED       = 0.45;/* Fast ramping for instant feedback */

  let currentDuration = DEFAULT_DURATION;
  let targetDuration  = DEFAULT_DURATION;
  let inactivityTimer = null;
  let rafId           = null;
  let angle           = 0;
  let lastTime        = null;

  /* Drive rotation via JS so we can change speed mid-spin */
  wheel.style.animation = 'none';
  wheel.style.transformOrigin = '50% 50%';

  function tick(now) {
    if (!lastTime) lastTime = now;
    const delta = (now - lastTime) / 1000; /* seconds */
    lastTime = now;

    /* Smoothly interpolate duration toward target */
    const diff = targetDuration - currentDuration;
    if (Math.abs(diff) > 0.05) {
      /* Increased multiplier for faster ramping */
      currentDuration += diff * RAMP_SPEED * delta * 12;
    } else {
      currentDuration = targetDuration;
    }

    /* Degrees per second = 360 / duration */
    const dps = 360 / currentDuration;
    angle = (angle + dps * delta) % 360;
    wheel.style.transform = `rotate(${angle}deg)`;

    /* Update glow class for visual feedback */
    if (currentDuration < 60) {
      wheel.classList.add('fast');
    } else {
      wheel.classList.remove('fast');
    }

    rafId = requestAnimationFrame(tick);
  }

  /* Start the loop */
  rafId = requestAnimationFrame(tick);

  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      targetDuration = DEFAULT_DURATION;
    }, INACTIVITY_MS);
  }

  function handleInteraction(e) {
    /* If it's a click, we increase speed incrementally */
    if (e.type === 'click') {
      /* Decrease target duration = increase speed */
      /* Subtracting 35 makes it get fast in ~3 clicks */
      targetDuration = Math.max(MIN_DURATION, targetDuration - 35);
    }
    
    resetInactivityTimer();
  }

  /* Listen for clicks inside the hero to increase speed */
  hero.addEventListener('click', handleInteraction);
  
  /* We can keep mousemove just to PREVENT slowing down if they are moving, 
     but NOT to increase speed, per user request. */
  hero.addEventListener('mousemove', () => {
    if (targetDuration < DEFAULT_DURATION) {
      resetInactivityTimer();
    }
  }, { passive: true });

  /* Pause animation when page is hidden to save resources */
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
      /* Stagger each card slightly */
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

  /* URL provided by the user */
  const scriptURL = "https://script.google.com/macros/s/AKfycbxGAcQ2lAMCQT34LsK1S1iaOhdY2xI8vQ1-Esvo876KnfxPOrBHdbbJwBoLpk7IhNxXew/exec";

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const btn = this.querySelector('.form-submit');
    const originalBtnText = btn.textContent;

    /* Visual feedback: Loading state */
    btn.textContent = 'Sending... ⏳';
    btn.disabled = true;

    /* 
       Prepare the data exactly as your script expects.
       We capture individual values to ensure keys match your sheet columns.
    */
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

    /* 
       CRITICAL: We use "text/plain" instead of "application/json".
       Google Apps Script can still parse this as JSON, but "text/plain" 
       prevents the browser from sending a CORS preflight (OPTIONS) request,
       which is what usually causes the "Error! Try again" (Failed to fetch) msg.
    */
    fetch(scriptURL, {
      method: "POST",
      mode: "no-cors", /* Ensures the request is sent even if CORS is strict */
      body: JSON.stringify(formData),
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      }
    })
    .then(() => {
      /* 
         With "no-cors", we can't read the response body, but since the request 
         is "sent", we treat it as success for the user.
      */
      btn.textContent = 'Request Received! ✓';
      btn.style.background = 'linear-gradient(135deg, #2D6A4F, #40916C)';
      
      /* Reset form after 3.5 seconds */
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


/* ── 07. Creativity Like Button ─────────────────────────── */
(function initLikeButton() {
  const likeBtn = document.getElementById('likeBtn');
  const likeCountEl = document.getElementById('likeCount');
  if (!likeBtn || !likeCountEl) return;

  /* 
     NOTE: To make this globally 'real' across different users, 
     a backend database (like Firebase or Supabase) is required.
     For this project, we simulate the state using localStorage 
     so it stays 'real' for each individual user session.
  */
  const BASE_LIKES = 3; 
  
  /* Check if already liked in this browser */
  const storageKey = 'kalinga_trails_liked';
  let hasLiked = localStorage.getItem(storageKey) === 'true';

  /* Function to update UI */
  function updateUI() {
    if (hasLiked) {
      likeBtn.classList.add('active');
      likeBtn.querySelector('.like-text').textContent = 'Liked! Thanks! ❤';
      likeCountEl.textContent = (BASE_LIKES + 1);
    } else {
      likeBtn.classList.remove('active');
      likeBtn.querySelector('.like-text').textContent = 'Love the creativity?';
      likeCountEl.textContent = BASE_LIKES;
    }
  }

  /* Initial Load */
  updateUI();

  likeBtn.addEventListener('click', () => {
    /* One user can only give a like once in this simulation */
    if (!hasLiked) {
      hasLiked = true;
      localStorage.setItem(storageKey, 'true');
      updateUI();
    } else {
      /* Optional: notify that they already liked */
      console.log('You already gave your love to this project!');
    }
  });
})();
