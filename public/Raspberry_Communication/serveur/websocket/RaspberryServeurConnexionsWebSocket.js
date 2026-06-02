/**
 * Gestion des connexions WebSocket (UI + Raspberry).
 */
function attacherGestionnairesConnexionWebSocket(etat, deps) {
  const { construireConfig, traiterMessage, diffuseur } = deps;

  return function onServerConnection(ws) {
    etat.metrics.wsConnections += 1;
    ws.send(JSON.stringify({ type: "raspConfig", raspConfig: construireConfig() }));

    ws.on("message", (message) => {
      const text = typeof message === "string" ? message : message.toString("utf-8");
      traiterMessage(ws, text);
    });

    ws.on("close", () => {
      etat.controllerClients.delete(ws);
      if (ws.role === "raspberry" && typeof ws.raspIP === "string") {
        const existing = etat.raspberryClients.get(ws.raspIP);
        if (existing && existing.ws === ws) {
          etat.raspberryClients.delete(ws.raspIP);
        }
      }
      diffuseur.diffuserListeRaspberry();
      diffuseur.diffuserResumeServeur();
    });
  };
}

module.exports = {
  attacherGestionnairesConnexionWebSocket,
};
