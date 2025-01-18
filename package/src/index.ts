import type { AstroAdapter, AstroIntegration } from "astro";
import { AstroError } from "astro/errors";

import { name as packageName } from "../package.json";

import type { Options, UserOptions } from "./types";

export function getAdapter(args: Options): AstroAdapter {
  return {
    args,
    exports: ["handle", "running", "start", "stop"],
    name: packageName,
    serverEntrypoint: `${packageName}/server.js`,
    adapterFeatures: {
      edgeMiddleware: false,
    },
    supportedAstroFeatures: {
      i18nDomains: "experimental",
      envGetSecret: "stable",
      serverOutput: "stable",
      staticOutput: "stable",
      hybridOutput: "stable",
      sharpImageService: "stable",
    },
  };
}

export default function createIntegration(userOptions?: UserOptions): AstroIntegration {
  return {
    name: packageName,
    hooks: {
      "astro:config:setup": ({ updateConfig }) => {
        updateConfig({
          vite: {
            ssr: {
              noExternal: ["@hedystia/astro-bun"],
            },
          },
        });
      },
      "astro:config:done": ({ config, setAdapter }) => {
        setAdapter(
          getAdapter({
            assets: config.build.assets,
            client: config.build.client?.toString(),
            host: config.server.host,
            port: config.server.port,
            server: config.build.server?.toString(),
            ...userOptions,
          }),
        );

        if (config.output !== "static" && config.output !== "server")
          throw new AstroError(
            `Only \`output: "server"\` or \`output: "static"\` is supported by this adapter.`,
          );
      },
    },
  };
}
