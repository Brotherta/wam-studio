const os = require("os");

/**
 * Commandes reseau selon l'OS (Windows, macOS, Linux).
 * Windows : ping -n / netstat
 * macOS   : ping -c / lsof
 * Linux   : ping -c / ss (puis lsof)
 */

function estWindows(plateforme = os.platform()) {
  return plateforme === "win32";
}

function estMac(plateforme = os.platform()) {
  return plateforme === "darwin";
}

/**
 * Ping d'une seule IP, timeout en millisecondes (Windows et macOS).
 * Linux attend le timeout en secondes.
 */
function commandePing(ipAddress, delaiMs = 800, plateforme = os.platform()) {
  const ip = `${ipAddress || ""}`.trim();
  const delai = Number(delaiMs);
  const attenteMs = Number.isFinite(delai) && delai > 0 ? Math.round(delai) : 800;

  if (estWindows(plateforme)) {
    return `ping -n 1 -w ${attenteMs} ${ip}`;
  }
  if (estMac(plateforme)) {
    return `ping -c 1 -W ${attenteMs} ${ip}`;
  }
  const attenteSecondes = Math.max(1, Math.ceil(attenteMs / 1000));
  return `ping -c 1 -W ${attenteSecondes} ${ip}`;
}

/**
 * True si la sortie ping montre une reponse ICMP (Windows TTL= ou Unix ttl=).
 */
function pingAReussi(sortiePing) {
  const texte = `${sortiePing || ""}`;
  if (/TTL\s*=/i.test(texte)) {
    return true;
  }
  if (/bytes from/i.test(texte) && !/100%\s*packet loss/i.test(texte)) {
    return true;
  }
  return false;
}

module.exports = {
  estWindows,
  estMac,
  commandePing,
  pingAReussi,
};
