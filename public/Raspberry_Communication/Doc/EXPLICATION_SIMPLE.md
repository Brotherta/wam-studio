# Raspberry_Communication — explication simple

Ce dossier sert à **voir et piloter des Raspberry Pi** depuis l’application WAM Studio, sur le même réseau local (par exemple en salle de concert ou en atelier).

L’idée générale : l’ordinateur qui fait tourner WAM Studio **sait quels Raspberry sont allumés et connectés**, et peut leur **envoyer des ordres** (surtout pour l’audio, via un protocole appelé OSC).

---

## En une phrase

On a ajouté un **petit système de supervision** : une fenêtre dans WAM Studio, un **programme serveur** sur le PC, et un **petit programme** à installer sur chaque Raspberry pour qu’il se signale tout seul.

---

## Les 3 pièces du puzzle

Imaginez trois interlocuteurs qui se parlent en permanence :

```
┌─────────────────────┐         ┌─────────────────────┐         ┌─────────────────────┐
│   WAM Studio        │  ◄──►   │   Le serveur          │  ◄──►   │   Chaque Raspberry  │
│   (votre écran)     │         │   (sur le PC)         │         │   (petit boîtier)   │
└─────────────────────┘         └─────────────────────┘         └─────────────────────┘
     Fenêtre « Search              Garde la liste des              Se connecte et dit :
     Raspberry »                   machines en ligne               « Je suis là »
```

| Pièce | Rôle en langage courant |
|-------|-------------------------|
| **WAM Studio** | Vous voyez une liste de Raspberry : **vert = connecté**, **rouge = absent ou coupé**. Vous pouvez lancer le serveur et envoyer des commandes. |
| **Le serveur** (sur le PC) | Il reçoit les connexions, vérifie régulièrement que les Raspberry répondent encore, et transmet vos ordres (notamment OSC vers l’audio). |
| **Le client sur le Raspberry** | Au démarrage, il se connecte au PC et envoie son adresse IP, sa carte réseau et quelques infos (mémoire, processeur). |

---

## Comment ça marche, étape par étape

1. **Vous ouvrez WAM Studio** et lancez le serveur Raspberry (bouton dédié ou API de lancement).
2. **Le serveur démarre** et écoute sur le réseau (port WebSocket **8383**).
3. **Sur chaque Raspberry**, on lance le fichier `RaspberryClientAutoConnect.js` (à la main pour tester, ou au démarrage du Pi pour la prod).
4. Le Raspberry **se présente** au serveur : « Bonjour, je suis l’IP 192.168.1.74 ».
5. **Toutes les 4 secondes**, le serveur demande : « Tu es toujours là ? ». Le Raspberry répond. S’il ne répond plus pendant environ **12 secondes**, il est considéré **hors ligne**.
6. **L’interface se met à jour** : les machines connectées passent au vert, les autres au rouge.
7. Si vous envoyez une **commande OSC** (volume, lecture, etc.), le serveur la **transmet en UDP** vers le Raspberry choisi.

C’est le même principe qu’un **appel de présence** régulier : tant que le Raspberry répond, on l’affiche en ligne.

---

## Que contient le dossier ? (fichiers principaux)

### Programmes qui font tourner le système

| Fichier | À quoi il sert (simplement) |
|---------|------------------------------|
| `serveur/point-entree/RaspberryServeurPointEntree.js` | **Le cerveau sur le PC** : assemble les modules `serveur/*` (WebSocket, heartbeat, OSC, parc DHCP, ping). |
| `RaspberryRuntime.js` | Point d’entrée court : réexporte le serveur ci-dessus (utilisé par `server.js` et le dev webpack). |
| `RaspberryRuntimeCompatLegacy.js` | Alias historique (même contenu que `RaspberryRuntime.js`). |
| `RaspberryClientAutoConnect.js` | **À copier sur chaque Raspberry** : se connecte au PC, envoie sa présence, répond au heartbeat, se reconnecte si le réseau coupe. |
| `Raspberry.ts` | **Modèle de données** pour l’interface : IP, MAC, en ligne ou non, infos système, etc. |
| `SearchRaspberryFeature.ts` | **La fenêtre dans WAM Studio** : liste colorée, détails, bouton de lancement du serveur, formulaire pour envoyer des commandes OSC. |

### Documentation (dossier `Doc/`)

| Fichier | Contenu |
|---------|---------|
| `EXPLICATION_SIMPLE.md` | Ce document. |
| `GUIDE_DEMARRAGE_CLIENT_RASPBERRY.md` | Comment installer et lancer le client sur un Raspberry. |
| `GUIDE_FONCTIONNEMENT_APPLICATION.md` | Fonctionnement détaillé (projet de référence + principes). |
| `DOC_RECONNAISSANCE_RASPBERRY_ET_HEARTBEAT.md` | Analyse technique du ancien projet *cirmrasp*. |
| Autres guides | Tutoriels, plan d’étapes, segmentation pour rapport de stage. |

---

## Ce qui fonctionne aujourd’hui

- Voir **quels Raspberry sont en ligne** (vert / rouge).
- **Lancer le serveur** depuis WAM Studio.
- **Connexion automatique** d’un Raspberry vers le PC (avec reconnexion si coupure).
- **Heartbeat** : détection automatique quand un Raspberry s’éteint ou perd le réseau.
- **Repérage réseau** côté PC (ping, adresse MAC via la table ARP) pour enrichir l’affichage.
- **Envoi de commandes OSC** vers un Raspberry ou vers tous ceux qui sont en ligne.
- **Compteurs** côté serveur (nombre de connexions, heartbeats, messages OSC envoyés).

