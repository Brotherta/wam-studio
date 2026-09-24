/**
 * Runtime de l'agent de transfert local (port 3100).
 * Demarre le processus Node dans agent-transfert/ si le port est libre.
 */
const path = require("path");
const { spawn } = require("child_process");
const { portEstEnEcoute } = require("./serveur/reseau/RaspberryServeurVerificationPort");

const PORT_AGENT_TRANSFERT = 3100;
let processusAgent = null;

function obtenirDossierAgent() {
  return path.resolve(__dirname, "agent-transfert");
}

function demarrerAgentTransfertRuntime() {
  if (portEstEnEcoute(PORT_AGENT_TRANSFERT)) {
    return {
      started: true,
      alreadyRunning: true,
      port: PORT_AGENT_TRANSFERT,
      message: "L'agent de transfert ecoute deja sur le port 3100.",
    };
  }

  if (processusAgent && processusAgent.exitCode === null && !processusAgent.killed) {
    return {
      started: true,
      alreadyRunning: true,
      port: PORT_AGENT_TRANSFERT,
      message: "Processus agent de transfert deja lance par ce serveur.",
    };
  }

  const dossierAgent = obtenirDossierAgent();
  processusAgent = spawn("npm", ["run", "dev"], {
    cwd: dossierAgent,
    shell: true,
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  });
  processusAgent.unref();
  processusAgent.on("exit", () => {
    processusAgent = null;
  });

  return {
    started: true,
    alreadyRunning: false,
    port: PORT_AGENT_TRANSFERT,
    message: "Demarrage de l'agent de transfert (npm run dev)...",
  };
}

function obtenirStatutAgentTransfertRuntime() {
  const running = portEstEnEcoute(PORT_AGENT_TRANSFERT);
  const processusGere =
    processusAgent !== null && processusAgent.exitCode === null && !processusAgent.killed;
  return {
    running,
    port: PORT_AGENT_TRANSFERT,
    processusGere,
  };
}

module.exports = {
  PORT_AGENT_TRANSFERT,
  demarrerAgentTransfertRuntime,
  obtenirStatutAgentTransfertRuntime,
};
