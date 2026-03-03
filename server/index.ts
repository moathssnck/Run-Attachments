
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

const fallbackExternalApiUrl = "https://ithink-71db.onrender.com/";
const externalApiUrl =
  process.env.EXTERNAL_API_URL?.trim() || fallbackExternalApiUrl;

function shouldProxyToExternalApi(pathname: string): boolean {
  // Keep upload signing route local; proxy all other API calls.
  return pathname.startsWith("/api") && !pathname.startsWith("/api/uploads");
}

app.use(
  createProxyMiddleware({
    target: externalApiUrl,
    changeOrigin: true,
    secure: true,
    pathFilter: (pathname) => shouldProxyToExternalApi(pathname),
    on: {
      error: (err, _req, res) => {
        const formattedTime = new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });

        console.log(`${formattedTime} [express] Proxy error: ${err.message}`);

        if (res && "writeHead" in res) {
          (res as any).writeHead(502, {
            "Content-Type": "application/json",
          });
          (res as any).end(
            JSON.stringify({
              success: false,
              error: "External API unavailable",
            }),
          );
        }
      },
    },
  }),
);

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;

    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;

      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  log(
    `Proxying /api/* to external API (${externalApiUrl}), except /api/uploads/*`,
  );

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);

  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
