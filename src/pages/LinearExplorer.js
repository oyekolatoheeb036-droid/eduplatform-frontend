import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
  RotateCcw,
  Undo2,
  Pin,
  Send,
  MessageCircle,
  CheckCircle2,
  Pencil,
  MousePointerClick,
  ListChecks,
  Eraser,
  Ruler,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

const API = "https://eduplatform-api-pol1.onrender.com";

const COLORS = {
  bg: "#f4f6fb",
  card: "#FFFFFF",
  ink: "#0a0a0a",
  inkSoft: "#555555",
  line: "#f0f0f0",
  rule: "#1a237e",
  ruleSoft: "#E8EAF6",
  work: "#2e7d32",
  workSoft: "#E8F5E9",
  remember: "#ff6f00",
  rememberSoft: "#FFF3E0",
  real: "#1a237e",
  realSoft: "#E8EAF6",
  curve: "#E0623D",
  root: "#E0623D",
  yint: "#2F5FCC",
  paperBg: "#FFFFFF",
  paperMinor: "#F3C3CE",
  paperMajor: "#D63A63",
  paperAxis: "#B01E45",
  aiAction: "#7C4DFF",
  bigPencil: "#E0623D",
};

function round(n, d = 4) {
  const f = Math.pow(10, d);
  return Math.round((n + Number.EPSILON) * f) / f;
}
function fmt(n, d = 2) {
  if (!isFinite(n)) return "—";
  const r = round(n, d);
  return Object.is(r, -0) ? "0" : String(r);
}

function solveLinear(m, b, xStart, xEnd, xStep, yStep) {
  if (m === 0 && b === 0) return { valid: false };

  const yIntercept = b;
  const xIntercept = m !== 0 ? round(-b / m, 4) : null;
  const slopeType = m > 0 ? "Increasing" : m < 0 ? "Decreasing" : "Horizontal";

  const tableData = [];
  for (let x = xStart; x <= xEnd; x++) {
    tableData.push({ x, y: round(m * x + b, 2) });
  }

  // Generate endpoints for the straight line SVG path
  const domX0 = xStart - (xEnd - xStart) * 0.1;
  const domX1 = xEnd + (xEnd - xStart) * 0.1;
  const curve = [
    { x: domX0, y: m * domX0 + b },
    { x: domX1, y: m * domX1 + b },
  ];

  const sampledYs = tableData.map((p) => p.y);
  let realYMin = Math.min(0, ...sampledYs);
  let realYMax = Math.max(0, ...sampledYs);

  const boxesBelow = Math.max(1, Math.ceil((0 - realYMin) / yStep) + 1);
  const boxesAbove = Math.max(1, Math.ceil((realYMax - 0) / yStep) + 1);
  const belowShare = Math.round((boxesBelow / (boxesBelow + boxesAbove)) * 12) || 6;
  const aboveShare = 12 - belowShare;

  const xMin = domX0;
  const xMax = domX1;
  const yMin = -belowShare * yStep;
  const yMax = aboveShare * yStep;

  return {
    valid: true,
    m,
    b,
    yIntercept,
    xIntercept,
    slopeType,
    tableData,
    curve,
    domain: { xMin, xMax, yMin, yMax },
  };
}

async function askNairafameAI(question, solvedData, history) {
  try {
    const res = await axios.post(`${API}/api/ai/linear-chat`, {
      question,
      solvedData,
      history,
    });
    return {
      reply: res.data.reply,
      actions: res.data.actions || [],
    };
  } catch (err) {
    const errMsg = err.response?.data?.error || "Network error. Please try again.";
    return { reply: `Error: ${errMsg}`, actions: [] };
  }
}

const pinnedHeadCellStyle = {
  padding: 8,
  border: "1px solid #f0f0f0",
  background: "#fafafa",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 13,
  textAlign: "center",
  fontFeatureSettings: "'tnum'",
};
const pinnedBodyCellStyle = {
  padding: 8,
  border: "1px solid #f0f0f0",
  fontFamily: "'JetBrains Mono', monospace",
  fontWeight: 700,
  fontSize: 13,
  textAlign: "center",
  color: COLORS.ink,
  fontFeatureSettings: "'tnum'",
};

