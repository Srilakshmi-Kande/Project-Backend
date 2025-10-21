import { db } from "../db/db.js";

export const LoginAPI = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const { data, error } = await db.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ message: error.message });
    }

    res.status(200).json({ message: "Login successful", data });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
