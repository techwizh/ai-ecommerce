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

const CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Sports",
  "Beauty",
  "Books & Stationery",
];

export default function SellerProductForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const editing = !!id;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // When editing, load the product into the form
  useEffect(() => {
    if (!id) return;
    api
      .get(`/products/${id}`)
      .then(({ data }) => {
        const p = data.product;
        setName(p.name);
        setDescription(p.description);
        setPrice(String(p.price));
        setStock(String(p.stock));
        setCategory(p.category);
        setImage(p.image);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const goBack = () =>
    router.canGoBack() ? router.back() : router.replace("/seller");

  const save = async () => {
    setError("");
    if (!name.trim() || !description.trim() || !category || !price || !stock) {
      return setError("Please fill in name, description, category, price and stock");
    }

    const body = { name, description, category, price, stock, image };
    setSaving(true);
    try {
      if (editing) await api.put(`/seller/products/${id}`, body);
      else await api.post("/seller/products", body);
      goBack();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
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

        {loading ? (
          <ActivityIndicator color="#f0a830" style={styles.center} />
        ) : (
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>{editing ? "Edit product" : "Add product"}</Text>

            <TextInput
              style={styles.input}
              placeholder="Product name"
              placeholderTextColor="#a39a88"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Description"
              placeholderTextColor="#a39a88"
              multiline
              value={description}
              onChangeText={setDescription}
            />

            <Text style={styles.label}>Category</Text>
            <View style={styles.chips}>
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c}
                  style={[styles.chip, category === c && styles.chipActive]}
                  onPress={() => setCategory(c)}
                >
                  <Text style={[styles.chipText, category === c && styles.chipTextActive]}>
                    {c}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.twoCols}>
              <TextInput
                style={[styles.input, styles.half]}
                placeholder="Price (KSh)"
                placeholderTextColor="#a39a88"
                keyboardType="numeric"
                value={price}
                onChangeText={(t) => setPrice(t.replace(/[^0-9.]/g, ""))}
              />
              <TextInput
                style={[styles.input, styles.half]}
                placeholder="Stock"
                placeholderTextColor="#a39a88"
                keyboardType="number-pad"
                value={stock}
                onChangeText={(t) => setStock(t.replace(/\D/g, ""))}
              />
            </View>

            <TextInput
              style={styles.input}
              placeholder="Image link (optional)"
              placeholderTextColor="#a39a88"
              autoCapitalize="none"
              value={image}
              onChangeText={setImage}
            />
            <Text style={styles.hint}>
              Paste a link to a photo that starts with http. If you leave it empty,
              a placeholder picture is used.
            </Text>

            {!!error && <Text style={styles.error}>{error}</Text>}

            <Pressable
              style={[styles.button, saving && styles.buttonDisabled]}
              onPress={save}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#2b2118" />
              ) : (
                <Text style={styles.buttonText}>
                  {editing ? "Save changes" : "Add product"}
                </Text>
              )}
            </Pressable>
          </ScrollView>
        )}
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
  center: { marginTop: 40 },
  content: { gap: 12, paddingBottom: 40 },
  title: { color: "#2b2118", fontSize: 24, fontWeight: "700" },
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
  multiline: { minHeight: 96, textAlignVertical: "top" },
  label: { color: "#7a6f5d", fontSize: 14 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: "#fffdf7",
    borderColor: "#e6dcc6",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: "#f0a830", borderColor: "#f0a830" },
  chipText: { color: "#7a6f5d", fontSize: 14 },
  chipTextActive: { color: "#2b2118", fontWeight: "600" },
  twoCols: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  hint: { color: "#7a6f5d", fontSize: 12 },
  error: { color: "#c0392b", fontSize: 14 },
  button: {
    backgroundColor: "#f0a830",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 6,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#2b2118", fontSize: 16, fontWeight: "700" },
});