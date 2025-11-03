import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { createContext } from "./trpcContext";

const app = express();

// ajuste aqui para o domínio real do Netlify
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://SEU-SITE.netlify.app",
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

registerOAuthRoutes(app);

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.get("/healthz", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});
