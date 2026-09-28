(function () {
  "use strict";

  const graph = document.getElementById("direction-plane");
  if (!graph) return;
  const { compute, encodeInteger } = globalThis.UFN;
  const scene = document.getElementById("direction-scene");
  const axisChoice = document.getElementById("direction-axis");
  const labels = ["○", "◠", "⟨◠⟩", "⟨◠○⟩"];
  const colors = ["#386a49", "#487696", "#b16a3f"];
  const svgNamespace = "http://www.w3.org/2000/svg";
  const unit = 44;
  const defaultView = { yaw: 0.65, pitch: 0.42 };
  const view = { ...defaultView };
  let exact = compute("◠");
  let coefficients = exact.components;
  let value = exact.value;
  let scale = 0;
  let lastFactor = "◠@○";
  let drag = null;
  let frame = null;

  const compact = source => source.replace(/\s/gu, "");
  const clean = amount => Math.abs(amount) < 1e-10 ? 0 : amount;

  function turnFactor(quarter) {
    const direction = axisChoice.value;
    return quarter ? "◠@" + direction
      : "{[◠@○ ◠@" + direction + "] | ⟨⟨◡⟩⟩}";
  }

  // Orthographic projection: camera motion never changes the number.
  function project(point) {
    const [x, y, z] = point;
    const horizontal = Math.cos(view.yaw) * x - Math.sin(view.yaw) * z;
    const depth = Math.sin(view.yaw) * x + Math.cos(view.yaw) * z;
    const vertical = Math.cos(view.pitch) * y - Math.sin(view.pitch) * depth;
    return [260 + unit * horizontal, 230 - unit * vertical,
      Math.sin(view.pitch) * y + Math.cos(view.pitch) * depth];
  }

  function element(name, attributes = {}, text) {
    const node = document.createElementNS(svgNamespace, name);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function pointOnAxis(axis, amount) {
    const point = [0, 0, 0];
    point[axis] = amount;
    return point;
  }

  function segment(a, b) {
    const start = project(a), end = project(b);
    return "M " + start[0] + " " + start[1] + " L " + end[0] + " " + end[1] + " ";
  }

  function draw() {
    frame = null;
    const nodes = [];
    const radius = Math.hypot(...value);
    const origin = project([0, 0, 0]);
    let grid = "";
    for (let n = -4; n <= 4; n++) {
      grid += segment([n, 0, -4], [n, 0, 4]);
      grid += segment([-4, 0, n], [4, 0, n]);
    }
    nodes.push(element("path", { d: grid, class: "direction-grid" }));
    nodes.push(element("circle", { id: "direction-sphere", cx: origin[0], cy: origin[1],
      r: unit * radius, fill: "url(#direction-sphere-fill)", class: "direction-sphere" }));

    let back = "", front = "";
    for (const [a, b] of [[0, 1], [0, 2], [1, 2]]) {
      for (let n = 0; n < 80; n++) {
        const points = [n, n + 1].map(step => {
          const point = [0, 0, 0], angle = step * 2 * Math.PI / 80;
          point[a] = radius * Math.cos(angle);
          point[b] = radius * Math.sin(angle);
          return point;
        });
        const path = segment(...points);
        if (project(points[0])[2] + project(points[1])[2] < 0) back += path;
        else front += path;
      }
    }
    nodes.push(element("path", { d: back, class: "direction-ring direction-ring-back" }));

    const axisLabels = [];
    for (let axis = 0; axis < 3; axis++) {
      nodes.push(element("path", { d: segment(pointOnAxis(axis, -4.3), [0, 0, 0]),
        class: "direction-axis direction-axis-back", stroke: colors[axis] }));
      nodes.push(element("path", { d: segment([0, 0, 0], pointOnAxis(axis, 4.3)),
        class: "direction-axis", stroke: colors[axis] }));
      for (let n = -4; n <= 4; n++) {
        if (!n) continue;
        const tick = project(pointOnAxis(axis, n));
        nodes.push(element("circle", { cx: tick[0], cy: tick[1], r: 2,
          fill: colors[axis], opacity: n < 0 ? 0.3 : 0.6 }));
      }
      const label = project(pointOnAxis(axis, 4.85));
      axisLabels.push(element("text", { x: Math.max(58, Math.min(462, label[0])),
        y: Math.max(27, Math.min(433, label[1])), fill: colors[axis], class: "direction-axis-label" },
      "@" + labels[axis]));
    }

    // A box connects the projected tip to its three coordinate contributions.
    let guides = "";
    for (let corner = 0; corner < 8; corner++) {
      const point = value.slice(0, 3).map((amount, axis) => corner & (1 << axis) ? amount : 0);
      for (let axis = 0; axis < 3; axis++) {
        if (corner & (1 << axis) || !clean(value[axis])) continue;
        const next = [...point];
        next[axis] = value[axis];
        guides += segment(point, next);
      }
    }
    nodes.push(element("path", { id: "direction-projection", d: guides, class: "direction-guides" }));
    for (let axis = 0; axis < 3; axis++) {
      if (!clean(value[axis])) continue;
      const point = pointOnAxis(axis, value[axis]), projected = project(point);
      nodes.push(element("path", { d: segment([0, 0, 0], point), stroke: colors[axis],
        class: "direction-contribution" }));
      nodes.push(element("circle", { cx: projected[0], cy: projected[1], r: 3.5,
        fill: colors[axis] }));
    }
    nodes.push(element("path", { d: front, class: "direction-ring" }));
    const tip = project(value.slice(0, 3));
    const visible = Math.hypot(tip[0] - origin[0], tip[1] - origin[1]) > 5;
    nodes.push(element("line", { id: "direction-arrow", x1: origin[0], y1: origin[1],
      x2: tip[0], y2: tip[1], class: "direction-vector",
      "marker-end": visible ? "url(#direction-arrow-tip)" : "none" }));
    nodes.push(element("circle", { cx: tip[0], cy: tip[1], r: 4.5, class: "direction-tip" }));
    nodes.push(element("circle", { cx: origin[0], cy: origin[1], r: 3.5, class: "direction-origin" }));
    nodes.push(element("text", { x: origin[0] + 12, y: origin[1] + 22,
      class: "direction-origin-label" }, "○"));
    scene.replaceChildren(...nodes, ...axisLabels);
  }

  function scheduleDraw() {
    if (frame === null) frame = requestAnimationFrame(draw);
  }

  function updateReadouts(action) {
    for (let i = 0; i < 3; i++) {
      document.getElementById("direction-component-" + i).textContent = coefficients[i];
    }
    document.getElementById("direction-factor").textContent = lastFactor;
    document.getElementById("direction-size").textContent = scale === 0 ? "◠"
      : "⟨" + compact(encodeInteger(scale)) + "⟩";
    document.getElementById("direction-fourth").textContent = coefficients[3];
    const outside = coefficients[3] !== "○";
    document.getElementById("direction-outside").hidden = !outside;
    const active = labels.filter((_, i) => coefficients[i] !== "○");
    let description;
    if (outside && active.length === 1) description = "The value lies along @⟨◠○⟩, outside the three drawn axes.";
    else if (outside) description = "The arrow shows the contributions on the drawn axes. Another part lies along @⟨◠○⟩.";
    else if (active.length === 1) description = "The arrow lies along @" + active[0] + ".";
    else description = "The arrow has contributions along " + active.map(label => "@" + label).join(", ") + ".";
    if (action === "turn" || action === "quarter") description += " Turning preserved the total size.";
    document.getElementById("direction-status").textContent = description;
    document.getElementById("plane-description").textContent = description + " The total size is " +
      document.getElementById("direction-size").textContent + ". " + coefficients.map((amount, i) =>
        amount + " along @" + labels[i]).join("; ") + ".";
    document.querySelector('[data-direction="grow"]').disabled = scale === 2;
    document.querySelector('[data-direction="shrink"]').disabled = scale === -2;
    draw();
  }

  document.querySelectorAll("[data-direction]").forEach(button => {
    button.addEventListener("click", () => {
      const action = button.dataset.direction;
      if (action === "reset") {
        exact = compute("◠");
        scale = 0;
        lastFactor = "◠@○";
      } else {
        if (action === "grow" && scale === 2 || action === "shrink" && scale === -2) return;
        const source = exact.canonical || exact.reduced;
        if (action === "grow") { scale++; lastFactor = "⟨◠⟩@○"; }
        else if (action === "shrink") { scale--; lastFactor = "⟨◡⟩@○"; }
        else lastFactor = turnFactor(action === "quarter");
        exact = compute("{" + source + " " + lastFactor + "}");
      }
      coefficients = exact.components;
      // Decimal coordinates are only a drawing projection. The next action
      // starts from the exact UFN result above.
      value = exact.value.map(clean);
      updateReadouts(action);
    });
  });

  function resetView() {
    Object.assign(view, defaultView);
    scheduleDraw();
  }
  document.getElementById("direction-view-reset").addEventListener("click", resetView);
  graph.addEventListener("pointerdown", event => {
    if (!event.isPrimary || event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
    graph.setPointerCapture(event.pointerId);
    graph.classList.add("dragging");
    graph.focus({ preventScroll: true });
  });
  graph.addEventListener("pointermove", event => {
    if (!drag || drag.id !== event.pointerId) return;
    const sensitivity = 3 / Math.max(1, graph.getBoundingClientRect().width);
    view.yaw += (event.clientX - drag.x) * sensitivity;
    view.pitch = Math.max(-1.2, Math.min(1.2, view.pitch + (event.clientY - drag.y) * sensitivity));
    drag.x = event.clientX;
    drag.y = event.clientY;
    scheduleDraw();
  });
  function releasePointer(event) {
    if (!drag || event.pointerId !== drag.id) return;
    drag = null;
    graph.classList.remove("dragging");
    if (graph.hasPointerCapture(event.pointerId)) graph.releasePointerCapture(event.pointerId);
  }
  graph.addEventListener("pointerup", releasePointer);
  graph.addEventListener("pointercancel", releasePointer);
  graph.addEventListener("lostpointercapture", releasePointer);
  graph.addEventListener("keydown", event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "Home") { resetView(); return; }
    const step = event.shiftKey ? 0.3 : 0.12;
    if (event.key === "ArrowLeft") view.yaw -= step;
    if (event.key === "ArrowRight") view.yaw += step;
    if (event.key === "ArrowUp") view.pitch = Math.min(1.2, view.pitch + step);
    if (event.key === "ArrowDown") view.pitch = Math.max(-1.2, view.pitch - step);
    scheduleDraw();
  });
  updateReadouts("reset");
})();
