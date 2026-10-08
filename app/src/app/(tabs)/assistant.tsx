import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ProductCard from "@/components/product-card";
import { useAuth } from "@/context/AuthContext";
import api, { getErrorMessage } from "@/lib/api";
import type { ChatMessage } from "@/lib/types";

const SUGGESTIONS = [
  "Cheap electronics under 10000",
  "Best rated kitchen items",
  "Gym items",
  "Skincare under 3000",
];

export default function AssistantScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: `Hi ${user?.name?.split(" ")[0]}! I'm your shopping assistant. Tell me what you're looking for.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const scrollToEnd = () =>
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || sending) return;

    setInput("");
    setMessages((m) => [
      ...m,
      { id: `u${Date.now()}`, role: "user", text: message },
    ]);
    setSending(true);
    scrollToEnd();

    try {
      const { data } = await api.post("/assistant", { message });
      setMessages((m) => [
        ...m,
        {
          id: `a${Date.now()}`,
          role: "assistant",
          text: data.reply,
          products: data.products,
        },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { id: `e${Date.now()}`, role: "assistant", text: getErrorMessage(err) },
      ]);
    } finally {
      setSending(false);
      scrollToEnd();
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text style={styles.title}>Shopping assistant</Text>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          ListFooterComponent={
            sending ? (
              <ActivityIndicator color="#f0a830" style={styles.typing} />
            ) : null
          }
          renderItem={({ item }) => (
            <View style={item.role === "user" ? styles.rowUser : styles.rowBot}>
              <View style={item.role === "user" ? styles.bubbleUser : styles.bubbleBot}>
                <Text style={styles.bubbleText}>{item.text}</Text>
              </View>

              {!!item.products?.length && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.cards}
                >
                  {item.products.map((p) => (
                    <View key={p._id} style={styles.card}>
                      <ProductCard
                        product={p}
                        onPress={() =>
                          router.push({
                            pathname: "/product/[id]",
                            params: { id: p._id },
                          })
                        }
                      />
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
        />

        {messages.length === 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.suggestScroll}
            contentContainerStyle={styles.suggestions}
          >
            {SUGGESTIONS.map((s) => (
              <Pressable key={s} style={styles.suggestion} onPress={() => send(s)}>
                <Text style={styles.suggestionText}>{s}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ask about products..."
            placeholderTextColor="#a39a88"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => send(input)}
            returnKeyType="send"
          />
          <Pressable
            style={[styles.sendButton, (sending || !input.trim()) && styles.sendDisabled]}
            onPress={() => send(input)}
            disabled={sending || !input.trim()}
          >
            <Text style={styles.sendText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
  title: { color: "#2b2118", fontSize: 22, fontWeight: "700", paddingVertical: 14 },
  list: { gap: 12, paddingBottom: 12 },
  rowUser: { alignItems: "flex-end" },
  rowBot: { alignItems: "flex-start", gap: 8 },
  bubbleUser: {
    backgroundColor: "#f0a830",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: "85%",
  },
  bubbleBot: {
    backgroundColor: "#fffdf7",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: "85%",
  },
  bubbleText: { color: "#2b2118", fontSize: 15, lineHeight: 21 },
  cards: { gap: 12 },
  card: { width: 170 },
  typing: { alignSelf: "flex-start", marginTop: 6 },
  suggestScroll: { flexGrow: 0, marginBottom: 8 },
  suggestions: { gap: 8 },
  suggestion: {
    borderColor: "#e6dcc6",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  suggestionText: { color: "#7a6f5d", fontSize: 13 },
  inputRow: { flexDirection: "row", gap: 8, paddingVertical: 10 },
  input: {
    flex: 1,
    backgroundColor: "#fffdf7",
    borderColor: "#e6dcc6",
    borderWidth: 1,
    borderRadius: 12,
    color: "#2b2118",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#f0a830",
    borderRadius: 12,
    paddingHorizontal: 18,
    justifyContent: "center",
  },
  sendDisabled: { opacity: 0.5 },
  sendText: { color: "#2b2118", fontSize: 15, fontWeight: "600" },
});