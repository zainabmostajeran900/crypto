const cron = require("node-cron");
const Coin = require("../models/Coin");
const { getCoins } = require("../services/gecko");
const axios = require("axios");

const updateCoins = async () => {
  try {
    const coins = await getCoins();
    for (const coin of coins) {
      await Coin.findOneAndUpdate(
        { id: coin.id },
        { $set: coin },
        { upsert: true }
      );
    }
    console.log("Coins updated successfully");
  } catch (error) {
    console.error("Error updating coins:", error);
  }
};

// Schedule the updateCoins function to run every 30 minutes
cron.schedule("*/30 * * * *", updateCoins);

const getAllCoins = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { symbol: { $regex: search, $options: "i" } },
          ],
        }
      : {};
    const coins = await Coin.find(query)
      .limit(parseInt(limit))
      .skip((page - 1) * limit);
    const total = await Coin.countDocuments(query);
    res.json({
      coins,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getOneCoin = async (req, res) => {
  try {
    const coin = await Coin.findOne({ id: req.params.id });
    if (!coin) return res.status(404).json({ message: "Coin not found" });
    res.json(coin);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const createCoin = async (req, res) => {
  try {
    const coin = new Coin(req.body);
    await coin.save();
    res.status(201).json(coin);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const updateCoin = async (req, res) => {
  try {
    const coin = await Coin.findOneAndUpdate({ id: req.params.id }, req.body, {
      new: true,
    });
    if (!coin) return res.status(404).json({ message: "Coin not found" });
    res.json(coin);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const deleteCoin = async (req, res) => {
  try {
    const coin = await Coin.findOneAndDelete({ id: req.params.id });
    if (!coin) return res.status(404).json({ message: "Coin not found" });
    res.json({ message: "Coin deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getCoinHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { days } = req.query;
    if (!days)
      return res.status(400).json({ message: "Days parameter is required" });
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${id}/market_chart`,
      {
        params: {
          vs_currency: "usd",
          days: days,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getTopCoins = async (req, res) => {
  try {
    const { limit = 10, by = "market_cap" } = req.query;
    let sortField;
    switch (by) {
      case "market_cap":
        sortField = "market_cap";
        break;
      case "volume":
        sortField = "total_volume";
        break;
      case "price_change_24h":
        sortField = "price_change_percentage_24h";
        break;
      default:
        return res.status(400).json({ message: "Invalid sort criteria" });
    }
    const coins = await Coin.find()
      .sort({ [sortField]: -1 })
      .limit(parseInt(limit));
    res.json(coins);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getTrendingCoins = async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/search/trending"
    );
    res.json(response.data.coins);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getCoinCategories = async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/coins/categories"
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllCoins,
  getOneCoin,
  createCoin,
  updateCoin,
  deleteCoin,
  updateCoins,
  getCoinHistory,
  getTopCoins,
  getTrendingCoins,
  getCoinCategories,
};
