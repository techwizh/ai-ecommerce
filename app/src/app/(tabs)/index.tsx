import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppText from "@/components/app-text";
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

const formatLeft = (ms: number) => {
  if (ms <= 0) return "Ended";
  const s = Math.floor(ms / 1000);
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
};

export default function HomeScreen() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const columns = getColumns(width);

  const [products, setProducts] = useState<Product[]>([]);
  const [flash, setFlash] = useState<Product[]>([]);
  const [recs, setRecs] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());

  const openProduct = (id: string) =>
    router.push({ pathname: "/product/[id]", params: { id } });

  // Tick every second for the countdown
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    api
      .get("/products/categories")
      .then(({ data }) => setCategories(data.categories))
      .catch(() => {});
  }, []);

  // Reload sales and recommendations every time Home comes into view
  useFocusEffect(
    useCallback(() => {
      api
        .get("/products/flash-sales")
        .then(({ data }) => setFlash(data.products))
        .catch(() => {});
      api
        .get("/recommendations")
        .then(({ data }) => setRecs(data.products))
        .catch(() => {});
    }, [])
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api
      .get("/products", { params: { category: category || undefined, limit: 50 } })
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

  // Hide sales whose timer ran out while the screen was open
  const liveFlash = flash.filter((p) => p.saleEndsAt && new Date(p.saleEndsAt).getTime() > now);
  const soonest = liveFlash[0]?.saleEndsAt
    ? new Date(liveFlash[0].saleEndsAt).getTime() - now
    : 0;

  const header = (
    <View>
      <View style={styles.header}>
        <AppText style={styles.hello}>Hi, {user?.name?.split(" ")[0]}</AppText>
        <AppText style={styles.sub}>Find something you love</AppText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tilesScroll}
        contentContainerStyle={styles.tiles}
      >
        {["", ...categories].map((c) => (
          <Pressable
            key={c || "all"}
            style={styles.tile}
            onPress={() => setCategory(c)}
          >
            <View style={[styles.tileCircle, category === c && styles.tileCircleActive]}>
              <AppText style={styles.tileLetter}>{(c || "All").charAt(0)}</AppText>
            </View>
            <AppText
              style={[styles.tileLabel, category === c && styles.tileLabelActive]}
              numberOfLines={2}
            >
              {c || "All"}
            </AppText>
          </Pressable>
        ))}
      </ScrollView>

      {liveFlash.length > 0 && (
        <View style={styles.flash}>
          <View style={styles.flashHeader}>
            <AppText style={styles.flashTitle}>⚡ Flash Sales</AppText>
            <AppText style={styles.flashTimer}>Ends in {formatLeft(soonest)}</AppText>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}
          >
            {liveFlash.map((p) => (
              <View key={p._id} style={styles.card}>
                <ProductCard product={p} onPress={() => openProduct(p._id)} />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {recs.length > 0 && (
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Recommended for you</AppText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}
          >
            {recs.map((p) => (
              <View key={p._id} style={styles.card}>
                <ProductCard product={p} onPress={() => openProduct(p._id)} />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <AppText style={styles.sectionTitle}>
        {category ? category : "All products"}
      </AppText>
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
              <ActivityIndicator color="#f0a830" style={styles.center} />
            ) : error ? (
              <AppText style={[styles.message, { color: "#c0392b" }]}>{error}</AppText>
            ) : (
              <AppText style={styles.message}>No products yet. Check back soon.</AppText>
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
  screen: { flex: 1, backgroundColor: "#f7f1e3" },
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
    paddingHorizontal: 14,
  },
  header: { paddingVertical: 14 },
  hello: { color: "#2b2118", fontSize: 22, fontWeight: "700" },
  sub: { color: "#7a6f5d", fontSize: 14, marginTop: 2 },
  tilesScroll: { flexGrow: 0, marginBottom: 14 },
  tiles: { gap: 14 },
  tile: { width: 76, alignItems: "center", gap: 6 },
  tileCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fffdf7",
    borderWidth: 1,
    borderColor: "#e6dcc6",
    alignItems: "center",
    justifyContent: "center",
  },
  tileCircleActive: { backgroundColor: "#f0a830", borderColor: "#f0a830" },
  tileLetter: { color: "#2b2118", fontSize: 22, fontWeight: "700" },
  tileLabel: { color: "#7a6f5d", fontSize: 12, textAlign: "center" },
  tileLabelActive: { color: "#2b2118", fontWeight: "700" },
  flash: {
    backgroundColor: "#f0a830",
    borderRadius: 14,
    padding: 12,
    marginBottom: 18,
  },
  flashHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  flashTitle: { color: "#2b2118", fontSize: 18, fontWeight: "700" },
  flashTimer: { color: "#2b2118", fontSize: 14, fontWeight: "700" },
  section: { marginBottom: 18 },
  sectionTitle: { color: "#2b2118", fontSize: 18, fontWeight: "700", marginBottom: 10 },
  row: { gap: 12 },
  card: { width: 160 },
  center: { marginTop: 40 },
  message: { color: "#7a6f5d", textAlign: "center", marginTop: 40, fontSize: 16 },
  list: { paddingBottom: 30 },
});