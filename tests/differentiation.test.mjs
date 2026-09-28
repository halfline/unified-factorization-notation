import assert from "node:assert/strict";
import test from "node:test";
import UFN from "../src/ufn.js";

const { compute, differentiate } = UFN;
const equivalent = (answer, source) => assert.equal(answer.canonical, compute(source).canonical);

test("exact derivative rules cover sums, compositions, reciprocals, and rational fixed powers", () => {
  for (const [source, at, expected] of [
    ["◠", "○", "○"], ["□", "◡", "◠"], ["{□ □}", "○", "○"],
    ["[{□ □} {⟨◠○⟩ □} ◠]", "⟨◠⟩", "⟨◠○○○⟩"],
    ["{|□}", "⟨◠⟩", "[|⟨[|⟨◠⟩]⟩]"],
    ["{{□ □} | [□ ◠]}", "◠", "{⟨◠○⟩ | ⟨⟨◠⟩⟩}"],
    ["□⌈⟨◡⟩⌉", "⟨◠⟩", "⟨[|⟨◠◡⟩]⟩"],
    ["[◠ {□ □}]⌈⟨◠○⟩⌉", "◠", "⟨◠⟨◠○⟩⟩"],
    ["□⌈◠@◠⌉", "◠", "◠@◠"],
  ]) {
    const answer = differentiate(source, { at });
    equivalent(answer, expected);
    assert.equal(answer.established, true);
  }
  const roots = differentiate("{[⟨⟨◡⟩⟩ ⟨⟨◡⟩○⟩] □}", { at: "○" });
  assert.equal(roots.canonical, null, "a sum of distinct roots has no single factor spelling");
  assert.equal(roots.established, true);
  assert.ok(roots.ufn);
  assert.deepEqual(compute(roots.ufn).value, roots.value);
});

test("directed derivatives retain quaternion multiplication and division order", () => {
  equivalent(differentiate("{□ □}", { at: "◠@◠", along: "◠@⟨◠⟩" }), "○");
  equivalent(differentiate("{□ □}", { at: "◠@◠", along: "◠@◠" }), "[|⟨◠⟩]");
  equivalent(differentiate("{|□}", { at: "◠@◠", along: "◠@⟨◠⟩" }), "◡@⟨◠⟩");
  equivalent(differentiate("[{◠@◠ □} | {□ ◠@◠}]", { at: "◠@⟨◠⟩", along: "◠@⟨◠○⟩" }), "[|⟨◠⟩]@⟨◠⟩");
  equivalent(differentiate("{□ □}", { at: "[◠ ◠@◠]", along: "[◠ ◠@⟨◠⟩]" }), "[⟨◠⟩@○ ⟨◠⟩@◠ ⟨◠⟩@⟨◠⟩]");
  equivalent(differentiate("{□ □}", { at: "⟨⟨◡⟩⟩", along: "⟨◠○⟩" }), "{⟨◠◠⟩ ⟨⟨◡⟩⟩}");
});

test("finite counters differentiate their recipes while respecting bounds, distinct names, and shadowing", () => {
  const sum = "[□⌊⟨◠⟩⌋ : ◠ … ⟨◠○⟩ : {□ □⌊⟨◠⟩⌋}]";
  equivalent(differentiate(sum, { at: "⟨◠⟩" }), "⟨◠◠⟩");
  equivalent(differentiate("{□⌊⟨◠⟩⌋ : ◠ … ⟨◠○⟩ : [□ □⌊⟨◠⟩⌋]}", { at: "○" }), "⟨◠○○○○⟩");
  equivalent(differentiate("[□ : ◠ … ⟨◠○⟩ : {□ □}]", { at: "◡" }), "○");
  assert.throws(() => differentiate("{□⌊◠⌋ □}", { at: "⟨◠⟩" }), /Unbound counter/);
  equivalent(differentiate("{□⌊⟨◠⟩⌋ □⌊⟨◠⟩⌋}", { at: "⟨◠⟩", counter: "□⌊⟨◠⟩⌋" }), "⟨⟨◠⟩⟩");
  assert.equal(differentiate("[□⌊⟨◠⟩⌋ : ◠ … □ : □⌊⟨◠⟩⌋]", { at: "⟨◠⟩" }).established, false);
  assert.throws(() => differentiate("□⌊⟨◠⟩⌋"), /Unbound counter/);
  assert.throws(() => differentiate("□", { counter: "◠" }), /named counter/);
});

test("unsupported derivatives keep their context and cannot produce a sampled decimal answer", () => {
  for (const source of ["⟨□⟩", "⟨◠⟩⌈□⌉", "*[□]", "[□⌊⟨◠⟩⌋ : ◠ … : {□ | □⌊⟨◠⟩⌋ [□⌊⟨◠⟩⌋ ◠]}]"]) {
    const result = differentiate(source, { at: "⟨◠⟩", along: "◠" });
    assert.equal(result.established, false, source);
    assert.equal(result.canonical, null);
    assert.equal(result.source, source);
    assert.equal(result.at, "⟨◠⟩");
    assert.throws(() => result.value, /has not been established/);
  }
  // Merely touching @○ at the chosen point does not make a valid power route.
  assert.equal(differentiate("[◠ {□ □}@◠]⌈⟨◡⟩⌉", { at: "○" }).established, false);
  assert.throws(() => differentiate("{|□}", { at: "○" }), /Division by zero/);
  assert.throws(() => differentiate("□⌈⟨◡⟩⌉", { at: "◡" }), /Power base/);
  equivalent(differentiate("{[□⌊⟨◠⟩⌋ : ◠ … : {|□⌊⟨◠⟩⌋ [□⌊⟨◠⟩⌋ ◠]}] □}"), "◠");
});

test("automatic differentiation is exact without logarithms or floating point powers", () => {
  const oldPow = Math.pow, oldLog = Math.log;
  Math.pow = Math.log = () => { throw new Error("Decimal projection requested"); };
  try {
    equivalent(differentiate("□⌈⟨◡⟩⌉", { at: "⟨⟨◠⟩⟩" }), "⟨[|⟨◠⟩]⟩");
    equivalent(differentiate("{□ □ □}", { at: "◠@◠", along: "◠@⟨◠⟩" }), "◡@⟨◠⟩");
  } finally { Math.pow = oldPow; Math.log = oldLog; }
});
