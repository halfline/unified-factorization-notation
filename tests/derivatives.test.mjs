import assert from "node:assert/strict";
import test from "node:test";
import UFN from "../src/ufn.js";
import derivatives from "../src/derivatives.js";

const { compute, measure, encodeInteger } = UFN;
const axes = ["○", "◠", "⟨◠⟩", "⟨◠○⟩"];

test("finite square rates approach the proved rate from both sides, including zero and backward inputs", () => {
  for (const point of [-2, -1, 0, 1, 2]) {
    for (const halvings of [0, 1, 4, 6]) {
      for (const side of ["forward", "backward"]) {
        const result = derivatives.describe(halvings, { point, side });
        assert.equal(result.derivative.canonical, encodeInteger(2 * point).replace(/\s/gu, ""));
        assert.equal(result.error.canonical, result.step.canonical);
        assert.equal(result.rate.partial, false);
        assert.equal(result.rate.canonical, compute("[" + result.derivative.canonical + " " + result.step.canonical + "]").canonical);
        assert.doesNotMatch(result.expression, /[0-9]/u);
      }
    }
  }
});

test("directed square rates preserve the two ordered terms and the exact remainder", () => {
  for (const pointAxis of axes) {
    for (const direction of axes) {
      for (const side of ["forward", "backward"]) {
        const result = derivatives.describe(3, { pointAxis, direction, side });
        const expectedError = compute("{" + result.step.canonical + " ◠@" + direction + " ◠@" + direction + "}");
        assert.equal(result.error.canonical, expectedError.canonical);
        assert.equal(compute("[" + result.derivative.canonical + " " + expectedError.canonical + "]").canonical, result.rate.canonical);
      }
    }
  }
  const across = derivatives.describe(1, { pointAxis: "◠", direction: "⟨◠⟩" });
  assert.equal(across.derivative.canonical, "○", "opposite cross terms cancel");
  assert.equal(across.rate.canonical, "[|⟨◡⟩]", "the finite quotient still has a remainder");
  assert.equal(derivatives.describe(1, { pointAxis: "◠", direction: "◠" }).derivative.canonical, "[|⟨◠⟩]");
  assert.equal(derivatives.describe(1, { direction: "⟨◠⟩" }).derivative.canonical, "⟨◠⟩@⟨◠⟩");

  // The design's full linearization also holds for mixed displacements,
  // not only the single-axis routes selectable in the demonstration.
  const x = "[◠ ◠@◠ ⟨◠⟩@⟨◠○⟩]", v = "[⟨◡⟩@◠ [|⟨◡○⟩]@⟨◠⟩]";
  const moved = "[" + x + " " + v + "]";
  const remainder = compute("[{" + moved + " " + moved + "} | {" + x + " " + x + "} {" + x + " " + v + "} {" + v + " " + x + "}]");
  assert.equal(remainder.canonical, compute("{" + v + " " + v + "}").canonical);
});

test("successive half-step corrections give finite rates and a separately proved limit", () => {
  for (const n of [1, 2, 4, 6]) {
    const bounded = "[⟨◠○⟩ | [□ : ◠ … " + encodeInteger(n) + " : ⟨[|□]⟩]]";
    assert.equal(compute(bounded).canonical, derivatives.describe(n).rate.canonical);
    const partial = compute("[⟨◠○⟩ | [□ : ◠ … : ⟨[|□]⟩]]", n);
    assert.equal(partial.canonical, compute(bounded).canonical);
    assert.equal(partial.partial, true);
  }
  const limit = compute("[⟨◠○⟩ | [□ : ◠ … : ⟨[|□]⟩]⌊○⌋]");
  assert.equal(limit.canonical, "⟨◠⟩");
  assert.equal(limit.partial, false);
  assert.equal(limit.limitProofs.length, 1);
});

test("the same rational rate identity has a shrinking error under a factor measurement", () => {
  for (const n of [1, 2, 5]) {
    const h = "⟨◠⟩⌈" + encodeInteger(n) + "⌉";
    const moved = "[◠ " + h + "]";
    const rate = "{[{" + moved + " " + moved + "} | ◠] | " + h + "}";
    const gap = "[" + rate + " | ⟨◠⟩]";
    assert.equal(compute(gap).canonical, compute(h).canonical);
    assert.equal(measure(gap, "◠").canonical, compute("{|" + h + "}").canonical);
    assert.equal(measure("{|" + h + "}", "◠").canonical, compute(h).canonical,
      "ordinary halvings grow under the first factor measurement");
  }
});

test("lesson arithmetic stays exact without a decimal projection and bounds its controls", () => {
  const originalPow = Math.pow, originalLog = Math.log;
  Math.pow = Math.log = () => { throw new Error("Decimal projection requested"); };
  try {
    const result = derivatives.describe(6, { point: -2, pointAxis: "⟨◠⟩", direction: "○", side: "backward" });
    assert.equal(result.derivative.canonical, "[|⟨⟨◠⟩⟩]@⟨◠⟩");
    assert.equal(result.error.canonical, result.step.canonical);
    assert.ok(result.rate.canonical);
    assert.ok(result.rate.display);
  } finally {
    Math.pow = originalPow; Math.log = originalLog;
  }
  for (const n of [-1, 7, 0.5, NaN]) assert.throws(() => derivatives.describe(n), RangeError);
  for (const options of [{ point: 3 }, { point: 0.5 }, { pointAxis: "four" }, { direction: "four" }, { side: "neither" }]) {
    assert.throws(() => derivatives.describe(1, options), RangeError);
  }
});
