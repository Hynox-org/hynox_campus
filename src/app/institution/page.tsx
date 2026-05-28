import { getCurrentUser } from "@/services/auth";
import { listOnboardingInvitations } from "@/services/onboarding";
import { listPrograms, getAcademicLookups, listTenantInstructors } from "@/services/academic";
import { signOutAction } from "@/app/actions/auth-actions";
import { redirect } from "next/navigation";
import { Terminal, LogOut } from "lucide-react";
import InstitutionPanel from "./institution-panel";

export const dynamic = "force-dynamic";

export default async function InstitutionAdminPage() {
  const userDetails = await getCurrentUser();

  if (!userDetails || userDetails.primaryRole !== "institution_admin") {
    redirect("/login");
  }

  const { authUser, primaryRole, institution, tenantId } = userDetails;

  if (!institution || !tenantId) {
    redirect("/login");
  }

  // Load scoped invitations for this institution
  let invitations: any[] = [];
  try {
    const allInvitations = await listOnboardingInvitations();
    invitations = allInvitations.filter((inv: any) => inv.tenant_id === tenantId);
  } catch (error) {
    console.error("Failed to load invitations:", error);
  }

  // Load programs under this institution
  let programs: any[] = [];
  try {
    programs = await listPrograms(tenantId);
  } catch (error) {
    console.error("Failed to load programs:", error);
  }

  // Load active instructors on this institution
  let instructors: any[] = [];
  try {
    instructors = await listTenantInstructors(tenantId);
  } catch (error) {
    console.error("Failed to load instructors:", error);
  }

  // Load lookups
  let lookups: any = {
    courseTypes: [],
    lessonTypes: [],
    statuses: [],
    visibilityTypes: []
  };
  try {
    lookups = await getAcademicLookups();
  } catch (error) {
    console.error("Failed to load lookups:", error);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-[#0F172A] font-sans">
      <header className="bg-white border-b border-[#E2E8F0] shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#2563EB]/10 text-[#2563EB] p-2 rounded-xl border border-[#2563EB]/20">
              <Terminal size={18} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight">Hynox Campus Portal</span>
              <span className="text-[10px] text-[#475569] font-medium tracking-wide">CAMPUS DASHBOARD</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="hidden sm:inline text-[#475569] font-medium">
              Campus: <strong className="text-[#0F172A] font-bold">{institution.name}</strong>
            </span>
            <span className="px-2 py-0.5 rounded-full font-bold border bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20 text-[10px] capitalize">
              {primaryRole}
            </span>
            
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
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 flex-1 w-full">
        <InstitutionPanel 
          adminEmail={authUser.email} 
          institution={institution}
          initialInvitations={invitations}
          initialPrograms={programs}
          initialInstructors={instructors}
          lookups={lookups}
        />
      </main>
    </div>
  );
}
