import type { Client } from "ssh2";

export interface IAuthenticationProvider {
  connect(): Promise<Client>;
}

export type AuthMotDePasseOptions = {
  host: string;
  port: number;
  username: string;
  password: string;
};

export type AuthClePriveeOptions = {
  host: string;
  port: number;
  username: string;
  privateKeyPath: string;
  passphrase?: string;
};
