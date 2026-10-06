import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import api, { getErrorMessage } from "@/lib/api";
import type { Order } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  processing: "#fbbf24",
  shipped: "#60a5fa",
  delivered: "#4ade80",
  cancelled: "#ff6b6b",
};

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/orders")
      .then(({ data }) => setOrders(data.orders))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/"));

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable onPress={goBack} style={styles.topButton}>
            <Text style={styles.topText}>← Back</Text>
          </Pressable>
        </View>

        <Text style={styles.title}>My orders</Text>

        {loading ? (
          <ActivityIndicator color="#3b82f6" style={styles.center} />
        ) : error ? (
          <Text style={[styles.message, { color: "#ff6b6b" }]}>{error}</Text>
        ) : orders.length === 0 ? (
          <Text style={styles.message}>You have no orders yet</Text>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(o) => o._id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.orderId}>
                      Order #{item._id.slice(-6).toUpperCase()}
                    </Text>
                    <Text style={styles.date}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.status,
                      { color: STATUS_COLORS[item.status] || "#fff" },
                    ]}
                  >
                    {item.status.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.thumbs}>
                  {item.items.map((i) => (
                    <Image
                      key={i.product + i.name}
                      source={{ uri: i.image }}
                      style={styles.thumb}
                    />
                  ))}
                </View>

                {item.items.map((i) => (
                  <Text key={i.product + i.name} style={styles.line} numberOfLines={1}>
                    {i.quantity} × {i.name}
                  </Text>
                ))}

                <View style={styles.cardFooter}>
                  <Text
                    style={
                      item.paymentStatus === "paid" ? styles.paid : styles.unpaid
                    }
                  >
                    {item.paymentStatus === "paid" ? "Paid" : "Payment pending"}
                  </Text>
                  <Text style={styles.total}>${item.total.toFixed(2)}</Text>
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
  screen: { flex: 1, backgroundColor: "#0b0d12" },
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
    paddingHorizontal: 14,
  },
  topBar: { flexDirection: "row", paddingVertical: 14 },
  topButton: {
    borderColor: "#2a2f3a",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  topText: { color: "#fff", fontSize: 14 },
  title: { color: "#fff", fontSize: 24, fontWeight: "700", marginBottom: 12 },
  center: { marginTop: 40 },
  message: { color: "#9aa0ab", textAlign: "center", marginTop: 40, fontSize: 16 },
  list: { gap: 12, paddingBottom: 30 },
  card: { backgroundColor: "#171a21", borderRadius: 16, padding: 16, gap: 8 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between" },
  orderId: { color: "#fff", fontSize: 16, fontWeight: "700" },
  date: { color: "#9aa0ab", fontSize: 13, marginTop: 2 },
  status: { fontSize: 13, fontWeight: "700" },
  thumbs: { flexDirection: "row", gap: 8, marginVertical: 4 },
  thumb: { width: 48, height: 48, borderRadius: 8, backgroundColor: "#0b0d12" },
  line: { color: "#c5c9d2", fontSize: 14 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopColor: "#2a2f3a",
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 4,
  },
  paid: { color: "#4ade80", fontSize: 14 },
  unpaid: { color: "#fbbf24", fontSize: 14 },
  total: { color: "#fff", fontSize: 18, fontWeight: "700" },
});