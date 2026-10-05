import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ProductCard from "@/components/product-card";
import { useWishlist } from "@/context/WishlistContext";

const getColumns = (width: number) => {
  if (width < 600) return 2;
  if (width < 900) return 3;
  if (width < 1200) return 4;
  return 5;
};

export default function WishlistScreen() {
  const { products, count } = useWishlist();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const columns = getColumns(width);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>Wishlist ({count})</Text>

        {products.length === 0 ? (
          <Text style={styles.message}>
            Tap the heart on a product to save it here
          </Text>
        ) : (
          <FlatList
            key={columns}
            data={products}
            keyExtractor={(item) => item._id}
            numColumns={columns}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={{ width: `${100 / columns}%`, padding: 6 }}>
                <ProductCard
                  product={item}
                  onPress={() =>
                    router.push({
                      pathname: "/product/[id]",
                      params: { id: item._id },
                    })
                  }
                />
              </View>
            )}
          />
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
    maxWidth: 1200,
    alignSelf: "center",
    paddingHorizontal: 14,
  },
  title: { color: "#fff", fontSize: 22, fontWeight: "700", paddingVertical: 14 },
  message: { color: "#9aa0ab", textAlign: "center", marginTop: 40, fontSize: 16 },
  list: { paddingBottom: 30 },
});