import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function UnauthScreen({ navigation }) {
  return (
    <LinearGradient colors={["#6EA0D6", "#BFD0EA"]} style={{ flex: 1, alignItems:"center", justifyContent:"center", padding:16 }}>
      <Text style={{ fontSize:24, fontWeight:"800", textAlign:"center" }}>Sign in required</Text>
      <Text style={{ opacity:0.8, textAlign:"center", marginTop:8, marginBottom:16 }}>
        You need to log in to access Trackwise.
      </Text>
      <TouchableOpacity
        onPress={()=>navigation.replace("Login")}
        style={{ backgroundColor:"#111827", paddingVertical:12, paddingHorizontal:18, borderRadius:12 }}
      >
        <Text style={{ color:"#fff", fontWeight:"800" }}>Go to Login</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}
