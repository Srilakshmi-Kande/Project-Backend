// ...existing code...
import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { createClass, joinClass, leaveClass, professorDashboard, taDashboard } from "../contoller/classes.controller.js";

const router = express.Router();
router.post("/create", requireAuth, createClass);
router.post("/join", requireAuth, joinClass);
router.post("/leave", requireAuth, leaveClass);
router.get("/professor/dashboard", requireAuth, professorDashboard);
router.get("/ta/dashboard", requireAuth, taDashboard);

export default router;