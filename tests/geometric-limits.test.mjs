import assert from "node:assert/strict";
import test from "node:test";
import UFN from "../src/ufn.js";

test("fixed root products use exact size comparisons to prove convergence", () => {
  const oldPow = Math.pow, oldSqrt = Math.sqrt;
  Math.pow = Math.sqrt = () => { throw new Error("Decimal estimate requested"); };
  try {
    for (const factor of ["[⟨⟨◡⟩⟩ | ◠]", "[⟨⟨◡⟩⟩ | ◠]@◠", "[⟨⟨◡⟩○⟩ | ⟨⟨◡⟩⟩]"])
      assert.equal(UFN.limit(`{□ : ◠ … : ${factor}}`).canonical, "○");
    assert.throws(() => UFN.limit("{□ : ◠ … : [◠ ⟨⟨◡⟩⟩]}"), /no limit/);
  } finally { Math.pow = oldPow; Math.sqrt = oldSqrt; }
});

test("ordinary geometric sums can have exact square-root ratios", () => {
  const oldPow = Math.pow, oldLog = Math.log;
  Math.pow = Math.log = () => { throw new Error("Decimal estimate requested"); };
  try {
    const root = "⟨⟨◡⟩⟩";
    const forms = [
      `[□ : ○ … : ${root}⌈[|□]⌉]⌊○⌋`,
      "[□ : ○ … : ⟨{◡ □ ⟨◡⟩}⟩]⌊○⌋",
    ];
    for (const series of forms) {
      const result = UFN.compute(series);
      assert.ok(result.reduced);
      assert.equal(result.partial, false);
      assert.equal(UFN.compute(`[${series} | ⟨◠⟩]`).canonical, root);
      assert.throws(() => UFN.preview(series.replace("⌊○⌋", "⌊◠⌋"), 2), /rational entries/);
    }
    const ratio = `[${root} | ◠]`;
    assert.equal(UFN.limit(`[[□ : ○ … : ${ratio}⌈□⌉] | ◠]`).canonical, "⟨[|⟨◡⟩]⟩");
    assert.throws(() => UFN.limit(`[□ : ○ … : ${root}⌈□⌉]`), /no limit/);
  } finally { Math.pow = oldPow; Math.log = oldLog; }
});

const { compute, preview } = UFN;

test("ordinary geometric sums permit root and directed coefficients", () => {
  const oldPow = Math.pow, oldLog = Math.log;
  Math.pow = Math.log = () => { throw new Error("Decimal projection requested"); };
  try {
    for (const [source, expected] of [
      ["[□ : ○ … : {⟨⟨◡⟩⟩ ⟨◡⟩⌈□⌉}]⌊○⌋", "{⟨◠⟩ ⟨⟨◡⟩⟩}"],
      ["[□ : ○ … : ⟨◡⟩⌈□⌉@◠]⌊○⌋", "⟨◠⟩@◠"],
      ["[□ : ○ … : {◠@◠ ⟨◡⟩⌈□⌉@⟨◠⟩}]⌊○⌋", "⟨◠⟩@⟨◠○⟩"],
      ["[□ : ○ … : {⟨◡⟩⌈□⌉@⟨◠⟩ ◠@◠}]⌊○⌋", "[|⟨◠⟩]@⟨◠○⟩"],
    ]) {
      const result = compute(source);
      assert.equal(result.canonical, compute(expected).canonical);
      assert.equal(result.partial, false);
    }
  } finally { Math.pow = oldPow; Math.log = oldLog; }
});

test("finite combinations of geometric sequences group equal ratios before taking limits", () => {
  for (const [source, expected] of [
    ["[□ : ○ … : [⟨◡⟩⌈□⌉ ⟨◡○⟩⌈□⌉]]⌊○⌋", "{⟨◠○○○⟩ | ⟨◠⟩}"],
    ["[□ : ○ … : {⟨⟨◡⟩⟩ [⟨◡⟩⌈□⌉ | ⟨◡○⟩⌈□⌉]}]⌊○⌋", "⟨[|⟨◡⟩]⟩"],
    ["[□ : ○ … : [⟨◠⟩⌈□⌉ ⟨⟨◠⟩⟩⌈□⌉]]⌊◠⌋", "{[|⟨⟨◠⟩⟩] | ⟨◠○⟩}"],
    ["[□ : ○ … : [⟨◠⟩⌈□⌉ ⟨◡⟩⌈□⌉ | ⟨◠⟩⌈□⌉]]⌊○⌋", "⟨◠⟩"],
  ]) {
    const answer = compute(source);
    assert.equal(answer.canonical, compute(expected).canonical);
    assert.equal(answer.partial, false);
  }
  const uncertain = compute("[□ : ○ … : [⟨◠⟩⌈□⌉ ⟨◡⟩⌈□⌉]]⌊○⌋");
  assert.equal(uncertain.canonical, null);
  assert.throws(() => uncertain.value, /no ordinary decimal projection/);
  assert.equal(preview(uncertain.ufn, 3).partial, true);
});

test("constant directed products shrink by their ordinary size while factor measurement stays rational", () => {
  for (const factor of ["⟨◡⟩@◠", "[⟨◡⟩@◠ ⟨◡⟩@⟨◠⟩]", "⟨[|⟨◠◡⟩]⟩@◠"]) {
    const source = `{□ : ◠ … : ${factor}}⌊○⌋`;
    assert.equal(compute(source).canonical, "○");
    assert.equal(preview(source, 2).partial, true);
  }
  assert.throws(() => compute("{□ : ◠ … : ◠@◠}⌊○⌋"), /no limit/);
  assert.throws(() => compute("[□ : ○ … : ⟨◡⟩⌈□⌉@◠]⌊◠⌋"), /original path/);
  assert.throws(() => compute("[□ : ○ … : {⟨⟨◡⟩⟩ ⟨◠⟩⌈□⌉}]⌊◠⌋"), /rational/);
});
