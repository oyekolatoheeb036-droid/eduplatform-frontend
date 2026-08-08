import React from "react";

// ============================================================================
// VennDiagram.jsx
// Renders a labelled Venn diagram (2-set or 3-set) from a solved region list
// produced by setTheorySolver.js. Matches the visual language used in the
// Week 7/8 tutor notes: a boxed universal set, labelled circles, and the
// actual number written inside each region (not just abstract shading).
//
// Two reveal modes, matching the two solving methods students can choose:
//   - "progressive": only regions listed in `visibleRegionIds` show a number;
//     everything else shows a soft placeholder. Used by the Region Method,
//     where the diagram fills in one piece at a time as the student solves.
//   - "full" (default when visibleRegionIds is omitted): every region shows
//     its number immediately. Used by the Formula Method, where the student
//     solves algebraically first and the diagram appears complete at the end.
//
// This component only draws — it takes already-solved numbers as input and
// never computes anything itself, so it can't introduce a math error.
// ============================================================================

const COLORS = {
  ink: "#0a0a0a",
  inkSoft: "#555555",
  line: "#f0f0f0",
  rule: "#1a237e", // navy
  ruleSoft: "#E8EAF6",
  work: "#2e7d32", // green
  workSoft: "#E8F5E9",
  remember: "#ff6f00", // orange
  rememberSoft: "#FFF3E0",
  circleFill: "rgba(26, 35, 126, 0.06)",
  circleStroke: "#1a237e",
  boxStroke: "#1a237e",
  placeholder: "#c7cbe0",
  highlightFill: "rgba(255, 111, 0, 0.22)",
  highlightStroke: "#ff6f00",
};

const FONT_HEADING = "'Space Grotesk', sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";

// ---------------------------------------------------------------------------
// Fixed geometry — hand-tuned so labels never overlap the circle outlines,
// matching the layout style shown in the tutor note (set label at top of
// each circle, region counts inside, "U=" at the top-left of the box).
// ---------------------------------------------------------------------------

const LAYOUT_2 = {
  viewBox: "0 0 520 420",
  box: { x: 30, y: 30, w: 460, h: 360 },
  universalLabelPos: { x: 46, y: 56 },
  circles: [
    { id: "A", cx: 220, cy: 210, r: 130 },
    { id: "B", cx: 330, cy: 210, r: 130 },
  ],
  setLabelPos: {
    A: { x: 150, y: 100 },
    B: { x: 400, y: 100 },
  },
  regionLabelPos: {
    A: { x: 165, y: 210 }, // only A
    B: { x: 385, y: 210 }, // only B
    AB: { x: 275, y: 210 }, // A ∩ B
    none: { x: 440, y: 350 }, // outside both, inside box
  },
};

const LAYOUT_3 = {
  viewBox: "0 0 600 520",
  box: { x: 30, y: 30, w: 540, h: 440 },
  universalLabelPos: { x: 46, y: 56 },
  circles: [
    { id: "A", cx: 250, cy: 210, r: 140 },
    { id: "B", cx: 380, cy: 210, r: 140 },
    { id: "C", cx: 315, cy: 320, r: 140 },
  ],
  setLabelPos: {
    A: { x: 150, y: 100 },
    B: { x: 460, y: 100 },
    C: { x: 315, y: 458 },
  },
  regionLabelPos: {
    A: { x: 175, y: 165 }, // only A
    B: { x: 460, y: 165 }, // only B
    C: { x: 315, y: 412 }, // only C
    AB: { x: 315, y: 150 }, // A ∩ B only
    AC: { x: 230, y: 300 }, // A ∩ C only
    BC: { x: 400, y: 300 }, // B ∩ C only
    ABC: { x: 315, y: 240 }, // A ∩ B ∩ C
    none: { x: 530, y: 70 }, // outside all, inside box
  },
};

