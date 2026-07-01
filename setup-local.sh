#!/usr/bin/env bash
set -e

# ── .env.local ────────────────────────────────────────────────────────────────
if [ -f .env.local ]; then
  echo ".env.local already exists, skipping creation."
else
  echo "Creating .env.local..."
  cp .env.default .env.local

  read -p "  EMAIL:    " email
  read -s -p "  PASSWORD: " password; echo

  sed -i '' "s/^EMAIL=.*/EMAIL=$email/" .env.local
  sed -i '' "s/^PASSWORD=.*/PASSWORD=$password/" .env.local

  echo ".env.local created."
fi

# ── dependencies ──────────────────────────────────────────────────────────────
echo "Installing dependencies..."
npm install

echo "Installing Playwright browsers..."
npx playwright install chromium

echo ""
echo "Done. Run 'npm test' to verify your setup."
