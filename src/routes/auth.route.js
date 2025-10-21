import express from "express";
import { LoginAPI } from "../contoller/auth.controller.js";

const router = express.Router();

// POST /auth/login
router.post("/login", LoginAPI);

export default router;
