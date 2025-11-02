import { db } from "../db/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_EXP = "7d";
const JWT_SECRET = process.env.JWT_SECRET || "change_this_in_production";

/**
 * RegisterAPI
 * Body: { name, email, password, role }
 */
export const RegisterAPI = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "name, email, password and role are required" });
    }
    if (!["Professor", "TA", "Student"].includes(role)) {
      return res.status(400).json({ message: "invalid role" });
    }

    // check existing
    const { data: existing, error: existErr } = await db.from("user_details").select("id").eq("email", email).maybeSingle();
    if (existErr) return res.status(500).json({ message: "DB error", details: existErr.message });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    const { data, error } = await db
      .from("user_details")
      .insert([{ name, email, role, password: hashed }])
      .select()
      .single();

    if (error) return res.status(500).json({ message: "Failed to create user", details: error.message });

    const user = { id: data.id, name: data.name, email: data.email, role: data.role, created_at: data.created_at };

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXP });

    res.status(201).json({ message: "Registered", user, token });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * LoginAPI
 * Body: { email, password }
 */
export const LoginAPI = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const { data: user, error } = await db.from("user_details").select().eq("email", email).maybeSingle();
    if (error) return res.status(500).json({ message: "DB error", details: error.message });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXP });

    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role, created_at: user.created_at };
    res.status(200).json({ message: "Login successful", user: safeUser, token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};