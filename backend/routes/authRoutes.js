import express from "express";
import { register, getMe } from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", verifyToken, register);
router.get("/me", verifyToken, getMe);

export default router;