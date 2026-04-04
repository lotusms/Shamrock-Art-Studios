import DashboardAuthGate from "@/components/dashboard/DashboardAuthGate";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { sitePageTitle } from "@/config";

export const metadata = {
  title: sitePageTitle("Dashboard"),
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }) {
  return (
    <DashboardAuthGate>
      <DashboardShell>{children}</DashboardShell>
    </DashboardAuthGate>
  );
}
