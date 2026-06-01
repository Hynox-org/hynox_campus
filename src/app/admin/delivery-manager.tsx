"use client";

import React, { useState, useEffect } from "react";
import {
  createCohortAction,
  updateCohortAction,
  deleteCohortAction,
  enrollStudentAction,
  updateEnrollmentStatusAction,
  removeEnrollmentAction,
  assignCourseAction,
  removeCourseAssignmentAction,
  listCohortsAction,
  listEnrollmentsAction,
  listCourseAssignmentsAction,
  listInstitutionStudentsAction,
  getDeliveryLookupsAction
} from "@/app/actions/delivery-actions";
import { listProgramsAction, listCoursesAction } from "@/app/actions/academic-actions";
import { 
  Building, 
  Users, 
  UserCheck, 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit, 
  Calendar, 
  Check, 
  AlertCircle,
  FileText
} from "lucide-react";

interface DeliveryManagerProps {
  institutions: any[];
  initialTab: "cohorts" | "enrollments" | "assignments";
}

export default function DeliveryManager({ institutions, initialTab }: DeliveryManagerProps) {
  const [selectedInstId, setSelectedInstId] = useState(institutions[0]?.id || "");
  const [activeSubTab, setActiveSubTab] = useState<"cohorts" | "enrollments" | "assignments">(initialTab);

  useEffect(() => {
    setActiveSubTab(initialTab);
  }, [initialTab]);

  // Lookup structures
  const [cohortStatuses, setCohortStatuses] = useState<any[]>([]);
  const [enrollmentStatuses, setEnrollmentStatuses] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  // List views
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modals & Form states
  const [cohortModalOpen, setCohortModalOpen] = useState(false);
  const [editingCohort, setEditingCohort] = useState<any | null>(null);
  const [cohortForm, setCohortForm] = useState({
    name: "",
    code: "",
    start_date: "",
    end_date: "",
    status_code: "active",
    program_id: ""
  });

  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [enrollForm, setEnrollForm] = useState({
    user_id: "",
    cohort_id: "",
    status_code: "active"
  });

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    cohort_id: "",
    course_id: "",
    start_date: "",
    due_date: "",
    is_required: true
  });

  // Load initial lookups
  useEffect(() => {
    async function loadLookups() {
      const res = await getDeliveryLookupsAction();
      if (res.lookups) {
        setCohortStatuses(res.lookups.cohortStatuses || []);
        setEnrollmentStatuses(res.lookups.enrollmentStatuses || []);
      }
    }
    loadLookups();
  }, []);

  // Reload lists when selected institution changes
  useEffect(() => {
    if (selectedInstId) {
      loadInstitutionData();
    }
  }, [selectedInstId]);

  const loadInstitutionData = async () => {
    setLoading(true);
    setError("");
    
    // Load programs for academic dropdowns
    const progRes = await listProgramsAction(selectedInstId);
    if (progRes.programs) {
      setPrograms(progRes.programs);
      
      // Load all courses for assignments
      const coursesPromises = progRes.programs.map((p: any) => listCoursesAction(p.id));
      const coursesResults = await Promise.all(coursesPromises);
      const combinedCourses = coursesResults.flatMap((r: any) => r.courses || []);
      setAllCourses(combinedCourses);
    }

    // Load students for enrollments
    const stuRes = await listInstitutionStudentsAction(selectedInstId);
    if (stuRes.students) {
      setStudents(stuRes.students);
    }

    // Load delivery records
    await refreshLists();
    
    setLoading(false);
  };

  const refreshLists = async () => {
    const cRes = await listCohortsAction(selectedInstId);
    if (cRes.cohorts) setCohorts(cRes.cohorts);

    const eRes = await listEnrollmentsAction(selectedInstId);
    if (eRes.enrollments) setEnrollments(eRes.enrollments);

    const aRes = await listCourseAssignmentsAction(selectedInstId);
    if (aRes.assignments) setAssignments(aRes.assignments);
  };

  const handleCohortSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (editingCohort) {
      const res = await updateCohortAction(editingCohort.id, {
        name: cohortForm.name,
        code: cohortForm.code,
        start_date: cohortForm.start_date || undefined,
        end_date: cohortForm.end_date || undefined,
        status_code: cohortForm.status_code
      });
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess("Cohort updated successfully!");
        setCohortModalOpen(false);
        setEditingCohort(null);
        await refreshLists();
      }
    } else {
      const res = await createCohortAction({
        tenant_id: selectedInstId,
        institution_id: selectedInstId,
        program_id: cohortForm.program_id,
        name: cohortForm.name,
        code: cohortForm.code,
        start_date: cohortForm.start_date || undefined,
        end_date: cohortForm.end_date || undefined,
        status_code: cohortForm.status_code
      });
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess("Cohort created successfully!");
        setCohortModalOpen(false);
        await refreshLists();
      }
    }
  };

  const handleEditCohortClick = (cohort: any) => {
    setEditingCohort(cohort);
    setCohortForm({
      name: cohort.name,
      code: cohort.code,
      start_date: cohort.start_date ? cohort.start_date.substring(0, 10) : "",
      end_date: cohort.end_date ? cohort.end_date.substring(0, 10) : "",
      status_code: cohort.status_code,
      program_id: cohort.program_id
    });
    setCohortModalOpen(true);
  };

  const handleDeleteCohort = async (id: string) => {
    if (!confirm("Are you sure you want to soft delete this cohort?")) return;
    const res = await deleteCohortAction(id);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess("Cohort deleted successfully!");
      await refreshLists();
    }
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const res = await enrollStudentAction({
      user_id: enrollForm.user_id,
      cohort_id: enrollForm.cohort_id,
      status_code: enrollForm.status_code
    });

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess("Student successfully enrolled!");
      setEnrollModalOpen(false);
      await refreshLists();
    }
  };

  const handleEnrollStatusChange = async (id: string, newStatus: string) => {
    const res = await updateEnrollmentStatusAction(id, newStatus);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess("Enrollment status updated!");
      await refreshLists();
    }
  };

  const handleRemoveEnrollment = async (id: string) => {
    if (!confirm("Are you sure you want to remove this enrollment?")) return;
    const res = await removeEnrollmentAction(id);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess("Enrollment removed successfully!");
      await refreshLists();
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const res = await assignCourseAction({
      cohort_id: assignForm.cohort_id,
      course_id: assignForm.course_id,
      start_date: assignForm.start_date || undefined,
      due_date: assignForm.due_date || undefined,
      is_required: assignForm.is_required
    });

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess("Course successfully assigned to cohort!");
      setAssignModalOpen(false);
      await refreshLists();
    }
  };

  const handleRemoveAssignment = async (id: string) => {
    if (!confirm("Are you sure you want to remove this course assignment?")) return;
    const res = await removeCourseAssignmentAction(id);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess("Course assignment removed!");
      await refreshLists();
    }
  };

  return (
    <div className="space-y-6 text-xs text-[#0f172a]">
      
      {/* Institution Scope selector */}
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-1.5 text-[#475569] flex items-center gap-1.5">
            <Building size={15} /> Delivery Scope Management
          </h3>
          <p className="text-[10px] text-[#475569] leading-relaxed">
            Manage student batches, enroll students, and assign courses to cohorts.
          </p>
        </div>
        <select
          value={selectedInstId}
          onChange={(e) => setSelectedInstId(e.target.value)}
          className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm font-semibold max-w-xs"
        >
          {institutions.map((inst) => (
            <option key={inst.id} value={inst.id}>
              {inst.name} ({inst.institution_code})
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-[#DC2626]/5 border border-[#DC2626]/20 text-[#DC2626] rounded-xl p-4 text-xs">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-[#16A34A]/5 border border-[#16A34A]/20 text-[#16A34A] rounded-xl p-4 text-xs">
          {success}
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex border-b border-[#E2E8F0]">
        <button
          onClick={() => setActiveSubTab("cohorts")}
          className={`px-5 py-2.5 font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === "cohorts"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-[#475569] hover:text-[#0F172A]"
          }`}
        >
          <Users size={14} />
          Cohorts ({cohorts.length})
        </button>
        <button
          onClick={() => setActiveSubTab("enrollments")}
          className={`px-5 py-2.5 font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === "enrollments"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-[#475569] hover:text-[#0F172A]"
          }`}
        >
          <UserCheck size={14} />
          Enrollments ({enrollments.length})
        </button>
        <button
          onClick={() => setActiveSubTab("assignments")}
          className={`px-5 py-2.5 font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === "assignments"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-[#475569] hover:text-[#0F172A]"
          }`}
        >
          <BookOpen size={14} />
          Course Assignments ({assignments.length})
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-10 font-bold text-[#475569] animate-pulse">
          Syncing delivery records...
        </div>
      )}

      {/* cohorts view */}
      {!loading && activeSubTab === "cohorts" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-xs text-[#0F172A] uppercase tracking-wider">Active Cohorts</h4>
            <button
              onClick={() => {
                setEditingCohort(null);
                setCohortForm({ name: "", code: "", start_date: "", end_date: "", status_code: "active", program_id: programs[0]?.id || "" });
                setCohortModalOpen(true);
              }}
              className="bg-[#2563EB] text-white px-3 py-1.5 rounded-lg shadow-sm font-semibold hover:bg-[#2563EB]/95 transition-all flex items-center gap-1"
            >
              <Plus size={13} /> Create Cohort
            </button>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E2E8F0] font-bold text-[#475569]">
                  <th className="px-6 py-3">Cohort Name</th>
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Program</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Timeline</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {cohorts.length > 0 ? (
                  cohorts.map((cohort) => (
                    <tr key={cohort.id} className="hover:bg-slate-50/30">
                      <td className="px-6 py-3.5 font-semibold text-[#0f172a]">{cohort.name}</td>
                      <td className="px-6 py-3.5 text-[#475569] font-mono">{cohort.code}</td>
                      <td className="px-6 py-3.5 text-[#475569]">{cohort.program?.title}</td>
                      <td className="px-6 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          cohort.status_code === "active" ? "bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20" : "bg-slate-100 text-[#475569] border-[#E2E8F0]"
                        }`}>
                          {cohort.status_code}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-[#475569] font-mono">
                        {cohort.start_date ? cohort.start_date.substring(0, 10) : "N/A"} to {cohort.end_date ? cohort.end_date.substring(0, 10) : "N/A"}
                      </td>
                      <td className="px-6 py-3.5 text-right flex items-center justify-end gap-2.5">
                        <button onClick={() => handleEditCohortClick(cohort)} className="text-[#2563EB] hover:text-[#2563EB]/80" title="Edit">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDeleteCohort(cohort.id)} className="text-[#DC2626] hover:text-[#DC2626]/80" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[#475569] font-semibold bg-slate-50/10">
                      No cohorts defined under this campus yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* enrollments view */}
      {!loading && activeSubTab === "enrollments" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-xs text-[#0F172A] uppercase tracking-wider">Student Enrollments</h4>
            <button
              onClick={() => {
                setEnrollForm({ user_id: students[0]?.id || "", cohort_id: cohorts[0]?.id || "", status_code: "active" });
                setEnrollModalOpen(true);
              }}
              className="bg-[#2563EB] text-white px-3 py-1.5 rounded-lg shadow-sm font-semibold hover:bg-[#2563EB]/95 transition-all flex items-center gap-1"
            >
              <Plus size={13} /> Enroll Student
            </button>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E2E8F0] font-bold text-[#475569]">
                  <th className="px-6 py-3">Student Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Cohort</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Enrolled At</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {enrollments.length > 0 ? (
                  enrollments.map((enr) => (
                    <tr key={enr.id} className="hover:bg-slate-50/30">
                      <td className="px-6 py-3.5 font-semibold text-[#0f172a]">{enr.student?.full_name || "N/A"}</td>
                      <td className="px-6 py-3.5 text-[#475569]">{enr.student?.email || "N/A"}</td>
                      <td className="px-6 py-3.5 text-[#475569]">{enr.cohort?.name} ({enr.cohort?.code})</td>
                      <td className="px-6 py-3.5">
                        <select
                          value={enr.status_code}
                          onChange={(e) => handleEnrollStatusChange(enr.id, e.target.value)}
                          className="bg-white border border-[#E2E8F0] rounded px-2 py-0.5 font-semibold text-[10px]"
                        >
                          {enrollmentStatuses.map(status => (
                            <option key={status.code} value={status.code}>{status.code}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-3.5 text-[#475569] font-mono">
                        {enr.enrolled_at ? enr.enrolled_at.substring(0, 10) : "N/A"}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button onClick={() => handleRemoveEnrollment(enr.id)} className="text-[#DC2626] hover:text-[#DC2626]/80" title="Remove enrollment">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[#475569] font-semibold bg-slate-50/10">
                      No student enrollments registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* course assignments view */}
      {!loading && activeSubTab === "assignments" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-xs text-[#0F172A] uppercase tracking-wider">Assigned Courses to Cohorts</h4>
            <button
              onClick={() => {
                setAssignForm({ cohort_id: cohorts[0]?.id || "", course_id: allCourses[0]?.id || "", start_date: "", due_date: "", is_required: true });
                setAssignModalOpen(true);
              }}
              className="bg-[#2563EB] text-white px-3 py-1.5 rounded-lg shadow-sm font-semibold hover:bg-[#2563EB]/95 transition-all flex items-center gap-1"
            >
              <Plus size={13} /> Assign Course
            </button>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E2E8F0] font-bold text-[#475569]">
                  <th className="px-6 py-3">Course Name</th>
                  <th className="px-6 py-3">Cohort</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Required</th>
                  <th className="px-6 py-3">Timelines</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {assignments.length > 0 ? (
                  assignments.map((ass) => (
                    <tr key={ass.id} className="hover:bg-slate-50/30">
                      <td className="px-6 py-3.5 font-semibold text-[#0f172a]">{ass.course?.title}</td>
                      <td className="px-6 py-3.5 text-[#475569]">{ass.cohort?.name} ({ass.cohort?.code})</td>
                      <td className="px-6 py-3.5 text-[#475569] font-medium">Academic Assigned</td>
                      <td className="px-6 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          ass.is_required ? "bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20" : "bg-slate-100 text-[#475569] border-[#E2E8F0]"
                        }`}>
                          {ass.is_required ? "Required" : "Optional"}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-[#475569] font-mono">
                        {ass.start_date ? ass.start_date.substring(0, 10) : "Immediate"} to {ass.due_date ? ass.due_date.substring(0, 10) : "Open"}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button onClick={() => handleRemoveAssignment(ass.id)} className="text-[#DC2626] hover:text-[#DC2626]/80" title="Remove course assignment">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[#475569] font-semibold bg-slate-50/10">
                      No course assignments defined.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cohort Modal */}
      {cohortModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#0F172A]">
                {editingCohort ? "Edit Cohort" : "Create New Cohort"}
              </h3>
              <button onClick={() => setCohortModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleCohortSubmit} className="p-6 space-y-4">
              {!editingCohort && (
                <div>
                  <label className="block font-bold mb-1 text-[#475569]">Select Academic Program *</label>
                  <select
                    value={cohortForm.program_id}
                    onChange={(e) => setCohortForm({ ...cohortForm, program_id: e.target.value })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB]"
                    required
                  >
                    <option value="">-- Choose Program --</option>
                    {programs.map(prog => (
                      <option key={prog.id} value={prog.id}>{prog.title}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold mb-1 text-[#475569]">Cohort Name *</label>
                <input
                  type="text"
                  placeholder="e.g. FSD-2026-A"
                  required
                  value={cohortForm.name}
                  onChange={(e) => setCohortForm({ ...cohortForm, name: e.target.value })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-[#475569]">Business Identifier Code *</label>
                <input
                  type="text"
                  placeholder="e.g. FSD-2026-A"
                  required
                  value={cohortForm.code}
                  onChange={(e) => setCohortForm({ ...cohortForm, code: e.target.value })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1 text-[#475569]">Start Date</label>
                  <input
                    type="date"
                    value={cohortForm.start_date}
                    onChange={(e) => setCohortForm({ ...cohortForm, start_date: e.target.value })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-[#475569]">End Date</label>
                  <input
                    type="date"
                    value={cohortForm.end_date}
                    onChange={(e) => setCohortForm({ ...cohortForm, end_date: e.target.value })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-[#475569]">Cohort Status *</label>
                <select
                  value={cohortForm.status_code || "active"}
                  onChange={(e) => setCohortForm({ ...cohortForm, status_code: e.target.value })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB]"
                  required
                >
                  {cohortStatuses.length === 0 ? (
                    <option value="active">Active</option>
                  ) : (
                    cohortStatuses.map(status => (
                      <option key={status.code} value={status.code}>
                        {status.code.charAt(0).toUpperCase() + status.code.slice(1)} - {status.description}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCohortModalOpen(false)}
                  className="border border-[#E2E8F0] hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#2563EB] text-white px-4 py-2 rounded-lg shadow-sm font-semibold hover:bg-[#2563EB]/95"
                >
                  {editingCohort ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enroll Student Modal */}
      {enrollModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#0F172A]">Enroll Student</h3>
              <button onClick={() => setEnrollModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleEnrollSubmit} className="p-6 space-y-4">
              <div>
                <label className="block font-bold mb-1 text-[#475569]">Select Student *</label>
                <select
                  value={enrollForm.user_id}
                  onChange={(e) => setEnrollForm({ ...enrollForm, user_id: e.target.value })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB]"
                  required
                >
                  <option value="">-- Choose Student --</option>
                  {students.map(stu => (
                    <option key={stu.id} value={stu.id}>{stu.full_name} ({stu.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 text-[#475569]">Select Cohort *</label>
                <select
                  value={enrollForm.cohort_id}
                  onChange={(e) => setEnrollForm({ ...enrollForm, cohort_id: e.target.value })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB]"
                  required
                >
                  <option value="">-- Choose Cohort Batch --</option>
                  {cohorts.map(coh => (
                    <option key={coh.id} value={coh.id}>{coh.name} ({coh.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 text-[#475569]">Enrollment Status *</label>
                <select
                  value={enrollForm.status_code}
                  onChange={(e) => setEnrollForm({ ...enrollForm, status_code: e.target.value })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB]"
                  required
                >
                  {enrollmentStatuses.map(status => (
                    <option key={status.code} value={status.code}>{status.code} - {status.description}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEnrollModalOpen(false)}
                  className="border border-[#E2E8F0] hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#2563EB] text-white px-4 py-2 rounded-lg shadow-sm font-semibold hover:bg-[#2563EB]/95"
                >
                  Enroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Course Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#0F172A]">Assign Course to Cohort</h3>
              <button onClick={() => setAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleAssignSubmit} className="p-6 space-y-4">
              <div>
                <label className="block font-bold mb-1 text-[#475569]">Select Cohort *</label>
                <select
                  value={assignForm.cohort_id}
                  onChange={(e) => setAssignForm({ ...assignForm, cohort_id: e.target.value })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB]"
                  required
                >
                  <option value="">-- Choose Cohort Batch --</option>
                  {cohorts.map(coh => (
                    <option key={coh.id} value={coh.id}>{coh.name} ({coh.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 text-[#475569]">Select Academic Course *</label>
                <select
                  value={assignForm.course_id}
                  onChange={(e) => setAssignForm({ ...assignForm, course_id: e.target.value })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB]"
                  required
                >
                  <option value="">-- Choose Course --</option>
                  {allCourses.map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1 text-[#475569]">Start Date</label>
                  <input
                    type="date"
                    value={assignForm.start_date}
                    onChange={(e) => setAssignForm({ ...assignForm, start_date: e.target.value })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-[#475569]">Due Date</label>
                  <input
                    type="date"
                    value={assignForm.due_date}
                    onChange={(e) => setAssignForm({ ...assignForm, due_date: e.target.value })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isRequired"
                  checked={assignForm.is_required}
                  onChange={(e) => setAssignForm({ ...assignForm, is_required: e.target.checked })}
                  className="rounded border-[#E2E8F0]"
                />
                <label htmlFor="isRequired" className="font-semibold text-[#475569]">Mandatory / Required Course</label>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="border border-[#E2E8F0] hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#2563EB] text-white px-4 py-2 rounded-lg shadow-sm font-semibold hover:bg-[#2563EB]/95"
                >
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
