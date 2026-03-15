// routes/authRoutes.js
import { Router }    from "express";
import { register, getMe } from "../controllers/authController.js";
import { verifyToken }     from "../middleware/verifyToken.js";
import { attachUser }      from "../middleware/attachUser.js";

const router = Router();
router.post("/register", verifyToken, register);
router.get("/me",        verifyToken, attachUser, getMe);
export default router;
