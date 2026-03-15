import { db } from "../config/firebase.js";

const sortByDate = (arr) =>
  arr.sort((a, b) => {
    const ta = a.createdAt?._seconds ?? 0;
    const tb = b.createdAt?._seconds ?? 0;
    return tb - ta;
  });

// Admin: GET /api/users
export const getAllUsers = async (req, res) => {
  try {
    const snap  = await db.collection("users").get();
    const users = sortByDate(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// User: GET /api/users/profile
export const getUserProfile = async (req, res) => {
  try {
    const snap = await db.collection("users").doc(req.user.uid).get();
    if (!snap.exists) return res.status(404).json({ message: "User not found" });
    res.json({ id: snap.id, ...snap.data() });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// User: PUT /api/users/profile
export const updateUserProfile = async (req, res) => {
  try {
    const { phone, address } = req.body;
    const updates = {};
    if (phone   !== undefined) updates.phone   = phone;
    if (address !== undefined) updates.address = address;
    if (!Object.keys(updates).length)
      return res.status(400).json({ message: "Nothing to update" });
    await db.collection("users").doc(req.user.uid).update(updates);
    res.json({ message: "Profile updated", ...updates });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: PATCH /api/users/:uid/role
export const setUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["USER", "BUILDER", "ADMIN"].includes(role))
      return res.status(400).json({ message: "Invalid role" });
    await db.collection("users").doc(req.params.uid).update({ role });
    res.json({ message: "Role updated to " + role });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
