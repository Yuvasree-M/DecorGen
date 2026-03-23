import { Router }    from "express";
import { generateDesign, enhanceDesign, getMyDesigns, getAllDesigns, recordDownload, deleteDesign } from "../controllers/designController.js";
import { verifyToken, optionalToken } from "../middleware/verifyToken.js";
import { attachUser }  from "../middleware/attachUser.js";
import { checkAdmin }  from "../middleware/roleMiddleware.js";
import upload          from "../middleware/upload.js";

const router = Router();
router.post("/generate",      optionalToken, upload.single("image"), generateDesign);
router.post("/enhance",       optionalToken, upload.single("image"), enhanceDesign);
router.get("/my",             verifyToken, attachUser, getMyDesigns);
router.get("/all",            verifyToken, attachUser, checkAdmin, getAllDesigns);
router.patch("/:id/download", optionalToken, recordDownload);
router.delete("/:id",         verifyToken, attachUser, deleteDesign);

export default router;