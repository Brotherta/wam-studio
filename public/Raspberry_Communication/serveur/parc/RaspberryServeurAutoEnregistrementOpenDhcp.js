const {
  estRaspberryConnu,
  resoudreMacDepuisCatalogue,
  obtenirIpAttendueDepuisMac,
} = require("../../RaspberryCatalogStore");
const { appliquerNumerosDepuisIni } = require("../../RaspberryParcStore");

const DEFAULT_OPEN_DHCP_FOLDER = "C:/OpenDHCPServer";

function trouverEntreeIniParMac(scanEntries, macAddress, normalizeMac) {
  const macNormalisee = normalizeMac(macAddress);
  return (scanEntries || []).find(
    (entry) => entry.mac && normalizeMac(entry.mac) === macNormalisee
  ) || null;
}

function entreeIniDejaCorrecte(entreeIni, ipCible, normalizeMac, macAddress) {
  if (!entreeIni) {
    return false;
  }
  return entreeIni.ipAddress === ipCible
    && normalizeMac(entreeIni.mac) === normalizeMac(macAddress);
}

function resoudreIpCibleDepuisMac(macAddress, ipActuelle) {
  const ipCatalogue = obtenirIpAttendueDepuisMac(macAddress);
  if (ipCatalogue.length > 0) {
    return ipCatalogue;
  }
  return typeof ipActuelle === "string" ? ipActuelle.trim() : "";
}

function synchroniserParcDepuisIni(raspberryParc, scanIniFile, saveRaspberryParc) {
  if (!raspberryParc.iniPath) {
    return { ok: false, error: "Chemin Open DHCP non configure.", entries: [] };
  }
  const scan = scanIniFile(raspberryParc.iniPath, raspberryParc.subnetPrefix);
  if (scan.ok) {
    appliquerNumerosDepuisIni(raspberryParc, scan.entries);
  } else {
    raspberryParc.activeNumbers = [];
    saveRaspberryParc(raspberryParc);
  }
  return scan;
}

async function enregistrerRaspberryDansOpenDhcpSiNecessaire({
  raspberryParc,
  ipAddress,
  macAddress,
  resolveOpenDhcpFolderPath,
  scanIniFile,
  addStaticHostToIni,
  getNumberFromIp,
  saveRaspberryParc,
  reloadParcFromDisk,
  normalizeMac,
  actualiserReseau,
}) {
  let folderPath = resolveOpenDhcpFolderPath(raspberryParc.iniPath);
  if (folderPath.length === 0) {
    folderPath = resolveOpenDhcpFolderPath(DEFAULT_OPEN_DHCP_FOLDER);
    raspberryParc.iniPath = folderPath;
    saveRaspberryParc(raspberryParc);
  }

  const mac = typeof macAddress === "string" ? normalizeMac(macAddress) : "";
  const ipActuelle = typeof ipAddress === "string" ? ipAddress.trim() : "";
  const macResolue = resoudreMacDepuisCatalogue(ipActuelle, mac);
  if (macResolue.length === 0 || ipActuelle.length === 0) {
    return { ok: false, skipped: true, reason: "MAC ou IP manquante." };
  }
  if (!estRaspberryConnu({ ipAddress: ipActuelle, macAddress: macResolue })) {
    return { ok: false, skipped: true, reason: "Adresse MAC non reconnue comme Raspberry." };
  }

  const ipCible = resoudreIpCibleDepuisMac(macResolue, ipActuelle);
  if (ipCible.length === 0) {
    return { ok: false, skipped: true, reason: "IP cible introuvable." };
  }

  const scan = scanIniFile(folderPath, raspberryParc.subnetPrefix);
  const entreeIni = trouverEntreeIniParMac(scan.entries, macResolue, normalizeMac);
  if (entreeIniDejaCorrecte(entreeIni, ipCible, normalizeMac, macResolue)) {
    appliquerNumerosDepuisIni(raspberryParc, scan.entries);
    reloadParcFromDisk();
    return { ok: true, alreadyPresent: true, ipAddress: ipCible, macAddress: macResolue };
  }

  const added = addStaticHostToIni(folderPath, macResolue, ipCible);
  if (!added.ok) {
    return { ok: false, error: added.error || "Ajout Open DHCP impossible." };
  }

  const scanApresAjout = scanIniFile(folderPath, raspberryParc.subnetPrefix);
  if (scanApresAjout.ok) {
    appliquerNumerosDepuisIni(raspberryParc, scanApresAjout.entries);
  }
  reloadParcFromDisk();
  if (typeof actualiserReseau === "function") {
    await actualiserReseau();
  }

  return {
    ok: true,
    added: true,
    updated: entreeIni !== null,
    ipAddress: added.ipAddress,
    macAddress: added.macAddress,
    ipActuelle,
    iniFilePath: added.iniFilePath || "",
  };
}

