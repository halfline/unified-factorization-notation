(function (root) {
  "use strict";

  const UFN = typeof module !== "undefined" && module.exports ? require("./ufn.js") : root.UFN;
  // Recognize these complete definitions, never a nearby decimal or a partial sum.
  const constants = {
    e: {
      source: UFN.constants.e.source,
      title: "┌┘ · exponential constant ≈ 2.71828182846",
    },
    turn: {
      source: UFN.constants.turn.source,
      title: "⟳ · a turn ≈ 6.28318530718",
    },
  };
  const compact = text => text.replace(/\s/gu, "");
  const definitions = Object.entries(constants).map(([name, value]) => [name, compact(value.source)]);

  function tokens(text) {
    // Keep source offsets so decoration changes neither copying nor font shaping.
    const positions = [], marks = [];
    for (let at = 0; at < text.length; at++) {
      if (!/\s/u.test(text[at])) { positions.push(at); marks.push(text[at]); }
    }
    const source = marks.join(""), found = [];
    for (let at = 0; at < source.length; at++) {
      const start = at;
      const constant = source[at] === "[" && definitions.find(([, spelling]) => source.startsWith(spelling, at)
        && source[at + spelling.length] !== "⌊");
      let name = null, context = null;
      if (source[at] === "⟳") name = "turn";
      else if (source.startsWith("┌┘", at)) { name = "e"; at++; }
      else if (constant) { name = constant[0]; at += constant[1].length - 1; }
      else if (source[at] === "⟨") {
        try {
          const parser = new UFN.Parser(source.slice(at));
          parser.primary(); // Includes lower position corners, but no surrounding operations.
          at += parser.at - 1;
        } catch (_) { continue; }
      } else if (!"○◠◡".includes(source[at])) continue;
      if (!name) {
        if (source[start - 1] === "@" || source[start - 1] === "#") context = "Direction label";
        else if (/[^\s\p{N}○◠◡⟳┌┘\[\]{}()⟨⟩⌊⌋⌈⌉⟦⟧⟪⟫:@#|*…≔=]+⌊$/u.test(source.slice(0, start))) context = "Counter label";
        else if (source[start - 1] === "⌊" && ")⌋⟫⟧".includes(source[start - 2] || " ")) context = "Entry place";
        else if (source[start - 1] === "⌊" && "]}".includes(source[start - 2] || " ")) context = "Measuring place";
      }
      const end = positions[at] + 1;
      found.push({ start: positions[start], end, source: text.slice(positions[start], end), constant: name, context });
    }
    return found;
  }

  function describe(token) {
    if (token.constant && constants[token.constant]) return {
      title: constants[token.constant].title,
      note: "The limit of this recipe. A finite partial sum is a different value.",
    };
    try {
      const result = UFN.compute(token.source);
      const value = result.value;
      if (!value.every(Number.isFinite)) return { title: "Beyond the decimal preview’s range", note: "The UFN spelling is unchanged." };
      if (value.every(n => n === 0) && result.canonical !== "○") return {
        title: "Too small for the decimal preview", note: "This angle-bracket number is not zero.",
      };
      return {
        title: (token.context ? token.context + " · decimal ≈ " : "Decimal ≈ ") + UFN.formatValue(value),
        note: result.partial ? result.partialKind === "mixed" ? "Finite visits to nested or combined ranges, not their limits."
          : "A finite partial " + result.partialKind + ", not the limit."
          : token.context === "Direction label" ? "This number names a direction; it is not an angle."
          : token.context === "Counter label" ? "This number names the counter; it is not its current value."
          : token.context === "Entry place" ? "Count entries from the right, starting at ○. This selects an entry, not a factor."
          : token.context === "Measuring place" ? "This position selects the factor used to measure convergence."
          : token.source === "○" ? "No change of place."
          : token.source === "◠" ? "One forward step."
          : token.source === "◡" ? "One backward step. This mark is a value, not a sign prefix."
          : "Decimal preview of the highlighted number.",
      };
    } catch (error) {
      return { title: "Decimal preview unavailable", note: error.message };
    }
  }

  const api = { tokens, describe, constants };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; return; }
  root.UFNTooltips = api;
  if (!root.document) return;

  const tooltip = document.createElement("div");
  tooltip.id = "number-tooltip";
  tooltip.className = "number-tooltip";
  tooltip.setAttribute("role", "tooltip");
  tooltip.hidden = true;
  const title = document.createElement("strong"), note = document.createElement("span");
  const expanded = document.createElement("div"), expandedSource = document.createElement("code");
  expanded.className = "tooltip-expanded";
  expanded.append(expandedSource);
  expanded.hidden = true;
  tooltip.append(expanded, title, note);
  document.body.append(tooltip);

  const entries = new WeakMap(), cache = new Map();
  const excluded = "script, style, textarea, input, select, svg, [contenteditable], [data-insert], .ufn-number, .number-tooltip";
  function spanFor(text, token, parent) {
    const span = document.createElement("span");
    span.className = "ufn-number";
    span.textContent = text;
    // Existing buttons/links supply their own keyboard focus.
    if (!parent.closest('button, a, summary, [aria-hidden="true"]')) span.tabIndex = 0;
    entries.set(span, token);
    return span;
  }
  function decorate(node) {
    if (!node.isConnected) return;
    if (node.nodeType === Node.TEXT_NODE) {
      const parent = node.parentElement;
      if (!parent || parent.closest(excluded)) return;
      const text = node.textContent;
      const named = parent.dataset.ufnConstant;
      const parts = named && constants[named]
        ? [{ start: 0, end: text.length, source: constants[named].source, constant: named }]
        : tokens(text);
      if (!parts.length) return;
      const fragment = document.createDocumentFragment();
      let at = 0;
      for (const part of parts) {
        fragment.append(text.slice(at, part.start), spanFor(text.slice(part.start, part.end), part, parent));
        at = part.end;
      }
      fragment.append(text.slice(at));
      node.replaceWith(fragment);
    } else if (node.nodeType === Node.ELEMENT_NODE && !node.closest(excluded)) {
      // Snapshot the text nodes before replacing any of them.
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT), texts = [];
      while (walker.nextNode()) texts.push(walker.currentNode);
      texts.forEach(decorate);
    }
  }
  decorate(document.body);
  const observer = new MutationObserver(records => {
    if (active && !active.isConnected) hide();
    for (const record of records) {
      if (record.type === "characterData") decorate(record.target);
      else record.addedNodes.forEach(decorate);
    }
  });
  observer.observe(document.body, { subtree: true, childList: true, characterData: true });

  let active = null, hideTimer;
  function hide() {
    clearTimeout(hideTimer);
    active?.removeAttribute("aria-describedby");
    active = null;
    tooltip.hidden = true;
  }
  function show(target) {
    clearTimeout(hideTimer);
    if (target === active) return;
    hide();
    const token = entries.get(target);
    if (!token) return;
    active = target;
    const key = token.constant || (token.context || "") + ":" + compact(token.source);
    if (!cache.has(key)) {
      if (cache.size >= 256) cache.delete(cache.keys().next().value);
      cache.set(key, describe(token));
    }
    const reading = cache.get(key);
    title.textContent = reading.title;
    note.textContent = reading.note;
    // Use the hovered source rather than a canonical rewrite. Keep this line
    // unjoined even when the surrounding page or gallery uses compact shapes.
    expanded.hidden = Boolean(token.constant) || "○◠◡".includes(token.source) || !getComputedStyle(target).fontVariantLigatures.includes("discretionary-ligatures");
    expandedSource.textContent = expanded.hidden ? "" : token.source;
    tooltip.hidden = false;
    target.setAttribute("aria-describedby", tooltip.id);
    const anchor = target.getBoundingClientRect(), box = tooltip.getBoundingClientRect();
    const left = Math.max(8, Math.min(anchor.left, innerWidth - box.width - 8));
    const below = anchor.bottom + 8;
    const top = below + box.height <= innerHeight - 8 ? below : Math.max(8, anchor.top - box.height - 8);
    tooltip.style.left = left + "px";
    tooltip.style.top = top + "px";
  }
  function targetAt(element, keyboard = false) {
    const direct = element.closest?.(".ufn-number");
    if (direct) return direct;
    if (keyboard && element.matches?.("button, a, summary")) {
      const numbers = element.querySelectorAll(".ufn-number");
      if (numbers.length === 1 || [...numbers].every(number => number.textContent === numbers[0].textContent)) return numbers[0];
    }
    return null;
  }
  document.addEventListener("pointerover", event => {
    if (tooltip.contains(event.target)) { clearTimeout(hideTimer); return; }
    const target = targetAt(event.target);
    if (target) show(target);
  });
  document.addEventListener("pointerout", event => {
    if (!active) return;
    if (active.contains(event.relatedTarget) || tooltip.contains(event.relatedTarget)) return;
    hideTimer = setTimeout(hide, 120);
  });
  document.addEventListener("focusin", event => {
    const target = targetAt(event.target, true);
    if (target) show(target); else hide();
  });
  document.addEventListener("focusout", hide);
  document.addEventListener("keydown", event => { if (event.key === "Escape") hide(); });
  document.addEventListener("pointerdown", event => {
    const target = targetAt(event.target);
    if (target) show(target);
    else if (!tooltip.contains(event.target)) hide();
  });
  document.addEventListener("scroll", hide, true);
  window.addEventListener("resize", hide);
  const shapes = new MutationObserver(hide);
  shapes.observe(document.documentElement, { attributes: true, attributeFilter: ["data-number-shapes"] });
})(typeof globalThis !== "undefined" ? globalThis : this);
