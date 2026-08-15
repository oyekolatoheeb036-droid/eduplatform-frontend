// ============================================================================
// setTheorySolver.js
// Deterministic Set Theory / Venn Diagram solver for WAEC/JAMB-style problems.
// Pure JavaScript — no AI, no network calls. Every number produced here is
// mathematically guaranteed correct given consistent input, which is why the
// AI tutor is never allowed to do the actual arithmetic in this tool.
//
// Supports:
//   - 2-set problems (4 regions: only A, only B, A∩B, outside both)
//   - 3-set problems (8 regions: only A, only B, only C, A∩B only,
//     A∩C only, B∩C only, A∩B∩C, outside all)
//   - Any known clue expressed in standard set notation, e.g.
//       "A", "A∩B", "A∩B∩C", "A'", "A∩B'", "(A∪B)'", "U"
//   - Any "find" target expressed the same way, e.g. "A∩B'∩C'", "(A∪B∪C)'"
//   - Algebraic clues where a region is tied to an unknown instead of a
//     plain number, e.g. "x study all three subjects and 2x study none" —
//     the unknown is solved as part of the same linear system, not as a
//     separate algebra step (see parseLinearExpression below)
//   - RELATIONAL clues that tie two regions together directly, e.g.
//       "11 more customers bought shoes than bags" ->
//       { expr: "B∩A' - A∩B'", value: 11 }
//     (see parseLinearRegionExpression below — new in this version)
//   - ELEMENT-LEVEL problems where the sets are given as actual lists of
//     elements (e.g. A = {1,3,5,7,9,11}) rather than plain counts, so the
//     tutor can list out and count the exact elements in any region or any
//     "find" expression instead of just returning a number
//     (see classifyElements / evaluateExpressionElements / solveElementSetProblem
//     below — new in this version)
//
// The count-based engine works by representing every possible region as a
// row in a truth table over the input sets (A, B, [C]), then solving a
// linear system: each known clue becomes one equation (a linear combination
// of regions = a linear combination of unknowns + a constant), solved by
// Gaussian elimination. This is why "full flexible shading" works for ANY
// region combination or relationship, not just a fixed list of pre-coded
// cases.
//
// The element-level engine is a straightforward classifier: given the real
// contents of A, B, (C) and (optionally) the universal set, every element is
// sorted into exactly one region by direct membership testing — no linear
// algebra needed there, since nothing is unknown.
// ============================================================================

// ---------------------------------------------------------------------------
// Region tables
// ---------------------------------------------------------------------------
// Each region is one row of the truth table over the sets in play.
// id        -> short internal key
// label     -> human-readable label for UI / diagram legend
// a,b,(c)   -> 1 if this region lies inside that set, 0 otherwise

const REGIONS_2 = [
  { id: "none", label: "Outside A and B", a: 0, b: 0 },
  { id: "A", label: "Only A", a: 1, b: 0 },
  { id: "B", label: "Only B", a: 0, b: 1 },
  { id: "AB", label: "A ∩ B", a: 1, b: 1 },
];

const REGIONS_3 = [
  { id: "none", label: "Outside A, B and C", a: 0, b: 0, c: 0 },
  { id: "A", label: "Only A", a: 1, b: 0, c: 0 },
  { id: "B", label: "Only B", a: 0, b: 1, c: 0 },
  { id: "C", label: "Only C", a: 0, b: 0, c: 1 },
  { id: "AB", label: "A ∩ B only", a: 1, b: 1, c: 0 },
  { id: "AC", label: "A ∩ C only", a: 1, b: 0, c: 1 },
  { id: "BC", label: "B ∩ C only", a: 0, b: 1, c: 1 },
  { id: "ABC", label: "A ∩ B ∩ C", a: 1, b: 1, c: 1 },
];

function getRegions(numSets) {
  if (numSets === 2) return REGIONS_2;
  if (numSets === 3) return REGIONS_3;
  throw new Error("setTheorySolver only supports 2 or 3 sets.");
}

// ---------------------------------------------------------------------------
// Expression parser
// ---------------------------------------------------------------------------
// Grammar (standard set notation):
//   expr    := term ("∪" term)*
//   term    := factor ("∩" factor)*
//   factor  := primary "'"*        (zero or more complements, e.g. A'' = A)
//   primary := SETNAME | "U" | "(" expr ")"
//
// Accepts ∩ ∪ directly, and also plain-ASCII fallbacks so AI-generated
// output (which may not always produce the unicode symbols) still parses:
//   "^" or "&"  -> ∩ (intersection)
//   "|"         -> ∪ (union)
//   "'"         -> complement
//
// Returns a boolean array over the region table: true for every region
// included in the expression's meaning.

