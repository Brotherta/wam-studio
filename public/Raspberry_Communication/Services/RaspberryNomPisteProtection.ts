import type { RaspberryTrackBinding } from "../Models/RaspberryTrackBinding";
import { formaterNomPisteRaspberry } from "../utils/agent-transfert/AgentTransfertHelpers";

const ATTR_PROTECTION_NOM = "data-raspberry-nom-protege";

type ElementPiste = {
  element: HTMLElement & {
    trackNameInput?: HTMLInputElement;
  };
};

type ElementPisteAvecNom = ElementPiste["element"] & {
  name: string;
};

type EcritureNom = (nom: string) => void;

let restaurerNomsApresDepot: (() => void) | null = null;
let surveillanceDepotActive = false;

/**
 * Empeche le renommage automatique des pistes liees a un Raspberry
 * (ex. drag-and-drop d'un fichier audio qui ecrase « rasp 74 »).
 */
export function protegerNomPisteRaspberry(
  piste: ElementPiste,
  binding: RaspberryTrackBinding
): void {
  const element = piste.element as ElementPisteAvecNom;
  const nomAttendu = formaterNomPisteRaspberry(binding.raspberryId);
  const ecrireNom = preparerEcritureNom(element);

  if (!ecrireNom) {
    forcerNomSurElement(element, nomAttendu);
    return;
  }

  if (element.getAttribute(ATTR_PROTECTION_NOM) !== String(binding.raspberryId)) {
    installerVerrouNom(element, nomAttendu, ecrireNom);
    element.setAttribute(ATTR_PROTECTION_NOM, String(binding.raspberryId));
  }

  installerEcouteursChampNom(element, nomAttendu, ecrireNom);
  forcerNomSurElement(element, nomAttendu);
}

export function retirerProtectionNomPiste(piste: ElementPiste): void {
  const element = piste.element as ElementPisteAvecNom;
  element.removeAttribute(ATTR_PROTECTION_NOM);

  if (Object.prototype.hasOwnProperty.call(element, "name")) {
    Reflect.deleteProperty(element as unknown as Record<string, unknown>, "name");
  }

  const input = element.trackNameInput as HTMLInputElement & {
    raspberryRestaurerNom?: () => void;
  };
  if (input?.raspberryRestaurerNom) {
    input.removeEventListener("input", input.raspberryRestaurerNom);
    input.removeEventListener("change", input.raspberryRestaurerNom);
    delete input.raspberryRestaurerNom;
  }
  if (input) {
    delete input.dataset.raspberryNomListener;
  }
}

/** Surveille les depots de fichiers et restaure les noms des pistes liees. */
export function demarrerSurveillanceNomApresDepotFichier(restaurer: () => void): void {
  restaurerNomsApresDepot = restaurer;
  if (surveillanceDepotActive) {
    return;
  }
  surveillanceDepotActive = true;

  window.addEventListener(
    "drop",
    () => {
      restaurerNomsApresDepot?.();
      window.setTimeout(() => restaurerNomsApresDepot?.(), 0);
      window.setTimeout(() => restaurerNomsApresDepot?.(), 100);
      window.setTimeout(() => restaurerNomsApresDepot?.(), 500);
    },
    true
  );
}

function trouverDescriptorPropriete(
  element: object,
  cle: string
): PropertyDescriptor | undefined {
  let proto = Object.getPrototypeOf(element);
  while (proto && proto !== Object.prototype) {
    const descriptor = Object.getOwnPropertyDescriptor(proto, cle);
    if (descriptor) {
      return descriptor;
    }
    proto = Object.getPrototypeOf(proto);
  }
  return undefined;
}

function preparerEcritureNom(element: ElementPisteAvecNom): EcritureNom | null {
  const descriptor = trouverDescriptorPropriete(element, "name");
  if (!descriptor?.get || !descriptor?.set) {
    return null;
  }
  const lireNom = descriptor.get.bind(element);
  const ecrireNomOriginal = descriptor.set.bind(element);
  return (nom: string) => {
    if (lireNom() !== nom) {
      ecrireNomOriginal(nom);
    }
  };
}

function installerVerrouNom(
  element: ElementPisteAvecNom,
  nomAttendu: string,
  ecrireNom: EcritureNom
): void {
  const descriptor = trouverDescriptorPropriete(element, "name");
  if (!descriptor?.get) {
    return;
  }
  const lireNom = descriptor.get.bind(element);

  Object.defineProperty(element, "name", {
    configurable: true,
    enumerable: descriptor.enumerable ?? true,
    get() {
      return lireNom();
    },
    set(_value: string) {
      ecrireNom(nomAttendu);
    },
  });
}

function installerEcouteursChampNom(
  element: ElementPisteAvecNom,
  nomAttendu: string,
  ecrireNom: EcritureNom
): void {
  const attacher = (): void => {
    const input = element.trackNameInput;
    if (!input || input.dataset.raspberryNomListener === "1") {
      return;
    }
    input.dataset.raspberryNomListener = "1";
    const champ = input as HTMLInputElement & { raspberryRestaurerNom?: () => void };
    const restaurerNom = () => {
      if (input.value !== nomAttendu) {
        ecrireNom(nomAttendu);
      }
    };
    champ.raspberryRestaurerNom = restaurerNom;
    input.addEventListener("input", restaurerNom);
    input.addEventListener("change", restaurerNom);
  };

  attacher();
  if (!element.trackNameInput) {
    window.requestAnimationFrame(attacher);
    window.setTimeout(attacher, 0);
  }
}

function forcerNomSurElement(element: ElementPisteAvecNom, nomAttendu: string): void {
  if (element.name !== nomAttendu) {
    element.name = nomAttendu;
  }
  const input = element.trackNameInput;
  if (input && input.value !== nomAttendu) {
    input.value = nomAttendu;
  }
}
