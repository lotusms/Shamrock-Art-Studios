"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@firebase/client";
import { ensureUserAccountDocIfMissing } from "@/lib/ensure-user-account";
import { USER_ACCOUNTS_COLLECTION } from "@/lib/user-accounts";

const AuthContext = createContext(null);

/** @typedef {{ status: 'idle' | 'loading' | 'ready', admin: boolean, guest: boolean, firstName: string, lastName: string }} UserAccountState */

const idleAccount = /** @type {UserAccountState} */ ({
  status: "idle",
  admin: false,
  guest: false,
  firstName: "",
  lastName: "",
});

export function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  /** True while intentionally signing out — auth gates skip /login so home can load. */
  const [signingOut, setSigningOut] = useState(false);
  /** @type {[UserAccountState, import('react').Dispatch<import('react').SetStateAction<UserAccountState>>]} */
  const [userAccount, setUserAccount] = useState(idleAccount);

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

  /* Firestore listener: set loading before first snapshot; snapshot/error callbacks update state. */
  useEffect(() => {
    if (!user) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- bootstrap listener + loading UI before first snapshot
    setUserAccount({
      status: "loading",
      admin: false,
      guest: false,
      firstName: "",
      lastName: "",
    });

    const db = getFirebaseDb();
    const ref = doc(db, USER_ACCOUNTS_COLLECTION, user.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setUserAccount({
            status: "ready",
            admin: false,
            guest: false,
            firstName: "",
            lastName: "",
          });
          return;
        }
        const d = snap.data();
        setUserAccount({
          status: "ready",
          admin: Boolean(d.admin),
          guest: Boolean(d.guest),
          firstName: typeof d.firstName === "string" ? d.firstName : "",
          lastName: typeof d.lastName === "string" ? d.lastName : "",
        });
      },
      (err) => {
        console.error("[auth] userAccount", err);
        setUserAccount({
          status: "ready",
          admin: false,
          guest: false,
          firstName: "",
          lastName: "",
        });
      },
    );

    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (pathname === "/" || pathname === "") {
      setSigningOut(false);
    }
  }, [pathname]);

  useEffect(() => {
    if (user) {
      setSigningOut(false);
    }
  }, [user]);

  const signIn = useCallback(async (email, password) => {
    const auth = getFirebaseAuth();
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const signOut = useCallback(async () => {
    setSigningOut(true);
    try {
      const auth = getFirebaseAuth();
      await firebaseSignOut(auth);
      router.replace("/");
    } catch (e) {
      setSigningOut(false);
      throw e;
    }
  }, [router]);

  const resolvedAccount = user ? userAccount : idleAccount;
  const accountLoading = Boolean(user && resolvedAccount.status === "loading");
  const isAdmin =
    resolvedAccount.status === "ready" &&
    resolvedAccount.admin === true &&
    resolvedAccount.guest !== true;

  const value = useMemo(
    () => ({
      user,
      loading,
      signingOut,
      signIn,
      signOut,
      userAccount: resolvedAccount,
      accountLoading,
      isAdmin,
    }),
    [
      user,
      loading,
      signingOut,
      signIn,
      signOut,
      resolvedAccount,
      accountLoading,
      isAdmin,
    ],
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
