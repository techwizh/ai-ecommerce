import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import api, { getErrorMessage } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { Product, SellerSummary } from "@/lib/types";

export default function SellerDashboard() {
  const router = useRouter();
  const [summary, setSummary] = useState<SellerSummary | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setError("");
    Promise.all([api.get("/seller/summary"), api.get("/seller/products")])
      .then(([s, p]) => {
        setSummary(s.data);
        setProducts(p.data.products);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(load);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/"));

  const remove = async (id: string) => {
    try {
      await api.delete(`/seller/products/${id}`);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const confirmRemove = (p: Product) => {
    if (Platform.OS === "web") {
      if (window.confirm(`Delete "${p.name}"?`)) remove(p._id);
    } else {
      Alert.alert("Delete product", `Delete "${p.name}"?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => remove(p._id) },
      ]);
    }
  };

  const header = summary && (
    <View style={styles.stats}>
      <View style={styles.statHero}>
        <Text style={styles.heroLabel}>Revenue</Text>
        <Text style={styles.heroValue}>{formatPrice(summary.revenue)}</Text>
        <Text style={styles.heroSub}>{summary.unitsSold} units sold</Text>
      </View>
      <View style={styles.statRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{summary.productCount}</Text>
          <Text style={styles.statLabel}>Products</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{summary.lowStockCount}</Text>
          <Text style={styles.statLabel}>Low stock</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{summary.orderCount}</Text>
          <Text style={styles.statLabel}>Paid orders</Text>
        </View>
      </View>
      <Text style={styles.section}>My products</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable onPress={goBack} style={styles.topButton}>
            <Text style={styles.topText}>← Back</Text>
          </Pressable>
          <Pressable
            style={styles.addButton}
            onPress={() => router.push("/seller/product")}
          >
            <Text style={styles.addText}>+ Add product</Text>
          </Pressable>
        </View>

        <Text style={styles.title}>Seller dashboard</Text>

        {loading ? (
          <ActivityIndicator color="#f0a830" style={styles.center} />
        ) : error ? (
          <Text style={[styles.message, { color: "#c0392b" }]}>{error}</Text>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(p) => p._id}
            contentContainerStyle={styles.list}
            ListHeaderComponent={header || null}
            ListEmptyComponent={
              <Text style={styles.message}>
                You have no products yet. Tap "Add product" to list your first one.
              </Text>
            }
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <View style={styles.info}>
                  <Text style={styles.name} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.price}>{formatPrice(item.price)}</Text>
                  <Text style={item.stock <= 5 ? styles.low : styles.stock}>
                    {item.stock} in stock
                  </Text>
                  <View style={styles.actions}>
                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname: "/seller/product",
                          params: { id: item._id },
                        })
                      }
                    >
                      <Text style={styles.edit}>Edit</Text>
                    </Pressable>
                    <Pressable onPress={() => confirmRemove(item)}>
                      <Text style={styles.delete}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f7f1e3" },
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
    borderColor: "#e6dcc6",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  topText: { color: "#2b2118", fontSize: 14 },
  addButton: {
    backgroundColor: "#f0a830",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addText: { color: "#2b2118", fontSize: 14, fontWeight: "700" },
  title: { color: "#2b2118", fontSize: 24, fontWeight: "700", marginBottom: 12 },
  center: { marginTop: 40 },
  message: { color: "#7a6f5d", textAlign: "center", marginTop: 20, fontSize: 15 },
  list: { gap: 12, paddingBottom: 40 },
  stats: { gap: 12, marginBottom: 4 },
  statHero: { backgroundColor: "#f0a830", borderRadius: 18, padding: 20 },
  heroLabel: { color: "#5b3a0a", fontSize: 14 },
  heroValue: { color: "#2b2118", fontSize: 32, fontWeight: "800", marginTop: 4 },
  heroSub: { color: "#5b3a0a", fontSize: 14, marginTop: 4 },
  statRow: { flexDirection: "row", gap: 12 },
  stat: { flex: 1, backgroundColor: "#fffdf7", borderRadius: 14, padding: 14 },
  statValue: { color: "#2b2118", fontSize: 20, fontWeight: "700" },
  statLabel: { color: "#7a6f5d", fontSize: 13, marginTop: 2 },
  section: { color: "#2b2118", fontSize: 18, fontWeight: "700", marginTop: 6 },
  row: {
    flexDirection: "row",
    backgroundColor: "#fffdf7",
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  image: { width: 84, height: 84, borderRadius: 12, backgroundColor: "#f7f1e3" },
  info: { flex: 1, gap: 2 },
  name: { color: "#2b2118", fontSize: 15, fontWeight: "600" },
  price: { color: "#b45309", fontSize: 15, fontWeight: "700" },
  stock: { color: "#15803d", fontSize: 13 },
  low: { color: "#c0392b", fontSize: 13 },
  actions: { flexDirection: "row", gap: 18, marginTop: 6 },
  edit: { color: "#b45309", fontSize: 14, fontWeight: "600" },
  delete: { color: "#c0392b", fontSize: 14, fontWeight: "600" },
});