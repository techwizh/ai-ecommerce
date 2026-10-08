import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api";

export default function ProfileScreen() {
  const { user, logout, becomeSeller } = useAuth();
  const router = useRouter();
  const isSeller = user?.role === "seller";

  const [showForm, setShowForm] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [error, setError] = useState("");

  const startSelling = async () => {
    setError("");
    if (!businessName.trim()) return setError("Enter your business name");
    try {
      await becomeSeller(businessName.trim());
      setShowForm(false);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{user?.name}</Text>
          <Text style={[styles.label, { marginTop: 14 }]}>Email</Text>
          <Text style={styles.value}>{user?.email}</Text>
          {isSeller && (
            <>
              <Text style={[styles.label, { marginTop: 14 }]}>Business</Text>
              <Text style={styles.value}>{user?.businessName}</Text>
            </>
          )}
        </View>

        {isSeller ? (
          <Pressable style={styles.sell} onPress={() => router.push("/seller")}>
            <Text style={styles.sellText}>Seller dashboard</Text>
          </Pressable>
        ) : showForm ? (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Business name"
              placeholderTextColor="#a39a88"
              value={businessName}
              onChangeText={setBusinessName}
            />
            {!!error && <Text style={styles.error}>{error}</Text>}
            <Pressable style={styles.sell} onPress={startSelling}>
              <Text style={styles.sellText}>Create seller account</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.sell} onPress={() => setShowForm(true)}>
            <Text style={styles.sellText}>Sell on this app</Text>
          </Pressable>
        )}

        <Pressable style={styles.menu} onPress={() => router.push("/insights")}>
          <Text style={styles.menuText}>My insights</Text>
        </Pressable>

        <Pressable style={styles.menu} onPress={() => router.push("/orders")}>
          <Text style={styles.menuText}>My orders</Text>
        </Pressable>

        <Pressable style={styles.logout} onPress={logout}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
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
  title: { color: "#2b2118", fontSize: 22, fontWeight: "700", paddingVertical: 14 },
  card: { backgroundColor: "#fffdf7", borderRadius: 16, padding: 18 },
  label: { color: "#7a6f5d", fontSize: 13 },
  value: { color: "#2b2118", fontSize: 17, marginTop: 2 },
  form: { gap: 10, marginTop: 12 },
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
  sell: {
    backgroundColor: "#f0a830",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  sellText: { color: "#2b2118", fontSize: 16, fontWeight: "700" },
  menu: {
    backgroundColor: "#fffdf7",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  menuText: { color: "#2b2118", fontSize: 16, fontWeight: "600" },
  logout: {
    borderColor: "#c0392b",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  logoutText: { color: "#c0392b", fontSize: 16, fontWeight: "600" },
});