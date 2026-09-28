import assert from "node:assert/strict";
import test from "node:test";
import UFN from "../src/ufn.js";
import library from "../src/library.js";
import transformations from "../src/transformations.js";
const declared = form => library.declarations(["matrix-compose"]) + "\n" + form;
const compute = form => UFN.compute(declared(form));

test("named transformations accept new inputs and preserve captured counter scope", () => {
  const name = "□⌊◠⌋";
  const declaration = `≔(⇄⟪${name}⟫ : ▦⟪((○ ◠) (◠ ○)) : ${name}⟫)`;
  const source = declared(declaration + ` (${name} : ◠ … ⟨◠⟩ : ⇄⟪(${name} ◡)⟫)`);
  assert.equal(UFN.compute(source).ufn,"((◡ ◠) (◡ ⟨◠⟩))");
  assert.equal(UFN.compute(UFN.expand(source).expanded).ufn,"((◡ ◠) (◡ ⟨◠⟩))");
  assert.throws(()=>compute(declaration + "⇄⟪(◠)⟫"),UFN.UFNError);
});

test("composition returns a table matching successive applications for rectangular and directed inputs", () => {
  const cases = [
    ["((◠ ◠))", "((⟨◠⟩ ○ ◡) (○ ◠ ◠))", "(⟨◠⟩ ⟨◠○⟩ ⟨⟨◠⟩⟩)", "(⟨◠○○○⟩)"],
    ["((◠@⟨◠⟩))", "((◠@◠))", "(◠@◠)", "(◡@⟨◠⟩)"],
    ["((⟨◡⟩ ◠) (◠ ○))", "((◠ ○) (◡ ◠))", "(⟨⟨◡⟩⟩ ⟨◡○⟩)", null],
  ];
  for (const [later,earlier,input,expected] of cases) {
    const combined = `▧⟪${later} : ${earlier}⟫`;
    const table = compute(combined);
    assert.equal(table.established,true);
    const successive = compute(`▦⟪${later} : ▦⟪${earlier} : ${input}⟫⟫`);
    const single = compute(`▦⟪${combined} : ${input}⟫`);
    assert.equal(single.ufn,successive.ufn);
    if (expected) assert.equal(single.ufn,expected);
    assert.equal(UFN.compute(UFN.expand(declared(combined)).expanded).ufn,table.ufn);
  }
});

test("the order of changes determines the doubled entry and directed answer", () => {
  const swap="((○ ◠) (◠ ○))", resize="((⟨◠⟩ ○) (○ ◠))", input="(⟨◠⟩ ⟨◠○⟩)";
  assert.equal(compute(`▦⟪▧⟪${resize} : ${swap}⟫ : ${input}⟫`).ufn,"(⟨◠◠⟩ ⟨◠⟩)");
  assert.equal(compute(`▦⟪▧⟪${swap} : ${resize}⟫ : ${input}⟫`).ufn,"(⟨◠○⟩ ⟨⟨◠⟩⟩)");
  assert.equal(compute("▧⟪((◠@⟨◠⟩)) : ((◠@◠))⟫").ufn,"((◡@⟨◠○⟩))");
  assert.equal(compute("▧⟪((◠@◠)) : ((◠@⟨◠⟩))⟫").ufn,"((◠@⟨◠○⟩))");
});

test("example undoing tables give identity in both orders and recover varied inputs exactly", () => {
  const inputs=["(◡ ⟨◡⟩)","(◠@◠ ⟨⟨◡⟩⟩)","(○ ○)"];
  for (let index=0;index<3;index++) {
    const samples=index===2 ? ["(◠@⟨◠⟩)","(◡)","(⟨◡⟩)"] : inputs;
    for (const input of samples) {
      const result=transformations.explore(index,input);
      const identity=index===2 ? "((◠))" : "((◠ ○) (○ ◠))";
      assert.equal(result.identityAfter.ufn,identity);
      assert.equal(result.identityBefore.ufn,identity);
      assert.equal(result.recovered.ufn,UFN.compute(input).ufn);
      assert.equal(result.single.ufn,result.later.ufn);
      assert.equal(UFN.compute(result.sources.undo).ufn,result.recovered.ufn);
    }
  }
});

test("dropping an entry keeps different inputs indistinguishable after a later change", () => {
  for(const input of ["(⟨◠⟩ ◠)","(◡ ⟨◡⟩)","(◠@◠ ◠@⟨◠⟩)"]) {
    const result=transformations.explore(3,input);
    assert.notEqual(result.alternative.ufn,result.input.ufn);
    assert.equal(result.alternativeAnswer.ufn,result.later.ufn);
    assert.equal(result.single.ufn,result.later.ufn);
    assert.equal(result.recovered,undefined);
  }
});

test("composition validates numerical rectangular rows and refuses an unspecified earlier width", () => {
  for(const form of [
    "▧⟪() : ()⟫", "▧⟪((◠)) : (◠)⟫", "▧⟪() : ((◠) (◠ ○))⟫",
    "▧⟪((◠)) : ((◠) (◠))⟫", "▧⟪((◠ ◠)) : ((◠))⟫",
    "▧⟪() : (({|○}))⟫", "▧⟪(({|○})) : (())⟫",
    "▧⟪((())) : (())⟫", "▧⟪((◠) (◠ ○)) : ((◠))⟫",
  ]) assert.throws(()=>compute(form),UFN.UFNError,form);
  assert.equal(compute("▧⟪() : ((◠ ○))⟫").ufn,"()");
  assert.equal(compute("▧⟪((◠ ◠) (◠ ◡)) : (() ())⟫").ufn,"(() ())");
  const unknown=compute("▧⟪() : ((┌┘))⟫");
  assert.equal(unknown.established,false);
  assert.equal(UFN.compute(unknown.ufn).established,false);
});

test("composition and recovery avoid all decimal projection operations", () => {
  const keys=["pow","log","sin","cos","exp","hypot"];
  const originals=keys.map(k=>Math[k]);
  keys.forEach(k=>Math[k]=()=>{throw Error("Decimal calculation requested");});
  try {
    for(let i=0;i<transformations.scenarios.length;i++) {
      const result=transformations.explore(i);
      assert.equal(result.single.ufn,result.later.ufn);
      assert.equal(result.single.established,true);
    }
  } finally {keys.forEach((k,i)=>Math[k]=originals[i]);}
});
