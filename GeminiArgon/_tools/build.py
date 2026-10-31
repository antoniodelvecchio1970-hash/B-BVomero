#!/usr/bin/env python3
"""
GeminiArgon — Generatore statico del sito.

Legge:   GeminiArgon/_src/site.json
         GeminiArgon/_src/pages/*.html
         GeminiArgon/_src/partials/*.html
Scrive:  GeminiArgon/*.html, assets/css/icons.css, assets/js/config.js

Uso:
  python3 -I GeminiArgon/_tools/build.py
"""
import html
import json
import re
import sys
import urllib.parse
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "_src"
SITE = json.loads((SRC / "site.json").read_text(encoding="utf-8"))
MANIFEST = json.loads((ROOT / "assets" / "img" / "manifest.json").read_text(encoding="utf-8"))

esc = lambda s: html.escape(str(s), quote=True)

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
    "shower": '<path d="M4 4a4 4 0 0 1 8 0v2"/><path d="M12 6h6a3 3 0 0 1 3 3v1H9V6z"/><path d="M11 14v.01M15 14v.01M19 14v.01M9 18v.01M13 18v.01M17 18v.01"/>',
    "pause": '<path d="M7 4h3v16H7zM14 4h3v16h-3z"/>',
    "play": '<path d="M7 4l13 8-13 8z"/>',
    "sparkle": '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>',
}


def generate_icons_css() -> str:
    lines = ["/* Generato automaticamente da _tools/build.py */", ":root {"]
    for name, body in ICONS.items():
        svg = (
            "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='#000' "
            "stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'>" + body + "</svg>"
        )
        lines.append(f'  --ico-{name}: url("data:image/svg+xml,{urllib.parse.quote(svg, safe="")}");')
    lines.append("}")
    lines += [f".i-{n} {{ --i: var(--ico-{n}); }}" for n in ICONS]
    return "\n".join(lines) + "\n"


def get_val(path: str):
    cur = SITE
    for p in path.split("."):
        cur = cur[p]
    return cur


def make_contact_href(kind: str, msg: str = "") -> str:
    c = SITE["contact"]
    if kind == "tel":
        return "tel:" + c["phone_tel"]
    if kind == "mail":
        return "mailto:" + c["email"]
    if kind == "wa":
        text = msg or "Buongiorno, vorrei verificare la disponibilità di una camera."
        return f"https://wa.me/{c['whatsapp']}?text=" + urllib.parse.quote(text)
    raise KeyError(kind)


def make_img_tag(name, alt="", sizes="100vw", cls="", loading="lazy") -> str:
    m = MANIFEST[name]
    ws = m["widths"]
    srcset = ", ".join(f"assets/img/{name}-{w}.webp {w}w" for w in ws)
    src = f"assets/img/{name}-{ws[1] if len(ws) > 1 else ws[0]}.webp"
    attrs = [
        f'src="{src}"',
        f'srcset="{srcset}"',
        f'sizes="{esc(sizes)}"',
        f'width="{m["w"]}"',
        f'height="{m["h"]}"',
        f'alt="{esc(alt)}"',
    ]
    if cls:
        attrs.insert(0, f'class="{esc(cls)}"')
    # Modern Web Guidance: optimize-image-priority
    # LCP image uses fetchpriority="high" without loading="lazy"; standard below-the-fold images use loading="lazy" alone.
    if loading == "eager":
        attrs.append('fetchpriority="high"')
    else:
        attrs.append('loading="lazy"')
    attrs.append('decoding="async"')
    return "<img " + " ".join(attrs) + ">"


def make_icon(name, cls="") -> str:
    if name not in ICONS:
        raise KeyError(f"Icona sconosciuta: {name}")
    return f'<span class="icon i-{name}{(" " + cls) if cls else ""}" aria-hidden="true"></span>'


