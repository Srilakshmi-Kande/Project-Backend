import express from "express";
import { LoginAPI,RegisterAPI } from "../contoller/auth.controller.js";

const router = express.Router();

// POST /auth/login
router.post("/register", RegisterAPI);
router.post("/login", LoginAPI);

export default router;