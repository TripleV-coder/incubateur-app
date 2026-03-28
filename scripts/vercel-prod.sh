#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  echo "❌ Définis VERCEL_TOKEN (token avec scope du compte / équipe)."
  echo "   Création : https://vercel.com/account/tokens"
  echo ""
  echo "   Exemple :"
  echo "   export VERCEL_TOKEN=xxxxxxxx"
  echo "   npm run deploy:vercel"
  exit 1
fi

exec npx vercel deploy --prod --yes --token "$VERCEL_TOKEN"
