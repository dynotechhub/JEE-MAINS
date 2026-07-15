import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, Trash2, BookOpen, Tag, Save, Sparkles, Search, 
  Keyboard, HelpCircle, ChevronRight, FileText, Check, Clock, ArrowRight 
} from "lucide-react";
import katex from "katex";
import { Subject, Chapter, Note, StudyDatabase } from "../types";

interface MathNotesEditorProps {
  db: StudyDatabase;
  activeSubject: Subject;
  onUpdateDb: (updated: StudyDatabase) => void;
  onAddXp: (xp: number) => void;
}

interface MathSymbol {
  name: string;
  latex: string;
  display: string;
  category: "Greek" | "Calculus" | "Algebra" | "Relations" | "Vectors" | "Chemistry" | "Physics" | "Formulas";
  keywords: string[];
}

// Comprehensive high-school and entrance-level math, physics, and chemistry symbol dataset
const MATH_SYMBOLS: MathSymbol[] = [
  // Greek Letters
  { name: "Alpha", latex: "\\alpha", display: "α", category: "Greek", keywords: ["alpha", "greek", "a"] },
  { name: "Beta", latex: "\\beta", display: "β", category: "Greek", keywords: ["beta", "greek", "b"] },
  { name: "Gamma", latex: "\\gamma", display: "γ", category: "Greek", keywords: ["gamma", "greek", "g"] },
  { name: "Delta", latex: "\\delta", display: "δ", category: "Greek", keywords: ["delta", "greek", "d", "change", "difference"] },
  { name: "Epsilon", latex: "\\varepsilon", display: "ε", category: "Greek", keywords: ["epsilon", "e", "permittivity"] },
  { name: "Theta", latex: "\\theta", display: "θ", category: "Greek", keywords: ["theta", "angle", "t"] },
  { name: "Lambda", latex: "\\lambda", display: "λ", category: "Greek", keywords: ["lambda", "wavelength", "l"] },
  { name: "Mu", latex: "\\mu", display: "μ", category: "Greek", keywords: ["mu", "friction", "micro", "permeability", "m"] },
  { name: "Pi", latex: "\\pi", display: "π", category: "Greek", keywords: ["pi", "p", "circle", "3.14"] },
  { name: "Rho", latex: "\\rho", display: "ρ", category: "Greek", keywords: ["rho", "density", "resistivity", "r"] },
  { name: "Sigma", latex: "\\sigma", display: "σ", category: "Greek", keywords: ["sigma", "s", "stdev"] },
  { name: "Tau", latex: "\\tau", display: "τ", category: "Greek", keywords: ["tau", "torque", "time"] },
  { name: "Phi", latex: "\\phi", display: "φ", category: "Greek", keywords: ["phi", "angle", "flux"] },
  { name: "Omega", latex: "\\Omega", display: "Ω", category: "Greek", keywords: ["omega", "resistance", "ohm", "angular"] },
  { name: "Psi", latex: "\\psi", display: "ψ", category: "Greek", keywords: ["psi", "wavefunction"] },

  // Calculus
  { name: "Integral", latex: "\\int", display: "∫", category: "Calculus", keywords: ["integral", "integration", "calculus", "int", "area"] },
  { name: "Double Integral", latex: "\\iint", display: "∬", category: "Calculus", keywords: ["iint", "double integral", "calculus"] },
  { name: "Triple Integral", latex: "\\iiint", display: "∭", category: "Calculus", keywords: ["iiint", "triple integral", "calculus"] },
  { name: "Partial Diff", latex: "\\partial", display: "∂", category: "Calculus", keywords: ["partial", "derivative", "calculus", "diff", "d"] },
  { name: "Gradient (Del)", latex: "\\nabla", display: "∇", category: "Calculus", keywords: ["nabla", "gradient", "vector", "del"] },
  { name: "Limit", latex: "\\lim_{x \\to 0}", display: "lim", category: "Calculus", keywords: ["limit", "lim", "calculus"] },
  { name: "Summation", latex: "\\sum_{i=1}^{n}", display: "Σ", category: "Calculus", keywords: ["sum", "summation", "sigma", "series"] },
  { name: "Product", latex: "\\prod_{i=1}^{n}", display: "Π", category: "Calculus", keywords: ["product", "pi", "prod"] },
  { name: "Infinity", latex: "\\infty", display: "∞", category: "Calculus", keywords: ["infinity", "inf", "limit"] },

  // Algebra & Basic
  { name: "Square", latex: "x^2", display: "x²", category: "Algebra", keywords: ["square", "power", "pow", "algebra", "x2"] },
  { name: "Cube", latex: "x^3", display: "x³", category: "Algebra", keywords: ["cube", "power", "pow", "algebra", "x3"] },
  { name: "Power n", latex: "x^n", display: "xⁿ", category: "Algebra", keywords: ["power", "pow", "algebra", "xn"] },
  { name: "Square Root", latex: "\\sqrt{x}", display: "√x", category: "Algebra", keywords: ["sqrt", "root", "square root", "radical"] },
  { name: "Cube Root", latex: "\\sqrt[3]{x}", display: "∛x", category: "Algebra", keywords: ["cbrt", "root", "cube root"] },
  { name: "Fraction", latex: "\\frac{a}{b}", display: "a/b", category: "Algebra", keywords: ["fraction", "frac", "divide", "div"] },
  { name: "Logarithm", latex: "\\log_{10}(x)", display: "log", category: "Algebra", keywords: ["log", "logarithm", "algebra"] },
  { name: "Natural Log", latex: "\\ln(x)", display: "ln", category: "Algebra", keywords: ["ln", "natural log", "logarithm"] },

  // Relations & Logic
  { name: "Not Equal", latex: "\\neq", display: "≠", category: "Relations", keywords: ["neq", "not equal", "relation"] },
  { name: "Approx Equal", latex: "\\approx", display: "≈", category: "Relations", keywords: ["approx", "approximately", "relation"] },
  { name: "Plus Minus", latex: "\\pm", display: "±", category: "Relations", keywords: ["pm", "plus minus", "error"] },
  { name: "Less Than/Equal", latex: "\\leq", display: "≤", category: "Relations", keywords: ["leq", "less than", "relation"] },
  { name: "Greater Than/Equal", latex: "\\geq", display: "≥", category: "Relations", keywords: ["geq", "greater than", "relation"] },
  { name: "Belongs To", latex: "\\in", display: "∈", category: "Relations", keywords: ["in", "belongs", "set", "element"] },
  { name: "Subset Of", latex: "\\subset", display: "⊂", category: "Relations", keywords: ["subset", "set", "contained"] },
  { name: "Union", latex: "\\cup", display: "∪", category: "Relations", keywords: ["union", "set", "or"] },
  { name: "Intersection", latex: "\\cap", display: "∩", category: "Relations", keywords: ["intersection", "set", "and"] },
  { name: "Implies", latex: "\\implies", display: "⇒", category: "Relations", keywords: ["implies", "implies arrow", "logic"] },

  // Vectors
  { name: "Vector Arrow", latex: "\\vec{A}", display: "A⃗", category: "Vectors", keywords: ["vector", "arrow", "physics"] },
  { name: "Magnitude", latex: "|\\vec{A}|", display: "|A|", category: "Vectors", keywords: ["magnitude", "vector", "physics", "norm"] },
  { name: "Dot Product", latex: "\\vec{A} \\cdot \\vec{B}", display: "A·B", category: "Vectors", keywords: ["dot", "product", "scalar", "vector"] },
  { name: "Cross Product", latex: "\\vec{A} \\times \\vec{B}", display: "A×B", category: "Vectors", keywords: ["cross", "product", "vector"] },

  // Chemistry
  { name: "Equilibrium Arrow", latex: "\\rightleftharpoons", display: "⇌", category: "Chemistry", keywords: ["equilibrium", "reaction", "chemistry", "reversible"] },
  { name: "Yields Arrow", latex: "\\rightarrow", display: "→", category: "Chemistry", keywords: ["yields", "arrow", "chemistry", "reaction"] },
  { name: "Sulfuric Acid", latex: "H_2SO_4", display: "H₂SO₄", category: "Chemistry", keywords: ["sulfuric acid", "h2so4", "chemistry", "acid"] },
  { name: "Carbon Dioxide", latex: "CO_2", display: "CO₂", category: "Chemistry", keywords: ["carbon dioxide", "co2", "chemistry"] },
  { name: "Sodium Hydroxide", latex: "NaOH", display: "NaOH", category: "Chemistry", keywords: ["sodium hydroxide", "naoh", "chemistry", "base"] },
  { name: "Water", latex: "H_2O", display: "H₂O", category: "Chemistry", keywords: ["water", "h2o", "chemistry"] },
  { name: "Gas Release Arrow", latex: "\\uparrow", display: "↑", category: "Chemistry", keywords: ["gas", "release", "up arrow"] },
  { name: "Precipitate Arrow", latex: "\\downarrow", display: "↓", category: "Chemistry", keywords: ["precipitate", "ppt", "down arrow"] },
  { name: "Reaction Delta", latex: "\\Delta", display: "Δ", category: "Chemistry", keywords: ["heat", "delta", "chemistry"] },

  // Physics
  { name: "Planck constant", latex: "\\hbar", display: "ħ", category: "Physics", keywords: ["planck", "hbar", "quantum"] },
  { name: "Permittivity (Epsilon)", latex: "\\varepsilon_0", display: "ε₀", category: "Physics", keywords: ["permittivity", "epsilon", "electric", "dielectric"] },
  { name: "Permeability (Mu)", latex: "\\mu_0", display: "μ₀", category: "Physics", keywords: ["permeability", "mu", "magnetic"] },
  { name: "Wave Frequency", latex: "\\nu", display: "ν", category: "Physics", keywords: ["frequency", "nu", "wave"] },
  { name: "Speed of Light", latex: "c", display: "c", category: "Physics", keywords: ["speed", "light", "einstein"] },

  // Formulas
  { 
    name: "Quadratic Formula", 
    latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}", 
    display: "x=(-b±√(b²-4ac))/2a", 
    category: "Formulas", 
    keywords: ["quadratic", "formula", "algebra", "roots"] 
  },
  { 
    name: "Euler's Identity", 
    latex: "e^{i\\pi} + 1 = 0", 
    display: "e^(iπ)+1=0", 
    category: "Formulas", 
    keywords: ["euler", "identity", "complex"] 
  },
  { 
    name: "Schrodinger Eq", 
    latex: "i\\hbar\\frac{\\partial}{\\partial t}\\Psi = \\hat{H}\\Psi", 
    display: "iħ∂/∂t Ψ = ĤΨ", 
    category: "Formulas", 
    keywords: ["schrodinger", "quantum", "physics", "wave"] 
  },
  { 
    name: "Einstein Mass-Energy", 
    latex: "E = mc^2", 
    display: "E=mc²", 
    category: "Formulas", 
    keywords: ["einstein", "energy", "physics", "mass"] 
  },
  { 
    name: "Fourier Transform", 
    latex: "\\hat{f}(\\xi) = \\int_{-\\infty}^{\\infty} f(x)e^{-2\\pi ix\\xi}dx", 
    display: "F̂(ξ) = ∫ f(x)e^(-2πixξ)dx", 
    category: "Formulas", 
    keywords: ["fourier", "transform", "calculus"] 
  },
  { 
    name: "De Broglie Wavelength", 
    latex: "\\lambda = \\frac{h}{p}", 
    display: "λ = h/p", 
    category: "Formulas", 
    keywords: ["de broglie", "wavelength", "physics", "quantum"] 
  }
];

