import assert from "node:assert/strict";
import test from "node:test";
import UFN from "../src/ufn.js";

const { compute, encodeInteger, formatWholeUFN, UFNError } = UFN;

const compact = text => text.replace(/\s/gu, "");

test("known integer spellings use the current positions and single marks", () => {
  const examples = [
    [0, "○"], [1, "◠"], [-1, "◡"], [2, "⟨◠⟩"], [3, "⟨◠○⟩"],
    [4, "⟨⟨◠⟩⟩"], [5, "⟨◠○○⟩"], [6, "⟨◠◠⟩"], [7, "⟨◠○○○⟩"],
    [8, "⟨⟨◠○⟩⟩"], [9, "⟨⟨◠⟩○⟩"], [10, "⟨◠○◠⟩"],
    [12, "⟨◠⟨◠⟩⟩"], [14, "⟨◠○○◠⟩"], [16, "⟨⟨⟨◠⟩⟩⟩"],
    [18, "⟨⟨◠⟩◠⟩"], [25, "⟨⟨◠⟩○○⟩"], [36, "⟨⟨◠⟩⟨◠⟩⟩"],
    [56, "⟨◠○○⟨◠○⟩⟩"], [64, "⟨⟨◠◠⟩⟩"], [72, "⟨⟨◠⟩⟨◠○⟩⟩"],
    [81, "⟨⟨⟨◠⟩⟩○⟩"], [144, "⟨⟨◠⟩⟨⟨◠⟩⟩⟩"],
    [216, "⟨⟨◠○⟩⟨◠○⟩⟩"], [256, "⟨⟨⟨◠○⟩⟩⟩"],
    [65536, "⟨⟨⟨⟨◠⟩⟩⟩⟩"], [-14, "[|⟨◠○○◠⟩]"],
  ];
  for (const [number, spelling] of examples) {
    assert.equal(compact(encodeInteger(number)), spelling);
    assert.equal(compute(spelling).value[0], number, spelling);
  }
});

test("integers from -10000 through 10000 round-trip through the shared engine", () => {
  for (let number = -10000; number <= 10000; number++) {
    const encoded = encodeInteger(number);
    const answer = compute(encoded);
    assert.equal(answer.partial, false);
    assert.equal(answer.value[0], number, encoded);
    assert.ok(answer.value.slice(1).every(value => value === 0));
    assert.equal(formatWholeUFN(answer.value), encoded);
  }
});

test("alternate spellings normalize to the same whole value", () => {
  const examples = [
    ["[]", "○"], ["[◠ ◡]", "○"], ["{}", "◠"], ["⟨⟩", "◠"],
    ["⟨○○⟩", "◠"], ["⟨⟨○⟩⟩", "⟨◠⟩"], ["⟨○◠⟩", "⟨◠⟩"],
    ["⟨[◠ ◠]⟩", "⟨⟨◠⟩⟩"], [" \n< ◠ >\t", "⟨◠⟩"],
    ["0", "○"], ["<◠0>", "⟨◠○⟩"], ["[□ : ◠ ... ⟨◠⟩ : □]", "⟨◠○⟩"],
  ];
  for (const [source, expected] of examples) {
    assert.equal(compact(formatWholeUFN(compute(source).value)), expected, source);
  }
});

test("factor positions beyond 32 work through the last supported position", () => {
  for (const [position, number] of [[32, 131], [33, 137], [2000, 17389]]) {
    const dense = "⟨◠" + "○".repeat(position - 1) + "⟩";
    assert.equal(compact(encodeInteger(number)), dense);
    assert.equal(compute(dense).value[0], number);
    assert.equal(compute("⟨◠⟩⌊" + encodeInteger(position) + "⌋").value[0], number);
    assert.equal(compute("*" + dense).value[0], position);
  }
  assert.throws(() => encodeInteger(17393), /Factor position/);
  assert.throws(() => compute("⟨◠" + "○".repeat(2000) + "⟩"), /Factor position/);
  assert.throws(() => compute("⟨⟩⌊" + encodeInteger(2001) + "⌋"), /Factor position/);
});

