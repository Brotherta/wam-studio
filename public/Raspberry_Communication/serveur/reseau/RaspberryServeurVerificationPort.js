const { execSync } = require("child_process");
const os = require("os");

/**
 * Indique si un port TCP est déjà en écoute sur cette machine.
 */
function portEstEnEcoute(port) {
  const portNumber = Number(port);
  if (!Number.isFinite(portNumber) || portNumber < 1 || portNumber > 65535) {
    return false;
  }

  try {
    if (os.platform() === "win32") {
      const out = execSync("netstat -ano", { windowsHide: true, encoding: "utf8" });
      const needle = `:${portNumber}`;
      return out
        .split(/\r?\n/)
        .some((line) => line.includes("LISTENING") && line.includes(needle));
    }

    const out = execSync(`ss -ltn sport = :${portNumber}`, { encoding: "utf8" });
    return out.includes(`:${portNumber}`);
  } catch {
    return false;
  }
}

module.exports = {
  portEstEnEcoute,
};
