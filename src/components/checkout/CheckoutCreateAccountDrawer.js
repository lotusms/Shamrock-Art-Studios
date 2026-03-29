"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import RegisterAccountForm from "@/components/auth/RegisterAccountForm";

/**
 * @param {{ open: boolean, onClose: () => void, onSuccess: (patch: Record<string, string>) => void }} props
 */
export default function CheckoutCreateAccountDrawer({ open, onClose, onSuccess }) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-[200]">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition data-closed:opacity-0"
      />
      <div className="fixed inset-0 flex justify-end">
        <DialogPanel
          transition
          className="flex h-full w-full max-w-full flex-col border-l border-slate-700/50 bg-slate-950 shadow-2xl transition data-closed:translate-x-8 data-closed:opacity-0 min-[400px]:max-w-[min(100vw,28rem)] sm:max-w-[min(100vw,36rem)] lg:max-w-[min(100vw-1rem,56rem)] xl:max-w-[min(100vw-2rem,72rem)]"
        >
          <div className="shrink-0 border-b border-slate-700/40 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
            <DialogTitle className="font-serif text-xl font-medium tracking-[-0.02em] text-stone-100 sm:text-2xl">
              Create an account
            </DialogTitle>
            <p className="mt-2 max-w-3xl text-sm text-stone-400">
              Save your details for faster checkout next time. You can review
              everything below before paying.
            </p>
          </div>

          <RegisterAccountForm
            variant="drawer"
            onCancel={onClose}
            onRegistered={(patch) => {
              onSuccess(patch);
              onClose();
            }}
          />
        </DialogPanel>
      </div>
    </Dialog>
  );
}
