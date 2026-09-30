/**
 * Ajoute à la liste WAM les Raspberry déjà présents sur le réseau.
 * N'écrit aucune réservation DHCP : le DHCP reste hors du projet.
 */
const { estRaspberryConnu } = require("../../RaspberryCatalogStore");
const { ajouterNumerosAuParc, numeroDepuisIp } = require("../../RaspberryParcStore");

async function synchroniserRaspberryDepuisReseau({
  raspberryParc,
  reloadParcFromDisk,
  decouvrirAppareilsSurSousReseau,
}) {
  const appareils = await decouvrirAppareilsSurSousReseau(raspberryParc.subnetPrefix);
  const raspberries = appareils.filter((appareil) => estRaspberryConnu(appareil));
  const dejaDansLaListe = new Set(raspberryParc.activeNumbers || []);
  const ajoutes = [];
  const dejaPresents = [];
  const numerosNouveaux = [];

  raspberries.forEach((appareil) => {
    const numero = numeroDepuisIp(appareil.ipAddress, raspberryParc.subnetPrefix);
    if (numero === null) {
      return;
    }
    const fiche = {
      ipAddress: appareil.ipAddress,
      macAddress: appareil.macAddress || "",
    };
    if (dejaDansLaListe.has(numero)) {
      dejaPresents.push(fiche);
      return;
    }
    dejaDansLaListe.add(numero);
    numerosNouveaux.push(numero);
    ajoutes.push(fiche);
  });

  if (numerosNouveaux.length > 0) {
    ajouterNumerosAuParc(raspberryParc, numerosNouveaux);
    if (typeof reloadParcFromDisk === "function") {
      reloadParcFromDisk();
    }
  }

  return {
    ok: true,
    parcModifie: numerosNouveaux.length > 0,
    appareilsTrouves: appareils.length,
    raspberriesDetectes: raspberries.length,
    ajoutes,
    dejaPresents,
    ignores: [],
  };
}

module.exports = {
  synchroniserRaspberryDepuisReseau,
};
