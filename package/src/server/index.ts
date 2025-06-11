/// <reference types="astro/client" />

import { App } from "astro/app";
import { extractHostname, serveStaticFile } from "./utils";
import type { SSRManifest } from "astro";
import type { Server } from "bun";
import cluster from "cluster";
import os from "os";
import type { Options } from "../types";

export function createExports(manifest: SSRManifest, options: Options) {
  return {
    handle: handler(manifest, options),
    running: (): boolean => _server !== null,
    start: (): void => start(manifest, options),
    stop: (): void => {
      if (!_server) return;
      _server.stop();
      _server = null;
    },
  };
}

let _server: Server | null = null;
export function start(manifest: SSRManifest, options: Options) {
  if (cluster.isPrimary && options.cluster) {
    const numCPUs = os.cpus().length;
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
    cluster.on("exit", (worker, _code, _signal) => {
      console.warn(`Worker ${worker.process.pid} died`);
      cluster.fork();
    });
  } else {
    const app = new App(manifest);
    const logger = app.getAdapterLogger();

    const isUnixSocket = typeof options.host === "string" && options.host.endsWith(".sock");

    interface UnixConfig {
      unix: string;
      hostname?: never;
      port?: never;
      reusePort?: never;
      idleTimeout?: never;
    }

    interface HostConfig {
      unix?: never;
      hostname: string;
      port: number;
      reusePort?: boolean;
      idleTimeout?: number;
    }

    type UnixOrHost = UnixConfig | HostConfig;

    const serverOptions: UnixOrHost = isUnixSocket
      ? {
          unix: String(process.env.UNIX_SOCKET ?? options.host),
        }
      : {
          hostname: process.env.HOST ?? extractHostname(options.host) ?? "127.0.0.1",
          port: process.env.PORT ? Number.parseInt(process.env.PORT) : options.port,
          reusePort: !options.cluster
            ? process.env.REUSE_PORT
              ? Boolean(process.env.REUSE_PORT)
              : (options.reusePort ?? false)
            : true,
          idleTimeout: process.env.IDLE_TIMEOUT
            ? Number.parseInt(process.env.IDLE_TIMEOUT)
            : (options.idleTimeout ?? 10),
        };

    _server = Bun.serve({
      development: process.env.APP_ENV === "development" || process.env.NODE_ENV === "development",
      error: (error: Error) => {
        logger.error(`${error}`);
        return new Response(`<pre>${error}\n${error.stack}</pre>`, {
          headers: { "Content-Type": "text/html" },
          status: 500,
        });
      },
      lowMemoryMode: process.env.LOW_MEMORY_MODE
        ? Boolean(process.env.LOW_MEMORY_MODE)
        : (options.lowMemoryMode ?? false),
      maxRequestBodySize: process.env.MAX_REQUEST_BODY_SIZE
        ? Number.parseInt(process.env.MAX_REQUEST_BODY_SIZE)
        : (options.maxRequestBodySize ?? 1024 * 1024 * 128),
      fetch: handler(manifest, options),
      tls: {
        cert: process.env.TLS_CERT_PATH ?? options.tls?.certPath,
        key: process.env.TLS_KEY_PATH ?? options.tls?.keyPath,
        lowMemoryMode: process.env.LOW_MEMORY_MODE
          ? Boolean(process.env.LOW_MEMORY_MODE)
          : (options.lowMemoryMode ?? false),
      },
      ...serverOptions,
    });

    const cleanup = () => {
      if (_server) {
        _server.stop();
        _server = null;
      }
      process.exit(0);
    };

    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
    process.on("exit", cleanup);

    logger.info(
      `Server listening on ${isUnixSocket ? `unix socket: ${options.host}` : _server.url.href}`,
    );
  }
}

function handler(
  manifest: SSRManifest,
  options: Options,
): (req: Request, server: Server) => Promise<Response> {
  const clientRoot = options.client ?? new URL("../client/", import.meta.url).href;
  const app = new App(manifest);

  return async (req: Request, server: Server) => {
    const url = new URL(req.url);

    const isStaticAsset = (pathname: string): boolean => {
      if (manifest.assets.has(pathname)) {
        return true;
      }

      const assetsPrefix = `/${options.assets}/`;
      if (pathname.startsWith(assetsPrefix)) {
        return true;
      }

      const staticExtensions = [
        ".js",
        ".css",
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".svg",
        ".ico",
        ".woff",
        ".woff2",
        ".ttf",
        ".eot",
        ".pdf",
        ".zip",
        ".webp",
        ".avif",
        ".mp4",
        ".webm",
        ".mp3",
        ".wav",
        ".ogg",
        ".json",
        ".xml",
        ".txt",
      ];
      const hasStaticExtension = staticExtensions.some((ext) =>
        pathname.toLowerCase().endsWith(ext),
      );

      return hasStaticExtension;
    };

    if (isStaticAsset(url.pathname)) {
      const clientPath = new URL(`.${url.pathname}`, clientRoot);
      const clientFile = Bun.file(clientPath);
      const clientFileExists = await clientFile.exists();

      if (clientFileExists) {
        return serveStaticFile(url.pathname, clientPath, clientRoot, options);
      }

      const basePath = new URL(`./${app.removeBase(url.pathname)}`, clientRoot);
      return serveStaticFile(url.pathname, basePath, clientRoot, options);
    }

    const routeData = app.match(req);

    if (!routeData) {
      const clientPath = new URL(`.${url.pathname}`, clientRoot);
      const clientFile = Bun.file(clientPath);
      const clientFileExists = await clientFile.exists();

      if (clientFileExists) {
        return serveStaticFile(url.pathname, clientPath, clientRoot, options);
      }

      const basePath = new URL(`./${app.removeBase(url.pathname)}`, clientRoot);
      const baseFile = Bun.file(basePath);
      const baseFileExists = await baseFile.exists();

      if (baseFileExists) {
        return serveStaticFile(url.pathname, basePath, clientRoot, options);
      }

      const tryIndexPaths = [
        url.pathname.endsWith("/") ? new URL(`.${url.pathname}index.html`, clientRoot) : null,
        !url.pathname.endsWith("/") ? new URL(`.${url.pathname}/index.html`, clientRoot) : null,
        url.pathname.endsWith("/")
          ? new URL(`./${app.removeBase(url.pathname)}index.html`, clientRoot)
          : null,
        !url.pathname.endsWith("/")
          ? new URL(`./${app.removeBase(url.pathname)}/index.html`, clientRoot)
          : null,
      ].filter(Boolean) as URL[];

      for (const indexPath of tryIndexPaths) {
        const indexFile = Bun.file(indexPath);
        const indexExists = await indexFile.exists();

        if (indexExists) {
          return serveStaticFile(url.pathname, indexPath, clientRoot, options);
        }
      }

      const notFoundPath = new URL(`.${url.pathname}`, clientRoot);
      return serveStaticFile(url.pathname, notFoundPath, clientRoot, options);
    }

    const clientAddress = server.requestIP(req)?.address || "127.0.0.1";

    return app.render(req, {
      addCookieHeader: true,
      routeData,
      clientAddress,
    });
  };
}
