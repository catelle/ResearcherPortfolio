import { createServer } from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { handleApiRequest } from "./api.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");

const port = Number(process.env.PORT || 3001);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

async function serveStaticAsset(response, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const assetPath = path.join(distDir, safePath);

  try {
    const stat = await fs.stat(assetPath);

    if (stat.isDirectory()) {
      throw new Error("Directories are not served directly.");
    }

    const file = await fs.readFile(assetPath);
    const extension = path.extname(assetPath);
    response.writeHead(200, {
      "Content-Type": mimeTypes[extension] ?? "application/octet-stream",
    });
    response.end(file);
    return true;
  } catch {
    return false;
  }
}

async function serveSpaFallback(response) {
  try {
    const indexHtml = await fs.readFile(path.join(distDir, "index.html"));
    response.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
    });
    response.end(indexHtml);
  } catch {
    response.writeHead(404, {
      "Content-Type": "text/plain; charset=utf-8",
    });
    response.end("Backend is running, but the frontend build is missing.");
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
  const pathname = url.pathname;

  if (await handleApiRequest(request, response, pathname)) {
    return;
  }

  if (await serveStaticAsset(response, pathname)) {
    return;
  }

  await serveSpaFallback(response);
});

server.listen(port, () => {
  console.log(`Portfolio backend running on http://localhost:${port}`);
});
