import type { MarqueurSequenceur, TypeMarqueurSequenceur } from "../../Models/MarqueurSequenceur";
import {
  MODELES_COMMANDES_OSC_MARQUEUR,
  composerCommandeOscMarqueur,
  decouperValeurOsc,
  infererIdCommandeOsc,
  trouverModeleCommandeOsc,
  type EmplacementOscMarqueur,
  type IdCommandeOscMarqueur,
} from "../../utils/osc/CommandesOscMarqueur";

export type OptionsPlacementMarqueur = {
  type: TypeMarqueurSequenceur;
  libelle: string;
  oscAdresse: string;
  oscValeur: string;
};

export type ActionsBarrePlacementMarqueurs = {
  onQuitter: () => void;
  onEnregistrerEdition: () => void;
  onSupprimerEdition: () => void;
};

function creerBoutonType(libelle: string, valeur: TypeMarqueurSequenceur): HTMLButtonElement {
  const bouton = document.createElement("button");
  bouton.type = "button";
  bouton.dataset.type = valeur;
  bouton.innerText = libelle;
  bouton.style.padding = "4px 10px";
  bouton.style.borderRadius = "4px";
  bouton.style.border = "1px solid #3b4046";
  bouton.style.cursor = "pointer";
  bouton.style.fontSize = "12px";
  return bouton;
}

function appliquerStyleType(bouton: HTMLButtonElement, actif: boolean): void {
  bouton.style.background = actif ? "#fdd835" : "#2a3038";
  bouton.style.color = actif ? "#1a1a1a" : "#f1f1f1";
  bouton.style.fontWeight = actif ? "700" : "500";
}

function stylerChampOsc(element: HTMLElement, largeur: string): void {
  element.style.width = largeur;
  element.style.padding = "4px 6px";
  element.style.borderRadius = "4px";
  element.style.border = "1px solid #3b4046";
  element.style.background = "#161a1e";
  element.style.color = "#f1f1f1";
  element.style.fontSize = "12px";
}

function creerBoutonAction(texte: string): HTMLButtonElement {
  const bouton = document.createElement("button");
  bouton.type = "button";
  bouton.innerText = texte;
  bouton.style.padding = "4px 10px";
  bouton.style.borderRadius = "4px";
  bouton.style.border = "1px solid #3b4046";
  bouton.style.background = "#2a3038";
  bouton.style.color = "#f1f1f1";
  bouton.style.cursor = "pointer";
  bouton.style.fontSize = "12px";
  return bouton;
}

function creerChampTexteOsc(
  placeholder: string,
  valeur: string,
  largeur: string
): HTMLInputElement {
  const champ = document.createElement("input");
  champ.type = "text";
  champ.placeholder = placeholder;
  champ.title = placeholder;
  champ.value = valeur;
  stylerChampOsc(champ, largeur);
  return champ;
}

function creerBlocEmplacement(
  modele: EmplacementOscMarqueur,
  valeur: string
): {
  racine: HTMLLabelElement;
  champ: HTMLInputElement;
} {
  const racine = document.createElement("label");
  racine.style.display = "flex";
  racine.style.alignItems = "center";
  racine.style.gap = "4px";
  racine.style.fontSize = "11px";
  racine.style.opacity = "0.95";
  const nom = document.createElement("span");
  nom.textContent = modele.libelle;
  const champ = creerChampTexteOsc(modele.placeholder, valeur, "64px");
  racine.appendChild(nom);
  racine.appendChild(champ);
  return { racine, champ };
}

/**
 * Barre visible pendant le mode pose de marqueurs sur la piste.
 */
