import assert from "node:assert/strict";
import test from "node:test";
import UFN from "../src/ufn.js";
import library from "../src/library.js";
import clues from "../src/row-clues.js";
const compute = form => UFN.compute(library.declarations(["matrix-compose"])+"\n"+form);
const identity="((◠ ○) (○ ◠))";

test("worked clues remove shared contributions and recover the expected inputs", () => {
  const work=clues.walkthrough(0);
  assert.equal(work.stages[1].table.ufn,"((◠ ◠) (○ ◠))");
  assert.equal(work.stages[1].target.ufn,"(⟨◠○⟩ ◠)");
  assert.deepEqual(work.stages[1].calculations.map(part=>part.result.canonical),["○","◠","◠"]);
  assert.equal(work.stages[2].table.ufn,identity);
  assert.equal(work.stages[2].target.ufn,"(⟨◠⟩ ◠)");
  assert.equal(work.outcome,"one");
  assert.deepEqual(work.solutions,["(⟨◠⟩ ◠)"]);
  for(const stage of work.stages) assert.equal(UFN.compute(stage.source).items[0].ufn,stage.table.ufn);
});

test("zero-instruction rows distinguish a repeated restriction from a contradiction", () => {
  assert.equal(clues.walkthrough(1).outcome,"many");
  assert.equal(clues.walkthrough(2).outcome,"none");
  // Changing only the requested output changes the conclusion for the same table.
  assert.equal(clues.walkthrough(1,"(⟨◠○⟩ ⟨◠○○○⟩)").outcome,"none");
  assert.equal(clues.walkthrough(2,"(⟨◠○⟩ ⟨◠◠⟩)").outcome,"many");
  for(const input of clues.walkthrough(1).checks) assert.equal(input.output.ufn,"(⟨◠○⟩ ⟨◠◠⟩)");
});

test("each permitted row change has a two-sided inverse and restores table and request", () => {
  const table="((◠ ◠@◠) (◡ ⟨◡⟩))",target="(◠@⟨◠⟩ ⟨◠○⟩)";
  for(const [name,operation] of Object.entries(clues.operations)) {
    assert.equal(compute(`▧⟪${operation.inverse} : ${operation.table}⟫`).ufn,identity,name);
    assert.equal(compute(`▧⟪${operation.table} : ${operation.inverse}⟫`).ufn,identity,name);
    const changed=clues.change(table,target,name);
    assert.equal(compute(`▧⟪${operation.inverse} : ${changed.tableForm}⟫`).ufn,UFN.compute(table).ufn,name);
    assert.equal(compute(`▦⟪${operation.inverse} : ${changed.targetForm}⟫`).ufn,UFN.compute(target).ufn,name);
    const input="(⟨◡⟩ ◠@◠)";
    const originalOutput=`▦⟪${table} : ${input}⟫`;
    assert.equal(compute(`▦⟪${changed.tableForm} : ${input}⟫`).ufn,
      compute(`▦⟪${operation.table} : ${originalOutput}⟫`).ufn,name);
  }
});

test("found inputs satisfy every original and transformed clue, including directed requests", () => {
  for(const [index,target] of [[0,undefined],[1,undefined],[3,undefined],[4,undefined],[0,"(◠@◠ ◠@⟨◠⟩)"],[1,"(◠@◠ ⟨◠⟩@◠)"]]) {
    const work=clues.walkthrough(index,target);
    for(const input of work.solutions)for(const stage of work.stages) {
      assert.equal(compute(`▦⟪${stage.table.ufn} : ${input}⟫`).ufn,stage.target.ufn);
    }
  }
  assert.equal(clues.walkthrough(3).solutions[0],"(⟨◠◡⟩ ◠)");
});

test("invalid shapes and undefined entries reject, while unfinished requests stay pending", () => {
  for(const [table,target] of [["((◠))","(◠ ◠)"],["((◠ ◠))","(◠ ◠)"],["((◠ ◠) (◠ ()))","(◠ ◠)"],[identity,"(◠)"],[identity,"(◠ ())"],[identity,"(◠ {|○})"]])
    assert.throws(()=>clues.change(table,target,"swap"),UFN.UFNError);
  assert.throws(()=>clues.change(identity,"(◠ ◠)","erase"),/reversible/);
  assert.throws(()=>clues.walkthrough(10),/Choose a clue/);
  assert.throws(()=>clues.walkthrough(0,"([□ : ◠ … : {|□ □}] ◠)"),/preview/);
  const pending=clues.walkthrough(0,"(┌┘ ◠)");
  assert.equal(pending.outcome,"pending");assert.deepEqual(pending.solutions,[]);
  assert.equal(UFN.compute(pending.stages.at(-1).source).established,false);
});

test("row changes and their solution checks do not use decimal operations", () => {
  const keys=["pow","log","sin","cos","exp","hypot"], originals=keys.map(key=>Math[key]);
  keys.forEach(key=>Math[key]=()=>{throw Error("Decimal projection requested");});
  try {for(let i=0;i<clues.examples.length;i++) assert.notEqual(clues.walkthrough(i).outcome,"pending");}
  finally {keys.forEach((key,i)=>Math[key]=originals[i]);}
});
