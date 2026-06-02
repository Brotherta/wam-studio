/**
 * Handlers serveur liés au parc Raspberry et à Open DHCP (scan/apply/add).
 *
 * Objectif : isoler la logique "parc" du runtime WebSocket.
 */
 
function construirePayloadEtatParc(raspberryParc, scanResult, mergeListenNumbers) {
  const scan = scanResult || { ok: false, error: "", entries: [] };
  const catalog = scan.entries || [];
  const listenNumbers = mergeListenNumbers(raspberryParc.activeNumbers, catalog);
  return {
    type: "raspberryParcState",
    subnetPrefix: raspberryParc.subnetPrefix,
    iniPath: raspberryParc.iniPath,
    iniFolder: raspberryParc.iniPath,
    activeNumbers: raspberryParc.activeNumbers,
    listenNumbers,
    scanOk: scan.ok,
    scanError: scan.error || "",
    catalog,
  };
}
 
function envoyerEtatParc(ws, raspberryParc, scanResult, mergeListenNumbers) {
  ws.send(JSON.stringify(construirePayloadEtatParc(raspberryParc, scanResult, mergeListenNumbers)));
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
  saveRaspberryParc,
  reloadParcFromDisk,
  refreshNetworkStatus,
  broadcastRaspList,
  broadcastNetworkStatus,
  mergeListenNumbers,
}) {
  const folderPath = typeof message.iniPath === "string" ? message.iniPath.trim() : raspberryParc.iniPath;
  saveParcFolder(folderPath);
  const scan = scanIniFile(raspberryParc.iniPath, raspberryParc.subnetPrefix);
  if (scan.ok && scan.entries.length > 0) {
    raspberryParc.activeNumbers = mergeListenNumbers(raspberryParc.activeNumbers, scan.entries);
    saveRaspberryParc(raspberryParc);
    reloadParcFromDisk();
    await refreshNetworkStatus();
    broadcastRaspList();
    broadcastNetworkStatus();
  }
  ws.send(JSON.stringify({
    type: "openDhcpScanResult",
    ok: scan.ok,
    error: scan.error || "",
    iniPath: scan.folderPath || raspberryParc.iniPath,
    iniFolder: scan.folderPath || raspberryParc.iniPath,
    iniFilePath: scan.iniFilePath || "",
    iniFileName: scan.iniFileName || "",
    catalog: scan.entries || [],
    listenNumbers: mergeListenNumbers(raspberryParc.activeNumbers, scan.entries || []),
  }));
  envoyerEtatParc(ws, raspberryParc, scan, mergeListenNumbers);
}
 
async function handleApplyRaspberryParc({
  ws,
  message,
  raspberryParc,
  saveParcFolder,
  scanIniFile,
  saveRaspberryParc,
  reloadParcFromDisk,
  refreshNetworkStatus,
  broadcastRaspList,
  broadcastNetworkStatus,
  broadcastSummary,
  normalizeNumberList,
  mergeListenNumbers,
  buildRaspConfig,
}) {
  const folderPath = typeof message.iniPath === "string" ? message.iniPath.trim() : raspberryParc.iniPath;
  const selectedNumbers = normalizeNumberList(message.selectedNumbers);
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
 
  raspberryParc.activeNumbers = selectedNumbers;
  saveRaspberryParc(raspberryParc);
  reloadParcFromDisk();
  await refreshNetworkStatus();
  broadcastRaspList();
  broadcastNetworkStatus();
  broadcastSummary();
 
  ws.send(JSON.stringify({
    type: "raspberryParcApplyResult",
    ok: true,
    error: "",
    updatedCount: selectedNumbers.length,
    activeNumbers: raspberryParc.activeNumbers,
    expectedList: buildRaspConfig(),
    iniPreserved: true,
  }));
  envoyerEtatParc(ws, raspberryParc, scanIniFile(raspberryParc.iniPath, raspberryParc.subnetPrefix), mergeListenNumbers);
}
 
async function handleAddRaspberryEntry({
  ws,
  message,
  raspberryParc,
  wsServerMain,
  saveParcFolder,
  addStaticHostToIni,
  scanIniFile,
  getNumberFromIp,
  mergeListenNumbers,
  saveRaspberryParc,
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
 
  const number = getNumberFromIp(added.ipAddress, raspberryParc.subnetPrefix);
  if (number !== null) {
    raspberryParc.activeNumbers = mergeListenNumbers(raspberryParc.activeNumbers, [{ number }]);
    saveRaspberryParc(raspberryParc);
    reloadParcFromDisk();
    await refreshNetworkStatus();
    broadcastRaspList();
    broadcastNetworkStatus();
  }
 
  const scan = scanIniFile(folderPath, raspberryParc.subnetPrefix);
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
  envoyerEtatParc(ws, raspberryParc, scan, mergeListenNumbers);
}
 
module.exports = {
  construirePayloadEtatParc,
  envoyerEtatParc,
  construireMapMacPourSelection,
  handleScanOpenDhcpIni,
  handleApplyRaspberryParc,
  handleAddRaspberryEntry,
};

