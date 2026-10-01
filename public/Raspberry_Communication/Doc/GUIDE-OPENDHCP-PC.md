# Donner les adresses aux Raspberry depuis l’ordinateur de test

Ce DHCP ne fait pas partie de WAM Studio. WAM ne le lance pas. Il tourne sur l’ordinateur branché au switch de test, à côté du projet.

Chez le client, c’est déjà son serveur qui distribue les adresses. On n’installe pas ce DHCP sur le Raspberry.

L’ordinateur écoute en `192.168.1.10`. Il donne ensuite des adresses fixes :

| Machine | Adresse | Adresse matérielle Ethernet |
| --- | --- | --- |
| Raspberry son 74 | `192.168.1.74` | `e4:5f:01:f8:0b:8c` |
| Raspberry son 75 | `192.168.1.75` | `e4:5f:01:f8:0b:ad` |
| Raspberry serveur | `192.168.1.2` | `2c:cf:67:01:53:7e` |

Le 74 et le 75 sont le minimum pour qu’ils apparaissent dans WAM. Le serveur est réservé aussi : les Raspberry son ouvrent leur connexion vers `192.168.1.2`. Sans cette adresse, ils ont une IP mais ne trouvent pas WAM.

Windows utilise OpenDHCP. Ce programme ne s’installe pas sur Mac. Sur Mac, le même rôle est tenu par `dnsmasq`. Les adresses données aux Raspberry restent les mêmes.

Un seul DHCP doit tourner sur le switch de test. Si la box Internet distribue aussi des adresses sur ce même câble, les Raspberry peuvent recevoir une autre IP.

---

## Étape 1 — Fixer l’adresse de l’ordinateur

L’ordinateur doit être en `192.168.1.10` sur la carte Ethernet branchée au switch, avant de lancer le DHCP.

**Windows**

1. Paramètres, Réseau et Internet, Ethernet.
2. Ouvre la carte branchée au switch, pas le Wi-Fi.
3. Modification de l’attribution IP, puis Manuel.
4. Active IPv4.
5. Adresse IP : `192.168.1.10`.
6. Masque de sous-réseau : `255.255.255.0`. La longueur de préfixe, si Windows la demande, est `24`.
7. Passerelle : laisse vide sur un réseau de test isolé.
8. Enregistre.

```bat
ipconfig
```

La carte Ethernet doit afficher `192.168.1.10`.

**Mac**

1. Réglages Système, Réseau.
2. Choisis Ethernet, la prise branchée au switch, pas le Wi-Fi.
3. Détails, TCP/IP.
4. Configurer IPv4 : Manuellement.
5. Adresse IP : `192.168.1.10`.
6. Masque de sous-réseau : `255.255.255.0`.
7. Routeur : laisse vide.
8. OK.

Pour vérifier dans le Terminal, repère d’abord le nom de la prise :

```bash
networksetup -listallhardwareports
```

La ligne `Device` sous Ethernet ressemble à `en5` ou `en7`. Ce n’est en général pas `en0` si `en0` est le Wi-Fi. Remplace `en5` par le nom affiché :

```bash
ipconfig getifaddr en5
```

La réponse doit être `192.168.1.10`. Note ce nom (`en5` dans l’exemple) : l’étape 3 s’en sert.

---

## Étape 2 — Installer le programme

**Windows**

