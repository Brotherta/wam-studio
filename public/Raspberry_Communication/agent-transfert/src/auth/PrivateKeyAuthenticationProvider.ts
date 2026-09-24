import fs from "fs";
import { Client } from "ssh2";
import type { AuthClePriveeOptions, IAuthenticationProvider } from "../interfaces/IAuthenticationProvider";

export class PrivateKeyAuthenticationProvider implements IAuthenticationProvider {
  constructor(private readonly options: AuthClePriveeOptions) {}

  public connect(): Promise<Client> {
    if (!fs.existsSync(this.options.privateKeyPath)) {
      return Promise.reject(new Error(`Fichier de cle privee introuvable: ${this.options.privateKeyPath}`));
    }
    const privateKey = fs.readFileSync(this.options.privateKeyPath, "utf8");
    const client = new Client();
    return new Promise((resolve, reject) => {
      client
        .on("ready", () => resolve(client))
        .on("error", (err) => reject(err))
        .connect({
          host: this.options.host,
          port: this.options.port,
          username: this.options.username,
          privateKey,
          passphrase: this.options.passphrase,
          readyTimeout: 20000,
        });
    });
  }
}