def make_price_html(room) -> str:
    p = room.get("price_from")
    if not p:
        return '<p class="price-tag"><span>Tariffa su richiesta</span></p>'
    return f'<p class="price-tag"><span>da</span> <strong>€{p}</strong> <span>/ notte</span></p>'


def make_meta_line(r) -> str:
    return f'{r["sqm"]} m² · fino a {r["guests"]} ospit{"e" if r["guests"] == 1 else "i"}'


def m_room_cards(page):
    cards = []
    for i, r in enumerate(SITE["rooms"]):
        specs = "\n".join(
            f'      <li>{make_icon("check")} <span>{esc(h)}</span></li>'
            for h in r.get("highlights", r["features"][:4])
        )
        cards.append(f'''<article class="room-card reveal" style="--d:{i * 0.08:.2f}s">
  <a class="room-card__media" href="camere.html#{r["slug"]}" tabindex="-1" aria-hidden="true">{make_img_tag(r["img"], r["alt"], "(min-width: 960px) 360px, 92vw")}</a>
  <div class="room-card__body">
    <div class="room-card__top">
      <span class="room-card__num">CAMERA {esc(r["num"])}</span>
      <span class="room-card__meta">{make_meta_line(r)}</span>
    </div>
    <h3 class="room-card__title"><a href="camere.html#{r["slug"]}">{esc(r["name"])}</a></h3>
    <p class="room-card__desc">{esc(r["teaser"])}</p>
    <ul class="room-card__specs">
{specs}
    </ul>
  </div>
  <div class="room-card__foot">
    {make_price_html(r)}
    <a class="btn btn--secondary btn--sm" href="contatti.html?camera={r["slug"]}#richiesta">Verifica disponibilità</a>
  </div>
</article>''')
    return "\n".join(cards)


def m_room_sections(page):
    sections = []
    for i, r in enumerate(SITE["rooms"]):
        alt_cls = " section--alt" if i % 2 == 1 else ""
        rev_cls = " split--reverse" if i % 2 == 1 else ""
        loading_mode = "eager" if i == 0 else "lazy"
        feats = "\n".join(f'        <li>{make_icon("check")} <span>{esc(f)}</span></li>' for f in r["features"])
        sections.append(f'''<section class="section anchor-section{alt_cls}" id="{r["slug"]}" aria-labelledby="{r["slug"]}-title">
  <div class="container split{rev_cls}">
    <div class="split__media reveal">
      <div class="frame">{make_img_tag(r["img"], r["alt"], "(min-width: 960px) 520px, 92vw", "", loading_mode)}</div>
    </div>
    <div class="split__text reveal">
      <p class="eyebrow"><span class="eyebrow__num">{esc(r["num"])}</span> {make_meta_line(r)} · {esc(r["view"])}</p>
      <h2 class="h2" id="{r["slug"]}-title">{esc(r["name"])}</h2>
      <p class="lead">{esc(r["text"])}</p>
      <ul class="checklist">
{feats}
      </ul>
      <div class="room-buy-box">
        {make_price_html(r)}
        <div class="action-group">
          <a class="btn btn--primary" href="contatti.html?camera={r["slug"]}#richiesta">Verifica disponibilità</a>
          <a class="link-arrow" href="{esc(make_contact_href("wa", "Buongiorno, vorrei verificare la disponibilità per la " + r["name"] + "."))}" target="_blank" rel="noopener">Chiedi su WhatsApp {make_icon("arrow-up-right")}</a>
        </div>
      </div>
    </div>
  </div>
</section>''')
    return "\n".join(sections)


