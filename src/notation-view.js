(function (root) {
  "use strict";
  if (!root.document) return;
  const pairs = new Map([["[", "]"], ["{", "}"], ["⌊", "⌋"], ["⌈", "⌉"], ["⟨", "⟩"], ["(", ")"], ["⟦", "⟧"], ["⟪", "⟫"]]);
  const shaped = new Set(["[", "{", "⌊", "⌈", "⟨"]);
  // These complete spellings have joined outlines in the optional symbol font.
  const joinedSpellings = new Set([
    "⟨◠⟩", "⟨◡⟩", "⟨[|⟨◠⟩]⟩", "⟨[◡◡]⟩", "⟨◠○⟩", "⟨⟨◠⟩⟩", "⟨◠○○⟩",
    "⟨◠◠⟩", "⟨◠○○○⟩", "⟨⟨◠○⟩⟩", "⟨⟨◠⟩○⟩", "⟨◠○◠⟩",
    "⟨◠○○○○⟩", "⟨◡○⟩", "⟨◡◡⟩", "⟨◠◡⟩", "⟨◡◠⟩"
  ]);
  const paths = {
    "[": "M90 2 H12 V98 H90", "]": "M10 2 H88 V98 H10",
    "{": "M88 2 C28 2 35 20 35 33 C35 44 12 48 8 50 C12 52 35 56 35 67 C35 80 28 98 88 98",
    "}": "M12 2 C72 2 65 20 65 33 C65 44 88 48 92 50 C88 52 65 56 65 67 C65 80 72 98 12 98",
    "⌊": "M12 2 V98 H90", "⌋": "M88 2 V98 H10",
    "⌈": "M90 2 H12 V98", "⌉": "M10 2 H88 V98",
    "⟨": "M90 2 L12 50 L90 98", "⟩": "M10 2 L88 50 L10 98",
    "|": "M50 4 V96"
  };
  const span = (className) => {
    const node = document.createElement("span"); node.className = className; return node;
  };
  function fence(mark) {
    const node = span("ufn-fence");
    // Keep the actual mark in the DOM for selection, copying, and accessibility.
    const text = span("ufn-fence-text"); text.textContent = mark;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 100 100"); svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true"); svg.setAttribute("focusable", "false");
    const path = document.createElementNS(svg.namespaceURI, "path"); path.setAttribute("d", paths[mark]);
    svg.append(path); node.append(text, svg); return node;
  }
  function tokenize(parent) {
    const result = [];
    for (const node of [...parent.childNodes]) {
      if (node.nodeType === Node.TEXT_NODE) {
        for (const char of node.textContent) result.push(char);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Reuse tooltip and teaching spans so their state and events survive.
        if (!node.matches("svg, .ufn-typeset")) typesetChildren(node);
        result.push(node);
      }
    }
    return result;
  }
  function structure(tokens, compact) {
    function read(at, closing) {
      const items = [];
      while (at < tokens.length) {
        const token = tokens[at];
        if (token === closing) return { items, end: at + 1, closed: true };
        if (typeof token === "string" && pairs.has(token)) {
          const inner = read(at + 1, pairs.get(token));
          if (inner.closed) {
            const group = { mark: token, close: pairs.get(token), items: inner.items };
            const source = tokens.slice(at, inner.end);
            if (compact && source.every(part => typeof part === "string")
              && joinedSpellings.has(source.join("").replace(/\s/gu, ""))) group.joined = source.join("");
            if ((token === "⌊" || token === "⌈") && items.length && !isSpace(items.at(-1))) {
              items.push({ base: items.pop(), attachment: group });
            } else items.push(group);
            at = inner.end; continue;
          }
        }
        items.push(token); at++;
      }
      return { items, end: at, closed: false };
    }
    return read(0).items;
  }
  const isSpace = item => typeof item === "string" && /\s/u.test(item);
  function plainText(item) {
    if (typeof item === "string") return item;
    if (item instanceof Node) return null;
    if (item.base) return null;
    if (item.joined) return item.joined;
    if (shaped.has(item.mark)) return null;
    const parts = item.items.map(plainText);
    return parts.some(p => p === null) ? null : item.mark + parts.join("") + item.close;
  }
  const attachments = new Map();
  const partitions = new Map();
  function render(items, parent, owner, divide = true) {
    if (divide && owner && items.includes("|")) {
      // Give each side of a partition its own column. A bar placed on the
      // first line of a multiline text run would otherwise cross later lines.
      parent.classList.add("ufn-divided");
      const columns = [];
      let segment = [];
      const appendSegment = () => {
        const cell = span("ufn-partition-segment");
        render(segment, cell, owner, false); parent.append(cell);
        columns.push("minmax(0, max-content)"); segment = [];
      };
      for (const item of items) {
        if (item !== "|") { segment.push(item); continue; }
        appendSegment();
        const bar = fence("|"); bar.classList.add("ufn-partition");
        parent.append(bar); partitions.set(bar, owner); resize.observe(owner);
        columns.push(".3em");
      }
      appendSegment(); parent.style.gridTemplateColumns = columns.join(" ");
      return;
    }
    let text = "";
    const flush = () => { if (text) { parent.append(document.createTextNode(text)); text = ""; } };
    for (const item of items) {
      if (item === "|" && owner) {
        flush();
        const bar = fence("|"); bar.classList.add("ufn-partition");
        parent.append(bar); partitions.set(bar, owner); resize.observe(owner);
        continue;
      }
      const plain = plainText(item);
      if (plain !== null) { text += plain; continue; }
      flush();
      if (item instanceof Node) { parent.append(item); continue; }
      if (item.base) {
        const node = span("ufn-postfix " + (item.attachment.mark === "⌊" ? "ufn-lower" : "ufn-upper"));
        const base = span("ufn-postfix-base"); render([item.base], base);
        const corner = span("ufn-corner"), content = span("ufn-corner-content"), ink = span("ufn-corner-ink");
        render(item.attachment.items, ink, ink); content.append(ink);
        corner.append(fence(item.attachment.mark), content, fence(item.attachment.close));
        node.append(base, corner); parent.append(node);
        attachments.set(node, { base, ink }); resize.observe(base); resize.observe(ink);
      } else if (shaped.has(item.mark)) {
        const group = span("ufn-fenced"), body = span("ufn-group-body"); render(item.items, body, group);
        group.append(fence(item.mark), body, fence(item.close)); parent.append(group);
      } else {
        parent.append(document.createTextNode(item.mark)); render(item.items, parent, owner);
        parent.append(document.createTextNode(item.close));
      }
    }
    flush();
  }
  function typesetChildren(element) {
    if (!/[\[\]{}⌊⌋⌈⌉⟨⟩]/u.test(element.textContent)) return;
    const compact = getComputedStyle(element).fontVariantLigatures.includes("discretionary-ligatures");
    const tokens = tokenize(element), output = document.createDocumentFragment();
    render(structure(tokens, compact), output); element.replaceChildren(output);
  }
  let sizing = false;
  function sizeAttachments() {
    sizing = false;
    // Work from inner attachments to outer ones. New nodes are registered inside out.
    for (const [node, observed] of attachments) {
      if (!node.isConnected) {
        resize.unobserve(observed.base);
        resize.unobserve(observed.ink);
        attachments.delete(node); continue;
      }
      const base = node.firstElementChild, corner = node.lastElementChild;
      const content = corner.children[1], ink = content.firstElementChild;
      const baseHeight = base.getBoundingClientRect().height;
      if (!baseHeight) continue; // A closed chapter will be measured when it opens.
      // Use one readable text size throughout nested attachments. Repeated
      // 75% sizes, followed by fitting tall recipes to a short base, made
      // formulas such as the Fourier kernel almost disappear.
      const host = node.closest("code, #result, .example-value");
      corner.style.fontSize = parseFloat(getComputedStyle(host).fontSize) * .75 + "px";
      const height = Math.max(baseHeight * .75, ink.offsetHeight);
      corner.style.height = height + "px";
      content.style.width = ink.offsetWidth + "px";
      ink.style.transform = "translateY(-50%)";
    }
    for (const [bar, owner] of partitions) {
      if (!bar.isConnected) {
        partitions.delete(bar);
        if (!owner.isConnected) resize.unobserve(owner);
        continue;
      }
      // Align to the whole group, including when its contents span several
      // lines. Account for the scale of any enclosing corner attachment.
      const height = owner.offsetHeight;
      if (height) {
        const bounds = owner.getBoundingClientRect(), barBounds = bar.getBoundingClientRect();
        const scale = bounds.height / height;
        bar.style.setProperty("--partition-height", height + "px");
        bar.style.setProperty("--partition-top", (bounds.top - barBounds.top) / scale + "px");
      }
    }
  }
  function requestSize() { if (!sizing) { sizing = true; requestAnimationFrame(sizeAttachments); } }
  const resize = new ResizeObserver(requestSize);
  const sources = new WeakMap();
  const excluded = "textarea, input, select, svg, [contenteditable], [data-insert], .number-tooltip";
  function decorate(element) {
    if (element.closest(excluded)) return;
    const source = element.textContent;
    if (sources.get(element) === source && element.querySelector(":scope > .ufn-typeset")) return;
    if (!/[\[\]{}⌊⌋⌈⌉⟨⟩]/u.test(source)) return;
    const wrapper = span("ufn-typeset");
    wrapper.append(...element.childNodes); element.append(wrapper); typesetChildren(wrapper);
    sources.set(element, source); requestSize();
  }
  let pending = false;
  function refresh() {
    pending = false;
    document.querySelectorAll("code, #result, .example-value").forEach(decorate);
  }
  function requestRefresh() { if (!pending) { pending = true; requestAnimationFrame(refresh); } }
  const observer = new MutationObserver(records => {
    // Layout and tooltip decorations do not change source text. The source cache
    // lets them settle without repeatedly rebuilding the notation.
    if (records.some(record => record.type === "characterData" || record.addedNodes.length || record.removedNodes.length)) requestRefresh();
  });
  observer.observe(document.body, { childList: true, characterData: true, subtree: true });
  // Rebuild display wrappers when font shaping changes, preserving tooltip spans.
  const shapes = new MutationObserver(() => {
    for (const element of document.querySelectorAll("code, #result, .example-value")) {
      const wrappers = [...element.querySelectorAll(".ufn-typeset, .ufn-fenced, .ufn-group-body, .ufn-fence, .ufn-postfix, .ufn-postfix-base, .ufn-corner, .ufn-corner-content, .ufn-corner-ink, .ufn-partition-segment")];
      for (const wrapper of wrappers.reverse()) {
        if (wrapper.matches(".ufn-fence")) wrapper.replaceWith(document.createTextNode(wrapper.textContent));
        else wrapper.replaceWith(...wrapper.childNodes);
      }
      element.normalize(); sources.delete(element);
    }
    requestRefresh();
  });
  shapes.observe(document.documentElement, { attributes: true, attributeFilter: ["data-number-shapes"] });
  document.addEventListener("copy", event => {
    const selection = getSelection();
    if (!event.clipboardData || !selection?.rangeCount || selection.isCollapsed) return;
    const range = selection.getRangeAt(0);
    const container = node => (node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement)?.closest("code, #result, .example-value");
    const start = container(range.startContainer), end = container(range.endContainer);
    if (start && start === end && start.querySelector(".ufn-typeset")) {
      // Browser selection can insert line breaks between grid cells. Copy the actual source nodes.
      event.clipboardData.setData("text/plain", range.cloneContents().textContent);
      event.preventDefault();
    }
  });
  document.fonts?.ready.then(requestSize);
  refresh();
  root.UFNNotationView = { refresh: requestRefresh };
})(globalThis);