test("* finds unique factor positions by value and composes with other expressions", () => {
  const examples = [
    ["*⟨◠⟩", 1], ["*⟨◠○⟩", 2], ["*⟨◠○○⟩", 3],
    ["* <◠00>", 3], ["*[⟨◠⟩ ◠]", 2], ["*{⟨◠⟩ ⟨◠○⟩ | ⟨◠⟩}", 2],
    ["**⟨◠○○⟩", 2], ["***⟨◠○○⟩", 1],
    ["[*⟨◠⟩ *⟨◠○⟩]", 3], ["{*⟨◠○⟩ ⟨◠○○⟩}", 10],
    ["⟨*⟨◠○⟩⟩", 4], ["⟨◠⟩⌊*⟨◠○○⟩⌋", 5],
    ["[□ : ◠ … ⟨◠○⟩ : *⟨◠⟩⌊□⌋]", 6],
    ["[□ : ⟨◠⟩ … ⟨◠○⟩ : *□]", 3],
  ];
  for (const [source, expected] of examples) {
    assert.deepEqual(compute(source).value, [expected, 0, 0, 0], source);
  }
});

test("* includes lower attachments while powers and directions apply to its answer", () => {
  assert.deepEqual(compute("*⟨◠⟩⌊⟨◠○⟩⌋").value, [3, 0, 0, 0]);
  assert.deepEqual(compute("*⟨◠○⟩⌈⟨◠⟩⌉").value, [4, 0, 0, 0]);
  assert.deepEqual(compute("*⟨◠○⟩@◠").value, [0, 2, 0, 0]);
  assert.deepEqual(compute("◠@*⟨◠○⟩").value, [0, 0, 1, 0]);
  assert.deepEqual(compute("*[⟨◠○⟩⌈◠⌉]").value, [2, 0, 0, 0]);
  assert.throws(() => compute("*[⟨◠○⟩⌈⟨◠⟩⌉]"), /\* requires a unique factor/);
  assert.throws(() => compute("*[⟨◠○⟩@◠]"), /original path/);
});

test("index(expression) remains an input alias for *[expression]", () => {
  for (const source of ["⟨◠⟩", "⟨◠○⟩", "[⟨◠⟩ ◠]", "⟨◠⟩⌊⟨◠○⟩⌋",
    "⟨◠○⟩⌈◠⌉", "⟨◠○⟩@○", "index(⟨◠○○⟩)", "*⟨◠○○⟩"]) {
    assert.deepEqual(compute("index(" + source + ")").value, compute("*[" + source + "]").value, source);
  }
  assert.deepEqual(compute("index(⟨◠○⟩)⌈⟨◠⟩⌉").value, [4, 0, 0, 0]);
  assert.throws(() => compute("index(⟨◠○⟩⌈⟨◠⟩⌉)"), /\* requires a unique factor/);
});

test("* rejects inputs without a unique factor position", () => {
  for (const source of ["○", "◠", "◡", "⟨⟨◠⟩⟩", "⟨◠◠⟩", "⟨◡⟩", "⟨⟨◡⟩⟩", "[◠@◠]"]) {
    assert.throws(() => compute("*" + source), UFNError, source);
  }
});

test("malformed text is rejected without damaging later evaluations", () => {
  const invalid = [
    "", " ", "<", ">", "<<", ">>", "⟨◠", "◠⟩", "⟨◠⟩⟩", "⟨◠⟩⟨◠⟩",
    "<>extra", "extra<>", "⟨x⟩", "⟨1⟩", "[◠}", "{◠]", "[◠|◠|◠]",
    "⟨\ufffd⟩", "⟨\ud800⟩", "⟨\udc00⟩", "⟨\0⟩", "[□ : ◠ … : ]",
    "{□ : ◠ … : }", "◠@◠@◠", "index()",
    "*", "**", "[*]", "*(⟨◠⟩)", "⟨◠⟩*", "⟨◠⟩*⟨◠○⟩", "*⟨◠⟩⌊⌋",
  ];
  const previous = compute("⟨◠○○◠⟩");
  for (const source of invalid) {
    assert.throws(() => compute(source), UFNError, source);
    assert.equal(compute("⟨◠○○◠⟩").value[0], 14);
  }
  assert.deepEqual(previous.value, [14, 0, 0, 0]);
  for (const source of [null, undefined, 2, {}, []]) {
    assert.throws(() => compute(source), { name: "UFNError", message: "Expression must be text" });
  }
});

