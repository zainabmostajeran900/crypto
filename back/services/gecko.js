const axios = require("axios");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getCoins = async () => {
  try {
    let allCoins = [];
    let page = 1;
    const maxPages = 10; // or undefined
    const perPage = 250;
    let retryCount = 0;
    const maxRetries = 5;
    const baseDelay = 6000;
    const maxDelay = 60000;

    if (!process.env.GECKO_API_KEY) {
      console.error("GECKO_API_KEY is not set in .env");
      return [];
    }

    while (true) {
      if (maxPages && page > maxPages) {
        console.log(`Reached maximum page limit of ${maxPages}`);
        break;
      }
      try {
        const response = await axios.get(
          "https://api.coingecko.com/api/v3/coins/markets",
          {
            params: {
              vs_currency: "usd",
              order: "market_cap_desc",
              per_page: perPage,
              page: page,
              sparkline: false,
            },
            headers: {
              Accept: "application/json",
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
              "x-cg-api-key": process.env.GECKO_API_KEY,
            },
          }
        );

        const coins = response.data;
        if (coins.length === 0) {
          console.log(`No more coins to fetch after page ${page}`);
          break;
        }
        allCoins = [...allCoins, ...coins];
        page++;
        retryCount = 0;
        console.log(`Fetched page ${page - 1} with ${coins.length} coins`);
        await delay(baseDelay);
      } catch (error) {
        if (error.response?.status === 429) {
          const retryAfter =
            parseInt(error.response.headers["retry-after"]) || 0;
          const backoffDelay = Math.min(
            baseDelay * Math.pow(2, retryCount) * (1 + Math.random() * 0.1),
            maxDelay
          );
          const waitTime = retryAfter * 1000 || backoffDelay;

          if (retryCount < maxRetries) {
            console.log(
              `Rate limited on page ${page}. Waiting ${Math.round(
                waitTime / 1000
              )} seconds before retry ${retryCount + 1}/${maxRetries}...`
            );
            await delay(waitTime);
            retryCount++;
            continue;
          } else {
            console.error(
              `Max retries reached for page ${page}. Saving partial data.`
            );
            break;
          }
        } else if (error.response?.status === 400) {
          console.error(
            `Bad request on page ${page}: ${
              error.response.data?.message || error.message
            }`
          );
          if (error.response.data?.message.includes("invalid")) {
            console.error(
              `Invalid parameter or API key. Skipping page ${page}.`
            );
            page++;
            retryCount = 0;
            await delay(baseDelay);
            continue;
          } else {
            console.error(`Unrecoverable 400 error on page ${page}. Exiting.`);
            break;
          }
        } else {
          console.error(`Error fetching coins (page ${page}):`, error.message);
          if (retryCount < maxRetries) {
            const backoffDelay = Math.min(
              baseDelay * Math.pow(2, retryCount) * (1 + Math.random() * 0.1),
              maxDelay
            );
            console.log(
              `Retrying page ${page} in ${Math.round(
                backoffDelay / 1000
              )} seconds...`
            );
            await delay(backoffDelay);
            retryCount++;
            continue;
          } else {
            console.error(
              `Max retries reached for page ${page}. Saving partial data.`
            );
            break;
          }
        }
      }
    }

    console.log(`Total coins fetched: ${allCoins.length}`);
    return allCoins;
  } catch (error) {
    console.error("Fatal error in getCoins:", error.message);
    return [];
  }
};

module.exports = { getCoins };
