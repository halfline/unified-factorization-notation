import assert from "node:assert/strict";
import test from "node:test";
import UFN from "../src/ufn.js";

const { compute, encodeInteger: n } = UFN;
const box = i => "□⌊" + n(i) + "⌋";
const [source, entry, right, counter] = [1, 2, 3, 4].map(box);
const values = expression => compute(expression).value;
const fold = (expression, kind = "[") => kind + entry + " " + right + " : " + expression + " : " + entry + (kind === "[" ? "]" : "}");
const identities = `≔(⟦${source}⟧ : (${entry} ${right} : ${source} : ${entry}))`;

test("parentheses retain entries, empty places, and nested sequences without joining", () => {
  const result = compute("(○ ○ ◠ (◡ ⟨◠⟩) ())");
  assert.equal(result.kind, "sequence");
  assert.equal(result.canonical, null);
  assert.equal(result.established, true);
  assert.equal(result.items.length, 5);
  assert.equal(result.items[3].kind, "sequence");
  assert.equal(result.items[4].items.length, 0);
  assert.equal(result.ufn, "(○ ○ ◠ (◡ ⟨◠⟩) ())");
  assert.deepEqual(result.value, [[0, 0, 0, 0], [0, 0, 0, 0], [1, 0, 0, 0], [[-1, 0, 0, 0], [2, 0, 0, 0]], []]);
  assert.equal(UFN.formatValue(result.value), "(0, 0, 1, (-1, 2), ())");
  assert.equal(compute("(◠)").items.length, 1);
});

test("finite count ranges retain each result and preserve counter scope", () => {
  const result = compute("(□ : ○ … ⟨◠○⟩ : {□ □})");
  assert.equal(result.ufn, "(○ ◠ ⟨⟨◠⟩⟩ ⟨⟨◠⟩○⟩)");
  assert.deepEqual(result.items.map(item => item.canonical), [0, 1, 4, 9].map(n));
  assert.equal(result.iterations, 4);
  assert.equal(compute("(□ : ◠ … ○ : {|○})").ufn, "()");
  const nested = compute(`(□ : ◠ … ⟨◠⟩ : (${entry} : ◠ … □ : {□ ${entry}}))`);
  assert.deepEqual(nested.value, [[[1, 0, 0, 0]], [[2, 0, 0, 0], [4, 0, 0, 0]]]);
  assert.equal(compute("(□ : ◠ … ⟨◠⟩ : (□ : □ … □ : □))").ufn, "((◠) (⟨◠⟩))");
});

test("sequence ranges map, join, or multiply the same entries in written order", () => {
  assert.equal(compute(`(${entry} ${right} : (◠ ○ ◠ ◠) : ${right})`).ufn, "(⟨◠○⟩ ⟨◠⟩ ◠ ○)");
  assert.equal(compute(fold("(□ : ◠ … ⟨◠○⟩ : □)")).canonical, n(6));
  assert.equal(compute(fold("(□ : ◠ … ⟨⟨◠⟩⟩ : □)", "{")).canonical, n(24));
  assert.equal(compute(fold("(◠@◠ ◠@⟨◠⟩)", "{")).canonical, "◠@⟨◠○⟩");
  assert.equal(compute(fold("(◠@⟨◠⟩ ◠@◠)", "{")).canonical, "◡@⟨◠○⟩");
  assert.equal(compute(fold("()")).canonical, "○");
  assert.equal(compute(fold("()", "{")).canonical, "◠");
  assert.equal(compute(`(${entry} ${right} : () : {|○})`).ufn, "()");
});

test("definitions produce sequences and accept either written entries or one sequence expression", () => {
  const definition = "≔(◇ : (□ : ◠ … ⟨◠○⟩ : □))";
  assert.equal(compute(definition + "◇").ufn, "(◠ ⟨◠⟩ ⟨◠○⟩)");
  assert.equal(compute(definition + fold("◇")).canonical, n(6));
  for (const expression of ["◠ ○ ◠", "(◠ ○ ◠)"])
    assert.equal(compute(identities + `⟦${expression}⟧`).ufn, "(◠ ○ ◠)");
  assert.equal(compute(identities + "⟦(□ : ◠ … ⟨◠○⟩ : □)⟧").ufn, "(◠ ⟨◠⟩ ⟨◠○⟩)");
  assert.equal(compute(identities + "⟦((◠ ○))⟧").ufn, "((◠ ○))");
  assert.equal(compute(identities + "⟦◠ (○ ◠)⟧").ufn, "(◠ (○ ◠))");
  assert.equal(compute(identities + "⟦⟧").ufn, "()");
  assert.equal(compute(identities + `(${entry} : ◠ … ⟨◠⟩ : ⟦${entry}⟧)`).ufn, "((◠) (⟨◠⟩))");
  assert.equal(compute(identities + `≔(◇ : ⟦(◠ ○)⟧) ◇`).ufn, "(◠ ○)");
});

