import { Router } from "express";
import { register, login, adminLogin, forgotPassword, resetPassword } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/admin/login", adminLogin);

router.post("/forgot", forgotPassword);
router.post("/reset", resetPassword);

export default router;
