/**
 * Liste des Raspberry connectés (heartbeat) et config réseau attendue.
 */
const { obtenirLibelleMachine, trouverParIp } = require("../../RaspberryCatalogStore");

function enrichirAvecCatalogue(ipAddress, macAddress, infoParDefaut) {
  const entree = trouverParIp(ipAddress);
  const libelle = obtenirLibelleMachine(ipAddress, macAddress);
  return {
    machineId: entree ? entree.machineId : null,
    model: entree ? entree.model : "",
    label: libelle,
    info: libelle || infoParDefaut,
  };
}

function obtenirListeRaspberryEnLigne(etat, delaiExpirationHeartbeatMs) {
  const now = Date.now();
  const ipsAttendues = new Set(etat.expectedRaspberryList.map((item) => item.ipAddress));
  const list = [];
  etat.raspberryClients.forEach((clientState, ipAddress) => {
    if (!ipsAttendues.has(ipAddress)) {
      return;
    }
    if (now - clientState.lastHeartbeatMs <= delaiExpirationHeartbeatMs) {
      const enrichi = enrichirAvecCatalogue(
        ipAddress,
        clientState.macAddress || "",
        clientState.info || "Heartbeat actif"
      );
      list.push({
        raspIP: ipAddress,
        ipAddress,
        macAddress: clientState.macAddress || "",
        info: enrichi.info,
        label: enrichi.label,
        machineId: enrichi.machineId,
        model: enrichi.model,
        lastHeartbeatMs: clientState.lastHeartbeatMs,
      });
    }
  });
  return list;
}

function construireConfigurationRaspberryAttendue(etat) {
  return etat.expectedRaspberryList.map((item) => ({
    ipAddress: item.ipAddress,
    macAddress: item.macAddress || "",
  }));
}

function construireListeStatutReseau(etat) {
  return etat.expectedRaspberryList.map((item) => {
    const state = etat.networkStateMap.get(item.ipAddress);
    return {
      ipAddress: item.ipAddress,
      macAddress: (state && state.macAddress) || item.macAddress || "",
      pingOk: state ? state.pingOk : false,
      arpSeen: state ? state.arpSeen : false,
      checkedAtMs: state ? state.checkedAtMs : 0,
    };
  });
}

module.exports = {
  obtenirListeRaspberryEnLigne,
  construireConfigurationRaspberryAttendue,
  construireListeStatutReseau,
};
