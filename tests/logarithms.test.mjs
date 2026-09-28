import assert from "node:assert/strict";
import test from "node:test";
import UFN from "../src/ufn.js";

const { compute, encodeInteger: count, Parser, UFNError } = UFN;
const power = (base, exponent) => base + "⌈" + exponent + "⌉";
const log = (base, target) => base + "⌈|" + target + "⌉";

function exact(source, expected) {
  const result = compute(source);
  assert.ok(result.canonical, source + ": " + result.reason);
  assert.equal(result.canonical, compute(expected).canonical, source);
  assert.equal(result.partial, false);
}

test("logarithms find whole, backward, zero, and fractional exponents", () => {
  for (const [base, target, expected] of [
    [2, 8, count(3)], [4, 2, "⟨◡⟩"], [8, 4, "⟨◡◠⟩"],
    [6, 36, count(2)], [12, 144, count(2)], [5, 1, "○"], [7, 7, "◠"],
  ]) exact(log(count(base), count(target)), expected);
  exact(log(count(2), "⟨◡⟩"), "◡");
  exact(log("⟨◡⟩", count(8)), count(-3));
  exact(log("⟨◡⟩", "⟨[|⟨◠○⟩]⟩"), count(3));
});

test("every factor place participates, including fractional instructions and sparse positions", () => {
  for (const base of [count(2), count(6), count(10), "⟨◡◠⟩", "⟨⟨◡⟩◡⟩", "⟨◠⟩⌊⟨◠○○⟩⌋"]) {
    for (const exponent of ["○", "◠", "◡", count(3), count(-4), "⟨◡⟩", "⟨◡◠⟩", "[|⟨◡◠⟩]"]) {
      // Reduce the target first so this exercises factor comparison, not a
      // syntactic cancellation of a logarithm and its written power.
      const target = compute(power(base, exponent)).canonical;
      assert.ok(target);
      exact(log(base, target), exponent);
    }
  }
  for (const [base, target] of [[6, 12], [4, 8 * 3], [2, 3], [6, 2]]) {
    const result = compute(log(count(base), count(target)));
    assert.equal(result.canonical, null);
    assert.match(result.reason, /no single rational exponent/);
    assert.equal(result.ufn, log(count(base), count(target)));
    assert.ok(Math.abs(result.value[0] - Math.log(target) / Math.log(base)) < 1e-12);
  }
});

test("the shorthand changes the base and chained attachments apply from left to right", () => {
  const base = count(2), exponent = count(3), target = count(4);
  const shorthand = base + "⌈" + exponent + "|" + target + "⌉";
  const expanded = log(power(base, exponent), target);
  assert.deepEqual(new Parser(shorthand).parse(), new Parser(expanded).parse());
  exact(shorthand, "⟨◡◠⟩");
  exact(expanded, "⟨◡◠⟩");
  exact(base + "⌈◡|" + count(8) + "⌉", count(-3));
  exact(base + "⌈⟨◡⟩|" + count(8) + "⌉", count(6));
  exact(power(power(base, exponent), count(2)), count(64));
  exact(power(base, power(exponent, count(2))), count(512));
  exact(power(log(base, count(8)), count(2)), count(9));
  exact(log(log(base, count(8)), count(9)), count(2));
});

test("logarithms respect lookup, direction, number-entry, and counter scope", () => {
  exact(log("*" + count(3), count(8)), count(3));
  exact("*[" + log(count(2), count(8)) + "]", count(2));
  exact(log(count(2), count(8)) + "@◠", count(3) + "@◠");
  exact(log("[" + count(2) + "@○]", count(8) + "@○"), count(3));
  exact("⟨" + log(count(2), count(8)) + "⟩", count(8));
  exact("[□ : ○ … ⟨◠○⟩ : ⟨◠⟩⌈|⟨◠⟩⌈□⌉⌉]", count(6));
  exact("[□ : ◠ … ⟨◠○⟩ : [□⌊⟨◠⟩⌋ : ◠ … ⟨◠⟩ : ⟨◠⟩⌈□|⟨◠⟩⌈□⌊⟨◠⟩⌋⌉⌉]]", "{" + count(11) + "|" + count(2) + "}");
});

test("exact logarithms keep huge factor instructions without decimal expansion", () => {
  const originalPow = Math.pow, originalLog = Math.log;
  Math.pow = Math.log = () => { throw new Error("Decimal projection requested"); };
  try {
    // A million-bit integer would exceed the 16,384-mark count bound.
    const huge = power(count(2), count(1000000));
    exact(log(huge, power(count(2), count(2000000))), count(2));
    exact(log(power(count(6), count(1000000)), power(count(6), count(-500000))), "[|⟨◡⟩]");
    exact(log("⟨⟨◡⟩⟩", count(8)), count(6));
    const unresolved = compute(log(count(2), count(3)));
    assert.equal(unresolved.canonical, null);
    assert.throws(() => unresolved.value, /Decimal projection requested/);
  } finally { Math.pow = originalPow; Math.log = originalLog; }
});

