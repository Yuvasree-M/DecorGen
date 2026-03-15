import { db }                                    from "../config/firebase.js";
import { uploadToCloudinary }                    from "../services/cloudinaryService.js";
import { generateRoomDesign }                    from "../services/freepikService.js";
import { buildPrompt }                           from "../utils/promptBuilder.js";
import { checkGuestLimit, incrementGuestUsage }  from "../utils/guestLimit.js";

const sortByDate = (arr) =>
  arr.sort((a, b) => {
    const ta = a.createdAt?._seconds ?? (a.createdAt ? new Date(a.createdAt).getTime() / 1000 : 0);
    const tb = b.createdAt?._seconds ?? (b.createdAt ? new Date(b.createdAt).getTime() / 1000 : 0);
    return tb - ta;
  });

// POST /api/designs/generate
export const generateDesign = async (req, res) => {
  try {
    const file                              = req.file;
    const { style, customPrompt, roomType } = req.body;
    const isGuest                           = !req.user;
    if (!file) return res.status(400).json({ message: "Image required" });

    if (isGuest) {
      const ip    = req.ip || "unknown";
      const check = checkGuestLimit(ip, "generate");
      if (!check.allowed)
        return res.status(403).json({ message: `Free limit reached (${check.limit}). Please sign in.`, requireLogin: true });
      incrementGuestUsage(ip, "generate");
    }

    const uploaded    = await uploadToCloudinary(file.buffer);
    const imageUrl    = uploaded.secure_url;
    const prompt      = buildPrompt({ style, customPrompt, roomType });
    const outputImage = await generateRoomDesign(prompt, imageUrl);

    if (req.user) {
      await db.collection("designs").add({
        userId: req.user.uid, originalImageUrl: imageUrl, generatedImageUrl: outputImage,
        style: style || "", roomType: roomType || "", customPrompt: customPrompt || "",
        type: "generate", createdAt: new Date(),
      });
    }

    const ip        = req.ip || "unknown";
    const remaining = isGuest ? checkGuestLimit(ip, "generate").remaining : null;
    res.json({ success: true, originalImage: imageUrl, generatedImage: outputImage, isGuest, remaining });
  } catch (err) {
    console.error("generateDesign error:", err.message);
    res.status(500).json({ message: "AI generation failed" });
  }
};

// POST /api/designs/enhance
export const enhanceDesign = async (req, res) => {
  try {
    const file             = req.file;
    const { instructions } = req.body;
    const isGuest          = !req.user;
    if (!file) return res.status(400).json({ message: "Image required" });

    if (isGuest) {
      const ip    = req.ip || "unknown";
      const check = checkGuestLimit(ip, "enhance");
      if (!check.allowed)
        return res.status(403).json({ message: `Free limit reached (${check.limit}). Please sign in.`, requireLogin: true });
      incrementGuestUsage(ip, "enhance");
    }

    const uploaded    = await uploadToCloudinary(file.buffer);
    const imageUrl    = uploaded.secure_url;
    const prompt      = `This is an interior design image. Keep the same room layout. Apply: ${instructions || "enhance lighting, colors and aesthetics"}. Realistic interior photography.`;
    const outputImage = await generateRoomDesign(prompt, imageUrl);

    if (req.user) {
      await db.collection("designs").add({
        userId: req.user.uid, originalImageUrl: imageUrl, generatedImageUrl: outputImage,
        enhanceInstructions: instructions || "", type: "enhance", createdAt: new Date(),
      });
    }

    const ip        = req.ip || "unknown";
    const remaining = isGuest ? checkGuestLimit(ip, "enhance").remaining : null;
    res.json({ success: true, originalImage: imageUrl, enhancedImage: outputImage, isGuest, remaining });
  } catch (err) {
    console.error("enhanceDesign error:", err.message);
    res.status(500).json({ message: "Enhancement failed" });
  }
};

// GET /api/designs/my  — simple .get() then JS sort, no index needed
export const getMyDesigns = async (req, res) => {
  try {
    const snap    = await db.collection("designs").where("userId", "==", req.user.uid).get();
    const designs = sortByDate(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    res.json(designs);
  } catch (err) {
    console.error("getMyDesigns error:", err.message);
    res.status(500).json({ message: "Failed to load designs" });
  }
};

// GET /api/designs/all — admin, simple collection scan + JS sort
export const getAllDesigns = async (req, res) => {
  try {
    const snap    = await db.collection("designs").get();
    const designs = sortByDate(snap.docs.map(d => ({ id: d.id, ...d.data() }))).slice(0, 200);
    res.json(designs);
  } catch (err) {
    console.error("getAllDesigns error:", err.message);
    res.status(500).json({ message: "Failed to load all designs" });
  }
};

// PATCH /api/designs/:id/download
export const recordDownload = async (req, res) => res.json({ success: true });
