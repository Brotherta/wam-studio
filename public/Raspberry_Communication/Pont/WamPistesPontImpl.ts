import App from "../../src/App";
import OperableAudioBuffer from "../../src/Audio/OperableAudioBuffer";
import type { ProjectData } from "../../src/Loader/Loader";
import SampleRegion from "../../src/Models/Region/SampleRegion";
import type { IWamPistesPont, PisteRaspberryCreee, PositionLibelleRegion, PositionMarqueurPiste, RegionAjouteePiste, RegionAudioPiste, RegionPisteRaspberry, SessionProjetLocale } from "../Interfaces/IWamPistesPont";
import { creerBinding } from "../Models/RaspberryTrackBinding";
import { appliquerIndicateurRaspberry } from "../Services/RaspberryIndicateurPisteUi";
import { raspberryTrackBindingStore } from "../Services/RaspberryTrackBindingStore";
import { enregistrerRegionSon, trouverSonPourRegion, type EntreeRegionSonPersiste } from "../Services/RaspberryRegionSonStore";
import { formaterNomPisteRaspberry, lireNumeroRaspberryDepuisElementPiste, lireNumeroRaspberryDepuisNomPiste } from "../utils/agent-transfert/AgentTransfertHelpers";
import { formaterNomAfficheSon } from "../utils/osc/NomSonPiste";
import { lireLibelleSon } from "../Services/RaspberryLibellesSonsStore";
import { HEIGHT_TRACK, RATIO_MILLS_BY_PX } from "../../src/Env";
import EditorView from "../../src/Views/Editor/EditorView";
import { calculerTempsMsDepuisXCanvas } from "../utils/osc/TempsMarqueurPiste";

/**
 * Implementation du pont WAM : creation de pistes et navigation dans l'editeur.
 */
export default class WamPistesPontImpl implements IWamPistesPont {
  private gainSortieHautParleurs: GainNode | undefined;

  constructor(private readonly app: App) {
    this.exposerOutilsAudioConsole(this.contexteAudio());
  }

  public async creerPistePourRaspberry(
    raspberryIp: string,
    raspberryId: number,
    sonNumber: number
  ): Promise<PisteRaspberryCreee> {
    const track = await this.app.tracksController.createTrack();
    const nomPiste = formaterNomPisteRaspberry(raspberryId);

    track.element.name = nomPiste;
    track.element.trackNameInput.value = nomPiste;

    const binding = raspberryTrackBindingStore.enregistrer(
      creerBinding(track.id, raspberryIp, raspberryId, sonNumber)
    );
    appliquerIndicateurRaspberry(track, binding);

    return { trackId: track.id, nomPiste, binding };
  }

