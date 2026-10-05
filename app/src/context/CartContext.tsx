import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import type { CartItem } from "@/lib/types";

type CartState = { items: CartItem[]; total: number; count: number };

type CartContextType = CartState & {
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const EMPTY: CartState = { items: [], total: 0, count: 0 };

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartState>(EMPTY);

  const refresh = useCallback(async () => {
    const { data } = await api.get("/cart");
    setCart(data);
  }, []);

  // Load the cart on login, clear it on logout
  useEffect(() => {
    if (user) refresh().catch(() => {});
    else setCart(EMPTY);
  }, [user, refresh]);

  const addToCart = async (productId: string, quantity = 1) => {
    const { data } = await api.post("/cart", { productId, quantity });
    setCart(data);
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    const { data } = await api.put(`/cart/${productId}`, { quantity });
    setCart(data);
  };

  const removeItem = async (productId: string) => {
    const { data } = await api.delete(`/cart/${productId}`);
    setCart(data);
  };

  return (
    <CartContext.Provider
      value={{ ...cart, addToCart, updateQuantity, removeItem, refresh }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}