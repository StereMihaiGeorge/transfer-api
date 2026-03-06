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

/**
 * @swagger
 * /events/{id}/songs/special:
 *   post:
 *     summary: Add special moment song
 *     tags: [Songs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [moment, song_title]
 *             properties:
 *               moment:
 *                 type: string
 *                 example: First dance
 *               song_title:
 *                 type: string
 *               artist:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Song added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 song:
 *                   $ref: '#/components/schemas/EventSong'
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/special", validate(createEventSongSchema), createSpecialSong);

/**
 * @swagger
 * /events/{id}/songs/special:
 *   get:
 *     summary: Get all special songs
 *     tags: [Songs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of special moment songs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 songs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EventSong'
 *                 total:
 *                   type: integer
 */
router.get("/special", getSpecialSongs);

/**
 * @swagger
 * /events/{id}/songs/special/{sid}:
 *   put:
 *     summary: Update special song
 *     tags: [Songs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: sid
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               moment:
 *                 type: string
 *               song_title:
 *                 type: string
 *               artist:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Song updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 song:
 *                   $ref: '#/components/schemas/EventSong'
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/special/:sid", validate(updateEventSongSchema), updateSpecialSong);

/**
 * @swagger
 * /events/{id}/songs/special/{sid}:
 *   delete:
 *     summary: Delete special song
 *     tags: [Songs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: sid
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Song deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/special/:sid", deleteSpecialSong);

/**
 * @swagger
 * /events/{id}/songs/export:
 *   get:
 *     summary: Export DJ playlist as CSV
 *     tags: [Songs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get("/export", exportSongs);

export default router;
