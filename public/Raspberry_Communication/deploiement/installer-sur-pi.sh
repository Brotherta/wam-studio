#!/bin/bash
# Installe Node, les dependances, compile le projet et demarre WAM Studio.
# A lancer sur le Raspberry, depuis le depot deja copie dans ~/wam-studio.
set -euo pipefail

RACINE="$(cd "$(dirname "$0")/../../.." && pwd)"
DOSSIER_SCRIPT="$(cd "$(dirname "$0")" && pwd)"

verifier_linux() {
  if [ "$(uname -s)" != "Linux" ]; then
    echo "Ce script se lance sur le Raspberry Pi, pas sur le PC."
    exit 1
  fi
}

allonger_delai_mot_de_passe_ssh() {
  local fichier="/etc/ssh/sshd_config"
  if grep -q '^LoginGraceTime' "$fichier"; then
    sudo sed -i 's/^LoginGraceTime.*/LoginGraceTime 600/' "$fichier"
  elif grep -q '^#LoginGraceTime' "$fichier"; then
    sudo sed -i 's/^#LoginGraceTime.*/LoginGraceTime 600/' "$fichier"
  else
    echo "LoginGraceTime 600" | sudo tee -a "$fichier" > /dev/null
  fi
  sudo systemctl restart ssh || sudo systemctl restart sshd || true
  echo "Delai pour taper le mot de passe SSH : 10 minutes."
}

installer_node() {
  sudo DEBIAN_FRONTEND=noninteractive apt-get update
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y \
    ca-certificates curl gnupg build-essential python3

  if command -v node >/dev/null 2>&1; then
    local version_majeure
    version_majeure="$(node -p "process.versions.node.split('.')[0]")"
    if [ "$version_majeure" -ge 20 ]; then
      echo "Node.js $(node -v) est deja installe."
      return
    fi
  fi

  echo "Installation de Node.js 22..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs
  echo "Node.js $(node -v) installe."
}

ecrire_fichier_si_absent() {
  local chemin="$1"
  local contenu="$2"
  if [ -f "$chemin" ]; then
    echo "Conserve le fichier existant : $chemin"
    return
  fi
  printf '%s\n' "$contenu" > "$chemin"
  echo "Fichier cree : $chemin"
}

ecrire_fichiers_env() {
  ecrire_fichier_si_absent "$RACINE/public/.env" "PORT=5002
HTTPS_DEV=false
BACKEND_URL=http://localhost:6002
SONGS_FILE_URL=http://localhost:6002"

  ecrire_fichier_si_absent "$RACINE/bank/.env" "PORT=6002
STORAGE_DIR=storage
ADMIN_PASSWORD=123456
JWT_SECRET=123456
NODE_ENV=development
HTTPS=false
BANKURL=http://localhost:6002"
}

installer_dependances() {
  echo "Installation des dependances (plusieurs minutes)..."
  (cd "$RACINE/public" && npm install --no-audit --no-fund)
  (cd "$RACINE/bank" && npm install --no-audit --no-fund)
  (cd "$RACINE/public/Raspberry_Communication/agent-transfert" && npm install --no-audit --no-fund)
}

compiler_projet() {
  echo "Compilation de WAM Studio..."
  (
    cd "$RACINE/public"
    NODE_OPTIONS="--max-old-space-size=1536" npm run build
  )
  echo "Compilation de la banque..."
  (cd "$RACINE/bank" && npm run build)
  echo "Compilation de l'agent de transfert..."
  (cd "$RACINE/public/Raspberry_Communication/agent-transfert" && npm run build)
}

installer_service() {
  local utilisateur unite
  utilisateur="$(id -un)"
  unite="/etc/systemd/system/wam-studio.service"

  sudo tee "$unite" > /dev/null << EOF
[Unit]
Description=WAM Studio
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=${utilisateur}
WorkingDirectory=${RACINE}
ExecStart=/bin/bash ${DOSSIER_SCRIPT}/demarrer-wam.sh
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

  sudo systemctl daemon-reload
  sudo systemctl enable wam-studio.service
  sudo systemctl restart wam-studio.service
}

installer_ouverture_bureau() {
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y chromium \
    || sudo DEBIAN_FRONTEND=noninteractive apt-get install -y chromium-browser \
    || true

  if command -v raspi-config >/dev/null 2>&1; then
    sudo raspi-config nonint do_boot_behaviour B4 || true
  fi

  local dossier_auto fichier_auto
  dossier_auto="$HOME/.config/autostart"
  fichier_auto="$dossier_auto/wam-studio.desktop"
  mkdir -p "$dossier_auto"
  cat > "$fichier_auto" << EOF
[Desktop Entry]
Type=Application
Name=WAM Studio
Exec=/bin/bash ${DOSSIER_SCRIPT}/ouvrir-interface-wam.sh
X-GNOME-Autostart-enabled=true
EOF

  sudo mkdir -p /etc/xdg/autostart
  sudo cp "$fichier_auto" /etc/xdg/autostart/wam-studio.desktop
}

afficher_adresse() {
  local ip
  ip="$(hostname -I 2>/dev/null | awk '{print $1}')"
  echo ""
  echo "WAM Studio tourne sur ce Raspberry."
  echo "Au prochain allumage, le projet repart tout seul."
  echo "Avec la souris et l'ecran, le bureau ouvre http://localhost:5002"
  if [ -n "$ip" ]; then
    echo "Adresse du Pi sur le reseau : $ip"
  fi
  echo "Journaux : $RACINE/logs/"
}

verifier_linux
allonger_delai_mot_de_passe_ssh
installer_node
ecrire_fichiers_env
installer_dependances
compiler_projet
installer_service
installer_ouverture_bureau
afficher_adresse
