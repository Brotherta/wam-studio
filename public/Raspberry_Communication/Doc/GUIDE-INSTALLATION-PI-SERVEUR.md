# Installer WAM Studio sur un Raspberry Pi serveur

Point de départ : un ordinateur qui n’a pas le projet, et un Raspberry Pi qui ne l’a pas non plus. L’ordinateur peut être sous Windows, Mac ou Linux.

Il sert seulement à envoyer le projet. Ensuite, WAM tourne sur le Pi. À chaque allumage, il repart seul, et Chromium ouvre l’interface.

L’ordinateur n’a pas besoin de Node.js. Le Pi l’installe lui-même.

Quand une commande change selon le système, les trois versions sont indiquées. Sinon, une seule commande suffit.

Schémas dans le même dossier :

- `portage-etapes-envoi.png` — les quatre étapes de l’envoi
- `portage-etapes-installation.png` — ce que le Pi installe ensuite
- `demarrage-automatique-pi.png` — le service et Chromium
- `ressources-raspberry-serveur.png` — mémoire, carte, écran
- `partage-projet-communications.png` — qui parle à qui

---

## Étape 1 — Préparer l’ordinateur

Il faut deux outils : Git, pour récupérer le projet, et SSH, pour parler au Pi.

**Windows**

Git : [https://git-scm.com/download/win](https://git-scm.com/download/win). Pendant l’installation, les choix proposés conviennent.

OpenSSH est souvent déjà là. Dans l’invite de commandes :

```bat
ssh -V
```

Si la commande répond avec un numéro de version, c’est bon. Sinon : Paramètres, Applications, Fonctionnalités facultatives, ajouter **Client OpenSSH**.

**Mac**

Ouvre le Terminal. SSH est déjà installé. Vérifie Git :

```bash
git --version
ssh -V
```

Si Git manque, le Mac propose de l’installer. Accepte.

**Linux**

Dans un terminal :

```bash
sudo apt update
sudo apt install -y git openssh-client
ssh -V
```

Sur Fedora, la deuxième ligne est `sudo dnf install -y git openssh-clients`.

---

## Étape 2 — Récupérer le projet

La commande est la même partout. Place-toi dans le dossier où tu veux le projet.

Le portage Raspberry est sur la branche `Jauris`, pas sur `main`. Un clone sans le nom de branche récupère `main`, et le script d’envoi n’y est pas.

```bash
git clone -b Jauris https://github.com/Brotherta/wam-studio.git
cd wam-studio
```

Vérifie ensuite que le script d’envoi est bien là.

**Windows**

```bat
dir public\Raspberry_Communication\deploiement\envoyer-vers-pi.ps1
```

**Mac et Linux**

```bash
ls public/Raspberry_Communication/deploiement/envoyer-vers-pi.sh
```

S’il est introuvable, le clone est sur `main`. Reprends la commande avec `-b Jauris`. Sans ce fichier, la suite ne peut pas partir.

On n’ouvre pas WAM sur cet ordinateur.

---

## Étape 3 — Préparer le Raspberry

Cette étape est souvent déjà faite. Elle est détaillée ici pour pouvoir la refaire.

| Élément | Ce qu’il faut |
| --- | --- |
| Modèle | Raspberry Pi 4 ou Pi 5 |
| Mémoire | 4 Go au minimum, 8 Go plus confortable. 1 ou 2 Go ne suffisent pas. |
| Système | Raspberry Pi OS 64 bits, avec le bureau. Pas la version Lite : elle n’ouvre pas Chromium. |
| Carte | Une microSD. Le projet et les sons des pistes y restent. |
| Compte | Utilisateur `pi`, avec un mot de passe que tu connais |
| Réseau | Un câble Ethernet. Le Pi doit recevoir l’adresse `192.168.1.2`. |
| Usage | Un écran, une souris et un clavier, branchés sur le Pi |

Le Wi-Fi ne sert pas pour cette installation. Les Raspberry son cherchent le serveur à l’adresse `192.168.1.2`, sur le câble.

### Graver la carte

1. Télécharge Raspberry Pi Imager : [https://www.raspberrypi.com/software/](https://www.raspberrypi.com/software/).
2. Si l’ordinateur n’a pas de lecteur de carte, branche un lecteur USB, puis insère la microSD.
3. Ouvre Imager.
4. Choisis le modèle, Raspberry Pi 4 ou Raspberry Pi 5.
5. Choisis le système **Raspberry Pi OS (64-bit)**, celui avec le bureau. Ne choisis pas Lite.
6. Choisis la microSD comme support. Vérifie le nom du disque : l’écriture efface toute la carte.
7. Au moment d’écrire, ouvre les réglages du système.
8. Dans l’onglet général : nomme le Pi si tu veux, mets l’utilisateur `pi` et un mot de passe. Le Wi-Fi peut rester vide.
9. Dans l’onglet des services : active SSH, avec l’authentification par mot de passe.
10. Enregistre, confirme l’écriture, puis attends la fin. Éjecte la carte.

### Premier allumage

1. Mets la carte dans le Pi.
2. Branche le câble Ethernet, l’écran, le clavier et l’alimentation.
3. Allume-le. Le premier démarrage est long : le système s’installe sur la carte. Attends d’arriver sur le bureau, souvent deux ou trois minutes.
4. Le DHCP, en dehors de WAM, doit donner l’adresse `192.168.1.2` à la prise Ethernet de ce Pi. WAM ne choisit pas cette adresse. Sur l’ordinateur de test, Windows ou Mac, le mode d’emploi est `GUIDE-OPENDHCP-PC.md`. Il réserve aussi `192.168.1.74` et `192.168.1.75`.
5. Sur le Pi, ouvre un terminal et tape :

```bash
hostname -I
```

Le `I` est une majuscule. La commande doit afficher `192.168.1.2`. Si une autre adresse apparaît, l’étape 4 ne pourra pas aboutir : la réservation DHCP ne vise pas la bonne carte réseau.

Pour voir l’adresse matérielle de la prise Ethernet, celle que le DHCP doit réserver :

```bash
ip link show eth0
```

La ligne `link/ether` donne cette adresse. On ne continue que lorsque `hostname -I` affiche `192.168.1.2`.

---

## Étape 4 — Vérifier que l’ordinateur voit le Pi

L’ordinateur et le Pi sont sur le même réseau. Le Pi serveur est en `192.168.1.2`.

**Windows**

```bat
ping 192.168.1.2
ssh pi@192.168.1.2
```

**Mac et Linux**

`ping` ne s’arrête pas tout seul. `-c 4` envoie quatre essais, puis s’arrête.

```bash
ping -c 4 192.168.1.2
ssh pi@192.168.1.2
```

Le Pi demande le mot de passe de `pi`. La première fois, il demande aussi de confirmer l’empreinte : répondre `yes`.

Si la connexion s’ouvre, tape `exit` pour revenir sur l’ordinateur. Si le ping ou le SSH échoue, retourne à l’étape 3 : le Pi n’est pas en `192.168.1.2`, ou le SSH n’a pas été activé. On ne lance pas l’envoi tant que ce SSH ne marche pas.

---

## Étape 5 — Envoyer le projet

Depuis le dossier `wam-studio`. L’adresse du Pi serveur est `192.168.1.2`.

Le résultat est le même sur les trois systèmes : un fichier part vers le Pi, l’ancien dossier `/home/pi/wam-studio` est remplacé, puis l’installation démarre. Le mot de passe est demandé deux fois.

**Windows**

```bat
powershell -ExecutionPolicy Bypass -File ".\public\Raspberry_Communication\deploiement\envoyer-vers-pi.ps1" -AdressePi 192.168.1.2
```

Si l’utilisateur du Pi n’est pas `pi`, ajoute `-Utilisateur` suivi du nom du compte.

**Mac et Linux**

```bash
bash public/Raspberry_Communication/deploiement/envoyer-vers-pi.sh 192.168.1.2
```

Si l’utilisateur du Pi n’est pas `pi` :

```bash
bash public/Raspberry_Communication/deploiement/envoyer-vers-pi.sh 192.168.1.2 autre-nom
```

L’installation est longue : Node.js, les bibliothèques, puis la compilation. Le Pi doit rester allumé et garder Internet. À la fin, le script affiche que le projet repartira au prochain allumage, et que le bureau ouvre `http://localhost:5002`.

Chaque nouvel envoi remplace tout le projet déjà présent sur le Pi par celui de l’ordinateur.

---

## Étape 6 — Vérifier sur le Pi

Branche l’écran et la souris sur le Pi. Cette étape se passe sur le Pi : les commandes de l’ordinateur n’interviennent plus.

Deux choses démarrent séparément :

- Un service lance la banque (port 6002), l’interface WAM (port 5002), l’agent de transfert (port 3100) et le lien vers les Raspberry son (port 8383).
- Le bureau attend que la page réponde, jusqu’à 90 secondes, puis Chromium s’ouvre sur `http://localhost:5002`.

Si la page ne s’ouvre pas toute seule, ouvre Chromium à la main sur cette adresse.

Éteindre ou redémarrer le Pi ne supprime pas le projet. Au rallumage, le service et Chromium repartent seuls. Inutile de relancer la commande de l’ordinateur.

Les sons posés sur les pistes sont écrits sur la carte, dans `stockage-session`. Un rechargement de la page les remet.

---

## Étape 7 — Faire trouver le serveur par les Raspberry son

Cette étape ne sert que si des Raspberry son doivent jouer l’audio. L’interface WAM, elle, est déjà ouverte à l’étape 6.

Les Raspberry son ouvrent une connexion vers `192.168.1.2`, port `8383`. Le script d’installation ne donne pas cette adresse au Pi. C’est le réseau qui la donne.

Le DHCP n’est pas dans WAM Studio. Chez le client, c’est son serveur qui distribue les adresses. Pour un essai, un DHCP séparé peut donner `192.168.1.2` au Pi serveur. L’ordinateur qui envoie le projet n’a pas besoin de faire tourner WAM.

La liste des numéros attendus est dans `public/Raspberry_Communication/raspberry-parc.json`. Aujourd’hui elle contient les numéros 74 et 75, sur le réseau `192.168.1.`. Si le parc est différent, on change cette liste, puis on renvoie le projet avec la commande de l’étape 5.

---

## Si quelque chose bloque

| Ce que tu vois | Quoi faire |
| --- | --- |
| `ssh` est introuvable | Windows : client OpenSSH, étape 1. Linux : `sudo apt install openssh-client`. Sur Mac, SSH est déjà là. |
| Le script d’envoi est introuvable | Le clone est sur `main`. Reprendre l’étape 2 avec `-b Jauris`. |
| Le ping ou le SSH vers `192.168.1.2` ne répond pas | Revenir à l’étape 3. Le Pi doit afficher cette adresse avec `hostname -I`, et le SSH doit être activé. |
| Mot de passe refusé | C’est le mot de passe de l’utilisateur `pi`, pas celui de l’ordinateur. |
| L’installation s’arrête au milieu | Le Pi a besoin d’Internet, et d’au moins 4 Go de mémoire. Relancer la même commande. |
| Chromium ne s’ouvre pas | Attendre une minute, puis ouvrir `http://localhost:5002` sur le Pi. |
| Les Raspberry son restent hors ligne | Le Pi serveur doit être en `192.168.1.2`, et leurs numéros doivent être dans `raspberry-parc.json`. |
