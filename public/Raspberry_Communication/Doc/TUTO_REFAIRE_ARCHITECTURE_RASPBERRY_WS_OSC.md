# Tutoriel: refaire cette architecture dans une autre application

Ce tutoriel explique comment reconstruire une application similaire a celle du projet:

- supervision de Raspberry par WebSocket
- etat visuel (rouge/vert) des machines connectees
- envoi de commandes OSC (UDP)
- transfert de sons vers Raspberry
- lecture audio cote Raspberry/PureData

Objectif: te donner une methode reproductible, pas seulement du code.

---

## 0) Ce que tu vas construire

Tu vas creer 3 blocs:

1. **Serveur central** (Node.js): recoit les clients, suit l'etat, relaie OSC.
2. **UI controleur** (web): affiche les machines, envoie des commandes.
3. **Client Raspberry** (Node.js): se connecte au serveur, envoie heartbeat, execute commandes.

Et 3 protocoles:

- **WS** pour controle/etat
- **OSC/UDP** pour commandes audio
- **SCP/SSH** pour copie de fichiers son

---

## 1) Preparer le modele de donnees (machines physiques)

### Etape 1.1 - Creer un fichier de mapping

Cree un fichier du type `config.json` qui contient:

- `ipAddress`
- `macAddress`
- `machineId`
- `model`
- `soundcard`
- `comment`

Exemple minimal:

```json
{
  "computerInfo": [
    {
      "ipAddress": "192.168.1.10",
      "macAddress": "b8:27:eb:xx:xx:xx",
      "machineId": 10,
      "model": "4b+",
      "soundcard": "hifiberry-dacplus",
      "comment": "salle A"
    }
  ]
}
```

### Etape 1.2 - Creer un fichier reseau

Cree un `ipConfig.json` avec:

- IP du serveur
- port WebSocket
- port OSC
- adresse broadcast OSC (si besoin)

---

## 2) Construire le serveur central WS

### Etape 2.1 - Initialiser le serveur

Dans un fichier type `wsServeur.js`:

- demarre un serveur WebSocket
- charge `config.json`
- transforme `computerInfo` en liste simple `raspConfig` (IP + MAC)

### Etape 2.2 - Gerer la connexion des Raspberry

Quand un client Raspberry se connecte, il envoie:

- `type: "raspberryOpen"`
- `raspIP`

Le serveur:

- ajoute ou met a jour ce Raspberry dans `raspList`
- stocke `ws`, `raspIP`, `aliveCounter`, `info`

### Etape 2.3 - Mettre en place le heartbeat

Toutes les X secondes:

1. serveur envoie `isRaspAlive` a tous les clients
2. decremente `aliveCounter` de tous
3. supprime ceux qui arrivent a 0
4. envoie `raspList` au controleur web

Quand un Raspberry recoit `isRaspAlive`, il repond:

- `type: "raspberryAlive"`
- `raspIP`
- `info` (memoire, CPU, etc.)

### Etape 2.4 - Ajouter les commandes de controle

Minimum utile:

- `rebootRaspberry`
- `shutdownRaspberry`
- `restartNode`
- `sendSoundFile`
- `sendOSCmessage`

---

## 3) Construire le controleur web (UI)

### Etape 3.1 - Afficher la liste attendue

Au message `raspConfig`:

- creer un bouton par IP
- afficher l'info MAC/commentaire

### Etape 3.2 - Afficher l'etat reel (rouge/vert)

Au message `raspList`:

1. tout passer en classe CSS "BAD" (rouge)
2. passer en "OK" (vert) seulement les IP presentes dans `raspList`

Exemple CSS:

```css
.raspButtonOK { background-color: green; }
.raspButtonBAD { background-color: #b43d3d; }
```

### Etape 3.3 - Ajouter les actions UI

Prevoir des boutons/champs pour:

- selection de Raspberry
- envoi d'une commande OSC
- envoi d'un fichier son
- reboot/shutdown

Important: valider les champs (IP selectionnee, fichier choisi, etc.) avant envoi.

---

## 4) Ajouter l'envoi OSC (UDP)

### Etape 4.1 - Cote serveur

Creer `sendOSCmessage(ip, port, message, args)`:

- concatene `"/" + message` pour l'adresse OSC
- convertit les valeurs au bon type
- envoie via socket UDP

