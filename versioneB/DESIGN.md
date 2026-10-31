# Versione B - sistema di design

Linguaggio: **quiet luxury mediterraneo**. Carta calda, un solo accento terracotta, titoli in serif con una parola in corsivo, filetti sottili al posto di ombre, un solo gesto principale per schermata (verificare le date).
Fonte di verità dei valori: `assets/css/tokens.css`. I componenti sono in `assets/css/styles.css`.

## 1. Principi

1. **Un gesto per schermata**: ogni pagina porta a "Verifica disponibilità".
2. **Prima la camera, poi la storia**: le camere compaiono entro il primo scroll.
3. **Meno ornamento, più informazione**: niente sezioni da 100vh, niente ombre, un solo raggio.
4. **Accessibile per costruzione**: contrasti AA sui token, bersagli ≥ 44 px, movimento disattivabile.
5. **Dati in un solo posto**: nome, contatti e prezzi vivono in `_src/site.json`.

## 2. Token

### Colore (60 / 30 / 10)

| Token | Valore | Uso | Contrasto |
|---|---|---|---|
| `--paper` | `#faf7f2` | sfondo base (60%) | - |
| `--paper-2` | `#f1ebe0` | sezioni alternate | - |
| `--line` / `--line-strong` | `#e4ded3` / `#cdc5b6` | filetti decorativi | - |
| `--field-border` | `#8a8378` | bordo di campi e chip | 3,7:1 su bianco |
| `--ink` | `#1e1e1b` | titoli (30%) | 15,6:1 su carta |
| `--ink-2` | `#4a463f` | testo corrente | 8,8:1 su carta |
| `--muted` | `#6b645a` | testo secondario, placeholder | 5,5:1 su carta |
| `--olive` / `--olive-deep` | `#2f3a29` / `#252e20` | fascia CTA e footer | testo chiaro 11,2:1 |
| `--accent` | `#b4532a` | bottone primario (10%) | bianco su accento 5,0:1 |
| `--accent-hover` | `#8f3f1d` | hover del primario | 7,3:1 |
| `--accent-text` | `#a84a22` | link, eyebrow, corsivi | 5,4:1 su carta |
| `--accent-light` | `#e0a07a` | accento su fondo scuro | 5,4:1 su oliva |
| `--error` | `#a3322a` | errori del modulo | 6,9:1 su bianco |

Regola: l'accento compare solo su bottone primario, link, eyebrow e parole in corsivo. Mai come fondo di sezione.

### Tipografia

- **Display:** Cormorant Garamond 400/500 e corsivo 400. **Testo:** Jost 400/500 (mai 300).
- Scala: `--fs-xs` 13 · `--fs-sm` 15 · `--fs-base` 17 · `--fs-md` 20 · `--fs-lg` 24-30 · `--fs-xl` 32-52 · `--fs-2xl` 40-68 · `--fs-hero` 52-88 px (fluida con `clamp`).
- Interlinea: titoli 1,0-1,15; testo 1,65. Misura massima ≈ 36-38 em.
- Eyebrow: 13 px maiuscolo, spaziatura 0,14em. Maiuscolo solo qui e nelle etichette dei campi.
- Una sola parola o locuzione per titolo va in corsivo (`<em>`), colore `--accent-text`.

### Spazi, forme, movimento

- Scala a 8: `--s-1` 4 · `--s-2` 8 · `--s-3` 12 · `--s-4` 16 · `--s-5` 24 · `--s-6` 32 · `--s-7` 48 · `--s-8` 64 · `--s-9` 96 px.
- Sezioni: `--section-y` 64-120 px (fluido). Griglia: `--gap-grid` 20-32 px. Contenitore 1200 px, gutter 20-48 px.
- Forme: un solo raggio (`--radius` 2 px, `--radius-md` 4 px) più **l'arco** (`.arch`), richiamo alle finestre dei villini Liberty, usato in un solo punto per pagina.
- Movimento: reveal 0,7 s, spostamento 16 px; hover 0,2 s. Nessuna animazione cambia la spaziatura del testo. Con `prefers-reduced-motion` tutto si ferma e il video non viene caricato.
- Breakpoint: 640 · 900 (passaggio menu mobile → desktop) · 1100.

## 3. Componenti