function getLayout(numSets) {
  return numSets === 2 ? LAYOUT_2 : LAYOUT_3;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
// Props:
//   numSets            2 | 3
//   regionList          [{ id, label, value }, ...]  from solveSetProblem()
//   setLabels           { A: "Physics", B: "Geography", C: "Economics" }
//                        optional — defaults to the letters themselves
//   universalValue       number | null — shown as "U = n" if provided
//   visibleRegionIds     string[] | null — omit to reveal everything (Formula
//                        Method); pass a growing list to reveal progressively
//                        (Region Method)
//   highlightRegionIds   string[] — regions to shade (e.g. the "find" target)
//   width                optional override, defaults to responsive 100%

export default function VennDiagram({
  numSets,
  regionList,
  setLabels = {},
  universalValue = null,
  visibleRegionIds = null,
  highlightRegionIds = [],
}) {
  const layout = getLayout(numSets);
  const regionsById = {};
  (regionList || []).forEach((r) => {
    regionsById[r.id] = r.value;
  });

  const isVisible = (id) => visibleRegionIds === null || visibleRegionIds.includes(id);
  const isHighlighted = (id) => highlightRegionIds.includes(id);

  const setIds = numSets === 2 ? ["A", "B"] : ["A", "B", "C"];

  return (
    <div style={{ width: "100%" }}>
      <svg
        viewBox={layout.viewBox}
        style={{ width: "100%", height: "auto", display: "block", background: "#FFFFFF" }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=JetBrains+Mono:wght@600;700&display=swap');
        `}</style>

        {/* Universal set box */}
        <rect
          x={layout.box.x}
          y={layout.box.y}
          width={layout.box.w}
          height={layout.box.h}
          fill="none"
          stroke={COLORS.boxStroke}
          strokeWidth="2"
          rx="4"
        />
        <text
          x={layout.universalLabelPos.x}
          y={layout.universalLabelPos.y}
          fontFamily={FONT_HEADING}
          fontWeight="700"
          fontSize="18"
          fill={COLORS.ink}
        >
          {universalValue !== null ? `U = ${universalValue}` : "U"}
        </text>

        {/* Circles */}
        {layout.circles.map((c) => (
          <circle
            key={c.id}
            cx={c.cx}
            cy={c.cy}
            r={c.r}
            fill={COLORS.circleFill}
            stroke={COLORS.circleStroke}
            strokeWidth="2"
          />
        ))}

        {/* Set name labels (top of each circle) */}
        {setIds.map((id) => (
          <text
            key={"setlabel-" + id}
            x={layout.setLabelPos[id].x}
            y={layout.setLabelPos[id].y}
            fontFamily={FONT_HEADING}
            fontWeight="700"
            fontSize="20"
            fill={COLORS.rule}
            textAnchor="middle"
          >
            {setLabels[id] || id}
          </text>
        ))}

        {/* Region values (or placeholders if not yet revealed) */}
        {Object.keys(layout.regionLabelPos).map((regionId) => {
          const pos = layout.regionLabelPos[regionId];
          const value = regionsById[regionId];
          const shown = isVisible(regionId) && value !== undefined && value !== null;
          const highlighted = isHighlighted(regionId);

          return (
            <g key={"region-" + regionId}>
              {highlighted && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="26"
                  fill={COLORS.highlightFill}
                  stroke={COLORS.highlightStroke}
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
              )}
              {shown ? (
                <text
                  x={pos.x}
                  y={pos.y + 6}
                  fontFamily={FONT_MONO}
                  fontWeight="700"
                  fontSize="20"
                  fill={highlighted ? COLORS.remember : COLORS.ink}
                  textAnchor="middle"
                >
                  {value}
                </text>
              ) : (
                <text
                  x={pos.x}
                  y={pos.y + 6}
                  fontFamily={FONT_MONO}
                  fontWeight="700"
                  fontSize="20"
                  fill={COLORS.placeholder}
                  textAnchor="middle"
                >
                  ?
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper: ordered reveal sequence for the Region Method
// ---------------------------------------------------------------------------
// Returns region ids in the order a student would typically solve them by
// hand — innermost (the full overlap) outward, ending with "none" last,
// since that's usually the final subtraction step in both worked examples
// in the tutor note (Hausa/Igbo, Cassette/Records/Live-music).

export function getRegionRevealOrder(numSets) {
  if (numSets === 2) return ["AB", "A", "B", "none"];
  return ["ABC", "AB", "AC", "BC", "A", "B", "C", "none"];
}