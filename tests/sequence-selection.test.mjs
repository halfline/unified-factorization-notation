import assert from "node:assert/strict";
import test from "node:test";
import UFN from "../src/ufn.js";
import library from "../src/library.js";

const { compute, encodeInteger: n } = UFN;
const [a, b, entry, place] = [1, 2, 3, 4].map(i => `□⌊${n(i)}⌋`);
const run = (id, source) => compute(library.declarations([id]) + "\n" + source);

test("box and bullet names both work and remain distinct", () => {
  const source = "[• : ◠ … ⟨◠⟩ : •]";
  assert.equal(compute(source).canonical, n(3));
  assert.equal(UFN.formatSource(source), source);
  assert.throws(() => compute("[•⌊⟨◠⟩⌋ : ◠ … ⟨◠⟩ : □⌊⟨◠⟩⌋]"), /Unbound counter/);
  const expanded = UFN.expand("≔(◇ : (• : ◠ … ⟨◠⟩ : •)) ◇");
  assert.ok(expanded.expanded.includes("□"));
  assert.equal(compute(expanded.expanded).ufn, "(◠ ⟨◠⟩)");
});

test("lookup counts complete outer entries from the right, retaining nested shapes", () => {
  const source = "(⟨◠⟩ ◡ ◠)";
  for (const [position, expected] of [[0, 1], [1, -1], [2, 2]])
    assert.equal(compute(`${source}⌊${n(position)}⌋`).canonical, n(expected));
  assert.equal(compute("((◠ ○) (◡ ⟨◠⟩))⌊○⌋").ufn, "(◡ ⟨◠⟩)");
  assert.equal(compute("((◠ ○) (◡ ⟨◠⟩))⌊○⌋⌊◠⌋").canonical, "◡");
  assert.equal(compute("(() ◠)⌊◠⌋").ufn, "()");
  assert.equal(compute("(○ ○ ◠)⌊⟨◠⟩⌋").canonical, "○");
});

test("lookup reads a generated source once and uses its surrounding counter scope", () => {
  const result = compute("(□ : ◠ … ⟨◠○⟩ : {□ □})⌊◠⌋");
  assert.equal(result.canonical, n(4));
  assert.equal(result.iterations, 3);
  assert.equal(compute(`(${a} : ○ … ◠ : (${a} : ◠ … ⟨◠⟩ : ${a})⌊${a}⌋)`).ufn, "(⟨◠⟩ ◠)");
  assert.equal(compute(`(${entry} ${place} : ((◠ ◡) (○ ⟨◠⟩)) : ${entry}⌊○⌋)`).ufn, "(◡ ⟨◠⟩)");
  assert.equal(compute(`≔(◇ : (○ ◠)) ◇⌊○⌋`).canonical, "◠");
});

test("lookup validates the complete source and rejects invalid places", () => {
  for (const source of ["()⌊○⌋", "(◠)⌊◠⌋", "(◠)⌊◡⌋", "(◠)⌊⟨◡⟩⌋", "(◠)⌊◠@◠⌋", "(◠)⌊()⌋", "◠⌊○⌋"])
    assert.throws(() => compute(source), UFN.UFNError, source);
  for (const source of ["({|○} ◠)⌊○⌋", "(◠ {|○})⌊◠⌋", "(({|○}) ◠)⌊○⌋", "(◠ □)⌊◠⌋"])
    assert.throws(() => compute(source), /Division by zero|Unbound counter/, source);
  assert.equal(compute("(□ : ◠ … ○ : {|○})").ufn, "()", "an empty range still never visits its body");
  assert.throws(() => compute("(□ : ◠ … ○ : {|○})⌊○⌋"), /empty sequence/);
  assert.equal(compute("(┌┘ ◠)⌊○⌋").canonical, "◠", "an unfinished entry is not itself an error");
});

test("lookup attachments preserve names, factor positions, measurements, and operator scope", () => {
  assert.equal(compute("⟨◠⟩⌊⟨◠⟩⌋").canonical, n(3));
  assert.equal(compute("[□ : ○ … : ⟨◠⟩⌈□⌉]⌊◠⌋").canonical, "◡");
  assert.equal(compute("(⟨◠⟩)⌊○⌋⌈⟨◠⟩⌉").canonical, n(4));
  assert.equal(compute("(◠@◠ ◠@⟨◠⟩)⌊◠⌋#◠").canonical, "◠");
  assert.equal(compute("*[(⟨◠○○⟩ ◠)⌊◠⌋]").canonical, n(3));
  assert.throws(() => compute("*(⟨◠○○⟩ ◠)⌊◠⌋"), /sequence is not a number/);
  for (const source of ["((◠ ○) (◡ ⟨◠⟩))⌊○⌋⌊◠⌋", "(⟨◠⟩)⌊○⌋⌈⟨◠⟩⌉", "index((⟨◠○○⟩)⌊○⌋)"])
    assert.equal(compute(UFN.formatSource(source, 32)).ufn, compute(source).ufn);
});

test("selection captures sequences hygienically and expansions preserve scalar-or-sequence capture", () => {
  const select = `≔(◇⟪${a} : ${b}⟫ : ${a}⌊${b}⌋)`;
  assert.equal(compute(select + "◇⟪◠ ◡ : ○⟫").canonical, "◡");
  assert.equal(compute(select + "◇⟪(◠ ◡) : ○⟫").canonical, "◡");
  assert.equal(compute(select + `(${a} : ○ … ◠ : ◇⟪◠ ◡ : ${a}⟫)`).ufn, "(◡ ◠)");
  const identity = `≔(⟦${a}⟧ : (${entry} ${place} : ${a} : ${entry}))`;
  for (const source of [
    select + "◇⟪((◠ ◡)) : ○⟫",
    select + `(${entry} : ○ … ◠ : ◇⟪${entry} ◡ : ${entry}⟫)`,
    identity + "⟦((◠ ◡) ⟨◠⟩)⌊◠⌋⟧",
    identity + "⟦((◠ ◡) ⟨◠⟩)⌊○⌋⟧",
  ]) assert.equal(compute(UFN.expand(source).expanded).ufn, compute(source).ufn, source);
});

