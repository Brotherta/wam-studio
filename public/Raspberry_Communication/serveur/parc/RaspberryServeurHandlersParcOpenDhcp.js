/**
 * Handlers serveur liés au parc Raspberry et à Open DHCP (scan/apply/add).
 *
 * Objectif : isoler la logique "parc" du runtime WebSocket.
 */

const { numbersFromIniEntries, appliquerNumerosDepuisIni } = require("../../RaspberryParcStore");

function construirePayloadEtatParc(raspberryParc, scanResult) {
  const scan = scanResult || { ok: false, error: "", entries: [] };
  const catalog = scan.entries || [];
  const listenNumbers = numbersFromIniEntries(catalog);
  return {
    type: "raspberryParcState",
    subnetPrefix: raspberryParc.subnetPrefix,
    iniPath: raspberryParc.iniPath,
    iniFolder: raspberryParc.iniPath,
    activeNumbers: listenNumbers,
    listenNumbers,
    scanOk: scan.ok,
    scanError: scan.error || "",
    catalog,
  };
}

function envoyerEtatParc(ws, raspberryParc, scanResult) {
  ws.send(JSON.stringify(construirePayloadEtatParc(raspberryParc, scanResult)));
}

async function construireMapMacPourSelection({
  selectedNumbers,
  scanEntries,
  expectedRaspberryList,
  normalizeMac,
  buildIpFromNumber,
  subnetPrefix,
  probeMacForIp,
}) {
  const macByNumber = new Map();
  const scanByNumber = new Map();
  (scanEntries || []).forEach((entry) => {
    scanByNumber.set(entry.number, entry);
  });

  for (let i = 0; i < selectedNumbers.length; i += 1) {
    const number = selectedNumbers[i];
    const fromScan = scanByNumber.get(number);
    if (fromScan && fromScan.mac) {
      macByNumber.set(number, normalizeMac(fromScan.mac));
      continue;
    }

    const expected = expectedRaspberryList.find((item) => item.number === number);
    if (expected && expected.macAddress) {
      macByNumber.set(number, normalizeMac(expected.macAddress));
      continue;
    }

    const ipAddress = buildIpFromNumber(subnetPrefix, number);
    const probedMac = await probeMacForIp(ipAddress);
    if (probedMac.length > 0) {
      macByNumber.set(number, probedMac);
    }
  }

  return macByNumber;
}

async function handleScanOpenDhcpIni({
  ws,
  message,
  raspberryParc,
  saveParcFolder,
  scanIniFile,
  reloadParcFromDisk,
  refreshNetworkStatus,
  broadcastRaspList,
  broadcastNetworkStatus,
}) {
  const folderPath = typeof message.iniPath === "string" ? message.iniPath.trim() : raspberryParc.iniPath;
  saveParcFolder(folderPath);
  const scan = scanIniFile(raspberryParc.iniPath, raspberryParc.subnetPrefix);
  if (scan.ok) {
    appliquerNumerosDepuisIni(raspberryParc, scan.entries);
    reloadParcFromDisk();
    await refreshNetworkStatus();
    broadcastRaspList();
    broadcastNetworkStatus();
  }
  const listenNumbers = numbersFromIniEntries(scan.entries || []);
  ws.send(JSON.stringify({
    type: "openDhcpScanResult",
    ok: scan.ok,
    error: scan.error || "",
    iniPath: scan.folderPath || raspberryParc.iniPath,
    iniFolder: scan.folderPath || raspberryParc.iniPath,
    iniFilePath: scan.iniFilePath || "",
    iniFileName: scan.iniFileName || "",
    catalog: scan.entries || [],
    listenNumbers,
  }));
  envoyerEtatParc(ws, raspberryParc, scan);
}

async function handleApplyRaspberryParc({
  ws,
  message,
  raspberryParc,
  saveParcFolder,
  scanIniFile,
  reloadParcFromDisk,
  refreshNetworkStatus,
  broadcastRaspList,
  broadcastNetworkStatus,
  broadcastSummary,
  buildRaspConfig,
}) {
  const folderPath = typeof message.iniPath === "string" ? message.iniPath.trim() : raspberryParc.iniPath;
  if (folderPath.length === 0) {
    ws.send(JSON.stringify({
      type: "raspberryParcApplyResult",
      ok: false,
      error: "Dossier Open DHCP manquant.",
    }));
    return;
  }

  saveParcFolder(folderPath);
  const scan = scanIniFile(raspberryParc.iniPath, raspberryParc.subnetPrefix);
  if (!scan.ok) {
    ws.send(JSON.stringify({
      type: "raspberryParcApplyResult",
      ok: false,
      error: scan.error || "Scan INI impossible.",
    }));
    return;
  }

  appliquerNumerosDepuisIni(raspberryParc, scan.entries);
  reloadParcFromDisk();
  await refreshNetworkStatus();
  broadcastRaspList();
  broadcastNetworkStatus();
  broadcastSummary();

  ws.send(JSON.stringify({
    type: "raspberryParcApplyResult",
    ok: true,
    error: "",
    updatedCount: numbersFromIniEntries(scan.entries).length,
    activeNumbers: raspberryParc.activeNumbers,
    expectedList: buildRaspConfig(),
    iniPreserved: true,
  }));
  envoyerEtatParc(ws, raspberryParc, scanIniFile(raspberryParc.iniPath, raspberryParc.subnetPrefix));
}

