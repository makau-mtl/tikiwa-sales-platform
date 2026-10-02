import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (!profile || !["admin", "agent"].includes(profile.role)) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=staff");
  }

  const displayName = profile.full_name?.trim() || userData.user.email || "Staff member";

  return (
    <div className="min-h-screen bg-[#f5f5f1]">
      <header className="border-b border-[#dfe2da] bg-white">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-4 px-5 sm:flex-nowrap sm:px-8">
          <a href="/admin" className="flex items-center gap-3" aria-label="Tikiwa admin home">
            <span className="grid size-9 place-items-center bg-[#1e3829] text-xs font-semibold text-white">
              TL
            </span>
            <span>
              <span className="block text-xs font-semibold tracking-wide text-[#1e3829]">TIKIWA LANDS</span>
              <span className="mt-0.5 block text-[11px] text-[#788078]">Staff workspace</span>
            </span>
          </a>

          <nav aria-label="Workspace" className="order-3 flex w-full items-center gap-5 border-t border-[#dfe2da] py-3 text-sm font-medium sm:order-none sm:w-auto sm:border-0 sm:py-0">
            <Link href="/admin" className="text-[#39443b] hover:text-[#1e3829]">
              Projects
            </Link>
            <Link href="/admin/inventory" className="text-[#39443b] hover:text-[#1e3829]">
              Inventory
            </Link>
          </nav>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-[#29332b]">{displayName}</p>
              <p className="mt-0.5 text-[11px] capitalize text-[#788078]">{profile.role}</p>
            </div>
            <form action={signOut}>
              <button
                className="border border-[#d8dbd4] px-3 py-2 text-xs font-medium text-[#39443b] transition hover:border-[#8e9b8e] hover:bg-[#f5f5f1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315b40]"
                type="submit"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">{children}</main>
    </div>
  );
}