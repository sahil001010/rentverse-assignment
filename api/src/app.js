import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import chainRoutes from "./routes/chainRoutes.js";
import contractRoutes from "./routes/contractRoutes.js";

export const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.clientOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin not allowed"));
    },
  })
);
app.use(express.json({ limit: "100kb" }));

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ success: true, data: { status: "ok" } });
});

app.get("/api/v1", (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: "RentVerse API is running. Login is started from the Connect button in the app.",
      health: "/api/v1/health",
      login: "POST /api/v1/auth/nonce",
    },
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/chains", chainRoutes);
app.use("/api/v1/contracts", contractRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: `Route not found: ${req.method} ${req.originalUrl}` },
  });
});

app.use(errorHandler);
