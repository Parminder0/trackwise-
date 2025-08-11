import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Alert, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { subTransactions, deleteTransaction, subUserDoc } from "../services/data";
import { theme } from "../ui/theme";

function formatMoney(n, currency) {
  try { return new Intl.NumberFormat("en-US",{ style:"currency", currency }).format(n); }
  catch { return `${currency} ${Number(n||0).toFixed(2)}`; }
}

export default function HistoryScreen() {
  const { user } = useAuth();
  const [txns, setTxns] = useState([]);
  const [filter, setFilter] = useState("all");
  const [currency, setCurrency] = useState("USD");
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const off1 = subTransactions(user.uid, setTxns);
    const off2 = subUserDoc(user.uid, (d)=> setCurrency((d && d.currency) || "USD"));
    return () => { off1 && off1(); off2 && off2(); };
  }, []);

  const filtered = useMemo(() => filter==="all" ? txns : txns.filter(t=>t.type===filter), [txns, filter]);

  const remove = async (id) => { await deleteTransaction(user.uid, id); };

  return (
    <LinearGradient colors={theme.gradient} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal:16, paddingBottom:28 }}>
        <View style={{ flexDirection:"row", gap:8, marginBottom:12 }}>
          <Chip text="All" active={filter==="all"} onPress={()=>setFilter("all")} />
          <Chip text="Income" active={filter==="income"} onPress={()=>setFilter("income")} />
          <Chip text="Expense" active={filter==="expense"} onPress={()=>setFilter("expense")} />
        </View>

        {filtered.length === 0 ? (
          <Text style={{ opacity:0.7 }}>No transactions to show.</Text>
        ) : filtered.map(t => (
          <View key={t.id} style={row}>
            <View style={icon}><Ionicons name={t.type==="income" ? "arrow-down-circle-outline" : "arrow-up-circle-outline"} size={18} /></View>
            <View style={{ flex:1 }}>
              <Text style={{ fontWeight:"700" }}>{t.label}</Text>
              <Text style={{ opacity:0.6, fontSize:12 }}>{new Date(t.dateISO).toLocaleString()} • {t.category}</Text>
            </View>
            <Text style={{ fontWeight:"800", color: t.type==="income" ? theme.success : theme.danger, marginRight:10 }}>
              {t.type==="income" ? "+" : "-"}{formatMoney(t.amount, currency)}
            </Text>
            <TouchableOpacity onPress={() => Alert.alert("Delete","Remove this item?",[
              { text:"Cancel", style:"cancel" },
              { text:"Delete", style:"destructive", onPress:()=>remove(t.id) }
            ])}><Ionicons name="trash-outline" size={20} /></TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

function Chip({ text, active, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={[chip, active && chipActive]}>
      <Text style={[{ fontWeight:"700", color:"#111827" }, active && { color:"#111827" }]}>{text}</Text>
    </TouchableOpacity>
  );
}
const chip = { backgroundColor:"#f3f4f6", borderWidth:1, borderColor:"#e5e7eb", paddingHorizontal:12, paddingVertical:8, borderRadius:999 };
const chipActive = { backgroundColor:theme.accent, borderColor:theme.accent };
const row = { backgroundColor:"#fff", borderRadius:14, padding:12, flexDirection:"row", alignItems:"center", gap:12, marginBottom:8, shadowColor:"#000", shadowOpacity:0.04, shadowRadius:6, shadowOffset:{width:0,height:2}, elevation:1 };
const icon = { width:32, height:32, borderRadius:16, backgroundColor:"#e5e7eb", alignItems:"center", justifyContent:"center" };