test("root sums admit established equalities without guessing other logarithms", () => {
  const base = "[◠ ⟨⟨◡⟩⟩]";
  exact(log(base, "[⟨⟨◡⟩⟩ ◠]"), "◠");
  exact(log(base, "◠"), "○");
  const result = compute(log(base, count(2)));
  assert.equal(result.canonical, null);
  assert.match(result.reason, /exact recipe/);
  assert.ok(Math.abs(result.value[0] - Math.log(2) / Math.log(1 + Math.sqrt(2))) < 1e-12);
});

test("logarithms reject invalid bases, targets, and shorthand bases", () => {
  for (const base of ["○", "◡", "◠", "[]", "⟨○⟩", "[◠@◠]", "[◠ ◠@◠]"]) {
    assert.throws(() => compute(log(base, count(2))), UFNError, base);
  }
  for (const target of ["○", "◡", "[|⟨◡⟩]", "[◡ ◠@◠ ◡@◠]"]) {
    assert.throws(() => compute(log(count(2), target)), UFNError, target);
  }
  for (const source of ["⟨◠⟩⌈○|⟨◠⟩⌉", "◠⌈⟨◠⟩|◠⌉", "○⌈◠|◠⌉"]) {
    assert.throws(() => compute(source), UFNError, source);
  }
  assert.throws(() => compute(log("◠", power(count(2), "◠@◠"))), /base cannot be ◠/,
    "an already-invalid base is rejected even if target reduction would be unfinished");
  exact(log(count(2), count(4)), count(2));
});

test("malformed corners and deep attachment chains fail without stack overflows", () => {
  for (const suffix of ["⌈⌉", "⌈|⌉", "⌈◠|⌉", "⌈||◠⌉", "⌈|◠|◠⌉", "⌈◠◠|◠⌉", "⌈|◠◠⌉", "⌈|◠", "⌈◠|◠|◠⌉"]) {
    assert.throws(() => new Parser("⟨◠⟩" + suffix).parse(), UFNError, suffix);
  }
  assert.doesNotThrow(() => new Parser("◠" + "⌈◠⌉".repeat(63)).parse());
  for (const attachment of ["⌈◠⌉", "⌈|◠⌉", "⌈◠|◠⌉"]) {
    assert.throws(() => new Parser("◠" + attachment.repeat(1000)).parse(), UFNError);
  }
});

test("formatting keeps logarithm targets, shorthand, and operator scope intact", () => {
  for (const source of [
    "⟨◠⟩⌈⟨◠○⟩|⟨⟨◠⟩⟩⌉", "⟨◠⟩⌈⟨◠○⟩⌉⌈|⟨⟨◠⟩⟩⌉",
    "index(⟨◠⟩⌈|⟨⟨◠○⟩⟩⌉)@◠", "⟨◠⟩⌈|⟨◠○⟩⌉⌈⟨◠⟩⌉",
    "[□ : ◠ … ⟨◠○⟩ : {⟨◠⟩⌈□|⟨⟨◠○⟩⟩⌉ ⟨◠⟩⌈|⟨◠⟩⌈□⌉⌉}]",
  ]) {
    const result = compute(source);
    for (const width of [12, 76]) {
      const formatted = UFN.formatSource(source, width), restored = compute(formatted);
      assert.equal(restored.canonical, result.canonical, formatted);
      assert.deepEqual(restored.value, result.value, formatted);
    }
  }
  assert.equal(UFN.formatSource("⟨◠⟩⌈⟨◠○⟩|⟨⟨◠⟩⟩⌉"), "⟨◠⟩⌈⟨◠○⟩|⟨⟨◠⟩⟩⌉");
});

test("logarithms distinguish finite previews from proved or unresolved limits", () => {
  const halves = "[□ : ○ … : ⟨[|□]⟩]";
  const partial = compute(log(count(2), halves), 1);
  assert.equal(partial.canonical, "○");
  assert.equal(partial.partial, true);
  assert.equal(UFN.limit(log(count(2), halves)).canonical, "◠");
  exact(log(count(2), halves + "⌊○⌋"), "◠");
  const unresolved = compute(log(count(2), "[□ : ◠ … : {|{□ □}}]⌊○⌋"));
  assert.equal(unresolved.canonical, null);
  assert.throws(() => unresolved.value, /limit|convergence/);
});

