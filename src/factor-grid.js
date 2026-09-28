(function (root) {
  "use strict";
  const UFN = typeof module !== "undefined" && module.exports ? require("./ufn.js") : root.UFN;

  function choices(factorCount = 2, maximum = 2) {
    if (!Number.isInteger(factorCount) || factorCount < 1 || factorCount > 3
      || !Number.isInteger(maximum) || maximum < 0 || maximum > 3) throw new RangeError("Choose one to three factors and zero to three uses.");
    const rows = [], total = (maximum + 1) ** factorCount;
    for (let index = 0; index < total; index++) {
      let rest = index;
      const exponents = [];
      for (let place = 0; place < factorCount; place++) {
        exponents.push(rest % (maximum + 1));
        rest = Math.floor(rest / (maximum + 1));
      }
      const source = "⟨" + exponents.map(UFN.encodeInteger).reverse().join("") + "⟩";
      const answer = UFN.compute(source);
      // Native indices only enumerate the small grid. UFN evaluates each number;
      // its decimal projection is the familiar reading shown beside the spelling.
      rows.push({ exponents, source, canonical: answer.canonical, decimal: answer.value[0] });
    }
    return rows;
  }
  if (typeof module !== "undefined" && module.exports) { module.exports = { choices }; return; }
  root.UFNFactorGrid = { choices };
  const demo = document.getElementById("factor-grid");
  if (!demo) return;
  const get = name => document.getElementById("factor-grid-" + name);
  let rows = [], cells = [], revealed = 0, timer = null;
  const labels = ["⟨◠⟩", "⟨◠○⟩", "⟨◠○○⟩"];
  function element(name, text, className) {
    const node = document.createElement(name);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function pause() {
    clearInterval(timer); timer = null;
    get("play").textContent = revealed === rows.length ? "Unfold again" : "Unfold grid";
  }
  function progress() {
    get("next").disabled = revealed === rows.length;
    get("status").textContent = revealed + " of " + rows.length + " choices unfolded. "
      + (revealed === rows.length ? "Every result is different. Each whole number has one set of factor instructions."
        : "The instructions stay aligned; each choice supplies one whole number.");
  }
  function next() {
    if (revealed === rows.length) { pause(); return; }
    const index = revealed++, row = rows[index];
    cells.forEach(cell => cell.classList.remove("current"));
    cells[index].classList.add("unfolded", "current");
    cells[index].querySelector(".factor-grid-reading").textContent = "→ " + row.decimal;
    const numbers = rows.slice(0, revealed).map(row => row.decimal).sort((a, b) => a - b);
    get("collection").replaceChildren(...numbers.map(number => element("li", String(number), number === row.decimal ? "is-new" : "")));
    if (revealed === rows.length) pause();
    progress();
  }
  function reset() {
    pause(); revealed = 0; cells = [];
    const count = Number(get("factors").value), maximum = Number(get("maximum").value);
    rows = choices(count, maximum);
    get("collection").replaceChildren(); get("tables").replaceChildren();
    const side = maximum + 1, height = count > 1 ? side : 1, slices = count > 2 ? side : 1;
    for (let slice = 0; slice < slices; slice++) {
      const scroll = element("div", undefined, "algorithm-table-wrap");
      const table = element("table", undefined, "algorithm-table factor-grid-table");
      const caption = element("caption");
      caption.append("Across: uses of ", element("code", labels[0]));
      if (count > 1) caption.append(" · Down: uses of ", element("code", labels[1]));
      if (count > 2) caption.append(" · Uses of ", element("code", labels[2]), ": ", element("code", UFN.encodeInteger(slice)));
      table.append(caption);
      const head = element("thead"), headers = element("tr"), corner = element("th", "Uses");
      corner.scope = "col"; headers.append(corner);
      for (let column = 0; column < side; column++) {
        const th = element("th"); th.scope = "col";
        th.append(element("code", UFN.encodeInteger(column))); headers.append(th);
      }
      head.append(headers); table.append(head);
      const body = element("tbody");
      for (let y = 0; y < height; y++) {
        const tr = element("tr"), label = element("th"); label.scope = "row";
        label.append(element("code", UFN.encodeInteger(y))); tr.append(label);
        for (let x = 0; x < side; x++) {
          const row = rows[(slice * height + y) * side + x], cell = element("td");
          cell.append(element("code", row.source), element("span", "→ ?", "factor-grid-reading"));
          cells.push(cell); tr.append(cell);
        }
        body.append(tr);
      }
      table.append(body); scroll.append(table); get("tables").append(scroll);
    }
    get("play").textContent = "Unfold grid";
    progress();
  }
  get("play").addEventListener("click", () => {
    if (timer) { pause(); return; }
    if (revealed === rows.length) reset();
    next();
    if (revealed < rows.length) { get("play").textContent = "Pause"; timer = setInterval(next, 650); }
  });
  get("next").addEventListener("click", () => { pause(); next(); });
  get("reset").addEventListener("click", reset);
  get("factors").addEventListener("change", reset);
  get("maximum").addEventListener("change", reset);
  document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); });
  demo.closest("details")?.addEventListener("toggle", event => { if (!event.target.open) pause(); });
  reset();
})(typeof globalThis !== "undefined" ? globalThis : this);
