# Guide de fonctionnement de l'application

Ce document explique l'architecture de l'application, les composants principaux, les flux de communication, et des exemples concrets pour comprendre rapidement "qui parle a qui" et "comment".

---

## Vue d'ensemble

L'application repose sur trois briques principales:

- un **serveur central Node.js** (`cirmrasp/serveur/wsServeur.js`)
- un **controleur web** (UI) (`cirmrasp/clients/controleur/controleur.js`)
- un **client sur chaque Raspberry** (`cirmrasp/clients/raspberry/rasp.js`, ou variante `cirmrasp/raspSkini.js`)

Les protocoles utilises:

- **WebSocket (WS)** pour le controle/etat (UI <-> serveur <-> Raspberry)
- **OSC sur UDP** pour les commandes audio/temps reel
- **SCP/SSH** pour transferer des fichiers son vers un Raspberry

---

## 1) Communication avec une adresse physique et un Raspberry (enceinte)

### Ou se trouvent les informations

- **Mapping parc physique (IP/MAC/modele/etc.)**: `config.json`
- **Configuration reseau/ports**: `cirmrasp/serveur/ipConfig.json`
- **Serveur WS et gestion de presence**: `cirmrasp/serveur/wsServeur.js`
- **Client WS sur Raspberry**: `cirmrasp/clients/raspberry/rasp.js`

### Comment ca fonctionne

1. Au demarrage, le serveur lit `config.json` et genere `raspConfig` via `makeRaspConfig()`.
2. Un Raspberry se connecte au serveur WS et envoie:
   - `type: "raspberryOpen"`
   - `raspIP: "<ip_du_raspberry>"`
3. Toutes les ~4 secondes (`tempoCheck`), le serveur envoie:
   - `type: "isRaspAlive"`
4. Chaque Raspberry repond:
   - `type: "raspberryAlive"`
   - `raspIP`
   - `info` (memoire totale/libre)
5. Le serveur maintient `raspList` + `aliveCounter`.
   - si un Raspberry ne repond plus pendant plusieurs cycles, il est retire de `raspList`.

### Exemple de flux (heartbeat)

- Serveur -> Raspberry: `{"type":"isRaspAlive"}`
- Raspberry -> Serveur:
  `{"type":"raspberryAlive","raspIP":"192.168.1.43","info":"Memory: ..."}`

---

## 2) Envoi des requetes OSC pour charger un son et le lancer

### Ou se trouvent les informations

- **UI controleur (envoi des commandes)**: `cirmrasp/clients/controleur/controleur.js`
- **Emission OSC UDP**: `cirmrasp/serveur/wsServeur.js` (`sendOSCmessage`)
- **Port OSC**: `cirmrasp/serveur/ipConfig.json` (`OSCPort: 4000`)
- **Variante Node pour audio pilote OSC**: `cirmrasp/raspSkini.js`
- **Variante PureData**: `PureData/compositions/skini/_load.pd`

### Important: "charger" n'est pas "lancer"

Dans ce projet, **charger/copier un son** et **lancer sa lecture** sont 2 operations differentes:

- **Chargement/copie fichier son**:
  - fait par `sendSoundFile` dans `wsServeur.js`
  - transfert via `scp` vers le Raspberry
  - ce n'est **pas** une commande OSC

- **Lancement lecture**:
  - soit via OSC vers PureData (`route play`, etc.)
  - soit via `raspSkini.js` (message OSC `/test`, puis `aplay sonX.wav` aligne sur Ableton Link)

### Chaine d'envoi OSC (cas standard)

1. Dans le controleur web, l'utilisateur envoie `sendOSCmessage`.
2. Le controleur envoie au serveur WS:
   - `type: "sendOSCmessage"`
   - `raspIP`
   - `OSCMessage`
   - `OSCValue`
3. Le serveur convertit en paquet OSC:
   - adresse OSC: `"/" + OSCMessage`
   - arguments: conversion des valeurs en entiers
4. Le serveur envoie en UDP au Raspberry sur `OSCPort`.

### Exemples

