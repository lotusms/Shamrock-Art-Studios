"use client";

import { getFirebaseAuth } from "@firebase/client";
import { useAuth } from "@/context/AuthContext";
import Card from "@/components/ui/Card";
import {
  fetchUserAccountDoc,
  profileToCheckoutFormPatch,
} from "@/lib/checkout-auth";
import { useState } from "react";
import CheckoutCreateAccountDrawer from "./CheckoutCreateAccountDrawer";
import CheckoutLoginDialog from "./CheckoutLoginDialog";

/**
 * @param {{ onApplyPrefill: (patch: Record<string, string>) => void }} props
 */
export default function CheckoutAuthSection({ onApplyPrefill }) {
  const { user, signOut } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  async function applyProfileForCurrentUser() {
    const u = getFirebaseAuth().currentUser;
    if (!u) return;
    const d = await fetchUserAccountDoc(u.uid);
    const patch = profileToCheckoutFormPatch(d, u.email);
    onApplyPrefill(patch);
  }

  if (user?.email) {
    return (
      <>
        <Card variant="inset" className="w-full" title="Account" titleTag="h4">
          <p className="mt-4 text-sm leading-relaxed text-stone-300">
            Signed in as{" "}
            <span className="font-medium text-amber-100/95">{user.email}</span>.
            Your saved details are filled in below—you can change anything before
            paying.
          </p>
          <button
            type="button"
            onClick={() => signOut()}
            className="mt-4 rounded-full border border-slate-600/50 px-4 py-2 text-sm font-medium text-stone-300 transition hover:border-amber-400/35 hover:text-stone-100"
          >
            Sign out and continue as guest
          </button>
        </Card>
      </>
    );
  }

  return (
    <>
      <Card variant="inset" className="w-full" title="How to check out" titleTag="h4">
        <p className="mt-4 text-sm text-stone-400">
          Create an account, sign in to load saved details, or continue as a guest
          using the form below.
        </p>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-x-4 sm:gap-y-3">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex h-10 w-48 shrink-0 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 px-3 text-sm font-semibold text-amber-100 transition hover:border-amber-300/55 hover:bg-amber-400/15"
            >
              Create account
            </button>
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="inline-flex h-10 w-48 shrink-0 items-center justify-center rounded-full border border-slate-600/50 bg-slate-900/60 px-3 text-sm font-semibold text-stone-200 transition hover:border-amber-400/40 hover:bg-slate-800/80"
            >
              Log in
            </button>
          </div>
          <div className="sm:max-w-sm sm:border-l sm:border-slate-700/50 sm:pl-4 md:max-w-none">
            <p className="text-sm leading-snug text-slate-200">
              Or continue as guest
              <span
                className="text-red-500"
                title="Contact and shipping details are required when you check out as a guest."
              >
                *
              </span>{" "}
              — fill in contact &amp; shipping below.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-200">
            <span
                className="text-red-500"
                title="Contact and shipping details are required when you check out as a guest."
              >
                *
              </span>{" "} Information you enter below is kept in our records for shipment and
              order fulfillment only.
            </p>
          </div>
        </div>
      </Card>

      <CheckoutLoginDialog
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSignedIn={() => {
          void applyProfileForCurrentUser();
        }}
      />

      <CheckoutCreateAccountDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={(patch) => {
          onApplyPrefill(patch);
          void applyProfileForCurrentUser();
        }}
      />
    </>
  );
}
