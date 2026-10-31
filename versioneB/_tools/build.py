#!/usr/bin/env python3
"""
Versione B - generatore delle pagine.

Legge:   versioneB/_src/site.json        (dati variabili: nome, contatti, camere, prezzi...)
         versioneB/_src/pages/*.html     (contenuto di ogni pagina, con intestazione `chiave: valore`)
         versioneB/_src/partials/*.html  (header, footer, barra mobile, avviso cookie)
Scrive:  versioneB/*.html, assets/css/icons.css, assets/js/config.js

Uso (dalla cartella principale del progetto):
  python3 -I versioneB/_tools/build.py

Macro disponibili nelle pagine ( {{ nome argomento | argomento }} ):
  s percorso.nel.json          testo preso da site.json (con escape HTML)
  href tel | mail | wa [|msg]  link tel:, mailto: e WhatsApp
  img nome | alt | sizes | classe | lazy/eager
  icon nome [| classe]         icona (maschera CSS)
  include nome                 inserisce un partial
  nav_links, room_cards, room_sections, room_table, room_chips, room_radios,
  reviews, cin_line, year
"""
import html
import json
import re
import sys
import urllib.parse
from datetime import date
from pathlib import Path

B = Path(__file__).resolve().parents[1]
SRC = B / "_src"
SITE = json.loads((SRC / "site.json").read_text(encoding="utf-8"))
MANIFEST = json.loads((B / "assets" / "img" / "manifest.json").read_text(encoding="utf-8"))

esc = lambda s: html.escape(str(s), quote=True)

# ----------------------------------------------------------------------------
# Icone (stile linea, 24x24) -> maschere CSS in assets/css/icons.css
# ----------------------------------------------------------------------------
ICONS = {
    "phone": '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    "mail": '<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="m22 7-10 6L2 7"/>',
    "whatsapp": '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/>',
    "pin": '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><path d="M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>',
    "coffee": '<path d="M10 2v2M14 2v2M6 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/>',
    "clock": '<path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z"/><path d="M12 6v6l4 2"/>',
    "tram": '<path d="M7 3h10a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z"/><path d="M4 11h16M8 15h.01M16 15h.01M8 18l-2 3M16 18l2 3"/>',
    "wifi": '<path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/>',
    "bed": '<path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/>',
    "users": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    "calendar": '<path d="M8 2v4M16 2v4M3 10h18"/><path d="M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>',
    "arrow-right": '<path d="M5 12h14M12 5l7 7-7 7"/>',
    "arrow-up-right": '<path d="M7 17 17 7M7 7h10v10"/>',
    "chevron-down": '<path d="m6 9 6 6 6-6"/>',
    "plus": '<path d="M12 5v14M5 12h14"/>',
    "minus": '<path d="M5 12h14"/>',
    "check": '<path d="M20 6 9 17l-5-5"/>',
    "car": '<path d="M19 17h2a1 1 0 0 0 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4a1 1 0 0 0 1 1h2"/><path d="M9 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM19 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM9 17h6"/>',
    "plane": '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
    "anchor": '<path d="M12 22V8M5 12H2a10 10 0 0 0 20 0h-3"/><path d="M15 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>',
    "home": '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    "map": '<path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/>',
    "book": '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    "snow": '<path d="M12 2v20M4.9 7l14.2 10M4.9 17 19.1 7"/>',
    "volume": '<path d="M11 5 6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
    "shower": '<path d="M4 4a4 4 0 0 1 8 0v2"/><path d="M12 6h6a3 3 0 0 1 3 3v1H9V6z"/><path d="M11 14v.01M15 14v.01M19 14v.01M9 18v.01M13 18v.01M17 18v.01"/>',
    "plug": '<path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0zM12 18v4"/>',
    "arrow-up": '<path d="M12 19V5M5 12l7-7 7 7"/>',
    "sparkle": '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>',
}


