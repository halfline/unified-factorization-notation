(function (root) {
  "use strict";

  const UFN = typeof module !== "undefined" && module.exports ? require("./ufn.js") : root.UFN;
  const { compute, encodeInteger } = UFN;
  const axes = ["○", "◠", "⟨◠⟩", "⟨◠○⟩"];

  function describe(halvings = 1, options = {}) {
    const choices = { point: 1, pointAxis: "○", direction: "○", side: "forward", ...options };
    if (!Number.isInteger(halvings) || halvings < 0 || halvings > 6) {
      throw new RangeError("Choose between zero and six halvings");
    }
    if (!Number.isInteger(choices.point) || choices.point < -2 || choices.point > 2) {
      throw new RangeError("Choose a starting count between two backward and two forward steps");
    }
    if (!axes.includes(choices.pointAxis) || !axes.includes(choices.direction)
        || !["forward", "backward"].includes(choices.side)) {
      throw new RangeError("Unknown derivative direction or side");
    }
    const point = compute(encodeInteger(choices.point) + "@" + choices.pointAxis);
    const direction = compute("◠@" + choices.direction);
    const sign = choices.side === "forward" ? "◠" : "◡";
    const step = compute("{" + sign + " | ⟨◠⟩⌈" + encodeInteger(halvings) + "⌉}");
    const x = point.canonical, v = direction.canonical, h = step.canonical;
    const moved = "[" + x + " {" + h + " " + v + "}]";
    const expression = "{[{" + moved + " " + moved + "} | {" + x + " " + x + "}] | " + h + "}";
    // Exact values come only from UFN expressions. The destination is a
    // proved lesson identity, not a limit inferred from finite samples:
    // ((X + hV)(X + hV) - XX) / h = XV + VX + hVV, for scalar h != 0.
    const derivativeExpression = "[{" + x + " " + v + "} {" + v + " " + x + "}]";
    const rate = compute(expression), derivative = UFN.differentiate("{□ □}", { at: x, along: v });
    return {
      expression, derivativeExpression, point, direction, step, rate, derivative,
      error: compute("[" + rate.canonical + " | " + derivative.canonical + "]"),
      output: compute("{" + x + " " + x + "}"),
      curvature: compute("{" + v + " " + v + "}"),
    };
  }

  const api = { describe };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.UFNDerivatives = api;

  if (typeof document === "undefined") return;
  const demo = document.getElementById("derivative-demo");
  if (!demo) return;
  const get = id => document.getElementById("derivative-" + id);
  const controls = ["point", "halvings", "side", "point-axis", "direction"];
  const namespace = "http://www.w3.org/2000/svg";
  let current;
  function element(name, attributes, text) {
    const node = document.createElementNS(namespace, name);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function draw(result) {
    // Decimal projection determines pixels only. No plotted value feeds back
    // into a UFN answer or the reference derivative.
    const component = axes.indexOf(get("component").value);
    const origin = result.output.value[component], slope = result.derivative.value[component];
    const bend = result.curvature.value[component], h = result.step.value[0];
    const finiteSlope = result.rate.value[component];
    const curve = t => origin + slope * t + bend * t * t;
    const tangent = t => origin + slope * t;
    const secant = t => origin + finiteSlope * t;
    const ticks = [-1, 0, 1], span = 1.15;
    const samples = Array.from({ length: 81 }, (_, i) => -span + 2 * span * i / 80);
    const values = samples.flatMap(t => [curve(t), tangent(t), secant(t)]);
    let min = Math.min(...values), max = Math.max(...values);
    const padding = Math.max((max - min) / 10, 0.5);
    min -= padding; max += padding;
    const px = t => 76 + (t + span) / (2 * span) * 490;
    const py = value => 265 - (value - min) / (max - min) * 215;
    const plot = get("plot");
    plot.replaceChildren();
    for (const t of ticks) {
      plot.append(element("line", { x1: px(t), x2: px(t), y1: 45, y2: 270, class: "derivative-grid" }));
      plot.append(element("text", { x: px(t), y: 293, "text-anchor": "middle" }, encodeInteger(t)));
    }
    plot.append(element("line", { x1: 65, x2: 576, y1: py(origin), y2: py(origin), class: "derivative-grid" }));
    // At the bounded whole starting points, all output components are whole.
    plot.append(element("text", { x: 60, y: py(origin) + 7, "text-anchor": "end" }, encodeInteger(origin)));
    for (const [fn, className] of [[curve, "derivative-curve"], [tangent, "derivative-tangent"], [secant, "derivative-secant"]]) {
      plot.append(element("polyline", { points: samples.map(t => px(t) + "," + py(fn(t))).join(" "), class: className }));
    }
    plot.append(element("circle", { cx: px(0), cy: py(origin), r: 5, class: "derivative-start" }));
    plot.append(element("circle", { cx: px(h), cy: py(curve(h)), r: 5, class: "derivative-end" }));
    plot.append(element("text", { x: 320, y: 322, "text-anchor": "middle", class: "derivative-axis-caption" }, "Progress along the chosen input direction"));
    plot.append(element("text", { x: 76, y: 25, class: "derivative-axis-caption" }, "Output component @" + axes[component]));
    get("plot-description").textContent = "The curve shows the selected component of the input combined with itself. "
      + "The orange dashed line joins the starting and changed outputs. The blue dotted line shows the proved rate at the starting input. "
      + (bend === 0 ? "For this component the three lines coincide: its response along this route is already linear. " : "")
      + "This is a decimal drawing; the readouts above come from exact UFN arithmetic.";
  }

  function update() {
    try {
      current = describe(Number(get("halvings").value), {
        point: Number(get("point").value), pointAxis: get("point-axis").value,
        direction: get("direction").value, side: get("side").value,
      });
      for (const key of ["point", "direction", "step", "rate", "derivative", "error"]) {
        get(key + "-value").textContent = current[key].display;
      }
      get("expression").textContent = UFN.formatSource(current.expression);
      get("derivative-expression").textContent = current.derivativeExpression;
      get("try").dataset.example = current.expression;
      get("try-derivative").dataset.example = current.derivativeExpression;
      get("shrink").disabled = get("halvings").value === "6";
      get("status").textContent = "The extra term is the gap between this finite rate and the derivative. "
        + "It approaches ○ as the progress change approaches ○, from either side.";
      draw(current);
    } catch (error) {
      get("status").textContent = error.message;
    }
  }
  controls.forEach(key => get(key).addEventListener("change", update));
  get("component").addEventListener("change", () => { if (current) draw(current); });
  get("shrink").addEventListener("click", () => {
    get("halvings").value = String(Math.min(6, Number(get("halvings").value) + 1));
    update();
  });
  update();

  const form = document.getElementById("differentiate-form");
  if (!form) return;
  const input = id => document.getElementById("differentiate-" + id);
  function evaluateRecipe() {
    try {
      const answer = UFN.differentiate(input("recipe").value, {
        at: input("point").value, along: input("direction").value,
      });
      input("answer").textContent = answer.display || "";
      input("answer").hidden = !answer.display;
      input("status").textContent = answer.established
        ? answer.display ? "Exact derivative for this starting input and direction." : "The derivative was found, but " + answer.reason
        : "Cannot establish a derivative here. " + answer.reason;
      input("rules").textContent = answer.established ? "Rules used: " + (answer.rules.join(", ") || "constant recipe") + "." : "";
      input("error").textContent = "";
      input("try").hidden = !answer.ufn;
      if (answer.ufn) input("try").dataset.example = answer.ufn;
    } catch (error) {
      input("answer").textContent = ""; input("answer").hidden = true;
      input("status").textContent = ""; input("rules").textContent = "";
      input("error").textContent = error.message;
      input("try").hidden = true;
    }
  }
  form.addEventListener("submit", event => { event.preventDefault(); evaluateRecipe(); });
  document.querySelectorAll("[data-derivative-recipe]").forEach(button => button.addEventListener("click", () => {
    input("recipe").value = button.dataset.derivativeRecipe;
    input("point").value = button.dataset.derivativePoint || "◠";
    input("direction").value = button.dataset.derivativeDirection || "◠";
    evaluateRecipe();
  }));
  evaluateRecipe();
})(typeof globalThis !== "undefined" ? globalThis : this);