test("selected recipes keep their bound values and never manufacture an exact decimal result", () => {
  const result = compute(`(${a} : ◠ … ⟨◠⟩ : {${a} ┌┘})⌊○⌋`);
  assert.equal(result.canonical, null);
  assert.equal(result.components, null);
  assert.equal(result.value[0], 2 * Math.E);
  assert.equal(result.canonical, null);
  assert.equal(compute(result.ufn).value[0], result.value[0]);
  const nested = compute(`((${a} : ◠ … ⟨◠⟩ : {${a} ┌┘}))⌊○⌋`);
  assert.equal(nested.kind, "sequence");
  assert.deepEqual(compute(nested.ufn).value, nested.value);
  const unfinishedSequence = compute("((□ : ○ … ┌┘ : □))⌊○⌋");
  assert.equal(unfinishedSequence.kind, "sequence");
  assert.equal(unfinishedSequence.items, null);
  assert.equal(unfinishedSequence.established, false);
  assert.equal(compute(unfinishedSequence.ufn).kind, "sequence");
  const complete = compute(`≔(◇ : (${UFN.constants.e.source})) ◇⌊○⌋`);
  assert.equal(complete.partial, false);
  assert.throws(() => complete.value, /complete limit/);
});

test("fixed selection supports differentiation; a changing place is not differentiated", () => {
  assert.equal(UFN.differentiate("(□ {□ □})⌊○⌋", { at: n(3) }).canonical, n(6));
  assert.equal(UFN.differentiate("(□ {□ □})⌊◠⌋", { at: n(3) }).canonical, "◠");
  const changing = UFN.differentiate("(◠ ⟨◠⟩)⌊□⌋", { at: "○" });
  assert.equal(changing.established, false);
  assert.match(changing.reason, /Entry place must stay fixed/);
});

test("derived pairing validates equal lengths including empty inputs and keeps written order", () => {
  assert.equal(run("pair", "⋈⟪◠ ⟨◠⟩ : ⟨◠○⟩ ⟨⟨◠⟩⟩⟫").ufn, "((◠ ⟨◠○⟩) (⟨◠⟩ ⟨⟨◠⟩⟩))");
  assert.equal(run("pair", "⋈⟪ : ⟫").ufn, "()");
  assert.equal(run("pair", "⋈⟪((◠ ○)) : ((◡))⟫").ufn, "(((◠ ○) (◡)))");
  for (const source of ["⋈⟪◠ : ◠ ○⟫", "⋈⟪◠ ○ : ◠⟫", "⋈⟪ : ◠⟫", "⋈⟪◠ : ⟫"])
    assert.throws(() => run("pair", source), /Entry place|empty sequence/, source);
  assert.throws(() => run("pair", "⋈⟪ : {|○}⟫"), /Division by zero/);
  const unfinished = run("pair", "⋈⟪ : (□ : ◠ … ┌┘ : □)⟫");
  assert.equal(unfinished.kind, "sequence");
  assert.equal(unfinished.items, null);
  assert.equal(unfinished.canonical, null);
  assert.notEqual(unfinished.ufn, "()", "an unknown length cannot establish equal lengths");
  const ordered = `≔(✧ : ⋈⟪◠@◠ : ◠@⟨◠⟩⟫)
    {${entry} ${place} : ✧ : {${entry}⌊◠⌋ ${entry}⌊○⌋}}`;
  assert.equal(run("pair", ordered).canonical, "◠@⟨◠○⟩");
});

test("derived rearrangement supports reversal, repetitions, nested entries, and empty requests", () => {
  assert.equal(run("rearrange", "↷⟪◠ ⟨◠⟩ ⟨◠○⟩ : ○ ◠ ⟨◠⟩⟫").ufn, "(⟨◠○⟩ ⟨◠⟩ ◠)");
  assert.equal(run("rearrange", "↷⟪◠ ◡ : ○ ○ ◠⟫").ufn, "(◡ ◡ ◠)");
  assert.equal(run("rearrange", "↷⟪((◠ ○) (◡)) : ○ ◠⟫").ufn, "((◡) (◠ ○))");
  assert.equal(run("rearrange", "↷⟪◠ ◡ : ⟫").ufn, "()");
  assert.equal(run("rearrange", "↷⟪ : ⟫").ufn, "()");
  assert.throws(() => run("rearrange", "↷⟪ : ○⟫"), /empty sequence/);
  assert.throws(() => run("rearrange", "↷⟪{|○} : ⟫"), /Division by zero/);
  assert.throws(() => run("rearrange", "↷⟪◠ : ◠⟫"), /outside/);
  assert.notEqual(run("rearrange", "↷⟪(□ : ◠ … ┌┘ : □) : ⟫").ufn, "()",
    "an empty request still requires a finite source");
  for (const id of ["pair", "rearrange"])
    assert.equal(compute(UFN.expand(library.example(id)).expanded).ufn, compute(library.example(id)).ufn);
});

test("lookup can inspect existing Pascal and Fourier results without rewriting their definitions", () => {
  assert.equal(run("pascal", "▱⟪⟨◠○○⟩⟫⌊⟨◠⟩⌋").canonical, n(10));
  assert.equal(run("fourier", "⟪○ ◠ ○ ○⟫⌊⟨◠⟩⌋").canonical, "◡@◠");
});
