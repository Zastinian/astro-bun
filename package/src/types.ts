import type { Server } from "bun";

export enum CreateExportsEnum {
  HANDLE = "handle",
  RUNNING = "running",
  START = "start",
  STOP = "stop",
}

export type CreateExports = {
  [CreateExportsEnum.HANDLE]: (req: Request, server: Server) => Promise<Response>;
  [CreateExportsEnum.RUNNING]: () => boolean;
  [CreateExportsEnum.START]: () => void;
  [CreateExportsEnum.STOP]: () => void;
};

interface OptionsSchema {
  assets: string;
  client: string;
  host: string | boolean;
  port: number;
  server: string;
}

export type Options = OptionsSchema;
