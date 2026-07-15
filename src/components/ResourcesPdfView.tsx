import React, { useState } from "react";
import { Plus, FileText, Search, ExternalLink, Trash2, Send, Bot, RefreshCw, Upload, Sparkles, BookMarked } from "lucide-react";
import { StudyDatabase, StudyResource } from "../types";

interface ResourcesPdfViewProps {
  db: StudyDatabase;
  onUpdateDb: (updated: StudyDatabase) => void;
  onAddXp: (xp: number) => void;
}

export default function ResourcesPdfView({ db, onUpdateDb, onAddXp }: ResourcesPdfViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [resName, setResName] = useState("");
  const [resType, setResType] = useState<"PDF" | "Video" | "Link" | "Cheat Sheet" | "Image">("PDF");
  const [resUrl, setResUrl] = useState("");
  const [resNotes, setResNotes] = useState("");
  const [selectedSubj, setSelectedSubj] = useState(db.subjects[0]?.id || "");

  // Base64 file upload simulator
  const [base64File, setBase64File] = useState("");

  // Chat with doc state
  const [selectedDocId, setSelectedDocId] = useState<string>(db.resources[0]?.id || "");
  const [chatQuery, setChatQuery] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatResponse, setChatResponse] = useState("");

  const activeDoc = db.resources.find((r) => r.id === selectedDocId) || db.resources[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setBase64File(reader.result as string);
      setResName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resName.trim() || !selectedSubj) return;

    const newRes: StudyResource = {
      id: "res-" + Date.now(),
      name: resName,
      type: resType,
      url: resUrl,
      base64File: base64File || undefined,
      subjectId: selectedSubj,
      notes: resNotes,
    };

    const updated = [...db.resources, newRes];
    onUpdateDb({
      ...db,
      resources: updated,
    });

    setResName("");
    setResUrl("");
    setResNotes("");
    setBase64File("");
    setShowAddForm(false);
    onAddXp(30);
    alert("📁 Study resource uploaded successfully! You can now analyze or chat with it.");
  };

  const handleDeleteResource = (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    const updated = db.resources.filter((r) => r.id !== id);
    onUpdateDb({
      ...db,
      resources: updated,
    });
    if (selectedDocId === id) {
      setSelectedDocId(updated[0]?.id || "");
    }
  };

  // Chat with Document using actual server Gemini 3.5 proxy
  const handleChatWithDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim() || !activeDoc || chatLoading) return;

    setChatLoading(true);
    setChatResponse("");

    try {
      const docContext = `
The student is querying the document: "${activeDoc.name}" (${activeDoc.type}).
Associated Subject: ${db.subjects.find((s) => s.id === activeDoc.subjectId)?.name || "General"}
Document notes/metadata provided by student: "${activeDoc.notes || "None"}"
Query: "${chatQuery}"
`;

      const response = await fetch("/api/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `In the context of the studying document provided below, answer my query. If you need details that aren't in the summary notes, explain clearly based on standard curriculum guidelines.\n\nContext:\n${docContext}`,
          context: db,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setChatResponse(data.text);
    } catch (err: any) {
      setChatResponse(`⚠️ Error communicating with Gemini: ${err.message || "Failed to fetch response."}. Please configure your API key.`);
    } finally {
      setChatLoading(false);
    }
  };

  const getSubjName = (id: string) => {
    return db.subjects.find((s) => s.id === id)?.name || "General";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="resources-pdf-module">
      {/* Left Column: Resource Manager & Uploads */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/70 shadow-sm flex-1">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <FileText size={16} className="text-blue-500" />
              Resource Library
            </h3>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-600 hover:text-white transition-all text-xs font-bold"
            >
              Upload
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddResource} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-3 mb-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Drag & Drop or Select File</label>
                <div className="border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors relative">
                  <Upload size={18} className="mx-auto text-zinc-400 mb-1.5" />
                  <span className="text-[10px] text-zinc-500 font-semibold block">Select PDF, Image, or Cheat sheet</span>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Resource Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NCERT Biology Textbook.pdf"
                  value={resName}
                  onChange={(e) => setResName(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Type</label>
                  <select
                    value={resType}
                    onChange={(e: any) => setResType(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="Cheat Sheet">Cheat Sheet</option>
                    <option value="Video">Video Link</option>
                    <option value="Link">External Link</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Subject</label>
                  <select
                    required
                    value={selectedSubj}
                    onChange={(e) => setSelectedSubj(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-950 dark:text-white"
                  >
                    <option value="">Select Subject</option>
                    {db.subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Notes / Core Summary points</label>
                <textarea
                  rows={2}
                  placeholder="Insert key highlights, equations, or bookmarks..."
                  value={resNotes}
                  onChange={(e) => setResNotes(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm"
              >
                Save Resource
              </button>
            </form>
          )}

          <div className="flex flex-col gap-2">
            {db.resources.map((res) => (
              <button
                key={res.id}
                onClick={() => setSelectedDocId(res.id)}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  selectedDocId === res.id
                    ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50"
                }`}
              >
                <div>
                  <div className="text-xs font-bold truncate max-w-[150px]">{res.name}</div>
                  <div className="text-[9px] text-zinc-500 mt-0.5">
                    {res.type} • {getSubjName(res.subjectId)}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteResource(res.id);
                  }}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 size={12} />
                </button>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Middle & Right 2 Cols: Chat with Document Simulator */}
      <div className="lg:col-span-2 flex flex-col h-[500px] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/70 shadow-sm overflow-hidden">
        {activeDoc ? (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  Chat with PDF: {activeDoc.name}
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">
                  Type questions to extract core formulas, definitions, or summarize sections instantly.
                </div>
              </div>
            </div>

            {/* Response area */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                <strong className="text-blue-600 dark:text-blue-400 font-bold block mb-1">Highlighted Notes / File Metadata:</strong>
                {activeDoc.notes || "No custom highlight notes cataloged for this resource. Use the chat bar below to query concepts."}
              </div>

              {chatResponse ? (
                <div className="flex gap-3 max-w-[90%] self-start">
                  <div className="p-2 rounded-full h-8 w-8 bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0">
                    <Bot size={14} />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">
                    {chatResponse}
                  </div>
                </div>
              ) : (
                <div className="text-center text-zinc-400 italic text-xs py-12">
                  Query the PDF using the text block below.
                </div>
              )}

              {chatLoading && (
                <div className="flex gap-3 self-start items-center">
                  <div className="p-2 rounded-full h-8 w-8 bg-blue-600/10 text-blue-600 flex items-center justify-center">
                    <Bot size={14} />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-xs text-zinc-500 flex items-center gap-2 rounded-tl-none">
                    <RefreshCw size={12} className="animate-spin" /> Deep scanning document highlights...
                  </div>
                </div>
              )}
            </div>

            {/* Chat Bar */}
            <form onSubmit={handleChatWithDoc} className="p-3 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
              <input
                type="text"
                required
                value={chatQuery}
                onChange={(e) => setChatQuery(e.target.value)}
                placeholder={`Ask query about ${activeDoc.name}...`}
                className="flex-1 text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={chatLoading}
                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center text-zinc-500 italic py-24">No study documents uploaded. Select Upload above to add a book or formula cheat sheet.</div>
        )}
      </div>
    </div>
  );
}
