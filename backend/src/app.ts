import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
import habitRoutes from "./routes/habit.routes.js";
import eventRoutes from "./routes/event.routes.js";
import noteRoutes from "./routes/note.routes.js";
import projectRoutes from "./routes/project.routes.js";
import focusRoutes from "./routes/focus.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

const app = express();

// Middlewares
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://localhost:5000"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check / welcome
app.get("/", (_req: Request, res: Response) => {
  res.json({
    name: "Personal Developer Life OS API",
    version: "3.0.0",
    status: "healthy",
    message: "LifeOS API is running 🚀",
  });
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/focus", focusRoutes);
app.use("/api/analytics", analyticsRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Internal Server Error:", err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "An unexpected internal server error occurred",
  });
});

export default app;