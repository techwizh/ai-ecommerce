const mongoose = require("mongoose");
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

const getOrCreate = async (userId) =>
  (await Wishlist.findOne({ user: userId })) ||
  (await Wishlist.create({ user: userId, products: [] }));

// Return the saved products (skipping any deleted from the store)
const format = async (wishlist) => {
  await wishlist.populate("products");
  const products = wishlist.products.filter(Boolean);
  return { products, count: products.length };
};

// GET /api/wishlist
exports.getWishlist = async (req, res) => {
  const wishlist = await getOrCreate(req.user._id);
  res.json(await format(wishlist));
};

// POST /api/wishlist   body: { productId }
exports.addToWishlist = async (req, res) => {
  const { productId } = req.body;

  if (!mongoose.isValidObjectId(productId)) {
    return res.status(400).json({ message: "Invalid product id" });
  }
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const wishlist = await getOrCreate(req.user._id);
  if (!wishlist.products.some((id) => id.toString() === productId)) {
    wishlist.products.push(productId);
    await wishlist.save();
  }

  res.status(201).json(await format(wishlist));
};

// DELETE /api/wishlist/:productId
exports.removeFromWishlist = async (req, res) => {
  const { productId } = req.params;

  const wishlist = await getOrCreate(req.user._id);
  wishlist.products = wishlist.products.filter(
    (id) => id.toString() !== productId
  );
  await wishlist.save();

  res.json(await format(wishlist));
};