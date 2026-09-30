# Envoie le projet vers le Raspberry et lance l'installation.
# L'adresse du Pi n'est connue qu'au moment de lancer la commande.
#
# Depuis la racine du depot :
#   powershell -ExecutionPolicy Bypass -File .\public\Raspberry_Communication\deploiement\envoyer-vers-pi.ps1 -AdressePi 192.168.1.42
param(
  [Parameter(Mandatory = $true)]
  [string]$AdressePi,
  [string]$Utilisateur = "pi"
)

$ErrorActionPreference = "Stop"

function Assert-CommandePresente {
  param([string]$Nom)
  if (-not (Get-Command $Nom -ErrorAction SilentlyContinue)) {
    throw "Commande introuvable : $Nom. Installe le client OpenSSH de Windows."
  }
}

Assert-CommandePresente "tar"
Assert-CommandePresente "scp"
Assert-CommandePresente "ssh"

$DossierScript = Split-Path -Parent $MyInvocation.MyCommand.Path
$Racine = (Resolve-Path (Join-Path $DossierScript "..\..\..")).Path
$Archive = Join-Path $env:TEMP "wam-studio-pour-pi.tar"
$Cible = "${Utilisateur}@${AdressePi}"

if (Test-Path $Archive) {
  Remove-Item $Archive -Force
}

Write-Host "Creation de l'archive (sans node_modules, sans fichiers audio temporaires)..."
& tar -cf $Archive `
  --exclude=node_modules `
  --exclude=dist `
  --exclude=.git `
  --exclude=temp `
  --exclude=storage `
  --exclude=logs `
  -C $Racine .

if ($LASTEXITCODE -ne 0) {
  throw "La creation de l'archive a echoue."
}

Write-Host "Envoi vers $Cible (le mot de passe SSH est demande)..."
& scp $Archive "${Cible}:wam-studio-pour-pi.tar"
if ($LASTEXITCODE -ne 0) {
  throw "L'envoi de l'archive a echoue."
}

# L'archive Windows marque des dossiers en lecture seule.
# Python les recree avec les droits normaux de l'utilisateur pi.
# Le script est envoye en base64 : PowerShell mange les guillemets
# si on passe la commande Python directement a ssh.
$ScriptDistant = @'
set -euo pipefail
chmod -R u+w ~/wam-studio 2>/dev/null || true
rm -rf ~/wam-studio
mkdir -p ~/wam-studio
python3 -c "import os,tarfile; dest=os.path.expanduser('~/wam-studio'); arch=os.path.expanduser('~/wam-studio-pour-pi.tar'); t=tarfile.open(arch); ms=t.getmembers(); [t.extract(m, dest, set_attrs=False) for m in ms]; t.close()"
sed -i 's/\r$//' ~/wam-studio/public/Raspberry_Communication/deploiement/*.sh
bash ~/wam-studio/public/Raspberry_Communication/deploiement/installer-sur-pi.sh
rm -f ~/wam-studio-pour-pi.tar /tmp/installer-wam.sh
'@
$ScriptDistant = $ScriptDistant -replace "`r", ""
$ScriptEncode = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($ScriptDistant))
$CommandeDistante = "echo $ScriptEncode | base64 -d > /tmp/installer-wam.sh && bash /tmp/installer-wam.sh"

Write-Host "Installation sur le Raspberry (le mot de passe SSH est demande une seconde fois)..."
& ssh -t $Cible $CommandeDistante
if ($LASTEXITCODE -ne 0) {
  throw "L'installation sur le Raspberry a echoue."
}

Remove-Item $Archive -Force -ErrorAction SilentlyContinue
Write-Host "Termine. Au prochain allumage, le projet repart tout seul."
Write-Host "Branche la souris et l'ecran : le bureau ouvre http://localhost:5002"
