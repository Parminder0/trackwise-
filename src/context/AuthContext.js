import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { ensureUserDoc } from "../services/data";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) await ensureUserDoc(u.uid, { email: u.email, displayName: u.displayName || "", currency:"USD", monthlyBudget:0, categoryBudgets:{} });
      setInitializing(false);
    });
    return unsub;
  }, []);

  const value = {
    user,
    initializing,
    signIn: (email, password) => signInWithEmailAndPassword(auth, email, password),
    signUp: async (email, password) => {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await ensureUserDoc(cred.user.uid, { email, displayName:"", currency:"USD", monthlyBudget:0, categoryBudgets:{} });
      return cred;
    },
    signOutUser: () => signOut(auth),
    setDisplayName: (name) => (auth.currentUser ? updateProfile(auth.currentUser, { displayName: name }) : Promise.resolve()),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
