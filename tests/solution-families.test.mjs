import assert from "node:assert/strict";
import test from "node:test";
import UFN from "../src/ufn.js";
import families from "../src/solution-families.js";

test("every slider choice has an exact compensating amount, including backwards amounts", () => {
  assert.equal(families.choices.length,17);
  for(const first of families.choices) {
    const work=families.describe([first]);
    assert.equal(work.matches,true);
    assert.equal(work.inputs.items.length,2);
    assert.equal(work.joined.canonical,"⟨◠○⟩");
    assert.equal(UFN.compute(work.checkSource).ufn,"(⟨◠○⟩)");
  }
  assert.equal(families.describe(["⟨⟨◠⟩⟩"]).inputs.ufn,"(⟨⟨◠⟩⟩ ◡)");
  assert.equal(families.describe(["⟨◡⟩"]).inputs.ufn,"(⟨◡⟩ ⟨◠○◡⟩)");
});

test("two independently chosen amounts determine the remaining amount", () => {
  const before=families.describe(["◠","◠"]);
  const changedFirst=families.describe(["⟨◠⟩","◠"]);
  const changedSecond=families.describe(["◠","⟨◠○⟩"]);
  assert.equal(before.inputs.ufn,"(◠ ◠ ◠)");
  assert.equal(changedFirst.inputs.ufn,"(⟨◠⟩ ◠ ○)");
  assert.equal(changedSecond.inputs.ufn,"(◠ ⟨◠○⟩ ◡)");
  for(const first of ["○","◡","⟨◡⟩","⟨◠○○⟩"])for(const second of ["◠","⟨◠○⟩","[|⟨◠⟩]"]) {
    const work=families.describe([first,second]);
    assert.equal(work.matches,true);
    assert.equal(work.inputs.items[0].canonical,UFN.compute(first).canonical);
    assert.equal(work.inputs.items[1].canonical,UFN.compute(second).canonical);
    assert.equal(UFN.compute(work.checkSource).ufn,"(⟨◠○⟩)");
  }
});

test("the same compensation rules cover roots, directed amounts, and other totals", () => {
  for(const [choices,total] of [
    [["⟨⟨◡⟩⟩"],"⟨◠○⟩"], [["◠@◠"],"⟨◠○⟩"],
    [["◠@⟨◠⟩","⟨◡⟩@◠"],"◠@⟨◠○⟩"],
    [["⟨◠⟩"],"◡"], [["⟨◡⟩","◡"],"○"],
  ]) {
    const work=families.describe(choices,total);
    assert.equal(work.matches,true);
    assert.equal(work.gap.canonical,"○");
    assert.equal(UFN.compute(UFN.expand(work.source).expanded).ufn,work.inputs.ufn);
  }
  assert.equal(families.describe(["◠@◠"]).inputs.items[1].ufn,"[⟨◠○⟩@○ ◡@◠]");
});

test("family declarations preserve supplied counter scope and retain unfinished inputs", () => {
  const declaration=families.declarations[0];
  const source=declaration+" (□⌊◠⌋ : ◠ … ⟨◠⟩ : ↔⟪⟨◠○⟩ : □⌊◠⌋⟫)";
  assert.equal(UFN.compute(source).ufn,"((◠ ⟨◠⟩) (⟨◠⟩ ◠))");
  assert.equal(UFN.compute(UFN.expand(source).expanded).ufn,UFN.compute(source).ufn);
  const pending=families.describe(["┌┘"]);
  assert.equal(pending.matches,null);
  assert.equal(pending.inputs.established,false);
  assert.equal(UFN.compute(pending.source).established,false);
});

test("undefined choices, sequences and previews reject even though a choice is later undone", () => {
  for(const [choices,total] of [
    [["{|○}"],"⟨◠○⟩"], [["()"],"◠"], [["◠"],"()"],
    [["◠"],"{|○}"], [["[□ : ◠ … : {|□ □}]"],"⟨◠○⟩"],
  ])assert.throws(()=>families.describe(choices,total),UFN.UFNError);
  for(const choices of [[],["◠","◠","◠"],"◠"])assert.throws(()=>families.describe(choices),/one or two/);
});

test("family construction, compensation, and confirmation never request decimal arithmetic", () => {
  const keys=["pow","log","sin","cos","exp","hypot"], originals=keys.map(key=>Math[key]);
  keys.forEach(key=>Math[key]=()=>{throw Error("Decimal projection requested");});
  try {
    for(const choice of ["⟨◡⟩","◡","⟨⟨◡⟩⟩","◠@◠"])
      assert.equal(families.describe([choice,"◠"]).matches,true);
  } finally {keys.forEach((key,index)=>Math[key]=originals[index]);}
});
