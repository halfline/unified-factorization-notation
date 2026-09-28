(function (root) {
  "use strict";

  const UFN = typeof module !== "undefined" && module.exports ? require("./ufn.js") : root.UFN;
  const { compute, encodeInteger } = UFN;
  const visit = "□⌊⟨◠⟩⌋";
  const axes = ["○", "◠", "⟨◠⟩", "⟨◠○⟩"];
  const spelling = n => encodeInteger(n).replace(/\s/gu, "");

  function choices(options = {}) {
    const result = { sample: "end", recipe: "position", direction: "○", path: "○", order: "after", ...options };
    for (const [key, allowed] of Object.entries({
      sample: ["start", "middle", "end"], recipe: ["constant", "position", "square"],
      direction: axes, path: axes, order: ["before", "after"],
    })) {
      if (!allowed.includes(result[key])) throw new RangeError("Unknown subdivision " + key);
    }
    return result;
  }

  function pieceCount(n) {
    if (!Number.isInteger(n) || n < 1 || n > 64) throw new RangeError("Choose between one and sixty-four pieces");
    return spelling(n);
  }

  function at(index, count, sample) {
    const numerator = sample === "start" ? "[" + index + " | ◠]"
      : sample === "middle" ? "[" + index + " | ⟨◡⟩]" : index;
    return "{" + numerator + " | " + count + "}";
  }

  const directed = (amount, axis) => axis === "○" ? amount : amount + "@" + axis;
  function contribution(index, count, options) {
    const position = at(index, count, options.sample);
    // Combining the position with itself also works at ○, where a power
    // with a nonpositive base would be outside the notation's power rule.
    const amount = options.recipe === "constant" ? "◠"
      : options.recipe === "square" ? "{" + position + " " + position + "}" : position;
    const value = directed(amount, options.direction);
    const piece = "{" + (options.path === "○" ? "" : "◠@" + options.path) + "|" + count + "}";
    const expression = "{" + (options.order === "after" ? value + " " + piece : piece + " " + value) + "}";
    return { position, value, piece, expression };
  }

  function stage(count, options) {
    return "[" + visit + " : ◠ … " + count + " : " + contribution(visit, count, options).expression + "]";
  }

  // The single outer visit supplies the piece count using ordinary scope.
  // No decimal calculation supplies the sample, width, or finite answer.
  function approximation(pieces, options) {
    const count = pieceCount(pieces);
    return "[□ : " + count + " … " + count + " : " + stage("□", choices(options)) + "]";
  }

  function correctionSeries(options, through = null, measured = false) {
    options = choices(options);
    const end = through === null ? "" : pieceCount(through);
    return "[" + stage("◠", options) + " [□ : ⟨◠⟩ … " + end + " : ["
      + stage("□", options) + " | " + stage("[□ | ◠]", options) + "]]" + (measured ? "⌊○⌋" : "") + "]";
  }
  const corrections = (options, through = null) => correctionSeries(options, through);
  const definition = options => correctionSeries(options, null, true);

  function describe(pieces, options) {
    options = choices(options);
    const count = pieceCount(pieces);
    const expression = approximation(pieces, options);
    // These destinations are proved for the three lesson recipes. They are
    // reference values, not limits discovered by the finite evaluator.
    const amount = { constant: "◠", position: "⟨◡⟩", square: "⟨◡○⟩" }[options.recipe];
    const value = directed(amount, options.direction), path = directed("◠", options.path);
    const destination = compute("{" + (options.order === "after" ? value + " " + path : path + " " + value) + "}").canonical;
    const total = compute(expression).canonical;
    const rows = Array.from({ length: pieces }, (_, i) => {
      const index = spelling(i + 1);
      const part = contribution(index, count, options);
      return [index, part.position, part.value, part.piece, part.expression].map(source => compute(source).canonical);
    });
    return {
      expression, total, destination, rows,
      correctionExpression: corrections(options),
      definition: definition(options),
      gap: compute("[" + destination + " | " + total + "]").canonical,
    };
  }

  const api = { approximation, corrections, definition, describe };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.UFNSubdivision = api;

  if (typeof document === "undefined") return;
  const demo = document.getElementById("subdivision-demo");
  if (!demo) return;
  const get = id => document.getElementById("subdivision-" + id);
  const controls = ["pieces", "sample", "recipe", "direction", "path", "order"];
  const svgNamespace = "http://www.w3.org/2000/svg";
  function element(name, attributes) {
    const node = document.createElementNS(svgNamespace, name);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
    return node;
  }

  function draw(pieces, options) {
    // This independent projection controls pixels only. All displayed
    // arithmetic above is evaluated from UFN expressions by the exact engine.
    const left = 48, bottom = 240, width = 380, height = 190;
    const amount = t => options.recipe === "constant" ? 1 : options.recipe === "square" ? t * t : t;
    const scene = get("scene");
    scene.replaceChildren();
    for (let i = 0; i < pieces; i++) {
      const offset = options.sample === "start" ? 0 : options.sample === "middle" ? 0.5 : 1;
      const t = (i + offset) / pieces, y = bottom - height * amount(t);
      scene.append(element("rect", { x: left + width * i / pieces, y, width: width / pieces,
        height: bottom - y, class: "subdivision-piece" }));
      scene.append(element("circle", { cx: left + width * t, cy: y, r: pieces > 16 ? 2 : 3,
        class: "subdivision-sample" }));
    }
    const points = Array.from({ length: 81 }, (_, i) => {
      const t = i / 80;
      return (left + width * t) + "," + (bottom - height * amount(t));
    }).join(" ");
    scene.append(element("polyline", { points, class: "subdivision-curve" }));
    get("plot-description").textContent = "The journey is shared into " + pieces + " equal pieces, sampled at each piece's "
      + options.sample + ". Rectangle heights show the recipe's forward amount before direction is attached.";
  }

  function update() {
    const pieces = Number(get("pieces").value);
    const options = Object.fromEntries(controls.slice(1).map(key => [key, get(key).value]));
    try {
      const result = describe(pieces, options);
      get("expression").textContent = UFN.formatSource(result.expression);
      for (const key of ["total", "destination", "gap"]) get(key).textContent = compute(result[key]).display;
      get("corrections").textContent = UFN.formatSource(result.definition);
      get("try").dataset.example = result.expression;
      get("try-limit").dataset.example = result.definition;
      get("try-partial").dataset.example = result.correctionExpression;
      const rows = result.rows.map(values => {
        const row = document.createElement("tr");
        values.forEach(value => {
          const cell = document.createElement("td"), code = document.createElement("code");
          code.textContent = value;
          cell.append(code); row.append(cell);
        });
        return row;
      });
      get("visits").replaceChildren(...rows);
      get("status").textContent = "This is the exact total for " + spelling(pieces) + " pieces. "
        + (result.gap === "○" ? "It reaches the lesson's destination at this subdivision too. " : "Finer subdivisions approach the lesson's destination. ")
        + "A finite calculation alone does not establish a limit.";
      draw(pieces, options);
    } catch (error) {
      get("status").textContent = error.message;
    }
  }
  controls.forEach(key => get(key).addEventListener("change", update));
  update();
})(typeof globalThis !== "undefined" ? globalThis : this);
