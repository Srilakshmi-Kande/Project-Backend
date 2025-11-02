// ...existing code...
import "dotenv/config";
import express from "express";
import authRoutes from "./src/routes/auth.route.js";
import classRoutes from "./src/routes/classes.route.js";
import questionRoutes from "./src/routes/questions.route.js";

const app = express();
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/classes", classRoutes);
app.use("/questions", questionRoutes);

app.get("/", (req, res) => res.send("OK"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening: http://localhost:${PORT}`);
});