const { getNews, getNewsCategories: fetchNewsCategories } = require("../services/news");
const User = require("../models/User");

const getAllNews = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const news = await getNews({ limit });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getNewsByCoin = async (req, res) => {
  try {
    const { coin } = req.query;
    if (!coin)
      return res.status(400).json({ message: "Coin parameter is required" });
    const news = await getNews({ categories: coin.toUpperCase() });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getFavoriteNews = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("favorites");
    if (!user) return res.status(404).json({ message: "User not found" });
    const favoriteSymbols = user.favorites.map((coin) =>
      coin.symbol.toUpperCase()
    );
    if (favoriteSymbols.length === 0) return res.json([]);
    const news = await getNews({ categories: favoriteSymbols.join(",") });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getNewsCategories = async (req, res) => {
  try {
    const categories = await fetchNewsCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllNews,
  getNewsByCoin,
  getFavoriteNews,
  getNewsCategories,
};
