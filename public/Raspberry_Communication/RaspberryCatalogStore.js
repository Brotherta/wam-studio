const fs = require("fs");
const path = require("path");
const { estPrefixeMacRaspberry, normaliserMac } = require("./serveur/reseau/RaspberryDetectionMac");

const CATALOG_FILE_NAME = "raspberry-catalog.json";

let catalogueEnMemoire = null;

function chargerCatalogue() {
  if (catalogueEnMemoire) {
    return catalogueEnMemoire;
  }
  const filePath = path.join(__dirname, CATALOG_FILE_NAME);
  if (!fs.existsSync(filePath)) {
    catalogueEnMemoire = { entries: [] };
    return catalogueEnMemoire;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    catalogueEnMemoire = {
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
    };
  } catch {
    catalogueEnMemoire = { entries: [] };
  }
  return catalogueEnMemoire;
}

function trouverParIp(ipAddress) {
  const ip = `${ipAddress || ""}`.trim();
  return chargerCatalogue().entries.find((entry) => entry.ipAddress === ip) || null;
}

function trouverParMac(macAddress) {
  const mac = normaliserMac(macAddress);
  if (mac.length === 0) {
    return null;
  }
  return chargerCatalogue().entries.find((entry) => normaliserMac(entry.macAddress) === mac) || null;
}

function estRaspberryConnu({ ipAddress, macAddress }) {
  if (trouverParIp(ipAddress) || trouverParMac(macAddress)) {
    return true;
  }
  return estPrefixeMacRaspberry(macAddress);
}

function obtenirNumerosMachineDuCatalogue() {
  return chargerCatalogue()
    .entries.map((entry) => {
      const match = `${entry.ipAddress || ""}`.match(/\.(\d+)$/);
      if (match) {
        return Number.parseInt(match[1], 10);
      }
      return entry.machineId;
    })
    .filter((value) => Number.isFinite(value));
}

function obtenirLibelleMachine(ipAddress, macAddress) {
  const parIp = trouverParIp(ipAddress);
  if (parIp && parIp.machineId) {
    return `Raspberry ${parIp.machineId}`;
  }
  const parMac = trouverParMac(macAddress);
  if (parMac && parMac.machineId) {
    return `Raspberry ${parMac.machineId}`;
  }
  return "";
}

function resoudreMacDepuisCatalogue(ipAddress, macAddress) {
  const mac = normaliserMac(macAddress);
  if (mac.length > 0) {
    return mac;
  }
  const parIp = trouverParIp(ipAddress);
  return parIp ? normaliserMac(parIp.macAddress) : "";
}

/** IP attendue pour une MAC connue du catalogue (config.json → raspberry-catalog.json). */
function obtenirIpAttendueDepuisMac(macAddress) {
  const entree = trouverParMac(macAddress);
  return entree && entree.ipAddress ? entree.ipAddress : "";
}

module.exports = {
  chargerCatalogue,
  trouverParIp,
  trouverParMac,
  estRaspberryConnu,
  obtenirNumerosMachineDuCatalogue,
  obtenirLibelleMachine,
  resoudreMacDepuisCatalogue,
  obtenirIpAttendueDepuisMac,
};
