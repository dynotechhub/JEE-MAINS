import React, { useState } from "react";
import { Plus, BookOpen, Trash2, Edit2, Play, CheckCircle2, Bookmark, Flame, Settings2, Award, FileText, ChevronRight, ChevronDown, Check } from "lucide-react";
import { Subject, Chapter, Lecture, DPP, StudyDatabase } from "../types";
import MathNotesEditor from "./MathNotesEditor";

interface SubjectManagerProps {
  db: StudyDatabase;
  onUpdateDb: (updated: StudyDatabase) => void;
  onAddXp: (xp: number) => void;
}

export default function SubjectManager({ db, onUpdateDb, onAddXp }: SubjectManagerProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(db.subjects[0]?.id || "");
  const [activeSubTab, setActiveSubTab] = useState<"chapters" | "lectures" | "dpps" | "notes">("chapters");

  // Chapter state
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [chapName, setChapName] = useState("");
  const [chapPriority, setChapPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [chapDifficulty, setChapDifficulty] = useState<"Hard" | "Medium" | "Easy">("Medium");
  const [chapTeacher, setChapTeacher] = useState("");
  const [chapExpected, setChapExpected] = useState("10");

  // Lecture state
  const [showAddLecture, setShowAddLecture] = useState(false);
  const [lecName, setLecName] = useState("");
  const [lecTeacher, setLecTeacher] = useState("");
  const [lecPlatform, setLecPlatform] = useState("YouTube");
  const [lecDuration, setLecDuration] = useState("60");
  const [lecChapterId, setLecChapterId] = useState("");
  const [lecUrl, setLecUrl] = useState("");

  // DPP state
  const [showAddDpp, setShowAddDpp] = useState(false);
  const [dppName, setDppName] = useState("");
  const [dppChapterId, setDppChapterId] = useState("");
  const [dppQuestions, setDppQuestions] = useState("15");
  const [dppSolved, setDppSolved] = useState("12");
  const [dppWrong, setDppWrong] = useState("3");
  const [dppTime, setDppTime] = useState("45");

  // Subject state
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [subjName, setSubjName] = useState("");
  const [subjColor, setSubjColor] = useState("#3b82f6");

  const activeSubject = db.subjects.find((s) => s.id === selectedSubjectId) || db.subjects[0];

  const saveDb = (updated: StudyDatabase) => {
    onUpdateDb(updated);
  };

  // Add Subject
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjName.trim()) return;

    const newSubj: Subject = {
      id: "subj-" + Date.now(),
      name: subjName,
      color: subjColor,
      chapters: [],
      lectures: [],
      notes: [],
      dpps: [],
    };

    const updated = {
      ...db,
      subjects: [...db.subjects, newSubj],
    };

    saveDb(updated);
    setSelectedSubjectId(newSubj.id);
    setSubjName("");
    setShowAddSubject(false);
    onAddXp(50);
  };

  // Delete Subject
  const handleDeleteSubject = (id: string) => {
    if (!confirm("Are you sure you want to delete this entire subject and all its chapters/lectures?")) return;
    const updatedSubjects = db.subjects.filter((s) => s.id !== id);
    const updated = { ...db, subjects: updatedSubjects };
    saveDb(updated);
    if (selectedSubjectId === id) {
      setSelectedSubjectId(updatedSubjects[0]?.id || "");
    }
  };

  // Add Chapter
  const handleAddChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapName.trim() || !activeSubject) return;

    const newChap: Chapter = {
      id: "chap-" + Date.now(),
      name: chapName,
      priority: chapPriority,
      difficulty: chapDifficulty,
      teacher: chapTeacher || "Self Study",
      status: "To Do",
      progress: 0,
      expectedTime: parseInt(chapExpected) || 10,
      actualTime: 0,
      revisionCount: 0,
      mistakeCount: 0,
      confidence: "Low",
    };

    const updatedSubjects = db.subjects.map((s) => {
      if (s.id === activeSubject.id) {
        return { ...s, chapters: [...s.chapters, newChap] };
      }
      return s;
    });

    saveDb({ ...db, subjects: updatedSubjects });
    setChapName("");
    setChapTeacher("");
    setShowAddChapter(false);
    onAddXp(40);
  };

  // Update Chapter Progress/Status
  const updateChapterProgress = (chapId: string, progress: number) => {
    if (!activeSubject) return;
    const status = (progress === 100 ? "Completed" : progress > 0 ? "In Progress" : "To Do") as "Completed" | "In Progress" | "To Do";
    const confidence = (progress === 100 ? "High" : progress > 50 ? "Medium" : "Low") as "High" | "Medium" | "Low";

    const updatedSubjects = db.subjects.map((s) => {
      if (s.id === activeSubject.id) {
        return {
          ...s,
          chapters: s.chapters.map((c) => {
            if (c.id === chapId) {
              const prevCompleted = c.status === "Completed";
              if (status === "Completed" && !prevCompleted) {
                setTimeout(() => onAddXp(200), 100); // 200 XP for chapter complete
              }
              return { ...c, progress, status, confidence, actualTime: progress === 100 ? c.expectedTime : c.actualTime };
            }
            return c;
          }),
        };
      }
      return s;
    });

    saveDb({ ...db, subjects: updatedSubjects });
  };

  // Add Lecture
  const handleAddLecture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lecName.trim() || !activeSubject || !lecChapterId) return;

    const newLec: Lecture = {
      id: "lec-" + Date.now(),
      name: lecName,
      teacher: lecTeacher || "Self Study",
      platform: lecPlatform,
      duration: parseInt(lecDuration) || 60,
      watchedPercent: 0,
      playbackSpeed: 1.0,
      lectureLink: lecUrl,
      status: "To Do",
      chapterId: lecChapterId,
      completedDate: "",
      rating: 0,
      bookmarked: false,
    };

    const updatedSubjects = db.subjects.map((s) => {
      if (s.id === activeSubject.id) {
        return { ...s, lectures: [...s.lectures, newLec] };
      }
      return s;
    });

    saveDb({ ...db, subjects: updatedSubjects });
    setLecName("");
    setLecTeacher("");
    setLecUrl("");
    setShowAddLecture(false);
    onAddXp(30);
  };

  // Update Lecture Progress
  const updateLectureWatched = (lecId: string, percent: number) => {
    if (!activeSubject) return;
    const status = (percent === 100 ? "Completed" : percent > 0 ? "In Progress" : "To Do") as "Completed" | "In Progress" | "To Do";

    const updatedSubjects = db.subjects.map((s) => {
      if (s.id === activeSubject.id) {
        return {
          ...s,
          lectures: s.lectures.map((l) => {
            if (l.id === lecId) {
              const prevCompleted = l.status === "Completed";
              if (percent === 100 && !prevCompleted) {
                setTimeout(() => onAddXp(50), 100); // 50 XP for watch
              }
              return {
                ...l,
                watchedPercent: percent,
                status,
                completedDate: percent === 100 ? new Date().toISOString().split("T")[0] : "",
              };
            }
            return l;
          }),
        };
      }
      return s;
    });

    saveDb({ ...db, subjects: updatedSubjects });
  };

  // Toggle Lecture Bookmark
  const toggleLectureBookmark = (lecId: string) => {
    if (!activeSubject) return;
    const updatedSubjects = db.subjects.map((s) => {
      if (s.id === activeSubject.id) {
        return {
          ...s,
          lectures: s.lectures.map((l) => (l.id === lecId ? { ...l, bookmarked: !l.bookmarked } : l)),
        };
      }
      return s;
    });
    saveDb({ ...db, subjects: updatedSubjects });
  };

  // Add DPP
  const handleAddDpp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dppName.trim() || !activeSubject || !dppChapterId) return;

    const qCount = parseInt(dppQuestions) || 15;
    const sCount = parseInt(dppSolved) || 12;
    const wCount = parseInt(dppWrong) || 3;
    const accuracy = Math.round((sCount / qCount) * 100) || 80;

    const newDpp: DPP = {
      id: "dpp-" + Date.now(),
      name: dppName,
      questionsCount: qCount,
      solvedCount: sCount,
      wrongCount: wCount,
      accuracy,
      timeSpent: parseInt(dppTime) || 45,
      status: "Completed",
      chapterId: dppChapterId,
      bookmarkedQuestions: [],
    };

    const updatedSubjects = db.subjects.map((s) => {
      if (s.id === activeSubject.id) {
        return { ...s, dpps: [...s.dpps, newDpp] };
      }
      return s;
    });

    saveDb({ ...db, subjects: updatedSubjects });

    // Also populate wrong questions into the Mistake Book if wrong questions exist
    if (wCount > 0) {
      const newMistakes = [...db.mistakeBook];
      for (let i = 0; i < wCount; i++) {
        newMistakes.push({
          id: "mistake-" + Date.now() + "-" + i,
          questionImageOrText: `From "${newDpp.name}" Question #${i + 1}`,
          wrongReason: "Need review on formula application or calculation errors.",
          correctMethod: "Double check values and solve again.",
          subjectId: activeSubject.id,
          chapterId: dppChapterId,
          solvedAgain: false,
          confidence: "Low",
          createdAt: new Date().toISOString().split("T")[0],
        });
      }
      saveDb({ ...db, subjects: updatedSubjects, mistakeBook: newMistakes });
    }

    setDppName("");
    setShowAddDpp(false);
    onAddXp(80); // Solved DPP reward
  };

  return (
    <div className="flex flex-col gap-6" id="subject-manager-module">
      {/* 1. Subject Pill Rail */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {db.subjects.map((subj) => (
            <button
              key={subj.id}
              onClick={() => {
                setSelectedSubjectId(subj.id);
                setActiveSubTab("chapters");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                (activeSubject?.id || db.subjects[0]?.id) === subj.id
                  ? "text-white shadow-sm"
                  : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
              style={{
                backgroundColor: (activeSubject?.id || db.subjects[0]?.id) === subj.id ? subj.color : "transparent",
                borderColor: (activeSubject?.id || db.subjects[0]?.id) === subj.id ? subj.color : undefined,
              }}
            >
              <BookOpen size={14} />
              {subj.name}
              <span className="px-1.5 py-0.5 rounded-full bg-black/25 text-[9px] font-bold">
                {subj.chapters.length}c
              </span>
            </button>
          ))}
          <button
            onClick={() => setShowAddSubject(true)}
            className="p-2 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-500 text-zinc-500 dark:text-zinc-400 text-xs font-semibold flex items-center gap-1"
          >
            <Plus size={14} /> Subject
          </button>
        </div>

        {activeSubject && (
          <button
            onClick={() => handleDeleteSubject(activeSubject.id)}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors"
            title="Delete active subject"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Show Add Subject Modal */}
      {showAddSubject && (
        <form onSubmit={handleAddSubject} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex gap-4 items-end shadow-sm">
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Subject Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Mathematics, Biology, Organic Chemistry"
              value={subjName}
              onChange={(e) => setSubjName(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Brand Color</label>
            <input
              type="color"
              value={subjColor}
              onChange={(e) => setSubjColor(e.target.value)}
              className="w-12 h-10 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 cursor-pointer"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowAddSubject(false)}
              className="px-4 py-2.5 text-xs font-semibold text-zinc-500 hover:bg-zinc-100 rounded-lg"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              Create
            </button>
          </div>
        </form>
      )}

      {/* 2. Active Subject View */}
      {activeSubject ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-4 text-xs font-semibold">
              <button
                onClick={() => setActiveSubTab("chapters")}
                className={`pb-2 border-b-2 transition-all ${activeSubTab === "chapters" ? "border-blue-600 text-blue-600" : "border-transparent text-zinc-500"}`}
              >
                Chapters ({activeSubject.chapters.length})
              </button>
              <button
                onClick={() => setActiveSubTab("lectures")}
                className={`pb-2 border-b-2 transition-all ${activeSubTab === "lectures" ? "border-blue-600 text-blue-600" : "border-transparent text-zinc-500"}`}
              >
                Lectures ({activeSubject.lectures.length})
              </button>
              <button
                onClick={() => setActiveSubTab("dpps")}
                className={`pb-2 border-b-2 transition-all ${activeSubTab === "dpps" ? "border-blue-600 text-blue-600" : "border-transparent text-zinc-500"}`}
              >
                DPP Practice ({activeSubject.dpps.length})
              </button>
              <button
                onClick={() => setActiveSubTab("notes")}
                className={`pb-2 border-b-2 transition-all ${activeSubTab === "notes" ? "border-blue-600 text-blue-600" : "border-transparent text-zinc-500"}`}
              >
                Math Notes ({activeSubject.notes?.length || 0})
              </button>
            </div>

            {activeSubTab !== "notes" && (
              <button
                onClick={() => {
                  if (activeSubTab === "chapters") setShowAddChapter(true);
                  else if (activeSubTab === "lectures") setShowAddLecture(true);
                  else setShowAddDpp(true);
                }}
                className="flex items-center gap-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
              >
                <Plus size={14} /> Add {activeSubTab === "chapters" ? "Chapter" : activeSubTab === "lectures" ? "Lecture" : "DPP Record"}
              </button>
            )}
          </div>

          {/* ADD forms for Chapter/Lecture/DPP */}
          {showAddChapter && (
            <form onSubmit={handleAddChapter} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col gap-3 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Chapter Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vector Algebra, Thermodynamics"
                    value={chapName}
                    onChange={(e) => setChapName(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Educator / Teacher</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. HC Verma"
                    value={chapTeacher}
                    onChange={(e) => setChapTeacher(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Priority</label>
                  <select
                    value={chapPriority}
                    onChange={(e: any) => setChapPriority(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Difficulty</label>
                  <select
                    value={chapDifficulty}
                    onChange={(e: any) => setChapDifficulty(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  >
                    <option value="Hard">Hard</option>
                    <option value="Medium">Medium</option>
                    <option value="Easy">Easy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Expected Study Time (Hours)</label>
                  <input
                    type="number"
                    value={chapExpected}
                    onChange={(e) => setChapExpected(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowAddChapter(false)} className="px-3 py-1.5 text-xs text-zinc-500">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold">Add Chapter</button>
              </div>
            </form>
          )}

          {showAddLecture && (
            <form onSubmit={handleAddLecture} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col gap-3 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Lecture Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Watched projectile formula derivations"
                    value={lecName}
                    onChange={(e) => setLecName(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Associated Chapter</label>
                  <select
                    required
                    value={lecChapterId}
                    onChange={(e) => setLecChapterId(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  >
                    <option value="">Select Chapter</option>
                    {activeSubject.chapters.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Teacher</label>
                  <input
                    type="text"
                    value={lecTeacher}
                    onChange={(e) => setLecTeacher(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Platform</label>
                  <select
                    value={lecPlatform}
                    onChange={(e) => setLecPlatform(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  >
                    <option value="YouTube">YouTube</option>
                    <option value="Physics Wallah">Physics Wallah</option>
                    <option value="Unacademy">Unacademy</option>
                    <option value="Coursera">Coursera</option>
                    <option value="Local Video">Local Video Player</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={lecDuration}
                    onChange={(e) => setLecDuration(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Video Link (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={lecUrl}
                    onChange={(e) => setLecUrl(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowAddLecture(false)} className="px-3 py-1.5 text-xs text-zinc-500">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold">Add Lecture</button>
              </div>
            </form>
          )}

          {showAddDpp && (
            <form onSubmit={handleAddDpp} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col gap-3 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">DPP Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DPP 01: Projectiles at launch angles"
                    value={dppName}
                    onChange={(e) => setDppName(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Associated Chapter</label>
                  <select
                    required
                    value={dppChapterId}
                    onChange={(e) => setDppChapterId(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  >
                    <option value="">Select Chapter</option>
                    {activeSubject.chapters.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Total Questions</label>
                  <input
                    type="number"
                    value={dppQuestions}
                    onChange={(e) => setDppQuestions(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Solved Correctly</label>
                  <input
                    type="number"
                    value={dppSolved}
                    onChange={(e) => setDppSolved(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Wrong Questions (Added to Mistake Book)</label>
                  <input
                    type="number"
                    value={dppWrong}
                    onChange={(e) => setDppWrong(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Time Spent (Minutes)</label>
                  <input
                    type="number"
                    value={dppTime}
                    onChange={(e) => setDppTime(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowAddDpp(false)} className="px-3 py-1.5 text-xs text-zinc-500">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold">Add DPP Record</button>
              </div>
            </form>
          )}

          {/* Chapters Table */}
          {activeSubTab === "chapters" && (
            <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500 border-b border-zinc-150 dark:border-zinc-850">
                    <th className="p-3.5 font-bold">Chapter</th>
                    <th className="p-3.5 font-bold">Priority</th>
                    <th className="p-3.5 font-bold">Difficulty</th>
                    <th className="p-3.5 font-bold">Teacher</th>
                    <th className="p-3.5 font-bold">Confidence</th>
                    <th className="p-3.5 font-bold">Status</th>
                    <th className="p-3.5 font-bold">Log Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                  {activeSubject.chapters.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center p-8 text-zinc-400 italic">No chapters in this subject. Let's add your first chapter!</td>
                    </tr>
                  ) : (
                    activeSubject.chapters.map((c) => (
                      <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30">
                        <td className="p-3.5 font-semibold text-zinc-900 dark:text-white">{c.name}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.priority === "High" ? "bg-red-500/10 text-red-500" : c.priority === "Medium" ? "bg-amber-500/10 text-amber-500" : "bg-zinc-500/10 text-zinc-400"}`}>
                            {c.priority}
                          </span>
                        </td>
                        <td className="p-3.5 text-zinc-500">{c.difficulty}</td>
                        <td className="p-3.5 text-zinc-500">{c.teacher}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.confidence === "High" ? "bg-green-500/10 text-green-500" : c.confidence === "Medium" ? "bg-blue-500/10 text-blue-500" : "bg-red-500/10 text-red-500"}`}>
                            {c.confidence}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.status === "Completed" ? "bg-green-500/15 text-green-600 dark:text-green-400" : c.status === "In Progress" ? "bg-blue-500/15 text-blue-600 dark:text-blue-400" : "bg-zinc-500/10 text-zinc-500"}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="10"
                              value={c.progress}
                              onChange={(e) => updateChapterProgress(c.id, parseInt(e.target.value))}
                              className="w-20 accent-blue-600"
                            />
                            <span className="text-[10px] font-bold text-zinc-500 w-8">{c.progress}%</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Lectures List */}
          {activeSubTab === "lectures" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeSubject.lectures.length === 0 ? (
                <div className="col-span-2 text-center p-8 text-zinc-400 italic">No lectures logged for this subject yet.</div>
              ) : (
                activeSubject.lectures.map((l) => (
                  <div key={l.id} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-zinc-900 dark:text-white leading-tight">
                          {l.name}
                        </div>
                        <button
                          onClick={() => toggleLectureBookmark(l.id)}
                          className={`p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors ${l.bookmarked ? "text-amber-500" : "text-zinc-400"}`}
                        >
                          <Bookmark size={15} fill={l.bookmarked ? "currentColor" : "none"} />
                        </button>
                      </div>

                      <div className="text-[11px] text-zinc-500 mt-1 flex flex-wrap gap-2 items-center">
                        <span>{l.teacher}</span>
                        <span>•</span>
                        <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 font-medium">
                          {l.platform}
                        </span>
                        <span>•</span>
                        <span>{l.duration} mins</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between gap-3">
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="10"
                          value={l.watchedPercent}
                          onChange={(e) => updateLectureWatched(l.id, parseInt(e.target.value))}
                          className="w-full accent-blue-600"
                        />
                        <span className="text-[10px] font-bold text-zinc-500">{l.watchedPercent}%</span>
                      </div>

                      {l.watchedPercent === 100 && (
                        <span className="text-[10px] font-bold text-green-600 dark:text-green-400 flex items-center gap-1 shrink-0">
                          <CheckCircle2 size={12} /> Watched
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* DPP Results */}
          {activeSubTab === "dpps" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeSubject.dpps.length === 0 ? (
                <div className="col-span-2 text-center p-8 text-zinc-400 italic">No DPP records added yet. Solve Daily Practice Problems to test concepts.</div>
              ) : (
                activeSubject.dpps.map((d) => (
                  <div key={d.id} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col justify-between hover:border-zinc-300 transition-colors">
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-zinc-900 dark:text-white">
                          {d.name}
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${d.accuracy >= 80 ? "bg-green-500/10 text-green-500" : d.accuracy >= 50 ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"}`}>
                          {d.accuracy}% Acc
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                        <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900">
                          <div className="text-[10px] text-zinc-400 uppercase font-bold">Solved</div>
                          <div className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200">{d.solvedCount}/{d.questionsCount}</div>
                        </div>
                        <div className="p-2 rounded-lg bg-red-500/5">
                          <div className="text-[10px] text-red-400 uppercase font-bold">Wrong</div>
                          <div className="text-sm font-extrabold text-red-500">{d.wrongCount}</div>
                        </div>
                        <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900">
                          <div className="text-[10px] text-zinc-400 uppercase font-bold">Speed</div>
                          <div className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200">{d.timeSpent}m</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Math Notes & Formulas Tab */}
          {activeSubTab === "notes" && (
            <MathNotesEditor 
              db={db} 
              activeSubject={activeSubject} 
              onUpdateDb={saveDb} 
              onAddXp={onAddXp} 
            />
          )}
        </div>
      ) : (
        <div className="text-center p-12 text-zinc-500 italic">Create your first subject in the Study OS to get started.</div>
      )}
    </div>
  );
}
