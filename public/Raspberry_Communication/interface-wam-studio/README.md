# Dossier `interface-wam-studio/` — fenêtre Search Raspberry

Modules de l’interface WAM (navigateur), regroupés par rôle.

```
interface-wam-studio/
├── connexion/       WebSocket + API HTTP de lancement
├── messages/        Parseur et extracteurs des messages serveur
├── panneaux/        Liste, OSC, parc DHCP, ajout, stats, navigation
└── utilitaires/     Chemins Open DHCP (INI)
```

| Dossier | Fichiers |
|---------|----------|
| `connexion/` | `SearchRaspberryConnexionWebSocket.ts`, `SearchRaspberryLancementServeur.ts` |
| `messages/` | `SearchRaspberryExtracteursChampsMessage.ts`, `SearchRaspberryHoteApplicateurMessages.ts`, `SearchRaspberryParseurMessagesServeur.ts` |
| `panneaux/` | `SearchRaspberryNavigation.ts`, `SearchRaspberryPanneauListe.ts`, `SearchRaspberryPanneauOsc.ts`, `SearchRaspberryPanneauParcDhcp.ts`, `SearchRaspberryPanneauAjout.ts`, `SearchRaspberryPanneauStats.ts` |
| `utilitaires/` | `SearchRaspberryUtilitairesOpenDhcp.ts` |

Point d’entrée UI : `SearchRaspberryFeature.ts` (parent).
