const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const getOrCreateCart = async (userId) =>
  (await Cart.findOne({ user: userId })) ||
  (await Cart.create({ user: userId, items: [] }));

// Turn a cart into the shape the app needs: items, total and item count
const formatCart = async (cart) => {
  await cart.populate("items.product");
  const items = cart.items
    .filter((i) => i.product) // skip products deleted from the store
    .map((i) => ({
      product: i.product,
      quantity: i.quantity,
      subtotal: Number((i.product.price * i.quantity).toFixed(2)),
    }));
  const total = Number(items.reduce((s, i) => s + i.subtotal, 0).toFixed(2));
  const count = items.reduce((s, i) => s + i.quantity, 0);
  return { items, total, count };
};

// GET /api/cart
exports.getCart = async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  res.json(await formatCart(cart));
};

// POST /api/cart   body: { productId, quantity }
exports.addToCart = async (req, res) => {
  const { productId } = req.body;
  const quantity = Math.max(parseInt(req.body.quantity) || 1, 1);

  if (!mongoose.isValidObjectId(productId)) {
    return res.status(400).json({ message: "Invalid product id" });
  }
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });
  if (product.stock === 0) {
    return res.status(400).json({ message: "Product is out of stock" });
  }

  const cart = await getOrCreateCart(req.user._id);
  const existing = cart.items.find((i) => i.product.toString() === productId);

  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, product.stock);
  } else {
    cart.items.push({ product: productId, quantity: Math.min(quantity, product.stock) });
  }

  await cart.save();
  res.status(201).json(await formatCart(cart));
};

// PUT /api/cart/:productId   body: { quantity }  (0 removes the item)
exports.updateItem = async (req, res) => {
  const { productId } = req.params;
  const quantity = parseInt(req.body.quantity);

  if (!mongoose.isValidObjectId(productId)) {
    return res.status(400).json({ message: "Invalid product id" });
  }
  if (Number.isNaN(quantity) || quantity < 0) {
    return res.status(400).json({ message: "Invalid quantity" });
  }

  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) return res.status(404).json({ message: "Item not in cart" });

  if (quantity === 0) {
    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  } else {
    const product = await Product.findById(productId);
    item.quantity = product ? Math.min(quantity, product.stock) : quantity;
  }

  await cart.save();
  res.json(await formatCart(cart));
};

// DELETE /api/cart/:productId
exports.removeItem = async (req, res) => {
  const { productId } = req.params;
  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  await cart.save();
  res.json(await formatCart(cart));
};

// DELETE /api/cart
exports.clearCart = async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();
  res.json(await formatCart(cart));
};