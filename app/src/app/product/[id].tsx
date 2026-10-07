import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCart } from "@/context/CartContext";
import api, { getErrorMessage } from "@/lib/api";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addToCart, count } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then(({ data }) => setProduct(data.product))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/"));

  const handleAdd = async () => {
    if (!product) return;
    setAdding(true);
    setMessage("");
    try {
      await addToCart(product._id, qty);
      setMessage("Added to cart ✓");
    } catch (err) {
      setMessage(getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable onPress={goBack} style={styles.topButton}>
            <Text style={styles.topText}>← Back</Text>
          </Pressable>
          <View style={styles.topButton}>
            <Text style={styles.topText}>Cart ({count})</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color="#3b82f6" style={styles.center} />
        ) : error || !product ? (
          <Text style={[styles.message, { color: "#ff6b6b" }]}>
            {error || "Product not found"}
          </Text>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            <Image source={{ uri: product.image }} style={styles.image} />

            <Text style={styles.brand}>{product.brand || product.category}</Text>
            <Text style={styles.name}>{product.name}</Text>

            <View style={styles.row}>
              <Text style={styles.price}>{formatPrice(product.price)}</Text>
              <Text style={styles.rating}>
                ★ {product.rating.toFixed(1)} ({product.numReviews})
              </Text>
            </View>

            <Text style={styles.description}>{product.description}</Text>

            <Text style={product.stock > 0 ? styles.stock : styles.out}>
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </Text>

            {product.stock > 0 && (
              <View style={styles.qtyRow}>
                <Pressable
                  style={styles.qtyButton}
                  onPress={() => setQty((q) => Math.max(1, q - 1))}
                >
                  <Text style={styles.qtyText}>−</Text>
                </Pressable>
                <Text style={styles.qtyValue}>{qty}</Text>
                <Pressable
                  style={styles.qtyButton}
                  onPress={() => setQty((q) => Math.min(product.stock, q + 1))}
                >
                  <Text style={styles.qtyText}>+</Text>
                </Pressable>
              </View>
            )}

            <Pressable
              style={[
                styles.addButton,
                (adding || product.stock === 0) && styles.addDisabled,
              ]}
              onPress={handleAdd}
              disabled={adding || product.stock === 0}
            >
              {adding ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.addText}>Add to cart</Text>
              )}
            </Pressable>

            {!!message && <Text style={styles.feedback}>{message}</Text>}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0b0d12" },
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
    paddingHorizontal: 14,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  topButton: {
    borderColor: "#2a2f3a",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  topText: { color: "#fff", fontSize: 14 },
  center: { marginTop: 40 },
  message: { textAlign: "center", marginTop: 40, fontSize: 16 },
  content: { paddingBottom: 40, gap: 10 },
  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: "#171a21",
  },
  brand: { color: "#9aa0ab", fontSize: 14, marginTop: 6 },
  name: { color: "#fff", fontSize: 24, fontWeight: "700" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  price: { color: "#60a5fa", fontSize: 24, fontWeight: "700" },
  rating: { color: "#fbbf24", fontSize: 15 },
  description: { color: "#c5c9d2", fontSize: 16, lineHeight: 24 },
  stock: { color: "#4ade80", fontSize: 14 },
  out: { color: "#ff6b6b", fontSize: 14 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 6 },
  qtyButton: {
    backgroundColor: "#171a21",
    borderRadius: 10,
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: { color: "#fff", fontSize: 22 },
  qtyValue: { color: "#fff", fontSize: 18, fontWeight: "600", minWidth: 24, textAlign: "center" },
  addButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
  },
  addDisabled: { opacity: 0.5 },
  addText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  feedback: { color: "#9aa0ab", textAlign: "center", fontSize: 14 },
});