import assert from "node:assert/strict";
import test from "node:test";
import UFN from "../src/ufn.js";

const { compute, encodeInteger: n, UFNError } = UFN;
const name = number => "□⌊" + n(number) + "⌋";
const [base, sequence, entry, place] = [1, 2, 3, 4].map(name);
const digits = `≔(⟦${base} : ${sequence}⟧ : [${entry} ${place} : ${sequence} : {${entry} ${base}⌈${place}⌉}])`;
const fold = (kind, body, symbol = "⟦") => {
  const close = symbol === "⟦" ? "⟧" : "⟫";
  return `≔(${symbol}${sequence}${close} : ${kind}${entry} ${place} : ${sequence} : ${body}${kind === "[" ? "]" : "}"})`;
};

test("double brackets receive only the meaning assigned by a declaration", () => {
  for (const source of ["⟦⟧", "⟦◠ ○⟧", "⟦⟨◠⟩ : ◠ ○⟧"]) assert.throws(() => compute(source), /declaration/);
  assert.equal(compute("≔(⟦⟧ : ⟨◠○○⟩) ⟦⟧").canonical, n(5));
  assert.equal(compute(`≔(⟦${base} : ${sequence}⟧ : [${base} ${sequence}]) ⟦⟨◠⟩ : ⟨◠○⟩⟧`).canonical, n(5));
  assert.throws(() => compute(digits + " ⟦◠ ○⟧"), UFNError);
  assert.throws(() => compute("⟦⟧"), /declaration/, "definitions cannot leak into later compute calls");
});

test("the declared digit fold computes positional contributions with exact UFN arithmetic", () => {
  for (let value = 0; value < 128; value++) {
    const bits = value.toString(2).replaceAll("0", "○").replaceAll("1", "◠");
    assert.equal(compute(digits + ` ⟦⟨◠⟩ : ${bits}⟧`).canonical, n(value));
  }
  for (const [text, expected] of [
    ["⟦⟨◠⟩ : ○ ○ ◠ ◠⟧", 3], ["⟦⟨◠⟩ : ◠ ◠⟧", 3], ["⟦⟨◠⟩ : ⟧", 0],
    [`⟦${n(10)} : ${n(1)} ${n(2)} ${n(3)}⟧`, 123],
    ["⟦⟨◠⟩ : [◠ ○] ○ ◠⟧", 5],
    ["⟦⟨◠○⟩ : ⟦⟨◠⟩ : ◠ ○⟧ ◠⟧", 7],
  ]) assert.equal(compute(digits + text).canonical, n(expected), text);
  assert.equal(compute(digits + "⟦⟨◠⟩ : ⟨◠○⟩ ◡⟧").canonical, n(5),
    "the definition is arithmetic; it does not add a hidden digit validator");
});

test("sequence folds count from the right while preserving left-to-right directed order", () => {
  assert.equal(compute(fold("[", place) + "⟦◠ ○ ◠ ◠⟧").canonical, n(6));
  assert.equal(compute(fold("[", `{${entry} ⟨◠⟩⌈${place}⌉}`) + "⟦◠ ○ ◠ ◠⟧").canonical, n(11));
  const product = fold("{", entry);
  assert.equal(compute(product + "⟦◠@◠ ◠@⟨◠⟩⟧").canonical, "◠@⟨◠○⟩");
  assert.equal(compute(product + "⟦◠@⟨◠⟩ ◠@◠⟧").canonical, "◡@⟨◠○⟩");
  assert.equal(compute(fold("[", entry) + "⟦◠@◠ ◠@⟨◠⟩⟧").canonical, "[◠@◠ ◠@⟨◠⟩]");
});

test("source entries are evaluated once before visiting, even when the body ignores them", () => {
  const source = fold("[", "◠") + "⟦[□ : ◠ … ⟨◠○⟩ : □] ◠⟧";
  const result = compute(source);
  assert.equal(result.canonical, n(2));
  assert.equal(result.iterations, 5, "three visits for the source entry and two for enumeration");
  assert.throws(() => compute(fold("[", "◠") + "⟦{|○}⟧"), /Division by zero/);
  for (const [kind, expected] of [["[", "○"], ["{", "◠"]]) {
    assert.equal(compute(fold(kind, "{|○}") + "⟦⟧").canonical, expected);
  }
});

