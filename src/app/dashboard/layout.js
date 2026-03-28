import DashboardAuthGate from "@/components/dashboard/DashboardAuthGate";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata = {
  title: "Dashboard | Shamrock Art Studio",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }) {
  return (
    <DashboardAuthGate>
      <DashboardShell>{children}</DashboardShell>
    </DashboardAuthGate>
  );
}
