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
} from "lucide-react";

const API = "https://eduplatform-api-pol1.onrender.com";

const COLORS = {
  bg: "#f0f2f8",
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
  vertex: "#B4832A",
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

function solveQuadratic(a, b, c, xStart, xEnd, xStep, yStep) {
  if (a === 0) return { valid: false };
  const D = b * b - 4 * a * c;
  const vertexX = -b / (2 * a);
  const vertexY = a * vertexX * vertexX + b * vertexX + c;
  const yIntercept = c;

  let roots = null,
    nature = "";
  if (D > 0) {
    const sq = Math.sqrt(D);
    roots = [
      round(Math.max((-b + sq) / (2 * a), (-b - sq) / (2 * a)), 4),
      round(Math.min((-b + sq) / (2 * a), (-b - sq) / (2 * a)), 4),
    ];
    nature = "two different real roots";
  } else if (D === 0) {
    roots = [round(-b / (2 * a), 4)];
    nature = "one repeated real root";
  } else {
    roots = null;
    nature = "no real roots";
  }

  const tableData = [];
  for (let x = xStart; x <= xEnd; x++) {
    tableData.push({ x, y: round(a * x * x + b * x + c, 2) });
  }

  const domX0 = vertexX - 5 * xStep;
  const domX1 = vertexX + 5 * xStep;
  const N = 120;
  const curve = [];
  for (let i = 0; i <= N; i++) {
    const x = domX0 + ((domX1 - domX0) * i) / N;
    curve.push({ x, y: a * x * x + b * x + c });
  }
  const sampledYs = curve.map((p) => p.y);
  let realYMin = Math.min(0, ...sampledYs, vertexY);
  let realYMax = Math.max(0, ...sampledYs, vertexY);

  const boxesBelow = Math.max(1, Math.ceil((0 - realYMin) / yStep) + 1);
  const boxesAbove = Math.max(1, Math.ceil((realYMax - 0) / yStep) + 1);
  const belowShare =
    Math.round((boxesBelow / (boxesBelow + boxesAbove)) * 12) || 6;
  const aboveShare = 12 - belowShare;

  const xMin = domX0;
  const xMax = domX1;
  const yMin = -belowShare * yStep;
  const yMax = aboveShare * yStep;

  const h = round(-b / (2 * a), 4);
  const k = round(a * h * h + b * h + c, 4);

  return {
    valid: true,
    a,
    b,
    c,
    D: round(D, 4),
    nature,
    roots,
    vertex: { x: round(vertexX, 4), y: round(vertexY, 4) },
    yIntercept,
    tableData,
    curve,
    domain: { xMin, xMax, yMin, yMax },
    h,
    k,
  };
}

async function askNairafameAI(question, solvedData, history) {
  try {
    const res = await axios.post(`${API}/api/ai/quadratic-chat`, {
      question,
      solvedData,
      history,
    });
    return {
      reply: res.data.reply,
      actions: res.data.actions || [],
    };
  } catch (err) {
    const errMsg =
      err.response?.data?.error || "Network error. Please try again.";
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
};
const pinnedBodyCellStyle = {
  padding: 8,
  border: "1px solid #f0f0f0",
  fontFamily: "'JetBrains Mono', monospace",
  fontWeight: 700,
  fontSize: 13,
  textAlign: "center",
  color: COLORS.ink,
};

function PinnedTable({ solved }) {
  return (
    <div className="qx-card" style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <Pin size={14} color="#1a237e" />
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            color: "#0a0a0a",
          }}
        >
          Your Table (Reference)
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th
                style={{
                  ...pinnedHeadCellStyle,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                x
              </th>
              {solved.tableData.map((row, i) => (
                <th key={i} style={pinnedHeadCellStyle}>
                  {row.x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                style={{
                  ...pinnedBodyCellStyle,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                y
              </td>
              {solved.tableData.map((row, i) => (
                <td key={i} style={pinnedBodyCellStyle}>
                  {fmt(row.y)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {showsavemodal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignitems: "center",
            justifycontent: "center",
            zindex: 1000,
          }}
          onclick={() => !saving && setshowsavemodal(false)}
        >
          <div
            classname="qx-card"
            style={{ width: 360, maxwidth: "90vw" }}
            onclick={(e) => e.stoppropagation()}
          >
            <h3
              style={{
                fontfamily: "'space grotesk', sans-serif",
                fontweight: 700,
                fontsize: 18,
                marginbottom: 12,
              }}
            >
              save your progress
            </h3>
            <input
              classname="qx-input"
              style={{ width: "100%", textalign: "left", marginbottom: 16 }}
              value={savetitle}
              onchange={(e) => setsavetitle(e.target.value)}
              placeholder="give it a name..."
            />
            {savemsg && (
              <div
                style={{
                  fontsize: 13,
                  marginbottom: 12,
                  color: savemsg === "saved!" ? colors.work : "#c62828",
                  fontweight: 600,
                }}
              >
                {savemsg}
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                classname="qx-btn qx-btn-sec"
                onclick={() => setshowsavemodal(false)}
                disabled={saving}
              >
                cancel
              </button>
              <button
                classname="qx-btn qx-btn-primary"
                onclick={handlesaveconfirm}
                disabled={saving}
              >
                {saving ? "saving..." : "save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function labelPoint(pt, vertex) {
  const isVertex =
    Math.abs(pt.x - vertex.x) < 1e-6 && Math.abs(pt.y - vertex.y) < 1e-6;
  return isVertex
    ? `Vertex (${fmt(pt.x)}, ${fmt(pt.y)})`
    : `(${fmt(pt.x)}, ${fmt(pt.y)})`;
}

function NumInput({ value, onChange, style }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", ...style }}>
      <button
        type="button"
        className="qx-spin-btn"
        style={{ borderRadius: "8px 0 0 8px", borderRight: "none" }}
        onClick={() => {
          const v = value === "" ? 0 : Number(value);
          onChange(v - 1);
        }}
      >
        −
      </button>
      <input
        className="qx-num-input"
        type="number"
        value={value}
        onChange={(e) =>
          onChange(e.target.value === "" ? "" : Number(e.target.value))
        }
        style={{ borderRadius: 0, borderLeft: "none", borderRight: "none", width: 44 }}
      />
      <button
        type="button"
        className="qx-spin-btn"
        style={{ borderRadius: "0 8px 8px 0", borderLeft: "none" }}
        onClick={() => {
          const v = value === "" ? 0 : Number(value);
          onChange(v + 1);
        }}
      >
        +
      </button>
    </div>
  );
}

function buildPathD(points, xScale, yScale) {
  if (!points || points.length < 2) return "";
  return points
    .map(
      (p, i) =>
        (i === 0 ? "M" : "L") +
        " " +
        xScale(p.x).toFixed(2) +
        " " +
        yScale(p.y).toFixed(2)
    )
    .join(" ");
}

function InteractiveGraph({
  solved,
  xStep,
  yStep,
  step,
  plotState,
  setPlotState,
  pushHistory,
  tool,
  setTool,
  graphActions = [],
}) {
  const W = 560,
    H = 680;
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
  const strokeStarted = useRef(false);

  const xGrid = [],
    yGrid = [],
    minorXGrid = [],
    minorYGrid = [];
  for (let v = Math.ceil(xMin / xStep) * xStep; v <= xMax + 1e-9; v += xStep)
    xGrid.push(round(v, 6));
  for (let v = Math.ceil(yMin / yStep) * yStep; v <= yMax + 1e-9; v += yStep)
    yGrid.push(round(v, 6));

  const minorXStep = xStep / 10;
  for (
    let v = Math.ceil(xMin / minorXStep) * minorXStep;
    v <= xMax;
    v += minorXStep
  ) {
    if (Math.abs((v - xMin) / xStep - Math.floor((v - xMin) / xStep)) > 1e-9)
      minorXGrid.push(round(v, 6));
  }
  const minorYStep = yStep / 10;
  for (
    let v = Math.ceil(yMin / minorYStep) * minorYStep;
    v <= yMax;
    v += minorYStep
  ) {
    if (Math.abs((v - yMin) / yStep - Math.floor((v - yMin) / yStep)) > 1e-9)
      minorYGrid.push(round(v, 6));
  }

  const pathD = solved.curve
    .map(
      (p, i) =>
        (i === 0 ? "M" : "L") +
        " " +
        xScale(p.x).toFixed(2) +
        " " +
        yScale(p.y).toFixed(2)
    )
    .join(" ");

  function getSvgPoint(e) {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: xInv(((clientX - rect.left) / rect.width) * W),
      y: yInv(((clientY - rect.top) / rect.height) * H),
    };
  }

  const isDrawing = step === 4 && (tool === "pencil" || tool === "big_pencil");

  function handleClick(e) {
    if (step !== 2 && step !== 3 && step !== 6) return;
    const { x, y } = getSvgPoint(e);

    if (step === 2) {
      const target = solved.tableData.find(
        (t) => Math.abs(t.x - x) <= xStep && Math.abs(t.y - y) <= yStep
      );
      if (target && !plotState.points.some((p) => p.x === target.x)) {
        pushHistory();
        setPlotState((prev) => ({
          ...prev,
          points: [...prev.points, target],
        }));
      }
    } else if (step === 3) {
      if (
        Math.abs(solved.vertex.x - x) <= xStep &&
        Math.abs(solved.vertex.y - y) <= yStep
      ) {
        pushHistory();
        setPlotState((prev) => ({ ...prev, vertex: solved.vertex }));
      }
    } else if (step === 6) {
      if (Math.abs(x) <= xStep && Math.abs(solved.yIntercept - y) <= yStep) {
        pushHistory();
        setPlotState((prev) => ({
          ...prev,
          yint: { x: 0, y: solved.yIntercept },
        }));
      }
      if (solved.roots) {
        const rootTarget = solved.roots.find(
          (r) => Math.abs(r - x) <= xStep && Math.abs(y) <= yStep
        );
        if (rootTarget !== undefined && !plotState.roots.includes(rootTarget)) {
          pushHistory();
          setPlotState((prev) => ({
            ...prev,
            roots: [...prev.roots, rootTarget],
          }));
        }
      }
    }
  }

  function handleMouseDown(e) {
    if (step !== 4 && step !== 5) return;
    setIsMouseDown(true);
    strokeStarted.current = false;
    const p = getSvgPoint(e);

    if (step === 4 && tool === "pencil") {
      pushHistory();
      strokeStarted.current = true;
      lastDrawPoint.current = p;
      setPlotState((prev) => ({ ...prev, curve: [...prev.curve, p] }));
    }
    if (step === 4 && tool === "big_pencil") {
      pushHistory();
      strokeStarted.current = true;
      lastDrawPoint.current = p;
      setPlotState((prev) => ({ ...prev, bigCurve: [...prev.bigCurve, p] }));
    }
    if (step === 4 && tool === "eraser") {
      pushHistory();
      strokeStarted.current = true;
    }
    if (step === 5) {
      pushHistory();
      strokeStarted.current = true;
      setPlotState((prev) => ({
        ...prev,
        symmetry: { x1: p.x, y1: p.y, x2: p.x, y2: p.y },
      }));
    }
  }

  function handleMouseMove(e) {
    if (!isMouseDown) return;
    const p = getSvgPoint(e);

    if (step === 4) {
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
          curve: prev.curve.filter(
            (pt) => Math.hypot(pt.x - p.x, pt.y - p.y) > eraserRadius
          ),
          bigCurve: prev.bigCurve.filter(
            (pt) => Math.hypot(pt.x - p.x, pt.y - p.y) > eraserRadius
          ),
        }));
      }
    } else if (step === 5) {
      setPlotState((prev) => ({
        ...prev,
        symmetry: { ...prev.symmetry, x2: p.x, y2: p.y },
      }));
    }
  }

  function handleMouseUp() {
    setIsMouseDown(false);
    lastDrawPoint.current = null;
    strokeStarted.current = false;
  }

  const cursorStyle =
    step === 4
      ? tool === "eraser"
        ? "cell"
        : tool === "big_pencil"
        ? "crosshair"
        : "crosshair"
      : step === 5
      ? "crosshair"
      : step === 2 || step === 3 || step === 6
      ? "pointer"
      : "default";

  return (
    <svg
      ref={svgRef}
      viewBox={"0 0 " + W + " " + H}
      style={{
        width: "100%",
        height: "auto",
        display: "block",
        background: COLORS.paperBg,
        cursor: cursorStyle,
        touchAction: step === 4 || step === 5 ? "none" : "auto",
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
      <rect
        x={PAD.left}
        y={PAD.top}
        width={plotW}
        height={plotH}
        fill={COLORS.paperBg}
      />
      {minorXGrid.map((v) => (
        <line
          key={"mgx" + v}
          x1={xScale(v)}
          x2={xScale(v)}
          y1={PAD.top}
          y2={H - PAD.bottom}
          stroke={COLORS.paperMinor}
          strokeWidth="0.5"
        />
      ))}
      {minorYGrid.map((v) => (
        <line
          key={"mgy" + v}
          x1={PAD.left}
          x2={W - PAD.right}
          y1={yScale(v)}
          y2={yScale(v)}
          stroke={COLORS.paperMinor}
          strokeWidth="0.5"
        />
      ))}
      {xGrid.map((v) => (
        <line
          key={"gx" + v}
          x1={xScale(v)}
          x2={xScale(v)}
          y1={PAD.top}
          y2={H - PAD.bottom}
          stroke={COLORS.paperMajor}
          strokeWidth="1"
        />
      ))}
      {yGrid.map((v) => (
        <line
          key={"gy" + v}
          x1={PAD.left}
          x2={W - PAD.right}
          y1={yScale(v)}
          y2={yScale(v)}
          stroke={COLORS.paperMajor}
          strokeWidth="1"
        />
      ))}
      <rect
        x={PAD.left}
        y={PAD.top}
        width={plotW}
        height={plotH}
        fill="none"
        stroke={COLORS.paperMajor}
        strokeWidth="1.2"
      />

      <line
        x1={PAD.left}
        x2={W - PAD.right}
        y1={yScale(0)}
        y2={yScale(0)}
        stroke={COLORS.paperAxis}
        strokeWidth="2"
      />
      <line
        x1={xScale(0)}
        x2={xScale(0)}
        y1={PAD.top}
        y2={H - PAD.bottom}
        stroke={COLORS.paperAxis}
        strokeWidth="2"
      />

      {xGrid
        .filter((v) => Math.abs(v) > 1e-9)
        .map((v) => (
          <text
            key={"xl" + v}
            x={xScale(v)}
            y={yScale(0) + 16}
            fontSize="10"
            textAnchor="middle"
            fill={COLORS.inkSoft}
            fontFamily="JetBrains Mono, monospace"
          >
            {fmt(v, 2)}
          </text>
        ))}
      {yGrid
        .filter((v) => Math.abs(v) > 1e-9)
        .map((v) => (
          <text
            key={"yl" + v}
            x={xScale(0) - 8}
            y={yScale(v) + 4}
            fontSize="10"
            textAnchor="end"
            fill={COLORS.inkSoft}
            fontFamily="JetBrains Mono, monospace"
          >
            {fmt(v, 2)}
          </text>
        ))}

      {plotState.points.map((p, i) => (
        <circle
          key={"up" + i}
          cx={xScale(p.x)}
          cy={yScale(p.y)}
          r="4"
          fill={COLORS.real}
          stroke="#fff"
          strokeWidth="1.5"
        />
      ))}

      {/* Regular pencil strokes */}
      {plotState.curve && plotState.curve.length > 1 && (
        <path
          d={buildPathD(plotState.curve, xScale, yScale)}
          fill="none"
          stroke={COLORS.curve}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
        />
      )}

      {/* Big pencil strokes (thicker for mobile finger drawing) */}
      {plotState.bigCurve && plotState.bigCurve.length > 1 && (
        <path
          d={buildPathD(plotState.bigCurve, xScale, yScale)}
          fill="none"
          stroke={COLORS.bigPencil}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.5"
        />
      )}

      {plotState.symmetry && (
        <line
          x1={xScale(plotState.symmetry.x1)}
          y1={yScale(plotState.symmetry.y1)}
          x2={xScale(plotState.symmetry.x2)}
          y2={yScale(plotState.symmetry.y2)}
          stroke={COLORS.remember}
          strokeWidth="2"
          strokeDasharray="5 5"
          opacity="0.8"
        />
      )}

      {step === 9 && (
        <>
          <path
            d={pathD}
            fill="none"
            stroke={COLORS.curve}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle
            cx={xScale(0)}
            cy={yScale(solved.yIntercept)}
            r="5"
            fill={COLORS.yint}
            stroke="#fff"
            strokeWidth="1.5"
          />
          {solved.roots &&
            solved.roots.map((r, i) => (
              <circle
                key={"r" + i}
                cx={xScale(r)}
                cy={yScale(0)}
                r="5"
                fill={COLORS.root}
                stroke="#fff"
                strokeWidth="1.5"
              />
            ))}
          <circle
            cx={xScale(solved.vertex.x)}
            cy={yScale(solved.vertex.y)}
            r="6"
            fill={COLORS.vertex}
            stroke="#fff"
            strokeWidth="1.5"
          />
        </>
      )}

      {plotState.vertex && (
        <circle
          cx={xScale(plotState.vertex.x)}
          cy={yScale(plotState.vertex.y)}
          r="6"
          fill="none"
          stroke={COLORS.vertex}
          strokeWidth="2.5"
          strokeDasharray="4 2"
        />
      )}
      {plotState.yint && (
        <circle
          cx={xScale(plotState.yint.x)}
          cy={yScale(plotState.yint.y)}
          r="5"
          fill="none"
          stroke={COLORS.yint}
          strokeWidth="2.5"
          strokeDasharray="4 2"
        />
      )}
      {plotState.roots.map((r, i) => (
        <circle
          key={"ur" + i}
          cx={xScale(r)}
          cy={yScale(0)}
          r="5"
          fill="none"
          stroke={COLORS.root}
          strokeWidth="2.5"
          strokeDasharray="4 2"
        />
      ))}

      {/* ── AI Visual Actions ── */}
      {graphActions.map((action, i) => {
        if (action.type === "highlight_point") {
          const color = action.color || COLORS.aiAction;
          return (
            <g key={"ai" + i}>
              <circle
                cx={xScale(action.x)}
                cy={yScale(action.y)}
                r="7"
                fill={color}
                stroke="#fff"
                strokeWidth="2"
                opacity="0.9"
              />
              {action.label && (
                <text
                  x={xScale(action.x) + 12}
                  y={yScale(action.y) - 12}
                  fontSize="11"
                  fill={color}
                  fontWeight="700"
                  fontFamily="Inter, sans-serif"
                >
                  {action.label}
                </text>
              )}
            </g>
          );
        }

        if (action.type === "trace_to_axes") {
          const color = action.color || COLORS.aiAction;
          return (
            <g key={"ai" + i}>
              <line
                x1={xScale(action.x)}
                y1={yScale(action.y)}
                x2={xScale(0)}
                y2={yScale(action.y)}
                stroke={color}
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity="0.7"
              />
              <line
                x1={xScale(action.x)}
                y1={yScale(action.y)}
                x2={xScale(action.x)}
                y2={yScale(0)}
                stroke={color}
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity="0.7"
              />
              <circle
                cx={xScale(action.x)}
                cy={yScale(0)}
                r="3"
                fill={color}
                opacity="0.5"
              />
              <circle
                cx={xScale(0)}
                cy={yScale(action.y)}
                r="3"
                fill={color}
                opacity="0.5"
              />
            </g>
          );
        }

        if (action.type === "draw_line") {
          return (
            <line
              key={"ai" + i}
              x1={xScale(action.x1)}
              y1={yScale(action.y1)}
              x2={xScale(action.x2)}
              y2={yScale(action.y2)}
              stroke={action.color || COLORS.aiAction}
              strokeWidth="2"
              strokeDasharray={action.style === "dashed" ? "6 3" : "none"}
              opacity="0.8"
            />
          );
        }

        if (action.type === "show_label") {
          return (
            <text
              key={"ai" + i}
              x={xScale(action.x) + 8}
              y={yScale(action.y) - 8}
              fontSize="11"
              fill={action.color || COLORS.aiAction}
              fontWeight="700"
              fontFamily="Inter, sans-serif"
            >
              {action.text || ""}
            </text>
          );
        }

        return null;
      })}
    </svg>
  );
}

export default function QuadraticExplorer() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(-5);
  const [c, setC] = useState(6);
  const [xStart, setXStart] = useState(-4);
  const [xEnd, setXEnd] = useState(4);

  const [xScaleUnit, setXScaleUnit] = useState(1);
  const [yScaleUnit, setYScaleUnit] = useState(2);
  const [scaleApplied, setScaleApplied] = useState(false);

  const [step, setStep] = useState(0);
  const [tableInputs, setTableInputs] = useState({});
  const [plotState, setPlotState] = useState({
    points: [],
    vertex: null,
    curve: [],
    bigCurve: [],
    yint: null,
    roots: [],
    symmetry: null,
  });
  const [dirAnswer, setDirAnswer] = useState(null);
  const [tool, setTool] = useState("pencil");
  const [readValueInput, setReadValueInput] = useState("");
  const [readValueQuestion, setReadValueQuestion] = useState(null);

  const [history, setHistory] = useState([]);
  const plotStateRef = useRef(plotState);
  useEffect(() => {
    plotStateRef.current = plotState;
  }, [plotState]);

  // Chat States
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // AI Visual Actions State
  const [graphActions, setGraphActions] = useState([]);

  // Save Progress State
  const navigate = useNavigate();
  const location = useLocation();
  const [saveId, setSaveId] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const loadId = params.get("save");
    if (!loadId) return;

    const token = localStorage.getItem("token");
    axios
      .get(`${API}/api/quadratic-saves/${loadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const s = res.data.save;
        setA(Number(s.a));
        setB(Number(s.b));
        setC(Number(s.c));
        setXStart(s.x_start);
        setXEnd(s.x_end);
        setXScaleUnit(s.x_scale_unit);
        setYScaleUnit(s.y_scale_unit);
        setScaleApplied(true);
        setTableInputs(s.table_inputs || {});
        setPlotState(
          s.plot_state || {
            points: [],
            vertex: null,
            curve: [],
            bigCurve: [],
            yint: null,
            roots: [],
            symmetry: null,
          }
        );
        setDirAnswer(s.dir_answer || null);
        setStep(s.step);
        setSaveId(s.id);
      })
      .catch((err) => {
        console.error("Failed to load save:", err);
      });
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
        e.preventDefault();
        handleUndo();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleUndo]);

  const av = a === "" ? 0 : a;
  const bv = b === "" ? 0 : b;
  const cv = c === "" ? 0 : c;

  const solved = useMemo(
    () => solveQuadratic(av, bv, cv, xStart, xEnd, xScaleUnit, yScaleUnit),
    [av, bv, cv, xStart, xEnd, xScaleUnit, yScaleUnit]
  );

  const tableCorrect = useMemo(() => {
    if (!solved.valid) return false;
    return solved.tableData.every(
      (row) => Number(tableInputs[row.x]) === row.y
    );
  }, [solved, tableInputs]);

  const pointsCorrect = plotState.points.length === solved.tableData.length;
  const vertexCorrect = plotState.vertex !== null;

  const curveTargets = useMemo(() => {
    if (!solved.valid) return [];
    const pts = [...plotState.points];
    if (plotState.vertex) pts.push(plotState.vertex);
    else pts.push(solved.vertex);
    return pts;
  }, [plotState.points, plotState.vertex, solved.valid, solved.vertex]);

  const TOLERANCE_FACTOR = 0.18;

  const curveCoverage = useMemo(() => {
    const allCurvePoints = [...plotState.curve, ...plotState.bigCurve];
    if (!solved.valid || curveTargets.length === 0)
      return { covered: 0, total: 0, missing: [] };
    const tolX = xScaleUnit * TOLERANCE_FACTOR;
    const tolY = yScaleUnit * TOLERANCE_FACTOR;
    let covered = 0;
    const missing = [];
    curveTargets.forEach((pt) => {
      const hit = allCurvePoints.some(
        (cp) => Math.abs(cp.x - pt.x) <= tolX && Math.abs(cp.y - pt.y) <= tolY
      );
      if (hit) covered++;
      else missing.push(pt);
    });
    return { covered, total: curveTargets.length, missing };
  }, [plotState.curve, plotState.bigCurve, curveTargets, xScaleUnit, yScaleUnit, solved.valid]);

  const curveAccurate =
    solved.valid &&
    curveCoverage.total > 0 &&
    curveCoverage.covered === curveCoverage.total &&
    (plotState.curve.length > 10 || plotState.bigCurve.length > 5);

  const symmetryCorrect = useMemo(() => {
    if (!plotState.symmetry) return false;
    const isVertical =
      Math.abs(plotState.symmetry.x1 - plotState.symmetry.x2) <
      xScaleUnit * 0.3;
    const isAtVertex =
      Math.abs(plotState.symmetry.x1 - solved.vertex.x) < xScaleUnit * 0.3;
    return isVertical && isAtVertex;
  }, [plotState.symmetry, solved.vertex, xScaleUnit]);

  const interceptsCorrect =
    plotState.yint !== null &&
    (solved.roots ? plotState.roots.length === solved.roots.length : true);
  const dirCorrect = dirAnswer === (av > 0 ? "up" : "down");

  useEffect(() => {
    if (step === 7 && solved.tableData.length > 0) {
      const randomRow =
        solved.tableData[Math.floor(Math.random() * solved.tableData.length)];
      setReadValueQuestion({ x: randomRow.x, y: randomRow.y });
      setReadValueInput("");
    }
  }, [step, solved.tableData]);

  const readValueCorrect =
    readValueQuestion && Number(readValueInput) === readValueQuestion.y;

  const resetWizard = () => {
    setStep(0);
    setTableInputs({});
    setPlotState({
      points: [],
      vertex: null,
      curve: [],
      bigCurve: [],
      yint: null,
      roots: [],
      symmetry: null,
    });
    setHistory([]);
    setDirAnswer(null);
    setTool("pencil");
    setReadValueInput("");
    setReadValueQuestion(null);
    setScaleApplied(false);
    setChatMessages([]);
    setChatInput("");
    setGraphActions([]);
  };

  const autoSelectScale = () => {
    const xDiff = xEnd - xStart;
    const autoX = xDiff <= 10 ? 1 : xDiff <= 20 ? 2 : 5;
    const vertexX = -bv / (2 * av);
    const vertexY = av * vertexX * vertexX + bv * vertexX + cv;
    const probeX0 = vertexX - 5 * autoX;
    const probeX1 = vertexX + 5 * autoX;
    let yLo = Math.min(0, vertexY);
    let yHi = Math.max(0, vertexY);
    for (let i = 0; i <= 40; i++) {
      const x = probeX0 + ((probeX1 - probeX0) * i) / 40;
      const y = av * x * x + bv * x + cv;
      yLo = Math.min(yLo, y);
      yHi = Math.max(yHi, y);
    }
    const ySpan = yHi - yLo || 1;
    const autoY = ySpan <= 12 ? 1 : ySpan <= 24 ? 2 : ySpan <= 60 ? 5 : 10;
    setXScaleUnit(autoX);
    setYScaleUnit(autoY);
    setScaleApplied(true);
  };

  const acceptScale = () => setScaleApplied(true);

  const showPinnedTable = tableCorrect && step >= 2 && step <= 8;

  const openSaveModal = () => {
    const autoTitle = `y = ${av}x² + ${bv}x + ${cv}`;
    setSaveTitle(autoTitle);
    setShowSaveModal(true);
  };

  const handleSaveConfirm = async () => {
    setSaving(true);
    setSaveMsg("");
    const token = localStorage.getItem("token");
    const payload = {
      title: saveTitle.trim() || `y = ${av}x² + ${bv}x + ${cv}`,
      a: av,
      b: bv,
      c: cv,
      xStart,
      xEnd,
      xScaleUnit,
      yScaleUnit,
      step,
      tableInputs,
      plotState,
      dirAnswer,
    };
    try {
      if (saveId) {
        const res = await axios.put(
          `${API}/api/quadratic-saves/${saveId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSaveId(res.data.save.id);
      } else {
        const res = await axios.post(`${API}/api/quadratic-saves`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSaveId(res.data.save.id);
      }
      setSaveMsg("Saved!");
      setTimeout(() => {
        setShowSaveModal(false);
        setSaveMsg("");
      }, 1000);
    } catch (err) {
      setSaveMsg(err.response?.data?.error || "Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };
    
  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setChatInput("");
    setChatLoading(true);
    setGraphActions([]);
    const { reply, actions } = await askNairafameAI(userMsg, solved, chatMessages);
    setChatMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    if (actions && actions.length > 0) {
      setGraphActions(actions);
    }
    setChatLoading(false);
  };

  return (
    <div
      style={{
        background: COLORS.bg,
        minHeight: "100vh",
        fontFamily: "'Inter', sans-serif",
        color: COLORS.ink,
      }}
    >
      <div style={{ padding: "40px 16px" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap');
          .qx-wrap { max-width: 1100px; margin: 0 auto; }
          .qx-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
          @media (min-width: 900px) { .qx-grid { grid-template-columns: 1.2fr 0.8fr; align-items: start; } }
          .qx-input { border: 1.5px solid #f0f0f0; border-radius: 8px; padding: 8px 10px; font-family: 'JetBrains Mono', monospace; font-size: 14px; text-align: center; outline: none; width: 60px; }
          .qx-input:focus { border-color: #1a237e; }
          .qx-num-input { border: 1.5px solid #f0f0f0; padding: 8px 4px; font-family: 'JetBrains Mono', monospace; font-size: 14px; text-align: center; outline: none; width: 44px; height: 38px; }
          .qx-num-input:focus { border-color: #1a237e; }
          .qx-spin-btn { width: 28px; height: 38px; border: 1.5px solid #f0f0f0; background: #fafafa; font-size: 16px; font-weight: 700; color: #555; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0; line-height: 1; font-family: 'Inter', sans-serif; }
          .qx-spin-btn:hover { background: #E8EAF6; color: #1a237e; }
          .qx-spin-btn:active { background: #C5CAE9; }
          .qx-num-input::-webkit-inner-spin-button, .qx-num-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
          .qx-num-input { -moz-appearance: textfield; }
          @media (min-width: 900px) {
            .qx-spin-btn { display: none !important; }
            .qx-num-input { border-radius: 8px !important; width: 64px !important; border-left: 1.5px solid #f0f0f0 !important; border-right: 1.5px solid #f0f0f0 !important; }
            .qx-num-input::-webkit-inner-spin-button, .qx-num-input::-webkit-outer-spin-button { -webkit-appearance: auto; opacity: 1; height: 28px; }
            .qx-num-input { -moz-appearance: auto; }
          }
          .qx-btn { display: flex; align-items: center; justify-content: center; gap: 8px; border: none; border-radius: 8px; padding: 12px 20px; font-size: 16px; font-weight: 700; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 150ms ease; width: 100%; }
          .qx-btn-primary { background: #1a237e; color: white; }
          .qx-btn-primary:hover { background: #283593; }
          .qx-btn-primary:disabled { background: #D7E5DC; color: #8FA5A0; cursor: not-allowed; }
          .qx-btn-sec { background: white; color: #1a237e; border: 1.5px solid #1a237e; }
          .qx-btn-sec:hover { background: #E8EAF6; }
          .qx-btn-sec:disabled { color: #8FA5A0; border-color: #D7E5DC; cursor: not-allowed; }
          .qx-card { border: 1px solid #f0f0f0; background: white; border-radius: 16px; padding: 24px; box-shadow: 0 8px 24px rgba(0,0,0,0.05); }
          .qx-badge { display: inline-flex; align-items: center; gap: 6px; background: #fff3e0; border: 1px solid #ff6f00; color: #ff6f00; padding: 4px 10px; border-radius: 30px; font-size: 12px; font-weight: 700; margin-bottom: 12px; }
          .qx-undo-btn { display:flex; align-items:center; gap:6px; border:1px solid #1a237e; background:white; color:#1a237e; border-radius:8px; padding:6px 12px; font-size:12.5px; font-weight:700; cursor:pointer; font-family:'Inter', sans-serif; }
          .qx-undo-btn:disabled { border-color:#D7E5DC; color:#8FA5A0; cursor:not-allowed; }
        `}</style>

        <div className="qx-wrap">
          <div style={{ marginBottom: 32, textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                backgroundColor: "#fff3e0",
                border: "1px solid #ff6f00",
                borderRadius: 30,
                padding: "6px 16px",
                marginBottom: 16,
              }}
            >
              <span>🤖</span>
              <span
                style={{
                  color: "#ff6f00",
                  fontWeight: 700,
                  fontSize: 13,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Powered by Nairafame AI
              </span>
            </div>
            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 36,
                fontWeight: 700,
                marginBottom: 12,
                color: "#0a0a0a",
                lineHeight: 1.2,
              }}
            >
              The Ultimate AI Quadratic Graphing Studio
            </h1>
            <p
              style={{
                fontSize: 17,
                color: "#555555",
                maxWidth: 700,
                margin: "0 auto",
                lineHeight: 1.6,
              }}
            >
              Solve <b>any</b> quadratic equation interactively. Build custom
              tables, draw perfect exam-ready graphs, and learn step-by-step
              with Nairafame AI math tutor.
            </p>
          </div>

          <div className="qx-grid">
            <div>
              <div className="qx-card" style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: 18,
                      color: "#0a0a0a",
                    }}
                  >
                    Graph Paper
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {step > 0 && (
                      <button
                        className="qx-undo-btn"
                        onClick={handleUndo}
                        disabled={history.length === 0}
                        title="Undo (Ctrl+Z)"
                      >
                        <Undo2 size={14} /> Undo ({history.length})
                      </button>
                    )}
                    {step > 0 && (
                      <button
                        className="qx-undo-btn"
                        onClick={openSaveModal}
                        style={{ borderColor: COLORS.work, color: COLORS.work }}
                        title="Save your progress"
                      >
                        💾 Save
                      </button>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    border: "1px solid #f0f0f0",
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  {solved.valid && step > 0 && (
                    <InteractiveGraph
                      solved={solved}
                      xStep={xScaleUnit}
                      yStep={yScaleUnit}
                      step={step}
                      plotState={plotState}
                      setPlotState={setPlotState}
                      pushHistory={pushHistory}
                      tool={tool}
                      setTool={setTool}
                      graphActions={graphActions}
                    />
                  )}
                  {step === 0 && (
                    <div
                      style={{
                        height: 400,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: COLORS.inkSoft,
                        background: "#fafafa",
                      }}
                    >
                      Configure your equation and scale to begin...
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              {showPinnedTable && <PinnedTable solved={solved} />}

              {step === 0 && (
                <div className="qx-card">
                  <div className="qx-badge">
                    <ListChecks size={14} /> Exam Question Setup
                  </div>
                  <h2
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 20,
                      fontWeight: 700,
                      marginBottom: 16,
                      color: "#0a0a0a",
                    }}
                  >
                    1. Enter Equation & Table Range
                  </h2>
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      marginBottom: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>y =</span>
                    <NumInput value={a} onChange={(v) => setA(v)} />
                    <span style={{ fontWeight: 600 }}>x² +</span>
                    <NumInput value={b} onChange={(v) => setB(v)} />
                    <span style={{ fontWeight: 600 }}>x +</span>
                    <NumInput value={c} onChange={(v) => setC(v)} />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      marginBottom: 24,
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>X Range: From</span>
                    <NumInput
                      value={xStart}
                      onChange={(v) => setXStart(v === "" ? 0 : v)}
                    />
                    <span style={{ fontWeight: 600 }}>to</span>
                    <NumInput
                      value={xEnd}
                      onChange={(v) => setXEnd(v === "" ? 0 : v)}
                    />
                  </div>

                  <h2
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 20,
                      fontWeight: 700,
                      marginBottom: 16,
                      color: "#0a0a0a",
                    }}
                  >
                    2. Choose Graph Scale
                  </h2>
                  <div
                    style={{
                      display: "flex",
                      gap: 20,
                      marginBottom: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#555",
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        X Scale (1 box = ? units)
                      </label>
                      <select
                        className="qx-input"
                        style={{ width: "100%" }}
                        value={xScaleUnit}
                        onChange={(e) => {
                          setXScaleUnit(Number(e.target.value));
                          setScaleApplied(false);
                        }}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#555",
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        Y Scale (1 box = ? units)
                      </label>
                      <select
                        className="qx-input"
                        style={{ width: "100%" }}
                        value={yScaleUnit}
                        onChange={(e) => {
                          setYScaleUnit(Number(e.target.value));
                          setScaleApplied(false);
                        }}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                    <button
                      className="qx-btn qx-btn-sec"
                      onClick={autoSelectScale}
                    >
                      Auto-Select Scale
                    </button>
                    <button
                      className="qx-btn qx-btn-primary"
                      onClick={acceptScale}
                      style={{ flex: 1 }}
                    >
                      {scaleApplied ? "Scale Accepted ✓" : "Accept My Scale"}
                    </button>
                  </div>

                  <button
                    className="qx-btn qx-btn-primary"
                    disabled={!scaleApplied}
                    onClick={() => setStep(1)}
                  >
                    Start Graphing →
                  </button>
                </div>
              )}

              {step === 1 && (
                <div className="qx-card">
                  <div className="qx-badge">
                    <ListChecks size={14} /> Step 1 of 9
                  </div>
                  <h2
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 20,
                      fontWeight: 700,
                      marginBottom: 8,
                      color: "#0a0a0a",
                    }}
                  >
                    Create the Table Values
                  </h2>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#555",
                      marginBottom: 16,
                      lineHeight: 1.6,
                    }}
                  >
                    Substitute each value of x into the equation. Calculate the
                    y-value and type it in the box.
                  </p>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      marginBottom: 16,
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{
                            padding: 8,
                            border: "1px solid #f0f0f0",
                            background: "#fafafa",
                            fontFamily: "'Space Grotesk', sans-serif",
                          }}
                        >
                          x
                        </th>
                        {solved.tableData.map((row, i) => (
                          <th
                            key={i}
                            style={{
                              padding: 8,
                              border: "1px solid #f0f0f0",
                              background: "#fafafa",
                              fontFamily: "'JetBrains Mono', monospace",
                            }}
                          >
                            {row.x}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td
                          style={{
                            padding: 8,
                            border: "1px solid #f0f0f0",
                            fontWeight: 700,
                            fontFamily: "'Space Grotesk', sans-serif",
                          }}
                        >
                          y
                        </td>
                        {solved.tableData.map((row, i) => (
                          <td
                            key={i}
                            style={{ padding: 4, border: "1px solid #f0f0f0" }}
                          >
                            <input
                              className="qx-num-input"
                              style={{
                                width: "100%",
                                borderColor:
                                  Number(tableInputs[row.x]) === row.y
                                    ? COLORS.work
                                    : COLORS.line,
                              }}
                              value={tableInputs[row.x] || ""}
                              onChange={(e) =>
                                setTableInputs((prev) => ({
                                  ...prev,
                                  [row.x]: e.target.value,
                                }))
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                  <button
                    className="qx-btn qx-btn-primary"
                    disabled={!tableCorrect}
                    onClick={() => setStep(2)}
                  >
                    {tableCorrect
                      ? "Table Complete! Proceed to Plotting →"
                      : "Complete all rows correctly to continue"}
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="qx-card">
                  <div className="qx-badge">
                    <MousePointerClick size={14} /> Step 2 of 9
                  </div>
                  <h2
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 20,
                      fontWeight: 700,
                      marginBottom: 8,
                      color: "#0a0a0a",
                    }}
                  >
                    Plot Each Point by Clicking
                  </h2>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#555",
                      marginBottom: 16,
                      lineHeight: 1.6,
                    }}
                  >
                    Click on the graph paper to plot each (x, y) coordinate from
                    your table. (Ctrl+Z to undo a point.)
                  </p>
                  <div
                    style={{
                      background: COLORS.realSoft,
                      padding: 12,
                      borderRadius: 8,
                      marginBottom: 16,
                      fontSize: 14,
                      color: COLORS.real,
                      fontWeight: 600,
                    }}
                  >
                    Points Plotted: {plotState.points.length} /{" "}
                    {solved.tableData.length}
                  </div>
                  <button
                    className="qx-btn qx-btn-primary"
                    disabled={!pointsCorrect}
                    onClick={() => setStep(3)}
                  >
                    {pointsCorrect
                      ? "All Points Plotted! Identify Vertex →"
                      : "Plot all points on the graph"}
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="qx-card">
                  <div className="qx-badge">
                    <MousePointerClick size={14} /> Step 3 of 9
                  </div>
                  <h2
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 20,
                      fontWeight: 700,
                      marginBottom: 8,
                      color: "#0a0a0a",
                    }}
                  >
                    Identify the Vertex
                  </h2>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#555",
                      marginBottom: 16,
                      lineHeight: 1.6,
                    }}
                  >
                    Find the turning point (minimum or maximum). Click on that
                    exact point on the graph.
                  </p>
                  <div
                    style={{
                      background: COLORS.rememberSoft,
                      padding: 12,
                      borderRadius: 8,
                      marginBottom: 16,
                      fontSize: 14,
                      color: COLORS.remember,
                      fontWeight: 600,
                    }}
                  >
                    {vertexCorrect
                      ? "Vertex Identified!"
                      : "Click the turning point on the graph."}
                  </div>
                  <button
                    className="qx-btn qx-btn-primary"
                    disabled={!vertexCorrect}
                    onClick={() => setStep(4)}
                  >
                    {vertexCorrect
                      ? "Vertex Found! Draw the Curve →"
                      : "Identify the vertex to continue"}
                  </button>
                </div>
              )}

              {step === 4 && (
                <div className="qx-card">
                  <div className="qx-badge">
                    <Pencil size={14} /> Step 4 of 9
                  </div>
                  <h2
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 20,
                      fontWeight: 700,
                      marginBottom: 8,
                      color: "#0a0a0a",
                    }}
                  >
                    Draw the Smooth Curve
                  </h2>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#555",
                      marginBottom: 16,
                      lineHeight: 1.6,
                    }}
                  >
                    Click and drag to draw a smooth parabola that passes through
                    every plotted point and the vertex. Use the Big Pencil on
                    your phone, or the Eraser to fix mistakes.
                  </p>

                  <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                    <button
                      className="qx-btn qx-btn-sec"
                      style={{
                        flex: 1,
                        minWidth: 90,
                        background:
                          tool === "pencil" ? COLORS.workSoft : "#fff",
                        borderColor:
                          tool === "pencil" ? COLORS.work : COLORS.line,
                        color: tool === "pencil" ? COLORS.work : "#555",
                      }}
                      onClick={() => setTool("pencil")}
                    >
                      <Pencil size={16} /> Pencil
                    </button>
                    <button
                      className="qx-btn qx-btn-sec"
                      style={{
                        flex: 1,
                        minWidth: 90,
                        background:
                          tool === "big_pencil" ? COLORS.rememberSoft : "#fff",
                        borderColor:
                          tool === "big_pencil" ? COLORS.remember : COLORS.line,
                        color: tool === "big_pencil" ? COLORS.remember : "#555",
                      }}
                      onClick={() => setTool("big_pencil")}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="M15 5l4 4"/></svg>
                      Big ✏️
                    </button>
                    <button
                      className="qx-btn qx-btn-sec"
                      style={{
                        flex: 1,
                        minWidth: 90,
                        background:
                          tool === "eraser" ? "#ffe0e0" : "#fff",
                        borderColor:
                          tool === "eraser" ? "#e53935" : COLORS.line,
                        color: tool === "eraser" ? "#e53935" : "#555",
                      }}
                      onClick={() => setTool("eraser")}
                    >
                      <Eraser size={16} /> Eraser
                    </button>
                  </div>

                  <div
                    style={{
                      background: COLORS.workSoft,
                      padding: 12,
                      borderRadius: 8,
                      marginBottom: 16,
                      fontSize: 14,
                      color: COLORS.work,
                      fontWeight: 600,
                    }}
                  >
                    {curveAccurate
                      ? "Curve passes through all points accurately!"
                      : "Draw a smooth curve through all points and the vertex."}
                  </div>
                  <button
                    className="qx-btn qx-btn-primary"
                    disabled={!curveAccurate}
                    onClick={() => setStep(5)}
                  >
                    {curveAccurate
                      ? "Curve Drawn! Axis of Symmetry →"
                      : "Draw a smooth curve through all points"}
                  </button>
                </div>
              )}

              {step === 5 && (
                <div className="qx-card">
                  <div className="qx-badge">
                    <Ruler size={14} /> Step 5 of 9
                  </div>
                  <h2
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 20,
                      fontWeight: 700,
                      marginBottom: 8,
                      color: "#0a0a0a",
                    }}
                  >
                    Draw the Axis of Symmetry
                  </h2>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#555",
                      marginBottom: 16,
                      lineHeight: 1.6,
                    }}
                  >
                    Click and drag a vertical dashed line through the vertex.
                    This is the axis of symmetry: x = {fmt(solved.vertex.x)}.
                  </p>
                  <div
                    style={{
                      background: COLORS.rememberSoft,
                      padding: 12,
                      borderRadius: 8,
                      marginBottom: 16,
                      fontSize: 14,
                      color: COLORS.remember,
                      fontWeight: 600,
                    }}
                  >
                    {symmetryCorrect
                      ? "Axis of symmetry drawn correctly!"
                      : "Draw a vertical dashed line through the vertex."}
                  </div>
                  <button
                    className="qx-btn qx-btn-primary"
                    disabled={!symmetryCorrect}
                    onClick={() => setStep(6)}
                  >
                    {symmetryCorrect
                      ? "Symmetry Drawn! Mark Intercepts →"
                      : "Draw the axis of symmetry to continue"}
                  </button>
                </div>
              )}

              {step === 6 && (
                <div className="qx-card">
                  <div className="qx-badge">
                    <MousePointerClick size={14} /> Step 6 of 9
                  </div>
                  <h2
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 20,
                      fontWeight: 700,
                      marginBottom: 8,
                      color: "#0a0a0a",
                    }}
                  >
                    Mark the Intercepts
                  </h2>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#555",
                      marginBottom: 16,
                      lineHeight: 1.6,
                    }}
                  >
                    Click to mark the y-intercept and all x-intercepts (roots)
                    on the graph.
                  </p>
                  <div
                    style={{
                      background: COLORS.realSoft,
                      padding: 12,
                      borderRadius: 8,
                      marginBottom: 16,
                      fontSize: 14,
                      color: COLORS.real,
                      fontWeight: 600,
                    }}
                  >
                    {interceptsCorrect
                      ? "All intercepts marked!"
                      : "Click the y-intercept and all roots on the graph."}
                  </div>
                  <button
                    className="qx-btn qx-btn-primary"
                    disabled={!interceptsCorrect}
                    onClick={() => setStep(7)}
                  >
                    {interceptsCorrect
                      ? "Intercepts Marked! Read Values →"
                      : "Mark all intercepts to continue"}
                  </button>
                </div>
              )}

              {step === 7 && (
                <div className="qx-card">
                  <div className="qx-badge">
                    <HelpCircle size={14} /> Step 7 of 9
                  </div>
                  <h2
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 20,
                      fontWeight: 700,
                      marginBottom: 8,
                      color: "#0a0a0a",
                    }}
                  >
                    Read a Value from the Graph
                  </h2>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#555",
                      marginBottom: 16,
                      lineHeight: 1.6,
                    }}
                  >
                    {readValueQuestion
                      ? `When x = ${readValueQuestion.x}, what is y? Read it from your graph.`
                      : "Loading question..."}
                  </p>
                  <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
                    <span style={{ fontWeight: 600 }}>y =</span>
                    <input
                      className="qx-num-input"
                      type="number"
                      style={{ width: 64 }}
                      value={readValueInput}
                      onChange={(e) => setReadValueInput(e.target.value)}
                    />
                  </div>
                  <button
                    className="qx-btn qx-btn-primary"
                    disabled={!readValueCorrect}
                    onClick={() => setStep(8)}
                  >
                    {readValueCorrect
                      ? "Correct! Direction of Opening →"
                      : "Type the correct y-value to continue"}
                  </button>
                </div>
              )}

              {step === 8 && (
                <div className="qx-card">
                  <div className="qx-badge">
                    <HelpCircle size={14} /> Step 8 of 9
                  </div>
                  <h2
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 20,
                      fontWeight: 700,
                      marginBottom: 8,
                      color: "#0a0a0a",
                    }}
                  >
                    Direction of Opening
                  </h2>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#555",
                      marginBottom: 16,
                      lineHeight: 1.6,
                    }}
                  >
                    Does the parabola open upwards or downwards?
                  </p>
                  <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                    <button
                      className="qx-btn qx-btn-sec"
                      style={{
                        background: dirAnswer === "up" ? COLORS.workSoft : "#fff",
                        borderColor: dirAnswer === "up" ? COLORS.work : COLORS.line,
                        color: dirAnswer === "up" ? COLORS.work : "#555",
                      }}
                      onClick={() => setDirAnswer("up")}
                    >
                      Opens Upward ↑
                    </button>
                    <button
                      className="qx-btn qx-btn-sec"
                      style={{
                        background: dirAnswer === "down" ? COLORS.workSoft : "#fff",
                        borderColor: dirAnswer === "down" ? COLORS.work : COLORS.line,
                        color: dirAnswer === "down" ? COLORS.work : "#555",
                      }}
                      onClick={() => setDirAnswer("down")}
                    >
                      Opens Downward ↓
                    </button>
                  </div>
                  <button
                    className="qx-btn qx-btn-primary"
                    disabled={!dirCorrect}
                    onClick={() => setStep(9)}
                  >
                    {dirCorrect
                      ? "Correct! View Final Graph →"
                      : "Select the correct direction to continue"}
                  </button>
                </div>
              )}

              {step === 9 && (
                <div className="qx-card">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    <CheckCircle2 size={20} color={COLORS.work} />
                    <h2
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: 20,
                        fontWeight: 700,
                        color: COLORS.work,
                        margin: 0,
                      }}
                    >
                      Graph Complete!
                    </h2>
                  </div>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#555",
                      marginBottom: 16,
                      lineHeight: 1.6,
                    }}
                  >
                    Your graph of y = {av}x² {bv >= 0 ? `+ ${bv}` : `- ${Math.abs(bv)}`}x {cv >= 0 ? `+ ${cv}` : `- ${Math.abs(cv)}`} is
                    complete with all key features marked. Now you can ask the AI any questions about this graph!
                  </p>
                  <button
                    className="qx-btn qx-btn-sec"
                    onClick={resetWizard}
                  >
                    <RotateCcw size={16} /> Start New Graph
                  </button>
                </div>
              )}

              {/* ── AI Chat Section (ONLY after step 9 — graph complete) ── */}
              {step === 9 && (
                <div className="qx-card" style={{ marginTop: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    <MessageCircle size={16} color="#1a237e" />
                    <div
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 700,
                        fontSize: 15,
                        color: "#0a0a0a",
                      }}
                    >
                      Ask Nairafame AI
                    </div>
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#555",
                      marginBottom: 12,
                      lineHeight: 1.5,
                    }}
                  >
                    Ask about this quadratic equation. The AI can highlight
                    points and trace values directly on your graph!
                  </p>

                  <div
                    style={{
                      maxHeight: 240,
                      overflowY: "auto",
                      marginBottom: 12,
                      padding: "8px 0",
                    }}
                  >
                    {chatMessages.length === 0 && (
                      <div
                        style={{
                          fontSize: 13,
                          color: "#999",
                          textAlign: "center",
                          padding: 16,
                        }}
                      >
                        Try: "What is y when x = 3?" or "Show me the roots"
                      </div>
                    )}
                    {chatMessages.map((msg, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent:
                            msg.role === "user" ? "flex-end" : "flex-start",
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            maxWidth: "85%",
                            padding: "8px 12px",
                            borderRadius: 12,
                            fontSize: 13,
                            lineHeight: 1.5,
                            whiteSpace: "pre-wrap",
                            background:
                              msg.role === "user" ? "#1a237e" : "#f0f2f8",
                            color:
                              msg.role === "user" ? "#fff" : "#0a0a0a",
                          }}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div
                        style={{
                          fontSize: 13,
                          color: "#999",
                          padding: "4px 0",
                        }}
                      >
                        Thinking...
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      style={{
                        flex: 1,
                        border: "1.5px solid #f0f0f0",
                        borderRadius: 8,
                        padding: "10px 12px",
                        fontSize: 14,
                        outline: "none",
                        fontFamily: "'Inter', sans-serif",
                      }}
                      placeholder="Ask about this graph..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !chatLoading)
                          handleChatSubmit();
                      }}
                      disabled={chatLoading}
                    />
                    <button
                      className="qx-btn qx-btn-primary"
                      style={{ width: "auto", padding: "10px 16px" }}
                      onClick={handleChatSubmit}
                      disabled={chatLoading || !chatInput.trim()}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* ── AI Locked Message (shown before step 9) ── */}
              {step >= 1 && step < 9 && (
                <div className="qx-card" style={{ marginTop: 16, opacity: 0.6 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <MessageCircle size={16} color="#999" />
                    <div
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 700,
                        fontSize: 15,
                        color: "#999",
                      }}
                    >
                      AI Tutor
                    </div>
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#999",
                      lineHeight: 1.5,
                    }}
                  >
                    🔒 Complete all 9 steps to unlock the AI tutor. It can answer questions and highlight points on your graph!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showsavemodal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignitems: "center",
            justifycontent: "center",
            zindex: 1000,
          }}
          onclick={() => !saving && setshowsavemodal(false)}
        >
          <div
            classname="qx-card"
            style={{ width: 360, maxwidth: "90vw" }}
            onclick={(e) => e.stoppropagation()}
          >
            <h3
              style={{
                fontfamily: "'space grotesk', sans-serif",
                fontweight: 700,
                fontsize: 18,
                marginbottom: 12,
              }}
            >
              save your progress
            </h3>
            <input
              classname="qx-input"
              style={{ width: "100%", textalign: "left", marginbottom: 16 }}
              value={savetitle}
              onchange={(e) => setsavetitle(e.target.value)}
              placeholder="give it a name..."
            />
            {savemsg && (
              <div
                style={{
                  fontsize: 13,
                  marginbottom: 12,
                  color: savemsg === "saved!" ? colors.work : "#c62828",
                  fontweight: 600,
                }}
              >
                {savemsg}
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                classname="qx-btn qx-btn-sec"
                onclick={() => setshowsavemodal(false)}
                disabled={saving}
              >
                cancel
              </button>
              <button
                classname="qx-btn qx-btn-primary"
                onclick={handlesaveconfirm}
                disabled={saving}
              >
                {saving ? "saving..." : "save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
