"use client";

import ChangePasswordForm from "@/components/auth/ChangePasswordForm";

export default function ChangePasswordPage() {
  return (
    <div className="relative mx-auto max-w-lg">
      <p className="text-xs font-medium uppercase tracking-[0.35em] text-amber-400/90">
        Security
      </p>
      <h1 className="mt-4 font-serif text-4xl font-medium tracking-[-0.04em] text-stone-50 sm:text-5xl">
        Change password
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-stone-400">
        Enter your current password, then choose a new one. This updates your
        sign-in for Shamrock Art Studio only.
      </p>

      <ChangePasswordForm backHref="/account" backLabel="Back to My Account" />
    </div>
  );
}
