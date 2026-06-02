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
      if (clientState.ws && clientState.ws.readyState === 1) {
        clientState.ws.send(JSON.stringify({ type: "isRaspAlive", serverTime: now }));
      }
    });
    diffuseur.diffuserListeRaspberry();
    diffuseur.diffuserResumeServeur();
  }, intervalleMs);
}

module.exports = {
  demarrerBoucleHeartbeat,
};
