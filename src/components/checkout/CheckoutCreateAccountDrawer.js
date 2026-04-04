"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import RegisterAccountForm from "@/components/auth/RegisterAccountForm";
import { useOverlayChrome } from "@/hooks/useOverlayChrome";
import * as overlayChrome from "@/lib/overlayChrome";

/**
 * @param {{ open: boolean, onClose: () => void, onSuccess: (patch: Record<string, string>) => void }} props
 */
export default function CheckoutCreateAccountDrawer({ open, onClose, onSuccess }) {
  const { light } = useOverlayChrome();

  return (
    <Dialog open={open} onClose={onClose} className="relative z-[200]">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition data-closed:opacity-0"
      />
      <div className="fixed inset-0 flex justify-end">
        <DialogPanel
          transition
          className={overlayChrome.checkoutDialogDrawerPanel(light)}
        >
          <div className={overlayChrome.checkoutDialogDrawerHeaderBorder(light)}>
            <DialogTitle className={overlayChrome.dialogTitleDrawer(light)}>
              Create an account
            </DialogTitle>
            <p className={`max-w-3xl ${overlayChrome.dialogSubtitle(light)}`}>
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
