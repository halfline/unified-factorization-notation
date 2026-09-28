import assert from "node:assert/strict";
import test from "node:test";
import UFN from "../src/ufn.js";
import tooltips from "../src/number-tooltips.js";

const { compute, encodeInteger: n } = UFN;
const labels = ["○", "◠", "⟨◠⟩", "⟨◠○⟩"];
const amounts = ["⟨◡⟩", "◡", "⟨⟨◡⟩⟩", "⟨◠○○⟩"];
const journey = "[" + amounts.map((amount, i) => amount + "@" + labels[i]).join(" ") + "]";

test("# returns signed amounts on the original path and all four readings reconstruct the value", () => {
  for (let axis = 0; axis < 4; axis++) {
    assert.equal(compute(journey + "#" + labels[axis]).canonical, amounts[axis]);
    for (let other = 0; other < 4; other++)
      assert.equal(compute(amounts[axis] + "@" + labels[axis] + "#" + labels[other]).canonical, axis === other ? amounts[axis] : "○");
  }
  const rebuilt = "[" + labels.map(label => journey + "#" + label + "@" + label).join(" ") + "]";
  assert.equal(compute(rebuilt).canonical, compute(journey).canonical);
  assert.equal(compute("◡#◠").canonical, "○");
  assert.equal(compute("{◠@◠ ◠@⟨◠⟩}#⟨◠○⟩").canonical, "◠");
  assert.equal(compute("{◠@⟨◠⟩ ◠@◠}#⟨◠○⟩").canonical, "◡");
});

test("# and @ chain left to right, with upper attachments binding to their immediate operand", () => {
  assert.equal(compute("⟨◠⟩@◠#◠@⟨◠⟩").canonical, "⟨◠⟩@⟨◠⟩");
  assert.equal(compute("⟨◠⟩@◠#◠#◠").canonical, "○");
  assert.equal(compute("⟨◠⟩@◠#◠⌈⟨◠⟩⌉").canonical, "⟨◠⟩");
  assert.equal(compute("[⟨◠⟩@◠#◠]⌈⟨◠⟩⌉").canonical, "⟨⟨◠⟩⟩");
  assert.equal(compute(journey + "#[◠ ◠]").canonical, amounts[2]);
  assert.throws(() => compute(journey + "#⟨◠⟩⌈⟨◠⟩⌉"), /Component label/);
  assert.equal(compute("*⟨◠○○⟩#◠").canonical, "○");
  assert.equal(compute("index([⟨◠○○⟩@◠]#◠)").canonical, "⟨◠○⟩");
  for (const source of [journey + "#◠", "index([⟨◠○○⟩@◠]#◠)", "⟨◠⟩@○@◠#◠@⟨◠⟩"])
    assert.equal(compute(UFN.formatSource(source, 32)).ufn, compute(source).ufn);
});

test("component positions require a number and a valid fixed basis label", () => {
  for (const label of ["◡", "⟨◡⟩", "⟨⟨◠⟩⟩", "[◠@◠]", "(◠)"])
    assert.throws(() => compute("┌┘#" + label), UFN.UFNError, label);
  for (const source of ["()#○", "(◠)#○", "[◠ {|○}@◠]#○", "[{|○}@○ ◠@◠]#◠", "◠##◠", "◠#", "#◠", "◠#□"])
    assert.throws(() => compute(source), UFN.UFNError, source);
  const token = tooltips.tokens("◠#⟨◠⟩").find(token => token.source === "⟨◠⟩");
  assert.equal(token.context, "Direction label");
  assert.match(tooltips.describe(token).note, /not an angle/);
});

test("turn components give exact sine, cosine, and tangent for supported angles", () => {
  const saved = Object.fromEntries(["sin", "cos", "exp", "log", "pow"].map(key => [key, Math[key]]));
  try {
    for (const key of Object.keys(saved)) Math[key] = () => { throw new Error("Decimal arithmetic requested"); };
    for (const label of labels.slice(1)) {
      for (let step = -8; step <= 8; step++) {
        const turn = `┌┘⌈{⟳ ${n(step)} | ${n(8)}}@${label}⌉`;
        const cosine = compute(turn + "#○"), sine = compute(turn + "#" + label);
        assert.ok(cosine.canonical); assert.ok(sine.canonical);
        assert.equal(compute(`[{${cosine.ufn} ${cosine.ufn}} {${sine.ufn} ${sine.ufn}}]`).canonical, "◠");
      }
    }
    const turn = `┌┘⌈{⟳ | ${n(8)}}@◠⌉`;
    assert.equal(compute(`{${turn}#◠ | ${turn}#○}`).canonical, "◠");
    assert.throws(() => compute(`{┌┘⌈{⟳ | ${n(4)}}@◠⌉#◠ | ┌┘⌈{⟳ | ${n(4)}}@◠⌉#○}`), /Division by zero/);
    assert.equal(compute("┌┘⌈[⟳@⟨◠⟩#⟨◠⟩]@◠⌉#○").canonical, "◠");
  } finally { Object.assign(Math, saved); }
});

