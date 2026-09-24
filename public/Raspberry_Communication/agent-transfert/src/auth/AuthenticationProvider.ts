import type { ConfigPersistee } from "../config/ConfigStore";
import type {
  AuthClePriveeOptions,
  AuthMotDePasseOptions,
  IAuthenticationProvider,
} from "../interfaces/IAuthenticationProvider";
import type { CommandeStartTransfer } from "../models/SocketCommand";
import { fusionnerCibleSsh } from "../models/SocketCommand";
import { PasswordAuthenticationProvider } from "./PasswordAuthenticationProvider";
import { PrivateKeyAuthenticationProvider } from "./PrivateKeyAuthenticationProvider";

export type ModeAuth = "key" | "password";

export function creerFournisseurAuthentification(
  mode: ModeAuth,
  options: AuthClePriveeOptions | AuthMotDePasseOptions
): IAuthenticationProvider {
  if (mode === "key") {
    return new PrivateKeyAuthenticationProvider(options as AuthClePriveeOptions);
  }
  return new PasswordAuthenticationProvider(options as AuthMotDePasseOptions);
}

export function extraireConfigPersistable(commande: CommandeStartTransfer): ConfigPersistee {
  const partiel: ConfigPersistee = {};
  if (commande.sshHost) partiel.sshHost = commande.sshHost;
  if (commande.sshPort !== undefined) partiel.sshPort = commande.sshPort;
  if (commande.sshUsername) partiel.sshLogin = commande.sshUsername;
  if (commande.privateKeyPath) partiel.privateKeyPath = commande.privateKeyPath;
  return partiel;
}

export function creerAuthentificationDepuisCommande(
  commande: CommandeStartTransfer,
  configPersistee: ConfigPersistee
): IAuthenticationProvider {
  const cible = fusionnerCibleSsh(commande, configPersistee);
  const mode = resoudreModeAuthentification(commande, configPersistee);

  if (mode === "password") {
    const password = commande.sshPassword;
    if (!password) {
      throw new Error("Mot de passe SSH manquant (jamais memorise sur disque).");
    }
    return creerFournisseurAuthentification("password", {
      host: cible.host,
      port: cible.port,
      username: cible.username,
      password,
    });
  }

  const privateKeyPath = commande.privateKeyPath || configPersistee.privateKeyPath;
  if (!privateKeyPath) {
    throw new Error("Chemin de cle privee manquant (commande ou config locale).");
  }

  return creerFournisseurAuthentification("key", {
    host: cible.host,
    port: cible.port,
    username: cible.username,
    privateKeyPath,
    passphrase: commande.passphrase,
  });
}

function resoudreModeAuthentification(
  commande: CommandeStartTransfer,
  config: ConfigPersistee
): ModeAuth {
  if (commande.authMode === "password" || commande.authMode === "key") {
    return commande.authMode;
  }
  if (commande.sshPassword) {
    return "password";
  }
  if (commande.privateKeyPath || config.privateKeyPath) {
    return "key";
  }
  throw new Error("Mode d'authentification SSH indetermine (cle ou mot de passe requis).");
}
