import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Alert, TextInput, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { subUserDoc, subTransactions, addTransaction, saveProfile } from "../services/data";
import { theme } from "../ui/theme";

function formatMoney(n, currency) {
  try { return new Intl.NumberFormat("en-US",{ style:"currency", currency }).format(n); }
  catch { return `${currency} ${Number(n||0).toFixed(2)}`; }
}

export default function BudgetScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ currency:"USD", monthlyBudget:0, categoryBudgets:{} });
  const [txns, setTxns] = useState([]);
  const insets = useSafeAreaInsets();

  // Quick add state
  const [quickType, setQuickType] = useState("expense");
  const [quickLabel, setQuickLabel] = useState("");
  const [quickAmount, setQuickAmount] = useState("");
  const [quickCategory, setQuickCategory] = useState("");

  // Editable profile fields
  const [editBudget, setEditBudget] = useState("");
  const [editCatBudgets, setEditCatBudgets] = useState({});

  useEffect(() => {
    const off1 = subUserDoc(user.uid, (d)=>{
      const base = d || { currency:"USD", monthlyBudget:0, categoryBudgets:{} };
      setProfile(base);
      setEditBudget(String(base.monthlyBudget || ""));
      setEditCatBudgets(base.categoryBudgets || {});
    });
    const off2 = subTransactions(user.uid, setTxns);
    return () => { off1 && off1(); off2 && off2(); };
  }, []);

  const byCategory = useMemo(() => {
    const map = {};
    for (const t of txns) {
      if (t.type !== "expense") continue;
      map[t.category] = (map[t.category] || 0) + Number(t.amount || 0);
    }
    return Object.entries(map).sort((a,b)=>b[1]-a[1]);
  }, [txns]);

  const editCat = (cat, val) => setEditCatBudgets(prev => ({ ...prev, [cat]: val }));

  const saveBudgets = async () => {
    const total = Number(editBudget);
    if (Number.isNaN(total) || total < 0) return Alert.alert("Invalid", "Enter a valid total monthly budget (0 or more).");
    const clean = {};
    for (const [k,v] of Object.entries(editCatBudgets)) {
      const n = Number(v); clean[k] = Number.isFinite(n) && n >= 0 ? n : 0;
    }
    await saveProfile(user.uid, { monthlyBudget: total, categoryBudgets: clean });
    Alert.alert("Saved", "Budgets updated.");
  };

  const addQuick = async () => {
    const amt = Number(quickAmount);
    if (!quickLabel.trim()) return Alert.alert("Label required", "Give this item a name.");
    if (Number.isNaN(amt) || amt <= 0) return Alert.alert("Amount required", "Enter a number > 0.");
    await addTransaction(user.uid, {
      type: quickType, label: quickLabel.trim(), amount: amt,
      category: quickCategory.trim() || (quickType==="income" ? "Income" : "Other"),
      dateISO: new Date().toISOString(),
    });
    setQuickAmount(""); setQuickLabel(""); setQuickCategory("");
    Alert.alert("Added", "Transaction saved.");
  };

  const currency = profile.currency || "USD";
  const catBudgetSum = Object.values(profile.categoryBudgets || {}).reduce((s,n)=>s+Number(n||0),0);

  return (
    <LinearGradient colors={theme.gradient} style={{ flex:1 }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal:16, paddingBottom:28 }}>
        {/* Total budget */}
        <View style={card}>
          <Text style={title}>Monthly Budget (Total)</Text>
          <TextInput value={editBudget} onChangeText={setEditBudget} keyboardType="numeric" placeholder="e.g., 2000" placeholderTextColor="#9aa6b2" style={input} />
          <Text style={{ marginTop:8, opacity:0.7 }}>
            Current: <Text style={{ fontWeight:"800" }}>{formatMoney(profile.monthlyBudget||0, currency)}</Text>
          </Text>
        </View>

        {/* Category budgets */}
        <View style={[card, { marginTop:12 }]}>
          <Text style={title}>Category Budgets</Text>
          {byCategory.length === 0 ? (
            <Text style={{ opacity:0.7, marginTop:6 }}>No expenses yet. Add some to see categories.</Text>
          ) : (
            <View style={{ marginTop:8 }}>
              {byCategory.map(([cat,total]) => (
                <View key={cat} style={row}>
                  <Text style={{ flex:1, fontWeight:"700" }}>{cat}</Text>
                  <TextInput
                    value={String(editCatBudgets[cat] ?? "")}
                    onChangeText={(t)=>editCat(cat, t)}
                    placeholder="Budget"
                    placeholderTextColor="#9aa6b2"
                    keyboardType="numeric"
                    style={[input, { width:120, marginTop:0 }]}
                  />
                </View>
              ))}
              <Text style={{ marginTop:8, opacity:0.8 }}>
                Sum of category budgets: <Text style={{ fontWeight:"800" }}>{formatMoney(catBudgetSum, currency)}</Text>
              </Text>
            </View>
          )}
          <TouchableOpacity onPress={saveBudgets} style={primaryBtn}><Text style={primaryText}>Save Budgets</Text></TouchableOpacity>
        </View>

        {/* Quick Add */}
        <View style={[card, { marginTop:12 }]}>
          <Text style={title}>Quick Add</Text>
          <View style={{ flexDirection:"row", gap:8, marginBottom:8, marginTop:8 }}>
            <TouchableOpacity onPress={()=>setQuickType("expense")} style={[chip, quickType==="expense" && chipActive]}>
              <Ionicons name="remove-circle-outline" size={16} /><Text style={chipText}>Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>setQuickType("income")} style={[chip, quickType==="income" && chipActive]}>
              <Ionicons name="add-circle-outline" size={16} /><Text style={chipText}>Income</Text>
            </TouchableOpacity>
          </View>
          <TextInput style={input} value={quickLabel} onChangeText={setQuickLabel} placeholder="Label (e.g., Coffee)" placeholderTextColor="#9aa6b2" />
          <TextInput style={input} value={quickAmount} onChangeText={setQuickAmount} placeholder="Amount" placeholderTextColor="#9aa6b2" keyboardType="numeric" />
          <TextInput style={input} value={quickCategory} onChangeText={setQuickCategory} placeholder="Category (e.g., Food)" placeholderTextColor="#9aa6b2" />
          <TouchableOpacity onPress={addQuick} style={primaryBtn}><Text style={primaryText}>Add {quickType==="income" ? "Income" : "Expense"}</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const title = { fontSize:18, fontWeight:"800", marginBottom:8 };
const card = { backgroundColor:"#fff", borderRadius:18, padding:16, shadowColor:"#000", shadowOpacity:0.12, shadowRadius:10, shadowOffset:{width:0,height:4}, elevation:4 };
const input = { backgroundColor:"#f3f4f6", borderWidth:1, borderColor:"#e5e7eb", borderRadius:12, paddingHorizontal:12, paddingVertical:10, color:"#111827", marginTop:8 };
const primaryBtn = { marginTop:12, backgroundColor:"#111827", borderRadius:14, paddingVertical:12, alignItems:"center" };
const primaryText = { color:"#fff", fontWeight:"700" };
const chip = { flexDirection:"row", alignItems:"center", gap:6, backgroundColor:"#f3f4f6", borderWidth:1, borderColor:"#e5e7eb", paddingHorizontal:10, paddingVertical:8, borderRadius:999 };
const chipActive = { backgroundColor:theme.accent, borderColor:theme.accent };
const chipText = { color:"#111827", fontWeight:"700" };
const row = { flexDirection:"row", alignItems:"center", gap:12, marginBottom:8 };
