(function (root) {
  "use strict";
  const UFN = typeof module !== "undefined" && module.exports ? require("./ufn.js") : root.UFN;
  const { compute, preview, measure, encodeInteger: spell } = UFN;

  function describe(basePosition = 1, place = 1, kind = "sum", visits = 4) {
    if (![1, 2, 3].includes(basePosition) || ![0, 1, 2, 3].includes(place)
      || !["sum", "product"].includes(kind) || !Number.isInteger(visits) || visits < 1 || visits > 6)
      throw new RangeError("Choose a displayed factor, measuring place, range kind, and one to six visits");
    const base = "⟨◠⟩⌊" + spell(basePosition) + "⌋", selected = spell(place);
    const open = kind === "sum" ? "[" : "{", close = kind === "sum" ? "]" : "}";
    const start = kind === "sum" ? "○" : "◠", body = kind === "sum" ? base + "⌈□⌉" : base;
    const recipe = open + "□ : " + start + " … : " + body + close + "⌊" + selected + "⌋";
    const candidate = compute(kind === "sum" ? "{|[◠ | " + base + "]}" : "○");
    let limit = null, reason = "";
    try { limit = compute(recipe); }
    catch (error) { if (!/has no limit/.test(error.message)) throw error; reason = error.message; }
    const rows = [];
    for (let n = 1; n <= visits; n++) {
      // A bounded source remains safe to reuse even if its canonical spelling
      // exceeds a resource limit. An attached recipe would denote its limit.
      const finiteSource = open + "□ : " + start + " … " + spell(kind === "sum" ? n - 1 : n) + " : " + body + close;
      const gap = "[" + finiteSource + " | " + candidate.canonical + "]";
      rows.push({ n, partial: preview(recipe, n), ordinary: measure(gap, "○"), selected: measure(gap, selected) });
    }
    return { base, place, recipe, candidate, limit, reason, rows };
  }
  if (typeof module !== "undefined" && module.exports) { module.exports = { describe }; return; }
  root.UFNMeasuringPlace = { describe };
  if (!document.getElementById("measuring-demo")) return;
  const get = name => document.getElementById("measuring-" + name);
  const namespace = "http://www.w3.org/2000/svg";
  function svgNode(name, attributes, text) {
    const node = document.createElementNS(namespace, name);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function plot(result) {
    const svg = get("plot"), layer = document.createDocumentFragment();
    const base = compute(result.base).value[0], log = value => Math.log(value) / Math.log(base);
    const logs = result.rows.flatMap(row => [log(row.ordinary.value[0]), log(row.selected.value[0])]);
    const low = Math.min(-1, Math.floor(Math.min(...logs))), high = Math.max(1, Math.ceil(Math.max(...logs)));
    const y = value => 225 - (value - low) / (high - low) * 190;
    const x = n => 105 + (n - 1) * 495 / Math.max(1, result.rows.length - 1);
    for (const level of [low, 0, high]) {
      layer.append(svgNode("line", { x1: 100, x2: 615, y1: y(level), y2: y(level), class: "measurement-gridline" }));
      const label = compute(result.base + "⌈" + spell(level) + "⌉").display;
      layer.append(svgNode("text", { x: 88, y: y(level) + 5, "text-anchor": "end", class: "measurement-axis" }, label));
    }
    for (const [key, className] of [["ordinary", "measurement-ordinary"], ["selected", "measurement-selected"]]) {
      const points = result.rows.map(row => [x(row.n), y(log(row[key].value[0]))]);
      layer.append(svgNode("polyline", { points: points.map(point => point.join(",")).join(" "), class: className, fill: "none" }));
      points.forEach(([cx, cy]) => layer.append(svgNode("circle", { cx, cy, r: 4, class: className })));
    }
    result.rows.forEach(row => layer.append(svgNode("text", { x: x(row.n), y: 254, "text-anchor": "middle", class: "measurement-axis" }, spell(row.n))));
    svg.replaceChildren(layer);
    get("plot-description").textContent = "Gap from " + result.candidate.display + ". Orange shows ordinary distance; blue shows the selected measurement. Exact distances for each visit are in the table below.";
  }
  function update() {
    const result = describe(Number(get("base").value), Number(get("place").value), get("kind").value, Number(get("visits").value));
    get("recipe").textContent = result.recipe;
    get("candidate").textContent = result.candidate.display;
    get("partial").textContent = result.rows.at(-1).partial.display;
    get("gap").textContent = result.rows.at(-1).selected.display;
    get("visit-count").textContent = spell(result.rows.length);
    get("status").textContent = result.limit
      ? "Proved limit: " + result.limit.display + ". The selected gap approaches ○. The proof applies to every later visit."
      : "No limit in the selected measurement. " + result.reason;
    get("status").dataset.state = result.limit ? "success" : "divergent";
    get("try").dataset.example = result.recipe;
    get("rows").replaceChildren();
    for (const row of result.rows) {
      const tr = document.createElement("tr");
      for (const value of [spell(row.n), row.partial.display, row.ordinary.display, row.selected.display]) {
        const td = document.createElement("td"), code = document.createElement("code");
        code.textContent = value; td.append(code); tr.append(td);
      }
      get("rows").append(tr);
    }
    plot(result);
  }
  for (const name of ["base", "place", "kind", "visits"]) get(name).addEventListener("input", update);
  update();
})(typeof globalThis !== "undefined" ? globalThis : this);
