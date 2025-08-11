import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const TopSafeSpacer = ({ extra=8 }) => {
  const insets = useSafeAreaInsets();
  return <View style={{ height: insets.top + extra }} />;
};