test("nested sequences are consumed explicitly and source entries are read once", () => {
  const inner = `[${source} ${counter} : ${entry} : ${source}]`;
  const expression = `(${entry} ${right} : ((◠ ⟨◠⟩) (⟨◠○⟩)) : ${inner})`;
  assert.equal(compute(expression).ufn, "(⟨◠○⟩ ⟨◠○⟩)");
  assert.throws(() => compute(fold("((◠ ⟨◠⟩))")), /sequence is not a number/);
  assert.equal(compute(`(${entry} ${right} : ([□ : ◠ … ⟨◠○⟩ : □]) : {${entry} ${entry}})`).iterations, 4);
  assert.throws(() => compute(`(${entry} ${right} : ({|○}) : ◠)`), /Division by zero/);
});

test("sequences fail clearly in numerical positions, including limit proofs and derivative inputs", () => {
  for (const expression of ["[()]", "{()}", "⟨()⟩", "⟨◠⟩⌊()⌋", "◠@()", "()@◠", "*()", "index(())",
    "()⌈◠⌉", "⟨◠⟩⌈()⌉", "⟨◠⟩⌈|()⌉", "(□ : () … ◠ : □)",
    "[□ : ○ … : ()]⌊○⌋", "{□ : ○ … : ()}⌊○⌋", "[□ : ○ … : (□)]⌊○⌋"])
    assert.throws(() => compute(expression), /sequence is not a number/, expression);
  assert.throws(() => UFN.measure("()"), /sequence is not a number/);
  assert.throws(() => UFN.differentiate("(□)", { at: "◠" }), /sequence is not a number/);
  assert.throws(() => UFN.differentiate("□", { at: "()" }), /sequence is not a number/);
  assert.throws(() => compute(`(${entry} ${right} : ◠ : ${entry})`), /sequence source/);
  assert.throws(() => compute("(□ □ : () : ◠)"), /distinct names/);
  for (const expression of ["(□ : ○ … : □)", "(◠|◠)"])
    assert.throws(() => compute(expression), UFN.UFNError);
});

test("retained recipes keep per-visit values and can be copied without their definitions", () => {
  const definition = `≔(◇ : (${entry} : ○ … ⟨◠⟩ : {${entry} ┌┘}))`;
  const result = compute(definition + "◇");
  assert.equal(result.established, false);
  assert.equal(result.items.length, 3);
  assert.equal(result.items[1].canonical, null);
  assert.deepEqual(result.value, [0, Math.E, 2 * Math.E].map(value => [value, 0, 0, 0]));
  assert.deepEqual(values(result.ufn), result.value);
  assert.equal(result.canonical, null);
  assert.equal(result.items[1].canonical, null, "projection cannot write back into exact entries");
  assert.equal(compute("(◠ ┌┘ ⟨◠⟩)").items[2].canonical, n(2));
  const symbolic = compute("(□ : ○ … ┌┘ : □)");
  assert.equal(symbolic.kind, "sequence");
  assert.equal(symbolic.items, null);
  assert.ok(symbolic.ufn);
});

test("retained limits preserve complete semantics and finite previews remain labelled", () => {
  const known = compute("([□ : ○ … : ⟨◡⟩⌈□⌉]⌊○⌋)");
  assert.equal(known.ufn, "(⟨◠⟩)");
  assert.equal(known.partial, false);
  const recipe = UFN.constants.e.source;
  const unknown = compute(`≔(◇ : (${recipe})) ◇`);
  assert.equal(unknown.partial, false);
  assert.match(unknown.ufn, /⌊○⌋/);
  assert.throws(() => unknown.value, /complete limit/);
  assert.equal(compute(unknown.ufn).partial, false);
  const preview = compute("([┌┘ [□ : ○ … : ◠]])", 2);
  assert.equal(preview.partial, true);
  assert.deepEqual(preview.value, [[Math.E + 2, 0, 0, 0]]);
  assert.equal(compute("([□ : ◠ … : ◠])", 3).ufn, "(⟨◠○⟩)");
});

