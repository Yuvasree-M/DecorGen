import "dotenv/config";
import express   from "express";
import cors      from "cors";

import authRoutes     from "./routes/authRoutes.js";
import userRoutes     from "./routes/userRoutes.js";
import designRoutes   from "./routes/designRoutes.js";
import inquiryRoutes  from "./routes/inquiryRoutes.js";
import contactRoutes  from "./routes/contactRoutes.js";
import builderRoutes  from "./routes/builders.js";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/api/auth",      authRoutes);
app.use("/api/users",     userRoutes);
app.use("/api/designs",   designRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/contact",   contactRoutes);
app.use("/api/builders",  builderRoutes);

app.get("/", (_, res) => res.json({ message: "InteriorAI API running ✅" }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