| Componente | Classi | Varianti | Note di accessibilità |
|---|---|---|---|
| Bottone | `.btn` | `--primary` `--secondary` `--light` `--outline-light` · `--sm` (44 px) `--lg` (54 px) | altezza minima 48 px; focus visibile; un solo primario per vista |
| Link con freccia | `.link-arrow` | `--button` | area ≥ 44 px |
| Header | `.site-header` | `--overlay` (home, trasparente poi pieno) · `--solid` | menu mobile a schermo intero con focus trap, Esc, `aria-expanded` |
| Barra date | `.booking` | in-flow su mobile, sovrapposta alla hero su desktop | `<form method="get">` funziona anche senza JS; etichette visibili; partenza = arrivo + 1 in automatico |
| Fatti in sintesi | `.facts` | 2 colonne mobile, 4 desktop | elenco semantico |
| Card camera | `.room` | - | foto con link nascosto ai lettori di schermo; nome e bottone sono i punti di accesso |
| Sezione divisa | `.split` | `--reverse` | su mobile impila foto → testo |
| Luogo | `.place` | carosello snap su mobile, griglia su desktop | tutta la card è un link |
| Recensione | `.review` | - | `figure`/`blockquote` |
| FAQ | `.faq` | - | `<details name="faq">` nativo, apertura esclusiva |
| Chip camere | `.chipnav` | sticky sotto l'header, evidenzia la sezione visibile | `aria-current` |
| Tabella confronto | `.compare` | - | `caption`, `scope`, regione scorrevole con `tabindex` |
| Campo | `.field` | `--half` `--wide` | etichetta sempre visibile, errore in `aria-describedby`, `aria-invalid` |
| Chip radio | `.chip` | - | `input` reale sotto lo stile; focus visibile |
| Tab | `[role=tablist]` | - | frecce, Home, End |
| Barra mobile | `.actionbar` | Chiama · WhatsApp · Prenota | compare dopo la hero, sparisce vicino al footer |
| Avviso cookie | `.notice` | - | solo informativo; una sola volta, nella home, dopo lo scroll; non ruba il focus |
| Pulsante "torna su" | `.totop` | - | 48 px, quadrato con bordo sottile; compare dopo 700 px di scroll, sopra la barra mobile; riporta il focus sul logo |

### Stati del bottone primario

| Stato | Aspetto |
|---|---|
| Normale | fondo `--accent`, testo bianco |
| Hover | fondo `--accent-hover` |
| Focus | contorno 2 px `--accent`, distanza 3 px (bianco sulle fasce scure) |
| Disabilitato (durante l'invio) | testo "Invio in corso…" |

## 4. Copy

- Italiano, dai del **tu**, frasi brevi, niente punto finale su etichette e bottoni.
- CTA con il verbo all'inizio. Azione principale sempre **"Verifica disponibilità"** (forma breve **"Prenota"** solo in header e barra mobile).
- Termini fissi: camera/suite, colazione inclusa, funicolare, check-in/check-out.
- Errori: dicono cosa è successo e cosa fare ("Inserisci un indirizzo email valido, ad esempio nome@email.it.").
- Non si promette ciò che non è confermato (cancellazione, orari tardivi): resta in README come dato da avere.

## 5. Pattern

- **Richiesta di disponibilità**: barra in hero (GET) → `contatti.html` precompilata (`?checkin&checkout&ospiti&camera`) → riepilogo → WhatsApp o email (oppure invio a un servizio).
- **Mappa su richiesta**: segnaposto con pulsante; l'iframe di Google si crea solo al clic.
- **Dati variabili**: `site.json` → `build.py` → HTML statico (nessun flash di contenuto segnaposto).

## 6. Prestazioni (misure a 1024×768)

| Misura | Versione A | Versione B |
|---|---|---|
| Altezza home | 7.618 px | 5.725 px |
| Inizio camere | ~3.800 px | 904 px |
| Hero (foto) | 850 KB JPG | 160 KB WebP |
| Hero (video) | 3,4 MB (anche mobile 1,8 MB) | 0,5 MB, 5 secondi, solo desktop senza risparmio dati |
| Immagini | JPG 0,8-1,2 MB l'una | WebP 480/800/1200/1600 con `srcset` e dimensioni dichiarate |
| JavaScript | 26 KB (main + cookie banner) | 18 KB, nessuna dipendenza |

## 7. Accessibilità (WCAG 2.1 AA) - esito

Calcolato: 26 coppie colore, tutte conformi dopo la correzione di placeholder e bordi dei campi.
Verificato nel browser: nessun campo senza etichetta, nessuna immagine senza `alt`, un solo `h1` per pagina, gerarchia dei titoli coerente, link e ancore integri, `lang="it"`, skip link, landmark (`header`, `nav` etichettati, `main`, `footer`).
Il movimento della hero (video e leggero zoom) dura 5 secondi e poi si ferma: sotto la soglia dei 5 secondi non serve un pulsante di pausa (WCAG 2.2.2). Non parte con `prefers-reduced-motion` o risparmio dati.
Da fare a mano: VoiceOver/NVDA, Safari/Firefox, zoom 200%, dispositivi reali.