### Etape 4.2 - Cote UI

Envoyer vers le serveur WS:

- `type: "sendOSCmessage"`
- `raspIP`
- `OSCMessage`
- `OSCValue`

Le serveur se charge de la conversion OSC.

### Etape 4.3 - Cote recepteur (Raspberry/PureData)

Deux options:

1. **PureData**: patch qui route `/play`, `/level`, etc.
2. **Node sur Raspberry**: socket OSC qui traite les adresses et execute des actions.

Choisis une seule voie en prod pour eviter les comportements ambigus.

---

## 5) Ajouter le transfert de sons

### Etape 5.1 - Separation des responsabilites

- **transfert** (copie fichier): SCP/SSH
- **lecture** (play): OSC ou commande locale

Ne pas melanger les 2 dans une meme commande si tu veux un systeme robuste.

### Etape 5.2 - Mise en oeuvre

Depuis le serveur:

- `scp` le fichier vers le Raspberry cible
- stocke dans un dossier connu (ex: `/home/pi/PureData/`)

Puis declenche la lecture via:

- message OSC (`/play`, `/test`, etc.) ou
- moteur audio local

---

## 6) Gérer le mode playlist / next / shuffle (recommandation)

Pour eviter le bug "toujours le meme titre":

### Etat a conserver

- `currentTrackIndex`
- `playlist[]`
- `shuffleEnabled`

### Algorithme Next

- **shuffle OFF**: `nextIndex = (currentTrackIndex + 1) % playlist.length`
- **shuffle ON**:
  - choisir un index aleatoire dans `[0, n-1]`
  - interdire `nextIndex === currentTrackIndex`
  - si playlist de 1 element: rester sur l'unique morceau

Pseudo-code:

```js
function getNextIndex(current, total, shuffle) {
  if (total <= 1) return 0;
  if (!shuffle) return (current + 1) % total;

  let next = current;
  while (next === current) {
    next = Math.floor(Math.random() * total);
  }
  return next;
}
```

---

## 7) Journalisation et observabilite

Ajoute des logs clairs:

- connexion/deconnexion Raspberry
- heartbeat envoye/recu
- OSC envoye (adresse + args + IP)
- echec transfert SCP
- transitions d'etat UI (OK/BAD)

But: diagnostiquer vite sans ouvrir 20 fichiers.

---

## 8) Plan de tests minimal (obligatoire)

### Test A - Presence reseau

1. demarrer serveur + UI
2. connecter 1 Raspberry
3. verifier passage rouge -> vert
4. couper le client Raspberry
5. verifier retour vert -> rouge

### Test B - OSC

1. envoyer `/level` avec valeur
2. verifier reception cote Raspberry/PureData
3. verifier effet attendu (volume, trigger, etc.)

### Test C - Fichier son

1. envoyer un WAV
2. verifier qu'il est bien copie sur Raspberry
3. declencher play
4. verifier son audible

### Test D - Playlist Next/Shuffle

1. choisir un titre non premier
2. cliquer `suivant` en shuffle OFF -> titre suivant exact
3. activer shuffle ON -> titre aleatoire
4. verifier absence de repetition immediate

---

## 9) Erreurs classiques a eviter

- Confondre "fichier copie" et "fichier joue"
- Avoir deux clients Raspberry actifs en parallele (logique double)
- Ne pas synchroniser la source de verite de l'etat (serveur)
- Oublier la validation des inputs UI
- Ne pas traiter le cas playlist a 1 seul morceau

---

## 10) Checklist de mise en prod

- [ ] une seule logique client Raspberry choisie
- [ ] ports WS/OSC figes et documentes
- [ ] heartbeat stable (tempo + timeout adequats)
- [ ] logs lisibles
- [ ] tests A/B/C/D valides
- [ ] guide d'exploitation (redemarrage, diagnostic, rollback)

---

## Architecture cible (resume ultra court)

- `config.json`: inventaire machines
- `ipConfig.json`: ports/adresses
- `wsServeur.js`: orchestration centrale
- `controleur.js`: interface et commandes
- `rasp.js` ou `raspSkini.js`: execution cote Raspberry
- `PureData`: interpretation OSC audio (si utilise)

Si tu appliques ces 10 sections dans cet ordre, tu peux reproduire la meme architecture dans une autre app avec peu d'ambiguite.
