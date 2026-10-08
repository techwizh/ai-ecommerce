const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

const CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Sports",
  "Beauty",
  "Books & Stationery",
];

// Validate and clean what the seller typed. Prices and stock are checked on the server.
const readProduct = (body) => {
  const data = {
    name: String(body.name || "").trim(),
    description: String(body.description || "").trim(),
    category: String(body.category || "").trim(),
    brand: String(body.brand || "").trim(),
    image: String(body.image || "").trim(),
    price: Number(body.price),
    stock: Number.parseInt(body.stock, 10),
  };

  if (data.name.length < 3) return { error: "Product name must be at least 3 characters" };
  if (data.description.length < 10) return { error: "Description must be at least 10 characters" };
  if (!CATEGORIES.includes(data.category)) return { error: "Choose a valid category" };
  if (!Number.isFinite(data.price) || data.price <= 0) return { error: "Enter a valid price" };
  if (!Number.isInteger(data.stock) || data.stock < 0) return { error: "Enter a valid stock quantity" };
  if (data.image && !/^https?:\/\//i.test(data.image)) {
    return { error: "The image must be a link starting with http" };
  }
  return { data };
};

// GET /api/seller/summary
exports.getSummary = async (req, res) => {
  const products = await Product.find({ seller: req.user._id }).select("stock");
  const ids = products.map((p) => p._id);
  const idSet = new Set(ids.map(String));

  const orders = ids.length
    ? await Order.find({ paymentStatus: "paid", "items.product": { $in: ids } })
    : [];

  let revenue = 0;
  let unitsSold = 0;
  orders.forEach((o) =>
    o.items.forEach((i) => {
      if (idSet.has(i.product.toString())) {
        revenue += i.price * i.quantity;
        unitsSold += i.quantity;
      }
    })
  );

  res.json({
    productCount: products.length,
    lowStockCount: products.filter((p) => p.stock <= 5).length,
    unitsSold,
    revenue: Math.round(revenue),
    orderCount: orders.length,
  });
};

// GET /api/seller/products
exports.getMyProducts = async (req, res) => {
  const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
  res.json({ products });
};

// POST /api/seller/products
exports.createProduct = async (req, res) => {
  const { data, error } = readProduct(req.body);
  if (error) return res.status(400).json({ message: error });

  const product = await Product.create({
    ...data,
    brand: data.brand || req.user.businessName,
    image:
      data.image ||
      `https://picsum.photos/seed/${encodeURIComponent(data.name)}/600/600`,
    seller: req.user._id,
  });

  res.status(201).json({ product });
};

// PUT /api/seller/products/:id
exports.updateProduct = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  // Looking up by seller too means nobody can edit another seller's product
  const product = await Product.findOne({ _id: req.params.id, seller: req.user._id });
  if (!product) return res.status(404).json({ message: "Product not found" });

  const { data, error } = readProduct(req.body);
  if (error) return res.status(400).json({ message: error });

  product.set({
    ...data,
    brand: data.brand || req.user.businessName,
    image: data.image || product.image,
  });
  await product.save();

  res.json({ product });
};

// DELETE /api/seller/products/:id
exports.deleteProduct = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const product = await Product.findOneAndDelete({
    _id: req.params.id,
    seller: req.user._id,
  });
  if (!product) return res.status(404).json({ message: "Product not found" });

  res.json({ message: "Product deleted" });
};