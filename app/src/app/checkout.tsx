import { useRouter } from "expo-router";
import React, { useState } from "react";
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

import { useCart } from "@/context/CartContext";
import api, { getErrorMessage } from "@/lib/api";

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, total, count, refresh } = useCart();

  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/"));

  const placeOrder = async () => {
    setError("");
    if (!fullName.trim() || !address.trim() || !city.trim() || !phone.trim()) {
      return setError("Please fill in all the fields");
    }

    setSubmitting(true);
    try {
           const { data } = await api.post("/orders", {
        shippingAddress: { fullName, address, city, phone },
      });
      await refresh(); // the server emptied the cart
      router.replace({ pathname: "/pay/[id]", params: { id: data.order._id } });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable onPress={goBack} style={styles.topButton}>
            <Text style={styles.topText}>← Back</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Checkout</Text>

          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              {count} item{count === 1 ? "" : "s"}
            </Text>
            <Text style={styles.summaryTotal}>${total.toFixed(2)}</Text>
          </View>

          <Text style={styles.section}>Shipping address</Text>

          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor="#8b8f98"
            value={fullName}
            onChangeText={setFullName}
          />
          <TextInput
            style={styles.input}
            placeholder="Address"
            placeholderTextColor="#8b8f98"
            value={address}
            onChangeText={setAddress}
          />
          <TextInput
            style={styles.input}
            placeholder="City"
            placeholderTextColor="#8b8f98"
            value={city}
            onChangeText={setCity}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            placeholderTextColor="#8b8f98"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          {!!error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            style={[
              styles.button,
              (submitting || items.length === 0) && styles.buttonDisabled,
            ]}
            onPress={placeOrder}
            disabled={submitting || items.length === 0}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Place order</Text>
            )}
          </Pressable>

          {items.length === 0 && (
            <Text style={styles.hint}>Your cart is empty</Text>
          )}
        </ScrollView>
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
  content: { gap: 12, paddingBottom: 40 },
  title: { color: "#fff", fontSize: 24, fontWeight: "700" },
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
  section: { color: "#9aa0ab", fontSize: 14, marginTop: 6 },
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
  error: { color: "#ff6b6b", fontSize: 14 },
  button: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 6,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  hint: { color: "#9aa0ab", textAlign: "center", fontSize: 14 },
});