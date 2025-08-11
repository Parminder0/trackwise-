import AsyncStorage from "@react-native-async-storage/async-storage";

const K_USER   = "demo.user";
const K_TXNS   = "demo.txns";

function nowISO(){ return new Date().toISOString(); }

async function getUserLocal() {
  const raw = await AsyncStorage.getItem(K_USER);
  return raw ? JSON.parse(raw) : null;
}
async function setUserLocal(data) {
  const old = (await getUserLocal()) || {};
  const merged = { ...old, ...data };
  await AsyncStorage.setItem(K_USER, JSON.stringify(merged));
  return merged;
}

async function getTxnsLocal() {
  const raw = await AsyncStorage.getItem(K_TXNS);
  return raw ? JSON.parse(raw) : [];
}
async function setTxnsLocal(list) {
  await AsyncStorage.setItem(K_TXNS, JSON.stringify(list));
}

export async function ensureUserDoc(uid, data={}) {
  // uid ignored in demo
  return setUserLocal({ uid: "guest", ...data, updatedAt: nowISO() });
}
export function subUserDoc(uid, cb) {
  // one-shot “subscription”
  let cancelled = false;
  (async () => {
    const u = await getUserLocal();
    cb(u || { uid:"guest", email:"guest@example.com", displayName:"Guest", currency:"USD", monthlyBudget:0, categoryBudgets:{} });
  })();
  return () => { cancelled = true; };
}

export function subTransactions(uid, cb) {
  let cancelled = false;
  (async () => {
    let list = await getTxnsLocal();
    if (!list.length) {
      list = [
        { id:"s3", type:"expense", label:"Groceries", amount:42.75, category:"Food", dateISO: nowISO() },
        { id:"s2", type:"income",  label:"Paycheck", amount:1200.00, category:"Salary", dateISO: nowISO() },
        { id:"s1", type:"expense", label:"Transit",  amount:3.50,  category:"Transport", dateISO: nowISO() },
      ];
      await setTxnsLocal(list);
    }
    cb(list);
  })();
  return () => { cancelled = true; };
}

export async function addTransaction(uid, txn) {
  const list = await getTxnsLocal();
  const item = { id: String(Date.now()), ...txn };
  list.unshift(item);
  await setTxnsLocal(list);
  return item;
}

export async function deleteTransaction(uid, id) {
  const list = await getTxnsLocal();
  const next = list.filter(t=>t.id !== id);
  await setTxnsLocal(next);
}

export async function saveProfile(uid, data) {
  return setUserLocal({ ...data, updatedAt: nowISO() });
}
