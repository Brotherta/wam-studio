const { envoyerMessageOscEnUdp } = require("../osc/RaspberryServeurEnvoiOscUdp");
const { resoudreMacDepuisCatalogue } = require("../../RaspberryCatalogStore");
const {
  demarrerAgentTransfertRuntime,
  obtenirStatutAgentTransfertRuntime,
} = require("../../AgentTransfertRuntime");

/**
 * Route les messages WebSocket entrants (UI, Raspberry, OSC).
 */
function creerGestionnaireMessagesWs(deps) {
  const {
    etat,
    portWebSocket,
    envoyerEtatParc,
    handleSyncRaspberryFromNetwork,
    reloadParcFromDisk,
    actualiserReseau,
    synchroniserRaspberryDepuisReseau,
    decouvrirAppareilsSurSousReseau,
    notifierParcModifie,
    construireConfig,
    construireStatutReseau,
    obtenirListeEnLigne,
    diffuseur,
  } = deps;

  function traiterMessageWebSocket(ws, messageText) {
    let message = {};
    try {
      message = JSON.parse(messageText);
    } catch {
      return;
    }

    if (message.type === "getRaspberryParcState") {
      envoyerEtatParc(ws, etat.raspberryParc);
      return;
    }

    if (message.type === "syncRaspberryFromNetwork") {
      handleSyncRaspberryFromNetwork({
        ws,
        raspberryParc: etat.raspberryParc,
        wsServerMain: etat.wsServerMain,
        synchroniserRaspberryDepuisReseau,
        reloadParcFromDisk,
        actualiserReseau,
        notifierParcModifie,
        decouvrirAppareilsSurSousReseau,
      }).catch((error) => {
        ws.send(JSON.stringify({
          type: "syncRaspberryFromNetworkResult",
          ok: false,
          error: error && error.message ? error.message : "Erreur lors de la synchronisation reseau.",
        }));
      });
      return;
    }

    if (message.type === "getRuntimeSummary") {
      ws.send(JSON.stringify({
        type: "runtimeSummary",
        status: etat.wsServerMain ? "ON" : "OFF",
        port: portWebSocket,
        controllerClients: etat.controllerClients.size,
        raspberryClients: obtenirListeEnLigne().length,
        metrics: { ...etat.metrics },
        timestamp: Date.now(),
      }));
      return;
    }

    if (message.type === "startAgentTransfert") {
      const result = demarrerAgentTransfertRuntime();
      ws.send(JSON.stringify({
        type: "agentTransfertStartResult",
        ok: result.started === true,
        alreadyRunning: !!result.alreadyRunning,
        port: result.port,
        message: result.message || "",
        running: obtenirStatutAgentTransfertRuntime().running,
      }));
      return;
    }

    if (message.type === "getAgentTransfertStatus") {
      const statut = obtenirStatutAgentTransfertRuntime();
      ws.send(JSON.stringify({
        type: "agentTransfertStatus",
        running: statut.running,
        port: statut.port,
        processusGere: statut.processusGere,
      }));
      return;
    }

    if (message.type === "startControleur") {
      etat.metrics.startControleur += 1;
      etat.controllerClients.add(ws);
      ws.send(JSON.stringify({ type: "raspConfig", raspConfig: construireConfig() }));
      ws.send(JSON.stringify({ type: "raspNetworkStatus", networkStatus: construireStatutReseau() }));
      envoyerEtatParc(ws, etat.raspberryParc);
      diffuseur.diffuserListeRaspberry();
      return;
    }

    if (message.type === "getRaspConfig") {
      ws.send(JSON.stringify({ type: "raspConfig", raspConfig: construireConfig() }));
      return;
    }

    if (message.type === "getRaspNetworkStatus") {
      ws.send(JSON.stringify({ type: "raspNetworkStatus", networkStatus: construireStatutReseau() }));
      return;
    }

    if (message.type === "requestRaspList") {
      diffuseur.diffuserListeRaspberry();
      return;
    }

    if (message.type === "raspberryOpen" && typeof message.raspIP === "string") {
      etat.metrics.raspberryOpen += 1;
      ws.role = "raspberry";
      ws.raspIP = message.raspIP;
      const current = etat.raspberryClients.get(message.raspIP) || {};
      const macBrute =
        typeof message.macAddress === "string" && message.macAddress.length > 0
          ? message.macAddress
          : (current.macAddress || "");
      const macAddress = resoudreMacDepuisCatalogue(message.raspIP, macBrute);
      etat.raspberryClients.set(message.raspIP, {
        ...current,
        ws,
        macAddress,
        info: typeof message.info === "string" ? message.info : (current.info || "Raspberry connecte"),
        lastHeartbeatMs: Date.now(),
      });

      diffuseur.diffuserListeRaspberry();
      return;
    }

    if (message.type === "raspberryAlive" && typeof message.raspIP === "string") {
      etat.metrics.raspberryAlive += 1;
      const current = etat.raspberryClients.get(message.raspIP) || {};
      etat.raspberryClients.set(message.raspIP, {
        ...current,
        ws,
        macAddress:
          typeof message.macAddress === "string" && message.macAddress.length > 0
            ? message.macAddress
            : (current.macAddress || ""),
        info:
          typeof message.info === "string" && message.info.length > 0
            ? message.info
            : (current.info || "Heartbeat recu"),
        lastHeartbeatMs: Date.now(),
      });
      diffuseur.diffuserListeRaspberry();
      return;
    }

    if (message.type === "sendOSCmessage" && typeof message.raspIP === "string") {
      etat.metrics.sendOSCmessage += 1;
      const ipAddress = message.raspIP;
      const oscMessage = typeof message.OSCMessage === "string" ? message.OSCMessage : "";
      const oscValue = message.OSCValue;
      const oscPort = message.OSCPort;

      envoyerMessageOscEnUdp(ipAddress, oscPort, oscMessage, oscValue)
        .then((sent) => {
          ws.send(JSON.stringify({ type: "oscSent", target: sent }));
        })
        .catch((err) => {
          ws.send(JSON.stringify({
            type: "oscError",
            error: `${err && err.message ? err.message : err}`,
          }));
        });
      return;
    }

    if (message.type === "broadcastOSCmessage") {
      etat.metrics.broadcastOSCmessage += 1;
      const oscMessage = typeof message.OSCMessage === "string" ? message.OSCMessage : "";
      const oscValue = message.OSCValue;
      const oscPort = message.OSCPort;

      const targets = obtenirListeEnLigne()
        .map((r) => r.ipAddress || r.raspIP)
        .filter(Boolean);
      Promise.allSettled(targets.map((ip) => envoyerMessageOscEnUdp(ip, oscPort, oscMessage, oscValue)))
        .then((results) => {
          const sent = results
            .filter((r) => r.status === "fulfilled")
            .map((r) => r.value);
          const failed = results
            .filter((r) => r.status === "rejected")
            .map((r) => `${r.reason && r.reason.message ? r.reason.message : r.reason}`);
          ws.send(JSON.stringify({
            type: "oscBroadcastResult",
            sentCount: sent.length,
            failedCount: failed.length,
            sent,
            failed,
          }));
        })
        .catch((err) => {
          ws.send(JSON.stringify({
            type: "oscError",
            error: `${err && err.message ? err.message : err}`,
          }));
        });
    }
  }

  return { traiterMessageWebSocket };
}

module.exports = {
  creerGestionnaireMessagesWs,
};
