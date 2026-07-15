import React, { useState } from "react";
import { Plus, BookOpen, CheckCircle, RefreshCw, AlertTriangle, Sparkles, BookMarked, ThumbsUp } from "lucide-react";
import { StudyDatabase, Mistake } from "../types";

interface MistakeBookViewProps {
  db: StudyDatabase;
  onUpdateDb: (updated: StudyDatabase) => void;
  onAddXp: (xp: number) => void;
}

export default function MistakeBookView({ db, onUpdateDb, onAddXp }: MistakeBookViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [text, setText] = useState("");
  const [reason, setReason] = useState("");
  const [method, setMethod] = useState("");
  const [selectedSubj, setSelectedSubj] = useState(db.subjects[0]?.id || "");
  const [selectedChap, setSelectedChap] = useState("");

  const handleAddMistake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !reason.trim() || !selectedSubj) return;

    const newMistake: Mistake = {
      id: "mistake-" + Date.now(),
      questionImageOrText: text,
      wrongReason: reason,
      correctMethod: method,
      subjectId: selectedSubj,
      chapterId: selectedChap,
      solvedAgain: false,
      confidence: "Low",
      createdAt: new Date().toISOString().split("T")[0],
    };

    const updated = [newMistake, ...db.mistakeBook];
    onUpdateDb({
      ...db,
      mistakeBook: updated,
    });

    setText("");
    setReason("");
    setMethod("");
    setShowAddForm(false);
    onAddXp(40); // gain XP for logging mistake
  };

  const toggleSolvedAgain = (id: string) => {
    const updated = db.mistakeBook.map((m) => {
      if (m.id === id) {
        const nextState = !m.solvedAgain;
        if (nextState) {
          setTimeout(() => onAddXp(40), 100);
        }
        return {
          ...m,
          solvedAgain: nextState,
          confidence: nextState ? ("High" as const) : ("Low" as const),
          lastRevisedAt: new Date().toISOString().split("T")[0],
        };
      }
      return m;
    });

    onUpdateDb({
      ...db,
      mistakeBook: updated,
    });
  };

  const getSubjName = (id: string) => {
    return db.subjects.find((s) => s.id === id)?.name || "Physics";
  };

  const activeSubject = db.subjects.find((s) => s.id === selectedSubj);

  return (
    <div className="flex flex-col gap-6" id="mistake-book-module">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
            <BookMarked className="text-red-500" size={20} />
            Mistake Book (Wrong Questions Log)
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Store your wrong mock questions, catalog why you failed, and resolve them again to build perfect accuracy.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm"
        >
          <Plus size={14} /> Log Mistake
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddMistake} className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col gap-4 shadow-sm">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Log Incorrect Question</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Subject</label>
              <select
                required
                value={selectedSubj}
                onChange={(e) => {
                  setSelectedSubj(e.target.value);
                  setSelectedChap("");
                }}
                className="w-full text-xs rounded-lg p-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
              >
                <option value="">Select Subject</option>
                {db.subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Chapter (Optional)</label>
              <select
                value={selectedChap}
                onChange={(e) => setSelectedChap(e.target.value)}
                className="w-full text-xs rounded-lg p-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
              >
                <option value="">General</option>
                {activeSubject?.chapters.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Question Text or Description</label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Find range of projectile at theta = 45 degrees launched on inclined plane..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full text-xs p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Why did you get it wrong? (Mistake Reason)</label>
              <textarea
                required
                rows={2}
                placeholder="e.g. Careless calculation error; used cos instead of sin"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Correct Method / Core Concept to study</label>
              <textarea
                required
                rows={2}
                placeholder="e.g. Always draw vector resolution before setting equations of motion"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full text-xs p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-xs font-semibold text-zinc-500">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-sm">Save to Mistake Book</button>
          </div>
        </form>
      )}

      {/* Grid of logged mistakes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {db.mistakeBook.length === 0 ? (
          <div className="col-span-2 text-center p-8 text-zinc-400 italic">No wrong questions logged! Outstanding job on your accuracy.</div>
        ) : (
          db.mistakeBook.map((m) => (
            <div
              key={m.id}
              className={`p-4 rounded-xl border flex flex-col justify-between gap-4 transition-all ${
                m.solvedAgain
                  ? "bg-zinc-50/50 dark:bg-zinc-900/10 border-zinc-200 dark:border-zinc-900 opacity-75"
                  : "bg-white dark:bg-zinc-950 border-red-200 dark:border-red-950/45 shadow-sm"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-[9px] font-bold uppercase text-zinc-500">
                    {getSubjName(m.subjectId)}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${m.solvedAgain ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                    {m.solvedAgain ? "Solved Again" : "Needs Review"}
                  </span>
                </div>

                <div className="text-xs font-bold text-zinc-900 dark:text-white mt-3 font-mono">
                  {m.questionImageOrText}
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2.5 text-[11px] leading-relaxed">
                  <div className="p-2 rounded bg-red-500/5 text-zinc-700 dark:text-zinc-300">
                    <strong className="text-red-500 font-bold uppercase text-[9px] block">Wrong Reason:</strong>
                    {m.wrongReason}
                  </div>

                  <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300">
                    <strong className="text-zinc-500 font-bold uppercase text-[9px] block">Correct Method:</strong>
                    {m.correctMethod}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900 pt-3 mt-1">
                <span className="text-[10px] text-zinc-400">Logged {m.createdAt}</span>

                <button
                  onClick={() => toggleSolvedAgain(m.id)}
                  className={`flex items-center gap-1 py-1.5 px-3 rounded-lg text-[10px] font-bold transition-colors ${
                    m.solvedAgain
                      ? "bg-green-600 text-white"
                      : "bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200"
                  }`}
                >
                  {m.solvedAgain ? (
                    <>
                      <ThumbsUp size={12} /> Resolved (High Confidence)
                    </>
                  ) : (
                    <>
                      <RefreshCw size={12} /> Retry / Solve Again
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
