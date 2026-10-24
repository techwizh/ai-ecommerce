import {
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
  Roboto_900Black,
} from "@expo-google-fonts/roboto";
import React from "react";
import { StyleSheet, Text, TextProps } from "react-native";

export const ROBOTO_FONTS = {
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
  Roboto_900Black,
};

const familyFor = (weight?: string | number) => {
  const w = String(weight ?? "400");
  if (w === "800" || w === "900") return "Roboto_900Black";
  if (w === "700" || w === "bold") return "Roboto_700Bold";
  if (w === "600" || w === "500") return "Roboto_500Medium";
  return "Roboto_400Regular";
};

export default function AppText({ style, ...props }: TextProps) {
  const flat = StyleSheet.flatten(style) || {};
  return (
    <Text
      {...props}
      style={[style, { fontFamily: familyFor(flat.fontWeight), fontWeight: "normal" }]}
    />
  );
}