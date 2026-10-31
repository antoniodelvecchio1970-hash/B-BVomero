#!/usr/bin/env python3
"""
Versione B — preparazione dei media.

Cosa fa
  1. Converte le foto della versione A in WebP responsive (480/800/1200/1600 px)
     e scrive assets/img/manifest.json (usato da build.py per generare srcset).
  2. Ricava dal video di Napoli (cartella locale Video/, non su GitHub):
       - assets/video/hero.mp4   (9 s, 1600 px, senza audio, ~1-2 MB)
       - il fotogramma iniziale, usato come poster dell'hero (stessa inquadratura).

Come si usa (dalla cartella principale del progetto)
  python3 -I versioneB/_tools/make_media.py

Per aggiungere o sostituire una foto: metti il file in assets/images/ (o cambia
SOURCES qui sotto), rilancia lo script, poi rilancia build.py.
"""
import json
import subprocess
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]          # cartella del progetto
OUT = ROOT / "versioneB" / "assets"
IMG_OUT = OUT / "img"
VIDEO_OUT = OUT / "video"
SRC_IMAGES = ROOT / "assets" / "images"
SRC_VIDEO = ROOT / "Video" / "15673263-uhd_3840_2160_60fps.mp4"   # baia di Napoli dall'alto
VIDEO_START = 1.0     # secondi
VIDEO_LEN = 9.0

# nome nel sito  <-  file sorgente in assets/images/
SOURCES = {
    "terrace":            "contatti-vomero.jpg",
    "about":              "about.jpg",
    "room-standard":      "room-deluxe.jpg",
    "room-superior":      "hero.jpg",
    "room-suite":         "room-suite.jpg",
    "colazione":          "colazione.jpg",
    "colazione-dolci":    "colazione-dolci.jpg",
    "colazione-caffe":    "colazione-caffe.jpg",
    "colazione-fresco":   "colazione-fresco.jpg",
    "napoli-spaccanapoli": "napoli-spaccanapoli.jpg",
    "napoli-lungomare":   "napoli-lungomare.jpg",
    "vomero-panorama":    "vomero.jpg",
    "vomero-santelmo":    "vomero-sant-elmo.jpg",
    "vomero-funicolare":  "vomero-funicolare.jpg",
    "vomero-scarlatti":   "vomero-scarlatti.jpg",
    "vomero-night":       "vomero-night.jpg",
}
WIDTHS = [480, 800, 1200, 1600]
QUALITY = 76


def export(img: Image.Image, name: str, quality: int = QUALITY, widths=WIDTHS):
    w, h = img.size
    sizes = [x for x in widths if x < w]
    sizes.append(w if w <= max(widths) else max(widths))
    sizes = sorted(set(sizes))
    for tw in sizes:
        th = round(h * tw / w)
        out = img if tw == w else img.resize((tw, th), Image.LANCZOS)
        out.save(IMG_OUT / f"{name}-{tw}.webp", "WEBP", quality=quality, method=6)
    return {"w": w, "h": h, "widths": sizes}


def main():
    IMG_OUT.mkdir(parents=True, exist_ok=True)
    VIDEO_OUT.mkdir(parents=True, exist_ok=True)
    manifest = {}

    # --- video + poster -----------------------------------------------------
    if SRC_VIDEO.exists():
        frame = Path("/tmp/versioneB_hero_frame.png")
        subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-ss", str(VIDEO_START), "-i", str(SRC_VIDEO),
             "-frames:v", "1", "-vf", "scale=1920:-2", str(frame)], check=True)
        manifest["hero"] = export(Image.open(frame).convert("RGB"), "hero", quality=80,
                                  widths=[480, 800, 1280, 1920])
        subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-ss", str(VIDEO_START), "-t", str(VIDEO_LEN),
             "-i", str(SRC_VIDEO), "-an", "-vf", "scale=1600:-2,fps=24",
             "-c:v", "libx264", "-crf", "29", "-preset", "slow", "-pix_fmt", "yuv420p",
             "-movflags", "+faststart", str(VIDEO_OUT / "hero.mp4")], check=True)
        print("video ok:", round((VIDEO_OUT / "hero.mp4").stat().st_size / 1e6, 2), "MB")
    else:
        print("ATTENZIONE: video sorgente non trovato, hero e video non rigenerati:", SRC_VIDEO)
        old = IMG_OUT / "manifest.json"
        if old.exists():
            manifest.update({k: v for k, v in json.loads(old.read_text()).items() if k == "hero"})

    # --- foto ---------------------------------------------------------------
    for name, filename in SOURCES.items():
        src = SRC_IMAGES / filename
        if not src.exists():
            print("manca:", src)
            continue
        manifest[name] = export(Image.open(src).convert("RGB"), name)

    (IMG_OUT / "manifest.json").write_text(json.dumps(manifest, indent=1))
    total = sum(p.stat().st_size for p in IMG_OUT.glob("*.webp"))
    print(f"{len(manifest)} immagini, {len(list(IMG_OUT.glob('*.webp')))} file, {total/1e6:.1f} MB totali")


if __name__ == "__main__":
    sys.exit(main())
