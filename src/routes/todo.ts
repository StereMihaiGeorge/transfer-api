import { Router } from "express";
import { create, getAll, update, remove } from "../controller/todoController";
import { authenticate } from "../middleware/authenticate";
import { authorizeEvent } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import { createTodoSchema, updateTodoSchema } from "../schemas/todoSchema";

const router = Router({ mergeParams: true });

// All routes require authentication + event ownership
router.use(authenticate, authorizeEvent);

router.post("/", validate(createTodoSchema), create);
router.get("/", getAll);
router.put("/:tid", validate(updateTodoSchema), update);
router.delete("/:tid", remove);

export default router;