  public focusPiste(trackId: number): void {
    const track = this.app.tracksController.getTrackById(trackId);
    if (!track) {
      return;
    }
    track.element.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  public lireNomPiste(trackId: number): string | undefined {
    const track = this.app.tracksController.getTrackById(trackId);
    return track?.element.name;
  }

  public async exporterPisteVersWave(trackId: number): Promise<Blob | null> {
    const track = this.app.tracksController.getTrackById(trackId);
    if (!track) {
      return null;
    }
    return this.app.exportController.exportTrackToWaveBlob(track);
  }

  public compterRegionsAudioPiste(trackId: number): number {
    return this.lireRegionsAudioOrdonnees(trackId).length;
  }

  public exporterRegionsAudioPiste(trackId: number): Blob[] {
    return this.lireRegionsAudioOrdonnees(trackId).map((region) => region.save());
  }

  public pisteADuContenu(trackId: number): boolean {
    const track = this.app.tracksController.getTrackById(trackId);
    return (track?.regions.length ?? 0) > 0;
  }

  public pisteExiste(trackId: number): boolean {
    return this.app.tracksController.getTrackById(trackId) !== undefined;
  }

  public trouverPisteIdParNumeroRaspberry(raspberryId: number): number | undefined {
    const candidates: number[] = [];
    for (const track of this.app.tracksController.tracks) {
      if (lireNumeroRaspberryDepuisElementPiste(track.element) === raspberryId) {
        candidates.push(track.id);
      }
    }
    if (candidates.length === 0) {
      return undefined;
    }
    candidates.sort(
      (idA, idB) =>
        this.lireRegionsAudioOrdonnees(idB).length - this.lireRegionsAudioOrdonnees(idA).length
    );
    return candidates[0];
  }

  public listerRegionsPistesRaspberry(): RegionPisteRaspberry[] {
    const resultat: RegionPisteRaspberry[] = [];
    for (const track of this.app.tracksController.tracks) {
      const binding = raspberryTrackBindingStore.trouverParTrackId(track.id);
      if (binding && binding.liee === false) {
        continue;
      }
      const raspberryId = lireNumeroRaspberryDepuisElementPiste(track.element);
      if (raspberryId === undefined) {
        continue;
      }
      const regions = this.lireRegionsAudioOrdonnees(track.id);
      for (let indexOrdre = 0; indexOrdre < regions.length; indexOrdre++) {
        const region = regions[indexOrdre];
        if (!region) {
          continue;
        }
        const meta = trouverSonPourRegion(
          raspberryId,
          region.start,
          region.id,
          track.id,
          region.duration,
          indexOrdre
        );
        resultat.push({
          trackId: track.id,
          regionId: region.id,
          raspberryId,
          nomPiste: track.element.name,
          startMs: region.start,
          durationMs: region.duration,
          endMs: region.start + region.duration,
          sonNumber: meta?.sonNumber ?? null,
          nomFichier: meta?.nomFichier ?? "",
          nomAffiche: formaterNomAfficheSon(meta?.nomFichier ?? "", {
            libelle:
              lireLibelleSonPourRegion(track.id, raspberryId, meta?.nomFichier) ??
              meta?.nomAffiche,
            sonNumber: meta?.sonNumber,
          }),
        });
      }
    }
    return resultat.sort((a, b) => a.startMs - b.startMs || a.raspberryId - b.raspberryId);
  }

  public listerRegionsAudioPiste(trackId: number): RegionAudioPiste[] {
    return this.lireRegionsAudioOrdonnees(trackId).map((region) => ({
      regionId: region.id,
      startMs: region.start,
      durationMs: region.duration,
      endMs: region.start + region.duration,
    }));
  }

  public listerPositionsLibellesRegions(): PositionLibelleRegion[] {
    const regions = this.listerRegionsPistesRaspberry();
    const viewport = this.app.editorView.viewport;
    const resultat: PositionLibelleRegion[] = [];

    for (const region of regions) {
      const waveform = this.app.editorView.getWaveFormViewById(region.trackId);
      if (!waveform || !region.nomAffiche || region.nomAffiche === "son ?") {
        continue;
      }

      const x = region.startMs / RATIO_MILLS_BY_PX - viewport.left;
      const y =
        waveform.position.y -
        viewport.top +
        EditorView.PLAYHEAD_HEIGHT +
        EditorView.LOOP_HEIGHT +
        4;
      const largeurRegion = region.durationMs / RATIO_MILLS_BY_PX;
      const visible =
        x + largeurRegion >= 0 &&
        x <= viewport.worldWidth &&
        y >= -HEIGHT_TRACK &&
        y <= viewport.worldHeight;

      resultat.push({
        trackId: region.trackId,
        regionId: region.regionId,
        nomAffiche: region.nomAffiche,
        x,
        y,
        visible,
      });
    }

    return resultat;
  }

  public lirePlayheadMs(): number {
    const valeur = this.app.host.playhead;
    return Number.isFinite(valeur) ? Math.max(0, valeur) : 0;
  }

  public lirePositionMarqueurPiste(tempsMs: number): PositionMarqueurPiste {
    const viewport = this.app.editorView.viewport;
    const ratio = RATIO_MILLS_BY_PX > 0 ? RATIO_MILLS_BY_PX : 16.85;
    const x = tempsMs / ratio - viewport.left;
    const y = EditorView.PLAYHEAD_HEIGHT + EditorView.LOOP_HEIGHT - viewport.top;
    const hauteur = Math.max(40, viewport.worldHeight - Math.max(0, y));
    const visible = x >= -12 && x <= viewport.worldWidth + 12;
    return { x, y, hauteur, visible };
  }

  public lireTempsMsDepuisXCanvas(xCanvas: number): number {
    const viewport = this.app.editorView.viewport;
    return calculerTempsMsDepuisXCanvas(xCanvas, viewport.left, RATIO_MILLS_BY_PX);
  }

  public lectureEstActive(): boolean {
    return this.app.host.isPlaying === true;
  }

  public pauserLecture(): void {
    this.app.host.pause();
  }

  public reprendreLecture(): void {
    void this.reprendreContexteAudioSiBesoin().finally(() => {
      this.rebrancherSortieAudio();
      this.app.host.play();
    });
  }

  public async reprendreContexteAudioSiBesoin(): Promise<void> {
    const ctx = this.contexteAudio();
    this.exposerOutilsAudioConsole(ctx);
    if (!ctx || typeof ctx.resume !== "function") {
      return;
    }
    const etaitActif = ctx.state === "running";
    if (!etaitActif) {
      try {
        await ctx.resume();
      } catch {
        return;
      }
      this.rebrancherSortieAudio();
    }
  }

  public rebrancherSortieAudio(): void {
    const ctx = this.contexteAudio();
    if (!ctx) {
      return;
    }
    this.assurerPontHautParleurs(ctx);
    this.rebrancherPistesVersHost();
    this.exposerOutilsAudioConsole(ctx);
    void this.reinitialiserPeripheriqueSortie(ctx);
  }

  public reglerVolumePistes(volume01: number, sonNumber?: number): void {
    const volume = Math.min(1, Math.max(0, volume01));
    for (const piste of this.pistesCiblesOsc(sonNumber)) {
      piste.isMuted = volume <= 0;
      piste.volume = volume;
    }
    if (sonNumber === undefined) {
      this.app.host.isMuted = volume <= 0;
      this.app.host.volume = volume;
    }
  }

  public reglerMutePistes(mute: boolean, sonNumber?: number): void {
    for (const piste of this.pistesCiblesOsc(sonNumber)) {
      piste.isMuted = mute;
    }
    if (sonNumber === undefined) {
      this.app.host.isMuted = mute;
    }
  }

  public lireVolumePistes(sonNumber?: number): number {
    const premiere = this.pistesCiblesOsc(sonNumber)[0];
    if (!premiere) {
      return this.app.host.isMuted ? 0 : this.app.host.volume;
    }
    return premiere.isMuted ? 0 : premiere.volume;
  }

  private pistesCiblesOsc(sonNumber?: number) {
    const toutes = [...this.app.tracksController.tracks];
    if (sonNumber === undefined) {
      return toutes;
    }
    const ids = new Set(
      raspberryTrackBindingStore
        .tous()
        .filter((binding) => binding.sonNumber === sonNumber)
        .map((binding) => binding.trackId)
    );
    const filtrees = toutes.filter((piste) => ids.has(piste.id));
    if (filtrees.length > 0) {
      return filtrees;
    }
    const raspIds = new Set(raspberryTrackBindingStore.tous().map((binding) => binding.trackId));
    const rasp = toutes.filter((piste) => raspIds.has(piste.id));
    return rasp.length > 0 ? rasp : toutes;
  }

  private contexteAudio(): AudioContext | undefined {
    const ctx = this.app.host.audioContext;
    if (ctx && typeof (ctx as AudioContext).resume === "function") {
      return ctx as AudioContext;
    }
    return undefined;
  }

  private assurerPontHautParleurs(ctx: AudioContext): void {
    const sortieHost = this.app.host.outputNode;
    try {
      sortieHost.disconnect(ctx.destination);
    } catch {
      /* pas encore branche, ou deja debranche */
    }
    if (!this.gainSortieHautParleurs) {
      this.gainSortieHautParleurs = ctx.createGain();
      this.gainSortieHautParleurs.gain.value = 1;
    }
    this.brancherSansDoublon(sortieHost, this.gainSortieHautParleurs);
    this.brancherSansDoublon(this.gainSortieHautParleurs, ctx.destination);
  }

  private rebrancherPistesVersHost(): void {
    let entreeHost: AudioNode;
    try {
      entreeHost = this.app.host.audioInputNode;
    } catch {
      return;
    }
    this.app.tracksController.tracks.forEach((piste) => {
      try {
        piste.outputNode.disconnect(entreeHost);
      } catch {
        /* pas branche */
      }
      this.brancherSansDoublon(piste.outputNode, entreeHost);
    });
  }

  private brancherSansDoublon(source: AudioNode, destination: AudioNode): void {
    try {
      source.connect(destination);
    } catch {
      /* deja connecte */
    }
  }

  private async reinitialiserPeripheriqueSortie(ctx: AudioContext): Promise<void> {
    const ctxSortie = ctx as AudioContext & {
      setSinkId?: (id: string) => Promise<void>;
    };
    if (typeof ctxSortie.setSinkId !== "function") {
      return;
    }
    try {
      await ctxSortie.setSinkId("");
    } catch {
      return;
    }
  }

  private exposerOutilsAudioConsole(ctx: AudioContext | undefined): void {
    const w = window as Window & {
      wamAudioEtat?: () => string;
      wamAudioBip?: () => string;
      wamAudioReconnect?: () => string;
    };
    w.wamAudioEtat = () => this.decrireEtatAudio(ctx);
    w.wamAudioBip = () => this.jouerBipTest(ctx);
    w.wamAudioReconnect = () => {
      this.rebrancherSortieAudio();
      return "sortie recablee — relance Play";
    };
  }

  private decrireEtatAudio(ctx: AudioContext | undefined): string {
    if (!ctx) {
      return "contexte audio introuvable";
    }
    const gainHost = this.lireGainNoeud(this.app.host.outputNode);
    const ctxSortie = ctx as AudioContext & { sinkId?: string };
    const lignesPistes: string[] = [];
    this.app.tracksController.tracks.forEach((piste) => {
      lignesPistes.push(
        [
          piste.element?.name || ("piste " + String(piste.id)),
          "mute=" + String(piste.isMuted),
          "solo=" + String(piste.isSolo),
          "soloMute=" + String(piste.isSoloMuted),
          "vol=" + String(piste.volume),
          "gain=" + String(this.lireGainNoeud(piste.outputNode))
        ].join(" ")
      );
    });
    return [
      [
        "state=" + ctx.state,
        "muted=" + String(this.app.host.isMuted),
        "volume=" + String(this.app.host.volume),
        "gainHost=" + String(gainHost),
        "playing=" + String(this.app.host.isPlaying),
        "playhead=" + String(Math.round(this.app.host.playhead)),
        "sink=" + String(ctxSortie.sinkId || "default"),
        "pistes=" + String(this.app.tracksController.tracks.length)
      ].join(" "),
      ...lignesPistes
    ].join(" | ");
  }

  private lireGainNoeud(noeud: AudioNode): number | string {
    const gain = (noeud as GainNode).gain;
    if (!gain) {
      return "?";
    }
    return gain.value;
  }

  private jouerBipTest(ctx: AudioContext | undefined): string {
    if (!ctx) {
      return "contexte audio introuvable";
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.value = 0.12;
    osc.frequency.value = 440;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
    return "bip 200ms — si tu n entends pas, sortie Chrome / onglet mute";
  }

  public abonnerPlayhead(onPlayhead: (playheadMs: number) => void): () => void {
    const observateur = (playheadMs: number): void => {
      onPlayhead(playheadMs);
    };
    this.app.host.onPlayHeadMove.add(observateur);
    return () => {
      this.app.host.onPlayHeadMove.delete(observateur);
    };
  }

  public lierPisteExistante(
    trackId: number,
    raspberryIp: string,
    raspberryId: number,
    sonNumber: number
  ): PisteRaspberryCreee {
    const track = this.app.tracksController.getTrackById(trackId);
    if (!track) {
      throw new Error(`Piste introuvable (id ${trackId}).`);
    }

    const nomPiste = formaterNomPisteRaspberry(raspberryId);
    track.element.name = nomPiste;
    track.element.trackNameInput.value = nomPiste;

    const binding = raspberryTrackBindingStore.enregistrer(
      creerBinding(trackId, raspberryIp, raspberryId, sonNumber)
    );
    appliquerIndicateurRaspberry(track, binding);

    return { trackId, nomPiste, binding };
  }

  public restaurerNomsPistesLiees(): void {
    for (const binding of raspberryTrackBindingStore.tous()) {
      if (!this.pisteExiste(binding.trackId)) {
        continue;
      }
      const track = this.app.tracksController.getTrackById(binding.trackId);
      if (!track) {
        continue;
      }
      appliquerIndicateurRaspberry(track, binding);
    }
  }

  public lireSignaturePistes(): string {
    return this.app.tracksController.tracks
      .map((track) => {
        const regions = track.regions
          .map((region) => `${region.id}:${region.start}:${region.duration}`)
          .join(",");
        return `${track.id}:${track.element.name}:${regions}`;
      })
      .join("|");
  }

  public async exporterSessionLocale(): Promise<SessionProjetLocale | null> {
    if (!this.app.loader) {
      return null;
    }
    const [project, contents] = await this.app.loader.saveProject();
    const regionsSons = this.exporterRegionsSonsDepuisProjet(project as ProjectData);
    return { project, contents, regionsSons };
  }

  public async importerSessionLocale(session: SessionProjetLocale): Promise<void> {
    const original = session.project as ProjectData;
    const projectSansAudio = {
      ...preparerProjetSansPlugins(original),
      tracks: original.tracks.map((piste) => ({
        ...piste,
        plugin: undefined,
        automations: [],
        regions: [],
      })),
    };
    try {
      await this.app.loader.loadProject(projectSansAudio, creerXhrVide);
      await this.chargerRegionsAudio(original, session.contents, session.regionsSons);
    } finally {
      this.finirChargementEditeur();
    }
  }

  private exporterRegionsSonsDepuisProjet(
    project: ProjectData
  ): Record<string, EntreeRegionSonPersiste> {
    const resultat: Record<string, EntreeRegionSonPersiste> = {};
    const pistes = this.app.tracksController.tracks.map((piste) => piste);

    for (let indexPiste = 0; indexPiste < project.tracks.length; indexPiste++) {
      const pisteJson = project.tracks[indexPiste];
      const track = pistes[indexPiste];
      if (!pisteJson || !track) {
        continue;
      }
      const raspberryId = lireNumeroRaspberryDepuisNomPiste(track.element.name);
      if (raspberryId === undefined) {
        continue;
      }

      const regionsLive = this.lireRegionsAudioOrdonnees(track.id);
      let indexOrdre = 0;

      for (const regionJson of pisteJson.regions) {
        if (regionJson.type !== "SAMPLE") {
          continue;
        }
        const regionLive =
          regionsLive.find((region) => Math.abs(region.start - regionJson.start) <= 120) ??
          regionsLive[indexOrdre];
        if (!regionLive) {
          indexOrdre++;
          continue;
        }

        const meta = trouverSonPourRegion(
          raspberryId,
          regionLive.start,
          regionLive.id,
          track.id,
          regionLive.duration,
          indexOrdre
        );
        if (!meta || !meta.nomAffiche || meta.nomAffiche === "son ?") {
          indexOrdre++;
          continue;
        }

        resultat[regionJson.content_name] = {
          raspberryId,
          startMs: regionJson.start,
          durationMs: regionLive.duration,
          sonNumber: meta.sonNumber,
          nomFichier: meta.nomFichier,
          nomAffiche: meta.nomAffiche,
          indexOrdre,
        };
        indexOrdre++;
      }
    }

    return resultat;
  }

  public finirChargementEditeur(): void {
    this.app.editorView.setLoading(false);
    this.app.pluginsView.setLoadingPlugin(null);
  }

  public async ajouterBlobAudioSurPiste(
    trackId: number,
    blob: Blob,
    positionDebutMs?: number
  ): Promise<RegionAjouteePiste> {
    const track = this.app.tracksController.getTrackById(trackId);
    if (!track) {
      throw new Error(`Piste introuvable (id ${trackId}).`);
    }

    const octets = await blob.arrayBuffer();
    const ctx = this.contexteAudio();
    if (!ctx) {
      throw new Error("Contexte audio introuvable.");
    }
    const audioBuffer = await ctx.decodeAudioData(octets.slice(0));
    const buffer = OperableAudioBuffer.make(audioBuffer).makeStereo();
    const debut =
      positionDebutMs !== undefined
        ? positionDebutMs
        : this.lireFinPisteMs(trackId);
    const region = new SampleRegion(buffer, debut);
    this.app.regionsController.addRegion(track, region);
    this.app.host.playhead = Math.floor(debut);
    return {
      regionId: region.id,
      debutMs: debut,
      finMs: debut + buffer.duration,
    };
  }

  private lireFinPisteMs(trackId: number): number {
    const regions = this.lireRegionsAudioOrdonnees(trackId);
    if (regions.length === 0) {
      return 0;
    }
    const derniere = regions[regions.length - 1];
    return derniere.start + derniere.duration;
  }

  private lireRegionsAudioOrdonnees(trackId: number): SampleRegion[] {
    const track = this.app.tracksController.getTrackById(trackId);
    if (!track) {
      return [];
    }
    return [...track.regions]
      .filter((region): region is SampleRegion => region instanceof SampleRegion)
      .sort((a, b) => a.start - b.start);
  }

  private async chargerRegionsAudio(
    project: ProjectData,
    contents: SessionProjetLocale["contents"],
    regionsSons?: Record<string, EntreeRegionSonPersiste>
  ): Promise<void> {
    const parNom = new Map(contents.map((contenu) => [contenu.content_name, contenu.blob]));
    const pistesCreees = this.app.tracksController.tracks.map((piste) => piste);
    for (let index = 0; index < project.tracks.length; index++) {
      const track = pistesCreees[index];
      const pisteJson = project.tracks[index];
      if (!track || !pisteJson) {
        continue;
      }
      const raspberryId = lireNumeroRaspberryDepuisNomPiste(track.element.name);
      let indexOrdre = 0;
      for (const regionJson of pisteJson.regions) {
        if (regionJson.type !== "SAMPLE") {
          continue;
        }
        const blob = parNom.get(regionJson.content_name);
        const octets = await lireOctetsAudio(blob);
        if (!octets) {
          indexOrdre++;
          continue;
        }
        const ctx = this.contexteAudio();
        if (!ctx) {
          indexOrdre++;
          continue;
        }
        const audioBuffer = await ctx.decodeAudioData(octets.slice(0));
        const buffer = OperableAudioBuffer.make(audioBuffer);
        const region = new SampleRegion(buffer, regionJson.start);
        this.app.regionsController.addRegion(track, region);

        const sauve = regionsSons?.[regionJson.content_name];
        if (sauve && raspberryId !== undefined && sauve.nomAffiche !== "son ?") {
          enregistrerRegionSon({
            ...sauve,
            trackId: track.id,
            regionId: region.id,
            raspberryId,
            startMs: region.start,
            durationMs: region.duration,
            indexOrdre: sauve.indexOrdre ?? indexOrdre,
          });
        }
        indexOrdre++;
      }
    }
  }
}

function preparerProjetSansPlugins(project: ProjectData): ProjectData {
  return {
    ...project,
    host: { ...project.host, plugin: undefined },
    tracks: project.tracks.map((piste) => ({
      ...piste,
      plugin: undefined,
      automations: [],
    })),
  };
}

function creerXhrVide(): XMLHttpRequest {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "data:,", true);
  xhr.responseType = "arraybuffer";
  return xhr;
}

async function lireOctetsAudio(donnees: unknown): Promise<ArrayBuffer | null> {
  if (!donnees) {
    return null;
  }
  if (donnees instanceof ArrayBuffer) {
    return donnees;
  }
  if (donnees instanceof Blob) {
    return donnees.arrayBuffer();
  }
  return null;
}

function lireLibelleSonPourRegion(
  trackId: number,
  raspberryId: number,
  nomFichier?: string
): string | undefined {
  if (!nomFichier) {
    return undefined;
  }
  const ip =
    raspberryTrackBindingStore.trouverParTrackId(trackId)?.raspberryIp ??
    raspberryTrackBindingStore.trouverPremierParRaspberryId(raspberryId)?.raspberryIp ??
    `192.168.1.${raspberryId}`;
  return lireLibelleSon(ip, nomFichier);
}