test("fractions and roots are supported while undefined operations are rejected", () => {
  close(compute("⟨◡⟩").value, [0.5, 0, 0, 0], "half");
  close(compute("⟨◡○⟩").value, [1 / 3, 0, 0, 0], "third");
  close(compute("⟨⟨◡⟩⟩").value, [Math.sqrt(2), 0, 0, 0], "root");
  for (const source of ["{|○}", "{○ | ○}", "{○ {|○}}", "⟨⟩⌊○⌋", "⟨◠⟩⌊⟨◡⟩⌋",
    "⟨◠@◠⟩", "◡⌈◠⌉", "○⌈◠⌉", "[◠@◠]⌈◠⌉", "*⟨⟨◠⟩⟩", "◠@⟨⟨◠⟩⟩"]) {
    assert.throws(() => compute(source), UFNError, source);
  }
});

test("integer encoding rejects fractions and values outside safe integer precision", () => {
  for (const number of [NaN, Infinity, -Infinity, 0.5, -0.5, Number.MAX_SAFE_INTEGER + 1,
    Number.MIN_SAFE_INTEGER - 1, "2", null, undefined]) {
    assert.throws(() => encodeInteger(number), { name: "UFNError", message: /safe integer/ });
  }
  const large = 2 ** 52;
  assert.equal(compute(encodeInteger(large)).value[0], large);
  assert.equal(compute("⟨" + encodeInteger(1023) + "⟩").value[0], 2 ** 1023);
  const beyondDecimal = "⟨" + encodeInteger(1024) + "⟩";
  assert.equal(compute(beyondDecimal).canonical, beyondDecimal);
  assert.equal(compute(beyondDecimal).value[0], Infinity);
  const mixed = "⟨" + encodeInteger(1000) + encodeInteger(-1500) + "⟩";
  const expected = Math.exp(1000 * Math.log(3) - 1500 * Math.log(2));
  assert.ok(Math.abs(compute(mixed).value[0] / expected - 1) < 1e-12);
});

test("source length and nesting stop at the documented limits", () => {
  assert.equal(compute("○" + " ".repeat(11999)).value[0], 0);
  assert.throws(() => compute("○" + " ".repeat(12000)), /too long/);
  assert.equal(compute("[".repeat(63) + "◠" + "]".repeat(63)).value[0], 1);
  assert.throws(() => compute("[".repeat(64) + "◠" + "]".repeat(64)), /nested too deeply/);
  assert.doesNotThrow(() => new UFN.Parser("*".repeat(63) + "◠").parse());
  assert.throws(() => new UFN.Parser("*".repeat(64) + "◠").parse(), /nested too deeply/);
  assert.throws(() => compute("*".repeat(11999) + "◠"), { name: "UFNError", message: /nested too deeply/ });
});

test("range bounds, total visits, and partial sum lengths remain bounded", () => {
  assert.equal(compute("[□ : ○ … " + encodeInteger(1000) + " : ◠]").value[0], 1001);
  assert.throws(() => compute("[□ : ○ … " + encodeInteger(1001) + " : ◠]"), /Range end/);
  assert.throws(() => compute("[□ : ◡ … ◠ : ◠]"), /Range start/);
  const endpoint = encodeInteger(200);
  assert.throws(() => compute("[□ : ◠ … " + endpoint + " : [□⌊⟨◠⟩⌋ : ◠ … " + endpoint + " : ◠]]"),
    /Too many generated terms/);
  const single = compute("[□ : ○ … : ◠]", 1);
  const capped = compute("[□ : ○ … : ◠]", 501);
  assert.equal(single.value[0], 1);
  assert.equal(capped.value[0], 500);
  assert.equal(capped.iterations, 500);
  assert.equal(capped.partial, true);
  assert.equal(compute("[□ : ◠ … ⟨◠⟩ : □]").value[0], 3);
});

