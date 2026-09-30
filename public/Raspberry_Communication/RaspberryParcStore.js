const fs = require("fs");
const path = require("path");

const PARC_FILE_NAME = "raspberry-parc.json";
const DEFAULT_SUBNET_PREFIX = "192.168.1.";
const DEFAULT_ACTIVE_NUMBERS = [74, 75];

function getParcFilePath() {
  return path.join(__dirname, PARC_FILE_NAME);
}

function buildDefaultParc() {
  return {
    subnetPrefix: DEFAULT_SUBNET_PREFIX,
    activeNumbers: [...DEFAULT_ACTIVE_NUMBERS],
  };
}

function normalizeNumberList(numbers) {
  if (!Array.isArray(numbers)) {
    return [];
  }
  const unique = new Set();
  numbers.forEach((value) => {
    const parsed = Number.parseInt(`${value}`, 10);
    if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 254) {
      unique.add(parsed);
    }
  });
  return Array.from(unique).sort((a, b) => a - b);
}

function loadRaspberryParc() {
  const filePath = getParcFilePath();
  if (!fs.existsSync(filePath)) {
    const defaults = buildDefaultParc();
    saveRaspberryParc(defaults);
    return defaults;
  }
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return {
      subnetPrefix: typeof parsed.subnetPrefix === "string" && parsed.subnetPrefix.length > 0
        ? parsed.subnetPrefix
        : DEFAULT_SUBNET_PREFIX,
      activeNumbers: normalizeNumberList(parsed.activeNumbers),
    };
  } catch {
    return buildDefaultParc();
  }
}

function saveRaspberryParc(parc) {
  const filePath = getParcFilePath();
  const payload = {
    subnetPrefix: typeof parc.subnetPrefix === "string" && parc.subnetPrefix.length > 0
      ? parc.subnetPrefix
      : DEFAULT_SUBNET_PREFIX,
    activeNumbers: normalizeNumberList(parc.activeNumbers),
  };
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return payload;
}

function buildIpFromNumber(subnetPrefix, number) {
  return `${subnetPrefix}${number}`;
}

function buildExpectedListFromParc(parc) {
  const numbers = normalizeNumberList(parc.activeNumbers);
  return numbers.map((number) => ({
    number,
    ipAddress: buildIpFromNumber(parc.subnetPrefix, number),
    macAddress: "",
  }));
}

function mergeListenNumbers(activeNumbers, catalogEntries) {
  const fromCatalog = Array.isArray(catalogEntries)
    ? catalogEntries.map((entry) => entry.number)
    : [];
  return normalizeNumberList([...(Array.isArray(activeNumbers) ? activeNumbers : []), ...fromCatalog]);
}

function numeroDepuisIp(ipAddress, subnetPrefix) {
  const adresse = `${ipAddress || ""}`.trim();
  const prefixe = `${subnetPrefix || ""}`;
  if (adresse.length === 0 || prefixe.length === 0 || !adresse.startsWith(prefixe)) {
    return null;
  }
  const suffixe = adresse.slice(prefixe.length);
  const numero = Number.parseInt(suffixe, 10);
  if (!Number.isFinite(numero) || numero < 1 || numero > 254) {
    return null;
  }
  if (`${prefixe}${numero}` !== adresse) {
    return null;
  }
  return numero;
}

function ajouterNumerosAuParc(raspberryParc, numbers) {
  raspberryParc.activeNumbers = normalizeNumberList([
    ...(Array.isArray(raspberryParc.activeNumbers) ? raspberryParc.activeNumbers : []),
    ...(Array.isArray(numbers) ? numbers : []),
  ]);
  return saveRaspberryParc(raspberryParc);
}

module.exports = {
  DEFAULT_SUBNET_PREFIX,
  buildDefaultParc,
  buildExpectedListFromParc,
  buildIpFromNumber,
  mergeListenNumbers,
  numeroDepuisIp,
  ajouterNumerosAuParc,
  getParcFilePath,
  loadRaspberryParc,
  normalizeNumberList,
  saveRaspberryParc,
};
