const fs = require("fs");
const path = require("path");
const { buildIpFromNumber } = require("./RaspberryParcStore");

const OPEN_DHCP_INI_FILE_NAME = "OpenDHCPServer.ini";
const DEFAULT_OPEN_DHCP_FOLDER = "C:/OpenDHCPServer";
const PREFERRED_INI_NAMES = ["OpenDHCPServer.ini", "opendhcp.ini"];
const MAC_SECTION_REGEX = /^\[([0-9a-fA-F]{2}(:[0-9a-fA-F]{2}){5})\]$/;

function resolveOpenDhcpFolderPath(folderOrFilePath) {
  const trimmed = `${folderOrFilePath || ""}`.trim();
  if (trimmed.length === 0) {
    return "";
  }
  const normalized = path.normalize(trimmed);
  if (path.extname(normalized).toLowerCase() === ".ini") {
    return path.dirname(normalized);
  }
  return normalized;
}

function isRegularFile(filePath) {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function findIniFileInFolder(folderOrFilePath) {
  const trimmed = `${folderOrFilePath || ""}`.trim();
  const folderPath = trimmed.length > 0
    ? resolveOpenDhcpFolderPath(trimmed)
    : DEFAULT_OPEN_DHCP_FOLDER;

  if (trimmed.length > 0 && path.extname(path.normalize(trimmed)).toLowerCase() === ".ini") {
    const directPath = path.normalize(trimmed);
    if (isRegularFile(directPath)) {
      return {
        ok: true,
        folderPath: path.dirname(directPath),
        iniFilePath: directPath,
        iniFileName: path.basename(directPath),
        error: "",
      };
    }
  }

  if (!fs.existsSync(folderPath)) {
    return {
      ok: false,
      folderPath,
      iniFilePath: "",
      iniFileName: "",
      error: `Dossier introuvable: ${folderPath}`,
    };
  }

  let folderStat;
  try {
    folderStat = fs.statSync(folderPath);
  } catch {
    return {
      ok: false,
      folderPath,
      iniFilePath: "",
      iniFileName: "",
      error: `Acces impossible au dossier: ${folderPath}`,
    };
  }

  if (!folderStat.isDirectory()) {
    return {
      ok: false,
      folderPath,
      iniFilePath: "",
      iniFileName: "",
      error: `Le chemin n'est pas un dossier: ${folderPath}`,
    };
  }

  let files = [];
  try {
    files = fs.readdirSync(folderPath);
  } catch {
    return {
      ok: false,
      folderPath,
      iniFilePath: "",
      iniFileName: "",
      error: `Impossible de lire le dossier: ${folderPath}`,
    };
  }

  const iniFiles = [];
  files.forEach((name) => {
    const fullPath = path.join(folderPath, name);
    if (!isRegularFile(fullPath)) {
      return;
    }
    if (path.extname(name).toLowerCase() === ".ini") {
      iniFiles.push({ name, fullPath });
    }
  });

  if (iniFiles.length === 0) {
    return {
      ok: false,
      folderPath,
      iniFilePath: "",
      iniFileName: "",
      error: `Aucun fichier .ini trouve dans: ${folderPath}`,
    };
  }

  const byLowerName = new Map(iniFiles.map((item) => [item.name.toLowerCase(), item]));
  for (let i = 0; i < PREFERRED_INI_NAMES.length; i += 1) {
    const hit = byLowerName.get(PREFERRED_INI_NAMES[i].toLowerCase());
    if (hit) {
      return {
        ok: true,
        folderPath,
        iniFilePath: hit.fullPath,
        iniFileName: hit.name,
        error: "",
      };
    }
  }

  const first = iniFiles.sort((a, b) => a.name.localeCompare(b.name))[0];
  return {
    ok: true,
    folderPath,
    iniFilePath: first.fullPath,
    iniFileName: first.name,
    error: "",
  };
}

function normalizeMac(mac) {
  return `${mac || ""}`.trim().replace(/-/g, ":").toLowerCase();
}

function isMacSectionHeader(line) {
  const trimmed = `${line || ""}`.trim();
  return MAC_SECTION_REGEX.test(trimmed);
}

function extractMacFromHeader(line) {
  const trimmed = `${line || ""}`.trim();
  const match = trimmed.match(MAC_SECTION_REGEX);
  return match ? normalizeMac(match[1]) : "";
}

function parseIpFromSectionLines(lines) {
  for (let i = 0; i < lines.length; i += 1) {
    const trimmed = `${lines[i]}`.trim();
    const compact = trimmed.replace(/\s+/g, "");
    if (compact.toLowerCase().startsWith("ip=")) {
      return compact.slice(3).trim();
    }
  }
  return "";
}

function getNumberFromIp(ipAddress, subnetPrefix) {
  if (!ipAddress) {
    return null;
  }
  const cleanIp = `${ipAddress}`.trim();
  if (subnetPrefix && cleanIp.startsWith(subnetPrefix)) {
    const suffix = cleanIp.slice(subnetPrefix.length);
    const parsed = Number.parseInt(suffix, 10);
    if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 254) {
      if (`${subnetPrefix}${parsed}` === cleanIp) {
        return parsed;
      }
    }
  }

  const parts = cleanIp.split(".");
  if (parts.length !== 4) {
    return null;
  }
  const lastOctet = Number.parseInt(parts[3], 10);
  if (!Number.isFinite(lastOctet) || lastOctet < 1 || lastOctet > 254) {
    return null;
  }
  return lastOctet;
}

