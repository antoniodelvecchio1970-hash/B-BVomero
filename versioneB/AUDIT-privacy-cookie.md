# Audit privacy e cookie - Versione B

Data: 31 ottobre 2026. Ambito: sito statico `versioneB/` (UE e Italia).
Questo documento è un controllo tecnico, non una consulenza legale: i testi legali vanno rivisti dal titolare con un professionista.

## 1. Risposta alla domanda

**L'avviso sui cookie non deve comparire a ogni pagina.** Il sito usa solo cookie tecnici e per questi:

- non serve il consenso;
- non serve un banner di scelta: il Garante dice che l'informazione può stare nella home o nell'informativa generale (Linee guida del 10 giugno 2021, par. 5 e 7.1).

Prima, l'avviso si ripresentava su ogni pagina finché non si premeva "Ho capito". **Ora compare una sola volta, nella home, alla prima visita**, dopo un po' di scroll (così non copre la hero). Dopo la prima volta non torna, né nella home né nelle altre pagine. Chi vuole rileggerlo trova il link "Mostra di nuovo l'avviso" nella Cookie policy. Il link alla Cookie policy è sempre nel footer di ogni pagina.

Il "ricordo" dell'avviso è un dato nel `localStorage` del browser (`bb_notice_v1`), mai inviato al server.

## 2. Quadro normativo a ottobre 2026

| Tema | Stato | Cosa significa per il sito |
|---|---|---|
| ePrivacy art. 5(3) / art. 122 Codice Privacy | in vigore | consenso per tutto ciò che non è strettamente tecnico; i cookie tecnici ne sono esenti |
| Garante, Linee guida cookie 10/6/2021 | in vigore | solo cookie tecnici: nessun banner, serve l'informativa. Il banner con scelte (X di chiusura, pari evidenza, riproposizione dopo 6 mesi) serve solo quando ci sono cookie non tecnici |
| GDPR | in vigore | informativa all'atto della raccolta (art. 13) per il modulo di richiesta |
| Digital Omnibus (modifiche a GDPR e cookie) | **non è legge** | la proposta della Commissione è del 19 novembre 2025. Il Parlamento non ha ancora una posizione. Per il Consiglio le fonti consultate non concordano: una del 24 settembre parla di voto annullato, una sintesi più recente riferisce un mandato in Coreper il 21 ottobre 2026. Da verificare, ma oggi le regole attuali restano applicabili |
| Digital Omnibus, parte intelligenza artificiale | legge (Reg. UE 2026/1744, 27 luglio 2026) | non riguarda il sito |
| European Accessibility Act (D.Lgs. 82/2022), dal 28/6/2025 | in vigore | le microimprese che offrono servizi (meno di 10 addetti e fatturato fino a 2 milioni) sono esenti; controlla AgID. Il sito punta comunque a WCAG 2.1 AA |
| CIN (art. 13-ter DL 145/2023) | in vigore | il Codice Identificativo Nazionale va indicato in ogni annuncio, sito web compreso, anche per i B&B |

## 3. Cosa fa il sito (inventario)

| Elemento | Dove | Dati verso terzi |
|---|---|---|
| Cookie propri | nessuno | no |
| `localStorage` `bb_notice_v1` | solo dopo la prima visualizzazione dell'avviso | no |
| Google Fonts (Cormorant Garamond, Jost) | **a ogni apertura di pagina** | sì: il browser contatta i server di Google (IP e dati tecnici) |
| Google Maps | **solo dopo il clic** su "Mostra la mappa" (pagina Contatti) | sì, ma solo su richiesta |
| Statistiche, pubblicità, social | nessuno | no |
| Modulo di richiesta | pagina Contatti | oggi nessun invio al server: l'utente invia con WhatsApp o email |
| Hosting | GitHub Pages | GitHub e la sua rete di distribuzione registrano gli accessi, fuori dal controllo del sito |

## 4. Esito per voce

Legenda: **OK** conforme · **Corretto** sistemato in questo giro · **Da fare** serve un'azione

