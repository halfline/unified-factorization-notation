# Evaluator reference

The browser and Node.js use the same exact engine. Start with the
[project introduction](../README.md) or the [language guide](../DESIGN.md).
JavaScript examples below run from the repository root.

The reference uses the guide's terms: a *coefficient* is an amount along
one labelled path; a *rational* value is a share of whole counts; and a
*canonical* spelling is the preferred spelling of a value. A *decimal
projection* is an optional approximate reading. It never determines the
exact UFN answer. The [teaching route](../DESIGN.md) introduces these
concepts with examples. Its [invariant reference](../DESIGN.md#rules-that-every-rewriting-must-keep)
collects the conditions shared by evaluation and rewriting.

- [Load the engine](#use-the-engine)
- [Use named constants](#named-constants)
- [Define written forms](#definitions-and-captured-sequences)
- [Retain sequences](#retained-sequences)
- [Read a component](#read-a-component)
- [Find an exponent](#logarithms)
- [Read a result](#read-a-result)
- [Ask for a limit](#ask-for-a-limit)
- [Choose a measuring place](#measuring-place-limits)
- [Differentiate a recipe](#differentiate-a-recipe)
- [Use the lesson helpers](#lesson-helpers)
- [Understand the arithmetic](#how-arithmetic-works)
- [Check the supported scope](#evaluation-limits)

## Use the engine

In a browser, load these scripts in order before code that uses the engine:

```html
<script src="src/string-arithmetic.js" defer></script>
<script src="src/rational-functions.js" defer></script>
<script src="src/definitions.js" defer></script>
<script src="src/ufn.js" defer></script>
```

The last script exposes `UFN` on `globalThis`. Opening the playground from
a local file works.

In Node.js, use CommonJS:

```js
const { compute } = require(".");

const answer = compute("[⟨◡⟩ ⟨◡○⟩]");
console.log(answer.canonical); // ⟨◠◡◡⟩
console.log(answer.ufn);       // ⟨◠◡◡⟩
```

Or import it from an ES module:

```js
import UFN from "./src/ufn.js";

const answer = UFN.compute("[□ : ◠ … ⟨◠○⟩ : □]");
console.log(answer.ufn); // ⟨◠◠⟩
```

## Named constants

`⟳` is the defined name for the complete amount of a turn. It is a value
on `@○`; use `⟳@◠` or another direction attachment to place it elsewhere.
`{⟳ | ⟨⟨◠⟩⟩}` describes a quarter of a turn.
`┌┘` names the complete exponential constant. The two marks form one name,
not a pair of brackets that can contain an expression. Both constants can
be used wherever a value is allowed, subject to that place's value rules.

These names are supplied constants, recognized directly by the parser.
They do not expand like an ordinary user-defined form. A document may repeat
an unchanged supplied declaration, but cannot redefine either name. Library
forms such as positional digits and Fourier coefficients instead require
ordinary declarations and can be edited.

The constants themselves remain exact recipes. Their optional `.value`
projections use the known constants, independently of the preview term count.
That projection never supplies a factor spelling.

The engine reduces `┌┘` raised to exact multiples of an eighth turn along
one turning axis. This includes whole, half, and quarter turns, in either
direction, on `@◠`, `@⟨◠⟩`, or `@⟨◠○⟩`. It also reduces a zero exponent.
It keeps the turn symbolic, finds the fraction using exact arithmetic,
and selects the corresponding forward or backward steps or roots. No decimal trigonometry
is used. For example:

```js
UFN.compute("┌┘⌈⟳@◠⌉").canonical;                       // ◠
UFN.compute("┌┘⌈{⟳ | ⟨⟨◠⟩⟩}@⟨◠⟩⌉").canonical;       // ◠@⟨◠⟩
UFN.compute("┌┘⌈{⟳ | ⟨⟨◠○⟩⟩}@◠⌉").canonical;       // [⟨[|⟨◡⟩]⟩@○ ⟨[|⟨◡⟩]⟩@◠]
```

This rule recognizes the named exponential base and turn amounts built from
joining, ordered products, sharing by exact values, and direction attachments.
Other fractions, combinations of turning axes, and changes of size remain
recipes. In particular, `┌┘⌈⟳@○⌉` grows rather than returning to `◠`.

`UFN.constants.turn.source` and `UFN.constants.e.source` contain the defining
unbounded sums. Evaluating those sources previews finite partial sums;
the symbols themselves name complete values. The current limit solver cannot
reduce those defining sums to factor spellings. The editor inserts `⟳` for
`\turn` and `┌┘` for `\exp`; the symbol tray supplies both too.

## Definitions and captured sequences

Put `≔(pattern : meaning)` declarations before the expression to evaluate.
They apply only within that input. Their meanings can use earlier definitions.
Patterns introduce written forms; double square brackets have no built-in meaning.

```js
const UFN = require(".");
const source = `
≔(
  ⟦□⌊◠⌋ : □⌊⟨◠⟩⌋⟧ :
  [□⌊⟨◠○⟩⌋ □⌊⟨◠○○⟩⌋ : □⌊⟨◠⟩⌋ :
    {□⌊⟨◠○⟩⌋ □⌊◠⌋⌈□⌊⟨◠○○⟩⌋⌉}]
)
⟦⟨◠⟩ : ◠ ○ ◠ ◠⟧`;
UFN.compute(source).canonical; // ⟨◠○○○○⟩
```

The parser captures complete expressions, then expands syntax trees with
private local bindings. It does not substitute raw text. Supplied expressions
retain their surrounding counters even when a template uses the same names.

An argument used as a sequence-range source or an entry-lookup source
captures zero or more entries.
Other arguments capture one expression. An argument cannot have both roles.
A bare captured name supplied to an earlier definition's sequence argument
forwards the whole sequence. In a two-name range, the first name receives
the entry and the second its distance from the right edge. Entries are
evaluated once in the surrounding scope, then visited from left to right.
Both square and curly folds support four-component entries.

Definitions may return a number or a retained sequence. Parentheses supply
sequence literals and finite generators, as described below. A single
sequence expression in a sequence argument supplies its entries; an extra
outside pair preserves it as a nested entry. Several written arguments keep
their individual boundaries. Double square brackets still require a definition.

The example above is a weighted-sum definition. Its conventional digit
interpretation uses a whole base greater than one and digits from zero through
one less than the base; the declaration adds no implicit value restrictions.
Empty sequences do not evaluate the range body or an otherwise unused base.

The current pattern matcher has these rules:

- Start with a new literal symbol; one leading symbol selects one pattern.
- Keep literal brackets balanced. End each sequence capture with a literal
  delimiter, and do not use `@`, `#`, `⌈`, or `⌊` immediately after a capture as
  literal punctuation: those attach to the captured expression.
- Use each capture name once in the pattern. Repeat it freely in the meaning.
- Every free box in the meaning must be a captured argument.
- Do not redefine existing forms or refer to undeclared forms. The supplied
  declarations of `┌┘` and `⟳` may be repeated with their existing recipes.

Declarations alone return `.declarationOnly === true` and `.definitionCount`.
They have no `.canonical` answer; reading `.value` raises `UFNError`.
The playground reports “Defined” and asks for an expression below them.

A defined endless recipe denotes its complete limit, independent of preview
terms. The evaluator requests proof; an unresolved limit stays a recipe and
has no decimal projection. To preview finite visits, enter its expanded recipe
directly. The supplied constants keep their existing known decimal projections.

`formatSource` preserves inputs containing declarations, including their
captured entry spellings and leading empty places. `.ast` contains the expanded
expression with private counter bindings; retain the source when its writing
or sequence width matters. Declarations do not persist across API calls.
The editor supplies `\define`, `\form`, and matching symbol-tray buttons.

### Inspect an expansion

`UFN.expand(source, width = 76)` returns `written`, `expanded`,
`definitionCount`, and `sequenceHelper`. The playground's **Show expansion**
uses this API. It substitutes syntax without doing arithmetic, even when
the expression would have an undefined value.

The expanded text can be parsed and copied. Private counters get fresh,
dense box labels. Complete unbounded ranges retain explicit measuring
attachments, so copying does not silently request a finite preview.
Supplied constants keep their names.

Normally the expanded recipe needs no declarations. If a captured entry's
kind depends on a surrounding visit, one identity declaration remains.
It preserves the rule that one captured sequence supplies its entries while
one captured number supplies a single entry. `sequenceHelper` reports this
case. No visit is evaluated to decide its kind while displaying the expansion.

Declaration-only input returns empty `written` and `expanded` strings.
Expansions obey the source and depth limits; an oversized expansion raises
`UFNError` while the original source remains usable.

### Reuse a declaration

`src/library.js` exports `UFNLibrary` in the browser, or a CommonJS module.
Loading it does not predeclare any symbols in the evaluator.

```js
const library = require("./src/library.js");
const source = library.example("fourier");
UFN.compute(source).ufn; // (◠ ◡@◠ ◡ ◠@◠)

// Include shared dependencies once, before the forms that use them.
const declarations = library.declarations(["digits", "fourier"]);
UFN.compute(declarations + "◇⟪⟪○ ◠ ○ ○⟫⟫").canonical; // ⟨⟨◠⟩⟩
```

| ID | Written form | Meaning |
| --- | --- | --- |
| `length` | `◇⟪…⟫` | Count outer entries |
| `pair` | `⋈⟪… : …⟫` | Pair corresponding entries of equal-length sequences |
| `rearrange` | `↷⟪… : …⟫` | Source entries, then requested places from the right |
| `row-apply` | `⋄⟪… : …⟫` | Combine equal-length row/input pairs, row entry first, then join |
| `matrix` | `▦⟪… : …⟫` | Apply numerical rows to one input; retain the row answers |
| `matrix-compose` | `▧⟪… : …⟫` | Later table, then earlier table; retain the table for the successive changes |
| `digits` | `⟦… : …⟧` | Base, then digits from highest place to lowest |
| `polynomial` | `△⟪… : …⟫` | Input, then coefficients from highest power to constant |
| `binomial` | `◆⟪… : …⟫` | Available count, then picked count; selections without ordering the picks |
| `pascal` | `▱⟪…⟫` | Available count; retain selections from picking none to picking all |
| `coefficient` | `∿⟪… : …⟫` | Frequency count, then samples; one forward Fourier coefficient |
| `fourier` | `⟪…⟫` | Samples; retain all forward coefficients |

The polynomial uses finite curly repetition, allowing zero, backward, and
directed inputs. Coefficients multiply on the left. Fourier turns use `@◠`
and multiply on the right of samples. The joined results are kept without
an extra overall size change (often called normalization). The digit
declaration is a weighted sum; it adds no hidden digit validation.
`definitions` exposes the frozen records; `declarations()` includes all of them.

Selection forms use whole counts from `○` upward, with the picked count no
larger than the available count. They expand to finite factorial ranges and
curly division; the row adds a retained range. These are ordinary declarations,
with no special binomial or Pascal evaluator operation. See the
[selection lesson](../DESIGN.md#count-selections-and-keep-a-triangle) for the
counting argument and cancellation table.

## Matrix walkthrough

`src/matrix.js` exposes `apply(tableSource, inputSource)` and frozen `presets`.
The table must be a finite sequence of numerical row sequences, each matching
its finite numerical input. The helper supplies matrix declarations and returns
`source`, `table`, `input`, `answer`, `rows`, and a written-order `trace`.
Each trace entry includes the matching place, ordered curly recipe, exact result,
and the joined prefix for its row. It never requests decimal projection.

The browser walkthrough shows up to six rows and eight input entries. Larger
finite tables can use the declarations in the main playground. Finite previews
of endless recipes are rejected here; unfinished exact arithmetic may remain
recipes. Shape errors use `MatrixInputError`, a subclass of `UFNError`.

The declarations impose no extra walkthrough size limit. Pairing checks each
row's length. A direct sequence visit requires each row to be a sequence;
an input validation fold also runs with no rows. Empty rows with empty input
give `○`, while an empty table gives `()`. Detected undefined entries reject
calculation, even when paired with zero or when the table has no rows.
Directed changes retain row-first order. These are applications of ordinary
ranges and lookup, with no matrix-specific evaluator operation.

`matrix-compose` requires a nonempty earlier table: its rows record the input
width. Every later row must have one numerical entry per earlier row. Empty
rows are allowed; an empty later table returns an empty sequence after input
validation. Each combined coefficient is a joined row/column pairing, with
the later coefficient first. This preserves quaternion order. The declaration
uses matrix validation folds to check all required rows, even for an empty
output. It does not cache repeated source expressions or attach tensor variance.

`src/transformations.js` exposes frozen `scenarios` and `explore(index, input)`.
The latter returns the input, first answer, later answer, combined table,
single-table answer, and copyable declaration sources. Recoverable examples
also return the recovered input and both identity-table checks. The lossy
example changes the dropped entry by joining `◠`, then evaluates the same
recipe on that alternative input. All computations use UFN operations; no
decimal projection supplies a result. Known undoing tables are examples,
not a general matrix inversion algorithm.

See [the worked rows](../DESIGN.md#apply-a-table-of-rows) for the teaching route.

## Input-finding puzzles

`src/input-puzzles.js` exports frozen `puzzles` and `check(index, inputSource)`.
Each puzzle fixes a numerical table and a requested output. `check` uses the
matrix walkthrough's finite input validation, then computes the table output
and the ordered sequence of exact differences from the requested entries.
It returns `input`, `output`, `target`, `gaps`, `source`, and `gapSource`.

`matches` is `true` when every gap reduces to canonical `○`, `false` when
at least one gap reduces to a canonical nonzero value, and `null` otherwise.
An unfinished exact calculation is not treated as a mismatch or as a match;
no decimal projection or string comparison of inputs determines the answer.
A detected undefined input raises `UFNError` even if its coefficient is zero.
The supplied one/many/none explanations concern those fixed examples. The
module checks a proposed input; it does not solve general systems or infer
uniqueness from a successful guess.

See [the input-finding lesson](../DESIGN.md#find-an-input-from-its-output).

## Simplifying row clues

`src/row-clues.js` exports frozen `operations` and `examples`, plus
`change(tableSource, targetSource, name)` and `walkthrough(index, targetSource)`.
The walkthrough uses two numerical clues with two input places each.
Operations are named reversible examples: undo one row from another, undo
twice a row, halve a row, or swap the rows. Each operation record supplies its
ordinary UFN table and undoing table. There is no zero-resizing operation.

`change` composes the row-change table with the instruction table, and applies
that same table to the requested answers. It returns both new values and
expressions, a copyable `source`, and finite calculation rows when the prior
values are established. Required source entries are evaluated and invalid
shapes or finite previews are rejected. Directed numerical answers are allowed;
the supplied row-change coefficients are on the original path.

`walkthrough` follows the selected example's short plan and returns `stages`,
`outcome`, `solutions`, and checks against the original table. Outcomes are
`one`, `many`, `none`, or `pending`, based on that plan's established final
identity or joined-input table and its requested answers. An unresolved value
does not establish a contradiction, a free input, or a unique solution.
These are worked elimination plans, not a general elimination or rank algorithm.
All table composition, resizing, differences, and solution checks use exact
UFN operations. Decimal projection supplies no result.

See [the row-changing lesson](../DESIGN.md#simplify-the-clues).

## Solution families

`src/solution-families.js` exports frozen `declarations` and half-step `choices`,
plus `describe(freeSources, totalSource)`. Supply one or two numerical expressions
and an optional total (default `⟨◠○⟩`). The helper validates each expression,
then uses an ordinary declaration to retain the free amounts followed by the
total with those amounts undone. It returns `free`, `total`, `inputs`, `joined`,
`gap`, `matches`, and copyable `source`, `joinedSource`, `gapSource`, `checkSource`.
The latter checks the input against an all-joining matrix row.

The pair form `↔⟪total : free⟫` and triple form
`↕⟪total : first : second⟫` get meaning only from the supplied declarations.
No primitive sequence operation or solution-search operation is added.
`matches` uses the exact total gap: `true` for canonical `○`, `false` for
canonical nonzero, `null` for an unfinished reduction. Finite previews and
undefined chosen expressions reject before cancellation can hide them.

Slider indices choose precomputed UFN half steps; native arithmetic does not
compute the compensating amount. The optional line picture projects established
original-path inputs for drawing. It is hidden for directed or unfinished inputs,
and never supplies an equality result. The one- and two-dimensional descriptions
count original-path scalar choices, not quaternion components or named `@` paths.

See [the solution-family lesson](../DESIGN.md#describe-every-input-that-fits).

## Retained sequences

Parentheses keep entries in order. They accept literal entries, finite count
ranges, and ranges over another sequence:

```js
const UFN = require(".");
UFN.compute("(○ ○ ◠)").ufn;                       // (○ ○ ◠)
UFN.compute("(□ : ◠ … ⟨◠○⟩ : {□ □})").ufn;       // (◠ ⟨⟨◠⟩⟩ ⟨⟨◠⟩○⟩)
UFN.compute("[□ □⌊⟨◠⟩⌋ : (◠ ⟨◠⟩) : □]").ufn; // ⟨◠○⟩
```

`()` has no entries; `(◠)` has one entry. Neither is a numerical value.
Nesting stays explicit: `((◠ ○) (◡))` has two entries, both sequences.
There is no automatic flattening, joining, or componentwise arithmetic.
A numeric operator receiving a sequence raises `UFNError`.

Count ranges in parentheses require a finite endpoint. All three kinds of
sequence range read their source once before binding their two visit names.
The first name receives an entry, which may be a number or another sequence;
the second receives its place counted from the right. Visiting order remains
left to right. An empty parenthesized range returns `()` without evaluating
its body. Parentheses have no partition bar or measuring attachment.

### Select an entry

Lower corners after a sequence read one complete entry. Places count from
the right at `○`, as they do in a two-name range:

```js
UFN.compute("(⟨◠⟩ ◡ ◠)⌊◠⌋").canonical;          // ◡
UFN.compute("(□ : ◠ … ⟨◠○⟩ : {□ □})⌊◠⌋").ufn; // ⟨⟨◠⟩⟩
UFN.compute("((◠ ○) (◡ ⟨◠⟩))⌊○⌋").ufn;         // (◡ ⟨◠⟩)
UFN.compute("((◠ ○) (◡ ⟨◠⟩))⌊○⌋⌊◠⌋").ufn;    // ◡
```

The source is evaluated once in the surrounding scope, before the place.
Lookup preserves its written order and nested shape. Every source entry is
evaluated, so a detected undefined operation in an unselected entry still
raises `UFNError`. An unfinished entry can remain a recipe; that does not
establish its definedness. Selecting such an entry retains its counter
bindings and limit semantics. A decimal projection never supplies a reduction.

The place must reduce to a whole nonnegative original-path value below the
outer sequence's length. Invalid places, including every place in `()`, raise
`UFNError`. There is no wraparound, padding, or implicit flattening.

The first lower corners after a counter box remain its name tag:
`□⌊◠⌋⌊○⌋` selects from the sequence held by `□⌊◠⌋`. Choose a tagged name for a
counter whose entries you will select. Bare and tagged names are distinct. The existing first attachments
on angle numbers and unbounded ranges retain their positioning and measuring
roles. Upper attachments and entry lookups apply left to right before `@`
or `#`. The prime-position `*` still consumes only one primary; use
`*[(⟨◠○○⟩)⌊○⌋]` to give it a selected number.

Finite differentiation can select a changing entry at a fixed place. A
place that changes with the differentiation input remains unsupported.

### Pair and rearrange using declarations

The library supplies `pair` (`⋈⟪… : …⟫`) and `rearrange`
(`↷⟪… : …⟫`). Both expand into ordinary visits and lookup:

```js
const library = require("./src/library.js");
UFN.compute(library.declarations(["pair"]) +
  "⋈⟪◠ ⟨◠⟩ : ⟨◠○⟩ ⟨⟨◠⟩⟩⟫").ufn; // ((◠ ⟨◠○⟩) (⟨◠⟩ ⟨⟨◠⟩⟩))
UFN.compute(library.declarations(["rearrange"]) +
  "↷⟪◠ ⟨◠⟩ ⟨◠○⟩ : ○ ◠ ⟨◠⟩⟫").ufn; // (⟨◠○⟩ ⟨◠⟩ ◠)
```

Pairing requires equal lengths and keeps the first sequence's entry first
in each pair. It checks equality by selecting from `(◠)` with the difference
of the two lengths: only place `○` is valid. That gives `◠`; undoing `◠`
gives the place used to select the retained pairs from a one-entry wrapper.
An unfinished check cannot supply that place. This also checks empty inputs
and rejects either direction of a mismatch.

Rearrangement visits the requested places in their written order. Repetitions
repeat entries, and an empty request gives `()`. It validates the source even
when no entries are requested. Neither definition flattens nested entries.
Each lookup evaluates its own source once; substituted source expressions
may be evaluated again at another use, within the ordinary work limits.

### Read a sequence result

Sequence results expose a different shape from numerical results:

| Property | What it contains |
| --- | --- |
| `kind` | `"sequence"`; numerical answers have `"number"` |
| `items` | Ordered entry results, recursively; `null` if the sequence's bounds or source could not be established |
| `canonical` | Always `null` for a sequence; numerical entries may have canonical spellings |
| `ufn`, `display` | A self-contained parenthesized spelling, or `null` if materializing it exceeds the display limits |
| `source` | The input recipe, available when expanded output cannot be shown |
| `established` | Whether every entry reduced exactly, including nested sequences |
| `value` | Optional nested arrays; each numerical entry is a four-component decimal vector |

Each item exposes `kind`, `canonical`, `ufn`, `display`, `established`,
`reason`, and `value`; a nested sequence also has an `items` array.
For example, `(◠ ⟨◠⟩)` projects to `[[1,0,0,0], [2,0,0,0]]`.
`formatValue` renders nested projections with parentheses. An empty sequence
projects to `[]` and displays as `()`.

An unfinished entry keeps its recipe and a snapshot of its enclosing counter
values. Other entries can still reduce. Copied output supplies those values
explicitly, so different visits cannot accidentally share a final counter.
Requesting decimal projections never changes the exact entries. Complete
unresolved limits remain unprojectable, and finite previews keep their
`partial` status. Retaining a recipe does not establish that all its operations
have defined values.

The playground shows forty entries at a time, with a button for more. Nested
sequences open independently. Each numerical entry has its own optional
decimal reading and copy button. Copying the whole result preserves the
parenthesized sequence. If that spelling exceeds the text limit, the original
generating recipe remains available instead.

The [Fourier example](../DESIGN.md#retain-a-complete-fourier-transform) defines
the entire transform as a parenthesized range. Four- and eight-sample kernels
reduce exactly using the turn rules, so supported sample arithmetic gives
exact coefficients. Unsupported turns retain recipes with optional projections.
Finite sequence folds also compose with differentiation; the differentiation
API itself still requires a numerical result, point, and direction.

## Read a component

`value#label` returns the forward or backward amount along one of the four labelled axes.
The result lies on `@○`. An absent component gives `○`.
`#` reads an amount; `@` places an amount. Reading one component loses the
other components, so the two operations are not mutual inverses on a whole value.

```js
UFN.compute("[⟨◠⟩@○ ◡@◠]#◠").canonical; // ◡
UFN.compute("⟨◠⟩@◠#◠@⟨◠⟩").canonical; // ⟨◠⟩@⟨◠⟩
UFN.compute("┌┘⌈{⟳ | ⟨⟨◠⟩⟩}@◠⌉#○").canonical; // ○: cosine of a quarter turn
UFN.compute("┌┘⌈{⟳ | ⟨⟨◠⟩⟩}@◠⌉#◠").canonical; // ◠: sine of a quarter turn
```

The label can be an expression, but it must give exactly `○`, `◠`,
`⟨◠⟩`, or `⟨◠○⟩` on the original path. Arbitrary unit directions and
sequence indexing are not meanings of `#`. Use lower corners to select a
sequence entry, then `#` to read its component; or visit every entry.

`@` and `#` apply left to right. Each consumes a `power` as its label,
so upper brackets bind first. In `⟨◠⟩@◠#◠⌈⟨◠⟩⌉`, the upper brackets
belong to the label and the answer is `⟨◠⟩`. Write
`[⟨◠⟩@◠#◠]⌈⟨◠⟩⌉` to square the reading instead.
The `*` prefix binds more tightly: `*⟨◠○○⟩#○` reads the lookup's result.

All input components must be defined. Selection does not drop invalid
arithmetic in another component, or establish an unresolved limit. Reading
each finite term before summing can have different convergence from reading
the completed sum. Fixed component readings compose with exact derivative
rules; a changing selector remains unsupported for differentiation.

Trig remains derived from turning, reading, and sharing. With a supplied
turn amount in `□`, cosine is `┌┘⌈□@◠⌉#○`, sine is `┌┘⌈□@◠⌉#◠`, and
tangent shares the latter by the former. A zero cosine makes that share
undefined. Supported eighth-turn steps reduce exactly. Other angles keep
recipes and optional decimal projections.

The planar angle recipe is
`┌┘⌈|[□⌊◠⌋@○ □⌊⟨◠⟩⌋@◠]⌉#◠`, with the two amounts supplied by
the named boxes. It agrees with the conventional `atan2` away from the
negative original axis. That axis requires a logarithm branch choice with
no syntax yet; the zero vector is undefined. The output is a turn amount,
with `⟳` denoting a complete turn. General logarithms remain exact recipes
with decimal projections.

Type `#` directly, use `\component`, or use the component button in the tray.

## Logarithms

`BASE⌈|X⌉` asks for the exponent that makes BASE reach X.
`BASE⌈E|X⌉` first raises BASE to E, then takes the logarithm using that
changed base. It is shorthand for `BASE⌈E⌉⌈|X⌉`.

```js
const UFN = require(".");
UFN.compute("⟨◠⟩⌈|⟨⟨◠○⟩⟩⌉").canonical; // ⟨◠○⟩: log base 2 of 8
UFN.compute("⟨◠⟩⌈⟨◠○⟩|⟨⟨◠⟩⟩⌉").canonical; // ⟨◡◠⟩: log base 8 of 4
```

Upper attachments can be chained; they apply from left to right.
Each side of the bar holds one expression. The target is required.
The base must be positive on `@○` and differ from `◠`. For the shorthand,
the changed base must satisfy these rules too.

| Target | Meaning |
| --- | --- |
| Positive on `@○` | Path logarithm |
| Any nonzero part away from `@○` | Principal quaternion logarithm |
| Negative on `@○` | Requires an explicit plane or branch choice; rejected until it has syntax |
| `○` | Undefined: no finite exponent reaches it |

Invalid values raise `UFNError`. The principal choice uses the smallest
amount away from `@○`. Its value is the principal natural quaternion
logarithm divided by the natural logarithm of the base. See the
[precise rule](../DESIGN.md#the-principal-logarithm-rule).

The exact engine compares instructions at matching factor positions.
A rational answer must scale every base instruction to its target instruction.
This works for fractions, roots, composite bases, and large powers without
expanding their magnitudes or using decimal logarithms. A target of `◠`
gives `○`; matching base and target give `◠` when their equality is established.

Other logarithms retain their exact recipes. Reading `.value` requests an
optional decimal approximation, subject to the usual limit and range rules.
For example, the logarithm of `⟨◠○⟩` to base `⟨◠⟩` has no rational
answer, so `.canonical` is `null` while `.value[0]` is about 1.585.

Directed logarithms likewise retain their exact recipes and support the
optional decimal projection. The projection uses all four components, with
no tolerance that treats a small nonzero component as zero when choosing a
branch. Values outside the decimal view's floating-point range can still
overflow or underflow.

The engine also reduces `B⌈B⌈|X⌉⌉` to X when it can establish the two
bases are equal and validate the target. This includes directed targets,
without computing an approximate logarithm. Both bases must be valid;
zero and backward targets on `@○` are still rejected. The reverse order,
`B⌈|B⌈Q⌉⌉`, is not rewritten: a directed power can lose whole turns.

## Read a result

`compute(source, terms = 24)` reduces a UFN expression directly.
Use `display` for a person to read and `canonical` for a preferred reference
spelling. The fields below describe numerical answers (`kind: "number"`).
See [retained sequences](#retained-sequences) for sequence answers.

### Exact writing

| Property | What it contains |
| --- | --- |
| `canonical` | The preferred factor spelling, or `null` |
| `reduced` | An exact joined-root expression when the answer needs one, or `null` |
| `ufn` | The canonical spelling if available; otherwise the normalized input |
| `display` | A shorter spelling of the canonical or reduced result; otherwise the normalized input |
| `components` | Four exact UFN coefficient spellings, or `null` if evaluation or their formatting could not finish |
| `reason` | Why canonical reduction could not finish, or `null` |

A result may be exact even when `canonical` is `null`. A sum of different
roots need not fit into one angle-bracket coefficient:

```js
const UFN = require(".");
const answer = UFN.compute("{|[◠ ⟨⟨◡⟩⟩]}");
console.log(answer.canonical); // null
console.log(answer.reduced);   // [⟨⟨◡⟩⟩ | ◠]
console.log(answer.display);   // [⟨⟨◡⟩⟩ | ◠]
```

`display` is computed when read. It can use position attachments and curly
lists of separated factor groups, including inside entries and positions.
It preserves whole-value reversals, direction labels, and exact values.
Counter tags continue to use the dense canonical spelling, which writes
every factor place through the first one, including empty places.

`components` follows the order `@○`, `@◠`, `@⟨◠⟩`, `@⟨◠○⟩`. It is
computed when read and returns a read-only array. The direction diagram uses
these spellings for its labels and keeps each calculation in exact UFN.

### Optional decimal reading

`value` returns an array of decimal amounts along `@○`, `@◠`, `@⟨◠⟩`,
and `@⟨◠○⟩`. Reading it requests floating-point calculation. Huge exact
values can exceed that preview's range.

Decimal approximations never feed back into reduction. An unresolved limit
or derivative has no decimal value to project.

### Previews and proof records

- `partial` is true when an endless range was replaced by finitely many
  visits. Its exact result describes those visits, not the endless limit.
- `partialKind` is `"sum"`, `"product"`, or `"mixed"` for a partial
  evaluation, and `null` otherwise. Mixed previews contain both endless
  square and curly ranges.
- `measurements` lists explicit measuring positions encountered during exact
  evaluation. `0` means ordinary distance.
- `limitProofs` records proved limits as `{ place, kind, rule }` objects.
  A proof for one nested range need not resolve the whole expression.
- `iterations` counts evaluated visits. It is `null` if exact evaluation
  stopped before finishing and no decimal projection has been requested.
- `ast` contains the parsed expression.

If reduction stops before visiting every range, partial classification may
conservatively use the expression's syntax. A retained recipe does not
establish that every requested operation has a defined value.

### Input and formatting helpers

- `encodeInteger(number)` spells a safe JavaScript integer in UFN, provided
  its unique factors fit within the position limit.
- `formatWholeUFN(value)` spells whole components with absolute amounts up to
  10,000; it returns `null` for other values. This is a legacy numeric-import
  helper; use `canonical` or `ufn` for evaluation results.
- `formatValue(value)` gives a familiar numeral reading.
- `formatSource(source, width = 76)` adds line breaks and indentation to long
  expressions. It preserves scope and keeps angle-bracket numbers together.
  This formats a recipe; it does not evaluate it.
- `Parser`, `normalizeSource`, and `UFNError` are also exported. Invalid
  input, detected undefined operations, and structural limits raise `UFNError`.
  Exact-reduction limits preserve the recipe instead.

The engine accepts Unicode notation, ASCII angle brackets, `...` for `…`,
and `0` for `○`. Counter names are user-selected words or symbols, delimited
by whitespace, numeric digits, and the language's existing marks. A declared
form reserves its leading symbol. The guide uses `□`; the evaluator also
accepts names such as `step`, `✦`, or a bullet, and keeps them distinct.
The editor's `\box` and `\counter` shortcuts insert the box.

An optional first lower attachment forms part of the name. Its tag is fixed
balanced text, with whitespace ignored; it is never evaluated or reduced.
For example, `□⌊[◠ ◠]⌋` and `□⌊⟨◠⟩⌋` are different names. Bare and tagged identifiers are distinct names; no tag is supplied automatically.
Another lower attachment selects an entry from the sequence that name holds.
Definitions use the same name rules for captured arguments and local counters;
expansion protects their scope with private bindings.

```js
UFN.compute("[step : ◠ … ⟨◠⟩ : step]").canonical; // ⟨◠○⟩
UFN.compute("[✦ : ◠ … ⟨◠⟩ : ✦]").canonical;       // ⟨◠○⟩
UFN.compute("[□⌊leaf⌋ : ◠ … ⟨◠⟩ : □⌊leaf⌋]").canonical; // ⟨◠○⟩
```

The prefix `*` asks for a unique factor's position:
`*⟨◠○⟩` gives `⟨◠⟩`. The engine also accepts `index(expression)` as
an input alias for `*[expression]`.

## Ask for a limit

Both square and curly counters can omit their endpoint. Without a measuring
attachment, `compute` uses the selected visit count, from 1 to 500.
Fractional settings round down. Curly counters append each new entry on
the right, preserving direction order.

```js
const product = compute("{□ : ◠ … : ⟨◡⟩}", 8);
console.log(product.partialKind); // product
// Its exact finite value is 1/256. The endless product has limit zero.
```

A finite preview does not establish convergence or show that later entries
exist. Nested limits are resolved from the inside out. Increasing every
preview count together need not approach that same destination.

UFN allows a product to have any finite limit, including zero, provided
every entry is defined.

Use `limit(source)` to request the full value of every endless range in the
expression. Each range uses its own measuring attachment, or ordinary
distance when none is written.

```js
const UFN = require(".");
const series = "[□ : ◠ … : {|□ [□ ◠]}]";
console.log(UFN.compute(series, 8).partial); // true
console.log(UFN.limit(series).canonical);    // ◠
console.log(UFN.limit(series).limitProofs[0].rule); // rational telescoping sum
```

The workbench's **Find the limit** choice calls this API. A limit result has
`limitRequested: true` and is never labelled as a finite preview. If proof
cannot finish, the result retains the recipe and a reason. Reading its
`.value` raises `UFNError`; it does not substitute a partial sum.

These are the current exact proof rules:

| Rule | Scope |
| --- | --- |
| Geometric sum | Recognized geometric forms with rational or supported square-root ratios; coefficients may include exact roots and directed components |
| Finite combinations of geometric sums | Matching ratios combine before convergence is checked |
| Constant-factor product | Ordinary quaternion factors, or rational factors at a selected factor measurement |
| Rational telescoping sum | An exact rational expression supplies the accumulated sum; its ordinary limit follows from degrees and leading coefficients |
| Rational telescoping product | An exact rational expression supplies the accumulated product; entries on `@○` only |
| Finite counters inside a limit | Polynomial sums and supported telescoping products, with bounds proved valid for every outer visit |

The rational rules check identities over exact coefficients. They also check
the original divisors, even when an algebraic cancellation removes them.
An unresolved pole or bound check preserves the recipe. A proved divergent
case raises `UFNError`. The rules never infer convergence from samples.

## Measuring-place limits

Lower corners on a complete endless range select its convergence measurement:
`⌊○⌋` is ordinary distance; `⌊◠⌋` is the first unique factor's distance,
`⌊⟨◠⟩⌋` the second, and so on. The selected position is fixed outside
the range's counter binding. Nested ranges keep their own measurements.

```js
const { compute, preview, measure } = require(".");
const source = "[□ : ○ … : ⟨◠⟩⌈□⌉]⌊◠⌋";
console.log(compute(source).canonical);  // ◡ — proved limit
console.log(preview(source, 3).canonical); // ⟨◠○○○⟩ — finite sum, seven
console.log(measure("[⟨◠○○○⟩ | ◡]", "◠").value[0]); // 0.125
```

- `compute` attempts an exact proof for explicitly attached ranges, including
  `⌊○⌋`. A positive measuring place currently supports rational geometric
  sums and constant-factor products. Proofs read exact factor instructions.
- Other measured limits retain their exact recipes. Their `.value` cannot
  silently substitute partial sums or decimal values. Proved rational limits
  can participate in ordinary arithmetic and its optional decimal projection.
- `preview(source, visits = 24)` accepts one complete unbounded range and
  returns its selected finite prefix, with `previewOnly: true` and a partial
  status. Nested limits must still be resolved; previewing the outer range
  does not change inner measurements. Positive measuring places require
  rational entries. An unresolved prefix also remains a recipe.
- `measure(gapSource, placeSource = "○")` returns the exact size of a
  rational gap as a regular UFN result. Both arguments use UFN text. Zero gaps
  have size zero; otherwise a selected factor's exponent is negated to give
  the measured size. Ordinary measurement takes the absolute value.
- Without an attachment the workbench's default remains the finite-visits
  view. Either `limit(source)` or an explicit `⌊○⌋` requests proof under
  ordinary measurement. Both spellings describe the same mathematical limit.

The workbench offers **Show finite visits of an attached range** separately
from its proved limit or retained recipe. The teaching demo plots ordinary
and selected gap sizes; graph coordinates never feed into proof or reduction.
Its helper `UFNMeasuringPlace.describe(basePosition, place, kind, visits)`
accepts base positions 1–3, measurements 0–3, `"sum"` or `"product"`, and
one to six visits. It is also exported by `src/measuring-place.js` in Node.

General arithmetic on non-rational p-adic values is not yet implemented.
Their attachments remain on unresolved recipes, including inside larger
expressions. The mathematical definitions and domain boundaries are in
[DESIGN.md](../DESIGN.md#choose-a-measuring-place), with a
[reference for p-adic distance and completion](https://math.mit.edu/~poonen/782/782notes.pdf).

## Differentiate a recipe

`differentiate(source, { at = "○", along = "◠", counter = "□" })` finds
the exact directional derivative at one input. The named input follows the
route `at + h·along`, where progress `h` stays on `@○`.

```js
const UFN = require(".");
const square = UFN.differentiate("{□ □}", { at: "◠" });
console.log(square.canonical); // ⟨◠⟩

const directed = UFN.differentiate("{□ □}", {
  at: "◠@◠", along: "◠@⟨◠⟩"
});
console.log(directed.canonical); // ○ — the two ordered terms cancel
```

`at` and `along` are complete UFN expressions. The direction may have
several components and need not have unit length. `counter` can select a
different named input, such as `□⌊⟨◠⟩⌋`. Inner counters keep their usual scope.

Supported operations are joining, subtraction, ordered multiplication,
reciprocals, fixed powers, and finite counters with fixed bounds. Powers
retain the language's requirement that the base stay positive on `@○`.
The rules carry exact values and their first changes through the recipe.
They do not estimate the derivative from nearby samples.

The result provides:

- `established`: whether an exact derivative was found;
- `canonical`: its preferred factor spelling, or `null`;
- `ufn` and `display`: exact derivative text, allowing joined roots, or `null`
  if unavailable;
- `source`, `at`, `along`, and `counter`: the input recipe and context;
- `reason`: why a rule or canonical reduction could not finish;
- `rules`: the differentiation rules used;
- `value`: an optional decimal projection of an established derivative.

An unsupported derivative has no value to project. Changing logarithms or exponents,
changing factor instructions, variable count bounds, and derivatives of
input-dependent endless ranges need further rules. Undefined operations,
such as sharing by zero at the starting input, raise `UFNError`.

The form in the derivative lesson supplies the input binding. This API does
not add a derivative token or function-call syntax to the core language.

## Lesson helpers

### Derivative lesson values

`src/derivatives.js` constructs the square recipe's finite difference quotient
and its proved directional derivative using ordinary UFN expressions:

```js
const derivatives = require("./src/derivatives.js");
const rate = derivatives.describe(3, { point: 1, pointAxis: "◠", direction: "⟨◠⟩" });
console.log(rate.rate.canonical);       // [|⟨[|⟨◠○⟩]⟩] (finite quotient)
console.log(rate.derivative.canonical); // ○ (the two ordered terms cancel)
```

The first argument chooses zero through six halvings. The options are:

| Option | Choices | Default |
| --- | --- | --- |
| `point` | Whole counts from −2 through 2 | 1 |
| `pointAxis` | `○`, `◠`, `⟨◠⟩`, `⟨◠○⟩` | `○` |
| `direction` | The same four labels | `○` |
| `side` | `"forward"` or `"backward"` | `"forward"` |

Results include the finite `expression`, `derivativeExpression`, and engine
results for `rate`, `derivative`, and their difference `error`.

The derivative is computed through `UFN.differentiate`; the separate
`derivativeExpression` shows the ordered product identity used in the lesson.

### Subdivision and integral recipes

`src/subdivision.js` exports helpers for the three lesson recipes:
`"constant"`, `"position"`, and `"square"`. They build finite sampled totals,
successive corrections, and complete ordinary limit expressions.

- `approximation(pieces, options)` builds a finite subdivision.
- `corrections(options, through)` joins successive changes; omitting `through`
  leaves the counter endless.
- `definition(options)` adds the ordinary measuring attachment, requesting
  proof of that limit.
- `describe(pieces, options)` supplies the finite total, established lesson
  destination, gap, table entries, and expressions.

Options choose `sample` (`"start"`, `"middle"`, or `"end"`), `recipe`,
`direction`, `path`, and `order` (`"after"` or `"before"`). The proof rules
can reduce these correction limits, including both directed orders.
The lesson's separate argument explains why all sufficiently fine divisions
and sample choices have the same destination.

### General factorial recipes

The general factorial is built from the existing grammar. To construct its
expressions in JavaScript, load `src/factorial.js` after the engine in a
browser (`UFNFactorial`), or import the helper in Node.js:

```js
const factorial = require("./src/factorial.js");
const answer = factorial.describe("⟨◡⟩", 32);
console.log(answer.definition);   // Complete UFN limit recipe for this input.
console.log(answer.finite.ufn);   // Exact value or retained recipe at stage 32.
// answer.finite.value requests the optional decimal projection of this stage.

console.log(factorial.describe("⟨◠○⟩").wholeResult.canonical); // ⟨◠◠⟩
```

- `approximation(source, stage = 32)` builds one finite stage, with the stage
  bounded from 1 through 512 for this helper.
- `definition(source)` builds the complete limit using successive corrections.
  `compute` shows finite corrections by default; `limit` asks for proof.
- `measuredDefinition(source)` writes the same definition with an explicit
  ordinary measuring attachment.
- `describe(source, stage = 32)` supplies the definition, `finiteSource`, the
  evaluated `finite` stage, `measuredDefinition`, and the evaluated `input`.
- For an input that reduces to a nonnegative whole count, `wholeSource` and
  `wholeResult` supply its exact finite factorial case. Other inputs have
  `null` for those fields. A whole input above the evaluator's range bound
  retains `wholeSource` with `wholeResult: null` and a `wholeReason`.
- Inputs must have no free counters. Generated names avoid those inside the
  input, with `□` and `□⌊◠⌋` treated as the same name.
- The helper first asks for the input's exact value, including any limits.
  A proved input can use that value. An unresolved endless input keeps its
  complete recipe; its finite preview never replaces it. Such previews
  carry the engine's `partial` flag.

Finite gamma stages need not equal the factorial, including at whole inputs.
The rational limit rules can prove the complete definition for small whole
inputs. Larger cases can exceed their symbolic work bounds; the direct finite
factorial remains available. Fractional and directed factorial limits still
need further reduction rules.

The helper never treats a finite stage as a certified limit or an error bound.
Directed powers can retain a UFN recipe even for a finite stage. Conventional
gamma notation is explained only as a correspondence; no gamma token or new
function-call syntax is added to UFN.

## How arithmetic works

Internally, each coefficient stores whether it points forward or backward,
together with instructions at unique-factor positions. In written UFN,
`◡` is a backward step and `[|…]` reverses a whole value; neither is a
separate sign prefix.

Multiplication joins matching instructions, division undoes them, and
powers scale them. Directed components use the same exact coefficients
and preserve the written order of changes.

Addition first extracts the shared factor instructions. It joins the remaining
group counts and restores the common factor. For fractions, matching shares
use the smallest piece count shared by both fractions: their least
common denominator. Compatible roots can share groups too.

Only the remaining counts and exponent fractions need ordinary count
operations. These use handwritten string algorithms: paired groups of steps,
carries, borrows, shifted groups, long division, and Euclid's GCF rule. Unique
factors are discovered by trying equal groups. Neither JavaScript `Number`
nor `BigInt` supplies this arithmetic.

Native numbers serve bounded positions, range controls, explicit numeric
imports, and the optional decimal/graph view.
The private count strings use a binary place-value representation. Preserving
factor instructions around that backend is what lets UFN retain shared
structure during a calculation.

For example, doubling a number with a huge shared factor adjusts its factor
instructions without expanding that factor into a long count. The factorial
through the thousand-step count likewise reduces beyond the decimal preview's
range.

Finite root sums can stay inside a calculation. Multiplication expands their
pairs and joins terms with matching fractional factor instructions. This can
cancel different roots and leave a canonical result. Whole powers of root
sums with an established positive base use the same rule.

Sums of square roots also support exact reciprocals and comparisons with `○`.
Separating one root and replacing it with its opposite removes that root from the next
denominator. Repeating this step removes the remaining square roots.

General higher-root sharing, fractional powers of root sums, and directed
powers still need further rules. No fraction is guessed from a decimal
approximation.

For example, this product reduces exactly to `◡`:

```text
{[⟨⟨◡⟩⟩ ⟨⟨◡⟩○⟩] [⟨⟨◡⟩⟩ | ⟨⟨◡⟩○⟩]}
```

Multiplying that product by `⟨⟨◡⟩⟩` gives the canonical non-rational result
`[|⟨⟨◡⟩⟩]`. Neither reduction requests a decimal projection.


## Evaluation limits

Exact arithmetic operates on UFN structure and strings. Only the requested
decimal projection uses floating-point arithmetic.

### Notation and evaluator coverage

The grammar describes values more broadly than the reducer can establish them.
The current boundaries are:

| Construction | What the evaluator currently establishes |
| --- | --- |
| Finite rational arithmetic and four directed components | Exact reductions, preserving multiplication order, within the work limits below |
| Component readings with `#` | Forward or backward coefficients on any of the four labelled axes; finite counters, definitions, exact turn components, and fixed-selector derivatives |
| Declared written forms and captured sequences | Local `≔(…)` declarations, capture-avoiding expansion, ordered finite folds, and derived positional notation |
| Parenthesized sequences | Finite generation, mapping, nesting, entry lookup, and sequence-producing definitions; each unfinished entry keeps its own bound recipe |
| Rational powers of unique factors | Exact factor instructions; root sums distribute and cancel, square-root sums support inversion and comparisons with `○`, and remaining roots can be displayed as exact joined expressions |
| Logarithms | Rational path answers from proportional factor instructions; principal directed logarithms keep recipes with decimal projections; a matching power of a logarithm recovers its target exactly |
| Unbounded square and curly ranges without attachments | Exact finite prefixes by default; `limit` requests proof for the full expression |
| Ordinary limits | Supported geometric combinations, constant-factor products, and rational telescoping sums and products |
| Limits at a selected factor place | Rational geometric sums and constant-factor products; other limits retain their attached recipes |
| Subdivision and integral recipes | Exact finite totals and proved correction limits for all three lesson recipes, sample choices, and both directed orders |
| Derivatives | Exact directional derivatives of supported finite recipes; input-dependent endless ranges, changing logarithms, and changing exponents remain unsupported |
| Factorial extension | Exact whole-count cases through the lesson helper; small whole inputs also reduce from the general limit definition; other inputs retain finite stages and complete recipes |
| Named constants and directed powers | Exact whole, half, quarter, and eighth turns from the named exponential base, on each turning axis; other powers retain recipes with optional projections |
| General p-adic values | Attached limit recipes; a limit proved rational can rejoin exact arithmetic, but arbitrary arithmetic on new completion values is not implemented |

Double square brackets acquire meaning only through a matching declaration.
Integral and derivative constructions use the numerical grammar.
The differentiation API binds a named input
from outside the expression; it adds no callable function name or dedicated
operator to the grammar.

### Work bounds

| Resource | Bound |
| --- | --- |
| Input after substitutions | 12,000 UTF-16 code units |
| Expression nesting | 64 levels |
| Declarations per input | 64 |
| Entries in a captured sequence | 1,000 |
| Definition matching and expansion | 50,000 work units; expanded tree traversal is also bounded |
| Factor positions | 2,000 |
| Finite range endpoints | 0 through 1,000 |
| Counter visits per evaluation | 30,000 |
| Retained entries created per evaluation | 30,000, including intermediate and nested sequences |
| Endless-range preview | 24 visits by default; selectable from 1 through 500 |
| Working count strings | 16,384 marks |
| Work per exact reduction | 10,000,000 elementary units |
| Different roots in a retained sum | 64 |
| Pairs in one distributed multiplication | 256 |

The rational limit solver allows polynomial degrees through 24. It supports
two nested finite counters and searches shifts of up to eight visits when
finding cancellation between terms. These are bounded searches, so an identity
may exist even when the solver retains its recipe.

Factor instructions can represent much larger magnitudes without expanding
them into working counts. Reaching a reduction limit preserves the UFN
recipe; it does not substitute a rounded answer.

The `encodeInteger(number)` import helper rejects fractions, non-finite values,
and native integers outside JavaScript's safe range. UFN string input has no
such native-integer restriction.

These are implementation limits. They do not restrict the notation itself.
