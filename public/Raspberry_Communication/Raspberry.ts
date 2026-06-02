export default class Raspberry {
  public ip: string;
  public mac: string;
  public info: string;
  public isOnline: boolean;
  public isExpected: boolean;
  public lastHeartbeatMs: number;
  public lastUpdateText: string;
  public offlineReason: string;
  public pingOk: boolean;
  public arpSeen: boolean;
  public networkCheckedAtMs: number;

  constructor(
    ip: string,
    mac: string,
    info: string,
    isOnline: boolean,
    isExpected: boolean,
    lastHeartbeatMs: number,
    offlineReason: string,
    pingOk: boolean,
    arpSeen: boolean,
    networkCheckedAtMs: number
  ) {
    this.ip = ip;
    this.mac = mac;
    this.info = info;
    this.isOnline = isOnline;
    this.isExpected = isExpected;
    this.lastHeartbeatMs = lastHeartbeatMs;
    this.lastUpdateText = lastHeartbeatMs > 0 ? new Date(lastHeartbeatMs).toLocaleTimeString() : "Jamais";
    this.offlineReason = offlineReason;
    this.pingOk = pingOk;
    this.arpSeen = arpSeen;
    this.networkCheckedAtMs = networkCheckedAtMs;
  }

  public update(
    mac: string,
    info: string,
    isOnline: boolean,
    isExpected: boolean,
    lastHeartbeatMs: number,
    offlineReason: string,
    pingOk: boolean,
    arpSeen: boolean,
    networkCheckedAtMs: number
  ): void {
    if (mac.length > 0) {
      this.mac = mac;
    }
    this.info = info;
    this.isOnline = isOnline;
    this.isExpected = isExpected;
    this.lastHeartbeatMs = lastHeartbeatMs;
    this.lastUpdateText = lastHeartbeatMs > 0 ? new Date(lastHeartbeatMs).toLocaleTimeString() : "Jamais";
    this.offlineReason = offlineReason;
    this.pingOk = pingOk;
    this.arpSeen = arpSeen;
    this.networkCheckedAtMs = networkCheckedAtMs;
  }
}
