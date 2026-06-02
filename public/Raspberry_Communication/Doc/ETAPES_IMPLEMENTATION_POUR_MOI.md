# Etapes que je vais suivre pour implementer l'architecture Raspberry WS/OSC

Ce document liste, dans l'ordre, les actions que je vais faire pour reussir l'implementation de ce qui est demande dans `TUTO_REFAIRE_ARCHITECTURE_RASPBERRY_WS_OSC.md`.

## 1) Cadrer l'implementation

1. Lire et valider le perimetre fonctionnel (WS, OSC/UDP, SCP, UI, heartbeat).
2. Identifier les fichiers cibles a creer pour le serveur, l'UI et le client Raspberry.
3. Choisir la voie de lecture audio en production (PureData ou Node Raspberry) pour eviter les doubles logiques.

## 2) Poser les bases de configuration

1. Creer/valider `config.json` pour l'inventaire des machines.
2. Creer/valider `ipConfig.json` pour les ports/adresses WS et OSC.
3. Definir les conventions de nommage et les valeurs par defaut (timeouts, tempo heartbeat, ports).

## 3) Implementer le serveur central WebSocket

1. Initialiser le serveur WS et le routage des messages.
2. Charger `config.json` au demarrage et produire `raspConfig`.
3. Gerer `raspberryOpen` pour enregistrer/mettre a jour les Raspberry connectes.
4. Mettre en place la structure `raspList` avec `aliveCounter` et metadonnees systeme.

## 4) Mettre en place le heartbeat et l'etat temps reel

1. Envoyer periodiquement `isRaspAlive`.
2. Traiter `raspberryAlive` et rafraichir `aliveCounter`.
3. Retirer les Raspberry inactifs apres timeout.
4. Publier `raspList` vers l'UI a chaque cycle.

## 5) Ajouter les commandes serveur vers Raspberry

1. Implementer les commandes de controle (`rebootRaspberry`, `shutdownRaspberry`, `restartNode`).
2. Implementer `sendSoundFile` avec gestion d'erreur SCP.
3. Implementer `sendOSCmessage` et la conversion des arguments au bon type OSC.

## 6) Construire l'UI controleur

1. Afficher la liste attendue depuis `raspConfig`.
2. Afficher l'etat reel depuis `raspList` (BAD rouge par defaut, OK vert si present).
3. Ajouter les actions UI: selection Raspberry, envoi OSC, envoi fichier, reboot/shutdown.
4. Ajouter la validation des champs avant envoi.

## 7) Connecter la couche OSC/UDP

1. Finaliser la fonction d'emission OSC cote serveur (adresse + args).
2. Verifier la reception cote cible (PureData ou client Node Raspberry).
3. Normaliser les adresses OSC utilisees (`/play`, `/level`, etc.).

## 8) Implementer la lecture audio et la logique playlist

1. Separer strictement transfert de fichier et lecture.
2. Implementer la logique Next/Shuffle avec etat `currentTrackIndex`, `playlist`, `shuffleEnabled`.
3. Gerer les cas limites (playlist vide ou 1 seul titre).

## 9) Ajouter l'observabilite

1. Journaliser connexions/deconnexions Raspberry.
2. Journaliser heartbeat emis/recus.
3. Journaliser commandes OSC envoyees et erreurs SCP.
4. Journaliser les changements d'etat UI (OK/BAD).

## 10) Executer le plan de tests minimal

1. Test A (presence reseau): verifier transition rouge/vert puis vert/rouge.
2. Test B (OSC): verifier reception et effet attendu.
3. Test C (fichier son): verifier copie puis lecture.
4. Test D (playlist): verifier Next en mode normal et Shuffle sans repetition immediate.

## 11) Verrouiller la livraison

1. Valider la checklist de mise en production.
2. Documenter les ports, commandes de redemarrage et procedure de diagnostic.
3. Finaliser avec un guide d'exploitation et un plan de rollback simple.
