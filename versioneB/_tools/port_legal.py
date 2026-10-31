#!/usr/bin/env python3
"""
Versione B — porta i testi legali della versione A (privacy.html, cookie-policy.html)
dentro _src/pages/, sostituendo i dati di contatto con le macro di site.json.

Si lancia UNA volta (poi i testi si modificano in _src/pages/). Rilanciandolo
si sovrascrivono le modifiche fatte a mano.

  python3 -I versioneB/_tools/port_legal.py
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "versioneB" / "_src" / "pages"

PAGES = {
    "privacy.html": {
        "title": "Privacy policy",
        "description": "Informativa sul trattamento dei dati personali ai sensi del GDPR.",
    },
    "cookie-policy.html": {
        "title": "Cookie policy",
        "description": "Informativa sui cookie utilizzati da questo sito.",
    },
}

REPLACEMENTS = [
    (r"<strong>www\.bbvomero\.it</strong>", "<strong>{{s contact.website}}</strong>"),
    (r"www\.bbvomero\.it", "{{s contact.website}}"),
    (r'<a href="mailto:privacy@bbvomero\.it">privacy@bbvomero\.it</a>',
     '<a href="mailto:{{s legal.privacy_email}}">{{s legal.privacy_email}}</a>'),
    (r'<a href="mailto:info@bbvomero\.it">info@bbvomero\.it</a>',
     '<a href="{{href mail}}">{{s contact.email}}</a>'),
    (r'<a href="tel:\+390811847320">\+39 081 1847 3320</a>',
     '<a href="{{href tel}}">{{s contact.phone_display}}</a>'),
    (r"Via Belvedere, 88 — 80127 Napoli \(NA\)",
     "{{s contact.address_street}} — {{s contact.address_city}}"),
    (r"P\.IVA: 12345678901", "P.IVA: {{s legal.vat_number}}"),
    (r"B&amp;B Vomero", "{{s brand.name}}"),
]


def main():
    for name, meta in PAGES.items():
        raw = (ROOT / name).read_text(encoding="utf-8")
        m = re.search(r'<main class="legal-page"[^>]*>(.*?)</main>', raw, re.S)
        if not m:
            sys.exit(f"main non trovato in {name}")
        body = m.group(1)

        # rimuove il wrapper esterno e rinomina le classi di intestazione
        body = re.sub(r'<div class="legal-page__inner">', "", body, count=1)
        body = re.sub(r"</div>\s*$", "", body.rstrip())
        body = body.replace('<p class="legal-page__eyebrow">', '<p class="eyebrow">')
        body = body.replace('<h1 class="legal-page__title">', '<h1 class="h1">')
        body = body.replace('<p class="legal-page__meta">', '<p class="note">')
        for pattern, repl in REPLACEMENTS:
            body = re.sub(pattern, repl, body)

        # intestazione + box "bozza" iniziale; il contenuto resta dentro .container
        head = re.search(r'(<p class="eyebrow">.*?</p>\s*<h1 class="h1">.*?</h1>\s*<p class="note">.*?</p>)', body, re.S)
        if not head:
            sys.exit(f"intestazione non trovata in {name}")
        rest = body.replace(head.group(1), "", 1)
        page = (
            f"title: {meta['title']}\n"
            f"description: {meta['description']}\n"
            "header: solid\ncta: no\nbody: page-legal\n---\n"
            '<section class="page-head page-head--legal">\n  <div class="container container--narrow">\n'
            f"    {head.group(1).strip()}\n  </div>\n</section>\n\n"
            '<section class="section section--tight">\n  <div class="container container--narrow">\n'
            "{{draft_box Bozza: testo ereditato dalla versione A. Va rivisto con il titolare quando i dati e il nome della struttura saranno definitivi.}}\n"
            f"{rest.strip()}\n  </div>\n</section>\n"
        )
        (OUT / name).write_text(page, encoding="utf-8")
        print("scritto", OUT / name)


if __name__ == "__main__":
    main()
