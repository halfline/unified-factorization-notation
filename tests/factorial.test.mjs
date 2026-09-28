import assert from "node:assert/strict";
import test from "node:test";
import UFN from "../src/ufn.js";
import factorial from "../src/factorial.js";

const { compute, encodeInteger } = UFN;
const { approximation, definition, describe } = factorial;
const close = (a, b) => a.forEach((value, i) => assert.ok(Math.abs(value - b[i]) < 1e-10, `${value} differs from ${b[i]}`));

test("the shifted gamma definition preserves whole factorials exactly without decimal arithmetic", () => {
  const pow = Math.pow, log = Math.log;
  Math.pow = Math.log = () => { throw new Error("Decimal arithmetic was requested"); };
  try {
    for (const [input, expected] of [["○", "◠"], ["◠", "◠"], ["⟨◠⟩", "⟨◠⟩"],
      ["[⟨◠⟩ ◠]", "⟨◠◠⟩"], ["⟨◠○○⟩", "⟨◠◠⟨◠○⟩⟩"]]) {
      const answer = describe(input, 8);
      assert.equal(answer.wholeResult.canonical, expected);
      assert.equal(answer.wholeResult.partial, false);
    }
    const answer = describe(encodeInteger(1000), 1);
    assert.ok(answer.wholeResult.canonical);
    assert.equal(answer.wholeResult.iterations, 1000);
    assert.ok(describe("⟨◡⟩", 8).finite.canonical, "a fractional stage can reduce exactly too");
    assert.equal(describe("⟨◡⟩", 8).wholeResult, null);
  } finally { Math.pow = pow; Math.log = log; }
});

test("finite gamma stages satisfy their exact recurrence and recover their telescoping partial sums", () => {
  for (const input of ["○", "◠", "⟨◡⟩", "[|⟨◡⟩]"]) {
    for (const count of [1, 2, 8]) {
      const n = encodeInteger(count), next = "[" + input + " ◠]";
      const currentStage = approximation(input, count);
      const nextStage = approximation(next, count);
      const recurrence = "{" + currentStage + " " + next + " " + n + " | [" + input + " " + n + " ◠]}";
      assert.equal(compute(nextStage).canonical, compute(recurrence).canonical);
      if (count > 1) {
        const partial = compute(definition(input), count - 1);
        assert.equal(partial.canonical, compute(currentStage).canonical);
        assert.equal(partial.partial, true);
      }
    }
  }
  const count = "⟨⟨◠○⟩⟩";
  const threeStage = approximation("⟨◠○⟩", 8);
  assert.equal(compute(threeStage).canonical,
    compute("{⟨◠◠⟩ " + count + " " + count + " " + count + " | [" + count + " ◠] [" + count + " ⟨◠⟩] [" + count + " ⟨◠○⟩]}").canonical);
});

test("backward whole inputs are poles, including equivalent expressions and counts beyond the range bound", () => {
  for (const input of ["◡", "[◡ ◡]", "[|⟨◠○⟩]", encodeInteger(-1001), "[◡@○ ◠@◠ ◡@◠]"])
    assert.throws(() => describe(input), /pole/, input);
  assert.ok(describe("[|⟨◡⟩]", 8).finite.canonical);
  assert.ok(describe("[◡@○ ◠@◠]", 1).finite.canonical);
});

test("directed inputs stay together and rotate with the orthogonal part", () => {
  assert.equal(describe("◠@◠", 1).finite.canonical, "[⟨◡⟩@○ [|⟨◡⟩]@◠]");
  const first = describe("◠@◠", 32), second = describe("◠@⟨◠⟩", 32);
  assert.equal(first.finite.canonical, null);
  assert.equal(first.wholeResult, null);
  const a = first.finite.value, b = second.finite.value;
  close(b, [a[0], 0, a[1], 0]);
  close(describe("◡@◠", 32).finite.value, [a[0], -a[1], 0, 0]);
  const mixed = describe("[⟨◡⟩ ⟨◡⟩@◠ ⟨◡⟩@⟨◠⟩]", 32).finite.value;
  assert.ok(Math.abs(mixed[1] - mixed[2]) < 1e-12);
  assert.equal(mixed[3], 0);
  close(compute(definition("◠@◠"), 3).value, describe("◠@◠", 4).finite.value);
});

test("half-step stages approach the known gamma values with the forward shift", () => {
  for (const [input, destination] of [["⟨◡⟩", Math.sqrt(Math.PI) / 2], ["[|⟨◡⟩]", Math.sqrt(Math.PI)]]) {
    const early = describe(input, 8).finite.value[0];
    const late = describe(input, 512).finite.value[0];
    assert.ok(Math.abs(late - destination) < Math.abs(early - destination));
    assert.ok(Math.abs(late - destination) < 0.001);
  }
});

test("definition builders respect input scopes and retain endless input recipes", () => {
  const input = "[□ : ◠ … ◠ : ⟨◡⟩]";
  const source = definition(input);
  assert.match(source, /\[□⌊⟨◠⟩⌋ :/u);
  assert.equal(compute(source, 3).canonical, describe("⟨◡⟩", 4).finite.canonical);
  assert.throws(() => definition("□"), /Unbound counter/);
  assert.throws(() => definition("[⟨◠⟩⌈◠@◠⌉ □]"), /Unbound counter/);
  for (const alias of ["[□ : ◠ … ⟨◠⟩ : □⌊◠⌋]", "[□⌊◠⌋ : ◠ … ⟨◠⟩ : □]"])
    assert.throws(() => describe(alias, 4), /Unbound counter/);
  const resolved = describe("[□ : ○ … : ⟨◡⟩⌈□⌉]", 1);
  assert.equal(resolved.input.partial, false);
  assert.equal(resolved.input.canonical, "⟨◠⟩");
  assert.equal(resolved.wholeResult.canonical, "⟨◠⟩");
  assert.equal(resolved.finite.partial, false);
  const endless = "[□ : ◠ … : {|□ □}]";
  const answer = describe(endless, 1);
  assert.equal(answer.input.partial, true);
  assert.equal(answer.wholeResult, null);
  assert.ok(answer.definition.includes(endless));
  assert.equal(answer.finite.partial, true);
  assert.throws(() => definition("[□ : ◠ … : ◠]"), /no limit/);
  assert.doesNotMatch(source, /[0-9Γ!]/u);
});
