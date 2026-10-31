# GeminiArgon — Specifiche di Design UX/UI, CRO e Accessibilità AA

Documento progettuale redatto secondo le direttive della skill `/ux-ui`, `modern-web-guidance` e i principi **Print-First Swiss Editorial**.

---

## 0. Definizione Strategica (Regola 0 `/ux-ui`)

- **Obiettivo di business:** Generare richieste di disponibilità dirette (senza commissioni di intermediazione OTA) per le 3 camere del B&B Vomero a Napoli.
- **Unica azione primaria (CTA):** `Verifica disponibilità` (ripetuta con la medesima etichetta verbo + oggetto in tutto il sito: primo viewport, card camere, fascia intermedia dopo la prova sociale, chiusura pagina, header fisso e barra mobile).
- **Chi è l'utente e da dove arriva:** Coppie, viaggiatori culturali e professionisti in smart working (da mobile 375 px o desktop) che cercano un alloggio a Napoli ma temono il rumore notturno, il caos dei vicoli o la distanza dai collegamenti.
- **Dubbio principale da sciogliere subito:** *"Se dormo nella quiete del Vomero, quanto ci metto a scendere nel centro storico e quanto costa?"* → Risolto nel primo viewport: **5 minuti di funicolare dal centro storico, colazione napoletana inclusa, da €95 / notte**.

---

## 1. Architettura delle Informazioni e Intenzioni per Pagina (Regola 3 `/ux-ui`)

| Pagina | Chi arriva e cosa cerca | Cosa lo frena (Obiezione) | Passo successivo (Max ≤ 3 clic) |
|---|---|---|---|
| [`index.html`](index.html) | Vuole capire in 5 secondi dove siamo, quanto costa e se è comodo per visitare Napoli. | Teme che il Vomero sia scomodo o che i prezzi siano nascosti. | Compila date nella barra hero → `Verifica disponibilità` (1 clic). |
| [`camere.html`](camere.html) | Vuole confrontare metrature, letti, bagni e prezzi delle 3 stanze. | Non capisce la differenza tra Standard (20 m²), Superior (28 m²) e Suite (42 m²). | Sceglie la camera dalla scheda o dalla tabella comparativa → `Verifica disponibilità` con camera pre-selezionata. |
| [`il-bb.html`](il-bb.html) | Vuole conoscere l'atmosfera della palazzina Liberty e gli orari di check-in/out. | Dubbi su orari di arrivo, parcheggio o rumore. | Legge i 3 pilastri e la tabella orari → `Verifica disponibilità`. |
| [`colazione.html`](colazione.html) | Vuole sapere cosa è incluso nella colazione e se ci sono opzioni per intolleranze. | Teme una colazione confezionata o l'assenza di opzioni senza glutine/vegane o per partenze all'alba. | Verifica i 3 momenti della tavola e le note su intolleranze/early-bird → `Verifica disponibilità`. |
| [`napoli.html`](napoli.html) | Vuole verificare i tempi reali verso Spaccanapoli, Lungomare e San Martino. | Non conosce il funzionamento delle 4 funicolari e della Metro Linea 1. | Consulta le 6 tappe con tempi verificati → `Verifica disponibilità`. |
| [`contatti.html`](contatti.html) | È pronto a chiedere disponibilità o preferisce usare WhatsApp/telefono. | Attrito da moduli lunghi, paura di addebiti immediati o errori poco chiari. | Invia il modulo rapido precompilato o clicca su WhatsApp/Telefono diretto. |

### Ordine Scientifico della Home (`index.html`)
1. **Promessa + Azione + Fiducia (Viewport 1 — Hero):** Titolo orientato al beneficio (8 parole), sottotitolo di una frase con cosa/dove/prezzo, barra compatta date precompilata (`domani → +2 notti`), unico bottone primario pieno `Verifica disponibilità` e riga di fiducia.
2. **Prova in sintesi (`proof-bar`):** 4 dati oggettivi separati da filetti 1 px (`Solo 3 camere`, `Colazione 8:00-10:30`, `5 min in funicolare`, `da €95 / notte`).
3. **Opzioni (`#camere`):** Le 3 camere subito dopo la prova, ciascuna con foto `4:3`, metratura, capienza, 4 punti elenco, prezzo `da €95 / €120 / €165 / notte` e azione.
4. **Prova sociale + 2ª Ripetizione CTA (`#recensioni`):** 3 testimonianze strutturate + fascia d'azione intermedia.
5. **Dettagli (`#quartiere` e `#colazione-home`):** Tabella dei tempi reali di spostamento in funicolare/metro e dettagli sulla colazione artigianale inclusa.
6. **Obiezioni (`#faq`):** 6 domande frequenti con apertura progressiva nativa (`<details name="faq">`).
7. **Azione finale (`cta-final`):** 3ª ripetizione della CTA primaria affiancata a WhatsApp diretto.