- Message UI -> serveur:
  `{"type":"sendOSCmessage","raspIP":"192.168.1.43","OSCMessage":"level","OSCValue":"80"}`

- Emission OSC resultante:
  - Adresse: `/level`
  - Args: `[80]` (selon format attendu)

---

## 3) Etat adresse physique <-> Raspberry (rouge / vert)

### Ou se trouvent les informations

- **Logique UI de mise a jour**: `cirmrasp/clients/controleur/controleur.js` (`refreshListRasp`)
- **Styles rouge/vert**: `cirmrasp/clients/controleur/styleControleur.css`
- **Source de verite "Raspberry connectes"**: `cirmrasp/serveur/wsServeur.js`

### Comment ca fonctionne

1. Au demarrage du controleur, le serveur envoie `raspConfig` (liste attendue, issue de `config.json`).
2. A chaque cycle, le serveur envoie `raspList` (liste reelle des Raspberry vivants).
3. Dans `refreshListRasp`:
   - on met d'abord tous les boutons en **BAD** (rouge)
   - puis on passe en **OK** (vert) les IP presentes dans `raspList`
4. Si un Raspberry ne repond plus au heartbeat, il disparait de `raspList`, donc repasse rouge dans l'UI.

### Mapping visuel

- `raspButtonBAD` -> rouge (`#b43d3d`)
- `raspButtonOK` -> vert

---

## Point d'attention architecture (important)

Il existe **deux logiques client cote Raspberry**:

1. `cirmrasp/clients/raspberry/rasp.js`
   - WS, heartbeat, reboot/shutdown, etc.
2. `cirmrasp/raspSkini.js`
   - WS + OSC + lecture audio (`aplay`) + synchro Ableton Link

Et dans `wsServeur.js`, la commande `restartNode` relance:

- `clients/raspberry/rasp.js`

Cela veut dire que pour la partie "play audio par OSC", il faut verifier quel client est reellement lance en production.

---

## Parcours type de bout en bout

### Cas A: supervision des Raspberry

1. Le controleur web se connecte (`startControleur`).
2. Le serveur envoie `raspConfig`.
3. Les Raspberry envoient `raspberryOpen`, puis `raspberryAlive`.
4. Le serveur publie `raspList`.
5. L'UI colore rouge/vert selon la presence.

### Cas B: envoyer une commande OSC a un Raspberry

1. L'utilisateur choisit un Raspberry dans l'UI.
2. Il envoie `sendOSCmessage`.
3. Le serveur transforme en OSC/UDP.
4. Le Raspberry (ou PureData) recoit la commande et agit.

### Cas C: envoyer un fichier son

1. L'UI envoie `sendSoundFile` au serveur.
2. Le serveur copie le WAV via `scp` vers le Raspberry cible.
3. Un mecanisme separé lance ensuite la lecture (OSC/PureData/Node selon setup).

---

## Fichiers a connaitre en priorite

- `config.json`
- `cirmrasp/serveur/ipConfig.json`
- `cirmrasp/serveur/wsServeur.js`
- `cirmrasp/clients/controleur/controleur.js`
- `cirmrasp/clients/controleur/styleControleur.css`
- `cirmrasp/clients/raspberry/rasp.js`
- `cirmrasp/raspSkini.js`
- `PureData/compositions/skini/_load.pd`

---

## Conseils pratiques de debug

- Si tout reste rouge:
  - verifier que les Raspberry envoient `raspberryAlive`
  - verifier IP/ports (`ipConfig.json`)
- Si OSC ne declenche rien:
  - verifier que le destinataire ecoute sur `OSCPort`
  - verifier format de `OSCValue` attendu
- Si le son est copie mais pas lu:
  - separer test "transfert OK" vs "commande play OK"
  - confirmer quel client Raspberry tourne vraiment (`rasp.js` vs `raspSkini.js`)

---

## Resume express

- **WS** = supervision/commandes systeme
- **OSC** = commandes audio temps reel
- **SCP** = transfert des fichiers son
- **Rouge/vert** = derive de `raspList` (presence heartbeat)
