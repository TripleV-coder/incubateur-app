#!/usr/bin/env python3
"""Pousse les clés de .env vers Vercel (production), sauf DATABASE_URL.

Usage (depuis la racine du dépôt) :
  python3 scripts/sync-env-vercel.py

DATABASE_URL doit être une base Postgres hébergée (Neon, Supabase, etc.) :
  npx vercel env add DATABASE_URL production --sensitive --yes < fichier_url.txt
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path


def _resolve_production_url(root: Path) -> str:
    proj_file = root / ".vercel" / "project.json"
    name = "incubateur-app"
    if proj_file.is_file():
        try:
            data = json.loads(proj_file.read_text(encoding="utf-8"))
            name = data.get("projectName") or name
        except (OSError, json.JSONDecodeError):
            pass
    r = subprocess.run(
        ["npx", "vercel", "project", "ls", "--format", "json"],
        cwd=root,
        capture_output=True,
        text=True,
    )
    if r.returncode == 0 and r.stdout:
        try:
            blob = json.loads(r.stdout)
            for p in blob.get("projects", []):
                if p.get("name") == name:
                    url = p.get("latestProductionUrl")
                    if url:
                        return str(url)
        except json.JSONDecodeError:
            pass
    return "https://incubateur-app-nerrys-projects.vercel.app"


def parse_env(path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        k, v = line.split("=", 1)
        k = k.strip()
        v = v.strip()
        if len(v) >= 2 and v[0] == v[-1] and v[0] in "\"'":
            v = v[1:-1]
        out[k] = v
    return out


def main() -> int:
    # À lancer depuis la racine du dépôt (là où se trouvent `.env` et `.vercel/`).
    root = Path.cwd()
    env_path = root / ".env"
    if not env_path.is_file():
        print("Fichier .env introuvable à la racine du dépôt.", file=sys.stderr)
        return 1

    prod_url = _resolve_production_url(root)
    url_keys = {"NEXTAUTH_URL", "AUTH_URL", "APP_BASE_URL"}
    skip = {"DATABASE_URL"}

    env = parse_env(env_path)
    for key in sorted(env.keys()):
        if key in skip:
            print(f"⊘ ignoré (à configurer à la main) : {key}")
            continue
        val = prod_url if key in url_keys else env[key]
        r = subprocess.run(
            [
                "npx",
                "vercel",
                "env",
                "add",
                key,
                "production",
                "--yes",
                "--sensitive",
                "--force",
            ],
            cwd=root,
            input=val.encode("utf-8"),
            capture_output=True,
        )
        if r.returncode != 0:
            err = (r.stderr or r.stdout or b"").decode("utf-8", errors="replace")
            print(f"✗ {key} : {err.strip()}", file=sys.stderr)
            return r.returncode
        print(f"✓ {key}")

    print(
        "\nEnsuite : créer une base Postgres (ex. https://neon.tech ), puis :\n"
        f'  printf "%s" "postgresql://…" | npx vercel env add DATABASE_URL production --sensitive --yes\n'
        "Puis : npx vercel deploy --prod --yes"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
