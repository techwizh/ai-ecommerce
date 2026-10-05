import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import type { Product } from "@/lib/types";

type WishlistContextType = {
  products: Product[];
  count: number;
  isSaved: (id: string) => boolean;
  toggle: (product: Product) => Promise<void>;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);

  const refresh = useCallback(async () => {
    const { data } = await api.get("/wishlist");
    setProducts(data.products);
  }, []);

  // Load the wishlist on login, clear it on logout
  useEffect(() => {
    if (user) refresh().catch(() => {});
    else setProducts([]);
  }, [user, refresh]);

  const isSaved = (id: string) => products.some((p) => p._id === id);

  const toggle = async (product: Product) => {
    if (isSaved(product._id)) {
      const { data } = await api.delete(`/wishlist/${product._id}`);
      setProducts(data.products);
    } else {
      const { data } = await api.post("/wishlist", { productId: product._id });
      setProducts(data.products);
    }
  };

  return (
    <WishlistContext.Provider
      value={{ products, count: products.length, isSaved, toggle }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}