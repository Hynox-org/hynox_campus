"use client";

import React, { useState } from "react";
import { 
  uploadCsvOnboardingAction,
  regenerateInvitationAction,
  listInstitutionUsersAction,
  onboardSingleUserAction,
  listInvitationsAction
} from "@/app/actions/institution-actions";
import { 
  createProgramAction,
  updateProgramAction,
  deleteProgramAction,
  createCourseAction,
  updateCourseAction,
  deleteCourseAction,
  assignCourseInstructorsAction,
  createModuleAction,
  updateModuleAction,
  deleteModuleAction,
  createLessonAction,
  updateLessonAction,
  deleteLessonAction,
  createLessonResourceAction,
  deleteLessonResourceAction,
  listLessonsAction,
  listLessonResourcesAction,
  listProgramsAction,
  listCoursesAction,
  listModulesAction,
  getCourseInstructorsAction,
  listTenantInstructorsAction,
  getAcademicLookupsAction
} from "@/app/actions/academic-actions";
import { signOutAction } from "@/app/actions/auth-actions";
import * as XLSX from "xlsx";
import { 
  Building, 
  UserPlus, 
  FileSpreadsheet, 
  LogOut, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Link as LinkIcon, 
  Globe, 
  Code,
  Copy,
  Search,
  RefreshCw,
  Clock,
  ShieldCheck,
  CheckCircle,
  XCircle,
  HelpCircle,
  Ban,
  Download,
  Upload,
  GraduationCap,
  Folder,
  ArrowRight,
  Edit,
  Trash2,
  ExternalLink,
  File,
  Link2,
  CheckSquare,
  Code2,
  Activity,
  Award,
  Video,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  Save,
  Users
} from "lucide-react";

interface InstitutionPanelProps {
  adminEmail: string;
  institution: any;
  initialInvitations: any[];
  initialPrograms: any[];
  initialInstructors: any[];
  initialCohorts: any[];
  initialEnrollments: any[];
  initialProjectSubmissions: any[];
  initialChallengeSubmissions: any[];
  lookups: any;
}

