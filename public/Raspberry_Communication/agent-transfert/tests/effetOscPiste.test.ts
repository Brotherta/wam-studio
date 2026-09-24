import { describe, expect, it } from "vitest";
import { gainOscVersVolumePiste } from "../../utils/osc/CommandesOscMarqueur";
import { effetOscVersPiste } from "../../utils/osc/EffetOscPiste";

describe("effetOscVersPiste", () => {
  it("traduit /level en volume WAM (0 = silence, 104 = max)", () => {
    expect(effetOscVersPiste("/level", "0")).toEqual({ type: "volume", volume01: 0 });
    expect(effetOscVersPiste("/level", "104")).toEqual({ type: "volume", volume01: 1 });
    expect(gainOscVersVolumePiste("90")).toBeCloseTo(90 / 104, 5);
  });

  it("traduit /stop et /stop -1 en mute", () => {
    expect(effetOscVersPiste("/stop", "1")).toEqual({ type: "mute", mute: true, son: 1 });
    expect(effetOscVersPiste("/stop", "-1")).toEqual({ type: "mute", mute: true });
    expect(effetOscVersPiste("/stop", "1 4000")).toEqual({
      type: "fade-mute",
      dureeMs: 4000,
      son: 1,
    });
  });

  it("traduit /play et /attenuation en volume d'un son", () => {
    expect(effetOscVersPiste("/play", "1 90")).toEqual({
      type: "volume",
      volume01: 90 / 104,
      son: 1,
    });
    expect(effetOscVersPiste("/attenuation", "1 0")).toEqual({
      type: "volume",
      volume01: 0,
      son: 1,
    });
  });

  it("ignore /loop cote piste WAM", () => {
    expect(effetOscVersPiste("/loop", "1 1")).toEqual({ type: "aucun" });
  });
});
