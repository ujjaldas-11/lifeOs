import express from "express";

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

export default app;