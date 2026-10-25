const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");
const { blockInjection, apiLimiter } = require("./middleware/security");

// Refuse to start with a missing or weak signing secret
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error("JWT_SECRET is missing or too short (use at least 16 characters)");
  process.exit(1);
}

const app = express();

// Render sits behind a proxy; this lets the limits see each visitor's real IP
app.set("trust proxy", 1);

// Security headers (hides X-Powered-By, blocks sniffing and framing, and more)
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

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

app.use(express.json({ limit: "10kb" }));
app.use("/api", apiLimiter);
app.use(blockInjection);

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

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Never leak stack traces or internal messages to clients
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  const safe = err.status && err.status < 500 ? err.message : "Something went wrong";
  res.status(err.status || 500).json({ message: safe });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});