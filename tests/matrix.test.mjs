import assert from "node:assert/strict";
import test from "node:test";
import UFN from "../src/ufn.js";
import library from "../src/library.js";
import matrix from "../src/matrix.js";
const declared = form => library.declarations(["matrix"]) + "\n" + form;
const compute = form => UFN.compute(declared(form));

test("row and matrix forms expand into existing operations and keep written row order", () => {
  for (const id of ["row-apply", "matrix"]) {
    const source = library.example(id), result = UFN.compute(source);
    assert.equal(UFN.compute(UFN.expand(source).expanded).ufn, result.ufn);
  }
  const expected = ["(⟨◠⟩ ◡)", "(⟨◠⟩ ◠)", "(⟨◠○○⟩ ◠)", "(◠@⟨◠○⟩ ◡@⟨◠○⟩)", "(○ ○)"];
  matrix.presets.forEach((preset, index) => {
    const work = matrix.apply(preset.table, preset.input);
    assert.equal(work.answer.ufn, expected[index]);
    work.rows.forEach((row, r) => {
      assert.equal(row.total.ufn, work.answer.items[r].ufn);
      if (row.terms.length) assert.equal(row.terms.at(-1).joined.ufn, row.total.ufn);
      row.terms.forEach((term, c) => {
        assert.equal(term.place, UFN.encodeInteger(row.terms.length - 1 - c));
        assert.equal(term.column, c);
      });
    });
  });
});

test("row changes precede input changes, including noncommuting directions", () => {
  assert.equal(compute("▦⟪((◠@◠)) : (◠@⟨◠⟩)⟫").ufn,"(◠@⟨◠○⟩)");
  assert.equal(compute("▦⟪((◠@⟨◠⟩)) : (◠@◠)⟫").ufn,"(◡@⟨◠○⟩)");
});

test("empty tables, empty rows, and zero entries preserve their different shapes", () => {
  assert.equal(compute("▦⟪() : (◠ ◡)⟫").ufn,"()");
  assert.equal(compute("▦⟪(() ()) : ()⟫").ufn,"(○ ○)");
  assert.equal(compute("▦⟪((◠ ○)) : (⟨◠⟩ ◠)⟫").ufn,"(⟨◠⟩)");
  for (const form of ["▦⟪((◠)) : (◠ ○)⟫", "▦⟪((◠ ○)) : (◠)⟫", "▦⟪((◠)) : ()⟫", "▦⟪(() (◠)) : ()⟫"])
    assert.throws(()=>compute(form),UFN.UFNError,form);
});

test("matrix declarations validate all required rows and inputs even when output is empty", () => {
  for (const form of ["▦⟪(◠ ◠) : (◠)⟫", "▦⟪(((◠))) : (◠)⟫", "▦⟪() : (())⟫", "▦⟪() : ({|○})⟫", "▦⟪(({|○} ○)) : (○ ◠)⟫"])
    assert.throws(()=>compute(form),UFN.UFNError,form);
  const unknown = compute("▦⟪() : (┌┘)⟫");
  assert.equal(unknown.established,false);
  assert.equal(UFN.compute(unknown.ufn).established,false);
});

test("matrix work uses exact factors, shares, and root cancellation without decimal projection", () => {
  const originals = [Math.pow, Math.log, Math.sin, Math.cos];
  Math.pow= Math.log= Math.sin= Math.cos=()=>{throw Error("Decimal projection requested");};
  try {
    const work=matrix.apply("((⟨⟨◡⟩⟩ ⟨⟨◡⟩⟩) (⟨◡⟩ ⟨◡○⟩))", "(⟨⟨◡⟩⟩ [|⟨⟨◡⟩⟩])");
    assert.equal(work.answer.items[0].canonical,"○");
    assert.equal(work.rows[0].terms[0].result.canonical,"⟨◠⟩");
    assert.equal(work.rows[0].terms[1].result.canonical,"[|⟨◠⟩]");
  } finally { [Math.pow,Math.log,Math.sin,Math.cos]=originals; }
});

test("generated lists and external counter names survive declaration expansion", () => {
  assert.equal(compute("▦⟪(row : ◠ … ⟨◠⟩ : (row ○)) : (⟨◠○⟩ ◠)⟫").ufn,"(⟨◠○⟩ ⟨◠◠⟩)");
  const source=declared("(□⌊◠⌋ : ◠ … ⟨◠⟩ : ▦⟪((□⌊◠⌋ ○)) : (◠ ◠)⟫)");
  assert.equal(UFN.compute(source).ufn,"((◠) (⟨◠⟩))");
  assert.equal(UFN.compute(UFN.expand(source).expanded).ufn,"((◠) (⟨◠⟩))");
});

test("walkthrough rejects unsupported shapes and previews with a useful message", () => {
  for (const [table,input,pattern] of [
    ["(◠)","(◠)",/row must be a finite sequence/],
    ["((◠))","(◠ ○)",/different length/],
    ["()","(())",/input entry must be a number/],
    ["()","◠",/must be a sequence/],
    ["()","([□ : ◠ … : {|□ □}])",/finite preview/],
    ["(r : ◠ … ⟨◠○○○⟩ : ())","()",/six rows/],
  ]) assert.throws(()=>matrix.apply(table,input),pattern);
});
