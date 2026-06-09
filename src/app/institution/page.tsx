import { getCurrentUser } from "@/services/auth";
import { listOnboardingInvitations } from "@/services/onboarding";
import { listPrograms, getAcademicLookups, listTenantInstructors } from "@/services/academic";
import { signOutAction } from "@/app/actions/auth-actions";
import { redirect } from "next/navigation";
import { Terminal, LogOut } from "lucide-react";
import InstitutionPanel from "./institution-panel";
import { listCohorts, listEnrollments } from "@/services/delivery";
import { listProjectSubmissions, listChallengeSubmissions } from "@/services/learning";

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

  // Load scoped invitations, cohorts, enrollments, programs, instructors, and submissions in parallel
  let invitations: any[] = [];
  let cohorts: any[] = [];
  let enrollments: any[] = [];
  let programs: any[] = [];
  let instructors: any[] = [];
  let projectSubmissions: any[] = [];
  let challengeSubmissions: any[] = [];
  let lookups: any = {
    courseTypes: [],
    lessonTypes: [],
    statuses: [],
    visibilityTypes: []
  };

  try {
    const [
      allInvitations,
      cohortsRes,
      enrollmentsRes,
      programsRes,
      instructorsRes,
      projectSubmissionsRes,
      challengeSubmissionsRes,
      lookupsRes
    ] = await Promise.all([
      listOnboardingInvitations(),
      listCohorts(tenantId),
      listEnrollments(tenantId),
      listPrograms(tenantId),
      listTenantInstructors(tenantId),
      listProjectSubmissions(tenantId),
      listChallengeSubmissions(tenantId),
      getAcademicLookups()
    ]);

    invitations = (allInvitations || []).filter((inv: any) => inv.tenant_id === tenantId);
    cohorts = cohortsRes || [];
    enrollments = enrollmentsRes || [];
    programs = programsRes || [];
    instructors = instructorsRes || [];
    projectSubmissions = projectSubmissionsRes || [];
    challengeSubmissions = challengeSubmissionsRes || [];
    lookups = lookupsRes || lookups;
  } catch (error) {
    console.error("Failed to load institution admin page datasets:", error);
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
          initialCohorts={cohorts}
          initialEnrollments={enrollments}
          initialProjectSubmissions={projectSubmissions}
          initialChallengeSubmissions={challengeSubmissions}
          lookups={lookups}
        />
      </main>
    </div>
  );
}
