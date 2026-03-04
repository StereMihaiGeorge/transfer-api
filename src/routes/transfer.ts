import { Router } from "express";
import { handleTransfer } from "../controller/transferController";
import { validateTransfer } from "../middleware/validate";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.post("/transfer", authenticate, validateTransfer, handleTransfer);

export default router;

