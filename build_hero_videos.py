#!/usr/bin/env python3
"""
build_hero_videos.py — Hero Video Pipeline "Versione 2" (6.0s Hard Cut) for BibiB&B
Architecture: DOE Framework (Description, Orchestration, Execution)
Style: Stacchi Netti (Hard Cut), zero dissolvenze, ritmo serrato
Hardware: Stream nativo FFmpeg (zero saturazione RAM su Apple Silicon M3 8GB)

Timeline (6.0s esatti):
1. 0.0s – 1.2s (1.2s): Golfo / Vesuvio (panoramica aperta)
2. 1.2s – 2.0s (0.8s): Vicolo profondo verticale Spaccanapoli (densità urbana)
3. 2.0s – 2.8s (0.8s): Basilico sulla pizza (micro-dettaglio materico)
4. 2.8s – 3.6s (0.8s): Murale Maradona ai Quartieri Spagnoli (identità/cultura)
5. 3.6s – 6.0s (2.4s): Camera da letto del B&B (inquadratura pulita, stabile, hero.jpg)
"""

import os
import sys
import json
import shutil
import subprocess
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
RAW_DIR = ROOT_DIR / "assets" / "video" / "raw"
FALLBACK_RAW_DIR = ROOT_DIR / "Video"
HERO_IMAGE = ROOT_DIR / "assets" / "images" / "hero.jpg"
OUTPUT_DIR = ROOT_DIR / "assets" / "video"
TMP_D = OUTPUT_DIR / "_tmp_d"
TMP_M = OUTPUT_DIR / "_tmp_m"

HERO_DESKTOP = OUTPUT_DIR / "hero-desktop.mp4"
HERO_MOBILE = OUTPUT_DIR / "hero-mobile.mp4"

# 5 Scene esatte per Versione 2 (Totale 6.0s)
TIMELINE = [
    {
        "filename": "15673263-uhd_3840_2160_60fps.mp4",
        "label": "Golfo / Vesuvio (panoramica aperta)",
        "ss": 2.5,
        "dur": 1.666667,
        "is_image": False
    },
    {
        "filename": "16750845_1080_1920_25fps.mp4",
        "label": "Vicolo profondo verticale Spaccanapoli (densità urbana)",
        "ss": 1.5,
        "dur": 1.666667,
        "is_image": False
    },
    {
        "filename": "15604809-uhd_2160_3840_25fps.mp4",
        "label": "Basilico sulla pizza (micro-dettaglio materico)",
        "ss": 2.0,
        "dur": 1.666667,
        "is_image": False
    },
    {
        "filename": "113807-699653819.mp4",
        "label": "Piazza del Plebiscito (solennità neoclassica)",
        "ss": 4.0,
        "dur": 1.666667,
        "is_image": False
    },
    {
        "filename": "134977-760679914.mp4",
        "label": "Murale Maradona (identità/cultura)",
        "ss": 2.0,
        "dur": 1.666667,
        "is_image": False
    },
    {
        "filename": "hero.jpg",
        "label": "Camera da letto del B&B (inquadratura pulita e stabile)",
        "ss": 0.0,
        "dur": 1.666667,
        "is_image": True
    }
]


