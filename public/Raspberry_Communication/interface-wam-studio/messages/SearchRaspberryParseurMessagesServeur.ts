import {
  extraireAdresseIpDepuisMessage,
  extraireAdresseMacDepuisMessage,
  extraireArpVuDepuisMessage,
  extraireDernierHeartbeatDepuisMessage,
  extraireHorodatageSondageReseauDepuisMessage,
  extrairePingOkDepuisMessage,
  extraireTexteInfoDepuisMessage,
} from "./SearchRaspberryExtracteursChampsMessage";
import { SearchRaspberryHoteApplicateurMessages } from "./SearchRaspberryHoteApplicateurMessages";

export async function lireMessageWebSocketCommeTexte(rawData: unknown): Promise<string> {
  if (typeof rawData === "string") {
    return rawData;
  }
  if (rawData instanceof Blob) {
    return await rawData.text();
  }
  if (rawData instanceof ArrayBuffer) {
    return new TextDecoder().decode(rawData);
  }
  return "";
}

export function extrairePayloadsDepuisTexteJson(messageText: string): unknown[] {
  try {
    const parsed = JSON.parse(messageText);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    if (parsed && typeof parsed === "object") {
      const record = parsed as Record<string, unknown>;
      if (typeof record.message === "string") {
        return extrairePayloadsDepuisTexteJson(record.message);
      }
      if (typeof record.data === "string") {
        return extrairePayloadsDepuisTexteJson(record.data);
      }
    }
    return [parsed];
  } catch {
    return [];
  }
}

