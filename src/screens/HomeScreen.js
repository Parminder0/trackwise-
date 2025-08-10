import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Card, Title, ScreenPad, Row, IconBubble, ProgressBar, Divider } from "../ui";
import { theme, textStyles, space } from "../ui/theme";
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
    <LinearGradient colors={theme.gradient} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
        <ScreenPad>
          <Text style={[textStyles.h1, { marginBottom: 4 }]}>Welcome back, {name} 👋</Text>
          <Text style={[textStyles.sub, { marginBottom: space.md }]}>This month overview</Text>

          {/* Budget Summary */}
          <Card>
            <Title>Monthly Budget</Title>
            <View style={{ height: space.md }} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={textStyles.body}>Budget</Text>
              <Text style={[textStyles.h3]}>{formatMoney(budget, currency)}</Text>
            </View>
            <ProgressBar value={pct} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
              <Text style={textStyles.body}>Spent</Text>
              <Text style={[textStyles.h3]}>{formatMoney(spent, currency)} ({pct}%)</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
              <Text style={textStyles.body}>Remaining</Text>
              <Text style={[textStyles.h3]}>{formatMoney(remaining, currency)}</Text>
            </View>
          </Card>

          {/* Quick stats */}
          <View style={{ flexDirection: "row", gap: space.md, marginTop: space.md }}>
            <Card style={{ flex:1 }}>
              <Text style={[textStyles.sub, { marginBottom: 6 }]}>Income</Text>
              <View style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between" }}>
                <Text style={[textStyles.h2]}>{formatMoney(income, currency)}</Text>
                <Ionicons name="trending-up-outline" size={22} />
              </View>
            </Card>
            <Card style={{ flex:1 }}>
              <Text style={[textStyles.sub, { marginBottom: 6 }]}>Expenses</Text>
              <View style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between" }}>
                <Text style={[textStyles.h2]}>{formatMoney(expense, currency)}</Text>
                <Ionicons name="trending-down-outline" size={22} />
              </View>
            </Card>
          </View>

          {/* Recent */}
          <Text style={[textStyles.h3, { marginTop: space.xl, marginBottom: space.sm }]}>Recent</Text>
          {txns.slice(0,5).map(t => (
            <Row key={t.id} style={{ marginBottom: 8 }}>
              <IconBubble><Ionicons name={t.type==="income" ? "arrow-down-circle-outline" : "arrow-up-circle-outline"} size={20} /></IconBubble>
              <View style={{ flex:1 }}>
                <Text style={{ fontWeight:"700", color: theme.text }}>{t.label}</Text>
                <Text style={textStyles.sub}>{t.category}</Text>
              </View>
              <Text style={{ fontWeight:"800", color: t.type==="income" ? theme.success : theme.danger }}>
                {t.type==="income" ? "+" : "-"}{formatMoney(t.amount, currency)}
              </Text>
            </Row>
          ))}
        </ScreenPad>
      </ScrollView>
    </LinearGradient>
  );
}
