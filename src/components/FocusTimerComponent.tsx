import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Flame, Zap, Award, Bell, BellOff } from "lucide-react";
import { Synth } from "../utils/studyUtils";

interface FocusTimerComponentProps {
  onSessionComplete: (minutes: number) => void;
  streakXp: { xp: number; level: number; current: number };
  theme: "dark" | "light";
}

export default function FocusTimerComponent({ onSessionComplete, streakXp, theme }: FocusTimerComponentProps) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"Work" | "Short Break" | "Long Break">("Work");
  const [sound, setSound] = useState<"none" | "rain" | "noise" | "drone">("none");
  const [initialDuration, setInitialDuration] = useState(25 * 60); // in seconds
  const [customTime, setCustomTime] = useState("25");

  const [notificationPermission, setNotificationPermission] = useState<"granted" | "denied" | "default" | "unsupported">(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission as "granted" | "denied" | "default";
    }
    return "unsupported";
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const requestNotificationPermission = () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      alert("This browser does not support desktop notifications.");
      return;
    }
    Notification.requestPermission().then((permission) => {
      setNotificationPermission(permission as any);
      if (permission === "granted") {
        new Notification("Notifications Active! 🔔", {
          body: "You will now receive desktop alerts when your focus session or break ends.",
        });
      }
    });
  };

  // Sound Synth Toggle
  const handleSoundChange = (newSound: "none" | "rain" | "noise" | "drone") => {
    setSound(newSound);
    if (newSound === "none") {
      Synth.stop();
    } else {
      Synth.startSound(newSound);
    }
  };

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (seconds === 0) {
          if (minutes === 0) {
            // Timer Complete!
            handleTimerComplete();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, minutes, seconds]);

  const handleTimerComplete = () => {
    setIsActive(false);
    Synth.stop();
    setSound("none");

    // Play highly satisfying focus arpeggio completion audio
    Synth.playCompletionTone();

    const totalMinutesCompleted = Math.round(initialDuration / 60);

    // Trigger browser notification alert if enabled
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      if (mode === "Work") {
        new Notification("Deep Work Block Complete! 🎉", {
          body: `Superb! You finished ${totalMinutesCompleted} minutes of dedicated studying. 100 XP added to your status!`,
          requireInteraction: true
        });
      } else {
        new Notification("Break is over! Time to Focus 🎯", {
          body: "Your rest block has ended. Let's return to your deep study session!",
          requireInteraction: true
        });
      }
    }

    if (mode === "Work") {
      onSessionComplete(totalMinutesCompleted);
      alert(`🎉 Fantastic job! You completed a ${totalMinutesCompleted}-minute deep work study block. 100 XP gained!`);
      // Automatically switch to a break
      setMode("Short Break");
      setMinutes(5);
      setSeconds(0);
      setInitialDuration(5 * 60);
    } else {
      alert("Break is over! Time to focus again.");
      setMode("Work");
      setMinutes(25);
      setSeconds(0);
      setInitialDuration(25 * 60);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
    if (!isActive && sound !== "none") {
      Synth.startSound(sound);
    } else if (isActive) {
      Synth.stop();
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    Synth.stop();
    setSound("none");
    if (mode === "Work") {
      setMinutes(25);
      setInitialDuration(25 * 60);
    } else if (mode === "Short Break") {
      setMinutes(5);
      setInitialDuration(5 * 60);
    } else {
      setMinutes(15);
      setInitialDuration(15 * 60);
    }
    setSeconds(0);
  };

  const setTimerPreset = (type: "Work" | "Short Break" | "Long Break", mins: number) => {
    setIsActive(false);
    Synth.stop();
    setSound("none");
    setMode(type);
    setMinutes(mins);
    setSeconds(0);
    setInitialDuration(mins * 60);
  };

  const applyCustomTime = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(customTime);
    if (mins > 0 && mins <= 180) {
      setIsActive(false);
      Synth.stop();
      setSound("none");
      setMode("Work");
      setMinutes(mins);
      setSeconds(0);
      setInitialDuration(mins * 60);
    }
  };

  // Percentage for ring visualizer
  const currentTotalSeconds = minutes * 60 + seconds;
  const progressPercent = ((initialDuration - currentTotalSeconds) / initialDuration) * 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="focus-timer-module">
      {/* 1. Focus Timer Wheel */}
      <div className="lg:col-span-2 flex flex-col items-center justify-center p-6 rounded-[20px] border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0F1115]/50 backdrop-blur-md shadow-sm relative overflow-hidden">
        <div className="absolute top-4 left-4 flex gap-1 bg-zinc-50 dark:bg-zinc-950 rounded-[12px] p-1 border border-transparent dark:border-white/5">
          <button
            onClick={() => setTimerPreset("Work", 25)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${mode === "Work" ? "bg-blue-600 text-white" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"}`}
          >
            Pomodoro (25m)
          </button>
          <button
            onClick={() => setTimerPreset("Short Break", 5)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${mode === "Short Break" ? "bg-green-600 text-white" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"}`}
          >
            Short Break (5m)
          </button>
          <button
            onClick={() => setTimerPreset("Long Break", 15)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${mode === "Long Break" ? "bg-purple-600 text-white" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"}`}
          >
            Long Break (15m)
          </button>
        </div>

        {/* Visual Countdown Ring */}
        <div className="relative flex items-center justify-center w-72 h-72 my-8">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r="44"
              strokeWidth="4"
              stroke={theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "#e4e4e7"}
              fill="transparent"
            />
            {/* Active Progress */}
            <circle
              cx="50"
              cy="50"
              r="44"
              strokeWidth="4.5"
              stroke={mode === "Work" ? "#3b82f6" : mode === "Short Break" ? "#10b981" : "#8b5cf6"}
              fill="transparent"
              strokeDasharray={2 * Math.PI * 44}
              strokeDashoffset={2 * Math.PI * 44 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Time text inside ring */}
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white font-mono">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
            <span className="text-xs uppercase tracking-widest font-semibold text-zinc-500 mt-1">
              {mode}
            </span>
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={resetTimer}
            className="p-3 rounded-full border border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-300 transition-colors"
            title="Reset"
          >
            <RotateCcw size={20} />
          </button>
          <button
            onClick={toggleTimer}
            className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold shadow-md transition-transform hover:scale-105 ${
              isActive
                ? "bg-amber-600 text-white hover:bg-amber-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isActive ? <Pause size={18} /> : <Play size={18} />}
            {isActive ? "Pause Focus" : "Start Focusing"}
          </button>
        </div>
      </div>

      {/* 2. Focus Ambient Sound Mixer & Stats */}
      <div className="flex flex-col gap-6">
        {/* Sounds */}
        <div className="p-5 rounded-[20px] border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0F1115]/50 backdrop-blur-md shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <Volume2 size={16} className="text-blue-500" />
            Study Ambient Sounds (Synthesized)
          </h3>
          <p className="text-xs text-zinc-500 dark:text-slate-400 mb-4">
            Zero-delay relaxing soundscapes synthesized locally by your browser. Help shield against distractions.
          </p>

          <div className="flex flex-col gap-2">
            {[
              { id: "none", label: "Silent / Off", icon: <VolumeX size={16} /> },
              { id: "rain", label: "Calming Rain", desc: "Filtered brown noise & drop bursts" },
              { id: "drone", label: "Deep Space Drone", desc: "Cozy detuned oscillators chord" },
              { id: "noise", label: "White Noise Blockout", desc: "Pure static frequencies barrier" },
            ].map((snd) => (
              <button
                key={snd.id}
                onClick={() => handleSoundChange(snd.id as any)}
                className={`flex items-center justify-between p-3 rounded-[16px] border text-left transition-all ${
                  sound === snd.id
                    ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "border-zinc-150 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/5"
                }`}
              >
                <div>
                  <div className="text-xs font-semibold">{snd.label}</div>
                  {snd.desc && <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{snd.desc}</div>}
                </div>
                {sound === snd.id && <Zap size={14} className="animate-pulse" />}
              </button>
            ))}
          </div>
        </div>

        {/* Browser-based desktop notification prompts */}
        <div className="p-5 rounded-[20px] border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0F1115]/50 backdrop-blur-md shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
            <Bell size={16} className="text-amber-500" />
            Desktop Notifications
          </h3>
          <p className="text-xs text-zinc-550 dark:text-zinc-400 mb-4">
            Get instant browser-based alerts at the exact moment your Pomodoro session or break completes, even if you are on another browser tab.
          </p>

          {notificationPermission === "granted" ? (
            <div className="flex items-center gap-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-3 rounded-[12px] border border-emerald-500/10">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Desktop alerts are active & ready
            </div>
          ) : notificationPermission === "denied" ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-red-500 bg-red-500/10 p-3 rounded-[12px] border border-red-500/10">
              <BellOff size={14} />
              Alerts blocked by browser settings
            </div>
          ) : (
            <button
              onClick={requestNotificationPermission}
              className="w-full py-2.5 px-4 rounded-[12px] bg-amber-550 hover:bg-amber-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
            >
              <Bell size={14} />
              Enable Browser Notifications
            </button>
          )}
        </div>

        {/* Custom Timer & Level status */}
        <div className="p-5 rounded-[20px] border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0F1115]/50 backdrop-blur-md shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
              Set Custom Study Block
            </h3>
            <form onSubmit={applyCustomTime} className="flex gap-2">
              <input
                type="number"
                min="1"
                max="180"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                placeholder="Minutes"
                className="flex-1 text-sm rounded-[12px] p-2 border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-white"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-[12px] bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Set Mins
              </button>
            </form>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-white/10 flex items-center gap-3">
            <div className="p-2 rounded-[12px] bg-amber-500/10 text-amber-500">
              <Flame size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-white">
                {streakXp.current} Day Study Streak
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-slate-450">
                Current Level {streakXp.level} • {streakXp.xp} Total XP
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
