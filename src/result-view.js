(function (root) {
  "use strict";
  const element = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  function copyButton(text, label = "Copy UFN") {
    const button = element("button", label, "quiet-button"); button.type = "button";
    button.addEventListener("click", async () => {
      try {
        if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
        await navigator.clipboard.writeText(text);
        button.textContent = "Copied";
      } catch (_) {
        const field = element("textarea", undefined, "copy-fallback");
        field.value = text; field.readOnly = true;
        field.setAttribute("aria-label", "UFN text to copy");
        button.after(field); field.focus(); field.select();
        button.textContent = "Text selected; copy with your keyboard";
        field.addEventListener("blur", () => field.remove(), { once: true });
      }
      setTimeout(() => { button.textContent = label; }, 1800);
    });
    return button;
  }
  const states = new WeakMap();
  function sequence(container, answer, options = {}) {
    if (!answer?.items) { container.replaceChildren(); container.hidden = true; return; }
    let state = states.get(container);
    if (state?.answer !== answer) {
      state = { answer, open: new Set(), pages: new Map(), decimals: new Set() };
      states.set(container, state);
    }
    const listing = (items, prefix = "") => {
      const group = element("div", undefined, "sequence-group");
      if (!items.length) { group.append(element("code", "()"), element("p", "No entries.", "entry-note")); return group; }
      const list = element("ol", undefined, "sequence-entries");
      const more = element("button", "Show more entries", "quiet-button sequence-more"); more.type = "button";
      let shown = 0;
      const append = end => {
        for (; shown < Math.min(end, items.length); shown++) {
          const item = items[shown], path = prefix + "/" + shown, right = items.length - 1 - shown;
          const row = element("li"), entry = element("details", undefined, "sequence-entry");
          const summary = element("summary"), body = element("div", undefined, "entry-body");
          summary.append(element("span", "Entry " + (shown + 1), "entry-position"));
          let spelling = null;
          if (item.kind === "sequence") summary.append(element("span", item.items.length + " entries · (…)", "entry-kind"));
          else {
            spelling = (options.dense ? item.canonical || item.ufn : item.display) || item.ufn;
            const code = element("code", spelling || "Recipe exceeds the text limit", "entry-spelling");
            summary.append(code, element("span", item.canonical ? "Value" : item.established ? "Exact expression" : "Recipe", "entry-kind"));
          }
          let built = false;
          const build = () => {
            if (built) return; built = true;
            const position = element("p", "Place from the right: ", "entry-note");
            position.append(element("code", root.UFN.encodeInteger(right))); body.append(position);
            if (item.kind === "sequence") body.append(listing(item.items, path));
            if (item.reason) body.append(element("p", item.reason, "entry-note"));
            const writing = spelling || item.ufn;
            if (writing) body.append(copyButton(writing));
            if (item.kind !== "sequence") {
              const toggle = element("button", "Show decimal", "quiet-button entry-decimal-toggle"); toggle.type = "button";
              const decimal = element("p", undefined, "entry-decimal"); decimal.hidden = true;
              const project = show => {
                decimal.hidden = !show; toggle.textContent = show ? "Hide decimal" : "Show decimal";
                toggle.setAttribute("aria-expanded", String(show));
                if (!show || decimal.textContent) return;
                try {
                  const value = item.value;
                  decimal.textContent = value.every(Number.isFinite) ? "Decimal approximation: " + root.UFN.formatValue(value)
                    : "This entry exceeds the decimal preview's range.";
                } catch (error) { decimal.textContent = "Decimal unavailable: " + error.message; }
              };
              toggle.addEventListener("click", () => {
                const show = decimal.hidden;
                if (show) state.decimals.add(path); else state.decimals.delete(path);
                project(show);
              });
              body.append(toggle, decimal); project(options.decimal || state.decimals.has(path));
            }
          };
          entry.append(summary, body);
          entry.open = state.open.has(path); if (entry.open) build();
          entry.addEventListener("toggle", () => {
            if (entry.open) { state.open.add(path); build(); } else state.open.delete(path);
          });
          row.append(entry); list.append(row);
        }
        state.pages.set(prefix, shown);
        more.hidden = shown >= items.length;
        more.textContent = "Show next " + Math.min(40, items.length - shown) + " entries";
      };
      more.addEventListener("click", () => {
        const before = shown; append(shown + 40);
        list.children[before]?.querySelector("summary")?.focus();
      });
      group.append(list, more); append(state.pages.get(prefix) || 40);
      return group;
    };
    container.hidden = false;
    container.replaceChildren(element("p", "Open an entry to copy it or read a decimal approximation.", "entry-note"), listing(answer.items));
  }
  function expansion(panel) {
    const body = panel.querySelector(".expansion-content");
    let current;
    const render = () => {
      if (!panel.open || !current) return;
      body.replaceChildren();
      const { source, answer, error } = current;
      if (!source.trim()) { body.append(element("p", "Enter an expression to inspect its expansion.")); return; }
      try {
        const view = root.UFN.expand(source, 64);
        if (!view.written) { body.append(element("p", "These declarations give written forms their meanings. Add an expression to use them.")); return; }
        const stages = element("ol", undefined, "expansion-stages");
        const stage = (label, text, copy = false) => {
          const item = element("li"); item.append(element("h4", label));
          const pre = element("pre"); pre.append(element("code", text)); item.append(pre);
          if (copy) item.append(copyButton(text)); stages.append(item);
        };
        stage("Written form", view.written);
        stage("Substituted recipe", view.expanded, true);
        if (answer) stage(answer.partial ? "Finite preview" : "Result", answer.ufn || "Open the entries above; the complete sequence exceeds the text limit.", !!answer.ufn);
        else if (error) stages.append(element("li", "Evaluation needs attention: " + error.message));
        body.append(stages);
        body.append(element("p", view.definitionCount
          ? "Arguments replace their named places. Local boxes get distinct names so they cannot capture an argument's counters. The recipe is shown before arithmetic."
          : "This expression uses the core notation directly. There are no user declarations to substitute.", "entry-note"));
        if (view.sequenceHelper) body.append(element("p", "One small declaration remains: ◇⟪…⟫ keeps a captured number as one entry, or passes through a captured sequence. Its input's kind depends on a surrounding visit.", "entry-note"));
        body.append(element("p", "Complete limits keep their measuring attachments. The supplied constants keep their names; their defining formulas remain below.", "entry-note"));
      } catch (failure) { body.append(element("p", failure.message, "entry-note")); }
    };
    panel.addEventListener("toggle", render);
    return { update(source, answer = null, error = null) { current = { source, answer, error }; render(); } };
  }
  function library(container) {
    const list = container.querySelector(".library-list");
    for (const definition of root.UFNLibrary.definitions) {
      const card = element("details", undefined, "library-definition");
      const summary = element("summary"); summary.append(element("span", definition.title), element("code", definition.form));
      const description = element("p", definition.description);
      const button = element("button", "Open example", "quiet-button"); button.type = "button";
      button.dataset.example = root.UFNLibrary.example(definition.id);
      const code = element("pre"); code.append(element("code", root.UFNLibrary.declarations([definition.id])));
      const note = element("p", "The writing below includes every declaration this example needs.", "entry-note");
      card.append(summary, description, button);
      if (definition.id === "fourier") {
        const eight = element("button", "Open eight samples", "quiet-button"); eight.type = "button";
        eight.dataset.example = root.UFNLibrary.declarations(["fourier"]) + "\n\n⟪○ ◠ ○ ○ ○ ○ ○ ○⟫";
        card.append(eight);
      }
      card.append(note, code, copyButton(root.UFNLibrary.declarations([definition.id]), "Copy declarations"));
      list.append(card);
    }
    container.querySelector(".library-actions").append(copyButton(root.UFNLibrary.declarations(), "Copy all declarations"));
  }
  root.UFNViews = { sequence, expansion, library, copyButton };
})(globalThis);
