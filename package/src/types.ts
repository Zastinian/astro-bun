interface OptionsSchema {
  assets: string;
  client: string;
  host: string | boolean;
  port: number;
  server: string;
}

export type Options = OptionsSchema;

export interface BunSSROptions {
  clientAddress: string;
}
