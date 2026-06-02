/**
 * Liste des Raspberry connectés (heartbeat) et config réseau attendue.
 */
function obtenirListeRaspberryEnLigne(etat, delaiExpirationHeartbeatMs) {
  const now = Date.now();
  const list = [];
  etat.raspberryClients.forEach((clientState, ipAddress) => {
    if (now - clientState.lastHeartbeatMs <= delaiExpirationHeartbeatMs) {
      list.push({
        raspIP: ipAddress,
        ipAddress,
        macAddress: clientState.macAddress || "",
        info: clientState.info || "Heartbeat actif",
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
