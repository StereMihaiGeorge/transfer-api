import { Router } from "express";
import {
  create,
  getAll,
  getOne,
  update,
  remove,
} from "../controller/tableController";
import { authenticate } from "../middleware/authenticate";
import { authorizeEvent } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import { createTableSchema, updateTableSchema } from "../schemas/tableSchema";

const router = Router({ mergeParams: true });

// All routes require authentication + event ownership
router.use(authenticate, authorizeEvent);

router.post("/", validate(createTableSchema), create);
router.get("/", getAll);
router.get("/:tid", getOne);
router.put("/:tid", validate(updateTableSchema), update);
router.delete("/:tid", remove);

export default router;