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
import { fusionnerInfoRaspberry } from "../../utils/agent-transfert/AgentTransfertHelpers";

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
    const ipsAttendues: string[] = [];
    record.raspConfig.forEach((item: unknown) => {
      const ip = extraireAdresseIpDepuisMessage(item);
      if (ip.length === 0) {
        return;
      }
      ipsAttendues.push(ip);
      const mac = extraireAdresseMacDepuisMessage(item);
      const existing = hote.raspberryMap.get(ip);
      const lastHeartbeatMs = existing ? existing.lastHeartbeatMs : 0;
      const pingOk = existing ? existing.pingOk : false;
      const arpSeen = existing ? existing.arpSeen : false;
      const networkCheckedAtMs = existing ? existing.networkCheckedAtMs : 0;
      const isOnline = existing ? existing.isOnline : false;
      hote.upsertRaspberry(
        ip,
        mac,
        "",
        isOnline,
        true,
        lastHeartbeatMs,
        existing ? existing.offlineReason : "En attente de heartbeat",
        pingOk,
        arpSeen,
        networkCheckedAtMs
      );
    });
    if (ipsAttendues.length > 0) {
      hote.synchroniserListeAttendueDepuisIps(ipsAttendues);
    }
    return;
  }

  if (messageType === "oscSent" && record.target && typeof record.target === "object") {
    const target = record.target as Record<string, unknown>;
    const ip = typeof target.ipAddress === "string" ? target.ipAddress : "";
    if (ip.length > 0) {
      const adresse = typeof target.address === "string" ? target.address : "/?";
      const args = Array.isArray(target.args) ? target.args.join(" ") : "";
      const port = typeof target.port === "number" ? target.port : 4000;
      hote.oscLastStatusByIp.set(ip, {
        ok: true,
        atMs: Date.now(),
        text:
          `OSC UDP envoye a ${ip}:${port}\n` +
          `- commande: ${adresse}${args ? ` ${args}` : ""}\n` +
          `- si aucun son: verifier que PureData/skini ecoute sur le port ${port}.`,
      });
      hote.rafraichirPanneauDetailsSiSelectionne(ip);
    }
    return;
  }

  if (messageType === "oscBroadcastResult") {
    const sentCount = typeof record.sentCount === "number" ? record.sentCount : 0;
    hote.setStatus(`Commande envoyee a ${sentCount} Raspberry.`);
    return;
  }

  if (messageType === "oscError") {
    const errorText = typeof record.error === "string" ? record.error : "Erreur OSC";
    const ip =
      typeof record.raspIP === "string" && record.raspIP.length > 0
        ? record.raspIP
        : hote.selectedRaspberryIp;
    if (ip) {
      hote.oscLastStatusByIp.set(ip, {
        ok: false,
        atMs: Date.now(),
        text: `Echec: ${errorText}`,
      });
      hote.rafraichirPanneauDetailsSiSelectionne(ip);
    }
    return;
  }

  if (messageType === "agentTransfertStartResult") {
    const message =
      typeof record.message === "string" && record.message.length > 0
        ? record.message
        : "Demarrage de l'agent de transfert...";
    hote.setStatus(message);
    if (record.running === true) {
      hote.mettreAJourEtatAgentTransfert(true, message);
    }
    return;
  }

  if (messageType === "agentTransfertStatus") {
    const running = record.running === true;
    const message = running
      ? "Agent de transfert actif (port 3100)."
      : "Agent de transfert arrete.";
    hote.mettreAJourEtatAgentTransfert(running, message);
    return;
  }

  if (
    messageType === "raspberryParcState" ||
    messageType === "openDhcpScanResult" ||
    messageType === "raspberryParcApplyResult" ||
    messageType === "addRaspberryEntryResult" ||
    messageType === "syncRaspberryFromNetworkResult"
  ) {
    if (record.ok === false && typeof record.error === "string" && record.error.length > 0) {
      hote.setStatus(record.error);
      return;
    }
    if (messageType === "syncRaspberryFromNetworkResult" && record.ok === true) {
      const ajoutes = typeof record.addedCount === "number" ? record.addedCount : 0;
      const dejaPresents = typeof record.alreadyPresentCount === "number" ? record.alreadyPresentCount : 0;
      const detectes = typeof record.raspberriesDetectes === "number" ? record.raspberriesDetectes : 0;
      hote.setStatus(
        `Synchronisation terminee: ${detectes} Raspberry detecte(s), ${ajoutes} ajoute(s) a la liste, ${dejaPresents} deja present(s).`
      );
    }
    hote.synchroniserEtatParc(record);
    hote.sendMessage({ type: "getRaspConfig" });
    hote.sendMessage({ type: "requestRaspList" });
    hote.sendMessage({ type: "getRaspNetworkStatus" });
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
      if (ip.length === 0 || !hote.isExpectedIp(ip)) {
        return;
      }
      const mac = extraireAdresseMacDepuisMessage(item);
      const infoBrute = extraireTexteInfoDepuisMessage(item);
      const lastHeartbeatMs = extraireDernierHeartbeatDepuisMessage(item);
      const expected = hote.isExpectedIp(ip);
      const existing = hote.raspberryMap.get(ip);
      const pingOk = existing ? existing.pingOk : false;
      const arpSeen = existing ? existing.arpSeen : false;
      const networkCheckedAtMs = existing ? existing.networkCheckedAtMs : 0;
      const info = fusionnerInfoRaspberry(ip, infoBrute, existing?.info);
      hote.upsertRaspberry(ip, mac, info, true, expected, lastHeartbeatMs, "", pingOk, arpSeen, networkCheckedAtMs);
    });
    return;
  }

  if (messageType === "raspNetworkStatus" && Array.isArray(record.networkStatus)) {
    record.networkStatus.forEach((item: unknown) => {
      const ip = extraireAdresseIpDepuisMessage(item);
      if (ip.length === 0 || !hote.isExpectedIp(ip)) {
        return;
      }
      const existing = hote.raspberryMap.get(ip);
      const mac = extraireAdresseMacDepuisMessage(item) || (existing ? existing.mac : "");
      const info = existing ? existing.info : "";
      const lastHeartbeatMs = existing ? existing.lastHeartbeatMs : 0;
      const offlineReason = existing ? existing.offlineReason : "En attente de heartbeat";
      const isOnline = existing ? existing.isOnline : false;
      const pingOk = extrairePingOkDepuisMessage(item);
      const arpSeen = extraireArpVuDepuisMessage(item);
      const networkCheckedAtMs = extraireHorodatageSondageReseauDepuisMessage(item);
      hote.upsertRaspberry(
        ip,
        mac,
        info,
        isOnline,
        hote.isExpectedIp(ip),
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
    if (ip.length === 0 || !hote.isExpectedIp(ip)) {
      return;
    }
    const mac = extraireAdresseMacDepuisMessage(record);
    const infoBrute = extraireTexteInfoDepuisMessage(record);
    const lastHeartbeatMs = extraireDernierHeartbeatDepuisMessage(record);
    const expected = hote.isExpectedIp(ip);
    const existing = hote.raspberryMap.get(ip);
    const pingOk = existing ? existing.pingOk : false;
    const arpSeen = existing ? existing.arpSeen : false;
    const networkCheckedAtMs = existing ? existing.networkCheckedAtMs : 0;
    const info = fusionnerInfoRaspberry(ip, infoBrute, existing?.info);
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
