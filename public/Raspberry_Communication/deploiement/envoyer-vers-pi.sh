#!/bin/bash
# Envoie le projet vers le Raspberry et lance l'installation.
# Meme role que envoyer-vers-pi.ps1, pour Mac et Linux.
#
# Depuis la racine du depot :
#   bash public/Raspberry_Communication/deploiement/envoyer-vers-pi.sh 192.168.1.42
#   bash public/Raspberry_Communication/deploiement/envoyer-vers-pi.sh 192.168.1.42 pi
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage : bash envoyer-vers-pi.sh ADRESSE [UTILISATEUR]"
  exit 1
fi

ADRESSE="$1"
UTILISATEUR="${2:-pi}"
RACINE="$(cd "$(dirname "$0")/../../.." && pwd)"
ARCHIVE="${TMPDIR:-/tmp}/wam-studio-pour-pi.tar"
CIBLE="${UTILISATEUR}@${ADRESSE}"

for commande in tar scp ssh base64; do
  if ! command -v "$commande" >/dev/null 2>&1; then
    echo "Commande introuvable : $commande"
    exit 1
  fi
done

rm -f "$ARCHIVE"

echo "Creation de l'archive (sans node_modules, sans fichiers audio temporaires)..."
tar -cf "$ARCHIVE" \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=.git \
  --exclude=temp \
  --exclude=storage \
  --exclude=logs \
  -C "$RACINE" .

echo "Envoi vers $CIBLE (le mot de passe SSH est demande)..."
scp "$ARCHIVE" "${CIBLE}:wam-studio-pour-pi.tar"

SCRIPT_DISTANT='set -euo pipefail
chmod -R u+w ~/wam-studio 2>/dev/null || true
rm -rf ~/wam-studio
mkdir -p ~/wam-studio
python3 -c "import os,tarfile; dest=os.path.expanduser('"'"'~/wam-studio'"'"'); arch=os.path.expanduser('"'"'~/wam-studio-pour-pi.tar'"'"'); t=tarfile.open(arch); ms=t.getmembers(); [t.extract(m, dest, set_attrs=False) for m in ms]; t.close()"
sed -i '"'"'s/\r$//'"'"' ~/wam-studio/public/Raspberry_Communication/deploiement/*.sh
bash ~/wam-studio/public/Raspberry_Communication/deploiement/installer-sur-pi.sh
rm -f ~/wam-studio-pour-pi.tar /tmp/installer-wam.sh
'
ENCODE=$(printf '%s' "$SCRIPT_DISTANT" | base64 | tr -d '\n')

echo "Installation sur le Raspberry (le mot de passe SSH est demande une seconde fois)..."
ssh -t "$CIBLE" "echo $ENCODE | base64 -d > /tmp/installer-wam.sh && bash /tmp/installer-wam.sh"

rm -f "$ARCHIVE"
echo "Termine. Au prochain allumage, le projet repart tout seul."
echo "Branche la souris et l'ecran : le bureau ouvre http://localhost:5002"