function parseIniContent(content) {
  const lines = content.split(/\r?\n/);
  const blocks = [];
  let current = { type: "other", header: "", lines: [] };

  const pushCurrent = () => {
    if (current.lines.length > 0 || current.header.length > 0) {
      blocks.push(current);
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      pushCurrent();
      if (isMacSectionHeader(trimmed)) {
        current = {
          type: "static",
          header: trimmed,
          mac: extractMacFromHeader(trimmed),
          lines: [],
        };
      } else {
        current = {
          type: "other",
          header: trimmed,
          lines: [],
        };
      }
      return;
    }
    current.lines.push(line);
  });
  pushCurrent();

  const staticHosts = [];
  blocks.forEach((block) => {
    if (block.type !== "static") {
      return;
    }
    const ipAddress = parseIpFromSectionLines(block.lines);
    staticHosts.push({
      mac: block.mac,
      ipAddress,
      header: block.header,
      lines: block.lines,
    });
  });

  return { blocks, staticHosts };
}

function scanIniFile(folderOrFilePath, subnetPrefix) {
  const inputPath = folderOrFilePath && `${folderOrFilePath}`.trim().length > 0
    ? folderOrFilePath
    : DEFAULT_OPEN_DHCP_FOLDER;
  const located = findIniFileInFolder(inputPath);
  if (!located.ok) {
    return {
      ok: false,
      error: located.error,
      entries: [],
      folderPath: located.folderPath,
      iniFilePath: located.iniFilePath,
      iniFileName: located.iniFileName,
    };
  }

  const { folderPath, iniFilePath, iniFileName } = located;
  const content = fs.readFileSync(iniFilePath, "utf8");
  const parsed = parseIniContent(content);
  const byNumber = new Map();

  parsed.staticHosts.forEach((host) => {
    if (!host.mac || host.mac.length === 0) {
      return;
    }
    const ipAddress = (host.ipAddress || "").trim();
    if (ipAddress.length === 0) {
      return;
    }
    const number = getNumberFromIp(ipAddress, subnetPrefix);
    if (number === null) {
      return;
    }
    byNumber.set(number, {
      number,
      mac: host.mac,
      ipAddress,
      inIni: true,
    });
  });

  const entries = Array.from(byNumber.values()).sort((a, b) => a.number - b.number);
  return { ok: true, error: "", entries, folderPath, iniFilePath, iniFileName };
}

function buildStaticSectionLines(mac, ipAddress) {
  return [
    `[${normalizeMac(mac)}]`,
    `IP=${ipAddress}`,
  ];
}

function isValidMacAddress(macAddress) {
  const normalized = `${macAddress || ""}`.trim().replace(/-/g, ":").toLowerCase();
  return /^([0-9a-f]{2}:){5}[0-9a-f]{2}$/.test(normalized);
}

function isValidIpAddress(ipAddress) {
  const parts = `${ipAddress || ""}`.trim().split(".");
  if (parts.length !== 4) {
    return false;
  }
  for (let i = 0; i < parts.length; i += 1) {
    const value = Number.parseInt(parts[i], 10);
    if (!Number.isFinite(value) || value < 0 || value > 255) {
      return false;
    }
  }
  return true;
}

function blocksToIniText(blocks) {
  const outputLines = [];
  blocks.forEach((block) => {
    if (block.header.length > 0) {
      outputLines.push(block.header);
    }
    block.lines.forEach((line) => {
      outputLines.push(line);
    });
  });
  return `${outputLines.join("\r\n")}\r\n`;
}