export function appliquerPayloadMessageServeur(
  hote: SearchRaspberryHoteApplicateurMessages,
  payload: unknown
): void {
  if (!payload || typeof payload !== "object") {
    return;
  }

  const record = payload as Record<string, unknown>;
  const messageType = typeof record.type === "string" ? record.type : "";

  if (messageType === "raspConfig" && Array.isArray(record.raspConfig)) {
    record.raspConfig.forEach((item: unknown) => {
      const ip = extraireAdresseIpDepuisMessage(item);
      if (ip.length === 0) {
        return;
      }
      const mac = extraireAdresseMacDepuisMessage(item);
      const existing = hote.raspberryMap.get(ip);
      const lastHeartbeatMs = existing ? existing.lastHeartbeatMs : 0;
      const pingOk = existing ? existing.pingOk : false;
      const arpSeen = existing ? existing.arpSeen : false;
      const networkCheckedAtMs = existing ? existing.networkCheckedAtMs : 0;
      hote.upsertRaspberry(
        ip,
        mac,
        "",
        false,
        true,
        lastHeartbeatMs,
        "En attente de heartbeat",
        pingOk,
        arpSeen,
        networkCheckedAtMs
      );
    });
    return;
  }

  if (messageType === "runtimeSummary") {
    hote.storeRuntimeSummary(record as Record<string, unknown>);
    return;
  }

  if (messageType === "addRaspberryEntryResult") {
    if (record.ok === false) {
      hote.setAddStatus(typeof record.error === "string" ? record.error : "Ajout echoue.");
      return;
    }
    const ip = typeof record.ipAddress === "string" ? record.ipAddress : "";
    const mac = typeof record.macAddress === "string" ? record.macAddress : "";
    const iniFile = typeof record.iniFilePath === "string" ? record.iniFilePath : "";
    const backup = typeof record.backupPath === "string" ? record.backupPath : "";
    hote.setAddStatus(
      `Ajout reussi: ${ip} (${mac}).` +
        (iniFile.length > 0 ? ` Fichier: ${iniFile}` : "") +
        (backup.length > 0 ? ` (sauvegarde .bak creee)` : "")
    );
    hote.addMacInput.value = "";
    hote.addIpInput.value = "";
    hote.sendMessage({ type: "getRaspConfig" });
    hote.sendMessage({ type: "requestRaspList" });
    hote.sendMessage({ type: "getRaspNetworkStatus" });
    return;
  }

  if (messageType === "oscSent" && record.target && typeof record.target === "object") {
    const target = record.target as Record<string, unknown>;
    const ip = typeof target.ipAddress === "string" ? target.ipAddress : "";
    if (ip.length > 0) {
      hote.oscLastStatusByIp.set(ip, {
        ok: true,
        atMs: Date.now(),
        text:
          `OSC envoye (UDP OK cote PC).\n- ip: ${ip}\n- port: ${target.port}\n- address: ${target.address}\n- args: ${JSON.stringify(target.args)}`,
      });
      hote.rafraichirPanneauDetailsSiSelectionne(ip);
    }
    return;
  }

  if (messageType === "oscBroadcastResult") {
    const sentCount = typeof record.sentCount === "number" ? record.sentCount : 0;
    const failedCount = typeof record.failedCount === "number" ? record.failedCount : 0;
    hote.setStatus(`OSC broadcast: ${sentCount} OK / ${failedCount} erreurs.`);
    return;
  }

  if (messageType === "oscError") {
    const errorText = typeof record.error === "string" ? record.error : "Erreur OSC inconnue";
    const ip =
      typeof record.raspIP === "string" && record.raspIP.length > 0
        ? record.raspIP
        : hote.selectedRaspberryIp;
    if (ip) {
      hote.oscLastStatusByIp.set(ip, {
        ok: false,
        atMs: Date.now(),
        text: `Erreur OSC.\n- ip: ${ip}\n- details: ${errorText}`,
      });
      hote.rafraichirPanneauDetailsSiSelectionne(ip);
    }
    return;
  }

  if (messageType === "raspberryParcState") {
    hote.applyParcState(record);
    hote.renderList();
    return;
  }

  if (messageType === "openDhcpScanResult") {
    if (record.ok === false) {
      hote.parcStatusText.innerText = typeof record.error === "string" ? record.error : "Scan INI echoue.";
      return;
    }
    const catalog = Array.isArray(record.catalog) ? record.catalog : [];
    const listenNumbers = Array.isArray(record.listenNumbers)
      ? record.listenNumbers
          .map((value: unknown) => Number.parseInt(`${value}`, 10))
          .filter((value: number) => Number.isFinite(value))
      : hote.mergeListenNumbers([], catalog as Array<{ number: number; mac: string; ipAddress: string }>);
    hote.updateActiveExpectedFromNumbers(listenNumbers);
    hote.rebuildParcSelect(catalog, listenNumbers);
    const iniName = typeof record.iniFileName === "string" ? record.iniFileName : "fichier .ini";
    hote.parcStatusText.innerText =
      `Fichier trouve: ${iniName}. ${catalog.length} Raspberry dans le INI ajoutes a la liste a ecouter.`;
    hote.sendMessage({ type: "getRaspConfig" });
    hote.sendMessage({ type: "requestRaspList" });
    hote.sendMessage({ type: "getRaspNetworkStatus" });
    hote.renderList();
    return;
  }

  if (messageType === "raspberryParcApplyResult") {
    if (record.ok === false) {
      hote.parcStatusText.innerText = typeof record.error === "string" ? record.error : "Application echouee.";
      return;
    }
    const activeNumbers = Array.isArray(record.activeNumbers)
      ? record.activeNumbers
          .map((value: unknown) => Number.parseInt(`${value}`, 10))
          .filter((value: number) => Number.isFinite(value))
      : [];
    const catalog = Array.isArray(record.catalog) ? record.catalog : [];
    const listenNumbers = Array.isArray(record.listenNumbers)
      ? record.listenNumbers
          .map((value: unknown) => Number.parseInt(`${value}`, 10))
          .filter((value: number) => Number.isFinite(value))
      : hote.mergeListenNumbers(activeNumbers, catalog as Array<{ number: number; mac: string; ipAddress: string }>);
    hote.updateActiveExpectedFromNumbers(listenNumbers);
    hote.rebuildParcSelect(catalog, listenNumbers);
    hote.parcStatusText.innerText =
      `Liste a ecouter mise a jour (${activeNumbers.join(", ")}). Le fichier INI n'a pas ete modifie.`;
    hote.sendMessage({ type: "getRaspConfig" });
    hote.sendMessage({ type: "requestRaspList" });
    hote.sendMessage({ type: "getRaspNetworkStatus" });
    hote.renderList();
    return;
  }

  if (messageType === "raspList") {
    const onlineList = Array.isArray(record.raspList)
      ? record.raspList
      : Array.isArray(record.list)
        ? record.list
        : [];
    hote.markAllRaspberriesOffline();
    onlineList.forEach((item: unknown) => {
      const ip = extraireAdresseIpDepuisMessage(item);
      if (ip.length === 0) {
        return;
      }
      const mac = extraireAdresseMacDepuisMessage(item);
      const info = extraireTexteInfoDepuisMessage(item);
      const lastHeartbeatMs = extraireDernierHeartbeatDepuisMessage(item);
      const expected = hote.isExpectedIp(ip);
      const existing = hote.raspberryMap.get(ip);
      const pingOk = existing ? existing.pingOk : false;
      const arpSeen = existing ? existing.arpSeen : false;
      const networkCheckedAtMs = existing ? existing.networkCheckedAtMs : 0;
      hote.upsertRaspberry(ip, mac, info, true, expected, lastHeartbeatMs, "", pingOk, arpSeen, networkCheckedAtMs);
    });
    return;
  }

  if (messageType === "raspNetworkStatus" && Array.isArray(record.networkStatus)) {
    record.networkStatus.forEach((item: unknown) => {
      const ip = extraireAdresseIpDepuisMessage(item);
      if (ip.length === 0) {
        return;
      }
      const existing = hote.raspberryMap.get(ip);
      const mac = extraireAdresseMacDepuisMessage(item) || (existing ? existing.mac : "");
      const info = existing ? existing.info : "";
      const isOnline = existing ? existing.isOnline : false;
      const isExpected = hote.isExpectedIp(ip);
      const lastHeartbeatMs = existing ? existing.lastHeartbeatMs : 0;
      const offlineReason = existing ? existing.offlineReason : "En attente de heartbeat";
      const pingOk = extrairePingOkDepuisMessage(item);
      const arpSeen = extraireArpVuDepuisMessage(item);
      const networkCheckedAtMs = extraireHorodatageSondageReseauDepuisMessage(item);
      hote.upsertRaspberry(
        ip,
        mac,
        info,
        isOnline,
        isExpected,
        lastHeartbeatMs,
        offlineReason,
        pingOk,
        arpSeen,
        networkCheckedAtMs
      );
    });
    return;
  }

  if (messageType === "raspberryAlive" || messageType === "raspberryOpen") {
    const ip = extraireAdresseIpDepuisMessage(record);
    if (ip.length === 0) {
      return;
    }
    const mac = extraireAdresseMacDepuisMessage(record);
    const info = extraireTexteInfoDepuisMessage(record);
    const lastHeartbeatMs = extraireDernierHeartbeatDepuisMessage(record);
    const expected = hote.isExpectedIp(ip);
    const existing = hote.raspberryMap.get(ip);
    const pingOk = existing ? existing.pingOk : false;
    const arpSeen = existing ? existing.arpSeen : false;
    const networkCheckedAtMs = existing ? existing.networkCheckedAtMs : 0;
    hote.upsertRaspberry(ip, mac, info, true, expected, lastHeartbeatMs, "", pingOk, arpSeen, networkCheckedAtMs);
  }
}

export async function traiterMessageBrutServeur(
  hote: SearchRaspberryHoteApplicateurMessages,
  rawData: unknown
): Promise<void> {
  const messageText = await lireMessageWebSocketCommeTexte(rawData);
  if (messageText.length === 0) {
    return;
  }
  const payloads = extrairePayloadsDepuisTexteJson(messageText);
  payloads.forEach((payload) => {
    appliquerPayloadMessageServeur(hote, payload);
  });
}
