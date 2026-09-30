/**
 * Envoi des messages WebSocket vers les contrôleurs (UI WAM Studio).
 */
const { construirePayloadEtatParc } = require("../parc/RaspberryServeurHandlersParc");

function creerDiffuseurControleurs(etat, obtenirListeEnLigne, construireStatutReseau, portWebSocket) {
  function diffuserVersControleurs(payload) {
    const text = JSON.stringify(payload);
    if (payload.type === "raspList") {
      etat.metrics.raspListBroadcasts += 1;
    }
    etat.controllerClients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(text);
      }
    });
  }

  function diffuserEtatParc() {
    diffuserVersControleurs(construirePayloadEtatParc(etat.raspberryParc));
  }

  function diffuserListeRaspberry() {
    const raspList = obtenirListeEnLigne();
    diffuserVersControleurs({ type: "raspList", raspList, list: raspList });
  }

  function diffuserStatutReseau() {
    diffuserVersControleurs({
      type: "raspNetworkStatus",
      networkStatus: construireStatutReseau(),
    });
  }

  function diffuserResumeServeur() {
    const payload = {
      type: "runtimeSummary",
      status: etat.wsServerMain ? "ON" : "OFF",
      port: portWebSocket,
      controllerClients: etat.controllerClients.size,
      raspberryClients: obtenirListeEnLigne().length,
      metrics: { ...etat.metrics },
      timestamp: Date.now(),
    };
    diffuserVersControleurs(payload);
  }

  return {
    diffuserVersControleurs,
    diffuserEtatParc,
    diffuserListeRaspberry,
    diffuserStatutReseau,
    diffuserResumeServeur,
  };
}

module.exports = {
  creerDiffuseurControleurs,
};