function normalizeExpr(expr) {
  return String(expr)
    .trim()
    .replace(/\s+/g, "")
    .replace(/\^|&/g, "∩")
    .replace(/\|/g, "∪");
}

function parseSetExpression(expr, numSets) {
  const regions = getRegions(numSets);
  const validSets = numSets === 2 ? ["A", "B"] : ["A", "B", "C"];
  const src = normalizeExpr(expr);
  let pos = 0;

  function peek() {
    return src[pos];
  }
  function error(msg) {
    throw new Error(`Could not parse set expression "${expr}": ${msg} (at position ${pos})`);
  }

  function parsePrimary() {
    const ch = peek();
    if (ch === "(") {
      pos++;
      const inner = parseExprInternal();
      if (peek() !== ")") error("expected closing ')'");
      pos++;
      return inner;
    }
    if (ch === "U") {
      pos++;
      return regions.map(() => true);
    }
    if (ch && validSets.includes(ch.toUpperCase())) {
      const setName = ch.toUpperCase();
      pos++;
      const key = setName.toLowerCase(); // 'a' | 'b' | 'c'
      return regions.map((r) => r[key] === 1);
    }
    error(`unexpected character "${ch}"`);
  }

  function parseFactor() {
    let mask = parsePrimary();
    while (peek() === "'") {
      pos++;
      mask = mask.map((v) => !v);
    }
    return mask;
  }

  function parseTerm() {
    let mask = parseFactor();
    while (peek() === "∩") {
      pos++;
      const rhs = parseFactor();
      mask = mask.map((v, i) => v && rhs[i]);
    }
    return mask;
  }

  function parseExprInternal() {
    let mask = parseTerm();
    while (peek() === "∪") {
      pos++;
      const rhs = parseTerm();
      mask = mask.map((v, i) => v || rhs[i]);
    }
    return mask;
  }

  if (!src) error("empty expression");
  const result = parseExprInternal();
  if (pos !== src.length) error(`unexpected trailing characters "${src.slice(pos)}"`);
  return result; // boolean[] aligned with regions array
}

// ---------------------------------------------------------------------------
// NEW: Linear region-combination parser
// ---------------------------------------------------------------------------
// Real word problems ("11 more customers bought shoes than bags") relate
// TWO regions to each other directly, rather than pinning one region to a
// number. This parser extends the set-expression grammar with top-level
// "+" and "-" (and optional numeric coefficients), so a clue's LEFT-HAND
// side can be a linear combination of set expressions:
//
//     "B∩A' - A∩B'"      -> (shoes only) - (bags only)
//     "2(A∩B∩C)"          -> twice the "all three" region
//     "A∩B'∩C' - B∩A'∩C'" -> (only A) - (only B)
//
// A plain set expression like "A∩B" still parses exactly as before (single
// term, coefficient 1) — this is a strict superset of parseSetExpression,
// so every existing clue keeps working unchanged.
//
// Returns a NUMBER array over the region table (not boolean), aligned with
// getRegions(numSets).

