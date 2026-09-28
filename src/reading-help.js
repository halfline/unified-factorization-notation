(function () {
  "use strict";

  // Each part is a complete piece of the printed example. These descriptions
  // explain structure, without supplying the practice question's answer.
  const examples = {
    counter: [
      ["Outside brackets", "[□ : ◠ … [◠ ◠] : [□ ◠]]", "The outer square range joins the entries made by the recipe."],
      ["Counter name", "□", "This name means the count being visited now. Its value changes on each visit."],
      ["Visits", "◠ … [◠ ◠]", "Visit one and then two. Both ends are included; the inner square expression is one complete bound."],
      ["Recipe", "[□ ◠]", "This whole square expression is the recipe. Replace its box with the visited count and keep the extra forward step."]
    ],
    share: [
      ["Outside brackets", "{◠ | [◠ ◠]}", "The curly bar asks which amount recovers the left side when the right-side change is applied."],
      ["Starting amount", "◠", "This is the complete entry before the bar: one forward step."],
      ["Change to undo", "[◠ ◠]", "Keep this inner square expression together. It gives one two-step change to undo, not two separate outer entries."]
    ],
    places: [
      ["Outside brackets", "⟨◠○⟩", "There are two complete factor entries. Read their positions from the right."],
      ["Right entry", "○", "The rightmost entry belongs to the two-step factor. This entry says to skip it."],
      ["Left entry", "◠", "The next entry belongs to the three-step factor. This entry says to use it once."]
    ],
    power: [
      ["Whole power", "⟨◠⟩⌈⟨◠⟩⌉", "The upper corners attach an instruction to the complete base before them."],
      ["Base", "⟨◠⟩", "The base gives the doubling change. It stays the same as you change the instruction in the corners."],
      ["Instruction", "⟨◠⟩", "Inside the corners, this complete number asks for two stages. The angle brackets still spell a count."]
    ],
    limit: [
      ["Outside brackets", "[□ : ○ … : ⟨◡⟩⌈□⌉]", "The outer square range joins its entries. No endpoint is supplied, so visits keep going."],
      ["Visits", "○ …", "Begin at the staying-put count, then visit each larger whole count. The missing endpoint is deliberate."],
      ["Recipe", "⟨◡⟩⌈□⌉", "The base is a half-step change. The current visited count supplies the exponent. Keep the whole power together as one recipe."]
    ],
    derivative: [
      ["Whole share", "{[{[◠ ⟨◡⟩] [◠ ⟨◡⟩]} | {◠ ◠}] | ⟨◡⟩}", "The outer curly brackets share the output change by the input change."],
      ["Output change", "[{[◠ ⟨◡⟩] [◠ ⟨◡⟩]} | {◠ ◠}]", "Keep this whole square expression together. It joins the new answer with the original answer undone."],
      ["New answer", "{[◠ ⟨◡⟩] [◠ ⟨◡⟩]}", "The changed input appears twice. Combine every part of the first with every part of the second, keeping their order."],
      ["Original answer", "{◠ ◠}", "This is the answer before changing the input. The square bar undoes it."],
      ["Input change", "⟨◡⟩", "The half step after the outer curly bar is the input change. It is the whole amount used for sharing."]
    ]
  };

  document.querySelectorAll("[data-reading-example]").forEach(help => {
    const parts = examples[help.dataset.readingExample];
    if (!parts) return;
    const reader = document.createElement("div");
    reader.className = "part-reader";
    const prompt = document.createElement("p");
    prompt.textContent = "Choose a part to see its complete spelling and its job.";
    const choices = document.createElement("div");
    choices.className = "part-reader-choices";
    choices.setAttribute("role", "group");
    choices.setAttribute("aria-label", "Parts of this example");
    const result = document.createElement("div");
    result.className = "part-reader-result";
    result.setAttribute("aria-live", "polite");
    result.setAttribute("aria-atomic", "true");
    const spelling = document.createElement("code");
    const description = document.createElement("p");
    result.append(spelling, description);
    const buttons = parts.map(([label, source, meaning], index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.setAttribute("aria-pressed", index === 0 ? "true" : "false");
      button.addEventListener("click", () => {
        buttons.forEach(other => other.setAttribute("aria-pressed", String(other === button)));
        spelling.textContent = source;
        description.textContent = meaning;
      });
      return button;
    });
    choices.append(...buttons);
    reader.append(prompt, choices, result);
    // The existing paragraph remains the fallback when scripts are unavailable.
    help.querySelector("p").hidden = true;
    help.append(reader);
    spelling.textContent = parts[0][1];
    description.textContent = parts[0][2];
  });
})();
