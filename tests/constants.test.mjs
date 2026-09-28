import assert from "node:assert/strict";
import test from "node:test";
import UFN from "../src/ufn.js";
import tooltips from "../src/number-tooltips.js";

test("constant names denote complete values independently of finite preview terms", () => {
  for (const [name, value] of [["turn", 2 * Math.PI], ["e", Math.E]]) {
    const { symbol, source } = UFN.constants[name];
    for (const terms of [1, 3, 24, 100]) {
      const result = UFN.compute(symbol, terms);
      assert.equal(result.ufn, symbol);
      assert.equal(result.display, symbol);
      assert.equal(result.canonical, null);
      assert.equal(result.partial, false);
      assert.match(result.reason, /complete/);
      assert.deepEqual(result.value, [value, 0, 0, 0]);
      assert.equal(result.partial, false, "a decimal reading cannot turn the constant into a partial sum");
    }
    const partial = UFN.compute(source, 3);
    assert.equal(partial.partial, true);
    assert.ok(partial.value[0] < value);
    assert.equal(tooltips.constants[name].source, source);
    assert.ok(Object.isFrozen(UFN.constants[name]));
  }
});

test("turns compose with shares, directions, powers, and logarithms without decimal canonicalization", () => {
  for (const [source, expected] of [
    ["{⟳ | ⟨⟨◠⟩⟩}", [Math.PI / 2, 0, 0, 0]],
    ["⟳@◠", [0, 2 * Math.PI, 0, 0]],
    ["[|⟳]@⟨◠⟩", [0, 0, -2 * Math.PI, 0]],
    ["⟳⌈○⌉", [1, 0, 0, 0]],
    ["⟨⟳⟩", [2 ** (2 * Math.PI), 0, 0, 0]],
    ["⟳⌈|⟳⌉", [1, 0, 0, 0]],
    ["┌┘⌈|┌┘⌉", [1, 0, 0, 0]],
    ["[┌┘ | ◠]", [Math.E - 1, 0, 0, 0]],
  ]) {
    const result = UFN.compute(source);
    assert.equal(result.canonical, null, "a projected answer cannot become a factor spelling");
    assert.equal(result.ufn, source);
    assert.equal(result.partial, false);
    assert.deepEqual(result.value, expected);
    assert.equal(UFN.compute(UFN.formatSource(source)).ufn, source);
  }
});

test("a turn has no free counter and does not hide a finite range in its definition", () => {
  const result = UFN.compute("[□ : ○ … ⟨◠⟩ : ⟳]", 1);
  assert.equal(result.partial, false);
  assert.equal(result.value[0], 6 * Math.PI);
  assert.equal(result.iterations, 3);
  const unresolved = UFN.limit("[□ : ◠ … : {⟳ | {□ □}}]");
  assert.equal(unresolved.canonical, null);
  assert.throws(() => unresolved.value, /unresolved limit/);
});

test("turn tooltips preserve the symbol and distinguish complete values from prefixes", () => {
  const source = "{⟳ | ⟨⟨◠⟩⟩} ⟳@◠";
  const tokens = tooltips.tokens(source);
  assert.deepEqual(tokens.map(token => token.source), ["⟳", "⟨⟨◠⟩⟩", "⟳", "◠"]);
  for (const token of tokens) assert.equal(source.slice(token.start, token.end), token.source);
  assert.equal(tokens[0].constant, "turn");
  assert.match(tooltips.describe(tokens[0]).title, /⟳.*turn.*6\.28318530718/);
  assert.match(tooltips.describe(tokens[0]).note, /limit.*partial sum/);
});

test("the exponential constant is one name, never a pair of enclosing brackets", () => {
  for (const source of ["┌┘", "┌ ┘", "┌\n┘"]) {
    assert.equal(UFN.formatSource(source), "┌┘");
    assert.deepEqual(new UFN.Parser(source).parse(), { type: "constant", name: "e" });
    assert.deepEqual(UFN.compute(source).value, [Math.E, 0, 0, 0]);
    const [token] = tooltips.tokens(source);
    assert.equal(token.source, source);
    assert.equal(token.constant, "e");
    assert.equal(source.slice(token.start, token.end), source);
    assert.match(tooltips.describe(token).title, /┌┘.*2\.71828182846/);
  }
  for (const source of ["┌", "┘", "┌◠┘", "┌┘┌┘", "┌⟳┘"]) {
    assert.throws(() => UFN.compute(source), UFN.UFNError);
  }
  assert.deepEqual(tooltips.tokens("┌┘⌈⟳@◠⌉").filter(token => token.constant).map(token => token.constant), ["e", "turn"]);
});

test("the compact full-turn identity reduces all three turns while the original path grows", () => {
  for (const axis of ["◠", "⟨◠⟩", "⟨◠○⟩"]) {
    const result = UFN.compute("┌┘⌈⟳@" + axis + "⌉");
    assert.equal(result.canonical, "◠");
    assert.equal(result.partial, false, "named constants mean their complete values");
    result.value.forEach((component, i) => assert.ok(Math.abs(component - (i === 0 ? 1 : 0)) < 1e-12));
  }
  const growth = UFN.compute("┌┘⌈⟳@○⌉");
  assert.ok(growth.value[0] > 500);
  assert.deepEqual(growth.value.slice(1), [0, 0, 0]);
});
