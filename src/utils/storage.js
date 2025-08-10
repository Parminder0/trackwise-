import AsyncStorage from "@react-native-async-storage/async-storage";

// Keys (aligned with Profile demo mode)
export const K_NAME = "demo.profile.name";
export const K_CURR = "demo.profile.currency";
export const K_BUDG = "demo.profile.monthlyBudget";
export const K_TXNS = "tw.transactions";

export async function getName() {
  return (await AsyncStorage.getItem(K_NAME)) || "";
}
export async function getCurrency() {
  return (await AsyncStorage.getItem(K_CURR)) || "USD";
}
export async function getBudget() {
  const raw = await AsyncStorage.getItem(K_BUDG);
  const num = Number(raw);
  return Number.isFinite(num) && num >= 0 ? num : 0;
}
export async function setBudget(n) {
  await AsyncStorage.setItem(K_BUDG, String(n));
}

export async function getTransactions() {
  const raw = await AsyncStorage.getItem(K_TXNS);
  if (!raw) return [];
  try { return JSON.parse(raw) || []; } catch { return []; }
}
export async function saveTransactions(list) {
  await AsyncStorage.setItem(K_TXNS, JSON.stringify(list));
}
export async function addTransaction(txn) {
  const list = await getTransactions();
  list.unshift({ id: String(Date.now()), ...txn });
  await saveTransactions(list);
  return list;
}
export async function deleteTransaction(id) {
  const list = await getTransactions();
  const filtered = list.filter(t => t.id !== id);
  await saveTransactions(filtered);
  return filtered;
}

// Seed some starter data on first run
export async function seedIfEmpty() {
  const list = await getTransactions();
  if (list.length) return list;
  const seed = [
    { id: "s3", type: "expense", label: "Groceries", amount: 42.75, category: "Food",    dateISO: new Date().toISOString() },
    { id: "s2", type: "income",  label: "Paycheck", amount: 1200.00, category: "Salary",  dateISO: new Date().toISOString() },
    { id: "s1", type: "expense", label: "Transit",  amount: 3.50,   category: "Transport",dateISO: new Date().toISOString() },
  ];
  await saveTransactions(seed);
  return seed;
}

// Helpers
export function formatMoney(n, currency="USD") {
  try { return new Intl.NumberFormat("en-US",{ style:"currency", currency }).format(n); }
  catch { return `${currency} ${n.toFixed(2)}`; }
}
export function startOfMonth(d=new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
export function isInCurrentMonth(iso) {
  const d = new Date(iso);
  const s = startOfMonth();
  return d >= s; // simple check (assumes we only care about current month)
}
