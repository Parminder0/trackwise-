import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Alert, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { ScreenPad, Row, Chip, IconBubble } from "../ui";
import { theme, textStyles, space } from "../ui/theme";
import { getTransactions, deleteTransaction, formatMoney, getCurrency } from "../utils/storage";

export default function HistoryScreen() {
  const [txns, setTxns] = useState([]);
  const [filter, setFilter] = useState("all");
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
    <LinearGradient colors={["#6EA0D6", "#BFD0EA"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
        <ScreenPad>
          {/* Filters */}
          <View style={{ flexDirection:"row", gap:8, marginBottom: 12 }}>
            <Chip text="All"     active={filter==="all"}     onPress={()=>setFilter("all")} />
            <Chip text="Income"  active={filter==="income"}  onPress={()=>setFilter("income")} />
            <Chip text="Expense" active={filter==="expense"} onPress={()=>setFilter("expense")} />
          </View>

          {filtered.length === 0 ? (
            <Text style={textStyles.sub}>No transactions to show.</Text>
          ) : filtered.map(t => (
            <Row key={t.id} style={{ marginBottom: 8 }}>
              <IconBubble size={32}>
                <Ionicons name={t.type==="income" ? "arrow-down-circle-outline" : "arrow-up-circle-outline"} size={18} />
              </IconBubble>
              <View style={{ flex:1 }}>
                <Text style={{ fontWeight:"700", color: theme.text }}>{t.label}</Text>
                <Text style={textStyles.sub}>{new Date(t.dateISO).toLocaleString()} • {t.category}</Text>
              </View>
              <Text style={{ fontWeight:"800", color: t.type==="income" ? theme.success : theme.danger, marginRight: 10 }}>
                {t.type==="income" ? "+" : "-"}{formatMoney(t.amount, currency)}
              </Text>
              <TouchableOpacity onPress={() => Alert.alert("Delete","Remove this item?",[
                { text:"Cancel", style:"cancel" },
                { text:"Delete", style:"destructive", onPress:()=>remove(t.id) }
              ])}>
                <Ionicons name="trash-outline" size={20} />
              </TouchableOpacity>
            </Row>
          ))}
        </ScreenPad>
      </ScrollView>
    </LinearGradient>
  );
}