def icons_css() -> str:
    out = ["/* Generato da _tools/build.py: non modificare a mano. */", ":root {"]
    for name, body in ICONS.items():
        svg = ("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='#000' "
               "stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'>" + body + "</svg>")
        out.append(f'  --ico-{name}: url("data:image/svg+xml,{urllib.parse.quote(svg, safe="")}");')
    out.append("}")
    out += [f".i-{n} {{ --i: var(--ico-{n}); }}" for n in ICONS]
    return "\n".join(out) + "\n"


# ----------------------------------------------------------------------------
# Helpers dati
# ----------------------------------------------------------------------------
def get(path: str):
    cur = SITE
    for part in path.split("."):
        cur = cur[part]
    return cur


def contact_href(kind: str, msg: str = "") -> str:
    c = SITE["contact"]
    if kind == "tel":
        return "tel:" + c["phone_tel"]
    if kind == "mail":
        return "mailto:" + c["email"]
    if kind == "wa":
        text = msg or "Buongiorno, vorrei informazioni su disponibilità e tariffe."
        return f"https://wa.me/{c['whatsapp']}?text=" + urllib.parse.quote(text)
    raise KeyError(kind)


def img_tag(name, alt="", sizes="100vw", cls="", loading="lazy") -> str:
    m = MANIFEST[name]
    ws = m["widths"]
    srcset = ", ".join(f"assets/img/{name}-{w}.webp {w}w" for w in ws)
    src = f"assets/img/{name}-{ws[1] if len(ws) > 1 else ws[0]}.webp"
    attrs = [f'src="{src}"', f'srcset="{srcset}"', f'sizes="{esc(sizes)}"',
             f'width="{m["w"]}"', f'height="{m["h"]}"', f'alt="{esc(alt)}"']
    if cls:
        attrs.insert(0, f'class="{esc(cls)}"')
    attrs.append('fetchpriority="high"' if loading == "eager" else 'loading="lazy"')
    attrs.append('decoding="async"')
    return "<img " + " ".join(attrs) + ">"


def icon(name, cls="") -> str:
    if name not in ICONS:
        raise KeyError(f"icona sconosciuta: {name}")
    return f'<span class="icon i-{name}{(" " + cls) if cls else ""}" aria-hidden="true"></span>'


def price_html(room) -> str:
    p = room.get("price_from")
    if not p:
        return '<p class="price"><span class="price__unit">Tariffa su richiesta</span></p>'
    return (f'<p class="price"><span class="price__from">da</span> <strong>€{p}</strong> '
            f'<span class="price__unit">/ notte</span></p>')


def meta_line(r) -> str:
    return f'{r["sqm"]} m² · fino a {r["guests"]} ospit{"e" if r["guests"] == 1 else "i"}'


# ----------------------------------------------------------------------------
# Blocchi ripetuti
# ----------------------------------------------------------------------------
def m_room_cards(page):
    out = []
    for i, r in enumerate(SITE["rooms"]):
        out.append(f'''<article class="room reveal" style="--d:{i * 0.08:.2f}s">
  <a class="room__media" href="camere.html#{r["slug"]}" tabindex="-1" aria-hidden="true">{img_tag(r["img"], r["alt"], "(min-width: 900px) 360px, 92vw")}</a>
  <div class="room__body">
    <p class="room__meta">{meta_line(r)}</p>
    <h3 class="room__name"><a href="camere.html#{r["slug"]}">{esc(r["name"])}</a></h3>
    <p class="room__text">{esc(r["teaser"])}</p>
  </div>
  <div class="room__foot">
    {price_html(r)}
    <a class="btn btn--secondary btn--sm" href="contatti.html?camera={r["slug"]}#richiesta">Verifica disponibilità</a>
  </div>
</article>''')
    return "\n".join(out)


