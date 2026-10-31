/* ==========================================================================
   VERSIONE B - comportamenti
   Nessuna dipendenza. Se JavaScript non parte, il sito resta leggibile e i moduli
   (barra date) inviano comunque i dati alla pagina Contatti.
   Moduli: header e menu · reveal · video hero · date · modulo richiesta ·
           tab · mappa su richiesta · avviso cookie · barra mobile · chip camere
   ========================================================================== */
(function () {
  'use strict';

  var SITE = window.SITE || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desktop = window.matchMedia('(min-width: 900px)');

  /* ---------- Header e menu mobile ---------- */
  var header = $('[data-header]');
  var toggle = $('[data-nav-toggle]');
  var nav = $('[data-nav]');
  var toggleLabel = $('[data-nav-toggle-label]');

  function onScroll() {
    if (header && header.classList.contains('site-header--overlay')) {
      header.classList.toggle('is-solid', window.scrollY > 24);
    }
  }

  function setMenu(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle('is-open', open);
    header.classList.toggle('is-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (toggleLabel) toggleLabel.textContent = open ? 'Chiudi il menu' : 'Apri il menu';
    document.body.classList.toggle('is-locked', open);
    if (open) {
      var first = $('a', nav);
      if (first) window.requestAnimationFrame(function () { first.focus(); });
    }
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) {
      if (!nav.classList.contains('is-open')) return;
      if (e.key === 'Escape') { setMenu(false); toggle.focus(); return; }
      if (e.key === 'Tab') {
        var items = [toggle].concat($$('a, button', nav)).filter(function (el) { return el.offsetParent !== null; });
        var firstEl = items[0], lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
        else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
      }
    });
    desktop.addEventListener('change', function (e) { if (e.matches) setMenu(false); });
  }

  /* ---------- Reveal allo scroll ---------- */
  var reveals = $$('.reveal');
  if (reveals.length) {
    if ('IntersectionObserver' in window && !reduced) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add('is-in'); });
    }
  }

  /* ---------- Hero: diapositive con effetto Ken Burns ----------
     Ogni foto resta 7 s con zoom e panoramica lenti, poi si dissolve nella successiva.
     Con prefers-reduced-motion resta ferma la prima foto. Il pulsante di pausa ferma tutto
     (WCAG 2.2.2); la rotazione si ferma anche quando la hero esce dallo schermo o la scheda è in secondo piano. */
  var heroEl = $('.hero');
  var slides = $$('.hero__slide');
  var pauseBtn = $('[data-hero-pause]');
  if (heroEl && slides.length > 1 && !reduced) {
    var SLIDE_MS = 7000, FADE_MS = 1900;
    var idx = 0, timer = null, userPaused = false, heroVisible = true;

    var build = function (el) {
      if (el.querySelector('img') || !el.getAttribute('data-slide-img')) return el.querySelector('img');
      var d = JSON.parse(el.getAttribute('data-slide-img'));
      var img = new Image();
      img.decoding = 'async'; img.sizes = '100vw'; img.srcset = d.srcset; img.src = d.src;
      img.width = d.w; img.height = d.h; img.alt = d.alt;
      el.appendChild(img);
      return img;
    };
    var whenReady = function (img, cb) {
      if (!img || img.complete) { cb(); return; }
      var done = function () { img.removeEventListener('load', done); img.removeEventListener('error', done); cb(); };
      img.addEventListener('load', done); img.addEventListener('error', done);
    };
    var show = function (n) {
      var prev = slides[idx], next = slides[n];
      whenReady(build(next), function () {
        prev.classList.remove('is-active'); prev.classList.add('is-leaving');
        next.classList.add('is-active');
        window.setTimeout(function () { prev.classList.remove('is-leaving'); }, FADE_MS);
        idx = n;
        build(slides[(n + 1) % slides.length]);   // prepara già la successiva
      });
    };
    var stop = function () { if (timer) { window.clearInterval(timer); timer = null; } };
    var sync = function () {
      var run = !userPaused && heroVisible && !document.hidden;
      if (run && !timer) timer = window.setInterval(function () { show((idx + 1) % slides.length); }, SLIDE_MS);
      if (!run) stop();
    };

    heroEl.classList.add('is-sliding');
    var preload = function () { build(slides[1]); };
    if (document.readyState === 'complete') preload(); else window.addEventListener('load', preload, { once: true });
    sync();

    document.addEventListener('visibilitychange', sync);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { heroVisible = entries[0].isIntersecting; sync(); }, { threshold: 0.15 }).observe(heroEl);
    }
    if (pauseBtn) {
      pauseBtn.addEventListener('click', function () {
        userPaused = !userPaused;
        heroEl.classList.toggle('is-paused', userPaused);
        pauseBtn.setAttribute('aria-label', userPaused ? 'Riprendi le immagini' : 'Metti in pausa le immagini');
        $('.icon', pauseBtn).className = 'icon ' + (userPaused ? 'i-play' : 'i-pause');
        sync();
      });
    }
  }

  /* ---------- Date: minimi, notti, partenza automatica ---------- */
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function toIso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseIso(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function addDays(d, n) { var c = new Date(d.getTime()); c.setDate(c.getDate() + n); return c; }
  function nightsBetween(a, b) { return Math.round((parseIso(b) - parseIso(a)) / 86400000); }
  function longDate(iso) {
    return parseIso(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function wireDates(inEl, outEl, nightsEl) {
    if (!inEl || !outEl) return;
    var today = new Date(); today.setHours(0, 0, 0, 0);
    inEl.min = toIso(today);
    outEl.min = toIso(addDays(today, 1));
    function update() {
      if (!nightsEl) return;
      var n = inEl.value && outEl.value ? nightsBetween(inEl.value, outEl.value) : 0;
      nightsEl.textContent = n > 0 ? n + (n === 1 ? ' notte. ' : ' notti. ') : '';
    }
    inEl.addEventListener('change', function () {
      if (!inEl.value) { update(); return; }
      var min = addDays(parseIso(inEl.value), 1);
      outEl.min = toIso(min);
      if (!outEl.value || parseIso(outEl.value) < min) outEl.value = toIso(min);
      update();
    });
    outEl.addEventListener('change', update);
    update();
  }

  var booking = $('[data-booking]');
  if (booking) wireDates($('[name="checkin"]', booking), $('[name="checkout"]', booking), $('[data-nights]', booking));

  /* ---------- Modulo richiesta ---------- */
  var form = $('[data-request]');
  if (form) {
    var fIn = $('[name="checkin"]', form), fOut = $('[name="checkout"]', form);
    wireDates(fIn, fOut, null);

    // precompilazione da link (?camera=suite&checkin=2026-12-01&checkout=2026-12-03&ospiti=2)
    var qs = new URLSearchParams(window.location.search);
    if (qs.get('checkin') && /^\d{4}-\d{2}-\d{2}$/.test(qs.get('checkin'))) { fIn.value = qs.get('checkin'); fIn.dispatchEvent(new Event('change')); }
    if (qs.get('checkout') && /^\d{4}-\d{2}-\d{2}$/.test(qs.get('checkout'))) fOut.value = qs.get('checkout');
    if (qs.get('ospiti')) { var g = $('[name="ospiti"]', form); if ($('option[value="' + qs.get('ospiti') + '"]', g)) g.value = qs.get('ospiti'); }
    if (qs.get('camera')) { var r = $('[name="camera"][value="' + qs.get('camera') + '"]', form); if (r) r.checked = true; }

    var status = $('[data-form-status]', form);
    var submitBtn = $('[data-submit]', form);
    var done = $('[data-request-done]');

    var validators = {
      checkin: function (f) { return f.checkin.value ? '' : 'Inserisci la data di arrivo.'; },
      checkout: function (f) {
        if (!f.checkout.value) return 'Inserisci la data di partenza.';
        if (f.checkin.value && f.checkout.value <= f.checkin.value) return 'La partenza deve essere dopo l’arrivo.';
        return '';
      },
      nome: function (f) { return f.nome.value.trim().length > 1 ? '' : 'Inserisci il tuo nome e cognome.'; },
      email: function (f) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.value.trim()) ? '' : 'Inserisci un indirizzo email valido, ad esempio nome@email.it.'; },
      privacy: function (f) { return f.privacy.checked ? '' : 'Accetta l’informativa per inviare la richiesta.'; }
    };

    function showError(name, msg) {
      var input = form.elements[name];
      var field = input.closest('.field');
      var err = $('[data-error]', field);
      if (msg) {
        field.setAttribute('data-invalid', '');
        input.setAttribute('aria-invalid', 'true');
        err.textContent = msg; err.hidden = false;
      } else {
        field.removeAttribute('data-invalid');
        input.removeAttribute('aria-invalid');
        err.textContent = ''; err.hidden = true;
      }
    }

    Object.keys(validators).forEach(function (name) {
      var el = form.elements[name];
      var ev = el.type === 'checkbox' ? 'change' : 'blur';
      el.addEventListener(ev, function () { showError(name, validators[name](form.elements)); });
      el.addEventListener('input', function () {
        if (el.closest('.field').hasAttribute('data-invalid')) showError(name, validators[name](form.elements));
      });
    });
    fIn.addEventListener('change', function () { if (fOut.value) showError('checkout', validators.checkout(form.elements)); });

    function collect() {
      var f = form.elements;
      var room = $('[name="camera"]:checked', form);
      var roomLabel = room && room.value ? $('span', room.parentNode).textContent : 'Nessuna preferenza';
      var nights = nightsBetween(f.checkin.value, f.checkout.value);
      return {
        checkin: f.checkin.value, checkout: f.checkout.value, nights: nights,
        guests: f.ospiti.value, room: roomLabel,
        name: f.nome.value.trim(), email: f.email.value.trim(), phone: f.telefono.value.trim(), message: f.messaggio.value.trim()
      };
    }

    function summary(d) {
      var lines = [
        'Richiesta di disponibilità - ' + (SITE.brand || ''),
        'Arrivo: ' + longDate(d.checkin) + ' · Partenza: ' + longDate(d.checkout) + ' (' + d.nights + (d.nights === 1 ? ' notte' : ' notti') + ')',
        'Ospiti: ' + d.guests,
        'Camera: ' + d.room,
        'Nome: ' + d.name,
        'Email: ' + d.email
      ];
      if (d.phone) lines.push('Telefono: ' + d.phone);
      if (d.message) lines.push('Note: ' + d.message);
      return lines.join('\n');
    }

    function showDone(title, text, d, withActions) {
      $('[data-done-title]', done).textContent = title;
      $('[data-done-text]', done).textContent = text;
      var sum = $('[data-done-summary]', done);
      var actions = $('[data-done-actions]', done);
      sum.textContent = summary(d);
      actions.innerHTML = '';
      if (withActions) {
        var msg = summary(d);
        var wa = document.createElement('a');
        wa.className = 'btn btn--primary'; wa.target = '_blank'; wa.rel = 'noopener';
        wa.href = 'https://wa.me/' + SITE.whatsapp + '?text=' + encodeURIComponent(msg);
        wa.textContent = 'Invia su WhatsApp';
        var mail = document.createElement('a');
        mail.className = 'btn btn--secondary';
        mail.href = 'mailto:' + SITE.email + '?subject=' + encodeURIComponent('Richiesta di disponibilità') + '&body=' + encodeURIComponent(msg);
        mail.textContent = 'Invia via email';
        actions.appendChild(wa); actions.appendChild(mail);
      }
      form.hidden = true;
      var intro = form.parentNode.querySelector('.note'); if (intro) intro.hidden = true;
      done.hidden = false;
      done.focus();
      done.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      Object.keys(validators).forEach(function (name) {
        var msg = validators[name](form.elements);
        showError(name, msg);
        if (msg && !firstBad) firstBad = form.elements[name];
      });
      if (firstBad) {
        status.setAttribute('data-state', 'error');
        status.textContent = 'Controlla i campi evidenziati e riprova.';
        firstBad.focus();
        return;
      }
      status.removeAttribute('data-state'); status.textContent = '';
      var data = collect();

      if (SITE.formEndpoint) {
        submitBtn.disabled = true; var label = submitBtn.textContent; submitBtn.textContent = 'Invio in corso…';
        fetch(SITE.formEndpoint, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ nome: data.name, email: data.email, telefono: data.phone, arrivo: data.checkin, partenza: data.checkout, ospiti: data.guests, camera: data.room, messaggio: data.message })
        }).then(function (res) {
          if (!res.ok) throw new Error('http ' + res.status);
          showDone('Richiesta inviata', 'Grazie, ' + data.name.split(' ')[0] + '. Ti rispondiamo a ' + data.email + ' entro poche ore.', data, false);
        }).catch(function () {
          status.setAttribute('data-state', 'error');
          status.textContent = 'Non siamo riusciti a inviare la richiesta. Riprova, oppure scrivici su WhatsApp.';
        }).then(function () { submitBtn.disabled = false; submitBtn.textContent = label; });
      } else {
        showDone('Richiesta pronta', 'Ultimo passaggio: invia il messaggio su WhatsApp o via email. Qui sotto trovi il riepilogo. Il sito non conserva i dati che hai inserito.', data, true);
      }
    });

    var reset = $('[data-request-reset]');
    if (reset) reset.addEventListener('click', function () {
      done.hidden = true; form.hidden = false;
      var intro = form.parentNode.querySelector('.note'); if (intro) intro.hidden = false;
      form.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      $('input', form).focus({ preventScroll: true });
    });
  }

  /* ---------- Tab (come arrivare) ---------- */
  $$('[data-tabs]').forEach(function (root) {
    var tabs = $$('[role="tab"]', root);
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        $('#' + t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t, false); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') n = tabs[0];
        else if (e.key === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
  });

  /* ---------- Mappa: si carica solo su richiesta ---------- */
  var map = $('[data-map]');
  if (map) {
    var mapBtn = $('[data-map-load]', map);
    mapBtn.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.title = 'Mappa: dove si trova la struttura';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.src = 'https://www.google.com/maps?q=' + encodeURIComponent(map.getAttribute('data-query')) + '&output=embed';
      map.innerHTML = '';
      map.appendChild(f);
    });
  }

  /* ---------- Avviso informativo sui cookie (solo cookie tecnici) ----------
     Non è un banner di consenso: con soli cookie tecnici il consenso non serve (Garante, Linee guida
     10/6/2021, par. 7.1). Compare una sola volta, nella home, all'apertura alla prima visita
     (in alto, per non coprire il modulo date). "?avviso" nell'indirizzo lo mostra di nuovo per le prove;
     il link "#cb-open" nelle pagine legali lo mostra su richiesta. */
  var notice = $('[data-notice]');
  var NKEY = 'bb_notice_v1';
  function noticeSeen() { try { return localStorage.getItem(NKEY) === '1'; } catch (e) { return false; } }
  function markNoticeSeen() { try { localStorage.setItem(NKEY, '1'); } catch (e) { /* modalità privata: nessun problema */ } }
  if (notice) {
    var forced = /[?&]avviso(=|&|$)/.test(window.location.search);
    if (document.body.classList.contains('page-home') && (forced || !noticeSeen())) {
      window.setTimeout(function () { notice.hidden = false; markNoticeSeen(); }, 700);
    }
    $('[data-notice-close]', notice).addEventListener('click', function () { notice.hidden = true; markNoticeSeen(); });
    $$('a[href="#cb-open"]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); notice.hidden = false; });
    });
  }

  /* ---------- Pulsante "torna su" ---------- */
  var totop = $('[data-totop]');
  function updateTop() {
    if (totop) totop.classList.toggle('is-visible', window.scrollY > 700);
  }
  if (totop) {
    totop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      var brand = $('.brand');          // il focus torna in cima, così chi usa la tastiera non lo perde
      if (brand) brand.focus({ preventScroll: true });
    });
  }

  /* ---------- Barra mobile: dopo la hero, nascosta vicino al footer ---------- */
  var bar = $('[data-actionbar]');
  var hero = $('.hero');
  var footer = $('.site-footer');
  function updateBar() {
    if (!bar) return;
    var past = window.scrollY > (hero ? hero.offsetHeight - 160 : 320);
    var nearFooter = footer ? footer.getBoundingClientRect().top < window.innerHeight - 80 : false;
    var show = past && !nearFooter;
    bar.classList.toggle('is-visible', show);
    document.body.classList.toggle('has-actionbar', show && !desktop.matches);
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { onScroll(); updateBar(); updateTop(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', updateBar);
  onScroll(); updateBar(); updateTop();

  /* ---------- Chip camere: evidenzia la sezione visibile ---------- */
  var chipnav = $('[data-chipnav]');
  if (chipnav && 'IntersectionObserver' in window) {
    var links = $$('a[href^="#"]', chipnav);
    var map2 = {};
    links.forEach(function (a) { map2[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
        var a = map2[en.target.id];
        if (a) { a.classList.add('is-active'); a.setAttribute('aria-current', 'true'); }
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    Object.keys(map2).forEach(function (id) { var el = document.getElementById(id); if (el) spy.observe(el); });
  }
}());
