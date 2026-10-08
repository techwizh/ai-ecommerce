import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api";

type Props = { mode: "login" | "register" };

export default function AuthForm({ mode }: Props) {
  const isRegister = mode === "register";
  const { login, register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isBusiness, setIsBusiness] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setError("");

    if (isRegister && !name.trim()) return setError("Please enter your name");
    if (!email.trim() || !password) {
      return setError("Please enter your email and password");
    }
    if (isRegister && password.length < 6) {
      return setError("Password must be at least 6 characters");
    }
    if (isRegister && isBusiness && !businessName.trim()) {
      return setError("Please enter your business name");
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        await register(
          name.trim(),
          email.trim(),
          password,
          isBusiness ? { businessName: businessName.trim() } : undefined
        );
      } else {
        await login(email.trim(), password);
      }
      router.replace("/");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>
            {isRegister ? "Create account" : "Welcome back"}
          </Text>
          <Text style={styles.subtitle}>
            {isRegister
              ? "Sign up to start shopping"
              : "Log in to continue shopping"}
          </Text>

          {isRegister && (
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor="#a39a88"
              value={name}
              onChangeText={setName}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#a39a88"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#a39a88"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={submit}
          />

          {isRegister && (
            <>
              <Pressable
                style={styles.toggleRow}
                onPress={() => setIsBusiness((v) => !v)}
              >
                <View style={[styles.box, isBusiness && styles.boxOn]}>
                  {isBusiness && <Text style={styles.tick}>✓</Text>}
                </View>
                <Text style={styles.toggleText}>
                  I own a business and want to sell
                </Text>
              </Pressable>
              {isBusiness && (
                <TextInput
                  style={styles.input}
                  placeholder="Business name"
                  placeholderTextColor="#a39a88"
                  value={businessName}
                  onChangeText={setBusinessName}
                />
              )}
            </>
          )}

          {!!error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            style={[styles.button, submitting && styles.buttonDisabled]}
            onPress={submit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#2b2118" />
            ) : (
              <Text style={styles.buttonText}>
                {isRegister ? "Sign up" : "Log in"}
              </Text>
            )}
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {isRegister ? "Already have an account? " : "New here? "}
            </Text>
            <Link href={isRegister ? "/login" : "/register"} replace>
              <Text style={styles.link}>
                {isRegister ? "Log in" : "Create an account"}
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#f7f1e3" },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fffdf7",
    borderRadius: 20,
    padding: 24,
    gap: 14,
  },
  title: { color: "#2b2118", fontSize: 26, fontWeight: "700" },
  subtitle: { color: "#7a6f5d", fontSize: 15, marginBottom: 6 },
  input: {
    backgroundColor: "#f7f1e3",
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
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#2b2118", fontSize: 16, fontWeight: "700" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 6 },
  footerText: { color: "#7a6f5d", fontSize: 14 },
  link: { color: "#b45309", fontSize: 14, fontWeight: "600" },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e6dcc6",
    alignItems: "center",
    justifyContent: "center",
  },
  boxOn: { backgroundColor: "#f0a830", borderColor: "#f0a830" },
  tick: { color: "#2b2118", fontSize: 14, fontWeight: "700" },
  toggleText: { color: "#7a6f5d", fontSize: 14 },
});