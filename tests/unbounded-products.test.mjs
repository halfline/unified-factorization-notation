import assert from "node:assert/strict";
import test from "node:test";
import UFN from "../src/ufn.js";
import grid from "../src/factor-grid.js";

const { compute, encodeInteger: spell } = UFN;
const euler = "{□ : ◠ … : {|[◠ | ⟨[|⟨◠⟩]⟩⌊□⌋]}}";
const zeta = "[□ : ◠ … : {|□⌈⟨◠⟩⌉}]";

test("unbounded products evaluate exactly the selected ordered finite prefix", () => {
  const oldPow = Math.pow, oldLog = Math.log;
  Math.pow = Math.log = () => { throw new Error("Decimal projection requested"); };
  try {
    for (const start of [0, 1, 3]) for (const count of [1, 3, 8]) {
      const result = compute(`{□ : ${spell(start)} … : [□ ◠]}`, count);
      const bounded = compute(`{□ : ${spell(start)} … ${spell(start + count - 1)} : [□ ◠]}`);
      assert.ok(result.canonical);
      assert.equal(result.canonical, bounded.canonical);
      assert.equal(result.partialKind, "product");
      assert.equal(result.partial, true);
      assert.equal(result.iterations, count);
      assert.equal(bounded.partialKind, null);
    }
    const telescoping = "{□ : ◠ … : {[□ ◠] [□ ◠] | □ [□ ⟨◠⟩]}}";
    for (const count of [1, 3, 24, 100]) {
      assert.equal(compute(telescoping, count).canonical, compute(`{${spell(2 * (count + 1))} | ${spell(count + 2)}}`).canonical);
    }
  } finally { Math.pow = oldPow; Math.log = oldLog; }
});

test("directed partial products preserve order and expose unsupported powers as recipes", () => {
  assert.equal(compute("{□ : ◠ … : ◠@□}", 2).canonical, "◠@⟨◠○⟩");
  assert.equal(compute("{□ : ◠ … : ◠@□}", 3).canonical, "◡");
  assert.equal(compute("{□ : ◠ … : ◠@[⟨⟨◠⟩⟩ | □]}", 3).canonical, "◠");
  const directed = compute("{□ : ◠ … : ⟨◠⟩⌈◠@◠⌉}", 4);
  assert.equal(directed.canonical, null);
  assert.equal(directed.partialKind, "product");
  const value = directed.value;
  assert.ok(Math.abs(value[0] - Math.cos(4 * Math.log(2))) < 1e-12);
  assert.ok(Math.abs(value[1] - Math.sin(4 * Math.log(2))) < 1e-12);
  assert.equal(directed.partialKind, "product");
  assert.equal(directed.iterations, 4);
});

test("partial products remain partial when stationary, vanishing, oscillating, or growing", () => {
  for (const body of ["◠", "○", "◡", "⟨◡⟩", "⟨◠⟩"]) {
    const answer = compute(`{□ : ◠ … : ${body}}`, 8);
    assert.equal(answer.partial, true);
    assert.equal(answer.partialKind, "product");
    assert.ok(answer.canonical);
  }
  assert.throws(() => compute("{□ : ○ … : {○ | [□ | ◠]}}", 2), /Division by zero/);
  const skipped = compute("[□ : ◠ … ○ : {□ : ◠ … : {|○}}]");
  assert.equal(skipped.canonical, "○");
  assert.equal(skipped.partial, false);
  assert.equal(skipped.partialKind, null);
});

test("nested ranges preserve scopes, classify mixed previews, and respect visit limits", () => {
  const mixed = compute("{□ : ◠ … : [□⌊⟨◠⟩⌋ : ◠ … : ◠]}", 3);
  assert.equal(mixed.canonical, spell(27));
  assert.equal(mixed.partialKind, "mixed");
  assert.equal(mixed.iterations, 12);
  const shadowed = compute("[□ : ◠ … ⟨◠⟩ : {□ : □ … : □}]", 3);
  assert.equal(shadowed.canonical, spell(30));
  assert.equal(shadowed.partialKind, "product");
  assert.throws(() => compute("{□ : ◠ … : □⌊⟨◠⟩⌋}"), /Unbound counter/);
  const prefix = "{□ : ◠ … : ◠}";
  assert.equal(compute(prefix, 501).iterations, 500);
  assert.equal(compute(prefix, 2.9).iterations, 2);
  assert.equal(compute(prefix, 0.5).iterations, 1);
  assert.throws(() => compute(`{□ : ◠ … ${spell(200)} : {□⌊⟨◠⟩⌋ : ◠ … : ◠}}`, 200), /Too many generated terms/);
});

test("finite grids give unique whole counts and finite Euler expansions match cell contributions", () => {
  for (const count of [1, 2, 3]) for (const maximum of [0, 1, 2, 3]) {
    const rows = grid.choices(count, maximum);
    assert.equal(rows.length, (maximum + 1) ** count);
    assert.equal(new Set(rows.map(row => row.decimal)).size, rows.length);
    for (const row of rows) {
      const expected = row.exponents.reduce((n, exponent, position) => n * [2, 3, 5][position] ** exponent, 1);
      assert.equal(row.decimal, expected);
      assert.equal(row.canonical, spell(expected));
    }
  }
  for (const [count, maximum] of [[2, 2], [3, 1]]) {
    const rows = grid.choices(count, maximum);
    const joined = compute("[" + rows.map(row => `{|${row.source}⌈⟨◠⟩⌉}`).join(" ") + "]");
    const factored = compute(`{□ : ◠ … ${spell(count)} : [□⌊⟨◠⟩⌋ : ○ … ${spell(maximum)} : ⟨[|{⟨◠⟩ □⌊⟨◠⟩⌋}]⟩⌊□⌋]}`);
    assert.ok(joined.canonical);
    assert.equal(joined.canonical, factored.canonical);
    assert.equal(joined.partial || factored.partial, false);
  }
  assert.throws(() => grid.choices(4, 2), RangeError);
  assert.throws(() => grid.choices(2, -1), RangeError);
});

test("Euler and zeta previews differ but move toward their shared two-step limit", () => {
  assert.equal(compute(euler, 3).canonical, compute("{⟨⟨◠⟩○○⟩ | ⟨⟨⟨◠⟩⟩⟩}").canonical);
  assert.notEqual(compute(euler, 3).canonical, compute(zeta, 3).canonical);
  const limit = (2 * Math.PI) ** 2 / 24;
  for (const source of [euler, zeta]) {
    const small = compute(source, 3), larger = compute(source, 64);
    assert.ok(small.value[0] < larger.value[0] && larger.value[0] < limit);
    assert.ok(limit - larger.value[0] < 0.016);
    assert.equal(small.partial && larger.partial, true);
  }
  // A fixed directed exponent keeps the factors in one plane. Moving its
  // orthogonal coefficient from the first axis to the second rotates the result.
  const recipe = label => `{□ : ◠ … : {|[◠ | ⟨◠⟩⌊□⌋⌈[|[⟨◠⟩@○ ◠@${label}]]⌉]}}`;
  const first = compute(recipe("◠"), 16), second = compute(recipe("⟨◠⟩"), 16);
  assert.equal(first.partialKind, "product");
  assert.equal(first.canonical, null);
  assert.ok(Math.abs(first.value[0] - second.value[0]) < 1e-12);
  assert.ok(Math.abs(first.value[1] - second.value[2]) < 1e-12);
  assert.equal(first.value[2], 0);
  assert.equal(second.value[1], 0);
});
