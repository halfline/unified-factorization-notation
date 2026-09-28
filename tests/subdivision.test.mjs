import assert from "node:assert/strict";
import test from "node:test";
import UFN from "../src/ufn.js";
import subdivision from "../src/subdivision.js";

const { compute, encodeInteger } = UFN;
const { approximation, corrections, describe } = subdivision;

test("finite subdivisions match independent grouping formulas at each sample location", () => {
  for (const pieces of [1, 2, 3, 8, 32, 64]) {
    const count = encodeInteger(pieces);
    const halfPiece = "{⟨◡⟩ | " + count + "}";
    const sixthSquare = "{⟨◡◡⟩ | " + count + " " + count + "}";
    const twelfthSquare = "{|⟨◠⟨◠⟩⟩ " + count + " " + count + "}";
    const expected = {
      constant: { start: "◠", middle: "◠", end: "◠" },
      position: { start: "[⟨◡⟩ | " + halfPiece + "]", middle: "⟨◡⟩", end: "[⟨◡⟩ " + halfPiece + "]" },
      square: {
        start: "[⟨◡○⟩ " + sixthSquare + " | " + halfPiece + "]",
        middle: "[⟨◡○⟩ | " + twelfthSquare + "]",
        end: "[⟨◡○⟩ " + halfPiece + " " + sixthSquare + "]",
      },
    };
    for (const [recipe, samples] of Object.entries(expected)) {
      for (const [sample, formula] of Object.entries(samples)) {
        const source = approximation(pieces, { recipe, sample });
        const answer = compute(source);
        assert.equal(answer.canonical, compute(formula).canonical, pieces + " " + recipe + " " + sample);
        assert.equal(answer.partial, false);
        assert.equal(answer.iterations, pieces + 1, "one visit to bind the count, then exactly one per piece");
        assert.doesNotMatch(source, /[0-9÷~]/u);
      }
    }
  }
});

test("successive corrections telescope to the latest approximation without claiming its limit", () => {
  for (const recipe of ["constant", "position", "square"]) {
    for (const sample of ["start", "middle", "end"]) {
      const options = { recipe, sample };
      for (const pieces of [1, 2, 5]) {
        const expected = compute(approximation(pieces, options)).canonical;
        const finite = compute(corrections(options, pieces));
        assert.equal(finite.canonical, expected);
        assert.equal(finite.partial, false);
        if (pieces > 1) {
          const endless = compute(corrections(options), pieces - 1);
          assert.equal(endless.canonical, expected);
          assert.equal(endless.partial, true);
        }
      }
    }
  }
  const simplified = "[◠ | [□ : ⟨◠⟩ … : {|⟨◠⟩ □ [□ | ◠]}]]";
  assert.equal(compute(simplified, 12).canonical, compute(corrections(), 12).canonical);
});

test("directed pieces preserve quaternion order in totals, corrections, and reference destinations", () => {
  const options = { direction: "◠", path: "⟨◠⟩", recipe: "constant" };
  for (const [order, expected] of [["after", "◠@⟨◠○⟩"], ["before", "◡@⟨◠○⟩"]]) {
    const result = describe(4, { ...options, order });
    assert.equal(result.total, expected);
    assert.equal(result.destination, expected);
    assert.equal(result.gap, "○");
    assert.equal(compute(result.correctionExpression, 3).canonical, expected);
    assert.equal(compute(result.correctionExpression, 3).partial, true);
  }
  assert.equal(describe(2, { direction: "◠", path: "◠", recipe: "constant" }).total, "◡");
  assert.equal(describe(2, { direction: "⟨◠○⟩", sample: "middle" }).total, "⟨◡⟩@⟨◠○⟩");
});

test("lesson rows reconstruct the finite total with exact sharing and no decimal projection", () => {
  const originalPow = Math.pow, originalLog = Math.log;
  Math.pow = Math.log = () => { throw new Error("Decimal arithmetic was requested"); };
  try {
    const result = describe(8, { recipe: "square", sample: "start", direction: "◠", path: "⟨◠⟩", order: "before" });
    assert.equal(result.rows.length, 8);
    assert.equal(result.rows[0][1], "○");
    assert.equal(result.rows[0][4], "○");
    assert.equal(compute("[" + result.rows.map(row => row[4]).join(" ") + "]").canonical, result.total);
    assert.equal(compute("[" + result.total + " " + result.gap + "]").canonical, result.destination);
    assert.equal(compute("[" + result.rows.map(row => row[3]).join(" ") + "]").canonical, "◠@⟨◠⟩");
  } finally {
    Math.pow = originalPow; Math.log = originalLog;
  }
});
