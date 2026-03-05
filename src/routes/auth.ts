import { Router } from "express";
import { register, login, refresh, logout } from "../controller/authController";
import { validate } from "../middleware/validate";
import { registerSchema, loginSchema, refreshSchema, logoutSchema } from "../schemas/authSchemas";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", validate(refreshSchema), refresh);
router.post("/logout", validate(logoutSchema), logout);

export default router;
