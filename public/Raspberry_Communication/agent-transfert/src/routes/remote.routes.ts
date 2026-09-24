import { Router, type Request, type Response } from "express";
import type { RemoteFilesService } from "../services/RemoteFilesService";

export function creerRoutesRemote(remoteFilesService: RemoteFilesService): Router {
  const router = Router();

  router.post("/files/list", async (req: Request, res: Response) => {
    try {
      const sshHost = `${req.body?.sshHost ?? ""}`.trim();
      if (!sshHost) {
        res.status(400).json({ ok: false, error: "sshHost requis." });
        return;
      }

      const resultat = await remoteFilesService.listerFichiersAudio({
        sshHost,
        sshPort: Number.parseInt(`${req.body?.sshPort ?? 22}`, 10),
        sshUsername: `${req.body?.sshUsername ?? "pi"}`.trim() || "pi",
        sshPassword: `${req.body?.sshPassword ?? "raspberry"}`,
      });
      res.json(resultat);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur liste fichiers.";
      res.status(500).json({ ok: false, error: message });
    }
  });

  router.post("/files/delete", async (req: Request, res: Response) => {
    try {
      const sshHost = `${req.body?.sshHost ?? ""}`.trim();
      const fichiers = Array.isArray(req.body?.fichiers) ? req.body.fichiers : [];
      if (!sshHost) {
        res.status(400).json({ ok: false, error: "sshHost requis." });
        return;
      }
      if (fichiers.length === 0) {
        res.status(400).json({ ok: false, error: "fichiers requis (tableau non vide)." });
        return;
      }

      const resultat = await remoteFilesService.supprimerFichiersAudio({
        sshHost,
        sshPort: Number.parseInt(`${req.body?.sshPort ?? 22}`, 10),
        sshUsername: `${req.body?.sshUsername ?? "pi"}`.trim() || "pi",
        sshPassword: `${req.body?.sshPassword ?? "raspberry"}`,
        fichiers: fichiers.map((nom: unknown) => `${nom ?? ""}`),
      });
      res.json(resultat);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur suppression fichiers.";
      res.status(500).json({ ok: false, error: message });
    }
  });

  router.post("/files/download", async (req: Request, res: Response) => {
    try {
      const sshHost = `${req.body?.sshHost ?? ""}`.trim();
      const fichier = `${req.body?.fichier ?? ""}`.trim();
      if (!sshHost) {
        res.status(400).json({ ok: false, error: "sshHost requis." });
        return;
      }
      if (!fichier) {
        res.status(400).json({ ok: false, error: "fichier requis." });
        return;
      }

      const resultat = await remoteFilesService.telechargerFichierAudio({
        sshHost,
        sshPort: Number.parseInt(`${req.body?.sshPort ?? 22}`, 10),
        sshUsername: `${req.body?.sshUsername ?? "pi"}`.trim() || "pi",
        sshPassword: `${req.body?.sshPassword ?? "raspberry"}`,
        fichier,
      });
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("X-Fichier-Nom", resultat.nomFichier);
      res.send(resultat.contenu);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur telechargement fichier.";
      res.status(500).json({ ok: false, error: message });
    }
  });

  return router;
}
