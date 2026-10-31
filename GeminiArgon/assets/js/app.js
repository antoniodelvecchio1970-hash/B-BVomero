/* ==========================================================================
   GEMINI ARGON — Client-Side Logic (Zero Dependencies)
   - Menu mobile full-screen con focus trap e chiusura Esc
   - Hero slideshow con pausa accessibile e fetchpriority="low" sulle slide secondarie
   - Precompilazione date intelligenti (domani -> +2 notti) e persistenza
   - Validazione form (:user-invalid + WeakMap fallback + sync aria-invalid)
   - Tab accessibili da tastiera, Mappa on-demand, Subnav scroll-spy, Barra pollice
   ========================================================================== */
(function () {
  'use strict';

  var SITE = window.SITE || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desktopMq = window.matchMedia('(min-width: 960px)');

  /* ---------- 1. Header & Menu Mobile ---------- */
  var header = $('[data-header]');
  var navToggle = $('[data-nav-toggle]');
  var nav = $('[data-nav]');
  var navToggleLabel = $('[data-nav-toggle-label]');

  function syncHeaderScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 220);
  }

  function setMenuOpen(open) {
    if (!nav || !navToggle) return;
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    if (navToggleLabel) {
      navToggleLabel.textContent = open ? 'Chiudi menu' : 'Menu';
    }
    document.body.classList.toggle('is-locked', open);
    if (open) {
      var firstLink = $('a', nav);
      if (firstLink) {
        window.requestAnimationFrame(function () { firstLink.focus(); });
      }
    }
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      setMenuOpen(!nav.classList.contains('is-open'));
    });

    $$('a', nav).forEach(function (link) {
      link.addEventListener('click', function () { setMenuOpen(false); });
    });

    document.addEventListener('keydown', function (e) {
      if (!nav.classList.contains('is-open')) return;
      if (e.key === 'Escape') {
        setMenuOpen(false);
        navToggle.focus();
        return;
      }
      if (e.key === 'Tab') {
        var focusables = [navToggle].concat($$('a, button', nav)).filter(function (el) {
          return el.offsetParent !== null;
        });
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    desktopMq.addEventListener('change', function (e) {
      if (e.matches) setMenuOpen(false);
    });
  }

  /* ---------- 2. Reveal allo scroll ---------- */
  var reveals = $$('.reveal');
  if (reveals.length) {
    if ('IntersectionObserver' in window && !reducedMotion) {
      var revObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            revObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
      reveals.forEach(function (el) { revObserver.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add('is-in'); });
    }
  }

  /* ---------- 3. Hero Slideshow (Modern Web Guidance: optimize-image-priority) ---------- */
  var heroEl = $('.hero');
  var slides = $$('.hero__slide');
  var pauseBtn = $('[data-hero-pause]');
  var counterEl = $('[data-hero-counter]');

  if (heroEl && slides.length > 1 && !reducedMotion) {
    var SLIDE_INTERVAL = 6500;
    var currentIdx = 0;
    var slideTimer = null;
    var pausedByUser = false;
    var heroInView = true;

    var ensureSlideImg = function (slideEl) {
      var existing = $('img', slideEl);
      if (existing || !slideEl.getAttribute('data-slide-img')) return existing;
      var meta = JSON.parse(slideEl.getAttribute('data-slide-img'));
      var img = new Image();
      img.decoding = 'async';
      img.loading = 'lazy';
      img.setAttribute('fetchpriority', 'low');
      img.sizes = '(min-width: 960px) 480px, 94vw';
      img.srcset = meta.srcset;
      img.src = meta.src;
      img.width = meta.w;
      img.height = meta.h;
      img.alt = meta.alt;
      slideEl.appendChild(img);
      return img;
    };

    var showSlide = function (nextIdx) {
      var nextSlide = slides[nextIdx];
      var img = ensureSlideImg(nextSlide);
      var activate = function () {
        slides[currentIdx].classList.remove('is-active');
        nextSlide.classList.add('is-active');
        currentIdx = nextIdx;
        if (counterEl) {
          counterEl.textContent = '0' + (currentIdx + 1) + ' / 0' + slides.length;
        }
        ensureSlideImg(slides[(nextIdx + 1) % slides.length]);
      };
      if (!img || img.complete) {
        activate();
      } else {
        img.addEventListener('load', activate, { once: true });
      }
    };

    var syncTimer = function () {
      var shouldRun = !pausedByUser && heroInView && !document.hidden;
      if (shouldRun && !slideTimer) {
        slideTimer = window.setInterval(function () {
          showSlide((currentIdx + 1) % slides.length);
        }, SLIDE_INTERVAL);
      } else if (!shouldRun && slideTimer) {
        window.clearInterval(slideTimer);
        slideTimer = null;
      }
    };

    heroEl.classList.add('is-sliding');
    window.addEventListener('load', function () {
      ensureSlideImg(slides[1]);
    }, { once: true });
    syncTimer();

    document.addEventListener('visibilitychange', syncTimer);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        heroInView = entries[0].isIntersecting;
        syncTimer();
      }, { threshold: 0.15 }).observe(heroEl);
    }

    if (pauseBtn) {
      pauseBtn.addEventListener('click', function () {
        pausedByUser = !pausedByUser;
        heroEl.classList.toggle('is-paused', pausedByUser);
        pauseBtn.setAttribute('aria-pressed', String(pausedByUser));
        pauseBtn.setAttribute('aria-label', pausedByUser ? 'Avvia scorrimento foto' : 'Metti in pausa le foto');
        var iconSpan = $('.icon', pauseBtn);
        if (iconSpan) {
          iconSpan.className = 'icon ' + (pausedByUser ? 'i-play' : 'i-pause');
        }
        syncTimer();
      });
    }
  }

  /* ---------- 4. Gestione Date & Precompilazione (/ux-ui Regola 1 & 3) ---------- */
  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function formatIso(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function parseIso(s) {
    var p = s.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  function addDays(d, days) {
    var copy = new Date(d.getTime());
    copy.setDate(copy.getDate() + days);
    return copy;
  }
  function countNights(a, b) {
    return Math.round((parseIso(b) - parseIso(a)) / 86400000);
  }
  function formatLongDate(iso) {
    return parseIso(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function setupDateInputs(inInput, outInput, nightsOut, prefillDefault) {
    if (!inInput || !outInput) return;
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var tomorrow = addDays(today, 1);
    var defaultOut = addDays(today, 3);

    inInput.min = formatIso(today);
    outInput.min = formatIso(tomorrow);

    // Recupera da sessionStorage o precompila domani -> +2 notti
    try {
      var savedIn = sessionStorage.getItem('bb_checkin');
      var savedOut = sessionStorage.getItem('bb_checkout');
      if (!inInput.value && savedIn && savedIn >= formatIso(today)) inInput.value = savedIn;
      if (!outInput.value && savedOut && savedOut > inInput.value) outInput.value = savedOut;
    } catch (e) {}

    if (prefillDefault) {
      if (!inInput.value) inInput.value = formatIso(tomorrow);
      if (!outInput.value || outInput.value <= inInput.value) outInput.value = formatIso(defaultOut);
    }

    function refreshNights() {
      try {
        if (inInput.value) sessionStorage.setItem('bb_checkin', inInput.value);
        if (outInput.value) sessionStorage.setItem('bb_checkout', outInput.value);
      } catch (e) {}
      if (!nightsOut) return;
      var n = (inInput.value && outInput.value) ? countNights(inInput.value, outInput.value) : 0;
      nightsOut.textContent = n > 0 ? (n + (n === 1 ? ' notte selezionata · ' : ' notti selezionate · ')) : '';
    }

    inInput.addEventListener('change', function () {
      if (!inInput.value) { refreshNights(); return; }
      var minOut = addDays(parseIso(inInput.value), 1);
      outInput.min = formatIso(minOut);
      if (!outInput.value || parseIso(outInput.value) < minOut) {
        outInput.value = formatIso(minOut);
      }
      refreshNights();
    });

    outInput.addEventListener('change', refreshNights);
    refreshNights();
  }

  var heroBooking = $('[data-booking]');
  if (heroBooking) {
    setupDateInputs(
      $('[name="checkin"]', heroBooking),
      $('[name="checkout"]', heroBooking),
      $('[data-nights]', heroBooking),
      true
    );
  }

  /* ---------- 5. Validazione Accessibile Modern Web Guidance (:user-invalid + aria-invalid) ---------- */
  var updateAriaInvalid = function (event) {
    var input = event.target;
    if (!input || !input.matches || !input.matches('input, textarea, select')) return;
    if (CSS.supports && CSS.supports('selector(:user-invalid)')) {
      var isUserInvalid = input.matches(':user-invalid');
      if (isUserInvalid) {
        input.setAttribute('aria-invalid', 'true');
      } else {
        input.removeAttribute('aria-invalid');
      }
    }
  };

  document.addEventListener('blur', updateAriaInvalid, true);
  document.addEventListener('focus', updateAriaInvalid, true);
  document.addEventListener('input', function (event) {
    var input = event.target;
    if (!input || !input.matches || !input.matches('input, textarea, select')) return;
    if (input.getAttribute('aria-invalid') === 'true') {
      updateAriaInvalid(event);
    }
  });

  // Fallback WeakMap per browser senza supporto :user-invalid
  var UserInvalidFallback = (function () {
    var dirtyState = new WeakMap();
    var updateState = function (input) {
      var isValid = input.checkValidity();
      input.classList.toggle('user-invalid-fallback', !isValid);
      input.classList.toggle('user-valid-fallback', isValid);
      if (!isValid) {
        input.setAttribute('aria-invalid', 'true');
      } else {
        input.removeAttribute('aria-invalid');
      }
    };
    var handleEvent = function (event) {
      var input = event.target;
      if (event.type === 'reset' && input.matches && input.matches('form')) {
        var controls = input.elements || [];
        for (var i = 0; i < controls.length; i++) {
          dirtyState.delete(controls[i]);
          controls[i].classList.remove('user-invalid-fallback', 'user-valid-fallback');
          controls[i].removeAttribute('aria-invalid');
        }
        return;
      }
      if (!input || !input.matches || !input.matches('input, textarea, select')) return;
      var state = dirtyState.get(input) || { hasInteracted: false, hasBlurred: false };
      if (event.type === 'input' || event.type === 'change') {
        state.hasInteracted = true;
        dirtyState.set(input, state);
        if (state.hasBlurred) updateState(input);
      } else if (event.type === 'blur') {
        state.hasBlurred = true;
        dirtyState.set(input, state);
        if (state.hasInteracted) updateState(input);
      }
    };
    var init = function () {
      if (window.CSS && CSS.supports && CSS.supports('selector(:user-invalid)')) return;
      document.addEventListener('blur', handleEvent, true);
      document.addEventListener('input', handleEvent, true);
      document.addEventListener('change', handleEvent, true);
      document.addEventListener('reset', handleEvent, true);
    };
    return { init: init };
  })();
  UserInvalidFallback.init();

  /* ---------- 6. Modulo Richiesta Disponibilità (contatti.html) ---------- */
  var reqForm = $('[data-request]');
  if (reqForm) {
    var fIn = $('[name="checkin"]', reqForm);
    var fOut = $('[name="checkout"]', reqForm);
    setupDateInputs(fIn, fOut, null, true);

    var params = new URLSearchParams(window.location.search);
    if (params.get('checkin') && /^\d{4}-\d{2}-\d{2}$/.test(params.get('checkin'))) {
      fIn.value = params.get('checkin');
      fIn.dispatchEvent(new Event('change'));
    }
    if (params.get('checkout') && /^\d{4}-\d{2}-\d{2}$/.test(params.get('checkout'))) {
      fOut.value = params.get('checkout');
    }
    if (params.get('ospiti')) {
      var gSel = $('[name="ospiti"]', reqForm);
      if (gSel && $('option[value="' + params.get('ospiti') + '"]', gSel)) {
        gSel.value = params.get('ospiti');
      }
    }
    if (params.get('camera')) {
      var camRadio = $('[name="camera"][value="' + params.get('camera') + '"]', reqForm);
      if (camRadio) camRadio.checked = true;
    }

    var formStatus = $('[data-form-status]', reqForm);
    var submitBtn = $('[data-submit]', reqForm);
    var doneBox = $('[data-request-done]');

    var rules = {
      checkin: function (els) { return els.checkin.value ? '' : 'Indica la data di arrivo prevista.'; },
      checkout: function (els) {
        if (!els.checkout.value) return 'Indica la data di partenza prevista.';
        if (els.checkin.value && els.checkout.value <= els.checkin.value) {
          return 'La data di partenza deve essere successiva alla data di arrivo.';
        }
        return '';
      },
      nome: function (els) { return els.nome.value.trim().length > 1 ? '' : 'Inserisci il tuo nome e cognome.'; },
      email: function (els) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(els.email.value.trim())
          ? ''
          : 'Inserisci un indirizzo email valido (es. nome@dominio.it).';
      },
      privacy: function (els) {
        return els.privacy.checked ? '' : 'Conferma di aver letto l’informativa privacy per proseguire.';
      }
    };

    function setFieldError(name, message) {
      var input = reqForm.elements[name];
      if (!input) return;
      var field = input.closest('.field');
      var errEl = $('[data-error]', field);
      if (message) {
        field.setAttribute('data-invalid', '');
        input.setAttribute('aria-invalid', 'true');
        if (errEl) { errEl.textContent = message; errEl.hidden = false; }
      } else {
        field.removeAttribute('data-invalid');
        input.removeAttribute('aria-invalid');
        if (errEl) { errEl.textContent = ''; errEl.hidden = true; }
      }
    }

    Object.keys(rules).forEach(function (name) {
      var input = reqForm.elements[name];
      if (!input) return;
      var evName = input.type === 'checkbox' ? 'change' : 'blur';
      input.addEventListener(evName, function () {
        setFieldError(name, rules[name](reqForm.elements));
      });
      input.addEventListener('input', function () {
        if (input.closest('.field').hasAttribute('data-invalid')) {
          setFieldError(name, rules[name](reqForm.elements));
        }
      });
    });

    function buildPayload() {
      var els = reqForm.elements;
      var checkedRoom = $('[name="camera"]:checked', reqForm);
      var roomName = checkedRoom && checkedRoom.value
        ? $('span', checkedRoom.parentNode).textContent
        : 'Qualsiasi camera disponibile';
      var nights = countNights(els.checkin.value, els.checkout.value);
      return {
        checkin: els.checkin.value,
        checkout: els.checkout.value,
        nights: nights,
        guests: els.ospiti.value,
        room: roomName,
        name: els.nome.value.trim(),
        email: els.email.value.trim(),
        phone: els.telefono.value.trim(),
        message: els.messaggio.value.trim()
      };
    }

    function formatSummary(d) {
      var lines = [
        'Richiesta di disponibilità — ' + (SITE.brand || 'B&B Vomero'),
        'Arrivo: ' + formatLongDate(d.checkin) + ' · Partenza: ' + formatLongDate(d.checkout) + ' (' + d.nights + (d.nights === 1 ? ' notte' : ' notti') + ')',
        'Ospiti: ' + d.guests,
        'Camera preferita: ' + d.room,
        'Ospite: ' + d.name,
        'Email: ' + d.email
      ];
      if (d.phone) lines.push('Telefono: ' + d.phone);
      if (d.message) lines.push('Note: ' + d.message);
      return lines.join('\n');
    }

    reqForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstInvalid = null;
      Object.keys(rules).forEach(function (name) {
        var msg = rules[name](reqForm.elements);
        setFieldError(name, msg);
        if (msg && !firstInvalid) firstInvalid = reqForm.elements[name];
      });

      if (firstInvalid) {
        if (formStatus) {
          formStatus.setAttribute('data-state', 'error');
          formStatus.textContent = 'Verifica i campi evidenziati in rosso per completare la richiesta.';
        }
        firstInvalid.focus();
        return;
      }

      if (formStatus) {
        formStatus.removeAttribute('data-state');
        formStatus.textContent = '';
      }

      var data = buildPayload();
      var summaryText = formatSummary(data);

      $('[data-done-title]', doneBox).textContent = 'Riepilogo richiesta pronto';
      $('[data-done-text]', doneBox).textContent =
        'Grazie ' + data.name.split(' ')[0] + '. Scegli come inviarci il riepilogo qui sotto (WhatsApp immediato o Email). Rispondiamo entro 2 ore con disponibilità e tariffa.';
      $('[data-done-summary]', doneBox).textContent = summaryText;

      var actionsWrap = $('[data-done-actions]', doneBox);
      actionsWrap.innerHTML = '';

      var waBtn = document.createElement('a');
      waBtn.className = 'btn btn--primary';
      waBtn.target = '_blank';
      waBtn.rel = 'noopener';
      waBtn.href = 'https://wa.me/' + SITE.whatsapp + '?text=' + encodeURIComponent(summaryText);
      waBtn.textContent = 'Invia ora su WhatsApp';

      var mailBtn = document.createElement('a');
      mailBtn.className = 'btn btn--secondary';
      mailBtn.href = 'mailto:' + SITE.email + '?subject=' + encodeURIComponent('Richiesta disponibilità — ' + data.name) + '&body=' + encodeURIComponent(summaryText);
      mailBtn.textContent = 'Invia tramite Email';

      actionsWrap.appendChild(waBtn);
      actionsWrap.appendChild(mailBtn);

      reqForm.hidden = true;
      doneBox.hidden = false;
      doneBox.focus();
      doneBox.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' });
    });

    var resetBtn = $('[data-request-reset]');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        doneBox.hidden = true;
        reqForm.hidden = false;
        $('input', reqForm).focus();
      });
    }
  }

  /* ---------- 7. Tab Accessibili (Come Raggiungerci) ---------- */
  $$('[data-tabs]').forEach(function (tabRoot) {
    var tabs = $$('[role="tab"]', tabRoot);
    function activateTab(targetTab, focusIt) {
      tabs.forEach(function (t) {
        var selected = t === targetTab;
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;
        var panel = $('#' + t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !selected;
      });
      if (focusIt) targetTab.focus();
    }
    tabs.forEach(function (tab, idx) {
      tab.addEventListener('click', function () { activateTab(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = tabs[(idx + 1) % tabs.length];
        else if (e.key === 'ArrowLeft') next = tabs[(idx - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) {
          e.preventDefault();
          activateTab(next, true);
        }
      });
    });
  });

  /* ---------- 8. Mappa Google On-Demand (Privacy by Design) ---------- */
  var mapBox = $('[data-map]');
  if (mapBox) {
    var mapLoadBtn = $('[data-map-load]', mapBox);
    if (mapLoadBtn) {
      mapLoadBtn.addEventListener('click', function () {
        var iframe = document.createElement('iframe');
        iframe.title = 'Mappa interattiva: Via Belvedere 88, Vomero, Napoli';
        iframe.loading = 'lazy';
        iframe.referrerPolicy = 'no-referrer-when-downgrade';
        iframe.src = 'https://www.google.com/maps?q=' + encodeURIComponent(mapBox.getAttribute('data-query')) + '&output=embed';
        mapBox.innerHTML = '';
        mapBox.appendChild(iframe);
      });
    }
  }

  /* ---------- 9. Subnav Sticky Scroll-Spy ---------- */
  var subnav = $('[data-subnav]');
  if (subnav && 'IntersectionObserver' in window) {
    var subLinks = $$('a[href^="#"]', subnav);
    var linkById = {};
    subLinks.forEach(function (a) { linkById[a.getAttribute('href').slice(1)] = a; });
    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        subLinks.forEach(function (a) {
          a.classList.remove('is-active');
          a.removeAttribute('aria-current');
        });
        var activeLink = linkById[entry.target.id];
        if (activeLink) {
          activeLink.classList.add('is-active');
          activeLink.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    Object.keys(linkById).forEach(function (id) {
      var target = document.getElementById(id);
      if (target) spyObserver.observe(target);
    });
  }

  /* ---------- 10. Barra Mobile (Zona del Pollice) & Avviso Cookie Non Invasivo ---------- */
  var thumbBar = $('[data-thumbbar]');
  var footerEl = $('.site-footer');
  var cookieBar = $('[data-cookie-bar]');
  var COOKIE_KEY = 'bb_argon_notice_v1';

  function isCookieSeen() {
    try { return localStorage.getItem(COOKIE_KEY) === '1'; } catch (e) { return false; }
  }
  function setCookieSeen() {
    try { localStorage.setItem(COOKIE_KEY, '1'); } catch (e) {}
  }

  if (cookieBar) {
    var closeCookie = $('[data-cookie-close]', cookieBar);
    if (closeCookie) {
      closeCookie.addEventListener('click', function () {
        cookieBar.hidden = true;
        setCookieSeen();
      });
    }
    $$('a[href="#cb-open"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        cookieBar.hidden = false;
      });
    });
    if (/[?&]avviso(=|&|$)/.test(window.location.search)) {
      cookieBar.hidden = false;
    }
  }

  function onViewportScroll() {
    syncHeaderScroll();
    var scrolledPastHero = window.scrollY > (heroEl ? heroEl.offsetHeight : 340);
    var nearFooter = footerEl ? footerEl.getBoundingClientRect().top < window.innerHeight - 60 : false;

    if (thumbBar) {
      thumbBar.classList.toggle('is-visible', scrolledPastHero && !nearFooter);
    }

    // Regola /ux-ui: nessun avviso copre la prima visualizzazione. Mostrato solo dopo il primo scroll.
    if (cookieBar && cookieBar.hidden && !isCookieSeen() && window.scrollY > 280) {
      cookieBar.hidden = false;
      setCookieSeen();
    }
  }

  var scrollTick = false;
  window.addEventListener('scroll', function () {
    if (scrollTick) return;
    scrollTick = true;
    window.requestAnimationFrame(function () {
      onViewportScroll();
      scrollTick = false;
    });
  }, { passive: true });

  window.addEventListener('resize', onViewportScroll);
  onViewportScroll();
})();
