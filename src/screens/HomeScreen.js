import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { getName, getCurrency, getBudget, seedIfEmpty, getTransactions, isInCurrentMonth, formatMoney } from "../utils/storage";

export default function HomeScreen() {
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [budget, setBudget] = useState(0);
  const [txns, setTxns] = useState([]);

  useEffect(() => {
    let live = true;
    (async () => {
      const [nm, cur, bud] = await Promise.all([getName(), getCurrency(), getBudget()]);
      const seeded = await seedIfEmpty();
      const all = await getTransactions();
      if (!live) return;
      setName(nm || "User");
      setCurrency(cur);
      setBudget(bud);
      setTxns(all.length ? all : seeded);
    })();
    return () => { live = false; };
  }, []);

  const { income, expense, spent, remaining } = useMemo(() => {
    const monthTxns = txns.filter(t => isInCurrentMonth(t.dateISO));
    const income = monthTxns.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
    const expense = monthTxns.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
    const spent = expense;
    const remaining = Math.max(0, budget - spent);
    return { income, expense, spent, remaining };
  }, [txns, budget]);

  const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;

  return (
    <LinearGradient colors={["#7097D1", "#BFD0EA"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Greeting */}
        <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 8 }}>Welcome back, {name} </Text>
        <Text style={{ opacity: 0.8, marginBottom: 12 }}>This month overview</Text>

        {/* Budget Summary Card */}
        <View style={card}>
          <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>Monthly Budget</Text>

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text>Budget</Text>
            <Text style={{ fontWeight: "700" }}>{formatMoney(budget, currency)}</Text>
          </View>

          <View style={{ height: 14, backgroundColor: "#e5e7eb", borderRadius: 999, overflow: "hidden", marginBottom: 8 }}>
            <View style={{ width: `${pct}%`, backgroundColor: "#111827", height: "100%" }} />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text>Spent</Text>
            <Text style={{ fontWeight: "700" }}>{formatMoney(spent, currency)} ({pct}%)</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text>Remaining</Text>
            <Text style={{ fontWeight: "700" }}>{formatMoney(remaining, currency)}</Text>
          </View>
        </View>

        {/* Income / Expenses quick stats */}
        <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
          <View style={[miniCard,{ flex:1 }]}>
            <Text style={{ opacity: 0.6 }}>Income</Text>
            <View style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between" }}>
              <Text style={{ fontSize:18, fontWeight:"800" }}>{formatMoney(income, currency)}</Text>
              <Ionicons name="trending-up-outline" size={22} />
            </View>
          </View>
          <View style={[miniCard,{ flex:1 }]}>
            <Text style={{ opacity: 0.6 }}>Expenses</Text>
            <View style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between" }}>
              <Text style={{ fontSize:18, fontWeight:"800" }}>{formatMoney(expense, currency)}</Text>
              <Ionicons name="trending-down-outline" size={22} />
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        <Text style={{ marginTop: 18, marginBottom: 8, fontWeight: "800", fontSize: 16 }}>Recent</Text>
        {txns.slice(0,5).map(t => (
          <View key={t.id} style={row}>
            <View style={iconCircle}>
              <Ionicons name={t.type==="income" ? "arrow-down-circle-outline" : "arrow-up-circle-outline"} size={20} />
            </View>
            <View style={{ flex:1 }}>
              <Text style={{ fontWeight:"700" }}>{t.label}</Text>
              <Text style={{ opacity:0.6, fontSize:12 }}>{t.category}</Text>
            </View>
            <Text style={{ fontWeight:"700", color: t.type==="income" ? "#065f46" : "#7f1d1d" }}>
              {t.type==="income" ? "+" : "-"}{formatMoney(t.amount, currency)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const card = { backgroundColor:"#fff", borderRadius:16, padding:16, shadowColor:"#000", shadowOpacity:0.15, shadowRadius:8, shadowOffset:{width:0,height:3}, elevation:4 };
const miniCard = { backgroundColor:"#fff", borderRadius:16, padding:12, shadowColor:"#000", shadowOpacity:0.08, shadowRadius:6, shadowOffset:{width:0,height:2}, elevation:2 };
const row = { backgroundColor:"#fff", borderRadius:12, padding:12, flexDirection:"row", alignItems:"center", gap:12, marginBottom:8, shadowColor:"#000", shadowOpacity:0.04, shadowRadius:4, shadowOffset:{width:0,height:1}, elevation:1 };
const iconCircle = { width:36, height:36, borderRadius:18, backgroundColor:"#e5e7eb", alignItems:"center", justifyContent:"center" };
