(function (root) {
  "use strict";

  const UFN = typeof module !== "undefined" && module.exports ? require("./ufn.js") : root.UFN;
  const { Parser, UFNError, compute, encodeInteger, normalizeSource } = UFN;
  const spelling = n => encodeInteger(n).replace(/\s/gu, "");
  const counterName = node => node.label === "◠" ? node.name.slice(0, -3) : node.name;

  function checkNames(node, bound, used) {
    if (!node || typeof node !== "object") return;
    if (node.type === "counter") {
      const name = counterName(node);
      used.add(name);
      if (!bound.has(name)) throw new UFNError("Unbound counter " + node.name);
    } else if (node.type === "range") {
      const name = counterName(node.counter);
      used.add(name);
      checkNames(node.start, bound, used);
      checkNames(node.end, bound, used);
      checkNames(node.measurement, bound, used);
      checkNames(node.body, new Set([...bound, name]), used);
    } else {
      for (const value of Object.values(node)) {
        if (Array.isArray(value)) value.forEach(child => checkNames(child, bound, used));
        else checkNames(value, bound, used);
      }
    }
  }

  // This is a structural property of canonical factor instructions. No
  // decimal projection is used to recognize whole inputs or their poles.
  function forwardWhole(node) {
    return node.type === "atom" ? node.value === "○" || node.value === "◠"
      : node.type === "prime" && node.position === null && node.entries.every(forwardWhole);
  }
  function backwardWhole(node) {
    return node.type === "atom" ? node.value === "◡"
      : node.type === "sum" && node.before.length === 0 && node.after.length === 1
        && forwardWhole(node.after[0]);
  }

  function prepare(source) {
    const ast = new Parser(source).parse(), used = new Set();
    checkNames(ast, new Set(), used);
    const resolved = UFN.limit(source);
    const input = resolved.canonical || resolved.reduced ? resolved : compute(source);
    const canonical = !input.partial && input.canonical ? new Parser(input.canonical).parse() : null;
    if (canonical && backwardWhole(canonical))
      throw new UFNError("The factorial has a pole at a backward whole count on @○");
    const names = [];
    for (let i = 1; names.length < 2; i++) {
      const name = i === 1 ? "□" : "□⌊" + spelling(i) + "⌋";
      if (!used.has(name)) names.push(name);
    }
    // Group the complete input before attaching powers or adjoining a count.
    // A proved input can use its exact value. Unresolved endless inputs keep
    // their complete recipes; their finite previews never replace the input.
    const exactInput = !input.partial && (input.canonical || input.reduced);
    return { input, q: "[" + (exactInput || normalizeSource(source)) + "]",
      names, whole: Boolean(canonical && forwardWhole(canonical)) };
  }

  function stage(count, context) {
    const { q, names: [, visit] } = context;
    return "{[" + count + "]⌈" + q + "⌉ {" + visit + " : ◠ … " + count
      + " : {" + visit + " | [" + q + " " + visit + "]}}}";
  }
  function limit(context, measured = false) {
    const [count] = context.names;
    return "[" + stage("◠", context) + " [" + count + " : ⟨◠⟩ … : ["
      + stage(count, context) + " | " + stage("[" + count + " | ◠]", context) + "]]" + (measured ? "⌊○⌋" : "") + "]";
  }
  function stageCount(count) {
    if (!Number.isInteger(count) || count < 1 || count > 512)
      throw new RangeError("Choose a stage from one through five hundred twelve");
    return spelling(count);
  }
  function approximation(source, count = 32) {
    return stage(stageCount(count), prepare(source));
  }
  function definition(source) { return limit(prepare(source)); }
  function measuredDefinition(source) { return limit(prepare(source), true); }

  function describe(source, count = 32) {
    const context = prepare(source);
    const finiteSource = stage(stageCount(count), context);
    const finite = compute(finiteSource);
    const definition = limit(context);
    let wholeSource = null, wholeResult = null, wholeReason = null;
    if (context.whole) {
      const [counter] = context.names;
      wholeSource = "{" + counter + " : ◠ … " + context.input.canonical + " : " + counter + "}";
      try { wholeResult = compute(wholeSource); }
      catch (error) {
        if (!(error instanceof UFNError) || !error.message.startsWith("Range end")) throw error;
        wholeReason = "This whole-count factorial exceeds the evaluator's range bound; its finite recipe is retained.";
      }
    }
    return { input: context.input, definition, measuredDefinition: limit(context, true), finiteSource, finite, wholeSource, wholeResult, wholeReason };
  }

  const api = { approximation, definition, measuredDefinition, describe };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.UFNFactorial = api;

  if (typeof document === "undefined") return;
  const demo = document.getElementById("factorial-demo");
  if (!demo) return;
  const get = name => document.getElementById("factorial-" + name);
  let current = null;
  function preview() {
    get("preview").hidden = !get("decimal").checked;
    if (!get("decimal").checked || !current) return;
    try {
      const labels = ["○", "◠", "⟨◠⟩", "⟨◠○⟩"];
      const value = current.finite.value;
      get("preview").textContent = value.every(Number.isFinite)
        ? "Decimal reading of this finite stage: " + value.map((n, i) => Number(n.toPrecision(10)) + " @" + labels[i]).join("; ")
        : "This finite stage exceeds the decimal preview's range.";
    } catch (error) { get("preview").textContent = error.message; }
  }
  function update() {
    try {
      current = describe(get("input").value, Number(get("stage").value));
      get("results").hidden = false;
      get("error").textContent = "";
      get("answer").textContent = UFN.formatSource(current.wholeResult?.display || current.wholeSource || current.measuredDefinition);
      get("answer-label").textContent = current.wholeResult?.canonical ? "Exact factorial in UFN"
        : current.wholeSource ? "Whole-count factorial recipe" : "Factorial as an exact limit recipe";
      get("finite").textContent = UFN.formatSource(current.finite.display);
      get("finite-label").textContent = current.finite.canonical || current.finite.reduced
        ? "Exact value of the selected finite stage" : "Selected finite stage, retained as a recipe";
      get("finite-source").textContent = UFN.formatSource(current.finiteSource);
      get("definition").textContent = UFN.formatSource(current.measuredDefinition);
      get("try-finite").dataset.example = current.finiteSource;
      get("try-definition").dataset.example = current.measuredDefinition;
      get("try-partial").dataset.example = current.definition;
      get("try-whole").hidden = !current.wholeSource;
      if (current.wholeSource) get("try-whole").dataset.example = current.wholeSource;
      get("status").textContent = current.wholeReason || (current.wholeSource
        ? "The finite whole-count rule gives the factorial directly. The selected stage below is an approximation from its general definition."
        : "The factorial is defined by the limit above. The selected stage below approximates it; a finite stage does not certify the limit or an error bound.");
      if (current.input.partial) get("status").textContent += " The input is itself an endless recipe; finite previews truncate it too.";
      preview();
    } catch (error) {
      current = null;
      get("results").hidden = true;
      get("error").textContent = error.message;
    }
  }
  get("form").addEventListener("submit", event => { event.preventDefault(); update(); });
  get("stage").addEventListener("change", update);
  get("decimal").addEventListener("change", preview);
  demo.querySelectorAll("[data-factorial-input]").forEach(button => button.addEventListener("click", () => {
    get("input").value = button.dataset.factorialInput;
    update();
  }));
  update();
})(typeof globalThis !== "undefined" ? globalThis : this);
