"use client";

import { getFirebaseAuth } from "@firebase/client";
import { useAuth } from "@/context/AuthContext";
import Card from "@/components/ui/Card";
import {
  fetchUserAccountDoc,
  profileToCheckoutFormPatch,
} from "@/lib/checkout-auth";
import { useState } from "react";
import { useDocumentThemeId } from "@/hooks/useDocumentThemeId";
import { isLightThemeId } from "@/theme";
import CheckoutCreateAccountDrawer from "./CheckoutCreateAccountDrawer";
import CheckoutLoginDialog from "./CheckoutLoginDialog";

/**
 * @param {{ onApplyPrefill: (patch: Record<string, string>) => void }} props
 */
export default function CheckoutAuthSection({ onApplyPrefill }) {
  const { user, signOut } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const themeId = useDocumentThemeId();
  const light = isLightThemeId(themeId);

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
          <p
            className={
              light
                ? "mt-4 text-sm leading-relaxed text-stone-800"
                : "mt-4 text-sm leading-relaxed text-site-fg/90"
            }
          >
            Signed in as{" "}
            <span className="font-medium text-site-primary">{user.email}</span>.
            Your saved details are filled in below—you can change anything before
            paying.
          </p>
          <button
            type="button"
            onClick={() => signOut()}
            className={
              light
                ? "mt-4 rounded-full border border-stone-300/80 px-4 py-2 text-sm font-medium text-site-fg transition hover:border-amber-400/50 hover:text-site-primary"
                : "mt-4 rounded-full border border-slate-600/50 px-4 py-2 text-sm font-medium text-stone-300 transition hover:border-amber-400/35 hover:text-stone-100"
            }
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
        <p
          className={
            light
              ? "mt-4 text-sm leading-relaxed text-stone-800"
              : "mt-4 text-sm text-site-secondary"
          }
        >
          Create an account, sign in to load saved details, or continue as a guest
          using the form below.
        </p>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-x-4 sm:gap-y-3">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className={
                light
                  ? "inline-flex h-10 w-48 shrink-0 items-center justify-center rounded-full border border-amber-500/45 bg-amber-400/15 px-3 text-sm font-semibold text-amber-950 transition hover:border-amber-500/60 hover:bg-amber-400/25"
                  : "inline-flex h-10 w-48 shrink-0 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 px-3 text-sm font-semibold text-amber-100 transition hover:border-amber-300/55 hover:bg-amber-400/15"
              }
            >
              Create account
            </button>
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className={
                light
                  ? "inline-flex h-10 w-48 shrink-0 items-center justify-center rounded-full border border-stone-300/80 bg-white/70 px-3 text-sm font-semibold text-site-fg transition hover:border-amber-400/45 hover:bg-amber-50/60"
                  : "inline-flex h-10 w-48 shrink-0 items-center justify-center rounded-full border border-slate-600/50 bg-slate-900/60 px-3 text-sm font-semibold text-stone-200 transition hover:border-amber-400/40 hover:bg-slate-800/80"
              }
            >
              Log in
            </button>
          </div>
          <div
            className={
              light
                ? "sm:max-w-sm sm:border-l sm:border-stone-300/70 sm:pl-4 md:max-w-none"
                : "sm:max-w-sm sm:border-l sm:border-slate-700/50 sm:pl-4 md:max-w-none"
            }
          >
            <p
              className={
                light
                  ? "text-sm leading-snug text-stone-800"
                  : "text-sm leading-snug text-site-fg/90"
              }
            >
              Or continue as guest
              <span
                className={light ? "text-red-600" : "text-red-500"}
                title="Contact and shipping details are required when you check out as a guest."
              >
                *
              </span>{" "}
              — fill in contact &amp; shipping below.
            </p>
            <p
              className={
                light
                  ? "mt-2 text-xs leading-relaxed text-stone-600"
                  : "mt-2 text-xs leading-relaxed text-site-fg/85"
              }
            >
              <span
                className={light ? "text-red-600" : "text-red-500"}
                title="Contact and shipping details are required when you check out as a guest."
              >
                *
              </span>{" "}
              Information you enter below is kept in our records for shipment and
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
