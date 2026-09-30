/**
 * Boucle heartbeat : demande isRaspAlive aux Raspberry et diffuse l'état.
 */
function demarrerBoucleHeartbeat(etat, intervalleMs, diffuseur) {
  if (etat.heartbeatTimer) {
    return;
  }
  etat.heartbeatTimer = setInterval(() => {
    etat.metrics.heartbeatBroadcasts += 1;
    const now = Date.now();
    etat.raspberryClients.forEach((clientState) => {
      const socket = clientState.ws;
      if (!socket || socket.readyState !== 1) {
        return;
      }
      try {
        socket.send(JSON.stringify({ type: "isRaspAlive", serverTime: now }));
        clientState.lastHeartbeatMs = Date.now();
      } catch (_erreur) {
        // La fermeture du socket retirera ce Raspberry de la liste.
      }
    });
    diffuseur.diffuserListeRaspberry();
    diffuseur.diffuserResumeServeur();
  }, intervalleMs);
}

module.exports = {
  demarrerBoucleHeartbeat,
};
