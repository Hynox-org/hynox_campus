"use client";

import React, { useState, useEffect } from "react";
import { 
  listCourseTemplatesAction, 
  createCourseTemplateAction, 
  updateCourseTemplateAction, 
  deleteCourseTemplateAction,
  listModuleTemplatesAction,
  createModuleTemplateAction,
  updateModuleTemplateAction,
  deleteModuleTemplateAction,
  listLessonTemplatesAction,
  createLessonTemplateAction,
  updateLessonTemplateAction,
  deleteLessonTemplateAction,
  listResourceTemplatesAction,
  createResourceTemplateAction,
  deleteResourceTemplateAction
} from "@/app/actions/library-actions";
import { 
  BookOpen, Plus, Edit, Trash2, X, FolderPlus, 
  Folder, ArrowRight, Save, Clock, ChevronRight, 
  ChevronDown, FileText, Link2, ExternalLink
} from "lucide-react";

export default function LibraryBuilder() {
  const [courseTemplates, setCourseTemplates] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [modules, setModules] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modals / forms states
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [courseForm, setCourseForm] = useState({
    title: "",
    slug: "",
    description: "",
    course_type_code: "theory",
    enrollment_mode: "open",
    duration_minutes: 60,
    thumbnail_path: "",
    is_published: false
  });

  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<any | null>(null);
  const [moduleForm, setModuleForm] = useState({
    title: "",
    description: "",
    position: 1
  });

  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [lessonForm, setLessonForm] = useState({
    title: "",
    lesson_type_code: "text",
    content_json_str: "{}",
    video_url: "",
    duration: 15,
    position: 1,
    is_preview: false
  });

  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [resourceForm, setResourceForm] = useState({
    title: "",
    resource_type: "link",
    file_url: "",
    external_url: "",
    position: 1
  });

  // Fetch course templates on mount
  useEffect(() => {
    async function loadCourses() {
      setLoading(true);
      const res = await listCourseTemplatesAction();
      if (res.templates) {
        setCourseTemplates(res.templates);
      } else if (res.error) {
        setError(res.error);
      }
      setLoading(false);
    }
    loadCourses();
  }, []);

  // Fetch details (modules, lessons, resources) when selected course changes
  useEffect(() => {
    if (!selectedCourse) {
      setModules([]);
      return;
    }
    async function loadCourseDetails() {
      setLoading(true);
      setError("");
      const mRes = await listModuleTemplatesAction(selectedCourse.id);
      if (mRes.modules) {
        const modulesWithLessons = await Promise.all(
          mRes.modules.map(async (mod: any) => {
            const lRes = await listLessonTemplatesAction(mod.id);
            const lessons = lRes.lessons || [];
            const lessonsWithResources = await Promise.all(
              lessons.map(async (les: any) => {
                const rRes = await listResourceTemplatesAction(les.id);
                return { ...les, resources: rRes.resources || [] };
              })
            );
            return { ...mod, lessons: lessonsWithResources };
          })
        );
        setModules(modulesWithLessons);
      } else if (mRes.error) {
        setError(mRes.error);
      }
      setLoading(false);
    }
    loadCourseDetails();
  }, [selectedCourse]);

  const refreshCourseDetails = async (courseId: string) => {
    const mRes = await listModuleTemplatesAction(courseId);
    if (mRes.modules) {
      const modulesWithLessons = await Promise.all(
        mRes.modules.map(async (mod: any) => {
          const lRes = await listLessonTemplatesAction(mod.id);
          const lessons = lRes.lessons || [];
          const lessonsWithResources = await Promise.all(
            lessons.map(async (les: any) => {
              const rRes = await listResourceTemplatesAction(les.id);
              return { ...les, resources: rRes.resources || [] };
            })
          );
          return { ...mod, lessons: lessonsWithResources };
        })
      );
      setModules(modulesWithLessons);
    }
  };

  const refreshCourseList = async () => {
    const res = await listCourseTemplatesAction();
    if (res.templates) {
      setCourseTemplates(res.templates);
      if (selectedCourse) {
        const updated = res.templates.find(t => t.id === selectedCourse.id);
        if (updated) setSelectedCourse(updated);
      }
    }
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    let res;
    if (editingCourse) {
      res = await updateCourseTemplateAction(editingCourse.id, courseForm);
    } else {
      res = await createCourseTemplateAction(courseForm);
    }

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess("Course template saved successfully!");
      setCourseModalOpen(false);
      setEditingCourse(null);
      await refreshCourseList();
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
      res = await updateModuleTemplateAction(editingModule.id, moduleForm);
    } else {
      res = await createModuleTemplateAction({
        ...moduleForm,
        course_template_id: selectedCourse.id
      });
    }

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess("Module template saved!");
      setModuleModalOpen(false);
      setEditingModule(null);
      await refreshCourseDetails(selectedCourse.id);
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
      res = await updateLessonTemplateAction(editingLesson.id, {
        title: lessonForm.title,
        lesson_type_code: lessonForm.lesson_type_code,
        content_json,
        video_url: lessonForm.video_url || undefined,
        duration: lessonForm.duration,
        position: lessonForm.position,
        is_preview: lessonForm.is_preview
      });
    } else {
      res = await createLessonTemplateAction({
        module_template_id: selectedModuleId,
        title: lessonForm.title,
        lesson_type_code: lessonForm.lesson_type_code,
        content_json,
        video_url: lessonForm.video_url || undefined,
        duration: lessonForm.duration,
        position: lessonForm.position,
        is_preview: lessonForm.is_preview
      });
    }

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess("Lesson template saved!");
      setLessonModalOpen(false);
      setEditingLesson(null);
      await refreshCourseDetails(selectedCourse.id);
    }
    setLoading(false);
  };

  const handleResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const res = await createResourceTemplateAction({
      lesson_template_id: selectedLessonId,
      title: resourceForm.title,
      resource_type: resourceForm.resource_type,
      file_url: resourceForm.file_url || undefined,
      external_url: resourceForm.external_url || undefined,
      position: resourceForm.position
    });

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess("Resource template added!");
      setResourceModalOpen(false);
      await refreshCourseDetails(selectedCourse.id);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 col-span-full w-full">
      {/* Alert Banners */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Course Templates List Panel */}
      <div className="lg:col-span-1 bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
            <BookOpen size={14} className="text-[#2563EB]" /> Course Blueprints
          </h4>
          <button
            onClick={() => {
              setEditingCourse(null);
              setCourseForm({
                title: "",
                slug: "",
                description: "",
                course_type_code: "theory",
                enrollment_mode: "open",
                duration_minutes: 60,
                thumbnail_path: "",
                is_published: false
              });
              setCourseModalOpen(true);
            }}
            className="flex items-center gap-1 bg-[#2563EB] text-white px-2 py-1 rounded-lg hover:bg-[#2563EB]/95 transition-all text-[10px] font-bold shadow-sm"
          >
            <Plus size={12} /> New Template
          </button>
        </div>

        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {courseTemplates.length > 0 ? (
            courseTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => setSelectedCourse(template)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                  selectedCourse?.id === template.id
                    ? "bg-[#2563EB]/10 border-[#2563EB]/30 text-[#2563EB]"
                    : "bg-slate-50/50 hover:bg-slate-50 border-[#E2E8F0] text-[#0F172A]"
                }`}
              >
                <div className="min-w-0 pr-2">
                  <p className="font-semibold truncate">{template.title}</p>
                  <p className="text-[10px] text-[#475569] font-mono truncate">/{template.slug}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCourse(template);
                      setCourseForm({
                        title: template.title,
                        slug: template.slug,
                        description: template.description || "",
                        course_type_code: template.course_type_code || "theory",
                        enrollment_mode: template.enrollment_mode || "open",
                        duration_minutes: template.duration_minutes || 60,
                        thumbnail_path: template.thumbnail_path || "",
                        is_published: template.is_published || false
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
                      if (confirm("Are you sure you want to delete this course template blueprint?")) {
                        const res = await deleteCourseTemplateAction(template.id);
                        if (res.error) setError(res.error);
                        else {
                          setSuccess("Course blueprint deleted!");
                          if (selectedCourse?.id === template.id) setSelectedCourse(null);
                          await refreshCourseList();
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
            <p className="text-[11px] text-[#475569] text-center py-4 bg-slate-50/50 rounded-lg">No course templates created yet.</p>
          )}
        </div>
      </div>

      {/* Course Blueprint Builder Workspace (Modules -> Lessons -> Resources) */}
      <div className="lg:col-span-2 space-y-6">
        {selectedCourse ? (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#2563EB] tracking-wider bg-[#2563EB]/10 px-2 py-0.5 rounded border border-[#2563EB]/25">Blueprint</span>
                <h3 className="text-sm font-bold text-[#0F172A] mt-2">{selectedCourse.title}</h3>
                <p className="text-xs text-[#475569] mt-0.5">{selectedCourse.description || "No description set for this blueprint."}</p>
              </div>
              <div className="mt-2 sm:mt-0 bg-slate-100 px-3 py-1.5 rounded-lg text-[11px] text-[#0F172A] border border-[#E2E8F0] font-mono shrink-0 font-semibold">
                Duration: {selectedCourse.duration_minutes || 0} mins
              </div>
            </div>

            {/* Curriculum Modules */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                  <FolderPlus size={15} className="text-[#2563EB]" /> Blueprint Structure (Modules & Lessons)
                </h4>
                <button
                  onClick={() => {
                    setEditingModule(null);
                    setModuleForm({ title: "", description: "", position: modules.length + 1 });
                    setModuleModalOpen(true);
                  }}
                  className="flex items-center gap-1 bg-[#2563EB] text-white px-2.5 py-1.5 rounded-lg hover:bg-[#2563EB]/95 transition-all text-[11px] font-bold shadow-sm"
                >
                  <Plus size={13} /> Create Module Template
                </button>
              </div>

              <div className="space-y-4">
                {modules.length > 0 ? (
                  modules.map((mod) => (
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
                              setSelectedModuleId(mod.id);
                              setEditingLesson(null);
                              setLessonForm({
                                title: "",
                                lesson_type_code: "text",
                                content_json_str: "{}",
                                video_url: "",
                                duration: 15,
                                position: (mod.lessons?.length || 0) + 1,
                                is_preview: false
                              });
                              setLessonModalOpen(true);
                            }}
                            className="flex items-center gap-1 bg-white border border-[#E2E8F0] hover:bg-slate-50 px-2 py-1 rounded text-[10px] font-bold text-[#0F172A] shadow-xs"
                          >
                            <Plus size={11} /> Add Lesson Template
                          </button>
                          <button
                            onClick={() => {
                              setEditingModule(mod);
                              setModuleForm({
                                title: mod.title,
                                description: mod.description || "",
                                position: mod.position
                              });
                              setModuleModalOpen(true);
                            }}
                            className="p-1 hover:bg-slate-200 rounded text-[#475569] hover:text-[#0F172A]"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm("Are you sure you want to delete this module template?")) {
                                const res = await deleteModuleTemplateAction(mod.id);
                                if (res.error) setError(res.error);
                                else {
                                  setSuccess("Module template deleted!");
                                  await refreshCourseDetails(selectedCourse.id);
                                }
                              }
                            }}
                            className="p-1 hover:bg-red-50 rounded text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Lessons list under this module */}
                      <div className="p-4 space-y-3">
                        {mod.lessons && mod.lessons.length > 0 ? (
                          mod.lessons.map((les: any) => (
                            <div key={les.id} className="bg-white border border-[#E2E8F0] rounded-xl p-3.5 space-y-3 shadow-xs">
                              <div className="flex items-start justify-between">
                                <div className="min-w-0 pr-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-xs text-[#0F172A]">{les.title}</span>
                                    <span className="text-[9px] bg-slate-100 text-[#475569] px-1.5 py-0.5 rounded font-bold font-mono">
                                      {les.lesson_type_code || "text"}
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
                                      setSelectedLessonId(les.id);
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
                                    <Link2 size={12} /> Resource Template
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingLesson(les);
                                      setSelectedModuleId(mod.id);
                                      setLessonForm({
                                        title: les.title,
                                        lesson_type_code: les.lesson_type_code,
                                        content_json_str: JSON.stringify(les.content_json || {}),
                                        video_url: les.video_url || "",
                                        duration: les.duration || 15,
                                        position: les.position || 1,
                                        is_preview: les.is_preview || false
                                      });
                                      setLessonModalOpen(true);
                                    }}
                                    className="p-1 hover:bg-slate-200 rounded text-[#475569] hover:text-[#0F172A]"
                                  >
                                    <Edit size={12} />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (confirm("Are you sure you want to delete this lesson template?")) {
                                        const res = await deleteLessonTemplateAction(les.id);
                                        if (res.error) setError(res.error);
                                        else {
                                          setSuccess("Lesson template deleted!");
                                          await refreshCourseDetails(selectedCourse.id);
                                        }
                                      }
                                    }}
                                    className="p-1 hover:bg-red-50 rounded text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>

                              {/* Lesson Resources List */}
                              {les.resources && les.resources.length > 0 && (
                                <div className="border-t border-[#E2E8F0] pt-2 mt-2 space-y-1 bg-slate-50/50 p-2 rounded-lg">
                                  <p className="text-[9px] uppercase font-bold text-[#475569] mb-1">Attached Resource Blueprints</p>
                                  {les.resources.map((resrc: any) => (
                                    <div key={resrc.id} className="flex items-center justify-between text-[10px] text-[#475569] py-1">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <FileText size={10} className="shrink-0 text-[#475569]" />
                                        <span className="font-medium truncate">{resrc.title}</span>
                                        <span className="text-[8px] bg-slate-200 text-[#475569] px-1 rounded uppercase font-bold shrink-0">{resrc.resource_type}</span>
                                      </div>
                                      <button
                                        onClick={async () => {
                                          if (confirm("Delete this resource template?")) {
                                            const r = await deleteResourceTemplateAction(resrc.id);
                                            if (r.error) setError(r.error);
                                            else await refreshCourseDetails(selectedCourse.id);
                                          }
                                        }}
                                        className="text-red-500 hover:text-red-700 font-bold ml-2"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-[10px] text-[#475569] text-center py-3 bg-slate-50/30 rounded-lg">No lessons inside this module blueprint.</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#475569] py-8 text-center bg-slate-50 rounded-xl font-medium">No curriculum modules mapped to this blueprint. Click &apos;Create Module Template&apos; to begin.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center text-xs text-[#475569] shadow-sm">
            <BookOpen className="mx-auto mb-2 text-[#475569]/40" size={32} />
            <p className="font-semibold text-[#0F172A]">Select a Course Blueprint</p>
            <p className="mt-1">Manage nested syllabus templates, lessons, and assets without affecting student live classes.</p>
          </div>
        )}
      </div>

      {/* Course Blueprint Modal */}
      {courseModalOpen && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xl max-w-md w-full overflow-hidden flex flex-col text-xs text-[#0F172A]">
            <div className="bg-slate-50 px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#0F172A]">
                {editingCourse ? "Edit Course Blueprint" : "Create Course Blueprint"}
              </h3>
              <button onClick={() => setCourseModalOpen(false)} className="text-[#475569] hover:text-[#0F172A] p-1.5">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCourseSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block font-semibold mb-1 text-[#475569]">Blueprint Title *</label>
                <input
                  type="text"
                  placeholder="e.g. React Fundamentals"
                  value={courseForm.title}
                  onChange={(e) => {
                    setCourseForm({
                      ...courseForm,
                      title: e.target.value,
                      slug: editingCourse ? courseForm.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
                    });
                  }}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#475569]">Blueprint URL Slug *</label>
                <input
                  type="text"
                  placeholder="e.g. react-fundamentals"
                  value={courseForm.slug}
                  onChange={(e) => setCourseForm({ ...courseForm, slug: e.target.value })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#475569]">Description</label>
                <textarea
                  placeholder="Course blueprint details, objectives..."
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  rows={3}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-[#475569]">Course Type *</label>
                  <select
                    value={courseForm.course_type_code}
                    onChange={(e) => setCourseForm({ ...courseForm, course_type_code: e.target.value })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm"
                  >
                    <option value="theory">Theory</option>
                    <option value="practical">Practical/Lab</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="project">Project-based</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#475569]">Duration (minutes)</label>
                  <input
                    type="number"
                    value={courseForm.duration_minutes}
                    onChange={(e) => setCourseForm({ ...courseForm, duration_minutes: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm"
                    min={0}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                <button type="button" onClick={() => setCourseModalOpen(false)} className="px-4 py-2 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="bg-[#2563EB] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#2563EB]/95 transition-colors disabled:opacity-50">
                  {loading ? "Saving..." : "Save Blueprint"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Module Template Modal */}
      {moduleModalOpen && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xl max-w-md w-full overflow-hidden flex flex-col text-xs text-[#0F172A]">
            <div className="bg-slate-50 px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#0F172A]">
                {editingModule ? "Edit Module Template" : "Add Module Template"}
              </h3>
              <button onClick={() => setModuleModalOpen(false)} className="text-[#475569] hover:text-[#0F172A] p-1.5">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleModuleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block font-semibold mb-1 text-[#475569]">Module Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Introduction to Routing"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#475569]">Description</label>
                <textarea
                  placeholder="Summary of module learning goals..."
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  rows={2}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm resize-none"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#475569]">Order Position</label>
                <input
                  type="number"
                  value={moduleForm.position}
                  onChange={(e) => setModuleForm({ ...moduleForm, position: parseInt(e.target.value) || 1 })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm"
                  min={1}
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                <button type="button" onClick={() => setModuleModalOpen(false)} className="px-4 py-2 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="bg-[#2563EB] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#2563EB]/95 transition-colors disabled:opacity-50">
                  Save Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Template Modal */}
      {lessonModalOpen && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xl max-w-md w-full overflow-hidden flex flex-col text-xs text-[#0F172A]">
            <div className="bg-slate-50 px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#0F172A]">
                {editingLesson ? "Edit Lesson Blueprint" : "Add Lesson Blueprint"}
              </h3>
              <button onClick={() => setLessonModalOpen(false)} className="text-[#475569] hover:text-[#0F172A] p-1.5">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleLessonSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block font-semibold mb-1 text-[#475569]">Lesson Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Dynamic Page Routing"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-[#475569]">Lesson Type *</label>
                  <select
                    value={lessonForm.lesson_type_code}
                    onChange={(e) => setLessonForm({ ...lessonForm, lesson_type_code: e.target.value })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm"
                  >
                    <option value="text">Text Document</option>
                    <option value="video">Video Lecture</option>
                    <option value="pdf">PDF Document</option>
                    <option value="assignment">Assignment File</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#475569]">Duration (minutes)</label>
                  <input
                    type="number"
                    value={lessonForm.duration}
                    onChange={(e) => setLessonForm({ ...lessonForm, duration: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#475569]">Video URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://vimeo.com/... or cloud storage URL"
                  value={lessonForm.video_url}
                  onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#475569]">Markdown content JSON *</label>
                <textarea
                  placeholder='{"body": "Hello world"}'
                  value={lessonForm.content_json_str}
                  onChange={(e) => setLessonForm({ ...lessonForm, content_json_str: e.target.value })}
                  rows={4}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm font-mono resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPreview"
                  checked={lessonForm.is_preview}
                  onChange={(e) => setLessonForm({ ...lessonForm, is_preview: e.target.checked })}
                  className="rounded border-[#E2E8F0] text-[#2563EB]"
                />
                <label htmlFor="isPreview" className="font-semibold text-[#475569] cursor-pointer">Previewable by non-enrolled students</label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                <button type="button" onClick={() => setLessonModalOpen(false)} className="px-4 py-2 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="bg-[#2563EB] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#2563EB]/95 transition-colors disabled:opacity-50">
                  Save Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resource Template Modal */}
      {resourceModalOpen && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xl max-w-md w-full overflow-hidden flex flex-col text-xs text-[#0F172A]">
            <div className="bg-slate-50 px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#0F172A]">Add Resource Blueprint</h3>
              <button onClick={() => setResourceModalOpen(false)} className="text-[#475569] hover:text-[#0F172A] p-1.5">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleResourceSubmit} className="p-6 space-y-4">
              <div>
                <label className="block font-semibold mb-1 text-[#475569]">Resource Title *</label>
                <input
                  type="text"
                  placeholder="e.g. GitHub Repository, Assignment PDF"
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#475569]">Resource Type *</label>
                <select
                  value={resourceForm.resource_type}
                  onChange={(e) => setResourceForm({ ...resourceForm, resource_type: e.target.value })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm"
                >
                  <option value="link">External Web Link</option>
                  <option value="pdf">PDF File</option>
                  <option value="zip">ZIP Archive</option>
                  <option value="doc">Text Document</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#475569]">External URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://github.com/..."
                  value={resourceForm.external_url}
                  onChange={(e) => setResourceForm({ ...resourceForm, external_url: e.target.value })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#475569]">File URL (Optional)</label>
                <input
                  type="text"
                  placeholder="course-assets/handouts/assignment-1.pdf"
                  value={resourceForm.file_url}
                  onChange={(e) => setResourceForm({ ...resourceForm, file_url: e.target.value })}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                <button type="button" onClick={() => setResourceModalOpen(false)} className="px-4 py-2 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="bg-[#2563EB] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#2563EB]/95 transition-colors disabled:opacity-50">
                  Add Resource Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
    </div>
  );
}
