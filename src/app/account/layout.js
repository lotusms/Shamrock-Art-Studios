import AccountAuthGate from "@/components/account/AccountAuthGate";
import AccountShell from "@/components/account/AccountShell";

export const metadata = {
  title: "My Account | Shamrock Art Studio",
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }) {
  return (
    <AccountAuthGate>
      <AccountShell>{children}</AccountShell>
    </AccountAuthGate>
  );
}
