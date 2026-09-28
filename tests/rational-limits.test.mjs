import assert from "node:assert/strict";
import test from "node:test";
import UFN from "../src/ufn.js";
import subdivision from "../src/subdivision.js";
import factorial from "../src/factorial.js";

const { compute, preview, encodeInteger: spell } = UFN;
const attachCorrection = source => source.slice(0, -1) + "⌊○⌋]";

test("rational telescoping sums reduce from algebra, including unfactored differences", () => {
  for (const [source, expected] of [
    ["[□ : ◠ … : {|□ [□ ◠]}]⌊○⌋", "◠"],
    ["[□ : ⟨◠⟩ … : [{|[□ | ◠]} | {|□}]]⌊○⌋", "◠"],
    ["[□ : ⟨◠○⟩ … : {|□ [□ ◠]}]⌊○⌋", "⟨◡○⟩"],
    ["[□ : ◠ … : {⟨◠○⟩ | □ [□ ◠]}]⌊○⌋", "⟨◠○⟩"],
    ["[□ : ◠ … : [{|□ □} | {|[□ ◠] [□ ◠]}]]⌊○⌋", "◠"],
    ["[□ : ◠ … : {[◠@◠ ◠@⟨◠⟩] | □ [□ ◠]}]⌊○⌋", "[◠@◠ ◠@⟨◠⟩]"],
    ["[□ : ⟨◠⟩ … : [{[◡ {◡ □} {□ □}] | □ [□ ◠]} | {[◡ {◡ [□ | ◠]} {[□ | ◠] [□ | ◠]}] | [□ | ◠] □}]]⌊○⌋", "⟨◠◡⟩"],
  ]) {
    const result = compute(source, 1);
    assert.equal(result.canonical, compute(expected).canonical, source);
    assert.equal(result.partial, false);
    assert.ok(result.limitProofs.some(proof => proof.rule === "rational telescoping sum"));
    assert.equal(preview(source, 3).partial, true);
  }
});

test("limit requests keep the ordinary measurement without replacing unknown values by previews", () => {
  const source = "[□ : ◠ … : {|□ [□ ◠]}]";
  assert.equal(compute(source, 3).partial, true);
  const exact = UFN.limit(source);
  assert.equal(exact.canonical, "◠");
  assert.equal(exact.limitRequested, true);
  assert.equal(exact.partial, false);
  assert.equal(UFN.limit(subdivision.corrections({ recipe: "square" })).canonical, "⟨◡○⟩");
  assert.equal(UFN.limit("[□ : ○ … : ⟨◠⟩⌈□⌉]⌊◠⌋").canonical, "◡");
  const unknown = UFN.limit("[□ : ◠ … : {|□ □}]");
  assert.equal(unknown.canonical, null);
  assert.equal(unknown.partial, false);
  assert.throws(() => unknown.value, /no ordinary decimal projection/);
});

test("telescoping sums can cancel across several visits, including an expanded fraction", () => {
  for (const gap of [2, 3, 5]) {
    const k = spell(gap);
    const expected = compute(`{[□ : ◠ … ${k} : {|□}] | ${k}}`).canonical;
    assert.equal(UFN.limit(`[□ : ◠ … : {|□ [□ ${k}]}]`).canonical, expected);
    const difference = `[□ : ◠ … : [{|□} | {|[□ ${k}]}]]`;
    assert.equal(UFN.limit(difference).canonical, compute(`[□ : ◠ … ${k} : {|□}]`).canonical);
  }
  assert.equal(UFN.limit("[□ : ⟨◠○⟩ … : {|□ [□ ⟨◠⟩]}]").canonical,
    compute("{[{|⟨◠○⟩} {|⟨⟨◠⟩⟩}] | ⟨◠⟩}").canonical);
});

