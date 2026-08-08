import React, { useState, useRef, useEffect } from "react";
import { solveSetProblem } from "./SetTheorySolver";import VennDiagram, { getRegionRevealOrder } from "./VennDiagram";

// ============================================================================
// SetTheoryExplorer.jsx
// The page for the Set Theory / Venn Diagram tool on Nairafame Academy.
// Matches the same shape as your other Explorer pages (Quadratic, Linear):
//   1. Student enters a problem — either through a guided form of named
//      values, or by pasting a full word problem for the AI to parse.
//   2. solveSetProblem() (setTheorySolver.js) does 100% of the actual math,
//      client-side, no network call.
//   3. The result renders as a Venn diagram, revealed all-at-once (Formula
//      Method) or region-by-region (Region Method).
//   4. A scoped AI tutor chat (set-theory-chat backend route) explains the
//      already-solved numbers and can highlight regions on request.
//
// Only two things touch the network: POST /api/ai/set-theory-parse (word
// problem -> structured values) and POST /api/ai/set-theory-chat (tutor
// chat). Adjust the fetch paths below if your app mounts routes/ai.js
// somewhere other than /api/ai.
// ============================================================================

const COLORS = {
  ink: "#0a0a0a",
  inkSoft: "#555555",
  rule: "#1a237e",
  ruleSoft: "#E8EAF6",
  work: "#2e7d32",
  workSoft: "#E8F5E9",
  remember: "#ff6f00",
  rememberSoft: "#FFF3E0",
  border: "#d7dae8",
  bg: "#FAFAFC",
  danger: "#c62828",
  dangerSoft: "#FDECEA",
};

const FONT_HEADING = "'Space Grotesk', sans-serif";
const FONT_BODY = "'Inter', -apple-system, sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";

const API_BASE = "https://eduplatform-api-pol1.onrender.com/api/ai";

// ---------------------------------------------------------------------------
// Field metadata for the guided form — one entry per namedValues key the
// solver understands (see NAMED_CLUE_EXPRESSIONS_2/3 in setTheorySolver.js).
// `sets` controls which fields show for 2-set vs 3-set problems.
// ---------------------------------------------------------------------------

const GUIDED_FIELDS = [
  { key: "universal", label: "Total (Universal set)", sets: [2, 3] },
  { key: "nA", label: (l) => `Total in ${l.A}`, sets: [2, 3] },
  { key: "nB", label: (l) => `Total in ${l.B}`, sets: [2, 3] },
  { key: "nC", label: (l) => `Total in ${l.C}`, sets: [3] },
  { key: "nAB", label: (l) => `In both ${l.A} and ${l.B}`, sets: [2, 3] },
  { key: "nAC", label: (l) => `In both ${l.A} and ${l.C}`, sets: [3] },
  { key: "nBC", label: (l) => `In both ${l.B} and ${l.C}`, sets: [3] },
  { key: "nABC", label: (l) => `In all three: ${l.A}, ${l.B}, ${l.C}`, sets: [3] },
  { key: "nAOnly", label: (l) => `Only ${l.A}`, sets: [2, 3] },
  { key: "nBOnly", label: (l) => `Only ${l.B}`, sets: [2, 3] },
  { key: "nCOnly", label: (l) => `Only ${l.C}`, sets: [3] },
  { key: "nNone", label: "None of the sets", sets: [2, 3] },
  { key: "nUnion", label: "Union (in at least one)", sets: [2, 3] },
];

function fieldLabel(field, setLabels) {
  return typeof field.label === "function" ? field.label(setLabels) : field.label;
}

function findExprOptions(numSets, setLabels) {
  const l = setLabels;
  if (numSets === 2) {
    return [
      { label: `Only ${l.A}`, expr: "A∩B'" },
      { label: `Only ${l.B}`, expr: "B∩A'" },
      { label: `Both ${l.A} and ${l.B}`, expr: "A∩B" },
      { label: `${l.A} or ${l.B} (union)`, expr: "A∪B" },
      { label: "Neither", expr: "A'∩B'" },
    ];
  }
  return [
    { label: `Only ${l.A}`, expr: "A∩B'∩C'" },
    { label: `Only ${l.B}`, expr: "B∩A'∩C'" },
    { label: `Only ${l.C}`, expr: "C∩A'∩B'" },
    { label: "All three", expr: "A∩B∩C" },
    { label: "Exactly two", expr: "(A∩B∩C')∪(A∩C∩B')∪(B∩C∩A')" },
    { label: "Any one or more (union)", expr: "A∪B∪C" },
    { label: "None of the three", expr: "A'∩B'∩C'" },
  ];
}

