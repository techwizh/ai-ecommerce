import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ProductCard from "@/components/product-card";
import api, { getErrorMessage } from "@/lib/api";
import type { Product } from "@/lib/types";

const getColumns = (width: number) => {
  if (width < 600) return 2;
  if (width < 900) return 3;
  if (width < 1200) return 4;
  return 5;
};

export default function SearchScreen() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const columns = getColumns(width);

  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Wait until the user stops typing before searching
  useEffect(() => {
    const t = setTimeout(() => setSearch(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!search) {
      setProducts([]);
      setError("");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    api
      .get("/products", { params: { search, limit: 50 } })
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
  }, [search]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>Search</Text>

        <TextInput
          style={styles.input}
          placeholder="Search products..."
          placeholderTextColor="#8b8f98"
          value={query}
          onChangeText={setQuery}
        />

        {loading ? (
          <ActivityIndicator color="#3b82f6" style={styles.center} />
        ) : error ? (
          <Text style={[styles.message, { color: "#ff6b6b" }]}>{error}</Text>
        ) : !search ? (
          <Text style={styles.message}>Type to search for products</Text>
        ) : products.length === 0 ? (
          <Text style={styles.message}>No products found</Text>
        ) : (
          <FlatList
            key={columns}
            data={products}
            keyExtractor={(item) => item._id}
            numColumns={columns}
            contentContainerStyle={styles.list}
            style={styles.grid}
            renderItem={({ item }) => (
              <View style={{ width: `${100 / columns}%`, padding: 6 }}>
                <ProductCard
                  product={item}
                  onPress={() =>
                    router.push({
                      pathname: "/product/[id]",
                      params: { id: item._id },
                    })
                  }
                />
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
  title: { color: "#fff", fontSize: 22, fontWeight: "700", paddingVertical: 14 },
  input: {
    backgroundColor: "#171a21",
    borderColor: "#2a2f3a",
    borderWidth: 1,
    borderRadius: 12,
    color: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  grid: { flex: 1 },
  center: { marginTop: 40 },
  message: {
    color: "#9aa0ab",
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
  list: { paddingBottom: 30 },
});