function close(actual, expected, label) {
  assert.equal(actual.length, expected.length);
  actual.forEach((value, i) => assert.ok(
    Math.abs(value - expected[i]) <= 1e-10 * Math.max(1, Math.abs(expected[i])),
    label + ": component " + i + " was " + value + ", expected " + expected[i]
  ));
}

test("generated sums and products have distinct operations", () => {
  close(compute("[□ : ◠ … [◠ ◠ ◠ ◠] : □]").value, [10, 0, 0, 0], "sum");
  close(compute("{□ : ◠ … [◠ ◠ ◠ ◠] : □}").value, [24, 0, 0, 0], "product");
  close(compute("[□ : ◠ … [◠ ◠ ◠] : [□ ◠]]").value, [9, 0, 0, 0], "changing recipe");
  close(compute("[□ : ◠ … [◠ ◠ ◠] : [◠ ◠]]").value, [6, 0, 0, 0], "fixed recipe");
});

test("bounds are inclusive and an empty range does not evaluate its body", () => {
  close(compute("[□ : ○ … ◠ : ◠]").value, [2, 0, 0, 0], "both endpoints");
  close(compute("[□ : ◠ … ○ : {|○}]").value, [0, 0, 0, 0], "empty sum");
  close(compute("{□ : ◠ … ○ : {|○}}").value, [1, 0, 0, 0], "empty product");
});

test("counter bounds read outer names before a new binding is introduced", () => {
  close(compute("[□ : ◠ … ⟨◠○⟩ : [□ : ◠ … □ : ◠]]").value, [6, 0, 0, 0], "shadowing");
  close(compute("[□ : ◠ … ⟨◠⟩ : [□⌊⟨◠⟩⌋ : ◠ … ⟨◠○⟩ : {□ □⌊⟨◠⟩⌋}]]").value,
    [18, 0, 0, 0], "different names");
  assert.throws(() => compute("□"), /Unbound counter/);
  assert.equal(compute("[□⌊[◠ ◠]⌋ : ◠ … ◠ : □⌊[◠ ◠]⌋]").canonical, "◠");
});

test("whole counts along @○ repeat a value; matching direction labels can turn it", () => {
  close(compute("{◠@◠ ⟨◠⟩@○}").value, [0, 2, 0, 0], "scaling along @○");
  close(compute("{◠@◠ ◠@◠}").value, [-1, 0, 0, 0], "two quarter turns");
  close(compute("{◠@◠ ◠@⟨◠⟩}").value, [0, 0, 0, 1], "ordered product");
  close(compute("{◠@⟨◠⟩ ◠@◠}").value, [0, 0, 0, -1], "reversed product");
  const turn = compute("{[◠@○ ◠@◠] | ⟨⟨◡⟩⟩}").value;
  assert.ok(turn[0] > 0 && turn[1] > 0);
  assert.ok(Math.abs(Math.hypot(...turn) - 1) < 1e-12, "a unit turn preserves total size");
});

test("an unbounded range remains a partial sum even when it appears settled", () => {
  const geometric = compute("[□ : ○ … : ⟨◡⟩⌈□⌉]", 8);
  assert.equal(geometric.partial, true);
  close(geometric.value, [2 - 1 / 128, 0, 0, 0], "eight terms");
  assert.equal(compute("[□ : ◠ … : ◠]", 8).partial, true);
  assert.throws(() => compute("[□ : ○ … : {|□}]"), /Division by zero/);
});

test("fractions reduce to canonical factor instructions with exact signs", () => {
  for (const [source, canonical] of [
    ["{|⟨◠⟩}", "⟨◡⟩"],
    ["{⟨◠⟩ | ⟨⟨◠⟩⟩}", "⟨◡⟩"],
    ["[⟨◡⟩ ⟨◡○⟩]", "⟨◠◡◡⟩"],
    ["[⟨◡⟩ | ⟨◡○⟩]", "⟨◡◡⟩"],
    ["[⟨◡○⟩ | ⟨◡⟩]", "[|⟨◡◡⟩]"],
    ["{◡ | ⟨◠○⟩}", "[|⟨◡○⟩]"],
  ]) {
    assert.equal(compute(source).canonical, canonical, source);
    assert.equal(compute(canonical).canonical, canonical);
  }
});

