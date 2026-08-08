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
//
// The engine works by representing every possible region as a row in a
// truth table over the input sets (A, B, [C]), then solving a linear system:
// each known clue becomes one equation (sum of the regions it covers =
// given value), and Gaussian elimination solves for every individual
// region's population. This is why "full flexible shading" works for
// ANY region combination, not just a fixed list of pre-coded cases.
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
// Main solve function
// ---------------------------------------------------------------------------
// Input:
//   numSets: 2 | 3
//   clues:   [{ expr: "A∩B", value: 12 }, ...]   (raw set-notation clues)
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
  let parsedClues;
  try {
    parsedClues = allClues.map((clue) => ({
      mask: parseSetExpression(clue.expr, numSets).map((v) => (v ? 1 : 0)),
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

function evaluateExpressionValue(expr, numSets, regionsById) {
  const regions = getRegions(numSets);
  const mask = parseSetExpression(expr, numSets);
  let sum = 0;
  regions.forEach((r, i) => {
    if (mask[i]) sum += Number(regionsById[r.id] || 0);
  });
  return round(sum);
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
  parseLinearExpression,
  solveSetProblem,
  evaluateExpressionValue,
  getNamedClueMap,
  namedValuesToClues,
};