const { execSync } = require("child_process");
const os = require("os");

function sortieContientPortEnEcoute(sortie, portNumber) {
  const texte = `${sortie || ""}`;
  const needle = `:${portNumber}`;
  if (os.platform() === "win32") {
    return texte.split(/\r?\n/).some((line) => line.includes("LISTENING") && line.includes(needle));
  }
  return texte.includes(needle);
}

function executerCommandePort(commande) {
  return execSync(commande, { windowsHide: true, encoding: "utf8" });
}

/**
 * Indique si un port TCP est déjà en écoute sur cette machine.
 */
function portEstEnEcoute(port) {
  const portNumber = Number(port);
  if (!Number.isFinite(portNumber) || portNumber < 1 || portNumber > 65535) {
    return false;
  }

  const plateforme = os.platform();
  try {
    if (plateforme === "win32") {
      const out = executerCommandePort("netstat -ano");
      return sortieContientPortEnEcoute(out, portNumber);
    }

    if (plateforme === "darwin") {
      const out = executerCommandePort(`lsof -nP -iTCP:${portNumber} -sTCP:LISTEN`);
      return sortieContientPortEnEcoute(out, portNumber);
    }

    try {
      const out = executerCommandePort(`ss -ltn sport = :${portNumber}`);
      return sortieContientPortEnEcoute(out, portNumber);
    } catch {
      const out = executerCommandePort(`lsof -nP -iTCP:${portNumber} -sTCP:LISTEN`);
      return sortieContientPortEnEcoute(out, portNumber);
    }
  } catch {
    return false;
  }
}

module.exports = {
  portEstEnEcoute,
};
