(function (root) {
  "use strict";
  const UFN = typeof module !== "undefined" && module.exports ? require("./ufn.js") : root.UFN;
  const library = typeof module !== "undefined" && module.exports ? require("./library.js") : root.UFNLibrary;
  const n = UFN.encodeInteger;
  function valid(available, picked = 0) {
    if (!Number.isInteger(available) || available < 0 || available > 20 || !Number.isInteger(picked) || picked < 0 || picked > available) throw new RangeError("Use whole counts through twenty and pick no more than are available.");
  }
  function exact(source) {
    const answer = UFN.compute(source);
    if (!answer.canonical) throw new Error("This selection count must reduce exactly.");
    return { source, canonical: answer.canonical, decimal: answer.value[0] };
  }
  function spell(node) {
    if (node.type === "atom") return node.value;
    if (node.type === "prime" && !node.position) return "⟨" + node.entries.map(spell).join("") + "⟩";
    throw new Error("Expected whole factor instructions.");
  }
  function instructions(answer) {
    const tree = new UFN.Parser(answer.canonical).parse();
    return tree.type === "prime" ? tree.entries.map(spell).reverse() : [];
  }
  function selection(available, picked) {
    valid(available, picked);
    const factorial = endpoint => exact("{□ : ◠ … " + endpoint + " : □}");
    const complement = exact("[" + n(available) + " | " + n(picked) + "]");
    const numerator = factorial(n(available)), chosen = factorial(n(picked)), rest = factorial(complement.canonical);
    const denominator = exact("{" + chosen.canonical + " " + rest.canonical + "}");
    const source = library.declarations(["binomial"]) + "\n\n◆⟪" + n(available) + " : " + n(picked) + "⟫";
    const result = exact(source);
    const a = instructions(numerator), b = instructions(chosen), c = instructions(rest), d = instructions(denominator);
    const rows = Array.from({ length: a.length }, (_, place) => ({
      factor: exact("⟨◠⟩⌊" + n(place + 1) + "⌋"),
      numerator: a[place] || "○", chosen: b[place] || "○", rest: c[place] || "○", undo: d[place] || "○",
      remaining: exact("[" + (a[place] || "○") + " | " + (d[place] || "○") + "]").canonical
    }));
    return { available, picked, complement, numerator, chosen, rest, denominator, result, rows };
  }
  function row(available) {
    valid(available);
    const source = library.declarations(["pascal"]) + "\n\n▱⟪" + n(available) + "⟫";
    const answer = UFN.compute(source);
    if (!answer.established || !answer.items?.every(item => item.canonical)) throw new Error("The complete Pascal row must reduce exactly.");
    return { source, answer };
  }
  if (typeof module !== "undefined" && module.exports) { module.exports = { selection, row, instructions }; return; }
  root.UFNPascal = { selection, row, instructions };
  const demo = document.getElementById("pascal-demo"); if (!demo) return;
  const get = name => document.getElementById("pascal-" + name);
  const element = (tag, text) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; return node; };
  const words = ["None", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];
  words.forEach((word, value) => { const option = element("option", word); option.value = value; get("available").append(option); });
  get("available").value = 5;
  let available = 5, picked = 2, current = null;
  const cache = new Map();
  function rowFor(value) { if (!cache.has(value)) cache.set(value, row(value)); return cache.get(value); }
  function inspect() {
    current = selection(available, picked);
    get("selection-title").replaceChildren("Available: ", element("code", n(available)), " · pick: ", element("code", n(picked)));
    get("result").textContent = current.result.canonical;
    get("numerator").textContent = current.numerator.source + " = " + current.numerator.canonical;
    get("chosen").textContent = current.chosen.source + " = " + current.chosen.canonical;
    get("rest").textContent = current.rest.source + " = " + current.rest.canonical;
    get("selection-try").dataset.example = current.result.source;
    get("cancellation").hidden = true;
    get("reveal").disabled = false;
    get("selected-reading").textContent = "The first curly range counts ordered arrangements. Undoing the other two ranges removes different orders of the same picked and unpicked items.";
    get("triangle").querySelectorAll("button").forEach(button => button.setAttribute("aria-pressed", String(Number(button.dataset.available) === available && Number(button.dataset.picked) === picked)));
  }
  function paint() {
    const rows = [];
    for (let value = 0; value <= available; value++) {
      const line = element("div"), heading = element("span", words[value] + " available");
      line.className = "pascal-line"; heading.className = "pascal-line-label";
      const group = element("div"); group.className = "pascal-row"; group.setAttribute("role", "group"); group.setAttribute("aria-label", "Selections from " + words[value].toLowerCase());
      rowFor(value).answer.items.forEach((item, index) => {
        const button = element("button"); button.type = "button"; button.dataset.available = value; button.dataset.picked = index;
        button.setAttribute("aria-label", words[value] + " available, pick " + words[index].toLowerCase());
        button.append(element("code", item.canonical));
        button.addEventListener("click", () => { available = value; picked = index; inspect(); });
        group.append(button);
      });
      line.append(heading, group); rows.push(line);
    }
    const lines = element("div"); lines.className = "pascal-lines"; lines.append(...rows);
    get("triangle").replaceChildren(lines);
    const count = Number(get("available").value);
    get("row-source").textContent = "▱⟪" + n(count) + "⟫";
    get("row-try").dataset.example = rowFor(count).source;
    get("polynomial-try").dataset.example = library.declarations(["pascal", "polynomial"]) + "\n\n△⟪⟨◠⟩ : ▱⟪" + n(count) + "⟫⟫";
    inspect();
  }
  get("available").addEventListener("change", () => { available = Number(get("available").value); picked = Math.min(picked, available); paint(); });
  get("reveal").addEventListener("click", () => {
    const rows = current.rows.slice().reverse().map(row => {
      const tr = element("tr"), th = element("th"); th.scope = "row"; th.append(element("code", row.factor.canonical)); tr.append(th);
      [row.numerator, row.chosen, row.rest, row.undo, row.remaining].forEach(value => { const td = element("td"); td.append(element("code", value)); tr.append(td); }); return tr;
    });
    get("cancellation-rows").replaceChildren(...rows);
    get("cancellation").hidden = false; get("reveal").disabled = true;
    get("cancellation-reading").textContent = rows.length ? "Join the two instructions to undo, then remove that total from the available factorial at each place. The remaining instructions spell the selection count." : "Every range is empty or visits only one. Each contributes ◠; there are no factor instructions to cancel.";
  });
  demo.hidden = false; paint();
})(typeof globalThis !== "undefined" ? globalThis : this);
