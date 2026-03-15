import { db } from "../config/firebase.js";

export const attachUser = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const userRef = db.collection("users").doc(req.user.uid);
    const snap    = await userRef.get();

    if (!snap.exists) {
      // Auto-create minimal doc (handles Google login edge case)
      const newUser = {
        name:      req.user.name  || "",
        email:     req.user.email || "",
        phone:     "",
        role:      "USER",
        createdAt: new Date(),
      };
      await userRef.set(newUser);
      req.user.role = "USER";
      req.user.name = newUser.name;
    } else {
      const data    = snap.data();
      req.user.role = data.role || "USER";
      req.user.name = data.name || req.user.name || "";
    }

    next();
  } catch (err) {
    console.error("attachUser error:", err.message);
    res.status(500).json({ message: "Failed to attach user" });
  }
};
