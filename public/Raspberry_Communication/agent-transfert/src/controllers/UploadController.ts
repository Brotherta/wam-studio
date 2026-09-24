import type { Request, Response } from "express";
import type { UploadService } from "../services/UploadService";

export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  public async upload(req: Request, res: Response): Promise<void> {
    try {
      await this.uploadService.traiterRequeteUpload(req, res);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur upload inconnue.";
      if (!res.headersSent) {
        res.status(500).json({ ok: false, error: message });
      }
    }
  }
}
