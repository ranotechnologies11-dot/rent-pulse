import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { timingSafeEqual } from "node:crypto";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { runAutomatedReminderCheck } from "../rentEngine";
import { createServiceSupabase } from "../supabase";
import { ENV } from "./env";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(helmet({
    contentSecurityPolicy: ENV.isProduction ? {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        formAction: ["'self'"],
        scriptSrc: ["'self'", "https:"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", "https:"],
      },
    } : false,
    crossOriginEmbedderPolicy: false,
  }));
  app.use((req, res, next) => {
    const origin = req.get("origin");
    const expectedOrigin = `${req.protocol}://${req.get("host")}`;
    if (origin && origin !== expectedOrigin) return res.status(403).json({ error: "Cross-origin request denied." });
    next();
  });
  const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: "draft-8", legacyHeaders: false, message: { error: "Too many requests. Please try again later." } });
  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: "draft-8", legacyHeaders: false, message: { error: "Too many authentication attempts. Please try again later." } });
  app.use("/api", apiLimiter);
  app.use("/api/oauth", authLimiter);
  app.use(express.json({ limit: "1mb", strict: true }));
  app.use(express.urlencoded({ limit: "256kb", extended: false }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  // tRPC API
  app.post("/api/scheduled/rentReminders", async (req, res) => {
    try {
      const authorization = req.header("authorization");
      const suppliedSecret = authorization?.startsWith("Bearer ") ? authorization.slice(7) : req.header("x-cron-secret");
      const expected = Buffer.from(ENV.cronSecret || "", "utf8");
      const supplied = Buffer.from(suppliedSecret || "", "utf8");
      const validSecret = expected.length > 0 && expected.length === supplied.length && timingSafeEqual(expected, supplied);
      if (!validSecret) {
        return res.status(401).json({ ok: false, error: "Unauthorized scheduled reminder request." });
      }
      const serviceClient = createServiceSupabase();
      if (!serviceClient) return res.status(503).json({ ok: false, error: "Supabase worker configuration is missing." });
      const result = await runAutomatedReminderCheck(serviceClient, "cron");
      return res.json({ ok: true, ...result });
    } catch (err: any) {
      console.error("[scheduled-reminders] failed", err);
      return res.status(500).json({ error: "Scheduled reminder check failed." });
    }
  });
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
      onError: ({ path, error }) => {
        if (ENV.isProduction) console.error(`[trpc] ${path ?? "unknown"}`, error.code);
      },
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
