/**
 * Handlers du parc Raspberry : la liste vient de raspberry-parc.json.
 */
const { normalizeNumberList } = require("../../RaspberryParcStore");

function construirePayloadEtatParc(raspberryParc) {
  const listenNumbers = normalizeNumberList(raspberryParc.activeNumbers);
  return {
    type: "raspberryParcState",
    subnetPrefix: raspberryParc.subnetPrefix,
    activeNumbers: listenNumbers,
    listenNumbers,
    scanOk: true,
    scanError: "",
    catalog: [],
  };
}

function envoyerEtatParc(ws, raspberryParc) {
  ws.send(JSON.stringify(construirePayloadEtatParc(raspberryParc)));
}

async function handleSyncRaspberryFromNetwork({
  ws,
  raspberryParc,
  wsServerMain,
  synchroniserRaspberryDepuisReseau,
  reloadParcFromDisk,
  actualiserReseau,
  notifierParcModifie,
  decouvrirAppareilsSurSousReseau,
}) {
  if (wsServerMain === null) {
    ws.send(JSON.stringify({
      type: "syncRaspberryFromNetworkResult",
      ok: false,
      error: "Serveur Raspberry non demarre.",
    }));
    return;
  }

  try {
    const sync = await synchroniserRaspberryDepuisReseau({
      raspberryParc,
      reloadParcFromDisk,
      decouvrirAppareilsSurSousReseau,
    });
    if (typeof reloadParcFromDisk === "function") {
      reloadParcFromDisk();
    }
    await actualiserReseau();
    if (typeof notifierParcModifie === "function") {
      notifierParcModifie();
    }

    const listenNumbers = normalizeNumberList(raspberryParc.activeNumbers);
    ws.send(JSON.stringify({
      type: "syncRaspberryFromNetworkResult",
      ok: true,
      error: "",
      subnetPrefix: raspberryParc.subnetPrefix,
      appareilsTrouves: sync.appareilsTrouves,
      raspberriesDetectes: sync.raspberriesDetectes,
      addedCount: sync.ajoutes.length,
      alreadyPresentCount: sync.dejaPresents.length,
      ignoredCount: 0,
      ajoutes: sync.ajoutes,
      dejaPresents: sync.dejaPresents,
      ignores: [],
      listenNumbers,
      activeNumbers: listenNumbers,
    }));
    envoyerEtatParc(ws, raspberryParc);
  } catch (error) {
    const details = error && error.message ? error.message : "Erreur inconnue";
    ws.send(JSON.stringify({
      type: "syncRaspberryFromNetworkResult",
      ok: false,
      error: `Synchronisation reseau impossible: ${details}`,
    }));
  }
}

module.exports = {
  construirePayloadEtatParc,
  envoyerEtatParc,
  handleSyncRaspberryFromNetwork,
};
