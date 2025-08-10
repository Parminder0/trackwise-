import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function BudgetScreen() {
  return (
    <LinearGradient colors={["#7097D1", "#BFD0EA"]} style={{ flex: 1, padding: 16 }}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 28, fontWeight: "800" }}>Budget</Text>
        <Text>Placeholder screen</Text>
      </View>
    </LinearGradient>
  );
}