test("cancelling rational products retain zero limits and detect unbounded growth", () => {
  for (const [source, expected] of [
    ["{□ : ◠ … : {□ | [□ ◠]}}⌊○⌋", "○"],
    ["{□ : ⟨◠⟩ … : {[{□ □} | ◠] | □ □}}⌊○⌋", "⟨◡⟩"],
    ["{□ : ⟨◠○⟩ … : {[{□ □} | ◠] | □ □}}⌊○⌋", "{⟨◠⟩ | ⟨◠○⟩}"],
    ["{□ : ◠ … : {[□ | ◠] | □}}⌊○⌋", "○"],
  ]) {
    const result = compute(source);
    assert.equal(result.canonical, compute(expected).canonical);
    assert.equal(result.partial, false);
    assert.ok(result.limitProofs.some(proof => proof.rule === "rational telescoping product"));
  }
  assert.throws(() => compute("{□ : ◠ … : {[□ ◠] | □}}⌊○⌋"), /no finite limit/);
  assert.throws(() => compute("[□ : ◠ … : □]⌊○⌋"), /no finite limit/);
});

test("integral correction limits follow from their finite polynomial sums in every directed order", () => {
  for (const recipe of ["constant", "position", "square"]) {
    for (const sample of ["start", "middle", "end"]) {
      for (const order of ["before", "after"]) {
        const options = { recipe, sample, order, direction: "◠", path: "⟨◠⟩" };
        const result = compute(attachCorrection(subdivision.corrections(options)));
        assert.equal(result.canonical, subdivision.describe(4, options).destination);
        assert.equal(result.partial, false);
      }
    }
  }
});

test("small whole factorials reduce from their general product-limit construction", () => {
  for (let n = 0; n <= 5; n++) {
    const definition = attachCorrection(factorial.definition(spell(n)));
    assert.equal(compute(definition).canonical, factorial.describe(spell(n), 4).wholeResult.canonical);
    assert.equal(compute(definition).partial, false);
  }
});

test("rational limit proofs preserve divisor domains, input measurement, and inner counter scope", () => {
  // These denominators have a future zero. Cancelling them must not erase it.
  for (const bad of [
    "[□ : ◠ … : {{[□ | ⟨◠○⟩] | [□ | ⟨◠○⟩]} | □ [□ ◠]}]⌊○⌋",
    "[□ : ◠ … : {[□ | ⟨◠○⟩] | [□ | ⟨◠○⟩] □ [□ ◠]}]⌊○⌋",
  ]) {
    const result = compute(bad);
    assert.equal(result.canonical, null);
    assert.throws(() => result.value, /no ordinary decimal projection/);
    assert.throws(() => preview(bad, 3), /Division by zero/);
  }
  assert.equal(compute("[□ : ◠ … : {|□ [□ ◠]}]⌊◠⌋").canonical, null,
    "ordinary counting does not approach infinity in the factor distance");
  const local = "[□ : ◠ … ⟨◠⟩ : [□⌊⟨◠⟩⌋ : ◠ … : {□ | □⌊⟨◠⟩⌋ [□⌊⟨◠⟩⌋ ◠]}]⌊○⌋]";
  assert.equal(compute(local).canonical, spell(3));
  const tagged = "[□⌊◠⌋ : ◠ … : {|□⌊◠⌋ [□⌊◠⌋ ◠]}]⌊○⌋";
  assert.equal(compute(tagged).canonical, "◠");
  assert.equal(compute("[□ : ◠ … : {|□ □}]⌊○⌋").canonical, null);
});

test("exact limit proofs do not use decimal operations and previews still count finite visits", () => {
  const oldPow = Math.pow, oldLog = Math.log;
  Math.pow = Math.log = () => { throw new Error("Decimal projection requested"); };
  try {
    assert.equal(compute("[□ : ◠ … : {|□ [□ ◠]}]⌊○⌋").canonical, "◠");
    assert.equal(compute(attachCorrection(subdivision.corrections({ recipe: "square" }))).canonical, "⟨◡○⟩");
    const finite = preview("{□ : ⟨◠⟩ … : {[{□ □} | ◠] | □ □}}⌊○⌋", 4);
    assert.equal(finite.canonical, compute("{⟨◠○⟩ | ⟨◠○○⟩}").canonical);
    assert.equal(finite.partialKind, "product");
    assert.equal(finite.iterations, 4);
  } finally { Math.pow = oldPow; Math.log = oldLog; }
});
