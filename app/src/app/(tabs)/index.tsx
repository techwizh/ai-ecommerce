import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ProductCard from "@/components/product-card";
import { useAuth } from "@/context/AuthContext";
import api, { getErrorMessage } from "@/lib/api";
import type { Product } from "@/lib/types";

const getColumns = (width: number) => {
  if (width < 600) return 2;
  if (width < 900) return 3;
  if (width < 1200) return 4;
  return 5;
};

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const { width } = useWindowDimensions();
  const columns = getColumns(width);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load the category chips once
  useEffect(() => {
    api
      .get("/products/categories")
      .then(({ data }) => setCategories(data.categories))
      .catch(() => {});
  }, []);

  // Wait until the user stops typing before searching
  useEffect(() => {
    const t = setTimeout(() => setSearch(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  // Load products whenever the search or category changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    api
      .get("/products", {
        params: {
          search: search || undefined,
          category: category || undefined,
          limit: 50,
        },
      })
      .then(({ data }) => {
        if (!cancelled) setProducts(data.products);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [search, category]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.hello}>Hi, {user?.name?.split(" ")[0]} </Text>
            <Text style={styles.sub}>Find something you love</Text>
          </View>
          <Pressable style={styles.logout} onPress={logout}>
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>
        </View>

        <TextInput
          style={styles.search}
          placeholder="Search products..."
          placeholderTextColor="#8b8f98"
          value={query}
          onChangeText={setQuery}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chips}
        >
          {["", ...categories].map((c) => (
            <Pressable
              key={c || "all"}
              style={[styles.chip, category === c && styles.chipActive]}
              onPress={() => setCategory(c)}
            >
              <Text
                style={[styles.chipText, category === c && styles.chipTextActive]}
              >
                {c || "All"}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {loading ? (
          <ActivityIndicator color="#3b82f6" style={styles.center} />
        ) : error ? (
          <Text style={[styles.message, { color: "#ff6b6b" }]}>{error}</Text>
        ) : products.length === 0 ? (
          <Text style={styles.message}>No products found</Text>
        ) : (
          <FlatList
            key={columns}
            data={products}
            keyExtractor={(item) => item._id}
            numColumns={columns}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={{ width: `${100 / columns}%`, padding: 6 }}>
                <ProductCard product={item} />
              </View>
            )}
          />
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
    maxWidth: 1200,
    alignSelf: "center",
    paddingHorizontal: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  hello: { color: "#fff", fontSize: 22, fontWeight: "700" },
  sub: { color: "#9aa0ab", fontSize: 14, marginTop: 2 },
  logout: {
    borderColor: "#2a2f3a",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  logoutText: { color: "#fff", fontSize: 14 },
  search: {
    backgroundColor: "#171a21",
    borderColor: "#2a2f3a",
    borderWidth: 1,
    borderRadius: 12,
    color: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  chipsScroll: { flexGrow: 0, flexShrink: 0, height: 44, marginVertical: 12 },
  chips: { gap: 8 },
  chip: {
    backgroundColor: "#171a21",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: "#3b82f6" },
  chipText: { color: "#9aa0ab", fontSize: 14 },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  center: { marginTop: 40 },
  message: {
    color: "#9aa0ab",
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
  list: { paddingBottom: 30 },
});