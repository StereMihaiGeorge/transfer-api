import { Router } from "express";
import { getInvitation, respond, preferences, addSongRequest } from "../controller/rsvpController";
import { validate } from "../middleware/validate";
import { rsvpSchema, preferencesSchema } from "../schemas/rsvpSchema";
import { createSongRequestSchema } from "../schemas/songSchema";

const router = Router();

// Public routes — no authentication needed
router.get("/:token", getInvitation);
router.post("/:token", validate(rsvpSchema), respond);
router.post("/:token/preferences", validate(preferencesSchema), preferences);
router.post("/:token/songs", validate(createSongRequestSchema), addSongRequest);

export default router;