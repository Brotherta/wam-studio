# Reproduction communication Raspberry (analyse fidele au code)

Objectif de ce document: te donner une lecture exploitable du comportement reel de ce projet pour reproduire le meme schema dans ton projet actuel (connexion, heartbeat, commandes, etats online/offline).

## 1) Architecture reelle observee

### 1.1 Points d'entree lies aux Raspberry

- **Serveur HTTP (UI)**
  - `cirmrasp/cirmrasp.js`
  - Cree un serveur Express avec `app.listen(ipConfig.webserveurPort)` sur `ipConfig.serverIPAddress`.
  - Sert `cirmrasp/clients/controleur/controleur.html` a la racine `/`.

- **Serveur WebSocket (coeur supervision/commandes)**
  - `cirmrasp/serveur/wsServeur.js`
  - Cree un serveur WS avec `new WebSocketServer.Server({ port: ipConfig.websocketServeurPort })`.
  - Maintient `raspList` (Raspberry detectes en ligne) + compteurs de vie.
  - Recoit les commandes UI et les relaie vers Raspberry / OSC / SSH.

- **Client Raspberry principal**
  - `cirmrasp/clients/raspberry/rasp.js`
  - Initie la connexion WS vers le serveur (`ws://serverIPAddress:websocketServeurPort`).
  - Envoie `raspberryOpen` a la connexion.
  - Repond `raspberryAlive` aux checks `isRaspAlive`.
  - Execute des commandes systeme (`sudo reboot`, `sudo shutdown now`).

- **Client Raspberry alternatif**
  - `cirmrasp/raspSkini.js`
  - Meme logique WS/heartbeat, plus un recepteur OSC UDP local + synchronisation Ableton Link + `aplay`.
  - Sert de variante de runtime audio, pas de remplacement strict cote serveur.

