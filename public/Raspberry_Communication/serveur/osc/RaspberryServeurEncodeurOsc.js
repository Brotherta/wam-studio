function remplirChaineOscAvecPadding(text) {
  const str = `${text}\0`;
  const base = Buffer.from(str, "utf8");
  const pad = (4 - (base.length % 4)) % 4;
  return pad === 0 ? base : Buffer.concat([base, Buffer.alloc(pad)]);
}

function encoderEntierOsc(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeInt32BE(value, 0);
  return buffer;
}

function encoderFlottantOsc(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeFloatBE(value, 0);
  return buffer;
}

function normaliserAdresseOsc(oscMessage) {
  const trimmed = `${oscMessage || ""}`.trim();
  if (trimmed.length === 0) {
    return "";
  }
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function parserArgumentsOsc(oscValue) {
  if (oscValue === undefined || oscValue === null) {
    return [];
  }
  if (Array.isArray(oscValue)) {
    return oscValue;
  }
  const raw = `${oscValue}`.trim();
  if (raw.length === 0) {
    return [];
  }
  return raw
    .split(/[,\s]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .map((token) => {
      if (/^-?\d+$/.test(token)) {
        const v = Number.parseInt(token, 10);
        return Number.isFinite(v) ? v : token;
      }
      if (/^-?\d+\.\d+$/.test(token)) {
        const v = Number.parseFloat(token);
        return Number.isFinite(v) ? v : token;
      }
      return token;
    });
}

function encoderPaquetOsc(address, args) {
  const normalizedAddress = normaliserAdresseOsc(address);
  if (normalizedAddress.length === 0) {
    throw new Error("Adresse OSC vide");
  }

  const oscArgs = Array.isArray(args) ? args : [];
  const typeTags = [","];
  const encodedArgs = [];

  oscArgs.forEach((arg) => {
    if (Number.isInteger(arg)) {
      typeTags.push("i");
      encodedArgs.push(encoderEntierOsc(arg));
      return;
    }
    if (typeof arg === "number" && Number.isFinite(arg)) {
      typeTags.push("f");
      encodedArgs.push(encoderFlottantOsc(arg));
      return;
    }
    typeTags.push("s");
    encodedArgs.push(remplirChaineOscAvecPadding(`${arg}`));
  });

  return Buffer.concat([
    remplirChaineOscAvecPadding(normalizedAddress),
    remplirChaineOscAvecPadding(typeTags.join("")),
    ...encodedArgs,
  ]);
}

module.exports = {
  remplirChaineOscAvecPadding,
  encoderEntierOsc,
  encoderFlottantOsc,
  normaliserAdresseOsc,
  parserArgumentsOsc,
  encoderPaquetOsc,
};