export function creerBarrePlacementMarqueurs(actions: ActionsBarrePlacementMarqueurs): {
  element: HTMLDivElement;
  lireOptions: () => OptionsPlacementMarqueur;
  lireIdEdition: () => string | null;
  chargerMarqueur: (marqueur: MarqueurSequenceur) => void;
  quitterEdition: () => void;
  afficherMessage: (texte: string) => void;
  detruire: () => void;
} {
  const racine = document.createElement("div");
  racine.id = "raspberry-barre-placement-marqueurs";
  racine.style.position = "absolute";
  racine.style.top = "8px";
  racine.style.left = "50%";
  racine.style.transform = "translateX(-50%)";
  racine.style.display = "flex";
  racine.style.flexWrap = "wrap";
  racine.style.alignItems = "center";
  racine.style.gap = "8px";
  racine.style.padding = "8px 12px";
  racine.style.background = "rgba(31, 37, 43, 0.95)";
  racine.style.border = "1px solid #3b4046";
  racine.style.borderRadius = "8px";
  racine.style.color = "#f1f1f1";
  racine.style.zIndex = "8";
  racine.style.pointerEvents = "auto";
  racine.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.4)";
  racine.style.maxWidth = "92%";

  let type: TypeMarqueurSequenceur = "cue";
  let idCommande: IdCommandeOscMarqueur = "play";
  let idEdition: string | null = null;
  let dernierLibelleAuto = "";
  const champsArguments: HTMLInputElement[] = [];

  const boutonCue = creerBoutonType("Cue (Espace)", "cue");
  const boutonOsc = creerBoutonType("OSC", "osc");
  appliquerStyleType(boutonCue, true);
  appliquerStyleType(boutonOsc, false);

  const libelle = document.createElement("input");
  libelle.type = "text";
  libelle.placeholder = "Libellé";
  stylerChampOsc(libelle, "110px");

  const blocOsc = document.createElement("div");
  blocOsc.style.display = "none";
  blocOsc.style.alignItems = "center";
  blocOsc.style.flexWrap = "wrap";
  blocOsc.style.gap = "8px";

  const listeCommandes = document.createElement("select");
  listeCommandes.title = "Commande OSC";
  stylerChampOsc(listeCommandes, "120px");
  for (const modele of MODELES_COMMANDES_OSC_MARQUEUR) {
    const option = document.createElement("option");
    option.value = modele.id;
    option.textContent = modele.libelleMenu;
    listeCommandes.appendChild(option);
  }
  listeCommandes.value = "play";

  const champAdresse = creerChampTexteOsc("/adresse", "/play", "110px");

  const blocEmplacements = document.createElement("div");
  blocEmplacements.style.display = "flex";
  blocEmplacements.style.flexWrap = "wrap";
  blocEmplacements.style.alignItems = "center";
  blocEmplacements.style.gap = "8px";

  const blocEdition = document.createElement("div");
  blocEdition.style.display = "none";
  blocEdition.style.alignItems = "center";
  blocEdition.style.gap = "6px";

  const boutonEnregistrer = creerBoutonAction("Enregistrer");
  boutonEnregistrer.style.background = "#2e7d32";
  const boutonSupprimer = creerBoutonAction("Supprimer");
  boutonSupprimer.style.background = "#8b2e2e";
  const boutonAnnuler = creerBoutonAction("Annuler");
  blocEdition.appendChild(boutonEnregistrer);
  blocEdition.appendChild(boutonSupprimer);
  blocEdition.appendChild(boutonAnnuler);

  const consigne = document.createElement("span");
  consigne.style.fontSize = "12px";
  consigne.style.opacity = "0.9";
  consigne.innerText = "Cue = pause WAM (Espace). OSC = message vers les Pi. Cliquez la piste.";

  const boutonQuitter = creerBoutonAction("Quitter");

  const lireCommandeComposee = () =>
    composerCommandeOscMarqueur(
      champAdresse.value,
      champsArguments.map((champ) => champ.value)
    );

  const appliquerCommande = (
    id: IdCommandeOscMarqueur,
    valeurs?: string[],
    adresseLibre?: string
  ): void => {
    const modele = trouverModeleCommandeOsc(id);
    if (!modele) {
      return;
    }
    idCommande = modele.id;
    listeCommandes.value = modele.id;
    champAdresse.value = adresseLibre ?? modele.adresse;
    blocEmplacements.replaceChildren();
    champsArguments.length = 0;
    const valeursChamps =
      valeurs ?? modele.emplacements.map((emplacement) => emplacement.valeurDefaut);
    modele.emplacements.forEach((emplacement, index) => {
      const bloc = creerBlocEmplacement(emplacement, valeursChamps[index] ?? emplacement.valeurDefaut);
      champsArguments.push(bloc.champ);
      blocEmplacements.appendChild(bloc.racine);
    });
    if (libelle.value.trim() === "" || libelle.value === dernierLibelleAuto) {
      libelle.value = modele.libelleCourt;
      dernierLibelleAuto = modele.libelleCourt;
    }
  };

  const actualiserModeEdition = (): void => {
    blocEdition.style.display = idEdition ? "flex" : "none";
    racine.style.borderColor = idEdition ? "#fdd835" : "#3b4046";
  };

  const quitterEdition = (): void => {
    idEdition = null;
    actualiserModeEdition();
  };

  const choisirType = (suivant: TypeMarqueurSequenceur): void => {
    const dejaOsc = type === "osc";
    type = suivant;
    appliquerStyleType(boutonCue, type === "cue");
    appliquerStyleType(boutonOsc, type === "osc");
    blocOsc.style.display = type === "osc" ? "flex" : "none";
    if (type === "osc" && !dejaOsc) {
      appliquerCommande(idCommande);
    }
  };

  listeCommandes.addEventListener("change", () => {
    const suivant = trouverModeleCommandeOsc(listeCommandes.value);
    if (!suivant) {
      return;
    }
    appliquerCommande(suivant.id);
  });

  boutonCue.addEventListener("click", (event) => {
    event.stopPropagation();
    choisirType("cue");
  });
  boutonOsc.addEventListener("click", (event) => {
    event.stopPropagation();
    choisirType("osc");
  });
  boutonQuitter.addEventListener("click", (event) => {
    event.stopPropagation();
    actions.onQuitter();
  });
  boutonEnregistrer.addEventListener("click", (event) => {
    event.stopPropagation();
    actions.onEnregistrerEdition();
  });
  boutonSupprimer.addEventListener("click", (event) => {
    event.stopPropagation();
    actions.onSupprimerEdition();
  });
  boutonAnnuler.addEventListener("click", (event) => {
    event.stopPropagation();
    quitterEdition();
    consigne.innerText = "Création d'un nouveau marqueur. Cliquez la piste.";
  });
  racine.addEventListener("click", (event) => event.stopPropagation());
  racine.addEventListener("mousedown", (event) => event.stopPropagation());

  blocOsc.appendChild(listeCommandes);
  blocOsc.appendChild(champAdresse);
  blocOsc.appendChild(blocEmplacements);

  racine.appendChild(boutonCue);
  racine.appendChild(boutonOsc);
  racine.appendChild(libelle);
  racine.appendChild(blocOsc);
  racine.appendChild(blocEdition);
  racine.appendChild(consigne);
  racine.appendChild(boutonQuitter);

  return {
    element: racine,
    lireOptions: () => {
      if (type !== "osc") {
        return {
          type,
          libelle: libelle.value.trim(),
          oscAdresse: "",
          oscValeur: "",
        };
      }
      const composee = lireCommandeComposee();
      return {
        type,
        libelle: libelle.value.trim(),
        oscAdresse: composee.adresse,
        oscValeur: composee.valeur,
      };
    },
    lireIdEdition: () => idEdition,
    chargerMarqueur: (marqueur) => {
      idEdition = marqueur.id;
      type = marqueur.type;
      libelle.value = marqueur.libelle;
      dernierLibelleAuto = "";
      appliquerStyleType(boutonCue, type === "cue");
      appliquerStyleType(boutonOsc, type === "osc");
      blocOsc.style.display = type === "osc" ? "flex" : "none";
      if (type === "osc") {
        const id = infererIdCommandeOsc(marqueur.oscAdresse, marqueur.oscValeur);
        const modele = trouverModeleCommandeOsc(id);
        const valeurs = decouperValeurOsc(
          marqueur.oscValeur,
          modele?.emplacements.length ?? 1
        );
        appliquerCommande(id, valeurs, marqueur.oscAdresse);
        libelle.value = marqueur.libelle;
      }
      actualiserModeEdition();
    },
    quitterEdition: () => {
      quitterEdition();
    },
    afficherMessage: (texte: string) => {
      consigne.innerText = texte;
    },
    detruire: () => {
      racine.remove();
    },
  };
}