test("expansion protects the caller's counter names, including supplied range bounds", () => {
  const expression = digits + `[${entry} : ⟨◠○⟩ … ⟨◠○⟩ : ⟦${entry} : ◠ ◠⟧]`;
  assert.equal(compute(expression).canonical, n(4), "the base keeps its enclosing value of three");
  assert.equal(compute(fold("[", entry) + `[${entry} : ⟨◠⟩ … ⟨◠⟩ : ⟦${entry} ${entry}⟧]`).canonical, n(4));
  assert.throws(() => compute(digits + `⟦${entry} : ◠ ◠⟧`), /Unbound counter/);
  const def = `≔(⟦${base}⟧ : [${entry} : ◠ … ⟨◠⟩ : ${base}])`;
  assert.equal(compute(def + `[${entry} : ⟨◠○⟩ … ⟨◠○⟩ : ⟦[□ : ◠ … ${entry} : ◠]⟧]`).canonical, n(6));
  assert.equal(compute(def + "⟦⟦◠⟧⟧").canonical, n(4), "nested uses get separate local bindings");
});

test("earlier definitions can be composed and captured sequences forwarded", () => {
  const source = fold("[", entry) + `≔(⟪${base}⟫ : ⟦${base}⟧) ⟪◠ ⟨◠⟩ ⟨◠○⟩⟫`;
  assert.equal(compute(source).canonical, n(6));
  assert.equal(compute("≔(◇ : ⟨◠⟩) ≔(◆ : {◇ ◇}) {◆ ◇}").canonical, n(8));
  const nested = fold("[", entry) + `≔(⟪${base}⟫ : [${entry} : ◠ … ⟨◠⟩ : ⟦${base}⟧]) ⟪◠ ⟨◠⟩⟫`;
  assert.equal(compute(nested).canonical, n(6));
});

test("defined endless recipes request complete limits, independent of preview terms", () => {
  const definition = "≔(◇ : [□ : ○ … : ⟨◡⟩⌈□⌉])";
  for (const terms of [1, 4, 24]) {
    const result = compute(definition + "◇", terms);
    assert.equal(result.canonical, n(2));
    assert.equal(result.partial, false);
    assert.equal(result.limitProofs.length, 1);
  }
  const unknown = compute("≔(◇ : " + UFN.constants.e.source + ") ◇", 1);
  assert.equal(unknown.canonical, null);
  assert.equal(unknown.partial, false);
  assert.throws(() => unknown.value, /complete limit/);
  assert.throws(() => compute("≔(◇ : [□ : ○ … : ◠]) ◇"), /no limit/);
  assert.equal(compute(definition + "[◇ [□ : ○ … : ◠]]", 3).partial, true);
});

test("the supplied constant declarations can be stated explicitly but not overwritten", () => {
  for (const constant of Object.values(UFN.constants)) {
    const definition = `≔(${constant.symbol} : ${constant.source})`;
    assert.deepEqual(compute(definition + constant.symbol).value, compute(constant.symbol).value);
    assert.throws(() => compute(`≔(${constant.symbol} : ◠) ${constant.symbol}`), /redefined/);
  }
});

test("declarations have no value and cannot appear inside numerical expressions", () => {
  const source = "≔(◇ : ◠)";
  const result = compute(source);
  assert.equal(result.declarationOnly, true);
  assert.equal(result.definitionCount, 1);
  assert.equal(result.canonical, null);
  assert.throws(() => result.value, /no numerical value/);
  for (const source of ["[≔(◇ : ◠) ◇]", "◠ ≔(◇ : ◠)", "(◇ : ◠)", "≔(◇ : ◠) ◠ ◠"]) {
    assert.throws(() => compute(source), UFNError);
  }
});

