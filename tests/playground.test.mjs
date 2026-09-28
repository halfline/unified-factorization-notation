import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import UFN from "../src/ufn.js";
import library from "../src/library.js";

const { compute } = UFN;
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

function close(actual, expected, label) {
  assert.equal(actual.length, expected.length);
  actual.forEach((value, i) => Array.isArray(value) ? close(value, expected[i], label) : assert.ok(
    Math.abs(value - expected[i]) <= 1e-10 * Math.max(1, Math.abs(expected[i])),
    label + ": component " + i + " was " + value + ", expected " + expected[i]
  ));
}

test("every worked lesson identity has matching values", () => {
  const identities = [...html.matchAll(/<code data-equality>(.*?)<\/code>/gs)];
  assert.ok(identities.length > 0, "worked identities must remain discoverable");
  for (const [, identity] of identities) {
    const [left, right] = identity.split(" = ");
    assert.ok(left && right, identity);
    const lhs = compute(left), rhs = compute(right);
    assert.equal(lhs.partial || rhs.partial, false, identity + " must be finite");
    close(lhs.value, rhs.value, identity);
  }
});

test("every example button loads a complete evaluable expression", () => {
  for (const [button] of html.matchAll(/<button\b[^>]*data-example="[^"]+"[^>]*>/g)) {
    const expression = button.match(/data-example="([^"]+)"/)[1];
    const ids = button.match(/data-definitions="([^"]+)"/)?.[1];
    const declarations = ids ? library.declarations(ids.split(" ")) : "";
    assert.doesNotThrow(() => compute(declarations + expression), expression);
  }
});
