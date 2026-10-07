import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const columns = getColumns(width);

  const [products, setProducts] = useState<Product[]>([]);
  const [recs, setRecs] = useState<Product[]>([]);
  const [recsLabel, setRecsLabel] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const openProduct = (id: string) =>
    router.push({ pathname: "/product/[id]", params: { id } });

  useEffect(() => {
    api
      .get("/products/categories")
      .then(({ data }) => setCategories(data.categories))
      .catch(() => {});
  }, []);

  // Reload recommendations every time the Home tab comes into view
  useFocusEffect(
    useCallback(() => {
      api
        .get("/recommendations")
        .then(({ data }) => {
          setRecs(data.products);
          setRecsLabel(data.basedOn);
        })
        .catch(() => {});
    }, [])
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    api
      .get("/products", {
        params: { category: category || undefined, limit: 50 },
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
  }, [category]);

  const header = (
    <View>
      <View style={styles.header}>
        <Text style={styles.hello}>Hi, {user?.name?.split(" ")[0]}</Text>
        <Text style={styles.sub}>Find something you love</Text>
      </View>

      {recs.length > 0 && (
        <View style={styles.recsBlock}>
          <Text style={styles.sectionTitle}>Recommended for you</Text>
          <Text style={styles.sectionSub}>Based on {recsLabel}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recsRow}
          >
            {recs.map((p) => (
              <View key={p._id} style={styles.recCard}>
                <ProductCard product={p} onPress={() => openProduct(p._id)} />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <Text style={styles.sectionTitle}>Browse</Text>
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
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <FlatList
          key={columns}
          data={products}
          keyExtractor={(item) => item._id}
          numColumns={columns}
          ListHeaderComponent={header}
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator color="#3b82f6" style={styles.center} />
            ) : error ? (
              <Text style={[styles.message, { color: "#ff6b6b" }]}>{error}</Text>
            ) : (
              <Text style={styles.message}>No products found</Text>
            )
          }
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={{ width: `${100 / columns}%`, padding: 6 }}>
              <ProductCard product={item} onPress={() => openProduct(item._id)} />
            </View>
          )}
        />
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
  header: { paddingVertical: 14 },
  hello: { color: "#fff", fontSize: 22, fontWeight: "700" },
  sub: { color: "#9aa0ab", fontSize: 14, marginTop: 2 },
  recsBlock: { marginBottom: 18 },
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  sectionSub: { color: "#9aa0ab", fontSize: 13, marginTop: 2, marginBottom: 8 },
  recsRow: { gap: 12, paddingVertical: 4 },
  recCard: { width: 170 },
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