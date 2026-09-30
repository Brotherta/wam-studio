$ErrorActionPreference = "Stop"
$source = "C:\Users\jauri\Documents\StageBuffa\wam-studio\public\Raspberry_Communication"
$archive = Join-Path $env:TEMP "wam-sans-dhcp.tar"
if (Test-Path $archive) {
  Remove-Item $archive
}
Push-Location $source
tar -cf $archive `
  RaspberryParcStore.js `
  raspberry-parc.json `
  serveur/point-entree/RaspberryServeurPointEntree.js `
  serveur/websocket/RaspberryServeurGestionnaireMessagesWs.js `
  serveur/presence/RaspberryServeurDiffusionControleurs.js `
  serveur/parc/RaspberryServeurHandlersParc.js `
  serveur/parc/RaspberryServeurSynchronisationParc.js
Pop-Location
scp $archive pi@192.168.1.2:/home/pi/wam-sans-dhcp.tar
ssh -t pi@192.168.1.2 "tar -xf /home/pi/wam-sans-dhcp.tar -C /home/pi/wam-studio/public/Raspberry_Communication && sudo systemctl restart wam-studio && echo WAM relance."
