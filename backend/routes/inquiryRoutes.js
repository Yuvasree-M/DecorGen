import { Router } from "express";
import {
  createInquiry, getMyInquiries, getBuilderInquiries,
  getAllInquiries, sendMessage, updateInquiryStatus
} from "../controllers/inquiryController.js";
import { verifyToken, optionalToken } from "../middleware/verifyToken.js";
import { attachUser }                 from "../middleware/attachUser.js";
import { checkAdmin }                 from "../middleware/roleMiddleware.js";

const router = Router();
router.post("/",                 optionalToken, createInquiry);
router.get("/my",                verifyToken, attachUser, getMyInquiries);
router.get("/builder",           verifyToken, attachUser, getBuilderInquiries);
router.get("/all",               verifyToken, attachUser, checkAdmin, getAllInquiries);
router.post("/:id/message",      verifyToken, attachUser, sendMessage);
router.patch("/:id/status",      verifyToken, attachUser, updateInquiryStatus);
export default router;
