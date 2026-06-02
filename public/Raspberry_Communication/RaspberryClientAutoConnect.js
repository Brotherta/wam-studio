const os = require("os");
const WebSocket = require("ws");

const SERVER_IP = process.env.RASPBERRY_SERVER_IP || "192.168.1.2";
const SERVER_PORT = Number(process.env.RASPBERRY_SERVER_PORT || 8383);
const RECONNECT_DELAY_MS = 3000;
const HEARTBEAT_PUSH_MS = 4000;

let socket = null;
let heartbeatTimer = null;

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  const names = Object.keys(interfaces);
  for (let i = 0; i < names.length; i += 1) {
    const list = interfaces[names[i]] || [];
    for (let j = 0; j < list.length; j += 1) {
      const item = list[j];
      if (item && item.family === "IPv4" && !item.internal) {
        return item.address;
      }
    }
  }
  return "0.0.0.0";
}

function getLocalMac() {
  const interfaces = os.networkInterfaces();
  const names = Object.keys(interfaces);
  for (let i = 0; i < names.length; i += 1) {
    const list = interfaces[names[i]] || [];
    for (let j = 0; j < list.length; j += 1) {
      const item = list[j];
      if (item && item.family === "IPv4" && !item.internal && item.mac && item.mac !== "00:00:00:00:00:00") {
        return String(item.mac).toLowerCase();
      }
    }
  }
  return "";
}

function buildInfoText() {
  const totalMemoryGb = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(1);
  const freeMemoryGb = (os.freemem() / (1024 * 1024 * 1024)).toFixed(1);
  const cpuCount = os.cpus().length;
  return `cpu:${cpuCount} freeMem:${freeMemoryGb}GB totalMem:${totalMemoryGb}GB`;
}

function sendJson(payload) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return;
  }
  socket.send(JSON.stringify(payload));
}

function sendRaspberryOpen() {
  sendJson({
    type: "raspberryOpen",
    raspIP: getLocalIp(),
    macAddress: getLocalMac(),
    info: buildInfoText(),
  });
}

function sendRaspberryAlive() {
  sendJson({
    type: "raspberryAlive",
    raspIP: getLocalIp(),
    macAddress: getLocalMac(),
    info: buildInfoText(),
  });
}

function rebootMachine() {
  console.log("[RaspberryClient] Reboot demande.");
}

function shutdownMachine() {
  console.log("[RaspberryClient] Shutdown demande.");
}

function startHeartbeatPush() {
  if (heartbeatTimer) {
    return;
  }
  heartbeatTimer = setInterval(() => {
    sendRaspberryAlive();
  }, HEARTBEAT_PUSH_MS);
}

function stopHeartbeatPush() {
  if (!heartbeatTimer) {
    return;
  }
  clearInterval(heartbeatTimer);
  heartbeatTimer = null;
}

function connect() {
  const wsUrl = `ws://${SERVER_IP}:${SERVER_PORT}`;
  console.log(`[RaspberryClient] Connexion vers ${wsUrl}`);
  socket = new WebSocket(wsUrl);

  socket.on("open", () => {
    console.log("[RaspberryClient] Connecte au serveur.");
    sendRaspberryOpen();
    sendRaspberryAlive();
    startHeartbeatPush();
  });

  socket.on("message", (rawMessage) => {
    let message = {};
    try {
      const text = typeof rawMessage === "string" ? rawMessage : rawMessage.toString("utf-8");
      message = JSON.parse(text);
    } catch {
      return;
    }
    if (message.type === "isRaspAlive") {
      sendRaspberryAlive();
      return;
    }
    if (message.type === "rebootRaspberry") {
      rebootMachine();
      return;
    }
    if (message.type === "shutdownRaspberry") {
      shutdownMachine();
    }
  });

  socket.on("close", () => {
    console.log("[RaspberryClient] Deconnecte. Reconnexion...");
    stopHeartbeatPush();
    setTimeout(() => {
      connect();
    }, RECONNECT_DELAY_MS);
  });

  socket.on("error", (error) => {
    const details = error && error.message ? error.message : "Erreur inconnue";
    console.log("[RaspberryClient] Erreur WS:", details);
  });
}

connect();
