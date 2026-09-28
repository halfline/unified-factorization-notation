import assert from "node:assert/strict";
import test from "node:test";
import counts from "../src/string-arithmetic.js";

// Native BigInt is an independent test oracle only, never a runtime backend.
const spell = n => (n < 0n ? "◡" : "") + (n < 0n ? -n : n).toString(2).replace(/0/g, "○").replace(/1/g, "◠");

test("step-string carries, borrows, signs, products, and division agree with integer arithmetic", () => {
  for (let a = -35n; a <= 35n; a++) {
    for (let b = -35n; b <= 35n; b++) {
      const left = spell(a), right = spell(b);
      assert.equal(counts.add(left, right), spell(a + b));
      assert.equal(counts.sub(left, right), spell(a - b));
      assert.equal(counts.mul(left, right), spell(a * b));
      if (a >= 0n && b > 0n) {
        assert.deepEqual(counts.divmod(left, right), { quotient: spell(a / b), remainder: spell(a % b) });
      }
    }
  }
});

test("long counts retain carries and division remainders beyond native precision", () => {
  const examples = [
    [(1n << 256n) - 1n, 1n],
    [(1n << 384n) + (1n << 131n) + 59n, (1n << 127n) + 21n],
    [(1n << 257n) - 9n, (1n << 64n) + 3n],
  ];
  for (const [a, b] of examples) {
    assert.equal(counts.add(spell(a), spell(b)), spell(a + b));
    assert.equal(counts.sub(spell(a), spell(b)), spell(a - b));
    assert.equal(counts.mul(spell(a), spell(b)), spell(a * b));
    assert.deepEqual(counts.divmod(spell(a), spell(b)), { quotient: spell(a / b), remainder: spell(a % b) });
  }
  assert.equal(counts.pow(spell(3n), spell(80n)), spell(3n ** 80n));
  assert.equal(counts.gcd(spell(3n ** 80n * 5n), spell(3n ** 60n * 7n)), spell(3n ** 60n));
});

test("count arithmetic has bounded work and recovers after reaching a limit", () => {
  assert.throws(() => counts.withBudget(1, () => counts.add(spell(255n), spell(1n))), counts.Limit);
  assert.equal(counts.add(spell(255n), spell(1n)), spell(256n));
  assert.throws(() => counts.pow(spell(2n), spell(BigInt(counts.MAX_DIGITS))), counts.Limit);
  assert.throws(() => counts.divmod(spell(1n), spell(0n)), /zero/);
});
