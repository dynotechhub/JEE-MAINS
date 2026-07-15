import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { generateArjunaJEEClass11Db } from "./src/data/class11Planners";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser with 25MB limit for rich notes, drawings, and base64 files
app.use(express.json({ limit: "25mb" }));

const DB_FILE = path.join(process.cwd(), "db.json");

// Lazy load Gemini API client
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured. Please add it in Settings > Secrets.");
    }
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return ai;
}

// Initial template for a brand new study space
const defaultDb = {
  profile: {
    name: "Aspirant",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop",
    bio: "Focused on consistency and mastering key concepts.",
    exam: "JEE", // JEE, NEET, CBSE, UPSC, CAT, College, etc.
    targetScore: "99 Percentile",
    goals: ["Study 6+ hours daily", "Solve 25 physics problems", "Complete Inorganic chemistry backlog"],
    examDate: "2026-11-15",
  },
  subjects: [
    {
      id: "subj-1",
      name: "Physics",
      color: "#3b82f6", // Blue
      chapters: [
        {
          id: "chap-1",
          name: "Kinematics",
          priority: "High",
          difficulty: "Medium",
          teacher: "Dr. Verma",
          status: "In Progress",
          progress: 60,
          expectedTime: 12, // hours
          actualTime: 8,
          revisionCount: 2,
          mistakeCount: 4,
          confidence: "Medium",
        },
        {
          id: "chap-2",
          name: "Rotational Dynamics",
          priority: "High",
          difficulty: "Hard",
          teacher: "Dr. Verma",
          status: "To Do",
          progress: 0,
          expectedTime: 18,
          actualTime: 0,
          revisionCount: 0,
          mistakeCount: 0,
          confidence: "Low",
        }
      ],
      lectures: [
        {
          id: "lec-1",
          name: "Projectile Motion - Advanced Concepts",
          teacher: "Dr. Verma",
          platform: "YouTube",
          duration: 90, // minutes
          watchedPercent: 80,
          playbackSpeed: 1.25,
          lectureLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          status: "In Progress",
          chapterId: "chap-1",
          completedDate: "",
          rating: 4,
          bookmarked: true,
        },
        {
          id: "lec-2",
          name: "Relative Motion in 2D",
          teacher: "Dr. Verma",
          platform: "Dyno Study Library",
          duration: 60,
          watchedPercent: 100,
          playbackSpeed: 1.0,
          lectureLink: "",
          status: "Completed",
          chapterId: "chap-1",
          completedDate: "2026-07-14",
          rating: 5,
          bookmarked: false,
        }
      ],
      notes: [
        {
          id: "note-1",
          name: "Formulas & Crucial Tips",
          content: "### Kinematics Formulas\n\n* $v = u + at$\n* $s = ut + \\frac{1}{2}at^2$\n* $v^2 = u^2 + 2as$\n\n*Always keep track of signs (+/-) for vector directions.*",
          chapterId: "chap-1",
          tags: ["Formulas", "Important"],
          updatedAt: "2026-07-14T10:00:00Z",
          versionHistory: [
            { date: "2026-07-14T10:00:00Z", content: "Initial kinematics note." }
          ]
        }
      ],
      dpps: [
        {
          id: "dpp-1",
          name: "DPP 01: Projectile Launch angles",
          questionsCount: 15,
          solvedCount: 12,
          wrongCount: 3,
          accuracy: 80,
          timeSpent: 45, // minutes
          status: "Completed",
          chapterId: "chap-1",
          bookmarkedQuestions: [3, 7],
        }
      ],
    },
    {
      id: "subj-2",
      name: "Chemistry",
      color: "#a855f7", // Purple
      chapters: [
        {
          id: "chap-3",
          name: "Chemical Bonding",
          priority: "High",
          difficulty: "Medium",
          teacher: "Prof. Rai",
          status: "Completed",
          progress: 100,
          expectedTime: 15,
          actualTime: 16,
          revisionCount: 3,
          mistakeCount: 2,
          confidence: "High",
        }
      ],
      lectures: [],
      notes: [],
      dpps: []
    }
  ],
  revisions: [
    {
      id: "rev-1",
      subjectId: "subj-1",
      chapterId: "chap-1",
      lastRevised: "2026-07-10",
      nextRevised: "2026-07-16",
      intervalDays: 7, // 1, 3, 7, 15, 30, 60, 90
      completedSessions: 3,
    }
  ],
  planner: {
    tasks: [
      {
        id: "plan-1",
        title: "Watch Rotational Dynamics Lecture 1",
        subjectId: "subj-1",
        chapterId: "chap-2",
        date: "2026-07-15",
        startTime: "09:00",
        endTime: "10:30",
        priority: "High",
        completed: false,
        type: "Lecture" // Lecture, Note, DPP, Revision, Test, Custom
      },
      {
        id: "plan-2",
        title: "Solve Kinematics DPP 1 Bookmark Retry",
        subjectId: "subj-1",
        chapterId: "chap-1",
        date: "2026-07-15",
        startTime: "14:00",
        endTime: "15:00",
        priority: "Medium",
        completed: true,
        type: "DPP"
      },
      {
        id: "plan-3",
        title: "Revision: Chemical Bonding structures",
        subjectId: "subj-2",
        chapterId: "chap-3",
        date: "2026-07-16",
        startTime: "10:00",
        endTime: "11:00",
        priority: "Medium",
        completed: false,
        type: "Revision"
      }
    ]
  },
  mistakeBook: [
    {
      id: "mistake-1",
      questionImageOrText: "A projectile is launched from the ground with velocity v at angle theta. What is the radius of curvature at the highest point of its trajectory?",
      wrongReason: "Used general R = v^2 / g directly instead of velocity at peak (v*cos(theta)).",
      correctMethod: "At highest point, speed is v_x = v cos(theta), acceleration is normal acceleration a_n = g. Thus, R = (v cos(theta))^2 / g.",
      subjectId: "subj-1",
      chapterId: "chap-1",
      solvedAgain: true,
      confidence: "High",
      createdAt: "2026-07-14",
      lastRevisedAt: "2026-07-15",
    }
  ],
  tests: [
    {
      id: "test-1",
      title: "Kinematics & Chemical Bonding Mock 01",
      totalMarks: 120,
      marksObtained: 92,
      timeLimit: 180, // minutes
      timeTaken: 145,
      accuracy: 82,
      negativeMarks: 4,
      rank: 42,
      createdAt: "2026-07-13",
      topicAnalysis: "Strong on VSEPR shapes; moderate on Relative projectile calculations."
    }
  ],
  focusLogs: [
    { date: "2026-07-12", durationMinutes: 120 },
    { date: "2026-07-13", durationMinutes: 180 },
    { date: "2026-07-14", durationMinutes: 240 },
    { date: "2026-07-15", durationMinutes: 90 },
  ],
  habits: [
    { id: "h-1", name: "Sleep (7-8 hours)", history: { "2026-07-13": true, "2026-07-14": true, "2026-07-15": false } },
    { id: "h-2", name: "Daily revision", history: { "2026-07-13": true, "2026-07-14": false, "2026-07-15": true } },
    { id: "h-3", name: "Solve 1 DPP", history: { "2026-07-13": true, "2026-07-14": true, "2026-07-15": true } },
    { id: "h-4", name: "30-min Meditation", history: { "2026-07-13": false, "2026-07-14": true, "2026-07-15": false } },
  ],
  resources: [
    {
      id: "res-1",
      name: "Irodov - Problems in General Physics",
      type: "PDF", // PDF, Video, Link, Cheat Sheet
      url: "",
      base64File: "",
      subjectId: "subj-1",
      notes: "Reference for mechanics chapters."
    },
    {
      id: "res-2",
      name: "Organic reaction mechanism sheet",
      type: "Cheat Sheet",
      url: "https://example.com/organic-cheat",
      subjectId: "subj-2",
      notes: "Quick check sheet before exams."
    }
  ],
  flashcards: [
    {
      id: "fc-1",
      front: "What is the hybridisation of Cl in ClF3?",
      back: "sp3d hybridisation (3 bond pairs, 2 lone pairs, T-shaped molecule).",
      subjectId: "subj-2",
      chapterId: "chap-3",
      nextReviewDate: "2026-07-16",
      box: 1, // Spaced repetition Leitner box
    },
    {
      id: "fc-2",
      front: "Formula for Range of a projectile on a horizontal plane?",
      back: "R = (u^2 * sin(2*theta)) / g",
      subjectId: "subj-1",
      chapterId: "chap-1",
      nextReviewDate: "2026-07-17",
      box: 2,
    }
  ],
  streak: {
    current: 4,
    lastActiveDate: "2026-07-15",
    xp: 680,
    level: 2
  },
  settings: {
    theme: "dark",
    language: "English",
    notifications: true,
    dailyXpGoal: 100,
    showAiRecommendation: true,
  }
};

