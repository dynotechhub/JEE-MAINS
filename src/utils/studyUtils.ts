import { StudyDatabase, Chapter, Lecture, DPP, PlannerTask } from "../types";

// 1. Backlog Killer Calculations
export interface BacklogAnalysis {
  totalIncompleteLectures: number;
  totalIncompleteChapters: number;
  totalIncompleteDPPs: number;
  estimatedLecturesHours: number;
  estimatedChaptersHours: number;
  totalEstimatedHours: number;
  daysRemaining: number;
  dailyHoursNeeded: number;
  weeklyTargetHours: number;
  completionDate: string;
}

export function analyzeBacklog(db: StudyDatabase): BacklogAnalysis {
  let totalIncompleteLectures = 0;
  let totalIncompleteChapters = 0;
  let totalIncompleteDPPs = 0;
  let estimatedLecturesHours = 0;
  let estimatedChaptersHours = 0;

  db.subjects.forEach((subj) => {
    // Incomplete chapters
    subj.chapters.forEach((chap) => {
      if (chap.status !== "Completed") {
        totalIncompleteChapters++;
        // Use remaining hours based on progress
        const remainingFactor = (100 - chap.progress) / 100;
        estimatedChaptersHours += (chap.expectedTime || 10) * remainingFactor;
      }
    });

    // Incomplete lectures
    subj.lectures.forEach((lec) => {
      if (lec.status !== "Completed") {
        totalIncompleteLectures++;
        // Watched % conversion to remaining minutes
        const remainingMinutes = (lec.duration || 60) * ((100 - (lec.watchedPercent || 0)) / 100);
        estimatedLecturesHours += remainingMinutes / 60;
      }
    });

    // Incomplete DPPs
    subj.dpps.forEach((dpp) => {
      if (dpp.status !== "Completed") {
        totalIncompleteDPPs++;
      }
    });
  });

  const totalEstimatedHours = estimatedChaptersHours + estimatedLecturesHours;

  // Days remaining until exam
  const examDate = new Date(db.profile.examDate);
  const today = new Date();
  const timeDiff = examDate.getTime() - today.getTime();
  const daysRemaining = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));

  const dailyHoursNeeded = parseFloat((totalEstimatedHours / daysRemaining).toFixed(1));
  const weeklyTargetHours = parseFloat((dailyHoursNeeded * 7).toFixed(1));

  // Completion Date estimate based on studying settings.dailyXpGoal or default 6 hrs/day
  const dailyStudyCap = 6; // default 6 hrs
  const daysToComplete = Math.ceil(totalEstimatedHours / dailyStudyCap);
  const completionDateObj = new Date();
  completionDateObj.setDate(completionDateObj.getDate() + daysToComplete);
  const completionDate = completionDateObj.toISOString().split("T")[0];

  return {
    totalIncompleteLectures,
    totalIncompleteChapters,
    totalIncompleteDPPs,
    estimatedLecturesHours: parseFloat(estimatedLecturesHours.toFixed(1)),
    estimatedChaptersHours: parseFloat(estimatedChaptersHours.toFixed(1)),
    totalEstimatedHours: parseFloat(totalEstimatedHours.toFixed(1)),
    daysRemaining,
    dailyHoursNeeded,
    weeklyTargetHours,
    completionDate,
  };
}

// 2. XP & Rank calculations
export function calculateXpForAction(action: "WATCH_LECTURE" | "SOLVE_DPP" | "COMPLETE_CHAPTER" | "FOCUS_SESSION" | "SOLVE_MISTAKE" | "PASS_TEST"): number {
  switch (action) {
    case "WATCH_LECTURE": return 50;
    case "SOLVE_DPP": return 80;
    case "COMPLETE_CHAPTER": return 200;
    case "FOCUS_SESSION": return 100; // per 30 mins
    case "SOLVE_MISTAKE": return 40;
    case "PASS_TEST": return 150;
    default: return 10;
  }
}

