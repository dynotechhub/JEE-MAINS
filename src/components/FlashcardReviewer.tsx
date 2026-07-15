import React, { useState } from "react";
import { Plus, RotateCw, CheckCircle, AlertTriangle, RefreshCw, Layers } from "lucide-react";
import { Flashcard, Subject } from "../types";

interface FlashcardReviewerProps {
  flashcards: Flashcard[];
  subjects: Subject[];
  onAddFlashcard: (fc: Omit<Flashcard, "id">) => void;
  onReviewCard: (cardId: string, gotRight: boolean) => void;
}

export default function FlashcardReviewer({
  flashcards,
  subjects,
  onAddFlashcard,
  onReviewCard,
}: FlashcardReviewerProps) {
  const [activeTab, setActiveTab] = useState<"review" | "create">("review");
  const [reviewIndex, setReviewIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // New Flashcard state
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [selectedSubj, setSelectedSubj] = useState(subjects[0]?.id || "");
  const [selectedChap, setSelectedChap] = useState("");

  const currentSubject = subjects.find((s) => s.id === selectedSubj);

  // Filter flashcards due for review (nextReviewDate <= today or simply all)
  const todayStr = new Date().toISOString().split("T")[0];
  const dueCards = flashcards.filter((fc) => fc.nextReviewDate <= todayStr);
  const activeReviewCards = dueCards.length > 0 ? dueCards : flashcards;

  const currentCard = activeReviewCards[reviewIndex];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front || !back || !selectedSubj) return;

    onAddFlashcard({
      front,
      back,
      subjectId: selectedSubj,
      chapterId: selectedChap,
      nextReviewDate: new Date().toISOString().split("T")[0],
      box: 1,
    });

    setFront("");
    setBack("");
    alert("⚡ Flashcard added successfully!");
  };

  const handleAnswer = (gotRight: boolean) => {
    if (!currentCard) return;
    onReviewCard(currentCard.id, gotRight);
    setIsFlipped(false);
    if (reviewIndex + 1 < activeReviewCards.length) {
      setReviewIndex(reviewIndex + 1);
    } else {
      setReviewIndex(0);
      alert("🎉 All done! You've reviewed all available study flashcards for this session.");
    }
  };

  return (
    <div className="flex flex-col gap-6" id="flashcards-module">
      {/* 1. Header & Navigation */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
            <Layers className="text-purple-500" size={20} />
            Leitner Spaced Repetition Flashcards
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Box 1 cards repeat daily. Box 5 cards repeat every 30 days. Perfect for formulas, mechanisms, and key vocabulary.
          </p>
        </div>

        <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("review")}
            className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === "review" ? "bg-purple-600 text-white" : "text-zinc-600 dark:text-zinc-400"}`}
          >
            Review ({activeReviewCards.length})
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === "create" ? "bg-purple-600 text-white" : "text-zinc-600 dark:text-zinc-400"}`}
          >
            Create New
          </button>
        </div>
      </div>

      {activeTab === "review" ? (
        <div className="flex flex-col items-center">
          {activeReviewCards.length === 0 ? (
            <div className="text-center p-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md bg-zinc-50 dark:bg-zinc-950/40">
              <Layers size={40} className="mx-auto text-purple-400 mb-3" />
              <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Zero Cards Due Today</div>
              <p className="text-xs text-zinc-500 mt-2">
                All your spaced repetition boxes are fully cleared! Try creating a few more cards to continue studying.
              </p>
            </div>
          ) : (
            <div className="w-full max-w-lg flex flex-col items-center gap-6">
              {/* Box status indicators */}
              <div className="flex gap-1.5 w-full justify-between px-2">
                {[1, 2, 3, 4, 5].map((boxNum) => {
                  const count = flashcards.filter((f) => f.box === boxNum).length;
                  return (
                    <div
                      key={boxNum}
                      className={`flex-1 text-center py-1.5 rounded-lg border text-xs font-semibold ${
                        currentCard?.box === boxNum
                          ? "bg-purple-500/15 border-purple-500/50 text-purple-600 dark:text-purple-300"
                          : "border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950/30 text-zinc-500"
                      }`}
                    >
                      <div className="text-[10px] uppercase opacity-75">Box {boxNum}</div>
                      <div className="text-sm mt-0.5">{count}</div>
                    </div>
                  );
                })}
              </div>

              {/* FLIP CARD container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full h-80 relative cursor-pointer group focus:outline-none"
                style={{ perspective: "1000px" }}
              >
                <div
                  className={`w-full h-full rounded-2xl border transition-all duration-500 relative flex items-center justify-center p-8 select-none text-center ${
                    isFlipped
                      ? "bg-purple-600 border-purple-700 text-white shadow-lg rotate-y-180"
                      : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white shadow-sm"
                  }`}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "none",
                  }}
                >
                  {/* Card Front */}
                  <div
                    className="absolute inset-0 flex flex-col justify-between p-6 backface-hidden"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                      <span>Card {reviewIndex + 1} of {activeReviewCards.length}</span>
                      <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300">
                        Box {currentCard?.box}
                      </span>
                    </div>

                    <div className="text-lg md:text-xl font-bold font-sans flex-1 flex items-center justify-center px-4">
                      {currentCard?.front}
                    </div>

                    <div className="text-[10px] text-zinc-400 flex items-center justify-center gap-1.5">
                      <RotateCw size={10} /> Click card to flip and check answer
                    </div>
                  </div>

                  {/* Card Back */}
                  <div
                    className="absolute inset-0 flex flex-col justify-between p-6 rotate-y-180 backface-hidden"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                      Answer Key
                    </div>

                    <div className="text-base md:text-lg font-medium flex-1 flex items-center justify-center px-4 overflow-y-auto">
                      {currentCard?.back}
                    </div>

                    <div className="text-[10px] opacity-75">
                      Click to flip back
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              {isFlipped && (
                <div className="flex items-center gap-4 w-full">
                  <button
                    onClick={() => handleAnswer(false)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  >
                    <AlertTriangle size={18} />
                    Forgot / Hard (Back to Box 1)
                  </button>
                  <button
                    onClick={() => handleAnswer(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 hover:bg-green-500 hover:text-white transition-all shadow-sm"
                  >
                    <CheckCircle size={18} />
                    Remembered / Easy (Box +1)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Create New Card Tab */
        <form onSubmit={handleCreate} className="max-w-xl mx-auto p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col gap-4 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Subject</label>
              <select
                value={selectedSubj}
                onChange={(e) => {
                  setSelectedSubj(e.target.value);
                  setSelectedChap("");
                }}
                className="w-full text-xs rounded-lg p-2.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Chapter (Optional)</label>
              <select
                value={selectedChap}
                onChange={(e) => setSelectedChap(e.target.value)}
                className="w-full text-xs rounded-lg p-2.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="">General / None</option>
                {currentSubject?.chapters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Front (Question or Term)</label>
            <textarea
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="e.g. ClF3 hybridization molecular structure?"
              rows={3}
              required
              className="w-full text-xs rounded-lg p-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Back (Answer or Definition)</label>
            <textarea
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="e.g. sp3d, 3 bond pairs, 2 lone pairs, T-shaped"
              rows={3}
              required
              className="w-full text-xs rounded-lg p-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            Create Flashcard
          </button>
        </form>
      )}
    </div>
  );
}
