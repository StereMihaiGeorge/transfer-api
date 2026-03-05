import { Router } from "express";
import {
  create,
  getAll,
  update,
  remove,
  assignTable,
  markInvited,
} from "../controller/guestController";
import { authenticate } from "../middleware/authenticate";
import { authorizeEvent } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import {
  createGuestSchema,
  updateGuestSchema,
  assignTableSchema,
} from "../schemas/guestSchema";

const router = Router({ mergeParams: true }); // mergeParams to access :id from parent route

// All routes require authentication + event ownership
router.use(authenticate, authorizeEvent);

router.post("/", validate(createGuestSchema), create);
router.get("/", getAll);
router.put("/:gid", validate(updateGuestSchema), update);
router.delete("/:gid", remove);
router.put("/:gid/assign-table", validate(assignTableSchema), assignTable);
router.put("/:gid/mark-invited", markInvited);

export default router;
