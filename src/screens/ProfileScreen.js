import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

const K_NAME = "demo.profile.name";
const K_CURR = "demo.profile.currency";
const K_BUDG = "demo.profile.monthlyBudget";
const K_AVATAR = "demo.profile.avatarUri";

export default function ProfileScreen() {
  const [name, setName] = useState("");
  const [email] = useState("demo@user.app"); // demo value (auth off)
  const [currency, setCurrency] = useState("USD");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [avatarUri, setAvatarUri] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const [n, c, b, a] = await Promise.all([
          AsyncStorage.getItem(K_NAME),
          AsyncStorage.getItem(K_CURR),
          AsyncStorage.getItem(K_BUDG),
          AsyncStorage.getItem(K_AVATAR),
        ]);
        if (!live) return;
        if (n) setName(n);
        if (c) setCurrency(c);
        if (b) setMonthlyBudget(b);
        if (a) setAvatarUri(a);
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => { live = false; };
  }, []);

  const pickAvatar = async () => {
    // Ask for permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow photo access to change your avatar.");
      return;
    }

    // Open gallery
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,         // enables square crop UI
      aspect: [1, 1],              // 1:1
      quality: 0.8,
    });
    if (res.canceled) return;

    try {
      setAvatarBusy(true);
      const asset = res.assets[0];

      // Copy the image into the app's private storage so it persists
      const target = FileSystem.documentDirectory + "avatar.jpg";
      await FileSystem.copyAsync({ from: asset.uri, to: target });

      // Save + update UI
      await AsyncStorage.setItem(K_AVATAR, target);
      setAvatarUri(target);
    } catch (e) {
      console.log(e);
      Alert.alert("Upload failed", "Could not save your photo. Try another image.");
    } finally {
      setAvatarBusy(false);
    }
  };

  const removeAvatar = async () => {
    try {
      setAvatarBusy(true);
      if (avatarUri) {
        // Best-effort delete (it’s okay if it fails)
        try { await FileSystem.deleteAsync(avatarUri, { idempotent: true }); } catch {}
      }
      await AsyncStorage.removeItem(K_AVATAR);
      setAvatarUri(null);
    } finally {
      setAvatarBusy(false);
    }
  };

  const save = async () => {
    if (!name.trim()) return Alert.alert("Required", "Please enter your name.");
    const n = Number(monthlyBudget);
    if (Number.isNaN(n) || n < 0) return Alert.alert("Invalid budget", "Enter a number \u2265 0.");
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
            {/* Avatar */}
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <View style={[avatarBox, avatarUri && { padding: 0, borderWidth: 0 }]}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={{ width: 96, height: 96, borderRadius: 48 }} />
                ) : (
                  <Text style={{ fontSize: 32, fontWeight: "800", color: "#11255D" }}>
                    {name?.[0]?.toUpperCase() || "U"}
                  </Text>
                )}
              </View>

              <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                <TouchableOpacity onPress={pickAvatar} disabled={avatarBusy} style={smallBtnPrimary}>
                  {avatarBusy ? <ActivityIndicator color="#fff" /> : <Text style={smallBtnPrimaryText}>Change Photo</Text>}
                </TouchableOpacity>
                {avatarUri ? (
                  <TouchableOpacity onPress={removeAvatar} disabled={avatarBusy} style={smallBtnGhost}>
                    <Text style={smallBtnGhostText}>Remove</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {/* Fields */}
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

            <TouchableOpacity onPress={save} style={primaryBtn} activeOpacity={0.85} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={primaryText}>Save Changes</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={logout} style={secondaryBtn} activeOpacity={0.85}>
              <Text style={secondaryText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// --- simple styles to match your vibe ---
const card = { backgroundColor: "rgba(255,255,255,0.95)", borderRadius: 16, padding: 16, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 };

const avatarBox = {
  width: 96, height: 96, borderRadius: 48,
  backgroundColor: "#fff",
  alignItems: "center", justifyContent: "center",
  borderWidth: 1, borderColor: "#e5e7eb", padding: 0,
};

const label = { marginTop: 6, marginBottom: 6, fontWeight: "600", color: "#111827" };

const input = {
  backgroundColor: "rgba(17,37,93,0.08)",
  borderWidth: 1,
  borderColor: "#cfd8e3",
  borderRadius: 12,
  paddingHorizontal: 12,
  paddingVertical: 10,
  color: "#111827",
};

const primaryBtn = { marginTop: 12, backgroundColor: "#111827", borderRadius: 14, paddingVertical: 12, alignItems: "center" };
const primaryText = { color: "#fff", fontWeight: "700" };

const secondaryBtn = { marginTop: 10, backgroundColor: "#fff", borderWidth: 1, borderColor: "#d1d5db", borderRadius: 14, paddingVertical: 12, alignItems: "center" };
const secondaryText = { color: "#111827", fontWeight: "700" };

const smallBtnPrimary = { backgroundColor: "#111827", borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14, alignItems: "center" };
const smallBtnPrimaryText = { color: "#fff", fontWeight: "700", fontSize: 13 };
const smallBtnGhost = { backgroundColor: "#fff", borderColor: "#d1d5db", borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14, alignItems: "center" };
const smallBtnGhostText = { color: "#111827", fontWeight: "700", fontSize: 13 };
