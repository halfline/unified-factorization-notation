(function (root) {
  "use strict";

  // Written forms are parsed here; their arithmetic remains in the UFN engine.
  // Templates hold syntax trees, never executable JavaScript or text substitution.
  const pairs = { "⟦": "⟧", "⟪": "⟫", "⟨": "⟩", "[": "]", "{": "}", "(": ")", "⌊": "⌋", "⌈": "⌉" };
  const closes = new Set(Object.values(pairs));
  const reserved = new Set([ ..."○◠◡□*⟨[{⌊⌈@#|:…≔()", ...closes ]);

  class Language {
    constructor({ Error, key, constants, maxDepth = 64 }) {
      Object.assign(this, { Error, key, constants, maxDepth });
      this.forms = [];
      this.reading = false;
      this.serial = 0;
      this.work = 0;
      this.count = 0;
    }
    spend() {
      if (++this.work > 50000) throw new this.Error("Definition matching or expansion is too large");
    }
    fail(message, parser) { throw new this.Error(message, parser?.at); }
    read(parser) {
      if (++this.count > 64) this.fail("Too many declarations; use at most 64", parser);
      parser.need("≔"); parser.need("(");
      const tokens = [], captures = new Map(), stack = [];
      while (parser.peek() && !(parser.peek() === ":" && !stack.length)) {
        this.spend();
        const char = parser.peek();
        if (tokens.length && parser.nameStart()) {
          const counter = parser.counter(), key = this.key(counter);
          if (captures.has(key)) this.fail("Use each argument name once in the pattern", parser);
          captures.set(key, counter);
          tokens.push({ key });
          continue;
        }
        if (char === "≔") this.fail("A declaration cannot be part of a pattern", parser);
        if (pairs[char]) stack.push(pairs[char]);
        else if (closes.has(char) && stack.pop() !== char) this.fail("Unmatched bracket in definition pattern", parser);
        parser.at += char.length;
        tokens.push({ literal: char });
      }
      if (stack.length) this.fail("Unclosed bracket in definition pattern", parser);
      parser.need(":");
      if (!tokens.length || !tokens[0].literal) this.fail("Begin a pattern with a new literal symbol", parser);
      const first = tokens[0].literal;
      const literal = tokens.every(token => token.literal) ? tokens.map(token => token.literal).join("") : null;
      const builtin = Object.values(this.constants).find(constant => constant.symbol === literal);
      if (reserved.has(first) || /[\p{L}\p{N}]/u.test(first) ||
          (first === "┌" || first === "⟳") && !builtin)
        this.fail("A definition must introduce a new symbolic form, without replacing existing notation", parser);
      // One leading symbol selects one pattern. This keeps matching deterministic
      // and rules out ambiguous overloads and changes to existing parses.
      if (this.forms.some(form => form.first === first)) this.fail("This leading symbol already has a definition", parser);
      const start = parser.at;
      let raw;
      this.reading = true;
      try { raw = parser.expression(); }
      finally { this.reading = false; }
      const meaning = parser.source.slice(start, parser.at).replace(/\s/gu, "");
      parser.need(")");
      if (builtin) {
        if (meaning !== builtin.source.replace(/\s/gu, "")) this.fail("A supplied constant cannot be redefined", parser);
        return;
      }
      const kinds = new Map();
      const use = (key, kind) => {
        if (kinds.has(key) && kinds.get(key) !== kind) this.fail("An argument cannot be both a sequence and a numerical expression", parser);
        kinds.set(key, kind);
      };
      const sequence = (node, scope, visit) => {
        if (node.type === "counter") {
          const key = this.key(node);
          if (!scope.has(key) && captures.has(key)) {
            use(key, "sequence");
            return { type: "sequence-argument", key };
          }
        }
        return visit(node);
      };
      const compile = (node, scope = new Map(), depth = 0) => {
        this.spend();
        if (!node || typeof node !== "object") return node;
        if (depth > this.maxDepth) this.fail("Definition meaning is nested too deeply", parser);
        const visit = (child, names = scope) => compile(child, names, depth + 1);
        if (Array.isArray(node)) return node.map(child => compile(child, scope, depth));
        if (node.type === "counter") {
          const key = this.key(node);
          if (scope.has(key)) return { ...node, binding: scope.get(key) };
          if (!captures.has(key)) this.fail("A definition's free names must be captured in its pattern: " + node.name, parser);
          use(key, "expression");
          return { type: "argument", key };
        }
        if (node.type === "range" || node.type === "sequence-range") {
          const next = new Map(scope);
          const bind = counter => {
            const key = this.key(counter), binding = ++this.serial;
            next.set(key, binding);
            return { ...counter, binding };
          };
          if (node.type === "range") return { ...node, counter: bind(node.counter),
            start: visit(node.start), end: visit(node.end),
            measurement: visit(node.measurement), body: visit(node.body, next) };
          if (this.key(node.entry) === this.key(node.place)) this.fail("A sequence range needs two distinct names", parser);
          const source = sequence(node.source, scope, visit), entry = bind(node.entry), place = bind(node.place);
          return { type: node.type, kind: node.kind, source, entry, place, body: visit(node.body, next) };
        }
        if (node.type === "selection") return { ...node,
          source: sequence(node.source, scope, visit), place: visit(node.place) };
        if (node.type === "written") {
          const args = node.args.map(arg => {
            if (!Array.isArray(arg.value)) return { ...arg, value: visit(arg.value) };
            // Passing a single captured name to an earlier sequence argument
            // forwards that sequence. Otherwise these are individual entries.
            const only = arg.value.length === 1 && arg.value[0];
            if (only?.type === "counter" && captures.has(this.key(only)) && !scope.has(this.key(only)))
              return { ...arg, value: sequence(only, scope, visit) };
            return { ...arg, value: visit(arg.value) };
          });
          return { ...node, args };
        }
        return Object.fromEntries(Object.entries(node).map(([key, value]) => [key, visit(value)]));
      };
      const body = compile(raw);
      for (const key of captures.keys()) if (!kinds.has(key)) kinds.set(key, "expression");
      // A sequence ends at a literal delimiter; guessing a split between
      // adjacent captures would make one writing have several expansions.
      tokens.forEach((token, index) => {
        if (token.key && kinds.get(token.key) === "sequence" && !tokens[index + 1]?.literal)
          this.fail("Follow a sequence capture with a literal delimiter", parser);
        if (token.key && ["@", "#", "⌈", "⌊"].includes(tokens[index + 1]?.literal))
          this.fail("Separate a captured expression from the next literal with a delimiter", parser);
      });
      this.forms.push({ first, tokens, kinds, body });
    }
    matches(parser) { return this.forms.find(form => form.first === parser.peek()); }
    readUse(parser, form) {
      const args = [];
      for (let i = 0; i < form.tokens.length; i++) {
        this.spend();
        const token = form.tokens[i];
        if (token.literal) { parser.need(token.literal); continue; }
        let value;
        if (form.kinds.get(token.key) === "sequence") {
          value = [];
          const stop = form.tokens[i + 1].literal;
          while (parser.peek() && parser.peek() !== stop) {
            if (value.length >= 1000) this.fail("A captured sequence can contain at most 1000 entries", parser);
            this.spend(); value.push(parser.expression());
          }
        } else value = parser.expression();
        args.push({ key: token.key, value });
      }
      return { type: "written", form, args };
    }
    expand(tree) {
      const limitCache = new WeakMap();
      const walk = (node, args = new Map(), bindings = new Map(), depth = 0) => {
        this.spend();
        if (!node || typeof node !== "object") return node;
        if (depth > this.maxDepth) this.fail("Expanded expression is nested too deeply");
        if (Array.isArray(node)) return node.map(child => walk(child, args, bindings, depth));
        if (node.type === "argument" || node.type === "sequence-argument") return args.get(node.key);
        if (node.type === "written") {
          const supplied = new Map(node.args.map(arg => [arg.key, Array.isArray(arg.value)
            ? { type: "sequence-input", entries: walk(arg.value, args, bindings, depth) }
            : walk(arg.value, args, bindings, depth)]));
          const body = walk(node.form.body, supplied, new Map(), depth + 1);
          // A definition denotes the complete value of an endless recipe.
          // Plain input of that recipe can still request finite previews.
          return hasLimit(body) ? { type: "defined", body } : body;
        }
        if (node.type === "range" || node.type === "sequence-range") {
          const next = new Map(bindings);
          const bind = counter => {
            if (counter.binding === undefined) return counter;
            const binding = ++this.serial;
            next.set(counter.binding, binding);
            return { ...counter, binding };
          };
          if (node.type === "range") {
            const counter = bind(node.counter);
            return { ...node, counter, start: walk(node.start, args, bindings, depth + 1),
              end: walk(node.end, args, bindings, depth + 1), measurement: walk(node.measurement, args, bindings, depth + 1),
              body: walk(node.body, args, next, depth + 1) };
          }
          const source = walk(node.source, args, bindings, depth + 1);
          const entry = bind(node.entry), place = bind(node.place);
          return { type: node.type, kind: node.kind, source, entry, place, body: walk(node.body, args, next, depth + 1) };
        }
        if (node.type === "counter" && node.binding !== undefined)
          return { ...node, binding: bindings.get(node.binding) ?? node.binding };
        return Object.fromEntries(Object.entries(node).map(([key, value]) =>
          [key, walk(value, args, bindings, depth + (node.type ? 1 : 0))]));
      };
      const hasLimit = node => {
        this.spend();
        if (!node || typeof node !== "object") return false;
        if (limitCache.has(node)) return limitCache.get(node);
        if (node.type === "defined" || node.type === "range" && !node.end) return true;
        const found = Object.values(node).some(value => Array.isArray(value) ? value.some(hasLimit) : hasLimit(value));
        limitCache.set(node, found);
        return found;
      };
      return walk(tree);
    }
  }
  if (typeof module !== "undefined" && module.exports) module.exports = { Language };
  else root.UFNDefinitions = { Language };
})(typeof globalThis !== "undefined" ? globalThis : this);
