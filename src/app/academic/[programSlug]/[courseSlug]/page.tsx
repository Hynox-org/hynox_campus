import React from "react";
import { getCurrentUser } from "@/services/auth";
import { 
  getProgramBySlug, 
  getCourseBySlug, 
  getCourseInstructors, 
  listTenantInstructors,
  listModules, 
  getAcademicLookups
} from "@/services/academic";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, ArrowLeft, Users, FolderKanban } from "lucide-react";
import CourseSpaceConsole from "./course-space-console";

export const dynamic = "force-dynamic";

interface CourseDetailPageProps {
  params: Promise<{
    programSlug: string;
    courseSlug: string;
  }>;
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { programSlug, courseSlug } = await params;
  const userDetails = await getCurrentUser();
  if (!userDetails) return null;

  const { primaryRole, tenantId } = userDetails;

  // Resolve program and course
  const program = await getProgramBySlug(programSlug, tenantId || "");
  if (!program) redirect("/academic");

  const course = await getCourseBySlug(courseSlug, tenantId || "");
  if (!course) redirect(`/academic/${programSlug}`);

  // Fetch instructors for the course
  const courseInstructors = await getCourseInstructors(course.id);
  const tenantInstructors = await listTenantInstructors(tenantId || "");

  // Fetch course curriculum modules
  const modulesList = await listModules(course.id);

  // Fetch database lookup fields
  const lookups = await getAcademicLookups();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 text-[#0F172A]">
      
      {/* Back Link */}
      <div className="mb-6">
        <Link
          href={`/academic/${programSlug}`}
          className="flex items-center gap-1.5 text-xs text-[#2563EB] font-bold hover:underline mb-4"
        >
          <ArrowLeft size={14} /> Back to Program Courses
        </Link>
        
        <div className="border-b border-[#E2E8F0] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-[10px] uppercase font-bold text-[#475569] tracking-wider">
              <span>{program.title}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
              <span>Course Space</span>
            </div>
            
            <h1 className="text-xl font-bold tracking-tight">{course.title}</h1>
            <p className="text-xs text-[#475569] mt-2 max-w-3xl leading-relaxed">
              {course.description || "No course description provided."}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm shrink-0">
            <FolderKanban className="text-[#2563EB]" size={16} />
            <div className="text-[11px]">
              <div className="font-semibold">Type: <span className="capitalize">{course.course_type?.code || "Theory"}</span></div>
              <div className="text-[#475569]">Mode: <span className="capitalize">{course.enrollment_mode}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main curriculum workspace console */}
      <CourseSpaceConsole
        program={program}
        course={course}
        initialInstructors={courseInstructors}
        tenantInstructors={tenantInstructors}
        initialModules={modulesList}
        primaryRole={primaryRole}
        lookups={lookups}
      />

    </div>
  );
}