1. Télécharge Open DHCP Server : [https://sourceforge.net/projects/dhcpserver/](https://sourceforge.net/projects/dhcpserver/).
2. Dézippe le dossier dans `C:\OpenDHCPServer`. Le programme s’appelle `OpenDHCPServer.exe`.
3. Ne le mets pas dans le dossier de WAM Studio.

Invite de commandes **en administrateur** :

```bat
cd C:\OpenDHCPServer
OpenDHCPServer.exe -install
net start OpenDHCPServer
```

Le service s’appelle `OpenDHCPServer`. Au premier lancement, le pare-feu peut demander l’autorisation : accepte les réseaux privés.

Le programme affiche souvent les baux sur `http://127.0.0.1:6789`.

**Mac**

Dans le Terminal, installe Homebrew s’il n’est pas déjà là. La commande officielle est sur [https://brew.sh](https://brew.sh). Puis :

```bash
brew install dnsmasq
```

`dnsmasq` n’a pas de service à démarrer tout de suite. On le lance à l’étape 3, après avoir écrit les réservations.

---

## Étape 3 — Écrire les réservations et démarrer

Les trois adresses fixes sont les mêmes sur Windows et sur Mac. La plage `192.168.1.100` à `192.168.1.150` sert aux appareils sans réservation.

La réservation du serveur utilise l’adresse matérielle de la prise Ethernet, `2c:cf:67:01:53:7e`. L’adresse du Wi-Fi du même Pi se termine par `7f`. Si on réserve celle-là, le câble Ethernet ne reçoit pas `192.168.1.2`.

**Windows**

Ouvre `C:\OpenDHCPServer\OpenDHCPServer.ini`. Remplace son contenu par :

```ini
[LISTEN_ON]
192.168.1.10

[LOGGING]
LogLevel=Normal

[RANGE_SET]
DHCPRange=192.168.1.100-192.168.1.150

[GLOBAL_OPTIONS]
SubNetMask=255.255.255.0
LeaseTime=3600

[e4:5f:01:f8:0b:8c]
IP=192.168.1.74

[e4:5f:01:f8:0b:ad]
IP=192.168.1.75

[2c:cf:67:01:53:7e]
IP=192.168.1.2
```

`LISTEN_ON` est l’adresse du PC, pas celle d’un Raspberry.

Enregistre, puis redémarre le service. Invite de commandes en administrateur :

```bat
net stop OpenDHCPServer
net start OpenDHCPServer
```

Tant que ce service tourne, ne lance pas `OpenDHCPServer.exe` une seconde fois à la main. Les deux voudraient le même port.

**Mac**

Crée le fichier dans le dossier personnel. Dans le Terminal :

```bash
cat > ~/dhcp-wam.conf << 'EOF'
interface=en5
bind-interfaces
port=0
dhcp-range=192.168.1.100,192.168.1.150,255.255.255.0,1h
dhcp-host=e4:5f:01:f8:0b:8c,192.168.1.74
dhcp-host=e4:5f:01:f8:0b:ad,192.168.1.75
dhcp-host=2c:cf:67:01:53:7e,192.168.1.2
EOF
```

Remplace `en5` par le nom noté à l’étape 1, dans le fichier comme dans la commande. `port=0` coupe le DNS de dnsmasq : on ne veut que les adresses.

Lance-le et laisse la fenêtre ouverte. Le mot de passe du Mac est demandé :

```bash
sudo dnsmasq --conf-file="$HOME/dhcp-wam.conf" --no-daemon --log-dhcp
```

Les lignes `DHCP` dans ce terminal confirment les adresses données. `Ctrl+C` arrête le programme. Après une modification du fichier, `Ctrl+C`, puis la même commande.

Si le pare-feu du Mac est actif et que les Raspberry ne reçoivent rien : Réglages Système, Réseau, Coupe-feu, autorise les connexions entrantes pour `dnsmasq`.

---

## Étape 4 — Faire reprendre une adresse aux Raspberry

Le DHCP doit déjà tourner. Éteins puis rallume le Raspberry 74, le 75, et le Pi serveur. Ils redemandent une adresse.

Sur chacun, avec un clavier :

```bash
hostname -I
```

Le `I` est une majuscule.

| Machine | Adresse attendue |
| --- | --- |
| Raspberry 74 | `192.168.1.74` |
| Raspberry 75 | `192.168.1.75` |
| Pi serveur | `192.168.1.2` |

Depuis l’ordinateur.

**Windows**

```bat
ping 192.168.1.74
ping 192.168.1.75
ping 192.168.1.2
```

**Mac**

`ping` ne s’arrête pas tout seul. `-c 4` envoie quatre essais.

```bash
ping -c 4 192.168.1.74
ping -c 4 192.168.1.75
ping -c 4 192.168.1.2
```

Sous Windows, une ligne `allotted 192.168.1.74` dans OpenDHCP, ou la page `http://127.0.0.1:6789`, confirme la réservation. Sur Mac, la même confirmation est une ligne `DHCPACK` dans le terminal de `dnsmasq`.

Ensuite seulement, le guide d’installation de WAM peut continuer : le Pi serveur est joignable en `ssh pi@192.168.1.2`.

---

## Arrêter ou relancer

**Windows**

Invite de commandes en administrateur :

```bat
net stop OpenDHCPServer
net start OpenDHCPServer
```

Après chaque modification de `OpenDHCPServer.ini`, il faut cet arrêt puis ce démarrage. Enregistrer le fichier ne suffit pas.

**Mac**

Dans le terminal où `dnsmasq` tourne : `Ctrl+C`. Pour relancer :

```bash
sudo dnsmasq --conf-file="$HOME/dhcp-wam.conf" --no-daemon --log-dhcp
```

Si l’ordinateur change d’adresse Ethernet, elle doit rester `192.168.1.10`, sinon le DHCP n’écoute plus au bon endroit. Sur Windows, `LISTEN_ON` doit suivre cette adresse.

---

## Si quelque chose bloque

| Ce que tu vois | Quoi faire |
| --- | --- |
| Le programme ne démarre pas | L’ordinateur doit déjà être en `192.168.1.10`. Sous Windows, relance l’invite en administrateur. Sur Mac, la commande commence par `sudo`. |
| Le port est déjà pris | Un deuxième DHCP tourne. Sous Windows : `net stop OpenDHCPServer`, puis un seul démarrage. Sur Mac : un seul `dnsmasq`, pas OpenDHCP en plus. |
| Le 74 ou le 75 a une autre adresse | Vérifie l’adresse matérielle dans le fichier, relance le DHCP, rallume le Raspberry. |
| Le Pi serveur n’est pas en `192.168.1.2` | La réservation doit être `2c:cf:67:01:53:7e`, la prise Ethernet, pas le Wi-Fi. |
| `dnsmasq` dit qu’il ne voit pas l’interface | Le nom `en5` n’est pas le bon. Reprends `networksetup -listallhardwareports` et corrige `interface=` dans `~/dhcp-wam.conf`. |
| Deux adresses différentes répondent | La box et l’ordinateur distribuent en même temps. Sur le switch de test, un seul DHCP. |
