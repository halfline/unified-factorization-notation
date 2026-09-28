import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import tooltips from "../src/number-tooltips.js";
import UFN from "../src/ufn.js";

test("tooltips keep recursive numbers and their position attachments together", () => {
  const source = "⟨⟨◡⟩⟩ = ⟨◠⟩⌈⟨◡⟩⌉; ⟨◠⟩ ⌊ ⟨◠○○⟩ ⌋";
  const tokens = tooltips.tokens(source);
  assert.deepEqual(tokens.map(token => token.source), ["⟨⟨◡⟩⟩", "⟨◠⟩", "⟨◡⟩", "⟨◠⟩ ⌊ ⟨◠○○⟩ ⌋"]);
  for (const token of tokens) assert.equal(source.slice(token.start, token.end), token.source);
  assert.equal(tooltips.describe(tokens[0]).title, "Decimal ≈ 1.41421356237");
  assert.equal(tooltips.describe(tokens[3]).title, "Decimal ≈ 11");
  const sparse = "⟨◠⟩⌊⟨⟨◠○⟩○⟨⟨◠⟩⟩⟩⌋";
  assert.equal(tooltips.describe(tooltips.tokens(sparse)[0]).title, "Decimal ≈ 17389");
});

test("tooltips distinguish label numbers and cannot assign a value to a free counter", () => {
  const [direction, counter, dependent] = tooltips.tokens("@⟨◠⟩ □⌊⟨◠○⟩⌋ ⟨□⟩");
  assert.match(tooltips.describe(direction).title, /^Direction label.*2$/u);
  assert.match(tooltips.describe(counter).note, /not its current value/u);
  assert.equal(tooltips.describe(dependent).title, "Decimal preview unavailable");
  assert.doesNotThrow(() => tooltips.tokens("⟨broken ⟨◠⟩"));
  for (const expression of ["(◠ ○)⌊◠⌋", "□⌊◠⌋⌊⟨◠⟩⌋"])
    assert.match(tooltips.describe(tooltips.tokens(expression).at(-1)).note, /Count entries from the right/);
});

test("constant tooltips recognize the complete recipes, including inside other expressions", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const { e, turn } = tooltips.constants;
  for (const constant of [e, turn]) {
    assert.ok(html.includes(constant.source), "constant must match a taught recipe");
  }
  const expression = `[${e.source}@○]⌈${turn.source}@◠⌉`;
  assert.deepEqual(tooltips.tokens(expression).filter(token => token.constant).map(token => token.constant), ["e", "turn"]);
  assert.equal(tooltips.tokens(e.source.replaceAll(" ", "\n  "))[0].constant, "e");
  assert.match(tooltips.describe(tooltips.tokens(e.source)[0]).title, /e.*2\.71828182846/u);
  assert.match(tooltips.describe(tooltips.tokens(turn.source)[0]).title, /turn.*6\.28318530718/u);
  assert.match(tooltips.describe(tooltips.tokens(turn.source)[0]).note, /limit.*partial sum/u);
  const finite = turn.source.replace("○ … :", "○ … ⟨◠⟩ :");
  assert.ok(tooltips.tokens(finite).every(token => !token.constant));
  const partial = UFN.compute(turn.source, 3);
  assert.ok(partial.partial);
  assert.ok(tooltips.tokens(partial.display).every(token => !token.constant));
});

test("decimal overflow and underflow do not become misleading numeric tooltips", () => {
  const large = UFN.encodeInteger(2000);
  assert.match(tooltips.describe(tooltips.tokens(`⟨${large}⟩`)[0]).title, /range/u);
  const tiny = tooltips.describe(tooltips.tokens(`⟨[|${large}]⟩`)[0]);
  assert.match(tiny.title, /Too small/u);
  assert.match(tiny.note, /not zero/u);
});

test("basic marks get readings without splitting joined angle numbers", () => {
  const readings = tooltips.tokens("○ ◠ ◡ ⟨◠◡⟩");
  assert.deepEqual(readings.map(token => token.source), ["○", "◠", "◡", "⟨◠◡⟩"]);
  for (const [index, value] of ["0", "1", "-1"].entries()) {
    assert.equal(tooltips.describe(readings[index]).title, "Decimal ≈ " + value);
  }
  assert.match(tooltips.describe(readings[0]).note, /No change/);
  assert.match(tooltips.describe(readings[1]).note, /forward step/);
  assert.match(tooltips.describe(readings[2]).note, /backward step/);
  const labels = tooltips.tokens("@○ #◠ □⌊◠⌋ [□ : ○ … : □]⌊◠⌋");
  assert.equal(labels[0].context, "Direction label");
  assert.equal(labels[1].context, "Direction label");
  assert.equal(labels[2].context, "Counter label");
  assert.equal(labels.at(-1).context, "Measuring place");
});
