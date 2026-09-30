/**
 * Point d'entrée du serveur Raspberry (WebSocket port 8383, parc, OSC, heartbeat).
 * Orchestration légère : l'état partagé et le câblage des modules `serveur/*`.
 */
const { WebSocketServer } = require("ws");
const {
  loadRaspberryParc,
  buildExpectedListFromParc,
} = require("../../RaspberryParcStore");
const {
  PORT_WEBSOCKET,
  INTERVALLE_HEARTBEAT_MS,
  DELAI_EXPIRATION_HEARTBEAT_MS,
  INTERVALLE_SONDAGE_RESEAU_MS,
} = require("../configuration/RaspberryServeurConstantes");
const { sonderListeRaspberryAttendus } = require("../reseau/RaspberryServeurSondageReseau");
const {
  envoyerEtatParc,
  handleSyncRaspberryFromNetwork,
} = require("../parc/RaspberryServeurHandlersParc");
const { portEstEnEcoute } = require("../reseau/RaspberryServeurVerificationPort");
const {
  obtenirListeRaspberryEnLigne,
  construireConfigurationRaspberryAttendue,
  construireListeStatutReseau,
} = require("../presence/RaspberryServeurListeEnLigne");
const { creerDiffuseurControleurs } = require("../presence/RaspberryServeurDiffusionControleurs");
const { demarrerBoucleHeartbeat } = require("../presence/RaspberryServeurBoucleHeartbeat");
const { demarrerBoucleSondageReseau } = require("../presence/RaspberryServeurBouclesReseauEtResume");
const { synchroniserRaspberryDepuisReseau } = require("../parc/RaspberryServeurSynchronisationParc");
const { decouvrirAppareilsSurSousReseau } = require("../reseau/RaspberryServeurDecouverteReseau");
const { creerGestionnaireMessagesWs } = require("../websocket/RaspberryServeurGestionnaireMessagesWs");
const { attacherGestionnairesConnexionWebSocket } = require("../websocket/RaspberryServeurConnexionsWebSocket");
const { demarrerAgentTransfertRuntime } = require("../../AgentTransfertRuntime");
const { demarrerServeurSessionDisque } = require("../session/RaspberryServeurSessionHttp");

function creerEtatServeurInitial() {
  const raspberryParc = loadRaspberryParc();
  return {
    raspberryParc,
    expectedRaspberryList: buildExpectedListFromParc(raspberryParc),
    controllerClients: new Set(),
    raspberryClients: new Map(),
    networkStateMap: new Map(),
    wsServerMain: null,
    heartbeatTimer: null,
    arpRefreshTimer: null,
    summaryTimer: null,
    metrics: {
      launchRequests: 0,
      startControleur: 0,
      raspberryOpen: 0,
      raspberryAlive: 0,
      sendOSCmessage: 0,
      broadcastOSCmessage: 0,
      heartbeatBroadcasts: 0,
      raspListBroadcasts: 0,
      networkProbeRuns: 0,
      wsConnections: 0,
    },
  };
}

const etat = creerEtatServeurInitial();

function rechargerParcDepuisDisque() {
  etat.raspberryParc = loadRaspberryParc();
  etat.expectedRaspberryList = buildExpectedListFromParc(etat.raspberryParc);
}

function obtenirListeEnLigne() {
  return obtenirListeRaspberryEnLigne(etat, DELAI_EXPIRATION_HEARTBEAT_MS);
}

function construireConfig() {
  return construireConfigurationRaspberryAttendue(etat);
}

function construireStatutReseau() {
  return construireListeStatutReseau(etat);
}

async function actualiserReseau() {
  etat.metrics.networkProbeRuns += 1;
  const probes = await sonderListeRaspberryAttendus(etat.expectedRaspberryList);

  for (let i = 0; i < probes.length; i += 1) {
    const probe = probes[i];
    const expected = etat.expectedRaspberryList.find((item) => item.ipAddress === probe.ipAddress);
    if (expected && probe.macAddress.length > 0) {
      expected.macAddress = probe.macAddress;
    }
    etat.networkStateMap.set(probe.ipAddress, probe);
  }

  diffuseur.diffuserStatutReseau();
}

const diffuseur = creerDiffuseurControleurs(
  etat,
  obtenirListeEnLigne,
  construireStatutReseau,
  PORT_WEBSOCKET
);

function notifierParcModifie() {
  diffuseur.diffuserEtatParc();
  diffuseur.diffuserListeRaspberry();
  diffuseur.diffuserStatutReseau();
}

const { traiterMessageWebSocket } = creerGestionnaireMessagesWs({
  etat,
  portWebSocket: PORT_WEBSOCKET,
  envoyerEtatParc,
  handleSyncRaspberryFromNetwork,
  reloadParcFromDisk: rechargerParcDepuisDisque,
  actualiserReseau,
  synchroniserRaspberryDepuisReseau,
  decouvrirAppareilsSurSousReseau,
  notifierParcModifie,
  construireConfig,
  construireStatutReseau,
  obtenirListeEnLigne,
  diffuseur,
});

function attacherGestionnaireErreurServeur(server) {
  server.on("error", (err) => {
    const details = err && err.message ? err.message : "Erreur inconnue";
    console.error(`[RaspberryServeur] Erreur WebSocket port ${PORT_WEBSOCKET}:`, details);
    if (etat.wsServerMain === server) {
      etat.wsServerMain = null;
    }
  });
}

function preparerParcAuDemarrage() {
  rechargerParcDepuisDisque();
}

function startRaspberryRuntime() {
  etat.metrics.launchRequests += 1;
  demarrerServeurSessionDisque();
  preparerParcAuDemarrage();

  if (etat.wsServerMain) {
    return { started: true, alreadyRunning: true, port: PORT_WEBSOCKET };
  }

  if (portEstEnEcoute(PORT_WEBSOCKET)) {
    return {
      started: true,
      alreadyRunning: true,
      port: PORT_WEBSOCKET,
      message: "Le port 8383 est deja utilise. Le serveur Raspberry semble deja actif.",
    };
  }

  const server = new WebSocketServer({ host: "0.0.0.0", port: PORT_WEBSOCKET });
  attacherGestionnaireErreurServeur(server);
  etat.wsServerMain = server;

  server.on(
    "connection",
    attacherGestionnairesConnexionWebSocket(etat, {
      construireConfig,
      traiterMessage: traiterMessageWebSocket,
      diffuseur,
    })
  );

  demarrerBoucleHeartbeat(etat, INTERVALLE_HEARTBEAT_MS, diffuseur);
  demarrerBoucleSondageReseau(etat, INTERVALLE_SONDAGE_RESEAU_MS, actualiserReseau, diffuseur);
  demarrerAgentTransfertRuntime();

  return { started: true, alreadyRunning: false, port: PORT_WEBSOCKET };
}

function getRaspberryRuntimeStatus() {
  const running = etat.wsServerMain !== null || portEstEnEcoute(PORT_WEBSOCKET);
  return {
    running,
    port: PORT_WEBSOCKET,
    controllerClients: etat.controllerClients.size,
    raspberryClients: obtenirListeEnLigne().length,
  };
}

module.exports = {
  startRaspberryRuntime,
  getRaspberryRuntimeStatus,
};
