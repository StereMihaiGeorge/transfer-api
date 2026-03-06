import { Router } from "express";
import { create, getById, update, remove, dashboard } from "../controller/eventController";
import { authenticate } from "../middleware/authenticate";
import { authorizeEvent } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import { createEventSchema, updateEventSchema } from "../schemas/eventSchema";

const router = Router();

// All routes require authentication
router.post("/", authenticate, validate(createEventSchema), create);
router.get("/:id/dashboard", authenticate, authorizeEvent, dashboard);
router.get("/:id", authenticate, authorizeEvent, getById);
router.put("/:id", authenticate, authorizeEvent, validate(updateEventSchema), update);
router.delete("/:id", authenticate, authorizeEvent, remove);


export default router;