// 1. GET DB - load persistent user data
app.get("/api/db", (req, res) => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const rawData = fs.readFileSync(DB_FILE, "utf-8");
      const db = JSON.parse(rawData);
      res.json(db);
    } else {
      // Save default Arjuna Class 11th JEE database
      const arjunaDb = generateArjunaJEEClass11Db();
      fs.writeFileSync(DB_FILE, JSON.stringify(arjunaDb, null, 2), "utf-8");
      res.json(arjunaDb);
    }
  } catch (err: any) {
    console.error("Error reading database:", err);
    res.status(500).json({ error: "Could not read database: " + err.message });
  }
});

// 1.5 RESET/SEED ARJUNA - reset database to fresh Arjuna Class 11th planner
app.post("/api/reset-arjuna", (req, res) => {
  try {
    const arjunaDb = generateArjunaJEEClass11Db();
    fs.writeFileSync(DB_FILE, JSON.stringify(arjunaDb, null, 2), "utf-8");
    res.json(arjunaDb);
  } catch (err: any) {
    console.error("Error resetting to Arjuna database:", err);
    res.status(500).json({ error: "Could not reset to Arjuna database: " + err.message });
  }
});

// 2. POST DB - save state updates
app.post("/api/db", (req, res) => {
  try {
    const updatedDb = req.body;
    fs.writeFileSync(DB_FILE, JSON.stringify(updatedDb, null, 2), "utf-8");
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error writing database:", err);
    res.status(500).json({ error: "Could not write database: " + err.message });
  }
});