async function handleAddRaspberryEntry({
  ws,
  message,
  raspberryParc,
  wsServerMain,
  saveParcFolder,
  addStaticHostToIni,
  scanIniFile,
  reloadParcFromDisk,
  refreshNetworkStatus,
  broadcastRaspList,
  broadcastNetworkStatus,
  normalizeMac,
  resolveOpenDhcpFolderPath,
}) {
  const folderPath = resolveOpenDhcpFolderPath(typeof message.iniPath === "string" ? message.iniPath.trim() : raspberryParc.iniPath);
  const macAddress = typeof message.macAddress === "string" ? normalizeMac(message.macAddress) : "";
  const ipAddress = typeof message.ipAddress === "string" ? message.ipAddress.trim() : "";

  if (wsServerMain === null) {
    ws.send(JSON.stringify({
      type: "addRaspberryEntryResult",
      ok: false,
      error: "Serveur Raspberry non demarre. Cliquez d'abord sur le bouton de lancement.",
    }));
    return;
  }

  if (folderPath.length === 0) {
    ws.send(JSON.stringify({
      type: "addRaspberryEntryResult",
      ok: false,
      error: "Dossier Open DHCP manquant.",
    }));
    return;
  }

  saveParcFolder(folderPath);
  const added = addStaticHostToIni(folderPath, macAddress, ipAddress);
  if (!added.ok) {
    ws.send(JSON.stringify({
      type: "addRaspberryEntryResult",
      ok: false,
      error: added.error || "Ajout impossible.",
    }));
    return;
  }

  const scan = scanIniFile(folderPath, raspberryParc.subnetPrefix);
  if (scan.ok) {
    appliquerNumerosDepuisIni(raspberryParc, scan.entries);
    reloadParcFromDisk();
    await refreshNetworkStatus();
    broadcastRaspList();
    broadcastNetworkStatus();
  }

  ws.send(JSON.stringify({
    type: "addRaspberryEntryResult",
    ok: true,
    error: "",
    macAddress: added.macAddress,
    ipAddress: added.ipAddress,
    backupPath: added.backupPath || "",
    iniFilePath: added.iniFilePath || "",
    iniFileName: added.iniFileName || "",
    folderPath: added.folderPath || folderPath,
    activeNumbers: raspberryParc.activeNumbers,
  }));
  envoyerEtatParc(ws, raspberryParc, scan);
}

async function handleSyncRaspberryFromNetwork({
  ws,
  message,
  raspberryParc,
  wsServerMain,
  saveParcFolder,
  synchroniserRaspberryDepuisReseau,
  reloadParcFromDisk,
  actualiserReseau,
  notifierParcModifie,
  scanIniFile,
  resolveOpenDhcpFolderPath,
  addStaticHostToIni,
  getNumberFromIp,
  saveRaspberryParc,
  normalizeMac,
  decouvrirAppareilsSurSousReseau,
}) {
  if (wsServerMain === null) {
    ws.send(JSON.stringify({
      type: "syncRaspberryFromNetworkResult",
      ok: false,
      error: "Serveur Raspberry non demarre. Cliquez d'abord sur le bouton de lancement.",
    }));
    return;
  }

  const folderPath = typeof message.iniPath === "string" ? message.iniPath.trim() : raspberryParc.iniPath;
  if (folderPath.length > 0) {
    saveParcFolder(folderPath);
  }

  try {
    const sync = await synchroniserRaspberryDepuisReseau({
      raspberryParc,
      resolveOpenDhcpFolderPath,
      scanIniFile,
      addStaticHostToIni,
      getNumberFromIp,
      saveRaspberryParc,
      reloadParcFromDisk,
      normalizeMac,
      decouvrirAppareilsSurSousReseau,
    });

    reloadParcFromDisk();
    await actualiserReseau();
    if (typeof notifierParcModifie === "function") {
      notifierParcModifie();
    }

    const scan = scanIniFile(raspberryParc.iniPath, raspberryParc.subnetPrefix);
    ws.send(JSON.stringify({
      type: "syncRaspberryFromNetworkResult",
      ok: true,
      error: "",
      subnetPrefix: raspberryParc.subnetPrefix,
      appareilsTrouves: sync.appareilsTrouves,
      raspberriesDetectes: sync.raspberriesDetectes,
      addedCount: sync.ajoutes.length,
      alreadyPresentCount: sync.dejaPresents.length,
      ignoredCount: sync.ignores.length,
      ajoutes: sync.ajoutes,
      dejaPresents: sync.dejaPresents,
      ignores: sync.ignores,
      listenNumbers: numbersFromIniEntries(scan.entries || []),
    }));
    envoyerEtatParc(ws, raspberryParc, scan);
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
  construireMapMacPourSelection,
  handleScanOpenDhcpIni,
  handleApplyRaspberryParc,
  handleAddRaspberryEntry,
  handleSyncRaspberryFromNetwork,
};
