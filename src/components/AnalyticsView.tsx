import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { StudyDatabase } from "../types";
import { Calendar, Award, Hourglass, Percent } from "lucide-react";

interface AnalyticsViewProps {
  db: StudyDatabase;
}

export default function AnalyticsView({ db }: AnalyticsViewProps) {
  // 1. Process Daily Study Logs
  // Fill missing last 7 days with zeros if no log exists
  const getDailyChartData = () => {
    const data = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateString = d.toISOString().split("T")[0];
      const match = db.focusLogs.find((l) => l.date === dateString);
      const minutes = match ? match.durationMinutes : 0;
      data.push({
        name: d.toLocaleDateString("en-US", { weekday: "short" }),
        hours: parseFloat((minutes / 60).toFixed(1)),
      });
    }
    return data;
  };

  // 2. Process Subject Comparison Data
  const getSubjectPieData = () => {
    const data = db.subjects.map((s) => {
      // Sum chapter expected times as proxy for weight, or count chapters
      const hours = s.chapters.reduce((acc, c) => acc + (c.actualTime || c.expectedTime || 5), 0);
      return {
        name: s.name,
        value: hours || 1, // fallback to avoid 0
        color: s.color || "#3b82f6",
      };
    });
    return data;
  };

  // 3. Process Monthly Heatmap
  const getHeatmapGrid = () => {
    // Generate dates for current month (30 days trailing)
    const today = new Date();
    const cells = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateString = d.toISOString().split("T")[0];
      const log = db.focusLogs.find((l) => l.date === dateString);
      const mins = log ? log.durationMinutes : 0;

      // Color intensity class based on focus minutes
      let intensity = "bg-zinc-100 dark:bg-zinc-900";
      if (mins > 0 && mins <= 60) intensity = "bg-emerald-500/20";
      else if (mins > 60 && mins <= 120) intensity = "bg-emerald-500/40";
      else if (mins > 120 && mins <= 200) intensity = "bg-emerald-500/60";
      else if (mins > 200) intensity = "bg-emerald-500/80";

      cells.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        mins,
        intensity,
      });
    }
    return cells;
  };

  // 4. Cumulative growth chart based on daily XP accumulation mockup
  const getGrowthData = () => {
    return [
      { name: "Week 1", XP: 250 },
      { name: "Week 2", XP: 480 },
      { name: "Week 3", XP: 620 },
      { name: "Week 4", XP: db.streak.xp },
    ];
  };

  const dailyData = getDailyChartData();
  const subjectData = getSubjectPieData();
  const heatmapCells = getHeatmapGrid();
  const growthData = getGrowthData();

  // Aggregate stats
  const totalFocusHours = parseFloat(
    (db.focusLogs.reduce((acc, l) => acc + l.durationMinutes, 0) / 60).toFixed(1)
  );
  const averageAccuracy = Math.round(
    db.subjects.reduce((acc, s) => {
      const subAcc = s.dpps.length > 0 ? s.dpps.reduce((sum, d) => sum + d.accuracy, 0) / s.dpps.length : 85;
      return acc + subAcc;
    }, 0) / (db.subjects.length || 1)
  );

  return (
    <div className="flex flex-col gap-6" id="analytics-module">
      {/* 1. Header Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Hourglass size={20} />
          </div>
          <div>
            <div className="text-xs text-zinc-500 font-medium">Total Study Logged</div>
            <div className="text-xl font-bold text-zinc-900 dark:text-white">{totalFocusHours} Hrs</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
            <Percent size={20} />
          </div>
          <div>
            <div className="text-xs text-zinc-500 font-medium">Average DPP Accuracy</div>
            <div className="text-xl font-bold text-zinc-900 dark:text-white">{averageAccuracy}%</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Award size={20} />
          </div>
          <div>
            <div className="text-xs text-zinc-500 font-medium">Study XP Accumulated</div>
            <div className="text-xl font-bold text-zinc-900 dark:text-white">{db.streak.xp} XP</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Calendar size={20} />
          </div>
          <div>
            <div className="text-xs text-zinc-500 font-medium">Current Streak</div>
            <div className="text-xl font-bold text-zinc-900 dark:text-white">{db.streak.current} Days</div>
          </div>
        </div>
      </div>

      {/* 2. Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Study Hours */}
        <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col h-80">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Daily Study Hours (Last 7 Days)</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.15} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} unit="h" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(24, 24, 27, 0.9)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  cursor={{ fill: "rgba(113, 113, 122, 0.1)" }}
                />
                <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Comparison */}
        <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col h-80">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Subject Weight Comparison (Logged Hours)</h3>
          <div className="flex-1 flex items-center justify-center min-h-0">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(24, 24, 27, 0.9)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 flex flex-col gap-2 pl-4">
              {subjectData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{entry.name}</span>
                  <span className="text-xs text-zinc-500">({entry.value} Hrs)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Grid: Heatmap & growth trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trailing 28-day study density heatmap */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Study Frequency Heatmap (Last 28 Days)</h3>
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
              <span>Less</span>
              <div className="w-2.5 h-2.5 rounded-sm bg-zinc-100 dark:bg-zinc-900" />
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/20" />
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/50" />
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/80" />
              <span>More</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {heatmapCells.map((cell, idx) => (
              <div
                key={idx}
                className={`aspect-square rounded-md flex flex-col items-center justify-center border border-zinc-200/50 dark:border-zinc-800/40 cursor-help transition-all hover:scale-105 ${cell.intensity}`}
                title={`${cell.date}: ${cell.mins} focus minutes`}
              >
                <span className="text-[10px] font-semibold text-zinc-800 dark:text-zinc-200">
                  {cell.date.split(" ")[1]}
                </span>
                {cell.mins > 0 && (
                  <span className="text-[8px] opacity-75 font-mono text-emerald-800 dark:text-emerald-300">
                    {cell.mins}m
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Overall Growth Area Chart */}
        <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col h-64">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">XP Growth Trend</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(24, 24, 27, 0.9)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                  }}
                />
                <Area type="monotone" dataKey="XP" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorXp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
