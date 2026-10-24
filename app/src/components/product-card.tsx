import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/app-text";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

type Props = { product: Product; onPress?: () => void };

export default function ProductCard({ product, onPress }: Props) {
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved(product._id);
  const onSale = !!product.onSale && !!product.salePrice;
  const discount = onSale
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View>
        <Image source={{ uri: product.image }} style={styles.image} />
        {onSale && (
          <View style={styles.badge}>
            <AppText style={styles.badgeText}>-{discount}%</AppText>
          </View>
        )}
        <Pressable
          style={styles.heart}
          onPress={() => toggle(product).catch(() => {})}
          hitSlop={8}
        >
          <AppText style={[styles.heartText, saved && styles.heartActive]}>
            {saved ? "♥" : "♡"}
          </AppText>
        </Pressable>
      </View>
      <View style={styles.body}>
        <AppText style={styles.brand} numberOfLines={1}>
          {product.brand || product.category}
        </AppText>
        <AppText style={styles.name} numberOfLines={2}>
          {product.name}
        </AppText>
        <AppText style={styles.price}>
          {formatPrice(onSale ? product.salePrice! : product.price)}
        </AppText>
        {onSale && (
          <AppText style={styles.oldPrice}>{formatPrice(product.price)}</AppText>
        )}
        <View style={styles.row}>
          <AppText style={styles.rating}>★ {product.rating.toFixed(1)}</AppText>
          {product.stock === 0 && <AppText style={styles.out}>Out of stock</AppText>}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fffdf7",
    borderRadius: 12,
    overflow: "hidden",
    flex: 1,
  },
  image: { width: "100%", aspectRatio: 1, backgroundColor: "#f7f1e3" },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#f0a830",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: { color: "#2b2118", fontSize: 12, fontWeight: "700" },
  heart: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,253,247,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  heartText: { color: "#2b2118", fontSize: 19 },
  heartActive: { color: "#c0392b" },
  body: { padding: 10, gap: 2 },
  brand: { color: "#7a6f5d", fontSize: 12 },
  name: { color: "#2b2118", fontSize: 14, minHeight: 36 },
  price: { color: "#2b2118", fontSize: 16, fontWeight: "700", marginTop: 2 },
  oldPrice: { color: "#a39a88", fontSize: 12, textDecorationLine: "line-through" },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 2 },
  rating: { color: "#b7791f", fontSize: 12 },
  out: { color: "#c0392b", fontSize: 12 },
});