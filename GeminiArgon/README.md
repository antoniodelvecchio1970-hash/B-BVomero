# B&B Vomero — Versione `GeminiArgon`

Versione alternativa completa del sito **B&B Vomero (Napoli)** progettata con il modello **Gemini 4 Argon** applicando rigorosamente le direttive della skill **`/ux-ui`**, **`modern-web-guidance`** e il linguaggio **Print-First Swiss Editorial**.

## Pagine incluse (8 pagine complete)

- [`index.html`](index.html) — Home page strutturata secondo il flusso decisionale CRO (`Promessa + Barra Date Precompilata → Prova in sintesi → Opzioni [3 Camere con prezzi] → Recensioni + 2ª CTA → Dettagli Quartiere/Tempi e Colazione → FAQ progressive → 3ª CTA Finale`).
- [`camere.html`](camere.html) — Schede dettagliate delle 3 camere (`Standard 20 m²`, `Superior 28 m²`, `Suite Vomero 42 m²`), indice secondario fisso (`subnav`), tabella comparativa accessibile e dotazioni incluse.
- [`il-bb.html`](il-bb.html) — L'architettura della palazzina Liberty d'inizio Novecento, i 3 pilastri dell'accoglienza e il prospetto orari/regole.
- [`colazione.html`](colazione.html) — Pagina dedicata alla colazione napoletana inclusa (`8:00-10:30`), i 3 momenti della tavola, la gestione delle intolleranze e il breakfast box per partenze all'alba.
- [`napoli.html`](napoli.html) — Guida ai tempi reali dal Vomero (Funicolari, Metro Linea 1, percorsi a piedi), 6 tappe essenziali e il consiglio dell'host sulla Pedamentina di San Martino.
- [`contatti.html`](contatti.html) — 3 canali diretti con tempi di risposta dichiarati (`WhatsApp`, `Telefono`, `Email`), modulo `Verifica disponibilità` con suggerimenti di formato sopra il campo, validazione `:user-invalid` + sincronizzazione `aria-invalid`, riepilogo post-invio senza `alert()`, mappa Google on-demand e tab accessibili da tastiera per arrivare da Stazione, Aeroporto, Porto o Auto.
- [`privacy.html`](privacy.html) & [`cookie-policy.html`](cookie-policy.html) — Documentazione legale GDPR e Cookie Policy con indice navigabile.

## Come rigenerare le pagine

Tutti i dati variabili (nome, contatti, orari, camere, prezzi, recensioni) risiedono in `_src/site.json`. Per rigenerare l'intero sito statico:

```bash
python3 -I GeminiArgon/_tools/build.py
```

Per l'analisi completa delle scelte UX/UI, dei contrasti WCAG 2.2 AA calcolati e della lista di verifica in 9 punti consulta [`DESIGN-UX-AUDIT.md`](DESIGN-UX-AUDIT.md).
