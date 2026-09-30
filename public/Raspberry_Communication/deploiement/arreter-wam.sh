#!/bin/bash
# Arrete le service WAM Studio sur le Raspberry.
set -euo pipefail

if command -v systemctl >/dev/null 2>&1; then
  sudo systemctl stop wam-studio.service
  echo "WAM Studio est arrete."
  exit 0
fi

echo "systemctl est introuvable. Arret impossible par ce script."
exit 1