// 3. Web Audio Synth for Focus Timer (Rain, White Noise, Lofi Space Drone)
class AudioSynthManager {
  private ctx: AudioContext | null = null;
  private nodes: { source?: AudioNode; gain?: GainNode }[] = [];
  private isPlaying = false;

  public startSound(type: "rain" | "noise" | "drone" | "forest") {
    try {
      this.stop();
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gainNode.connect(this.ctx.destination);

      if (type === "noise") {
        // White noise node
        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;
        whiteNoise.connect(gainNode);
        whiteNoise.start();
        this.nodes.push({ source: whiteNoise, gain: gainNode });
      } else if (type === "rain") {
        // Rain is filtered brown noise with rapid random gains
        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          // Brown noise filter approximation
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; // compensation gain
        }
        const rainSource = this.ctx.createBufferSource();
        rainSource.buffer = noiseBuffer;
        rainSource.loop = true;

        // Bandpass filter to make it sound like falling rain on roofs
        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(800, this.ctx.currentTime);

        rainSource.connect(filter);
        filter.connect(gainNode);
        rainSource.start();
        this.nodes.push({ source: rainSource, gain: gainNode });
      } else if (type === "drone" || type === "forest") {
        // Ambient sci-fi space drone (multiple detuned modulating sine waves)
        const oscs: OscillatorNode[] = [];
        const freqs = [65.41, 98.0, 130.81, 196.0]; // C2, G2, C3, G3 chord drone
        freqs.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const panner = this.ctx!.createStereoPanner ? this.ctx!.createStereoPanner() : null;
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 1.5, this.ctx!.currentTime);

          // LFO for modulation
          const lfo = this.ctx!.createOscillator();
          const lfoGain = this.ctx!.createGain();
          lfo.type = "sine";
          lfo.frequency.setValueAtTime(0.1 + idx * 0.05, this.ctx!.currentTime);
          lfoGain.gain.setValueAtTime(15, this.ctx!.currentTime);

          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);
          lfo.start();

          const oscGain = this.ctx!.createGain();
          oscGain.gain.setValueAtTime(type === "forest" ? 0.04 : 0.08, this.ctx!.currentTime);

          if (panner) {
            osc.connect(panner);
            panner.connect(oscGain);
            panner.pan.setValueAtTime(Math.sin(idx), this.ctx!.currentTime);
          } else {
            osc.connect(oscGain);
          }

          oscGain.connect(gainNode);
          osc.start();
          oscs.push(osc);
        });
        this.nodes.push({ gain: gainNode });
      }

      this.isPlaying = true;
    } catch (e) {
      console.error("Failed to play synthesized focus sound:", e);
    }
  }

  public stop() {
    try {
      this.nodes.forEach((n) => {
        if (n.source) {
          try { (n.source as any).stop(); } catch(e){}
        }
      });
      if (this.ctx) {
        this.ctx.close();
        this.ctx = null;
      }
      this.nodes = [];
      this.isPlaying = false;
    } catch(e) {
      console.error("Error stopping sound synth:", e);
    }
  }

  public isSoundPlaying() {
    return this.isPlaying;
  }

  public playCompletionTone() {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);
        
        gainNode.gain.setValueAtTime(0, start);
        gainNode.gain.linearRampToValueAtTime(0.12, start + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start(start);
        osc.stop(start + duration);
      };
      
      // Satisfying ascending JEE focus complete chime: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
      playTone(523.25, now, 0.5);
      playTone(659.25, now + 0.12, 0.5);
      playTone(783.99, now + 0.24, 0.5);
      playTone(1046.50, now + 0.36, 0.7);
      
      setTimeout(() => {
        audioCtx.close().catch(() => {});
      }, 1500);
    } catch (e) {
      console.error("Failed to play synthesized completion tone:", e);
    }
  }
}

export const Synth = new AudioSynthManager();
