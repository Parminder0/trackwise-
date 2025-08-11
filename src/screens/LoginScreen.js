import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../context/AuthContext";

function mapAuthError(e) {
  const code = String(e?.code || "").replace("auth/", "");
  switch (code) {
    case "invalid-api-key": return "Firebase apiKey is wrong. Check src/firebase.js.";
    case "operation-not-allowed": return "Enable Email/Password in Firebase → Authentication → Sign-in method.";
    case "user-not-found": return "No account with this email. Switch to Sign Up.";
    case "wrong-password": return "Incorrect password.";
    case "invalid-email": return "Invalid email format.";
    case "network-request-failed": return "Network error. Try: npx expo start --tunnel";
    case "configuration-not-found": return "Incorrect Firebase Web config. Ensure appId contains :web: and authDomain matches your project.";
    default: return `Auth error: ${code || "unknown"}.`;
  }
}

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [uiError, setUiError] = useState("");

  const go = async () => {
    setUiError("");
    if (!email) return setUiError("Please enter your email.");
    if (!password) return setUiError("Please enter your password.");
    try {
      setBusy(true);
      if (mode === "login") await signIn(email.trim(), password);
      else await signUp(email.trim(), password);
    } catch (e) {
      setUiError(mapAuthError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <LinearGradient colors={["#6EA0D6", "#BFD0EA"]} style={{ flex: 1, justifyContent:"center", padding:16 }}>
      <View style={{ backgroundColor:"#fff", borderRadius:16, padding:16, shadowColor:"#000", shadowOpacity:0.12, shadowRadius:8, shadowOffset:{width:0,height:3}, elevation:4 }}>
        <Text style={{ fontSize:24, fontWeight:"800", textAlign:"center", marginBottom:12 }}>
          {mode === "login" ? "Log In" : "Create Account"}
        </Text>

        {uiError ? (
          <View style={{ backgroundColor:"#fee2e2", borderColor:"#fecaca", borderWidth:1, borderRadius:12, padding:10, marginBottom:10 }}>
            <Text style={{ color:"#7f1d1d", fontWeight:"700" }}>Heads up:</Text>
            <Text style={{ color:"#7f1d1d", marginTop:2 }}>{uiError}</Text>
          </View>
        ) : null}

        <Text style={{ fontWeight:"600", marginBottom:6 }}>Email</Text>
        <TextInput style={input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" placeholderTextColor="#9aa6b2" />

        <Text style={{ fontWeight:"600", marginTop:8, marginBottom:6 }}>Password</Text>
        <TextInput style={input} value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" placeholderTextColor="#9aa6b2" />

        <TouchableOpacity onPress={go} disabled={busy} style={primaryBtn}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={primaryText}>{mode==="login"?"Log In":"Sign Up"}</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { setMode(mode==="login"?"signup":"login"); setUiError(""); }} style={secondaryBtn}>
          <Text style={{ fontWeight:"700" }}>{mode==="login"?"No account? Sign up":"Have an account? Log in"}</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const input = { backgroundColor:"#f3f4f6", borderWidth:1, borderColor:"#e5e7eb", borderRadius:12, paddingHorizontal:12, paddingVertical:10, color:"#111827" };
const primaryBtn = { marginTop:12, backgroundColor:"#111827", borderRadius:14, paddingVertical:12, alignItems:"center" };
const primaryText = { color:"#fff", fontWeight:"700" };
const secondaryBtn = { marginTop:10, backgroundColor:"#fff", borderWidth:1, borderColor:"#d1d5db", borderRadius:14, paddingVertical:12, alignItems:"center" };
