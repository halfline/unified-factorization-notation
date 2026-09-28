import assert from "node:assert/strict";
import test from "node:test";
import UFN from "../src/ufn.js";
import puzzles from "../src/input-puzzles.js";

test("the one-input puzzle checks both requested entries, not only a successful first row", () => {
  const answer = puzzles.check(0,"(⟨◠○⟩ ⟨⟨◠⟩⟩)");
  assert.equal(answer.matches,true);
  assert.equal(answer.gaps.ufn,"(○ ○)");
  const guess=puzzles.check(0,"(⟨◠○⟩ ⟨◠○⟩)");
  assert.equal(guess.matches,false);
  assert.equal(guess.gaps.ufn,"(○ ◡)");
  assert.equal(UFN.compute(answer.source).ufn,answer.output.ufn);
  assert.equal(UFN.compute(guess.gapSource).ufn,guess.gaps.ufn);
});

test("different exact inputs fit the joining puzzle, including shares, roots, and directions", () => {
  const inputs=[...puzzles.puzzles[1].examples,"(⟨◡⟩ ⟨◠○◡⟩)","(◡ ⟨⟨◠⟩⟩)","(⟨⟨◡⟩⟩ [⟨◠○⟩ | ⟨⟨◡⟩⟩])","(◠@◠ [⟨◠○⟩ | ◠@◠])"];
  for(const input of inputs)assert.equal(puzzles.check(1,input).matches,true,input);
  assert.equal(puzzles.check(1,"(○ ○)").matches,false);
});

test("identical rows produce identical outputs while the requested outputs differ", () => {
  for(const input of ["(○ ○)","(⟨◠○⟩ ◠)","(◠ ⟨◠○⟩)","(◠@◠ ◡)"]) {
    const attempt=puzzles.check(2,input);
    assert.equal(attempt.output.items[0].ufn,attempt.output.items[1].ufn);
    assert.equal(attempt.matches,false);
  }
  assert.deepEqual(puzzles.puzzles.map(p=>p.outcome),["one","many","none"]);
});

test("unfinished comparisons stay unconfirmed, while undefined inputs and bad shapes reject", () => {
  assert.equal(puzzles.check(1,"(┌┘ ○)").matches,null);
  // Whole-input validation may retain the complete output until every
  // required entry is established, even when a row appears easy to reject.
  assert.equal(puzzles.check(0,"(○ ┌┘)").matches,null);
  for(const [index,input] of [[0,"(◠)"],[1,"(◠ ◠ ◠)"],[2,"(◠ {|○})"],[0,"(◠ ())"]])
    assert.throws(()=>puzzles.check(index,input),UFN.UFNError);
  assert.throws(()=>puzzles.check(20,"(○ ○)"),/Choose an input puzzle/);
});

test("guess checks use no decimal projection and compare values across different spellings", () => {
  const keys=["pow","log","sin","cos","exp","hypot"], originals=keys.map(k=>Math[k]);
  keys.forEach(k=>Math[k]=()=>{throw Error("Decimal projection requested");});
  try {
    assert.equal(puzzles.check(0,"([◠ ◠ ◠] [◠ ◠ ◠ ◠])").matches,true);
    assert.equal(puzzles.check(1,"(⟨◡⟩ ⟨◠○◡⟩)").matches,true);
    assert.equal(puzzles.check(2,"(⟨◠○⟩ ○)").matches,false);
  } finally {keys.forEach((k,i)=>Math[k]=originals[i]);}
});