| # | Voce | Esito | Dettaglio |
|---|---|---|---|
| 1 | Banner di consenso necessario? | OK | no, con soli cookie tecnici |
| 2 | Frequenza dell'avviso | Corretto | una sola volta, nella home, alla prima visita |
| 3 | Informativa cookie raggiungibile | OK | link "Cookie policy" nel footer di tutte le pagine |
| 4 | Cookie policy coerente col sito | Corretto | tolti i riferimenti al banner con "Accetta tutto / Solo essenziali", corretta la tabella (oggi c'è solo `bb_notice_v1`), aggiunta Google Maps, rimossa la voce sul plugin di Google Analytics |
| 5 | **Google Fonts** | **Da fare** | vedi sotto |
| 6 | Google Maps | OK / Corretto | non si carica prima del clic; il testo ora dice che Google riceve l'IP e può usare cookie |
| 7 | Base giuridica delle richieste | Corretto | era "interesse legittimo"; per una richiesta di disponibilità o preventivo la base è la misura precontrattuale (art. 6.1.b GDPR) |
| 8 | Casella privacy nel modulo | Corretto | il testo diceva "acconsento al trattamento": per questa finalità non serve il consenso, quindi ora dice "Ho letto l'informativa" |
| 9 | Informativa privacy: server UE | Corretto | la frase "sito ospitato su server nell'UE" non è verificabile con GitHub Pages: sostituita con il riferimento alle garanzie del Capo V per i servizi di terzi |
| 10 | Destinatari | Corretto | aggiunti Google (font e mappa) e i canali scelti dall'utente (WhatsApp, posta) |
| 11 | Dati del titolare | **Da fare** | nome, P.IVA, email privacy e indirizzo sono segnaposto in `_src/site.json` |
| 12 | CIN | **Da fare** | non presente nel sito; ora basta compilare `legal.cin` in `site.json` e compare nel footer di ogni pagina |
| 13 | Hosting | **Da fare** (in produzione) | per il sito definitivo valutare un hosting con sede UE e contratto di trattamento (art. 28) |
| 14 | Conservazione dei dati del modulo (24 mesi) | **Da fare** | valore ereditato dalla versione A: va confermato |
| 15 | Statistiche | OK | nessuna. Se si aggiungono (es. Plausible): senza consenso solo se il Garante le considera assimilabili ai tecnici (IP mascherato, dati aggregati, un solo sito, nessun incrocio: par. 7.2); altrimenti serve il banner con scelte |
| 16 | Accessibilità (EAA) | OK / da confermare | probabile esenzione da microimpresa; da confermare con numero di addetti e fatturato |

### Il punto principale: Google Fonts

Ogni apertura di pagina fa partire una richiesta ai server di Google, che ricevono l'indirizzo IP del visitatore. Nel 2022 il Tribunale di Monaco (LG München I, causa 3 O 17493/20) ha riconosciuto un risarcimento di 100 euro a un utente per questa trasmissione senza consenso. È una decisione isolata e Google è certificata nel Data Privacy Framework UE-USA, quindi il rischio non è alto, ma esiste e si elimina del tutto.

**Soluzione consigliata: ospitare i font sul sito** (nessuna richiesta a Google, nessun obbligo di avviso su questo punto). Richiede di scaricare i file dei font (Cormorant Garamond e Jost, circa 100-200 KB in formato woff2), cosa che non ho fatto senza il tuo consenso. Nel frattempo il sito lo dichiara: nell'avviso e nella Cookie policy.

Alternativa: caricare i font solo dopo un consenso, ma obbliga a un banner con scelte e penalizza la velocità.

## 5. Modifiche al codice in questo giro

- `assets/js/app.js`: avviso mostrato una sola volta, solo nella home, memorizzato nel momento in cui compare.
- `_src/partials/notice.html`: testo breve e aggiornato ("Solo cookie tecnici. I font arrivano da Google Fonts e la mappa di Google si carica solo se la richiedi.").
- `_src/pages/cookie-policy.html`, `_src/pages/privacy.html`: allineati al comportamento reale (vedi voci 4, 7, 9, 10).
- `_src/pages/contatti.html`: testo della casella privacy e della mappa.
- `_src/site.json`, `_tools/build.py`: nuovo campo `legal.cin`, mostrato nel footer quando è compilato.

## 6. Prossimi passi, in ordine

1. Decidere se ospitare i font in locale (serve il tuo OK per scaricare i file).
2. Inserire dati reali: titolare, P.IVA, email privacy, indirizzo, **CIN**.
3. Far rivedere i testi di privacy e cookie da un professionista, soprattutto conservazione (24 mesi) e basi giuridiche.
4. Scegliere l'hosting definitivo (sede UE) e stipulare il contratto di trattamento.
5. Se si aggiungono statistiche o nuovi servizi: aggiornare la Cookie policy prima e valutare il banner con scelte.

## 7. Fonti consultate (ottobre 2026)

- Garante Privacy, [Linee guida cookie e altri strumenti di tracciamento, 10 giugno 2021](https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9677876)
- Digital Omnibus: [Acompli, 24 settembre 2026](https://acompli.ie/news/digital-omnibus-gdpr-cookies-status-september-2026/) e una sintesi di ricerca che cita il mandato del Consiglio del 21 ottobre 2026 (fonti secondarie, da verificare sui siti delle istituzioni UE)
- Google Fonts: [Activemind, sentenza LG München I](https://www.activemind.legal/guides/ruling-google-fonts/) e [Usercentrics, guida 2026](https://usercentrics.com/knowledge-hub/google-fonts-gdpr-compliant/)
- CIN: [CNA Roma](https://www.cnaroma.it/obbligo-del-codice-identificativo-nazionale-tutte-le-strutture-ricettive-alberghiere-ed-extra) e [Altroconsumo](https://www.altroconsumo.it/casa-energia/casa-condominio/speciali/codice-cin) (le fonti divergono su date e importi delle sanzioni: controllare l'art. 13-ter del DL 145/2023 o le FAQ del Ministero del Turismo)
- European Accessibility Act in Italia: [Portolano Cavallo](https://portolano.it/en/newsletter/portolano-cavallo-inform-digital-ip/italy-transposes-european-accessibility-act-directive-ue-2019882) e [Nexpi](https://www.nexpi.it/en/resources/guides/european-accessibility-act-ecommerce) (controllare il testo su Normattiva)
