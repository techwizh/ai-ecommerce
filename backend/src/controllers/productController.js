const mongoose = require("mongoose");
const Product = require("../models/Product");

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Query values can arrive as arrays or objects; only accept plain strings
const asString = (v) => (typeof v === "string" ? v.trim().slice(0, 100) : "");
const asNumber = (v) => {
  const n = Number(asString(v));
  return Number.isFinite(n) && n >= 0 ? n : null;
};

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  rating: { rating: -1 },
};

// GET /api/products?search=&category=&minPrice=&maxPrice=&sort=&page=&limit=
exports.getProducts = async (req, res) => {
  const search = asString(req.query.search);
  const category = asString(req.query.category);
  const minPrice = asNumber(req.query.minPrice);
  const maxPrice = asNumber(req.query.maxPrice);
  const sort = asString(req.query.sort);
  const page = Math.max(parseInt(asString(req.query.page)) || 1, 1);
  const limit = Math.min(Math.max(parseInt(asString(req.query.limit)) || 12, 1), 50);

  const filter = {};

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ name: regex }, { description: regex }, { brand: regex }];
  }
  if (category) filter.category = category;
  if (minPrice !== null || maxPrice !== null) {
    filter.price = {};
    if (minPrice !== null) filter.price.$gte = minPrice;
    if (maxPrice !== null) filter.price.$lte = maxPrice;
  }

  const sortBy = Object.hasOwn(SORT_OPTIONS, sort)
    ? SORT_OPTIONS[sort]
    : SORT_OPTIONS.newest;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({
    products,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
};

// GET /api/products/categories
exports.getCategories = async (req, res) => {
  const categories = await Product.distinct("category");
  res.json({ categories: categories.sort() });
};

// GET /api/products/flash-sales  (live sales, ending soonest first)
exports.getFlashSales = async (req, res) => {
  const products = await Product.find({
    salePrice: { $ne: null },
    saleEndsAt: { $gt: new Date() },
    stock: { $gt: 0 },
  })
    .sort({ saleEndsAt: 1 })
    .limit(12);
  res.json({ products });
};

// GET /api/products/:id
exports.getProductById = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.json({ product });
};