---

## Ce qui n’est pas encore fait (ou seulement en partie)

| Fonctionnalité | Situation |
|----------------|-----------|
| Redémarrer ou éteindre un Raspberry depuis l’interface | Prévu dans le code client, mais pour l’instant ce n’est qu’un message dans les logs (pas de `sudo reboot` réel). |
| Envoyer un fichier son sur le Raspberry (copie SCP) | Pas encore implémenté dans ce module. |
| Faire jouer le son automatiquement sur le Pi | L’envoi OSC est prêt côté PC ; il faut encore le logiciel audio qui écoute sur le Raspberry. |
| Gestion de playlist (suivant, aléatoire) | Prévu dans l’architecture globale, pas dans ce dossier. |

---

## Mots utiles (définitions courtes)

| Mot | Signification simple |
|-----|----------------------|
| **WebSocket (WS)** | Canal de communication **en continu** entre le navigateur / WAM Studio et le serveur sur le PC (comme une ligne téléphonique ouverte). |
| **Heartbeat** | Petit signal régulier pour dire « je suis vivant ». |
| **OSC** | Format de messages utilisé en audio / scène pour dire par exemple « monte le volume » ou « joue ce son ». Ici, le PC envoie ces messages en UDP vers le Raspberry. |
| **IP** | Adresse du Raspberry sur le réseau (ex. `192.168.1.74`). |
| **MAC** | Identifiant de la carte réseau du Raspberry. |

---

## Gerer le parc Raspberry (Open DHCP)

Dans la fenetre **Search Raspberry**, seuls des **boutons** sont visibles au depart:

- **Liste Raspberry** : affiche les machines (vert/rouge). Recliquer sur la meme ligne masque les details.
- **Parc / DHCP** : scan INI, selection du parc a ecouter.
- **Ajouter** : dossier Open DHCP (emplacement du .ini), puis formulaire MAC + IP.
- **Infos serveur** : compteurs techniques (affiches seulement si vous ouvrez ce bouton).

Recliquer sur un bouton actif le ferme. Le panneau permet aussi de:

1. Saisir le **dossier** qui contient `OpenDHCPServer.ini` (ex. `C:/OpenDHCPServer/`). Si le champ est vide au scan, ce chemin par defaut est utilise.
2. Cliquer **Scanner le INI** : le programme parcourt le dossier, trouve le fichier `.ini` (souvent `OpenDHCPServer.ini`), puis le lit.
3. Les Raspberry **deja dans le INI** apparaissent en **gris**, non cliquables, mais bien visibles et toujours ecoutes.
4. Les autres lignes (hors INI) restent selectionnables avec Ctrl+clic.
5. Section **Ajouter un Raspberry** : saisir MAC + IP, puis **Ajouter au INI et a la liste** (ecrit dans le fichier .ini et ajoute a la supervision).
6. Bouton **Infos serveur** : affiche les compteurs techniques seulement si vous en avez besoin.
7. Cliquer **Appliquer la selection** pour enregistrer et reecrire le INI :
   - met a jour `raspberry-parc.json` ;
   - reecrit le INI (sauvegarde `.bak`) avec une section `[adresse-mac]` et `IP=192.168.1.X` par Raspberry choisi ;
   - met a jour la liste ecoutee par le serveur WebSocket.

Regle reseau: le Raspberry numero **15** utilise l'IP **192.168.1.15** (dernier chiffre = numero).

---

## Utilisation rapide (pour tester)

**Sur le PC (WAM Studio)**

1. Démarrer l’application comme d’habitude.
2. Ouvrir la fenêtre de recherche / supervision Raspberry.
3. Lancer le serveur Raspberry (bouton prévu dans l’interface).
4. Vérifier que la liste affiche les IP attendues (par défaut `192.168.1.74` et `192.168.1.75`).

**Sur le Raspberry**

1. Copier `RaspberryClientAutoConnect.js` sur le Pi.
2. Installer la librairie : `npm install ws`
3. Lancer par exemple :
   ```bash
   RASPBERRY_SERVER_IP=192.168.1.2 RASPBERRY_SERVER_PORT=8383 node RaspberryClientAutoConnect.js
   ```
   (remplacer `192.168.1.2` par l’IP du PC qui héberge WAM Studio)

4. Dans les logs du client : `[RaspberryClient] Connecte au serveur.`
5. Dans WAM Studio : la ligne correspondante doit passer **au vert**.

Pour un démarrage automatique au boot du Raspberry, voir `Doc/GUIDE_DEMARRAGE_CLIENT_RASPBERRY.md`.

---

## Pourquoi tout est dans un seul dossier ?

Pour **séparer clairement** cette fonctionnalité du reste de WAM Studio : tout ce qui concerne la communication avec les Raspberry est regroupé ici. Cela facilite la maintenance, la documentation et les tests sans mélanger avec le code audio WAM principal.

---

## Schéma résumé

```
Vous (WAM Studio)
       │
       │  « Qui est en ligne ? » / « Envoie cette commande OSC »
       ▼
Serveur sur le PC (serveur/point-entree/RaspberryServeurPointEntree.js)
       │
       │  « Tu es là ? » / messages OSC
       ▼
Raspberry 1, Raspberry 2, … (RaspberryClientAutoConnect.js)
```

---

*Si vous avez besoin de plus de détails techniques, consultez les autres fichiers dans `Doc/`. Ce document reste volontairement simple et accessible à tous.*
