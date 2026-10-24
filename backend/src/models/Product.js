const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, default: null, min: 0 },
    saleEndsAt: { type: Date, default: null },
    category: { type: String, required: true, trim: true },
    brand: { type: String, trim: true, default: "" },
    image: { type: String, default: "" },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

// A sale is live only while its end time is in the future
productSchema.virtual("onSale").get(function () {
  return !!this.salePrice && !!this.saleEndsAt && this.saleEndsAt > new Date();
});

// The price a customer actually pays right now
productSchema.virtual("currentPrice").get(function () {
  return this.onSale ? this.salePrice : this.price;
});

productSchema.index({ category: 1, price: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ saleEndsAt: 1 });

module.exports = mongoose.model("Product", productSchema);