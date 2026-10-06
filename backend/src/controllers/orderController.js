const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");

// POST /api/orders   body: { shippingAddress: { fullName, address, city, phone } }
exports.createOrder = async (req, res) => {
  const { shippingAddress } = req.body;

  const required = ["fullName", "address", "city", "phone"];
  if (!shippingAddress || required.some((f) => !shippingAddress[f]?.trim())) {
    return res
      .status(400)
      .json({ message: "Full name, address, city and phone are required" });
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  const cartItems = (cart?.items || []).filter((i) => i.product);

  if (cartItems.length === 0) {
    return res.status(400).json({ message: "Your cart is empty" });
  }

  // Check stock before creating the order
  for (const item of cartItems) {
    if (item.product.stock < item.quantity) {
      return res.status(400).json({
        message: `Not enough stock for ${item.product.name} (only ${item.product.stock} left)`,
      });
    }
  }

  const items = cartItems.map((i) => ({
    product: i.product._id,
    name: i.product.name,
    image: i.product.image,
    price: i.product.price,
    quantity: i.quantity,
  }));
  const total = Number(
    items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)
  );

  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress: {
      fullName: shippingAddress.fullName.trim(),
      address: shippingAddress.address.trim(),
      city: shippingAddress.city.trim(),
      phone: shippingAddress.phone.trim(),
    },
    total,
  });

  // Reduce stock and empty the cart
  await Promise.all(
    items.map((i) =>
      Product.findByIdAndUpdate(i.product, { $inc: { stock: -i.quantity } })
    )
  );
  cart.items = [];
  await cart.save();

  res.status(201).json({ order });
};

// GET /api/orders  (the logged-in user's orders, newest first)
exports.getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ orders });
};

// GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid order id" });
  }
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json({ order });
};