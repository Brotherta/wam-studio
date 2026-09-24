# Agent de transfert local

Passerelle entre WAM Studio (navigateur) et les Raspberry Pi via HTTP + Socket.IO + SCP.

## Convention fichiers sur chaque Raspberry

- Dossier : `/home/pi/modulePre/PureData/compositions/skini/sons/`
- Un son WAM : `son500.wav` (Skini lit `/play 500`)
- Variante : `son500-1.wav`

Le SCP utilise une ecriture **atomique** : `fichier.part` puis renommage en fichier final.

## Upload HTTP (Phase 3)

```bash
curl -F "file=@mon-son.wav" http://localhost:3100/upload
```

Reponse quand le fichier est recu et valide :

```json
{ "transferId": "...", "filename": "mon-son.wav", "size": 123456 }
```

Aucun SCP n'est lance automatiquement. La progression upload est envoyee via Socket.IO (`phase: "upload"`).

## Socket.IO (Phase 4)

Commandes via `socket.emit("command", ...)` :

```json
{ "type": "startTransfer", "transferId": "...", "raspberryId": 74, "sonNumber": 3, "varianteIndex": 1 }
{ "type": "cancelTransfer", "transferId": "..." }
{ "type": "deleteTransfer", "transferId": "..." }
```

Abonnement / reconnexion : `socket.emit("subscribe", { transferId })` renvoie `transfer:snapshot` avec l'etat courant.

### Chemin distant personnalise

Dans `startTransfer`, le champ optionnel `remotePath` permet de specifier le **chemin absolu complet** sur le Pi (prioritaire sur la convention) :

```json
{
  "type": "startTransfer",
  "transferId": "...",
  "remotePath": "/home/pi/mon-dossier/mon-son.wav",
  "authMode": "key",
  "sshHost": "192.168.1.74"
}
```

Sans `remotePath` (usage WAM), la convention `son{numero}` dans `skini/sons/` s'applique (`raspberryId` + `sonNumber` requis, numero WAM par defaut 500).

En phase 4, `startTransfer` declenchait une simulation. En **phase 5**, le SCP reel utilise ssh2/SFTP avec ecriture atomique (`.part` puis rename).

### Authentification SSH

Deux modes supportes via `authMode` :

- `key` : `privateKeyPath` (+ `passphrase` optionnelle, jamais memorisee)
- `password` : `sshPassword` (uniquement en memoire, jamais sur disque)

Parametres memorisables dans `config.local.json` : `sshHost`, `sshPort`, `sshLogin`, `privateKeyPath`.

## Client Web de test (Phase 6)

Interface complete sur http://localhost:3100/ :

- Formulaire SSH (cle / mot de passe) avec bascule automatique
- Selection fichier (nom, taille, type)
- Bouton **Envoyer** : upload HTTP → progression upload → `startTransfer` → progression SCP
- Barres de progression independantes (upload / SCP) avec debit et temps restant
- Journal horodate, bandeaux succes/erreur, reconnexion Socket.IO

Le client genere un `transferId` avant l'upload (`X-Transfer-Id`) pour recevoir la progression des la reception.

## Integration WAM Studio (Phase 7)

Le transfert est aussi disponible dans la fenetre **Search Raspberry** de WAM Studio :

- Panneau **Transfert audio** sous OSC (selection d'un Raspberry requis)
- Reutilise l'agent local sur http://localhost:3100 (lancer `npm run dev` dans ce dossier)
- Code client WAM : `../Controllers/agent-transfert/` et `../Views/panneaux/SearchRaspberryPanneauTransfert.ts`

## Demarrage

```bash
cd public/Raspberry_Communication/agent-transfert
npm install
npm run dev
```

- API : http://localhost:3100/health
- Client de test : http://localhost:3100/

## Phases (SPEC-Agent-Transfert.md)

| Phase | Statut |
|-------|--------|
| 1 Architecture | OK |
| 2 Projet TS + Express + Socket.IO | OK |
| 3 Upload HTTP | OK |
| 4 Socket.IO commandes | OK |
| 5 SCP atomique | OK |
| 6 Client Web complet | OK |
| 7 Branchement WAM progressif | A faire |

## Commande startTransfer (extension prevue)

```json
{
  "type": "startTransfer",
  "transferId": "...",
  "raspberryId": 74,
  "sonNumber": 3,
  "varianteIndex": 1
}
```
