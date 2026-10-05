const express = require("express");
const {
  getCart,
  addToCart,
  updateItem,
  removeItem,
  clearCart,
} = require("../controllers/cartController");
const protect = require("../middleware/auth");

const router = express.Router();

router.use(protect); // every cart route requires login

router.get("/", getCart);
router.post("/", addToCart);
router.delete("/", clearCart);
router.put("/:productId", updateItem);
router.delete("/:productId", removeItem);

module.exports = router;