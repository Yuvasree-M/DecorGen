import { Router } from "express";
import {
  getBuilders, getAllBuilders, getMyBuilderProfile, upsertMyBuilderProfile,
  addPortfolioImage, deletePortfolioImage, updateBuilderStatus, getDesignsByUser
} from "../controllers/builderController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { attachUser }  from "../middleware/attachUser.js";
import { checkAdmin }  from "../middleware/roleMiddleware.js";
import upload          from "../middleware/upload.js";

const router = Router();

router.get("/",                          getBuilders);
router.get("/my",                        verifyToken, attachUser, getMyBuilderProfile);
router.post("/my",                       verifyToken, attachUser, upsertMyBuilderProfile);
router.post("/my/portfolio",             verifyToken, attachUser, upload.single("image"), addPortfolioImage);
router.delete("/my/portfolio/:publicId", verifyToken, attachUser, deletePortfolioImage);
router.get("/all",                       verifyToken, attachUser, checkAdmin, getAllBuilders);
router.get("/designs-by-user",           verifyToken, attachUser, checkAdmin, getDesignsByUser);
router.patch("/:id/status",              verifyToken, attachUser, checkAdmin, updateBuilderStatus);

export default router;
