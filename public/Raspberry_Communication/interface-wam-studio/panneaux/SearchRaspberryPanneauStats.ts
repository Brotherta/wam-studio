export type HotePanneauStats = {
  statsPanel: HTMLDivElement;
  runtimeSummaryText: HTMLDivElement;
  activePanelId: string | null;
};

export function monterPanneauStats(hote: HotePanneauStats): void {
  hote.statsPanel.id = "search-raspberry-stats-panel";
  hote.statsPanel.style.marginTop = "8px";
  hote.statsPanel.style.padding = "8px";
  hote.statsPanel.style.border = "1px solid #3b4046";
  hote.statsPanel.style.borderRadius = "8px";
  hote.statsPanel.style.backgroundColor = "#1a2026";

  hote.runtimeSummaryText.id = "search-raspberry-runtime-summary";
  hote.runtimeSummaryText.style.fontSize = "12px";
  hote.runtimeSummaryText.style.color = "#f1f1f1";
  hote.runtimeSummaryText.innerHTML = "Chargement des informations serveur...";
  hote.statsPanel.appendChild(hote.runtimeSummaryText);
}

export function afficherResumeRuntime(
  runtimeSummaryText: HTMLDivElement,
  payload: Record<string, unknown>
): void {
  const status = typeof payload.status === "string" ? payload.status : "OFF";
  const controllers = typeof payload.controllerClients === "number" ? payload.controllerClients : 0;
  const raspberries = typeof payload.raspberryClients === "number" ? payload.raspberryClients : 0;
  const metrics = payload && typeof payload.metrics === "object" && payload.metrics !== null
    ? payload.metrics as Record<string, unknown>
    : {};
  runtimeSummaryText.innerHTML =
    `Etat serveur Raspberry: <strong>${status}</strong>. ` +
    `Controleurs connectes: <strong>${controllers}</strong>, Raspberry connectees: <strong>${raspberries}</strong>.` +
    `<ul style="margin:8px 0 0 16px; padding:0;">` +
    `<li>Launch runtime: <strong>${metrics.launchRequests || 0}</strong></li>` +
    `<li>startControleur: <strong>${metrics.startControleur || 0}</strong></li>` +
    `<li>raspberryOpen: <strong>${metrics.raspberryOpen || 0}</strong></li>` +
    `<li>raspberryAlive: <strong>${metrics.raspberryAlive || 0}</strong></li>` +
    `<li>Heartbeat broadcast: <strong>${metrics.heartbeatBroadcasts || 0}</strong></li>` +
    `<li>RaspList broadcast: <strong>${metrics.raspListBroadcasts || 0}</strong></li>` +
    `<li>Network probe: <strong>${metrics.networkProbeRuns || 0}</strong></li>` +
    `<li>OSC unitaire: <strong>${metrics.sendOSCmessage || 0}</strong></li>` +
    `<li>OSC broadcast: <strong>${metrics.broadcastOSCmessage || 0}</strong></li>` +
    `<li>Envoi fichier son: <strong>${metrics.sendSoundFile || 0}</strong></li>` +
    `</ul>`;
}
