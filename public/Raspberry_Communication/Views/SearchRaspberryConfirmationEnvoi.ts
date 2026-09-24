/**
 * Petite fenetre de confirmation au-dessus de Send Audio.
 */
export function demanderConfirmation(
  titre: string,
  message: string,
  libelleOui: string,
  libelleNon: string,
  styleDestructif = false
): Promise<boolean> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0, 0, 0, 0.55)";
    overlay.style.zIndex = "2100";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";

    const boite = document.createElement("div");
    boite.style.background = "#1f252b";
    boite.style.color = "#f1f1f1";
    boite.style.padding = "18px";
    boite.style.border = "1px solid #3b4046";
    boite.style.borderRadius = "8px";
    boite.style.width = "360px";

    const titreEl = document.createElement("h4");
    titreEl.style.margin = "0 0 10px";
    titreEl.innerText = titre;

    const texte = document.createElement("div");
    texte.style.fontSize = "13px";
    texte.style.lineHeight = "1.4";
    texte.innerText = message;

    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.justifyContent = "flex-end";
    actions.style.gap = "8px";
    actions.style.marginTop = "16px";

    const fermer = (ok: boolean) => {
      overlay.remove();
      resolve(ok);
    };

    const boutonNon = document.createElement("button");
    boutonNon.type = "button";
    boutonNon.innerText = libelleNon;
    boutonNon.addEventListener("click", () => fermer(false));

    const boutonOui = document.createElement("button");
    boutonOui.type = "button";
    boutonOui.innerText = libelleOui;
    boutonOui.style.background = styleDestructif ? "#a53333" : "#2e7d32";
    boutonOui.style.color = "#fff";
    boutonOui.style.border = "none";
    boutonOui.style.padding = "6px 12px";
    boutonOui.style.borderRadius = "4px";
    boutonOui.addEventListener("click", () => fermer(true));

    actions.appendChild(boutonNon);
    actions.appendChild(boutonOui);
    boite.appendChild(titreEl);
    boite.appendChild(texte);
    boite.appendChild(actions);
    overlay.appendChild(boite);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        fermer(false);
      }
    });
    document.body.appendChild(overlay);
    boutonNon.focus();
  });
}
