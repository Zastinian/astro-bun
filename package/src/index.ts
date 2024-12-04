import type {
  AstroConfig,
  AstroAdapter,
  InjectedType,
  AstroIntegrationLogger,
  AstroIntegration,
} from "astro";
import { AstroError } from "astro/errors";

import { name as packageName } from "../package.json";
import { CreateExportsEnum } from "./types";

import type { Options } from "./types";

export function getAdapter(args: Options): AstroAdapter {
  return {
    args,
    exports: [
      CreateExportsEnum.HANDLE,
      CreateExportsEnum.RUNNING,
      CreateExportsEnum.START,
      CreateExportsEnum.STOP,
    ] satisfies Array<CreateExportsEnum>,
    name: packageName,
    serverEntrypoint: `${packageName}/server.js`,
    supportedAstroFeatures: {
      sharpImageService: {
        support: "limited",
        message:
          "This adapter supports the built-in sharp image service, but with some limitations.",
      },
      envGetSecret: "experimental",
      serverOutput: "stable",
      staticOutput: "stable",
      hybridOutput: "stable",
    },
  };
}

export default function createIntegration(): AstroIntegration {
  return {
    name: packageName,
    hooks: {
      "astro:config:done": (params: {
        config: AstroConfig;
        setAdapter: (adapter: AstroAdapter) => void;
        injectTypes: (injectedType: InjectedType) => URL;
        logger: AstroIntegrationLogger;
        buildOutput: "static" | "server";
      }) => {
        params.setAdapter(
          getAdapter({
            assets: params.config.build.assets,
            client: params.config.build.client?.toString(),
            host: params.config.server.host,
            port: params.config.server.port,
            server: params.config.build.server?.toString(),
          }),
        );

        if (params.config.output !== "static" && params.config.output !== "server")
          throw new AstroError(
            `Only \`output: "server"\` or \`output: "static"\` is supported by this adapter.`,
          );
      },
    },
  };
}
