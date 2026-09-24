import { Client } from "ssh2";
import type { AuthMotDePasseOptions, IAuthenticationProvider } from "../interfaces/IAuthenticationProvider";
import { formaterErreurSsh } from "../utils/erreurSsh";

export class PasswordAuthenticationProvider implements IAuthenticationProvider {
  constructor(private readonly options: AuthMotDePasseOptions) {}

  public connect(): Promise<Client> {
    const client = new Client();
    const hote = `${this.options.username}@${this.options.host}:${this.options.port}`;
    return new Promise((resolve, reject) => {
      client
        .on("ready", () => resolve(client))
        .on("error", (err) => {
          reject(formaterErreurSsh(err, { operation: "connexion SSH", hote }));
        })
        .connect({
          host: this.options.host,
          port: this.options.port,
          username: this.options.username,
          password: this.options.password,
          readyTimeout: 20000,
        });
    });
  }
}
