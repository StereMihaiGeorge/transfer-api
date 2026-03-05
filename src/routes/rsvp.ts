import { Router } from "express";
import { getInvitation, respond, preferences } from "../controller/rsvpController";
import { validate } from "../middleware/validate";
import { rsvpSchema, preferencesSchema } from "../schemas/rsvpSchema";

const router = Router();

// Public routes — no authentication needed
router.get("/:token", getInvitation);
router.post("/:token", validate(rsvpSchema), respond);
router.post("/:token/preferences", validate(preferencesSchema), preferences);

export default router;