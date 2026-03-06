import { Router } from "express";
import {
  createSpecialSong,
  getSpecialSongs,
  updateSpecialSong,
  deleteSpecialSong,
  exportSongs,
} from "../controller/songController";
import { authenticate } from "../middleware/authenticate";
import { authorizeEvent } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import { createEventSongSchema, updateEventSongSchema } from "../schemas/songSchema";

const router = Router({ mergeParams: true });

router.use(authenticate, authorizeEvent);

router.post("/special", validate(createEventSongSchema), createSpecialSong);
router.get("/special", getSpecialSongs);
router.put("/special/:sid", validate(updateEventSongSchema), updateSpecialSong);
router.delete("/special/:sid", deleteSpecialSong);
router.get("/export", exportSongs);

export default router;