// 3. POST /api/mentor - Ask Study OS AI Mentor
app.post("/api/mentor", async (req, res) => {
  try {
    const { message, chatHistory = [], context = {} } = req.body;
    const aiClient = getGeminiClient();

    // Prepare context summarizing subjects, progress, lectures, and planner to make responses super smart
    const dbContextString = `
Current Study OS Context:
Profile: ${JSON.stringify(context.profile || {})}
Subjects & Chapter Progress: ${JSON.stringify(
      (context.subjects || []).map((s: any) => ({
        subject: s.name,
        chapters: (s.chapters || []).map((c: any) => `${c.name} (${c.status}, Confidence: ${c.confidence}, Mistake Count: ${c.mistakeCount})`),
        dppsAccuracy: (s.dpps || []).map((d: any) => `${d.name}: ${d.accuracy}%`)
      }))
    )}
Streaks & XP: ${JSON.stringify(context.streak || {})}
Recent Mistakes count: ${(context.mistakeBook || []).length}
Active Daily Tasks in Planner: ${JSON.stringify(
      (context.planner?.tasks || []).filter((t: any) => !t.completed).map((t: any) => t.title)
    )}
`;

    const systemInstruction = `You are the Dyno Study OS AI Mentor—an extremely smart, motivating, and strategic study coach.
Your job is to answer the student's study query or provide tactical study advice (how to solve backlogs, which chapter to prioritize, explaining concepts, or quiz generation).
Refer directly to their subject list, chapter confidence levels, streaks, mistakes, and current tracker stats.
Be precise, clear, encouraging, and highly technical yet approachable. Always keep response concise and beautifully formatted in standard Markdown.
${dbContextString}`;

    // Format chat history correctly
    const contents = chatHistory.map((ch: any) => ({
      role: ch.sender === "user" ? "user" : "model",
      parts: [{ text: ch.text }],
    }));

    // Add current user prompt
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error("Error in AI mentor route:", err);
    res.status(500).json({ error: err.message || "Something went wrong in the AI Mentor." });
  }
});

// 4. POST /api/generate-quiz - Generate a tailored dynamic practice quiz
app.post("/api/generate-quiz", async (req, res) => {
  try {
    const { subject, chapter, difficulty = "Medium" } = req.body;
    const aiClient = getGeminiClient();

    const prompt = `Generate a quiz with exactly 5 multiple choice questions for the Subject: "${subject}", Chapter: "${chapter}", Difficulty: "${difficulty}".
Format the response strictly as a JSON array of question objects. Do not wrap the JSON output in markdown code blocks like \`\`\`json. Return only pure JSON string.

Each question object must strictly adhere to the following schema:
{
  "question": "A concise text of the question",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswerIndex": 0, // 0 to 3
  "explanation": "A complete step-by-step explanation for the correct choice"
}`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswerIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswerIndex", "explanation"]
          }
        },
        temperature: 0.7
      }
    });

    const quizText = response.text;
    res.json(JSON.parse(quizText));
  } catch (err: any) {
    console.error("Error in quiz generation:", err);
    res.status(500).json({ error: err.message || "Failed to generate quiz." });
  }
});

// Vite Middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Dyno Study OS running at http://localhost:${PORT}`);
  });
}

startServer();
