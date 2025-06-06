const axios = require("axios");

const getNews = async (params = {}) => {
  try {
    const response = await axios.get(
      "https://min-api.cryptocompare.com/data/v2/news/",
      {
        params: {
          lang: "EN",
          ...params,
          api_key: process.env.CRYPTOCOMPARE_API_KEY,
        },
      }
    );
    return response.data.Data;
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
};

const getNewsCategories = async () => {
  try {
    const response = await axios.get(
      "https://min-api.cryptocompare.com/data/news/categories",
      {
        params: {
          api_key: process.env.CRYPTOCOMPARE_API_KEY,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching news categories:", error);
    return [];
  }
};

module.exports = { getNews, getNewsCategories };
