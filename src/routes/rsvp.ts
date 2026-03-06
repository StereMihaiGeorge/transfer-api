import { Router } from "express";
import { getInvitation, respond, preferences, addSongRequest } from "../controller/rsvpController";
import { validate } from "../middleware/validate";
import { rsvpSchema, preferencesSchema } from "../schemas/rsvpSchema";
import { createSongRequestSchema } from "../schemas/songSchema";

const router = Router();

// Public routes — no authentication needed

/**
 * @swagger
 * /rsvp/{token}:
 *   get:
 *     summary: Get invitation details by token (public)
 *     tags: [RSVP]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Invitation details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 guest:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     status:
 *                       type: string
 *                 event:
 *                   type: object
 *                   properties:
 *                     bride_name:
 *                       type: string
 *                     groom_name:
 *                       type: string
 *                     date:
 *                       type: string
 *                       format: date
 *                     venue:
 *                       type: string
 *                     city:
 *                       type: string
 *                     cover_message:
 *                       type: string
 *       404:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:token", getInvitation);

/**
 * @swagger
 * /rsvp/{token}:
 *   post:
 *     summary: Respond to RSVP (public)
 *     tags: [RSVP]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, declined]
 *               member_count:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 20
 *     responses:
 *       200:
 *         description: RSVP recorded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 guest:
 *                   $ref: '#/components/schemas/Guest'
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:token", validate(rsvpSchema), respond);

/**
 * @swagger
 * /rsvp/{token}/preferences:
 *   post:
 *     summary: Submit preferences (public)
 *     tags: [RSVP]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [meal_preference]
 *             properties:
 *               meal_preference:
 *                 type: string
 *               special_needs:
 *                 type: string
 *               sit_with:
 *                 type: string
 *               not_sit_with:
 *                 type: string
 *     responses:
 *       200:
 *         description: Preferences saved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 guest:
 *                   $ref: '#/components/schemas/Guest'
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:token/preferences", validate(preferencesSchema), preferences);

/**
 * @swagger
 * /rsvp/{token}/songs:
 *   post:
 *     summary: Add song request (public)
 *     tags: [RSVP]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [song_title, genre]
 *             properties:
 *               song_title:
 *                 type: string
 *               artist:
 *                 type: string
 *               genre:
 *                 type: string
 *                 enum: [pop, rock, manele, house, jazz, classical, folk, populara, other]
 *     responses:
 *       201:
 *         description: Song request submitted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 songRequest:
 *                   $ref: '#/components/schemas/SongRequest'
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:token/songs", validate(createSongRequestSchema), addSongRequest);

export default router;
