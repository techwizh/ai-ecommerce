import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { useWishlist } from "@/context/WishlistContext";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

type Props = { product: Product; onPress?: () => void };

export default function ProductCard({ product, onPress }: Props) {
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved(product._id);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View>
        <Image source={{ uri: product.image }} style={styles.image} />
        <Pressable
          style={styles.heart}
          onPress={() => toggle(product).catch(() => {})}
          hitSlop={8}
        >
          <Text style={[styles.heartText, saved && styles.heartActive]}>
            {saved ? "♥" : "♡"}
          </Text>
        </Pressable>
      </View>
      <View style={styles.body}>
        <Text style={styles.brand} numberOfLines={1}>
          {product.brand || product.category}
        </Text>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.row}>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          <Text style={styles.rating}>★ {product.rating.toFixed(1)}</Text>
        </View>
        {product.stock === 0 && <Text style={styles.out}>Out of stock</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fffdf7",
    borderRadius: 16,
    overflow: "hidden",
    flex: 1,
  },
  image: { width: "100%", aspectRatio: 1, backgroundColor: "#f7f1e3" },
  heart: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "	rgba(255,253,247,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  heartText: { color: "#2b2118", fontSize: 20 },
  heartActive: { color: "#c0392b" },
  body: { padding: 12, gap: 4 },
  brand: { color: "#7a6f5d", fontSize: 12 },
  name: { color: "#2b2118", fontSize: 15, fontWeight: "600", minHeight: 40 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  price: { color: "#b45309", fontSize: 16, fontWeight: "700" },
  rating: { color: "#b7791f", fontSize: 13 },
  out: { color: "#c0392b", fontSize: 12 },
});