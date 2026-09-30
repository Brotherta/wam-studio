/**
 * Demarre le serveur Raspberry (WebSocket 8383, reseau, agent)
 * et reste actif. Le site n'a pas besoin du clic sur le bouton.
 */
const { startRaspberryRuntime } = require("../RaspberryRuntime");

const resultat = startRaspberryRuntime();
console.log(JSON.stringify(resultat));

if (!resultat || resultat.started !== true) {
  process.exit(1);
}

setInterval(function maintenirProcessus() {}, 60 * 60 * 1000);
