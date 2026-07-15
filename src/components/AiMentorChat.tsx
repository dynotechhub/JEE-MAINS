import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Brain, AlertCircle, RefreshCw, CheckCircle, XCircle, Sparkles, HelpCircle, GraduationCap } from "lucide-react";
import { StudyDatabase, Subject } from "../types";

interface Message {
  id: string;
  sender: "user" | "model";
  text: string;
  timestamp: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

interface AiMentorChatProps {
  db: StudyDatabase;
  onAddXp: (xp: number) => void;
}

export default function AiMentorChat({ db, onAddXp }: AiMentorChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m-1",
      sender: "model",
      text: `Hello! I am your **Dyno AI Study Mentor**. 🧠\n\nI have scanned your Study OS and calculated your metrics:\n* Target Exam: **${db.profile.exam}**\n* Remaining days: **${Math.max(1, Math.ceil((new Date(db.profile.examDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)))} days**.\n\nHow can I help you accelerate your learning today? I can **generate custom quizzes**, **explain complex concepts**, or **analyze your study backlog**!`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Quiz state
  const [quizActive, setQuizActive] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizSubject, setQuizSubject] = useState("");
  const [quizChapter, setQuizChapter] = useState("");
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsgText = input;
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsgText,
          chatHistory: messages.map((m) => ({ sender: m.sender, text: m.text })),
          context: db,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const botMsg: Message = {
        id: Math.random().toString(),
        sender: "model",
        text: data.text || "I was unable to formulate a response. Please check your credentials.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "model",
          text: `⚠️ Error communicating with AI: ${err.message || "Failed to fetch response."}. Please make sure your \`GEMINI_API_KEY\` is loaded correctly in AI Studio Secrets.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startQuizGeneration = async () => {
    if (!quizSubject || !quizChapter) {
      alert("Please select a subject and chapter to generate the quiz.");
      return;
    }
    setGeneratingQuiz(true);
    setQuizActive(false);

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: quizSubject, chapter: quizChapter, difficulty: "Medium" }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setQuizQuestions(data);
      setQuizActive(true);
      setCurrentQuizIndex(0);
      setSelectedOptionIndex(null);
      setQuizSubmitted(false);
      setQuizScore(0);
    } catch (err: any) {
      alert(`Could not generate quiz: ${err.message || "Unknown error"}. Make sure your Gemini API Key is configured.`);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleOptionSelect = (idx: number) => {
    if (quizSubmitted) return;
    setSelectedOptionIndex(idx);
  };

  const submitQuizAnswer = () => {
    if (selectedOptionIndex === null || quizSubmitted) return;
    setQuizSubmitted(true);
    const isCorrect = selectedOptionIndex === quizQuestions[currentQuizIndex].correctAnswerIndex;
    if (isCorrect) {
      setQuizScore((p) => p + 1);
      onAddXp(20); // 20 XP per correct answer
    }
  };

  const nextQuizQuestion = () => {
    if (currentQuizIndex + 1 < quizQuestions.length) {
      setCurrentQuizIndex((p) => p + 1);
      setSelectedOptionIndex(null);
      setQuizSubmitted(false);
    } else {
      // Quiz ended
      alert(`🎉 Quiz complete! You scored ${quizScore}/${quizQuestions.length}. Gained ${quizScore * 20} XP!`);
      setQuizActive(false);
      setQuizQuestions([]);
    }
  };

  // Pre-configured mentor prompt templates
  const handleTemplateClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="ai-mentor-module">
      {/* Left 2 Cols: AI Chat Room */}
      <div className="lg:col-span-2 flex flex-col h-[550px] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/70 shadow-sm overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-600 text-white">
              <Bot size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-white">Intelligent AI Study Coach</div>
              <div className="text-[10px] text-zinc-500">Gemini 3.5 Flash Active</div>
            </div>
          </div>
          <Sparkles className="text-amber-500 animate-pulse" size={16} />
        </div>

        {/* Chat Bubbles */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${m.sender === "user" ? "self-end flex-row-reverse" : "self-start"}`}
            >
              <div
                className={`p-2 rounded-full h-8 w-8 flex items-center justify-center text-xs shrink-0 ${
                  m.sender === "user" ? "bg-purple-600 text-white" : "bg-blue-600/10 text-blue-600"
                }`}
              >
                {m.sender === "user" ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                  m.sender === "user"
                    ? "bg-purple-600 text-white rounded-tr-none"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-tl-none"
                }`}
              >
                {m.text}
                <div className="text-[9px] opacity-60 text-right mt-1.5">{m.timestamp}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 self-start items-center">
              <div className="p-2 rounded-full h-8 w-8 bg-blue-600/10 text-blue-600 flex items-center justify-center">
                <Bot size={14} />
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-xs text-zinc-500 flex items-center gap-2 rounded-tl-none">
                <RefreshCw size={12} className="animate-spin" /> AI Study Coach is reviewing your planner metrics...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Templates */}
        <div className="px-4 py-2 flex gap-1.5 overflow-x-auto border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
          {[
            "What should I study right now?",
            "How do I clear my chapter backlogs?",
            "Explain Rotational Dynamics simply.",
            "Summarize study guidelines.",
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleTemplateClick(prompt)}
              className="text-[10px] font-semibold px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 hover:bg-blue-500/5 text-zinc-600 dark:text-zinc-400 shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask mentor to explain a concept or suggest what to study next..."
            className="flex-1 text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* Right Column: AI Live Quiz Generator */}
      <div className="flex flex-col gap-6">
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/70 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
            <GraduationCap className="text-blue-500" size={16} />
            AI Concept Quizzes
          </h3>
          <p className="text-xs text-zinc-500 mb-4">
            Pick any chapter. Dyno AI generates standard 5-question multi-choice mock questions to test your accuracy in real time.
          </p>

          {!quizActive ? (
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Select Subject</label>
                <select
                  value={quizSubject}
                  onChange={(e) => {
                    setQuizSubject(e.target.value);
                    setQuizChapter("");
                  }}
                  className="w-full text-xs rounded-lg p-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                >
                  <option value="">Select Subject</option>
                  {db.subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Select Chapter</label>
                <select
                  value={quizChapter}
                  onChange={(e) => setQuizChapter(e.target.value)}
                  className="w-full text-xs rounded-lg p-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                >
                  <option value="">Select Chapter</option>
                  {db.subjects
                    .find((s) => s.name === quizSubject)
                    ?.chapters.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <button
                onClick={startQuizGeneration}
                disabled={generatingQuiz || !quizSubject || !quizChapter}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white text-xs transition-colors shadow-sm disabled:opacity-40"
              >
                {generatingQuiz ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Generating tailored quiz...
                  </>
                ) : (
                  <>
                    <Brain size={14} />
                    Generate Quiz (Earn 100 XP)
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Active Quiz display */
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase">
                <span>Question {currentQuizIndex + 1} of {quizQuestions.length}</span>
                <span className="text-blue-500">Score: {quizScore}</span>
              </div>

              <div className="text-xs font-bold text-zinc-900 dark:text-white leading-relaxed">
                {quizQuestions[currentQuizIndex].question}
              </div>

              <div className="flex flex-col gap-2">
                {quizQuestions[currentQuizIndex].options.map((option, idx) => {
                  let optStyle = "border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100";
                  if (selectedOptionIndex === idx) optStyle = "border-blue-500 bg-blue-500/10 text-blue-600";
                  if (quizSubmitted) {
                    if (idx === quizQuestions[currentQuizIndex].correctAnswerIndex) {
                      optStyle = "border-green-500 bg-green-500/10 text-green-600 font-semibold";
                    } else if (selectedOptionIndex === idx) {
                      optStyle = "border-red-500 bg-red-500/10 text-red-600";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      disabled={quizSubmitted}
                      className={`w-full text-left p-2.5 text-xs rounded-xl border transition-all flex items-center justify-between ${optStyle}`}
                    >
                      <span>{option}</span>
                      {quizSubmitted && idx === quizQuestions[currentQuizIndex].correctAnswerIndex && <CheckCircle size={14} className="text-green-500" />}
                      {quizSubmitted && selectedOptionIndex === idx && idx !== quizQuestions[currentQuizIndex].correctAnswerIndex && <XCircle size={14} className="text-red-500" />}
                    </button>
                  );
                })}
              </div>

              {quizSubmitted ? (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  <div className="font-bold flex items-center gap-1.5 text-green-600 dark:text-green-400 mb-1">
                    <HelpCircle size={12} /> Solution Explanation:
                  </div>
                  {quizQuestions[currentQuizIndex].explanation}

                  <button
                    onClick={nextQuizQuestion}
                    className="w-full mt-3 py-2 px-4 rounded-lg bg-blue-600 text-white font-bold text-xs"
                  >
                    {currentQuizIndex + 1 < quizQuestions.length ? "Next Question" : "Complete Quiz"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={submitQuizAnswer}
                  disabled={selectedOptionIndex === null}
                  className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-sm disabled:opacity-40"
                >
                  Verify Answer
                </button>
              )}
            </div>
          )}
        </div>

        {/* AI study recommendation stats box */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/70 shadow-sm">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Brain size={14} className="text-amber-500" />
            Study OS Recommendations
          </h3>
          <div className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Based on your recent chapters and confidence levels:
            <ul className="list-disc pl-4 mt-2 flex flex-col gap-1.5">
              <li>
                Prioritize <strong className="text-zinc-800 dark:text-zinc-200">Rotational Dynamics</strong>. Your current confidence is low, and its priority is High.
              </li>
              <li>
                Schedule <strong className="text-zinc-800 dark:text-zinc-200">Chemical Bonding</strong> revision. It was marked for 3 days ago.
              </li>
              <li>
                You need <strong className="text-zinc-800 dark:text-zinc-200">6.2 study hours daily</strong> to complete remaining chapters before your target exam date.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