---

## 2. Sistema Visivo, Contrasti WCAG 2.2 AA e Tipografia (Regole 2 e 4 `/ux-ui`)

### Regola Cromatica 60 / 30 / 10 e Contrasti Calcolati

| Token | Valore | Ruolo | Coppia verificata | Rapporto di contrasto | Esito WCAG 2.2 AA |
|---|---|---|---|---|---|
| `--paper` | `#F9F6F0` | 60% Sfondo carta calda | Base primaria | — | — |
| `--paper-alt` | `#F0EAE1` | Sfondo sezioni alternate | Base secondaria | — | — |
| `--ink` | `#181715` | 30% Titoli e testi forti | su `#F9F6F0` / `#F0EAE1` | **16,8:1** / **15,1:1** | AAA (≥ 4,5:1) |
| `--ink-body` | `#3D3A35` | Testo corrente | su `#F9F6F0` / `#F0EAE1` | **10,4:1** / **9,3:1** | AAA (≥ 4,5:1) |
| `--ink-muted` | `#5E5952` | Testi secondari e placeholder | su `#F9F6F0` / `#F0EAE1` / `#FFF` | **6,2:1** / **5,6:1** / **6,7:1** | AA+ (≥ 4,5:1) |
| `--accent` | `#A84320` | 10% Bottone primario e link | `#FFFFFF` su `#A84320` | **5,62:1** | AA (≥ 4,5:1) |
| `--accent` su carta | `#A84320` | Eyebrow, link, corsivi | `#A84320` su `#F9F6F0` | **5,21:1** | AA (≥ 4,5:1) |
| `--accent-hover` | `#873316` | Hover bottone primario | `#FFFFFF` su `#873316` | **7,65:1** | AAA (≥ 4,5:1) |
| `--dark` | `#1F2421` | Fascia finale e footer | `#F9F6F0` su `#1F2421` | **14,5:1** | AAA (≥ 4,5:1) |
| `--accent-on-dark`| `#E89B7E` | Accento su fondo scuro | `#E89B7E` su `#1F2421` | **6,80:1** | AA+ (≥ 4,5:1) |
| `--border-ui` | `#787167` | Bordi campi, select, chip | su `#FFFFFF` / `#F9F6F0` | **4,60:1** / **4,30:1** | AA Componenti (≥ 3,0:1) |
| `--error` | `#9E2A25` | Messaggi e bordi di errore | su `#FFFFFF` / `#FDF2F2` | **7,40:1** / **6,85:1** | AAA (≥ 4,5:1) |

### Scala Tipografica e Spaziale
- **Famiglie (max 2):** `Cormorant Garamond` (400, 500, 400 italic) per i titoli; `Jost` (400, 500 — mai 300) per il corpo e l'interfaccia.
- **Scala a 7 dimensioni (rapporto ≥ 1,25):** `13 px` (`--fs-1`), `15 px` (`--fs-2`), `17 px` (`--fs-3` corpo), `21 px` (`--fs-4` lead), `26–32 px` (`--fs-5` H3), `34–46 px` (`--fs-6` H2), `42–64 px` (`--fs-7` H1).
- **Scala spaziale rigorosa a multipli di 8:** `4, 8, 16, 24, 32, 48, 64, 96, 120 px`.
- **Ornamento ridotto all'essenziale:** Filetti sottili da `1 px` (`--rule` / `--rule-strong`), un solo raggio degli angoli in tutto il sito (`2 px`), zero ombre sui contenitori, zero gradienti decorativi.

---

## 3. Dichiarazione Esplicita di Segnaposto, Ipotesi e Rischi (Regole 0, 6 e 7 `/ux-ui`)

1. **Prezzi indicativi (`da €95 / €120 / €165 / notte`):** Inseriti come segnaposto esplicito per rispettare la regola CRO *"Mostra prima il prezzo o la fascia di prezzo"* e dichiarati come dimostrativi in pagina.
2. **Recensioni degli ospiti:** Le 3 recensioni in home riportano la dicitura `(recensione segnaposto)` fino alla raccolta delle recensioni verificate del titolare.
3. **Recapiti e dati fiscali:** Telefono (`+39 081 1847 3320`), email (`info@bbvomero.it`), P.IVA (`12345678901`) e CIN (`IT063049C100000000`) sono segnaposto centralizzati in `_src/site.json`.
4. **Privacy e terze parti:** Google Maps è bloccato fino al clic esplicito dell'utente (`Carica mappa interattiva`). Per eliminare anche la connessione iniziale a Google Fonts in produzione, si raccomanda di ospitare localmente i file `.woff2` di `Cormorant Garamond` e `Jost`.
