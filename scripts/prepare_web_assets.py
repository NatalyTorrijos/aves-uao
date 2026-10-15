"""Prepare local web copies without changing received model geometry or originals.

Uses the conservative GLB extractor and independent active-scene fingerprint.
Blender's audio decoder/encoder verifies complete streams and converts only WAV
distribution copies to MP3. No audio is trimmed or normalized.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import math
import subprocess
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
MODEL_DIR = ROOT / "recursos-originales/modelos-animados/2026-10-14"
AUDIO_DIR = ROOT / "recursos-originales/audios/2026-10-14"
WEB = ROOT / "public/assets"
TEMP = ROOT / "tmp/asset-preparation"
BIRDS = (
    ("cernicalo-americano", "Cernícalo Americano", "Peregrine.glb", "Peregrine.wav", 5),
    ("reinita-tropical", "Reinita Tropical", "ReinitaTropical.glb", "Reinita Tropical.mp3", 3),
    ("mosquerito-silbon", "Mosquerito Silbón", "MosquiteroSilbon.glb", "Mosquerito Silbón.wav", 4),
    ("carpintero-cariblanco", "Carpintero Cariblanco", "CarpinteroCariblanco.glb", "Carpintero Cariblanco.mp3", 1),
    ("colibri-esmeralda", "Colibrí Esmeralda", "ColibriEsmeralda.glb", "Colibrí Esmeralda.mp3", 2),
)
AUDIO_CREDITS = {
    "cernicalo-americano": {"author": "Cristian Pinto Fernandez", "year": 2022,
        "sourceUrl": None, "license": None,
        "note": "Metadato ID3: Cernicalo. Fuente, licencia e identidad exacta pendientes."},
    "reinita-tropical": {"author": "Étienne Leroy", "year": 2026,
        "sourceUrl": "https://xeno-canto.org/1184753", "license": None,
        "note": "Fuente declarada en metadatos; licencia de la ficha pendiente."},
    "mosquerito-silbon": {"author": None, "year": None, "sourceUrl": None, "license": None,
        "note": "Sin autor ni licencia recuperados. El enlace del Word XC1140314 no acredita este WAV."},
    "carpintero-cariblanco": {"author": "Jerome Fischer", "year": 2020,
        "sourceUrl": "https://xeno-canto.org/615457", "license": "CC BY-NC-SA 4.0",
        "licenseUrl": "https://creativecommons.org/licenses/by-nc-sa/4.0/",
        "note": "Licencia declarada en metadatos. El grabador indica 90 % de probabilidad de identificación y ave no vista."},
    "colibri-esmeralda": {"author": "Jerome Fischer", "year": 2020,
        "sourceUrl": "https://xeno-canto.org/527987", "license": "CC BY-NC-SA 4.0",
        "licenseUrl": "https://creativecommons.org/licenses/by-nc-sa/4.0/",
        "note": "Licencia declarada en metadatos; contrastar condiciones en la ficha fuente antes de publicación."},
}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def write_copy(path, data):
    """Do not silently replace any existing asset with different content."""
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        if path.read_bytes() != data:
            raise ValueError(f"Existing asset differs; review before replacing: {path}")
    else:
        path.write_bytes(data)


def public_record(path):
    data = path.read_bytes()
    return {"path": "/" + path.relative_to(ROOT / "public").as_posix(),
            "bytes": len(data), "sha256": sha(data)}


def accessor_values(g, binary, index):
    import numpy as np
    accessor = g["accessors"][index]
    if "sparse" in accessor:
        raise ValueError("Animation audit requires non-sparse accessors")
    view = g["bufferViews"][accessor["bufferView"]]
    dtypes = {5120: "i1", 5121: "u1", 5122: "<i2", 5123: "<u2", 5125: "<u4", 5126: "<f4"}
    sizes = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4, "MAT4": 16}
    dtype = np.dtype(dtypes[accessor["componentType"]])
    width = sizes[accessor["type"]]
    offset = view.get("byteOffset", 0) + accessor.get("byteOffset", 0)
    return np.ndarray((accessor["count"], width), dtype=dtype, buffer=binary,
                      offset=offset, strides=(view.get("byteStride", width * dtype.itemsize), dtype.itemsize))


def clip_report(g, binary):
    import numpy as np
    joints = {joint for skin in g.get("skins", []) for joint in skin["joints"]}
    clips = []
    for index, animation in enumerate(g.get("animations", [])):
        varying = []
        end = 0.0
        for channel in animation["channels"]:
            sampler = animation["samplers"][channel["sampler"]]
            times = accessor_values(g, binary, sampler["input"])
            values = accessor_values(g, binary, sampler["output"])
            if not np.isfinite(times).all() or not np.isfinite(values).all():
                raise ValueError("Non-finite animation data")
            end = max(end, float(times.max()))
            if sampler.get("interpolation") == "CUBICSPLINE":
                values = values[1::3]
            if len(values) > 1 and np.any(np.abs(values - values[0]) > 1e-5):
                target = channel["target"]
                varying.append({"node": target["node"],
                                "name": g["nodes"][target["node"]].get("name", ""),
                                "path": target["path"], "joint": target["node"] in joints})
        clips.append({"index": index, "name": animation.get("name", f"Clip {index}"),
                      "durationSeconds": round(end, 4), "channels": len(animation["channels"]),
                      "varyingChannels": len(varying),
                      "varyingJointChannels": sum(v["joint"] for v in varying),
                      "varyingTargets": varying, "variationThreshold": 1e-5,
                      "behaviorValidated": False})
    return clips


def prepare_model(source_name, slug):
    from clean_glb import clean, read_glb, verify_exact, write_glb, view_bytes
    from verify_clean_glb import fingerprint
    from PIL import Image
    source = MODEL_DIR / source_name
    g, binary, original = read_glb(source)
    expected, packed, maps = clean(g, binary)
    target = WEB / "models" / (slug + ".glb")
    target.parent.mkdir(parents=True, exist_ok=True)
    if not target.exists():
        write_glb(target, expected, packed)
    actual, actual_binary, _ = read_glb(target)
    verify_exact(g, binary, actual, actual_binary, maps)
    before, after = fingerprint(g, binary), fingerprint(actual, actual_binary)
    if before != after:
        raise ValueError(f"Active scene changed: {source_name}")
    # The independent graph hash covers visual data and rig. Verify the animation
    # graph separately, since that hash intentionally excludes animation arrays.
    if actual.get("animations", []) != expected.get("animations", []):
        raise ValueError(f"Animation graph changed: {source_name}")
    if source.read_bytes() != original:
        raise ValueError(f"Original changed: {source_name}")
    textures = []
    for embedded in actual.get("images", []):
        with Image.open(io.BytesIO(view_bytes(actual, actual_binary, embedded["bufferView"]))) as image:
            image.load()
            textures.append({"width": image.width, "height": image.height, "mode": image.mode})
    clips = clip_report(actual, actual_binary)
    moving = [c for c in clips if c["varyingJointChannels"] > 0]
    suggested = moving[0]["index"] if moving else None
    triangles = sum(actual["accessors"][p["indices"]]["count"] // 3
                    if "indices" in p else actual["accessors"][p["attributes"]["POSITION"]]["count"] // 3
                    for mesh in actual.get("meshes", []) for p in mesh["primitives"]
                    if p.get("mode", 4) == 4)
    return {**public_record(target), "source": source.relative_to(ROOT).as_posix(),
            "sourceBytes": len(original), "sourceSha256": sha(original),
            "savedPercent": round(100 * (1 - target.stat().st_size / len(original)), 2),
            "activeSceneFingerprint": after, "activeScenePreserved": True,
            "retainedAnimationDataPreserved": True, "sceneCount": len(actual["scenes"]),
            "embeddedImagesDecoded": True, "embeddedImages": textures,
            "triangles": triangles, "skins": len(actual.get("skins", [])),
            "joints": sum(len(s["joints"]) for s in actual.get("skins", [])),
            "clips": clips, "clipCount": len(clips), "movingClipCount": len(moving),
            "suggestedPreviewClipIndex": suggested,
            "clipSelectionNote": "Primer clip con canales de huesos variables; no atribuye conducta biológica. Requiere revisión visual.",
            "mobilePerformanceValidated": False}


def audio_worker():
    """Runs inside Blender Python to use its aud decoder and MP3 encoder."""
    import aud
    import numpy as np
    result = {}
    for slug, _, _, filename, _ in BIRDS:
        source = AUDIO_DIR / filename
        source_hash = sha(source.read_bytes())
        target = WEB / "audio" / (slug + ".mp3")
        target.parent.mkdir(parents=True, exist_ok=True)
        sound = aud.Sound.file(str(source))
        data = sound.data()
        if not len(data) or not np.isfinite(data).all():
            raise ValueError(f"Audio could not be fully decoded: {source}")
        rate, channels = sound.specs
        conversion = source.suffix.lower() == ".wav"
        if conversion:
            if not target.exists():
                sound.write(str(target), int(rate), int(channels), aud.FORMAT_S16,
                            aud.CONTAINER_MP3, aud.CODEC_MP3, 128000, 4096)
        else:
            write_copy(target, source.read_bytes())
        decoded = aud.Sound.file(str(target))
        output = decoded.data()
        out_rate, out_channels = decoded.specs
        if not len(output) or not np.isfinite(output).all():
            raise ValueError(f"Output could not be fully decoded: {target}")
        if abs(len(data) / rate - len(output) / out_rate) > 0.1 or channels != out_channels:
            raise ValueError(f"Audio length/channels changed unexpectedly: {target}")
        if source_hash != sha(source.read_bytes()):
            raise ValueError(f"Audio original changed: {source}")
        result[slug] = {**public_record(target), "source": source.relative_to(ROOT).as_posix(),
                       "sourceBytes": source.stat().st_size, "sourceSha256": source_hash,
                       "sourceFrames": len(data), "decodedFrames": len(output),
                       "durationSeconds": round(len(output) / out_rate, 6),
                       "sampleRateHz": out_rate, "channels": out_channels,
                       "codec": "MP3", "convertedFromWav": conversion,
                       "conversionBitrateKbps": 128 if conversion else None,
                       "trimmed": False, "normalized": False,
                       "fullDecodeVerified": True, "decodeEngine": "Blender aud / FFmpeg",
                       "decodedPeak": round(float(np.max(np.abs(output))), 6),
                       "decodedRms": round(math.sqrt(float(np.mean(output.astype(np.float64) ** 2))), 6),
                       "acousticSpeciesIdentityVerified": False,
                       "attribution": AUDIO_CREDITS[slug]}
    (TEMP / "audio-decode.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--blender", default=r"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe")
    args = parser.parse_args()
    TEMP.mkdir(parents=True, exist_ok=True)
    if not Path(args.blender).is_file():
        raise FileNotFoundError("Specify an installed Blender executable with --blender")
    proc = subprocess.run([args.blender, "--background", "--factory-startup", "--python", str(Path(__file__).resolve()),
                           "--", "--audio-worker"], cwd=ROOT, capture_output=True, text=True, encoding="utf-8", errors="replace")
    (TEMP / "audio-decode.log").write_text(proc.stdout + proc.stderr, encoding="utf-8")
    if proc.returncode or not (TEMP / "audio-decode.json").exists() or "Traceback" in proc.stdout + proc.stderr:
        raise RuntimeError("Audio preparation failed; see tmp/asset-preparation/audio-decode.log")
    audio = json.loads((TEMP / "audio-decode.json").read_text(encoding="utf-8"))
    document = ROOT / "AvesRA/PROPUESTA DE EXPERIENCIA INTERACTIVA.docx"
    from PIL import Image
    report = {"schemaVersion": 1, "preparedOn": "2026-10-14", "birds": {},
              "limitations": ["La identidad acústica de las grabaciones no fue verificada mediante escucha experta.",
                              "La licencia y autoría de las fotografías del Word están pendientes de confirmar.",
                              "Los modelos conservan la apariencia recibida; no se corrigieron rasgos de especie.",
                              "Los índices de clip no equivalen a conductas biológicas verificadas.",
                              "La decodificación local no sustituye la prueba de audio y modelos en Safari/Chrome móvil."]}
    with zipfile.ZipFile(document) as archive:
        for slug, name, model, filename, image_index in BIRDS:
            model_info = prepare_model(model, slug)
            image_bytes = archive.read(f"word/media/image{image_index}.jpg")
            target = WEB / "images" / (slug + ".jpg")
            write_copy(target, image_bytes)
            with Image.open(target) as image:
                image.load()
                dimensions = list(image.size)
            photo_info = {**public_record(target), "source": document.relative_to(ROOT).as_posix(),
                          "sourceMember": f"word/media/image{image_index}.jpg", "dimensions": dimensions,
                          "originalImagePreserved": True, "decodeVerified": True,
                          "attribution": {"author": None, "license": None,
                                          "note": "Fotografía aportada por el equipo en el Word. Autoría/licencia pendientes; conservar posibles marcas de crédito visibles."}}
            report["birds"][slug] = {"name": name, "model": model_info, "audio": audio[slug], "photo": photo_info}
            print(f"{slug}: {model_info['bytes'] / 1e6:.2f} MB, {model_info['clipCount']} clips, "
                  f"audio {audio[slug]['bytes'] / 1e6:.2f} MB, {audio[slug]['durationSeconds']:.2f} s", flush=True)
    report["campus"] = prepare_model("universidad2.glb", "campus")
    report["totalModelBytes"] = sum(b["model"]["bytes"] for b in report["birds"].values()) + report["campus"]["bytes"]
    report["totalAudioBytes"] = sum(b["audio"]["bytes"] for b in report["birds"].values())
    (WEB / "asset-manifest.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Asset manifest written. Models: {report['totalModelBytes'] / 1e6:.2f} MB; audio: {report['totalAudioBytes'] / 1e6:.2f} MB.")


if __name__ == "__main__":
    if "--audio-worker" in sys.argv:
        audio_worker()
    else:
        main()
