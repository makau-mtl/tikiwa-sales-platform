import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createProject } from "../../actions";
import { ProjectForm } from "../project-form";
import { ToastFeedback } from "@/components/toast-feedback";

export default async function NewProjectPage({
  searchParams,
}: PageProps<"/admin/projects/new">) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    : { data: null };

  if (profile?.role !== "admin") redirect("/admin");

  return (
    <section className="max-w-3xl">
      <Link href="/admin" className="text-sm font-medium text-[#526457] hover:text-[#1e3829]">
        ← Projects
      </Link>
      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-[#a15b35]">
        Inventory
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-[#202820]">Create project</h1>
      <p className="mt-2 text-sm text-[#687269]">Start with the project name and location. Add more details now or later.</p>
      <ToastFeedback message={error} />
      <div className="mt-8 border-y border-[#dfe2da] py-7">
        <ProjectForm action={createProject} submitLabel="Create project" />
      </div>
    </section>
  );
}