export default function MathNotesEditor({ db, activeSubject, onUpdateDb, onAddXp }: MathNotesEditorProps) {
  // Check if subject has notes; if not, initialize empty list
  const notes = activeSubject.notes || [];

  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || "");
  const [isEditing, setIsEditing] = useState<boolean>(true);
  const [editorMode, setEditorMode] = useState<"split" | "write" | "preview">("split");
  const [searchSymbol, setSearchSymbol] = useState<string>("");
  const [keyboardOpen, setKeyboardOpen] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Current selected note
  const activeNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  // Form states for active note
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteChapterId, setNoteChapterId] = useState("");
  const [noteTags, setNoteTags] = useState<string>("");
  const [autosaveStatus, setAutosaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync state when active note changes
  useEffect(() => {
    if (activeNote) {
      setNoteTitle(activeNote.name);
      setNoteContent(activeNote.content);
      setNoteChapterId(activeNote.chapterId || "");
      setNoteTags(activeNote.tags?.join(", ") || "");
      setAutosaveStatus("saved");
    } else {
      setNoteTitle("");
      setNoteContent("");
      setNoteChapterId("");
      setNoteTags("");
      setAutosaveStatus("saved");
    }
  }, [selectedNoteId, activeSubject.id]);

  // Handle auto-saving on content changes (debounced)
  useEffect(() => {
    if (!activeNote) return;

    // Check if anything actually changed
    const tagsArray = noteTags.split(",").map((t) => t.trim()).filter(Boolean);
    const hasChanged = 
      noteTitle !== activeNote.name ||
      noteContent !== activeNote.content ||
      noteChapterId !== (activeNote.chapterId || "") ||
      JSON.stringify(tagsArray) !== JSON.stringify(activeNote.tags || []);

    if (!hasChanged) return;

    setAutosaveStatus("unsaved");
    const delayDebounceFn = setTimeout(() => {
      handleSaveNote();
    }, 1500);

    return () => clearTimeout(delayDebounceFn);
  }, [noteTitle, noteContent, noteChapterId, noteTags]);

  // Insert LaTeX text helper at the current textarea cursor position
  const insertLatex = (latexString: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const before = text.substring(0, start);
    const after = text.substring(end, text.length);

    const updatedContent = before + latexString + after;
    setNoteContent(updatedContent);

    // Reposition cursor right after the inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + latexString.length;
    }, 50);
  };

  // Create Note
  const handleCreateNote = () => {
    const newNote: Note = {
      id: "note-" + Date.now(),
      name: "New Syllabus Note",
      content: "### Chemistry / Math Notes\n\nType equations using single dollar signs for inline math like $E = mc^2$ or double dollar signs for display math block equations:\n\n$$\nx = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\n$$\n\nUse the symbol toolbar or the Smart Search bar above to find and insert symbols!",
      chapterId: activeSubject.chapters[0]?.id || "",
      tags: ["Draft"],
      updatedAt: new Date().toISOString(),
      versionHistory: [
        { date: new Date().toISOString(), content: "Note initialized." }
      ]
    };

    const updatedSubjects = db.subjects.map((s) => {
      if (s.id === activeSubject.id) {
        return {
          ...s,
          notes: [newNote, ...(s.notes || [])]
        };
      }
      return s;
    });

    onUpdateDb({ ...db, subjects: updatedSubjects });
    setSelectedNoteId(newNote.id);
    onAddXp(25); // Note creation bonus
  };

  // Delete Note
  const handleDeleteNote = (noteId: string) => {
    if (!confirm("Are you sure you want to delete this math note? This cannot be undone.")) return;

    const updatedSubjects = db.subjects.map((s) => {
      if (s.id === activeSubject.id) {
        return {
          ...s,
          notes: (s.notes || []).filter((n) => n.id !== noteId)
        };
      }
      return s;
    });

    onUpdateDb({ ...db, subjects: updatedSubjects });
    if (selectedNoteId === noteId) {
      setSelectedNoteId(updatedSubjects.find((s) => s.id === activeSubject.id)?.notes[0]?.id || "");
    }
  };

  // Save Note manually or via autosave
  const handleSaveNote = () => {
    if (!activeNote) return;
    setAutosaveStatus("saving");

    const tagsArray = noteTags.split(",").map((t) => t.trim()).filter(Boolean);

    const updatedSubjects = db.subjects.map((s) => {
      if (s.id === activeSubject.id) {
        return {
          ...s,
          notes: (s.notes || []).map((n) => {
            if (n.id === activeNote.id) {
              return {
                ...n,
                name: noteTitle.trim() || "Untitled Note",
                content: noteContent,
                chapterId: noteChapterId,
                tags: tagsArray,
                updatedAt: new Date().toISOString(),
                versionHistory: [
                  { date: new Date().toISOString(), content: noteContent },
                  ...(n.versionHistory || [])
                ].slice(0, 5) // keep last 5 revisions
              };
            }
            return n;
          })
        };
      }
      return s;
    });

    onUpdateDb({ ...db, subjects: updatedSubjects });
    setAutosaveStatus("saved");
  };

  // LaTeX & Markdown parser
  const renderMathContent = (content: string) => {
    if (!content) return <span className="text-zinc-400 italic">No note content yet. Write something!</span>;

    // Split text by block math $$ first
    const blockParts = content.split(/(\$\$.*?\$\$)/gs);

    return blockParts.map((part, idx) => {
      if (part.startsWith("$$") && part.endsWith("$$")) {
        const math = part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(math, { displayMode: true, throwOnError: false });
          return (
            <div 
              key={idx} 
              className="my-4 p-4 overflow-x-auto bg-zinc-50 dark:bg-zinc-900/30 rounded-xl border border-zinc-150 dark:border-white/5 shadow-inner" 
              dangerouslySetInnerHTML={{ __html: html }} 
            />
          );
        } catch (e) {
          return <div key={idx} className="text-red-500 font-mono text-xs my-2">LaTeX Error: {part}</div>;
        }
      } else {
        // Split by inline math $
        const inlineParts = part.split(/(\$.*?\$)/g);
        return (
          <span key={idx}>
            {inlineParts.map((subPart, sIdx) => {
              if (subPart.startsWith("$") && subPart.endsWith("$")) {
                const math = subPart.slice(1, -1).trim();
                try {
                  const html = katex.renderToString(math, { displayMode: false, throwOnError: false });
                  return (
                    <span 
                      key={sIdx} 
                      className="inline-block px-1 bg-zinc-100 dark:bg-white/5 rounded text-zinc-900 dark:text-amber-400 font-medium py-0.5 my-0.5 shadow-sm" 
                      dangerouslySetInnerHTML={{ __html: html }} 
                    />
                  );
                } catch (e) {
                  return <span key={sIdx} className="text-red-500 font-mono text-xs bg-red-500/10 px-1 rounded">{subPart}</span>;
                }
              }
              
              // Simple formatting for lines and headers
              const lines = subPart.split("\n");
              return lines.map((line, lIdx) => {
                const nextLine = lIdx < lines.length - 1 ? <br /> : null;
                
                // Bullet point parsing
                if (line.trim().startsWith("* ")) {
                  return (
                    <span key={lIdx} className="block pl-4 py-0.5 text-zinc-650 dark:text-zinc-300">
                      • {line.trim().slice(2)}
                      {nextLine}
                    </span>
                  );
                }

                // Header 3 parsing
                if (line.trim().startsWith("### ")) {
                  return (
                    <span key={lIdx} className="block text-sm font-bold text-zinc-950 dark:text-white mt-4 mb-2">
                      {line.trim().slice(4)}
                      {nextLine}
                    </span>
                  );
                }

                // Header 2 parsing
                if (line.trim().startsWith("## ")) {
                  return (
                    <span key={lIdx} className="block text-base font-extrabold text-zinc-950 dark:text-white mt-5 mb-3 border-b border-zinc-200 dark:border-white/10 pb-1">
                      {line.trim().slice(3)}
                      {nextLine}
                    </span>
                  );
                }

                return (
                  <span key={lIdx} className="text-zinc-700 dark:text-zinc-350 leading-relaxed">
                    {line}
                    {nextLine}
                  </span>
                );
              });
            })}
          </span>
        );
      }
    });
  };

  // Smart symbol search matching logic
  const filteredSymbols = MATH_SYMBOLS.filter((symbol) => {
    if (!searchSymbol.trim()) {
      if (activeCategory === "All") return true;
      return symbol.category === activeCategory;
    }
    const query = searchSymbol.toLowerCase();
    return (
      symbol.name.toLowerCase().includes(query) ||
      symbol.latex.toLowerCase().includes(query) ||
      symbol.keywords.some((k) => k.toLowerCase().includes(query))
    );
  });

  // Automatically extract word being typed to suggest matching symbols in real-time
  const getInlineSuggestions = () => {
    if (!noteContent) return [];
    
    // Get last word or backslash command
    const textarea = textareaRef.current;
    if (!textarea) return [];

    const cursor = textarea.selectionStart;
    const textBeforeCursor = noteContent.substring(0, cursor);
    const words = textBeforeCursor.trim().split(/[\s$]+/);
    const lastWord = words[words.length - 1] || "";

    if (!lastWord || lastWord.length < 2) return [];

    // Clean trigger prefix like backslash
    const cleanWord = lastWord.startsWith("\\") ? lastWord.slice(1) : lastWord;

    if (!cleanWord || cleanWord.length < 2) return [];

    // Filter symbols based on the word being typed
    return MATH_SYMBOLS.filter((sym) => {
      return (
        sym.name.toLowerCase().includes(cleanWord.toLowerCase()) ||
        sym.keywords.some((kw) => kw.toLowerCase() === cleanWord.toLowerCase())
      );
    }).slice(0, 4); // Limit to 4 suggestions
  };

  const inlineSuggestions = getInlineSuggestions();

  // Categories list
  const categories = ["All", "Greek", "Calculus", "Algebra", "Relations", "Vectors", "Chemistry", "Physics", "Formulas"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[500px]" id="math-notes-module">
      
      {/* 1. Left Sidebar: Notes Navigator & Quick Create */}
      <div className="lg:col-span-1 border border-zinc-200 dark:border-white/10 rounded-[20px] bg-white dark:bg-[#0F1115]/50 backdrop-blur-md p-4 flex flex-col gap-4 shadow-sm h-full max-h-[650px] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-400 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText size={14} className="text-blue-500" />
            Subject Notes ({notes.length})
          </h3>
          <button 
            onClick={handleCreateNote}
            className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm flex items-center justify-center cursor-pointer active:scale-95"
            title="Create new notes sheet"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Notes list */}
        <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[500px]">
          {notes.length === 0 ? (
            <div className="text-center p-6 text-zinc-400 italic text-xs">
              No notes taken yet. Press the (+) button above to start your first math study note sheet!
            </div>
          ) : (
            notes.map((note) => {
              const matchedChap = activeSubject.chapters.find((c) => c.id === note.chapterId);
              return (
                <div 
                  key={note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex justify-between items-start group ${
                    selectedNoteId === note.id 
                      ? "bg-zinc-100 dark:bg-white/5 border-zinc-250 dark:border-white/10 shadow-sm" 
                      : "bg-transparent border-transparent hover:bg-zinc-50 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="text-xs font-bold truncate text-zinc-900 dark:text-white flex items-center gap-1.5">
                      {note.name || "Untitled Notes"}
                    </h4>
                    {matchedChap && (
                      <span className="text-[10px] text-blue-500 dark:text-blue-400 font-semibold block mt-0.5 truncate">
                        📖 {matchedChap.name}
                      </span>
                    )}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {note.tags?.slice(0, 2).map((t, index) => (
                        <span key={index} className="text-[9px] px-1.5 py-0.2 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 rounded-full text-zinc-500">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note.id);
                    }}
                    className="p-1 rounded text-zinc-400 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete notes page"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Main Area: Split Screen live editor and preview */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        {activeNote ? (
          <div className="flex flex-col gap-4">
            
            {/* Note Metadata Header */}
            <div className="p-4 rounded-[20px] border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0F1115]/50 backdrop-blur-md flex flex-wrap gap-4 items-end justify-between shadow-sm">
              <div className="flex-1 min-w-[200px] flex flex-col gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Notes Sheet Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Kinematics Key Derivatives & Integrals"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="w-full text-xs font-bold p-2.5 rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Associate Chapter</label>
                    <select
                      value={noteChapterId}
                      onChange={(e) => setNoteChapterId(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                    >
                      <option value="">No Associated Chapter</option>
                      {activeSubject.chapters.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Custom Tags (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Organic, Formula sheet, High Weightage"
                      value={noteTags}
                      onChange={(e) => setNoteTags(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Save indicators and toggle views */}
              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                <div className="flex items-center gap-1.5 text-[11px] font-mono">
                  {autosaveStatus === "saved" && (
                    <span className="text-emerald-500 font-bold flex items-center gap-1">
                      <Check size={12} /> Autosaved
                    </span>
                  )}
                  {autosaveStatus === "saving" && (
                    <span className="text-amber-500 font-bold animate-pulse">
                      Saving...
                    </span>
                  )}
                  {autosaveStatus === "unsaved" && (
                    <span className="text-zinc-400">
                      Unsaved changes
                    </span>
                  )}
                </div>

                <div className="flex bg-zinc-100 dark:bg-white/5 p-1 rounded-xl border border-zinc-200 dark:border-white/10">
                  <button
                    onClick={() => setEditorMode("split")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${editorMode === "split" ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500"}`}
                  >
                    Split View
                  </button>
                  <button
                    onClick={() => setEditorMode("write")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${editorMode === "write" ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500"}`}
                  >
                    Write
                  </button>
                  <button
                    onClick={() => setEditorMode("preview")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${editorMode === "preview" ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500"}`}
                  >
                    Preview
                  </button>
                </div>

                <button
                  onClick={handleSaveNote}
                  className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Save size={13} />
                  Save Note
                </button>
              </div>
            </div>

            {/* Smart Symbol Search Bar panel */}
            <div className="p-4 rounded-[20px] border border-blue-500/10 dark:border-white/5 bg-blue-500/5 dark:bg-[#0F1115]/30 backdrop-blur-md shadow-sm">
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3.5 top-3.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="🔍 Smart Symbol Search... (e.g. type 'integral', 'alpha', 'naoh', 'summation', 'quadratic')"
                    value={searchSymbol}
                    onChange={(e) => setSearchSymbol(e.target.value)}
                    className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {searchSymbol && (
                    <button 
                      onClick={() => setSearchSymbol("")}
                      className="absolute right-3.5 top-3.5 text-xs font-bold text-zinc-400 hover:text-zinc-600"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Keyboard Collapsible Button */}
                <button
                  onClick={() => setKeyboardOpen(!keyboardOpen)}
                  className={`px-4 py-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    keyboardOpen 
                      ? "bg-zinc-100 dark:bg-white/5 text-blue-500 border-zinc-200 dark:border-white/10" 
                      : "bg-white dark:bg-zinc-950 text-zinc-500 border-zinc-200 dark:border-white/10"
                  }`}
                >
                  <Keyboard size={14} />
                  {keyboardOpen ? "Hide Math Keys" : "Show Math Keys"}
                </button>
              </div>

              {/* Categorized symbol lists or Search Results */}
              {keyboardOpen && (
                <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-white/5 flex flex-col gap-3">
                  {/* Category Pill rail (Only when not searching) */}
                  {!searchSymbol.trim() && (
                    <div className="flex gap-1 overflow-x-auto pb-1.5 scrollbar-thin">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                            activeCategory === cat 
                              ? "bg-blue-600 text-white shadow-sm" 
                              : "bg-zinc-100 dark:bg-white/5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Symbols Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-[160px] overflow-y-auto pr-1">
                    {filteredSymbols.length === 0 ? (
                      <div className="col-span-full text-center py-4 text-xs text-zinc-400">
                        No math symbols matching "{searchSymbol}" found. Try "integral", "alpha", "delta", "Na", etc.
                      </div>
                    ) : (
                      filteredSymbols.map((sym, idx) => (
                        <button
                          key={idx}
                          onClick={() => insertLatex(sym.latex)}
                          className="p-2 rounded-xl border border-zinc-150 dark:border-white/5 bg-white dark:bg-zinc-900/50 hover:bg-blue-50 dark:hover:bg-blue-600/10 hover:border-blue-300 dark:hover:border-blue-500/30 text-left transition-all cursor-pointer flex flex-col justify-between h-[54px] active:scale-95"
                          title={`Insert ${sym.name} (${sym.latex})`}
                        >
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold truncate leading-none mb-1">
                            {sym.name}
                          </span>
                          <span className="text-xs font-mono font-extrabold text-zinc-800 dark:text-amber-400 flex items-center justify-between">
                            <span>{sym.display}</span>
                            <span className="text-[8px] font-mono text-zinc-400 px-1 rounded bg-zinc-50 dark:bg-zinc-800 shrink-0">
                              {sym.latex.startsWith("\\") ? sym.latex : "text"}
                            </span>
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* SPLIT / WRITE / PREVIEW EDITOR PANEL */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[500px]">
              
              {/* Writer Panel */}
              {(editorMode === "split" || editorMode === "write") && (
                <div className="flex flex-col border border-zinc-200 dark:border-white/10 rounded-[20px] bg-white dark:bg-[#0F1115]/50 backdrop-blur-md p-4 shadow-sm h-full relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                      LaTeX Markdown Notes Editor
                    </span>
                    <span className="text-[10px] text-zinc-500 font-semibold font-mono">
                      Characters: {noteContent.length}
                    </span>
                  </div>

                  <textarea
                    ref={textareaRef}
                    placeholder="Type notes here... Use single $ ... $ for inline math and double $$ ... $$ for block equations. e.g. $v = u + at$"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="flex-1 w-full text-xs font-mono p-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white resize-none focus:outline-none focus:ring-1 focus:ring-blue-500/50 leading-relaxed overflow-y-auto"
                  />

                  {/* Smart Inline Symbol Typing Autocomplete Bar */}
                  {inlineSuggestions.length > 0 && (
                    <div className="absolute bottom-6 left-6 right-6 p-2 rounded-xl border border-amber-500/20 bg-amber-500/10 backdrop-blur-md shadow-lg flex flex-col gap-1.5 z-10">
                      <div className="flex items-center justify-between text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                        <span className="flex items-center gap-1">
                          <Sparkles size={11} className="animate-spin-once" />
                          Smart Suggestion
                        </span>
                        <span>Click to Quick-Insert</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {inlineSuggestions.map((sym, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              // Delete the typed word triggering autocomplete and insert latex
                              const textarea = textareaRef.current;
                              if (!textarea) return;
                              const cursor = textarea.selectionStart;
                              const textBeforeCursor = noteContent.substring(0, cursor);
                              const words = textBeforeCursor.trim().split(/[\s$]+/);
                              const lastWord = words[words.length - 1] || "";
                              
                              const before = noteContent.substring(0, cursor - lastWord.length);
                              const after = noteContent.substring(cursor);
                              setNoteContent(before + sym.latex + " " + after);
                              
                              // Refocus
                              setTimeout(() => {
                                textarea.focus();
                                textarea.selectionStart = textarea.selectionEnd = before.length + sym.latex.length + 1;
                              }, 50);
                            }}
                            className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white border border-amber-500/20 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>{sym.name} ({sym.display})</span>
                            <ArrowRight size={10} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* KaTeX Live Rendered Preview Panel */}
              {(editorMode === "split" || editorMode === "preview") && (
                <div className="flex flex-col border border-zinc-200 dark:border-white/10 rounded-[20px] bg-white dark:bg-[#0F1115]/50 backdrop-blur-md p-4 shadow-sm h-full overflow-y-auto">
                  <div className="flex items-center justify-between mb-3 border-b border-zinc-100 dark:border-white/5 pb-2">
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles size={13} />
                      KaTeX Math Equations Live Output
                    </span>
                    <span className="text-[9px] uppercase font-bold text-zinc-400 bg-zinc-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                      Math-OS Renderer
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto text-left px-1 space-y-2 markdown-body text-zinc-800 dark:text-zinc-200">
                    <h2 className="text-lg font-black text-zinc-950 dark:text-white leading-tight">
                      {noteTitle || <span className="text-zinc-400 italic">Untitled Note</span>}
                    </h2>
                    
                    {noteChapterId && (
                      <div className="flex items-center gap-1.5 text-xs text-blue-500 dark:text-blue-400 font-bold mb-3">
                        <span>📖 Associated Chapter:</span>
                        <span className="underline">
                          {activeSubject.chapters.find((c) => c.id === noteChapterId)?.name || "Self Study"}
                        </span>
                      </div>
                    )}

                    <div className="pt-2">
                      {renderMathContent(noteContent)}
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        ) : (
          <div className="p-12 text-center border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0F1115]/30 rounded-[24px] text-zinc-400 italic">
            No notes taken yet. Press the (+) button on the left panel to take your first syllabus note sheet with LaTeX support!
          </div>
        )}
      </div>

    </div>
  );
}