test("invalid definitions fail locally with useful diagnostics", () => {
  const sources = [
    ["≔(◠ : ◡) ◠", /existing notation/],
    ["≔(◇ : ◠) ≔(◇ : ◡) ◇", /already has/],
    ["≔(◇ : ◇) ◇", /free names/],
    ["≔(◇ : ◆) ≔(◆ : ◠) ◇", /free names/],
    [`≔(⟦${base} ${base}⟧ : ${base}) ⟦◠ ◠⟧`, /once/],
    ["≔(◇ : □) ◇", /free names/],
    [`≔(⟦${sequence}⟧ : [${entry} ${entry} : ${sequence} : ${entry}])`, /distinct/],
    [`≔(⟦${sequence}⟧ : [${sequence} [${entry} ${place} : ${sequence} : ${entry}]])`, /both/],
    [`≔(⟦${sequence}⟧ : [${entry} ${place} : ${base} : ${entry}])`, /free names/],
    ["≔(⟦◠ : ◠)", /bracket/],
    [`[${entry} ${place} : ${sequence} : ${entry}]`, /Unbound counter/],
  ];
  for (const [source, message] of sources) assert.throws(() => compute(source), message, source);
});

test("formatting preserves declarations, entry boundaries, and leading empty places", () => {
  const source = digits + "\n⟦⟨◠⟩ : ○ ○ ◠ [◠ ○]⟧";
  const formatted = UFN.formatSource(source, 32);
  assert.ok(formatted.includes("≔("));
  assert.ok(formatted.includes("○ ○ ◠ [◠ ○]"));
  assert.equal(compute(formatted).canonical, n(3));
  assert.equal(UFN.formatSource(formatted), formatted);
});

test("finite definitions compose with exact derivatives and do not use decimal arithmetic", () => {
  const source = fold("{", entry) + "⟦□ □⟧";
  assert.equal(UFN.differentiate(source, { at: n(3) }).canonical, n(6));
  const original = Math.pow;
  Math.pow = () => { throw new Error("Unexpected decimal arithmetic"); };
  try { assert.equal(compute(digits + "⟦⟨◠⟩ : ◠ ○ ◠ ◠⟧").canonical, n(11)); }
  finally { Math.pow = original; }
});

test("derivatives follow dependencies through sequence entries before resolving endless ranges", () => {
  const counter = name(5);
  const sum = fold("[", `[${counter} : ○ … : {${entry} ⟨◡⟩⌈${counter}⌉}]`);
  const constant = UFN.differentiate(sum + "⟦⟨◠⟩⟧");
  assert.equal(constant.canonical, "○");
  const changing = UFN.differentiate(sum + "⟦□⟧", { at: n(2) });
  assert.equal(changing.established, false);
  assert.match(changing.reason, /interchanging its limit and derivative/);
});

test("definition and sequence expansion obey bounded work and depth", () => {
  assert.throws(() => compute(fold("[", entry) + "⟦" + "◠ ".repeat(1001) + "⟧"), /1000 entries/);
  const double = `≔(⟦${base}⟧ : [${base} ${base}])`;
  assert.throws(() => compute(double + "⟦".repeat(45) + "◠" + "⟧".repeat(45)), /too large|too deeply/);
  assert.throws(() => compute("≔(◇ : ◠" + "⌈◠⌉".repeat(2000) + ") ◇"), /too deeply/);
  const repeat = fold("[", `[□ : ○ … ${n(1000)} : ◠]`);
  assert.throws(() => compute(repeat + "⟦" + "◠ ".repeat(31) + "⟧"), /Too many generated terms/);
});

test("a Fourier coefficient derives left indices from the captured sequence's length", () => {
  // Define length, then consume it with the sample sequence. No indexing
  // primitive or change to the right-place rule is needed for a coefficient.
  const length = `≔(◇⟪${base}⟫ : [${sequence} ${entry} : ${base} : ◠])`;
  const count = `◇⟪${sequence}⟫`;
  const left = `[${count} | ◠ ${place}]`;
  const coefficient = `≔(⟦${base} : ${sequence}⟧ : [${entry} ${place} : ${sequence} : `
    + `{${entry} ┌┘⌈[|{⟳ ${base} ${left} | ${count}}]@◠⌉}])`;
  const result = compute(length + coefficient + "⟦◠ : ○ ◠ ○ ○⟧");
  assert.equal(result.partial, false);
  assert.equal(result.canonical, "◡@◠");
  const expected = [0, -1, 0, 0];
  result.value.forEach((value, i) => assert.ok(Math.abs(value - expected[i]) < 1e-12));
});
