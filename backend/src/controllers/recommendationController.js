const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Wishlist = require("../models/Wishlist");

// GET /api/recommendations
// Rule-based: scores products by how well they match the user's activity
exports.getRecommendations = async (req, res) => {
  const userId = req.user._id;

  const [orders, wishlist, cart] = await Promise.all([
    Order.find({ user: userId }),
    Wishlist.findOne({ user: userId }).populate("products"),
    Cart.findOne({ user: userId }).populate("items.product"),
  ]);

  // Products the user already bought (we don't recommend these again)
  const purchasedIds = new Set(
    orders.flatMap((o) => o.items.map((i) => i.product.toString()))
  );

  // Gather signals: purchases count most, then wishlist, then cart
  const categoryScore = {};
  const brandScore = {};
  const addSignal = (product, weight) => {
    if (!product) return;
    categoryScore[product.category] = (categoryScore[product.category] || 0) + weight;
    if (product.brand) {
      brandScore[product.brand] = (brandScore[product.brand] || 0) + weight;
    }
  };

  if (purchasedIds.size > 0) {
    const purchased = await Product.find({ _id: { $in: [...purchasedIds] } });
    purchased.forEach((p) => addSignal(p, 3));
  }
  (wishlist?.products || []).forEach((p) => addSignal(p, 2));
  (cart?.items || []).forEach((i) => addSignal(i.product, 1));

  const hasSignals = Object.keys(categoryScore).length > 0;

  // Candidates: in stock, not already bought, not already in the cart
  const inCartIds = new Set(
    (cart?.items || []).filter((i) => i.product).map((i) => i.product._id.toString())
  );
  const candidates = await Product.find({ stock: { $gt: 0 } });
  const available = candidates.filter(
    (p) => !purchasedIds.has(p._id.toString()) && !inCartIds.has(p._id.toString())
  );

  const scored = available
    .map((p) => {
      const matchScore = hasSignals
        ? (categoryScore[p.category] || 0) * 2 + (brandScore[p.brand] || 0)
        : 0;
      // Rating breaks ties and drives the fallback
      return { product: p, score: matchScore + p.rating };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((s) => s.product);

  res.json({
    products: scored,
    basedOn: hasSignals ? "your activity" : "top rated",
  });
};