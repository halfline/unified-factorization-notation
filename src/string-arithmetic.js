(function (root) {
  "use strict";

  // Private place-value strings, built from empty/forward marks. These are
  // working counts, not an alternative public UFN spelling. No native numeric
  // type stores a count: addition carries marks, division takes shifted counts.
  const ZERO = "○", ONE = "◠", BACK = "◡";
  const MAX_DIGITS = 16384;
  class Limit extends Error {}
  let remaining = Infinity;
  function spend(work = 1) {
    remaining -= work;
    if (remaining < 0) throw new Limit("String arithmetic work limit reached");
  }
  function bounded(text) {
    if (text.length > MAX_DIGITS) throw new Limit("String arithmetic size limit reached");
    return text;
  }
  const trim = text => text.replace(/^○+/u, "") || ZERO;
  const negative = text => text.startsWith(BACK);
  const abs = text => negative(text) ? text.slice(1) : text;
  const neg = text => text === ZERO ? ZERO : negative(text) ? text.slice(1) : BACK + text;
  function compare(a, b) {
    if (a.length !== b.length) return a.length < b.length ? -1 : 1;
    return a === b ? 0 : a < b ? -1 : 1;
  }
  function addUnsigned(a, b) {
    if (a === ZERO) return b;
    if (b === ZERO) return a;
    spend(Math.max(a.length, b.length));
    const out = [];
    let carry = false;
    for (let i = a.length - 1, j = b.length - 1; i >= 0 || j >= 0 || carry; i--, j--) {
      const left = a[i] === ONE, right = b[j] === ONE;
      out.push((left !== right) !== carry ? ONE : ZERO);
      carry = left && right || carry && (left || right);
    }
    return bounded(out.reverse().join(""));
  }
  function subtractUnsigned(a, b) {
    if (b === ZERO) return a;
    if (compare(a, b) < 0) throw new RangeError("Negative unsigned difference");
    spend(a.length);
    const out = [];
    let borrow = false;
    for (let i = a.length - 1, j = b.length - 1; i >= 0; i--, j--) {
      const left = a[i] === ONE, right = b[j] === ONE;
      out.push((left !== right) !== borrow ? ONE : ZERO);
      borrow = !left && (right || borrow) || right && borrow;
    }
    return trim(out.reverse().join(""));
  }
  function add(a, b) {
    if (negative(a) === negative(b)) {
      const sum = addUnsigned(abs(a), abs(b));
      return negative(a) ? neg(sum) : sum;
    }
    const order = compare(abs(a), abs(b));
    const difference = order < 0 ? subtractUnsigned(abs(b), abs(a)) : subtractUnsigned(abs(a), abs(b));
    return (order < 0 ? negative(b) : negative(a)) ? neg(difference) : difference;
  }
  const sub = (a, b) => add(a, neg(b));
  function multiplyUnsigned(a, b) {
    if (a === ZERO || b === ZERO) return ZERO;
    if (/^◠○*$/u.test(a)) return bounded(b + ZERO.repeat(a.length - 1));
    if (/^◠○*$/u.test(b)) return bounded(a + ZERO.repeat(b.length - 1));
    if (a.length < b.length) [a, b] = [b, a];
    let result = ZERO;
    for (let i = b.length - 1; i >= 0; i--) {
      spend();
      if (b[i] === ONE) result = addUnsigned(result, bounded(a + ZERO.repeat(b.length - 1 - i)));
    }
    return result;
  }
  function mul(a, b) {
    const value = multiplyUnsigned(abs(a), abs(b));
    return negative(a) !== negative(b) ? neg(value) : value;
  }
  function divmod(a, b) {
    if (b === ZERO) throw new RangeError("Division by zero");
    if (b === ONE) return { quotient: a, remainder: ZERO };
    if (compare(a, b) < 0) return { quotient: ZERO, remainder: a };
    if (/^◠○*$/u.test(b)) {
      const places = b.length - 1;
      return { quotient: a.slice(0, -places), remainder: trim(a.slice(-places)) };
    }
    let remainder = ZERO;
    const quotient = [];
    for (const digit of a) {
      spend();
      remainder = trim(remainder + digit);
      if (compare(remainder, b) >= 0) {
        remainder = subtractUnsigned(remainder, b);
        quotient.push(ONE);
      } else quotient.push(ZERO);
    }
    return { quotient: trim(quotient.join("")), remainder };
  }
  function divExact(a, b) {
    const { quotient, remainder } = divmod(abs(a), abs(b));
    if (remainder !== ZERO) throw new RangeError("Inexact count division");
    return negative(a) !== negative(b) ? neg(quotient) : quotient;
  }
  function gcd(a, b) {
    a = abs(a); b = abs(b);
    while (b !== ZERO) [a, b] = [b, divmod(a, b).remainder];
    return a;
  }
  function pow(base, exponent) {
    let result = ONE;
    while (exponent !== ZERO) {
      spend();
      if (exponent.endsWith(ONE)) result = mul(result, base);
      exponent = exponent.slice(0, -1) || ZERO;
      if (exponent !== ZERO) base = mul(base, base);
    }
    return result;
  }
  // Native numbers enter only at API/UI boundaries or for bounded positions.
  function fromNumber(n) {
    if (!Number.isSafeInteger(n)) throw new RangeError("Count must be a safe integer");
    const digits = Math.abs(n).toString(2).replace(/0/g, ZERO).replace(/1/g, ONE);
    return n < 0 ? neg(digits) : digits;
  }
  function toNumber(n) {
    const digits = abs(n);
    const leading = digits.slice(0, 53).replace(/○/g, "0").replace(/◠/g, "1");
    const value = parseInt(leading, 2) * 2 ** Math.max(0, digits.length - 53);
    return negative(n) ? -value : value;
  }
  function withBudget(work, callback) {
    const previous = remaining;
    remaining = work;
    try { return callback(); }
    finally { remaining = previous; }
  }
  const api = { ZERO, ONE, MAX_DIGITS, Limit, abs, neg, negative, compare, add, sub, mul,
    divmod, divExact, gcd, pow, fromNumber, toNumber, withBudget };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.UFNStrings = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
