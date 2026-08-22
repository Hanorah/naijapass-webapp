import DashboardShell from "@/components/dashboard/DashboardShell";
import { DashboardSearchProvider } from "@/components/dashboard/DashboardSearchContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardSearchProvider>
      <DashboardShell>{children}</DashboardShell>
    </DashboardSearchProvider>
  );
}