- **UI controleur**
  - `cirmrasp/clients/controleur/controleur.html` (chargement UI et `initWSocket(window.location.hostname)`).
  - `cirmrasp/clients/controleur/controleur.js` (WS UI, rendu online/offline, emission des commandes).
  - `cirmrasp/clients/controleur/styleControleur.css` (classes d'etat: `raspButtonOK` vert / `raspButtonBAD` rouge).

- **Configuration IP/MAC/ports**
  - `cirmrasp/serveur/ipConfig.json`: `serverIPAddress`, `webserveurPort`, `websocketServeurPort`, `broadcastOSCAddress`, `OSCPort`, `openStagePort`.
  - `config.json`: inventaire des machines (`computerInfo` avec IP/MAC/model/machineId...).
  - `wsServeur.js` derive `raspConfig` depuis `config.json` via `makeRaspConfig()`.

### 1.2 Roles reellement observes

- **Source de verite "online/offline runtime"**: `raspList` dans `cirmrasp/serveur/wsServeur.js`.
- **Source de verite "parc attendu"**: `computerInfo` dans `config.json`.
- **UI**: affiche le parc attendu puis colore selon les Raspberry vivants remontes par `raspList`.

---

## 2) Sequence exacte des messages

### 2.1 Connexion et initialisation

1. **UI -> serveur WS**
   - Emis depuis `initWSocket()` dans `cirmrasp/clients/controleur/controleur.js` (sur `ws.onopen`).
   - Message: `{ "type": "startControleur" }`
   - Recu dans `ws.on('message')` / `switch(msgRecu.type)` de `cirmrasp/serveur/wsServeur.js`, case `startControleur`.
   - Effet serveur: stocke la socket dans `WScontroleur`, envoie `raspConfig`.

2. **Serveur -> UI**
   - Message: `{ "type": "raspConfig", "raspConfig": [...] }`
   - Emis par case `startControleur` dans `cirmrasp/serveur/wsServeur.js`.
   - Recu dans case `raspConfig` de `cirmrasp/clients/controleur/controleur.js`.
   - Effet UI:
     - Remplit le select `#raspConfig`.
     - Construit les boutons de liste via `setListRasp()`.

3. **Raspberry -> serveur WS (connexion active)**
   - Emis depuis `ws.onopen` dans `cirmrasp/clients/raspberry/rasp.js` (egalement dans `cirmrasp/raspSkini.js`).
   - Message: `{ "type": "raspberryOpen", "raspIP": "<ip_locale>" }`
   - Recu dans case `raspberryOpen` de `cirmrasp/serveur/wsServeur.js`.
   - Effet serveur: `addRaspInList(raspIP, ws)` (ajout ou mise a jour socket + reset compteur).

### 2.2 Heartbeat (online/offline)

- **Parametres reels**
  - `tempoCheck = 4000` ms dans `cirmrasp/serveur/wsServeur.js`.
  - `aliveCounter = 2` au reset.

- **Cycle execute toutes les 4 secondes (serveur)**
  1. Broadcast `{"type":"isRaspAlive"}` via `serv.broadcast(...)`.
  2. `decreaseAliveCounters()` decremente chaque entree de `raspList`.
  3. Si compteur `<= 0`, suppression de l'entree (`splice`).
  4. Construit `raspListShort` (`raspIP`, `info`) et l'envoie a l'UI:
     - `{ "type": "raspList", "list": [...] }`

- **Reponse Raspberry**
  - Recoit `isRaspAlive` dans case `isRaspAlive` de `cirmrasp/clients/raspberry/rasp.js`.
  - Repond:
    - `{ "type":"raspberryAlive", "raspIP":"...", "info":"Memory: ... free Mem: ..." }`

- **Traitement serveur**
  - Case `raspberryAlive` -> `updateRaspList(msg, ws)` dans `cirmrasp/serveur/wsServeur.js`.
  - Effets: met a jour socket/info, remet `aliveCounter` a 2.

- **Logique online/offline cote UI**
  - Recoit `raspList` dans case `raspList` de `cirmrasp/clients/controleur/controleur.js`.
  - Appelle `refreshListRasp(list)`.
  - Strategie:
    - Passe d'abord tous les boutons en `raspButtonBAD`.
    - Passe en `raspButtonOK` ceux dont `raspIP` est present.
    - Met a jour texte `info` dans `#infoRasp-<ip_sans_points>`.
  - Couleurs definies dans `cirmrasp/clients/controleur/styleControleur.css`.

### 2.3 Commandes metier et mapping precis

- **`rebootRaspberry`**
  - Emission UI: `restart` bouton/confirm dans `cirmrasp/clients/controleur/controleur.js` (`setListRasp()` click handler).
  - Recu serveur: case `rebootRaspberry` dans `cirmrasp/serveur/wsServeur.js`.
  - Routage: `sendToRasp(raspIP, {type:"rebootRaspberry"})`.
  - Execution Raspberry: case `rebootRaspberry` dans `cirmrasp/clients/raspberry/rasp.js` -> `exec('sudo reboot')`.
  - Impact UI: indirect, repasse offline si la machine disparait du heartbeat puis online apres reconnexion.

- **`shutdownRaspberries` -> `shutdownRaspberry`**
  - Emission UI: `broadcastShutdown()` dans `cirmrasp/clients/controleur/controleur.js`.
  - Recu serveur: case `shutdownRaspberries` dans `cirmrasp/serveur/wsServeur.js`.
  - Routage: `serv.broadcast({type:"shutdownRaspberry"})`.
  - Execution Raspberry: case `shutdownRaspberry` dans `cirmrasp/clients/raspberry/rasp.js` -> `exec('sudo shutdown now')`.
  - Impact UI: machines passent BAD au fil des cycles heartbeat.

- **`restartNode`**
  - Emission UI: `restartNode()` dans `cirmrasp/clients/controleur/controleur.js`.
  - Recu serveur: case `restartNode` dans `cirmrasp/serveur/wsServeur.js`.
  - Execution distante:
    - `restartNodeClient(raspIP)` -> SSH `killall -9 node; node /home/pi/cirmrasp/clients/raspberry/rasp.js&`.
  - Impact UI: micro-coupure heartbeat possible, puis retour online si le process repart.

- **`sendSoundFile`**
  - Emission UI: `sendSoundFile()` dans `cirmrasp/clients/controleur/controleur.js`.
  - Recu serveur: case `sendSoundFile` dans `cirmrasp/serveur/wsServeur.js`.
  - Execution distante: `sendSoundFile(raspIP, file)` -> SCP vers `/home/pi/PureData/<prefix5>.wav` via `sshpass`.
  - Impact UI: pas d'etat specifique, seulement logs.

- **`sendOSCmessage` (cible unique)**
  - Emission UI: `sendOSCMessage()` dans `cirmrasp/clients/controleur/controleur.js`.
  - Recu serveur: case `sendOSCmessage` dans `cirmrasp/serveur/wsServeur.js`.
  - Traitement: parse CSV en tableau d'entiers puis `sendOSCmessage(ip, OSCPort, msg, args)`.
  - Impact UI: pas de retour d'accuse natif.

- **`broadcastOSCmessage` (multi-cibles)**
  - Emission UI: `broadcastOSCMessage()` dans `cirmrasp/clients/controleur/controleur.js`.
  - Recu serveur: case `broadcastOSCmessage` dans `cirmrasp/serveur/wsServeur.js`.
  - Execution: boucle sur `raspList` et envoi OSC a chaque Raspberry online.

---

## 3) Checklist de reproduction

### 3.1 Prerequis runtime

- **Node.js** (version non figee dans le repo, projet historique).
- **Dependances Node presentes dans `cirmrasp/package.json`**
  - `ws`, `express`, `osc-min`, `path` (et `fs` declare).
- **Binaires/systeme utilises par le code serveur**
  - `sshpass`
  - `scp`
  - `ssh`
- **Commandes systeme cote Raspberry**
  - `sudo reboot`
  - `sudo shutdown now`
  - si variante `raspSkini.js`: `amixer`, `aplay`.
- **Fichiers de config obligatoires**
  - `cirmrasp/serveur/ipConfig.json`
  - `config.json`
- **Variables d'environnement**
  - Aucune variable d'environnement obligatoire explicite detectee dans le code.

### 3.2 Processus a lancer

- **Serveur central (HTTP + WS)**
  - Depuis `cirmrasp/`:
  - `node cirmrasp.js`

- **Client Raspberry**
  - Runtime principal: `node clients/raspberry/rasp.js`
  - Variante audio: `node raspSkini.js`

- **UI controleur**
  - Ouvrir `http://<serverIPAddress>:<webserveurPort>` (port issu de `ipConfig.json`).

### 3.3 Tests concrets de validation

- **Test connexion minimal**
  1. Lancer serveur `node cirmrasp.js`.
  2. Lancer un client `node clients/raspberry/rasp.js`.
  3. Ouvrir UI.
  4. Verifier qu'une IP passe en vert (`raspButtonOK`).

- **Logs attendus quand ca marche**
  - Cote serveur (`cirmrasp/serveur/wsServeur.js`):
    - logs de connexion WS (`received connexion`)
    - reception de `raspberryOpen`
    - reception periodique de `raspberryAlive`
  - Cote Raspberry (`cirmrasp/clients/raspberry/rasp.js`):
    - `rasp.js Websocket : ws://...:8383/`
    - `reçu : isRaspAlive: <n>` en boucle
  - Exemple confirme par `cirmrasp/clients/raspberry/rasp.log`.

- **Test heartbeat/offline**
  1. Laisser tourner serveur + client.
  2. Tuer le process client Raspberry.
  3. Attendre ~8 secondes (2 cycles de 4 s).
  4. Verifier passage de vert a rouge dans UI.

- **Test commande**
  - Cliquer un bouton reboot dans UI.
  - Verifier logs serveur `rebootRaspberry`, puis execution cote client.

### 3.4 Points de vigilance pour reproduire a l'identique

- L'identifiant runtime d'un Raspberry est l'IP (`raspIP`), pas l'adresse MAC.
- La liste online est derivee du heartbeat, pas du fichier de config.
- `restartNode` cote serveur relance explicitement `clients/raspberry/rasp.js`.
- L'UI ne fait pas de polling direct: elle depend uniquement des messages WS `raspList`.

---

## 4) Plan de migration vers mon projet actuel

### 4.1 Ecarts probables (si ton projet ne reproduit pas encore ce comportement)

- **P1 - Heartbeat serveur pilotant l'etat online/offline**
  - Manquant probable: boucle periodique cote serveur (`isRaspAlive` + compteur TTL + eviction offline).
  - Impact: etat online trompeur ou non convergent.

- **P1 - Contrat de messages WS strict**
  - Manquant probable: meme taxonomie de messages (`startControleur`, `raspberryOpen`, `raspberryAlive`, `raspList`, commandes).
  - Impact: impossible de brancher une UI equivalente sans adaptation.

- **P1 - Source de verite centralisee**
  - Manquant probable: liste d'etat maintenue uniquement cote serveur.
  - Impact: divergence entre clients/UI.

- **P2 - Couche commandes systeme**
  - Manquant probable: relais reboot/shutdown/restart node via WS -> Raspberry.
  - Impact: supervision OK mais exploitation incomplete.

- **P2 - Envoi OSC via serveur**
  - Manquant probable: traduction WS vers OSC UDP (`sendOSCmessage`).
  - Impact: controle audio partiel.

- **P3 - Transfert de fichiers son via SCP/SSH**
  - Manquant probable: pipeline `sendSoundFile`.
  - Impact: fonctionnalite media absente mais supervision intacte.

### 4.2 Plan d'implementation recommande

1. **P1 - Reproduire le backbone WS**
   - Implementer serveur WS central + `raspList` + heartbeat identique.
   - Implementer client Raspberry minimal (`raspberryOpen` + `raspberryAlive`).
   - Implementer UI minimale qui colore BAD/OK depuis `raspList`.

2. **P1 - Verrouiller le protocole**
   - Garder les memes noms de `type` de messages pour compatibilite comportementale.
   - Garder l'identification par IP si tu veux un clone strict.

3. **P2 - Ajouter commandes d'exploitation**
   - Ajouter `rebootRaspberry`, `shutdownRaspberries`, `restartNode`.
   - Ajouter `sendOSCmessage` et `broadcastOSCmessage`.

4. **P3 - Ajouter transfert de sons**
   - Integrer SCP/SSH (ou equivalent securise si tu modernises).

### 4.3 Hypotheses explicites (a valider chez toi)

- **Hypothese**: ton projet actuel n'a pas encore la meme boucle heartbeat TTL serveur que `tempoCheck=4000` + `aliveCounter=2`.
- **Hypothese**: ton UI actuelle n'applique pas un reset global BAD puis promotion OK depuis la liste online.
- **Hypothese**: ton client Raspberry n'envoie peut-etre pas `raspberryOpen` immediatement a `ws.onopen`.
- **Hypothese**: tu n'utilises peut-etre pas la meme segmentation protocolaire (WS pour controle/etat, OSC pour audio, SSH/SCP pour fichiers).

### 4.4 Validation de fin de migration (definition of done)

- Un Raspberry demarre -> apparait online en moins d'un cycle heartbeat.
- Un Raspberry coupe -> passe offline automatiquement sans action manuelle.
- Reboot/shutdown/restart node fonctionnent depuis UI.
- Envoi OSC unitaire + broadcast fonctionnent.
- `raspList` reste la seule source d'etat online/offline exposee a l'UI.
