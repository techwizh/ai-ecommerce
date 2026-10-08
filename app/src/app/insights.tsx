import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import api, { getErrorMessage } from "@/lib/api";
import { formatPrice } from "@/lib/format";

type Insights = {
  totalSpent: number;
  orderCount: number;
  paidOrderCount: number;
  pendingOrderCount: number;
  itemsBought: number;
  averageOrder: number;
  favouriteCategory: string | null;
  categoryBreakdown: { category: string; spent: number }[];
  topItem: { name: string; quantity: number } | null;
  wishlistCount: number;
  cartCount: number;
  lastOrderDate: string | null;
};

export default function InsightsScreen() {
  const router = useRouter();
  const [data, setData] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Reload every time the screen opens
  useFocusEffect(
    useCallback(() => {
      setError("");
      api
        .get("/insights")
        .then(({ data }) => setData(data))
        .catch((err) => setError(getErrorMessage(err)))
        .finally(() => setLoading(false));
    }, [])
  );

  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/"));

  const maxSpent = data?.categoryBreakdown[0]?.spent || 1;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable onPress={goBack} style={styles.topButton}>
            <Text style={styles.topText}>← Back</Text>
          </Pressable>
        </View>

        <Text style={styles.title}>Your insights</Text>

        {loading ? (
          <ActivityIndicator color="#f0a830" style={styles.center} />
        ) : error || !data ? (
          <Text style={[styles.message, { color: "#c0392b" }]}>
            {error || "Could not load insights"}
          </Text>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.hero}>
              <Text style={styles.heroLabel}>Total spent</Text>
              <Text style={styles.heroValue}>{formatPrice(data.totalSpent)}</Text>
              <Text style={styles.heroSub}>
                {data.paidOrderCount} paid order
                {data.paidOrderCount === 1 ? "" : "s"}
                {data.pendingOrderCount > 0
                  ? ` · ${data.pendingOrderCount} unpaid`
                  : ""}
              </Text>
            </View>

            <View style={styles.grid}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{data.itemsBought}</Text>
                <Text style={styles.statLabel}>Items bought</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{formatPrice(data.averageOrder)}</Text>
                <Text style={styles.statLabel}>Average order</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{data.wishlistCount}</Text>
                <Text style={styles.statLabel}>Saved items</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{data.cartCount}</Text>
                <Text style={styles.statLabel}>In your cart</Text>
              </View>
            </View>

            {data.favouriteCategory && (
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Favourite category</Text>
                <Text style={styles.cardValue}>{data.favouriteCategory}</Text>
              </View>
            )}

            {data.topItem && (
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Most bought item</Text>
                <Text style={styles.cardValue}>{data.topItem.name}</Text>
                <Text style={styles.cardSub}>
                  {data.topItem.quantity} bought in total
                </Text>
              </View>
            )}

            {data.categoryBreakdown.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Spending by category</Text>
                {data.categoryBreakdown.map((c) => (
                  <View key={c.category} style={styles.barRow}>
                    <View style={styles.barHeader}>
                      <Text style={styles.barName}>{c.category}</Text>
                      <Text style={styles.barAmount}>{formatPrice(c.spent)}</Text>
                    </View>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          { width: `${Math.max((c.spent / maxSpent) * 100, 4)}%` },
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            )}

            {data.lastOrderDate && (
              <Text style={styles.footer}>
                Last order: {new Date(data.lastOrderDate).toLocaleDateString()}
              </Text>
            )}

            {data.orderCount === 0 && (
              <Text style={styles.message}>
                Place your first order to see your insights grow.
              </Text>
            )}
          </ScrollView>
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
  topBar: { flexDirection: "row", paddingVertical: 14 },
  topButton: {
    borderColor: "#e6dcc6",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  topText: { color: "#2b2118", fontSize: 14 },
  title: { color: "#2b2118", fontSize: 24, fontWeight: "700", marginBottom: 12 },
  center: { marginTop: 40 },
  message: { color: "#7a6f5d", textAlign: "center", marginTop: 20, fontSize: 15 },
  content: { gap: 12, paddingBottom: 40 },
  hero: { backgroundColor: "#f0a830", borderRadius: 18, padding: 20 },
  heroLabel: { color: "#5b3a0a", fontSize: 14 },
  heroValue: { color: "#2b2118", fontSize: 34, fontWeight: "800", marginTop: 4 },
  heroSub: { color: "#5b3a0a", fontSize: 14, marginTop: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  stat: {
    flexGrow: 1,
    flexBasis: "45%",
    backgroundColor: "#fffdf7",
    borderRadius: 14,
    padding: 16,
  },
  statValue: { color: "#2b2118", fontSize: 20, fontWeight: "700" },
  statLabel: { color: "#7a6f5d", fontSize: 13, marginTop: 2 },
  card: { backgroundColor: "#fffdf7", borderRadius: 14, padding: 16, gap: 4 },
  cardLabel: { color: "#7a6f5d", fontSize: 13 },
  cardValue: { color: "#2b2118", fontSize: 18, fontWeight: "700" },
  cardSub: { color: "#7a6f5d", fontSize: 13 },
  barRow: { marginTop: 10 },
  barHeader: { flexDirection: "row", justifyContent: "space-between" },
  barName: { color: "#2b2118", fontSize: 14 },
  barAmount: { color: "#b45309", fontSize: 14, fontWeight: "600" },
  barTrack: {
    height: 8,
    backgroundColor: "#f7f1e3",
    borderRadius: 4,
    marginTop: 6,
    overflow: "hidden",
  },
  barFill: { height: 8, backgroundColor: "#f0a830", borderRadius: 4 },
  footer: { color: "#7a6f5d", textAlign: "center", fontSize: 13 },
});