"use client";

import React, { useState, useEffect } from "react";
import { 
  createProgramAction, 
  deleteProgramAction, 
  listProgramsAction,
  listCoursesAction,
  listModulesAction,
  listLessonsAction,
  listLessonResourcesAction
} from "@/app/actions/academic-actions";
import { listCourseTemplatesAction, instantiateCourseTemplateAction } from "@/app/actions/library-actions";
import { 
  Folder, Plus, Edit, Trash2, X, ChevronRight, ChevronDown, 
  BookOpen, PlusCircle, CheckCircle, AlertCircle, Play, 
  FileText, Link2, ExternalLink
} from "lucide-react";

interface ProgramManagerProps {
  institutions: any[];
}

export default function ProgramManager({ institutions }: ProgramManagerProps) {
  const [selectedInstId, setSelectedInstId] = useState("");
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);
  
  // Tree Structure State
  const [treeCourses, setTreeCourses] = useState<any[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Library Course Templates for Instantiation
  const [blueprints, setBlueprints] = useState<any[]>([]);
  const [selectedBlueprintId, setSelectedBlueprintId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modals / forms
  const [programModalOpen, setProgramModalOpen] = useState(false);
  const [programForm, setProgramForm] = useState({
    title: "",
    slug: "",
    description: ""
  });

  // Fetch programs and blueprints
  useEffect(() => {
    async function loadBlueprints() {
      const bRes = await listCourseTemplatesAction();
      if (bRes.templates) {
        setBlueprints(bRes.templates);
      }
    }
    loadBlueprints();
  }, []);

  useEffect(() => {
    if (!selectedInstId) {
      setPrograms([]);
      setSelectedProgram(null);
      return;
    }
    async function loadPrograms() {
      setLoading(true);
      setError("");
      const res = await listProgramsAction(selectedInstId);
      if (res.programs) {
        setPrograms(res.programs);
      } else if (res.error) {
        setError(res.error);
      }
      setLoading(false);
    }
    loadPrograms();
  }, [selectedInstId]);

  // Load Tree/Course structure when selected program changes
  useEffect(() => {
    if (!selectedProgram) {
      setTreeCourses([]);
      return;
    }
    loadProgramTree(selectedProgram.id);
  }, [selectedProgram]);

  const loadProgramTree = async (programId: string) => {
    setLoading(true);
    const cRes = await listCoursesAction(programId);
    if (cRes.courses) {
      const coursesWithCurriculum = await Promise.all(
        cRes.courses.map(async (course: any) => {
          const mRes = await listModulesAction(course.id);
          const modules = mRes.modules || [];
          const modulesWithLessons = await Promise.all(
            modules.map(async (mod: any) => {
              const lRes = await listLessonsAction(mod.id);
              const lessons = lRes.lessons || [];
              const lessonsWithResources = await Promise.all(
                lessons.map(async (les: any) => {
                  const rRes = await listLessonResourcesAction(les.id);
                  return { ...les, resources: rRes.resources || [] };
                })
              );
              return { ...mod, lessons: lessonsWithResources };
            })
          );
          return { ...course, modules: modulesWithLessons };
        })
      );
      setTreeCourses(coursesWithCurriculum);
    } else if (cRes.error) {
      setError(cRes.error);
    }
    setLoading(false);
  };

  const handleProgramSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const res = await createProgramAction({
      ...programForm,
      tenant_id: selectedInstId,
      institution_id: selectedInstId
    });

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess("Program registered successfully!");
      setProgramModalOpen(false);
      setProgramForm({ title: "", slug: "", description: "" });
      // reload
      const reloadRes = await listProgramsAction(selectedInstId);
      if (reloadRes.programs) setPrograms(reloadRes.programs);
    }
    setLoading(false);
  };

  const handleInstantiation = async () => {
    if (!selectedBlueprintId) {
      setError("Please select a course template from the library.");
      return;
    }
    if (!selectedProgram) {
      setError("Please select an academic program.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const res = await instantiateCourseTemplateAction(
      selectedBlueprintId,
      selectedProgram.id,
      selectedInstId,
      selectedInstId
    );

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess("Course blueprint instantiated successfully!");
      setSelectedBlueprintId("");
      await loadProgramTree(selectedProgram.id);
    }
    setLoading(false);
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Top selection banner */}
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-[#475569] flex items-center gap-1.5">
          <Folder size={15} className="text-[#2563EB]" /> Live Program Scope
        </h3>
        <p className="text-xs text-[#475569] mb-4">
          Select an institution to create or manage run-time Academic Programs and duplicate course blueprints.
        </p>
        <select
          value={selectedInstId}
          onChange={(e) => setSelectedInstId(e.target.value)}
          className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A]"
        >
          <option value="">-- Select Institution Campus --</option>
          {institutions.map((inst) => (
            <option key={inst.id} value={inst.id}>
              {inst.name} ({inst.institution_code})
            </option>
          ))}
        </select>
      </div>

      {selectedInstId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Programs column */}
          <div className="lg:col-span-1 bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                <Folder size={14} className="text-[#2563EB]" /> Live Programs
              </h4>
              <button
                onClick={() => {
                  setProgramForm({ title: "", slug: "", description: "" });
                  setProgramModalOpen(true);
                }}
                className="flex items-center gap-1 bg-[#2563EB] text-white px-2 py-1 rounded-lg hover:bg-[#2563EB]/95 transition-all text-[10px] font-bold shadow-sm"
              >
                <Plus size={12} /> Create Program
              </button>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {programs.length > 0 ? (
                programs.map((prog) => (
                  <div
                    key={prog.id}
                    onClick={() => setSelectedProgram(prog)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      selectedProgram?.id === prog.id
                        ? "bg-[#2563EB]/10 border-[#2563EB]/30 text-[#2563EB]"
                        : "bg-slate-50/50 hover:bg-slate-50 border-[#E2E8F0] text-[#0F172A]"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold truncate">{prog.title}</p>
                      <p className="text-[10px] text-[#475569] font-mono truncate">/{prog.slug}</p>
                    </div>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (confirm("Are you sure you want to delete this live academic program?")) {
                          const res = await deleteProgramAction(prog.id);
                          if (res.error) setError(res.error);
                          else {
                            setSuccess("Academic Program deleted.");
                            if (selectedProgram?.id === prog.id) setSelectedProgram(null);
                            const reloadRes = await listProgramsAction(selectedInstId);
                            if (reloadRes.programs) setPrograms(reloadRes.programs);
                          }
                        }
                      }}
                      className="p-1 hover:bg-red-50 rounded text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-[#475569] text-center py-4 bg-slate-50/50 rounded-lg">No active programs found.</p>
              )}
            </div>
          </div>

          {/* Program Tree Structure Viewer & Blueprint Instantiation Workspace */}
          <div className="lg:col-span-2 space-y-6">
            {selectedProgram ? (
              <div className="space-y-6">
                
                {/* Instantiate Blueprint Banner */}
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                    <PlusCircle size={15} className="text-[#2563EB]" /> Instantiate Template Course
                  </h4>
                  <p className="text-xs text-[#475569]">
                    Select a reusable Course Template from the Library and clone it into this live Program. This will create a local copy storing its traceability history.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <select
                      value={selectedBlueprintId}
                      onChange={(e) => setSelectedBlueprintId(e.target.value)}
                      className="flex-1 bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm text-[#0F172A]"
                    >
                      <option value="">-- Choose Library Template --</option>
                      {blueprints.map((bp) => (
                        <option key={bp.id} value={bp.id}>
                          {bp.title} (Slug: {bp.slug})
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={handleInstantiation}
                      disabled={loading || !selectedBlueprintId}
                      className="bg-[#2563EB] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#2563EB]/95 transition-all text-xs disabled:opacity-50 shadow-sm shrink-0"
                    >
                      {loading ? "Instantiating..." : "Clone Template"}
                    </button>
                  </div>
                </div>

                {/* Tree Structure Viewer */}
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                      Academic Course Tree Viewer
                    </h4>
                    <span className="text-[10px] text-[#475569] font-medium">Reads exclusively from runtime tables</span>
                  </div>

                  <div className="space-y-3">
                    {treeCourses.length > 0 ? (
                      treeCourses.map((course) => {
                        const isCourseExpanded = expandedNodes[course.id];
                        return (
                          <div key={course.id} className="border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs bg-slate-50/10">
                            
                            {/* Course Node */}
                            <div 
                              onClick={() => toggleNode(course.id)}
                              className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/50 cursor-pointer select-none border-b border-[#E2E8F0]/50"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {isCourseExpanded ? <ChevronDown size={14} className="text-[#475569]" /> : <ChevronRight size={14} className="text-[#475569]" />}
                                <BookOpen size={14} className="text-[#2563EB]" />
                                <span className="font-bold text-xs text-[#0F172A] truncate">{course.title}</span>
                                {course.source_template_id && (
                                  <span className="text-[8px] bg-sky-50 text-[#2563EB] px-1.5 py-0.5 rounded border border-sky-100 font-mono tracking-tighter" title={`Cloned from blueprint template: ${course.source_template_id}`}>
                                    Blueprint ID: {course.source_template_id.substring(0, 8)}...
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-[#475569] font-mono">{course.duration_minutes || 0} mins</span>
                            </div>

                            {/* Modules Container */}
                            {isCourseExpanded && (
                              <div className="p-3 pl-6 space-y-3 border-t border-[#E2E8F0]/30 bg-slate-50/5">
                                {course.modules && course.modules.length > 0 ? (
                                  course.modules.map((mod: any) => {
                                    const isModExpanded = expandedNodes[mod.id];
                                    return (
                                      <div key={mod.id} className="border border-[#E2E8F0] rounded-lg overflow-hidden bg-white">
                                        
                                        {/* Module Node */}
                                        <div 
                                          onClick={() => toggleNode(mod.id)}
                                          className="px-3 py-2 flex items-center justify-between hover:bg-slate-50/50 cursor-pointer select-none"
                                        >
                                          <div className="flex items-center gap-2 min-w-0">
                                            {isModExpanded ? <ChevronDown size={12} className="text-[#475569]" /> : <ChevronRight size={12} className="text-[#475569]" />}
                                            <span className="font-semibold text-xs text-[#0F172A] truncate">Module {mod.position}: {mod.title}</span>
                                          </div>
                                          <span className="text-[9px] text-[#475569] font-mono bg-slate-100 px-1 rounded">{mod.lessons?.length || 0} Lessons</span>
                                        </div>

                                        {/* Lessons Container */}
                                        {isModExpanded && (
                                          <div className="p-3 pl-6 space-y-2.5 border-t border-[#E2E8F0]/50 bg-slate-50/20">
                                            {mod.lessons && mod.lessons.length > 0 ? (
                                              mod.lessons.map((les: any) => {
                                                const isLesExpanded = expandedNodes[les.id];
                                                return (
                                                  <div key={les.id} className="border border-[#E2E8F0]/50 rounded-lg p-2.5 bg-white space-y-2">
                                                    
                                                    {/* Lesson Node */}
                                                    <div 
                                                      onClick={() => toggleNode(les.id)}
                                                      className="flex items-center justify-between cursor-pointer select-none"
                                                    >
                                                      <div className="flex items-center gap-1.5 min-w-0">
                                                        {isLesExpanded ? <ChevronDown size={11} className="text-[#475569]" /> : <ChevronRight size={11} className="text-[#475569]" />}
                                                        <span className="font-medium text-xs text-[#0F172A] truncate">{les.title}</span>
                                                        <span className="text-[8px] bg-slate-100 text-[#475569] px-1 rounded uppercase font-mono font-bold shrink-0">{les.lesson_type?.code || "lesson"}</span>
                                                      </div>
                                                      <span className="text-[10px] text-[#475569] font-mono shrink-0">{les.duration || 0} mins</span>
                                                    </div>

                                                    {/* Lesson Resources Node */}
                                                    {isLesExpanded && (
                                                      <div className="border-t border-[#E2E8F0] pt-2 mt-2 space-y-1 pl-4">
                                                        {les.resources && les.resources.length > 0 ? (
                                                          les.resources.map((res: any) => (
                                                            <div key={res.id} className="flex items-center justify-between text-[10px] text-[#475569] py-1 bg-slate-50 px-2 rounded">
                                                              <div className="flex items-center gap-1.5 min-w-0">
                                                                <FileText size={10} className="shrink-0" />
                                                                <span className="truncate">{res.title}</span>
                                                                <span className="text-[8px] bg-slate-200 text-[#475569] px-1 rounded uppercase font-bold shrink-0">{res.resource_type}</span>
                                                              </div>
                                                            </div>
                                                          ))
                                                        ) : (
                                                          <p className="text-[9px] text-[#475569] italic">No resources attached to this lesson.</p>
                                                        )}
                                                      </div>
                                                    )}

                                                  </div>
                                                );
                                              })
                                            ) : (
                                              <p className="text-[10px] text-[#475569] italic">No lessons inside this module.</p>
                                            )}
                                          </div>
                                        )}

                                      </div>
                                    );
                                  })
                                ) : (
                                  <p className="text-[10px] text-[#475569] italic">No modules inside this course.</p>
                                )}
                              </div>
                            )}

                          </div>
                        );
                      })
                    ) : (
                      <div className="bg-slate-50 border border-[#E2E8F0] border-dashed rounded-xl py-8 text-center text-xs text-[#475569]">
                        <BookOpen className="mx-auto mb-2 text-[#475569]/30" size={24} />
                        <p className="font-semibold text-[#0F172A]">No Academic Courses Instantiated</p>
                        <p className="mt-1">Clone a template from the list above to populate live curriculum structures.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center text-xs text-[#475569] shadow-sm">
                <Folder className="mx-auto mb-2 text-[#475569]/40" size={32} />
                <p className="font-semibold text-[#0F172A]">Select a Program</p>
                <p className="mt-1">Instantiate course blueprints and visualize live curriculum trees for academic pathways.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Program Create Modal */}
      {programModalOpen && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xl max-w-md w-full overflow-hidden flex flex-col text-xs text-[#0F172A]">
            <div className="bg-slate-50 px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#0F172A]">Create New Program</h3>
              <button onClick={() => setProgramModalOpen(false)} className="text-[#475569] hover:text-[#0F172A] p-1.5">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleProgramSubmit} className="p-6 space-y-4">
              <div>
                <label className="block font-semibold mb-1 text-[#475569]">Program Title *</label>
                <input
                  type="text"
                  placeholder="e.g. AI Foundations"
                  value={programForm.title}
                  onChange={(e) => {
                    setProgramForm({
                      ...programForm,
                      title: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
                    });
                  }}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#475569]">Program Slug *</label>
                <input
                  type="text"
                  placeholder="e.g. ai-foundations"
                  value={programForm.slug}
                  onChange={(e) => setProgramForm({ ...programForm, slug: e.target.value })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#475569]">Description</label>
                <textarea
                  placeholder="Program objectives, pathway roadmap..."
                  value={programForm.description}
                  onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                  rows={3}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                <button type="button" onClick={() => setProgramModalOpen(false)} className="px-4 py-2 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="bg-[#2563EB] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#2563EB]/95 transition-colors disabled:opacity-50">
                  Save Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
