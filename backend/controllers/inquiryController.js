import { db } from "../config/firebase.js";

const sortByDate = (arr) =>
  arr.sort((a, b) => {
    const ta = a.createdAt?._seconds ?? (a.createdAt ? new Date(a.createdAt).getTime() / 1000 : 0);
    const tb = b.createdAt?._seconds ?? (b.createdAt ? new Date(b.createdAt).getTime() / 1000 : 0);
    return tb - ta;
  });

// POST /api/inquiries — create new inquiry
export const createInquiry = async (req, res) => {
  try {
    const {
      builderId, builderName, style, budget, timeline, message,
      originalImageUrl, generatedImageUrl, userPhone
    } = req.body;

    if (!builderId || !message)
      return res.status(400).json({ message: "builderId and message are required" });

    const uid   = req.user?.uid   || "guest";
    const email = req.user?.email || req.body.userEmail || "";
    const name  = req.user?.name  || req.body.userName  || "";

    const ref = await db.collection("inquiries").add({
      userId:             uid,
      userEmail:          email,
      userName:           name,
      userPhone:          userPhone           || "",
      builderId:          builderId,
      builderName:        builderName         || "",
      style:              style               || "",
      budget:             budget              || "",
      timeline:           timeline            || "",
      message:            message,
      originalImageUrl:   originalImageUrl    || "",   // before image
      generatedImageUrl:  generatedImageUrl   || "",   // after image
      // Keep designImageUrl for backward compat
      designImageUrl:     generatedImageUrl   || originalImageUrl || "",
      status:             "new",
      // messages = threaded chat array
      messages: [
        {
          sender:    "user",
          senderName: name || "User",
          text:      message,
          sentAt:    new Date().toISOString(),
        }
      ],
      builderReply:  "",
      repliedAt:     null,
      createdAt:     new Date(),
      updatedAt:     new Date(),
    });

    res.status(201).json({ id: ref.id, message: "Inquiry sent successfully" });
  } catch (err) {
    console.error("createInquiry error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/inquiries/my  — user sees inquiries they sent
export const getMyInquiries = async (req, res) => {
  try {
    const snap      = await db.collection("inquiries").where("userId", "==", req.user.uid).get();
    const inquiries = sortByDate(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    res.json(inquiries);
  } catch (err) {
    console.error("getMyInquiries error:", err.message);
    res.status(500).json({ message: "Failed to load inquiries" });
  }
};

// GET /api/inquiries/builder  — builder sees inquiries sent TO them
export const getBuilderInquiries = async (req, res) => {
  try {
    const snap      = await db.collection("inquiries").where("builderId", "==", req.user.uid).get();
    const inquiries = sortByDate(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    res.json(inquiries);
  } catch (err) {
    console.error("getBuilderInquiries error:", err.message);
    res.status(500).json({ message: "Failed to load builder inquiries" });
  }
};

// GET /api/inquiries/all  — admin
export const getAllInquiries = async (req, res) => {
  try {
    const snap      = await db.collection("inquiries").get();
    const inquiries = sortByDate(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    res.json(inquiries);
  } catch (err) {
    console.error("getAllInquiries error:", err.message);
    res.status(500).json({ message: "Failed to load all inquiries" });
  }
};

// POST /api/inquiries/:id/message  — send a chat message (user or builder)
export const sendMessage = async (req, res) => {
  try {
    const { id }               = req.params;
    const { text, senderRole } = req.body;   // senderRole = "user" | "builder"

    if (!text?.trim()) return res.status(400).json({ message: "Message text required" });

    const ref  = db.collection("inquiries").doc(id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ message: "Inquiry not found" });

    const existing = snap.data();
    const messages = Array.isArray(existing.messages) ? existing.messages : [];

    const newMsg = {
      sender:     senderRole || "user",
      senderName: req.user?.name || req.user?.email || senderRole || "User",
      text:       text.trim(),
      sentAt:     new Date().toISOString(),
    };

    messages.push(newMsg);

    // Also update top-level builderReply for backward compat
    const updates = {
      messages,
      updatedAt: new Date(),
      status:    existing.status === "new" ? "replied" : existing.status,
    };
    if (senderRole === "builder") {
      updates.builderReply = text.trim();
      updates.repliedAt    = new Date();
    }

    await ref.update(updates);
    res.json({ message: "Message sent", msg: newMsg });
  } catch (err) {
    console.error("sendMessage error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/inquiries/:id/status  — close inquiry
export const updateInquiryStatus = async (req, res) => {
  try {
    const { status, reply } = req.body;
    const updates = { status, updatedAt: new Date() };
    if (reply) { updates.builderReply = reply; updates.repliedAt = new Date(); }
    await db.collection("inquiries").doc(req.params.id).update(updates);
    res.json({ message: "Updated" });
  } catch (err) {
    console.error("updateInquiryStatus error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/inquiries/:id — user deletes their own chat
export const deleteInquiry = async (req, res) => {
  try {
    const ref  = db.collection("inquiries").doc(req.params.id);
    const snap = await ref.get();

    if (!snap.exists)
      return res.status(404).json({ message: "Inquiry not found" });

    if (snap.data().userId !== req.user.uid)
      return res.status(403).json({ message: "Forbidden" });

    await ref.delete();
    res.json({ success: true });
  } catch (err) {
    console.error("deleteInquiry error:", err.message);
    res.status(500).json({ message: "Failed to delete inquiry" });
  }
};