(function (root) {
  "use strict";
  const node = typeof module !== "undefined" && module.exports;
  const UFN = node ? require("./ufn.js") : root.UFN;
  const library = node ? require("./library.js") : root.UFNLibrary;
  const matrix = node ? require("./matrix.js") : root.UFNMatrix;
  const puzzles = Object.freeze([
    { title: "Keep and compare", table: "((◠ ○) (◡ ◠))", target: "(⟨◠○⟩ ◠)",
      hint: "The first answer keeps the first input. The next answer reverses that input, then joins the second.",
      explanation: "The first input must be three steps. Three backward steps joined with the second input must give one forward step, so the second input must be four steps. Both entries are fixed: exactly one input fits.",
      examples: ["(⟨◠○⟩ ⟨⟨◠⟩⟩)"], outcome: "one" },
    { title: "Join two entries", table: "((◠ ◠))", target: "(⟨◠○⟩)",
      hint: "The single row joins the two inputs. Could two different pairs finish at the same place?",
      explanation: "One step joined with two steps gives three. Two steps joined with one step also gives three. Choose the first amount, then join its undoing with three steps to find the second. Many inputs fit; the output does not tell how its amount was split.",
      examples: ["(◠ ⟨◠⟩)", "(⟨◠⟩ ◠)", "(○ ⟨◠○⟩)"], outcome: "many" },
    { title: "Copy the first entry twice", table: "((◠ ○) (◠ ○))", target: "(⟨◠○⟩ ◠)",
      hint: "Both rows do exactly the same thing. Can their answers differ?",
      explanation: "Both answers must equal the first input. The requested answers are three steps and one step, so they differ. No input fits this request. Changing the second entry cannot help: both rows give it no contribution.",
      examples: [], outcome: "none" },
  ].map(puzzle => Object.freeze({ ...puzzle, examples: Object.freeze(puzzle.examples) })));
  function check(index, inputSource) {
    const puzzle = puzzles[index];
    if (!puzzle) throw new matrix.MatrixInputError("Choose an input puzzle.");
    const work = matrix.apply(puzzle.table, inputSource);
    const outputForm = `▦⟪${puzzle.table} : ${inputSource}⟫`;
    // Compare by exact UFN differences. Decimal pictures and differently
    // written but equivalent inputs never determine a match.
    const gapSource = library.declarations(["matrix"]) + `\n\n(□⌊entry⌋ □⌊place⌋ : ${outputForm} : [□⌊entry⌋ | ${puzzle.target}⌊□⌊place⌋⌋])`;
    const gaps = UFN.compute(gapSource);
    const mismatch = gaps.items?.some(item => item.canonical !== null && item.canonical !== "○");
    const matches = mismatch ? false : gaps.items?.every(item => item.canonical === "○") ? true : null;
    return { puzzle, input: work.input, output: work.answer, target: UFN.compute(puzzle.target),
      gaps, matches, source: work.source, gapSource };
  }
  const api = Object.freeze({ puzzles, check });
  if (node) { module.exports = api; return; }
  root.UFNInputPuzzles = api;
  const panel = document.getElementById("input-puzzle"); if (!panel) return;
  const get = name => document.getElementById("puzzle-" + name);
  const display = result => result.display || result.ufn || "Open the exact recipe in the playground.";
  let current = null;
  function resetAttempt() {
    current = null; get("result").hidden = true; get("error").hidden = true;
    get("try").disabled = true; delete get("try").dataset.example;
    get("status").textContent = "Try an input, then check what the table gives.";
  }
  function choose() {
    const puzzle = puzzles[Number(get("choice").value)];
    get("table").textContent = puzzle.table; get("target").textContent = puzzle.target;
    get("hint-text").textContent = puzzle.hint; get("hint").open = false;
    get("explanation").textContent = puzzle.explanation; get("solution").open = false;
    const examples = get("examples"); examples.replaceChildren();
    puzzle.examples.forEach((input, index) => {
      const button = document.createElement("button"); button.type = "button";
      const label = document.createElement("span"); label.textContent = index ? "Try another input: " : "Try this input: ";
      const code = document.createElement("code"); code.textContent = input; button.append(label, code);
      button.addEventListener("click", () => { get("input").value = input; attempt(); }); examples.append(button);
    });
    get("input").value = "(○ ○)"; resetAttempt();
  }
  function attempt() {
    resetAttempt();
    try {
      current = check(Number(get("choice").value), get("input").value);
      get("output").textContent = display(current.output);
      get("gaps").textContent = display(current.gaps); get("result").hidden = false;
      get("status").textContent = current.matches === true
        ? "This input fits. Does the requested output determine it uniquely? Read the explanation when ready."
        : current.matches === false ? "This input does not fit. A nonzero gap shows which answer differs."
        : "The calculator cannot establish every gap yet. This attempt remains an exact recipe.";
      get("try").disabled = false; get("try").dataset.example = current.source;
    } catch (error) { get("error").textContent = error.message; get("error").hidden = false; get("status").textContent = "Fix the input spelling or length, then check again."; }
  }
  puzzles.forEach((puzzle, index) => { const option = document.createElement("option"); option.value = index; option.textContent = puzzle.title; get("choice").append(option); });
  get("choice").addEventListener("change", choose); get("check").addEventListener("click", attempt);
  get("input").addEventListener("input", resetAttempt); get("input").addEventListener("ufn-input", resetAttempt);
  get("input").addEventListener("keydown", event => { if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) { event.preventDefault(); attempt(); } });
  panel.hidden = false; choose();
})(typeof globalThis !== "undefined" ? globalThis : this);