def m_room_sections(page):
    out = []
    for i, r in enumerate(SITE["rooms"]):
        alt_bg = " section--alt" if i % 2 == 1 else ""
        rev = " split--reverse" if i % 2 == 1 else ""
        feats = "\n".join(f"<li>{icon('check')}<span>{esc(f)}</span></li>" for f in r["features"])
        out.append(f'''<section class="section room-detail{alt_bg}" id="{r["slug"]}" aria-labelledby="{r["slug"]}-title">
  <div class="container split{rev}">
    <div class="split__media reveal"><div class="frame">{img_tag(r["img"], r["alt"], "(min-width: 900px) 560px, 92vw")}</div></div>
    <div class="split__text reveal">
      <p class="eyebrow">{meta_line(r)}</p>
      <h2 class="h2" id="{r["slug"]}-title">{esc(r["name"])}</h2>
      <p class="lead">{esc(r["text"])}</p>
      <ul class="checklist">
{feats}
      </ul>
      <div class="room-detail__buy">
        {price_html(r)}
        <div class="btn-row">
          <a class="btn btn--primary" href="contatti.html?camera={r["slug"]}#richiesta">Verifica disponibilità</a>
          <a class="link-arrow" href="{esc(contact_href("wa", "Buongiorno, vorrei informazioni sulla " + r["name"] + "."))}" target="_blank" rel="noopener">Chiedi su WhatsApp {icon("arrow-up-right")}</a>
        </div>
      </div>
    </div>
  </div>
</section>''')
    return "\n".join(out)


def m_room_table(page):
    rooms = SITE["rooms"]
    head = "".join(f'<th scope="col">{esc(r["name"])}</th>' for r in rooms)
    rows = [
        ("Superficie", [f'{r["sqm"]} m²' for r in rooms]),
        ("Ospiti", [f'fino a {r["guests"]}' for r in rooms]),
        ("Letto", [esc(r["bed"]) for r in rooms]),
        ("Affaccio", [esc(r["view"]) for r in rooms]),
        ("Balcone", [esc(r["balcony"]) for r in rooms]),
        ("Bagno", [esc(r["bath"]) for r in rooms]),
        ("Extra", [esc(r["extra"]) for r in rooms]),
        ("Tariffa", [(f'da €{r["price_from"]} / notte' if r.get("price_from") else "Su richiesta") for r in rooms]),
    ]
    body = "\n".join(
        f'<tr><th scope="row">{k}</th>' + "".join(f"<td>{v}</td>" for v in vals) + "</tr>" for k, vals in rows)
    cta = "".join(
        f'<td><a class="btn btn--secondary btn--sm" href="contatti.html?camera={r["slug"]}#richiesta">Verifica</a></td>'
        for r in rooms)
    return f'''<div class="table-wrap" tabindex="0" role="region" aria-label="Confronto tra le camere (scorri in orizzontale)">
<table class="compare">
<caption class="sr-only">Confronto tra le tre camere</caption>
<thead><tr><td></td>{head}</tr></thead>
<tbody>
{body}
<tr><th scope="row"><span class="sr-only">Azione</span></th>{cta}</tr>
</tbody>
</table>
</div>'''


def m_room_chips(page):
    return "\n".join(f'<li><a href="#{r["slug"]}">{esc(r["name"].replace("Camera ", ""))}</a></li>' for r in SITE["rooms"])


def m_room_radios(page):
    chips = ['<label class="chip"><input type="radio" name="camera" value="" checked><span>Nessuna preferenza</span></label>']
    for r in SITE["rooms"]:
        chips.append(f'<label class="chip"><input type="radio" name="camera" value="{r["slug"]}"><span>{esc(r["name"].replace("Camera ", ""))}</span></label>')
    return "\n".join(chips)


def m_reviews(page):
    out = []
    for i, rv in enumerate(SITE["reviews"]):
        out.append(f'''<figure class="review reveal" style="--d:{i * 0.08:.2f}s">
  <blockquote><p>“{esc(rv["quote"])}”</p></blockquote>
  <figcaption>{esc(rv["author"])}{(" · " + esc(rv["meta"])) if rv.get("meta") else ""}</figcaption>
</figure>''')
    return "\n".join(out)


NAV = [("camere", "Camere", "camere.html"), ("il-bb", "Il B&B", "il-bb.html"),
       ("napoli", "Napoli", "napoli.html"), ("contatti", "Contatti", "contatti.html")]


