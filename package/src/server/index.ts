/// <reference types="astro/client" />

import { App } from "astro/app";

import { extractHostname, serveStaticFile } from "./utils";

import type { SSRManifest } from "astro";
import type { Server } from "bun";

import type { CreateExports, Options } from "../types";

export function createExports(manifest: SSRManifest, options: Options): CreateExports {
  return {
    handle: handler(manifest, options),
    running: () => _server !== null,
    start: () => start(manifest, options),
    stop: () => {
      if (!_server) return;
      _server.stop();
      _server = null;
    },
  };
}

let _server: Server | null = null;
export function start(manifest: SSRManifest, options: Options) {
  const app = new App(manifest);
  const logger = app.getAdapterLogger();

  const isUnixSocket = typeof options.host === "string" && options.host.endsWith(".sock");
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const serverOptions: any = {
    development: process.env.APP_ENV === "development" || process.env.NODE_ENV === "development",
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    error: (error: { stack: any }) =>
      new Response(`<pre>${error}\n${error.stack}</pre>`, {
        headers: { "Content-Type": "text/html" },
      }),
    fetch: handler(manifest, options),
  };

  if (isUnixSocket) {
    serverOptions.unix = options.host;
  } else {
    const hostname = process.env.HOST ?? extractHostname(options.host);
    const port = process.env.PORT ? Number.parseInt(process.env.PORT) : options.port;
    serverOptions.hostname = hostname;
    serverOptions.port = port;
  }

  _server = Bun.serve(serverOptions);

  function exit() {
    if (_server) _server.stop();
    process.exit();
  }

  process.on("SIGINT", exit);
  process.on("SIGTERM", exit);
  process.on("exit", exit);

  logger.info(
    `Server listening on ${isUnixSocket ? `unix socket: ${options.host}` : _server.url.href}`,
  );
}

function handler(
  manifest: SSRManifest,
  options: Options,
): (req: Request, server: Server) => Promise<Response> {
  const clientRoot = options.client ?? new URL("../client/", import.meta.url).href;

  const app = new App(manifest);

  return async (req: Request, server: Server) => {
    const routeData = app.match(req);
    if (!routeData) {
      const url = new URL(req.url);

      const manifestAssetExists = manifest.assets.has(url.pathname);

      if (!manifestAssetExists || url.pathname.endsWith("/")) {
        const localPath = new URL(`./${app.removeBase(url.pathname)}/index.html`, clientRoot);
        return serveStaticFile(url.pathname, localPath, clientRoot, options);
      }

      if (manifestAssetExists) {
        const localPath = new URL(app.removeBase(url.pathname), clientRoot);
        return serveStaticFile(url.pathname, localPath, clientRoot, options);
      }
    }

    const clientAddress = server.requestIP(req)?.address || "127.0.0.1";

    return app.render(req, {
      addCookieHeader: true,
      routeData,
      clientAddress,
    });
  };
}
