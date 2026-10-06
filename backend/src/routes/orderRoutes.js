const express = require("express");
const {
  createOrder,
  getMyOrders,
  getOrderById,
  payOrder,
} = require("../controllers/orderController");
const protect = require("../middleware/auth");

const router = express.Router();

router.use(protect); // every order route requires login

router.post("/", createOrder);
router.get("/", getMyOrders);
router.get("/:id", getOrderById);
router.post("/:id/pay", payOrder);

module.exports = router;