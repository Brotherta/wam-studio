import type { Request, Response, NextFunction } from "express";

/**
 * WAM Studio (port 5002) active COEP require-corp : les requetes cross-origin
 * vers l'agent (port 3100) exigent CORS + Cross-Origin-Resource-Policy.
 */
export function corsPourWam(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, X-Transfer-Id, X-Raspberry-Id, X-Son-Number, X-Variante-Index, Authorization"
  );
  res.setHeader("Access-Control-Max-Age", "86400");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
}
