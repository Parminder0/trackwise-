import { db } from "../firebase";
import {
  doc, getDoc, setDoc, serverTimestamp,
  collection, addDoc, deleteDoc,
  onSnapshot, query, orderBy
} from "firebase/firestore";

export const userDocRef = (uid) => doc(db, "users", uid);
export const txnsColRef = (uid) => collection(db, "users", uid, "transactions");

export async function ensureUserDoc(uid, data = {}) {
  const ref = userDocRef(uid);
  await setDoc(ref, { uid, ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export function subUserDoc(uid, cb) {
  return onSnapshot(userDocRef(uid), (snap) => cb(snap.exists() ? snap.data() : null));
}

export function subTransactions(uid, cb) {
  const q = query(txnsColRef(uid), orderBy("dateISO", "desc"));
  return onSnapshot(q, (snap) => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export async function addTransaction(uid, txn) {
  return addDoc(txnsColRef(uid), { ...txn, createdAt: serverTimestamp() });
}

export async function deleteTransaction(uid, id) {
  return deleteDoc(doc(db, "users", uid, "transactions", id));
}

export async function saveProfile(uid, data) {
  return setDoc(userDocRef(uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}
