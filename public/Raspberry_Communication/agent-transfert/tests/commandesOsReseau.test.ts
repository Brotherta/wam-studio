import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { commandePing, pingAReussi } = require("../../serveur/reseau/RaspberryServeurCommandesOs");
const {
  extraireIpEtMacDepuisLigneArp,
  extraireAppareilsDepuisTableArp,
} = require("../../serveur/reseau/RaspberryServeurDecouverteReseau");

describe("commandePing", () => {
  it("utilise ping -n sur Windows", () => {
    expect(commandePing("192.168.1.74", 800, "win32")).toBe("ping -n 1 -w 800 192.168.1.74");
  });

  it("utilise ping -c et -W en millisecondes sur macOS", () => {
    expect(commandePing("192.168.1.74", 800, "darwin")).toBe("ping -c 1 -W 800 192.168.1.74");
  });

  it("utilise ping -c et -W en secondes sur Linux", () => {
    expect(commandePing("192.168.1.74", 800, "linux")).toBe("ping -c 1 -W 1 192.168.1.74");
  });
});

describe("pingAReussi", () => {
  it("reconnait une reponse Windows (TTL=)", () => {
    expect(
      pingAReussi("Reply from 192.168.1.74: bytes=32 time=1ms TTL=64")
    ).toBe(true);
  });

  it("reconnait une reponse macOS / Linux (ttl=)", () => {
    expect(
      pingAReussi("64 bytes from 192.168.1.74: icmp_seq=0 ttl=64 time=1.234 ms")
    ).toBe(true);
  });

  it("refuse un timeout", () => {
    expect(pingAReussi("Request timed out.")).toBe(false);
    expect(pingAReussi("100% packet loss")).toBe(false);
  });
});

describe("extraireAppareilsDepuisTableArp", () => {
  it("lit le format Windows", () => {
    const texte = [
      "Interface: 192.168.1.10 --- 0x5",
      "  192.168.1.74          b8-27-eb-aa-bb-cc     dynamic",
    ].join("\n");
    expect(extraireAppareilsDepuisTableArp(texte, "192.168.1.")).toEqual([
      { ipAddress: "192.168.1.74", macAddress: "b8:27:eb:aa:bb:cc" },
    ]);
  });

  it("lit le format macOS", () => {
    const texte = "? (192.168.1.74) at b8:27:eb:aa:bb:cc on en0 ifscope [ethernet]";
    expect(extraireIpEtMacDepuisLigneArp(texte)).toEqual({
      ipAddress: "192.168.1.74",
      macBrute: "b8:27:eb:aa:bb:cc",
    });
    expect(extraireAppareilsDepuisTableArp(texte, "192.168.1.")).toEqual([
      { ipAddress: "192.168.1.74", macAddress: "b8:27:eb:aa:bb:cc" },
    ]);
  });
});