test("differentiation handles constant logarithms and reports changing ones as unsupported", () => {
  const constant = UFN.differentiate("{□ ⟨◠⟩⌈|⟨⟨◠○⟩⟩⌉}", { at: "◠" });
  assert.equal(constant.established, true);
  assert.equal(constant.canonical, count(3));
  for (const recipe of ["⟨◠⟩⌈|□⌉", "□⌈|⟨◠⟩⌉", "⟨◠⟩⌈□|⟨◠⟩⌉"]) {
    const result = UFN.differentiate(recipe, { at: count(2) });
    assert.equal(result.established, false);
    assert.match(result.reason, /logarithm/);
  }
});

function nearVector(actual, expected, tolerance = 1e-12) {
  actual.forEach((entry, i) => assert.ok(Math.abs(entry - expected[i]) <= tolerance * Math.max(1, Math.abs(expected[i])),
    "component " + i + ": " + entry + " differs from " + expected[i]));
}

test("directed targets choose the principal logarithm in each axis and mixed directions", () => {
  const turn = 2 * Math.PI, ln2 = Math.log(2);
  for (const [i, axis] of ["◠", "⟨◠⟩", "⟨◠○⟩"].entries()) {
    for (const sign of [-1, 1]) {
      const result = compute(log(count(2), count(sign) + "@" + axis));
      assert.equal(result.canonical, null);
      assert.match(result.reason, /principal directed logarithm/);
      const expected = [0, 0, 0, 0]; expected[i + 1] = sign * turn / 4 / ln2;
      nearVector(result.value, expected);
    }
  }
  const mix = "[◠ ◠@◠ ◠@⟨◠⟩ ◠@⟨◠○⟩]";
  const part = turn / 6 / Math.sqrt(3) / ln2;
  nearVector(compute(log(count(2), mix)).value, [1, part, part, part]);
  nearVector(compute(log("⟨◡⟩", mix)).value, [-1, -part, -part, -part]);
  nearVector(compute(log(count(2), "[◡ ◠@◠]")).value, [0.5, 3 * turn / 8 / ln2, 0, 0]);
  nearVector(compute(count(2) + "⌈" + count(3) + "|◠@◠⌉").value, [0, turn / 12 / ln2, 0, 0]);
});

test("directed decimal logarithms preserve tiny components and avoid norm overflow", () => {
  const tiny = power(count(2), count(-1074));
  const nearlyBackward = compute(log(count(2), "[◡ " + tiny + "@⟨◠⟩]"));
  assert.match(nearlyBackward.reason, /principal directed logarithm/);
  nearVector(nearlyBackward.value, [0, 0, Math.PI / Math.log(2), 0]);
  nearVector(compute(log(count(2), tiny + "@◠")).value, [-1074, Math.PI / 2 / Math.log(2), 0, 0]);
  const large = power(count(2), count(1023));
  const target = "[" + ["○", "◠", "⟨◠⟩", "⟨◠○⟩"].map(axis => large + "@" + axis).join(" ") + "]";
  const answer = compute(log(count(2), target)).value;
  assert.ok(answer.every(Number.isFinite));
  nearVector(answer, [1024, ...Array(3).fill(Math.PI / 3 / Math.sqrt(3) / Math.log(2))]);
});

test("a power of its logarithm recovers a valid target exactly without decimal arithmetic", () => {
  const originalPow = Math.pow, originalLog = Math.log, originalAtan = Math.atan2;
  Math.pow = Math.log = Math.atan2 = () => { throw new Error("Decimal projection requested"); };
  try {
    for (const base of [count(2), "⟨◡⟩", "[◠ ⟨⟨◡⟩⟩]"]) {
      for (const target of [count(3), "◠@◠", "[◡ ◠@⟨◠⟩]", "[◠ ⟨⟨◡⟩⟩@◠ ⟨◠⟩@⟨◠○⟩]"]) {
        exact(power(base, log(base, target)), target);
      }
    }
    exact(power("[◠ ◠]", log(count(2), "◠@◠")), "◠@◠");
    exact(power(count(2), log(count(4), count(16))), count(4));
  } finally { Math.pow = originalPow; Math.log = originalLog; Math.atan2 = originalAtan; }
  for (const target of ["○", "◡", "[◡ ◠@◠ ◡@◠]", "{|○}"]) {
    assert.throws(() => compute(power(count(2), log(count(2), target))), UFNError);
  }
  assert.throws(() => compute(power("◠", log("◠", "◠@◠"))), UFNError);
  assert.throws(() => compute(power(count(2), log("◡", "◠@◠"))), UFNError);
  assert.equal(compute(power(count(2), log(count(4), "◠@◠"))).canonical, null);
});

test("a logarithm of a directed power does not incorrectly recover extra whole turns", () => {
  const source = log(count(2), power(count(2), count(10) + "@◠"));
  const answer = compute(source);
  assert.equal(answer.canonical, null);
  nearVector(answer.value, [0, 10 - 2 * Math.PI / Math.log(2), 0, 0]);
  assert.ok(Math.abs(answer.value[1] - 10) > 1);
});
