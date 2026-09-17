import express from "express";
import taskRoutes from "./routes/task.routes.js"

const app = express();

app.use(express.json());

app.get("/users", (req, res) =>  {
  return res.json("hello new user!");
})

app.get("/", (_req, res) => {
  res.json({
    message: "LifeOS API is running 🚀"
  });
});

// app.use("/api/tasks", taskRoutes);

app.use("/api/tasks", taskRoutes);

export default app;