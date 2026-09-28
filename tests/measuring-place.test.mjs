import assert from "node:assert/strict";
import test from "node:test";
import UFN from "../src/ufn.js";
import tooltips from "../src/number-tooltips.js";
import factorial from "../src/factorial.js";
import measuring from "../src/measuring-place.js";

const { compute, preview, measure, encodeInteger: spell, Parser } = UFN;
const twoSum = "[□ : ○ … : ⟨◠⟩⌈□⌉]⌊◠⌋";
const threeSum = "[□ : ○ … : ⟨◠○⟩⌈□⌉]⌊⟨◠⟩⌋";

test("measuring attachments parse only on complete endless ranges, before upper corners and @", () => {
  for (const source of [twoSum, threeSum, "{□ : ◠ ... : ⟨◠⟩}⌊*⟨◠⟩⌋"]) {
    const ast = new Parser(source).parse();
    assert.equal(ast.type, "range"); assert.ok(ast.measurement); assert.equal(ast.end, null);
  }
  for (const source of ["[◠ ◠]⌊◠⌋", "{◠}⌊◠⌋", "[□ : ○ … ◠ : □]⌊◠⌋", twoSum + "⌊◠⌋"]) {
    const ast = new Parser(source).parse();
    assert.equal(ast.type, "selection", "these corners now parse as an entry lookup");
    assert.throws(() => compute(source), /Entry lookup needs a sequence source/);
  }
  assert.equal(compute(twoSum + "@◠").canonical, "◡@◠");
  assert.equal(compute("[□ : ○ … : ⟨◡⟩⌈□⌉]⌊○⌋⌈⟨◠⟩⌉").canonical, spell(4));
  for (const place of ["◡", "⟨◡⟩", "◠@◠", spell(2001)]) {
    assert.throws(() => compute(`[□ : ○ … : ⟨◠⟩⌈□⌉]⌊${place}⌋`), /Measuring place/);
  }
});

test("rational geometric limits are proved from factor instructions without decimal arithmetic", () => {
  const oldPow = Math.pow, oldLog = Math.log;
  Math.pow = Math.log = () => { throw new Error("Decimal projection requested"); };
  try {
    for (const [source, expected] of [
      [twoSum, "◡"], [threeSum, "[|⟨◡⟩]"],
      ["[□ : ○ … : ⟨◠○○⟩⌈□⌉]⌊*⟨◠○○⟩⌋", "[|⟨[|⟨◠⟩]⟩]"],
      ["[□ : ○ … : ⟨□⟩]⌊◠⌋", "◡"],
      ["[□ : ○ … : ⟨□ □⟩]⌊◠⌋", "[|⟨◡○○⟩]"],
      ["[□ : ○ … : {◡ ⟨◠⟩⌈□⌉}]⌊◠⌋", "◠"],
      ["[□ : ○ … : ⟨◠⟩⌈[□ ◠]⌉]⌊◠⌋", "[|⟨◠⟩]"],
      ["[□ : ○ … : {⟨◠◠⟩ | ⟨◠○○⟩}⌈□⌉]⌊◠⌋", "[|⟨◠○○⟩]"],
      ["[□ : ○ … : ○]⌊◠⌋", "○"],
    ]) {
      for (const visits of [1, 8, 40]) {
        const result = compute(source, visits);
        assert.equal(result.canonical, compute(expected).canonical, source);
        assert.equal(result.partial, false);
        assert.equal(result.partialKind, null);
        assert.ok(result.limitProofs.some(p => p.rule === "geometric sum"));
      }
    }
    const offset = compute("[□ : ⟨◠⟩ … : ⟨◠○⟩⌈□⌉]⌊⟨◠⟩⌋");
    assert.equal(offset.canonical, compute("{◡ ⟨⟨◠⟩○⟩ | ⟨◠⟩}").canonical);
  } finally { Math.pow = oldPow; Math.log = oldLog; }
});

test("constant products permit zero limits and detect failure to converge in the selected distance", () => {
  for (const factor of ["⟨◠⟩", "[|⟨◠⟩]", "○"]) {
    const answer = compute(`{□ : ◠ … : ${factor}}⌊◠⌋`);
    assert.equal(answer.canonical, "○"); assert.equal(answer.partial, false);
  }
  assert.equal(compute("{□ : ◠ … : ◠}⌊◠⌋").canonical, "◠");
  assert.equal(compute("{□ : ◠ … : ⟨◡⟩}⌊○⌋").canonical, "○");
  for (const source of [twoSum.replace("⌊◠⌋", "⌊○⌋"), twoSum.replace("⌊◠⌋", "⌊⟨◠⟩⌋"),
    "{□ : ◠ … : ⟨◠⟩}⌊○⌋", "{□ : ◠ … : ⟨◡⟩}⌊◠⌋", "{□ : ◠ … : ◡}⌊◠⌋"]) {
    assert.throws(() => compute(source), /no limit/);
    assert.equal(preview(source, 4).partial, true);
  }
  assert.throws(() => compute("{□ : ◠ … : {○ | ○}}⌊◠⌋"), /Division by zero/);
});

test("partial results do not depend on the measuring place and do not become limits", () => {
  for (const visits of [1, 3, 8]) {
    const first = preview(twoSum, visits), ordinary = preview(twoSum.replace("⌊◠⌋", "⌊○⌋"), visits);
    assert.equal(first.canonical, spell(2 ** visits - 1));
    assert.equal(first.canonical, ordinary.canonical);
    assert.deepEqual(first.measurements, [1]);
    assert.equal(first.partialKind, "sum");
    assert.equal(first.limitProofs.length, 0);
    assert.equal(first.iterations, visits);
  }
  const legacy = compute("[□ : ○ … : ⟨◡⟩⌈□⌉]", 3);
  assert.equal(legacy.partial, true);
  assert.equal(compute("[□ : ○ … : ⟨◡⟩⌈□⌉]⌊○⌋").canonical, "⟨◠⟩");
  assert.throws(() => preview("[◠ ◠]"), /complete unbounded range/);
});