/**
 * Parcourt le sous-réseau et liste les Raspberry détectés (lecture seule, sans écrire le INI).
 */
async function decouvrirRaspberrySurReseau({
  raspberryParc,
  decouvrirAppareilsSurSousReseau,
}) {
  const appareils = await decouvrirAppareilsSurSousReseau(raspberryParc.subnetPrefix);
  const raspberries = appareils.filter((appareil) => estRaspberryConnu(appareil));
  return {
    parcModifie: false,
    appareilsTrouves: appareils.length,
    raspberriesTrouves: raspberries,
  };
}

/**
 * Scan réseau + écriture des réservations statiques dans le INI Open DHCP.
 * À appeler uniquement sur action explicite de l'utilisateur.
 */
async function synchroniserRaspberryDepuisReseau({
  raspberryParc,
  resolveOpenDhcpFolderPath,
  scanIniFile,
  addStaticHostToIni,
  getNumberFromIp,
  saveRaspberryParc,
  reloadParcFromDisk,
  normalizeMac,
  decouvrirAppareilsSurSousReseau,
}) {
  const decouverte = await decouvrirRaspberrySurReseau({
    raspberryParc,
    decouvrirAppareilsSurSousReseau,
  });
  const ajoutes = [];
  const dejaPresents = [];
  const ignores = [];

  for (let i = 0; i < decouverte.raspberriesTrouves.length; i += 1) {
    const appareil = decouverte.raspberriesTrouves[i];
    const result = await enregistrerRaspberryDansOpenDhcpSiNecessaire({
      raspberryParc,
      ipAddress: appareil.ipAddress,
      macAddress: appareil.macAddress,
      resolveOpenDhcpFolderPath,
      scanIniFile,
      addStaticHostToIni,
      getNumberFromIp,
      saveRaspberryParc,
      reloadParcFromDisk,
      normalizeMac,
    });
    if (result.ok && (result.added || result.updated)) {
      ajoutes.push({
        ipAddress: result.ipAddress,
        macAddress: result.macAddress,
        ipActuelle: result.ipActuelle || appareil.ipAddress,
      });
    } else if (result.ok && result.alreadyPresent) {
      dejaPresents.push({
        ipAddress: result.ipAddress,
        macAddress: result.macAddress,
      });
    } else {
      ignores.push({
        ipAddress: appareil.ipAddress,
        macAddress: appareil.macAddress,
        reason: result.reason || result.error || "Inconnu",
      });
    }
  }

  if (ajoutes.length > 0) {
    reloadParcFromDisk();
  }

  return {
    ok: true,
    parcModifie: ajoutes.length > 0,
    appareilsTrouves: decouverte.appareilsTrouves,
    raspberriesDetectes: decouverte.raspberriesTrouves.length,
    ajoutes,
    dejaPresents,
    ignores,
  };
}

module.exports = {
  DEFAULT_OPEN_DHCP_FOLDER,
  synchroniserParcDepuisIni,
  enregistrerRaspberryDansOpenDhcpSiNecessaire,
  decouvrirRaspberrySurReseau,
  synchroniserRaspberryDepuisReseau,
  resoudreIpCibleDepuisMac,
};
