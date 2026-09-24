import { describe, expect, it } from "vitest";
import {
  collecterNumerosOccupes,
  prochainNumeroWam,
  reconstruireAttributions,
  reserverProchainNumeroWam,
} from "../../utils/osc/AttributionNumerosSons";

describe("AttributionNumerosSons", () => {
  it("attribue 502 et 503 aux noms libres apres son500 et son501", () => {
    const fichiers = ["son500.wav", "son501.wav", "believer.wav", "extraclass.wav"];
    const attributions = reconstruireAttributions(fichiers, {});
    expect(attributions["believer.wav"]).toBe(502);
    expect(attributions["extraclass.wav"]).toBe(503);
    const occupes = collecterNumerosOccupes(fichiers, attributions);
    expect(prochainNumeroWam(occupes)).toBe(504);
  });

  it("ne decale pas une attribution deja sauvee", () => {
    const fichiers = ["son500.wav", "aaa.wav", "believer.wav"];
    const attributions = reconstruireAttributions(fichiers, { "believer.wav": 502 });
    expect(attributions["believer.wav"]).toBe(502);
    expect(attributions["aaa.wav"]).toBe(503);
  });

  it("reserve les numeros un par un", () => {
    const occupes = new Set([500, 501]);
    expect(reserverProchainNumeroWam(occupes)).toBe(502);
    expect(reserverProchainNumeroWam(occupes)).toBe(503);
    expect(prochainNumeroWam(occupes)).toBe(504);
  });
});
