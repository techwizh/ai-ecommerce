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

    setSubmitting(true);
    try {
      if (isRegister) {
        await register(name.trim(), email.trim(), password);
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
              placeholderTextColor="#8b8f98"
              value={name}
              onChangeText={setName}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#8b8f98"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#8b8f98"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={submit}
          />

          {!!error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            style={[styles.button, submitting && styles.buttonDisabled]}
            onPress={submit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
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
  flex: { flex: 1, backgroundColor: "#0b0d12" },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#171a21",
    borderRadius: 20,
    padding: 24,
    gap: 14,
  },
  title: { color: "#fff", fontSize: 26, fontWeight: "700" },
  subtitle: { color: "#9aa0ab", fontSize: 15, marginBottom: 6 },
  input: {
    backgroundColor: "#0b0d12",
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
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 6 },
  footerText: { color: "#9aa0ab", fontSize: 14 },
  link: { color: "#60a5fa", fontSize: 14, fontWeight: "600" },
});