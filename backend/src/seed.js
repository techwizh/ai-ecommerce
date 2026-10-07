const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const img = (seed) => `https://picsum.photos/seed/${seed}/600/600`;

const products = [
  { name: "Wireless Noise-Cancelling Headphones", description: "Over-ear Bluetooth headphones with 30-hour battery life and active noise cancellation.", price: 129.99, category: "Electronics", brand: "SoundWave", image: img("headphones"), rating: 4.6, numReviews: 214, stock: 40 },
  { name: "Smart Fitness Watch", description: "Track heart rate, sleep and workouts with a bright AMOLED display and 7-day battery.", price: 89.5, category: "Electronics", brand: "PulseFit", image: img("watch"), rating: 4.4, numReviews: 156, stock: 60 },
  { name: "Portable Bluetooth Speaker", description: "Waterproof pocket speaker with deep bass and 12 hours of playtime.", price: 45.0, category: "Electronics", brand: "SoundWave", image: img("speaker"), rating: 4.3, numReviews: 98, stock: 75 },
  { name: "Mechanical Gaming Keyboard", description: "RGB backlit mechanical keyboard with tactile switches and a detachable cable.", price: 74.99, category: "Electronics", brand: "KeyForge", image: img("keyboard"), rating: 4.5, numReviews: 187, stock: 35 },
  { name: "Classic Cotton T-Shirt", description: "Soft everyday crew-neck t-shirt made from 100% organic cotton.", price: 19.99, category: "Fashion", brand: "Urban Thread", image: img("tshirt"), rating: 4.2, numReviews: 320, stock: 200 },
  { name: "Slim Fit Denim Jeans", description: "Stretch denim jeans with a modern slim fit and reinforced stitching.", price: 49.0, category: "Fashion", brand: "Urban Thread", image: img("jeans"), rating: 4.1, numReviews: 143, stock: 90 },
  { name: "Lightweight Running Shoes", description: "Breathable mesh running shoes with cushioned soles for daily training.", price: 79.95, category: "Fashion", brand: "StrideX", image: img("shoes"), rating: 4.7, numReviews: 402, stock: 55 },
  { name: "Ceramic Non-Stick Frying Pan", description: "28cm ceramic-coated pan, PFOA-free, works on all stovetops including induction.", price: 34.99, category: "Home & Kitchen", brand: "CookEase", image: img("pan"), rating: 4.4, numReviews: 121, stock: 80 },
  { name: "Programmable Coffee Maker", description: "12-cup coffee maker with timer, reusable filter and auto shut-off.", price: 59.0, category: "Home & Kitchen", brand: "BrewMate", image: img("coffee"), rating: 4.5, numReviews: 210, stock: 45 },
  { name: "Yoga Mat with Carry Strap", description: "6mm thick non-slip yoga mat, eco-friendly and easy to clean.", price: 24.99, category: "Sports", brand: "FlexLife", image: img("yoga"), rating: 4.6, numReviews: 175, stock: 120 },
  { name: "Adjustable Dumbbell Set", description: "Space-saving adjustable dumbbells from 2 to 20 kg per hand.", price: 149.0, category: "Sports", brand: "IronCore", image: img("dumbbell"), rating: 4.8, numReviews: 89, stock: 25 },
  { name: "Hydrating Face Moisturizer", description: "Lightweight daily moisturizer with hyaluronic acid for all skin types.", price: 18.5, category: "Beauty", brand: "GlowLab", image: img("moisturizer"), rating: 4.3, numReviews: 264, stock: 150 },
  { name: "Vitamin C Brightening Serum", description: "Antioxidant serum that helps even skin tone and reduce dark spots.", price: 27.0, category: "Beauty", brand: "GlowLab", image: img("serum"), rating: 4.5, numReviews: 198, stock: 100 },
  { name: "Hardcover Productivity Notebook", description: "A5 dotted notebook with 200 pages of thick, ink-friendly paper.", price: 12.99, category: "Books & Stationery", brand: "PaperCo", image: img("notebook"), rating: 4.7, numReviews: 330, stock: 300 },
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Product.deleteMany();
    const created = await Product.insertMany(
  products.map((p) => ({ ...p, price: Math.round(p.price * 13) * 10 }))
);
    console.log(`Seeded ${created.length} products`);
  } catch (err) {
    console.error("Seed error:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();