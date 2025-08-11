import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { subUserDoc, subTransactions } from "../services/data";
import { theme } from "../ui/theme";

function formatMoney(n, currency) {
  try { return new Intl.NumberFormat("en-US",{ style:"currency", currency }).format(n); }
  catch { return `${currency} ${Number(n||0).toFixed(2)}`; }
}
const isInCurrentMonth = (iso) => {
  const d = new Date(iso); const now = new Date();
  return d.getFullYear()===now.getFullYear() && d.getMonth()===now.getMonth();
};

export default function HomeScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ displayName:"", currency:"USD", monthlyBudget:0 });
  const [txns, setTxns] = useState([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const off1 = subUserDoc(user.uid, (d)=> setProfile(d || { currency:"USD", monthlyBudget:0 }));
    const off2 = subTransactions(user.uid, setTxns);
    return () => { off1 && off1(); off2 && off2(); };
  }, []);

  const { income, expense, spent, remaining, pct } = useMemo(() => {
    const monthTxns = txns.filter(t => isInCurrentMonth(t.dateISO));
    const income = monthTxns.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
    const expense = monthTxns.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
    const spent = expense;
    const remaining = Math.max(0, (profile.monthlyBudget||0) - spent);
    const pct = (profile.monthlyBudget||0) > 0 ? Math.min(100, Math.round((spent/(profile.monthlyBudget||1))*100)) : 0;
    return { income, expense, spent, remaining, pct };
  }, [txns, profile]);

  return (
    <LinearGradient colors={theme.gradient} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 28 }}>
        <Text style={{ fontSize:22, fontWeight:"800", marginBottom:4, color:theme.text }}>
          Welcome back, {profile.displayName || user.email} 👋
        </Text>
        <Text style={{ opacity:0.8, marginBottom:12, color:theme.subtext }}>This month overview</Text>

        {/* Budget Summary */}
        <View style={card}>
          <Text style={title}>Monthly Budget</Text>
          <RowLine label="Budget" value={formatMoney(profile.monthlyBudget||0, profile.currency||"USD")} />
          <Bar pct={pct} />
          <RowLine label="Spent" value={`${formatMoney(spent, profile.currency||"USD")} (${pct}%)`} />
          <RowLine label="Remaining" value={formatMoney(remaining, profile.currency||"USD")} last />
        </View>

        {/* Quick stats */}
        <View style={{ flexDirection:"row", gap:12, marginTop:12 }}>
          <Mini label="Income"   value={formatMoney(income, profile.currency||"USD")}   icon="trending-up-outline" />
          <Mini label="Expenses" value={formatMoney(expense, profile.currency||"USD")} icon="trending-down-outline" />
        </View>

        {/* Recent */}
        <Text style={{ marginTop:18, marginBottom:8, fontWeight:"800", fontSize:16 }}>Recent</Text>
        {txns.slice(0,5).map(t => (
          <View key={t.id} style={row}>
            <View style={iconBubble}><Ionicons name={t.type==="income" ? "arrow-down-circle-outline" : "arrow-up-circle-outline"} size={20} /></View>
            <View style={{ flex:1 }}>
              <Text style={{ fontWeight:"700" }}>{t.label}</Text>
              <Text style={{ opacity:0.6, fontSize:12 }}>{t.category}</Text>
            </View>
            <Text style={{ fontWeight:"800", color: t.type==="income" ? theme.success : theme.danger }}>
              {t.type==="income" ? "+" : "-"}{formatMoney(t.amount, profile.currency||"USD")}
            </Text>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

/* small components */
function RowLine({ label, value, last }) {
  return (
    <View style={{ flexDirection:"row", justifyContent:"space-between", marginBottom: last?0:8 }}>
      <Text>{label}</Text><Text style={{ fontWeight:"700" }}>{value}</Text>
    </View>
  );
}
function Bar({ pct=0 }) {
  return (
    <View style={{ height:14, backgroundColor:"#e5e7eb", borderRadius:999, overflow:"hidden", marginBottom:8 }}>
      <View style={{ width:`${Math.max(0,Math.min(100,pct))}%`, backgroundColor:theme.accent, height:"100%" }} />
    </View>
  );
}
function Mini({ label, value, icon }) {
  return (
    <View style={miniCard}>
      <Text style={{ opacity:0.6 }}>{label}</Text>
      <View style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between" }}>
        <Text style={{ fontSize:18, fontWeight:"800" }}>{value}</Text>
        <Ionicons name={icon} size={22} />
      </View>
    </View>
  );
}

/* styles */
const title = { fontSize:18, fontWeight:"800", marginBottom:12 };
const card = { backgroundColor:"#fff", borderRadius:18, padding:16, shadowColor:"#000", shadowOpacity:0.12, shadowRadius:10, shadowOffset:{width:0,height:4}, elevation:4 };
const miniCard = { backgroundColor:"#fff", borderRadius:18, padding:12, flex:1, shadowColor:"#000", shadowOpacity:0.08, shadowRadius:8, shadowOffset:{width:0,height:3}, elevation:2 };
const row = { backgroundColor:"#fff", borderRadius:14, padding:12, flexDirection:"row", alignItems:"center", gap:12, marginBottom:8, shadowColor:"#000", shadowOpacity:0.04, shadowRadius:6, shadowOffset:{width:0,height:2}, elevation:1 };
const iconBubble = { width:36, height:36, borderRadius:18, backgroundColor:"#e5e7eb", alignItems:"center", justifyContent:"center" };
