import { db } from "../config/firebase.js";

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const { uid, email } = req.user;

    const userRef = db.collection("users").doc(uid);
    const existing = await userRef.get();

    if (existing.exists) {
      return res.json({ message: "User already exists", ...existing.data() });
    }

    const userData = {
      name: name || "",
      email,
      phone: phone || "",
      role: "USER",
      createdAt: new Date()
    };

    await userRef.set(userData);

    res.status(201).json({
      id: uid,
      ...userData
    });

  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};