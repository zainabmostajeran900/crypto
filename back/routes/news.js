const express = require('express');
const router = express.Router();
const passport = require('passport');
const { getAllNews, getNewsByCoin, getFavoriteNews, getNewsCategories } = require('../controllers/newsController');

/**
 * @swagger
 * /api/news:
 *   get:
 *     summary: Get recent cryptocurrency news
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of news articles to return
 *     responses:
 *       200:
 *         description: A list of news articles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   body:
 *                     type: string
 *                   url:
 *                     type: string
 *                   published_on:
 *                     type: integer
 */
router.get('/', getAllNews);

/**
 * @swagger
 * /api/news/categories:
 *   get:
 *     summary: Get available news categories
 *     responses:
 *       200:
 *         description: A list of news categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.get('/categories', getNewsCategories);

/**
 * @swagger
 * /api/news:
 *   get:
 *     summary: Get news for a specific coin
 *     parameters:
 *       - in: query
 *         name: coin
 *         schema:
 *           type: string
 *         required: true
 *         description: Coin symbol (e.g., BTC, ETH)
 *     responses:
 *       200:
 *         description: A list of news articles for the coin
 */
router.get('/coin', getNewsByCoin);

/**
 * @swagger
 * /api/news/favorites:
 *   get:
 *     summary: Get news for favorited coins
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of news articles for favorited coins
 */
router.get('/favorites', passport.authenticate('jwt', { session: false }), getFavoriteNews);

module.exports = router;