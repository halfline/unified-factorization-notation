(function () {
  "use strict";

  const OPEN = { "⟨": "⟩", "⟦": "⟧", "⟪": "⟫", "[": "]", "{": "}", "⌊": "⌋", "⌈": "⌉", "(": ")" };
  const CLOSE = new Set(Object.values(OPEN));
  const { compute, limit, preview, Parser, formatSource, formatValue, encodeInteger } = globalThis.UFN;
  const limitExplanations = {
    "geometric sum": "The geometric-sum rule establishes this limit from the recipe's fixed ratio.",
    "sum of geometric series": "The recipe separates into geometric lists whose limits can be joined.",
    "rational telescoping sum": "Parts of successive entries cancel. The remaining end terms approach this value.",
    "rational telescoping product": "Successive shares cancel. The remaining end factors approach this value.",
    "constant product": "Repeating this factor either keeps ◠ or approaches ○ under the chosen measurement.",
  };

  function stepSpelling(count) {
    if (count === 0) return "○";
    const step = count < 0 ? "◡" : "◠";
    return Math.abs(count) === 1 ? step : "[" + Array(Math.abs(count)).fill(step).join(" ") + "]";
  }

  const editor = document.getElementById("expression");
  if (!editor) return;
  const countingReference = document.getElementById("count-reference");
  if (countingReference) {
    const countingToggle = countingReference.querySelector("summary");
    function closeCountingReference() {
      countingReference.open = false;
      countingToggle.focus({ preventScroll: true });
    }
    document.getElementById("count-close").addEventListener("click", closeCountingReference);
    document.getElementById("count-gallery-link").addEventListener("click", () => {
      countingReference.open = false;
      const gallery = document.getElementById("ligature-gallery");
      gallery.open = true;
      requestAnimationFrame(() => gallery.querySelector("summary").focus({ preventScroll: true }));
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && countingReference.open) closeCountingReference();
    });
  }
  const shapeChoices = document.querySelectorAll('input[name="number-shapes"]');
  function setNumberShapes(mode) {
    mode = mode === "compact" ? "compact" : "expanded";
    document.documentElement.dataset.numberShapes = mode;
    shapeChoices.forEach(choice => { choice.checked = choice.value === mode; });
  }
  let savedShapes;
  try { savedShapes = localStorage.getItem("ufn-number-shapes"); } catch (_) { /* Storage is optional. */ }
  setNumberShapes(savedShapes);
  shapeChoices.forEach(choice => choice.addEventListener("change", () => {
    setNumberShapes(choice.value);
    try { localStorage.setItem("ufn-number-shapes", choice.value); } catch (_) { /* Keep the current choice. */ }
  }));
  const result = document.getElementById("result");
  const caption = document.getElementById("result-caption");
  const status = document.getElementById("result-status");
  const detail = document.getElementById("result-detail");
  const terms = document.getElementById("terms");
  const showDecimal = document.getElementById("show-decimal");
  const denseResult = document.getElementById("dense-result");
  const copyResult = document.getElementById("copy-result");
  const partialPreview = document.getElementById("partial-preview");
  const partialRequest = document.getElementById("partial-request");
  const findLimit = document.getElementById("find-limit");
  const limitRequest = document.getElementById("limit-request");
  const termsControl = document.getElementById("terms-control");
  const expressionPreview = document.getElementById("expression-preview");
  const sequenceView = document.getElementById("sequence-result");
  const expansionView = globalThis.UFNViews.expansion(document.getElementById("expansion-view"));
  globalThis.UFNViews.library(document.getElementById("definition-library"));
  let copyText = "";
  const walk = [];
  const walkExpression = document.getElementById("walk-expression");
  const walkResult = document.getElementById("walk-result");
  document.querySelectorAll("[data-walk]").forEach(button => {
    button.addEventListener("click", () => {
      if (button.dataset.walk === "reset") walk.length = 0;
      else walk.push(button.dataset.walk);
      walkExpression.textContent = walk.length ? "[" + walk.join(" ") + "]" : "○";
      const steps = walk.reduce((count, step) => count + (step === "◠" ? 1 : -1), 0);
      walkResult.textContent = stepSpelling(steps);
    });
  });
  const rangeEnd = document.getElementById("range-end");
  const rangeBody = document.getElementById("range-body");
  const rangeNext = document.getElementById("range-next");
  const rangeVisits = document.getElementById("range-visits");
  const generated = [];
  let visited = 0;
  function showRange() {
    const end = Number(rangeEnd.value);
    document.getElementById("range-expression").textContent =
      "[□ : ◠ … " + stepSpelling(end) + " : " + rangeBody.value + "]";
    document.getElementById("range-list").textContent = "[" + generated.map(stepSpelling).join(" ") + "]";
    document.getElementById("range-total").textContent = stepSpelling(generated.reduce((a, b) => a + b, 0));
    document.getElementById("range-status").textContent = end === 0
      ? "The end is before the start. There are no visits, and the sum is ○."
      : visited === 0 ? "No counts visited yet."
      : visited === end ? "The last count is included. The list is complete."
      : "□ is now " + stepSpelling(visited) + ". There is another count to visit.";
    rangeNext.disabled = visited >= end;
  }
  function resetRange() {
    visited = 0;
    generated.length = 0;
    rangeVisits.replaceChildren();
    showRange();
  }
  if (rangeEnd) {
    rangeNext.addEventListener("click", () => {
      if (visited >= Number(rangeEnd.value)) return;
      visited++;
      const current = stepSpelling(visited);
      const value = compute("[□ : " + current + " … " + current + " : " + rangeBody.value + "]").value[0];
      generated.push(value);
      const row = document.createElement("tr");
      for (const text of [current, stepSpelling(value)]) {
        const cell = document.createElement("td");
        const code = document.createElement("code");
        code.textContent = text;
        cell.append(code);
        row.append(cell);
      }
      rangeVisits.append(row);
      showRange();
    });
    rangeEnd.addEventListener("change", resetRange);
    rangeBody.addEventListener("change", resetRange);
    document.getElementById("range-reset").addEventListener("click", resetRange);
    showRange();
  }
  function revealChapter(hash) {
    let target = document.getElementById(hash.replace(/^#/, ""));
    while (target) {
      if (target.matches("details")) target.open = true;
      target = target.parentElement;
    }
  }
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", () => revealChapter(link.hash));
  });
  window.addEventListener("hashchange", () => revealChapter(window.location.hash));
  revealChapter(window.location.hash);
  let timer, lastEvaluation = null;
  function update() {
    const source = editor.value.trim();
    result.classList.remove("error", "message");
    result.hidden = false;
    sequenceView.hidden = true;
    copyText = "";
    expressionPreview.textContent = source;
    if (!source) {
      partialPreview.disabled = true; partialPreview.checked = false;
      limitRequest.hidden = true; findLimit.checked = false;
      partialRequest.hidden = true; termsControl.hidden = true;
      copyResult.disabled = true;
      result.textContent = "Start with an example or type an expression.";
      result.classList.add("message");
      caption.textContent = "Written in UFN";
      status.textContent = "Ready"; status.dataset.state = "ready"; detail.textContent = "";
      expansionView.update(source);
      return;
    }
    let parsedSuccessfully = false;
    try {
      const parsed = new Parser(source).parse();
      parsedSuccessfully = true;
      if (parsed.type === "declarations") {
        partialPreview.disabled = true; partialPreview.checked = false;
        limitRequest.hidden = true; findLimit.checked = false;
        partialRequest.hidden = true; termsControl.hidden = true;
        copyResult.disabled = true;
        result.textContent = "Add an expression below your declarations to calculate a value.";
        result.classList.remove("long", "very-long"); result.classList.add("message");
        caption.textContent = "Definitions have no numerical value";
        status.textContent = "Defined"; status.dataset.state = "success";
        detail.textContent = "These definitions apply within this input. Opening another example starts a new document.";
        expansionView.update(source);
        return;
      }
      let hasFinitePreview = false;
      function inspect(node, insideLimit = false) {
        if (!node || typeof node !== "object") return;
        if (node.type === "defined") insideLimit = true;
        if (node.type === "range" && !node.end) {
          if (node.measurement) insideLimit = true;
          else if (!insideLimit) hasFinitePreview = true;
        }
        Object.values(node).forEach(value => Array.isArray(value)
          ? value.forEach(child => inspect(child, insideLimit)) : inspect(value, insideLimit));
      }
      inspect(parsed);
      limitRequest.hidden = !hasFinitePreview;
      if (limitRequest.hidden) findLimit.checked = false;
      partialPreview.disabled = parsed.type !== "range" || !parsed.measurement;
      partialRequest.hidden = partialPreview.disabled;
      if (partialPreview.disabled) partialPreview.checked = false;
      terms.disabled = !(hasFinitePreview && !findLimit.checked || partialPreview.checked);
      termsControl.hidden = terms.disabled;
      const key = source + "\n" + terms.value + "\n" + partialPreview.checked + "\n" + findLimit.checked;
      if (lastEvaluation?.key !== key) lastEvaluation = { key, answer: findLimit.checked ? limit(source)
        : (partialPreview.checked ? preview : compute)(source, Number(terms.value)) };
      const { answer } = lastEvaluation;
      const sequence = answer.kind === "sequence";
      const partialLabel = answer.partialKind === "product" ? "Partial product"
        : answer.partialKind === "sum" ? "Partial sum" : "Partial evaluation";
      const reduced = answer.canonical || answer.reduced;
      const spelling = (denseResult.checked ? reduced || answer.ufn : answer.display) || answer.source || source;
      result.textContent = answer.canonical ? spelling : formatSource(spelling, 40);
      copyText = spelling;
      if (sequence && answer.items) {
        result.hidden = true;
        globalThis.UFNViews.sequence(sequenceView, answer, { dense: denseResult.checked, decimal: showDecimal.checked });
      }
      expansionView.update(source, answer);
      copyResult.disabled = false;
      const shortened = answer.canonical && result.textContent !== answer.canonical;
      caption.textContent = sequence ? answer.items ? "Sequence · " + answer.items.length + " entries" : "Sequence recipe"
        : reduced ? answer.partial ? partialLabel + " in UFN"
        : answer.limitProofs.length ? "Proved limit in UFN"
        : answer.reduced ? "Exact expression in UFN"
        : shortened ? "Reduced UFN · shorter spelling" : "Preferred UFN spelling" : "UFN recipe";
      const notes = [];
      if (answer.measurements.length) notes.push(answer.measurements.map(place => place === 0 ? "Ordinary distance (⌊○⌋)"
        : "Measuring place ⌊" + encodeInteger(place) + "⌋").join("; ") + ".");
      if (answer.limitProofs.length && reduced && !answer.partial)
        notes.push(...[...new Set(answer.limitProofs.map(proof => proof.rule))]
          .map(rule => limitExplanations[rule] || "Exact limit rule: " + rule + "."));
      if (shortened) notes.push("Position brackets skip unused factor places. Dense spelling shows every place.");
      if (sequence) {
        notes.push("Parentheses keep the entries in order, including ○ entries and nested sequences.");
        if (!answer.established) notes.push(answer.reason || "Some entries keep their exact recipes. A decimal reading does not reduce them.");
        if (!answer.ufn) notes.push("The expanded sequence exceeds the display limit, so its generating recipe is shown.");
      } else if (answer.reduced) notes.push("The value is exact. These roots stay joined instead of fitting into one angle-bracket number.");
      else if (!answer.canonical) notes.push(answer.reason || "The evaluator cannot yet reduce this recipe.");
      if (answer.partial) notes.push(`This shows ${Math.max(1, Math.min(500, Math.floor(Number(terms.value) || 24)))} visits of each previewed endless range. More visits may change the answer; a partial result does not prove a limit.`);
      if (showDecimal.checked && sequence && answer.items) notes.push("Decimal readings appear inside open entries.");
      if (showDecimal.checked && !(sequence && answer.items)) {
        try {
          const value = answer.value;
          const finite = part => Array.isArray(part) ? part.every(finite) : Number.isFinite(part);
          notes.push(finite(value) ? "Decimal approximation: " + formatValue(value) + "."
            : "This value is beyond the decimal preview's range.");
        } catch (error) { notes.push("Decimal preview: " + error.message + "."); }
      }
      detail.replaceChildren(...notes.map(note => {
        const paragraph = document.createElement("p"); paragraph.textContent = note; return paragraph;
      }));
      result.classList.toggle("long", result.textContent.length > 10);
      result.classList.toggle("very-long", result.textContent.length > 35);
      status.textContent = answer.partial ? partialLabel : sequence ? "Sequence"
        : reduced ? answer.limitProofs.length ? "Proved limit" : "Value" : "Recipe";
      status.dataset.state = answer.partial ? "partial" : reduced || sequence && answer.established ? "success" : "recipe";
    } catch (error) {
      if (!parsedSuccessfully) {
        limitRequest.hidden = true; partialRequest.hidden = true; termsControl.hidden = true;
      }
      copyResult.disabled = true;
      result.textContent = error.message;
      result.classList.remove("long", "very-long");
      result.classList.add("error");
      caption.textContent = "Expression needs attention";
      status.textContent = "Check expression"; status.dataset.state = "error";
      result.hidden = false; sequenceView.hidden = true;
      detail.textContent = Number.isInteger(error.position) ? `Near character ${error.position + 1}.` : "";
      expansionView.update(source, null, error);
    }
  }
  const schedule = () => { clearTimeout(timer); timer = setTimeout(update, 100); };
  function symbolInput(editor, schedule = () => {}) {
    function insert(open, close = "") {
      const start = editor.selectionStart, end = editor.selectionEnd;
      const selection = close ? editor.value.slice(start, end) : "";
      editor.setRangeText(open + selection + close, start, end, "end");
      const caret = start + open.length + selection.length;
      editor.setSelectionRange(caret, caret);
      editor.focus(); schedule();
    }
    function replaceBeforeCaret(length, replacement) {
      const caret = editor.selectionStart;
      editor.setRangeText(replacement, caret - length, caret, "end");
      schedule();
    }
    editor.addEventListener("keydown", event => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
      const start = editor.selectionStart, end = editor.selectionEnd;
      const next = editor.value[start];
      if (event.key === "0") { event.preventDefault(); insert("○"); return; }
      if (event.key === "_") { event.preventDefault(); insert("⌊", "⌋"); return; }
      if (event.key === "^") { event.preventDefault(); insert("⌈", "⌉"); return; }
      if (event.key === "<") { event.preventDefault(); insert("⟨", "⟩"); return; }
      if (event.key === ">" && start === end && next === "⟩") {
        event.preventDefault(); editor.setSelectionRange(start + 1, start + 1); return;
      }
      if (OPEN[event.key]) { event.preventDefault(); insert(event.key, OPEN[event.key]); return; }
      if (CLOSE.has(event.key) && start === end && next === event.key) {
        event.preventDefault(); editor.setSelectionRange(start + 1, start + 1); return;
      }
      if (event.key === "Backspace" && start === end && start > 0 && next && OPEN[editor.value[start - 1]] === next) {
        event.preventDefault(); editor.setRangeText("", start - 1, start + 1, "start"); schedule();
      }
    });
    editor.addEventListener("beforeinput", event => {
      if (event.isComposing || !event.cancelable) return;
      const start = editor.selectionStart, end = editor.selectionEnd;
      const next = editor.value[start];
      if (event.inputType === "deleteContentBackward" && start === end && start > 0 && next && OPEN[editor.value[start - 1]] === next) {
        event.preventDefault(); editor.setRangeText("", start - 1, start + 1, "start"); schedule(); return;
      }
      if (event.inputType !== "insertText") return;
      const pair = { "_": ["⌊", "⌋"], "^": ["⌈", "⌉"], "<": ["⟨", "⟩"], "0": ["○", ""] }[event.data];
      if (pair) { event.preventDefault(); insert(...pair); return; }
      if (OPEN[event.data]) { event.preventDefault(); insert(event.data, OPEN[event.data]); return; }
      const closing = event.data === ">" ? "⟩" : event.data;
      if (CLOSE.has(closing) && start === end && next === closing) {
        event.preventDefault(); editor.setSelectionRange(start + 1, start + 1);
      }
    });
    function substituteText() {
      if (editor.value.includes("0")) {
        const start = editor.selectionStart, end = editor.selectionEnd;
        editor.value = editor.value.replace(/0/g, "○");
        editor.setSelectionRange(start, end);
      }
      const caret = editor.selectionStart;
      if (caret !== editor.selectionEnd) { schedule(); return; }
      const before = editor.value.slice(0, caret);
      const shortcuts = [
        [/\\empty$/u, "○"], [/\\mark$/u, "◠"], [/\\undo$/u, "◡"],
        [/\\circle$/u, "○"], [/\\one$/u, "◠"], [/\\minus$/u, "◡"],
        [/\\box$/u, "□"], [/\\counter$/u, "□"], [/\\bullet$/u, "•"],
        [/\\dots$/u, "…"], [/\.\.\.$/u, "…"],
        [/\\turn$/u, "⟳"],
        [/\\exp$/u, "┌┘"],
        [/\\define$/u, "≔()"], [/\\form$/u, "⟦⟧"],
        [/\\sequence$/u, "()"],
        [/\\component$/u, "#"],
        [/\\angle$/u, "⟨⟩"]
      ];
      for (const [pattern, replacement] of shortcuts) {
        const match = before.match(pattern);
        if (match) {
          replaceBeforeCaret(match[0].length, replacement);
          if (["⟨⟩", "⟦⟧", "≔()", "()"].includes(replacement)) editor.setSelectionRange(editor.selectionStart - 1, editor.selectionStart - 1);
          return;
        }
      }
      schedule();
    }
    editor.addEventListener("input", event => { if (!event.isComposing) substituteText(); });
    editor.addEventListener("compositionend", substituteText);
    return insert;
  }
  const insert = symbolInput(editor, schedule);
  for (const id of ["factorial-input", "differentiate-recipe", "differentiate-point", "differentiate-direction"]) {
    const field = document.getElementById(id);
    if (field) symbolInput(field);
  }
  for (const id of ["matrix-table", "matrix-input", "transform-input", "puzzle-input", "clues-target", "family-first", "family-second"]) {
    const field = document.getElementById(id);
    if (field) symbolInput(field, () => field.dispatchEvent(new CustomEvent("ufn-input")));
  }
  document.querySelectorAll("[data-insert]").forEach(button => {
    button.addEventListener("click", () => {
      const chars = button.dataset.insert;
      if (chars === "⌈|⌉") insert("⌈|", "⌉");
      else if (chars === "≔()") insert("≔(", ")");
      else if (OPEN[chars[0]] === chars.slice(1)) insert(chars[0], chars.slice(1));
      else insert(chars);
    });
  });
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-example]");
    if (!button) return;
    const declarations = button.dataset.definitions
      ? globalThis.UFNLibrary.declarations(button.dataset.definitions.split(" ")) + "\n\n" : "";
    editor.value = formatSource(declarations + button.dataset.example);
    findLimit.checked = false; partialPreview.checked = false;
    editor.focus(); editor.setSelectionRange(editor.value.length, editor.value.length);
    update();
    document.getElementById("playground").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  terms.addEventListener("input", schedule);
  showDecimal.addEventListener("change", update);
  denseResult.addEventListener("change", update);
  partialPreview.addEventListener("change", update);
  findLimit.addEventListener("change", update);
  copyResult.addEventListener("click", async () => {
    const text = copyText;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(text);
      copyResult.textContent = "Copied";
    } catch (_) {
      const temporary = document.createElement("textarea");
      temporary.value = text;
      temporary.style.cssText = "position:fixed;left:-10000px;top:0";
      document.body.append(temporary);
      temporary.select();
      if (document.execCommand?.("copy")) {
        temporary.remove(); copyResult.focus(); copyResult.textContent = "Copied";
      } else {
        temporary.style.cssText = ""; temporary.className = "copy-fallback";
        temporary.readOnly = true; temporary.setAttribute("aria-label", "UFN result to copy");
        copyResult.after(temporary); temporary.focus(); temporary.select();
        copyResult.textContent = "Text selected; copy with your keyboard";
        temporary.addEventListener("blur", () => temporary.remove(), { once: true });
      }
    }
    setTimeout(() => { copyResult.textContent = "Copy result"; }, 1800);
  });
  document.getElementById("copy").addEventListener("click", async () => {
    const button = document.getElementById("copy");
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(editor.value);
      button.textContent = "Copied";
    } catch (_) {
      editor.focus(); editor.select();
      button.textContent = document.execCommand?.("copy") ? "Copied" : "Selected — press Ctrl+C";
    }
    setTimeout(() => { button.textContent = "Copy"; }, 1800);
  });
  update();
})();
