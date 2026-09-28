(function (root) {
  "use strict";
  // These are ordinary declarations. Loading this file assigns no meaning
  // to their symbols; a document must include the declarations it uses.
  const [a, b, entry, place, visit] = ["◠", "⟨◠⟩", "⟨◠○⟩", "⟨⟨◠⟩⟩", "⟨◠○○⟩"].map(tag => "□⌊" + tag + "⌋");
  const length = sequence => `◇⟪${sequence}⟫`;
  const innerPlace = "□⌊⟨◠◠⟩⌋";
  const row = "□⌊⟨◠○○○⟩⌋", rowPlace = "□⌊⟨⟨◠⟩○⟩⌋";
  const definitions = [
    {
      id: "length", title: "Count entries", form: "◇⟪…⟫", dependencies: [],
      description: "Count the outer entries. Each ○ counts as an entry; a nested sequence counts as one entry.",
      declaration: `≔(◇⟪${a}⟫ : [${entry} ${place} : ${a} : ◠])`,
      example: "◇⟪○ ○ ◠ ◠⟫",
    },
    {
      id: "pair", title: "Pair corresponding entries", form: "⋈⟪… : …⟫", dependencies: ["length"],
      description: "Supply two sequences of equal length. Keep a pair from each matching place, first sequence first. Unequal lengths are rejected; two empty inputs give (). The lookup into (◠) checks that the difference of the lengths is ○.",
      declaration: `≔(⋈⟪${a} : ${b}⟫ :
  (
    (${entry} ${place} : ${a} : (${entry} ${b}⌊${place}⌋))
  )⌊[(◠)⌊[${length(a)} | ${length(b)}]⌋ | ◠]⌋
)`,
      example: "⋈⟪◠ ⟨◠⟩ : ⟨◠○⟩ ⟨⟨◠⟩⟩⟫",
    },
    {
      id: "rearrange", title: "Choose entries in a new order", form: "↷⟪… : …⟫", dependencies: ["length"],
      description: "Put the source entries before the colon and their requested places after it. Places count from the right, starting at ○; visit the requests in written order. Repeated places repeat entries. An empty request gives (). The length visit checks the source even when nothing is requested.",
      declaration: `≔(↷⟪${a} : ${b}⟫ :
  (
    (${entry} ${place} : ${b} : ${a}⌊${entry}⌋)
  )⌊{○ ${length(a)}}⌋
)`,
      example: "↷⟪◠ ⟨◠⟩ ⟨◠○⟩ : ○ ◠ ⟨◠⟩⟫",
    },
    {
      id: "row-apply", title: "Combine a row with an input", form: "⋄⟪… : …⟫", dependencies: ["pair"],
      description: "Pair a row with an input list of the same length. Combine each row entry with its input entry, in that order, then join the contributions. Empty lists give ○. Entries must be numbers; directed values keep their written order.",
      declaration: `≔(⋄⟪${a} : ${b}⟫ :
  [${entry} ${place} : ⋈⟪${a} : ${b}⟫ :
    {${entry}⌊◠⌋ ${entry}⌊○⌋}
  ]
)`,
      example: "⋄⟪◡ ◠ : ⟨◠⟩ ◠⟫",
    },
    {
      id: "matrix", title: "Apply a table of rows", form: "▦⟪… : …⟫", dependencies: ["row-apply"],
      description: "Put a sequence of rows before the colon and an input list after it. Each row must be a sequence with as many numerical entries as the input. Combine each row with the input, then keep one answer per row. No rows gives (); an empty row with an empty input gives ○. The final visit checks the input even when there are no rows.",
      declaration: `≔(▦⟪${a} : ${b}⟫ :
  (
    (${entry} ${place} : ${a} :
      ⋄⟪(${visit} ${innerPlace} : ${entry} : ${visit}) : ${b}⟫
    )
  )⌊[${entry} ${place} : ${b} : {○ ${entry}}]⌋
)`,
      example: "▦⟪((◠ ○) (◡ ◠)) : (⟨◠⟩ ◠)⟫",
    },
    {
      id: "matrix-compose", title: "Combine two tables", form: "▧⟪… : …⟫", dependencies: ["matrix"],
      description: "Put the later table before the colon and the earlier table after it. Return one table that does the earlier change followed by the later change. The earlier table needs at least one row so its input width is visible. Every row must be numerical and rectangular; each later row needs one entry per earlier row. Directed combinations put the later coefficient first. Empty rows and an empty later table keep their shapes.",
      declaration: `≔(▧⟪${a} : ${b}⟫ :
  (
    (${entry} ${place} : ${a} :
      (${visit} ${innerPlace} : ${b}⌊○⌋ :
        ⋄⟪${entry} : (${row} ${rowPlace} : ${b} : ${row}⌊${innerPlace}⌋)⟫
      )
    )
  )⌊[
    [${entry} ${place} : ▦⟪${b} : ${b}⌊○⌋⟫ : {○ ${entry}}]
    [${entry} ${place} : ▦⟪${a} : (${row} ${rowPlace} : ${b} : ○)⟫ : {○ ${entry}}]
  ]⌋
)`,
      example: "▧⟪((⟨◠⟩ ○) (○ ◠)) : ((○ ◠) (◠ ○))⟫",
    },
    {
      id: "digits", title: "Read positional digits", form: "⟦… : …⟧", dependencies: [],
      description: "Put the base before the colon and the digits after it, highest place first. For ordinary digits, use a whole base above ◠ and whole entries from ○ up to, but below, the base.",
      declaration: `≔(⟦${a} : ${b}⟧ : [${entry} ${place} : ${b} : {${entry} ${a}⌈${place}⌉}])`,
      example: "⟦⟨◠⟩ : ◠ ○ ◠ ◠⟧",
    },
    {
      id: "polynomial", title: "Evaluate a polynomial", form: "△⟪… : …⟫", dependencies: [],
      description: "Join whole powers of an input, each scaled by a supplied amount: a polynomial. Put the input before the colon and those amounts (the coefficients) after it, highest power first. Each amount goes on the left of its input changes. The example uses ◠ ○ ◠: combine the input with itself, then join ◠. An empty list gives ○. Directed inputs work too.",
      declaration: `≔(△⟪${a} : ${b}⟫ : [${entry} ${place} : ${b} : {${entry} {${visit} : ◠ … ${place} : ${a}}}])`,
      example: "△⟪⟨◠⟩ : ◠ ○ ◠⟫",
    },
    {
      id: "binomial", title: "Count selections", form: "◆⟪… : …⟫", dependencies: [],
      description: "Put the available count before the colon and the count to pick after it. Use whole counts, from ○ upward, and pick no more than are available. Each selection ignores the order of its picks. The declaration combines counts through the available count, then undoes the two smaller factorials.",
      declaration: `≔(◆⟪${a} : ${b}⟫ :
  { {${visit} : ◠ … ${a} : ${visit}} |
    {${visit} : ◠ … ${b} : ${visit}}
    {${visit} : ◠ … [${a} | ${b}] : ${visit}}
  }
)`,
      example: "◆⟪⟨◠◠⟩ : ⟨◠⟩⟫",
    },
    {
      id: "pascal", title: "Keep a Pascal row", form: "▱⟪…⟫", dependencies: ["binomial"],
      description: "Supply a whole available count. Retain its selection counts, starting with picking none and ending with picking all. Together these rows form Pascal’s triangle. The marks get this meaning only from their declarations.",
      declaration: `≔(▱⟪${a}⟫ : (${visit} : ○ … ${a} : ◆⟪${a} : ${visit}⟫))`,
      example: "▱⟪⟨◠○○⟩⟫",
    },
    {
      id: "coefficient", title: "One Fourier coefficient", form: "∿⟪… : …⟫", dependencies: ["length"],
      description: "Put a frequency count before the colon and the input values (samples) after it. Join the samples after turning each one. Frequency ○ gives no turns; ◠ advances backward by a whole turn shared by the sample count at each place. Turns use @◠ and act on the right of each sample. Keep the joined result without an extra overall size change.",
      declaration: `≔(∿⟪${a} : ${b}⟫ :\n  [${entry} ${place} : ${b} :\n    {${entry} ┌┘⌈[|{⟳ ${a} [${length(b)} | ◠ ${place}] | ${length(b)}}]@◠⌉}\n  ]\n)`,
      example: "∿⟪◠ : ○ ◠ ○ ○⟫",
    },
    {
      id: "fourier", title: "A complete Fourier transform", form: "⟪…⟫", dependencies: ["length", "coefficient"],
      description: "Retain every Fourier output (coefficient), starting at frequency ○. Supply written samples or a generated sequence. An empty input gives (). Four- and eight-sample turns reduce exactly when their sample arithmetic can reduce too.",
      declaration: `≔(⟪${a}⟫ :\n  (${visit} : ◠ … ${length(a)} : ∿⟪[${visit} | ◠] : ${a}⟫)\n)`,
      example: "⟪○ ◠ ○ ○⟫",
    },
  ].map(item => Object.freeze({ ...item, dependencies: Object.freeze(item.dependencies) }));
  function get(id) {
    const item = definitions.find(item => item.id === id);
    if (!item) throw new Error("Unknown definition: " + id);
    return item;
  }
  function declarations(ids = definitions.map(item => item.id)) {
    const included = new Set(), result = [];
    const include = id => {
      if (included.has(id)) return;
      const item = get(id); item.dependencies.forEach(include);
      included.add(id); result.push(item.declaration);
    };
    ids.forEach(include);
    return result.join("\n\n");
  }
  function example(id) { return declarations([id]) + "\n\n" + get(id).example; }
  const api = Object.freeze({ definitions: Object.freeze(definitions), declarations, example });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.UFNLibrary = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
