import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signIn } from "./actions";

export const metadata: Metadata = {
  title: "Staff sign in | Tikiwa",
};

const errorMessages: Record<string, string> = {
  credentials: "Email or password is incorrect. Check your details and try again.",
  staff: "This account is not enabled for the staff workspace.",
};

export default async function LoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (userData.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (profile && ["admin", "agent"].includes(profile.role)) {
      redirect("/admin");
    }

    await supabase.auth.signOut();
  }

  const { error } = await searchParams;
  const errorMessage = typeof error === "string" ? errorMessages[error] : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f5f1] px-5 py-12">
      <section className="w-full max-w-md">
        <div className="mb-10 flex items-center gap-3">
          <div className="grid size-11 place-items-center bg-[#1e3829] text-sm font-semibold text-white">
            TL
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-[#1e3829]">TIKIWA LANDS</p>
            <p className="mt-0.5 text-xs text-[#687269]">Sales platform</p>
          </div>
        </div>

        <div className="border border-[#dedfd7] bg-white p-7 shadow-[0_16px_48px_-36px_rgba(25,45,32,0.45)] sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a15b35]">
            Staff access
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#202820]">
            Welcome back
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#687269]">
            Sign in with the account provided by your administrator.
          </p>

          {errorMessage && (
            <p
              role="alert"
              className="mt-6 border-l-2 border-[#a74936] bg-[#fbf2ef] px-3 py-2.5 text-sm text-[#813c30]"
            >
              {errorMessage}
            </p>
          )}

          <form action={signIn} className="mt-7 space-y-5">
            <label className="block text-sm font-medium text-[#303a32]">
              Work email
              <input
                autoComplete="email"
                className="mt-2 h-11 w-full border border-[#d8dbd4] bg-white px-3 text-sm outline-none transition focus:border-[#315b40] focus:ring-2 focus:ring-[#315b40]/15"
                name="email"
                required
                type="email"
              />
            </label>
            <label className="block text-sm font-medium text-[#303a32]">
              Password
              <input
                autoComplete="current-password"
                className="mt-2 h-11 w-full border border-[#d8dbd4] bg-white px-3 text-sm outline-none transition focus:border-[#315b40] focus:ring-2 focus:ring-[#315b40]/15"
                name="password"
                required
                type="password"
              />
            </label>
            <button
              className="flex h-11 w-full items-center justify-center bg-[#1e3829] px-4 text-sm font-medium text-white transition hover:bg-[#294a35] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315b40]"
              type="submit"
            >
              Sign in
            </button>
          </form>
        </div>
        <p className="mt-5 text-center text-xs text-[#7b837b]">
          Staff accounts are managed by Tikiwa Lands.
        </p>
      </section>
    </main>
  );
}