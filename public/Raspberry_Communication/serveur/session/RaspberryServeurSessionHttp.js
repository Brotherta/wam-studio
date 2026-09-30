/**
 * Garde les sons des pistes sur le disque du Pi.
 * Chromium ne conserve pas les gros fichiers audio au refresh.
 * Ecoute seulement en local, port 5010.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT_SESSION = 5010;
const DOSSIER = path.join(__dirname, "..", "..", "stockage-session");
const DOSSIER_AUDIO = path.join(DOSSIER, "audio");
const FICHIER_META = path.join(DOSSIER, "meta.json");
const TAILLE_MAX_OCTETS = 80 * 1024 * 1024;

function identifiantDepuisNom(nom) {
  return crypto.createHash("sha256").update(nom).digest("hex").slice(0, 40);
}

function autoriserOrigine(requete, reponse) {
  const origine = typeof requete.headers.origin === "string" ? requete.headers.origin : "";
  if (origine.startsWith("http://localhost:") || origine.startsWith("http://127.0.0.1:")) {
    reponse.setHeader("Access-Control-Allow-Origin", origine);
  }
  reponse.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  reponse.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function lireCorps(requete) {
  return new Promise((resolve, reject) => {
    const morceaux = [];
    let taille = 0;
    requete.on("data", (morceau) => {
      taille += morceau.length;
      if (taille > TAILLE_MAX_OCTETS) {
        reject(new Error("Fichier audio trop gros"));
        requete.destroy();
        return;
      }
      morceaux.push(morceau);
    });
    requete.on("end", () => resolve(Buffer.concat(morceaux)));
    requete.on("error", reject);
  });
}

function envoyerJson(reponse, code, payload) {
  reponse.writeHead(code, { "Content-Type": "application/json" });
  reponse.end(JSON.stringify(payload));
}

function demarrerServeurSessionDisque() {
  fs.mkdirSync(DOSSIER_AUDIO, { recursive: true });
  const serveur = http.createServer(async (requete, reponse) => {
    autoriserOrigine(requete, reponse);
    if (requete.method === "OPTIONS") {
      reponse.writeHead(204);
      reponse.end();
      return;
    }

    try {
      const url = new URL(requete.url || "/", "http://127.0.0.1");

      if (requete.method === "GET" && url.pathname === "/session/sante") {
        envoyerJson(reponse, 200, { ok: true });
        return;
      }

      if (requete.method === "GET" && url.pathname === "/session/meta") {
        if (!fs.existsSync(FICHIER_META)) {
          reponse.writeHead(404);
          reponse.end();
          return;
        }
        reponse.writeHead(200, { "Content-Type": "application/json" });
        fs.createReadStream(FICHIER_META).pipe(reponse);
        return;
      }

      if (requete.method === "PUT" && url.pathname === "/session/meta") {
        const corps = await lireCorps(requete);
        const meta = JSON.parse(corps.toString("utf8"));
        const nomsAudio = Array.isArray(meta.nomsAudio)
          ? meta.nomsAudio.filter((nom) => typeof nom === "string" && nom.length > 0)
          : [];
        if (nomsAudio.length === 0) {
          envoyerJson(reponse, 400, { ok: false });
          return;
        }
        const aGarder = new Set(nomsAudio.map((nom) => identifiantDepuisNom(nom)));
        fs.readdirSync(DOSSIER_AUDIO).forEach((fichier) => {
          if (!aGarder.has(fichier)) {
            fs.unlinkSync(path.join(DOSSIER_AUDIO, fichier));
          }
        });
        fs.writeFileSync(FICHIER_META, `${JSON.stringify({
          project: meta.project,
          regionsSons: meta.regionsSons || {},
          enregistreA: Date.now(),
          nomsAudio,
        })}\n`);
        envoyerJson(reponse, 200, { ok: true });
        return;
      }

      if (url.pathname === "/session/audio") {
        const nom = url.searchParams.get("nom") || "";
        if (nom.length === 0) {
          reponse.writeHead(400);
          reponse.end();
          return;
        }
        const chemin = path.join(DOSSIER_AUDIO, identifiantDepuisNom(nom));
        if (requete.method === "PUT") {
          const corps = await lireCorps(requete);
          fs.writeFileSync(chemin, corps);
          envoyerJson(reponse, 200, { ok: true });
          return;
        }
        if (requete.method === "GET") {
          if (!fs.existsSync(chemin)) {
            reponse.writeHead(404);
            reponse.end();
            return;
          }
          reponse.writeHead(200, { "Content-Type": "application/octet-stream" });
          fs.createReadStream(chemin).pipe(reponse);
          return;
        }
      }

      reponse.writeHead(404);
      reponse.end();
    } catch (erreur) {
      const message = erreur && erreur.message ? erreur.message : "Erreur";
      reponse.writeHead(500, { "Content-Type": "text/plain" });
      reponse.end(message);
    }
  });

  serveur.on("error", (erreur) => {
    if (erreur && erreur.code === "EADDRINUSE") {
      return;
    }
    console.error("[SessionDisque]", erreur);
  });
  serveur.listen(PORT_SESSION, "127.0.0.1");
  return serveur;
}

module.exports = {
  demarrerServeurSessionDisque,
  PORT_SESSION,
};
