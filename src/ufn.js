(function (root) {
  "use strict";

  const counts = typeof module !== "undefined" && module.exports ? require("./string-arithmetic.js") : root.UFNStrings;
  const rationalFunctions = typeof module !== "undefined" && module.exports ? require("./rational-functions.js") : root.UFNRationalFunctions;
  const definitions = typeof module !== "undefined" && module.exports ? require("./definitions.js") : root.UFNDefinitions;

  const MAX_DEPTH = 64;
  const MAX_SOURCE = 12000;
  const MAX_POSITION = 2000;
  const MAX_RANGE = 1000;
  const MAX_ROOT_TERMS = 64;
  const MAX_ROOT_PAIRS = 256;
  const nameStops = new Set("○◠◡⟳┌┘[]{}()⟨⟩⌊⌋⌈⌉⟦⟧⟪⟫:@#|*…≔=<>".split(""));
  const nameCharacter = char => !!char && !/\s|\p{N}/u.test(char) && !nameStops.has(char);
  const isCounterNode = node => typeof node?.name === "string" && Object.hasOwn(node, "label");
  const writtenCounterName = counter => counter.name;
  const constants = Object.freeze({
    e: Object.freeze({
      symbol: "┌┘",
      description: "the complete exponential constant",
      source: "[□ : ○ … : {|{□⌊⟨◠⟩⌋ : ◠ … □ : □⌊⟨◠⟩⌋}}]",
    }),
    turn: Object.freeze({
      symbol: "⟳",
      description: "the complete amount of a turn",
      source: "[□ : ○ … : {⟨⟨⟨◠⟩⟩⟩ | [{⟨⟨◠⟩⟩ □} ◠] [{⟨⟨◠⟩⟩ □} ⟨◠○⟩]}]",
    }),
  });

  class UFNError extends Error {
    constructor(message, position) {
      super(message);
      this.name = "UFNError";
      this.position = position;
    }
  }

  function normalizeSource(source) {
    if (typeof source !== "string") throw new UFNError("Expression must be text");
    return source.replace(/</g, "⟨").replace(/>/g, "⟩").replace(/\.\.\./g, "…").replace(/0/g, "○");
  }

  class Parser {
    constructor(source) {
      this.source = normalizeSource(source);
      this.at = 0;
      this.depth = 0;
      this.language = new definitions.Language({ Error: UFNError, constants, maxDepth: MAX_DEPTH, key: counterName });
      if (this.source.length > MAX_SOURCE) throw new UFNError("Expression is too long", 0);
    }
    skip() { while (/\s/u.test(this.source[this.at] || "")) this.at++; }
    peek() { this.skip(); return this.source[this.at] || ""; }
    take(char) {
      if (this.peek() === char) { this.at++; return true; }
      return false;
    }
    need(char) {
      if (!this.take(char)) throw new UFNError(`Expected ${char || "expression"}`, this.at);
    }
    parse() {
      if (!this.peek()) throw new UFNError("Enter a UFN expression", 0);
      while (this.peek() === "≔") this.language.read(this);
      this.expressionStart = this.at;
      const raw = this.peek() ? this.expression() : { type: "declarations", count: this.language.count };
      const ast = this.language.count ? this.language.expand(raw) : raw;
      if (this.peek()) throw new UFNError(`Unexpected ${this.peek()}`, this.at);
      // Chained attachments build a deep tree without recursive parsing.
      // Check the completed tree too, before any evaluator walks it.
      const pending = [[ast, 0]];
      let nodes = 0;
      while (pending.length) {
        const [node, depth] = pending.pop();
        if (!node || typeof node !== "object") continue;
        if (++nodes > 50000) throw new UFNError("Expanded expression is too large", this.at);
        const next = depth + (node.type ? 1 : 0);
        if (next > MAX_DEPTH) throw new UFNError("Expression is nested too deeply", this.at);
        for (const child of Object.values(node)) pending.push([child, next]);
      }
      return ast;
    }
    expression() {
      if (++this.depth > MAX_DEPTH) throw new UFNError("Expression is nested too deeply", this.at);
      try {
        let node = this.power();
        while (this.peek() === "@" || this.peek() === "#") {
          const operation = this.source[this.at++], label = this.power();
          node = operation === "@" ? { type: "basis", coefficient: node, label }
            : { type: "component", argument: node, label };
        }
        return node;
      } finally { this.depth--; }
    }
    power() {
      let node = this.primary();
      while (this.peek() === "⌈" || this.peek() === "⌊") {
        if (this.take("⌊")) {
          node = { type: "selection", source: node, place: this.expression() };
          this.need("⌋");
          continue;
        }
        this.need("⌈");
        // The bar reverses the question: which exponent reaches the target?
        // B⌈E|X⌉ first constructs B⌈E⌉, then uses that value as the log base.
        if (this.peek() !== "|") node = { type: "power", base: node, exponent: this.expression() };
        if (this.take("|")) node = { type: "logarithm", base: node, argument: this.expression() };
        this.need("⌉");
      }
      return node;
    }
    nameStart() {
      return nameCharacter(this.peek()) && !this.language.matches(this)
        && !/^index\s*\(/u.test(this.source.slice(this.at));
    }
    counter() {
      if (!this.nameStart()) throw new UFNError("Expected a counter name", this.at);
      const start = this.at;
      while (nameCharacter(this.source[this.at])) this.at++;
      const name = this.source.slice(start, this.at);
      if (!this.take("⌊")) return { name, label: null };
      // A tag is fixed writing, not an expression to evaluate. Balanced
      // delimiters keep its end clear, even with a nested UFN spelling.
      const tagStart = this.at, stack = ["⌋"];
      const pairs = { "[": "]", "{": "}", "(": ")", "⟨": "⟩", "⌊": "⌋", "⌈": "⌉", "⟦": "⟧", "⟪": "⟫" };
      const closes = new Set(Object.values(pairs));
      while (this.at < this.source.length && stack.length) {
        const char = this.source[this.at++];
        if (pairs[char]) stack.push(pairs[char]);
        else if (closes.has(char) && char !== stack.pop())
          throw new UFNError("Unmatched bracket in counter tag", this.at - 1);
        if (stack.length > MAX_DEPTH) throw new UFNError("Counter tag is nested too deeply", this.at);
      }
      if (stack.length) throw new UFNError("Expected ⌋ after the counter tag", this.at);
      const label = this.source.slice(tagStart, this.at - 1).replace(/\s+/gu, "");
      if (!label) throw new UFNError("A counter tag needs a name", tagStart);
      return { name: name + "⌊" + label + "⌋", label };
    }
    rangeOrList(kind, close) {
      const mark = this.at;
      if (this.nameStart()) {
        const counter = this.counter();
        if (this.nameStart()) {
          const place = this.counter();
          if (this.take(":")) {
            const source = this.expression(); this.need(":");
            const body = this.expression(); this.need(close);
            return { type: "sequence-range", kind, entry: counter, place, source, body };
          }
          this.at = mark;
        }
        if (this.take(":")) {
          const start = this.expression();
          this.need("…");
          let end = null;
          if (this.peek() !== ":") end = this.expression();
          if (kind === "sequence" && end === null) throw new UFNError("A sequence-producing range needs a finite endpoint", this.at);
          this.need(":");
          const body = this.expression();
          this.need(close);
          let measurement = null;
          if (end === null && this.take("⌊")) {
            measurement = this.expression(); this.need("⌋");
          }
          return { type: "range", kind, counter, start, end, body, measurement };
        }
        this.at = mark;
      }
      const before = [], after = [];
      let side = before, bar = false;
      while (this.peek() !== close) {
        if (!this.peek()) throw new UFNError(`Expected ${close}`, this.at);
        if (this.take("|")) {
          if (kind === "sequence") throw new UFNError("A retained sequence has no partition bar; put undoing inside an entry", this.at - 1);
          if (bar) throw new UFNError("Only one partition bar is allowed", this.at - 1);
          bar = true; side = after;
        } else {
          const previous = this.at;
          side.push(this.expression());
          if (this.at === previous) throw new UFNError("Expected an entry", this.at);
        }
      }
      this.need(close);
      return { type: kind, before, after };
    }
    primary() {
      const char = this.peek(), at = this.at;
      const form = this.language.matches(this);
      if (form) return this.language.readUse(this, form);
      if (this.take("⟳")) return { type: "constant", name: "turn" };
      if (this.take("┌")) { this.need("┘"); return { type: "constant", name: "e" }; }
      if ("○◠◡".includes(char) && char) {
        this.at++;
        return { type: "atom", value: char };
      }
      if (this.take("*")) {
        // A lookup takes one primary; upper attachments, @, and # apply to its answer.
        if (++this.depth > MAX_DEPTH) throw new UFNError("Expression is nested too deeply", this.at);
        try { return { type: "index", argument: this.primary() }; }
        finally { this.depth--; }
      }
      // Input alias for *[expression].
      if (/^index\s*\(/u.test(this.source.slice(this.at))) {
        this.at += 5;
        this.need("(");
        const argument = this.expression();
        this.need(")");
        return { type: "index", argument };
      }
      if (this.take("⟨")) {
        const entries = [];
        while (this.peek() !== "⟩") {
          if (!this.peek()) throw new UFNError("Expected ⟩", this.at);
          entries.push(this.expression());
        }
        this.need("⟩");
        let position = null;
        if (this.take("⌊")) { position = this.expression(); this.need("⌋"); }
        return { type: "prime", entries, position };
      }
      if (this.take("[")) return this.rangeOrList("sum", "]");
      if (this.take("{")) return this.rangeOrList("product", "}");
      if (this.take("(")) return this.rangeOrList("sequence", ")");
      if (this.nameStart()) return { type: "counter", ...this.counter() };
      if (char === "≔") throw new UFNError("A declaration belongs before the numerical expression", at);
      if (char === "⟦") throw new UFNError("This written form needs a matching ≔(…) declaration", at);
      throw new UFNError(`Expected an expression, found ${char || "the end"}`, at);
    }
  }

  const real = x => [x, 0, 0, 0];
  const add = (a, b) => a.map((v, i) => v + b[i]);
  const neg = a => a.map(v => -v);
  const sub = (a, b) => add(a, neg(b));
  function mul(a, b) {
    const [w, x, y, z] = a, [v, p, q, r] = b;
    return [w*v-x*p-y*q-z*r, w*p+x*v+y*r-z*q,
      w*q-x*r+y*v+z*p, w*r+x*q-y*p+z*v];
  }
  function inverse(a) {
    const norm = a.reduce((n, v) => n + v*v, 0);
    if (norm === 0) throw new UFNError("Division by zero");
    return [a[0]/norm, -a[1]/norm, -a[2]/norm, -a[3]/norm];
  }
  function finite(a) {
    if (a.some(v => !Number.isFinite(v))) throw new UFNError("Value exceeds the evaluator's numeric range");
    return a;
  }
  function asReal(a, description) {
    if (a.slice(1).some(v => Math.abs(v) > 1e-10)) throw new UFNError(description + " must lie on the original path (@○)");
    return a[0];
  }
  function asInteger(a, description, min, max) {
    const n = asReal(a, description);
    if (!Number.isSafeInteger(n) || n < min || n > max)
      throw new UFNError(`${description} must be an integer from ${min} to ${max}`);
    return n;
  }
  function prime(position) {
    return counts.toNumber(uniqueFactor(position));
  }
  function encodeInteger(n) {
    if (!Number.isSafeInteger(n)) throw new UFNError("Integer encoding requires a safe integer");
    try { return formatExactScalar(rational(counts.fromNumber(n))); }
    catch (error) {
      if (error instanceof counts.Limit) throw new UFNError("Factor position exceeds " + MAX_POSITION);
      throw error;
    }
  }
  function counterName(counter) {
    if (counter.binding !== undefined) return "local:" + counter.binding;
    return "name:" + writtenCounterName(counter);
  }
  function powQuaternion(base, exponent) {
    if (exponent.slice(1).every(x => x === 0)) return finite(real(Math.pow(base, exponent[0])));
    const ln = Math.log(base);
    const a = exponent[0] * ln;
    const v = exponent.slice(1).map(x => x * ln);
    const length = Math.hypot(...v), scale = Math.exp(a);
    const ratio = length < 1e-12 ? 1 : Math.sin(length) / length;
    return finite([scale * Math.cos(length), ...v.map(x => scale * ratio * x)]);
  }
  // UFN factors remain the primary exact representation. Count strings are
  // used for exponent arithmetic and for counting/regrouping coprime sums.
  // No native Number or BigInt stores an exact arithmetic value.
  class ExactLimit extends counts.Limit {}
  const C0 = counts.ZERO, C1 = counts.ONE;
  const factorCounts = [counts.add(C1, C1)];
  const factorPositions = new Map([[factorCounts[0], 1]]);
  function uniqueFactor(position) {
    if (position > MAX_POSITION) throw new ExactLimit("Factor position limit reached");
    while (factorCounts.length < position) {
      let candidate = counts.add(factorCounts[factorCounts.length - 1], C1);
      if (candidate.endsWith(C0)) candidate = counts.add(candidate, C1);
      for (;;) {
        let unique = true;
        for (const factor of factorCounts) {
          if (counts.compare(counts.mul(factor, factor), candidate) > 0) break;
          if (counts.divmod(candidate, factor).remainder === C0) { unique = false; break; }
        }
        if (unique) {
          factorCounts.push(candidate);
          factorPositions.set(candidate, factorCounts.length);
          break;
        }
        candidate = counts.add(candidate, factorCounts[0]);
      }
    }
    return factorCounts[position - 1];
  }
  function rational(n, d = C1) {
    if (d === C0) throw new UFNError("Division by zero");
    if (counts.negative(d)) { n = counts.neg(n); d = counts.neg(d); }
    const common = counts.gcd(n, d);
    return { n: counts.divExact(n, common), d: counts.divExact(d, common) };
  }
  const ZERO = rational(C0), ONE = rational(C1);
  const isSum = a => !!a.terms;
  const isRational = a => !a.powers && !isSum(a);
  const isZero = a => isRational(a) && a.n === C0;
  const isOne = a => isRational(a) && a.n === a.d;
  const rNegate = a => ({ n: counts.neg(a.n), d: a.d });
  function rAdd(a, b) {
    // Use the least common denominator: give both contributions equal shares.
    const common = counts.gcd(a.d, b.d);
    const left = counts.divExact(b.d, common), right = counts.divExact(a.d, common);
    return rational(counts.add(counts.mul(a.n, left), counts.mul(b.n, right)), counts.mul(a.d, left));
  }
  const rSubtract = (a, b) => rAdd(a, rNegate(b));
  function rMultiply(a, b) {
    const left = counts.gcd(a.n, b.d), right = counts.gcd(b.n, a.d);
    return rational(counts.mul(counts.divExact(a.n, left), counts.divExact(b.n, right)),
      counts.mul(counts.divExact(a.d, right), counts.divExact(b.d, left)));
  }
  function rPower(a, exponent) {
    const numerator = counts.pow(a.n, counts.abs(exponent));
    const denominator = counts.pow(a.d, counts.abs(exponent));
    return counts.negative(exponent) ? rational(denominator, numerator) : rational(numerator, denominator);
  }
  function rCompare(a, b) {
    const difference = counts.sub(counts.mul(a.n, b.d), counts.mul(b.n, a.d));
    return difference === C0 ? 0 : counts.negative(difference) ? -1 : 1;
  }
  function factorRational(a) {
    const powers = new Map();
    function take(remaining, instruction) {
      for (let position = 1; remaining !== C1; position++) {
        const known = factorPositions.get(remaining);
        if (known) {
          powers.set(known, rAdd(powers.get(known) || ZERO, instruction));
          break;
        }
        const factor = uniqueFactor(position);
        for (;;) {
          const divided = counts.divmod(remaining, factor);
          if (divided.remainder !== C0) break;
          remaining = divided.quotient;
          powers.set(position, rAdd(powers.get(position) || ZERO, instruction));
        }
      }
    }
    if (a.n === C0) throw new ExactLimit();
    take(counts.abs(a.n), ONE);
    take(a.d, rNegate(ONE));
    return powers;
  }
  function monomial(powers, negative = false) {
    powers = new Map([...powers].filter(([, e]) => e.n !== C0).sort(([a], [b]) => a - b));
    if (!powers.size) return negative ? rNegate(ONE) : ONE;
    return { powers, negative };
  }
  function scalarNegative(a) {
    if (isSum(a)) {
      const signs = a.terms.map(scalarNegative);
      if (signs.every(sign => sign === signs[0])) return signs[0];
      const { place, plain, rooted } = squareRootParts(a);
      if (isZero(plain)) return scalarNegative(rooted);
      if (isZero(rooted)) return scalarNegative(plain);
      const plainSign = scalarNegative(plain), rootedSign = scalarNegative(rooted);
      if (plainSign === rootedSign) return plainSign;
      // With opposite signs, compare their squared sizes. Removing this
      // square-root generator makes the comparison recursively simpler.
      const difference = scalarAdd(scalarMultiply(plain, plain), scalarNegate(
        scalarMultiply(monomial(new Map([[place, ONE]])), scalarMultiply(rooted, rooted))));
      if (isZero(difference)) throw new ExactLimit("This root sum needs further grouping before we can tell whether it lies forward or backward of ○");
      return scalarNegative(difference) ? rootedSign : plainSign;
    }
    return isRational(a) ? counts.negative(a.n) : a.negative;
  }
  const scalarNegate = a => isSum(a) ? { terms: a.terms.map(scalarNegate) }
    : isRational(a) ? rNegate(a) : { ...a, negative: !a.negative };
  function scalarPowers(a) {
    if (isSum(a)) throw new ExactLimit("A sum of different roots remains an exact recipe");
    return isRational(a) ? factorRational(a) : a.powers;
  }
  // Integer differences between exponents change only a root's group count.
  // Fractional parts identify terms whose groups can be joined exactly.
  function rootKey(a) {
    if (isRational(a)) return "";
    return [...a.powers].flatMap(([position, exponent]) => {
      if (exponent.d === C1) return [];
      let fraction = counts.divmod(counts.abs(exponent.n), exponent.d).remainder;
      if (fraction === C0) return [];
      if (counts.negative(exponent.n)) fraction = counts.sub(exponent.d, fraction);
      return [position + ":" + fraction + "/" + exponent.d];
    }).join(";");
  }
  function joinRootTerms(terms) {
    const groups = new Map();
    for (const term of terms) {
      if (isZero(term)) continue;
      const key = rootKey(term), previous = groups.get(key);
      const joined = previous ? scalarAdd(previous, term) : term;
      if (isZero(joined)) groups.delete(key);
      else groups.set(key, joined);
    }
    if (groups.size > MAX_ROOT_TERMS) throw new ExactLimit("Too many different root terms to expand");
    const remaining = [...groups.values()];
    return remaining.length === 0 ? ZERO : remaining.length === 1 ? remaining[0] : { terms: remaining };
  }
  function asFraction(a) {
    if (isRational(a)) return a;
    if (isSum(a)) throw new ExactLimit("A sum of different roots remains an exact recipe");
    let value = a.negative ? rNegate(ONE) : ONE;
    for (const [position, exponent] of a.powers) {
      if (exponent.d !== C1) throw new ExactLimit("The remaining terms have different roots");
      value = rMultiply(value, rPower(rational(uniqueFactor(position)), exponent.n));
    }
    return value;
  }
  function scalarMultiply(a, b) {
    if (isZero(a) || isZero(b)) return ZERO;
    if (isOne(a)) return b;
    if (isOne(b)) return a;
    if (isSum(a) || isSum(b)) {
      const left = isSum(a) ? a.terms : [a], right = isSum(b) ? b.terms : [b];
      if (left.length * right.length > MAX_ROOT_PAIRS) throw new ExactLimit("Too many root pairs to expand");
      return joinRootTerms(left.flatMap(first => right.map(second => scalarMultiply(first, second))));
    }
    try {
      const powers = new Map(scalarPowers(a));
      for (const [position, exponent] of scalarPowers(b))
        powers.set(position, rAdd(powers.get(position) || ZERO, exponent));
      return monomial(powers, scalarNegative(a) !== scalarNegative(b));
    } catch (error) {
      if (!(error instanceof counts.Limit)) throw error;
      return rMultiply(asFraction(a), asFraction(b));
    }
  }
  function sharedPowers(a, b, largest = false) {
    const shared = new Map();
    for (const position of new Set([...a.keys(), ...b.keys()])) {
      const left = a.get(position) || ZERO, right = b.get(position) || ZERO;
      const order = rCompare(left, right);
      shared.set(position, (largest ? order > 0 : order < 0) ? left : right);
    }
    return shared;
  }
  function removeShared(powers, shared, negative) {
    return monomial(new Map([...shared].map(([position, exponent]) =>
      [position, rSubtract(powers.get(position) || ZERO, exponent)])), negative);
  }
  function scalarAdd(a, b) {
    if (isZero(a)) return b;
    if (isZero(b)) return a;
    if (isRational(a) && isRational(b)) return rAdd(a, b);
    if (isSum(a) || isSum(b)) return joinRootTerms([
      ...(isSum(a) ? a.terms : [a]), ...(isSum(b) ? b.terms : [b]),
    ]);
    if (rootKey(a) !== rootKey(b)) return { terms: [a, b] };
    try {
      const left = scalarPowers(a), right = scalarPowers(b);
      // Take out the shared groups before counting anything. This also gives
      // fractional contributions matching shares and keeps large factors intact.
      const shared = sharedPowers(left, right);
      const leftGroups = removeShared(left, shared, scalarNegative(a));
      const rightGroups = removeShared(right, shared, scalarNegative(b));
      const groups = rAdd(asFraction(leftGroups), asFraction(rightGroups));
      return scalarMultiply(monomial(shared), groups);
    } catch (error) {
      if (!(error instanceof counts.Limit)) throw error;
      // An intermediate count need not be factored before it can cancel.
      return rAdd(asFraction(a), asFraction(b));
    }
  }
  function scalarInverse(a) {
    if (isRational(a)) return rational(a.d, a.n);
    if (isSum(a)) {
      const { place } = squareRootParts(a), two = counts.add(C1, C1);
      // Change the sign of one square-root generator. Multiplying these
      // conjugates removes that generator, so each recursive inverse uses
      // fewer independent roots. Keep the usual term and work bounds.
      const conjugate = joinRootTerms(a.terms.map(term => term.powers?.get(place)?.d === two ? scalarNegate(term) : term));
      const reduced = scalarMultiply(a, conjugate);
      return scalarMultiply(conjugate, scalarInverse(reduced));
    }
    return monomial(new Map([...a.powers].map(([position, e]) => [position, rNegate(e)])), a.negative);
  }
  function squareRootParts(a) {
    const two = counts.add(C1, C1);
    let place = null;
    for (const term of a.terms) for (const [position, exponent] of term.powers || []) {
      if (exponent.d === C1) continue;
      if (exponent.d !== two) throw new ExactLimit("This combination of roots needs another algebraic rule");
      if (place === null) place = position;
    }
    if (place === null) throw new ExactLimit("The root sum needs further grouping");
    const plain = [], rooted = [], undoRoot = monomial(new Map([[place, rational(counts.neg(C1), two)]]));
    for (const term of a.terms) {
      if (term.powers?.get(place)?.d === two) rooted.push(scalarMultiply(term, undoRoot));
      else plain.push(term);
    }
    return { place, plain: joinRootTerms(plain), rooted: joinRootTerms(rooted) };
  }
  function scalarPower(base, exponent) {
    if (isOne(base)) return ONE;
    exponent = asFraction(exponent);
    if (isSum(base)) {
      if (exponent.d !== C1) throw new ExactLimit("A fractional power of a root sum remains an exact recipe");
      let result = ONE, copies = counts.abs(exponent.n);
      while (copies !== C0) {
        if (copies.endsWith(C1)) result = scalarMultiply(result, base);
        copies = copies.slice(0, -1) || C0;
        if (copies !== C0) base = scalarMultiply(base, base);
      }
      return counts.negative(exponent.n) ? scalarInverse(result) : result;
    }
    return monomial(new Map([...scalarPowers(base)].map(([position, e]) => [position, rMultiply(e, exponent)])));
  }
  function scalarLogarithm(base, target) {
    if (isOne(base)) throw new UFNError("A logarithm base cannot be ◠: its powers all give ◠");
    if (isOne(target)) return ZERO;
    if (isSum(base) || isSum(target)) {
      if (isZero(scalarAdd(base, scalarNegate(target)))) return ONE;
      throw new ExactLimit("This logarithm remains an exact recipe; its factor instructions do not yet give an answer");
    }
    const from = scalarPowers(base), to = scalarPowers(target);
    const [first, instruction] = from.entries().next().value;
    const ratio = rMultiply(to.get(first) || ZERO, rational(instruction.d, instruction.n));
    for (const place of new Set([...from.keys(), ...to.keys()])) {
      if (rCompare(rMultiply(from.get(place) || ZERO, ratio), to.get(place) || ZERO) !== 0)
        throw new ExactLimit("This logarithm remains an exact recipe; no single rational exponent matches every factor place");
    }
    return ratio;
  }
  function checkLogarithmTarget(target) {
    if (!target.slice(1).every(isZero)) return;
    if (isZero(target[0])) throw new UFNError("A logarithm target cannot be ○: no finite exponent reaches it");
    if (scalarNegative(target[0]))
      throw new UFNError("A backward target on @○ needs an explicit logarithm plane or branch; that choice has no syntax yet");
  }
  function samePositiveScalar(a, b) {
    if (isSum(a) || isSum(b)) return isZero(scalarAdd(a, scalarNegate(b)));
    const left = scalarPowers(a), right = scalarPowers(b);
    return left.size === right.size && [...left].every(([place, exponent]) =>
      right.has(place) && rCompare(exponent, right.get(place)) === 0);
  }
  // Conversions below are solely for the explicitly requested decimal/graph
  // view. Their rounded values never flow back into reduction or validation.
  function rationalNumber(a) {
    const numerator = counts.abs(a.n);
    const nShift = Math.max(0, numerator.length - 53), dShift = Math.max(0, a.d.length - 53);
    const ratio = counts.toNumber(numerator.slice(0, 53)) / counts.toNumber(a.d.slice(0, 53));
    const shift = nShift - dShift, first = Math.max(-1022, Math.min(1023, shift));
    const value = (ratio * 2 ** first) * 2 ** (shift - first);
    return counts.negative(a.n) ? -value : value;
  }
  function scalarNumber(a) {
    if (isRational(a)) return rationalNumber(a);
    if (isSum(a)) return a.terms.reduce((sum, term) => sum + scalarNumber(term), 0);
    let value = a.negative ? -1 : 1, logarithm = 0, grows = false, shrinks = false;
    for (const [position, exponent] of a.powers) {
      const factor = counts.toNumber(uniqueFactor(position)), power = rationalNumber(exponent);
      if (counts.negative(exponent.n)) shrinks = true;
      else grows = true;
      value *= Math.pow(factor, power);
      logarithm += Math.log(factor) * power;
    }
    // Mixed instructions may overflow during an intermediate step even when
    // their combined size fits. Preserve definite overflow/underflow otherwise.
    if (grows && shrinks && (!Number.isFinite(value) || value === 0))
      return (a.negative ? -1 : 1) * Math.exp(logarithm);
    return value;
  }
  const exactValue = scalar => [scalar, ZERO, ZERO, ZERO];
  const exactAdd = (a, b) => a.map((v, i) => scalarAdd(v, b[i]));
  const exactNegate = a => a.map(scalarNegate);
  function exactScalar(a, description) {
    if (!a.slice(1).every(isZero)) throw new UFNError(description + " must lie on the original path (@○)");
    return a[0];
  }
  function exactInteger(a, description, min, max) {
    let n;
    try { n = asFraction(exactScalar(a, description)); }
    catch (error) {
      if (!(error instanceof counts.Limit)) throw error;
      throw new UFNError(description + " must be a bounded whole count");
    }
    if (n.d !== C1 || rCompare(n, rational(counts.fromNumber(min))) < 0 || rCompare(n, rational(counts.fromNumber(max))) > 0)
      throw new UFNError(`${description} must be an integer from ${min} to ${max}`);
    return counts.toNumber(n.n);
  }
  const quaternionTerms = [
    [[0, 0, 1], [1, 1, -1], [2, 2, -1], [3, 3, -1]],
    [[0, 1, 1], [1, 0, 1], [2, 3, 1], [3, 2, -1]],
    [[0, 2, 1], [1, 3, -1], [2, 0, 1], [3, 1, 1]],
    [[0, 3, 1], [1, 2, 1], [2, 1, -1], [3, 0, 1]],
  ];
  function exactMultiply(a, b) {
    if (a.slice(1).every(isZero)) return b.map(v => scalarMultiply(a[0], v));
    if (b.slice(1).every(isZero)) return a.map(v => scalarMultiply(v, b[0]));
    return quaternionTerms.map(terms => terms.reduce((sum, [i, j, sign]) => {
      const term = scalarMultiply(a[i], b[j]);
      return scalarAdd(sum, sign < 0 ? scalarNegate(term) : term);
    }, ZERO));
  }
  // Recognize the named base with optional grouping and original-path labels.
  function exponentialBase(node, environment, context, description = "Power base") {
    if (node.type === "constant") return node.name === "e";
    if ((node.type === "sum" || node.type === "product") && node.before.length === 1 && !node.after.length)
      return exponentialBase(node.before[0], environment, context, description);
    if (node.type === "basis" && exponentialBase(node.coefficient, environment, context, description)) {
      const axis = exactInteger(numerical(evaluate(node.label, environment, context, exactArithmetic)), "Direction label", 0, 3);
      if (axis !== 0) throw new UFNError(description + " must lie forward of ○ along @○");
      return true;
    }
    return false;
  }
  // Keep the turn symbolic. Each pair describes a + b·⟳, with exact
  // four-component coefficients. No sampled angle enters this proof.
  function exactTurnPower(node, environment, context) {
    const zero = () => exactValue(ZERO);
    const empty = value => value.every(isZero);
    const add = (a, b) => a.map((part, i) => exactAdd(part, b[i]));
    const negate = a => a.map(exactNegate);
    const multiply = (a, b) => {
      if (!empty(exactMultiply(a[1], b[1])))
        throw new ExactLimit("A power involving squared turns remains an exact recipe");
      return [exactMultiply(a[0], b[0]), exactAdd(exactMultiply(a[0], b[1]), exactMultiply(a[1], b[0]))];
    };
    const read = (part, env = environment) => {
      if (part.type === "constant" && part.name === "turn") return [zero(), exactValue(ONE)];
      if (part.type === "defined") return withLimits(context, () => read(part.body, env));
      if (part.type === "counter") {
        const bound = env.get(counterName(part, context, exactArithmetic));
        if (isRecipe(bound)) return bound.limits ? withLimits(context, () => read(bound.node, bound.environment))
          : read(bound.node, bound.environment);
      }
      if (part.type === "sum") {
        let value = [zero(), zero()];
        for (const child of part.before) value = add(value, read(child, env));
        for (const child of part.after) value = add(value, negate(read(child, env)));
        return value;
      }
      if (part.type === "product") {
        let value = [exactValue(ONE), zero()], denominator = [exactValue(ONE), zero()];
        for (const child of part.before) value = multiply(value, read(child, env));
        for (const child of part.after) denominator = multiply(denominator, read(child, env));
        if (!empty(denominator[1])) throw new ExactLimit("Sharing by a turn remains an exact recipe");
        return multiply(value, [exactArithmetic.inverse(denominator[0]), zero()]);
      }
      if (part.type === "basis") {
        const coefficient = read(part.coefficient, env);
        const axis = exactInteger(numerical(evaluate(part.label, env, context, exactArithmetic)), "Direction label", 0, 3);
        return coefficient.map(value => {
          const scalar = exactScalar(value, "Direction coefficient"), result = zero();
          result[axis] = scalar; return result;
        });
      }
      if (part.type === "component") {
        const axis = exactInteger(numerical(evaluate(part.label, env, context, exactArithmetic)), "Component label", 0, 3);
        return read(part.argument, env).map(value => exactValue(value[axis]));
      }
      return [numerical(evaluate(part, env, context, exactArithmetic)), zero()];
    };
    const [offset, turns] = read(node);
    if (!empty(offset) || !isZero(turns[0]))
      throw new ExactLimit("Exact turn reduction needs a turn amount along a turning axis");
    const axes = [1, 2, 3].filter(axis => !isZero(turns[axis]));
    if (!axes.length) return exactValue(ONE);
    if (axes.length !== 1) throw new ExactLimit("This turn combines axes and remains an exact recipe");
    const axis = axes[0], amount = asFraction(turns[axis]);
    const eight = counts.fromNumber(8);
    const steps = rMultiply(amount, rational(eight));
    if (steps.d !== C1) throw new ExactLimit("Exact turns currently use whole, half, quarter, or eighth turns");
    const remainder = counts.divmod(counts.abs(steps.n), eight).remainder;
    const residue = counts.toNumber(remainder); // bounded table position, never an arithmetic value
    const position = counts.negative(steps.n) ? (8 - residue) % 8 : residue;
    const halfRoot = monomial(new Map([[1, rational(counts.neg(C1), counts.fromNumber(2))]]));
    const cosine = [ONE, halfRoot, ZERO, scalarNegate(halfRoot), scalarNegate(ONE), scalarNegate(halfRoot), ZERO, halfRoot];
    const sine = [ZERO, halfRoot, ONE, halfRoot, ZERO, scalarNegate(halfRoot), scalarNegate(ONE), scalarNegate(halfRoot)];
    const result = exactValue(cosine[position]); result[axis] = sine[position];
    return result;
  }
  const exactArithmetic = {
    real: n => exactValue(rational(counts.fromNumber(n))),
    add: exactAdd,
    sub: (a, b) => exactAdd(a, exactNegate(b)),
    mul: exactMultiply,
    inverse(a) {
      const norm = a.reduce((sum, v) => scalarAdd(sum, scalarMultiply(v, v)), ZERO);
      const reciprocal = scalarInverse(norm);
      return a.map((v, i) => scalarMultiply(i ? scalarNegate(v) : v, reciprocal));
    },
    finite: a => a,
    asReal: exactScalar,
    asInteger: exactInteger,
    positive: a => !isZero(a) && !scalarNegative(a),
    isOne,
    power(base, exponent) {
      if (isOne(base)) return exactValue(ONE);
      if (!exponent.slice(1).every(isZero)) throw new ExactLimit("A directed power remains an exact recipe");
      return exactValue(scalarPower(base, exponent[0]));
    },
    logarithm(base, target) {
      if (isOne(base)) throw new UFNError("A logarithm base cannot be ◠: its powers all give ◠");
      checkLogarithmTarget(target);
      if (!target.slice(1).every(isZero))
        throw new ExactLimit("The principal directed logarithm remains an exact recipe; a decimal projection is available");
      return exactValue(scalarLogarithm(base, target[0]));
    },
    primePower(position, exponent) {
      return exactValue(monomial(new Map([[position, asFraction(exponent)]])));
    },
    index(argument) {
      const scalar = exactScalar(argument, "Position lookup (*)");
      if (isZero(scalar) || scalarNegative(scalar)) throw new UFNError("* requires a unique factor within the position limit");
      const powers = [...scalarPowers(scalar)].filter(([, e]) => !isZero(e));
      if (powers.length !== 1 || !isOne(powers[0][1])) throw new UFNError("* requires a unique factor within the position limit");
      return exactValue(rational(counts.fromNumber(powers[0][0])));
    },
  };
  function formatExactScalar(a) {
    if (isZero(a)) return "○";
    if (isOne(a)) return "◠";
    if (isRational(a) && a.n === counts.neg(a.d)) return "◡";
    const powers = scalarPowers(a), last = Math.max(...powers.keys());
    const entries = [];
    for (let position = last; position >= 1; position--)
      entries.push(formatExactScalar(powers.get(position) || ZERO));
    const spelling = "⟨" + entries.join("") + "⟩";
    return scalarNegative(a) ? "[|" + spelling + "]" : spelling;
  }
  function formatExact(value) {
    let spelling;
    if (value.slice(1).every(isZero)) spelling = formatExactScalar(value[0]);
    else {
      const labels = ["○", "◠", "⟨◠⟩", "⟨◠○⟩"];
      const parts = value.flatMap((v, i) => isZero(v) ? [] : [formatExactScalar(v) + "@" + labels[i]]);
      spelling = parts.length === 1 ? parts[0] : "[" + parts.join(" ") + "]";
    }
    if (spelling.length > MAX_SOURCE) throw new ExactLimit("Canonical spelling is too long");
    return spelling;
  }
  function formatExactRecipe(value) {
    const scalar = entry => {
      if (!isSum(entry)) return formatExactScalar(entry);
      const before = [], after = [];
      for (const term of entry.terms) {
        if (scalarNegative(term)) after.push(formatExactScalar(scalarNegate(term)));
        else before.push(formatExactScalar(term));
      }
      return "[" + before.join(" ") + (after.length ? (before.length ? " | " : "|") + after.join(" ") : "") + "]";
    };
    if (value.slice(1).every(isZero)) return scalar(value[0]);
    const labels = ["○", "◠", "⟨◠⟩", "⟨◠○⟩"];
    const parts = value.flatMap((entry, i) => isZero(entry) ? [] : [scalar(entry) + "@" + labels[i]]);
    return parts.length === 1 ? parts[0] : "[" + parts.join(" ") + "]";
  }
  function boundedExactRecipe(value, description = "The reduced expression") {
    const source = formatExactRecipe(value);
    if (source.length > MAX_SOURCE) throw new ExactLimit(description + " is too long");
    try { new Parser(source).parse(); }
    catch (error) {
      if (!(error instanceof UFNError)) throw error;
      throw new ExactLimit(description + " exceeds the display's structural limits");
    }
    return source;
  }

  // Presentation only: shorten an already reduced spelling with the existing
  // floating-position syntax. Dense canonical text remains the identity form.
  function shorterSpelling(canonical) {
    const positions = new Map();
    const shorter = (a, b) => b.length < a.length ? b : a;
    function positionLabel(position) {
      if (position === 1) return "";
      if (!positions.has(position)) positions.set(position, "⌊" + render(new Parser(encodeInteger(position)).parse()) + "⌋");
      return positions.get(position);
    }
    function render(node) {
      if (node.type === "atom") return node.value;
      if (node.type === "sum") return "[" + node.before.map(render).join(" ")
        + (node.after.length ? (node.before.length ? " | " : "|") + node.after.map(render).join(" ") : "") + "]";
      if (node.type === "basis") return render(node.coefficient) + "@" + render(node.label);
      if (node.type !== "prime" || node.position) throw new Error("Expected a dense canonical number");
      const entries = node.entries.map(render).reverse();
      const dense = "⟨" + [...entries].reverse().join("") + "⟩";
      const prefix = [0], runs = [];
      entries.forEach((entry, i) => {
        prefix.push(prefix[i] + entry.length);
        if (entry === "○") return;
        const previous = runs[runs.length - 1];
        // A smaller gap cannot pay for extra brackets and a separator.
        if (previous && i - previous.end < 5) previous.end = i;
        else runs.push({ start: i, end: i });
      });
      if (!runs.length) return dense;
      const blockLength = (i, j) => 2 + prefix[runs[j].end + 1] - prefix[runs[i].start]
        + positionLabel(runs[i].start + 1).length;
      const block = (i, j) => "⟨" + entries.slice(runs[i].start, runs[j].end + 1).reverse().join("")
        + "⟩" + positionLabel(runs[i].start + 1);
      let best = shorter(dense, block(0, runs.length - 1));
      if (runs.length === 1) return best;
      // Choose which separated runs to group. The outer curly pair is added
      // only when comparing the finished product with the single-block forms.
      const costs = [0], breaks = [], sizes = [0];
      for (let end = 1; end <= runs.length; end++) {
        costs[end] = Infinity; sizes[end] = Infinity;
        for (let start = 0; start < end; start++) {
          const cost = costs[start] + (start ? 1 : 0) + blockLength(start, end - 1);
          if (cost < costs[end] || cost === costs[end] && sizes[start] + 1 < sizes[end]) {
            costs[end] = cost; breaks[end] = start; sizes[end] = sizes[start] + 1;
          }
        }
      }
      const parts = [];
      for (let end = runs.length; end > 0; end = breaks[end]) parts.push(block(breaks[end], end - 1));
      best = shorter(best, parts.length === 1 ? parts[0] : "{" + parts.join(" ") + "}");
      return best;
    }
    try {
      const display = render(new Parser(canonical).parse());
      // A shorter spelling may have more nesting. Keep the reference spelling
      // if the result would exceed the parser's structural limits.
      if (display.length < canonical.length) { new Parser(display).parse(); return display; }
    } catch (error) {
      if (!(error instanceof UFNError || error instanceof counts.Limit)) throw error;
    }
    return canonical;
  }

  const approximateArithmetic = {
    real, add, sub, mul, inverse, finite, asReal, asInteger,
    constant(name) {
      if (name === "turn") return real(2 * Math.PI);
      if (name === "e") return real(Math.E);
      throw new UFNError("Unknown constant");
    },
    positive: n => n > 0,
    isOne: n => n === 1,
    power: powQuaternion,
    logarithm(base, target) {
      if (base === 1) throw new UFNError("A logarithm base cannot be ◠: its powers all give ◠");
      const vector = target.slice(1), vectorScale = Math.max(...vector.map(Math.abs));
      if (vectorScale === 0) {
        if (target[0] === 0) throw new UFNError("A logarithm target cannot be ○: no finite exponent reaches it");
        if (target[0] < 0)
          throw new UFNError("A backward target on @○ needs an explicit logarithm plane or branch; that choice has no syntax yet");
        return real(Math.log(target[0]) / Math.log(base));
      }
      // Scale before taking norms: finite components need not have a
      // representable squared length. Keep even tiny nonzero vector parts.
      const scale = Math.max(Math.abs(target[0]), vectorScale);
      const unitLength = Math.hypot(...vector.map(x => x / vectorScale));
      const vectorLength = vectorScale / scale * unitLength;
      const angle = Math.atan2(vectorLength, target[0] / scale);
      const logLength = Math.log(scale) + Math.log(Math.hypot(target[0] / scale, vectorLength));
      const logBase = Math.log(base);
      return [logLength / logBase, ...vector.map(x => (x / vectorScale / unitLength) * (angle / logBase))];
    },
    primePower: (position, exponent) => real(Math.pow(prime(position), exponent)),
  };

  function withLimits(context, action) {
    const previous = context.limits;
    context.limits = true;
    try { return action(); } finally { context.limits = previous; }
  }
  class MeasuredEntryError extends UFNError {}
  function rationalScalar(value) {
    if (!value.slice(1).every(isZero)) throw new MeasuredEntryError("A factor-measured entry must lie on the original path (@○)");
    const scalar = value[0];
    if (isSum(scalar) || (!isRational(scalar) && [...scalar.powers.values()].some(e => e.d !== C1)))
      throw new MeasuredEntryError("A factor measuring place currently requires rational entries");
    return scalar;
  }
  function measuredSize(scalar, place) {
    if (isZero(scalar)) return ZERO;
    if (place === 0) return scalarNegative(scalar) ? scalarNegate(scalar) : scalar;
    const exponent = scalarPowers(scalar).get(place) || ZERO;
    return monomial(new Map([[place, rNegate(exponent)]]));
  }
  function smallerThanOne(scalar, place) {
    if (isZero(scalar)) return true;
    if (place) return rCompare(scalarPowers(scalar).get(place) || ZERO, ZERO) > 0;
    return scalarNegative(scalarAdd(measuredSize(scalar, 0), scalarNegate(ONE)));
  }
  function childrenSome(node, predicate) {
    if (!node || typeof node !== "object") return false;
    if (predicate(node)) return true;
    return Object.values(node).some(value => Array.isArray(value)
      ? value.some(child => childrenSome(child, predicate)) : childrenSome(value, predicate));
  }
  function dependsOn(node, name, context) {
    if (!node || typeof node !== "object") return false;
    if (node.type === "counter") return counterName(node, context, exactArithmetic) === name;
    if (node.type === "range") return dependsOn(node.start, name, context)
      || dependsOn(node.end, name, context) || dependsOn(node.measurement, name, context)
      || (counterName(node.counter, context, exactArithmetic) !== name && dependsOn(node.body, name, context));
    if (node.type === "sequence-range") return dependsOn(node.source, name, context)
      || (counterName(node.entry, context, exactArithmetic) !== name
        && counterName(node.place, context, exactArithmetic) !== name && dependsOn(node.body, name, context));
    return Object.values(node).some(value => Array.isArray(value)
      ? value.some(child => dependsOn(child, name, context)) : dependsOn(value, name, context));
  }

  function rationalFunctionField() {
    const field = rationalFunctions.create({
      zero: ZERO, one: ONE, isZero, neg: rNegate, add: rAdd, mul: rMultiply,
      inv: a => rational(a.d, a.n), fromInteger: n => rational(counts.fromNumber(n)),
    }, { Limit: ExactLimit, divisionByZero: () => new UFNError("Division by zero") });
    field.lift = scalar => field.constant(asFraction(scalar));
    return field;
  }

  // Compile rational expressions in the visiting count. Four components keep
  // their written multiplication order. Every original divisor contributes a
  // guard, even when later algebra cancels it from the reduced fraction.
  function rationalSequence(body, name, environment, context, start) {
    const field = rationalFunctionField(), constraints = [];
    let candidates = [];
    const unsupported = () => { throw new ExactLimit("This limit needs a reduction rule for its counter recipe"); };
    const rootGuard = (value, kind) => constraints.push({ value, kind });
    const scalar = (value, F) => {
      if (!value.slice(1).every(F.isZero)) unsupported();
      return value[0];
    };
    function compile(node, scope, F, guard, depth = 0) {
      const vector = value => [value, F.zero, F.zero, F.zero];
      const plus = (a, b) => a.map((value, i) => F.add(value, b[i]));
      const negative = a => a.map(F.neg);
      const times = (a, b) => quaternionTerms.map(terms => terms.reduce((sum, [i, j, sign]) => {
        const term = F.mul(a[i], b[j]);
        return F.add(sum, sign < 0 ? F.neg(term) : term);
      }, F.zero));
      const inverse = a => {
        if (a.slice(1).every(F.isZero)) {
          guard(a[0], "nonzero");
          return vector(F.inv(a[0]));
        }
        const norm = a.reduce((sum, value) => F.add(sum, F.mul(value, value)), F.zero);
        guard(norm, "nonzero");
        return a.map((value, i) => F.div(i ? F.neg(value) : value, norm));
      };
      const ev = child => compile(child, scope, F, guard, depth);
      if (![...scope.keys()].some(key => dependsOn(node, key, context))) {
        return numerical(evaluate(node, environment, context, exactArithmetic)).map(F.lift);
      }
      if (node.type === "counter") {
        const key = counterName(node, context, exactArithmetic);
        if (scope.has(key)) return scope.get(key);
        return numerical(evaluate(node, environment, context, exactArithmetic)).map(F.lift);
      }
      if (node.type === "sum" || node.type === "product") {
        const product = node.type === "product", combine = product ? times : plus;
        let before = vector(product ? F.one : F.zero), after = vector(product ? F.one : F.zero);
        for (const part of node.before) before = combine(before, ev(part));
        for (const part of node.after) after = combine(after, ev(part));
        if (node === body && !product) candidates = [before, negative(after)];
        return combine(before, product ? inverse(after) : negative(after));
      }
      if (node.type === "basis") {
        const value = scalar(ev(node.coefficient), F);
        if ([...scope.keys()].some(key => dependsOn(node.label, key, context))) unsupported();
        const label = exactInteger(numerical(evaluate(node.label, environment, context, exactArithmetic)), "Direction label", 0, 3);
        const result = vector(F.zero); result[label] = value; return result;
      }
      if (node.type === "component") {
        if ([...scope.keys()].some(key => dependsOn(node.label, key, context))) unsupported();
        const label = exactInteger(numerical(evaluate(node.label, environment, context, exactArithmetic)), "Component label", 0, 3);
        return vector(ev(node.argument)[label]);
      }
      if (node.type === "power") {
        if ([...scope.keys()].some(key => dependsOn(node.exponent, key, context))) unsupported();
        let exponent;
        const value = numerical(evaluate(node.exponent, environment, context, exactArithmetic));
        try { exponent = exactInteger(value, "Symbolic exponent", -24, 24); }
        catch (error) {
          if (!(error instanceof UFNError)) throw error;
          unsupported();
        }
        const base = scalar(ev(node.base), F);
        guard(base, "positive");
        return vector(F.pow(base, exponent));
      }
      if (node.type === "range" && node.end && depth < 2) {
        const lower = scalar(ev(node.start), F), upper = scalar(ev(node.end), F);
        guard(lower, "whole"); guard(upper, "whole");
        guard(lower, "nonnegative"); guard(upper, "nonnegative");
        // This first rule covers ranges whose bounds stay in forward order.
        // An uncertain or changing order is retained instead of extrapolated.
        guard(F.add(upper, F.neg(lower)), "nonnegative");
        const inner = rationalFunctions.create(F, { Limit: ExactLimit, divisionByZero: () => new UFNError("Division by zero") });
        inner.lift = value => inner.constant(F.lift(value));
        const innerScope = new Map([...scope].map(([key, value]) => [key, value.map(inner.constant)]));
        const key = counterName(node.counter, context, exactArithmetic);
        innerScope.set(key, [inner.variable, inner.zero, inner.zero, inner.zero]);
        const innerConstraints = [];
        const innerGuard = (value, kind) => {
          const constant = inner.constantValue(value);
          if (constant === null) innerConstraints.push({ value, kind });
          else guard(constant, kind);
        };
        const entries = compile(node.body, innerScope, inner, innerGuard, depth + 1);
        for (const { value, kind } of innerConstraints) {
          // Prove sign from nonnegative coefficients after moving the lower
          // bound to zero. This covers every inner visit, not a sample of them.
          if (kind === "whole") unsupported();
          const moved = inner.at(value, inner.add(inner.variable, inner.constant(lower)));
          for (const polynomial of [moved.n, moved.d]) {
            polynomial.forEach((coefficient, i) => guard(coefficient,
              i === 0 && kind !== "nonnegative" ? "positive" : "nonnegative"));
          }
        }
        if (node.kind === "product") {
          const entry = scalar(entries, inner);
          const first = inner.constantValue(inner.at(entry, inner.constant(lower)));
          if (first !== null && F.isZero(first)) return vector(F.zero);
          const primitive = inner.antiproduct(entry);
          if (!primitive) unsupported();
          let answer;
          try {
            const end = inner.at(primitive, inner.constant(upper));
            const before = inner.at(primitive, inner.constant(F.add(lower, F.neg(F.one))));
            answer = inner.constantValue(inner.div(end, before));
          } catch (error) {
            if (!(error instanceof UFNError)) throw error;
            unsupported();
          }
          if (answer === null) unsupported();
          return vector(answer);
        }
        return entries.map(entry => {
          const sum = inner.sumPolynomial(entry, lower, upper);
          if (sum === null) unsupported();
          const value = inner.constantValue(sum);
          if (value === null) unsupported();
          return value;
        });
      }
      unsupported();
    }
    const value = compile(body, new Map([[name, [field.variable, field.zero, field.zero, field.zero]]]), field, rootGuard);
    function signOnVisits(expression, strict) {
      const shifted = field.shift(expression, rational(counts.fromNumber(start)));
      const sign = polynomial => {
        const signs = polynomial.map(coefficient => rCompare(coefficient, ZERO));
        if (strict && signs[0] === 0) return 0;
        return signs.every(s => s >= 0) && signs.some(s => s > 0) ? 1
          : signs.every(s => s <= 0) && signs.some(s => s < 0) ? -1
          : signs.every(s => s === 0) ? 0 : null;
      };
      const numerator = sign(shifted.n), denominator = sign(shifted.d);
      if (denominator === null || denominator === 0 || numerator === null) return null;
      return numerator * denominator;
    }
    for (const { value: constraint, kind } of constraints) {
      if (kind === "whole") {
        const coefficients = field.polynomial(field.shift(constraint, rational(counts.fromNumber(start))));
        if (!coefficients || coefficients.some(coefficient => coefficient.d !== C1)) unsupported();
      } else {
        const sign = signOnVisits(constraint, kind !== "nonnegative");
        if (sign === null || (kind === "nonzero" ? sign === 0 : kind === "positive" ? sign !== 1 : sign < 0)) unsupported();
      }
    }
    return { field, value, candidates };
  }

  function rationalSeriesLimit(node, start, name, place, environment, context) {
    const { field, value, candidates } = rationalSequence(node.body, name, environment, context, start);
    if (place > 0 && value.slice(1).some(component => !field.isZero(component)))
      throw new MeasuredEntryError("A factor-measured entry must lie on the original path (@○)");
    const product = node.kind === "product";
    if (product && value.slice(1).some(component => !field.isZero(component)))
      throw new ExactLimit("This ordered product needs another convergence rule; its recipe is retained");
    const answer = (product ? value.slice(0, 1) : value).map((component, index) => {
      if (product && field.isZero(field.at(component, field.fromInteger(start)))) return ZERO;
      const candidate = !product && candidates.map(value => value[index]).find(candidate =>
        field.equal(field.add(candidate, field.neg(field.shift(candidate, rNegate(ONE)))), component));
      const primitive = candidate || (product ? field.antiproduct(component) : field.antidifference(component));
      if (!primitive) throw new ExactLimit("This rational series needs another summation rule; its recipe is retained");
      let destination;
      const constant = field.constantValue(primitive);
      if (constant !== null) destination = constant;
      else if (place > 0) throw new ExactLimit("A rational function of the whole counter needs a separate convergence proof at this measuring place");
      else if (primitive.n.length < primitive.d.length) destination = ZERO;
      else if (primitive.n.length === primitive.d.length) destination = rMultiply(primitive.n.at(-1), rational(primitive.d.at(-1).d, primitive.d.at(-1).n));
      else throw new UFNError("This telescoping " + node.kind + " has no finite limit under ordinary measurement");
      let previous;
      try { previous = field.constantValue(field.at(primitive, field.fromInteger(start - 1))); }
      catch (error) {
        if (!(error instanceof UFNError)) throw error;
        throw new ExactLimit("The starting boundary of this cancellation needs further reduction");
      }
      if (previous === null) throw new ExactLimit("The starting term of this telescoping sum needs further reduction");
      return product ? rMultiply(destination, rational(previous.d, previous.n)) : rSubtract(destination, previous);
    });
    return { answer: product ? exactValue(answer[0]) : answer, rule: "rational telescoping " + node.kind };
  }

  // Certify C * R^n structurally. Sampling a few entries would not prove this
  // identity for every visit. Unsupported forms stay exact recipes.
  function geometricForm(body, name, place, environment, context) {
    const constant = node => {
      const value = numerical(evaluate(node, environment, context, exactArithmetic));
      return place > 0 ? rationalScalar(value) : exactScalar(value, "Geometric entry");
    };
    function linear(node) {
      if (!dependsOn(node, name, context)) return { a: ZERO, b: asFraction(constant(node)) };
      if (node.type === "counter") return { a: ONE, b: ZERO };
      if (node.type === "sum") {
        let a = ZERO, b = ZERO;
        for (const [side, sign] of [[node.before, 1], [node.after, -1]]) for (const child of side) {
          const part = linear(child); if (!part) return null;
          a = rAdd(a, sign > 0 ? part.a : rNegate(part.a));
          b = rAdd(b, sign > 0 ? part.b : rNegate(part.b));
        }
        return { a, b };
      }
      if (node.type === "product") {
        let a = ZERO, b = ONE;
        for (const child of node.before) {
          const part = linear(child); if (!part || (!isZero(a) && !isZero(part.a))) return null;
          a = rAdd(rMultiply(a, part.b), rMultiply(b, part.a)); b = rMultiply(b, part.b);
        }
        for (const child of node.after) {
          const part = linear(child); if (!part || !isZero(part.a)) return null;
          const undo = rational(part.b.d, part.b.n);
          a = rMultiply(a, undo); b = rMultiply(b, undo);
        }
        return { a, b };
      }
      return null;
    }
    function form(node) {
      if (!dependsOn(node, name, context)) return { coefficient: constant(node), ratio: ONE };
      if (node.type === "power" && !dependsOn(node.base, name, context)) {
        const exponent = linear(node.exponent); if (!exponent) return null;
        const base = constant(node.base);
        if (isZero(base) || scalarNegative(base)) throw new UFNError("Power base must lie forward of ○ along @○");
        // At a factor measurement, require rational entries at every visit.
        // Ordinary measurement can also use supported exact roots.
        if (place > 0 && (exponent.a.d !== C1 || exponent.b.d !== C1)) return null;
        return { coefficient: scalarPower(base, exponent.b), ratio: scalarPower(base, exponent.a) };
      }
      if (node.type === "prime" && !dependsOn(node.position, name, context)) {
        const start = node.position ? exactInteger(numerical(evaluate(node.position, environment, context, exactArithmetic)), "Factor position", 1, MAX_POSITION) : 1;
        if (start + node.entries.length - 1 > MAX_POSITION) throw new UFNError("Factor position exceeds " + MAX_POSITION);
        const coefficient = new Map(), ratio = new Map();
        for (let i = 0; i < node.entries.length; i++) {
          const exponent = linear(node.entries[node.entries.length - i - 1]);
          if (!exponent || place > 0 && (exponent.a.d !== C1 || exponent.b.d !== C1)) return null;
          coefficient.set(start + i, exponent.b); ratio.set(start + i, exponent.a);
        }
        return { coefficient: monomial(coefficient), ratio: monomial(ratio) };
      }
      if (node.type === "product") {
        let coefficient = ONE, ratio = ONE;
        for (const [side, undo] of [[node.before, false], [node.after, true]]) for (const child of side) {
          const part = form(child); if (!part) return null;
          coefficient = scalarMultiply(coefficient, undo ? scalarInverse(part.coefficient) : part.coefficient);
          ratio = scalarMultiply(ratio, undo ? scalarInverse(part.ratio) : part.ratio);
        }
        return { coefficient, ratio };
      }
      if (node.type === "sum") {
        let coefficient = ZERO, ratio = null;
        for (const [side, sign] of [[node.before, 1], [node.after, -1]]) for (const child of side) {
          const part = form(child); if (!part) return null;
          if (ratio && !isZero(scalarAdd(ratio, scalarNegate(part.ratio)))) return null;
          ratio = part.ratio;
          coefficient = scalarAdd(coefficient, sign > 0 ? part.coefficient : scalarNegate(part.coefficient));
        }
        return { coefficient, ratio: ratio || ONE };
      }
      return null;
    }
    return form(body);
  }
  function geometricTerms(body, name, place, environment, context) {
    const zeroVector = value => value.every(isZero);
    function group(terms) {
      const grouped = [];
      for (const term of terms) {
        if (zeroVector(term.coefficient)) continue;
        const same = grouped.find(previous => isZero(scalarAdd(previous.ratio, scalarNegate(term.ratio))));
        if (same) same.coefficient = exactAdd(same.coefficient, term.coefficient);
        else grouped.push({ ...term });
      }
      if (grouped.length > MAX_ROOT_TERMS) throw new ExactLimit("Too many geometric terms to combine");
      return grouped.filter(term => !zeroVector(term.coefficient));
    }
    function combine(left, right) {
      if (left.length * right.length > MAX_ROOT_PAIRS) throw new ExactLimit("Too many geometric pairs to combine");
      return group(left.flatMap(a => right.map(b => ({
        coefficient: exactMultiply(a.coefficient, b.coefficient), ratio: scalarMultiply(a.ratio, b.ratio),
      }))));
    }
    function terms(node, allowDirected = false) {
      if (!dependsOn(node, name, context)) {
        const coefficient = numerical(evaluate(node, environment, context, exactArithmetic));
        if (place > 0 && !allowDirected) rationalScalar(coefficient);
        return [{ coefficient, ratio: ONE }];
      }
      if (node.type === "sum") {
        const result = [];
        for (const [side, backward] of [[node.before, false], [node.after, true]]) for (const child of side) {
          const part = terms(child, allowDirected); if (part === null) return null;
          result.push(...part.map(term => ({ ...term, coefficient: backward ? exactNegate(term.coefficient) : term.coefficient })));
        }
        return group(result);
      }
      if (node.type === "product") {
        let before = [{ coefficient: exactValue(ONE), ratio: ONE }], after = [{ coefficient: exactValue(ONE), ratio: ONE }];
        for (const child of node.before) { const part = terms(child, allowDirected); if (part === null) return null; before = combine(before, part); }
        for (const child of node.after) { const part = terms(child, allowDirected); if (part === null) return null; after = combine(after, part); }
        after = group(after);
        if (after.length === 0) throw new UFNError("Division by zero");
        if (after.length !== 1) return null;
        return combine(before, [{ coefficient: exactArithmetic.inverse(after[0].coefficient), ratio: scalarInverse(after[0].ratio) }]);
      }
      if (node.type === "basis") {
        if (dependsOn(node.label, name, context)) return null;
        const label = exactInteger(numerical(evaluate(node.label, environment, context, exactArithmetic)), "Direction label", 0, 3);
        const part = terms(node.coefficient, allowDirected); if (part === null) return null;
        const result = part.map(term => {
          const coefficient = exactValue(ZERO); coefficient[label] = exactScalar(term.coefficient, "Direction coefficient");
          if (place > 0 && !allowDirected) rationalScalar(coefficient);
          return { ...term, coefficient };
        });
        return group(result);
      }
      if (node.type === "component") {
        if (dependsOn(node.label, name, context)) return null;
        const label = exactInteger(numerical(evaluate(node.label, environment, context, exactArithmetic)), "Component label", 0, 3);
        const part = terms(node.argument, true); if (part === null) return null;
        return group(part.map(term => {
          const coefficient = exactValue(term.coefficient[label]);
          if (place > 0 && !allowDirected) rationalScalar(coefficient);
          return { ...term, coefficient };
        }));
      }
      if (node.type === "prime" || node.type === "power") {
        const part = geometricForm(node, name, place, environment, context);
        return part ? [{ coefficient: exactValue(part.coefficient), ratio: part.ratio }] : null;
      }
      return null;
    }
    return terms(body);
  }
  function rangeLimit(node, start, name, place, environment, context) {
    return withLimits(context, () => {
      let answer, rule;
      const constantProduct = node.kind === "product" && !dependsOn(node.body, name, context);
      if (constantProduct) {
        const factorValue = numerical(evaluate(node.body, environment, context, exactArithmetic));
        rule = "constant product";
        const size = place > 0 ? rationalScalar(factorValue)
          : factorValue.reduce((norm, value) => scalarAdd(norm, scalarMultiply(value, value)), ZERO);
        if (isOne(factorValue[0]) && factorValue.slice(1).every(isZero)) answer = ONE;
        else if (smallerThanOne(size, place)) answer = ZERO;
        else throw new UFNError("This constant product has no limit at the selected measuring place");
      } else if (node.kind === "sum") {
        const forms = geometricTerms(node.body, name, place, environment, context);
        if (forms === null) {
          const result = rationalSeriesLimit(node, start, name, place, environment, context);
          context.limitProofs.push({ place, kind: node.kind, rule: result.rule });
          return result.answer;
        }
        rule = forms.length > 1 ? "sum of geometric series" : "geometric sum";
        let result = exactValue(ZERO);
        for (const form of forms) {
          if (form.coefficient.every(isZero)) continue;
          if (!smallerThanOne(form.ratio, place)) {
            if (forms.length > 1) throw new ExactLimit("Some geometric components need another convergence proof; the complete recipe is retained");
            throw new UFNError("This geometric sum has no limit at the selected measuring place: its entries do not approach ○");
          }
          const scale = scalarMultiply(scalarPower(form.ratio, rational(counts.fromNumber(start))), scalarInverse(scalarAdd(ONE, scalarNegate(form.ratio))));
          result = exactAdd(result, form.coefficient.map(value => scalarMultiply(value, scale)));
        }
        context.limitProofs.push({ place, kind: node.kind, rule });
        return result;
      } else {
        const result = rationalSeriesLimit(node, start, name, place, environment, context);
        context.limitProofs.push({ place, kind: node.kind, rule: result.rule });
        return result.answer;
      }
      context.limitProofs.push({ place, kind: node.kind, rule });
      return exactValue(answer);
    });
  }
  const isSequence = value => value?.kind === "sequence";
  const isRecipe = value => value?.kind === "recipe";
  const sequenceExpression = node => {
    if (!node) return false;
    if (node.type === "defined") return sequenceExpression(node.body);
    if (node.type === "selection") {
      let source = node.source;
      while (source.type === "defined") source = source.body;
      // When every possible entry is a sequence, an unfinished lookup
      // still has a sequence result, even if its place is not known yet.
      if (source.type === "sequence") return source.before.length > 0 && source.before.every(sequenceExpression);
      return source.kind === "sequence" && sequenceExpression(source.body);
    }
    return node.type === "sequence" || node.kind === "sequence";
  };
  function numerical(value) {
    if (isSequence(value)) throw new UFNError("A sequence is not a number; select a numerical entry or use a square or curly range to combine entries");
    if (isRecipe(value)) throw new ExactLimit(value.reason);
    return value;
  }
  function retainedSequence(items, context) {
    context.sequenceEntries += items.length;
    if (context.sequenceEntries > 30000) throw new UFNError("Too many retained entries; shorten a sequence");
    return { kind: "sequence", items };
  }
  function sequenceEntry(node, environment, context, arithmetic) {
    try { return evaluate(node, environment, context, arithmetic); }
    catch (error) {
      if (arithmetic !== exactArithmetic || !(error instanceof counts.Limit)) throw error;
      const inspect = (child, limits = context.limits) => {
        if (!child || typeof child !== "object") return;
        if (child.type === "defined" || child.type === "range" && child.measurement) limits = true;
        if (child.type === "range" && !child.end && !limits) context.partialKinds.add(child.kind);
        Object.values(child).forEach(value => Array.isArray(value) ? value.forEach(part => inspect(part, limits)) : inspect(value, limits));
      };
      inspect(node);
      // Each unfinished entry keeps the counter values from its own visit.
      // Later visits must not change the retained recipe or its projection.
      return { kind: "recipe", node, environment: new Map(environment), limits: context.limits,
        reason: error.message || "This entry needs more symbolic reduction" };
    }
  }
  function evaluate(node, environment, context, arithmetic) {
    const { real, add, sub, mul, inverse, finite, asReal, asInteger, positive, power, primePower } = arithmetic;
    const ev = child => numerical(evaluate(child, environment, context, arithmetic));
    let value;
    switch (node.type) {
      case "atom": return real(node.value === "○" ? 0 : node.value === "◠" ? 1 : -1);
      case "constant":
        // A name refers to the complete value, never a finite prefix of its
        // defining range. Its decimal projection cannot enter exact arithmetic.
        if (arithmetic.constant) return arithmetic.constant(node.name);
        throw new ExactLimit(constants[node.name].symbol + " names " + constants[node.name].description + "; it stays in the exact recipe");
      case "counter": {
        const name = counterName(node, context, arithmetic);
        if (!environment.has(name)) throw new UFNError("Unbound counter " + node.name);
        const bound = environment.get(name);
        if (arithmetic === exactArithmetic && Array.isArray(bound) && bound.some(component => typeof component === "number"))
          throw new ExactLimit("A decimal entry cannot supply an exact limit proof");
        return Array.isArray(bound) || isSequence(bound) || isRecipe(bound) ? bound : real(bound);
      }
      case "defined": {
        if (arithmetic === approximateArithmetic) {
          try {
            const proofContext = evaluationContext(context.terms);
            const exact = counts.withBudget(10000000, () => withLimits(proofContext,
              () => evaluate(node.body, environment, proofContext, exactArithmetic)));
            return projectRetained(exact, proofContext);
          } catch (error) {
            if (error instanceof counts.Limit) throw new UFNError("A definition names a complete limit; this unresolved recipe has no decimal projection");
            throw error;
          }
        }
        return withLimits(context, () => evaluate(node.body, environment, context, arithmetic));
      }
      case "sequence":
        return retainedSequence(node.before.map(child => sequenceEntry(child, environment, context, arithmetic)), context);
      case "sequence-input": {
        const items = node.entries.map(child => sequenceEntry(child, environment, context, arithmetic));
        if (items.length === 1 && isRecipe(items[0]) && sequenceExpression(items[0].node))
          throw new ExactLimit(items[0].reason);
        // A sole sequence expression supplies the source itself. An explicit
        // outer pair, ((...)), preserves a sequence as a single nested entry.
        return items.length === 1 && isSequence(items[0]) ? items[0] : retainedSequence(items, context);
      }
      case "selection": {
        // Read the complete source once, including entries not selected.
        // Selection must not hide a detected undefined operation elsewhere.
        const source = evaluate(node.source, environment, context, arithmetic);
        if (isRecipe(source)) throw new ExactLimit(source.reason);
        if (!isSequence(source)) throw new UFNError("Entry lookup needs a sequence source");
        const place = asInteger(ev(node.place), "Entry place", 0, 30000);
        if (place >= source.items.length) throw new UFNError(source.items.length
          ? "Entry place is outside this sequence" : "An empty sequence has no entry places");
        return source.items[source.items.length - 1 - place];
      }
      case "sequence-range": {
        // Evaluate every entry before binding either visit name. Values may
        // have four components; written order also governs curly folds.
        const source = evaluate(node.source, environment, context, arithmetic);
        if (isRecipe(source)) throw new ExactLimit(source.reason);
        if (!isSequence(source)) throw new UFNError("A sequence range needs a sequence source");
        const entries = source.items;
        const entryName = counterName(node.entry, context, arithmetic);
        const placeName = counterName(node.place, context, arithmetic);
        if (entryName === placeName) throw new UFNError("A sequence range needs two distinct names");
        const local = new Map(environment);
        const retained = [];
        value = real(node.kind === "sum" ? 0 : 1);
        for (let i = 0; i < entries.length; i++) {
          if (++context.iterations > 30000) throw new UFNError("Too many generated terms; shorten a range");
          local.set(entryName, entries[i]);
          local.set(placeName, entries.length - 1 - i);
          if (node.kind === "sequence") {
            retained.push(sequenceEntry(node.body, local, context, arithmetic));
            continue;
          }
          const term = numerical(evaluate(node.body, local, context, arithmetic));
          value = node.kind === "sum" ? add(value, term) : mul(value, term);
          finite(value);
        }
        if (node.kind === "sequence") return retainedSequence(retained, context);
        break;
      }
      case "prime": {
        const start = node.position ? asInteger(ev(node.position), "Factor position", 1, MAX_POSITION) : 1;
        if (start + node.entries.length - 1 > MAX_POSITION) throw new UFNError("Factor position exceeds " + MAX_POSITION);
        let product = real(1);
        for (let i = 0; i < node.entries.length; i++) {
          const exponent = asReal(ev(node.entries[node.entries.length - 1 - i]), "Entry between angle brackets");
          product = mul(product, primePower(start + i, exponent));
        }
        value = product; break;
      }
      case "sum": {
        value = real(0);
        for (const part of node.before) value = add(value, ev(part));
        for (const part of node.after) value = sub(value, ev(part));
        break;
      }
      case "product": {
        value = real(1);
        for (const part of node.before) value = mul(value, ev(part));
        let denominator = real(1);
        for (const part of node.after) denominator = mul(denominator, ev(part));
        value = mul(value, inverse(denominator)); break;
      }
      case "power": {
        if (arithmetic === exactArithmetic && exponentialBase(node.base, environment, context))
          return exactTurnPower(node.exponent, environment, context);
        const base = asReal(ev(node.base), "Power base");
        if (!positive(base)) throw new UFNError("Power base must lie forward of ○ along @○");
        if (arithmetic === exactArithmetic && node.exponent.type === "logarithm") {
          const logBase = asReal(ev(node.exponent.base), "Logarithm base");
          if (!positive(logBase)) throw new UFNError("Logarithm base must lie forward of ○ along @○");
          if (isOne(logBase)) throw new UFNError("A logarithm base cannot be ◠: its powers all give ◠");
          const target = ev(node.exponent.argument);
          checkLogarithmTarget(target);
          // Taking a principal logarithm and then its power recovers the
          // target. The reverse can lose whole turns and is not rewritten.
          if (samePositiveScalar(base, logBase)) value = target;
          else value = power(base, arithmetic.logarithm(logBase, target));
          break;
        }
        value = power(base, ev(node.exponent)); break;
      }
      case "logarithm": {
        if (arithmetic === exactArithmetic && exponentialBase(node.base, environment, context, "Logarithm base")) {
          const target = ev(node.argument);
          checkLogarithmTarget(target);
          if (target.slice(1).every(isZero) && isOne(target[0])) return exactValue(ZERO);
          throw new ExactLimit("This logarithm of the exponential constant remains an exact recipe; a decimal reading is available");
        }
        const base = asReal(ev(node.base), "Logarithm base");
        if (!positive(base)) throw new UFNError("Logarithm base must lie forward of ○ along @○");
        if (arithmetic.isOne(base)) throw new UFNError("A logarithm base cannot be ◠: its powers all give ◠");
        value = arithmetic.logarithm(base, ev(node.argument)); break;
      }
      case "basis": {
        const coefficient = asReal(ev(node.coefficient), "Direction coefficient");
        const label = asInteger(ev(node.label), "Direction label", 0, 3);
        value = real(0); value[label] = coefficient; break;
      }
      case "component": {
        const label = asInteger(ev(node.label), "Component label", 0, 3);
        const argument = ev(node.argument);
        if (arithmetic.component) return arithmetic.component(argument, label);
        value = real(0); value[0] = argument[label]; break;
      }
      case "index": {
        if (arithmetic.index) return arithmetic.index(ev(node.argument));
        const target = asInteger(ev(node.argument), "Position lookup (*)", 2, Number.MAX_SAFE_INTEGER);
        for (let i = 1; i <= MAX_POSITION; i++) {
          const candidate = prime(i);
          if (candidate === target) return real(i);
          if (candidate > target) break;
        }
        throw new UFNError("* requires a unique factor within the position limit");
      }
      case "range": {
        if (arithmetic.range) {
          const resolved = arithmetic.range(node, environment, context);
          if (resolved) return resolved;
        }
        let place = 0;
        if (node.measurement) {
          if (arithmetic !== exactArithmetic) {
            // A proved rational limit may enter ordinary arithmetic. Resolve it
            // exactly before any decimal projection, including inside powers.
            const proofContext = context.proofContext || (context.proofContext = evaluationContext(context.terms));
            const proved = evaluate(node, environment, proofContext, exactArithmetic);
            return proved.map(scalarNumber);
          }
          place = withLimits(context, () => exactInteger(ev(node.measurement), "Measuring place", 0, MAX_POSITION));
          context.measurements.add(place);
        }
        const exactBounds = node.measurement || context.limits || node === context.previewTarget;
        const bound = child => exactBounds ? withLimits(context, () => ev(child)) : ev(child);
        const start = asInteger(bound(node.start), "Range start", 0, MAX_RANGE);
        const end = node.end ? asInteger(bound(node.end), "Range end", 0, MAX_RANGE) : start + context.terms - 1;
        const name = counterName(node.counter, context, arithmetic);
        if (!node.end && node !== context.previewTarget && (node.measurement || context.limits)) {
          if (sequenceExpression(node.body)) numerical({ kind: "sequence" });
          try { return rangeLimit(node, start, name, place, environment, context); }
          catch (error) {
            if (place === 0 && error instanceof MeasuredEntryError) throw new ExactLimit("This limit needs another exact rule; its recipe is retained");
            throw error;
          }
        }
        if (!node.end) context.partialKinds.add(node.kind);
        const previous = environment.get(name), hadPrevious = environment.has(name);
        const retained = [];
        value = real(node.kind === "sum" ? 0 : 1);
        try {
          for (let n = start; n <= end; n++) {
            if (++context.iterations > 30000) throw new UFNError("Too many generated terms; shorten a range");
            environment.set(name, n);
            if (node.kind === "sequence") {
              retained.push(sequenceEntry(node.body, environment, context, arithmetic));
              continue;
            }
            const term = node.measurement || node === context.previewTarget ? withLimits(context, () => ev(node.body)) : ev(node.body);
            if (place > 0) rationalScalar(term);
            value = node.kind === "sum" ? add(value, term) : mul(value, term);
            finite(value);
          }
        } finally {
          if (hadPrevious) environment.set(name, previous);
          else environment.delete(name);
        }
        if (node.kind === "sequence") return retainedSequence(retained, context);
        break;
      }
      default: throw new UFNError("Unknown expression");
    }
    return finite(value);
  }
  function evaluationContext(terms = 24) {
    return { terms: Math.max(1, Math.min(500, Math.floor(Number(terms) || 24))), partialKinds: new Set(),
      iterations: 0, sequenceEntries: 0, limits: false, measurements: new Set(), limitProofs: [], previewTarget: null };
  }
  function projectRetained(value, context) {
    if (isSequence(value)) return retainedSequence(value.items.map(item => projectRetained(item, context)), context);
    if (!isRecipe(value)) return value.map(scalarNumber);
    if (value.limits && childrenSome(value.node, node => node.type === "range" && !node.end))
      throw new UFNError("An unresolved complete limit has no decimal projection");
    const environment = new Map([...value.environment].map(([key, bound]) =>
      [key, typeof bound === "number" ? bound : projectRetained(bound, context)]));
    return evaluate(value.node, environment, context, approximateArithmetic);
  }
  const projectedEntries = value => isSequence(value) ? value.items.map(projectedEntries) : value;

  // Turn a retained entry back into self-contained writing. Bound visit values
  // become literals; private template names get distinct printable names.
  function retainedSource(value, context) {
    let sequenceHelper = false;
    const occupied = new Set();
    const inspectNames = item => {
      if (isSequence(item)) item.items.forEach(inspectNames);
      else if (isRecipe(item)) childrenSome(item.node, node => {
        if (isCounterNode(node)) occupied.add(node.name[0]);
        return false;
      });
    };
    inspectNames(value);
    const helper = ["♧", "♤", "♢", "♡"].find(symbol => !occupied.has(symbol));
    const text = item => {
      if (isSequence(item)) {
        let result = "(";
        for (const [index, entry] of item.items.entries()) {
          result += (index ? " " : "") + text(entry);
          if (result.length >= MAX_SOURCE) throw new ExactLimit("The retained sequence is too long to display in full");
        }
        return result + ")";
      }
      if (!isRecipe(item)) return boundedExactRecipe(item, "An entry's spelling");
      const used = new Set(), names = new Map();
      childrenSome(item.node, node => {
        if (isCounterNode(node) && node.binding === undefined) used.add(writtenCounterName(node));
        return false;
      });
      let nextName = 1, writtenSize = 0;
      const literal = source => {
        writtenSize += source.length;
        if (writtenSize > MAX_SOURCE) throw new ExactLimit("This entry's recipe is too long to display in full");
        return { type: "literal", source };
      };
      const rename = counter => {
        if (counter.binding === undefined) return counter;
        if (!names.has(counter.binding)) {
          let name;
          do {
            if (nextName > MAX_POSITION) throw new ExactLimit("Too many local names to display this entry");
            name = "□⌊" + encodeInteger(nextName++) + "⌋";
          } while (used.has(name));
          used.add(name); names.set(counter.binding, name);
        }
        return { ...counter, name: names.get(counter.binding) };
      };
      const close = (node, environment, limits) => {
        if (!node || typeof node !== "object") return node;
        if (Array.isArray(node)) return node.map(child => close(child, environment, limits));
        if (node.type === "counter") {
          const key = counterName(node, context, exactArithmetic);
          if (environment.has(key)) {
            const bound = environment.get(key);
            return literal(typeof bound === "number" ? encodeInteger(bound)
              : isSequence(bound) ? text(bound) : "[" + text(bound) + "]");
          }
          return rename(node);
        }
        if (node.type === "defined") return close(node.body, environment, true);
        if (node.type === "sequence-input") {
          // A capture may refer to a visit that has not happened yet. Close
          // its syntax without evaluating that locally bound name early.
          const entries = node.entries.map(child => close(child, environment, limits));
          if (entries.length === 1) {
            const only = entries[0];
            if (sequenceExpression(only)) return only;
            if (["counter", "literal", "selection"].includes(only.type)) {
              if (!helper) throw new ExactLimit("No free symbol for a retained sequence capture");
              sequenceHelper = true;
              return literal(helper + "⟪" + formatTree(only) + "⟫");
            }
          }
          return { type: "sequence", before: entries, after: [] };
        }
        if (node.type === "range" || node.type === "sequence-range") {
          const bodyEnvironment = new Map(environment);
          for (const counter of node.type === "range" ? [node.counter] : [node.entry, node.place])
            bodyEnvironment.delete(counterName(counter, context, exactArithmetic));
          if (node.type === "sequence-range") return { ...node, entry: rename(node.entry), place: rename(node.place),
            source: close(node.source, environment, limits), body: close(node.body, bodyEnvironment, limits) };
          return { ...node, counter: rename(node.counter), start: close(node.start, environment, limits),
            end: close(node.end, environment, limits), body: close(node.body, bodyEnvironment, limits),
            measurement: close(node.measurement, environment, limits) || (!node.end && limits ? { type: "atom", value: "○" } : null) };
        }
        return Object.fromEntries(Object.entries(node).map(([key, child]) => [key, close(child, environment, limits)]));
      };
      return formatTree(close(item.node, item.environment, item.limits));
    };
    let result = text(value);
    if (sequenceHelper) result = "≔(" + helper + "⟪□⌊◠⌋⟫ : (□⌊⟨◠⟩⌋ □⌊⟨◠○⟩⌋ : □⌊◠⌋ : □⌊⟨◠⟩⌋))\n\n" + result;
    if (result.length > MAX_SOURCE) throw new ExactLimit("The retained sequence is too long to display in full");
    return result;
  }
  function sequenceResult(sequence, source, ast, context, options) {
    const complete = value => !isRecipe(value) && (!isSequence(value) || value.items.every(complete));
    const make = value => {
      const kind = isSequence(value) ? "sequence" : "number";
      let canonical = null, spelling, display, projected;
      if (kind === "number" && !isRecipe(value)) {
        try { canonical = counts.withBudget(10000000, () => formatExact(value)); }
        catch (error) { if (!(error instanceof counts.Limit)) throw error; }
      }
      const items = isSequence(value) ? value.items.map(make) : null;
      return {
        kind, canonical, items, established: complete(value),
        reason: isRecipe(value) ? value.reason : null,
        get ufn() {
          if (spelling === undefined) {
            try { spelling = counts.withBudget(10000000, () => retainedSource(value, context)); }
            catch (error) { if (!(error instanceof counts.Limit)) throw error; spelling = null; }
          }
          return spelling;
        },
        get display() {
          if (display === undefined) display = canonical ? shorterSpelling(canonical) : this.ufn;
          return display;
        },
        get value() {
          if (projected === undefined) projected = counts.withBudget(10000000,
            () => projectedEntries(projectRetained(value, evaluationContext(context.terms))));
          return projected;
        },
      };
    };
    const result = make(sequence);
    result.kind = "sequence";
    return Object.defineProperties(result, {
      ast: { value: ast, enumerable: true },
      source: { value: normalizeSource(source), enumerable: true },
      reduced: { value: null, enumerable: true },
      partial: { get: () => context.partialKinds.size > 0, enumerable: true },
      partialKind: { get: () => context.partialKinds.size > 1 ? "mixed" : context.partialKinds.values().next().value || null, enumerable: true },
      measurements: { value: [...context.measurements], enumerable: true },
      limitProofs: { value: context.limitProofs.slice(), enumerable: true },
      iterations: { value: context.iterations, enumerable: true },
      previewOnly: { value: options.previewOnly, enumerable: true },
      limitRequested: { value: options.limitRequested, enumerable: true },
    });
  }
  function compute(source, terms = 24) { return evaluateSource(source, terms, false); }
  function preview(source, terms = 24) { return evaluateSource(source, terms, true); }
  function limit(source) { return evaluateSource(source, 24, false, true); }
  function evaluateSource(source, terms, previewOnly, limitRequested = false) {
    const ast = new Parser(source).parse();
    if (ast.type === "declarations") return {
      ast, declarationOnly: true, definitionCount: ast.count, canonical: null, reduced: null,
      ufn: normalizeSource(source), display: normalizeSource(source), partial: false, partialKind: null,
      measurements: [], limitProofs: [], iterations: 0,
      reason: "Definitions recorded for this input. Add an expression below them to calculate a value.",
      get value() { throw new UFNError("A declaration has no numerical value"); },
    };
    const context = evaluationContext(terms);
    context.limits = limitRequested;
    if (previewOnly) {
      if (ast.type !== "range" || ast.end !== null) throw new UFNError("A partial preview needs a complete unbounded range");
      context.previewTarget = ast;
    }
    const hasMeasurement = childrenSome(ast, node => node.type === "range" && node.measurement);
    let exact = null, canonical = null, reason = null, reduced = null;
    try {
      counts.withBudget(10000000, () => {
        exact = evaluate(ast, new Map(), context, exactArithmetic);
        if (isSequence(exact)) return;
        numerical(exact);
        if (exact.some(isSum)) reduced = boundedExactRecipe(exact);
        canonical = formatExact(exact);
      });
    } catch (error) {
      if (!(error instanceof counts.Limit)) throw error;
      reason = error.message || "The expression needs more symbolic reduction";
    }
    // A selected unfinished sequence keeps the sequence result API too.
    if (isRecipe(exact) && sequenceExpression(exact.node))
      return sequenceResult(exact, source, ast, context, { previewOnly, limitRequested });
    // A selected unfinished numerical entry is not a component vector.
    if (isRecipe(exact)) exact = null;
    if (isSequence(exact)) return sequenceResult(exact, source, ast, context, { previewOnly, limitRequested });
    if (!exact && sequenceExpression(ast)) return sequenceResult({ kind: "recipe", node: ast, environment: new Map(),
      limits: limitRequested, reason }, source, ast, context, { previewOnly, limitRequested });
    function unboundedKinds(node, kinds = new Set()) {
      if (!node || typeof node !== "object") return kinds;
      if (node.type === "defined") return kinds;
      if (node.type === "range" && node.end === null && (!node.measurement || node === context.previewTarget)) kinds.add(node.kind);
      for (const value of Object.values(node)) {
        if (Array.isArray(value)) value.forEach(child => unboundedKinds(child, kinds));
        else unboundedKinds(value, kinds);
      }
      return kinds;
    }
    let approximate = null, approximateContext = null, display = null, components;
    function partialKind() {
      // Completed evaluations know which ranges were visited. If reduction
      // stopped, conservatively include unbounded ranges still in the recipe.
      const kinds = approximateContext ? approximateContext.partialKinds : exact || hasMeasurement || limitRequested ? context.partialKinds : unboundedKinds(ast);
      return kinds.size > 1 ? "mixed" : kinds.values().next().value || null;
    }
    return {
      kind: "number", ufn: canonical || normalizeSource(source), canonical, reduced, reason, ast,
      measurements: [...context.measurements], limitProofs: context.limitProofs.slice(), previewOnly, limitRequested,
      get display() {
        if (display === null) display = canonical || reduced ? shorterSpelling(canonical || reduced) : normalizeSource(source);
        return display;
      },
      get components() {
        if (components === undefined) {
          components = null;
          if (exact) {
            try {
              components = counts.withBudget(10000000, () => Object.freeze(exact.map(component =>
                boundedExactRecipe(exactValue(component), "A component spelling"))));
            } catch (error) {
              if (!(error instanceof counts.Limit)) throw error;
            }
          }
        }
        return components;
      },
      get partial() { return partialKind() !== null; },
      get partialKind() { return partialKind(); },
      get iterations() { return approximateContext ? approximateContext.iterations : exact ? context.iterations : null; },
      // This optional projection is deliberately lazy. Exact reduction does
      // not evaluate decimal magnitudes, even for enormous factor powers.
      get value() {
        if (!approximate) {
          if (exact) approximate = exact.map(scalarNumber);
          else {
            if (previewOnly || limitRequested) throw new UFNError("An unresolved limit recipe has no ordinary decimal projection; inspect its finite partial results");
            approximateContext = evaluationContext(context.terms);
            try {
              approximate = hasMeasurement ? counts.withBudget(10000000, () => evaluate(ast, new Map(), approximateContext, approximateArithmetic))
                : evaluate(ast, new Map(), approximateContext, approximateArithmetic);
            } catch (error) {
              approximateContext = null;
              if (hasMeasurement && error instanceof counts.Limit)
                throw new UFNError("An unresolved limit recipe has no ordinary decimal projection; inspect its rational partial results");
              throw error;
            }
          }
        }
        return approximate;
      },
    };
  }
  function measure(gapSource, placeSource = "○") {
    return counts.withBudget(10000000, () => {
      const context = evaluationContext(); context.limits = true;
      const place = exactInteger(numerical(evaluate(new Parser(placeSource).parse(), new Map(), context, exactArithmetic)), "Measuring place", 0, MAX_POSITION);
      const gap = rationalScalar(numerical(evaluate(new Parser(gapSource).parse(), new Map(), context, exactArithmetic)));
      return compute(formatExact(exactValue(measuredSize(gap, place))));
    });
  }

  // Differentiate a recipe along X + hV, with a named input supplied by the
  // caller. Dual coefficients carry exact values and their first-order changes.
  // No finite-difference samples or decimal arithmetic establish the result.
  function differentiate(source, options = {}) {
    const { at = "○", along = "◠", counter = "□" } = options;
    const ast = new Parser(source).parse(), input = new Parser(counter).parse();
    if (input.type !== "counter") throw new UFNError("Choose a named counter for the input");
    const context = evaluationContext(); context.limits = true;
    const rules = new Set();
    let answer = null, canonical = null, reason = null, point = null, direction = null, recipe = null;
    counts.withBudget(10000000, () => {
      const name = counterName(input, context, exactArithmetic);
      const constant = value => ({ value, change: ZERO, constant: true });
      const lift = value => value.map(constant);
      const values = value => value.map(component => component.value);
      const changes = value => value.map(component => component.change);
      const cZero = constant(ZERO), cOne = constant(ONE);
      const knownZero = a => a.constant && isZero(a.value);
      const dNeg = a => ({ value: scalarNegate(a.value), change: scalarNegate(a.change), constant: a.constant });
      const dAdd = (a, b) => knownZero(a) ? b : knownZero(b) ? a : ({
        value: scalarAdd(a.value, b.value), change: scalarAdd(a.change, b.change), constant: a.constant && b.constant,
      });
      const dMul = (a, b) => knownZero(a) || knownZero(b) ? cZero : ({
        value: scalarMultiply(a.value, b.value),
        change: scalarAdd(scalarMultiply(a.change, b.value), scalarMultiply(a.value, b.change)),
        constant: a.constant && b.constant,
      });
      const dInverse = a => {
        const reciprocal = scalarInverse(a.value);
        return { value: reciprocal, change: scalarNegate(scalarMultiply(scalarMultiply(reciprocal, a.change), reciprocal)), constant: a.constant };
      };
      const vector = scalar => [scalar, cZero, cZero, cZero];
      const arithmetic = {
        real: n => Array.isArray(n) ? n : lift(exactArithmetic.real(n)),
        finite: value => value,
        add(a, b) { rules.add("join rule"); return a.map((value, i) => dAdd(value, b[i])); },
        sub(a, b) { rules.add("undo rule"); return a.map((value, i) => dAdd(value, dNeg(b[i]))); },
        mul(a, b) {
          rules.add("ordered product rule");
          return quaternionTerms.map(terms => terms.reduce((sum, [i, j, sign]) => {
            const term = dMul(a[i], b[j]); return dAdd(sum, sign < 0 ? dNeg(term) : term);
          }, cZero));
        },
        inverse(a) {
          rules.add("inverse rule");
          const norm = a.reduce((sum, entry) => dAdd(sum, dMul(entry, entry)), cZero);
          const reciprocal = dInverse(norm);
          return a.map((entry, i) => dMul(i ? dNeg(entry) : entry, reciprocal));
        },
        asReal(a, description) {
          exactScalar(values(a), description);
          if (!a.slice(1).every(knownZero))
            throw new ExactLimit(description + " must stay on @○ along the chosen input route");
          return a[0];
        },
        asInteger(a, description, min, max) {
          if (!a.every(entry => entry.constant))
            throw new ExactLimit(description + " must stay fixed while differentiating this recipe");
          return exactInteger(values(a), description, min, max);
        },
        positive: a => !isZero(a.value) && !scalarNegative(a.value),
        isOne: a => isOne(a.value),
        component(value, label) { rules.add("component rule"); return vector(value[label]); },
        power(base, exponent) {
          if (base.constant && isOne(base.value)) return vector(cOne);
          if (!exponent.every(entry => entry.constant))
            throw new ExactLimit("A changing exponent needs a logarithm rule; this derivative is retained as a recipe");
          rules.add("fixed exponent rule");
          const power = exactArithmetic.power(base.value, values(exponent));
          const change = exactMultiply(power, exactMultiply(values(exponent), exactValue(scalarMultiply(base.change, scalarInverse(base.value)))));
          return power.map((value, i) => ({ value, change: change[i], constant: base.constant }));
        },
        logarithm(base, target) {
          if (isOne(base.value)) throw new UFNError("A logarithm base cannot be ◠: its powers all give ◠");
          checkLogarithmTarget(values(target));
          if (!base.constant || !target.every(entry => entry.constant))
            throw new ExactLimit("A changing logarithm needs a differentiation rule with a natural logarithm; this derivative is retained as a recipe");
          return lift(exactArithmetic.logarithm(base.value, values(target)));
        },
        primePower(position, exponent) {
          if (!exponent.constant)
            throw new ExactLimit("A changing factor instruction needs a logarithm rule; this derivative is retained as a recipe");
          return lift(exactArithmetic.primePower(position, exponent.value));
        },
        index(argument) {
          if (!argument.every(entry => entry.constant))
            throw new ExactLimit("A position lookup does not define a derivative along a changing input");
          return lift(exactArithmetic.index(values(argument)));
        },
        range(node, environment) {
          if (node.end) { rules.add("finite counter rule"); return null; }
          const changing = value => isSequence(value) ? value.items.some(changing)
            : Array.isArray(value) && value.some(component => !component.constant);
          const changesThroughEntry = [...environment].some(([boundName, value]) =>
            changing(value) && dependsOn(node, boundName, context));
          if (dependsOn(node, name, context) || changesThroughEntry)
            throw new ExactLimit("Differentiating an endless range needs a proof for interchanging its limit and derivative");
          const primal = value => isSequence(value) ? { kind: "sequence", items: value.items.map(primal) }
            : Array.isArray(value) ? values(value) : value;
          const bound = new Map([...environment].map(([key, value]) => [key, primal(value)]));
          return lift(numerical(evaluate(node, bound, context, exactArithmetic)));
        },
      };
      try {
        point = numerical(evaluate(new Parser(at).parse(), new Map(), context, exactArithmetic));
        direction = numerical(evaluate(new Parser(along).parse(), new Map(), context, exactArithmetic));
        const bound = point.map((value, i) => ({ value, change: direction[i], constant: isZero(direction[i]) }));
        answer = changes(numerical(evaluate(ast, new Map([[name, bound]]), context, arithmetic)));
        recipe = boundedExactRecipe(answer, "The derivative's reduced spelling");
        canonical = formatExact(answer);
      } catch (error) {
        if (!(error instanceof counts.Limit)) throw error;
        reason = error.message || "This derivative needs another exact rule";
      }
    });
    return {
      source: normalizeSource(source), at: normalizeSource(at), along: normalizeSource(along), counter,
      canonical, ufn: canonical || recipe, established: answer !== null, reason, rules: [...rules],
      get display() { return canonical ? shorterSpelling(canonical) : recipe; },
      get value() {
        if (!answer) throw new UFNError("This derivative has not been established; a finite difference is only a preview");
        return answer.map(scalarNumber);
      },
    };
  }
  function formatNumber(n) {
    if (n === 0) return "0";
    if (Number.isInteger(n) && Math.abs(n) < 1e15) return String(n);
    return Number(n.toPrecision(12)).toString();
  }
  function formatSource(source, width = 76) {
    const parser = new Parser(source), tree = parser.parse();
    // Preserve declarations and the matched writing, including leading entries.
    // The expanded AST contains private bindings rather than printable names.
    if (parser.language.count) return normalizeSource(source).trim();
    const formatted = formatTree(tree, width);
    if (formatted.length <= MAX_SOURCE) {
      try { new Parser(formatted).parse(); return formatted; }
      catch (error) { if (!(error instanceof UFNError)) throw error; }
    }
    return normalizeSource(source);
  }
  const brackets = kind => kind === "sequence" ? ["(", ")"] : kind === "sum" ? ["[", "]"] : ["{", "}"];
  function expand(source, width = 76) {
    const parser = new Parser(source), ast = parser.parse();
    if (ast.type === "declarations") return { written: "", expanded: "", definitionCount: ast.count, sequenceHelper: false };
    const used = new Set(), names = new Map();
    childrenSome(ast, node => {
      if (isCounterNode(node) && node.binding === undefined) used.add(writtenCounterName(node));
      return false;
    });
    let nextName = 1, sequenceHelper = false;
    const rename = counter => {
      if (counter.binding === undefined) return counter;
      if (!names.has(counter.binding)) {
        let name;
        do {
          if (nextName > MAX_POSITION) throw new UFNError("Too many local names to display the expansion");
          name = "□⌊" + encodeInteger(nextName++) + "⌋";
        } while (used.has(name));
        used.add(name); names.set(counter.binding, name);
      }
      return { ...counter, name: names.get(counter.binding) };
    };
    const rewrite = (node, limits = false) => {
      if (!node || typeof node !== "object") return node;
      if (Array.isArray(node)) return node.map(child => rewrite(child, limits));
      if (isCounterNode(node)) return rename(node);
      if (node.type === "defined") return rewrite(node.body, true);
      if (node.type === "sequence-input") {
        const entries = node.entries.map(child => rewrite(child, limits));
        if (entries.length === 1) {
          const only = entries[0];
          if (sequenceExpression(only)) return only;
          if (["counter", "literal", "selection"].includes(only.type)) {
            // Its kind can depend on a surrounding visit. Preserve the
            // capture's scalar-or-sequence rule without evaluating that visit.
            sequenceHelper = true;
            return { type: "literal", source: "◇⟪" + formatTree(only, width) + "⟫" };
          }
        }
        return { type: "sequence", before: entries, after: [] };
      }
      const copy = Object.fromEntries(Object.entries(node).map(([key, child]) => [key, rewrite(child, limits)]));
      if (node.type === "range" && !node.end && limits && !node.measurement)
        copy.measurement = { type: "atom", value: "○" };
      return copy;
    };
    let expanded = formatTree(rewrite(ast), width);
    if (sequenceHelper) expanded = "≔(◇⟪□⌊◠⌋⟫ : (□⌊⟨◠⟩⌋ □⌊⟨◠○⟩⌋ : □⌊◠⌋ : □⌊⟨◠⟩⌋))\n\n" + expanded;
    if (expanded.length > MAX_SOURCE) throw new UFNError("The expansion is too long to display; the original writing is still available");
    // The view is copyable source, with the same scope and limit choices.
    new Parser(expanded).parse();
    return { written: parser.source.slice(parser.expressionStart).trim(), expanded,
      definitionCount: parser.language.count, sequenceHelper };
  }
  function formatTree(tree, width = 76) {
    const cache = new WeakMap();
    const powerPart = node => node.type === "basis" || node.type === "component" ? "[" + flat(node) + "]" : flat(node);
    function flat(node) {
      if (cache.has(node)) return cache.get(node);
      let text;
      switch (node.type) {
        case "literal": text = node.source; break;
        case "atom": text = node.value; break;
        case "constant": text = constants[node.name].symbol; break;
        case "counter": text = node.name; break;
        case "prime": text = "⟨" + node.entries.map(flat).join("") + "⟩" + (node.position ? "⌊" + flat(node.position) + "⌋" : ""); break;
        case "selection": text = powerPart(node.source) + "⌊" + flat(node.place) + "⌋"; break;
        case "power": text = powerPart(node.base) + "⌈" + flat(node.exponent) + "⌉"; break;
        case "logarithm": text = node.base.type === "power"
          ? powerPart(node.base.base) + "⌈" + flat(node.base.exponent) + "|" + flat(node.argument) + "⌉"
          : powerPart(node.base) + "⌈|" + flat(node.argument) + "⌉"; break;
        case "basis": text = powerPart(node.coefficient) + "@" + powerPart(node.label); break;
        case "component": text = flat(node.argument) + "#" + powerPart(node.label); break;
        case "index": {
          const argument = flat(node.argument);
          // A lookup takes a primary. Upper and direction attachments
          // need an extra square pair to keep them inside a legacy argument.
          text = "*" + (["power", "logarithm", "basis", "component", "selection"].includes(node.argument.type) ? "[" + argument + "]" : argument);
          break;
        }
        case "sum": case "product": case "sequence": {
          const [open, close] = brackets(node.type);
          text = open + node.before.map(flat).join(" ") + (node.after.length ? (node.before.length ? " | " : "|") + node.after.map(flat).join(" ") : "") + close;
          break;
        }
        case "range": {
          const [open, close] = brackets(node.kind);
          text = open + node.counter.name + " : " + flat(node.start) + " …" + (node.end ? " " + flat(node.end) : "")
            + " : " + flat(node.body) + close + (node.measurement ? "⌊" + flat(node.measurement) + "⌋" : "");
          break;
        }
        case "sequence-range": {
          const [open, close] = brackets(node.kind);
          text = open + node.entry.name + " " + node.place.name + " : " + flat(node.source) + " : " + flat(node.body) + close;
          break;
        }
        default: throw new UFNError("Unknown expression");
      }
      cache.set(node, text); return text;
    }
    const target = Number.isFinite(width) ? Math.max(32, Math.min(120, Math.floor(width))) : 76;
    function render(node, indent) {
      const text = flat(node);
      if (text.length + indent <= target) return text;
      const padding = " ".repeat(indent), childPadding = padding + "  ";
      if (node.type === "range") {
        const [open, close] = brackets(node.kind);
        return open + node.counter.name + " : " + flat(node.start) + " …" + (node.end ? " " + flat(node.end) : "")
          + " :\n" + childPadding + render(node.body, indent + 2) + "\n" + padding + close
          + (node.measurement ? "⌊" + flat(node.measurement) + "⌋" : "");
      }
      if (node.type === "sequence-range") {
        const [open, close] = brackets(node.kind);
        return open + node.entry.name + " " + node.place.name + " :\n" + childPadding + render(node.source, indent + 2)
          + "\n" + padding + ":\n" + childPadding + render(node.body, indent + 2) + "\n" + padding + close;
      }
      if (node.type === "sum" || node.type === "product" || node.type === "sequence") {
        const [open, close] = brackets(node.type);
        const parts = node.before.map(child => childPadding + render(child, indent + 2));
        if (node.after.length) parts.push(childPadding + "|", ...node.after.map(child => childPadding + render(child, indent + 2)));
        return open + "\n" + parts.join("\n") + "\n" + padding + close;
      }
      if (node.type === "power") return powerPart(node.base) + "⌈\n" + childPadding + render(node.exponent, indent + 2) + "\n" + padding + "⌉";
      if (node.type === "selection") return render(node.source, indent) + "⌊" + flat(node.place) + "⌋";
      if (node.type === "basis") return (["basis", "component"].includes(node.coefficient.type) ? powerPart(node.coefficient) : render(node.coefficient, indent)) + "@" + powerPart(node.label);
      if (node.type === "component") return render(node.argument, indent) + "#" + powerPart(node.label);
      return text;
    }
    return render(tree, 0);
  }
  function formatValue(v) {
    if (v.length === 0 || Array.isArray(v[0])) return "(" + v.map(formatValue).join(", ") + ")";
    if (v.slice(1).every(x => x === 0)) return formatNumber(v[0]);
    const labels = ["", "i", "j", "k"], pieces = [];
    v.forEach((n, i) => {
      if (n === 0) return;
      const magnitude = formatNumber(Math.abs(n));
      const part = i === 0 ? magnitude : (magnitude === "1" ? "" : magnitude) + labels[i];
      pieces.push({ negative: n < 0, text: part });
    });
    return pieces.map((p, i) => (i ? p.negative ? " − " : " + " : p.negative ? "−" : "") + p.text).join("") || "0";
  }
  function formatWholeUFN(value) {
    if (!value.every(n => Number.isSafeInteger(n) && Math.abs(n) <= 10000)) return null;
    if (value.slice(1).every(n => n === 0)) return encodeInteger(value[0]);
    const labels = ["○", "◠", "⟨◠ ⟩", "⟨◠○ ⟩"];
    const parts = value.flatMap((n, i) => n === 0 ? [] : [encodeInteger(n) + "@" + labels[i]]);
    return parts.length === 1 ? parts[0] : "[" + parts.join(" ") + "]";
  }
  const api = { Parser, UFNError, constants, compute, limit, preview, measure, differentiate, expand, formatSource, formatValue, formatWholeUFN, normalizeSource, encodeInteger };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.UFN = api;

})(typeof globalThis !== "undefined" ? globalThis : this);
