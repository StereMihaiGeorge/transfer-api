import { Router } from "express";
import { handleTransfer } from "../controller/transferController";
import { validateTransfer } from "../middleware/validate";

const router = Router();

router.post("/transfer", validateTransfer, handleTransfer);

export default router;

