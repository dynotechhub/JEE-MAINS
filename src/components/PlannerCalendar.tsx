import React, { useState } from "react";
import { Calendar as CalendarIcon, Clock, Plus, Check, Trash2, Sliders, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { StudyDatabase, PlannerTask, Subject } from "../types";

interface PlannerCalendarProps {
  db: StudyDatabase;
  onUpdateDb: (updated: StudyDatabase) => void;
  onAddXp: (xp: number) => void;
}

export default function PlannerCalendar({ db, onUpdateDb, onAddXp }: PlannerCalendarProps) {
  const [viewMode, setViewMode] = useState<"planner" | "calendar">("planner");
  const [calendarView, setCalendarView] = useState<"month" | "week" | "day">("month");

  // New task form state
  const [showAddTask, setShowAddTask] = useState(false);
  const [title, setTitle] = useState("");
  const [subjId, setSubjId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [taskType, setTaskType] = useState<"Lecture" | "Note" | "DPP" | "Revision" | "Test" | "Custom">("Lecture");

  // Filter tasks based on selected subject or show all
  const [filterSubjId, setFilterSubjId] = useState("all");

  const saveTasks = (tasks: PlannerTask[]) => {
    onUpdateDb({
      ...db,
      planner: { ...db.planner, tasks },
    });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: PlannerTask = {
      id: "plan-" + Date.now(),
      title,
      subjectId: subjId,
      chapterId: "",
      date,
      startTime,
      endTime,
      priority,
      completed: false,
      type: taskType,
    };

    const updated = [...db.planner.tasks, newTask];
    saveTasks(updated);
    setTitle("");
    setShowAddTask(false);
    onAddXp(20);
  };

  const toggleTaskCompleted = (id: string) => {
    const updated = db.planner.tasks.map((t) => {
      if (t.id === id) {
        const nextState = !t.completed;
        if (nextState) {
          setTimeout(() => {
            onAddXp(40); // study task complete rewards
            // Add a focus log entry if it is checked off
            const durationMins = 45; // default estimation
            const todayStr = new Date().toISOString().split("T")[0];
            const updatedLogs = [...db.focusLogs];
            const matchIndex = updatedLogs.findIndex((l) => l.date === todayStr);
            if (matchIndex >= 0) {
              updatedLogs[matchIndex].durationMinutes += durationMins;
            } else {
              updatedLogs.push({ date: todayStr, durationMinutes: durationMins });
            }
            onUpdateDb({
              ...db,
              focusLogs: updatedLogs,
            });
          }, 100);
        }
        return { ...t, completed: nextState };
      }
      return t;
    });
    saveTasks(updated);
  };

  const handleDeleteTask = (id: string) => {
    const updated = db.planner.tasks.filter((t) => t.id !== id);
    saveTasks(updated);
  };

  // Smart Auto-scheduling reorganizer: moves uncompleted previous days' tasks to today!
  const runAutoScheduler = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    let movedCount = 0;
    const updated = db.planner.tasks.map((t) => {
      if (!t.completed && t.date < todayStr) {
        movedCount++;
        return { ...t, date: todayStr, startTime: "11:00", endTime: "12:00" };
      }
      return t;
    });

    if (movedCount > 0) {
      saveTasks(updated);
      alert(`⚡ Smart Reorganizer: Redistributed ${movedCount} uncompleted overdue tasks to today's schedule!`);
    } else {
      alert("All caught up! No overdue tasks need rescheduling.");
    }
  };

  const filteredTasks = db.planner.tasks.filter((t) => {
    if (filterSubjId === "all") return true;
    return t.subjectId === filterSubjId;
  });

  const getSubjName = (id: string) => {
    return db.subjects.find((s) => s.id === id)?.name || "General";
  };

  const getSubjColor = (id: string) => {
    return db.subjects.find((s) => s.id === id)?.color || "#71717a";
  };

  return (
    <div className="flex flex-col gap-6" id="planner-calendar-module">
      {/* 1. Header with View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="text-blue-500" size={20} />
          <div>
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white">Planner & Calendar OS</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Time block, organize priorities, and run smart scheduling redistributors.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runAutoScheduler}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500 hover:text-white text-amber-600 dark:text-amber-400 text-xs font-bold transition-all shadow-sm"
            title="Redistribute backlog tasks automatically"
          >
            <Zap size={13} />
            Smart Redistribute Backlog
          </button>

          <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 text-xs font-semibold">
            <button
              onClick={() => setViewMode("planner")}
              className={`px-3 py-1.5 rounded-md transition-colors ${viewMode === "planner" ? "bg-blue-600 text-white" : "text-zinc-600 dark:text-zinc-400"}`}
            >
              Time Blocks
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1.5 rounded-md transition-colors ${viewMode === "calendar" ? "bg-blue-600 text-white" : "text-zinc-600 dark:text-zinc-400"}`}
            >
              Calendar View
            </button>
          </div>
        </div>
      </div>

      {viewMode === "planner" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily list */}
          <div className="lg:col-span-2 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/70 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Study Plan Blocks</h3>
              <select
                value={filterSubjId}
                onChange={(e) => setFilterSubjId(e.target.value)}
                className="text-xs rounded-lg p-1.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
              >
                <option value="all">All Subjects</option>
                {db.subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-3">
              {filteredTasks.length === 0 ? (
                <div className="text-center p-8 text-zinc-400 italic">No tasks planned. Press the "Add Task" button below.</div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      task.completed
                        ? "bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-100 dark:border-zinc-900 opacity-60"
                        : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleTaskCompleted(task.id)}
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                          task.completed
                            ? "bg-green-500 border-green-600 text-white"
                            : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-500"
                        }`}
                      >
                        {task.completed && <Check size={12} />}
                      </button>

                      <div>
                        <div className={`text-xs font-bold text-zinc-900 dark:text-white ${task.completed ? "line-through" : ""}`}>
                          {task.title}
                        </div>
                        <div className="text-[10px] text-zinc-500 flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-0.5"><Clock size={10} /> {task.startTime} – {task.endTime}</span>
                          <span>•</span>
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold text-white uppercase shrink-0" style={{ backgroundColor: getSubjColor(task.subjectId) }}>
                            {getSubjName(task.subjectId)}
                          </span>
                          <span>•</span>
                          <span className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 font-medium text-[8px] uppercase">{task.type}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Task Block */}
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/70 shadow-sm flex flex-col justify-between">
            <form onSubmit={handleAddTask} className="flex flex-col gap-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Create Time Block</h3>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mechanics problems, revision"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Associate Subject</label>
                <select
                  required
                  value={subjId}
                  onChange={(e) => setSubjId(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-950 dark:text-white"
                >
                  <option value="">Select Subject</option>
                  {db.subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Task Type</label>
                  <select
                    value={taskType}
                    onChange={(e: any) => setTaskType(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-950 dark:text-white"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Note">Note Writing</option>
                    <option value="DPP">DPP Practice</option>
                    <option value="Revision">Revision</option>
                    <option value="Test">Mock Test</option>
                    <option value="Custom">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-950 dark:text-white"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 rounded-xl font-bold bg-blue-600 text-white text-xs hover:bg-blue-700 transition-colors mt-3"
              >
                Schedule Task Block
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Calendar view grid */
        <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/70 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              Calendar Schedule Logs
            </h3>
            <div className="flex items-center gap-1">
              {["month", "week"].map((c: any) => (
                <button
                  key={c}
                  onClick={() => setCalendarView(c)}
                  className={`px-3 py-1 text-[10px] font-bold rounded uppercase ${calendarView === c ? "bg-zinc-200 dark:bg-zinc-850 text-zinc-900 dark:text-white" : "text-zinc-500"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-zinc-500 uppercase border-b border-zinc-100 dark:border-zinc-800 pb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar days grid (mock 28 days for clean alignment) */}
          <div className="grid grid-cols-7 gap-2 mt-2">
            {Array.from({ length: 28 }).map((_, idx) => {
              const dayNum = (idx + 1) % 30 || 30;
              const dateStr = `2026-07-${String(dayNum).padStart(2, "0")}`;
              const dayTasks = db.planner.tasks.filter((t) => t.date === dateStr);

              return (
                <div
                  key={idx}
                  className="min-h-16 p-1.5 rounded-lg border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-between"
                >
                  <span className="text-[10px] font-bold text-zinc-400">{dayNum}</span>
                  <div className="flex flex-col gap-0.5 mt-1 overflow-hidden">
                    {dayTasks.map((t) => (
                      <div
                        key={t.id}
                        className="text-[8px] font-semibold truncate rounded px-1 text-white opacity-90"
                        style={{ backgroundColor: getSubjColor(t.subjectId) }}
                        title={t.title}
                      >
                        {t.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
