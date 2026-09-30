$ErrorActionPreference = "Stop"
$source = "C:\Users\jauri\Documents\StageBuffa\wam-studio\public\Raspberry_Communication"
$archive = Join-Path $env:TEMP "wam-case-liaison.tar"
if (Test-Path $archive) {
  Remove-Item $archive
}
Push-Location $source
tar -cf $archive `
  Models/RaspberryTrackBinding.ts `
  Models/SearchRaspberryState.ts `
  Services/RaspberryIndicateurPisteUi.ts `
  Services/RaspberryNomPisteProtection.ts `
  Services/RaspberryTrackBindingStore.ts `
  Controllers/SearchRaspberryController.ts `
  Controllers/connexion/SearchRaspberryConnexionWebSocket.ts `
  Controllers/messages/SearchRaspberryHoteApplicateurMessages.ts `
  Controllers/messages/SearchRaspberryParseurMessagesServeur.ts `
  Views/SearchRaspberryView.ts `
  Pont/WamPistesPontImpl.ts
Pop-Location
scp $archive pi@192.168.1.2:/home/pi/wam-case-liaison.tar
ssh -t pi@192.168.1.2 "tar -xf /home/pi/wam-case-liaison.tar -C /home/pi/wam-studio/public/Raspberry_Communication && cd /home/pi/wam-studio/public && NODE_OPTIONS=--max-old-space-size=1536 npm run build && sudo systemctl restart wam-studio && echo WAM relance."
