import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import api, { getErrorMessage } from "@/lib/api";
import type { Order } from "@/lib/types";

export default function PayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then(({ data }) => setOrder(data.order))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const goOrders = () => router.replace("/orders");

  // Format as "1234 5678 9012 3456"
  const onCardChange = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 16);
    setCardNumber(digits.replace(/(.{4})/g, "$1 ").trim());
  };

  // Format as "MM/YY"
  const onExpiryChange = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 4);
    setExpiry(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
  };

  const pay = async () => {
    setError("");
    setPaying(true);
    try {
      await api.post(`/orders/${id}/pay`, { cardNumber, expiry, cvc });
      setPaid(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPaying(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable onPress={goOrders} style={styles.topButton}>
            <Text style={styles.topText}>← My orders</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator color="#3b82f6" style={styles.center} />
        ) : !order ? (
          <Text style={[styles.message, { color: "#ff6b6b" }]}>
            {error || "Order not found"}
          </Text>
        ) : paid || order.paymentStatus === "paid" ? (
          <View style={styles.done}>
            <Text style={styles.doneIcon}>✓</Text>
            <Text style={styles.doneTitle}>Payment successful</Text>
            <Text style={styles.doneText}>
              Order #{order._id.slice(-6).toUpperCase()} · ${order.total.toFixed(2)}
            </Text>
            <Pressable style={styles.button} onPress={goOrders}>
              <Text style={styles.buttonText}>View my orders</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Payment</Text>

            <View style={styles.demo}>
              <Text style={styles.demoText}>
                Demo payment: no real card is charged. Use 4242 4242 4242 4242,
                any future expiry and any 3-digit CVC. The card 4000 0000 0000
                0002 is always declined.
              </Text>
            </View>

            <View style={styles.summary}>
              <Text style={styles.summaryText}>
                Order #{order._id.slice(-6).toUpperCase()}
              </Text>
              <Text style={styles.summaryTotal}>${order.total.toFixed(2)}</Text>
            </View>

            {order.paymentStatus === "failed" && (
              <Text style={styles.warn}>
                Your last payment failed. Try again with another card.
              </Text>
            )}

            <TextInput
              style={styles.input}
              placeholder="Card number"
              placeholderTextColor="#8b8f98"
              keyboardType="number-pad"
              value={cardNumber}
              onChangeText={onCardChange}
            />
            <View style={styles.twoCols}>
              <TextInput
                style={[styles.input, styles.half]}
                placeholder="MM/YY"
                placeholderTextColor="#8b8f98"
                keyboardType="number-pad"
                value={expiry}
                onChangeText={onExpiryChange}
              />
              <TextInput
                style={[styles.input, styles.half]}
                placeholder="CVC"
                placeholderTextColor="#8b8f98"
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
                value={cvc}
                onChangeText={(t) => setCvc(t.replace(/\D/g, ""))}
              />
            </View>

            {!!error && <Text style={styles.error}>{error}</Text>}

            <Pressable
              style={[styles.button, paying && styles.buttonDisabled]}
              onPress={pay}
              disabled={paying}
            >
              {paying ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  Pay ${order.total.toFixed(2)}
                </Text>
              )}
            </Pressable>

            <Pressable onPress={goOrders}>
              <Text style={styles.later}>Pay later</Text>
            </Pressable>
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
    maxWidth: 600,
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
  center: { marginTop: 40 },
  message: { textAlign: "center", marginTop: 40, fontSize: 16 },
  content: { gap: 12, paddingBottom: 40 },
  title: { color: "#fff", fontSize: 24, fontWeight: "700" },
  demo: {
    backgroundColor: "rgba(251,191,36,0.12)",
    borderColor: "#fbbf24",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  demoText: { color: "#fbbf24", fontSize: 13, lineHeight: 19 },
  summary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#171a21",
    borderRadius: 14,
    padding: 16,
  },
  summaryText: { color: "#9aa0ab", fontSize: 15 },
  summaryTotal: { color: "#fff", fontSize: 22, fontWeight: "700" },
  warn: { color: "#fbbf24", fontSize: 14 },
  input: {
    backgroundColor: "#171a21",
    borderColor: "#2a2f3a",
    borderWidth: 1,
    borderRadius: 12,
    color: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
  },
  twoCols: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  error: { color: "#ff6b6b", fontSize: 14 },
  button: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 6,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  later: { color: "#9aa0ab", textAlign: "center", fontSize: 14, marginTop: 6 },
  done: { alignItems: "center", gap: 10, marginTop: 60 },
  doneIcon: { color: "#4ade80", fontSize: 56 },
  doneTitle: { color: "#fff", fontSize: 22, fontWeight: "700" },
  doneText: { color: "#9aa0ab", fontSize: 15, marginBottom: 10 },
});