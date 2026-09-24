import { Router } from "express";

import type { UploadController } from "../controllers/UploadController";

import type { TransferService } from "../services/TransferService";



export function creerRoutesUpload(

  controller: UploadController,

  transferService: TransferService

): Router {

  const router = Router();



  router.get("/status/:transferId", (req, res) => {

    const snapshot = transferService.obtenirSnapshot(req.params.transferId);

    if (!snapshot) {

      res.status(404).json({ ok: false, error: "Transfert introuvable." });

      return;

    }

    res.json({ ok: true, ...snapshot });

  });



  router.post("/", (req, res) => {

    void controller.upload(req, res);

  });



  return router;

}


