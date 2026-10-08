const express = require("express");
const {
  getSummary,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/sellerController");
const protect = require("../middleware/auth");
const seller = require("../middleware/seller");

const router = express.Router();

router.use(protect, seller); // logged in AND a seller

router.get("/summary", getSummary);
router.get("/products", getMyProducts);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

module.exports = router;