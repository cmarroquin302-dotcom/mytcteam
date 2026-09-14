import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/layout/dashboard-nav";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?redirect=/dashboard");

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardNav />
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
