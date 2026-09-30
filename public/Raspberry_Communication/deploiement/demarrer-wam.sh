#!/bin/bash
# Demarre la banque, WAM Studio, l'agent et le serveur Raspberry.
# Reste au premier plan pour systemd, y compris apres un reboot.
set -euo pipefail

RACINE="$(cd "$(dirname "$0")/../../.." && pwd)"
LOGS="$RACINE/logs"
NODE="$(command -v node)"
DOSSIER_SCRIPT="$(cd "$(dirname "$0")" && pwd)"

mkdir -p "$LOGS"

attendre_port() {
  local port="$1"
  local essai=0
  while [ "$essai" -lt 40 ]; do
    if (echo >/dev/tcp/127.0.0.1/"$port") >/dev/null 2>&1; then
      return 0
    fi
    essai=$((essai + 1))
    sleep 0.5
  done
  return 1
}

arreter_enfants() {
  kill "$PID_BANQUE" "$PID_STUDIO" "$PID_AGENT" "$PID_RUNTIME" 2>/dev/null || true
}

cd "$RACINE/bank"
"$NODE" src/index.js >> "$LOGS/banque.log" 2>&1 &
PID_BANQUE=$!

cd "$RACINE/public"
"$NODE" server.js >> "$LOGS/studio.log" 2>&1 &
PID_STUDIO=$!

cd "$RACINE/public/Raspberry_Communication/agent-transfert"
"$NODE" dist/app.js >> "$LOGS/agent.log" 2>&1 &
PID_AGENT=$!

attendre_port 3100 || echo "Agent pas encore pret." >> "$LOGS/runtime.log"

cd "$RACINE"
"$NODE" "$DOSSIER_SCRIPT/lancer-runtime-raspberry.js" >> "$LOGS/runtime.log" 2>&1 &
PID_RUNTIME=$!

echo "$PID_BANQUE $PID_STUDIO $PID_AGENT $PID_RUNTIME" > "$LOGS/pids"
trap arreter_enfants INT TERM
# Des qu'un processus s'arrete, on arrete les autres.
# systemd relance alors l'ensemble.
wait -n || true
arreter_enfants
exit 1
