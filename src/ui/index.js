import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { theme, radius, space, shadow, textStyles } from "./theme";

export const ScreenPad = ({ children, style }) => (
  <View style={[{ padding: space.lg }, style]}>{children}</View>
);

export const Card = ({ children, style }) => (
  <View style={[{ backgroundColor: theme.cardBg, borderRadius: radius.lg, padding: space.lg }, shadow.card, style]}>
    {children}
  </View>
);

export const Title = ({ children, size="h2", style }) => (
  <Text style={[textStyles[size], style]}>{children}</Text>
);

export const Label = ({ children, style }) => (
  <Text style={[textStyles.label, { marginTop: space.sm, marginBottom: space.sm }, style]}>{children}</Text>
);

export const Input = ({ style, ...rest }) => (
  <TextInput
    {...rest}
    style={[
      {
        backgroundColor: "rgba(17,37,93,0.08)",
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: radius.md,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: theme.text,
      },
      style,
    ]}
    placeholderTextColor="#9aa6b2"
  />
);

export const Button = ({ children, onPress, variant="primary", disabled }) => {
  const variants = {
    primary: {
      base: { backgroundColor: "#111827" },
      text: { color: "#fff" },
    },
    accent: {
      base: { backgroundColor: theme.accent },
      text: { color: "#111827" },
    },
    ghost: {
      base: { backgroundColor: "#fff", borderWidth:1, borderColor: "#d1d5db" },
      text: { color: "#111827" },
    },
  };
  const v = variants[variant] || variants.primary;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[{ marginTop: space.md, borderRadius: radius.md, paddingVertical: 12, alignItems: "center" }, v.base]}
    >
      <Text style={[{ fontWeight: "700" }, v.text]}>{children}</Text>
    </TouchableOpacity>
  );
};

export const Chip = ({ text, active, onPress, style }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      { flexDirection:"row", alignItems:"center", gap:8, paddingHorizontal:12, paddingVertical:8, borderRadius: radius.pill, borderWidth:1, borderColor: theme.border, backgroundColor: theme.muted },
      active && { backgroundColor: theme.accent, borderColor: theme.accent },
      style
    ]}
  >
    <Text style={[{ fontWeight:"700", color: "#111827" }, active && { color:"#111827" }]}>{text}</Text>
  </TouchableOpacity>
);

export const Row = ({ children, style }) => (
  <View style={[{ backgroundColor:"#fff", borderRadius: radius.md, padding: 12, flexDirection:"row", alignItems:"center", gap:12 }, shadow.micro, style]}>
    {children}
  </View>
);

export const IconBubble = ({ children, size=36 }) => (
  <View style={{ width:size, height:size, borderRadius:size/2, backgroundColor:"#e5e7eb", alignItems:"center", justifyContent:"center" }}>
    {children}
  </View>
);

export const ProgressBar = ({ value=0 }) => (
  <View style={{ height: 14, backgroundColor: "#e5e7eb", borderRadius: 999, overflow: "hidden" }}>
    <View style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: theme.accent, height: "100%" }} />
  </View>
);

export const Divider = () => <View style={{ height:1, backgroundColor: theme.border, marginVertical: space.md }} />;
