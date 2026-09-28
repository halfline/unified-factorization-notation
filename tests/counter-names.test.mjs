import assert from "node:assert/strict";
import test from "node:test";
import UFN from "../src/ufn.js";
import factorial from "../src/factorial.js";

const {compute, encodeInteger: n} = UFN;

test("counter names are user-selected words or symbols, independent of their values", () => {
  for (const name of ["□", "•", "✦", "n", "step", "步", "α", "🌱", "left_hand"]) {
    const source = `[${name} : ◠ … ⟨◠⟩ : ${name}]`;
    assert.equal(compute(source).canonical, n(3), name);
    assert.equal(new UFN.Parser(source).parse().counter.name, name);
    assert.equal(UFN.formatSource(source), source);
    assert.equal(UFN.differentiate(`{${name} ${name}}`, {counter:name,at:n(3)}).canonical,n(6));
  }
  assert.equal(compute("[□ : ◠ … ⟨◠⟩ : [• : ◠ … ⟨◠⟩ : {□ •}]]").canonical,n(9));
  assert.throws(()=>compute("[step : ◠ … ⟨◠⟩ : step⌊◠⌋]"),/Unbound counter/);
  assert.throws(()=>compute("[step : ◠ … ◠ : Step]"),/Unbound counter/);
});

test("counter tags are literal balanced writing and are never numerically evaluated", () => {
  for (const tag of ["leaf", "◡", "○", "[◠ ◠]", "{|○}", "()", "□⌊twig⌋"]) {
    const name = `□⌊${tag}⌋`;
    assert.equal(compute(`[${name} : ◠ … ⟨◠⟩ : ${name}]`).canonical,n(3),tag);
  }
  assert.equal(compute("[□⌊leaf⌋ : ◠ … ⟨◠⟩ : [□⌊twig⌋ : ◠ … □⌊leaf⌋ : ◠]]").canonical,n(3));
  assert.throws(()=>compute("[□⌊[◠ ◠]⌋ : ◠ … ◠ : □⌊⟨◠⟩⌋]"),/Unbound counter/);
  for (const source of ["□⌊⌋", "□⌊[leaf⌋", "□⌊leaf", "□⌊".repeat(70)+"x"+"⌋".repeat(70)])
    assert.throws(()=>compute(source), UFN.UFNError, source);
});

test("custom names preserve scope through count ranges, sequence lookup, and exact limits", () => {
  assert.equal(compute("[step : ◠ … ⟨◠○⟩ : [step : ◠ … step : ◠]]").canonical,n(6));
  assert.equal(compute("(row⌊leaf⌋ place : ((◠ ◡) (○ ⟨◠⟩)) : row⌊leaf⌋⌊○⌋)").ufn,"(◡ ⟨◠⟩)");
  assert.equal(compute("[step : ○ … : ⟨◡⟩⌈step⌉]⌊○⌋").canonical,n(2));
  assert.equal(compute("[🌱 : ○ … : ⟨◠⟩⌈🌱⌉]⌊◠⌋").canonical,"◡");
  assert.equal(compute("[entry entry⌊◠⌋ : (◠) : [entry entry⌊◠⌋]]").canonical,"◠");
});

test("custom names in declaration patterns are hygienic arguments, including sequence sources", () => {
  const source = "≔(◇⟪input⟫ : [step : ◠ … ⟨◠⟩ : {input step}]) [step : ◠ … ⟨◠⟩ : ◇⟪step⟫]";
  assert.equal(compute(source).canonical,n(9));
  assert.equal(compute(UFN.expand(source).expanded).canonical,n(9));
  const select = "≔(◇⟪samples⌊leaf⌋ : place⟫ : samples⌊leaf⌋⌊place⌋) ◇⟪◠ ◡ : ○⟫";
  assert.equal(compute(select).canonical,"◡");
  assert.equal(compute(UFN.expand(select).expanded).canonical,"◡");
  assert.throws(()=>compute("≔(◇ : ◠) [◇ : ◠ … ⟨◠⟩ : ◇]"),UFN.UFNError,
    "a declared form's leading symbol stays reserved within that document");
});

test("retained recipes and input helpers recognize arbitrary names", () => {
  const answer=compute("(leaf : ◠ … ⟨◠⟩ : {leaf ┌┘})");
  assert.deepEqual(compute(answer.ufn).value,answer.value);
  assert.equal(factorial.describe("[leaf : ◠ … ⟨◠⟩ : leaf]", 2).wholeResult.canonical,n(6));
});

test("bare and tagged names have separate bindings, including the zero tag", () => {
  assert.equal(compute("[□ : ◠ … ◠ : [□⌊○⌋ : ⟨◠⟩ … ⟨◠⟩ : [□⌊◠⌋ : ⟨◠○⟩ … ⟨◠○⟩ : [□ □⌊○⌋ □⌊◠⌋]]]]").canonical,n(6));
});
