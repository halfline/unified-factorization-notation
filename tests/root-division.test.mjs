import assert from "node:assert/strict";
import test from "node:test";
import UFN from "../src/ufn.js";

const { compute, differentiate } = UFN;
const a = "⟨⟨◡⟩⟩", b = "⟨⟨◡⟩○⟩", c = "⟨⟨◡⟩○○⟩";

test("square-root sums have exact reciprocals that participate in later cancellation", () => {
  const oldPow = Math.pow, oldLog = Math.log;
  Math.pow = Math.log = () => { throw new Error("Decimal projection requested"); };
  try {
    for (const denominator of [`[◠ ${a}]`, `[${a} ${b}]`, `[${a} ${b} ${c}]`, `[◠ ${a} {${a} ${b}}]`]) {
      assert.equal(compute(`{${denominator} | ${denominator}}`).canonical, "◠");
      assert.equal(compute(`[{|${denominator}} | {|${denominator}}]`).canonical, "○");
    }
    assert.equal(compute(`[{|[◠ ${a}]} ◠]`).canonical, a);
    assert.equal(compute(`[{|[${a} ${b}]} ${a}]`).canonical, b);
    assert.equal(compute(`{[{|[${a} ${b}]} ${a}] ${b}}`).canonical, "⟨◠○⟩");
    // 1/(√2+√3+√5) = (3√2+2√3−√30)/12, independently expanded.
    const threeRoots = `{[{⟨◠○⟩ ${a}} {⟨◠⟩ ${b}} | {${a} ${b} ${c}}] | ⟨◠⟨◠⟩⟩}`;
    assert.equal(compute(`[{|[${a} ${b} ${c}]} | ${threeRoots}]`).canonical, "○");
  } finally { Math.pow = oldPow; Math.log = oldLog; }
});

test("root division preserves directed order and keeps unsupported roots as recipes", () => {
  const denominator = `[◠@○ [${a} ${b}]@◠]`;
  assert.equal(compute(`{${denominator} | ${denominator}}`).canonical, "◠");
  const q = `[◠@○ ${a}@◠]`, direction = "◠@⟨◠⟩";
  const result = differentiate("{|□}", { at: q, along: direction });
  assert.equal(result.established, true);
  const formula = compute(`{◡ {|${q}} ${direction} {|${q}}}`);
  assert.equal(result.canonical, formula.canonical);
  assert.equal(compute("{|[◠ ⟨⟨◡○⟩⟩]}").canonical, null);
  assert.throws(() => compute(`{|[${a} | ${a}]}`), /Division by zero/);
});

test("square-root comparisons establish power domains without a decimal estimate", () => {
  const oldSqrt = Math.sqrt, oldPow = Math.pow, oldLog = Math.log;
  Math.sqrt = Math.pow = Math.log = () => { throw new Error("Decimal estimate requested"); };
  try {
    assert.equal(compute(`[[${a} | ◠]⌈⟨◠⟩⌉ {⟨◠⟩ ${a}}]`).canonical, "⟨◠○⟩");
    assert.equal(compute(`[[${b} | ${a}]⌈⟨◠⟩⌉ {⟨◠⟩ ${a} ${b}}]`).canonical, "⟨◠○○⟩");
    assert.throws(() => compute(`[${a} | ${b}]⌈⟨◠⟩⌉`), /Power base/);
    const derivative = differentiate("□⌈⟨◠⟩⌉", { at: `[${a} | ◠]` });
    assert.equal(derivative.established, true);
    assert.equal(compute(`[${derivative.ufn} | {⟨◠⟩ [${a} | ◠]}]`).canonical, "○");
  } finally { Math.sqrt = oldSqrt; Math.pow = oldPow; Math.log = oldLog; }
});