test("general trig and planar angles remain recipes with projections and preserve logarithm branches", () => {
  for (const [source, value] of [["┌┘⌈◠@◠⌉#○", Math.cos(1)], ["┌┘⌈◠@◠⌉#◠", Math.sin(1)]]) {
    const answer = compute(source);
    assert.equal(answer.canonical, null);
    assert.equal(answer.ufn, source);
    assert.deepEqual(answer.value, [value, 0, 0, 0]);
    assert.equal(answer.canonical, null);
  }
  for (const [x, y] of [[1, 1], [-1, 1], [-1, -1], [1, -1], [0, 1], [0, -1], [1, 0]]) {
    const answer = compute(`┌┘⌈|[${n(x)}@○ ${n(y)}@◠]⌉#◠`);
    assert.ok(Math.abs(answer.value[0] - Math.atan2(y, x)) < 1e-12);
    assert.deepEqual(answer.value.slice(1), [0, 0, 0]);
  }
  assert.throws(() => compute("┌┘⌈|◡⌉#◠"), /plane or branch/);
  assert.throws(() => compute("┌┘⌈|○⌉#◠"), /cannot be ○/);
  assert.throws(() => compute("[┌┘@◠]⌈|◠⌉#○"), /Logarithm base/);
  assert.equal(compute("┌┘⌈|◠⌉#◠").canonical, "○");
});

test("component selection composes with definitions, retained entries, and hygienic expansion", () => {
  const source = "≔(◇⟪□⟫ : □#◠) (□ : ◠ … ⟨◠○⟩ : ◇⟪[□@◠]⟫)";
  assert.equal(compute(source).ufn, "(◠ ⟨◠⟩ ⟨◠○⟩)");
  assert.equal(compute(UFN.expand(source, 32).expanded).ufn, compute(source).ufn);
  for (const source of [
    "≔(◇⟪□⟫ : ◠#□) ◇⟪[◠@◠]#○⟫",
    "≔(◇⟪□⟫ : □⌈⟨◠⟩⌉) ◇⟪⟨◠⟩@◠#◠⟫",
    "≔(◇⟪□⟫ : □@⟨◠⟩) ◇⟪⟨◠⟩@◠#◠⟫",
  ]) assert.equal(compute(UFN.expand(source, 32).expanded).ufn, compute(source).ufn);
  for (const source of ["≔(# : ◠) #", "≔(◇⟪□#⟫ : □) ◇⟪◠#⟫"])
    assert.throws(() => compute(source), UFN.UFNError);
  const sequence = compute("(□ : ◠ … ⟨◠○⟩ : ┌┘⌈□@◠⌉#◠)");
  assert.deepEqual(compute(sequence.ufn).value, sequence.value);
  assert.equal(compute(`(□ : ○ … ⟨◠○⟩ : ${journey}#□)`).ufn, "(" + amounts.join(" ") + ")");
});

test("fixed component readings differentiate exactly; changing selectors stay unsupported", () => {
  const result = UFN.differentiate("{□ □}#○", { at: "◠@◠", along: "◠@◠" });
  assert.equal(result.canonical, "[|⟨◠⟩]");
  assert.ok(result.rules.includes("component rule"));
  assert.equal(UFN.differentiate("□#◠", { at: journey, along: "◠@◠" }).canonical, "◠");
  assert.equal(UFN.differentiate("□#◠", { at: journey, along: "◠@⟨◠⟩" }).canonical, "○");
  const changing = UFN.differentiate(journey + "#□", { at: "◠" });
  assert.equal(changing.established, false);
  assert.match(changing.reason, /Component label.*fixed/);
});

test("limits distinguish reading finite terms from reading an unestablished whole limit", () => {
  assert.equal(UFN.limit("[□ : ○ … : [◠@○ ⟨◡⟩⌈□⌉@◠]#◠]").canonical, "⟨◠⟩");
  const whole = UFN.limit("[□ : ○ … : [◠@○ ⟨◡⟩⌈□⌉@◠]]#◠");
  assert.equal(whole.canonical, null);
  assert.throws(() => whole.value, /unresolved limit/);
  assert.equal(compute("[□ : ○ … : ⟨◠⟩⌈□⌉@⟨◠⟩#⟨◠⟩]⌊◠⌋").canonical, "◡");
  assert.equal(UFN.limit("[□ : ◠ … : {|□ [□ ◠]}@◠#◠]").canonical, "◠");
  const undefinedTerm = UFN.limit("[□ : ◠ … : [◠ {|[□ | ◠]}@◠]#○]");
  assert.equal(undefinedTerm.canonical, null, "selection cannot erase a divisor's domain condition");
  assert.throws(() => undefinedTerm.value, /unresolved limit/);
});
