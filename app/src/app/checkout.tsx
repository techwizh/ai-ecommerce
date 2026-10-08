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

import { formatPrice } from "@/lib/format";

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
            <Text style={styles.summaryTotal}>{formatPrice(total)}</Text>
          </View>

          <Text style={styles.section}>Shipping address</Text>

          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor="#a39a88"
            value={fullName}
            onChangeText={setFullName}
          />
          <TextInput
            style={styles.input}
            placeholder="Address"
            placeholderTextColor="#a39a88"
            value={address}
            onChangeText={setAddress}
          />
          <TextInput
            style={styles.input}
            placeholder="City"
            placeholderTextColor="#a39a88"
            value={city}
            onChangeText={setCity}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            placeholderTextColor="#a39a88"
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
              <ActivityIndicator color="#2b2118" />
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
  screen: { flex: 1, backgroundColor: "#f7f1e3" },
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 600,
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
  content: { gap: 12, paddingBottom: 40 },
  title: { color: "#2b2118", fontSize: 24, fontWeight: "700" },
  summary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fffdf7",
    borderRadius: 14,
    padding: 16,
  },
  summaryText: { color: "#7a6f5d", fontSize: 15 },
  summaryTotal: { color: "#2b2118", fontSize: 22, fontWeight: "700" },
  section: { color: "#7a6f5d", fontSize: 14, marginTop: 6 },
  input: {
    backgroundColor: "#fffdf7",
    borderColor: "#e6dcc6",
    borderWidth: 1,
    borderRadius: 12,
    color: "#2b2118",
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
  },
  error: { color: "#c0392b", fontSize: 14 },
  button: {
    backgroundColor: "#f0a830",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 6,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#2b2118", fontSize: 16, fontWeight: "600" },
  hint: { color: "#7a6f5d", textAlign: "center", fontSize: 14 },
});