test("addition extracts common factors and gives fractions matching shares", () => {
  assert.equal(compute("[⟨◠⟨◠⟩⟩ ⟨⟨◠⟩◠⟩]").canonical, "⟨◠◠◠⟩");
  assert.equal(compute("[⟨◠⟨◠⟩⟩ | ⟨⟨◠⟩◠⟩]").canonical, "[|⟨◠◠⟩]");
  // Ten copies of three tenths give exactly the third whole count.
  assert.equal(compute("*[" + Array(10).fill("⟨◡◠◡⟩").join(" ") + "]").canonical, "⟨◠⟩");
});

test("roots combine, cancel, and normalize using rational factor instructions", () => {
  for (const [source, canonical] of [
    ["⟨◠⟩⌈⟨◡⟩⌉", "⟨⟨◡⟩⟩"],
    ["⟨⟨◠⟩⟩⌈⟨◡⟩⌉", "⟨◠⟩"],
    ["{⟨⟨◡⟩⟩ ⟨⟨◡⟩⟩}", "⟨◠⟩"],
    ["[⟨⟨◡⟩⟩ ⟨⟨◡⟩⟩]", "⟨⟨◠◡⟩⟩"],
    ["[⟨⟨◡⟩⟩ | ⟨⟨◡⟩⟩]", "○"],
  ]) assert.equal(compute(source).canonical, canonical, source);
});

test("fractional direction coefficients and ordered changes remain exact", () => {
  assert.equal(compute("[⟨◡⟩@◠ ⟨◡○⟩@◠]").canonical, "⟨◠◡◡⟩@◠");
  assert.equal(compute("{|[◠@○ ◠@◠]}").canonical, "[⟨◡⟩@○ [|⟨◡⟩]@◠]");
  assert.equal(compute("{⟨◡⟩@◠ ⟨◡○⟩@⟨◠⟩}").canonical, "⟨◡◡⟩@⟨◠○⟩");
  assert.equal(compute("{⟨◡○⟩@⟨◠⟩ ⟨◡⟩@◠}").canonical, "[|⟨◡◡⟩]@⟨◠○⟩");
});

test("large shared factors reduce without computing decimal magnitudes", () => {
  const exponent = encodeInteger(1023), enormous = "⟨" + exponent + "⟩";
  const oldPow = Math.pow, oldLog = Math.log;
  Math.pow = Math.log = () => { throw new Error("Decimal arithmetic was requested"); };
  try {
    assert.equal(compute("[" + enormous + " " + enormous + "]").canonical, "⟨" + encodeInteger(1024) + "⟩");
    const huge = "⟨" + encodeInteger(1000000) + "⟩";
    assert.equal(compute("[" + huge + " | " + huge + "]").canonical, "○");
    assert.equal(compute("{" + huge + " | " + huge + "}").canonical, "◠");
    assert.throws(() => compute(enormous).value, /Decimal arithmetic was requested/);
  } finally { Math.pow = oldPow; Math.log = oldLog; }
});

test("large intermediate counts cancel without losing their final step", () => {
  const large = "⟨" + encodeInteger(64) + "⟩";
  assert.equal(compute("[" + large + " | [" + large + " ◡]]").canonical, "◠");
  assert.equal(compute("[" + large + " | [" + large + " ◠]]").canonical, "◡");
});

test("large factorials have exact UFN results beyond the decimal range", () => {
  const result = compute("{□ : ◠ … " + encodeInteger(1000) + " : □}");
  assert.ok(result.canonical);
  assert.equal(compute(result.canonical).canonical, result.canonical);
  assert.equal(result.iterations, 1000);
  assert.equal(result.value[0], Infinity);
});

