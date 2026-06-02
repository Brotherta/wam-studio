/**
 * Point d'entrée du serveur Raspberry (WebSocket port 8383, parc, OSC, heartbeat).
 * Orchestration légère : l'état partagé et le câblage des modules `serveur/*`.
 */
const { WebSocketServer } = require("ws");
const {
  loadRaspberryParc,
  saveRaspberryParc,
  buildExpectedListFromParc,
  mergeListenNumbers,
  normalizeNumberList,
} = require("../../RaspberryParcStore");
const {
  addStaticHostToIni,
  scanIniFile,
  normalizeMac,
  resolveOpenDhcpFolderPath,
  getNumberFromIp,
} = require("../../OpenDhcpIniManager");
const {
  PORT_WEBSOCKET,
  INTERVALLE_HEARTBEAT_MS,
  DELAI_EXPIRATION_HEARTBEAT_MS,
  INTERVALLE_SONDAGE_RESEAU_MS,
  INTERVALLE_RESUME_METRIQUES_MS,
} = require("../configuration/RaspberryServeurConstantes");
const { sonderListeRaspberryAttendus } = require("../reseau/RaspberryServeurSondageReseau");
const {
  envoyerEtatParc,
  handleScanOpenDhcpIni,
  handleApplyRaspberryParc,
  handleAddRaspberryEntry,
} = require("../parc/RaspberryServeurHandlersParcOpenDhcp");
const { portEstEnEcoute } = require("../reseau/RaspberryServeurVerificationPort");
const {
  obtenirListeRaspberryEnLigne,
  construireConfigurationRaspberryAttendue,
  construireListeStatutReseau,
} = require("../presence/RaspberryServeurListeEnLigne");
const { creerDiffuseurControleurs } = require("../presence/RaspberryServeurDiffusionControleurs");
const { demarrerBoucleHeartbeat } = require("../presence/RaspberryServeurBoucleHeartbeat");
const {
  demarrerBoucleSondageReseau,
  demarrerBoucleResumeServeur,
} = require("../presence/RaspberryServeurBouclesReseauEtResume");
const { creerGestionnaireMessagesWs } = require("../websocket/RaspberryServeurGestionnaireMessagesWs");
const { attacherGestionnairesConnexionWebSocket } = require("../websocket/RaspberryServeurConnexionsWebSocket");

function creerEtatServeurInitial() {
  const raspberryParc = loadRaspberryParc();
  raspberryParc.iniPath = resolveOpenDhcpFolderPath(raspberryParc.iniPath);
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
  etat.raspberryParc.iniPath = resolveOpenDhcpFolderPath(etat.raspberryParc.iniPath);
  etat.expectedRaspberryList = buildExpectedListFromParc(etat.raspberryParc);
}

function enregistrerDossierParc(folderPath) {
  etat.raspberryParc.iniPath = resolveOpenDhcpFolderPath(folderPath);
  saveRaspberryParc(etat.raspberryParc);
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
  probes.forEach((probe) => {
    const expected = etat.expectedRaspberryList.find((item) => item.ipAddress === probe.ipAddress);
    if (expected && probe.macAddress.length > 0) {
      expected.macAddress = probe.macAddress;
    }
    etat.networkStateMap.set(probe.ipAddress, probe);
  });
  diffuseur.diffuserStatutReseau();
}

const diffuseur = creerDiffuseurControleurs(
  etat,
  obtenirListeEnLigne,
  construireStatutReseau,
  PORT_WEBSOCKET
);

const { traiterMessageWebSocket } = creerGestionnaireMessagesWs({
  etat,
  portWebSocket: PORT_WEBSOCKET,
  envoyerEtatParc,
  handleScanOpenDhcpIni,
  handleApplyRaspberryParc,
  handleAddRaspberryEntry,
  mergeListenNumbers,
  saveParcFolder: enregistrerDossierParc,
  scanIniFile,
  saveRaspberryParc,
  reloadParcFromDisk: rechargerParcDepuisDisque,
  actualiserReseau,
  normalizeNumberList,
  addStaticHostToIni,
  getNumberFromIp,
  normalizeMac,
  resolveOpenDhcpFolderPath,
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

function startRaspberryRuntime() {
  etat.metrics.launchRequests += 1;
  rechargerParcDepuisDisque();

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
  demarrerBoucleResumeServeur(etat, INTERVALLE_RESUME_METRIQUES_MS, diffuseur);

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
