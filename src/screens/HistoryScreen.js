import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { getTransactions, deleteTransaction, formatMoney, getCurrency } from "../utils/storage";

export default function HistoryScreen() {
  const [txns, setTxns] = useState([]);
  const [filter, setFilter] = useState("all"); // all | income | expense
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    let live = true;
    (async () => {
      const [cur, list] = await Promise.all([getCurrency(), getTransactions()]);
      if (!live) return;
      setCurrency(cur);
      setTxns(list);
    })();
    return () => { live = false; };
  }, []);

  const filtered = useMemo(() => {
    if (filter==="all") return txns;
    return txns.filter(t => t.type === filter);
  }, [txns, filter]);

  const remove = async (id) => {
    const next = await deleteTransaction(id);
    setTxns(next);
  };

  return (
    <LinearGradient colors={["#7097D1", "#BFD0EA"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding:16 }}>
        {/* Filters */}
        <View style={{ flexDirection:"row", gap:8, marginBottom:12 }}>
          <Chip text="All"     active={filter==="all"}     onPress={()=>setFilter("all")} />
          <Chip text="Income"  active={filter==="income"}  onPress={()=>setFilter("income")} />
          <Chip text="Expense" active={filter==="expense"} onPress={()=>setFilter("expense")} />
        </View>

        {filtered.length === 0 ? (
          <Text style={{ opacity:0.7 }}>No transactions to show.</Text>
        ) : filtered.map(t => (
          <View key={t.id} style={row}>
            <View style={iconCircle}>
              <Ionicons name={t.type==="income" ? "arrow-down-circle-outline" : "arrow-up-circle-outline"} size={18} />
            </View>
            <View style={{ flex:1 }}>
              <Text style={{ fontWeight:"700" }}>{t.label}</Text>
              <Text style={{ opacity:0.6, fontSize:12 }}>{new Date(t.dateISO).toLocaleString()} • {t.category}</Text>
            </View>
            <Text style={{ fontWeight:"800", color: t.type==="income" ? "#065f46" : "#7f1d1d", marginRight:10 }}>
              {t.type==="income" ? "+" : "-"}{formatMoney(t.amount, currency)}
            </Text>
            <TouchableOpacity onPress={()=>Alert.alert("Delete","Remove this item?",[
              { text:"Cancel", style:"cancel" },
              { text:"Delete", style:"destructive", onPress:()=>remove(t.id) }
            ])}>
              <Ionicons name="trash-outline" size={20} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

function Chip({ text, active, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={[chip, active && chipActive]}>
      <Text style={[chipText, active && { color:"#fff" }]}>{text}</Text>
    </TouchableOpacity>
  );
}

const chip = { backgroundColor:"#f3f4f6", borderWidth:1, borderColor:"#e5e7eb", paddingHorizontal:12, paddingVertical:8, borderRadius:999 };
const chipActive = { backgroundColor:"#111827", borderColor:"#111827" };
const chipText = { color:"#111827", fontWeight:"700" };
const row = { backgroundColor:"#fff", borderRadius:12, padding:12, flexDirection:"row", alignItems:"center", gap:12, marginBottom:8, shadowColor:"#000", shadowOpacity:0.04, shadowRadius:4, shadowOffset:{width:0,height:1}, elevation:1 };
const iconCircle = { width:32, height:32, borderRadius:16, backgroundColor:"#e5e7eb", alignItems:"center", justifyContent:"center" };
