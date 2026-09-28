import assert from "node:assert/strict";
import test from "node:test";
import UFN from "../src/ufn.js";
import subdivision from "../src/subdivision.js";

const { compute, encodeInteger } = UFN;
const at = (entry, position) => "⟨" + entry + "⟩⌊" + encodeInteger(position) + "⌋";

function roundTrip(source) {
  const answer = compute(source), display = answer.display;
  assert.ok(answer.canonical, source);
  assert.ok(display.length <= answer.canonical.length);
  const restored = compute(display);
  assert.equal(restored.canonical, answer.canonical, display);
  assert.equal(restored.display, display, "display is stable after another reduction");
  assert.equal(answer.ufn, answer.canonical, "the existing reference-form API stays dense");
  return answer;
}

test("distant factor positions display briefly while canonical identity stays dense", () => {
  const source = "⟨◠⟩⌊⟨⟨◠○⟩○⟨⟨◠⟩⟩⟩⌋";
  const answer = roundTrip(source);
  assert.equal(answer.canonical.length, 2002);
  assert.equal(answer.display, source);
  assert.equal(answer.display.length, 17);
  for (const position of [32, 128, 1999]) assert.ok(roundTrip(at("◠", position)).display.includes("⌊"));
  for (const n of [0, 1, -1, 2, 3, 4, 5, 7, 11, 12]) {
    const answer = roundTrip(encodeInteger(n));
    assert.equal(answer.display, answer.canonical, "common values keep their familiar shapes");
  }
});

test("separated groups, adjacent entries, fractions, and nested instructions round-trip", () => {
  const distant = at("◠", 2000);
  const separated = roundTrip("{" + distant + " ⟨◠⟩}");
  assert.equal(separated.display, "{" + distant + " ⟨◠⟩}");
  for (const source of [
    "{" + at("◠", 100) + " " + at("◠", 101) + " " + at("◠", 2000) + "}",
    "{" + at("◡", 80) + " " + at("⟨◡⟩", 1999) + "}",
    "⟨" + distant + "⟩", "⟨[|" + distant + "]⟩",
    "⟨" + at("◡", 2000) + "⟩",
  ]) assert.ok(roundTrip(source).display.includes("⌊"));
  const adjacent = roundTrip("{" + at("◠", 1999) + " " + distant + "}");
  assert.equal(adjacent.display, "⟨◠◠⟩⌊" + compute(encodeInteger(1999)).display + "⌋");
});

test("shortening preserves whole signs and all four component labels", () => {
  const magnitude = "{" + at("◠", 2000) + " ⟨◡⟩}";
  roundTrip("[|" + magnitude + "]");
  const source = "[" + magnitude + "@○ [|" + magnitude + "]@◠ "
    + at("◡", 1999) + "@⟨◠⟩ " + at("◠", 1000) + "@⟨◠○⟩]";
  const answer = roundTrip(source);
  for (const label of ["@○", "@◠", "@⟨◠⟩", "@⟨◠○⟩"]) assert.ok(answer.display.includes(label));
});

test("display does not request decimal projection or turn partial sums and recipes into limits", () => {
  const originalPow = Math.pow, originalLog = Math.log;
  Math.pow = Math.log = () => { throw new Error("Decimal arithmetic was requested"); };
  try {
    const source = "[□ : ◠ … : " + at("◠", 2000) + "]";
    const answer = roundTrip(source);
    const iterations = answer.iterations;
    assert.equal(answer.partial, true);
    assert.equal(answer.display, answer.display);
    assert.equal(answer.iterations, iterations);
    const recipe = "[◠ ⟨⟨◡⟩⟩]";
    const unreduced = compute(recipe);
    assert.equal(unreduced.canonical, null);
    assert.equal(unreduced.display, recipe);
    assert.equal(unreduced.partial, false);
  } finally { Math.pow = originalPow; Math.log = originalLog; }
});

