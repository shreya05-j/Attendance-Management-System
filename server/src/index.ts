import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/index.js";

const app = express();

// ─── Security Middleware ─────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: env.NODE_ENV === "development"
    ? (_origin: any, cb: any) => cb(null, true)   // allow any origin in dev
    : env.CORS_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ─── Rate Limiting ──────────────────────────────────────
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests. Please try again later." },
});
app.use(limiter);

// ─── Body Parsing & Logging ─────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// ─── Routes ─────────────────────────────────────────────
app.use("/api/v1", routes);

// ─── Error Handling ─────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────
app.listen(env.PORT, () => {
  console.log(`\n  🚀 Server running on http://localhost:${env.PORT}`);
  console.log(`  📝 Environment: ${env.NODE_ENV}`);
  console.log(`  🔗 API: http://localhost:${env.PORT}/api/v1\n`);
});

export default app;
