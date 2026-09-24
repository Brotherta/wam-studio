const { exec } = require("child_process");
const { commandePing, pingAReussi } = require("./RaspberryServeurCommandesOs");

/**
 * Exécute une commande shell (ping, arp) et renvoie la sortie texte, ou "" en cas d'erreur.
 */
function executerCommandeReseau(commande) {
  return new Promise((resolve) => {
    exec(commande, { windowsHide: true }, (_error, stdout) => {
      resolve(stdout || "");
    });
  });
}

/**
 * Extrait la première adresse MAC trouvée dans un texte (sortie arp -a).
 */
function extraireAdresseMacDepuisTexte(texte) {
  const macRegex = /([0-9a-fA-F]{2}[-:]){5}[0-9a-fA-F]{2}/;
  const match = texte.match(macRegex);
  return match ? match[0].replace(/-/g, ":").toLowerCase() : "";
}

/**
 * Sondage ping + ARP pour une IP (Windows : ping -n, Mac/Linux : ping -c).
 */
async function sonderUneAdresseIpRaspberry(ipAddress) {
  const pingResult = await executerCommandeReseau(commandePing(ipAddress, 800));
  const arpResult = await executerCommandeReseau(`arp -a ${ipAddress}`);
  const macAddress = extraireAdresseMacDepuisTexte(arpResult);
  return {
    ipAddress,
    macAddress,
    pingOk: pingAReussi(pingResult),
    arpSeen: macAddress.length > 0,
    checkedAtMs: Date.now(),
  };
}

/**
 * Interroge la table ARP pour une IP (sans ping).
 */
async function lireAdresseMacDepuisArpPourIp(ipAddress) {
  const arpResult = await executerCommandeReseau(`arp -a ${ipAddress}`);
  return extraireAdresseMacDepuisTexte(arpResult);
}

/**
 * Sondage parallèle pour une liste d'entrées { ipAddress, ... }.
 */
async function sonderListeRaspberryAttendus(listeAttendue) {
  const liste = Array.isArray(listeAttendue) ? listeAttendue : [];
  return Promise.all(liste.map((item) => sonderUneAdresseIpRaspberry(item.ipAddress)));
}

module.exports = {
  executerCommandeReseau,
  extraireAdresseMacDepuisTexte,
  sonderUneAdresseIpRaspberry,
  lireAdresseMacDepuisArpPourIp,
  sonderListeRaspberryAttendus,
};
