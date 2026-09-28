(function (root) {
  "use strict";
  const UFN = typeof module !== "undefined" && module.exports ? require("./ufn.js") : root.UFN;
  const library = typeof module !== "undefined" && module.exports ? require("./library.js") : root.UFNLibrary;
  const ordinal = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth"];
  const presets = Object.freeze([
    { title: "Keep and compare", table: "((◠ ○) (◡ ◠))", input: "(⟨◠⟩ ◠)" },
    { title: "Keep each input unchanged", table: "((◠ ○) (○ ◠))", input: "(⟨◠⟩ ◠)" },
    { title: "Rows with three entries", table: "((◠ ◠ ○) (○ ◡ ◠))", input: "(⟨◠⟩ ⟨◠○⟩ ⟨⟨◠⟩⟩)" },
    { title: "Ordered direction changes", table: "((◠@◠ ○) (○ ◠@⟨◠⟩))", input: "(◠@⟨◠⟩ ◠@◠)" },
    { title: "Empty rows", table: "(() ())", input: "()" },
  ].map(Object.freeze));
  class MatrixInputError extends UFN.UFNError {}
  const spelling = result => {
    const text = result.ufn;
    if (!text) throw new MatrixInputError("This entry is too long for the walkthrough. Try a shorter input in this panel.");
    return text;
  };
  function sequence(source, description) {
    const result = UFN.compute(source);
    if (result.kind !== "sequence") throw new MatrixInputError(description + " must be a sequence in parentheses, or a finite range that keeps its entries.");
    if (!result.items) throw new MatrixInputError(description + " needs a finite length the calculator can establish.");
    if (result.partial) throw new MatrixInputError(description + " contains a finite preview of an endless recipe. Use finite recipes or explicitly completed limits here.");
    return result;
  }
  function apply(tableSource, inputSource) {
    const table = sequence(tableSource, "The table"), input = sequence(inputSource, "The input");
    if (table.items.length > 6) throw new MatrixInputError("The walkthrough shows up to six rows. Larger tables can use the declaration in the main playground.");
    if (input.items.length > 8) throw new MatrixInputError("The walkthrough shows up to eight input entries. Larger tables can use the declaration in the main playground.");
    if (input.items.some(item => item.kind !== "number")) throw new MatrixInputError("Each input entry must be a number. Keep nested sequences for the table's rows.");
    table.items.forEach((row, index) => {
      const label = ordinal[index] + " row";
      if (row.kind !== "sequence" || !row.items) throw new MatrixInputError(label + " must be a finite sequence. Put its entries inside their own parentheses.");
      if (row.items.length !== input.items.length) throw new MatrixInputError(label + " has a different length from the input. Give every row one entry for each input entry.");
      if (row.items.some(item => item.kind !== "number")) throw new MatrixInputError(label + " must contain numbers. Another nested list cannot be combined as a row amount.");
    });
    const source = library.declarations(["matrix"]) + "\n\n▦⟪" + tableSource + " : " + inputSource + "⟫";
    const answer = UFN.compute(source), inputText = spelling(input), trace = [];
    const rows = table.items.map((row, rowIndex) => {
      const rowText = spelling(row), terms = [], contributions = [];
      const rowSource = library.declarations(["row-apply"]) + "\n\n⋄⟪" + rowText + " : " + inputText + "⟫";
      const total = UFN.compute(rowSource);
      const pairs = UFN.compute(library.declarations(["pair"]) + "\n⋈⟪" + rowText + " : " + inputText + "⟫");
      row.items.forEach((coefficient, column) => {
        // Every numerical operation uses the exact UFN engine. Native counts
        // only locate cells in the finite walkthrough.
        const first = spelling(coefficient), second = spelling(input.items[column]);
        const termSource = "{" + first + " " + second + "}";
        const result = UFN.compute(termSource);
        contributions.push(termSource);
        const term = { row: rowIndex, column, place: UFN.encodeInteger(row.items.length - 1 - column),
          first, second, source: termSource, result, joined: UFN.compute("[" + contributions.join(" ") + "]") };
        terms.push(term); trace.push(term);
      });
      return { source: rowSource, entries: row.items, pairs, terms, total };
    });
    return { source, table, input, rows, trace, answer };
  }
  const api = { apply, presets, MatrixInputError };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; return; }
  root.UFNMatrix = api;
  const demo = document.getElementById("matrix-demo"); if (!demo) return;
  const get = name => document.getElementById("matrix-" + name);
  const element = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  const code = text => element("code", text);
  const smallReadings = new Map([["○", "no steps"]]);
  const words = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
  words.forEach((word, index) => {
    smallReadings.set(UFN.encodeInteger(index + 1), word + " forward " + (index ? "steps" : "step"));
    smallReadings.set(UFN.encodeInteger(-index - 1), word + " backward " + (index ? "steps" : "step"));
  });
  const reading = answer => smallReadings.get(answer.canonical) || (answer.canonical
    ? "an amount shown in UFN" : "a contribution that remains an exact recipe");
  const display = answer => answer.display || answer.ufn || answer.source;
  let current = null, visited = 0, timer;
  function draw() {
    const complete = visited === current.trace.length;
    const active = current.trace[Math.max(0, visited - 1)];
    const heads = [element("th", "Table row")]; heads[0].scope = "col";
    current.input.items.forEach((item, index) => {
      const th = element("th"); th.scope = "col"; th.dataset.matrixColumn = index;
      th.append(element("span", ordinal[index] + " input", "matrix-cell-label"), code(display(item)));
      if (active?.column === index) th.classList.add("matrix-active");
      heads.push(th);
    });
    const last = element("th", "Row answer"); last.scope = "col"; heads.push(last);
    get("head").replaceChildren(...heads);
    const rows = current.rows.map((row, index) => {
      const tr = element("tr"), heading = element("th", ordinal[index] + " row"); heading.scope = "row";
      tr.dataset.matrixRow = index; tr.append(heading);
      row.entries.forEach((entry, column) => {
        const td = element("td"); td.dataset.matrixColumn = column; td.append(code(display(entry)));
        if (active?.row === index && active.column === column) td.classList.add("matrix-active");
        tr.append(td);
      });
      const answer = element("td", undefined, "matrix-row-answer");
      const done = !row.terms.length || visited >= (index + 1) * current.input.items.length;
      if (done) answer.append(code(display(row.total)));
      else answer.append(element("span", "Waiting", "matrix-cell-label"));
      tr.append(answer); return tr;
    });
    get("rows").replaceChildren(...rows);
    get("input-note").textContent = current.input.items.length ? "Each column keeps one input entry above the matching row entries." : "The input has no entries. Each empty row gives ○.";
    get("next").disabled = complete; get("back").disabled = visited === 0; get("restart").disabled = visited === 0; get("all").disabled = complete;
    get("pair").hidden = !active;
    if (active) {
      get("pair-title").textContent = ordinal[active.row] + " row · " + ordinal[active.column].toLowerCase() + " pair";
      get("pair-place").replaceChildren("Both entries have place ", code(active.place), " from the right.");
      get("pair-source").textContent = "(" + active.first + " " + active.second + ")";
      get("contribution").hidden = visited === 0;
      get("prediction").hidden = visited > 0;
      get("change").textContent = active.source + " = " + display(active.result);
      get("joined").textContent = display(active.joined);
      get("contribution-reading").textContent = "This pair gives " + reading(active.result) + ". The row has joined " + reading(active.joined) + " so far.";
      get("row-try").dataset.example = current.rows[active.row].source;
    }
    get("output").hidden = !complete;
    get("answer").hidden = !current.answer.items;
    if (current.answer.items) get("answer").textContent = display(current.answer);
    get("output-note").textContent = current.answer.established
      ? "One answer per row, kept in the rows’ written order."
      : "Some answers remain recipes. Open the full recipe in the playground to inspect them.";
    get("status").textContent = !active ? "There are no pairs to visit. Empty rows contribute ○; no rows keeps ()."
      : visited === 0 ? "Predict the first contribution, then visit its pair."
      : complete ? "All pairs visited. Keep the row answers in order."
      : "Pair combined. Visit the next pair; a new row starts a new joined amount.";
  }
  function update() {
    clearTimeout(timer); visited = 0;
    try {
      current = apply(get("table").value, get("input").value);
      get("error").hidden = true; get("work").hidden = false; get("try").disabled = false;
      get("try").dataset.example = current.source;
      draw();
    } catch (error) {
      current = null;
      get("error").textContent = error.message; get("error").hidden = false;
      get("work").hidden = true; get("try").disabled = true; delete get("try").dataset.example;
    }
  }
  presets.forEach((preset, index) => {
    const option = element("option", preset.title); option.value = index; get("preset").append(option);
  });
  get("preset").addEventListener("change", () => {
    const preset = presets[Number(get("preset").value)];
    get("table").value = preset.table; get("input").value = preset.input; update();
  });
  const edited = () => {
    clearTimeout(timer); current = null; get("work").hidden = true; get("try").disabled = true;
    delete get("try").dataset.example;
    timer = setTimeout(update, 180);
  };
  [get("table"), get("input")].forEach(field => {
    field.addEventListener("input", edited); field.addEventListener("ufn-input", edited);
  });
  get("next").addEventListener("click", () => { if (current && visited < current.trace.length) { visited++; draw(); } });
  get("back").addEventListener("click", () => { if (current && visited) { visited--; draw(); } });
  get("restart").addEventListener("click", () => { if (current) { visited = 0; draw(); } });
  get("all").addEventListener("click", () => { if (current) { visited = current.trace.length; draw(); } });
  demo.hidden = false; update();
})(typeof globalThis !== "undefined" ? globalThis : this);
