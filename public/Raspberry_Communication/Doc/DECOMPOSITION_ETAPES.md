# Décomposition de Raspberry_Communication — étapes et tests

Chaque étape est **testable seule** avant de passer à la suivante.

---

## Étape 1 — Module OSC serveur (fait)

**Fichiers ajoutés**

- `serveur/RaspberryServeurConstantes.js`
- `serveur/RaspberryServeurEncodeurOsc.js`
- `serveur/RaspberryServeurEnvoiOscUdp.js`

**Fichier modifié**

- `RaspberryRuntimeCompatLegacy.js` (importe les modules ci-dessus)

### Tests étape 1

1. Démarrer WAM Studio / `node server.js` dans `public/`.
2. Lancer le serveur Raspberry (bouton ou `POST /api/raspberry/lancement`).
3. Vérifier `GET /api/raspberry/status` → `running: true`, port **8383**.
4. Ouvrir **Search Raspberry**, connexion WS OK (statut, pas d’erreur console).
5. Connecter un Pi avec `RaspberryClientAutoConnect.js` → ligne **verte**.
6. Sur un Pi en ligne : envoyer une commande **OSC** (adresse + args) → message `oscSent` ou erreur explicite dans les détails.
7. (Optionnel) Broadcast OSC vers tous les Pi en ligne.

**Si OK** → passer à l’étape 2.

---

## Étape 2 — Sondage réseau (ping / ARP) (fait)

**Fichier ajouté**

- `serveur/RaspberryServeurSondageReseau.js` (`executerCommandeReseau`, `extraireAdresseMacDepuisTexte`, `sonderUneAdresseIpRaspberry`, `lireAdresseMacDepuisArpPourIp`, `sonderListeRaspberryAttendus`)

**Fichier modifié**

- `RaspberryRuntimeCompatLegacy.js` (`refreshNetworkStatus` délègue au module de sondage)

### Tests étape 2

1. Répéter tests étape 1 (lancement, client, liste verte/rouge).
2. Vérifier que les détails d’un Raspberry affichent **ping** / **ARP** mis à jour.
3. Débrancher un Pi du réseau → après ~12 s, passage **rouge** (heartbeat).

---

## Étape 3 — Handlers parc / Open DHCP (fait)

**Fichier ajouté**

- `serveur/RaspberryServeurHandlersParcOpenDhcp.js` (scan/apply/add + payloads)

**Fichier modifié**

- `RaspberryRuntimeCompatLegacy.js` (délègue les messages parc/DHCP au module)

### Tests étape 3

1. Panneau **Parc / DHCP** : scanner un dossier INI valide.
2. **Ajouter** MAC + IP → entrée dans le INI + liste.
3. **Appliquer la sélection** → `raspberry-parc.json` mis à jour.

---

## Étape 4 — Heartbeat, diffusion WS, routeur messages (fait)

**Fichiers ajoutés** (voir `serveur/README.md` pour l’arborescence)

- `serveur/presence/` — liste en ligne, diffusion, boucles heartbeat / réseau / résumé
- `serveur/websocket/` — connexions et gestionnaire de messages
- (+ modules des étapes 1–3 dans `configuration/`, `osc/`, `reseau/`, `parc/`)

**Fichiers modifiés**

- `RaspberryRuntimeCompatLegacy.js` (orchestration légère via `etat` partagé)
- `RaspberryRuntime.js` (réexport uniquement, plus de code mort)

### Tests étape 4

1. Scénario complet étapes 1–3.
2. **Infos serveur** : compteurs qui évoluent (connexions, heartbeats).
3. Client Raspberry et UI sur le port **8383** uniquement.

---

## Étape 5 — UI : parseur messages WebSocket (fait)

**Fichiers ajoutés** (`interface-wam-studio/`)

- `SearchRaspberryExtracteursChampsMessage.ts`
- `SearchRaspberryHoteApplicateurMessages.ts`
- `SearchRaspberryParseurMessagesServeur.ts`

**Fichier modifié**

- `SearchRaspberryFeature.ts` (~250 lignes en moins : parseur externalisé)

### Tests étape 5

1. Fenêtre Search Raspberry : liste, détails, OSC, parc inchangés.
2. Lancement serveur depuis le bouton menu.

---

## Étape 6 — UI : panneaux (liste, parc, ajout, OSC, stats) (fait)

**Fichiers ajoutés** (`interface-wam-studio/`)

- `SearchRaspberryPanneauListe.ts` — liste + détails
- `SearchRaspberryPanneauOsc.ts` — formulaire OSC
- `SearchRaspberryPanneauParcDhcp.ts` — parc / Open DHCP
- `SearchRaspberryPanneauAjout.ts` — ajout manuel + chemin INI
- `SearchRaspberryPanneauStats.ts` — infos serveur
- `SearchRaspberryNavigation.ts` — onglets Liste / Parc / Ajouter / Stats
- `SearchRaspberryUtilitairesOpenDhcp.ts` — chemins dossier INI

**Fichier modifié**

- `SearchRaspberryFeature.ts` (~540 lignes : WebSocket, façade, état)

### Tests étape 6

1. Navigation entre onglets (Liste / Parc / Ajouter / Stats).
2. Régression complète bout en bout.

---

## Étape 7 — Point d’entrée serveur et doc (fait)

**Fichier ajouté**

- `serveur/point-entree/RaspberryServeurPointEntree.js` — orchestration (ex-`RaspberryRuntimeCompatLegacy.js`)

**Fichiers simplifiés**

- `RaspberryRuntime.js` — réexport uniquement
- `RaspberryRuntimeCompatLegacy.js` — alias historique (réexport)

**Documentation mise à jour**

- `serveur/README.md`, `Doc/EXPLICATION_SIMPLE.md`, `Doc/DECOMPOSITION_ETAPES.md`

### Tests étape 7

1. `cd public` puis `npm start` → bouton lancement Raspberry, WS port **8383**.
2. `GET /api/raspberry/status` → `running: true` après lancement.
3. Scénario complet étapes 1–6 (liste, parc, OSC, stats).
4. Aucun import cassé : `server.js` et `webpack.config.js` utilisent toujours `RaspberryRuntime.js`.

---

## Étape 8 — UI : WebSocket et lancement API (fait)

**Fichiers ajoutés** (`interface-wam-studio/`)

- `SearchRaspberryConnexionWebSocket.ts`
- `SearchRaspberryLancementServeur.ts`

**Fichier modifié**

- `SearchRaspberryFeature.ts` — suppression du patch `prototype` en fin de fichier ; délégation WS + `/api/raspberry/*`

### Tests étape 8

1. `npm start` dans `public/` → compilation sans erreur.
2. Bouton menu : lancement serveur → fenêtre Search Raspberry + bouton **vert**.
3. Liste, reconnexion WS après fermeture/réouverture de la fenêtre.
4. Panneau **Ajouter** : message clair si WS non connecté.

---

## Bilan décomposition

Les **8 étapes** du découpage structurel sont terminées. Pour toute évolution fonctionnelle (SCP, reboot Pi, playlist…), voir `Doc/ETAPES_IMPLEMENTATION_POUR_MOI.md`. Pour le code, modifier le module concerné dans `serveur/` ou `interface-wam-studio/` plutôt que d’agrandir les fichiers façade.
