import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Calendar,
  Layers,
  Award,
  Hourglass,
  Settings,
  Flame,
  Brain,
  Sliders,
  Sparkles,
  Search,
  BookMarked,
  FileText,
  Clock,
  LogOut,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  Upload,
  Download,
  Activity,
  PenTool,
  CheckCircle,
  HelpCircle,
  Sun,
  Moon,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { StudyDatabase, PlannerTask, Flashcard, Subject, Note } from "./types";
import { analyzeBacklog } from "./utils/studyUtils";

// Import custom sub-modules
import SubjectManager from "./components/SubjectManager";
import PlannerCalendar from "./components/PlannerCalendar";
import FocusTimerComponent from "./components/FocusTimerComponent";
import AnalyticsView from "./components/AnalyticsView";
import FlashcardReviewer from "./components/FlashcardReviewer";
import AiMentorChat from "./components/AiMentorChat";
import MistakeBookView from "./components/MistakeBookView";
import ResourcesPdfView from "./components/ResourcesPdfView";
import MindMapCanvas from "./components/MindMapCanvas";

export default function App() {
  const [db, setDb] = useState<StudyDatabase | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");

  // Load database from full-stack server
  useEffect(() => {
    fetch("/api/db")
      .then((res) => res.json())
      .then((data) => {
        setDb(data);
        if (data.settings?.theme) {
          setTheme(data.settings.theme);
        }
      })
      .catch((err) => {
        console.error("Error loading full-stack database. Using client fallback.", err);
      });
  }, []);

  // Save database updates to server
  const handleUpdateDb = (updated: StudyDatabase) => {
    setDb(updated);
    fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    }).catch((err) => console.error("Failed to write state update to server", err));
  };

  // Add Study XP points
  const handleAddXp = (xpGained: number) => {
    if (!db) return;
    const currentXp = db.streak.xp + xpGained;
    const xpPerLevel = 500;
    const newLevel = Math.floor(currentXp / xpPerLevel) + 1;

    const updated = {
      ...db,
      streak: {
        ...db.streak,
        xp: currentXp,
        level: newLevel,
        lastActiveDate: new Date().toISOString().split("T")[0],
      },
    };
    handleUpdateDb(updated);
  };

  // Add a newly created flashcard
  const handleAddFlashcard = (fc: Omit<Flashcard, "id">) => {
    if (!db) return;
    const newFc: Flashcard = {
      ...fc,
      id: "fc-" + Date.now(),
    };
    const updated = {
      ...db,
      flashcards: [...db.flashcards, newFc],
    };
    handleUpdateDb(updated);
  };

  // Process leitner flashcard review scores
  const handleReviewCard = (cardId: string, gotRight: boolean) => {
    if (!db) return;
    const today = new Date();
    const updatedFlashcards = db.flashcards.map((fc) => {
      if (fc.id === cardId) {
        // Leitner system promotion logic
        const nextBox = gotRight ? Math.min(5, fc.box + 1) : 1;
        // Set scheduled interval based on the promoted box
        const intervals = [1, 3, 7, 15, 30];
        const daysToAdd = intervals[nextBox - 1];

        const nextDate = new Date();
        nextDate.setDate(today.getDate() + daysToAdd);
        const nextReviewDate = nextDate.toISOString().split("T")[0];

        return { ...fc, box: nextBox, nextReviewDate };
      }
      return fc;
    });

    handleUpdateDb({
      ...db,
      flashcards: updatedFlashcards,
    });
    handleAddXp(gotRight ? 20 : 5);
  };

  // Pomodoro Focus session logging complete
  const handleFocusComplete = (minutesLogged: number) => {
    if (!db) return;
    const todayStr = new Date().toISOString().split("T")[0];

    const updatedLogs = [...db.focusLogs];
    const matchIndex = updatedLogs.findIndex((l) => l.date === todayStr);
    if (matchIndex >= 0) {
      updatedLogs[matchIndex].durationMinutes += minutesLogged;
    } else {
      updatedLogs.push({ date: todayStr, durationMinutes: minutesLogged });
    }

    const updated = {
      ...db,
      focusLogs: updatedLogs,
    };
    handleUpdateDb(updated);
    handleAddXp(100); // 100 XP focus block reward
  };

  // Quick settings config
  const handleSaveSettings = (key: string, value: any) => {
    if (!db) return;
    const updated = {
      ...db,
      settings: {
        ...db.settings,
        [key]: value,
      },
    };
    if (key === "theme") {
      setTheme(value);
    }
    handleUpdateDb(updated);
  };

  // Reset/Nuke local study database
  const handleNukeDb = () => {
    if (!confirm("⚠️ WARNING: This will completely delete all your study subjects, focus times, notes, and metrics. Proceed?")) return;
    localStorage.removeItem("dyno_study_db");
    window.location.reload();
  };

  // Seeding/Resetting database with Class 11 PW Arjuna JEE planner
  const handleResetToArjuna = () => {
    if (!confirm("🎯 Re-seeding will populate your Study OS with the complete PW Arjuna JEE Class 11th Planners for Physics, Chemistry, and Maths. Any custom progress will be reset. Proceed?")) return;
    fetch("/api/reset-arjuna", {
      method: "POST"
    })
      .then((res) => res.json())
      .then((data) => {
        setDb(data);
        alert("🎉 Successfully loaded the complete PW Arjuna JEE Class 11th Planners!");
      })
      .catch((err) => {
        console.error("Failed to reset to Arjuna", err);
        alert("Failed to reset database");
      });
  };

  if (!db) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white font-sans">
        <RefreshCw size={36} className="animate-spin text-blue-500 mb-4" />
        <div className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Dyno Study OS</div>
        <p className="text-xs text-zinc-400 mt-1">Booting personal learning environment...</p>
      </div>
    );
  }

  // Calculate backlog stats from core modules
  const backlog = analyzeBacklog(db);

  // Filter study items based on global search bar query
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalSearchQuery(e.target.value);
  };

  // Sidebar link config
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <Sliders size={15} /> },
    { id: "subjects", label: "Subjects & Chapters", icon: <BookOpen size={15} /> },
    { id: "planner", label: "Time Planner", icon: <Calendar size={15} /> },
    { id: "flashcards", label: "Flashcards", icon: <Layers size={15} /> },
    { id: "timer", label: "Focus Room", icon: <Hourglass size={15} /> },
    { id: "analytics", label: "OS Analytics", icon: <TrendingUp size={15} /> },
    { id: "mistakes", label: "Mistake Book", icon: <BookMarked size={15} /> },
    { id: "pdf", label: "Materials Library", icon: <FileText size={15} /> },
    { id: "mentor", label: "AI Study Coach", icon: <Brain size={15} /> },
    { id: "settings", label: "Settings", icon: <Settings size={15} /> },
  ];

  // Calculated target dates count
  const today = new Date();
  const targetDateObj = new Date(db.profile.examDate);
  const diffTime = targetDateObj.getTime() - today.getTime();
  const examCountdownDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Calculate general progress percentage
  const totalChapters = db.subjects.reduce((sum, s) => sum + s.chapters.length, 0);
  const completedChapters = db.subjects.reduce(
    (sum, s) => sum + s.chapters.filter((c) => c.status === "Completed").length,
    0
  );
  const syllabusCompletionPercent = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  // Toggle Dark/Light Theme classes dynamically
  const appBgStyle = theme === "dark" ? "bg-[#0A0B0D] text-slate-200" : "bg-[#F4F5F7] text-zinc-850";

  return (
    <div className={`min-h-screen flex transition-colors duration-250 ${appBgStyle} font-sans`} id="dyno-study-root">
      {/* 1. Sidebar Panel */}
      <aside className="w-60 border-r shrink-0 hidden md:flex flex-col justify-between p-5 border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0F1115]">
        <div className="flex flex-col gap-6">
          {/* Logo / Brand */}
          <div className="p-2 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg shadow-blue-500/20" />
            <div>
              <h1 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white uppercase flex items-center gap-1 leading-none">
                DYNO <span className="text-blue-500 font-extrabold">OS</span>
              </h1>
              <span className="text-[9px] uppercase tracking-wider text-blue-500 font-extrabold block mt-0.5">Learning OS</span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[12px] text-xs font-bold transition-all border ${
                  activeTab === item.id
                    ? "bg-zinc-100 dark:bg-white/5 text-blue-600 dark:text-blue-400 border-zinc-200 dark:border-white/10 shadow-sm"
                    : "text-zinc-500 dark:text-slate-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.id === "mentor" && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* User Footer Account status */}
        <div className="pt-4 border-t border-zinc-200 dark:border-white/10">
          <div className="flex items-center gap-3 p-2 bg-zinc-50 dark:bg-white/5 rounded-[20px] border border-zinc-200/50 dark:border-white/5">
            <img
              src={db.profile.avatar}
              alt={db.profile.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-[#0F1115] shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-zinc-900 dark:text-white leading-tight">{db.profile.name}</p>
              <p className="text-[9px] text-zinc-500 dark:text-slate-500 uppercase font-bold tracking-tighter mt-0.5">{db.profile.exam} Aspirant</p>
            </div>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-white/10 hover:bg-zinc-200/50 dark:hover:bg-white/5 transition-colors"
            >
              {theme === "dark" ? <Sun size={12} className="text-amber-500" /> : <Moon size={12} className="text-blue-500" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Navbar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-200 dark:border-white/10 absolute top-0 left-0 right-0 h-16 bg-white dark:bg-[#0F1115] z-20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md shadow-blue-500/20" />
          <span className="text-xs font-black uppercase tracking-tight text-zinc-900 dark:text-white">Dyno OS</span>
        </div>

        <div className="flex gap-1.5 overflow-x-auto max-w-[200px] py-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg shrink-0 ${
                activeTab === item.id 
                  ? "bg-zinc-200 dark:bg-white/10 text-blue-600 dark:text-blue-400 border border-zinc-300 dark:border-white/10" 
                  : "text-zinc-500 bg-zinc-100 dark:bg-white/5"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Work Panel Wrapper */}
      <main className="flex-1 flex flex-col md:pt-0 pt-16 h-screen overflow-y-auto">
        {/* Top Header Rail */}
        <header className="p-4 md:p-6 border-b border-zinc-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 bg-white/40 dark:bg-[#0F1115]/40 backdrop-blur-md">
          {/* Streak & XP status summary */}
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-white/5 p-2 px-3 rounded-[16px] border border-zinc-200 dark:border-white/10">
              <Flame className="text-amber-500 animate-bounce" size={16} />
              <div className="text-left">
                <span className="text-[9px] uppercase font-bold text-zinc-500 block">Current Streak</span>
                <span className="text-xs font-black text-zinc-900 dark:text-white leading-tight">
                  {db.streak.current} Days Consistent
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-white/5 p-2 px-3 rounded-[16px] border border-zinc-200 dark:border-white/10">
              <Award className="text-purple-500" size={16} />
              <div className="text-left">
                <span className="text-[9px] uppercase font-bold text-zinc-500 block">Level {db.streak.level}</span>
                <span className="text-xs font-black text-zinc-900 dark:text-white leading-tight">
                  {db.streak.xp} Total XP
                </span>
              </div>
            </div>
          </div>

          {/* Time & Quick Goal countdown */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end text-xs">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-[10px] text-zinc-500 font-semibold font-mono">UTC System Time</span>
              <span className="font-extrabold text-zinc-900 dark:text-white">2026-07-15 11:45</span>
            </div>

            <div className="px-3.5 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold rounded-[16px] flex items-center gap-2 shrink-0">
              <Clock size={14} />
              <span>{examCountdownDays} Days to {db.profile.exam}</span>
            </div>
          </div>
        </header>

        {/* 3. Primary Workspace Area */}
        <div className="p-4 md:p-6 flex-1 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.18 }}
              className="h-full"
            >
              {/* === TAB 1: DASHBOARD === */}
              {activeTab === "dashboard" && (
                <div className="flex flex-col gap-6">
                  {/* Grid 1: Countdown & Backlog Killer Alerts */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Syllabus Progress */}
                    <div className="lg:col-span-2 p-5 rounded-[20px] border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0F1115]/50 backdrop-blur-md flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xs font-bold text-zinc-400 dark:text-slate-400 uppercase tracking-wider">Syllabus Completion</h3>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mt-1">Syllabus Mastered</h2>
                          </div>
                          <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-display">{syllabusCompletionPercent}%</span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-slate-400 mt-2">
                          Successfully completed {completedChapters} out of {totalChapters} core syllabus chapters.
                        </p>
                      </div>

                      <div className="mt-6">
                        <div className="w-full bg-zinc-100 dark:bg-white/10 h-2.5 rounded-full overflow-hidden">
                          <div
                             className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-500 rounded-full"
                            style={{ width: `${syllabusCompletionPercent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase mt-2">
                          <span>0% Base</span>
                          <span>Goal: {db.profile.targetScore}</span>
                        </div>
                      </div>
                    </div>

                    {/* Backlog Killer Panel */}
                    <div className="p-5 rounded-[20px] border border-red-200 dark:border-white/10 bg-white dark:bg-[#0F1115]/50 backdrop-blur-md flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-red-500 font-bold text-xs uppercase tracking-wider">
                          <Activity size={14} className="animate-pulse" />
                          <span>Backlog Killer Analyzer</span>
                        </div>
                        <div className="text-2xl font-black text-zinc-900 dark:text-white mt-2">
                          {backlog.totalEstimatedHours} Study Hrs Remaining
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-slate-400 mt-1.5">
                          Calculated from {backlog.totalIncompleteLectures} pending lectures and {backlog.totalIncompleteChapters} chapters.
                        </p>
                      </div>

                      <div className="mt-4 p-3 bg-red-500/5 dark:bg-white/5 rounded-[16px] border border-red-500/10 dark:border-white/5 flex justify-between text-center">
                        <div>
                          <div className="text-[9px] text-zinc-500 font-bold uppercase">Daily Hours Required</div>
                          <div className="text-sm font-extrabold text-red-500 mt-0.5">{backlog.dailyHoursNeeded}h / Day</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-zinc-500 font-bold uppercase">Estimated Completion</div>
                          <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-1">{backlog.completionDate}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grid 2: Planner Today + Quick Drawing Pad */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Today's study planner summary */}
                    <div className="p-5 rounded-[20px] border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0F1115]/50 backdrop-blur-md">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Today's Target Blocks</h3>
                        <button onClick={() => setActiveTab("planner")} className="text-xs font-bold text-blue-500 hover:underline">
                          View Planner
                        </button>
                      </div>

                      <div className="flex flex-col gap-2.5">
                        {db.planner.tasks.filter((t) => t.date === new Date().toISOString().split("T")[0]).length === 0 ? (
                          <div className="text-center p-6 text-zinc-450 italic text-xs">
                            No study tasks scheduled for today. Press "View Planner" to add tasks.
                          </div>
                        ) : (
                          db.planner.tasks
                            .filter((t) => t.date === new Date().toISOString().split("T")[0])
                            .map((task) => (
                              <div
                                key={task.id}
                                className={`flex items-center justify-between p-3 rounded-[16px] border text-xs ${
                                  task.completed
                                    ? "bg-zinc-50/50 dark:bg-white/5 border-zinc-150 dark:border-white/5 opacity-60"
                                    : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-white/10"
                                }`}
                              >
                                <span className={task.completed ? "line-through text-zinc-500" : "font-semibold text-zinc-800 dark:text-zinc-200"}>
                                  {task.title}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-semibold">{task.startTime} - {task.endTime}</span>
                              </div>
                            ))
                        )}
                      </div>
                    </div>

                    {/* Quick Scratchpad / Handwritten notes pad */}
                    <div className="flex flex-col gap-3">
                      <div className="p-5 rounded-[20px] border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0F1115]/50 backdrop-blur-md shadow-sm">
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-1.5">
                          <PenTool size={15} className="text-blue-500" />
                          Handwritten Drawing & Mindmap Board
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-slate-400 mb-3">
                          Quickly sketch mechanism formulas, algebraic derivations, or memory linkages directly below.
                        </p>
                        <MindMapCanvas theme={theme} onSave={(base64) => {
                          // Autosave mindmap or scribble locally if needed
                        }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* === TAB 2: SUBJECTS === */}
              {activeTab === "subjects" && (
                <SubjectManager db={db} onUpdateDb={handleUpdateDb} onAddXp={handleAddXp} />
              )}

              {/* === TAB 3: PLANNER === */}
              {activeTab === "planner" && (
                <PlannerCalendar db={db} onUpdateDb={handleUpdateDb} onAddXp={handleAddXp} />
              )}

              {/* === TAB 4: FLASHCARDS === */}
              {activeTab === "flashcards" && (
                <FlashcardReviewer
                  flashcards={db.flashcards}
                  subjects={db.subjects}
                  onAddFlashcard={handleAddFlashcard}
                  onReviewCard={handleReviewCard}
                />
              )}

              {/* === TAB 5: FOCUS TIMER === */}
              {activeTab === "timer" && (
                <FocusTimerComponent
                  onSessionComplete={handleFocusComplete}
                  streakXp={{ xp: db.streak.xp, level: db.streak.level, current: db.streak.current }}
                  theme={theme}
                />
              )}

              {/* === TAB 6: ANALYTICS === */}
              {activeTab === "analytics" && (
                <AnalyticsView db={db} />
              )}

              {/* === TAB 7: MISTAKE BOOK === */}
              {activeTab === "mistakes" && (
                <MistakeBookView db={db} onUpdateDb={handleUpdateDb} onAddXp={handleAddXp} />
              )}

              {/* === TAB 8: MATERIALS LIBRARY === */}
              {activeTab === "pdf" && (
                <ResourcesPdfView db={db} onUpdateDb={handleUpdateDb} onAddXp={handleAddXp} />
              )}

              {/* === TAB 9: AI MENTOR === */}
              {activeTab === "mentor" && (
                <AiMentorChat db={db} onAddXp={handleAddXp} />
              )}

              {/* === TAB 10: SETTINGS === */}
              {activeTab === "settings" && (
                <div className="max-w-xl mx-auto p-6 rounded-[20px] border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0F1115]/50 backdrop-blur-md shadow-sm flex flex-col gap-6" id="settings-module">
                  <div>
                    <h2 className="text-base font-bold text-zinc-950 dark:text-white">Dyno Study Space Settings</h2>
                    <p className="text-xs text-zinc-500 dark:text-slate-400">Configure your target targets, goals, backup systems, and reset study database.</p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Aspirant Name</label>
                      <input
                        type="text"
                        value={db.profile.name}
                        onChange={(e) => handleUpdateDb({ ...db, profile: { ...db.profile, name: e.target.value } })}
                        className="w-full text-xs p-2.5 rounded-[12px] border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Exam Target</label>
                        <select
                          value={db.profile.exam}
                          onChange={(e) => handleUpdateDb({ ...db, profile: { ...db.profile, exam: e.target.value } })}
                          className="w-full text-xs p-2.5 rounded-[12px] border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-white"
                        >
                          <option value="JEE">JEE Mains/Advanced</option>
                          <option value="NEET">NEET Aspirant</option>
                          <option value="UPSC">UPSC Civil Services</option>
                          <option value="CAT">CAT / MBA Exams</option>
                          <option value="CBSE">CBSE Board Exam</option>
                          <option value="ICSE">ICSE Board Exam</option>
                          <option value="Self Learner">Self Learning / General</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Exam Target Date</label>
                        <input
                          type="date"
                          value={db.profile.examDate}
                          onChange={(e) => handleUpdateDb({ ...db, profile: { ...db.profile, examDate: e.target.value } })}
                          className="w-full text-xs p-2.5 rounded-[12px] border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Target score descriptor</label>
                      <input
                        type="text"
                        value={db.profile.targetScore}
                        onChange={(e) => handleUpdateDb({ ...db, profile: { ...db.profile, targetScore: e.target.value } })}
                        placeholder="e.g. 99+ Percentile"
                        className="w-full text-xs p-2.5 rounded-[12px] border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-white"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-[16px] border border-zinc-200 dark:border-white/10 mt-2">
                      <div>
                        <div className="text-xs font-bold text-zinc-900 dark:text-white">Active System Theme</div>
                        <div className="text-[10px] text-zinc-500 dark:text-slate-400 mt-0.5">Toggle interface backdrop shades.</div>
                      </div>

                      <div className="flex bg-zinc-100 dark:bg-zinc-950 rounded-lg p-1 text-xs font-semibold border border-transparent dark:border-white/5">
                        <button
                          onClick={() => handleSaveSettings("theme", "light")}
                          className={`px-3 py-1.5 rounded-md transition-colors ${theme === "light" ? "bg-blue-600 text-white shadow-sm" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"}`}
                        >
                          Light Mode
                        </button>
                        <button
                          onClick={() => handleSaveSettings("theme", "dark")}
                          className={`px-3 py-1.5 rounded-md transition-colors ${theme === "dark" ? "bg-blue-600 text-white shadow-sm" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"}`}
                        >
                          Dark Mode
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-zinc-200 dark:border-white/10 pt-5 flex flex-col gap-3">
                    <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wide">Study OS Presets</h4>
                    <button
                      onClick={handleResetToArjuna}
                      className="w-full py-2.5 px-4 rounded-[12px] border border-blue-500/20 hover:bg-blue-600 hover:text-white text-blue-500 dark:text-blue-400 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RotateCcw size={13} className="animate-spin-once" />
                      Re-seed PW Arjuna JEE Class 11th Planner
                    </button>

                    <h4 className="text-xs font-bold text-red-500 uppercase tracking-wide mt-2">Danger Zone</h4>
                    <button
                      onClick={handleNukeDb}
                      className="w-full py-2.5 px-4 rounded-[12px] border border-red-500/20 hover:bg-red-500 hover:text-white text-red-500 text-xs font-bold transition-all cursor-pointer"
                    >
                      Nuke study database & resets everything
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
