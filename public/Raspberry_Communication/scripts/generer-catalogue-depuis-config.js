/**
 * Usage: node scripts/generer-catalogue-depuis-config.js "C:/chemin/config.json"
 * Genere raspberry-catalog.json a partir de computerInfo (machine === "rpi").
 */
const fs = require("fs");
const path = require("path");

const sourcePath = process.argv[2];
if (!sourcePath) {
  console.error("Indiquez le chemin vers config.json");
  process.exit(1);
}

const raw = fs.readFileSync(sourcePath, "utf8").trim();
const jsonText = raw.startsWith("{") ? raw : `{${raw}}`;
const data = JSON.parse(jsonText);
const entries = (data.computerInfo || [])
  .filter((item) => item.machine === "rpi")
  .map((item) => ({
    ipAddress: item.ipAddress,
    macAddress: String(item.macAddress || "").toLowerCase(),
    machineId: item.machineId,
    model: item.model || "",
  }));

const outPath = path.join(__dirname, "..", "raspberry-catalog.json");
fs.writeFileSync(outPath, `${JSON.stringify({ entries }, null, 2)}\n`, "utf8");
console.log(`Catalogue ecrit: ${outPath} (${entries.length} Raspberry)`);
