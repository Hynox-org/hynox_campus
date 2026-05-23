import { getCurrentUser } from "@/services/auth";
import { signOutAction } from "@/app/actions/auth-actions";
import { redirect } from "next/navigation";
import { Terminal, LogOut, CheckSquare, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeacherPage() {
  const userDetails = await getCurrentUser();

  if (
    !userDetails ||
    (userDetails.primaryRole !== "teacher" && userDetails.primaryRole !== "trainer")
  ) {
    redirect("/login");
  }

  const { authUser, primaryRole, institution } = userDetails;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-[#0F172A] font-sans">
      <header className="bg-white border-b border-[#E2E8F0] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#2563EB]/10 text-[#2563EB] p-2 rounded-xl border border-[#2563EB]/20">
              <Terminal size={18} />
            </div>
            <span className="font-bold text-sm tracking-tight">Hynox Campus Portal</span>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/20 px-3 py-1.5 rounded-lg hover:bg-[#DC2626] hover:text-white transition-all text-xs font-semibold"
            >
              <LogOut size={13} />
              Sign Out
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 flex-1 w-full space-y-6">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#2563EB]/10 text-[#2563EB] p-2.5 rounded-xl border border-[#2563EB]/20">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold">Instructor & Validator Portal</h2>
              <p className="text-xs text-[#475569]">Syllabus management and code reviews</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 mb-6">
            <div>
              <span className="text-[10px] font-bold text-[#475569] block uppercase tracking-wide">Teacher Email</span>
              <span className="font-semibold">{authUser.email}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#475569] block uppercase tracking-wide">Resolved RBAC Role</span>
              <span className="font-semibold inline-flex px-2 py-0.5 rounded bg-[#2563EB]/15 text-[#2563EB] font-bold mt-1 text-[10px]">
                {primaryRole}
              </span>
            </div>
            <div className="md:col-span-2 border-t border-[#E2E8F0] pt-3 mt-1">
              <span className="text-[10px] font-bold text-[#475569] block uppercase tracking-wide">Linked Tenant Institution</span>
              <span className="font-semibold text-sm block mt-1">
                {institution ? `${institution.name} (${institution.institution_code})` : "Public Cohort (No linked institution)"}
              </span>
            </div>
          </div>

          <div className="border border-dashed border-[#E2E8F0] rounded-xl p-6 text-center text-xs text-[#475569]">
            <CheckSquare className="mx-auto mb-2 text-[#475569]/60" size={30} />
            <p className="font-medium text-[#0F172A]">Lab Submissions & Gradebooks</p>
            <p className="mt-1">This module is connected to the backend. Teacher validation checks succeeded.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
