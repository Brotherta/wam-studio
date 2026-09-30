#!/bin/bash
set -eu
BASE="/home/pi/wam-studio/public/Raspberry_Communication"
cp /home/pi/RaspberryServeurBoucleHeartbeat.js "$BASE/serveur/presence/RaspberryServeurBoucleHeartbeat.js"
cp /home/pi/RaspberryServeurSondageReseau.js "$BASE/serveur/reseau/RaspberryServeurSondageReseau.js"
cat > "$BASE/raspberry-parc.json" << 'EOF'
{
  "subnetPrefix": "192.168.1.",
  "activeNumbers": [74, 75]
}
EOF
sudo systemctl restart wam-studio
echo "WAM relance."
