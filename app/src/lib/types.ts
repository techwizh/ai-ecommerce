export type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  image: string;
  rating: number;
  numReviews: number;
  stock: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
  subtotal: number;
};

export type OrderItem = {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
};

export type Order = {
  _id: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    phone: string;
  };
  total: number;
  paymentStatus: "pending" | "paid" | "failed";
  status: "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  products?: Product[];
};