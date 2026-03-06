import { Router } from "express";
import {
  create,
  getAll,
  update,
  remove,
  assignTable,
  markInvited,
  sendInvitation,
} from "../controller/guestController";
import { authenticate } from "../middleware/authenticate";
import { authorizeEvent, authorizeGuest } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import {
  createGuestSchema,
  updateGuestSchema,
  assignTableSchema,
} from "../schemas/guestSchema";

const router = Router({ mergeParams: true }); // mergeParams to access :id from parent route

// All routes require authentication + event ownership
router.use(authenticate, authorizeEvent);

/**
 * @swagger
 * /events/{id}/guests:
 *   post:
 *     summary: Add guest to event
 *     tags: [Guests]
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
 *             required: [name, side]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               side:
 *                 type: string
 *                 enum: [bride, groom, both]
 *               member_count:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Guest added
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
router.post("/", validate(createGuestSchema), create);

/**
 * @swagger
 * /events/{id}/guests:
 *   get:
 *     summary: Get all guests for event
 *     tags: [Guests]
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
 *         description: List of guests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 guests:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Guest'
 *                 total:
 *                   type: integer
 */
router.get("/", getAll);

/**
 * @swagger
 * /events/{id}/guests/{gid}:
 *   put:
 *     summary: Update guest
 *     tags: [Guests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: gid
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               side:
 *                 type: string
 *                 enum: [bride, groom, both]
 *               member_count:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Guest updated
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
router.put("/:gid", authorizeGuest, validate(updateGuestSchema), update);

/**
 * @swagger
 * /events/{id}/guests/{gid}:
 *   delete:
 *     summary: Remove guest
 *     tags: [Guests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: gid
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Guest removed
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
router.delete("/:gid", authorizeGuest, remove);

/**
 * @swagger
 * /events/{id}/guests/{gid}/assign-table:
 *   put:
 *     summary: Assign guest to table
 *     tags: [Guests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: gid
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [table_id]
 *             properties:
 *               table_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Guest assigned to table
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
router.put("/:gid/assign-table", authorizeGuest, validate(assignTableSchema), assignTable);

/**
 * @swagger
 * /events/{id}/guests/{gid}/mark-invited:
 *   put:
 *     summary: Mark guest as invited
 *     tags: [Guests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: gid
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Guest marked as invited
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
router.put("/:gid/mark-invited", authorizeGuest, markInvited);

/**
 * @swagger
 * /events/{id}/guests/{gid}/send-invitation:
 *   post:
 *     summary: Send invitation email to guest
 *     tags: [Guests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: gid
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Invitation sent
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
router.post("/:gid/send-invitation", authorizeGuest, sendInvitation);

export default router;
