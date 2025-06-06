const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const passport = require("passport");
const connectDB = require("./config/db");
const userRoutes = require("./routes/user");
const coinRoutes = require("./routes/coin");
const newsRoutes = require("./routes/news");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { updateCoins } = require("./controllers/coinController");
const { seedDefaultAdmin } = require("./controllers/userController");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());
require("./config/passport");

app.use("/api/users", userRoutes);
app.use("/api/coins", coinRoutes);
app.use("/api/news", newsRoutes);

(async () => {
  await connectDB();
  seedDefaultAdmin();
  updateCoins();
})();

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Crypto API",
      version: "1.0.0",
      description: "API for cryptocurrency data and news",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
      },
    ],
    components: {
      schemas: {
        Coin: {
          type: "object",
          properties: {
            id: { type: "string" },
            symbol: { type: "string" },
            name: { type: "string" },
            image: { type: "string" },
            current_price: { type: "number" },
            market_cap: { type: "number" },
            market_cap_rank: { type: "number" },
            total_volume: { type: "number" },
            high_24h: { type: "number" },
            low_24h: { type: "number" },
            price_change_24h: { type: "number" },
            price_change_percentage_24h: { type: "number" },
          },
        },
        User: {
          type: "object",
          properties: {
            fullname: { type: "string" },
            username: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            avatar: { type: "string" },
            role: { type: "string", enum: ["user", "admin"] },
            favorites: {
              type: "array",
              items: { type: "string" },
            },
            isActive: { type: "boolean" },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
