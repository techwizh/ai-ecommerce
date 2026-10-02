const express = require("express");
const {
  getProducts,
  getCategories,
  getProductById,
} = require("../controllers/productController");

const router = express.Router();

router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/:id", getProductById);

module.exports = router;