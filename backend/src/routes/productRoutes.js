const express = require("express");
const {
  getProducts,
  getCategories,
  getFlashSales,
  getProductById,
} = require("../controllers/productController");

const router = express.Router();

router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/flash-sales", getFlashSales);
router.get("/:id", getProductById);

module.exports = router;