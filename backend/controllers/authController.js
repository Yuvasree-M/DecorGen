import { db } from "../config/firebase.js";

// POST /api/auth/register — called right after Firebase sign-up
export const register = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const { uid, email }  = req.user;

    // Check if already exists (Google sign-in re-registration)
    const existing = await db.collection("users").doc(uid).get();
    if (existing.exists) {
      return res.json({ message: "User already exists" });
    }

    await db.collection("users").doc(uid).set({
      name:      name  || "",
      email,
      phone:     phone || "",
      role:      "USER",
      createdAt: new Date(),
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const snap = await db.collection("users").doc(req.user.uid).get();

    // Auto-create doc for Google sign-in users
    if (!snap.exists) {
      const newUser = {
        name:      req.user.name  || "",
        email:     req.user.email || "",
        phone:     "",
        role:      "USER",
        createdAt: new Date(),
      };
      await db.collection("users").doc(req.user.uid).set(newUser);
      return res.json({ id: req.user.uid, ...newUser });
    }

    res.json({ id: snap.id, ...snap.data() });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