test("the complete Fourier transform is a definition returning all coefficients", () => {
  const length = `≔(◇⟪${source}⟫ : [${entry} ${right} : ${source} : ◠])`;
  const size = `◇⟪${source}⟫`, left = `[${size} | ◠ ${right}]`;
  const transform = `≔(⟦${source}⟧ : (${counter} : ◠ … ${size} : `
    + `[${entry} ${right} : ${source} : {${entry} ┌┘⌈[|{⟳ [${counter}|◠] ${left} | ${size}}]@◠⌉}]))`;
  for (const [samples, expected] of [
    ["○ ◠ ○ ○", [[1, 0, 0, 0], [0, -1, 0, 0], [-1, 0, 0, 0], [0, 1, 0, 0]]],
    ["(□ : ◠ … ⟨⟨◠⟩⟩ : □)", [[10, 0, 0, 0], [-2, 2, 0, 0], [-2, 0, 0, 0], [-2, -2, 0, 0]]],
    ["○ ◠@⟨◠⟩ ○ ○", [[0, 0, 1, 0], [0, 0, 0, 1], [0, 0, -1, 0], [0, 0, 0, -1]]],
    ["", []],
  ]) {
    const result = compute(length + transform + "⟦" + samples + "⟧");
    assert.equal(result.kind, "sequence");
    assert.equal(result.items.length, expected.length);
    assert.equal(result.established, true);
    assert.equal(result.partial, false);
    result.value.forEach((vector, i) => vector.forEach((value, j) => assert.ok(Math.abs(value - expected[i][j]) < 1e-10)));
    assert.deepEqual(values(result.ufn), result.value, "copied output binds every coefficient independently");
  }
});

test("sequence formatting and finite folds compose with the existing exact tools", () => {
  for (const expression of ["(□ : ○ … ⟨◠○⟩ : {□ □})", `(${entry} ${right} : (◠ ○ ⟨◠⟩) : {${entry} ${right}})`]) {
    const formatted = UFN.formatSource(expression, 32);
    assert.deepEqual(values(formatted), values(expression));
    assert.deepEqual(values(compute(expression).ufn), values(expression));
  }
  assert.equal(UFN.differentiate(fold("(□ □)"), { at: n(3) }).canonical, n(2));
  assert.equal(UFN.differentiate(fold("(□ □)", "{"), { at: n(3) }).canonical, n(6));
  const old = Math.pow;
  Math.pow = () => { throw new Error("Unexpected decimal arithmetic"); };
  try { assert.equal(compute("(□ : ◠ … ⟨◠○⟩ : ⟨◠⟩⌈□⌉)").ufn, "(⟨◠⟩ ⟨⟨◠⟩⟩ ⟨⟨◠○⟩⟩)"); }
  finally { Math.pow = old; }
});

test("retained output obeys visit and display bounds", () => {
  assert.throws(() => compute(`(□ : ○ … ${n(1000)} : (${entry} : ○ … ${n(1000)} : ◠))`), /Too many/);
  const distant = "⟨◠⟩⌊" + n(2000) + "⌋";
  const large = compute("(□ : ◠ … ⟨⟨◠○⟩⟩ : " + distant + ")");
  assert.equal(large.items.length, 8);
  assert.equal(large.ufn, null, "large output keeps its source rather than returning truncated notation");
  assert.ok(large.source);
});

test("differentiation tracks changing inputs through nested sequence entries", () => {
  const innerEntry = box(5), innerPlace = box(6);
  const body = `[${innerEntry} ${innerPlace} : ${entry} : ${innerEntry}]`;
  const recipe = input => `[${entry} ${right} : ((${input})) : [${counter} : ○ … : {${body} ⟨◡⟩⌈${counter}⌉}]]`;
  assert.equal(UFN.differentiate(recipe("⟨◠⟩")).canonical, "○");
  const changing = UFN.differentiate(recipe("□"), { at: n(2) });
  assert.equal(changing.established, false);
  assert.match(changing.reason, /interchanging its limit and derivative/);
});
