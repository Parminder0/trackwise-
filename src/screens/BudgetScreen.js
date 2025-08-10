import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Alert, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Card, Title, ScreenPad, Input, Button, Chip, Row, IconBubble } from "../ui";
import { theme, textStyles, space } from "../ui/theme";
import { getBudget, setBudget, getCurrency, addTransaction, getTransactions, formatMoney } from "../utils/storage";

export default function BudgetScreen() {
  const [currency, setCurrency] = useState("USD");
  const [budget, setBud] = useState("");
  const [saving, setSaving] = useState(false);
  const [txns, setTxns] = useState([]);
  const [quickType, setQuickType] = useState("expense");
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

  const saveBudgetNow = async () => {
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
    setQuickAmount(""); setQuickLabel(""); setQuickCategory("");
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
    <LinearGradient colors={theme.gradient} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
        <ScreenPad>
          {/* Budget setter */}
          <Card>
            <Title>Monthly Budget</Title>
            <Input
              value={budget}
              onChangeText={setBud}
              keyboardType="numeric"
              placeholder="e.g., 2000"
              style={{ marginTop: space.sm }}
            />
            <Button onPress={saveBudgetNow} variant="accent">
              {saving ? "Saving..." : "Save Budget"}
            </Button>
            <Text style={{ marginTop: 8, opacity: 0.7 }}>
              Current: <Text style={{ fontWeight:"800" }}>{formatMoney(Number(budget)||0, currency)}</Text>
            </Text>
          </Card>

          {/* Quick Add */}
          <Card style={{ marginTop: space.md }}>
            <Title size="h3">Quick Add</Title>
            <View style={{ flexDirection:"row", gap:8, marginTop: 10, marginBottom: 10 }}>
              <Chip text="Expense" active={quickType==="expense"} onPress={()=>setQuickType("expense")} />
              <Chip text="Income"  active={quickType==="income"}  onPress={()=>setQuickType("income")} />
            </View>
            <Input value={quickLabel} onChangeText={setQuickLabel} placeholder="Label (e.g., Coffee)" />
            <Input value={quickAmount} onChangeText={setQuickAmount} placeholder="Amount" keyboardType="numeric" style={{ marginTop: space.sm }} />
            <Input value={quickCategory} onChangeText={setQuickCategory} placeholder="Category (e.g., Food)" style={{ marginTop: space.sm }} />
            <Button onPress={addQuick}>Add {quickType==="income" ? "Income" : "Expense"}</Button>
          </Card>

          {/* Category spend */}
          <Text style={[textStyles.h3, { marginTop: space.xl, marginBottom: space.sm }]}>This Month by Category</Text>
          {byCategory.length === 0 ? (
            <Text style={textStyles.sub}>No expenses yet.</Text>
          ) : byCategory.map(([cat,total]) => (
            <Row key={cat} style={{ marginBottom: 8 }}>
              <IconBubble size={32}><Ionicons name="pricetag-outline" size={18} /></IconBubble>
              <Text style={{ flex:1, fontWeight:"700", color: theme.text }}>{cat}</Text>
              <Text style={{ fontWeight:"800" }}>{formatMoney(total, currency)}</Text>
            </Row>
          ))}
        </ScreenPad>
      </ScrollView>
    </LinearGradient>
  );
}
