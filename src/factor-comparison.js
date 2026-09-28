(function (root) {
  "use strict";
  const UFN = typeof module !== "undefined" && module.exports ? require("./ufn.js") : root.UFN;
  const spell = uses => "⟨" + [...uses].reverse().map(UFN.encodeInteger).join("") + "⟩";
  function number(source) {
    const answer = UFN.compute(source);
    if (!answer.canonical) throw new Error("The factor experiment needs an exact result.");
    return { source, canonical: answer.canonical, decimal: answer.value[0] };
  }
  function compare(a, b, stages = 2) {
    for (const uses of [a, b]) {
      if (!Array.isArray(uses) || uses.length !== 3 || uses.some(n => !Number.isInteger(n) || n < 0 || n > 6)) throw new RangeError("Choose zero through six uses at each of three places.");
    }
    if (!Number.isInteger(stages) || stages < 2 || stages > 4) throw new RangeError("Choose two, three, or four equal changes.");
    // These bounded counts are the controls' factor coordinates. Magnitudes,
    // quotients and roots are computed by the shared exact UFN evaluator.
    const sharedUses = a.map((n, i) => Math.min(n, b[i]));
    const commonUses = a.map((n, i) => Math.max(n, b[i]));
    const first = number(spell(a)), second = number(spell(b));
    const shared = number(spell(sharedUses)), common = number(spell(commonUses));
    const fits = a.every((n, i) => n <= b[i]);
    return {
      first, second, shared, common, sharedUses, commonUses, fits,
      commonFirstGroups: number("{" + common.source + " | " + first.source + "}"),
      commonSecondGroups: number("{" + common.source + " | " + second.source + "}"),
      sum: number("[" + first.source + " " + second.source + "]"),
      firstGroups: number("{" + first.source + " | " + shared.source + "}"),
      secondGroups: number("{" + second.source + " | " + shared.source + "}"),
      quotient: fits ? number("{" + second.source + " | " + first.source + "}") : null,
      root: number(first.source + "⌈{|" + UFN.encodeInteger(stages) + "}⌉"),
      wholeRoot: a.every(n => n % stages === 0),
      rootEntries: a.map(n => number("{" + UFN.encodeInteger(n) + " | " + UFN.encodeInteger(stages) + "}")),
      blocked: a.findIndex((n, i) => n > b[i]), stages
    };
  }
  if (typeof module !== "undefined" && module.exports) { module.exports = { compare, spell }; return; }
  root.UFNFactorComparison = { compare, spell };
  const demo = document.getElementById("factor-comparison-demo");
  if (!demo) return;
  const get = name => document.getElementById("factor-compare-" + name);
  const element = (tag, text) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; return node; };
  const words = ["None", "Once", "Twice", "Three times", "Four times", "Five times", "Six times"];
  const factors = ["two", "three", "five"];
  const controls = [[], []];
  for (let row = 0; row < 2; row++) {
    const field = get(row ? "second-controls" : "first-controls");
    for (let place = 2; place >= 0; place--) {
      const label = element("label", "Uses of " + factors[place]), select = element("select");
      select.id = "factor-compare-" + row + "-" + place;
      label.htmlFor = select.id;
      words.forEach((word, n) => { const option = element("option", word); option.value = n; select.append(option); });
      const cell = element("div"); cell.append(label, select); field.append(cell); controls[row][place] = select;
      select.addEventListener("change", update);
    }
  }
  let current, uses, revealed = false;
  function row(label, values, answer) {
    const tr = element("tr"), th = element("th", label); th.scope = "row";
    th.append(element("code", answer.canonical), element("span", " — " + answer.decimal)); tr.append(th);
    [...values].reverse().forEach(n => { const td = element("td"); td.append(element("code", UFN.encodeInteger(n))); tr.append(td); });
    return tr;
  }
  function paint() {
    const rows = [row("First count", uses[0], current.first), row("Second count", uses[1], current.second)];
    if (revealed) rows.push(row("Largest shared group · keep the smaller", current.sharedUses, current.shared), row("Smallest count both fit into · keep the larger", current.commonUses, current.common));
    get("rows").replaceChildren(...rows);
    get("answer").hidden = !revealed;
    if (revealed) {
      get("fit").textContent = current.fits ? "The first count fits into the second with no leftover. There are " + current.quotient.decimal + " whole groups." : "The first count does not fit into the second with no leftover: it needs more uses of " + factors[current.blocked] + " than the second has.";
      get("shared-reading").textContent = "The shared " + current.shared.decimal + "-step group fits " + current.firstGroups.decimal + " times into the first count and " + current.secondGroups.decimal + " times into the second.";
      get("common-reading").textContent = "The common " + current.common.decimal + "-step count holds " + current.commonFirstGroups.decimal + " groups of the first count, or " + current.commonSecondGroups.decimal + " groups of the second.";
      get("shared-recipe").textContent = "[{" + current.shared.canonical + " " + current.firstGroups.canonical + "} {" + current.shared.canonical + " " + current.secondGroups.canonical + "}]";
      get("addition-recipe").textContent = "{" + current.shared.canonical + " [" + current.firstGroups.canonical + " " + current.secondGroups.canonical + "]} = " + current.sum.canonical;
    }
    get("reveal").disabled = revealed;
  }
  function update() {
    uses = controls.map(row => row.map(select => Number(select.value)));
    current = compare(...uses, Number(get("stages").value));
    revealed = false; get("root-answer").hidden = true; get("root-reveal").disabled = false;
    get("root-input").textContent = current.first.canonical;
    paint();
  }
  function preset(a, b) { [a, b].forEach((values, row) => values.forEach((n, place) => { controls[row][place].value = n; })); update(); }
  get("preset").addEventListener("change", () => {
    const pairs = [[[2, 1, 0], [1, 2, 0]], [[3, 2, 0], [4, 2, 0]], [[2, 2, 0], [2, 1, 1]]];
    preset(...pairs[Number(get("preset").value)]);
  });
  get("reveal").addEventListener("click", () => { revealed = true; paint(); });
  get("stages").addEventListener("change", update);
  get("root-reveal").addEventListener("click", () => {
    const rows = [];
    for (let place = 2; place >= 0; place--) {
      const tr = element("tr"), th = element("th", "At " + factors[place]); th.scope = "row"; tr.append(th);
      const entry = element("td"), split = element("td");
      entry.append(element("code", UFN.encodeInteger(uses[0][place]))); split.append(element("code", current.rootEntries[place].canonical)); tr.append(entry, split); rows.push(tr);
    }
    get("root-rows").replaceChildren(...rows);
    get("root-answer").hidden = false; get("root-reveal").disabled = true;
    get("root-reading").textContent = current.wholeRoot ? "Every instruction splits into whole counts. The root is a whole number: " + current.root.decimal + "." : "At least one instruction needs a share. This root exists, but it is not a whole number.";
    get("root-source").textContent = current.root.canonical;
    get("root-check").textContent = current.root.canonical + "⌈" + UFN.encodeInteger(current.stages) + "⌉ = " + current.first.canonical;
  });
  demo.hidden = false; preset([2, 1, 0], [1, 2, 0]);
})(typeof globalThis !== "undefined" ? globalThis : this);
