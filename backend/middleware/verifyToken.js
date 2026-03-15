import { auth } from "../config/firebase.js";

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const token       = authHeader.split(" ")[1];
    const decoded     = await auth.verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email, name: decoded.name || "" };
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// Optional: allows guests through, sets req.user = null
export const optionalToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }
  try {
    const token   = authHeader.split(" ")[1];
    const decoded = await auth.verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email, name: decoded.name || "" };
  } catch {
    req.user = null;
  }
  next();
};
