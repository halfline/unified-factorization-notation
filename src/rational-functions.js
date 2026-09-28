(function (root) {
  "use strict";

  // One symbolic variable over an exact coefficient field. Coefficients may
  // themselves be rational functions in an enclosing counter. Native numbers
  // here count polynomial places; they never hold an arithmetic coefficient.
  function create(coefficients, limits = {}) {
    const C = coefficients;
    const MAX_DEGREE = limits.degree ?? 24;
    const Limit = limits.Limit || Error;
    const divisionByZero = limits.divisionByZero || (() => new RangeError("Division by zero"));
    const zero = C.zero, one = C.one;
    const minus = (a, b) => C.add(a, C.neg(b));
    const divide = (a, b) => C.mul(a, C.inv(b));
    const trim = p => {
      p = p.slice();
      while (p.length > 1 && C.isZero(p.at(-1))) p.pop();
      if (p.length > MAX_DEGREE + 1) throw new Limit("The symbolic polynomial is too large to reduce");
      return p;
    };
    const pZero = p => p.length === 1 && C.isZero(p[0]);
    const pAdd = (a, b) => trim(Array.from({ length: Math.max(a.length, b.length) },
      (_, i) => C.add(a[i] || zero, b[i] || zero)));
    const pNeg = a => a.map(C.neg);
    const pSub = (a, b) => pAdd(a, pNeg(b));
    function pMul(a, b) {
      if (pZero(a) || pZero(b)) return [zero];
      if (a.length + b.length - 2 > MAX_DEGREE)
        throw new Limit("The symbolic polynomial is too large to reduce");
      const out = Array(a.length + b.length - 1).fill(zero);
      a.forEach((x, i) => b.forEach((y, j) => { out[i + j] = C.add(out[i + j], C.mul(x, y)); }));
      return trim(out);
    }
    const pScale = (p, scale) => trim(p.map(value => C.mul(value, scale)));
    function pDivmod(a, b) {
      if (pZero(b)) throw divisionByZero();
      const quotient = Array(Math.max(1, a.length - b.length + 1)).fill(zero);
      let remainder = a.slice();
      while (!pZero(remainder) && remainder.length >= b.length) {
        const offset = remainder.length - b.length;
        const factor = divide(remainder.at(-1), b.at(-1));
        quotient[offset] = factor;
        remainder = pSub(remainder, [...Array(offset).fill(zero), ...pScale(b, factor)]);
      }
      return { quotient: trim(quotient), remainder };
    }
    function pGcd(a, b) {
      while (!pZero(b)) [a, b] = [b, pDivmod(a, b).remainder];
      return pZero(a) ? [one] : pScale(a, C.inv(a.at(-1)));
    }
    function fraction(n, d = [one]) {
      n = trim(n); d = trim(d);
      if (pZero(d)) throw divisionByZero();
      if (pZero(n)) return { n: [zero], d: [one] };
      if (d.length > 1) {
        const common = pGcd(n, d);
        if (common.length > 1) {
          n = pDivmod(n, common).quotient;
          d = pDivmod(d, common).quotient;
        }
      }
      const scale = C.inv(d.at(-1));
      return { n: pScale(n, scale), d: pScale(d, scale) };
    }
    const constant = value => ({ n: [value], d: [one] });
    const isZero = value => pZero(value.n);
    const neg = value => ({ n: pNeg(value.n), d: value.d });
    function add(a, b) {
      const common = pGcd(a.d, b.d);
      const left = pDivmod(a.d, common).quotient, right = pDivmod(b.d, common).quotient;
      return fraction(pAdd(pMul(a.n, right), pMul(b.n, left)), pMul(a.d, right));
    }
    function mul(a, b) {
      // Cancel across the two fractions before expanding their polynomials.
      const first = pGcd(a.n, b.d), second = pGcd(b.n, a.d);
      return fraction(pMul(pDivmod(a.n, first).quotient, pDivmod(b.n, second).quotient),
        pMul(pDivmod(a.d, second).quotient, pDivmod(b.d, first).quotient));
    }
    function inv(value) {
      if (isZero(value)) throw divisionByZero();
      return fraction(value.d, value.n);
    }
    const div = (a, b) => mul(a, inv(b));
    function pow(value, count) {
      if (!Number.isInteger(count) || Math.abs(count) > MAX_DEGREE)
        throw new Limit("The symbolic power is outside the reduction limit");
      let result = constant(one), base = count < 0 ? inv(value) : value;
      for (let n = Math.abs(count); n; n = Math.floor(n / 2)) {
        if (n % 2) result = mul(result, base);
        if (n > 1) base = mul(base, base);
      }
      return result;
    }
    const variable = { n: [zero, one], d: [one] };
    function pAt(p, value) {
      return p.reduceRight((total, coefficient) => add(mul(total, value), constant(coefficient)), constant(zero));
    }
    const at = (value, point) => div(pAt(value.n, point), pAt(value.d, point));
    const shift = (value, amount) => at(value, add(variable, constant(amount)));
    const constantValue = value => value.n.length === 1 && value.d.length === 1
      ? divide(value.n[0], value.d[0]) : null;
    const polynomial = value => value.d.length === 1 ? pScale(value.n, C.inv(value.d[0])) : null;

    // For a polynomial P, construct A with A(n) - A(n-1) = P(n).
    // Remove one leading term at a time. This is exact coefficient algebra,
    // not interpolation from a finite selection of sampled function values.
    function polynomialAntidifference(p) {
      let rest = trim(p), answer = constant(zero);
      while (!pZero(rest)) {
        const degree = rest.length;
        const coefficient = divide(rest.at(-1), C.fromInteger(degree));
        const term = { n: [...Array(degree).fill(zero), coefficient], d: [one] };
        answer = add(answer, term);
        const difference = add(term, neg(shift(term, C.neg(one))));
        rest = pSub(rest, polynomial(difference));
      }
      return answer;
    }
    function sumPolynomial(value, lower, upper) {
      const p = polynomial(value);
      if (!p) return null;
      const primitive = polynomialAntidifference(p);
      return add(at(primitive, constant(upper)), neg(at(primitive, constant(C.add(lower, C.neg(one))))));
    }

    function solve(columns, target, nonzero = false) {
      const rows = Math.max(target.length, ...columns.map(column => column.length));
      const matrix = Array.from({ length: rows }, (_, r) => [...columns.map(column => column[r] || zero), target[r] || zero]);
      const pivots = [];
      let next = 0;
      for (let col = 0; col < columns.length && next < rows; col++) {
        const pivot = matrix.findIndex((row, index) => index >= next && !C.isZero(row[col]));
        if (pivot < 0) continue;
        [matrix[pivot], matrix[next]] = [matrix[next], matrix[pivot]];
        const scale = C.inv(matrix[next][col]);
        matrix[next] = matrix[next].map(entry => C.mul(entry, scale));
        for (let r = 0; r < rows; r++) if (r !== next && !C.isZero(matrix[r][col])) {
          const factor = matrix[r][col];
          matrix[r] = matrix[r].map((entry, c) => minus(entry, C.mul(factor, matrix[next][c])));
        }
        pivots.push([next++, col]);
      }
      if (matrix.some(row => row.slice(0, -1).every(C.isZero) && !C.isZero(row.at(-1)))) return null;
      const answer = Array(columns.length).fill(zero);
      for (const [row, col] of pivots) answer[col] = matrix[row].at(-1);
      if (nonzero) {
        const used = new Set(pivots.map(([, col]) => col));
        const free = answer.findIndex((_, col) => !used.has(col));
        if (free < 0) return null;
        answer[free] = one;
        for (const [row, col] of pivots) answer[col] = C.neg(matrix[row][free]);
      }
      return trim(answer);
    }
    function antidifference(value) {
      const p = polynomial(value);
      if (p) return polynomialAntidifference(p);
      // Try A(n) = P(n)/D(n), beginning with the input denominator.
      // A gap between shifted factors can hide intermediate denominators:
      // 1/n - 1/(n+2), for example, also needs a share involving n+1.
      const shifted = offset => shift({ n: value.d, d: [one] }, C.fromInteger(-offset)).n;
      let denominator = value.d, gap = null;
      for (let offset = 0; offset < (gap ?? 1); offset++) {
        if (offset) {
          const next = shifted(offset);
          denominator = pMul(pDivmod(denominator, pGcd(denominator, next)).quotient, next);
        }
        const previous = shift({ n: denominator, d: [one] }, C.neg(one)).n;
        const degree = Math.max(denominator.length - 1, value.n.length + denominator.length - value.d.length);
        if (degree + denominator.length - 1 > MAX_DEGREE) return null;
        const target = pMul(pMul(value.n, pDivmod(denominator, value.d).quotient), previous);
        const columns = Array.from({ length: degree + 1 }, (_, i) => {
          const term = { n: [...Array(i).fill(zero), one], d: [one] };
          return pSub(pMul(term.n, previous), pMul(shift(term, C.neg(one)).n, denominator));
        });
        const numerator = solve(columns, target);
        if (numerator) {
          const candidate = fraction(numerator, denominator);
          const difference = add(candidate, neg(shift(candidate, C.neg(one))));
          if (isZero(add(difference, neg(value)))) return candidate;
        }
        if (gap === null) {
          gap = 1;
          // Only fill a gap when exact polynomial GCFs find shifted factors.
          // This avoids expanding unrelated denominators in unknown series.
          for (let distance = 2; distance <= 8; distance++)
            if (pGcd(value.d, shifted(distance)).length > 1) gap = distance;
        }
      }
      return null;
    }
    function antiproduct(value) {
      // A rational A(n)/A(n-1) approaches one at ordinary infinity. Compare
      // coefficients to find its possible degree, then solve for A exactly.
      if (value.n.length !== value.d.length || !C.isZero(minus(value.n.at(-1), value.d.at(-1)))) return null;
      if (value.d.length === 1) return constant(one);
      const growth = divide(minus(value.n.at(-2), value.d.at(-2)), value.d.at(-1));
      let degreeChange = null;
      for (let degree = -MAX_DEGREE; degree <= MAX_DEGREE; degree++) {
        if (C.isZero(minus(growth, C.fromInteger(degree)))) { degreeChange = degree; break; }
      }
      if (degreeChange === null) return null;
      let denominator = [one];
      for (let offset = 0; offset < 8; offset++) {
        const shifted = shift({ n: value.d, d: [one] }, C.fromInteger(-offset)).n;
        denominator = pMul(pDivmod(denominator, pGcd(denominator, shifted)).quotient, shifted);
        const degree = denominator.length - 1 + degreeChange;
        if (degree < 0) continue;
        if (degree + denominator.length + value.d.length - 2 > MAX_DEGREE) return null;
        const previous = shift({ n: denominator, d: [one] }, C.neg(one)).n;
        const columns = Array.from({ length: degree + 1 }, (_, i) => {
          const term = { n: [...Array(i).fill(zero), one], d: [one] };
          return pSub(pMul(pMul(term.n, previous), value.d), pMul(pMul(shift(term, C.neg(one)).n, denominator), value.n));
        });
        const numerator = solve(columns, [zero], true);
        if (!numerator) continue;
        const candidate = fraction(numerator, denominator);
        const ratio = div(candidate, shift(candidate, C.neg(one)));
        if (isZero(add(ratio, neg(value)))) return candidate;
      }
      return null;
    }
    return {
      zero: constant(zero), one: constant(one), fromInteger: n => constant(C.fromInteger(n)),
      constant, variable, fraction, isZero, neg, add, mul, inv, div, pow, at, shift,
      constantValue, polynomial, antidifference, antiproduct, sumPolynomial,
      equal: (a, b) => isZero(add(a, neg(b))),
    };
  }

  const api = { create };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.UFNRationalFunctions = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
