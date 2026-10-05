import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import type { Product } from "@/lib/types";

type Props = { product: Product; onPress?: () => void };

export default function ProductCard({ product, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: product.image }} style={styles.image} />
      <View style={styles.body}>
        <Text style={styles.brand} numberOfLines={1}>
          {product.brand || product.category}
        </Text>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.row}>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          <Text style={styles.rating}>★ {product.rating.toFixed(1)}</Text>
        </View>
        {product.stock === 0 && <Text style={styles.out}>Out of stock</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#171a21",
    borderRadius: 16,
    overflow: "hidden",
    flex: 1,
  },
  image: { width: "100%", aspectRatio: 1, backgroundColor: "#0b0d12" },
  body: { padding: 12, gap: 4 },
  brand: { color: "#9aa0ab", fontSize: 12 },
  name: { color: "#fff", fontSize: 15, fontWeight: "600", minHeight: 40 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  price: { color: "#60a5fa", fontSize: 16, fontWeight: "700" },
  rating: { color: "#fbbf24", fontSize: 13 },
  out: { color: "#ff6b6b", fontSize: 12 },
});