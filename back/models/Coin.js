const mongoose = require("mongoose");

const coinSchema = new mongoose.Schema({
  id: { type: String, required: true },
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String },
  current_price: { type: Number },
  market_cap: { type: Number },
  market_cap_rank: { type: Number },
  total_volume: { type: Number },
  high_24h: { type: Number },
  low_24h: { type: Number },
  price_change_24h: { type: Number },
  price_change_percentage_24h: { type: Number },
});

module.exports = mongoose.model("Coin", coinSchema);
