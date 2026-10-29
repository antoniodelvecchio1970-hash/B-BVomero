/**
 * ═══════════════════════════════════════════════════════════════
 * COOKIE BANNER — B&B Vomero
 * Conformità: GDPR (Reg. UE 2016/679) · ePrivacy Dir. 2002/58/CE
 * Linee guida Garante Privacy Italia — 10 giugno 2021 (rev. 2024)
 * ═══════════════════════════════════════════════════════════════
 *
 * Logica conforme:
 * - Nessun cookie (eccetto tecnici) prima del consenso esplicito
 * - Pari evidenza visiva tra "Accetta" e "Rifiuta" (simmetria)
 * - Chiusura "X" equivale a rifiuto / mantenimento default
 * - Preferenze memorizzate in localStorage (niente cookie di consenso)
 * - Revoca accessibile in qualsiasi momento dal footer (link "#cb-open")
 * - Granularità per categoria (tecnici, analytics, marketing)
 * - Niente "scroll to consent" o dark patterns
 */

(function () {
  'use strict';

  /* ── Chiavi & durata ── */
  const LS_KEY     = 'bbvomero_cookie_consent';
  const LS_EXPIRY  = 'bbvomero_cookie_consent_expiry';
  const MONTHS_6   = 6 * 30 * 24 * 60 * 60 * 1000; // 6 mesi in ms

  /* ── Struttura categorie ── */
  const CATEGORIES = [
    {
      id:       'technical',
      label:    'Cookie Tecnici',
      desc:     'Necessari per il corretto funzionamento del sito. Gestiscono la sessione di navigazione, le preferenze di accessibilità e la sicurezza. Non richiedono consenso ai sensi dell\'art. 122 D.lgs. 196/2003 e Linee guida Garante 2021.',
      required: true,
      default:  true,
    },
    {
      id:       'analytics',
      label:    'Cookie Analitici',
      desc:     'Raccolgono informazioni aggregate sull\'utilizzo del sito (pagine visitate, tempo di permanenza) per migliorare l\'esperienza utente. Richiedono il tuo consenso esplicito.',
      required: false,
      default:  false,
    },
    {
      id:       'marketing',
      label:    'Cookie di Marketing',
      desc:     'Utilizzati per mostrare annunci pertinenti ai tuoi interessi e misurare l\'efficacia delle campagne pubblicitarie. Richiedono il tuo consenso esplicito.',
      required: false,
      default:  false,
    },
  ];

  /* ════════════════════════════════════════
     UTILITÀ
     ════════════════════════════════════════ */

  /** Legge le preferenze salvate. Restituisce null se assenti o scadute. */
  function loadPrefs() {
    try {
      const expiry = localStorage.getItem(LS_EXPIRY);
      if (expiry && Date.now() > parseInt(expiry, 10)) {
        localStorage.removeItem(LS_KEY);
        localStorage.removeItem(LS_EXPIRY);
        return null;
      }
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  /** Salva le preferenze con scadenza 6 mesi. */
  function savePrefs(prefs) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(prefs));
      localStorage.setItem(LS_EXPIRY, String(Date.now() + MONTHS_6));
    } catch (e) { /* localStorage non disponibile */ }
  }

  /** Costruisce l'oggetto preferenze di default (solo tecnici = on). */
  function defaultPrefs() {
    const p = {};
    CATEGORIES.forEach(function (c) { p[c.id] = c.default; });
    return p;
  }

  /* ════════════════════════════════════════
     HTML DEL BANNER
     ════════════════════════════════════════ */

  function buildBannerHTML() {
    return `
      <div class="cb-inner">
        <div class="cb-text">
          <strong>Cookie &amp; Privacy</strong>
          <p>
            Utilizziamo esclusivamente cookie tecnici di sessione, necessari al funzionamento del sito.
            Non usiamo cookie analitici o di profilazione senza il tuo consenso esplicito.
            Leggi la nostra <a href="privacy.html">Privacy Policy</a>
            e la <a href="cookie-policy.html">Cookie Policy</a>.
          </p>
        </div>
        <div class="cb-actions">
          <button class="cb-btn cb-btn--essential" id="cb-reject" type="button">
            Solo essenziali
          </button>
          <button class="cb-btn cb-btn--accept" id="cb-accept-all" type="button">
            Accetta tutto
          </button>
          <button class="cb-btn cb-btn--prefs" id="cb-open-prefs" type="button">
            Preferenze
          </button>
        </div>
      </div>
    `;
  }

  /* ════════════════════════════════════════
     HTML DEL MODALE PREFERENZE
     ════════════════════════════════════════ */

  function buildModalHTML() {
    const cats = CATEGORIES.map(function (c) {
      const control = c.required
        ? `<span class="cb-badge">Sempre attivo</span>`
        : `<label class="cb-toggle" aria-label="Abilita ${c.label}">
             <input type="checkbox" id="cb-toggle-${c.id}" ${c.default ? 'checked' : ''}>
             <span class="cb-toggle__track" aria-hidden="true"></span>
           </label>`;

      return `
        <div class="cb-category">
          <div class="cb-category__row">
            <div>
              <p class="cb-category__name">${c.label}</p>
            </div>
            ${control}
          </div>
          <p class="cb-category__desc">${c.desc}</p>
        </div>
      `;
    }).join('');

    return `
      <div class="cb-modal__panel" role="dialog" aria-modal="true" aria-labelledby="cb-modal-title">
        <div class="cb-modal__header">
          <div>
            <p class="cb-modal__title" id="cb-modal-title">Gestisci preferenze cookie</p>
            <p class="cb-modal__subtitle">
              Puoi personalizzare il tuo consenso per categoria.<br>
              I cookie tecnici non possono essere disattivati.
            </p>
          </div>
          <button class="cb-modal__close" id="cb-modal-close" aria-label="Chiudi" type="button">
            &#x2715;
          </button>
        </div>
        <div class="cb-modal__body">
          ${cats}
        </div>
        <div class="cb-modal__footer">
          <button class="cb-btn cb-btn--essential" id="cb-save-prefs" type="button">
            Salva preferenze
          </button>
          <button class="cb-btn cb-btn--accept" id="cb-accept-all-modal" type="button">
            Accetta tutto
          </button>
        </div>
      </div>
    `;
  }

  /* ════════════════════════════════════════
     INIT
     ════════════════════════════════════════ */

  /**
   * initCookieBanner()
   * Da includere in main.js: chiamata su DOMContentLoaded.
   *
   * Flusso:
   * 1. Se preferenze già salvate (non scadute) → le applica silenziosamente.
   * 2. Se non salvate → mostra banner dopo 600ms (per non bloccare LCP).
   * 3. Azioni utente → salva prefs → nasconde banner → applica consenso.
   */
  function initCookieBanner() {
    const existingPrefs = loadPrefs();

    /* Già consented → applica e basta */
    if (existingPrefs !== null) {
      applyConsent(existingPrefs);
      attachReopenTrigger();
      return;
    }

    /* Mostra il banner popup SOLO sulla Home Page */
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const isHome = path === '' || path === 'index.html';

    /* Se siamo su una pagina interna e non c'è ancora consenso esplicito,
       non mostriamo il banner invasivo, ma consentiamo la riapertura dal footer */
    if (!isHome) {
      attachReopenTrigger();
      return;
    }

    /* ── Crea elementi DOM ── */
    const overlay = document.createElement('div');
    overlay.id = 'cb-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Gestione cookie');
    banner.innerHTML = buildBannerHTML();

    const modal = document.createElement('div');
    modal.id = 'cb-modal';
    modal.innerHTML = buildModalHTML();

    document.body.appendChild(overlay);
    document.body.appendChild(banner);
    document.body.appendChild(modal);

    /* ── Mostra banner con piccolo delay ── */
    requestAnimationFrame(function () {
      setTimeout(function () {
        banner.classList.add('cb-visible');
      }, 600);
    });

    /* ── Helper: nascondi tutto ── */
    function hideAll() {
      banner.classList.remove('cb-visible');
      modal.classList.remove('cb-visible');
      overlay.classList.remove('cb-visible');
      document.body.style.overflow = '';
    }

    /* ── Helper: mostra modale ── */
    function openModal(currentPrefs) {
      /* Sincronizza toggle con prefs correnti */
      CATEGORIES.forEach(function (c) {
        if (!c.required) {
          const chk = document.getElementById('cb-toggle-' + c.id);
          if (chk) chk.checked = currentPrefs ? !!currentPrefs[c.id] : c.default;
        }
      });
      modal.classList.add('cb-visible');
      overlay.classList.add('cb-visible');
      document.body.style.overflow = 'hidden';

      /* Focus trap minimo: porta il focus nel dialog */
      const closeBtn = document.getElementById('cb-modal-close');
      if (closeBtn) closeBtn.focus();
    }

    /* ── Helper: leggi toggle e salva ── */
    function saveFromToggles() {
      const prefs = {};
      CATEGORIES.forEach(function (c) {
        if (c.required) {
          prefs[c.id] = true;
        } else {
          const chk = document.getElementById('cb-toggle-' + c.id);
          prefs[c.id] = chk ? chk.checked : false;
        }
      });
      savePrefs(prefs);
      applyConsent(prefs);
      hideAll();
    }

    /* ── Helper: accetta tutto ── */
    function acceptAll() {
      const prefs = {};
      CATEGORIES.forEach(function (c) { prefs[c.id] = true; });
      savePrefs(prefs);
      applyConsent(prefs);
      hideAll();
    }

    /* ── Helper: solo essenziali ── */
    function essentialOnly() {
      const prefs = defaultPrefs(); /* tecnici=true, resto=false */
      savePrefs(prefs);
      applyConsent(prefs);
      hideAll();
    }

    /* ── Event listeners — banner ── */
    document.getElementById('cb-accept-all').addEventListener('click', acceptAll);
    document.getElementById('cb-reject').addEventListener('click', essentialOnly);
    document.getElementById('cb-open-prefs').addEventListener('click', function () {
      openModal(null);
    });

    /* ── Event listeners — modale ── */
    document.getElementById('cb-modal-close').addEventListener('click', essentialOnly);
    document.getElementById('cb-save-prefs').addEventListener('click', saveFromToggles);
    document.getElementById('cb-accept-all-modal').addEventListener('click', acceptAll);

    /* Chiudi modale cliccando overlay */
    overlay.addEventListener('click', essentialOnly);

    /* Chiudi con ESC */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('cb-visible')) {
        essentialOnly();
      }
    });

    /* ── Trigger riapertura dal footer ── */
    attachReopenTrigger(openModal);
  }

  /* ════════════════════════════════════════
     RIAPRI PREFERENZE (link footer)
     ════════════════════════════════════════ */

  /**
   * Gestisce i link con href="#cb-open" presenti nel footer
   * per consentire la revoca/modifica del consenso in qualsiasi momento
   * (obbligo Garante Privacy: facilità di revoca).
   */
  function attachReopenTrigger(openModalFn) {
    document.addEventListener('click', function (e) {
      const link = e.target.closest('a[href="#cb-open"]');
      if (!link) return;
      e.preventDefault();

      /* Se il banner esiste già (primo accesso), mostra il modale */
      const existingModal = document.getElementById('cb-modal');
      if (existingModal && openModalFn) {
        openModalFn(loadPrefs());
        return;
      }

      /* Se il banner è già stato chiuso (sessioni successive),
         resetta le preferenze e ricarica per mostrare il banner */
      if (!existingModal) {
        localStorage.removeItem(LS_KEY);
        localStorage.removeItem(LS_EXPIRY);
        window.location.reload();
      }
    });
  }

  /* ════════════════════════════════════════
     APPLICA CONSENSO
     ════════════════════════════════════════ */

  /**
   * Esegue le azioni concrete in base alle preferenze salvate.
   * Con solo cookie tecnici attivi (sito B&B Vomero attuale),
   * questa funzione è un no-op per analytics/marketing.
   * Struttura predisposta per future integrazioni.
   *
   * @param {Object} prefs — { technical: bool, analytics: bool, marketing: bool }
   */
  function applyConsent(prefs) {
    /* ── Cookie tecnici: sempre attivi (sessione, preferenze UI) ── */
    /* nessuna azione richiesta */

    /* ── Analytics: Google Analytics / Plausible / etc. ── */
    if (prefs.analytics) {
      /* TODO: inizializzare script analytics */
      /* es: loadGoogleAnalytics('G-XXXXXXXXXX'); */
    }

    /* ── Marketing: Meta Pixel / Google Ads / etc. ── */
    if (prefs.marketing) {
      /* TODO: inizializzare pixel di remarketing */
    }

    /* Dispatch evento custom per integrazioni future */
    try {
      window.dispatchEvent(new CustomEvent('bbvomero:consent', {
        detail: prefs,
        bubbles: false,
      }));
    } catch (e) { /* IE11 fallback */ }
  }

  /* ════════════════════════════════════════
     ESPORTA
     ════════════════════════════════════════ */

  /* Esposizione globale per main.js */
  window.initCookieBanner = initCookieBanner;

  /* Auto-init se DOM già pronto */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieBanner);
  } else {
    initCookieBanner();
  }

})();
