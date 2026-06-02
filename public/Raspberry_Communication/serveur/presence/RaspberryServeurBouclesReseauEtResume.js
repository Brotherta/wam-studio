/**
 * Boucles périodiques : sondage réseau (ping/ARP) et résumé serveur.
 */
function demarrerBoucleSondageReseau(etat, intervalleMs, actualiserReseau, diffuseur) {
  if (etat.arpRefreshTimer) {
    return;
  }
  actualiserReseau();
  etat.arpRefreshTimer = setInterval(() => {
    actualiserReseau();
    diffuseur.diffuserResumeServeur();
  }, intervalleMs);
}

function demarrerBoucleResumeServeur(etat, intervalleMs, diffuseur) {
  if (etat.summaryTimer) {
    return;
  }
  etat.summaryTimer = setInterval(() => {
    diffuseur.diffuserResumeServeur();
  }, intervalleMs);
}

module.exports = {
  demarrerBoucleSondageReseau,
  demarrerBoucleResumeServeur,
};