def m_room_table(page):
    rooms = SITE["rooms"]
    head = "".join(f'<th scope="col">{esc(r["name"])}</th>' for r in rooms)
    rows = [
        ("Superficie", [f'{r["sqm"]} m²' for r in rooms]),
        ("Capienza massima", [f'fino a {r["guests"]} ospit{"e" if r["guests"] == 1 else "i"}' for r in rooms]),
        ("Tipologia letto", [esc(r["bed"]) for r in rooms]),
        ("Affaccio", [esc(r["view"]) for r in rooms]),
        ("Spazio esterno", [esc(r["balcony"]) for r in rooms]),
        ("Sala da bagno", [esc(r["bath"]) for r in rooms]),
        ("Dotazione dedicata", [esc(r["extra"]) for r in rooms]),
        ("Tariffa indicativa", [f'da €{r["price_from"]} / notte (colazione inclusa)' for r in rooms]),
    ]
    body = "\n".join(
        f'<tr><th scope="row">{k}</th>' + "".join(f"<td>{v}</td>" for v in vals) + "</tr>"
        for k, vals in rows
    )
    cta = "".join(
        f'<td><a class="btn btn--secondary btn--sm" href="contatti.html?camera={r["slug"]}#richiesta">Verifica disponibilità</a></td>'
        for r in rooms
    )
    return f'''<div class="table-scroll" tabindex="0" role="region" aria-label="Tabella di confronto tra le tre camere">
<table class="compare-table">
  <caption class="sr-only">Confronto dettagliato tra Camera Standard, Camera Superior e Suite Vomero</caption>
  <thead>
    <tr><th scope="col">Caratteristica</th>{head}</tr>
  </thead>
  <tbody>
{body}
    <tr><th scope="row">Richiesta</th>{cta}</tr>
  </tbody>
</table>
</div>'''


def m_room_radios(page):
    items = [
        '<label class="chip-radio"><input type="radio" name="camera" value="" checked><span>Qualsiasi camera libera</span></label>'
    ]
    for r in SITE["rooms"]:
        items.append(
            f'<label class="chip-radio"><input type="radio" name="camera" value="{r["slug"]}">'
            f'<span>{esc(r["name"])} (da €{r["price_from"]})</span></label>'
        )
    return "\n              ".join(items)


def m_reviews(page):
    items = []
    for i, rv in enumerate(SITE["reviews"]):
        items.append(f'''<figure class="review-card reveal" style="--d:{i * 0.08:.2f}s">
  <blockquote><p>“{esc(rv["quote"])}”</p></blockquote>
  <figcaption>
    <strong>{esc(rv["author"].strip())}</strong>
    <span>{esc(rv.get("meta", ""))}</span>
  </figcaption>
</figure>''')
    return "\n".join(items)


def m_hero_slides(page):
    slides = []
    for i, sl in enumerate(SITE["hero_slides"]):
        s0, s1, x0, y0, x1, y1 = sl["kb"]
        pos = sl.get("pos", "50% 45%")
        style = f"--s0:{s0};--s1:{s1};--x0:{x0};--y0:{y0};--x1:{x1};--y1:{y1};--pos:{pos}"
        if i == 0:
            slides.append(
                f'<div class="hero__slide is-active" style="{style}">'
                f'{make_img_tag(sl["img"], sl["alt"], "(min-width: 960px) 480px, 94vw", "", "eager")}'
                f'</div>'
            )
        else:
            m = MANIFEST[sl["img"]]
            ws = m["widths"]
            data = {
                "src": f"assets/img/{sl['img']}-{ws[1]}.webp",
                "srcset": ", ".join(f"assets/img/{sl['img']}-{w}.webp {w}w" for w in ws),
                "w": m["w"],
                "h": m["h"],
                "alt": sl["alt"],
            }
            slides.append(
                f'<div class="hero__slide" style="{style}" '
                f'data-slide-img="{esc(json.dumps(data, ensure_ascii=False))}"></div>'
            )
    return "\n        ".join(slides)


# 5 voci nel menu principale in una parola chiara + CTA primaria separata (/ux-ui Regola 3)
NAV_ITEMS = [
    ("camere", "Camere", "camere.html"),
    ("il-bb", "Il B&B", "il-bb.html"),
    ("colazione", "Colazione", "colazione.html"),
    ("napoli", "Napoli", "napoli.html"),
    ("contatti", "Contatti", "contatti.html"),
]


