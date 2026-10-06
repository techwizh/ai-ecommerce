import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCart } from "@/context/CartContext";

export default function CartScreen() {
  const { items, total, count, updateQuantity, removeItem } = useCart();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>Your cart ({count})</Text>

        {items.length === 0 ? (
          <Text style={styles.message}>Your cart is empty</Text>
        ) : (
          <>
            <FlatList
              data={items}
              keyExtractor={(i) => i.product._id}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => (
                <View style={styles.row}>
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: "/product/[id]",
                        params: { id: item.product._id },
                      })
                    }
                  >
                    <Image source={{ uri: item.product.image }} style={styles.image} />
                  </Pressable>

                  <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={2}>
                      {item.product.name}
                    </Text>
                    <Text style={styles.price}>${item.product.price.toFixed(2)}</Text>

                    <View style={styles.qtyRow}>
                      <Pressable
                        style={styles.qtyButton}
                        onPress={() =>
                          updateQuantity(item.product._id, item.quantity - 1)
                        }
                      >
                        <Text style={styles.qtyText}>−</Text>
                      </Pressable>
                      <Text style={styles.qtyValue}>{item.quantity}</Text>
                      <Pressable
                        style={styles.qtyButton}
                        onPress={() =>
                          updateQuantity(item.product._id, item.quantity + 1)
                        }
                      >
                        <Text style={styles.qtyText}>+</Text>
                      </Pressable>
                      <Pressable onPress={() => removeItem(item.product._id)}>
                        <Text style={styles.remove}>Remove</Text>
                      </Pressable>
                    </View>
                  </View>

                  <Text style={styles.subtotal}>${item.subtotal.toFixed(2)}</Text>
                </View>
              )}
            />

            <View style={styles.footer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
              </View>
              <Pressable
                style={styles.checkout}
                onPress={() => router.push("/checkout")}
              >
                <Text style={styles.checkoutText}>Checkout</Text>
              </Pressable>
            </View>
          </>
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
    maxWidth: 800,
    alignSelf: "center",
    paddingHorizontal: 14,
  },
  title: { color: "#fff", fontSize: 22, fontWeight: "700", paddingVertical: 14 },
  message: { color: "#9aa0ab", textAlign: "center", marginTop: 40, fontSize: 16 },
  list: { gap: 12, paddingBottom: 20 },
  row: {
    flexDirection: "row",
    backgroundColor: "#171a21",
    borderRadius: 16,
    padding: 12,
    gap: 12,
    alignItems: "center",
  },
  image: { width: 80, height: 80, borderRadius: 12, backgroundColor: "#0b0d12" },
  info: { flex: 1, gap: 4 },
  name: { color: "#fff", fontSize: 15, fontWeight: "600" },
  price: { color: "#9aa0ab", fontSize: 14 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  qtyButton: {
    backgroundColor: "#0b0d12",
    borderRadius: 8,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: { color: "#fff", fontSize: 18 },
  qtyValue: { color: "#fff", fontSize: 15, minWidth: 20, textAlign: "center" },
  remove: { color: "#ff6b6b", fontSize: 13, marginLeft: 6 },
  subtotal: { color: "#60a5fa", fontSize: 16, fontWeight: "700" },
  footer: {
    paddingVertical: 14,
    gap: 12,
    borderTopColor: "#2a2f3a",
    borderTopWidth: 1,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { color: "#9aa0ab", fontSize: 16 },
  totalValue: { color: "#fff", fontSize: 24, fontWeight: "700" },
  checkout: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  checkoutText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});