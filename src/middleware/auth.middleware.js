import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ message: "Missing token" });

    const token = auth.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ message: "Server JWT secret not configured" });

    const payload = jwt.verify(token, secret);
    // only attach minimal safe fields
    req.user = {
      id: payload.id,
      role: payload.role,
      name: payload.name,
      email: payload.email
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};