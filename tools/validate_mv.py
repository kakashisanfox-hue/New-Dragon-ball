#!/usr/bin/env python3
"""Verificações estruturais do projeto RPG Maker MV, sem alterar arquivos."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
errors = []
warnings = []
loaded = {}
for path in sorted(DATA.glob("*.json")):
    try:
        loaded[path.stem] = json.loads(path.read_text(encoding="utf-8-sig"))
    except (OSError, ValueError) as exc:
        errors.append(f"{path.name}: JSON inválido: {exc}")
for required in ("System", "MapInfos", "Actors", "Enemies", "Troops", "Map001", "Map002"):
    if required not in loaded:
        errors.append(f"Arquivo obrigatório ausente: data/{required}.json")
for name, obj in loaded.items():
    if not name.startswith("Map") or name == "MapInfos" or not isinstance(obj, dict):
        continue
    width, height = obj.get("width", 0), obj.get("height", 0)
    tiles = obj.get("data", [])
    if len(tiles) != width * height * 6:
        errors.append(f"{name}: grade inválida ({len(tiles)} valores, esperado {width * height * 6})")
    for event in filter(None, obj.get("events", [])):
        if not (0 <= event.get("x", -1) < width and 0 <= event.get("y", -1) < height):
            errors.append(f"{name}: evento {event.get('id')} fora do mapa")
        for page in event.get("pages", []):
            commands = page.get("list", [])
            if not commands or commands[-1].get("code") != 0:
                warnings.append(f"{name}: evento {event.get('id')} sem comando final 0")
print(f"Arquivos JSON analisados: {len(loaded)}")
for warning in warnings:
    print("AVISO:", warning)
for error in errors:
    print("ERRO:", error)
print("RESULTADO:", "FALHOU" if errors else "ESTRUTURA OK")
raise SystemExit(1 if errors else 0)