function addStaticHostToIni(folderOrFilePath, macAddress, ipAddress) {
  const mac = normalizeMac(macAddress);
  const ip = `${ipAddress || ""}`.trim();
  if (!isValidMacAddress(mac)) {
    return { ok: false, error: "Adresse MAC invalide (format aa:bb:cc:dd:ee:ff)." };
  }
  if (!isValidIpAddress(ip)) {
    return { ok: false, error: "Adresse IP invalide." };
  }

  const inputPath = folderOrFilePath && `${folderOrFilePath}`.trim().length > 0
    ? folderOrFilePath
    : DEFAULT_OPEN_DHCP_FOLDER;
  const located = findIniFileInFolder(inputPath);
  if (!located.ok) {
    return {
      ok: false,
      error: located.error,
      folderPath: located.folderPath,
      iniFilePath: located.iniFilePath,
      iniFileName: located.iniFileName,
    };
  }

  const { iniFilePath, folderPath, iniFileName } = located;
  const backupPath = `${iniFilePath}.bak`;
  const original = fs.readFileSync(iniFilePath, "utf8");
  fs.writeFileSync(backupPath, original, "utf8");

  const parsed = parseIniContent(original);
  const keptBlocks = parsed.blocks.filter((block) => {
    if (block.type !== "static") {
      return true;
    }
    return block.mac !== mac;
  });

  if (keptBlocks.length > 0 && keptBlocks[keptBlocks.length - 1].lines.length > 0) {
    keptBlocks.push({ type: "other", header: "", lines: [""] });
  }

  keptBlocks.push({
    type: "static",
    header: `[${mac}]`,
    mac,
    lines: [`IP=${ip}`],
  });

  try {
    const finalText = blocksToIniText(keptBlocks);
    fs.writeFileSync(iniFilePath, finalText, "utf8");
  } catch (error) {
    const details = error && error.message ? error.message : "Erreur inconnue";
    return {
      ok: false,
      error: `Impossible d'ecrire le INI: ${details}`,
      folderPath,
      iniFilePath,
      iniFileName,
    };
  }

  return {
    ok: true,
    error: "",
    backupPath,
    folderPath,
    iniFilePath,
    iniFileName,
    macAddress: mac,
    ipAddress: ip,
  };
}

function rewriteIniFile(folderOrFilePath, subnetPrefix, selectedNumbers, macByNumber) {
  const inputPath = folderOrFilePath && `${folderOrFilePath}`.trim().length > 0
    ? folderOrFilePath
    : DEFAULT_OPEN_DHCP_FOLDER;
  const located = findIniFileInFolder(inputPath);
  if (!located.ok) {
    return {
      ok: false,
      error: located.error,
      folderPath: located.folderPath,
      iniFilePath: located.iniFilePath,
      iniFileName: located.iniFileName,
    };
  }

  const { folderPath, iniFilePath, iniFileName } = located;
  const backupPath = `${iniFilePath}.bak`;
  const original = fs.readFileSync(iniFilePath, "utf8");
  fs.writeFileSync(backupPath, original, "utf8");

  const parsed = parseIniContent(original);
  const selectedSet = new Set(selectedNumbers);
  const outputLines = [];
  const missingMacNumbers = [];
  const existingNumbers = new Set();
  parsed.blocks.forEach((block) => {
    if (block.type === "static") {
      const ipAddress = parseIpFromSectionLines(block.lines);
      const number = getNumberFromIp(ipAddress, subnetPrefix);
      if (number !== null) {
        existingNumbers.add(number);
        if (selectedSet.has(number)) {
          const mac = normalizeMac(macByNumber.get(number) || block.mac || "");
          if (mac.length === 0) {
            missingMacNumbers.push(number);
            return;
          }
          if (outputLines.length > 0 && outputLines[outputLines.length - 1].trim().length > 0) {
            outputLines.push("");
          }
          buildStaticSectionLines(mac, buildIpFromNumber(subnetPrefix, number)).forEach((line) => {
            outputLines.push(line);
          });
          return;
        }
      }
    }

    if (block.header.length > 0) {
      outputLines.push(block.header);
    }
    block.lines.forEach((line) => {
      outputLines.push(line);
    });
  });

  const sortedNumbers = Array.from(selectedSet).sort((a, b) => a - b);

  sortedNumbers.forEach((number) => {
    if (existingNumbers.has(number)) {
      return;
    }
    const mac = normalizeMac(macByNumber.get(number) || "");
    const ipAddress = buildIpFromNumber(subnetPrefix, number);
    if (mac.length === 0) {
      missingMacNumbers.push(number);
      return;
    }
    if (outputLines.length > 0 && outputLines[outputLines.length - 1].trim().length > 0) {
      outputLines.push("");
    }
    buildStaticSectionLines(mac, ipAddress).forEach((line) => {
      outputLines.push(line);
    });
  });

  if (missingMacNumbers.length > 0) {
    return {
      ok: false,
      error: `MAC manquante pour les Raspberry: ${missingMacNumbers.join(", ")}`,
      backupPath,
    };
  }

  const finalText = `${outputLines.join("\r\n")}\r\n`;
  fs.writeFileSync(iniFilePath, finalText, "utf8");

  return {
    ok: true,
    error: "",
    backupPath,
    updatedCount: sortedNumbers.length,
    folderPath,
    iniFilePath,
    iniFileName,
  };
}

module.exports = {
  DEFAULT_OPEN_DHCP_FOLDER,
  OPEN_DHCP_INI_FILE_NAME,
  addStaticHostToIni,
  findIniFileInFolder,
  getNumberFromIp,
  normalizeMac,
  parseIniContent,
  resolveOpenDhcpFolderPath,
  rewriteIniFile,
  scanIniFile,
};
