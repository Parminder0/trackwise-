import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const go = async () => {
    if (!email || !password) return Alert.alert("Missing", "Email and password are required.");
    try {
      setBusy(true);
      if (mode === "login") {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
        Alert.alert("Account created", "You are logged in.");
      }
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <LinearGradient colors={["#7097D1", "#BFD0EA"]} style={{ flex: 1, padding: 16, justifyContent: "center" }}>
      <View style={card}>
        <Text style={{ fontSize: 24, fontWeight: "800", textAlign: "center", marginBottom: 12 }}>
          {mode === "login" ? "Log In" : "Create Account"}
        </Text>

        <Text style={label}>Email</Text>
        <TextInput
          style={input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="you@example.com"
          placeholderTextColor="#9aa6b2"
        />

        <Text style={label}>Password</Text>
        <TextInput
          style={input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor="#9aa6b2"
        />

        <TouchableOpacity onPress={go} style={primaryBtn} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={primaryText}>{mode === "login" ? "Log In" : "Sign Up"}</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMode(mode === "login" ? "signup" : "login")} style={secondaryBtn}>
          <Text style={secondaryText}>{mode === "login" ? "No account? Sign up" : "Have an account? Log in"}</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const card = { backgroundColor: "rgba(255,255,255,0.95)", borderRadius: 16, padding: 16, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 };
const label = { marginTop: 6, marginBottom: 6, fontWeight: "600", color: "#111827" };
const input = { backgroundColor: "rgba(17,37,93,0.08)", borderWidth: 1, borderColor: "#cfd8e3", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: "#111827" };
const primaryBtn = { marginTop: 12, backgroundColor: "#111827", borderRadius: 14, paddingVertical: 12, alignItems: "center" };
const primaryText = { color: "#fff", fontWeight: "700" };
const secondaryBtn = { marginTop: 10, backgroundColor: "#fff", borderWidth: 1, borderColor: "#d1d5db", borderRadius: 14, paddingVertical: 12, alignItems: "center" };
const secondaryText = { color: "#111827", fontWeight: "700" };