def m_nav_links(page):
    links = []
    for key, label, href in NAV_ITEMS:
        cur = ' aria-current="page"' if page.get("nav") == key else ""
        links.append(f'<li><a href="{href}"{cur}>{esc(label)}</a></li>')
    return "\n        ".join(links)


def make_macros(page):
    return {
        "s": lambda path: esc(get_val(path)),
        "href": lambda kind, msg="": esc(make_contact_href(kind, msg)),
        "img": lambda *a: make_img_tag(*a),
        "icon": lambda *a: make_icon(*a),
        "include": lambda name: render_text((SRC / "partials" / f"{name}.html").read_text(encoding="utf-8"), page),
        "nav_links": lambda: m_nav_links(page),
        "room_cards": lambda: m_room_cards(page),
        "room_sections": lambda: m_room_sections(page),
        "room_table": lambda: m_room_table(page),
        "room_radios": lambda: m_room_radios(page),
        "reviews": lambda: m_reviews(page),
        "hero_slides": lambda: m_hero_slides(page),
        "year": lambda: str(date.today().year),
        "page": lambda key: esc(page.get(key, "")),
    }


MACRO_RE = re.compile(r"\{\{\s*(.*?)\s*\}\}", re.S)


def render_text(text: str, page: dict) -> str:
    macros = make_macros(page)

    def repl(m):
        body = m.group(1)
        name, _, rest = body.partition(" ")
        fn = macros.get(name)
        if fn is None:
            raise KeyError(f"Macro sconosciuta: {{{{ {body} }}}} in {page.get('file')}")
        args = [a.strip() for a in rest.split("|")] if rest.strip() else []
        return fn(*args)

    return MACRO_RE.sub(repl, text)


def parse_page_file(path: Path):
    raw = path.read_text(encoding="utf-8")
    head, _, body = raw.partition("\n---\n")
    meta = {"file": path.name}
    for line in head.strip().splitlines():
        if ":" in line:
            k, _, v = line.partition(":")
            meta[k.strip()] = v.strip()
    return meta, body


def build_all():
    layout = (SRC / "layout.html").read_text(encoding="utf-8")
    built = []
    for src in sorted((SRC / "pages").glob("*.html")):
        page, body = parse_page_file(src)
        page.setdefault("cta", "yes")
        page["content"] = render_text(body, page)
        page["robots"] = "" if SITE.get("indexable") else '<meta name="robots" content="noindex, nofollow">'
        brand = SITE["brand"]["name"]
        page["doc_title"] = esc(f'{page["title"]} — {brand}')
        page["body_class"] = page.get("body", "")

        out = layout
        out = out.replace("{%content%}", page["content"])
        out = out.replace("{%title%}", page["doc_title"])
        out = out.replace("{%description%}", esc(page.get("description", "")))
        out = out.replace("{%robots%}", page["robots"])
        out = out.replace("{%bodyclass%}", esc(page["body_class"]))
        out = render_text(out, page)

        (ROOT / src.name).write_text(out, encoding="utf-8")
        built.append(src.name)

    (ROOT / "assets" / "css" / "icons.css").write_text(generate_icons_css(), encoding="utf-8")
    cfg = {
        "brand": SITE["brand"]["name"],
        "whatsapp": SITE["contact"]["whatsapp"],
        "email": SITE["contact"]["email"],
        "phone": SITE["contact"]["phone_display"],
        "formEndpoint": SITE.get("form_endpoint", ""),
    }
    (ROOT / "assets" / "js" / "config.js").write_text(
        "/* Generato da _tools/build.py */\n"
        "window.SITE=" + json.dumps(cfg, ensure_ascii=False) + ";\n"
        "document.documentElement.classList.add('js');\n",
        encoding="utf-8",
    )
    print("Pagine generate in GeminiArgon:", ", ".join(built))
    return 0


if __name__ == "__main__":
    sys.exit(build_all())
