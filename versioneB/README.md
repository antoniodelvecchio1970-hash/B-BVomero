# Versione B — prototipo del sito

Proposta alternativa al sito attuale (versione A), pensata per far arrivare più richieste di prenotazione:
camere subito dopo la hero, barra date sempre a portata, contatto reale in ogni pagina, stile più essenziale.

> **Stato: anteprima di design.** Nome, contatti, prezzi, recensioni e foto sono provvisori.
> Tutto ciò che va confermato è segnato nel sito con il badge tratteggiato **Bozza** e riassunto in fondo a questo file.
> Le pagine hanno `noindex`: i motori di ricerca non le indicizzano.

## Come aprirla

| Modo | Come |
|---|---|
| Più semplice | doppio clic su `versioneB/index.html` |
| Server locale (consigliato) | `python3 -m http.server 8765 --directory versioneB` → http://localhost:8765 |
| GitHub Pages | dopo il push: `https://antoniodelvecchio1970-hash.github.io/B-BVomero/versioneB/index.html` |

Non serve installare nulla. I font arrivano da Google Fonts (serve la connessione).

## Struttura

```
versioneB/
├─ index.html · camere.html · il-bb.html · napoli.html · contatti.html
├─ privacy.html · cookie-policy.html      testi legali ereditati dalla versione A
├─ assets/
│  ├─ css/   tokens.css (design token) · styles.css (componenti) · icons.css (generato)
│  ├─ js/    app.js (comportamenti) · config.js (generato)
│  ├─ img/   foto in WebP responsive + manifest.json
│  └─ video/ hero.mp4 (0,8 MB, solo desktop)
├─ _src/     sorgenti: site.json (dati), layout.html, partials/, pages/
├─ _tools/   build.py · make_media.py · port_legal.py
├─ DESIGN.md sistema di design e specifiche
└─ README.md
```

Le pagine `.html` in `versioneB/` sono **generate** da `_src/`: non modificarle a mano, perché il prossimo build le sovrascrive.

## Cambiare nome, contatti, prezzi

1. Apri `_src/site.json` e modifica i valori (nome, telefono, WhatsApp, email, indirizzo, orari, camere, prezzi, recensioni).
2. Rigenera le pagine, dalla cartella principale del progetto:

```bash
python3 -I versioneB/_tools/build.py
```

Per i testi delle pagine modifica i file in `_src/pages/`, poi rilancia lo stesso comando.
Quando i dati saranno definitivi: in `site.json` metti `"draft": false` (spariscono i badge Bozza) e `"indexable": true` (sparisce il `noindex`).

## Foto e video

- Le foto vengono dalla versione A (`assets/images/`) e sono segnaposto. Per cambiarle, sostituisci i file o modifica `SOURCES` in `_tools/make_media.py`, poi:
  `python3 -I versioneB/_tools/make_media.py` e di nuovo `build.py`.
- Il video della hero (baia di Napoli dall'alto) parte dalla cartella locale `Video/`, che non è su GitHub. Il file già generato è `assets/video/hero.mp4`.

## Il modulo di richiesta

Oggi funziona senza server: dopo l'invio mostra il riepilogo e due pulsanti (**Invia su WhatsApp**, **Invia via email**) con il messaggio già scritto. Nulla viene salvato.

Per riceverlo direttamente via email: crea un modulo su un servizio come Formspree o Netlify Forms, copia l'indirizzo di invio in `site.json` → `"form_endpoint"` e rilancia `build.py`. Il modulo lo userà da solo.

## Cosa cambia rispetto alla versione A

| Tema | Versione A | Versione B |
|---|---|---|
| Camere nella home | dopo ~3.800 px di scroll | a ~900 px (misurato a 1024×768) |
| Altezza home | ~7.600 px | ~5.700 px |
| Modulo di contatto | mostra solo un `alert()` | funziona (riepilogo + WhatsApp/email, o invio a un servizio) |
| Pulsante WhatsApp | popup simulato | link `wa.me` reale |
| Numero di telefono | testo e link diversi | un solo dato in `site.json` |
| Prenota | solo in cima alla pagina | menu fisso, barra date in hero, barra mobile |
| Menu | 5 voci + Prenota | 4 voci + Prenota (la colazione entra in "Il B&B") |
| Contrasto bottone primario | 4,1:1 | 5,0:1 (tutte le coppie di token ≥ AA) |
| Peso hero | foto 850 KB + video 3,4 MB | foto 160 KB (WebP) + video 0,8 MB, solo desktop |
| Cookie banner | ~30% dello schermo mobile alla prima visita | avviso di una riga, compare dopo lo scroll |
| Mappa Google | caricata subito | solo su richiesta |

## Verifiche fatte

- Link, ancore, immagini e id: nessun errore (controllo statico su tutte le pagine).
- Layout a 375 px (mobile) e 1000–1024 px (desktop): nessuno scroll orizzontale, menu mobile, barra mobile, modulo con errori e riepilogo provati nel browser.
- Contrasti: 26 coppie colore/sfondo calcolate; tutte ≥ AA dopo le correzioni (placeholder e bordi dei campi corretti durante la verifica).
- Tastiera: Esc chiude il menu e riporta il focus sul pulsante, le frecce cambiano scheda nei tab (provati nel browser); skip link e accordion sono nativi.
- **Non verificato:** schermi reali (iPhone/Android), VoiceOver/NVDA, Safari e Firefox, zoom al 200%. Vale la pena provarli prima di mostrarlo.

## Da confermare con la struttura (segnato **Bozza** nel sito)

- [ ] **Nome** definitivo (oggi "B&B Vomero", provvisorio) e dominio
- [ ] **Telefono, WhatsApp, email**: oggi segnaposto (`+39 081 000 0000`, `info@example.com`)
- [ ] **Indirizzo** (arriva dalla versione A) e P.IVA (segnaposto)
- [ ] **Prezzi** "da €/notte" delle tre camere (95 / 120 / 165 sono esempi)
- [ ] **Camere**: metrature, letti, dotazioni e affacci arrivano dalla versione A; la Suite "matrimoniale e divano letto" è una deduzione
- [ ] **Recensioni**: le tre in home sono di esempio; servono quelle vere con la fonte
- [ ] **Foto** vere delle camere e degli spazi (quelle attuali sono provvisorie; qui le tre camere hanno tre foto diverse, mentre nella home della versione A Superior e Suite ripetevano la stessa)
- [ ] **Orari** check-in/out e colazione, regole su animali e parcheggio
- [ ] **Condizioni di cancellazione**: non presenti nella versione A, quindi non scritte
- [ ] **Funicolari**: il testo della versione A cita la Funicolare di Mergellina come collegamento col Vomero; nella realtà scende verso Posillipo. Qui è descritta così, da verificare
- [ ] **Testi legali** (privacy, cookie): ereditati dalla versione A e con riferimenti al banner a scelte multiple; vanno rivisti con il titolare. Verificare anche se l'avviso cookie semplificato basta (oggi solo cookie tecnici; i font di Google e la mappa su richiesta sono servizi di terzi)

## Non ancora fatto (prossimi passi)

1. **Versione inglese** con selettore IT/EN e `hreflang`.
2. **Font ospitati in locale** (Cormorant Garamond e Jost): evita la richiesta a Google. Richiede di scaricare i file dei font.
3. **Statistiche rispettose della privacy** (es. Plausible) con eventi: clic WhatsApp, clic chiamata, invio modulo, ricerca date.
4. **SEO**: JSON-LD `LodgingBusiness`, `og:image`, sitemap, canonical (servono dati e dominio definitivi).
5. **Test su dispositivi reali** e audit con VoiceOver.
