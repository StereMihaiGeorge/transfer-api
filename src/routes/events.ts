import { Router } from "express";
import { create, getById, update, remove, dashboard } from "../controller/eventController";
import { authenticate } from "../middleware/authenticate";
import { authorizeEvent } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import { createEventSchema, updateEventSchema } from "../schemas/eventSchema";

const router = Router();

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new wedding event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bride_name, groom_name, date, venue, city]
 *             properties:
 *               bride_name:
 *                 type: string
 *               groom_name:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               venue:
 *                 type: string
 *               city:
 *                 type: string
 *               cover_message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Event created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 event:
 *                   $ref: '#/components/schemas/Event'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", authenticate, validate(createEventSchema), create);

/**
 * @swagger
 * /events/{id}/dashboard:
 *   get:
 *     summary: Get event dashboard stats
 *     tags: [Events]
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
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 guests:
 *                   type: object
 *                 tables:
 *                   type: object
 *                 songs:
 *                   type: object
 *                 todos:
 *                   type: object
 */
router.get("/:id/dashboard", authenticate, authorizeEvent, dashboard);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
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
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", authenticate, authorizeEvent, getById);

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Update event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bride_name:
 *                 type: string
 *               groom_name:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               venue:
 *                 type: string
 *               city:
 *                 type: string
 *               cover_message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 event:
 *                   $ref: '#/components/schemas/Event'
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:id", authenticate, authorizeEvent, validate(updateEventSchema), update);

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Delete event
 *     tags: [Events]
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
 *         description: Event deleted
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
router.delete("/:id", authenticate, authorizeEvent, remove);


export default router;
