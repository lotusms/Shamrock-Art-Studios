import AccountAuthGate from "@/components/account/AccountAuthGate";
import AccountShell from "@/components/account/AccountShell";
import { sitePageTitle } from "@/config";

export const metadata = {
  title: sitePageTitle("My Account"),
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }) {
  return (
    <AccountAuthGate>
      <AccountShell>{children}</AccountShell>
    </AccountAuthGate>
  );
}
