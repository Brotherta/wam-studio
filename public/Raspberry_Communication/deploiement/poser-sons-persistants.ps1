$ErrorActionPreference = "Stop"
$source = "C:\Users\jauri\Documents\StageBuffa\wam-studio\public\Raspberry_Communication"
$archive = Join-Path $env:TEMP "wam-sons-persistants.tar"
if (Test-Path $archive) {
  Remove-Item $archive
}
Push-Location $source
tar -cf $archive `
  Services/RaspberryProjetLocalStore.ts `
  serveur/point-entree/RaspberryServeurPointEntree.js `
  serveur/session/RaspberryServeurSessionHttp.js `
  stockage-session/.gitignore
Pop-Location
scp $archive pi@192.168.1.2:/home/pi/wam-sons-persistants.tar
ssh -t pi@192.168.1.2 "tar -xf /home/pi/wam-sons-persistants.tar -C /home/pi/wam-studio/public/Raspberry_Communication && cd /home/pi/wam-studio/public && NODE_OPTIONS=--max-old-space-size=1536 npm run build && sudo systemctl restart wam-studio && echo WAM relance."
