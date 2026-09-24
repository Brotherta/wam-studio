/**
 * Reconnait un Raspberry Pi via les prefixes OUI (adresse MAC).
 * Prefixes observes dans le parc (config.json) :
 * - b8:27:eb : Raspberry Pi Foundation (3a+, 3b+, 4b+)
 * - dc:a6:32 : Raspberry Pi Trading (4b+)
 * - e4:5f:01 : Raspberry Pi (4b 2giga et suivants)
 */
const RASPBERRY_MAC_PREFIXES = [
  "b8:27:eb",
  "dc:a6:32",
  "e4:5f:01",
  "d8:3a:dd",
  "2c:cf:67",
];

function normaliserMac(mac) {
  return `${mac || ""}`.trim().replace(/-/g, ":").toLowerCase();
}

function estPrefixeMacRaspberry(mac) {
  const normalisee = normaliserMac(mac);
  if (normalisee.length < 8) {
    return false;
  }
  return RASPBERRY_MAC_PREFIXES.some((prefixe) => normalisee.startsWith(prefixe));
}

module.exports = {
  RASPBERRY_MAC_PREFIXES,
  normaliserMac,
  estPrefixeMacRaspberry,
};
