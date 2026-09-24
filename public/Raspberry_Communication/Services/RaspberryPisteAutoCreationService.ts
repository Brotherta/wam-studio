import type Raspberry from "../Models/Raspberry";
import type RaspberryPisteLiaisonService from "./RaspberryPisteLiaisonService";
import { extraireNumeroRaspberryDepuisIp } from "../utils/agent-transfert/AgentTransfertHelpers";

/**
 * Cree ou relie automatiquement une piste WAM pour chaque Raspberry en ligne.
 */
export default class RaspberryPisteAutoCreationService {
  private readonly ipsEnCoursCreation = new Set<string>();
  private readonly idsDejaAssures = new Set<number>();

  constructor(private readonly liaison: RaspberryPisteLiaisonService) {}

  public async traiterCarteRaspberry(
    raspberryMap: Map<string, Raspberry>,
    ipsAttendues: string[]
  ): Promise<void> {
    for (const ip of ipsAttendues) {
      const raspberry = raspberryMap.get(ip);
      if (!raspberry) {
        continue;
      }
      await this.traiterRaspberry(ip, raspberry);
    }
  }

  private async traiterRaspberry(ip: string, raspberry: Raspberry): Promise<void> {
    if (!raspberry.isOnline) {
      return;
    }
    if (this.ipsEnCoursCreation.has(ip)) {
      return;
    }

    const raspberryId = extraireNumeroRaspberryDepuisIp(ip);
    if (!raspberryId) {
      return;
    }
    if (this.liaison.pistePresentePourRaspberry(raspberryId, ip)) {
      this.idsDejaAssures.add(raspberryId);
      return;
    }
    if (this.idsDejaAssures.has(raspberryId)) {
      return;
    }

    this.ipsEnCoursCreation.add(ip);
    try {
      const resultat = await this.liaison.assurerPistePourRaspberry(ip, raspberryId);
      this.idsDejaAssures.add(raspberryId);
      if (resultat.type === "existant") {
        return;
      }
      const action = resultat.type === "cree" ? "creee" : "reliee";
      console.info(
        `[RaspberryPiste] Piste ${action} automatiquement : ${resultat.nomPiste} (${ip})`
      );
    } catch (erreur) {
      const message = erreur instanceof Error ? erreur.message : String(erreur);
      console.warn(`[RaspberryPiste] Echec creation auto pour ${ip} : ${message}`);
    } finally {
      this.ipsEnCoursCreation.delete(ip);
    }
  }
}
