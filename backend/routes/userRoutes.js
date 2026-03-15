import { Router }    from "express";
import { getAllUsers, getUserProfile, updateUserProfile, setUserRole } from "../controllers/userController.js";
import { verifyToken }  from "../middleware/verifyToken.js";
import { attachUser }   from "../middleware/attachUser.js";
import { checkAdmin }   from "../middleware/roleMiddleware.js";

const router = Router();

router.get("/",              verifyToken, attachUser, checkAdmin, getAllUsers);
router.get("/profile",       verifyToken, attachUser, getUserProfile);
router.put("/profile",       verifyToken, attachUser, updateUserProfile);
router.patch("/:uid/role",   verifyToken, attachUser, checkAdmin, setUserRole);

export default router;
