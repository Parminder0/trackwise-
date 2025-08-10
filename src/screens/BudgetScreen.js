import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { getBudget, setBudget, getCurrency, addTransaction, getTransactions, formatMoney } from "../utils/storage";

export default function BudgetScreen() {
  const [currency, setCurrency] = useState("USD");
  const [budget, setBud] = useState("");
  const [saving, setSaving] = useState(false);
  const [txns, setTxns] = useState([]);
  const [quickType, setQuickType] = useState("expense"); // "income" | "expense"
  const [quickLabel, setQuickLabel] = useState("");
  const [quickAmount, setQuickAmount] = useState("");
  const [quickCategory, setQuickCategory] = useState("");

  useEffect(() => {
    let live = true;
    (async () => {
      const [cur, bud, all] = await Promise.all([getCurrency(), getBudget(), getTransactions()]);
      if (!live) return;
      setCurrency(cur);
      setBud(String(bud || ""));
      setTxns(all);
    })();
    return () => { live = false; };
  }, []);

  const saveBudget = async () => {
    const n = Number(budget);
    if (Number.isNaN(n) || n < 0) return Alert.alert("Invalid", "Enter a valid monthly budget (0 or more).");
    setSaving(true);
    await setBudget(n);
    setSaving(false);
    Alert.alert("Saved", "Monthly budget updated.");
  };

  const addQuick = async () => {
    const amt = Number(quickAmount);
    if (!quickLabel.trim()) return Alert.alert("Label required", "Give this item a name.");
    if (Number.isNaN(amt) || amt <= 0) return Alert.alert("Amount required", "Enter a number > 0.");
    const next = await addTransaction({
      type: quickType,
      label: quickLabel.trim(),
      amount: amt,
      category: quickCategory.trim() || (quickType==="income" ? "Income" : "Other"),
      dateISO: new Date().toISOString(),
    });
    setTxns(next);
    setQuickAmount("");
    setQuickLabel("");
    setQuickCategory("");
    Alert.alert("Added", "Transaction saved.");
  };

  const byCategory = useMemo(() => {
    const map = {};
    for (const t of txns) {
      if (t.type !== "expense") continue;
      map[t.category] = (map[t.category] || 0) + t.amount;
    }
    return Object.entries(map).sort((a,b)=>b[1]-a[1]);
  }, [txns]);

  return (
    <LinearGradient colors={["#7097D1", "#BFD0EA"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Budget setter */}
        <View style={card}>
          <Text style={{ fontSize: 18, fontWeight: "800", marginBottom: 8 }}>Monthly Budget</Text>
          <TextInput
            style={input}
            value={budget}
            onChangeText={setBud}
            keyboardType="numeric"
            placeholder="e.g., 2000"
            placeholderTextColor="#9aa6b2"
          />
          <TouchableOpacity onPress={saveBudget} style={primaryBtn} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={primaryText}>Save Budget</Text>}
          </TouchableOpacity>
          <Text style={{ marginTop: 8, opacity: 0.7 }}>Current: <Text style={{ fontWeight:"800" }}>{formatMoney(Number(budget)||0, currency)}</Text></Text>
        </View>

        {/* Quick Add */}
        <View style={[card, { marginTop: 12 }]}>
          <Text style={{ fontSize: 16, fontWeight:"800", marginBottom: 10 }}>Quick Add</Text>

          <View style={{ flexDirection:"row", gap:8, marginBottom:8 }}>
            <TouchableOpacity onPress={()=>setQuickType("expense")} style={[chip, quickType==="expense" && chipActive]}>
              <Ionicons name="remove-circle-outline" size={16} />
              <Text style={chipText}>Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>setQuickType("income")} style={[chip, quickType==="income" && chipActive]}>
              <Ionicons name="add-circle-outline" size={16} />
              <Text style={chipText}>Income</Text>
            </TouchableOpacity>
          </View>

          <TextInput style={input} value={quickLabel} onChangeText={setQuickLabel} placeholder="Label (e.g., Coffee)" placeholderTextColor="#9aa6b2" />
          <TextInput style={input} value={quickAmount} onChangeText={setQuickAmount} placeholder="Amount" placeholderTextColor="#9aa6b2" keyboardType="numeric" />
          <TextInput style={input} value={quickCategory} onChangeText={setQuickCategory} placeholder="Category (e.g., Food)" placeholderTextColor="#9aa6b2" />

          <TouchableOpacity onPress={addQuick} style={primaryBtn}>
            <Text style={primaryText}>Add {quickType==="income" ? "Income" : "Expense"}</Text>
          </TouchableOpacity>
        </View>

        {/* Category spend */}
        <Text style={{ marginTop: 18, marginBottom: 8, fontWeight: "800", fontSize: 16 }}>This Month by Category</Text>
        {byCategory.length === 0 ? (
          <Text style={{ opacity:0.7 }}>No expenses yet.</Text>
        ) : byCategory.map(([cat,total]) => (
          <View key={cat} style={row}>
            <View style={iconCircle}><Ionicons name="pricetag-outline" size={18} /></View>
            <Text style={{ flex:1, fontWeight:"700" }}>{cat}</Text>
            <Text style={{ fontWeight:"800" }}>{formatMoney(total, currency)}</Text>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const card = { backgroundColor:"#fff", borderRadius:16, padding:16, shadowColor:"#000", shadowOpacity:0.15, shadowRadius:8, shadowOffset:{width:0,height:3}, elevation:4 };
const input = { backgroundColor:"rgba(17,37,93,0.08)", borderWidth:1, borderColor:"#cfd8e3", borderRadius:12, paddingHorizontal:12, paddingVertical:10, color:"#111827", marginTop:8 };
const primaryBtn = { marginTop: 12, backgroundColor: "#111827", borderRadius: 14, paddingVertical: 12, alignItems: "center" };
const primaryText = { color: "#fff", fontWeight: "700" };
const chip = { flexDirection:"row", alignItems:"center", gap:6, backgroundColor:"#f3f4f6", borderWidth:1, borderColor:"#e5e7eb", paddingHorizontal:10, paddingVertical:8, borderRadius:999 };
const chipActive = { backgroundColor:"#111827", borderColor:"#111827" };
const chipText = { color:"#111827", fontWeight:"700" };
const row = { backgroundColor:"#fff", borderRadius:12, padding:12, flexDirection:"row", alignItems:"center", gap:12, marginBottom:8, shadowColor:"#000", shadowOpacity:0.04, shadowRadius:4, shadowOffset:{width:0,height:1}, elevation:1 };
const iconCircle = { width:32, height:32, borderRadius:16, backgroundColor:"#e5e7eb", alignItems:"center", justifyContent:"center" };
