(function (root) {
  "use strict";
  const UFN = typeof module !== "undefined" && module.exports ? require("./ufn.js") : root.UFN;
  const intervals = [
    { name: "Keep the same sound", ratio: "1", uses: [0, 0, 0], source: "◠" },
    { name: "Repeat twice as fast · octave", ratio: "2", uses: [1, 0, 0], source: "⟨◠⟩" },
    { name: "Three for every two · fifth", ratio: "3/2", uses: [-1, 1, 0], source: "⟨◠◡⟩" },
    { name: "Five for every four · major third", ratio: "5/4", uses: [-2, 0, 1], source: "⟨◠○[◡ ◡]⟩" },
    { name: "Six for every five · minor third", ratio: "6/5", uses: [1, 1, -1], source: "⟨◡◠◠⟩" },
    { name: "Four for every three · fourth", ratio: "4/3", uses: [2, -1, 0], source: "⟨◡⟨◠⟩⟩" }
  ];
  function result(source, uses, label) {
    const answer = UFN.compute(source);
    if (!answer.canonical) throw new Error("A musical ratio must reduce exactly.");
    return { source, uses, label, canonical: answer.canonical, decimal: answer.value[0] };
  }
  function combine(first, second) {
    const a = intervals[first], b = intervals[second];
    if (!a || !b) throw new RangeError("Choose an available interval.");
    const joined = result("{" + a.source + " " + b.source + "}", a.uses.map((n, i) => n + b.uses[i]), "Both changes");
    // Projection chooses a display octave only. The resulting change is then
    // performed by the exact UFN evaluator, never converted from a decimal.
    let octaves = 0, frequency = joined.decimal;
    while (frequency >= 2) { frequency /= 2; octaves++; }
    while (frequency < 1) { frequency *= 2; octaves--; }
    const source = octaves === 0 ? joined.source : "{" + joined.source + " | ⟨◠⟩⌈" + UFN.encodeInteger(octaves) + "⌉}";
    const uses = joined.uses.slice(); uses[0] -= octaves;
    return { joined, octaves, normalized: result(source, uses, "Within one octave") };
  }
  const fifth = intervals[2].source, third = intervals[3].source;
  const route = [
    result(fifth, [-1, 1, 0], "One 3/2 change · 3/2"),
    result(fifth + "⌈⟨⟨◠⟩⟩⌉", [-4, 4, 0], "Four 3/2 changes · 81/16"),
    result("{" + fifth + "⌈⟨⟨◠⟩⟩⌉ | ⟨⟨◠⟩⟩}", [-6, 4, 0], "Bring down two octaves · 81/64"),
    result(third, [-2, 0, 1], "The other route: one 5/4 change · 5/4"),
    result("{{" + fifth + "⌈⟨⟨◠⟩⟩⌉ | ⟨⟨◠⟩⟩} | " + third + "}", [-4, 4, -1], "Compare the routes · 81/80")
  ];
  if (typeof module !== "undefined" && module.exports) { module.exports = { intervals, combine, route }; return; }
  const demo = document.getElementById("music-demo");
  if (!demo) return;
  const get = name => document.getElementById("music-" + name);
  function element(tag, text) { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; return node; }
  function table(host, rows) {
    const table = element("table"); table.className = "algorithm-table factor-aligned";
    const caption = element("caption", "Factor instructions, in the same order as the angle brackets. ○ means leave this place alone; a backward count undoes that many uses.");
    const head = element("thead"), tr = element("tr");
    ["Change", "At five", "At three", "At two"].forEach(label => { const th = element("th", label); th.scope = "col"; tr.append(th); });
    head.append(tr); table.append(caption, head);
    const body = element("tbody");
    rows.forEach((row, index) => {
      const tr = element("tr"); if (index === rows.length - 1) tr.className = "music-current-row";
      const th = element("th", row.label); th.scope = "row";
      th.append(element("code", row.canonical || row.source)); tr.append(th);
      [...row.uses].reverse().forEach(n => { const td = element("td"); td.append(element("code", UFN.encodeInteger(n))); tr.append(td); });
      body.append(tr);
    });
    table.append(body); host.replaceChildren(table);
  }
  ["single", "first", "second"].forEach((name, i) => {
    intervals.forEach((interval, index) => { const option = element("option", interval.name); option.value = index; get(name).append(option); });
    get(name).value = [1, 2, 3][i];
  });
  let current, revealed = 1;
  function update() {
    const single = intervals[Number(get("single").value)];
    get("single-source").textContent = single.source;
    const readings = ["The repetition rate stays the same.", "The changed sound repeats twice in the time the starting sound repeats once.", "The changed sound repeats three times in the time the starting sound repeats twice.", "The changed sound repeats five times in the time the starting sound repeats four times.", "The changed sound repeats six times in the time the starting sound repeats five times.", "The changed sound repeats four times in the time the starting sound repeats three times."];
    get("single-reading").textContent = readings[Number(get("single").value)] + " Both sounds last the same amount of time.";
    current = combine(Number(get("first").value), Number(get("second").value));
    table(get("composition"), [
      { ...intervals[Number(get("first").value)], label: "First change" },
      { ...intervals[Number(get("second").value)], label: "Then this change" }, current.joined
    ]);
    get("combined-source").textContent = current.joined.source;
    get("normalized-source").textContent = current.normalized.canonical;
    get("octaves").textContent = current.octaves === 0 ? "Already between the starting rate and twice that rate. No octave change is needed." : "Bring down " + current.octaves + (current.octaves === 1 ? " octave" : " octaves") + ": undo that many doublings. Only the instruction at two changes.";
    get("normalized-recipe").textContent = current.normalized.source;
  }
  function reveal() {
    table(get("routes"), route.slice(0, revealed));
    get("next").disabled = revealed === route.length;
    get("route-status").textContent = revealed === route.length ? "The remaining change is 81/80: slightly faster than unchanged. This small mismatch is called the syntonic comma." : "Step " + revealed + " of " + route.length + ". Predict the next instructions before revealing them.";
  }
  let audio = null, voices = [], generation = 0, timer = null;
  const soundStatus = get("sound-status");
  function stop(message = "Sound stopped.") {
    generation++; clearTimeout(timer);
    voices.forEach(({ oscillator, gain }) => { try { oscillator.stop(); } catch (_) {} oscillator.disconnect(); gain.disconnect(); });
    voices = []; get("stop").disabled = true; soundStatus.textContent = message;
  }
  async function play(ratios, together = false) {
    stop("Preparing sound…"); const request = generation;
    try {
      const Context = root.AudioContext || root.webkitAudioContext;
      if (!Context) throw new Error("This browser does not support sound. You can still explore every factor table.");
      if (!audio) audio = new Context();
      await audio.resume();
      if (request !== generation) return;
      const now = audio.currentTime, duration = together ? 2 : .85;
      ratios.forEach((ratio, i) => {
        const oscillator = audio.createOscillator(), gain = audio.createGain();
        const start = now + .04 + (together ? 0 : i * 1.05), end = start + duration;
        oscillator.type = "sine"; oscillator.frequency.value = 220 * ratio;
        gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(.07 / (together ? ratios.length : 1), start + .03);
        gain.gain.setValueAtTime(.07 / (together ? ratios.length : 1), end - .06); gain.gain.linearRampToValueAtTime(0, end);
        oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(start); oscillator.stop(end + .01);
        voices.push({ oscillator, gain });
      });
      get("stop").disabled = false;
      soundStatus.textContent = together ? "Playing the two nearby sounds together. Listen for a slow pulse." : "Playing the first sound, then the second.";
      timer = setTimeout(() => { if (request === generation) stop("Finished. Play again or choose another change."); }, (together ? 2.2 : ratios.length * 1.05 + .1) * 1000);
    } catch (error) { if (request === generation) stop(error.message); }
  }
  ["single", "first", "second"].forEach(name => get(name).addEventListener("change", () => { stop(); update(); }));
  get("hear-single").addEventListener("click", () => play([1, UFN.compute(intervals[Number(get("single").value)].source).value[0]]));
  get("hear-combined").addEventListener("click", () => play([1, current.joined.decimal]));
  get("hear-normalized").addEventListener("click", () => play([1, current.normalized.decimal]));
  get("hear-routes").addEventListener("click", () => play([route[2].decimal, route[3].decimal]));
  get("hear-together").addEventListener("click", () => play([route[2].decimal, route[3].decimal], true));
  get("next").addEventListener("click", () => { if (revealed < route.length) revealed++; reveal(); });
  get("reset").addEventListener("click", () => { stop(); revealed = 1; reveal(); });
  get("stop").addEventListener("click", () => stop());
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); });
  demo.closest("details").addEventListener("toggle", event => { if (!event.target.open) stop(); });
  demo.hidden = false;
  update(); reveal(); soundStatus.textContent = "Sound plays only when you press a listening button. Start with your volume low.";
})(typeof globalThis !== "undefined" ? globalThis : this);
