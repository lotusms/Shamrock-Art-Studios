"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { getFirebaseAuth } from "@firebase/client";
import { ensureUserAccountDocIfMissing } from "@/lib/ensure-user-account";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub = () => {};
    let cancelled = false;

    (async () => {
      try {
        const auth = getFirebaseAuth();
        await auth.authStateReady();
        if (cancelled) return;
        setUser(auth.currentUser ?? null);
        setLoading(false);
        if (auth.currentUser) {
          void ensureUserAccountDocIfMissing();
        }
        unsub = onAuthStateChanged(auth, (u) => {
          if (cancelled) return;
          setUser(u);
          setLoading(false);
          if (u) {
            void ensureUserAccountDocIfMissing();
          }
        });
      } catch (e) {
        console.error("[auth]", e);
        if (!cancelled) {
          setUser(null);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const auth = getFirebaseAuth();
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const signOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signIn, signOut }),
    [user, loading, signIn, signOut],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
