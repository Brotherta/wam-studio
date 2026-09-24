# Recap session — fil Raspberry / WAM Studio

Le fichier complet des phases 1–33 n’était plus présent sur le disque (dossier `Doc/` réduit aux schémas PNG). Cette entrée reprend le fil à partir de la demande **Mac + Windows**.

## Sommaire

1. [Phase 34 — Compatible Mac et Windows](#1-phase-34--compatible-mac-et-windows)
2. [Phase 35 — Pedalboard2 watch/build Mac et Windows](#2-phase-35--pedalboard2-watchbuild-mac-et-windows)
3. [Fichiers principaux](#3-fichiers-principaux)
4. [Parcours utilisateur](#4-parcours-utilisateur)
5. [Pistes non traitees](#5-pistes-non-traitees)

---

## 1. Phase 34 — Compatible Mac et Windows

### Demande

Vérifier l’état du projet : un fichier avait été adapté pour Windows, au détriment de macOS. WAM Studio doit fonctionner **sur Mac et sur Windows**.

### Comportement avant

Dans `public/Raspberry_Communication`, la découverte / le sondage des Raspberry étaient **Windows-only** :

- ping hardcodé `ping -n 1 -w …` (syntaxe Windows ; sur Mac la bonne forme est `ping -c 1`)
- succès ping testé seulement avec `TTL=` (Windows) et pas `ttl=` (macOS / Linux)
- table ARP parsée uniquement au format Windows (`IP` puis MAC), pas le format macOS `(IP) at MAC`
- port en écoute : Windows `netstat`, sinon `ss` (Linux). **macOS n’a généralement pas `ss`** → l’agent de transfert (port 3100) n’était pas détecté sur Mac

Le lancement webpack (`public/package.json`) et l’agent (`spawn npm` + `shell: true`) restent agnostiques.

Hors dossier Raspberry : `bank/pedalboard2/package.json` avait `watch: tsc -w` (Windows) et `build` en `./tsc` (Mac). Corrigé en phase 35.

### Correction

Le serveur Raspberry choisit la commande selon l’OS :

| Action | Windows | macOS | Linux |
|--------|---------|-------|-------|
| Ping | `ping -n 1 -w ms` | `ping -c 1 -W ms` | `ping -c 1 -W s` |
| Ping OK | `TTL=` | `ttl=` / `bytes from` | idem |
| ARP | `IP  MAC` | `(IP) at MAC` | idem Unix |
| Port 3100 | `netstat -ano` | `lsof -iTCP:LISTEN` | `ss`, sinon `lsof` |

### Fichiers clés

| Fichier | Rôle |
|---------|------|
| `serveur/reseau/RaspberryServeurCommandesOs.js` | `commandePing` / `pingAReussi` |
| `serveur/reseau/RaspberryServeurSondageReseau.js` | Sondage IP Mac + Windows |
| `serveur/reseau/RaspberryServeurDecouverteReseau.js` | Scan sous-réseau + parse ARP |
| `serveur/reseau/RaspberryServeurVerificationPort.js` | Détection port agent |
| `agent-transfert/tests/commandesOsReseau.test.ts` | Ping et ARP des deux OS |

---

## 2. Phase 35 — Pedalboard2 watch/build Mac et Windows

### Demande

Les scripts `watch` / `build` (premier lancement de la bank) doivent marcher comme sous Windows, **et** sous Mac.

### Comportement

- Avant : `watch` = `tsc -w` (PATH Windows), `build` = `./tsc` (Unix/Mac seulement). TypeScript est dans `server/`, pas à la racine Pedalboard2.
- Après : `node server/node_modules/typescript/bin/tsc --project .` — même binaire, Mac et Windows, sans `./tsc` ni `tsc` global.

| Fichier | Rôle |
|---------|------|
| `bank/pedalboard2/package.json` | `watch`, `start`, `build` |

---

## 3. Fichiers principaux

- `serveur/reseau/RaspberryServeurCommandesOs.js` — commandes ping par OS
- `serveur/reseau/RaspberryServeurSondageReseau.js` — ping + ARP d’une IP
- `serveur/reseau/RaspberryServeurDecouverteReseau.js` — découverte du parc
- `serveur/reseau/RaspberryServeurVerificationPort.js` — port agent 3100
- `AgentTransfertRuntime.js` — `npm run dev` via `shell: true` (Mac et Windows)

---

## 4. Parcours utilisateur

1. Lancer WAM Studio (`npm start` dans `public/`) sur **Mac ou Windows**.
2. Le serveur Raspberry ping le parc avec la syntaxe de l’OS.
3. Les machines apparaissent (vert/rouge) si ping/ARP répondent.
4. L’agent de transfert (3100) est détecté via `netstat` (Windows) ou `lsof` (Mac).

---

## 5. Pistes non traitees

- OpenDHCP (`C:/OpenDHCPServer`) reste un outil Windows optionnel.