function PinnedTable({ solved }) {
  return (
    <div className="lx-card" style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Pin size={14} color="#1a237e" />
        <div className="lx-heading-sm">Your Table (Reference)</div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...pinnedHeadCellStyle, fontFamily: "'Space Grotesk', sans-serif" }}>x</th>
              {solved.tableData.map((row, i) => (
                <th key={i} style={pinnedHeadCellStyle}>{row.x}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ ...pinnedBodyCellStyle, fontFamily: "'Space Grotesk', sans-serif" }}>y</td>
              {solved.tableData.map((row, i) => (
                <td key={i} style={pinnedBodyCellStyle}>{fmt(row.y)}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NumInput({ value, onChange, style }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", ...style }}>
      <button
        type="button"
        className="lx-spin-btn"
        style={{ borderRadius: "8px 0 0 8px", borderRight: "none" }}
        onClick={() => { const v = value === "" ? 0 : Number(value); onChange(v - 1); }}
      >−</button>
      <input
        className="lx-num-input"
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        style={{ borderRadius: 0, borderLeft: "none", borderRight: "none", width: 44 }}
      />
      <button
        type="button"
        className="lx-spin-btn"
        style={{ borderRadius: "0 8px 8px 0", borderLeft: "none" }}
        onClick={() => { const v = value === "" ? 0 : Number(value); onChange(v + 1); }}
      >+</button>
    </div>
  );
}

function buildPathD(points, xScale, yScale) {
  if (!points || points.length < 2) return "";
  return points
    .map((p, i) => (i === 0 ? "M" : "L") + " " + xScale(p.x).toFixed(2) + " " + yScale(p.y).toFixed(2))
    .join(" ");
}

function InteractiveGraph({
  solved, xStep, yStep, step, plotState, setPlotState, pushHistory, tool, setTool, graphActions = [],
}) {
  const W = 560, H = 680;
  const PAD = { left: 40, right: 20, top: 20, bottom: 40 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const { xMin, xMax, yMin, yMax } = solved.domain;

  const xScale = (x) => PAD.left + ((x - xMin) / (xMax - xMin)) * plotW;
  const yScale = (y) => PAD.top + (1 - (y - yMin) / (yMax - yMin)) * plotH;
  const xInv = (px) => xMin + ((px - PAD.left) / plotW) * (xMax - xMin);
  const yInv = (py) => yMin + (1 - (py - PAD.top) / plotH) * (yMax - yMin);

  const svgRef = useRef(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const lastDrawPoint = useRef(null);

  const xGrid = [], yGrid = [], minorXGrid = [], minorYGrid = [];
  for (let v = Math.ceil(xMin / xStep) * xStep; v <= xMax + 1e-9; v += xStep) xGrid.push(round(v, 6));
  for (let v = Math.ceil(yMin / yStep) * yStep; v <= yMax + 1e-9; v += yStep) yGrid.push(round(v, 6));

  const minorXStep = xStep / 10;
  for (let v = Math.ceil(xMin / minorXStep) * minorXStep; v <= xMax; v += minorXStep) {
    if (Math.abs((v - xMin) / xStep - Math.floor((v - xMin) / xStep)) > 1e-9) minorXGrid.push(round(v, 6));
  }
  const minorYStep = yStep / 10;
  for (let v = Math.ceil(yMin / minorYStep) * minorYStep; v <= yMax; v += minorYStep) {
    if (Math.abs((v - yMin) / yStep - Math.floor((v - yMin) / yStep)) > 1e-9) minorYGrid.push(round(v, 6));
  }

  const pathD = solved.curve.map((p, i) => (i === 0 ? "M" : "L") + " " + xScale(p.x).toFixed(2) + " " + yScale(p.y).toFixed(2)).join(" ");

  function getSvgPoint(e) {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX; clientY = e.touches[0].clientY;
    } else { clientX = e.clientX; clientY = e.clientY; }
    return { x: xInv(((clientX - rect.left) / rect.width) * W), y: yInv(((clientY - rect.top) / rect.height) * H) };
  }

  function handleClick(e) {
    if (step !== 2 && step !== 3 && step !== 5) return;
    const { x, y } = getSvgPoint(e);

    if (step === 2) {
      const target = solved.tableData.find((t) => Math.abs(t.x - x) <= xStep && Math.abs(t.y - y) <= yStep);
      if (target && !plotState.points.some((p) => p.x === target.x)) {
        pushHistory();
        setPlotState((prev) => ({ ...prev, points: [...prev.points, target] }));
      }
    } else if (step === 3) {
      if (Math.abs(x) <= xStep && Math.abs(solved.yIntercept - y) <= yStep) {
        pushHistory();
        setPlotState((prev) => ({ ...prev, yint: { x: 0, y: solved.yIntercept } }));
      }
    } else if (step === 5) {
      if (solved.xIntercept !== null && Math.abs(solved.xIntercept - x) <= xStep && Math.abs(y) <= yStep) {
        pushHistory();
        setPlotState((prev) => ({ ...prev, xint: { x: solved.xIntercept, y: 0 } }));
      }
    }
  }

  function handleMouseDown(e) {
    if (step !== 4) return;
    setIsMouseDown(true);
    const p = getSvgPoint(e);

    if (tool === "pencil" || tool === "big_pencil") {
      pushHistory();
      lastDrawPoint.current = p;
      const key = tool === "pencil" ? "curve" : "bigCurve";
      setPlotState((prev) => ({ ...prev, [key]: [...prev[key], p] }));
    }
    if (tool === "eraser") pushHistory();
  }

  function handleMouseMove(e) {
    if (!isMouseDown || step !== 4) return;
    const p = getSvgPoint(e);

    if (tool === "pencil") {
      const last = lastDrawPoint.current;
      const minDist = (xMax - xMin) / 200;
      if (!last || Math.hypot(p.x - last.x, p.y - last.y) >= minDist) {
        lastDrawPoint.current = p;
        setPlotState((prev) => ({ ...prev, curve: [...prev.curve, p] }));
      }
    } else if (tool === "big_pencil") {
      const last = lastDrawPoint.current;
      const minDist = (xMax - xMin) / 80;
      if (!last || Math.hypot(p.x - last.x, p.y - last.y) >= minDist) {
        lastDrawPoint.current = p;
        setPlotState((prev) => ({ ...prev, bigCurve: [...prev.bigCurve, p] }));
      }
    } else if (tool === "eraser") {
      const eraserRadius = xStep * 0.8;
      setPlotState((prev) => ({
        ...prev,
        curve: prev.curve.filter((pt) => Math.hypot(pt.x - p.x, pt.y - p.y) > eraserRadius),
        bigCurve: prev.bigCurve.filter((pt) => Math.hypot(pt.x - p.x, pt.y - p.y) > eraserRadius),
      }));
    }
  }

  function handleMouseUp() {
    setIsMouseDown(false);
    lastDrawPoint.current = null;
  }

  const cursorStyle = step === 4 ? (tool === "eraser" ? "cell" : "crosshair") : step === 2 || step === 3 || step === 5 ? "pointer" : "default";

  return (
    <svg
      ref={svgRef}
      viewBox={"0 0 " + W + " " + H}
      style={{
        width: "100%", height: "auto", display: "block", background: COLORS.paperBg,
        cursor: cursorStyle, touchAction: step === 4 ? "none" : "auto",
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
    >
      <rect x={PAD.left} y={PAD.top} width={plotW} height={plotH} fill={COLORS.paperBg} />

      {minorXGrid.map((v) => (<line key={"mgx" + v} x1={xScale(v)} x2={xScale(v)} y1={PAD.top} y2={H - PAD.bottom} stroke={COLORS.paperMinor} strokeWidth="0.5" />))}
      {minorYGrid.map((v) => (<line key={"mgy" + v} x1={PAD.left} x2={W - PAD.right} y1={yScale(v)} y2={yScale(v)} stroke={COLORS.paperMinor} strokeWidth="0.5" />))}
      {xGrid.map((v) => (<line key={"gx" + v} x1={xScale(v)} x2={xScale(v)} y1={PAD.top} y2={H - PAD.bottom} stroke={COLORS.paperMajor} strokeWidth="1" />))}
      {yGrid.map((v) => (<line key={"gy" + v} x1={PAD.left} x2={W - PAD.right} y1={yScale(v)} y2={yScale(v)} stroke={COLORS.paperMajor} strokeWidth="1" />))}

      <rect x={PAD.left} y={PAD.top} width={plotW} height={plotH} fill="none" stroke={COLORS.paperMajor} strokeWidth="1.2" />
      <line x1={PAD.left} x2={W - PAD.right} y1={yScale(0)} y2={yScale(0)} stroke={COLORS.paperAxis} strokeWidth="2" />
      <line x1={xScale(0)} x2={xScale(0)} y1={PAD.top} y2={H - PAD.bottom} stroke={COLORS.paperAxis} strokeWidth="2" />

      {xGrid.filter((v) => Math.abs(v) > 1e-9).map((v) => (
        <text key={"xl" + v} x={xScale(v)} y={yScale(0) + 16} fontSize="10" textAnchor="middle" fill={COLORS.inkSoft} fontFamily="JetBrains Mono, monospace">{fmt(v, 2)}</text>
      ))}
      {yGrid.filter((v) => Math.abs(v) > 1e-9).map((v) => (
        <text key={"yl" + v} x={xScale(0) - 8} y={yScale(v) + 4} fontSize="10" textAnchor="end" fill={COLORS.inkSoft} fontFamily="JetBrains Mono, monospace">{fmt(v, 2)}</text>
      ))}

      {plotState.points.map((p, i) => (
        <circle key={"up" + i} cx={xScale(p.x)} cy={yScale(p.y)} r="4" fill={COLORS.real} stroke="#fff" strokeWidth="1.5" />
      ))}

      {plotState.curve && plotState.curve.length > 1 && (
        <path d={buildPathD(plotState.curve, xScale, yScale)} fill="none" stroke={COLORS.curve} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      )}
      {plotState.bigCurve && plotState.bigCurve.length > 1 && (
        <path d={buildPathD(plotState.bigCurve, xScale, yScale)} fill="none" stroke={COLORS.bigPencil} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      )}

      {step === 8 && (
        <>
          <path d={pathD} fill="none" stroke={COLORS.curve} strokeWidth="3" strokeLinecap="round" />
          <circle cx={xScale(0)} cy={yScale(solved.yIntercept)} r="5" fill={COLORS.yint} stroke="#fff" strokeWidth="1.5" />
          {solved.xIntercept !== null && (
            <circle cx={xScale(solved.xIntercept)} cy={yScale(0)} r="5" fill={COLORS.root} stroke="#fff" strokeWidth="1.5" />
          )}
        </>
      )}

      {plotState.yint && (
        <circle cx={xScale(plotState.yint.x)} cy={yScale(plotState.yint.y)} r="5" fill="none" stroke={COLORS.yint} strokeWidth="2.5" strokeDasharray="4 2" />
      )}
      {plotState.xint && (
        <circle cx={xScale(plotState.xint.x)} cy={yScale(plotState.xint.y)} r="5" fill="none" stroke={COLORS.root} strokeWidth="2.5" strokeDasharray="4 2" />
      )}

      {/* AI Visual Actions (Same as Quadratic) */}
      {graphActions.map((action, i) => {
        if (action.type === "highlight_point") {
          const color = action.color || COLORS.aiAction;
          return (
            <g key={"ai" + i}>
              <circle cx={xScale(action.x)} cy={yScale(action.y)} r="7" fill={color} stroke="#fff" strokeWidth="2" opacity="0.9" />
              {action.label && <text x={xScale(action.x) + 12} y={yScale(action.y) - 12} fontSize="11" fill={color} fontWeight="700" fontFamily="Inter, sans-serif">{action.label}</text>}
            </g>
          );
        }
        if (action.type === "trace_to_axes") {
          const color = action.color || COLORS.aiAction;
          return (
            <g key={"ai" + i}>
              <line x1={xScale(action.x)} y1={yScale(action.y)} x2={xScale(0)} y2={yScale(action.y)} stroke={color} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" />
              <line x1={xScale(action.x)} y1={yScale(action.y)} x2={xScale(action.x)} y2={yScale(0)} stroke={color} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" />
              <circle cx={xScale(action.x)} cy={yScale(0)} r="3" fill={color} opacity="0.5" />
              <circle cx={xScale(0)} cy={yScale(action.y)} r="3" fill={color} opacity="0.5" />
            </g>
          );
        }
        if (action.type === "draw_line") {
          return <line key={"ai" + i} x1={xScale(action.x1)} y1={yScale(action.y1)} x2={xScale(action.x2)} y2={yScale(action.y2)} stroke={action.color || COLORS.aiAction} strokeWidth="2" strokeDasharray={action.style === "dashed" ? "6 3" : "none"} opacity="0.8" />;
        }
        return null;
      })}
    </svg>
  );
}

export default function LinearExplorer() {
  const [m, setM] = useState(2);
  const [b, setB] = useState(-3);
  const [xStart, setXStart] = useState(-3);
  const [xEnd, setXEnd] = useState(3);

  const [xScaleUnit, setXScaleUnit] = useState(1);
  const [yScaleUnit, setYScaleUnit] = useState(1);
  const [scaleApplied, setScaleApplied] = useState(false);

  const [step, setStep] = useState(0);
  const [tableInputs, setTableInputs] = useState({});
  const [plotState, setPlotState] = useState({ points: [], curve: [], bigCurve: [], yint: null, xint: null });
  const [slopeAnswer, setSlopeAnswer] = useState(null);
  const [tool, setTool] = useState("pencil");
  const [readValueInput, setReadValueInput] = useState("");
  const [readValueQuestion, setReadValueQuestion] = useState(null);

  const [history, setHistory] = useState([]);
  const plotStateRef = useRef(plotState);
  useEffect(() => { plotStateRef.current = plotState; }, [plotState]);

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [graphActions, setGraphActions] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const [saveId, setSaveId] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  // NEW: holds the student's existing saves so we can detect a duplicate title
  const [mySaves, setMySaves] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const loadId = params.get("save");
    if (!loadId) return;

    const token = localStorage.getItem("token");
    axios.get(`${API}/api/linear-saves/${loadId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const s = res.data.save;
        setM(Number(s.m)); setB(Number(s.b));
        setXStart(s.x_start); setXEnd(s.x_end);
        setXScaleUnit(s.x_scale_unit); setYScaleUnit(s.y_scale_unit);
        setScaleApplied(true);
        setTableInputs(s.table_inputs || {});
        setPlotState(s.plot_state || { points: [], curve: [], bigCurve: [], yint: null, xint: null });
        setSlopeAnswer(s.slope_answer || null);
        setChatMessages(s.chat_messages || []);
        setGraphActions(s.graph_actions || []);
        setStep(s.step); setSaveId(s.id);
      })
      .catch((err) => console.error("Failed to load save:", err));
  }, [location.search]);

  const pushHistory = useCallback(() => {
    setHistory((h) => [...h, plotStateRef.current]);
  }, []);

  const handleUndo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const previous = h[h.length - 1];
      setPlotState(previous);
      return h.slice(0, -1);
    });
  }, []);

  useEffect(() => {
    function onKeyDown(e) {
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && key === "z" && !e.shiftKey) {
        e.preventDefault(); handleUndo();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleUndo]);

  const mv = m === "" ? 0 : m;
  const bv = b === "" ? 0 : b;

  const solved = useMemo(() => solveLinear(mv, bv, xStart, xEnd, xScaleUnit, yScaleUnit), [mv, bv, xStart, xEnd, xScaleUnit, yScaleUnit]);

  const tableCorrect = useMemo(() => {
    if (!solved.valid) return false;
    return solved.tableData.every((row) => Number(tableInputs[row.x]) === row.y);
  }, [solved, tableInputs]);

  const pointsCorrect = plotState.points.length === solved.tableData.length;
  const yintCorrect = plotState.yint !== null;
  const xintCorrect = plotState.xint !== null || (solved.xIntercept === null);

  const curveTargets = useMemo(() => {
    if (!solved.valid) return [];
    const pts = [...plotState.points];
    if (plotState.yint) pts.push(plotState.yint);
    else pts.push({ x: 0, y: solved.yIntercept });
    return pts;
  }, [plotState.points, plotState.yint, solved.valid, solved.yIntercept]);

  const TOLERANCE_FACTOR = 0.18;
  const curveCoverage = useMemo(() => {
    const allCurvePoints = [...plotState.curve, ...plotState.bigCurve];
    if (!solved.valid || curveTargets.length === 0) return { covered: 0, total: 0 };
    const tolX = xScaleUnit * TOLERANCE_FACTOR;
    const tolY = yScaleUnit * TOLERANCE_FACTOR;
    let covered = 0;
    curveTargets.forEach((pt) => {
      if (allCurvePoints.some((cp) => Math.abs(cp.x - pt.x) <= tolX && Math.abs(cp.y - pt.y) <= tolY)) covered++;
    });
    return { covered, total: curveTargets.length };
  }, [plotState.curve, plotState.bigCurve, curveTargets, xScaleUnit, yScaleUnit, solved.valid]);

  const curveAccurate = solved.valid && curveCoverage.total > 0 && curveCoverage.covered === curveCoverage.total && (plotState.curve.length > 10 || plotState.bigCurve.length > 5);

  const slopeCorrect = slopeAnswer === solved.slopeType;

  useEffect(() => {
    if (step === 6 && solved.tableData.length > 0) {
      const randomRow = solved.tableData[Math.floor(Math.random() * solved.tableData.length)];
      setReadValueQuestion({ x: randomRow.x, y: randomRow.y });
      setReadValueInput("");
    }
  }, [step, solved.tableData]);

  const readValueCorrect = readValueQuestion && Number(readValueInput) === readValueQuestion.y;

  const resetWizard = () => {
    setStep(0); setTableInputs({});
    setPlotState({ points: [], curve: [], bigCurve: [], yint: null, xint: null });
    setHistory([]); setSlopeAnswer(null); setTool("pencil");
    setReadValueInput(""); setReadValueQuestion(null);
    setScaleApplied(false); setChatMessages([]); setChatInput(""); setGraphActions([]);
  };

  const autoSelectScale = () => {
    const xDiff = xEnd - xStart;
    const autoX = xDiff <= 10 ? 1 : xDiff <= 20 ? 2 : 5;
    let yLo = Math.min(0, bv);
    let yHi = Math.max(0, bv);
    for (let i = 0; i <= 40; i++) {
      const x = xStart + ((xEnd - xStart) * i) / 40;
      const y = mv * x + bv;
      yLo = Math.min(yLo, y); yHi = Math.max(yHi, y);
    }
    const ySpan = yHi - yLo || 1;
    const autoY = ySpan <= 12 ? 1 : ySpan <= 24 ? 2 : ySpan <= 60 ? 5 : 10;
    setXScaleUnit(autoX); setYScaleUnit(autoY); setScaleApplied(true);
  };

  const acceptScale = () => setScaleApplied(true);
  const showPinnedTable = tableCorrect && step >= 2 && step <= 7;

  // UPDATED: also fetches the student's existing saves so we can check for a duplicate title
  const openSaveModal = async () => {
    setSaveTitle(saveTitle || `y = ${mv}x ${bv >= 0 ? `+ ${bv}` : `- ${Math.abs(bv)}`}`);
    setShowSaveModal(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/linear-saves`, { headers: { Authorization: `Bearer ${token}` } });
      setMySaves(res.data.saves || []);
    } catch (err) {
      console.error("Failed to load saves list:", err);
    }
  };

  // UPDATED: checks for a same-name save first; overwrite (PUT) or ask to rename
  const handleSaveConfirm = async () => {
    const trimmedTitle = saveTitle.trim();
    if (!trimmedTitle) {
      setSaveMsg("Please enter a name.");
      return;
    }

    // Find any OTHER save (not the one currently open) with the same title
    const duplicate = mySaves.find(
      (s) => s.title.trim().toLowerCase() === trimmedTitle.toLowerCase() && s.id !== saveId
    );

    if (duplicate) {
      const wantsOverwrite = window.confirm(
        `A save named "${trimmedTitle}" already exists. Overwrite it? (Cancel to rename instead)`
      );
      if (!wantsOverwrite) {
        setSaveMsg("Please rename this save and try again.");
        return;
      }
      // Overwrite the EXISTING save's row, and adopt its id going forward
      await saveToId(duplicate.id);
      return;
    }

    // No name conflict — save normally (update if saveId exists, else create new)
    await saveToId(saveId);
  };

  // NEW: does the actual PUT/POST, used by handleSaveConfirm above
  const saveToId = async (idToUse) => {
    setSaving(true); setSaveMsg("");
    const token = localStorage.getItem("token");
    const payload = { title: saveTitle.trim(), m: mv, b: bv, xStart, xEnd, xScaleUnit, yScaleUnit, step, tableInputs, plotState, slopeAnswer, chatMessages, graphActions };
    try {
      if (idToUse) {
        const res = await axios.put(`${API}/api/linear-saves/${idToUse}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        setSaveId(res.data.save.id);
      } else {
        const res = await axios.post(`${API}/api/linear-saves`, payload, { headers: { Authorization: `Bearer ${token}` } });
        setSaveId(res.data.save.id);
      }
      setSaveMsg("Saved!");
      setTimeout(() => { setShowSaveModal(false); setSaveMsg(""); }, 1000);
    } catch (err) {
      setSaveMsg(err.response?.data?.error || "Failed to save. Try again.");
    } finally { setSaving(false); }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setChatInput(""); setChatLoading(true);
    const { reply, actions } = await askNairafameAI(userMsg, solved, chatMessages);
    setChatMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    if (actions && actions.length > 0) {
      setGraphActions((prev) => [...prev, ...actions]);
    }
    setChatLoading(false);
  };

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: COLORS.ink }}>
      <div style={{ padding: "40px 16px" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap');
          .lx-wrap { max-width: 1100px; margin: 0 auto; }
          .lx-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
          @media (min-width: 900px) { .lx-grid { grid-template-columns: 1.2fr 0.8fr; align-items: start; } }
          .lx-input { border: 1.5px solid #f0f0f0; border-radius: 8px; padding: 8px 10px; font-family: 'JetBrains Mono', monospace; font-size: 14px; text-align: center; outline: none; width: 60px; font-feature-settings: 'tnum'; }
          .lx-input:focus { border-color: #1a237e; }
          .lx-num-input { border: 1.5px solid #f0f0f0; padding: 8px 4px; font-family: 'JetBrains Mono', monospace; font-size: 14px; text-align: center; outline: none; width: 44px; height: 38px; font-feature-settings: 'tnum'; }
          .lx-num-input:focus { border-color: #1a237e; }
          .lx-spin-btn { width: 28px; height: 38px; border: 1.5px solid #f0f0f0; background: #fafafa; font-size: 16px; font-weight: 700; color: #555; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0; line-height: 1; font-family: 'Inter', sans-serif; }
          .lx-spin-btn:hover { background: #E8EAF6; color: #1a237e; }
          .lx-spin-btn:active { background: #C5CAE9; }
          .lx-num-input::-webkit-inner-spin-button, .lx-num-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
          .lx-num-input { -moz-appearance: textfield; }
          @media (min-width: 900px) {
            .lx-spin-btn { display: none !important; }
            .lx-num-input { border-radius: 8px !important; width: 64px !important; border-left: 1.5px solid #f0f0f0 !important; border-right: 1.5px solid #f0f0f0 !important; }
            .lx-num-input::-webkit-inner-spin-button, .lx-num-input::-webkit-outer-spin-button { -webkit-appearance: auto; opacity: 1; height: 28px; }
            .lx-num-input { -moz-appearance: auto; }
          }
          .lx-btn { display: flex; align-items: center; justify-content: center; gap: 8px; border: none; border-radius: 8px; padding: 12px 20px; font-size: 16px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 150ms ease; width: 100%; letter-spacing: -0.01em; }
          .lx-btn-primary { background: #1a237e; color: white; }
          .lx-btn-primary:hover { background: #283593; }
          .lx-btn-primary:disabled { background: #D7E5DC; color: #8FA5A0; cursor: not-allowed; }
          .lx-btn-sec { background: white; color: #1a237e; border: 1.5px solid #1a237e; }
          .lx-btn-sec:hover { background: #E8EAF6; }
          .lx-btn-sec:disabled { color: #8FA5A0; border-color: #D7E5DC; cursor: not-allowed; }
          .lx-card { border: 1px solid #f0f0f0; background: white; border-radius: 16px; padding: 24px; box-shadow: 0 8px 24px rgba(0,0,0,0.04); }
          .lx-badge { display: inline-flex; align-items: center; gap: 6px; background: #fff3e0; border: 1px solid #ff6f00; color: #ff6f00; padding: 4px 10px; border-radius: 30px; font-size: 12px; font-weight: 700; margin-bottom: 12px; letter-spacing: 0.02em; }
          .lx-undo-btn { display:flex; align-items:center; gap:6px; border:1px solid #1a237e; background:white; color:#1a237e; border-radius:8px; padding:6px 12px; font-size:12.5px; font-weight:600; cursor:pointer; font-family:'Inter', sans-serif; }
          .lx-undo-btn:disabled { border-color:#D7E5DC; color:#8FA5A0; cursor:not-allowed; }
          .lx-heading { font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 700; margin-bottom: 8px; color: #0a0a0a; letter-spacing: -0.02em; }
          .lx-heading-sm { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; color: #0a0a0a; letter-spacing: -0.01em; }
          .lx-text { font-size: 14px; color: #555; marginBottom: 16; lineHeight: 1.6; }
        `}</style>

        <div className="lx-wrap">
          <div style={{ marginBottom: 32, textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, backgroundColor: "#fff3e0", border: "1px solid #ff6f00", borderRadius: 30, padding: "6px 16px", marginBottom: 16 }}>
              <span>🤖</span>
              <span style={{ color: "#ff6f00", fontWeight: 700, fontSize: 13, fontFamily: "'Inter', sans-serif" }}>Powered by Nairafame AI</span>
            </div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 36, fontWeight: 700, marginBottom: 12, color: "#0a0a0a", lineHeight: 1.2, letterSpacing: "-0.03em" }}>
              The Ultimate AI Linear Graphing Studio
            </h1>
            <p style={{ fontSize: 17, color: "#555555", maxWidth: 700, margin: "0 auto", lineHeight: 1.6, letterSpacing: "-0.01em" }}>
              Solve <b>any</b> linear equation interactively. Build custom tables, draw perfect straight lines, and learn step-by-step with Nairafame AI math tutor.
            </p>
          </div>

          <div className="lx-grid">
            <div>
              <div className="lx-card" style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
                  <div className="lx-heading-sm">Graph Paper</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {step > 0 && (<button className="lx-undo-btn" onClick={handleUndo} disabled={history.length === 0} title="Undo (Ctrl+Z)"><Undo2 size={14} /> Undo ({history.length})</button>)}
                    {step > 0 && (<button className="lx-undo-btn" onClick={openSaveModal} style={{ borderColor: COLORS.work, color: COLORS.work }} title="Save your progress">💾 Save</button>)}
                  </div>
                </div>
                <div style={{ border: "1px solid #f0f0f0", borderRadius: 12, overflow: "hidden" }}>
                  {solved.valid && step > 0 && (
                    <InteractiveGraph solved={solved} xStep={xScaleUnit} yStep={yScaleUnit} step={step} plotState={plotState} setPlotState={setPlotState} pushHistory={pushHistory} tool={tool} setTool={setTool} graphActions={graphActions} />
                  )}
                  {step === 0 && (
                    <div style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.inkSoft, background: "#fafafa" }}>Configure your equation and scale to begin...</div>
                  )}
                </div>
              </div>
            </div>

            <div>
              {showPinnedTable && <PinnedTable solved={solved} />}

              {step === 0 && (
                <div className="lx-card">
                  <div className="lx-badge"><ListChecks size={14} /> Exam Question Setup</div>
                  <h2 className="lx-heading">1. Enter Equation & Table Range</h2>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600 }}>y =</span>
                    <NumInput value={m} onChange={(v) => setM(v)} />
                    <span style={{ fontWeight: 600 }}>x +</span>
                    <NumInput value={b} onChange={(v) => setB(v)} />
                  </div>

                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 24, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600 }}>X Range: From</span>
                    <NumInput value={xStart} onChange={(v) => setXStart(v === "" ? 0 : v)} />
                    <span style={{ fontWeight: 600 }}>to</span>
                    <NumInput value={xEnd} onChange={(v) => setXEnd(v === "" ? 0 : v)} />
                  </div>

                  <h2 className="lx-heading">2. Choose Graph Scale</h2>
                  <div style={{ display: "flex", gap: 20, marginBottom: 16, flexWrap: "wrap" }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>X Scale (1 box = ? units)</label>
                      <select className="lx-input" style={{ width: "100%" }} value={xScaleUnit} onChange={(e) => { setXScaleUnit(Number(e.target.value)); setScaleApplied(false); }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>Y Scale (1 box = ? units)</label>
                      <select className="lx-input" style={{ width: "100%" }} value={yScaleUnit} onChange={(e) => { setYScaleUnit(Number(e.target.value)); setScaleApplied(false); }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                    <button className="lx-btn lx-btn-sec" onClick={autoSelectScale}>Auto-Select Scale</button>
                    <button className="lx-btn lx-btn-primary" onClick={acceptScale} style={{ flex: 1 }}>{scaleApplied ? "Scale Accepted ✓" : "Accept My Scale"}</button>
                  </div>

                  <button className="lx-btn lx-btn-primary" disabled={!scaleApplied} onClick={() => setStep(1)}>Start Graphing →</button>
                </div>
              )}

              {step === 1 && (
                <div className="lx-card">
                  <div className="lx-badge"><ListChecks size={14} /> Step 1 of 8</div>
                  <h2 className="lx-heading">Create the Table Values</h2>
                  <p className="lx-text">Substitute each value of x into the equation. Calculate the y-value and type it in the box.</p>
                  <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
                    <thead>
                      <tr>
                        <th style={{ padding: 8, border: "1px solid #f0f0f0", background: "#fafafa", fontFamily: "'Space Grotesk', sans-serif" }}>x</th>
                        {solved.tableData.map((row, i) => <th key={i} style={{ padding: 8, border: "1px solid #f0f0f0", background: "#fafafa", fontFamily: "'JetBrains Mono', monospace" }}>{row.x}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: 8, border: "1px solid #f0f0f0", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>y</td>
                        {solved.tableData.map((row, i) => (
                          <td key={i} style={{ padding: 4, border: "1px solid #f0f0f0" }}>
                            <input className="lx-num-input" style={{ width: "100%", borderColor: Number(tableInputs[row.x]) === row.y ? COLORS.work : COLORS.line }} value={tableInputs[row.x] || ""} onChange={(e) => setTableInputs((prev) => ({ ...prev, [row.x]: e.target.value }))} />
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                  <button className="lx-btn lx-btn-primary" disabled={!tableCorrect} onClick={() => setStep(2)}>{tableCorrect ? "Table Complete! Proceed to Plotting →" : "Complete all rows correctly to continue"}</button>
                </div>
              )}

              {step === 2 && (
                <div className="lx-card">
                  <div className="lx-badge"><MousePointerClick size={14} /> Step 2 of 8</div>
                  <h2 className="lx-heading">Plot Each Point by Clicking</h2>
                  <p className="lx-text">Click on the graph paper to plot each (x, y) coordinate from your table. (Ctrl+Z to undo a point.)</p>
                  <div style={{ background: COLORS.realSoft, padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14, color: COLORS.real, fontWeight: 600 }}>
                    Points Plotted: {plotState.points.length} / {solved.tableData.length}
                  </div>
                  <button className="lx-btn lx-btn-primary" disabled={!pointsCorrect} onClick={() => setStep(3)}>{pointsCorrect ? "All Points Plotted! Y-Intercept →" : "Plot all points on the graph"}</button>
                </div>
              )}

              {step === 3 && (
                <div className="lx-card">
                  <div className="lx-badge"><MousePointerClick size={14} /> Step 3 of 8</div>
                  <h2 className="lx-heading">Identify the Y-Intercept</h2>
                  <p className="lx-text">Find where the line crosses the y-axis. Click on that exact point on the graph.</p>
                  <div style={{ background: COLORS.workSoft, padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14, color: COLORS.work, fontWeight: 600 }}>{yintCorrect ? "Y-Intercept Identified!" : "Click the point where the line crosses the vertical axis."}</div>
                  <button className="lx-btn lx-btn-primary" disabled={!yintCorrect} onClick={() => setStep(4)}>{yintCorrect ? "Y-Intercept Found! Draw the Line →" : "Identify the Y-Intercept to continue"}</button>
                </div>
              )}

              {step === 4 && (
                <div className="lx-card">
                  <div className="lx-badge"><Pencil size={14} /> Step 4 of 8</div>
                  <h2 className="lx-heading">Draw the Straight Line</h2>
                  <p className="lx-text">Click and drag to draw a straight line that passes through every plotted point and the y-intercept. Use the Big Pencil on your phone, or the Eraser to fix mistakes.</p>
                  <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                    <button className="lx-btn lx-btn-sec" style={{ flex: 1, minWidth: 90, background: tool === "pencil" ? COLORS.workSoft : "#fff", borderColor: tool === "pencil" ? COLORS.work : COLORS.line, color: tool === "pencil" ? COLORS.work : "#555" }} onClick={() => setTool("pencil")}><Pencil size={16} /> Pencil</button>
                    <button className="lx-btn lx-btn-sec" style={{ flex: 1, minWidth: 90, background: tool === "big_pencil" ? COLORS.rememberSoft : "#fff", borderColor: tool === "big_pencil" ? COLORS.remember : COLORS.line, color: tool === "big_pencil" ? COLORS.remember : "#555" }} onClick={() => setTool("big_pencil")}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="M15 5l4 4"/></svg> Big ✏️</button>
                    <button className="lx-btn lx-btn-sec" style={{ flex: 1, minWidth: 90, background: tool === "eraser" ? "#ffe0e0" : "#fff", borderColor: tool === "eraser" ? "#e53935" : COLORS.line, color: tool === "eraser" ? "#e53935" : "#555" }} onClick={() => setTool("eraser")}><Eraser size={16} /> Eraser</button>
                  </div>
                  <div style={{ background: COLORS.workSoft, padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14, color: COLORS.work, fontWeight: 600 }}>{curveAccurate ? "Line passes through all points accurately!" : "Draw a straight line through all points."}</div>
                  <button className="lx-btn lx-btn-primary" disabled={!curveAccurate} onClick={() => setStep(5)}>{curveAccurate ? "Line Drawn! X-Intercept →" : "Draw a line through all points"}</button>
                </div>
              )}

              {step === 5 && (
                <div className="lx-card">
                  <div className="lx-badge"><MousePointerClick size={14} /> Step 5 of 8</div>
                  <h2 className="lx-heading">Mark the X-Intercept</h2>
                  <p className="lx-text">{solved.xIntercept !== null ? "Click to mark the x-intercept (where the line crosses the horizontal axis)." : "Since this is a horizontal line, there is no x-intercept. You can proceed!"}</p>
                  <div style={{ background: COLORS.realSoft, padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14, color: COLORS.real, fontWeight: 600 }}>{xintCorrect ? "X-Intercept marked!" : "Click the x-intercept on the graph."}</div>
                  <button className="lx-btn lx-btn-primary" disabled={!xintCorrect} onClick={() => setStep(6)}>{xintCorrect ? "Intercept Marked! Read Values →" : "Mark the x-intercept to continue"}</button>
                </div>
              )}

              {step === 6 && (
                <div className="lx-card">
                  <div className="lx-badge"><HelpCircle size={14} /> Step 6 of 8</div>
                  <h2 className="lx-heading">Read a Value from the Graph</h2>
                  <p className="lx-text">{readValueQuestion ? `When x = ${readValueQuestion.x}, what is y? Read it from your graph.` : "Loading question..."}</p>
                  <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
                    <span style={{ fontWeight: 600 }}>y =</span>
                    <input className="lx-num-input" type="number" style={{ width: 64 }} value={readValueInput} onChange={(e) => setReadValueInput(e.target.value)} />
                  </div>
                  <button className="lx-btn lx-btn-primary" disabled={!readValueCorrect} onClick={() => setStep(7)}>{readValueCorrect ? "Correct! Determine Slope →" : "Type the correct y-value to continue"}</button>
                </div>
              )}

              {step === 7 && (
                <div className="lx-card">
                  <div className="lx-badge"><HelpCircle size={14} /> Step 7 of 8</div>
                  <h2 className="lx-heading">Direction of Slope</h2>
                  <p className="lx-text">Does the line slope upwards, downwards, or is it horizontal?</p>
                  <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                    <button className="lx-btn lx-btn-sec" style={{ background: slopeAnswer === "Increasing" ? COLORS.workSoft : "#fff", borderColor: slopeAnswer === "Increasing" ? COLORS.work : COLORS.line, color: slopeAnswer === "Increasing" ? COLORS.work : "#555" }} onClick={() => setSlopeAnswer("Increasing")}><TrendingUp size={16} /> Increasing</button>
                    <button className="lx-btn lx-btn-sec" style={{ background: slopeAnswer === "Decreasing" ? COLORS.workSoft : "#fff", borderColor: slopeAnswer === "Decreasing" ? COLORS.work : COLORS.line, color: slopeAnswer === "Decreasing" ? COLORS.work : "#555" }} onClick={() => setSlopeAnswer("Decreasing")}><TrendingDown size={16} /> Decreasing</button>
                    <button className="lx-btn lx-btn-sec" style={{ background: slopeAnswer === "Horizontal" ? COLORS.workSoft : "#fff", borderColor: slopeAnswer === "Horizontal" ? COLORS.work : COLORS.line, color: slopeAnswer === "Horizontal" ? COLORS.work : "#555" }} onClick={() => setSlopeAnswer("Horizontal")}><Minus size={16} /> Horizontal</button>
                  </div>
                  <button className="lx-btn lx-btn-primary" disabled={!slopeCorrect} onClick={() => setStep(8)}>{slopeCorrect ? "Correct! View Final Graph →" : "Select the correct slope to continue"}</button>
                </div>
              )}

              {step === 8 && (
                <div className="lx-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <CheckCircle2 size={20} color={COLORS.work} />
                    <h2 className="lx-heading" style={{ color: COLORS.work, margin: 0 }}>Graph Complete!</h2>
                  </div>
                  <p className="lx-text">Your graph of y = {mv}x {bv >= 0 ? `+ ${bv}` : `- ${Math.abs(bv)}`} is complete with all key features marked. Now you can ask the AI any questions about this graph!</p>
                  <button className="lx-btn lx-btn-sec" onClick={resetWizard}><RotateCcw size={16} /> Start New Graph</button>
                </div>
              )}

              {step === 8 && (
                <div className="lx-card" style={{ marginTop: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <MessageCircle size={16} color="#1a237e" />
                    <div className="lx-heading-sm">Ask Nairafame AI</div>
                  </div>
                  <p style={{ fontSize: 13, color: "#555", marginBottom: 12, lineHeight: 1.5 }}>Ask about this linear equation. The AI can highlight points and trace values directly on your graph!</p>
                  <div style={{ maxHeight: 240, overflowY: "auto", marginBottom: 12, padding: "8px 0" }}>
                    {chatMessages.length === 0 && (<div style={{ fontSize: 13, color: "#999", textAlign: "center", padding: 16 }}>Try: "What is y when x = 3?" or "Show me the x-intercept"</div>)}
                    {chatMessages.map((msg, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 8 }}>
                        <div style={{ maxWidth: "85%", padding: "8px 12px", borderRadius: 12, fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap", background: msg.role === "user" ? "#1a237e" : "#f0f2f8", color: msg.role === "user" ? "#fff" : "#0a0a0a" }}>{msg.content}</div>
                      </div>
                    ))}
                    {chatLoading && (<div style={{ fontSize: 13, color: "#999", padding: "4px 0" }}>Thinking...</div>)}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input style={{ flex: 1, border: "1.5px solid #f0f0f0", borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none", fontFamily: "'Inter', sans-serif" }} placeholder="Ask about this graph..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !chatLoading) handleChatSubmit(); }} disabled={chatLoading} />
                    <button className="lx-btn lx-btn-primary" style={{ width: "auto", padding: "10px 16px" }} onClick={handleChatSubmit} disabled={chatLoading || !chatInput.trim()}><Send size={16} /></button>
                  </div>
                </div>
              )}

              {step >= 1 && step < 8 && (
                <div className="lx-card" style={{ marginTop: 16, opacity: 0.6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <MessageCircle size={16} color="#999" />
                    <div className="lx-heading-sm" style={{ color: "#999" }}>AI Tutor</div>
                  </div>
                  <p style={{ fontSize: 13, color: "#999", lineHeight: 1.5 }}>🔒 Complete all 8 steps to unlock the AI tutor. It can answer questions and highlight points on your graph!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSaveModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => !saving && setShowSaveModal(false)}>
          <div className="lx-card" style={{ width: 360, maxWidth: "90vw" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 12, letterSpacing: "-0.02em" }}>Save Your Progress</h3>
            <input className="lx-input" style={{ width: "100%", textAlign: "left", marginBottom: 16 }} value={saveTitle} onChange={(e) => setSaveTitle(e.target.value)} placeholder="Give it a name..." />
            {saveMsg && (<div style={{ fontSize: 13, marginBottom: 12, color: saveMsg === "Saved!" ? COLORS.work : "#c62828", fontWeight: 600 }}>{saveMsg}</div>)}
            <div style={{ display: "flex", gap: 10 }}>
              <button className="lx-btn lx-btn-sec" onClick={() => setShowSaveModal(false)} disabled={saving}>Cancel</button>
              <button className="lx-btn lx-btn-primary" onClick={handleSaveConfirm} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}