test("a mix of occupied and empty places stays no longer than the reference form", () => {
  for (let pattern = 1; pattern <= 40; pattern++) {
    const entries = Array.from({ length: 120 }, (_, i) =>
      (i * 13 + pattern * 7) % (pattern + 3) === 0 ? (i % 2 ? "◡" : "⟨◡⟩") : "○");
    roundTrip("⟨" + entries.join("") + "⟩");
  }
});

test("exact root combinations display a reduced recipe without claiming a single factor spelling", () => {
  const source = "{|[◠ ⟨⟨◡⟩⟩]}";
  const answer = compute(source);
  assert.equal(answer.canonical, null);
  assert.equal(answer.ufn, source, "the input recipe is still available");
  assert.equal(answer.reduced, "[⟨⟨◡⟩⟩ | ◠]");
  assert.equal(compute("[" + answer.display + " | " + source + "]").canonical, "○");
  const proved = UFN.limit("[□ : ○ … : {[◠ ⟨⟨◡⟩⟩] ⟨◡⟩⌈□⌉}]");
  assert.equal(proved.canonical, null);
  assert.ok(proved.reduced);
  assert.equal(proved.partial, false);
  assert.ok(proved.limitProofs.length);
  assert.equal(compute("[" + proved.display + " | {⟨◠⟩ [◠ ⟨⟨◡⟩⟩]}]").canonical, "○");
});

test("component spellings preserve exact directions without decimal reconstruction", () => {
  const originalPow = Math.pow, originalLog = Math.log, originalLog2 = Math.log2;
  Math.pow = Math.log = Math.log2 = () => { throw new Error("Decimal arithmetic was requested"); };
  try {
    const labels = ["○", "◠", "⟨◠⟩", "⟨◠○⟩"];
    for (const source of ["○", "◠", "◡@◠", "[⟨⟨◡⟩⟩@○ ◠@◠ ◡@⟨◠⟩ ⟨◡⟩@⟨◠○⟩]",
      "[{|[◠ ⟨⟨◡⟩⟩]}@◠ [◠ ⟨◠○⟩]@⟨◠⟩]",
    ]) {
      const answer = compute(source), components = answer.components;
      assert.equal(components.length, 4);
      assert.equal(answer.components, components, "the spellings are cached");
      assert.ok(Object.isFrozen(components));
      const restored = "[" + components.map((amount, i) => amount + "@" + labels[i]).join(" ") + "]";
      assert.equal(compute("[" + restored + " | " + source + "]").canonical, "○");
    }
    assert.equal(UFN.limit("[□ : ◠ … : {|{□ □}}]").components, null,
      "an unresolved limit has no exact components to expose");
  } finally { Math.pow = originalPow; Math.log = originalLog; Math.log2 = originalLog2; }
});

test("long recipes gain readable lines without changing operator scope or named counters", () => {
  for (const source of [subdivision.definition({ recipe: "square", direction: "◠", path: "⟨◠⟩" }),
    "[index(⟨⟨◠⟩⟩⌈⟨◡⟩⌉)@◠ {◠@◠ ◠@⟨◠⟩} *⟨◠⟩⌊⟨◠○⟩⌋⌈⟨◠⟩⌉]",
    "[□ : ◠ … ⟨◠○⟩ : [□⌊⟨◠⟩⌋ : ○ … □ : {□ □⌊⟨◠⟩⌋}]]",
  ]) {
    const formatted = UFN.formatSource(source, 32);
    assert.ok(formatted.includes("\n"));
    assert.equal(compute(formatted).canonical, compute(source).canonical);
    assert.equal(compute(formatted).partial, compute(source).partial);
  }
  assert.equal(UFN.formatSource("⟨⟨◠⟩⟩"), "⟨⟨◠⟩⟩", "a number stays together for font shaping");
  for (const source of ["*".repeat(60) + "⟨◠⟩", "index(".repeat(60) + "◠" + ")".repeat(60)]) {
    assert.doesNotThrow(() => new UFN.Parser(UFN.formatSource(source)).parse(),
      "formatting a valid recipe keeps it within the parser's nesting limit");
  }
});