export default function InstitutionPanel({ 
  adminEmail, 
  institution, 
  initialInvitations, 
  initialPrograms,
  initialInstructors,
  initialCohorts,
  initialEnrollments,
  initialProjectSubmissions,
  initialChallengeSubmissions,
  lookups 
}: InstitutionPanelProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "academics" | "onboarding" | "explorer">("overview");
  const [invitations, setInvitations] = useState<any[]>(initialInvitations);
  const [cohorts, setCohorts] = useState<any[]>(initialCohorts || []);
  const [enrollments, setEnrollments] = useState<any[]>(initialEnrollments || []);
  const [projectSubmissions, setProjectSubmissions] = useState<any[]>(initialProjectSubmissions || []);
  const [challengeSubmissions, setChallengeSubmissions] = useState<any[]>(initialChallengeSubmissions || []);
  const [inviteSearch, setInviteSearch] = useState("");
  const [inviteFilter, setInviteFilter] = useState<"all" | "pending" | "accepted" | "expired" | "failed" | "revoked">("all");
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  // User Registry / Explorer states
  const [explorerUsers, setExplorerUsers] = useState<any[]>([]);
  const [explorerLoading, setExplorerLoading] = useState(false);
  const [explorerSearch, setExplorerSearch] = useState("");
  const [explorerRoleFilter, setExplorerRoleFilter] = useState<"all" | "admin" | "teacher" | "student">("all");

  // Status states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [links, setLinks] = useState<any[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState("");

  // Single-user onboarding form states
  const [onboardMode, setOnboardMode] = useState<"single" | "csv">("single");
  const [singleName, setSingleName] = useState("");
  const [singleEmail, setSingleEmail] = useState("");
  const [singleRole, setSingleRole] = useState("student");
  const [csvContent, setCsvContent] = useState("");

  // Academic Builder states
  const [acadPrograms, setAcadPrograms] = useState<any[]>(initialPrograms);
  const [acadSelectedProgram, setAcadSelectedProgram] = useState<any | null>(null);
  const [acadCourses, setAcadCourses] = useState<any[]>([]);
  const [acadSelectedCourse, setAcadSelectedCourse] = useState<any | null>(null);
  const [acadModules, setAcadModules] = useState<any[]>([]);
  const [acadInstructors, setAcadInstructors] = useState<any[]>([]);
  const [acadTenantTeachers, setAcadTenantTeachers] = useState<any[]>(initialInstructors);
  const [acadLookups] = useState<any>(lookups);

  // Modal / Form Open States
  const [programModalOpen, setProgramModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<any | null>(null);
  const [programForm, setProgramForm] = useState({ title: "", slug: "", description: "", status_id: "", visibility_type_id: "" });

  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [courseForm, setCourseForm] = useState({
    title: "",
    slug: "",
    description: "",
    course_type_id: "",
    status_id: "",
    visibility_type_id: "",
    enrollment_mode: "open" as any,
    duration_minutes: 0,
    thumbnail_path: ""
  });

  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<any | null>(null);
  const [moduleForm, setModuleForm] = useState({ title: "", description: "", position: 1, status_id: "" });

  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any | null>(null);
  const [lessonSelectedModuleId, setLessonSelectedModuleId] = useState("");
  const [lessonForm, setLessonForm] = useState({
    title: "",
    lesson_type_id: "",
    content_json_str: "{}",
    video_url: "",
    duration: 0,
    position: 1,
    is_preview: false,
    status_id: ""
  });

  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [resourceSelectedLessonId, setResourceSelectedLessonId] = useState("");
  const [resourceForm, setResourceForm] = useState({
    title: "",
    resource_type: "link",
    file_url: "",
    external_url: "",
    position: 1
  });

  // Set default lookup values for forms
  React.useEffect(() => {
    if (acadLookups) {
      const activeStatus = acadLookups.statuses.find((s: any) => s.code === "active")?.id || "";
      const publicVisibility = acadLookups.visibilityTypes.find((v: any) => v.code === "public")?.id || "";
      
      setProgramForm(f => ({ ...f, status_id: activeStatus, visibility_type_id: publicVisibility }));
      setCourseForm(f => ({ ...f, status_id: activeStatus, visibility_type_id: publicVisibility }));
      setModuleForm(f => ({ ...f, status_id: activeStatus }));
      setLessonForm(f => ({ ...f, status_id: activeStatus }));
    }
  }, [acadLookups]);

  // Load explorer users
  const loadExplorerUsers = async () => {
    setExplorerLoading(true);
    setError("");
    const res = await listInstitutionUsersAction(institution.id);
    if (res.error) {
      setError(res.error);
      setExplorerUsers([]);
    } else if (res.users) {
      setExplorerUsers(res.users);
    }
    setExplorerLoading(false);
  };

  React.useEffect(() => {
    if (activeTab === "explorer") {
      loadExplorerUsers();
    }
  }, [activeTab]);

  React.useEffect(() => {
    if (!acadSelectedProgram) {
      setAcadCourses([]);
      setAcadSelectedCourse(null);
      setAcadModules([]);
      return;
    }

    async function loadCourses() {
      setLoading(true);
      setError("");
      const res = await listCoursesAction(acadSelectedProgram.id);
      if (res.error) {
        setError(res.error);
      } else if (res.courses) {
        setAcadCourses(res.courses);
      }
      setLoading(false);
    }
    loadCourses();
  }, [acadSelectedProgram]);

  React.useEffect(() => {
    if (!acadSelectedCourse) {
      setAcadModules([]);
      setAcadInstructors([]);
      return;
    }

    async function loadCourseDetails() {
      setLoading(true);
      setError("");
      
      const mRes = await listModulesAction(acadSelectedCourse.id);
      if (mRes.error) {
        setError(mRes.error);
      } else if (mRes.modules) {
        const modulesWithLessons = await Promise.all(
          mRes.modules.map(async (m: any) => {
            const lRes = await listLessonsAction(m.id);
            const lessons = lRes.lessons || [];
            const lessonsWithResources = await Promise.all(
              lessons.map(async (l: any) => {
                const rRes = await listLessonResourcesAction(l.id);
                return { ...l, resources: rRes.resources || [] };
              })
            );
            return { ...m, lessons: lessonsWithResources };
          })
        );
        setAcadModules(modulesWithLessons);
      }

      const iRes = await getCourseInstructorsAction(acadSelectedCourse.id);
      if (iRes.error) {
        setError(iRes.error);
      } else if (iRes.instructors) {
        setAcadInstructors(iRes.instructors);
      }

      setLoading(false);
    }
    loadCourseDetails();
  }, [acadSelectedCourse]);

  const refreshCourseDetails = async (courseId: string) => {
    const mRes = await listModulesAction(courseId);
    if (mRes.modules) {
      const modulesWithLessons = await Promise.all(
        mRes.modules.map(async (m: any) => {
          const lRes = await listLessonsAction(m.id);
          const lessons = lRes.lessons || [];
          const lessonsWithResources = await Promise.all(
            lessons.map(async (l: any) => {
              const rRes = await listLessonResourcesAction(l.id);
              return { ...l, resources: rRes.resources || [] };
            })
          );
          return { ...m, lessons: lessonsWithResources };
        })
      );
      setAcadModules(modulesWithLessons);
    }
  };

  const refreshPrograms = async () => {
    const res = await listProgramsAction(institution.id);
    if (res.programs) {
      setAcadPrograms(res.programs);
      if (acadSelectedProgram) {
        const updated = res.programs.find((p: any) => p.id === acadSelectedProgram.id);
        if (updated) setAcadSelectedProgram(updated);
      }
    }
  };

  const refreshCourses = async () => {
    if (!acadSelectedProgram) return;
    const res = await listCoursesAction(acadSelectedProgram.id);
    if (res.courses) {
      setAcadCourses(res.courses);
      if (acadSelectedCourse) {
        const updated = res.courses.find((c: any) => c.id === acadSelectedCourse.id);
        if (updated) setAcadSelectedCourse(updated);
      }
    }
  };

  const handleProgramSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    let res;
    if (editingProgram) {
      res = await updateProgramAction(editingProgram.id, programForm);
    } else {
      res = await createProgramAction({
        ...programForm,
        tenant_id: institution.id,
        institution_id: institution.id
      });
    }

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(`Program saved successfully!`);
      setProgramModalOpen(false);
      setEditingProgram(null);
      await refreshPrograms();
    }
    setLoading(false);
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    let res;
    if (editingCourse) {
      res = await updateCourseAction(editingCourse.id, courseForm);
    } else {
      res = await createCourseAction({
        ...courseForm,
        program_id: acadSelectedProgram.id,
        tenant_id: institution.id,
        institution_id: institution.id
      });
    }

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(`Course saved successfully!`);
      setCourseModalOpen(false);
      setEditingCourse(null);
      await refreshCourses();
    }
    setLoading(false);
  };

  const handleModuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    let res;
    if (editingModule) {
      res = await updateModuleAction(editingModule.id, moduleForm);
    } else {
      res = await createModuleAction({
        ...moduleForm,
        course_id: acadSelectedCourse.id,
        tenant_id: institution.id,
        institution_id: institution.id
      });
    }

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(`Module saved successfully!`);
      setModuleModalOpen(false);
      setEditingModule(null);
      await refreshCourseDetails(acadSelectedCourse.id);
    }
    setLoading(false);
  };

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    let content_json = {};
    try {
      content_json = JSON.parse(lessonForm.content_json_str);
    } catch (err) {
      setError("Content JSON must be valid JSON.");
      setLoading(false);
      return;
    }

    let res;
    if (editingLesson) {
      res = await updateLessonAction(editingLesson.id, {
        title: lessonForm.title,
        lesson_type_id: lessonForm.lesson_type_id,
        content_json,
        video_url: lessonForm.video_url || undefined,
        duration: lessonForm.duration,
        position: lessonForm.position,
        is_preview: lessonForm.is_preview,
        status_id: lessonForm.status_id
      });
    } else {
      res = await createLessonAction({
        module_id: lessonSelectedModuleId,
        title: lessonForm.title,
        lesson_type_id: lessonForm.lesson_type_id,
        content_json,
        video_url: lessonForm.video_url || undefined,
        duration: lessonForm.duration,
        position: lessonForm.position,
        is_preview: lessonForm.is_preview,
        status_id: lessonForm.status_id,
        tenant_id: institution.id,
        institution_id: institution.id
      });
    }

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(`Lesson saved successfully!`);
      setLessonModalOpen(false);
      setEditingLesson(null);
      await refreshCourseDetails(acadSelectedCourse.id);
    }
    setLoading(false);
  };

  const handleResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const res = await createLessonResourceAction({
      lesson_id: resourceSelectedLessonId,
      title: resourceForm.title,
      resource_type: resourceForm.resource_type,
      file_url: resourceForm.file_url || undefined,
      external_url: resourceForm.external_url || undefined,
      position: resourceForm.position,
      tenant_id: institution.id,
      institution_id: institution.id
    });

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(`Resource added successfully!`);
      setResourceModalOpen(false);
      await refreshCourseDetails(acadSelectedCourse.id);
    }
    setLoading(false);
  };

  const handleSaveInstructors = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const instructorIds = acadInstructors.map(i => i.user_id);
    const res = await assignCourseInstructorsAction(acadSelectedCourse.id, instructorIds);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(`Instructors assigned successfully!`);
    }
    setLoading(false);
  };

  const handleRegenerateInvite = async (invitationId: string) => {
    setRegeneratingId(invitationId);
    setError("");
    setSuccess("");
    
    const res = await regenerateInvitationAction(invitationId);
    if (res.error) {
      setError(res.error);
    } else if (res.invitation) {
      setSuccess(`Successfully regenerated invitation token!`);
      setInvitations((prev) =>
        prev.map((inv) => {
          if (inv.id === invitationId) {
            return {
              ...inv,
              token: res.invitation.token,
              expires_at: res.invitation.expires_at,
              status: res.invitation.status,
              accepted_at: null,
              user: inv.user ? { ...inv.user, status: "invited" } : undefined
            };
          }
          return inv;
        })
      );
    }
    setRegeneratingId(null);
  };

  const computedStats = React.useMemo(() => {
    let total = invitations.length;
    let accepted = 0;
    let pending = 0;
    let expired = 0;
    let failed = 0;
    let revoked = 0;

    const now = new Date();

    invitations.forEach((inv) => {
      const isExpired = inv.status === "expired" || (["pending", "created", "sent"].includes(inv.status) && new Date(inv.expires_at) < now);
      if (inv.status === "accepted") {
        accepted++;
      } else if (isExpired) {
        expired++;
      } else if (inv.status === "failed") {
        failed++;
      } else if (inv.status === "revoked") {
        revoked++;
      } else {
        pending++;
      }
    });

    return { total, accepted, pending, expired, failed, revoked };
  }, [invitations]);

  const filteredInvitations = React.useMemo(() => {
    return invitations.filter((inv) => {
      const searchLower = inviteSearch.toLowerCase();
      const nameMatch = inv.user?.full_name?.toLowerCase().includes(searchLower);
      const emailMatch = inv.user?.email?.toLowerCase().includes(searchLower);
      const searchMatch = !inviteSearch || nameMatch || emailMatch;

      if (!searchMatch) return false;

      if (inviteFilter === "all") return true;

      const now = new Date();
      const isExpired = inv.status === "expired" || (["pending", "created", "sent"].includes(inv.status) && new Date(inv.expires_at) < now);

      if (inviteFilter === "accepted") return inv.status === "accepted";
      if (inviteFilter === "expired") return isExpired;
      if (inviteFilter === "failed") return inv.status === "failed";
      if (inviteFilter === "revoked") return inv.status === "revoked";
      if (inviteFilter === "pending") return ["pending", "created", "sent"].includes(inv.status) && !isExpired;

      return true;
    });
  }, [invitations, inviteSearch, inviteFilter]);

  const computedExplorerStats = React.useMemo(() => {
    let admins = 0;
    let teachers = 0;
    let students = 0;

    explorerUsers.forEach((u) => {
      const isTeacher = u.roles.includes("teacher") || u.roles.includes("trainer");
      const isAdmin = u.roles.includes("institution_admin") || u.roles.includes("super_admin");
      const isStudent = u.roles.includes("student");

      if (isAdmin) admins++;
      if (isTeacher) teachers++;
      if (isStudent) students++;
    });

    return { total: explorerUsers.length, admins, teachers, students };
  }, [explorerUsers]);

  const filteredExplorerUsers = React.useMemo(() => {
    return explorerUsers.filter((u) => {
      const searchLower = explorerSearch.toLowerCase();
      const nameMatch = u.full_name?.toLowerCase().includes(searchLower);
      const emailMatch = u.email?.toLowerCase().includes(searchLower);
      const searchMatch = !explorerSearch || nameMatch || emailMatch;

      if (!searchMatch) return false;

      if (explorerRoleFilter === "all") return true;
      if (explorerRoleFilter === "admin") return u.roles.includes("institution_admin") || u.roles.includes("super_admin");
      if (explorerRoleFilter === "teacher") return u.roles.includes("teacher") || u.roles.includes("trainer");
      if (explorerRoleFilter === "student") return u.roles.includes("student");

      return true;
    });
  }, [explorerUsers, explorerSearch, explorerRoleFilter]);

  const clearStatuses = () => {
    setError("");
    setSuccess("");
    setLinks([]);
    setUploadedFileName("");
  };

  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearStatuses();

    if (!csvContent.trim()) {
      setError("Please paste CSV contents.");
      setLoading(false);
      return;
    }

    const res = await uploadCsvOnboardingAction(institution.id, csvContent);
    if (res.error) {
      setError(res.error);
    } else if (res.results) {
      setLinks(res.results);
      const errors = res.results.filter((r: any) => r.status === "error");
      const successes = res.results.filter((r: any) => r.status === "success");
      
      setSuccess(`Processed CSV: ${successes.length} provisioned successfully, ${errors.length} errors.`);
      
      const freshInvites = await listInvitationsAction();
      if (freshInvites.invitations) {
        setInvitations(freshInvites.invitations);
      }
    }
    setLoading(false);
  };

  const handleSingleUserOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearStatuses();

    const res = await onboardSingleUserAction({
      email: singleEmail,
      name: singleName,
      role: singleRole,
      institutionId: institution.id
    });

    if (res.error) {
      setError(res.error);
    } else if (res.result) {
      if (res.result.status === "error") {
        setError(res.result.error || "Onboarding failed.");
      } else {
        setSuccess(`Onboarding link created for ${singleEmail}!`);
        setLinks([res.result]);
        setSingleEmail("");
        setSingleName("");
        
        const freshInvites = await listInvitationsAction();
        if (freshInvites.invitations) {
          setInvitations(freshInvites.invitations);
        }
      }
    }
    setLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to CSV
        const csv = XLSX.utils.sheet_to_csv(sheet);
        setCsvContent(csv);
        setSuccess(`Loaded spreadsheet file '${file.name}' successfully! Verify the pasted CSV contents below.`);
      } catch (err: any) {
        setError(`Failed to read spreadsheet file: ${err.message}`);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("Onboarding verification link copied to clipboard!");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
      
      {/* Sidebar Navigation */}
      <div className="md:col-span-1 bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm flex flex-col gap-2">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E8F0] mb-2">
          <div className="bg-[#2563EB]/10 text-[#2563EB] p-2.5 rounded-xl border border-[#2563EB]/20">
            <Building size={16} />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-xs text-[#0F172A] truncate">{institution.name}</h2>
            <p className="text-[10px] text-[#475569] font-mono truncate">{institution.institution_code}</p>
          </div>
        </div>

        <button
          onClick={() => {
            setActiveTab("overview");
            clearStatuses();
          }}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
            activeTab === "overview"
              ? "bg-[#2563EB]/10 border-[#2563EB]/20 text-[#2563EB] shadow-sm"
              : "bg-white border-[#E2E8F0] hover:bg-slate-50 text-[#475569] hover:text-[#0F172A]"
          }`}
        >
          <Building size={16} />
          Overview
        </button>

        <button
          onClick={() => {
            setActiveTab("academics");
            clearStatuses();
          }}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
            activeTab === "academics"
              ? "bg-[#2563EB]/10 border-[#2563EB]/20 text-[#2563EB] shadow-sm"
              : "bg-white border-[#E2E8F0] hover:bg-slate-50 text-[#475569] hover:text-[#0F172A]"
          }`}
        >
          <GraduationCap size={16} />
          Academic Builder
        </button>

        <button
          onClick={() => {
            setActiveTab("onboarding");
            clearStatuses();
          }}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
            activeTab === "onboarding"
              ? "bg-[#2563EB]/10 border-[#2563EB]/20 text-[#2563EB] shadow-sm"
              : "bg-white border-[#E2E8F0] hover:bg-slate-50 text-[#475569] hover:text-[#0F172A]"
          }`}
        >
          <ShieldCheck size={16} />
          Onboard Members
        </button>

        <button
          onClick={() => {
            setActiveTab("explorer");
            clearStatuses();
          }}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
            activeTab === "explorer"
              ? "bg-[#2563EB]/10 border-[#2563EB]/20 text-[#2563EB] shadow-sm"
              : "bg-white border-[#E2E8F0] hover:bg-slate-50 text-[#475569] hover:text-[#0F172A]"
          }`}
        >
          <Users size={16} />
          User Registry
        </button>
      </div>

      {/* Main Content Area */}
      <div className="md:col-span-3 flex flex-col gap-6">
        {/* Alerts */}
        {error && (
          <div className="bg-[#DC2626]/5 border border-[#DC2626]/20 text-[#DC2626] rounded-xl p-4 text-xs flex items-start gap-2 animate-fade-in">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-[#16A34A]/5 border border-[#16A34A]/20 text-[#16A34A] rounded-xl p-4 text-xs flex items-start gap-2 animate-fade-in">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Total Cohorts</span>
                  <div className="p-2 bg-[#2563EB]/10 text-[#2563EB] rounded-xl"><Folder size={18} /></div>
                </div>
                <h2 className="text-2xl font-bold text-[#0F172A]">{cohorts.length}</h2>
                <p className="text-[10px] text-[#475569] mt-1">Managed educational cohorts</p>
              </div>

              <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Enrolled Students</span>
                  <div className="p-2 bg-[#16A34A]/10 text-[#16A34A] rounded-xl"><Users size={18} /></div>
                </div>
                <h2 className="text-2xl font-bold text-[#0F172A]">{enrollments.length}</h2>
                <p className="text-[10px] text-[#475569] mt-1">Active class consumers</p>
              </div>

              <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Approved Projects</span>
                  <div className="p-2 bg-[#F59E0B]/10 text-[#F59E0B] rounded-xl"><CheckSquare size={18} /></div>
                </div>
                <h2 className="text-2xl font-bold text-[#0F172A]">
                  {projectSubmissions.filter(p => p.review?.review_status === "approved").length}
                </h2>
                <p className="text-[10px] text-[#475569] mt-1">Verified student projects</p>
              </div>

              <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Challenge Runs</span>
                  <div className="p-2 bg-[#06B6D4]/10 text-[#06B6D4] rounded-xl"><Code2 size={18} /></div>
                </div>
                <h2 className="text-2xl font-bold text-[#0F172A]">{challengeSubmissions.length}</h2>
                <p className="text-[10px] text-[#475569] mt-1">Lab code validations run</p>
              </div>
            </div>

            {/* Main Overview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Student Performance Leaderboard */}
              <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
                      <Award size={16} className="text-[#2563EB]" /> Student Performance Directory
                    </h3>
                    <p className="text-[10px] text-[#475569] mt-0.5">Tracking student deliverables and lab runs</p>
                  </div>
                </div>

                {enrollments.length === 0 ? (
                  <p className="text-xs text-[#475569] text-center py-10 border border-dashed border-[#E2E8F0] rounded-xl">
                    No student performance records found yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#E2E8F0] text-[#475569]">
                          <th className="py-2.5 font-bold uppercase">Rank</th>
                          <th className="py-2.5 font-bold uppercase">Student</th>
                          <th className="py-2.5 font-bold uppercase">Cohort</th>
                          <th className="py-2.5 font-bold uppercase text-center">Projects</th>
                          <th className="py-2.5 font-bold uppercase text-center">Lab Challenges</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {enrollments.map((enr, idx) => {
                          const studentProjCount = projectSubmissions.filter(p => p.student_id === enr.student_id).length;
                          const studentProjApproved = projectSubmissions.filter(p => p.student_id === enr.student_id && p.review?.review_status === "approved").length;
                          const studentChalCount = challengeSubmissions.filter(c => c.student_id === enr.student_id).length;
                          const cohortName = cohorts.find(c => c.id === enr.cohort_id)?.name || "Unknown";

                          return (
                            <tr key={enr.id} className="hover:bg-slate-50/50">
                              <td className="py-3 font-semibold text-slate-500">#{idx + 1}</td>
                              <td className="py-3 font-bold text-[#0F172A]">
                                <div>{enr.user?.full_name || "New Student"}</div>
                                <div className="text-[10px] text-[#475569] font-normal">{enr.user?.email}</div>
                              </td>
                              <td className="py-3 font-medium text-[#475569]">{cohortName}</td>
                              <td className="py-3 text-center">
                                <span className="px-2 py-0.5 bg-[#16A34A]/10 text-[#16A34A] rounded text-[10px] font-bold">
                                  {studentProjApproved} / {studentProjCount} Approved
                                </span>
                              </td>
                              <td className="py-3 text-center">
                                <span className="px-2 py-0.5 bg-[#2563EB]/10 text-[#2563EB] rounded text-[10px] font-bold">
                                  {studentChalCount} Completed
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Sidebar: Cohorts & Live Feed */}
              <div className="space-y-6">
                {/* Cohorts Progress List */}
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-[#0F172A] uppercase pb-2 border-b border-[#E2E8F0] flex items-center gap-1.5">
                    <Activity size={14} className="text-[#2563EB]" /> active cohorts
                  </h3>
                  {cohorts.length === 0 ? (
                    <p className="text-xs text-[#475569] text-center py-6">No academic cohorts created yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {cohorts.map(coh => {
                        const studCount = enrollments.filter(e => e.cohort_id === coh.id).length;
                        return (
                          <div key={coh.id} className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-xl text-[10px] flex justify-between items-center">
                            <div>
                              <span className="font-bold text-[#0F172A] block">{coh.name}</span>
                              <span className="text-[#475569] font-mono">{coh.code}</span>
                            </div>
                            <span className="bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20 px-2 py-0.5 rounded-full font-bold">
                              {studCount} Students
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Recent submissions feed */}
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-[#0F172A] uppercase pb-2 border-b border-[#E2E8F0] flex items-center gap-1.5">
                    <Clock size={14} className="text-[#2563EB]" /> recent submissions
                  </h3>
                  
                  {projectSubmissions.length === 0 && challengeSubmissions.length === 0 ? (
                    <p className="text-xs text-[#475569] text-center py-6">No recent learning actions recorded.</p>
                  ) : (
                    <div className="space-y-3">
                      {projectSubmissions.slice(0, 3).map(sub => (
                        <div key={sub.id} className="p-2.5 border border-[#E2E8F0] rounded-xl text-[10px] space-y-1">
                          <div className="flex justify-between font-bold text-[#0F172A]">
                            <span className="truncate">{sub.project_title}</span>
                            <span className="text-[#F59E0B] capitalize shrink-0 font-medium">{sub.review?.review_status || "pending"}</span>
                          </div>
                          <p className="text-[#475569]">
                            Project submitted by <strong className="text-[#0F172A]">{sub.student?.full_name || "Student"}</strong>
                          </p>
                        </div>
                      ))}

                      {challengeSubmissions.slice(0, 3).map(sub => (
                        <div key={sub.id} className="p-2.5 border border-[#E2E8F0] rounded-xl text-[10px] space-y-1">
                          <div className="flex justify-between font-bold text-[#0F172A]">
                            <span className="truncate">{sub.challenge_title}</span>
                            <span className="text-[#2563EB] shrink-0 font-medium">completed</span>
                          </div>
                          <p className="text-[#475569]">
                            Challenge run by <strong className="text-[#0F172A]">{sub.student?.full_name || "Student"}</strong>
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ACADEMIC BUILDER */}
        {activeTab === "academics" && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Programs & Courses */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Programs Section */}
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                      <Folder size={14} className="text-[#2563EB]" /> Programs
                    </h4>
                    <button
                      onClick={() => {
                        setEditingProgram(null);
                        const activeStatus = acadLookups.statuses.find((s: any) => s.code === "active")?.id || "";
                        const publicVisibility = acadLookups.visibilityTypes.find((v: any) => v.code === "public")?.id || "";
                        setProgramForm({ title: "", slug: "", description: "", status_id: activeStatus, visibility_type_id: publicVisibility });
                        setProgramModalOpen(true);
                      }}
                      className="flex items-center gap-1 bg-[#2563EB] text-white px-2 py-1 rounded-lg hover:bg-[#2563EB]/95 transition-all text-[10px] font-bold shadow-sm"
                    >
                      <Plus size={12} /> Add
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {acadPrograms.length > 0 ? (
                      acadPrograms.map((prog) => (
                        <div
                          key={prog.id}
                          onClick={() => {
                            setAcadSelectedProgram(prog);
                            setAcadSelectedCourse(null);
                          }}
                          className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                            acadSelectedProgram?.id === prog.id
                              ? "bg-[#2563EB]/10 border-[#2563EB]/30 text-[#2563EB]"
                              : "bg-slate-50/50 hover:bg-slate-50 border-[#E2E8F0] text-[#0F172A]"
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <p className="font-semibold truncate">{prog.title}</p>
                            <p className="text-[10px] text-[#475569] font-mono truncate">/{prog.slug}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingProgram(prog);
                                setProgramForm({
                                  title: prog.title,
                                  slug: prog.slug,
                                  description: prog.description || "",
                                  status_id: prog.status_id,
                                  visibility_type_id: prog.visibility_type_id
                                });
                                setProgramModalOpen(true);
                              }}
                              className="p-1 hover:bg-slate-200 rounded text-[#475569] hover:text-[#0F172A]"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm("Are you sure you want to delete this program?")) {
                                  const res = await deleteProgramAction(prog.id);
                                  if (res.error) setError(res.error);
                                  else {
                                    setSuccess("Program deleted successfully!");
                                    if (acadSelectedProgram?.id === prog.id) setAcadSelectedProgram(null);
                                    await refreshPrograms();
                                  }
                                }
                              }}
                              className="p-1 hover:bg-red-50 rounded text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-[#475569] text-center py-4 bg-slate-50/50 rounded-lg">No programs registered yet.</p>
                    )}
                  </div>
                </div>

                {/* Courses Section */}
                {acadSelectedProgram && (
                  <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                          <GraduationCap size={14} className="text-[#2563EB]" /> Courses
                        </h4>
                        <p className="text-[10px] text-[#475569] truncate font-medium">under: {acadSelectedProgram.title}</p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingCourse(null);
                          const activeStatus = acadLookups.statuses.find((s: any) => s.code === "active")?.id || "";
                          const publicVisibility = acadLookups.visibilityTypes.find((v: any) => v.code === "public")?.id || "";
                          const defaultType = acadLookups.courseTypes[0]?.id || "";
                          setCourseForm({
                            title: "",
                            slug: "",
                            description: "",
                            course_type_id: defaultType,
                            status_id: activeStatus,
                            visibility_type_id: publicVisibility,
                            enrollment_mode: "open",
                            duration_minutes: 60,
                            thumbnail_path: ""
                          });
                          setCourseModalOpen(true);
                        }}
                        className="flex items-center gap-1 bg-[#2563EB] text-white px-2 py-1 rounded-lg hover:bg-[#2563EB]/95 transition-all text-[10px] font-bold shadow-sm shrink-0"
                      >
                        <Plus size={12} /> Add
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                      {acadCourses.length > 0 ? (
                        acadCourses.map((crs) => (
                          <div
                            key={crs.id}
                            onClick={() => setAcadSelectedCourse(crs)}
                            className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                              acadSelectedCourse?.id === crs.id
                                ? "bg-[#2563EB]/10 border-[#2563EB]/30 text-[#2563EB]"
                                : "bg-slate-50/50 hover:bg-slate-50 border-[#E2E8F0] text-[#0F172A]"
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <p className="font-semibold truncate">{crs.title}</p>
                              <p className="text-[10px] text-[#475569] truncate font-mono">/{crs.slug}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingCourse(crs);
                                  setCourseForm({
                                    title: crs.title,
                                    slug: crs.slug,
                                    description: crs.description || "",
                                    course_type_id: crs.course_type_id || "",
                                    status_id: crs.status_id || "",
                                    visibility_type_id: crs.visibility_type_id || "",
                                    enrollment_mode: crs.enrollment_mode || "open",
                                    duration_minutes: crs.duration_minutes || 0,
                                    thumbnail_path: crs.thumbnail_path || ""
                                  });
                                  setCourseModalOpen(true);
                                }}
                                className="p-1 hover:bg-slate-200 rounded text-[#475569] hover:text-[#0F172A]"
                              >
                                <Edit size={12} />
                              </button>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (confirm("Are you sure you want to delete this course?")) {
                                    const res = await deleteCourseAction(crs.id);
                                    if (res.error) setError(res.error);
                                    else {
                                      setSuccess("Course deleted successfully!");
                                      if (acadSelectedCourse?.id === crs.id) setAcadSelectedCourse(null);
                                      await refreshCourses();
                                    }
                                  }
                                }}
                                className="p-1 hover:bg-red-50 rounded text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-[#475569] text-center py-4 bg-slate-50/50 rounded-lg font-medium">No courses in this program.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right 2 Columns: Selected Course Curriculum & Instructors */}
              <div className="lg:col-span-2 space-y-6">
                {acadSelectedCourse ? (
                  <>
                    {/* Course Overview & Instructors Map */}
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] pb-4">
                        <div>
                          <h3 className="text-sm font-bold text-[#0F172A]">{acadSelectedCourse.title}</h3>
                          <p className="text-xs text-[#475569] mt-0.5">{acadSelectedCourse.description || "No description set for this course."}</p>
                        </div>
                        <div className="mt-2 sm:mt-0 bg-slate-100 px-3 py-1.5 rounded-lg text-[11px] text-[#0F172A] border border-[#E2E8F0] font-mono shrink-0 font-semibold">
                          Duration: {acadSelectedCourse.duration_minutes || 0} mins
                        </div>
                      </div>

                      {/* Instructors Panel */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                          <Users size={14} className="text-[#2563EB]" /> Course Instructors (Teachers/Trainers)
                        </h4>
                        
                        <form onSubmit={handleSaveInstructors} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[160px] overflow-y-auto p-1 border border-[#E2E8F0] rounded-lg">
                            {acadTenantTeachers.length > 0 ? (
                              acadTenantTeachers.map((teach) => {
                                const isAssigned = acadInstructors.some(i => i.user_id === teach.id);
                                return (
                                  <label key={teach.id} className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer text-xs transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={isAssigned}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setAcadInstructors([...acadInstructors, { user_id: teach.id, user: teach }]);
                                        } else {
                                          setAcadInstructors(acadInstructors.filter(i => i.user_id !== teach.id));
                                        }
                                      }}
                                      className="rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB] h-3.5 w-3.5"
                                    />
                                    <div className="min-w-0">
                                      <p className="font-semibold text-[#0F172A] truncate">{teach.full_name}</p>
                                      <p className="text-[10px] text-[#475569] truncate font-medium">{teach.email}</p>
                                    </div>
                                  </label>
                                );
                              })
                            ) : (
                              <p className="col-span-2 text-[11px] text-[#475569] text-center py-4 font-medium">No active teachers/trainers found in this tenant space.</p>
                            )}
                          </div>
                          {acadTenantTeachers.length > 0 && (
                            <button
                              type="submit"
                              disabled={loading}
                              className="flex items-center gap-1.5 bg-[#2563EB] text-white px-3.5 py-2 rounded-lg hover:bg-[#2563EB]/95 transition-all text-xs font-semibold shadow-sm disabled:opacity-50"
                            >
                              <Save size={13} />
                              {loading ? "Saving Mapping..." : "Save Assigned Instructors"}
                            </button>
                          )}
                        </form>
                      </div>
                    </div>

                    {/* Curriculum Modules & Lessons Explorer */}
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                          <FolderPlus size={15} className="text-[#2563EB]" /> Course Curriculum Modules
                        </h4>
                        <button
                          onClick={() => {
                            setEditingModule(null);
                            const activeStatus = acadLookups.statuses.find((s: any) => s.code === "active")?.id || "";
                            setModuleForm({ title: "", description: "", position: acadModules.length + 1, status_id: activeStatus });
                            setModuleModalOpen(true);
                          }}
                          className="flex items-center gap-1 bg-[#2563EB] text-white px-2.5 py-1.5 rounded-lg hover:bg-[#2563EB]/95 transition-all text-[11px] font-bold shadow-sm"
                        >
                          <Plus size={13} /> Create Module
                        </button>
                      </div>

                      <div className="space-y-4">
                        {acadModules.length > 0 ? (
                          acadModules.map((mod) => (
                            <div key={mod.id} className="border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm bg-slate-50/20">
                              {/* Module Header */}
                              <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-b border-[#E2E8F0]">
                                <div className="min-w-0 pr-2">
                                  <p className="font-semibold text-xs text-[#0F172A] truncate">
                                    Module {mod.position}: {mod.title}
                                  </p>
                                  {mod.description && <p className="text-[10px] text-[#475569] truncate mt-0.5">{mod.description}</p>}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    onClick={() => {
                                      setLessonSelectedModuleId(mod.id);
                                      setEditingLesson(null);
                                      const activeStatus = acadLookups.statuses.find((s: any) => s.code === "active")?.id || "";
                                      const defaultType = acadLookups.lessonTypes[0]?.id || "";
                                      setLessonForm({
                                        title: "",
                                        lesson_type_id: defaultType,
                                        content_json_str: "{}",
                                        video_url: "",
                                        duration: 15,
                                        position: (mod.lessons?.length || 0) + 1,
                                        is_preview: false,
                                        status_id: activeStatus
                                      });
                                      setLessonModalOpen(true);
                                    }}
                                    className="flex items-center gap-1 bg-white border border-[#E2E8F0] hover:bg-slate-50 px-2 py-1 rounded text-[10px] font-bold text-[#0F172A] shadow-xs"
                                  >
                                    <Plus size={11} /> Add Lesson
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingModule(mod);
                                      setModuleForm({
                                        title: mod.title,
                                        description: mod.description || "",
                                        position: mod.position,
                                        status_id: mod.status_id
                                      });
                                      setModuleModalOpen(true);
                                    }}
                                    className="p-1 hover:bg-slate-200 rounded text-[#475569] hover:text-[#0F172A]"
                                  >
                                    <Edit size={12} />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (confirm("Are you sure you want to delete this module?")) {
                                        const res = await deleteModuleAction(mod.id);
                                        if (res.error) setError(res.error);
                                        else {
                                          setSuccess("Module deleted successfully!");
                                          await refreshCourseDetails(acadSelectedCourse.id);
                                        }
                                      }
                                    }}
                                    className="p-1 hover:bg-red-50 rounded text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>

                              {/* Lessons under this module */}
                              <div className="p-4 space-y-3">
                                {mod.lessons && mod.lessons.length > 0 ? (
                                  mod.lessons.map((les: any) => (
                                    <div key={les.id} className="bg-white border border-[#E2E8F0] rounded-xl p-3.5 space-y-3 shadow-xs">
                                      <div className="flex items-start justify-between">
                                        <div className="min-w-0 pr-2">
                                          <div className="flex items-center gap-2">
                                            <span className="font-semibold text-xs text-[#0F172A]">{les.title}</span>
                                            <span className="text-[9px] bg-slate-100 text-[#475569] px-1.5 py-0.5 rounded font-bold font-mono">
                                              {les.lesson_type?.code || "lesson"}
                                            </span>
                                            {les.is_preview && (
                                              <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-bold border border-emerald-100">
                                                Preview
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-[10px] text-[#475569] mt-0.5 font-mono font-medium">
                                            Position: {les.position} • {les.duration || 0} mins
                                          </p>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                          <button
                                            onClick={() => {
                                              setResourceSelectedLessonId(les.id);
                                              setResourceForm({
                                                title: "",
                                                resource_type: "link",
                                                file_url: "",
                                                external_url: "",
                                                position: (les.resources?.length || 0) + 1
                                              });
                                              setResourceModalOpen(true);
                                            }}
                                            className="flex items-center gap-1 hover:bg-slate-100 text-[10px] text-[#2563EB] font-bold px-2 py-1 rounded"
                                          >
                                            <Link2 size={12} /> Resource
                                          </button>
                                          <button
                                            onClick={() => {
                                              setEditingLesson(les);
                                              setLessonSelectedModuleId(mod.id);
                                              setLessonForm({
                                                title: les.title,
                                                lesson_type_id: les.lesson_type_id,
                                                content_json_str: JSON.stringify(les.content_json || {}),
                                                video_url: les.video_url || "",
                                                duration: les.duration || 0,
                                                position: les.position || 1,
                                                is_preview: les.is_preview || false,
                                                status_id: les.status_id
                                              });
                                              setLessonModalOpen(true);
                                            }}
                                            className="p-1 hover:bg-slate-200 rounded text-[#475569] hover:text-[#0F172A]"
                                          >
                                            <Edit size={12} />
                                          </button>
                                          <button
                                            onClick={async () => {
                                              if (confirm("Are you sure you want to delete this lesson?")) {
                                                const res = await deleteLessonAction(les.id);
                                                if (res.error) setError(res.error);
                                                else {
                                                  setSuccess("Lesson deleted successfully!");
                                                  await refreshCourseDetails(acadSelectedCourse.id);
                                                }
                                              }
                                            }}
                                            className="p-1 hover:bg-red-50 rounded text-red-500 hover:text-red-700"
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Lesson Resource list */}
                                      {les.resources && les.resources.length > 0 && (
                                        <div className="bg-slate-50/50 border border-[#E2E8F0] rounded-lg p-2 space-y-1.5">
                                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#475569] px-1">Attachments & External Resources</p>
                                          <div className="divide-y divide-[#E2E8F0] bg-white rounded-md border border-[#E2E8F0]">
                                            {les.resources.map((res: any) => (
                                              <div key={res.id} className="px-2 py-1.5 flex items-center justify-between text-[11px]">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                  <File size={12} className="text-[#475569] shrink-0" />
                                                  <span className="font-semibold text-[#0F172A] truncate">{res.title}</span>
                                                  <span className="text-[9px] bg-slate-100 text-[#475569] px-1 rounded-sm">{res.resource_type}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                                  {res.external_url && (
                                                    <a href={res.external_url} target="_blank" rel="noopener noreferrer" className="p-0.5 text-[#2563EB] hover:text-[#2563EB]/80">
                                                      <ExternalLink size={12} />
                                                    </a>
                                                  )}
                                                  <button
                                                    onClick={async () => {
                                                      if (confirm("Remove this resource attachment?")) {
                                                        const delRes = await deleteLessonResourceAction(res.id);
                                                        if (delRes.error) setError(delRes.error);
                                                        else {
                                                          setSuccess("Resource removed successfully!");
                                                          await refreshCourseDetails(acadSelectedCourse.id);
                                                        }
                                                      }
                                                    }}
                                                    className="p-0.5 text-red-500 hover:text-red-700"
                                                  >
                                                    <Trash2 size={12} />
                                                  </button>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-[11px] text-[#475569] text-center py-2 font-medium">No lessons created in this module.</p>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-[11px] text-[#475569] text-center py-6 bg-slate-50/50 rounded-xl font-medium">No curriculum modules defined. Add a module to begin.</p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center shadow-sm">
                    <Folder className="mx-auto text-slate-300 mb-2" size={32} />
                    <p className="text-xs text-[#475569] font-medium">Select a Course on the left to start configuring its syllabus curriculum.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: ONBOARDING */}
        {activeTab === "onboarding" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
                  <UserPlus size={15} /> Member Provisioning & Verification Tokens
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOnboardMode("single")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      onboardMode === "single"
                        ? "bg-[#2563EB]/15 text-[#2563EB] border-[#2563EB]/20"
                        : "bg-white text-[#475569] border-[#E2E8F0] hover:bg-slate-50"
                    }`}
                  >
                    Single Member
                  </button>
                  <button
                    onClick={() => setOnboardMode("csv")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      onboardMode === "csv"
                        ? "bg-[#2563EB]/15 text-[#2563EB] border-[#2563EB]/20"
                        : "bg-white text-[#475569] border-[#E2E8F0] hover:bg-slate-50"
                    }`}
                  >
                    Batch CSV Import
                  </button>
                </div>
              </div>

              {onboardMode === "single" ? (
                <form onSubmit={handleSingleUserOnboard} className="space-y-4 max-w-md text-xs">
                  <div>
                    <label className="block font-semibold mb-1 text-[#475569]">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={singleName}
                      onChange={(e) => setSingleName(e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[#475569]">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. john.doe@hynox.in"
                      value={singleEmail}
                      onChange={(e) => setSingleEmail(e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[#475569]">Role Permission Scope *</label>
                    <select
                      value={singleRole}
                      onChange={(e) => setSingleRole(e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A]"
                    >
                      <option value="student">Student (Default)</option>
                      <option value="teacher">Teacher (Faculty Admin)</option>
                      <option value="trainer">Trainer (Lab / Course Coach)</option>
                      <option value="mentor">External Mentor</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#2563EB] text-white px-4 py-2.5 rounded-lg text-xs font-semibold hover:bg-[#2563EB]/95 transition-all shadow-sm disabled:opacity-50"
                  >
                    {loading ? "Generating Link..." : "Create Onboarding Link"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCsvUpload} className="space-y-4 text-xs">
                  <div className="bg-[#2563EB]/5 border border-[#2563EB]/20 text-[#2563EB] rounded-lg p-3 text-[11px] leading-relaxed">
                    <p className="font-bold">Instructions:</p>
                    <p className="mt-0.5">Upload a `.csv` or `.xlsx` spreadsheet, or paste CSV contents below. Headers must contain: **name**, **email**, **role**.</p>
                    <p className="mt-1 font-semibold text-[#0F172A]">Example format:</p>
                    <code className="block mt-1 font-mono text-[10px] bg-white border border-[#E2E8F0] p-1.5 rounded text-[#0F172A]">
                      name,email,role<br/>
                      Jane Smith,jane.smith@campus.in,student<br/>
                      Prof. Alan,alan@campus.in,teacher
                    </code>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 bg-white border border-[#E2E8F0] hover:bg-slate-50 px-4 py-2.5 rounded-lg cursor-pointer text-xs font-semibold shadow-xs text-[#0F172A]">
                      <Upload size={14} className="text-[#2563EB]" />
                      <span>{uploadedFileName || "Upload Excel / CSV"}</span>
                      <input
                        type="file"
                        accept=".csv, .xlsx, .xls"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    {uploadedFileName && (
                      <button
                        type="button"
                        onClick={() => {
                          setCsvContent("");
                          setUploadedFileName("");
                        }}
                        className="text-red-500 font-semibold hover:underline"
                      >
                        Clear File
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[#475569]">CSV Contents (Raw Input)</label>
                    <textarea
                      rows={5}
                      required
                      placeholder="name,email,role..."
                      value={csvContent}
                      onChange={(e) => setCsvContent(e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm font-mono resize-none text-[#0F172A]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#2563EB] text-white px-4 py-2.5 rounded-lg text-xs font-semibold hover:bg-[#2563EB]/95 transition-all shadow-sm disabled:opacity-50"
                  >
                    {loading ? "Processing Batch Onboarding..." : "Import Cohort Batch"}
                  </button>
                </form>
              )}

              {/* Created onboarding links list */}
              {links.length > 0 && (
                <div className="mt-6 border border-[#16A34A]/20 bg-[#16A34A]/5 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-[#16A34A] flex items-center gap-1">
                    <CheckCircle size={14} /> Provisioned Onboarding Links (Action Required)
                  </h4>
                  <p className="text-[11px] text-[#475569]">Send these links to the respective members. They will use them to verify their profile and set their account password.</p>
                  
                  <div className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] bg-white rounded-lg max-h-[200px] overflow-y-auto">
                    {links.map((link: any, idx: number) => (
                      <div key={idx} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="min-w-0">
                          <p className="font-semibold text-[#0F172A] truncate">{link.email}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold capitalize ${
                            link.status === "success" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
                          }`}>
                            {link.status}
                          </span>
                          {link.error && <p className="text-[10px] text-red-500 mt-1">{link.error}</p>}
                        </div>
                        {link.link && (
                          <div className="flex items-center gap-2 shrink-0">
                            <input
                              type="text"
                              readOnly
                              value={link.link}
                              className="bg-slate-50 border border-[#E2E8F0] rounded px-2 py-1 text-[10px] font-mono text-[#0F172A] w-[200px]"
                            />
                            <button
                              onClick={() => handleCopyLink(link.link)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-[#E2E8F0] rounded text-[#475569] hover:text-[#0F172A]"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Invitations registry list */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#475569]">Onboarding Token Registry</h3>
                  <p className="text-[11px] text-[#475569] mt-0.5">Track invitation link delivery, status, and verification.</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-[#475569]">Stats:</span>
                  <span className="px-2 py-0.5 bg-slate-100 border border-[#E2E8F0] rounded-full text-[10px] font-bold text-[#0F172A]">
                    {computedStats.total} Total
                  </span>
                  <span className="px-2 py-0.5 bg-[#16A34A]/10 border border-[#16A34A]/20 rounded-full text-[10px] font-bold text-[#16A34A]">
                    {computedStats.accepted} Verified
                  </span>
                  <span className="px-2 py-0.5 bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-full text-[10px] font-bold text-[#F59E0B]">
                    {computedStats.pending} Pending
                  </span>
                </div>
              </div>

              {/* Table search & filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search size={14} className="absolute left-3 top-2.5 text-[#475569]" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={inviteSearch}
                    onChange={(e) => setInviteSearch(e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-9 pr-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] shadow-sm"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs shrink-0">
                  <span className="font-semibold text-[#475569]">Filter:</span>
                  <select
                    value={inviteFilter}
                    onChange={(e: any) => setInviteFilter(e.target.value)}
                    className="bg-white border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] shadow-sm"
                  >
                    <option value="all">All Tokens</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted / Joined</option>
                    <option value="expired">Expired</option>
                    <option value="failed">Failed Delivery</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[10px] font-bold text-[#475569] uppercase tracking-wide">
                        <th className="px-4 py-3">Member Candidate</th>
                        <th className="px-4 py-3">Invitation Type</th>
                        <th className="px-4 py-3">Token status</th>
                        <th className="px-4 py-3">Expires At</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {filteredInvitations.length > 0 ? (
                        filteredInvitations.map((inv) => {
                          const now = new Date();
                          const isExpired = inv.status === "expired" || (["pending", "created", "sent"].includes(inv.status) && new Date(inv.expires_at) < now);
                          
                          return (
                            <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3.5">
                                <div className="font-semibold text-[#0F172A]">{inv.user?.full_name || "Guest User"}</div>
                                <div className="text-[10px] text-[#475569] font-medium">{inv.user?.email}</div>
                              </td>
                              <td className="px-4 py-3.5">
                                <span className="px-2 py-0.5 bg-slate-100 text-[#475569] border border-[#E2E8F0] rounded-full text-[9px] font-bold">
                                  {inv.invitation_type?.replace(/_/g, " ")}
                                </span>
                              </td>
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-1.5">
                                  {inv.status === "accepted" ? (
                                    <span className="flex items-center gap-1 text-[#16A34A] font-bold">
                                      <CheckCircle size={12} /> Accepted
                                    </span>
                                  ) : isExpired ? (
                                    <span className="flex items-center gap-1 text-[#DC2626] font-bold">
                                      <Ban size={12} /> Expired
                                    </span>
                                  ) : inv.status === "failed" ? (
                                    <span className="flex items-center gap-1 text-[#DC2626] font-bold">
                                      <XCircle size={12} /> Failed Delivery
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 text-[#F59E0B] font-bold">
                                      <Clock size={12} /> Pending Invite
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3.5 text-[#475569] font-mono text-[10px]">
                                {new Date(inv.expires_at).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3.5 text-right">
                                {inv.status !== "accepted" && (
                                  <button
                                    onClick={() => handleRegenerateInvite(inv.id)}
                                    disabled={regeneratingId === inv.id}
                                    className="flex items-center gap-1 hover:bg-slate-100 px-2 py-1 rounded text-[#2563EB] font-bold border border-[#E2E8F0] ml-auto transition-colors disabled:opacity-50 text-[10px]"
                                  >
                                    <RefreshCw size={11} className={regeneratingId === inv.id ? "animate-spin" : ""} />
                                    Regenerate Token
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center py-6 text-[#475569] font-medium bg-slate-50/20">No matching tokens found in history logs.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: USER REGISTRY / EXPLORER */}
        {activeTab === "explorer" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1">
                    <Users size={15} /> Institution User Directory Explorer
                  </h3>
                  <p className="text-[11px] text-[#475569] mt-0.5">Explore active profiles, assigned roles, and login statuses on this campus.</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-[#475569]">Counts:</span>
                  <span className="px-2 py-0.5 bg-slate-100 border border-[#E2E8F0] rounded-full text-[10px] font-bold text-[#0F172A]">
                    {computedExplorerStats.total} Accounts
                  </span>
                  <span className="px-2 py-0.5 bg-[#2563EB]/15 text-[#2563EB] border border-[#2563EB]/20 rounded-full text-[10px] font-bold">
                    {computedExplorerStats.teachers} Teachers
                  </span>
                  <span className="px-2 py-0.5 bg-[#2563EB]/15 text-[#2563EB] border border-[#2563EB]/20 rounded-full text-[10px] font-bold">
                    {computedExplorerStats.students} Students
                  </span>
                </div>
              </div>

              {/* Table search & filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search size={14} className="absolute left-3 top-2.5 text-[#475569]" />
                  <input
                    type="text"
                    placeholder="Search directory by name or email..."
                    value={explorerSearch}
                    onChange={(e) => setExplorerSearch(e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-9 pr-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] shadow-sm"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs shrink-0">
                  <span className="font-semibold text-[#475569]">Role Filter:</span>
                  <select
                    value={explorerRoleFilter}
                    onChange={(e: any) => setExplorerRoleFilter(e.target.value)}
                    className="bg-white border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] shadow-sm"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Administrators</option>
                    <option value="teacher">Teachers & Trainers</option>
                    <option value="student">Students</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[10px] font-bold text-[#475569] uppercase tracking-wide">
                        <th className="px-4 py-3">Member Name</th>
                        <th className="px-4 py-3">Email Address</th>
                        <th className="px-4 py-3">Assigned Role Map</th>
                        <th className="px-4 py-3">Account Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {explorerLoading ? (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-[#475569] font-medium bg-slate-50/20">Loading directory index...</td>
                        </tr>
                      ) : filteredExplorerUsers.length > 0 ? (
                        filteredExplorerUsers.map((usr) => (
                          <tr key={usr.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3.5 font-semibold text-[#0F172A]">{usr.full_name || "No name set"}</td>
                            <td className="px-4 py-3.5 text-[#475569] font-mono text-[11px]">{usr.email}</td>
                            <td className="px-4 py-3.5">
                              <div className="flex flex-wrap gap-1">
                                {usr.roles?.map((role: string, idx: number) => (
                                  <span key={idx} className="px-2 py-0.5 bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20 rounded-full text-[9px] font-bold capitalize">
                                    {role}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border capitalize ${
                                usr.status === "active" ? "bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20" : "bg-slate-100 text-[#475569] border-[#E2E8F0]"
                              }`}>
                                {usr.status || "offline"}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="text-center py-6 text-[#475569] font-medium bg-slate-50/20">No active accounts matched current filters.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Program Modal */}
      {programModalOpen && (
        <div className="fixed inset-0 bg-[#0F172A]/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-[#E2E8F0] rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-sm text-[#0F172A]">{editingProgram ? "Edit Academic Program" : "Create New Program"}</h3>
            <form onSubmit={handleProgramSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[#475569]">Program Title *</label>
                <input
                  type="text"
                  required
                  value={programForm.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setProgramForm({ 
                      ...programForm, 
                      title,
                      slug: editingProgram ? programForm.slug : title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
                    });
                  }}
                  placeholder="e.g. Full Stack Web Development"
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#475569]">URL Slug (Unique) *</label>
                <input
                  type="text"
                  required
                  value={programForm.slug}
                  onChange={(e) => setProgramForm({ ...programForm, slug: e.target.value })}
                  placeholder="e.g. full-stack-web-development"
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A] font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#475569]">Program Description</label>
                <textarea
                  rows={3}
                  value={programForm.description}
                  onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                  placeholder="Overview of scope, syllabus themes..."
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A] resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#475569]">Workflow Status *</label>
                  <select
                    value={programForm.status_id}
                    onChange={(e) => setProgramForm({ ...programForm, status_id: e.target.value })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A]"
                  >
                    {acadLookups.statuses.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.description}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#475569]">Visibility *</label>
                  <select
                    value={programForm.visibility_type_id}
                    onChange={(e) => setProgramForm({ ...programForm, visibility_type_id: e.target.value })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A]"
                  >
                    {acadLookups.visibilityTypes.map((v: any) => (
                      <option key={v.id} value={v.id}>{v.description}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setProgramModalOpen(false)}
                  className="px-3.5 py-2 border border-[#E2E8F0] hover:bg-slate-50 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#2563EB] text-white px-3.5 py-2 rounded-lg font-semibold hover:bg-[#2563EB]/95 transition-all shadow-sm"
                >
                  {loading ? "Saving..." : "Save Program"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Modal */}
      {courseModalOpen && (
        <div className="fixed inset-0 bg-[#0F172A]/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-[#E2E8F0] rounded-xl max-w-md w-full p-6 shadow-xl space-y-4 overflow-y-auto max-h-[90vh]">
            <h3 className="font-bold text-sm text-[#0F172A]">{editingCourse ? "Edit Teachable Course" : "Create New Teachable Course"}</h3>
            <form onSubmit={handleCourseSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[#475569]">Course Title *</label>
                <input
                  type="text"
                  required
                  value={courseForm.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setCourseForm({ 
                      ...courseForm, 
                      title,
                      slug: editingCourse ? courseForm.slug : title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
                    });
                  }}
                  placeholder="e.g. React Native Fundamentals"
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#475569]">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={courseForm.slug}
                  onChange={(e) => setCourseForm({ ...courseForm, slug: e.target.value })}
                  placeholder="e.g. react-native-fundamentals"
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A] font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#475569]">Course Description</label>
                <textarea
                  rows={3}
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="Syllabus overview, prerequisites..."
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A] resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#475569]">Course Type *</label>
                  <select
                    value={courseForm.course_type_id}
                    onChange={(e) => setCourseForm({ ...courseForm, course_type_id: e.target.value })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A]"
                  >
                    {acadLookups.courseTypes.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.description}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#475569]">Workflow Status *</label>
                  <select
                    value={courseForm.status_id}
                    onChange={(e) => setCourseForm({ ...courseForm, status_id: e.target.value })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A]"
                  >
                    {acadLookups.statuses.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.description}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#475569]">Visibility *</label>
                  <select
                    value={courseForm.visibility_type_id}
                    onChange={(e) => setCourseForm({ ...courseForm, visibility_type_id: e.target.value })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A]"
                  >
                    {acadLookups.visibilityTypes.map((v: any) => (
                      <option key={v.id} value={v.id}>{v.description}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#475569]">Enrollment Mode *</label>
                  <select
                    value={courseForm.enrollment_mode}
                    onChange={(e: any) => setCourseForm({ ...courseForm, enrollment_mode: e.target.value })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A]"
                  >
                    <option value="open">Open (Publicly Joinable)</option>
                    <option value="approval">Approval (Req. Admin)</option>
                    <option value="private">Private (Invite Link)</option>
                    <option value="institution_only">Institution Cohort</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#475569]">Duration (Minutes)</label>
                  <input
                    type="number"
                    min={0}
                    value={courseForm.duration_minutes}
                    onChange={(e) => setCourseForm({ ...courseForm, duration_minutes: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#475569]">Thumbnail Path</label>
                  <input
                    type="text"
                    placeholder="e.g. course-thumbnails/react.jpg"
                    value={courseForm.thumbnail_path}
                    onChange={(e) => setCourseForm({ ...courseForm, thumbnail_path: e.target.value })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A]"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setCourseModalOpen(false)}
                  className="px-3.5 py-2 border border-[#E2E8F0] hover:bg-slate-50 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#2563EB] text-white px-3.5 py-2 rounded-lg font-semibold hover:bg-[#2563EB]/95 transition-all shadow-sm"
                >
                  {loading ? "Saving..." : "Save Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Module Modal */}
      {moduleModalOpen && (
        <div className="fixed inset-0 bg-[#0F172A]/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-[#E2E8F0] rounded-xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
            <h3 className="font-bold text-sm text-[#0F172A]">{editingModule ? "Edit Curriculum Module" : "Create Curriculum Module"}</h3>
            <form onSubmit={handleModuleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[#475569]">Module Title *</label>
                <input
                  type="text"
                  required
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  placeholder="e.g. Introduction to Routing"
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#475569]">Module Description</label>
                <textarea
                  rows={2}
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  placeholder="Overview details..."
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A] resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#475569]">Display Position Order *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={moduleForm.position}
                    onChange={(e) => setModuleForm({ ...moduleForm, position: parseInt(e.target.value) || 1 })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#475569]">Workflow Status *</label>
                  <select
                    value={moduleForm.status_id}
                    onChange={(e) => setModuleForm({ ...moduleForm, status_id: e.target.value })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A]"
                  >
                    {acadLookups.statuses.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.description}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setModuleModalOpen(false)}
                  className="px-3.5 py-2 border border-[#E2E8F0] hover:bg-slate-50 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#2563EB] text-white px-3.5 py-2 rounded-lg font-semibold hover:bg-[#2563EB]/95 transition-all shadow-sm"
                >
                  {loading ? "Saving..." : "Save Module"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {lessonModalOpen && (
        <div className="fixed inset-0 bg-[#0F172A]/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-[#E2E8F0] rounded-xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs overflow-y-auto max-h-[90vh]">
            <h3 className="font-bold text-sm text-[#0F172A]">{editingLesson ? "Edit Syllabus Lesson" : "Create Syllabus Lesson"}</h3>
            <form onSubmit={handleLessonSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[#475569]">Lesson Title *</label>
                <input
                  type="text"
                  required
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  placeholder="e.g. Setting up Dynamic Routes"
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#475569]">Lesson Chapter Type *</label>
                  <select
                    value={lessonForm.lesson_type_id}
                    onChange={(e) => setLessonForm({ ...lessonForm, lesson_type_id: e.target.value })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A]"
                  >
                    {acadLookups.lessonTypes.map((l: any) => (
                      <option key={l.id} value={l.id}>{l.description}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#475569]">Estimated Duration (Mins)</label>
                  <input
                    type="number"
                    min={0}
                    value={lessonForm.duration}
                    onChange={(e) => setLessonForm({ ...lessonForm, duration: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A]"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#475569]">Video URL (Optional Link)</label>
                <input
                  type="text"
                  placeholder="e.g. https://youtube.com/embed/..."
                  value={lessonForm.video_url}
                  onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#475569]">Content Metadata (JSON string) *</label>
                <textarea
                  rows={4}
                  required
                  value={lessonForm.content_json_str}
                  onChange={(e) => setLessonForm({ ...lessonForm, content_json_str: e.target.value })}
                  placeholder='e.g. { "markdown": "# Introduction" }'
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm font-mono text-[#0F172A] resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#475569]">Position Order *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={lessonForm.position}
                    onChange={(e) => setLessonForm({ ...lessonForm, position: parseInt(e.target.value) || 1 })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#475569]">Workflow Status *</label>
                  <select
                    value={lessonForm.status_id}
                    onChange={(e) => setLessonForm({ ...lessonForm, status_id: e.target.value })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A]"
                  >
                    {acadLookups.statuses.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.description}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_preview_box"
                  checked={lessonForm.is_preview}
                  onChange={(e) => setLessonForm({ ...lessonForm, is_preview: e.target.checked })}
                  className="rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB]"
                />
                <label htmlFor="is_preview_box" className="font-semibold text-[#475569]">Available as Public Demo Preview</label>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setLessonModalOpen(false)}
                  className="px-3.5 py-2 border border-[#E2E8F0] hover:bg-slate-50 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#2563EB] text-white px-3.5 py-2 rounded-lg font-semibold hover:bg-[#2563EB]/95 transition-all shadow-sm"
                >
                  {loading ? "Saving..." : "Save Lesson"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resource Modal */}
      {resourceModalOpen && (
        <div className="fixed inset-0 bg-[#0F172A]/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-[#E2E8F0] rounded-xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
            <h3 className="font-bold text-sm text-[#0F172A]">Attach Resource to Lesson</h3>
            <form onSubmit={handleResourceSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[#475569]">Resource Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Syllabus Handout PDF"
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#475569]">Attachment Type *</label>
                  <select
                    value={resourceForm.resource_type}
                    onChange={(e) => setResourceForm({ ...resourceForm, resource_type: e.target.value })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A]"
                  >
                    <option value="link">External Link / Web URL</option>
                    <option value="pdf">PDF File document</option>
                    <option value="code">Source Code Repository</option>
                    <option value="video">Resource Video Clip</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#475569]">Order Position *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={resourceForm.position}
                    onChange={(e) => setResourceForm({ ...resourceForm, position: parseInt(e.target.value) || 1 })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A]"
                  />
                </div>
              </div>
              {resourceForm.resource_type === "link" || resourceForm.resource_type === "code" ? (
                <div>
                  <label className="block font-semibold mb-1 text-[#475569]">External URL *</label>
                  <input
                    type="text"
                    required
                    placeholder="https://github.com/..."
                    value={resourceForm.external_url}
                    onChange={(e) => setResourceForm({ ...resourceForm, external_url: e.target.value })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-semibold mb-1 text-[#475569]">Storage File Path (Internal URL) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. course-resources/labs.pdf"
                    value={resourceForm.file_url}
                    onChange={(e) => setResourceForm({ ...resourceForm, file_url: e.target.value })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A]"
                  />
                </div>
              )}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setResourceModalOpen(false)}
                  className="px-3.5 py-2 border border-[#E2E8F0] hover:bg-slate-50 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#2563EB] text-white px-3.5 py-2 rounded-lg font-semibold hover:bg-[#2563EB]/95 transition-all shadow-sm"
                >
                  {loading ? "Attaching..." : "Attach Resource"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
