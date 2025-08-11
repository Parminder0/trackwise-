import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { subUserDoc, saveProfile } from "../services/data";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { theme } from "../ui/theme";

const K_AVATAR = "demo.profile.avatarUri";

export default function ProfileScreen() {
  const { user, setDisplayName, signOutUser } = useAuth();
  const [avatarUri, setAvatarUri] = useState(null);

  const [displayName, setDN] = useState("");
  const [email, setEmail] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [monthlyBudget, setMonthlyBudget] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const off = subUserDoc(user.uid, async (d) => {
      setEmail(user.email || "");
      setDN(d?.displayName || user.displayName || "");
      setCurrency(d?.currency || "USD");
      setMonthlyBudget(String(d?.monthlyBudget ?? ""));
      const a = await AsyncStorage.getItem(K_AVATAR);
      setAvatarUri(a || null);
      setLoading(false);
    });
    return () => { off && off(); };
  }, []);

  async function saveAvatarWithUri(uri){
    const target = FileSystem.documentDirectory + "avatar.jpg";
    await FileSystem.copyAsync({ from: uri, to: target });
    await AsyncStorage.setItem(K_AVATAR, target);
    setAvatarUri(target);
  }

  const chooseSource = () => {
    Alert.alert("Update Photo", "Pick a source", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Library", onPress: pickFromLibrary },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return Alert.alert("Permission needed","Allow photo access to change your avatar.");
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing:true, aspect:[1,1], quality:0.85 });
    if (res.canceled) return;
    try { setAvatarBusy(true); await saveAvatarWithUri(res.assets[0].uri); } finally { setAvatarBusy(false); }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return Alert.alert("Permission needed","Allow camera access to take a photo.");
    const res = await ImagePicker.launchCameraAsync({ allowsEditing:true, aspect:[1,1], quality:0.85 });
    if (res.canceled) return;
    try { setAvatarBusy(true); await saveAvatarWithUri(res.assets[0].uri); } finally { setAvatarBusy(false); }
  };

  const removeAvatar = async () => {
    try {
      setAvatarBusy(true);
      if (avatarUri) { try { await FileSystem.deleteAsync(avatarUri, { idempotent:true }); } catch {} }
      await AsyncStorage.removeItem(K_AVATAR);
      setAvatarUri(null);
    } finally { setAvatarBusy(false); }
  };

  const save = async () => {
    if (!displayName.trim()) return Alert.alert("Required","Please enter your name.");
    const n = Number(monthlyBudget);
    if (Number.isNaN(n) || n < 0) return Alert.alert("Invalid budget","Enter a number ≥ 0.");
    try {
      setSaving(true);
      await setDisplayName(displayName.trim());
      await saveProfile(user.uid, { displayName: displayName.trim(), currency: currency.trim().toUpperCase(), monthlyBudget: n });
      Alert.alert("Saved","Profile updated.");
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally { setSaving(false); }
  };

  if (loading) {
    return <LinearGradient colors={theme.gradient} style={{ flex:1, alignItems:"center", justifyContent:"center" }}><ActivityIndicator size="large" /></LinearGradient>;
  }

  return (
    <LinearGradient colors={theme.gradient} style={{ flex:1 }}>
      <KeyboardAvoidingView behavior={Platform.OS==="ios"?"padding":"height"} style={{ flex:1 }}>
        <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal:16, paddingBottom:28 }}>
          <View style={card}>
            {/* Avatar */}
            <View style={{ alignItems:"center", marginBottom:16 }}>
              <TouchableOpacity onPress={chooseSource} activeOpacity={0.9}>
                <View style={[avatarBox, avatarUri && { padding:0, borderWidth:0 }]}>
                  {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={{ width:96, height:96, borderRadius:48 }} />
                  ) : (
                    <Text style={{ fontSize:32, fontWeight:"800", color:"#11255D" }}>
                      {displayName?.[0]?.toUpperCase() || "U"}
                    </Text>
                  )}
                  {/* edit badge */}
                  <View style={editBadge}>
                    <Ionicons name="camera" size={14} color="#111827" />
                    <Text style={{ marginLeft:6, fontSize:12, fontWeight:"800", color:"#111827" }}>Edit</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <View style={{ flexDirection:"row", gap:10, marginTop:10 }}>
                {avatarUri ? (
                  <TouchableOpacity onPress={removeAvatar} disabled={avatarBusy} style={smallBtnGhost}>
                    <Text style={smallBtnGhostText}>{avatarBusy ? "..." : "Remove"}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {/* Fields */}
            <Label>Full Name</Label>
            <TextInput style={input} placeholder="Your name" placeholderTextColor="#9aa6b2" value={displayName} onChangeText={setDN} />

            <Label>Email (read-only)</Label>
            <TextInput style={[input,{ opacity:0.7 }]} value={email} editable={false} />

            <Label>Currency</Label>
            <TextInput style={input} value={currency} onChangeText={(t)=>setCurrency(t.toUpperCase())} placeholder="USD" placeholderTextColor="#9aa6b2" autoCapitalize="characters" />

            <Label>Monthly Budget</Label>
            <TextInput style={input} value={monthlyBudget} onChangeText={setMonthlyBudget} keyboardType="numeric" placeholder="e.g., 2000" placeholderTextColor="#9aa6b2" />

            <TouchableOpacity onPress={save} style={primaryBtn} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={primaryText}>Save Changes</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={signOutUser} style={secondaryBtn}>
              <Text style={secondaryText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const Label = (p)=> <Text style={{ marginTop:6, marginBottom:6, fontWeight:"600", color:"#111827" }}>{p.children}</Text>;
const card = { backgroundColor:"rgba(255,255,255,0.96)", borderRadius:18, padding:16, shadowColor:"#000", shadowOpacity:0.15, shadowRadius:10, shadowOffset:{width:0,height:4}, elevation:4 };
const avatarBox = { width:96, height:96, borderRadius:48, backgroundColor:"#fff", alignItems:"center", justifyContent:"center", borderWidth:1, borderColor:"#e5e7eb", position:"relative" };
const editBadge = { position:"absolute", right:-6, bottom:-6, backgroundColor:theme.accent, borderRadius:999, paddingHorizontal:10, paddingVertical:6, borderWidth:1, borderColor:"#fff", flexDirection:"row", alignItems:"center",
  shadowColor:"#000", shadowOpacity:0.12, shadowRadius:6, shadowOffset:{width:0,height:2} };
const input = { backgroundColor:"rgba(17,37,93,0.08)", borderWidth:1, borderColor:"#cfd8e3", borderRadius:12, paddingHorizontal:12, paddingVertical:10, color:"#111827" };
const primaryBtn = { marginTop:12, backgroundColor:"#111827", borderRadius:14, paddingVertical:12, alignItems:"center" };
const primaryText = { color:"#fff", fontWeight:"700" };
const secondaryBtn = { marginTop:10, backgroundColor:"#fff", borderWidth:1, borderColor:"#d1d5db", borderRadius:14, paddingVertical:12, alignItems:"center" };
const secondaryText = { color:"#111827", fontWeight:"700" };
const smallBtnGhost = { backgroundColor:"#fff", borderColor:"#d1d5db", borderWidth:1, borderRadius:999, paddingVertical:8, paddingHorizontal:14, alignItems:"center" };
const smallBtnGhostText = { color:"#111827", fontWeight:"700", fontSize:13 };