test("partial results and unreduced recipes never become claimed exact limits", () => {
  const partial = compute("[□ : ○ … : ⟨◡⟩⌈□⌉]", 3);
  assert.equal(partial.canonical, "⟨◠○○[|⟨◠⟩]⟩");
  assert.equal(partial.partial, true);
  const recipe = "[◠ ⟨⟨◡⟩⟩]";
  assert.equal(compute(recipe).canonical, null);
  assert.equal(compute(recipe).ufn, recipe);
  assert.equal(compute(recipe).value[0], 1 + Math.sqrt(2));
});

test("different root sums multiply out and cancel without decimal arithmetic", () => {
  const first = "⟨⟨◡⟩⟩", second = "⟨⟨◡⟩○⟩";
  const joined = "[" + first + " " + second + "]";
  const difference = "[" + first + " | " + second + "]";
  const oldPow = Math.pow, oldLog = Math.log;
  Math.pow = Math.log = () => { throw new Error("Decimal arithmetic was requested"); };
  try {
    assert.equal(compute("{" + joined + " " + difference + "}").canonical, "◡");
    assert.equal(compute("{" + joined + " " + difference + " " + first + "}").canonical, "[|" + first + "]");
    assert.equal(compute("[" + joined + "⌈⟨◠⟩⌉ | {⟨◠⟩ " + first + " " + second + "}]").canonical, "⟨◠○○⟩");
    assert.equal(compute("{" + joined + "@◠ " + difference + "@⟨◠⟩}").canonical, "◡@⟨◠○⟩");
    assert.equal(compute("{" + difference + "@⟨◠⟩ " + joined + "@◠}").canonical, "◠@⟨◠○⟩");
  } finally { Math.pow = oldPow; Math.log = oldLog; }
});

test("root groups match across whole factors and backward fractional instructions", () => {
  assert.equal(compute("[[◠ ⟨⟨◡⟩⟩] | [◠ {⟨◠⟩ ⟨[|⟨◡⟩]⟩}]]").canonical, "○");
  const cubeRoot = "⟨⟨◡○⟩⟩", squaredRoot = "⟨⟨◡◠⟩⟩";
  const source = "{[" + cubeRoot + " ◠] [" + squaredRoot + " ◠ | " + cubeRoot + "]}";
  assert.equal(compute(source).canonical, "⟨◠○⟩");
  assert.equal(compute("{" + source + " " + cubeRoot + "}").canonical, "⟨◠⟨◡○⟩⟩");
  assert.equal(compute("[[◠ " + cubeRoot + "] | [◠ {⟨◠⟩ ⟨[|⟨◡◠⟩]⟩}]]").canonical, "○");
});

test("root expressions retain recipes when reduction cannot finish", () => {
  const root = "⟨⟨◡⟩⟩", joined = "[◠ " + root + "]";
  for (const source of [joined, "{|" + joined + "}", joined + "⌈⟨◡⟩⌉", "[" + root + " | ◠]⌈⟨◠⟩⌉"]) {
    const result = compute(source);
    assert.equal(result.canonical, null, source);
    assert.equal(result.ufn, source);
    assert.ok(Number.isFinite(result.value[0]), source);
  }
  assert.throws(() => compute("{|[" + joined + " | " + joined + "]}"), /Division by zero/);
  assert.equal(compute("[{" + joined + " | ⟨◠⟩} | ⟨◡⟩]").canonical, "⟨[|⟨◡⟩]⟩");
});

test("root expansion limits preserve recipes and allow later calculations", () => {
  const roots = Array.from({ length: 65 }, (_, i) => "⟨⟨◡⟩⟩⌊" + encodeInteger(i + 1) + "⌋");
  const wideSum = "[" + roots.join(" ") + "]";
  const seventeen = "[" + roots.slice(0, 17).join(" ") + "]";
  for (const source of [wideSum, "{" + seventeen + " " + seventeen + "}"]) {
    const result = compute(source);
    assert.equal(result.canonical, null);
    assert.equal(result.ufn, source);
    assert.match(result.reason, /Too many.*root/);
  }
  assert.equal(compute("{[◠ ⟨⟨◡⟩⟩] [◠ | ⟨⟨◡⟩⟩]}").canonical, "◡");
});
