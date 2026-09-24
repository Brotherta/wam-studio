const { executerCommandeReseau } = require("./RaspberryServeurSondageReseau");
const { commandePing } = require("./RaspberryServeurCommandesOs");
const { normaliserMac } = require("./RaspberryDetectionMac");

const TAILLE_LOT_PING = 40;
const DELAI_PING_MS = 200;

/**
 * Lit une ligne arp -a Windows ou macOS / Linux.
 * Windows : 192.168.1.74    b8-27-eb-aa-bb-cc    dynamic
 * macOS   : ? (192.168.1.74) at b8:27:eb:aa:bb:cc on en0
 */
function extraireIpEtMacDepuisLigneArp(ligne) {
  const texte = `${ligne || ""}`.trim();
  const formatUnix = texte.match(
    /\((\d{1,3}(?:\.\d{1,3}){3})\)\s+at\s+([0-9a-fA-F:.-]{11,17})/i
  );
  if (formatUnix) {
    return { ipAddress: formatUnix[1], macBrute: formatUnix[2] };
  }
  const formatWindows = texte.match(/(\d{1,3}(?:\.\d{1,3}){3})\s+([0-9a-fA-F-:-]{17})/);
  if (formatWindows) {
    return { ipAddress: formatWindows[1], macBrute: formatWindows[2] };
  }
  return null;
}

/**
 * Envoie un ping rapide sur chaque adresse du sous-réseau pour remplir la table ARP.
 */
async function envoyerPingSurSousReseau(subnetPrefix) {
  const prefixe = `${subnetPrefix || ""}`.trim();
  if (prefixe.length === 0) {
    return;
  }
  for (let debut = 1; debut <= 254; debut += TAILLE_LOT_PING) {
    const lot = [];
    for (let numero = debut; numero < debut + TAILLE_LOT_PING && numero <= 254; numero += 1) {
      const ip = `${prefixe}${numero}`;
      lot.push(executerCommandeReseau(commandePing(ip, DELAI_PING_MS)));
    }
    await Promise.all(lot);
  }
}

/**
 * Parse la sortie de `arp -a` et retourne les appareils du sous-réseau cible.
 */
function extraireAppareilsDepuisTableArp(texteArp, subnetPrefix) {
  const prefixe = `${subnetPrefix || ""}`.trim();
  const appareils = [];
  const dejaVu = new Set();
  const lignes = `${texteArp || ""}`.split(/\r?\n/);

  lignes.forEach((ligne) => {
    const champs = extraireIpEtMacDepuisLigneArp(ligne);
    if (!champs) {
      return;
    }
    const ipAddress = champs.ipAddress;
    if (prefixe.length > 0 && !ipAddress.startsWith(prefixe)) {
      return;
    }
    const macAddress = normaliserMac(champs.macBrute);
    if (macAddress.length === 0) {
      return;
    }
    const cle = `${ipAddress}|${macAddress}`;
    if (dejaVu.has(cle)) {
      return;
    }
    dejaVu.add(cle);
    appareils.push({ ipAddress, macAddress });
  });

  return appareils;
}

/**
 * Sondage complet du sous-réseau : ping puis lecture de la table ARP.
 */
async function decouvrirAppareilsSurSousReseau(subnetPrefix) {
  await envoyerPingSurSousReseau(subnetPrefix);
  const texteArp = await executerCommandeReseau("arp -a");
  return extraireAppareilsDepuisTableArp(texteArp, subnetPrefix);
}

module.exports = {
  extraireIpEtMacDepuisLigneArp,
  envoyerPingSurSousReseau,
  extraireAppareilsDepuisTableArp,
  decouvrirAppareilsSurSousReseau,
};
