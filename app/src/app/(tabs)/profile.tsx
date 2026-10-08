import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{user?.name}</Text>
          <Text style={[styles.label, { marginTop: 14 }]}>Email</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>

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
  screen: { flex: 1, backgroundColor: "#0b0d12" },
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    paddingHorizontal: 14,
  },
  title: { color: "#fff", fontSize: 22, fontWeight: "700", paddingVertical: 14 },
  card: { backgroundColor: "#171a21", borderRadius: 16, padding: 18 },
  label: { color: "#9aa0ab", fontSize: 13 },
  value: { color: "#fff", fontSize: 17, marginTop: 2 },
  menu: {
    backgroundColor: "#171a21",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  menuText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  logout: {
    borderColor: "#ff6b6b",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  logoutText: { color: "#ff6b6b", fontSize: 16, fontWeight: "600" },
});