def m_nav_links(page):
    out = []
    for key, label, href in NAV:
        cur = ' aria-current="page"' if page.get("nav") == key else ""
        out.append(f'<li><a href="{href}"{cur}>{esc(label)}</a></li>')
    return "\n".join(out)


# ----------------------------------------------------------------------------
# Motore macro
# ----------------------------------------------------------------------------
def make_macros(page):
    def s(path):
        return esc(get(path))

    def href(kind, msg=""):
        return esc(contact_href(kind, msg))

    return {
        "s": s,
        "href": href,
        "img": lambda *a: img_tag(*a),
        "icon": lambda *a: icon(*a),
        "include": lambda name: render((SRC / "partials" / f"{name}.html").read_text(encoding="utf-8"), page),
        "nav_links": lambda: m_nav_links(page),
        "room_cards": lambda: m_room_cards(page),
        "room_sections": lambda: m_room_sections(page),
        "room_table": lambda: m_room_table(page),
        "room_chips": lambda: m_room_chips(page),
        "room_radios": lambda: m_room_radios(page),
        "reviews": lambda: m_reviews(page),
        "year": lambda: str(date.today().year),
        "cin_line": lambda: (f' · CIN {esc(SITE["legal"]["cin"])}' if SITE["legal"].get("cin") else ""),
        "page": lambda key: esc(page.get(key, "")),
    }


MACRO_RE = re.compile(r"\{\{\s*(.*?)\s*\}\}", re.S)


def render(text, page):
    macros = make_macros(page)

    def repl(m):
        body = m.group(1)
        name, _, rest = body.partition(" ")
        fn = macros.get(name)
        if fn is None:
            raise KeyError(f"macro sconosciuta: {{{{ {body} }}}} (pagina {page.get('file')})")
        args = [a.strip() for a in rest.split("|")] if rest.strip() else []
        return fn(*args)

    return MACRO_RE.sub(repl, text)


def parse_page(path: Path):
    raw = path.read_text(encoding="utf-8")
    head, sep, body = raw.partition("\n---\n")
    meta = {"file": path.name}
    for line in head.strip().splitlines():
        if ":" in line:
            k, _, v = line.partition(":")
            meta[k.strip()] = v.strip()
    return meta, body


def build():
    layout = (SRC / "layout.html").read_text(encoding="utf-8")
    built = []
    for src in sorted((SRC / "pages").glob("*.html")):
        page, body = parse_page(src)
        page.setdefault("header", "solid")
        page.setdefault("cta", "yes")
        page["content"] = render(body, page)
        page["robots"] = "" if SITE.get("indexable") else '<meta name="robots" content="noindex, nofollow">'
        brand = SITE["brand"]["name"]
        page["doc_title"] = esc(page["title"] if page.get("title_full") == "yes" else f'{page["title"]} - {brand}')
        page["body_class"] = page.get("body", "")
        out = layout
        # sostituzioni di struttura (marcatori {% ... %})
        out = out.replace("{%content%}", page["content"])
        out = out.replace("{%title%}", page["doc_title"])
        out = out.replace("{%description%}", esc(page.get("description", "")))
        out = out.replace("{%robots%}", page["robots"])
        out = out.replace("{%bodyclass%}", esc(page["body_class"]))
        out = render(out, page)
        (B / src.name).write_text(out, encoding="utf-8")
        built.append(src.name)

    (B / "assets" / "css" / "icons.css").write_text(icons_css(), encoding="utf-8")
    cfg = {
        "brand": SITE["brand"]["name"],
        "whatsapp": SITE["contact"]["whatsapp"],
        "email": SITE["contact"]["email"],
        "phone": SITE["contact"]["phone_display"],
        "formEndpoint": SITE.get("form_endpoint", ""),
    }
    (B / "assets" / "js" / "config.js").write_text(
        "/* Generato da _tools/build.py: modifica _src/site.json */\n"
        "window.SITE=" + json.dumps(cfg, ensure_ascii=False) + ";\n"
        "document.documentElement.classList.add('js');\n", encoding="utf-8")
    print("pagine:", ", ".join(built))


if __name__ == "__main__":
    sys.exit(build())
