const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Render sits behind a proxy; this lets the login limit see each visitor's real IP
app.set("trust proxy", 1);

// CLIENT_URL can hold several addresses separated by commas
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow phones/Expo Go (no origin) and the listed web addresses
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/products", require("./routes/productRoutes"));

app.use("/api/cart", require("./routes/cartRoutes"));

app.use("/api/wishlist", require("./routes/wishlistRoutes"));

app.use("/api/orders", require("./routes/orderRoutes"));

app.use("/api/recommendations", require("./routes/recommendationRoutes"));

app.use("/api/insights", require("./routes/insightsRoutes"));

app.use("/api/assistant", require("./routes/assistantRoutes"));

app.use("/api/seller", require("./routes/sellerRoutes"));

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});