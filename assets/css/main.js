/* ═══════════════════════════════════════════════════════════════
   B&B VOMERO — main.js · v2.0
   • Navbar: scroll state + underline active
   • Mobile burger menu (with X animation)
   • Scroll-reveal (IntersectionObserver)
   • Parallax leggero hero + discover
   • Back-to-top button
   • WhatsApp button (simulated call)
   • Smooth scroll anchor
   • Cookie banner init (vedi cookie-banner.js)
═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─── NAVBAR ────────────────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  const burger = document.querySelector('.navbar__burger');
  const nav    = document.querySelector('.navbar__nav');

  /* Active link highlight — aggiorna per pagina corrente */
  (function setActiveLink () {
    const path    = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = nav ? nav.querySelectorAll('a:not(.btn-nav)') : [];
    navLinks.forEach(a => {
      const href = a.getAttribute('href') || '';
      const target = href.split('/').pop();
      if (target === path || (path === '' && (target === 'index.html' || target === '#'))) {
        a.classList.add('active');
      }
    });
  })();

  /* Burger menu toggle */
  if (burger && nav) {
    burger.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
      /* Colore burger in base allo stato */
      burger.style.color = isOpen ? 'var(--charcoal)' : '';
    });

    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        burger.style.color = '';
      });
    });

    /* Close on Escape */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        burger.focus();
      }
    });
  }

  /* ─── SCROLL REVEAL ─────────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal-on-scroll');

  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ─── SCROLL EVENT LISTENER ─────────────────────────────────── */
  function onScroll () {
    // Riservato per calcoli scroll ottimizzati
  }

  /* Usa requestAnimationFrame per evitare jank */
  let rafId = null;
  window.addEventListener('scroll', () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      onScroll();
      rafId = null;
    });
  }, { passive: true });

  /* ─── RIAVVIO PAN IN & VIDEO HERO (scroll up & back to top) ─ */
  function restartHeroAndPanAnimations() {
    // Riavvia pan sulle immagini
    const imgs = document.querySelectorAll('.page-hero__img, .camera-img-pan');
    imgs.forEach(img => {
      img.style.animation = 'none';
      void img.offsetWidth;          /* forza il reflow del browser */
      img.style.animation = '';
    });

    // Riavvia video hero dalla testa (non va in loop, si ferma sull'ultimo frame)
    const heroVideo = document.querySelector('.hero video');
    if (heroVideo) {
      try {
        heroVideo.currentTime = 0;
        const playPromise = heroVideo.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      } catch (err) {}
    }
  }

  let awayFromTop = false;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 200) {
      awayFromTop = true;
    } else if (y <= 15 && awayFromTop) {
      awayFromTop = false;
      restartHeroAndPanAnimations();
    }
  }, { passive: true });

  /* ─── BACK TO TOP ───────────────────────────────────────────── */
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('is-visible', window.scrollY > 400);
    }, { passive: true });

    backToTop.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      /* Riattiva video e pan in immediatamente */
      setTimeout(restartHeroAndPanAnimations, 150);
    });
  }

  /* ─── WHATSAPP BUTTON (comparsa lenta, MAI sulla hero) ──────── */
  const waBtn = document.getElementById('whatsapp-btn');
  if (waBtn) {
    const hero = document.querySelector('.hero') || document.querySelector('.page-hero');

    function checkWaVisibility() {
      // Sulla home page / pagine con hero: compare solo oltre l'altezza della hero
      const threshold = hero ? (hero.offsetHeight - 40) : 300;
      if (window.scrollY > threshold) {
        waBtn.classList.add('is-visible');
      } else {
        waBtn.classList.remove('is-visible');
      }
    }

    window.addEventListener('scroll', checkWaVisibility, { passive: true });
    checkWaVisibility();

    waBtn.addEventListener('click', e => {
      e.preventDefault();
      /* SIMULAZIONE CHIAMATA — sostituire con numero reale in produzione */
      const numero = '+390811847320';
      showWhatsAppModal(numero);
    });
  }

  function showWhatsAppModal (numero) {
    /* Crea overlay modale minimal */
    if (document.getElementById('wa-modal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'wa-modal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Contatto WhatsApp');
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 9000;
      background: rgba(30,30,27,0.6);
      backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center;
      padding: 2rem;
      animation: fadeIn 0.35s ease;
    `;

    overlay.innerHTML = `
      <div style="
        background: var(--warm-white, #fffdf9);
        max-width: 380px; width: 100%;
        padding: 3rem 2.5rem;
        text-align: center;
        font-family: 'Jost', sans-serif;
      ">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="#3d4a35" style="margin:0 auto 1.5rem" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.549 4.103 1.513 5.833L0 24l6.338-1.493A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.806 9.806 0 01-5.004-1.37l-.359-.213-3.764.887.902-3.67-.233-.376A9.78 9.78 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
        </svg>
        <p style="font-family:'Cormorant Garamond',serif;font-size:1.5rem;font-weight:300;margin-bottom:0.75rem;color:#1e1e1b">
          Contatta il B&amp;B
        </p>
        <p style="font-size:0.9rem;line-height:1.7;color:#6b6660;margin-bottom:2rem">
          In produzione, questo pulsante aprirà direttamente una chat WhatsApp con l'host.<br><br>
          <strong style="color:#1e1e1b">${numero}</strong>
        </p>
        <button id="wa-modal-close" style="
          display:inline-flex;align-items:center;justify-content:center;
          min-height:44px;padding:0.75rem 2rem;
          background:#3d4a35;color:#fff;
          font-family:'Jost',sans-serif;font-size:0.75rem;font-weight:500;
          letter-spacing:0.15em;text-transform:uppercase;
          border:none;cursor:pointer;width:100%;
        ">Chiudi</button>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = '@keyframes fadeIn{from{opacity:0}to{opacity:1}}';
    document.head.appendChild(style);
    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector('#wa-modal-close');
    closeBtn.focus();

    function closeModal () {
      overlay.remove();
      style.remove();
    }

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', function esc (e) {
      if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', esc); }
    });
  }

  /* ─── SMOOTH ANCHOR ─────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

})();
