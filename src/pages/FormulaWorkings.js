import { parseLinearExpression } from "./setTheorySolver";

// ============================================================================
// formulaWorkings.js
// Generates the step-by-step "Formula Method" derivation shown to students —
// state the formula, substitute the given numbers, solve — in the exact
// voice used in the Week 7/8 tutor notes ("Let x represent...", "n(A∪B) =
// n(A) + n(B) - n(A∩B)", etc).
//
// This is 100% deterministic: it reuses parseLinearExpression from
// setTheorySolver.js (the SAME parser solveSetProblem() uses internally) to
// do the actual arithmetic, so the working shown here can never disagree
// with the real answer — there is no separate "explanation math" that could
// drift out of sync with the solver.
// ============================================================================

function addLinear(a, b) {
  const coeffs = { ...a.coeffs };
  for (const k of Object.keys(b.coeffs)) coeffs[k] = (coeffs[k] || 0) + b.coeffs[k];
  return { constant: a.constant + b.constant, coeffs };
}
function negateLinear(a) {
  const coeffs = {};
  for (const k of Object.keys(a.coeffs)) coeffs[k] = -a.coeffs[k];
  return { constant: -a.constant, coeffs };
}
function subLinear(a, b) {
  return addLinear(a, negateLinear(b));
}
function unknownLinear(name, coeff) {
  return { constant: 0, coeffs: { [name]: coeff } };
}

function fmtNum(n) {
  const r = Math.round(n * 1e6) / 1e6;
  return Object.is(r, -0) ? "0" : String(r);
}

// Formats a signed list of {raw, sign} terms into a substituted equation
// string, e.g. "65 + 50 - x" — using the RAW given/placeholder text (not
// the parsed numbers), matching how the notes show the substitution step
// before simplifying.
function formatSubstitution(terms) {
  return terms
    .map((t, i) => {
      const sign = t.sign < 0 ? "-" : "+";
      const text = String(t.raw);
      if (i === 0) return t.sign < 0 ? `-${text}` : text;
      return ` ${sign} ${text}`;
    })
    .join("");
}

function labelFor(setLabels, letter) {
  return (setLabels && setLabels[letter]) || letter;
}

// Picks an unused single-letter name for the "narrative unknown" minted when
// a plain numeric formula term is missing (no algebraic tie involved) — so
// it never collides with a real unknown the student already introduced
// (e.g. "x" in an nABC:"x" clue).
function mintUnknownName(existingNames) {
  for (const candidate of ["x", "y", "z", "w"]) {
    if (!existingNames.includes(candidate)) return candidate;
  }
  return "k";
}

// ---------------------------------------------------------------------------
// Small lookup: for common "target" expressions, the symbolic identity used
// to compute them from the core region counts, for the optional closing
// step when the question asks for something other than the union/one core
// term directly (e.g. "Only A", "Exactly two subjects").
// ---------------------------------------------------------------------------

function targetIdentity(findExpr, numSets) {
  if (!findExpr) return null;
  const norm = findExpr.replace(/\s+/g, "");
  if (numSets === 2) {
    const map = {
      "A∩B'": { label: "Only A", formula: "n(A) − n(A∩B)" },
      "B∩A'": { label: "Only B", formula: "n(B) − n(A∩B)" },
      "A'∩B'": { label: "Neither", formula: "n(U) − n(A∪B)" },
      "A∩B": { label: "Both A and B", formula: null },
      "A∪B": { label: "A or B", formula: null },
    };
    return map[norm] || null;
  }
  const map = {
    "A∩B'∩C'": { label: "Only A", formula: "n(A) − n(A∩B) − n(A∩C) + n(A∩B∩C)" },
    "B∩A'∩C'": { label: "Only B", formula: "n(B) − n(A∩B) − n(B∩C) + n(A∩B∩C)" },
    "C∩A'∩B'": { label: "Only C", formula: "n(C) − n(A∩C) − n(B∩C) + n(A∩B∩C)" },
    "A∩B∩C": { label: "All three", formula: null },
    "(A∩B∩C')∪(A∩C∩B')∪(B∩C∩A')": {
      label: "Exactly two",
      formula: "(n(A∩B) − n(A∩B∩C)) + (n(A∩C) − n(A∩B∩C)) + (n(B∩C) − n(A∩B∩C))",
    },
    "A'∩B'∩C'": { label: "None of the three", formula: "n(U) − n(A∪B∪C)" },
    "A∪B∪C": { label: "Any one or more", formula: null },
  };
  return map[norm] || null;
}

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------
// Returns { lines: string[], usable: boolean }. `usable: false` means the
// given/derived data didn't fit a clean single-unknown narrative (e.g.
// everything was already given, or the pattern was unusual) — the caller
// should fall back to a plain "here's what we found" summary in that case,
// never to a WRONG narrative.

