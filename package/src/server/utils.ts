import type { Options } from "../types";
import { httpStatusTexts } from "./httpStatusTexts";

export function extractHostname(host: Options["host"]): string | undefined {
  if (typeof host === "string") return host;
  if (typeof host === "boolean") return host ? "0.0.0.0" : "localhost";
  return host;
}

export async function serveStaticFile(
  pathname: string,
  localPath: URL,
  clientRoot: string,
  options: Options,
): Promise<Response> {
  const file = Bun.file(localPath);
  const assetsPrefix = `/${options.assets}/`;

  async function serveErrorPage(statusCode: number): Promise<Response> {
    const errorPath = new URL(`./${statusCode}.html`, clientRoot);
    const errorFile = Bun.file(errorPath);
    const errorFileExists = await errorFile.exists();

    if (errorFileExists) {
      return new Response(errorFile, {
        status: statusCode,
        statusText: httpStatusTexts[statusCode] || "Unknown Error",
        headers: {
          "Content-Type": "text/html",
        },
      });
    }

    const errorHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${statusCode} ${httpStatusTexts[statusCode] || "Error"}</title>
  <style>
    body {
      background-color: #121212;
      color: #e0e0e0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      text-align: center;
    }
    .error-container {
      background-color: #1e1e1e;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    p {
      font-size: 1.5rem;
      color: #a0a0a0;
    }
  </style>
</head>
<body>
  <div class="error-container">
    <h1>${statusCode}</h1>
    <p>${httpStatusTexts[statusCode] || "An unexpected error occurred"}</p>
  </div>
</body>
</html>
`;

    return new Response(errorHtml, {
      status: statusCode,
      headers: {
        "Content-Type": "text/html",
      },
    });
  }

  const fileExists = await file.exists();
  if (!fileExists) {
    return serveErrorPage(404);
  }

  const isImmutableAsset = (pathname: string) => pathname.startsWith(assetsPrefix);
  if (isImmutableAsset(pathname))
    return new Response(file, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });

  return new Response(file);
}
