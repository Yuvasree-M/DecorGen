import { db }                                          from "../config/firebase.js";
import { uploadPortfolioImage, deleteFromCloudinary }  from "../services/cloudinaryService.js";

const sortByDate = (arr) =>
  arr.sort((a, b) => (b.createdAt?._seconds ?? 0) - (a.createdAt?._seconds ?? 0));

// GET /api/builders  — public, active builders
export const getBuilders = async (req, res) => {
  try {
    const snap = await db.collection("builders").get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(b => !b.status || b.status === "active"));
  } catch (err) {
    console.error("getBuilders:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/builders/all  — admin
export const getAllBuilders = async (req, res) => {
  try {
    const snap = await db.collection("builders").get();
    res.json(sortByDate(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/builders/my  — builder's own profile
export const getMyBuilderProfile = async (req, res) => {
  try {
    const snap = await db.collection("builders").doc(req.user.uid).get();
    res.json(snap.exists ? { id: snap.id, ...snap.data() } : null);
  } catch (err) {
    console.error("getMyBuilderProfile:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/builders/my  — create or update profile
export const upsertMyBuilderProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { name, title, bio, location, experience, styles, specialties, price, phone } = req.body;
    if (!name || !title || !bio || !styles?.length)
      return res.status(400).json({ message: "Name, title, bio and at least one style are required" });

    const ref  = db.collection("builders").doc(uid);
    const snap = await ref.get();
    const now  = new Date();

    if (snap.exists) {
      await ref.update({ name, title, bio, location: location||"", experience: experience||"",
        styles: styles||[], specialties: specialties||[], price: price||"", phone: phone||"", updatedAt: now });
    } else {
      const userSnap = await db.collection("users").doc(uid).get();
      const email    = userSnap.exists ? userSnap.data().email : req.user.email || "";
      const initials = (name||"B").split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2);
      await ref.set({ uid, name, title, bio, email, location: location||"", experience: experience||"",
        styles: styles||[], specialties: specialties||[], price: price||"", phone: phone||"",
        avatar: initials, rating: 5.0, reviewCount: 0, portfolioImages: [],
        status: "active", createdAt: now, updatedAt: now });
    }
    const updated = await ref.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (err) {
    console.error("upsertMyBuilderProfile:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/builders/my/portfolio  — upload portfolio image
export const addPortfolioImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image required" });
    const uid      = req.user.uid;
    const uploaded = await uploadPortfolioImage(req.file.buffer);
    const img      = { url: uploaded.secure_url, publicId: uploaded.public_id, addedAt: new Date().toISOString() };

    const ref  = db.collection("builders").doc(uid);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ message: "Profile not found — create profile first" });

    const existing = snap.data().portfolioImages || [];
    if (existing.length >= 12) return res.status(400).json({ message: "Maximum 12 portfolio images allowed" });

    await ref.update({ portfolioImages: [...existing, img], updatedAt: new Date() });
    res.json({ message: "Uploaded", image: img });
  } catch (err) {
    console.error("addPortfolioImage:", err.message);
    res.status(500).json({ message: "Upload failed" });
  }
};

// DELETE /api/builders/my/portfolio/:publicId  — delete portfolio image
export const deletePortfolioImage = async (req, res) => {
  try {
    const uid      = req.user.uid;
    const publicId = decodeURIComponent(req.params.publicId);

    await deleteFromCloudinary(publicId);

    const ref  = db.collection("builders").doc(uid);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ message: "Profile not found" });

    const filtered = (snap.data().portfolioImages || []).filter(img => img.publicId !== publicId);
    await ref.update({ portfolioImages: filtered, updatedAt: new Date() });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("deletePortfolioImage:", err.message);
    res.status(500).json({ message: "Delete failed" });
  }
};

// Admin: PATCH /api/builders/:id/status
export const updateBuilderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active","inactive","pending"].includes(status))
      return res.status(400).json({ message: "Invalid status" });
    await db.collection("builders").doc(req.params.id).update({ status, updatedAt: new Date() });
    res.json({ message: "Status updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: GET /api/builders/designs-by-user  — designs grouped by user
export const getDesignsByUser = async (req, res) => {
  try {
    const [usersSnap, designsSnap] = await Promise.all([
      db.collection("users").get(),
      db.collection("designs").get(),
    ]);
    const usersMap = Object.fromEntries(usersSnap.docs.map(d => [d.id, d.data()]));
    const designs  = designsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const grouped = {};
    for (const d of designs) {
      const uid  = d.userId || "unknown";
      const user = usersMap[uid] || {};
      if (!grouped[uid]) {
        grouped[uid] = { userId: uid, userName: user.name||"Unknown", userEmail: user.email||"", designs: [] };
      }
      grouped[uid].designs.push(d);
    }
    // sort each user's designs newest first
    for (const g of Object.values(grouped)) {
      g.designs.sort((a,b)=>(b.createdAt?._seconds??0)-(a.createdAt?._seconds??0));
      g.designCount = g.designs.length;
    }
    res.json(sortByDate(Object.values(grouped)));
  } catch (err) {
    console.error("getDesignsByUser:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