const DEFAULT_LABELS_2 = { A: "A", B: "B" };
const DEFAULT_LABELS_3 = { A: "A", B: "B", C: "C" };

// ---------------------------------------------------------------------------
// Small UI primitives, kept local so this file drops in with zero new deps
// ---------------------------------------------------------------------------

function SegmentedControl({ options, value, onChange }) {
  return (
    <div
      style={{
        display: "inline-flex",
        border: `1.5px solid ${COLORS.rule}`,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {options.map((opt, i) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            padding: "8px 16px",
            fontFamily: FONT_HEADING,
            fontWeight: 700,
            fontSize: 14,
            border: "none",
            borderLeft: i === 0 ? "none" : `1.5px solid ${COLORS.rule}`,
            background: value === opt.value ? COLORS.rule : "#fff",
            color: value === opt.value ? "#fff" : COLORS.rule,
            cursor: "pointer",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function TextField({ label, value, onChange, placeholder }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLORS.inkSoft }}>{label}</span>
      <input
        type="text"
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          fontFamily: FONT_MONO,
          fontSize: 15,
          padding: "8px 10px",
          border: `1.5px solid ${COLORS.border}`,
          borderRadius: 6,
          outline: "none",
        }}
        onFocus={(e) => (e.target.style.borderColor = COLORS.rule)}
        onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
      />
    </label>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function SetTheoryExplorer() {
  const [numSets, setNumSets] = useState(2);
  const [inputMode, setInputMode] = useState("guided"); // "guided" | "word"
  const [method, setMethod] = useState("formula"); // "formula" | "region"

  const [setLabels, setSetLabels] = useState(DEFAULT_LABELS_2);
  const [namedValues, setNamedValues] = useState({});
  const [findExpr, setFindExpr] = useState("");

  const [wordProblemText, setWordProblemText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState(null);

  const [solved, setSolved] = useState(null); // result of solveSetProblem()
  const [solveError, setSolveError] = useState(null);
  const [revealedIds, setRevealedIds] = useState([]); // Region Method progressive reveal

  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHighlightIds, setChatHighlightIds] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, chatLoading]);

  // Reset dependent state whenever the set count changes, so a 3-set
  // namedValues object can't accidentally get sent through as a 2-set
  // problem (or vice versa) with stale nC/nAC/etc. fields.
  function handleNumSetsChange(n) {
    setNumSets(n);
    setSetLabels(n === 2 ? DEFAULT_LABELS_2 : DEFAULT_LABELS_3);
    setNamedValues({});
    setFindExpr("");
    setSolved(null);
    setSolveError(null);
    setRevealedIds([]);
    setChatHistory([]);
    setChatHighlightIds([]);
  }

  function updateNamedValue(key, value) {
    setNamedValues((prev) => ({ ...prev, [key]: value }));
  }

  function updateSetLabel(letter, value) {
    setSetLabels((prev) => ({ ...prev, [letter]: value || letter }));
  }

  // ---- Word problem parsing (AI, backend) ---------------------------------

  async function handleParse() {
    if (!wordProblemText.trim()) return;
    setParsing(true);
    setParseError(null);
    try {
      const res = await fetch(`${API_BASE}/set-theory-parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: wordProblemText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not parse that problem.");

      setNumSets(data.numSets);
      const labels =
        data.numSets === 2
          ? { A: data.setLabels?.A || "A", B: data.setLabels?.B || "B" }
          : {
              A: data.setLabels?.A || "A",
              B: data.setLabels?.B || "B",
              C: data.setLabels?.C || "C",
            };
      setSetLabels(labels);
      setNamedValues(data.namedValues || {});
      setFindExpr(data.findExpr || "");
      setSolved(null);
      setSolveError(null);
      setRevealedIds([]);
      // Switch to guided view so the student can see/edit what the AI
      // extracted before solving — never solve silently off a raw parse.
      setInputMode("guided");
    } catch (err) {
      setParseError(err.message || "Something went wrong parsing that problem.");
    } finally {
      setParsing(false);
    }
  }

  // ---- Solve (client-side, deterministic) ---------------------------------

  function handleSolve() {
    const result = solveSetProblem({ numSets, namedValues, findExpr: findExpr || null });
    if (!result.success) {
      setSolveError(result.error);
      setSolved(result); // may still carry partial regions/unresolved info
      return;
    }
    setSolveError(null);
    setSolved(result);
    setChatHistory([]);
    setChatHighlightIds([]);
    setRevealedIds(method === "region" ? [] : null); // null = reveal all (Formula Method)
  }

  function handleRevealNext() {
    if (!solved) return;
    const order = getRegionRevealOrder(numSets);
    const next = order.find((id) => !revealedIds.includes(id));
    if (next) setRevealedIds((prev) => [...prev, next]);
  }

  function handleMethodChange(m) {
    setMethod(m);
    if (solved?.success) {
      setRevealedIds(m === "region" ? [] : null);
    }
  }

  // ---- Chat (AI tutor, backend) -------------------------------------------

  function buildSolvedDataForChat() {
    return {
      numSets,
      setLabels,
      universalValue: namedValues.universal ?? null,
      regions: solved.regions,
      derived: solved.derived,
      unknowns: solved.unknowns,
      target: solved.target,
      method,
    };
  }

  async function handleSendChat() {
    const question = chatInput.trim();
    if (!question || !solved?.success || chatLoading) return;

    const nextHistory = [...chatHistory, { role: "user", content: question }];
    setChatHistory(nextHistory);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch(`${API_BASE}/set-theory-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          solvedData: buildSolvedDataForChat(),
          history: chatHistory,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "The tutor couldn't respond just now.");

      setChatHistory([...nextHistory, { role: "assistant", content: data.reply }]);

      const highlightIds = (data.actions || [])
        .filter((a) => a.type === "highlight_region" && a.regionId)
        .map((a) => a.regionId);
      if (highlightIds.length > 0) setChatHighlightIds(highlightIds);
    } catch (err) {
      setChatHistory([
        ...nextHistory,
        { role: "assistant", content: `⚠️ ${err.message || "Something went wrong."}` },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  // ---- Derived view state ---------------------------------------------------

  const visibleFields = GUIDED_FIELDS.filter((f) => f.sets.includes(numSets));
  const setLetters = numSets === 2 ? ["A", "B"] : ["A", "B", "C"];
  const canSolve = Object.values(namedValues).some((v) => v !== "" && v !== null && v !== undefined);
  const revealOrder = solved?.success ? getRegionRevealOrder(numSets) : [];
  const allRevealed = revealedIds !== null && revealedIds.length >= revealOrder.length;

  return (
    <div
      style={{
        fontFamily: FONT_BODY,
        color: COLORS.ink,
        background: COLORS.bg,
        minHeight: "100%",
        padding: "24px 16px 64px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@600;700&display=swap');
      `}</style>

      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        {/* ---- Header ---- */}
        <h1
          style={{
            fontFamily: FONT_HEADING,
            fontWeight: 700,
            fontSize: 28,
            margin: "0 0 4px",
            color: COLORS.rule,
          }}
        >
          Set Theory Explorer
        </h1>
        <p style={{ margin: "0 0 24px", color: COLORS.inkSoft, fontSize: 15 }}>
          Solve Venn diagram problems two ways, and get every region explained.
        </p>

        {/* ---- Set count + method ---- */}
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 20 }}>
          <div>
            <div style={sectionLabelStyle}>Number of sets</div>
            <SegmentedControl
              value={numSets}
              onChange={handleNumSetsChange}
              options={[
                { value: 2, label: "2 Sets" },
                { value: 3, label: "3 Sets" },
              ]}
            />
          </div>
          <div>
            <div style={sectionLabelStyle}>Solving method</div>
            <SegmentedControl
              value={method}
              onChange={handleMethodChange}
              options={[
                { value: "formula", label: "Formula Method" },
                { value: "region", label: "Region Method" },
              ]}
            />
          </div>
        </div>

        {/* ---- Input mode ---- */}
        <div style={{ marginBottom: 12 }}>
          <div style={sectionLabelStyle}>How do you want to enter the problem?</div>
          <SegmentedControl
            value={inputMode}
            onChange={setInputMode}
            options={[
              { value: "guided", label: "Guided Form" },
              { value: "word", label: "Word Problem" },
            ]}
          />
        </div>

        {/* ---- Word problem panel ---- */}
        {inputMode === "word" && (
          <div style={cardStyle}>
            <div style={sectionLabelStyle}>Paste the full question</div>
            <textarea
              value={wordProblemText}
              onChange={(e) => setWordProblemText(e.target.value)}
              placeholder="e.g. In a class of 80 students, 65 offer Economics and 50 offer Geography. If every student offers at least one subject, how many offer both?"
              rows={4}
              style={{
                width: "100%",
                fontFamily: FONT_BODY,
                fontSize: 14,
                padding: 10,
                border: `1.5px solid ${COLORS.border}`,
                borderRadius: 6,
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
              <button
                onClick={handleParse}
                disabled={parsing || !wordProblemText.trim()}
                style={primaryButtonStyle(parsing || !wordProblemText.trim())}
              >
                {parsing ? "Reading the problem…" : "Extract the values"}
              </button>
              {parseError && <span style={{ color: COLORS.danger, fontSize: 13 }}>{parseError}</span>}
            </div>
            <p style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 8, marginBottom: 0 }}>
              This only reads the numbers out of your question — it never does the actual math.
              You'll see everything it found below and can fix anything before solving.
            </p>
          </div>
        )}

        {/* ---- Guided form ---- */}
        {inputMode === "guided" && (
          <div style={cardStyle}>
            <div style={sectionLabelStyle}>Set names (optional)</div>
            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              {setLetters.map((letter) => (
                <div key={letter} style={{ width: 160 }}>
                  <TextField
                    label={`Set ${letter}`}
                    value={setLabels[letter]}
                    onChange={(v) => updateSetLabel(letter, v)}
                    placeholder={letter}
                  />
                </div>
              ))}
            </div>

            <div style={sectionLabelStyle}>What the problem tells you</div>
            <p style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: -4, marginBottom: 10 }}>
              Fill in only what the question actually gives you. Leave the rest blank. You can type
              a number, or an unknown like <code>x</code> / <code>2x</code> if the problem ties two
              values together algebraically.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
              {visibleFields.map((f) => (
                <TextField
                  key={f.key}
                  label={fieldLabel(f, setLabels)}
                  value={namedValues[f.key]}
                  onChange={(v) => updateNamedValue(f.key, v)}
                  placeholder="—"
                />
              ))}
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={sectionLabelStyle}>What are you solving for? (optional)</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {findExprOptions(numSets, setLabels).map((opt) => (
                  <button
                    key={opt.expr}
                    onClick={() => setFindExpr(opt.expr)}
                    style={{
                      padding: "6px 12px",
                      fontSize: 13,
                      fontFamily: FONT_BODY,
                      borderRadius: 20,
                      border: `1.5px solid ${findExpr === opt.expr ? COLORS.remember : COLORS.border}`,
                      background: findExpr === opt.expr ? COLORS.rememberSoft : "#fff",
                      color: findExpr === opt.expr ? COLORS.remember : COLORS.ink,
                      cursor: "pointer",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <button onClick={handleSolve} disabled={!canSolve} style={primaryButtonStyle(!canSolve)}>
                Solve
              </button>
              {solveError && (
                <div style={{ ...errorBoxStyle, marginTop: 10 }}>{solveError}</div>
              )}
            </div>
          </div>
        )}

        {/* ---- Result: diagram + region method controls ---- */}
        {solved?.success && (
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
              <div style={sectionLabelStyle}>Venn diagram</div>
              {method === "region" && !allRevealed && (
                <button onClick={handleRevealNext} style={secondaryButtonStyle}>
                  Reveal next region →
                </button>
              )}
            </div>

            <VennDiagram
              numSets={numSets}
              regionList={solved.regionList}
              setLabels={setLabels}
              universalValue={namedValues.universal ? Number(namedValues.universal) : solved.derived?.universal ?? null}
              visibleRegionIds={method === "region" ? revealedIds : null}
              highlightRegionIds={chatHighlightIds}
            />

            {solved.target && (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 14px",
                  background: COLORS.workSoft,
                  border: `1.5px solid ${COLORS.work}`,
                  borderRadius: 8,
                  fontFamily: FONT_MONO,
                  fontSize: 14,
                  color: COLORS.work,
                }}
              >
                Answer — {solved.target.expr} = <strong>{solved.target.value}</strong>
              </div>
            )}
          </div>
        )}

        {solved && !solved.success && solved.error && (
          <div style={{ ...errorBoxStyle, marginTop: 4 }}>{solved.error}</div>
        )}

        {/* ---- Tutor chat ---- */}
        {solved?.success && (
          <div style={cardStyle}>
            <div style={sectionLabelStyle}>Ask the tutor about this problem</div>
            <div
              style={{
                border: `1.5px solid ${COLORS.border}`,
                borderRadius: 8,
                padding: 12,
                maxHeight: 320,
                overflowY: "auto",
                background: "#fff",
                marginBottom: 10,
              }}
            >
              {chatHistory.length === 0 && (
                <p style={{ color: COLORS.inkSoft, fontSize: 13, margin: 0 }}>
                  Ask things like "why is the center region {revealOrder[0] ? revealOrder[0] : "X"}?"
                  or "explain the {method === "formula" ? "formula" : "region"} method step by step".
                </p>
              )}
              {chatHistory.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      maxWidth: "80%",
                      padding: "8px 12px",
                      borderRadius: 10,
                      fontSize: 14,
                      lineHeight: 1.4,
                      whiteSpace: "pre-wrap",
                      background: m.role === "user" ? COLORS.ruleSoft : COLORS.bg,
                      border: `1px solid ${m.role === "user" ? COLORS.rule : COLORS.border}`,
                    }}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ color: COLORS.inkSoft, fontSize: 13, fontStyle: "italic" }}>
                  Tutor is thinking…
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                placeholder="Ask a question about this problem…"
                style={{
                  flex: 1,
                  fontFamily: FONT_BODY,
                  fontSize: 14,
                  padding: "10px 12px",
                  border: `1.5px solid ${COLORS.border}`,
                  borderRadius: 6,
                }}
              />
              <button
                onClick={handleSendChat}
                disabled={chatLoading || !chatInput.trim()}
                style={primaryButtonStyle(chatLoading || !chatInput.trim())}
              >
                Ask
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared inline style objects
// ---------------------------------------------------------------------------

const sectionLabelStyle = {
  fontFamily: FONT_HEADING,
  fontWeight: 700,
  fontSize: 13,
  letterSpacing: 0.3,
  color: COLORS.rule,
  textTransform: "uppercase",
  marginBottom: 8,
};

const cardStyle = {
  background: "#fff",
  border: `1.5px solid ${COLORS.border}`,
  borderRadius: 12,
  padding: 20,
  marginBottom: 20,
};

const errorBoxStyle = {
  background: COLORS.dangerSoft,
  border: `1.5px solid ${COLORS.danger}`,
  color: COLORS.danger,
  borderRadius: 8,
  padding: "10px 14px",
  fontSize: 14,
};

function primaryButtonStyle(disabled) {
  return {
    padding: "10px 20px",
    fontFamily: FONT_HEADING,
    fontWeight: 700,
    fontSize: 14,
    borderRadius: 8,
    border: "none",
    background: disabled ? "#c7cbe0" : COLORS.rule,
    color: "#fff",
    cursor: disabled ? "not-allowed" : "pointer",
  };
}

const secondaryButtonStyle = {
  padding: "6px 14px",
  fontFamily: FONT_HEADING,
  fontWeight: 700,
  fontSize: 13,
  borderRadius: 8,
  border: `1.5px solid ${COLORS.remember}`,
  background: COLORS.rememberSoft,
  color: COLORS.remember,
  cursor: "pointer",
};