function splitTopLevelAdditiveTerms(src) {
  const terms = [];
  let depth = 0;
  let i = 0;
  let sign = 1;
  let termStart = 0;

  if (src[0] === "+" || src[0] === "-") {
    sign = src[0] === "-" ? -1 : 1;
    i = 1;
    termStart = 1;
  }

  for (; i < src.length; i++) {
    const ch = src[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    else if (depth === 0 && (ch === "+" || ch === "-")) {
      terms.push({ sign, text: src.slice(termStart, i) });
      sign = ch === "-" ? -1 : 1;
      termStart = i + 1;
    }
  }
  terms.push({ sign, text: src.slice(termStart) });
  return terms;
}

// Detailed version — same parsing as above, but keeps each term's own mask
// and set-notation text around (instead of collapsing straight to a single
// coefficient vector), so a step-by-step explanation can be built from it.
// parseLinearRegionExpression() below is just this with only `.coeffs` kept,
// so nothing about the original behaviour changes.

function parseLinearRegionExpressionDetailed(expr, numSets) {
  const regions = getRegions(numSets);
  const src = normalizeExpr(expr);
  if (!src) throw new Error(`Empty region expression "${expr}".`);

  const rawTerms = splitTopLevelAdditiveTerms(src);
  const terms = rawTerms.map(({ sign, text }) => {
    if (!text) {
      throw new Error(`Could not parse region expression "${expr}": empty term.`);
    }
    const coeffMatch = text.match(/^(\d+(?:\.\d+)?)\*?/);
    let coeff = 1;
    let setPart = text;
    if (coeffMatch && coeffMatch[1] !== undefined) {
      coeff = Number(coeffMatch[1]);
      setPart = text.slice(coeffMatch[0].length);
    }
    if (!setPart) {
      throw new Error(
        `Could not parse region expression "${expr}": term "${text}" has no set part.`
      );
    }
    const mask = parseSetExpression(setPart, numSets);
    return { sign, coeff, setPart, mask };
  });

  const coeffs = new Array(regions.length).fill(0);
  terms.forEach(({ sign, coeff, mask }) => {
    mask.forEach((included, i) => {
      if (included) coeffs[i] += sign * coeff;
    });
  });

  return { terms, coeffs };
}

function parseLinearRegionExpression(expr, numSets) {
  return parseLinearRegionExpressionDetailed(expr, numSets).coeffs; // number[] aligned with regions
}

// ---------------------------------------------------------------------------
// NEW: Step-by-step expression explainer (deterministic — no AI)
// ---------------------------------------------------------------------------
// This is the engine behind the "Ask the Solver" free-expression panel: the
// student builds ANY set expression with the symbol palette (e.g. "C∩A'",
// "A'∩(B∪C)", "B∩A'-A∩B'"), and this walks it region-by-region and returns
// a plain-English working, using the ALREADY-SOLVED region counts — it never
// recomputes or estimates anything, so it can never produce the kind of
// arithmetic drift an AI narrating from scratch can.
//
// Input:
//   expr:        the expression as typed, e.g. "C∩A'"
//   numSets:     2 | 3
//   regionsById: solved counts, e.g. { none, A, B, C, AB, AC, BC, ABC }
//                (this is exactly solveSetProblem(...).regions)
//   setLabels:   optional { A, B, C } custom names, e.g. { A: "Bags", B: "Shoes" } —
//                purely cosmetic, substituted into the step text only
//
// Output:
//   { success: true, expr, value, steps: [string, ...] }
//   { success: false, error, expr }

function formatRegionLabel(label, setLabels) {
  if (!setLabels) return label;
  return label
    .replace(/\bA\b/g, setLabels.A || "A")
    .replace(/\bB\b/g, setLabels.B || "B")
    .replace(/\bC\b/g, setLabels.C || "C");
}

function explainExpression(expr, numSets, regionsById, setLabels = null) {
  const regions = getRegions(numSets);

  let detailed;
  try {
    detailed = parseLinearRegionExpressionDetailed(expr, numSets);
  } catch (err) {
    return { success: false, error: err.message, expr };
  }

  const termSummaries = detailed.terms.map((term) => {
    const included = regions.filter((r, i) => term.mask[i]);
    const parts = included.map((r) => ({
      label: formatRegionLabel(r.label, setLabels),
      value: round(Number(regionsById[r.id] ?? 0)),
    }));
    const sum = round(parts.reduce((s, p) => s + p.value, 0));
    return { ...term, parts, sum };
  });

  const steps = termSummaries.map((t) => {
    if (t.parts.length === 0) {
      return `${t.setPart} matches no regions here, so it contributes 0.`;
    }
    if (t.parts.length === 1) {
      return `${t.setPart} = ${t.parts[0].label} = ${t.parts[0].value}`;
    }
    const breakdown = t.parts.map((p) => `${p.label} (${p.value})`).join(" + ");
    return `${t.setPart} = ${breakdown} = ${t.sum}`;
  });

  let total = 0;
  const comboPieces = termSummaries.map((t, idx) => {
    const signedVal = t.sign * t.coeff * t.sum;
    total += signedVal;
    const coeffTxt = t.coeff !== 1 ? `${t.coeff}×` : "";
    const magnitude = `${coeffTxt}${t.sum}`;
    if (idx === 0) return t.sign < 0 ? `−${magnitude}` : magnitude;
    return t.sign < 0 ? ` − ${magnitude}` : ` + ${magnitude}`;
  });
  total = round(total);

  if (termSummaries.length > 1) {
    steps.push(`Combine the terms: ${expr} = ${comboPieces.join("")} = ${total}`);
  } else {
    steps.push(`So ${expr} = ${total}`);
  }

  return {
    success: true,
    error: null,
    expr,
    value: total,
    steps,
  };
}

// ---------------------------------------------------------------------------
// Linear expression parser (for algebraic clues)
// ---------------------------------------------------------------------------
// Many real WAEC/JAMB questions tie two regions together algebraically
// instead of giving each a plain number, e.g.:
//   "x study all 3 subjects and 2x study none of the three subjects"
// Here the region A∩B∩C isn't a known number — it's "x" — and the "none"
// region is "2x". This parser reads the right-hand side of a clue as a
// linear expression in named unknowns, e.g. "x", "2x", "x+3", "2x-1", "40".
//
// Returns { constant: number, coeffs: { x: 2, y: -1, ... } }

function parseLinearExpression(input) {
  if (typeof input === "number") return { constant: input, coeffs: {} };

  const src = String(input).trim().replace(/\s+/g, "");
  if (src === "") throw new Error("Empty value in clue.");

  // Split into signed terms without losing the sign, e.g. "2x-3+y" ->
  // ["+2x", "-3", "+y"]
  const withSign = src[0] === "+" || src[0] === "-" ? src : "+" + src;
  const terms = withSign.match(/[+-][^+-]+/g);
  if (!terms) throw new Error(`Could not parse value "${input}".`);

  const result = { constant: 0, coeffs: {} };

  for (const rawTerm of terms) {
    const sign = rawTerm[0] === "-" ? -1 : 1;
    const body = rawTerm.slice(1);
    const match = body.match(/^(\d+(?:\.\d+)?)?([a-zA-Z]+)?$/);
    if (!match) throw new Error(`Could not parse term "${rawTerm}" in value "${input}".`);
    const [, numPart, varPart] = match;

    if (varPart) {
      const coeff = numPart !== undefined ? Number(numPart) : 1;
      result.coeffs[varPart] = (result.coeffs[varPart] || 0) + sign * coeff;
    } else if (numPart !== undefined) {
      result.constant += sign * Number(numPart);
    } else {
      throw new Error(`Could not parse term "${rawTerm}" in value "${input}".`);
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Named-clue convenience map (for guided-form UI, so the frontend can just
// send plain fields like { universal: 40, nA: 25, nB: 18 } without students
// or your form code needing to know set notation).
// ---------------------------------------------------------------------------

const NAMED_CLUE_EXPRESSIONS_2 = {
  universal: "U",
  nA: "A",
  nB: "B",
  nAB: "A∩B",
  nAOnly: "A∩B'",
  nBOnly: "B∩A'",
  nNone: "A'∩B'",
  nUnion: "A∪B",
};

const NAMED_CLUE_EXPRESSIONS_3 = {
  universal: "U",
  nA: "A",
  nB: "B",
  nC: "C",
  nAB: "A∩B",
  nAC: "A∩C",
  nBC: "B∩C",
  nABC: "A∩B∩C",
  nAOnly: "A∩B'∩C'",
  nBOnly: "B∩A'∩C'",
  nCOnly: "C∩A'∩B'",
  nNone: "A'∩B'∩C'",
  nUnion: "A∪B∪C",
};

function getNamedClueMap(numSets) {
  return numSets === 2 ? NAMED_CLUE_EXPRESSIONS_2 : NAMED_CLUE_EXPRESSIONS_3;
}

// Converts { nA: 25, nB: 18, universal: 40, nABC: "x", nNone: "2x" } into
// clue objects, skipping any keys that are null/undefined/empty string.
// Values may be plain numbers OR algebraic strings like "x" / "2x" / "x+3"
// for problems that tie regions together with an unknown (see
// parseLinearExpression above).
function namedValuesToClues(numSets, namedValues) {
  const map = getNamedClueMap(numSets);
  const clues = [];
  for (const key of Object.keys(namedValues || {})) {
    const val = namedValues[key];
    if (val === null || val === undefined || val === "") continue;
    if (!map[key]) continue; // ignore unknown keys rather than throwing
    clues.push({ expr: map[key], value: val });
  }
  return clues;
}

// ---------------------------------------------------------------------------
// Gaussian elimination with partial pivoting
// ---------------------------------------------------------------------------
// Solves A x = b for x, where A is R x N (R clues, N regions).
// Handles non-square systems:
//   - If rank == N: fully determined, returns the unique solution.
//   - If rank < N: underdetermined, returns which region indices are free
//     (could not be resolved from the given clues).
//   - If a row reduces to 0 = nonzero: inconsistent clues, returns an error.

function gaussianSolve(A, b) {
  const R = A.length;
  const N = R > 0 ? A[0].length : 0;

  // Build augmented matrix as floats
  const M = A.map((row, i) => [...row.map(Number), Number(b[i])]);

  let pivotRow = 0;
  const pivotColForRow = new Array(R).fill(-1);

  for (let col = 0; col < N && pivotRow < R; col++) {
    // Find best pivot in this column at/below pivotRow
    let maxRow = pivotRow;
    let maxVal = Math.abs(M[pivotRow][col]);
    for (let r = pivotRow + 1; r < R; r++) {
      if (Math.abs(M[r][col]) > maxVal) {
        maxVal = Math.abs(M[r][col]);
        maxRow = r;
      }
    }
    if (maxVal < 1e-9) continue; // no pivot in this column, move to next column

    [M[pivotRow], M[maxRow]] = [M[maxRow], M[pivotRow]];

    const pivotVal = M[pivotRow][col];
    for (let c = col; c <= N; c++) M[pivotRow][c] /= pivotVal;

    for (let r = 0; r < R; r++) {
      if (r === pivotRow) continue;
      const factor = M[r][col];
      if (Math.abs(factor) < 1e-12) continue;
      for (let c = col; c <= N; c++) M[r][c] -= factor * M[pivotRow][c];
    }

    pivotColForRow[pivotRow] = col;
    pivotRow++;
  }

  const rank = pivotRow;

  // Check for inconsistency: a row with all-zero coefficients but nonzero RHS
  for (let r = rank; r < R; r++) {
    const rhs = M[r][N];
    const allZero = M[r].slice(0, N).every((v) => Math.abs(v) < 1e-9);
    if (allZero && Math.abs(rhs) > 1e-6) {
      return {
        consistent: false,
        solved: false,
        error:
          "The given values contradict each other — please double check the numbers in the problem.",
      };
    }
  }

  const resolvedCols = new Set(pivotColForRow.filter((c) => c >= 0));
  let freeCols = [];
  for (let c = 0; c < N; c++) if (!resolvedCols.has(c)) freeCols.push(c);

  // A pivot variable is only GENUINELY determined if its row has zero
  // coefficient on every free column. If a "resolved" row still has a
  // nonzero coefficient on a free variable, that pivot variable actually
  // depends on the unresolved free variable too — it must be demoted to
  // unresolved rather than reported as a specific (wrong) number.
  // This loop repeats because demoting one variable can, in principle,
  // reveal that another previously-"clean" pivot row also touches it.
  let changed = true;
  while (changed) {
    changed = false;
    for (let r = 0; r < rank; r++) {
      const col = pivotColForRow[r];
      if (col < 0 || !resolvedCols.has(col)) continue;
      const dependsOnFree = freeCols.some((fc) => Math.abs(M[r][fc]) > 1e-9);
      if (dependsOnFree) {
        resolvedCols.delete(col);
        freeCols.push(col);
        changed = true;
      }
    }
  }
  freeCols.sort((a, b) => a - b);

  const solution = new Array(N).fill(null);
  for (let r = 0; r < rank; r++) {
    const col = pivotColForRow[r];
    if (col >= 0 && resolvedCols.has(col)) solution[col] = M[r][N];
  }

  return {
    consistent: true,
    solved: freeCols.length === 0,
    solution, // array length N, entries null where unresolved
    freeRegionIndices: freeCols,
    rank,
  };
}

// ---------------------------------------------------------------------------
// Main solve function (count-based)
// ---------------------------------------------------------------------------
// Input:
//   numSets: 2 | 3
//   clues:   [{ expr: "A∩B", value: 12 }, ...]   (raw set-notation clues —
//            expr may now also be a linear COMBINATION of regions, e.g.
//            "B∩A' - A∩B'", to encode relational clues like "11 more X
//            than Y" directly, without inventing an unknown variable)
//   namedValues: { universal: 40, nA: 25, ... }   (alternative to clues, for
//                the guided-form UI — pass EITHER clues OR namedValues, or
//                both; they get merged)
//   findExpr: optional set expression to evaluate once solved, e.g. "A∩B'∩C'"
//
// Output:
//   {
//     success: true/false,
//     error: string | null,
//     regions: { none: 3, A: 12, B: 5, ... },   // named region -> value
//     regionList: [{ id, label, value }, ...],  // ordered, for diagram rendering
//     derived: { nA, nB, nC, nUnion, universal, ... },
//     target: { expr, value } | null,
//     unresolvedRegions: [ "AB", "ABC" ]        // present only if underdetermined
//   }

function solveSetProblem({ numSets, clues = [], namedValues = {}, findExpr = null }) {
  if (numSets !== 2 && numSets !== 3) {
    return { success: false, error: "numSets must be 2 or 3.", regions: null };
  }

  const regions = getRegions(numSets);
  const numRegions = regions.length;
  const allClues = [...clues, ...namedValuesToClues(numSets, namedValues)];

  if (allClues.length === 0) {
    return { success: false, error: "No known values were provided.", regions: null };
  }

  // Parse every clue's right-hand side as a linear expression. Most clues
  // are plain numbers (constant only, no unknowns) — but some tie a region
  // to an algebraic unknown, e.g. value: "x" or value: "2x". We collect
  // every distinct unknown name used anywhere in the problem and solve for
  // them in the SAME linear system as the regions themselves: an unknown
  // like "x" just becomes one more column next to the 4 or 8 region
  // columns, so Gaussian elimination resolves regions and unknowns together
  // in one pass — there is no separate "algebra step".
  //
  // The LEFT-HAND side of each clue is parsed by parseLinearRegionExpression,
  // which is a strict superset of the plain set-expression grammar: a bare
  // clue like "A∩B" still becomes a 0/1 mask exactly as before, but clues
  // can now also be linear combinations like "B∩A' - A∩B'" to express
  // relational statements directly.
  let parsedClues;
  try {
    parsedClues = allClues.map((clue) => ({
      mask: parseLinearRegionExpression(clue.expr, numSets),
      rhs: parseLinearExpression(clue.value),
    }));
  } catch (err) {
    return { success: false, error: err.message, regions: null };
  }

  const unknownNames = Array.from(
    new Set(parsedClues.flatMap((c) => Object.keys(c.rhs.coeffs)))
  ).sort();

  const totalCols = numRegions + unknownNames.length;
  const A = parsedClues.map((c) => {
    const row = new Array(totalCols).fill(0);
    for (let i = 0; i < numRegions; i++) row[i] = c.mask[i];
    unknownNames.forEach((name, k) => {
      // clue means: regionExpr = constant + sum(coeff * unknown)
      // i.e.        regionExpr - sum(coeff * unknown) = constant
      row[numRegions + k] = -(c.rhs.coeffs[name] || 0);
    });
    return row;
  });
  const b = parsedClues.map((c) => c.rhs.constant);

  const result = gaussianSolve(A, b);

  if (!result.consistent) {
    return { success: false, error: result.error, regions: null };
  }

  const regionList = regions.map((r, i) => ({
    id: r.id,
    label: r.label,
    value: result.solution[i],
  }));

  const regionsById = {};
  regionList.forEach((r) => {
    regionsById[r.id] = r.value;
  });

  const unknownsById = {};
  unknownNames.forEach((name, k) => {
    unknownsById[name] = result.solution[numRegions + k];
  });

  if (!result.solved) {
    const unresolvedRegions = result.freeRegionIndices
      .filter((i) => i < numRegions)
      .map((i) => regions[i].id);
    const unresolvedUnknowns = result.freeRegionIndices
      .filter((i) => i >= numRegions)
      .map((i) => unknownNames[i - numRegions]);
    return {
      success: false,
      error:
        "Not enough information to solve every region. At least one more known value is needed.",
      regions: regionsById,
      regionList,
      unknowns: unknownsById,
      unresolvedRegions,
      unresolvedUnknowns,
    };
  }

  // Compute common derived totals for display, regardless of what was asked.
  const derived = {};
  const namedMap = getNamedClueMap(numSets);
  for (const key of Object.keys(namedMap)) {
    const mask = parseSetExpression(namedMap[key], numSets);
    let sum = 0;
    mask.forEach((include, i) => {
      if (include) sum += regionList[i].value;
    });
    derived[key] = round(sum);
  }

  let target = null;
  if (findExpr) {
    try {
      const mask = parseSetExpression(findExpr, numSets);
      let sum = 0;
      mask.forEach((include, i) => {
        if (include) sum += regionList[i].value;
      });
      target = { expr: findExpr, value: round(sum) };
    } catch (err) {
      return { success: false, error: err.message, regions: regionsById };
    }
  }

  return {
    success: true,
    error: null,
    regions: regionsById,
    regionList: regionList.map((r) => ({ ...r, value: round(r.value) })),
    unknowns: Object.fromEntries(
      Object.entries(unknownsById).map(([k, v]) => [k, round(v)])
    ),
    derived,
    target,
  };
}

// ---------------------------------------------------------------------------
// Standalone target evaluator (for when regions are already solved and you
// just want to shade/evaluate a different expression without re-solving,
// e.g. the student picks a new shading in the UI after the diagram is built)
// ---------------------------------------------------------------------------
// Upgraded to use parseLinearRegionExpression internally, so it also accepts
// relational expressions (e.g. "B - A") in addition to plain set expressions
// — a strict superset of the previous behaviour, so existing callers that
// only ever pass plain set expressions ("A∩B'") are unaffected.

function evaluateExpressionValue(expr, numSets, regionsById) {
  const regions = getRegions(numSets);
  const coeffs = parseLinearRegionExpression(expr, numSets);
  let sum = 0;
  regions.forEach((r, i) => {
    sum += coeffs[i] * Number(regionsById[r.id] || 0);
  });
  return round(sum);
}

// ---------------------------------------------------------------------------
// NEW: Element-level classification engine
// ---------------------------------------------------------------------------
// For problems where the sets are given as actual elements, e.g.
//   A = {1,3,5,7,9,11}, B = {2,3,5,7,11,15}, C = {3,6,9,12,15}, ε = {1..15}
// this sorts every element of ε into exactly one region by direct membership
// testing (no linear algebra needed — nothing is unknown here), so the
// tutor can list real elements per region, not just counts.
//
// Input:
//   numSets: 2 | 3
//   sets: { A: [...], B: [...], C: [...] }   (C omitted/ignored if numSets===2)
//   universal: [...] | null                  (if omitted, ε defaults to the
//                                              union of A, B, (C) — fine for
//                                              problems that never state ε
//                                              explicitly, e.g. the shop
//                                              customers problem)
//
// Output:
//   {
//     success, error,
//     universal: [...],                       // sorted
//     regionElements: { none:[...], A:[...], ... },
//     regionList: [{ id, label, elements, count }, ...],
//     derived: { nA, nB, nUnion, universal, ... }   // counts, same shape as
//                                                     // solveSetProblem's derived
//   }

function sortElements(arr) {
  const isNumericLike = (x) =>
    typeof x === "number" || (typeof x === "string" && x.trim() !== "" && !isNaN(Number(x)));
  const allNumeric = arr.length > 0 && arr.every(isNumericLike);
  const copy = [...arr];
  if (allNumeric) {
    copy.sort((a, b) => Number(a) - Number(b));
  } else {
    copy.sort((a, b) => String(a).localeCompare(String(b)));
  }
  return copy;
}

function classifyElements({ numSets, sets = {}, universal = null }) {
  if (numSets !== 2 && numSets !== 3) {
    return { success: false, error: "numSets must be 2 or 3.", regionElements: null };
  }

  const regions = getRegions(numSets);
  const setKeys = numSets === 2 ? ["A", "B"] : ["A", "B", "C"];

  for (const key of setKeys) {
    if (!Array.isArray(sets[key])) {
      return {
        success: false,
        error: `Set ${key} must be provided as an array of elements.`,
        regionElements: null,
      };
    }
  }

  // Build the universal set: use the given universal array if provided,
  // otherwise fall back to the union of all given sets (so problems that
  // never state ε explicitly still work — they simply won't have an
  // "outside all sets" region, which is correct).
  let universalSet;
  if (Array.isArray(universal)) {
    universalSet = [...universal];
  } else {
    const union = new Set();
    setKeys.forEach((key) => sets[key].forEach((el) => union.add(el)));
    universalSet = Array.from(union);
  }

  // Sanity check: every element named inside A/B/C must actually appear in
  // the universal set, otherwise the problem statement is inconsistent.
  for (const key of setKeys) {
    for (const el of sets[key]) {
      if (!universalSet.some((u) => String(u) === String(el))) {
        return {
          success: false,
          error: `Element "${el}" in set ${key} is not part of the given universal set.`,
          regionElements: null,
        };
      }
    }
  }

  const memberOf = (key, el) => sets[key].some((x) => String(x) === String(el));

  const regionElementsById = {};
  regions.forEach((r) => (regionElementsById[r.id] = []));

  universalSet.forEach((el) => {
    const flagA = memberOf("A", el) ? 1 : 0;
    const flagB = memberOf("B", el) ? 1 : 0;
    const flagC = numSets === 3 ? (memberOf("C", el) ? 1 : 0) : undefined;

    const region = regions.find((r) => {
      if (r.a !== flagA || r.b !== flagB) return false;
      if (numSets === 3 && r.c !== flagC) return false;
      return true;
    });
    if (region) regionElementsById[region.id].push(el);
  });

  Object.keys(regionElementsById).forEach((id) => {
    regionElementsById[id] = sortElements(regionElementsById[id]);
  });

  const regionList = regions.map((r) => ({
    id: r.id,
    label: r.label,
    elements: regionElementsById[r.id],
    count: regionElementsById[r.id].length,
  }));

  // Derived counts, same named shape as solveSetProblem's `derived`, but
  // counted straight from real elements instead of solved populations.
  const derived = {};
  const namedMap = getNamedClueMap(numSets);
  for (const key of Object.keys(namedMap)) {
    const mask = parseSetExpression(namedMap[key], numSets);
    let count = 0;
    mask.forEach((include, i) => {
      if (include) count += regionList[i].count;
    });
    derived[key] = count;
  }

  return {
    success: true,
    error: null,
    universal: sortElements(universalSet),
    regionElements: regionElementsById,
    regionList,
    derived,
  };
}

// Evaluate any set expression (e.g. "C∩A'", "A'∩(B∪C)") against already
// classified regions and return the ACTUAL elements, not just a count.
// Reuses parseSetExpression (boolean mask) — relational "+ / -" combinations
// don't make sense for element lists, so this intentionally stays on the
// plain set-expression grammar rather than parseLinearRegionExpression.

function evaluateExpressionElements(expr, numSets, regionElementsById) {
  const regions = getRegions(numSets);
  const mask = parseSetExpression(expr, numSets);
  let elements = [];
  regions.forEach((r, i) => {
    if (mask[i]) elements = elements.concat(regionElementsById[r.id] || []);
  });
  elements = sortElements(elements);
  return { expr, elements, count: elements.length };
}

// Convenience wrapper: classify + evaluate one or more "find" expressions in
// one call — this is the function the AI tutor should call for WAEC-style
// questions like "(i) C∩A′ ; (ii) A′∩(B∪C)".

function solveElementSetProblem({ numSets, sets, universal = null, findExprs = [] }) {
  const classification = classifyElements({ numSets, sets, universal });
  if (!classification.success) return classification;

  const targets = (findExprs || []).map((expr) => {
    try {
      return evaluateExpressionElements(expr, numSets, classification.regionElements);
    } catch (err) {
      return { expr, error: err.message, elements: null, count: null };
    }
  });

  return {
    ...classification,
    targets,
  };
}

// ---------------------------------------------------------------------------
// NEW: Probability helper
// ---------------------------------------------------------------------------
// Small utility for the common "probability that a random selection is in
// region X" follow-up question. Returns a reduced fraction alongside the
// decimal so the tutor can show working like "77/120 ≈ 0.6417".

function simplifyFraction(numerator, denominator) {
  function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      [a, b] = [b, a % b];
    }
    return a || 1;
  }
  const g = gcd(numerator, denominator) || 1;
  return { numerator: numerator / g, denominator: denominator / g };
}

function computeProbability(favorable, total) {
  if (!total) {
    return { success: false, error: "Total cannot be zero." };
  }
  const fraction = simplifyFraction(favorable, total);
  const decimal = round(favorable / total);
  return {
    success: true,
    fraction,
    decimal,
    percent: round(decimal * 100, 2),
  };
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function round(n, d = 6) {
  const f = Math.pow(10, d);
  const r = Math.round((n + Number.EPSILON) * f) / f;
  return Object.is(r, -0) ? 0 : r;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
// ES module exports — this file is a frontend module (imported directly into
// React components like LinearExplorer.jsx uses its own solveLinear()),
// not a backend/Node module. No network calls, no server dependency.

export {
  getRegions,
  parseSetExpression,
  parseLinearRegionExpression,
  parseLinearRegionExpressionDetailed,
  parseLinearExpression,
  solveSetProblem,
  evaluateExpressionValue,
  explainExpression,
  getNamedClueMap,
  namedValuesToClues,
  classifyElements,
  evaluateExpressionElements,
  solveElementSetProblem,
  sortElements,
  simplifyFraction,
  computeProbability,
};