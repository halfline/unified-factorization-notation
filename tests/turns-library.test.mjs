import assert from "node:assert/strict";
import test from "node:test";
import UFN from "../src/ufn.js";
import library from "../src/library.js";

const n = UFN.encodeInteger;
const counter = index => `□⌊${n(index)}⌋`;
const a = counter(1), b = counter(2), c = counter(3);

test("eighth-turn reductions use exact roots and ordered directions without floating point", () => {
  const original = Object.fromEntries(["sin", "cos", "exp", "pow", "log"].map(key => [key, Math[key]]));
  try {
    for (const key of Object.keys(original)) Math[key] = () => { throw new Error("Decimal arithmetic used"); };
    for (let axis = 1; axis <= 3; axis++) {
      const turn = amount => UFN.compute(`┌┘⌈{⟳ ${n(amount)} | ${n(8)}}@${n(axis)}⌉`);
      for (let amount = -17; amount <= 17; amount++) {
        const result = turn(amount);
        assert.ok(result.canonical);
        assert.equal(result.canonical, turn(amount + 24).canonical);
        assert.equal(UFN.compute(`{${result.ufn} ${turn(-amount).ufn}}`).canonical, "◠");
      }
      assert.equal(turn(2).canonical, "◠@" + n(axis));
      assert.equal(turn(4).canonical, "◡");
      assert.equal(turn(6).canonical, "◡@" + n(axis));
      assert.equal(turn(8).canonical, "◠");
      assert.equal(UFN.compute(`{${turn(1).ufn} ${turn(1).ufn}}`).canonical, turn(2).canonical);
    }
    const fourier = library.declarations(["fourier"]);
    const result = UFN.compute(fourier + "⟪○ ◠ ○ ○ ○ ○ ○ ○⟫");
    assert.equal(result.established, true);
    assert.equal(result.items.length, 8);
    const twice = UFN.compute(fourier + `⟪${result.ufn}⟫`);
    assert.equal(twice.ufn, `(○ ○ ○ ○ ○ ○ ○ ${n(8)})`);
  } finally { Object.assign(Math, original); }
});

test("turn proof preserves unsupported cases and validates every evaluated operand", () => {
  for (const source of ["┌┘⌈⟳@○⌉", "┌┘⌈{⟳ | ⟨◠○⟩}@◠⌉", "┌┘⌈[⟳@◠ ⟳@⟨◠⟩]⌉", "┌┘⌈[◠ ⟳@◠]⌉"])
    assert.equal(UFN.compute(source).canonical, null, source);
  assert.equal(UFN.compute("┌┘⌈○⌉").canonical, "◠");
  assert.equal(UFN.compute("[{┌┘@○}]⌈⟳@⟨◠○⟩⌉").canonical, "◠");
  assert.throws(() => UFN.compute("[┌┘@◠]⌈⟳@◠⌉"), /Power base/);
  assert.equal(UFN.compute("┌┘⌈[⟳ | ⟳]@◠⌉").canonical, "◠");
  assert.equal(UFN.compute("(□ : ⟳ … ⟳ : □)").items, null);
  for (const source of ["┌┘⌈{○ ⟳ | ○}@◠⌉", "┌┘⌈{○ □ ⟳}@◠⌉", "┌┘⌈⟳@⟨⟨◠⟩⟩⌉", "┌┘⌈()⌉", "┌┘⌈{⟳@◠}@◠⌉"])
    assert.throws(() => UFN.compute(source), UFN.UFNError, source);
});

test("library declarations compose explicitly and polynomial input can be directed", () => {
  const all = library.declarations();
  assert.equal(new UFN.Parser(all).parse().count, library.definitions.length);
  for (const [id, expected] of [["length", n(4)], ["digits", n(11)], ["polynomial", n(5)], ["coefficient", "◡@◠"], ["fourier", "(◠ ◡@◠ ◡ ◠@◠)"]]) {
    assert.equal(UFN.compute(library.example(id)).ufn, expected);
    assert.equal(UFN.compute(all + library.definitions.find(item => item.id === id).example).ufn, expected);
  }
  assert.equal(UFN.compute(all + "△⟪◠@◠ : ◠ ○ ◠⟫").canonical, "○");
  assert.equal(UFN.compute(all + "△⟪◠@◠ : ◠@⟨◠⟩ ○⟫").canonical, "◡@⟨◠○⟩");
  assert.equal(UFN.compute(all + "◇⟪⟪○ ◠ ○ ○⟫⟫").canonical, n(4));
  assert.equal(UFN.compute(all + "⟪⟫").ufn, "()");
  assert.equal(UFN.compute(all + "△⟪○ : ⟫").canonical, "○");
  assert.throws(() => UFN.compute("⟪○ ◠ ○ ○⟫"), UFN.UFNError);
  assert.equal((library.declarations(["fourier", "length", "coefficient"]).match(/≔/g) || []).length, 3);
});

test("expansion is syntactic, copyable, and protects substituted counter scope", () => {
  const documents = [
    ...library.definitions.map(item => library.example(item.id)),
    `≔(◇⟪${a}⟫ : [${b} : ◠ … ⟨◠⟩ : [${a} ${b}]]) [${b} : ◠ … ⟨◠○⟩ : ◇⟪${b}⟫]`,
    `≔(◇⟪${a}⟫ : ${a}⌈⟨◠⟩⌉) ◇⟪⟨◠⟩@○⟫`,
    `≔(◇⟪${a}⟫ : ${a}@◠) ◇⟪⟨◠⟩@○⟫`,
    `≔(◇⟪${a}⟫ : (${b} ${c} : ${a} : ${b})) (${b} ${c} : (◠ (⟨◠⟩ ⟨◠○⟩)) : ◇⟪${b}⟫)`,
    "≔(◇ : [□ : ○ … : ⟨◡⟩⌈□⌉]) ◇",
  ];
  for (const source of documents) {
    const expansion = UFN.expand(source, 40);
    assert.ok(expansion.written);
    assert.deepEqual(UFN.compute(expansion.expanded).value, UFN.compute(source).value, expansion.expanded);
    assert.equal(UFN.compute(expansion.expanded).partial, UFN.compute(source).partial);
  }
  const unknown = UFN.expand(`≔(◇⟪${a}⟫ : [${a} ◠]) ◇⟪{|○}⟫`);
  assert.match(unknown.expanded, /\{\|○\}/, "expansion does not evaluate even undefined arithmetic");
  assert.throws(() => UFN.compute(unknown.expanded), /Division by zero/);
  assert.equal(UFN.expand("≔(◇ : ◠)").expanded, "");
});

test("expansion retains unresolved complete limits and remains bounded", () => {
  const source = `≔(◇ : (${UFN.constants.e.source})) ◇`;
  const expanded = UFN.expand(source);
  assert.match(expanded.expanded, /⌊○⌋/);
  const result = UFN.compute(expanded.expanded);
  assert.equal(result.partial, false);
  assert.throws(() => result.value, /limit/);
  const template = `≔(◇⟪${a}⟫ : [${a} ${a} ${a} ${a}])`;
  const input = template + "◇⟪".repeat(7) + "◠" + "⟫".repeat(7);
  assert.throws(() => UFN.expand(input), /too (large|long)/);
});
