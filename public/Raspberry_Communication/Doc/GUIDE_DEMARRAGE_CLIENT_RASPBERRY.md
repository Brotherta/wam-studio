# Demarrage auto du client Raspberry

Si aucun Raspberry ne se connecte, le serveur WS attend indefiniment.
Il faut executer un client sur chaque Raspberry.

## 1) Copier le client sur le Raspberry

Fichier a copier:

- `public/Raspberry_Communication/RaspberryClientAutoConnect.js`

## 2) Installer la dependance `ws` sur le Raspberry

```bash
npm install ws
```

## 3) Lancer manuellement pour test

```bash
RASPBERRY_SERVER_IP=192.168.1.2 RASPBERRY_SERVER_PORT=8383 node RaspberryClientAutoConnect.js
```

Tu dois voir:

- `[RaspberryClient] Connecte au serveur.`

Et cote serveur:

- logs `ws:connection`
- logs `handleMessage:received` avec `raspberryOpen` puis `raspberryAlive`

## 4) Lancer automatiquement au boot (systemd)

Creer `/etc/systemd/system/raspberry-ws-client.service`:

```ini
[Unit]
Description=Raspberry WS Client Auto Connect
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/raspberry-client
Environment=RASPBERRY_SERVER_IP=192.168.1.2
Environment=RASPBERRY_SERVER_PORT=8383
ExecStart=/usr/bin/node /home/pi/raspberry-client/RaspberryClientAutoConnect.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Puis:

```bash
sudo systemctl daemon-reload
sudo systemctl enable raspberry-ws-client
sudo systemctl start raspberry-ws-client
sudo systemctl status raspberry-ws-client
```

## 5) Verifications rapides

- Sur le serveur: bouton Raspberry passe au vert si runtime actif.
- Dans la fenetre Search Raspberry: IP visible, etat passe en ligne.
- Si tu coupes le service sur le Raspberry: retour hors ligne apres timeout heartbeat.
