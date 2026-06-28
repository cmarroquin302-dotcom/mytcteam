import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/layout/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?redirect=/admin");

  // Check admin status from profile OR env ADMIN_EMAILS
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim());
  const isAdmin = profile?.is_admin || adminEmails.includes(user.email || "");

  if (!isAdmin) redirect("/dashboard");

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 min-w-0 bg-slate-50">
        {children}
      </main>
    </div>
  );
}
