const Product = require("../models/Product");

const CATEGORY_KEYWORDS = {
  Electronics: ["electronic", "gadget", "headphone", "earphone", "watch", "speaker", "keyboard", "phone", "music"],
  Fashion: ["fashion", "cloth", "shirt", "jeans", "shoe", "sneaker", "wear", "outfit"],
  "Home & Kitchen": ["kitchen", "home", "cook", "coffee", "pan", "brew"],
  Sports: ["sport", "gym", "fitness", "workout", "yoga", "dumbbell", "exercise", "training"],
  Beauty: ["beauty", "skin", "face", "serum", "moisturizer", "moisturiser", "cream"],
  "Books & Stationery": ["book", "notebook", "stationery", "journal", "pen"],
};

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "that", "this", "you", "any", "can", "have", "want", "need", "looking",
  "show", "give", "find", "get", "some", "something", "please", "under", "over", "below", "above",
  "less", "more", "than", "best", "top", "rated", "cheap", "cheapest", "affordable", "lowest",
  "recommend", "suggest", "ksh", "kes", "budget", "within", "max", "about", "what", "which", "good",
  "item", "items", "product", "products", "buy", "gift",
]);

const money = (n) =>
  `KSh ${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

// POST /api/assistant   body: { message }
// Rule-based: no AI service is used
exports.ask = async (req, res) => {
  const text = String(req.body.message || "").trim().slice(0, 300);
  if (!text) return res.status(400).json({ message: "Message is required" });

  const lower = text.toLowerCase();
  const firstName = req.user.name.split(" ")[0];

  if (/^(hi|hello|hey|good (morning|afternoon|evening))\b/.test(lower)) {
    return res.json({
      reply: `Hi ${firstName}! Tell me what you're looking for, for example "cheap headphones" or "gym items under 5000".`,
      products: [],
    });
  }
  if (/\b(help|what can you do)\b/.test(lower)) {
    return res.json({
      reply:
        'I can search our products for you. Try: "best rated kitchen items", "shoes under 12000" or "cheapest electronics".',
      products: [],
    });
  }

  const filter = { stock: { $gt: 0 } };

  // Budget: "under 5000", "below 5,000", "over 3000"
  const max = lower.match(/(?:under|below|less than|within|max|budget of)\s*(?:ksh|kes)?\s*([\d,]+)/);
  const min = lower.match(/(?:over|above|more than)\s*(?:ksh|kes)?\s*([\d,]+)/);
  const maxPrice = max ? Number(max[1].replace(/,/g, "")) : null;
  const minPrice = min ? Number(min[1].replace(/,/g, "")) : null;
  if (maxPrice || minPrice) {
    filter.price = {};
    if (maxPrice) filter.price.$lte = maxPrice;
    if (minPrice) filter.price.$gte = minPrice;
  }

  const categories = Object.entries(CATEGORY_KEYWORDS)
    .filter(([, words]) => words.some((w) => lower.includes(w)))
    .map(([category]) => category);

  const words = (lower.match(/[a-z]+/g) || [])
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
    .map((w) => (w.length > 3 ? w.replace(/s$/, "") : w));

  const sort = /cheap|affordable|lowest/.test(lower) ? { price: 1 } : { rating: -1 };

  let products = [];

  // 1) Try matching the words themselves (names, descriptions, brands)
  if (words.length > 0) {
    const regexes = words.map((w) => new RegExp(w, "i"));
    products = await Product.find({
      ...filter,
      $or: regexes.flatMap((r) => [{ name: r }, { description: r }, { brand: r }, { category: r }]),
    })
      .sort(sort)
      .limit(4);
  }

  // 2) Fall back to the category the words point to
  if (products.length === 0 && categories.length > 0) {
    products = await Product.find({ ...filter, category: { $in: categories } })
      .sort(sort)
      .limit(4);
  }

  // 3) Nothing specific asked ("best rated", "cheapest"): use the price and sort rules alone
  if (products.length === 0 && words.length === 0 && categories.length === 0) {
    products = await Product.find(filter).sort(sort).limit(4);
  }

  if (products.length === 0) {
    const budgetNote = maxPrice ? ` under ${money(maxPrice)}` : "";
    return res.json({
      reply: `Sorry, I couldn't find anything${budgetNote} that matches. Try a different word or a higher budget.`,
      products: [],
    });
  }

  const intro = /cheap|affordable|lowest/.test(lower)
    ? "Here are the most affordable matches"
    : "Here are the best matches";
  const budget = maxPrice ? ` under ${money(maxPrice)}` : minPrice ? ` over ${money(minPrice)}` : "";

  res.json({
    reply: `${intro}${budget}:`,
    products,
  });
};