const express = require("express");
const router = express.Router();
const {
  getAllCoins,
  getOneCoin,
  createCoin,
  updateCoin,
  deleteCoin,
  getCoinHistory,
  getTopCoins,
  getTrendingCoins,
  getCoinCategories,
} = require("../controllers/coinController");
const { protect, roleMiddleware } = require("../middleware/auth");

/**
 * @swagger
 * /api/coins:
 *   get:
 *     summary: Get all coins with pagination and search
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or symbol
 *     responses:
 *       200:
 *         description: A list of coins
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 coins:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Coin'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 */
router.get("/", getAllCoins);

/**
 * @swagger
 * /api/coins/{id}:
 *   get:
 *     summary: Get detailed data for a specific coin
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Coin ID
 *     responses:
 *       200:
 *         description: Coin details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Coin'
 */
router.get("/:id", getOneCoin);

/**
 * @swagger
 * /api/coins/{id}/history:
 *   get:
 *     summary: Get historical market data for a coin
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Coin ID
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *         required: true
 *         description: Number of days for history
 *     responses:
 *       200:
 *         description: Historical data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 prices:
 *                   type: array
 *                   items:
 *                     type: array
 *                     items:
 *                       type: number
 */
router.get("/:id/history", getCoinHistory);

/**
 * @swagger
 * /api/coins/top:
 *   get:
 *     summary: Get top coins by criteria
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: "Number of coins to return (default: 10)"
 *       - in: query
 *         name: by
 *         schema:
 *           type: string
 *           enum: [market_cap, volume, price_change_24h]
 *         description: "Sort criteria"
 *     responses:
 *       200:
 *         description: A list of top coins
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Coin'
 */
router.get("/top", getTopCoins);

/**
 * @swagger
 * /api/coins/trending:
 *   get:
 *     summary: Get trending coins
 *     responses:
 *       200:
 *         description: A list of trending coins
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   item:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       symbol:
 *                         type: string
 */
router.get("/trending", getTrendingCoins);

/**
 * @swagger
 * /api/coins/categories:
 *   get:
 *     summary: Get coin categories
 *     responses:
 *       200:
 *         description: A list of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 */
router.get("/categories", getCoinCategories);

/**
 * @swagger
 * /api/coins:
 *   post:
 *     summary: Create a new coin (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Coin'
 *     responses:
 *       201:
 *         description: Coin created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Coin'
 *       403:
 *         description: Access denied
 */
router.post("/", protect, roleMiddleware("admin"), createCoin);

/**
 * @swagger
 * /api/coins/{id}:
 *   put:
 *     summary: Update a coin (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Coin ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Coin'
 *     responses:
 *       200:
 *         description: Coin updated
 *       403:
 *         description: Access denied
 */
router.put("/:id", protect, roleMiddleware("admin"), updateCoin);

/**
 * @swagger
 * /api/coins/{id}:
 *   delete:
 *     summary: Delete a coin (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Coin ID
 *     responses:
 *       200:
 *         description: Coin deleted
 *       403:
 *         description: Access denied
 */
router.delete("/:id", protect, roleMiddleware("admin"), deleteCoin);

module.exports = router;
