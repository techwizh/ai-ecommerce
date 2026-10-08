const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Wishlist = require("../models/Wishlist");

// GET /api/insights
// Rule-based stats calculated from the user's own data
exports.getInsights = async (req, res) => {
  const userId = req.user._id;

  const [orders, wishlist, cart] = await Promise.all([
    Order.find({ user: userId }).sort({ createdAt: -1 }),
    Wishlist.findOne({ user: userId }),
    Cart.findOne({ user: userId }),
  ]);

  const paidOrders = orders.filter((o) => o.paymentStatus === "paid");

  const totalSpent = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const itemsBought = paidOrders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
    0
  );
  const averageOrder = paidOrders.length ? totalSpent / paidOrders.length : 0;

  // Work out the favourite category from what was bought
  const productIds = [
    ...new Set(paidOrders.flatMap((o) => o.items.map((i) => i.product.toString()))),
  ];
  const products = await Product.find({ _id: { $in: productIds } }).select("category");
  const categoryOf = Object.fromEntries(
    products.map((p) => [p._id.toString(), p.category])
  );

  const spendByCategory = {};
  paidOrders.forEach((o) =>
    o.items.forEach((i) => {
      const category = categoryOf[i.product.toString()];
      if (category) {
        spendByCategory[category] =
          (spendByCategory[category] || 0) + i.price * i.quantity;
      }
    })
  );

  const categoryBreakdown = Object.entries(spendByCategory)
    .map(([category, spent]) => ({ category, spent: Math.round(spent) }))
    .sort((a, b) => b.spent - a.spent);

  // Most bought item
  const quantityByName = {};
  paidOrders.forEach((o) =>
    o.items.forEach((i) => {
      quantityByName[i.name] = (quantityByName[i.name] || 0) + i.quantity;
    })
  );
  const topItem =
    Object.entries(quantityByName).sort((a, b) => b[1] - a[1])[0] || null;

  res.json({
    totalSpent: Math.round(totalSpent),
    orderCount: orders.length,
    paidOrderCount: paidOrders.length,
    pendingOrderCount: orders.length - paidOrders.length,
    itemsBought,
    averageOrder: Math.round(averageOrder),
    favouriteCategory: categoryBreakdown[0]?.category || null,
    categoryBreakdown,
    topItem: topItem ? { name: topItem[0], quantity: topItem[1] } : null,
    wishlistCount: wishlist?.products?.length || 0,
    cartCount: (cart?.items || []).reduce((s, i) => s + i.quantity, 0),
    lastOrderDate: orders[0]?.createdAt || null,
  });
};