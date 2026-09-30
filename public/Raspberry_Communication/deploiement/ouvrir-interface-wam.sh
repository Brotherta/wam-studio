#!/bin/bash
# Ouvre WAM Studio dans Chromium quand le site repond.
# Lance au demarrage du bureau, pas par systemd.

attente=0
while [ "$attente" -lt 90 ]; do
  if (echo >/dev/tcp/127.0.0.1/5002) >/dev/null 2>&1; then
    break
  fi
  attente=$((attente + 1))
  sleep 1
done

if command -v chromium >/dev/null 2>&1; then
  exec chromium --start-maximized "http://localhost:5002"
fi

if command -v chromium-browser >/dev/null 2>&1; then
  exec chromium-browser --start-maximized "http://localhost:5002"
fi

echo "Chromium est introuvable. Ouvre http://localhost:5002 a la main."
exit 0
