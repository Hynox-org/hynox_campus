"use client";

import React, { useState } from "react";
import { 
  createNewInstitutionAction, 
  assignAdminAction, 
  uploadCsvOnboardingAction 
} from "@/app/actions/institution-actions";
import { signOutAction } from "@/app/actions/auth-actions";
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
  Copy
} from "lucide-react";

interface AdminPanelProps {
  adminEmail: string;
  initialInstitutions: any[];
}

export default function AdminPanel({ adminEmail, initialInstitutions }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"institutions" | "assign" | "csv">("institutions");
  const [institutions, setInstitutions] = useState<any[]>(initialInstitutions);
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [links, setLinks] = useState<any[]>([]);

  // Form states
  const [instName, setInstName] = useState("");
  const [instSlug, setInstSlug] = useState("");
  const [instCode, setInstCode] = useState("");
  const [instType, setInstType] = useState("college");
  const [instEmail, setInstEmail] = useState("");
  const [instPhone, setInstPhone] = useState("");
  const [instAddress, setInstAddress] = useState("");
  const [instWebsite, setInstWebsite] = useState("");

  const [adminEmailInput, setAdminEmailInput] = useState("");
  const [selectedInstId, setSelectedInstId] = useState(institutions[0]?.id || "");

  const [csvContent, setCsvContent] = useState("");

  const clearStatuses = () => {
    setError("");
    setSuccess("");
    setLinks([]);
  };

  const handleCreateInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearStatuses();

    const formData = new FormData();
    formData.append("name", instName);
    formData.append("slug", instSlug);
    formData.append("code", instCode);
    formData.append("type", instType);
    formData.append("email", instEmail);
    formData.append("phone", instPhone);
    formData.append("address", instAddress);
    formData.append("website", instWebsite);

    const res = await createNewInstitutionAction(formData);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(`Institution '${instName}' successfully registered!`);
      // Update local state list
      setInstitutions([res.institution, ...institutions]);
      if (!selectedInstId) {
        setSelectedInstId(res.institution.id);
      }
      // Reset form
      setInstName("");
      setInstSlug("");
      setInstCode("");
      setInstEmail("");
      setInstPhone("");
      setInstAddress("");
      setInstWebsite("");
    }
    setLoading(false);
  };

  const handleAssignAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearStatuses();

    if (!selectedInstId) {
      setError("Please select or create an institution first.");
      setLoading(false);
      return;
    }

    const res = await assignAdminAction(selectedInstId, adminEmailInput);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(`User '${adminEmailInput}' successfully assigned as administrator.`);
      setAdminEmailInput("");
    }
    setLoading(false);
  };

  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearStatuses();

    if (!selectedInstId) {
      setError("Please select or create an institution first.");
      setLoading(false);
      return;
    }

    if (!csvContent.trim()) {
      setError("Please paste CSV contents.");
      setLoading(false);
      return;
    }

    const res = await uploadCsvOnboardingAction(selectedInstId, csvContent);
    if (res.error) {
      setError(res.error);
    } else if (res.results) {
      setLinks(res.results);
      const errors = res.results.filter((r: any) => r.status === "error");
      const successes = res.results.filter((r: any) => r.status === "success");
      
      setSuccess(`Processed CSV: ${successes.length} provisioned successfully, ${errors.length} errors.`);
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Onboarding link copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-[#0F172A]">
      
      {/* Top Header */}
      <header className="bg-white border-b border-[#E2E8F0] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building className="text-[#2563EB]" size={20} />
            <span className="font-bold text-sm tracking-tight">Hynox Campus Admin</span>
          </div>
          
          <div className="flex items-center gap-4 text-xs">
            <span className="text-[#475569]">Logged in as: <strong className="text-[#0F172A]">{adminEmail}</strong></span>
            <button
              onClick={() => signOutAction()}
              className="flex items-center gap-1.5 bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/20 px-3 py-1.5 rounded-lg hover:bg-[#DC2626] hover:text-white transition-all font-semibold"
            >
              <LogOut size={13} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-8 flex-1 w-full">
        
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 flex flex-col gap-2">
          <button
            onClick={() => {
              setActiveTab("institutions");
              clearStatuses();
            }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
              activeTab === "institutions"
                ? "bg-[#2563EB]/10 border-[#2563EB]/20 text-[#2563EB] shadow-sm"
                : "bg-white border-[#E2E8F0] hover:bg-slate-50 text-[#475569] hover:text-[#0F172A]"
            }`}
          >
            <Building size={16} />
            Institutions
          </button>
          
          <button
            onClick={() => {
              setActiveTab("assign");
              clearStatuses();
            }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
              activeTab === "assign"
                ? "bg-[#2563EB]/10 border-[#2563EB]/20 text-[#2563EB] shadow-sm"
                : "bg-white border-[#E2E8F0] hover:bg-slate-50 text-[#475569] hover:text-[#0F172A]"
            }`}
          >
            <UserPlus size={16} />
            Assign Admin
          </button>

          <button
            onClick={() => {
              setActiveTab("csv");
              clearStatuses();
            }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
              activeTab === "csv"
                ? "bg-[#2563EB]/10 border-[#2563EB]/20 text-[#2563EB] shadow-sm"
                : "bg-white border-[#E2E8F0] hover:bg-slate-50 text-[#475569] hover:text-[#0F172A]"
            }`}
          >
            <FileSpreadsheet size={16} />
            CSV Onboarding
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 flex flex-col gap-6">
          
          {/* Global Alert Statuses */}
          {error && (
            <div className="bg-[#DC2626]/5 border border-[#DC2626]/20 text-[#DC2626] rounded-xl p-4 text-xs flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-[#16A34A]/5 border border-[#16A34A]/20 text-[#16A34A] rounded-xl p-4 text-xs flex items-start gap-2">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* TAB 1: INSTITUTIONS */}
          {activeTab === "institutions" && (
            <div className="space-y-6">
              
              {/* Institution Creation Form */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-[#475569] flex items-center gap-1.5">
                  <Plus size={14} /> Register New Campus Institution
                </h3>
                
                <form onSubmit={handleCreateInstitution} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold mb-1 text-[#475569]">Institution Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Stanford University"
                      required
                      value={instName}
                      onChange={(e) => setInstName(e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[#475569]">Subdomain Slug (Unique) *</label>
                    <input
                      type="text"
                      placeholder="e.g. stanford"
                      required
                      value={instSlug}
                      onChange={(e) => setInstSlug(e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[#475569]">Institution Code (Unique) *</label>
                    <input
                      type="text"
                      placeholder="e.g. SU-CAMPUS"
                      required
                      value={instCode}
                      onChange={(e) => setInstCode(e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[#475569]">Category Type *</label>
                    <select
                      value={instType}
                      onChange={(e) => setInstType(e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm"
                    >
                      <option value="school">School</option>
                      <option value="college">College</option>
                      <option value="university">University</option>
                      <option value="training_center">Training Center</option>
                      <option value="corporate_partner">Corporate Partner</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[#475569]">Contact Email</label>
                    <input
                      type="email"
                      placeholder="admin@college.edu"
                      value={instEmail}
                      onChange={(e) => setInstEmail(e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[#475569]">Contact Phone</label>
                    <input
                      type="text"
                      placeholder="+1 (555) 019-2834"
                      value={instPhone}
                      onChange={(e) => setInstPhone(e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-semibold mb-1 text-[#475569]">Website Address</label>
                    <input
                      type="text"
                      placeholder="https://college.edu"
                      value={instWebsite}
                      onChange={(e) => setInstWebsite(e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-semibold mb-1 text-[#475569]">Physical Address</label>
                    <textarea
                      placeholder="Street, City, State, ZIP"
                      value={instAddress}
                      onChange={(e) => setInstAddress(e.target.value)}
                      rows={2}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm resize-none"
                    />
                  </div>

                  <div className="md:col-span-2 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-[#2563EB] text-white px-4 py-2.5 rounded-lg shadow-sm font-semibold hover:bg-[#2563EB]/95 transition-all disabled:opacity-50"
                    >
                      {loading ? "Registering..." : "Create Institution"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Institutions Listing Table */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-6 py-3 border-b border-[#E2E8F0]">
                  <h4 className="text-xs font-bold text-[#0F172A]">REGISTERED INSTITUTIONS</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-[#E2E8F0] font-bold text-[#475569]">
                        <th className="px-6 py-2.5">Name</th>
                        <th className="px-6 py-2.5">Code</th>
                        <th className="px-6 py-2.5">Type</th>
                        <th className="px-6 py-2.5">Slug</th>
                        <th className="px-6 py-2.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {institutions.length > 0 ? (
                        institutions.map((inst, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-6 py-3 font-semibold text-[#0F172A]">{inst.name}</td>
                            <td className="px-6 py-3 text-[#475569] font-mono">{inst.institution_code}</td>
                            <td className="px-6 py-3 text-[#475569] font-medium">{inst.institution_type}</td>
                            <td className="px-6 py-3 text-[#475569]">{inst.slug}</td>
                            <td className="px-6 py-3 text-right">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                inst.status === "active"
                                  ? "bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20"
                                  : "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
                              }`}>
                                {inst.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-6 text-center text-[#475569]">
                            No registered institutions found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ASSIGN ADMIN */}
          {activeTab === "assign" && (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-[#475569] flex items-center gap-1.5">
                <UserPlus size={15} /> Assign Institution Administrator
              </h3>

              <p className="text-xs text-[#475569] mb-5 leading-relaxed">
                Map a pre-registered user (via their email address) to manage a specific academic campus tenant. 
                This assigns them the `institution_admin` role and links their profile tenant isolation scope.
              </p>

              <form onSubmit={handleAssignAdmin} className="space-y-4 text-xs max-w-md">
                <div>
                  <label className="block font-semibold mb-1 text-[#475569]">Select Campus Tenant *</label>
                  <select
                    value={selectedInstId}
                    onChange={(e) => setSelectedInstId(e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm"
                  >
                    <option value="">-- Choose Institution --</option>
                    {institutions.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name} ({inst.institution_code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#475569]">Administrator Email Address *</label>
                  <input
                    type="email"
                    placeholder="e.g. principal@college.edu"
                    required
                    value={adminEmailInput}
                    onChange={(e) => setAdminEmailInput(e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || !selectedInstId || !adminEmailInput}
                    className="bg-[#2563EB] text-white px-4 py-2.5 rounded-lg shadow-sm font-semibold hover:bg-[#2563EB]/95 transition-all disabled:opacity-50"
                  >
                    {loading ? "Assigning..." : "Assign Tenant Administrator"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: CSV ONBOARDING */}
          {activeTab === "csv" && (
            <div className="space-y-6">
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-[#475569] flex items-center gap-1.5">
                  <FileSpreadsheet size={15} /> Bulk CSV Student/Teacher Onboarding
                </h3>

                <p className="text-xs text-[#475569] mb-4 leading-relaxed">
                  Provision accounts in bulk. Paste a CSV containing headers <code className="bg-[#F8FAFC] border border-[#E2E8F0] px-1 py-0.5 rounded font-mono text-[#0F172A]">name, email, role, institution_id</code>.
                  If <code className="bg-[#F8FAFC] border border-[#E2E8F0] px-1 py-0.5 rounded font-mono text-[#0F172A]">institution_id</code> column is missing or blank, the uploader defaults to the selected tenant below.
                </p>

                <form onSubmit={handleCsvUpload} className="space-y-4 text-xs">
                  <div className="max-w-md">
                    <label className="block font-semibold mb-1 text-[#475569]">Default Institution *</label>
                    <select
                      value={selectedInstId}
                      onChange={(e) => setSelectedInstId(e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm"
                    >
                      <option value="">-- Select Default Institution --</option>
                      {institutions.map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.name} ({inst.institution_code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-semibold text-[#475569]">Pasted CSV Contents *</label>
                      <button
                        type="button"
                        onClick={() => setCsvContent(`name,email,role\nJane Doe,jane@school.edu,student\nJohn Smith,john@school.edu,teacher`)}
                        className="text-[10px] text-[#2563EB] hover:underline font-bold"
                      >
                        (Insert Sample Template)
                      </button>
                    </div>
                    <textarea
                      placeholder="name,email,role,institution_id&#10;Jane Doe,jane.doe@college.edu,student&#10;Professor Plum,plum@college.edu,teacher"
                      required
                      value={csvContent}
                      onChange={(e) => setCsvContent(e.target.value)}
                      rows={8}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 font-mono text-xs focus:outline-none focus:border-[#2563EB] shadow-sm resize-y"
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading || !selectedInstId || !csvContent.trim()}
                      className="bg-[#2563EB] text-white px-4 py-2.5 rounded-lg shadow-sm font-semibold hover:bg-[#2563EB]/95 transition-all disabled:opacity-50"
                    >
                      {loading ? "Processing Onboarding..." : "Process Bulk Onboarding Link"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Onboarding Links Generation Display */}
              {links.length > 0 && (
                <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-6 py-3 border-b border-[#E2E8F0]">
                    <h4 className="text-xs font-bold text-[#0F172A]">GENERATED ONBOARDING LINKS</h4>
                  </div>
                  
                  <div className="divide-y divide-[#E2E8F0]">
                    {links.map((link, idx) => (
                      <div key={idx} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/20 text-xs">
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#0F172A] truncate">{link.email}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              link.status === "success" 
                                ? "bg-[#16A34A]/10 text-[#16A34A]" 
                                : "bg-[#DC2626]/10 text-[#DC2626]"
                            }`}>
                              {link.status === "success" ? "Success" : "Failed"}
                            </span>
                          </div>
                          {link.error && <p className="text-[#DC2626] text-[10px]">{link.error}</p>}
                          {link.link && (
                            <span className="text-[#475569] font-mono text-[10px] select-all truncate block">
                              {link.link}
                            </span>
                          )}
                        </div>

                        {link.link && (
                          <button
                            onClick={() => copyToClipboard(link.link)}
                            className="flex items-center justify-center gap-1.5 border border-[#E2E8F0] bg-white px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-all font-semibold shrink-0 text-[10px]"
                          >
                            <Copy size={12} />
                            Copy Link
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