test("measuring gaps uses the chosen factor entry, including denominator instructions", () => {
  assert.equal(measure("○", "◠").canonical, "○");
  assert.equal(measure("[|⟨⟨◠○⟩⟩]", "◠").canonical, compute("{|⟨⟨◠○⟩⟩}").canonical);
  assert.equal(measure("⟨◡⟩", "◠").canonical, "⟨◠⟩");
  assert.equal(measure("[⟨⟨◠⟩○⟩ | ◠]", "◠").value[0], 1 / 8); // gap 9 − 1
  for (const source of [twoSum, threeSum]) {
    const place = source === twoSum ? "◠" : "⟨◠⟩", prime = source === twoSum ? 2 : 3;
    for (const n of [1, 4, 8]) {
      const gap = `[${preview(source, n).canonical} | ${compute(source).canonical}]`;
      assert.ok(Math.abs(measure(gap, place).value[0] - prime ** -n) < 1e-14);
      assert.ok(measure(gap, "○").value[0] > 0);
    }
  }
  assert.throws(() => measure("⟨⟨◡⟩⟩", "◠"), /rational/);
  assert.throws(() => measure("◠@◠", "◠"), /original path/);
});

test("selectors use outer scope once and nested measurements are local", () => {
  const outer = "[□ : ◠ … ⟨◠⟩ : [□⌊⟨◠⟩⌋ : ○ … : ⟨◠⟩⌊□⌋⌈□⌊⟨◠⟩⌋⌉]⌊□⌋]";
  assert.equal(compute(outer).canonical, compute("[|⟨◠◡⟩]").canonical);
  assert.deepEqual(compute(outer).measurements, [1, 2]);
  assert.throws(() => compute("[□ : ○ … : ⟨◠⟩⌈□⌉]⌊□⌋"), /Unbound counter/);
  const shadow = "[□ : ◠ … ◠ : [□ : ○ … : ⟨◠⟩⌈□⌉]⌊□⌋]";
  assert.equal(compute(shadow).canonical, "◡");
  const ordinaryInner = "[□ : ○ … : {[□⌊⟨◠⟩⌋ : ○ … : ⟨◠⟩⌈□⌊⟨◠⟩⌋⌉] ⟨◠⟩⌈□⌉}]⌊◠⌋";
  assert.throws(() => compute(ordinaryInner), /no limit/);
  const convergentInner = ordinaryInner.replace("⟨◠⟩⌈□⌊⟨◠⟩⌋⌉", "⟨◡⟩⌈□⌊⟨◠⟩⌋⌉");
  assert.equal(compute(convergentInner).canonical, "[|⟨◠⟩]");
  assert.equal(preview(convergentInner, 3).value[0], 14); // inner limit is 2, not an inner prefix
  assert.throws(() => factorial.definition("[□ : ○ … : ⟨◠⟩⌈□⌉]⌊□⌋"), /Unbound counter/);
  const directed = compute("[□ : ○ … : ⟨◡⟩⌈□⌉]⌊○⌋⌈◠@◠⌉").value;
  assert.ok(Math.abs(directed[0] - Math.cos(Math.log(2))) < 1e-12);
  assert.ok(Math.abs(directed[1] - Math.sin(Math.log(2))) < 1e-12);
});

test("unknown limits retain their domains and cannot leak through a decimal fallback", () => {
  const unknown = "{□ : ◠ … : [◠ ⟨◠⟩⌈□⌉]}⌊◠⌋";
  for (const source of [unknown, `[${unknown} ◠]`, `{${unknown} ${unknown.replace("⌊◠⌋", "⌊⟨◠⟩⌋")}}`]) {
    const result = compute(source);
    assert.equal(result.canonical, null); assert.equal(result.ufn, source);
    assert.throws(() => result.value, /no ordinary decimal projection/);
  }
  assert.equal(preview(unknown, 4).value[0], 2295);
  assert.throws(() => compute("[□ : ○ … : ⟨⟨◡⟩⟩]⌊◠⌋"), /rational/);
  assert.throws(() => preview("[□ : ◠ … : □⌈⟨◡⟩⌉]⌊◠⌋", 2), /rational/);
  assert.throws(() => compute("[□ : ○ … : ◠@◠]⌊○⌋"), /no (finite )?limit/);
  assert.throws(() => compute("[□ : [□ : ○ … : ⟨◠⟩⌈□⌉] … : ⟨◠⟩⌈□⌉]⌊◠⌋"), /no limit/);
  const measuredE = tooltips.constants.e.source + "⌊◠⌋";
  assert.ok(tooltips.tokens(measuredE).every(token => token.constant !== "e"));
});

test("the measuring lesson changes distances while retaining every rational partial result", () => {
  for (const base of [1, 2, 3]) for (const kind of ["sum", "product"]) {
    const selected = measuring.describe(base, base, kind, 6), ordinary = measuring.describe(base, 0, kind, 6);
    assert.ok(selected.limit?.canonical);
    assert.equal(ordinary.limit, null);
    assert.match(ordinary.reason, /no limit/);
    assert.deepEqual(selected.rows.map(row => row.partial.canonical), ordinary.rows.map(row => row.partial.canonical));
    assert.ok(selected.rows.at(-1).selected.value[0] < selected.rows[0].selected.value[0]);
    assert.ok(selected.rows.at(-1).ordinary.value[0] > selected.rows[0].ordinary.value[0]);
  }
  assert.throws(() => measuring.describe(1, 1, "sum", 7), RangeError);
});
