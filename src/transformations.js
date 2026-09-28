(function (root) {
  "use strict";
  const node = typeof module !== "undefined" && module.exports;
  const UFN = node ? require("./ufn.js") : root.UFN;
  const library = node ? require("./library.js") : root.UFNLibrary;
  const matrix = node ? require("./matrix.js") : root.UFNMatrix;
  const swap = "((○ ◠) (◠ ○))";
  const scenarios = Object.freeze([
    { title: "Swap, then resize", first: swap, later: "((⟨◠⟩ ○) (○ ◠))", input: "(⟨◠⟩ ⟨◠○⟩)",
      firstReading: "Swap the two entries.", laterReading: "Double the first entry; keep the second.",
      undoLater: "((⟨◡⟩ ○) (○ ◠))", undoFirst: swap,
      undoReading: "First halve the first entry. Then swap the entries back." },
    { title: "Reverse and join, then swap", first: "((◠ ○) (◡ ◠))", later: swap, input: "(⟨◠⟩ ◠)",
      firstReading: "Keep the first entry. Reverse it and join the second to make the next answer.", laterReading: "Swap the answers.",
      undoLater: swap, undoFirst: "((◠ ○) (◠ ◠))",
      undoReading: "First swap back. Then join the first amount to the second to undo the earlier reversal." },
    { title: "Two ordered direction changes", first: "((◠@◠))", later: "((◠@⟨◠⟩))", input: "(◠)",
      firstReading: "Apply the change ◠@◠.", laterReading: "Apply ◠@⟨◠⟩ to that answer.",
      undoLater: "((◡@⟨◠⟩))", undoFirst: "((◡@◠))",
      undoReading: "Undo the later direction change first, then undo the earlier one. Keep this order." },
    { title: "Keep one entry; lose the other", first: "((◠ ○))", later: "((⟨◠⟩))", input: "(⟨◠⟩ ◠)",
      firstReading: "Keep the first entry. The second contributes no steps.", laterReading: "Double the one remaining entry.",
      undoReading: "Another input gives the same output. The missing entry cannot be recovered from that output alone." },
  ].map(Object.freeze));
  const declared = expression => library.declarations(["matrix-compose"]) + "\n\n" + expression;
  function explore(index, inputSource = scenarios[index]?.input) {
    const scenario = scenarios[index];
    if (!scenario) throw new matrix.MatrixInputError("Choose one of the transformation examples.");
    // The walkthrough validates finite numerical inputs and uses the same
    // exact engine as the declarations. Native counts only choose an example.
    const first = matrix.apply(scenario.first, inputSource);
    const compositeForm = `▧⟪${scenario.later} : ${scenario.first}⟫`;
    const compositeSource = declared(compositeForm), composite = UFN.compute(compositeSource);
    const laterForm = `▦⟪${scenario.later} : ▦⟪${scenario.first} : ${inputSource}⟫⟫`;
    const laterSource = declared(laterForm), later = UFN.compute(laterSource);
    const singleSource = declared(`▦⟪${compositeForm} : ${inputSource}⟫`), single = UFN.compute(singleSource);
    const result = { scenario, input: first.input, first: first.answer, later, composite, single,
      sources: { first: first.source, later: laterSource, composite: compositeSource, single: singleSource } };
    if (scenario.undoLater) {
      result.sources.undo = declared(`▦⟪${scenario.undoFirst} : ▦⟪${scenario.undoLater} : ${laterForm}⟫⟫`);
      result.recovered = UFN.compute(result.sources.undo);
      const undoForm = `▧⟪${scenario.undoFirst} : ${scenario.undoLater}⟫`;
      result.identityAfter = UFN.compute(declared(`▧⟪${undoForm} : ${compositeForm}⟫`));
      result.identityBefore = UFN.compute(declared(`▧⟪${compositeForm} : ${undoForm}⟫`));
    } else {
      // Change only the dropped entry, using UFN joining. This works for
      // edited inputs too; it does not assume the original example's amounts.
      const alternativeForm = `(${inputSource}⌊◠⌋ [${inputSource}⌊○⌋ ◠])`;
      result.alternative = UFN.compute(alternativeForm);
      result.sources.undo = declared(`▦⟪${scenario.later} : ▦⟪${scenario.first} : ${alternativeForm}⟫⟫`);
      result.alternativeAnswer = UFN.compute(result.sources.undo);
    }
    return result;
  }
  const api = Object.freeze({ scenarios, explore });
  if (node) { module.exports = api; return; }
  root.UFNTransformations = api;
  const panel = document.getElementById("transform-demo"); if (!panel) return;
  const get = name => document.getElementById("transform-" + name);
  const code = text => { const el = document.createElement("code"); el.textContent = text; return el; };
  const display = value => value.display || value.ufn || "Open the exact recipe in the playground.";
  let current, stage = 0, timer;
  function draw() {
    const s = current.scenario;
    get("first-table").textContent = s.first; get("later-table").textContent = s.later;
    get("first-reading").textContent = s.firstReading; get("later-reading").textContent = s.laterReading;
    get("start").textContent = display(current.input);
    get("first-answer").textContent = display(current.first);
    get("later-answer").textContent = display(current.later);
    get("composite").textContent = display(current.composite);
    get("single-answer").textContent = display(current.single);
    get("first-result").hidden = stage < 1; get("later-result").hidden = stage < 2;
    get("combined-result").hidden = stage < 3; get("undo-result").hidden = stage < 4;
    get("next").disabled = stage === 4; get("back").disabled = stage === 0;
    get("restart").disabled = stage === 0;
    get("next").textContent = ["Apply the first change", "Apply the next change", "Try the combined table", s.undoLater ? "Undo the changes" : "Compare another input", "All steps shown"][stage];
    get("undo-title").textContent = s.undoLater ? "Undo in reverse order" : "Two inputs, one output";
    get("undo-reading").textContent = s.undoReading;
    const parts = get("undo-writing"); parts.replaceChildren();
    get("identity-check").hidden = !s.undoLater;
    if (s.undoLater) {
      get("identity-after").textContent = display(current.identityAfter);
      get("identity-before").textContent = display(current.identityBefore);
    }
    if (s.undoLater) {
      parts.append("Undo the later change with ", code(s.undoLater), ". Then undo the first with ", code(s.undoFirst), ".");
      get("undo-answer").textContent = display(current.recovered);
      get("undo-answer-caption").textContent = "The original input returns.";
    } else {
      parts.append("Change only the second input entry: ", code(display(current.alternative)), ".");
      get("undo-answer").textContent = display(current.alternativeAnswer);
      get("undo-answer-caption").textContent = "The same final output. It does not tell us which second entry was supplied.";
    }
    get("status").textContent = ["Predict the first answer before applying the change.", "Use this answer as the next change's input.", "Can one table give this same result from the original input?", "The single table gives the same answer. Can the input be recovered?", s.undoLater ? "The undoing changes restore the input." : "Different inputs meet at the same output."][stage];
    get("try").dataset.example = current.sources[["first", "later", "later", "single", "undo"][stage]];
  }
  function update() {
    clearTimeout(timer); stage = 0;
    try {
      current = explore(Number(get("scenario").value), get("input").value);
      get("error").hidden = true; get("work").hidden = false; get("try").disabled = false; draw();
    } catch (error) {
      current = null; get("error").textContent = error.message; get("error").hidden = false;
      get("work").hidden = true; get("try").disabled = true; delete get("try").dataset.example;
    }
  }
  scenarios.forEach((scenario, i) => { const option = document.createElement("option"); option.value = i; option.textContent = scenario.title; get("scenario").append(option); });
  get("scenario").addEventListener("change", () => { get("input").value = scenarios[Number(get("scenario").value)].input; update(); });
  const edited = () => { clearTimeout(timer); current = null; get("work").hidden = true; get("try").disabled = true; delete get("try").dataset.example; timer = setTimeout(update, 180); };
  get("input").addEventListener("input", edited); get("input").addEventListener("ufn-input", edited);
  get("next").addEventListener("click", () => { if (current && stage < 4) { stage++; draw(); } });
  get("back").addEventListener("click", () => { if (current && stage) { stage--; draw(); } });
  get("restart").addEventListener("click", () => { if (current) { stage = 0; draw(); } });
  panel.hidden = false; update();
})(typeof globalThis !== "undefined" ? globalThis : this);