def probe_file(file_path: Path):
    cmd = [
        "ffprobe", "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height",
        "-of", "json",
        str(file_path)
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
    data = json.loads(res.stdout)
    stream = data["streams"][0]
    w = int(stream["width"])
    h = int(stream["height"])
    return {"path": file_path, "width": w, "height": h, "is_vertical": (w / h) < 1.0}


def build_filter(meta: dict, target_mode: str) -> str:
    is_vertical = meta["is_vertical"]

    if target_mode == "desktop":
        if is_vertical:
            crop_scale = (
                "crop=w=in_w:h=trunc(in_w*9/16/2)*2:x=0:y=(in_h-out_h)/2,"
                "scale=1920:1080:flags=bicubic"
            )
        else:
            crop_scale = (
                "crop=w=trunc(in_h*16/9/2)*2:h=in_h:x=(in_w-out_w)/2:y=0,"
                "scale=1920:1080:flags=bicubic"
            )
    else:  # mobile
        if is_vertical:
            crop_scale = (
                "crop=w=in_w:h=trunc(in_w*16/9/2)*2:x=0:y=(in_h-out_h)/2,"
                "scale=720:1280:flags=bicubic"
            )
        else:
            crop_scale = (
                "crop=w=trunc(in_h*9/16/2)*2:h=in_h:x=(in_w-out_w)/2:y=0,"
                "scale=720:1280:flags=bicubic"
            )

    return f"{crop_scale},fps=24,setsar=1,format=yuv420p"


def main():
    print("=" * 75)
    print("🎬 BibiB&B Hero Video Engine — Versione 3 (10.0s Hard Cut)")
    print("=" * 75)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    TMP_D.mkdir(parents=True, exist_ok=True)
    TMP_M.mkdir(parents=True, exist_ok=True)

    total_duration = sum(item["dur"] for item in TIMELINE)
    print(f"[*] Timeline impostata su {len(TIMELINE)} scene | Durata totale: {total_duration:.2f}s")

    d_segments = []
    m_segments = []

    # 1. Normalizzazione dei singoli segmenti
    for idx, item in enumerate(TIMELINE):
        if item["is_image"]:
            source_path = HERO_IMAGE
        else:
            cand1 = RAW_DIR / item["filename"]
            cand2 = FALLBACK_RAW_DIR / item["filename"]
            source_path = cand1 if cand1.exists() else cand2

        if not source_path.exists():
            raise FileNotFoundError(f"File sorgente mancante: {source_path}")

        meta = probe_file(source_path)
        seg_d = TMP_D / f"seg_{idx:02d}.mp4"
        seg_m = TMP_M / f"seg_{idx:02d}.mp4"

        filter_d = build_filter(meta, "desktop")
        filter_m = build_filter(meta, "mobile")

        print(f"  [{idx+1}/{len(TIMELINE)}] {item['label']} ({item['dur']}s)")

        if item["is_image"]:
            cmd_d = [
                "ffmpeg", "-y", "-loop", "1", "-t", str(item["dur"]),
                "-i", str(source_path),
                "-vf", filter_d,
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
                "-an", str(seg_d)
            ]
            cmd_m = [
                "ffmpeg", "-y", "-loop", "1", "-t", str(item["dur"]),
                "-i", str(source_path),
                "-vf", filter_m,
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
                "-an", str(seg_m)
            ]
        else:
            cmd_d = [
                "ffmpeg", "-y", "-ss", str(item["ss"]), "-t", str(item["dur"]),
                "-i", str(source_path),
                "-vf", filter_d,
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
                "-an", str(seg_d)
            ]
            cmd_m = [
                "ffmpeg", "-y", "-ss", str(item["ss"]), "-t", str(item["dur"]),
                "-i", str(source_path),
                "-vf", filter_m,
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
                "-an", str(seg_m)
            ]

        subprocess.run(cmd_d, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        subprocess.run(cmd_m, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

        d_segments.append(seg_d)
        m_segments.append(seg_m)

    # 2. Concat via concat demuxer con hard cuts (zero dissolvenze)
    list_d = TMP_D / "concat_list.txt"
    list_m = TMP_M / "concat_list.txt"

    with open(list_d, "w") as f:
        for p in d_segments:
            f.write(f"file '{p.resolve()}'\n")

    with open(list_m, "w") as f:
        for p in m_segments:
            f.write(f"file '{p.resolve()}'\n")

    print("\n[*] Mastering Desktop Hero Video (1920x1080, libx264, preset slow, CRF 23.5, maxrate 2800k)...")
    cmd_master_d = [
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(list_d),
        "-c:v", "libx264", "-preset", "slow", "-crf", "23.5",
        "-maxrate", "2800k", "-bufsize", "5600k",
        "-pix_fmt", "yuv420p",
        "-an", "-movflags", "+faststart",
        str(HERO_DESKTOP)
    ]
    subprocess.run(cmd_master_d, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

    print("[*] Mastering Mobile Hero Video (720x1280, libx264, preset slow, CRF 25)...")
    cmd_master_m = [
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(list_m),
        "-c:v", "libx264", "-preset", "slow", "-crf", "25",
        "-pix_fmt", "yuv420p",
        "-an", "-movflags", "+faststart",
        str(HERO_MOBILE)
    ]
    subprocess.run(cmd_master_m, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

    # 3. Pulizia temporanei
    print("[*] Pulizia cartelle temporanee...")
    shutil.rmtree(TMP_D, ignore_errors=True)
    shutil.rmtree(TMP_M, ignore_errors=True)

    # 4. Statistiche & Verifica
    d_size = HERO_DESKTOP.stat().st_size
    m_size = HERO_MOBILE.stat().st_size
    d_mb = d_size / (1024 * 1024)
    m_mb = m_size / (1024 * 1024)

    print("=" * 75)
    print("✅ MASTERING VERSIONE 5 COMPLETATO")
    print(f"Desktop: {HERO_DESKTOP} | {d_mb:.2f} MB (Target < 2.5 MB: {'PASS' if d_mb < 2.5 else 'OVER'})")
    print(f"Mobile:  {HERO_MOBILE} | {m_mb:.2f} MB (Target < 1.5 MB: {'PASS' if m_mb < 1.5 else 'OVER'})")
    print("=" * 75)


if __name__ == "__main__":
    main()
