import { db } from "../config/firebase.js";

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const { uid, email } = req.user;

    const userRef = db.collection("users").doc(uid);
    const existing = await userRef.get();

    if (existing.exists) {
      await userRef.update({
        name: name || "",
        phone: phone || ""
      });

      const updated = await userRef.get();
      return res.json({ id: uid, ...updated.data() });
    }

    const newUser = {
      name: name || "",
      email,
      phone: phone || "",
      role: "USER",
      createdAt: new Date()
    };

    await userRef.set(newUser);

    res.status(201).json({ id: uid, ...newUser });

  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const snap = await db.collection("users").doc(req.user.uid).get();

    if (!snap.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ id: snap.id, ...snap.data() });

  } catch (err) {
    console.error("getMe error:", err);
    res.status(500).json({ message: "Server error" });
  }
};