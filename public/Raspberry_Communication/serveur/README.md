# Dossier `serveur/` — organisation

Modules du runtime Raspberry (Node.js), regroupés par rôle.

```
serveur/
├── point-entree/      Orchestration (état, lancement WS, câblage)
├── configuration/     Ports, délais (constantes partagées)
├── reseau/            Ping, ARP, vérification de port
├── osc/               Encodage et envoi UDP OSC
├── parc/              Parc Raspberry et Open DHCP
├── presence/          Heartbeat, liste en ligne, diffusion vers l'UI
└── websocket/         Connexions WS et routeur de messages
```

**API publique** (depuis la racine `Raspberry_Communication/`) :

- `RaspberryRuntime.js` → `startRaspberryRuntime()`, `getRaspberryRuntimeStatus()`
- `RaspberryRuntimeCompatLegacy.js` — alias historique (même export)

Voir aussi `../interface-wam-studio/README.md` pour la partie fenêtre WAM.
