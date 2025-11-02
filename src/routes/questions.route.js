// ...existing code...
import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { postQuestion, markAnswered, getQuestions } from "../contoller/questions.controller.js";

const router = express.Router();
router.post("/post", requireAuth, postQuestion);
router.post("/mark-answered", requireAuth, markAnswered);
router.get("/", requireAuth, getQuestions);

export default router;