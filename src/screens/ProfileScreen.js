import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const K_NAME = "demo.profile.name";
const K_CURR = "demo.profile.currency";
const K_BUDG = "demo.profile.monthlyBudget";

export default function ProfileScreen() {
  const [name, setName] = useState("");
  const [email] = useState("demo@user.app"); // read-only demo value
  const [currency, setCurrency] = useState("USD");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const [n, c, b] = await Promise.all([
          AsyncStorage.getItem(K_NAME),
          AsyncStorage.getItem(K_CURR),
          AsyncStorage.getItem(K_BUDG),
        ]);
        if (!live) return;
        if (n) setName(n);
        if (c) setCurrency(c);
        if (b) setMonthlyBudget(b);
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => { live = false; };
  }, []);

  const save = async () => {
    if (!name.trim()) return Alert.alert("Required", "Please enter your name.");
    const n = Number(monthlyBudget);
    if (Number.isNaN(n) || n < 0) return Alert.alert("Invalid budget", "Enter a number ≥ 0.");
    try {
      setSaving(true);
      await Promise.all([
        AsyncStorage.setItem(K_NAME, name.trim()),
        AsyncStorage.setItem(K_CURR, currency.trim().toUpperCase()),
        AsyncStorage.setItem(K_BUDG, String(n)),
      ]);
      Alert.alert("Saved", "Profile saved locally (Demo Mode).");
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    Alert.alert("Demo Mode", "Authentication is disabled right now, so Logout does nothing. We’ll enable it later.");
  };

  if (loading) {
    return (
      <LinearGradient colors={["#7097D1", "#BFD0EA"]} style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#7097D1", "#BFD0EA"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View style={card}>
            {/* Avatar placeholder (initials) */}
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <View style={avatar}>
                <Text style={{ fontSize: 32, fontWeight: "800", color: "#11255D" }}>
                  {name?.[0]?.toUpperCase() || "U"}
                </Text>
              </View>
              <Text style={{ marginTop: 8, fontWeight: "600" }}>Avatar (initials)</Text>
            </View>

            <Text style={label}>Full Name</Text>
            <TextInput
              style={input}
              placeholder="Your name"
              placeholderTextColor="#9aa6b2"
              value={name}
              onChangeText={setName}
            />

            <Text style={label}>Email (read-only)</Text>
            <TextInput style={[input, { opacity: 0.7 }]} value={email} editable={false} />

            <Text style={label}>Currency</Text>
            <TextInput
              style={input}
              value={currency}
              onChangeText={(t) => setCurrency(t.toUpperCase())}
              placeholder="USD"
              placeholderTextColor="#9aa6b2"
              autoCapitalize="characters"
            />

            <Text style={label}>Monthly Budget</Text>
            <TextInput
              style={input}
              value={monthlyBudget}
              onChangeText={setMonthlyBudget}
              keyboardType="numeric"
              placeholder="e.g., 2000"
              placeholderTextColor="#9aa6b2"
            />

            <TouchableOpacity onPress={save} style={primaryBtn} activeOpacity={0.8} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={primaryText}>Save Changes</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={logout} style={secondaryBtn} activeOpacity={0.8}>
              <Text style={secondaryText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const card = { backgroundColor: "rgba(255,255,255,0.95)", borderRadius: 16, padding: 16, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 };
const avatar = { width: 96, height: 96, borderRadius: 48, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#e5e7eb" };
const label = { marginTop: 6, marginBottom: 6, fontWeight: "600", color: "#111827" };
const input = { backgroundColor: "rgba(17,37,93,0.08)", borderWidth: 1, borderColor: "#cfd8e3", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: "#111827" };
const primaryBtn = { marginTop: 12, backgroundColor: "#111827", borderRadius: 14, paddingVertical: 12, alignItems: "center" };
const primaryText = { color: "#fff", fontWeight: "700" };
const secondaryBtn = { marginTop: 10, backgroundColor: "#fff", borderWidth: 1, borderColor: "#d1d5db", borderRadius: 14, paddingVertical: 12, alignItems: "center" };
const secondaryText = { color: "#111827", fontWeight: "700" };