export function generateFormulaWorkings({ numSets, setLabels, namedValues, derived, unknowns, target }) {
  const lines = [];
  const labels = setLabels || {};
  const usingRealLabels = numSets === 2
    ? (labels.A && labels.A !== "A") || (labels.B && labels.B !== "B")
    : (labels.A && labels.A !== "A") || (labels.B && labels.B !== "B") || (labels.C && labels.C !== "C");

  if (usingRealLabels) {
    const letterList = numSets === 2 ? ["A", "B"] : ["A", "B", "C"];
    lines.push(
      "Let " + letterList.map((l) => `${labelFor(labels, l)} = ${l}`).join(", ") + "."
    );
  }

  // ---- Given data recap -----------------------------------------------
  const notationMap2 = {
    universal: "n(U)", nA: "n(A)", nB: "n(B)", nAB: "n(A∩B)",
    nAOnly: "n(A only)", nBOnly: "n(B only)", nNone: "n(none)", nUnion: "n(A∪B)",
  };
  const notationMap3 = {
    universal: "n(U)", nA: "n(A)", nB: "n(B)", nC: "n(C)",
    nAB: "n(A∩B)", nAC: "n(A∩C)", nBC: "n(B∩C)", nABC: "n(A∩B∩C)",
    nAOnly: "n(A only)", nBOnly: "n(B only)", nCOnly: "n(C only)",
    nNone: "n(none)", nUnion: "n(A∪B∪C)",
  };
  const notationMap = numSets === 2 ? notationMap2 : notationMap3;

  const givenLines = Object.keys(namedValues || {})
    .filter((k) => namedValues[k] !== "" && namedValues[k] !== null && namedValues[k] !== undefined && notationMap[k])
    .map((k) => `${notationMap[k]} = ${namedValues[k]}`);

  if (givenLines.length > 0) {
    lines.push("Given:");
    givenLines.forEach((l) => lines.push(l));
  }

  // ---- Determine which "core" formula terms are directly given --------
  const coreKeys = numSets === 2 ? ["nA", "nB", "nAB"] : ["nA", "nB", "nC", "nAB", "nAC", "nBC", "nABC"];
  const coreSigns = numSets === 2
    ? { nA: 1, nB: 1, nAB: -1 }
    : { nA: 1, nB: 1, nC: 1, nAB: -1, nAC: -1, nBC: -1, nABC: 1 };

  const isGiven = (k) => namedValues && namedValues[k] !== undefined && namedValues[k] !== null && namedValues[k] !== "";
  const missingCore = coreKeys.filter((k) => !isGiven(k));

  const unionGiven = isGiven("nUnion");
  const universalGiven = isGiven("universal");
  const noneGiven = isGiven("nNone");
  const hasRealUnknown = unknowns && Object.keys(unknowns).length > 0;

  // Build the set of "identity variables" the equation covers, depending on
  // what anchors the left-hand side:
  //   - nUnion given directly  -> variables = the core region terms only
  //   - universal given        -> variables = core terms PLUS n(none), since
  //     n(U) = n(A∪B[∪C]) + n(none) is what actually ties them together.
  // Whichever of THOSE variables isn't given is the one this derivation
  // solves for — this is what fixes the Example 17 case (n(none) missing,
  // not one of the "core" region terms) instead of wrongly assuming
  // n(U) = n(A∪B) whenever n(none) wasn't supplied.
  let lhsRaw, lhsValue, variables, formulaSymbolic, useExtended = false;

  if (unionGiven) {
    lhsRaw = String(namedValues.nUnion);
    lhsValue = Number(namedValues.nUnion);
    variables = coreKeys.map((k) => ({ key: k, sign: coreSigns[k] }));
    formulaSymbolic = numSets === 2
      ? "n(A∪B) = n(A) + n(B) − n(A∩B)"
      : "n(A∪B∪C) = n(A) + n(B) + n(C) − n(A∩B) − n(A∩C) − n(B∩C) + n(A∩B∩C)";
  } else if (universalGiven) {
    lhsRaw = String(namedValues.universal);
    lhsValue = Number(namedValues.universal);
    variables = [...coreKeys.map((k) => ({ key: k, sign: coreSigns[k] })), { key: "nNone", sign: 1 }];
    useExtended = true;
    formulaSymbolic = numSets === 2
      ? "n(U) = n(A) + n(B) − n(A∩B) + n(none)"
      : "n(U) = n(A) + n(B) + n(C) − n(A∩B) − n(A∩C) − n(B∩C) + n(A∩B∩C) + n(none)";
  } else {
    // Nothing to anchor the equation to — bail out.
    return { lines, usable: false };
  }

  const missingVars = variables.filter((v) => !isGiven(v.key)).map((v) => v.key);

  // If a real algebraic unknown already exists (e.g. nABC:"x"), every
  // identity variable must already be given (possibly algebraically) —
  // otherwise there's more than one true unknown and we can't narrate
  // a clean single-variable solve.
  if (hasRealUnknown && missingVars.length > 0) {
    return { lines, usable: false };
  }
  if (!hasRealUnknown && missingVars.length > 1) {
    return { lines, usable: false };
  }

  const existingUnknownNames = hasRealUnknown ? Object.keys(unknowns) : [];
  let narrativeUnknown = null;
  let missingKeyForClosing = null;
  if (!hasRealUnknown && missingVars.length === 1) {
    narrativeUnknown = mintUnknownName(existingUnknownNames);
    missingKeyForClosing = missingVars[0];
  }

  const rhsTerms = variables.map((v) => ({
    key: v.key,
    sign: v.sign,
    raw: isGiven(v.key) ? namedValues[v.key] : narrativeUnknown,
  }));

  // ---- Parse every RHS raw term into linear form and combine ----------
  let combinedRHS = { constant: 0, coeffs: {} };
  let parseFailed = false;
  const substitutionTerms = [];
  for (const t of rhsTerms) {
    if (t.raw === null || t.raw === undefined) { parseFailed = true; break; }
    let parsed;
    if (t.key === "__narrative__" || (narrativeUnknown && t.raw === narrativeUnknown)) {
      parsed = unknownLinear(narrativeUnknown, 1);
    } else {
      try {
        parsed = parseLinearExpression(t.raw);
      } catch {
        parseFailed = true;
        break;
      }
    }
    combinedRHS = addLinear(combinedRHS, t.sign < 0 ? negateLinear(parsed) : parsed);
    substitutionTerms.push({ raw: t.raw, sign: t.sign });
  }
  if (parseFailed) return { lines, usable: false };

  const unknownNames = Object.keys(combinedRHS.coeffs).filter((k) => combinedRHS.coeffs[k] !== 0);
  if (unknownNames.length !== 1) {
    // Either fully known (0 unknowns) or genuinely ambiguous (2+) — for the
    // fully-known case we still show a verification line, just no "solve".
    if (unknownNames.length === 0) {
      lines.push("Using the formula:");
      lines.push(formulaSymbolic);
      lines.push(`${lhsRaw} = ${formatSubstitution(substitutionTerms)}`);
      const rhsNumeric = combinedRHS.constant;
      lines.push(`Check: ${lhsRaw} = ${fmtNum(rhsNumeric)} ✓`);
      return { lines, usable: true };
    }
    return { lines, usable: false };
  }

  const unknownName = unknownNames[0];
  const coeff = combinedRHS.coeffs[unknownName];
  const diff = lhsValue - combinedRHS.constant;
  const solvedValue = diff / coeff;

  lines.push(useExtended ? "Using the identity:" : "Using the formula:");
  lines.push(formulaSymbolic);
  lines.push(`${lhsRaw} = ${formatSubstitution(substitutionTerms)}`);

  const constantPart = combinedRHS.constant;
  const coeffAbs = Math.abs(coeff);
  const coeffTermText = `${coeffAbs === 1 ? "" : coeffAbs}${unknownName}`;
  if (constantPart !== 0 || substitutionTerms.length > 2) {
    lines.push(`${lhsRaw} = ${fmtNum(constantPart)} ${coeff < 0 ? "−" : "+"} ${coeffTermText}`);
  }
  if (coeffAbs !== 1) {
    lines.push(`${coeffAbs}${unknownName} = ${fmtNum(diff)}`);
  }
  lines.push(`${unknownName} = ${fmtNum(solvedValue)}`);

  // ---- Optional closing step: the actual asked-for quantity -----------
  // Skip this if the quantity we just solved for (missingKeyForClosing) IS
  // already the thing the question asked for — no need to restate it.
  const missingKeyIsTarget =
    missingKeyForClosing && notationMap[missingKeyForClosing] &&
    target && target.expr && targetIdentity(target.expr, numSets) &&
    Math.abs((derived && derived[missingKeyForClosing]) ?? solvedValue - target.value) < 1e-6 &&
    Math.abs(solvedValue - target.value) < 1e-6;

  if (target && target.expr && !missingKeyIsTarget) {
    const identity = targetIdentity(target.expr, numSets);
    if (identity) {
      lines.push(`Then, ${identity.label}${identity.formula ? ` = ${identity.formula}` : ""} = ${fmtNum(target.value)}`);
    } else {
      lines.push(`Answer: ${target.expr} = ${fmtNum(target.value)}`);
    }
  }

  return { lines, usable: true };
}