# Unique Factorization Numbers

A number language built from steps, journeys, and unique factors, with a
browser playground and a shared JavaScript engine.

## If you already know arithmetic

The **Fundamental Theorem of Arithmetic** says that every positive whole
number greater than one has a unique factorization into primes, apart from
their order. UFN uses that factorization as the number's spelling: positions
identify successive primes, and their entries give the exponents. The
exponents are themselves written in UFN.

Decimal notation organizes a number around powers of ten. UFN organizes it
around powers of primes, called *unique factors* in the teaching route.
For this comparison, `○`, `◠`, and `◡` have the familiar values zero,
one, and negative one. Factor positions run from right to left, starting
with two, then three, then five.

The backward step `◡` is a value, not a sign prefix. Reverse a whole
expression with `[|…]`: `⟨◡⟩` is a forward half step, while
`[|⟨◠⟩]` is two steps backward.

| Familiar reading | Factor structure | UFN |
| --- | --- | --- |
| 1 | no factors | `◠` / `⟨⟩` |
| 2 | 2¹ | `⟨◠⟩` |
| 3 | 3¹ · 2⁰ | `⟨◠○⟩` |
| 4 | 2² | `⟨⟨◠⟩⟩` |
| 6 | 3¹ · 2¹ | `⟨◠◠⟩` |
| 12 | 3¹ · 2² | `⟨◠⟨◠⟩⟩` |
| ½ | 2⁻¹ | `⟨◡⟩` |
| √2 | 2^(½) | `⟨⟨◡⟩⟩` |

Multiplication adds the entries at matching factor positions. Here is six
combined with twelve:

| Number | Exponent at factor 3 | Exponent at factor 2 |
| --- | --- | --- |
| `⟨◠◠⟩` (6) | `◠` | `◠` |
| `⟨◠⟨◠⟩⟩` (12) | `◠` | `⟨◠⟩` |
| `⟨⟨◠⟩⟨◠○⟩⟩` (72) | `⟨◠⟩` | `⟨◠○⟩` |

**UFN makes multiplicative structure explicit and lets calculations preserve
it.** Whole-number divisibility becomes a comparison of entries; greatest
common factors keep the smaller entries and least common multiples the larger
ones. Addition can use shared factors, but arbitrary sums can still require
new factor discovery. Convenience depends on the calculation.

### Where unique spelling ends

Finite products of primes raised to rational powers have unique factor
coordinates. This includes positive fractions and products of roots. Clear
the exponent denominators, then apply the Fundamental Theorem of Arithmetic.

Arbitrary exponents can describe the same value with different coordinates,
as in `3 = 2^(log₂ 3)`. General sums and limits need not have a factor
spelling at all. The language can keep them as exact recipes.

### The language around the numbers

The surrounding language adds square lists for joining, curly lists for
combining changes, and bars for undoing. Counters, limits, and the chosen
direction rules give further constructions a consistent syntax. Those rules
are additional mathematical structure. The factor representation specifies
how their numeric coefficients are written.

Definitions introduced by `≔` give new written forms an expansion into
those rules. Positional digits, polynomials, and Fourier forms use this
mechanism. Their library declarations are editable.

The constants `┌┘` and `⟳` also have defining recipes, but the calculator
supplies their names and recognizes them directly. Their meanings are fixed;
using them does not require pasting a declaration. Recognizing a complete
constant is different from proving the limit of its defining recipe.

The [teaching route](DESIGN.md) builds these ideas from steps and journeys.
Its [rule summary](DESIGN.md#rules-names-and-definitions) distinguishes the
core forms, supplied constants, and forms introduced by a declaration.
Its [invariant reference](DESIGN.md#rules-that-every-rewriting-must-keep)
collects the structure, value, binding, and display rules a rewriting must keep.

## Try it

Open [index.html](index.html) in a browser. It works offline and needs no
build step or server.

Choose a route:

- **[Act I: Core UFN](index.html#learn).** Start with a step, join journeys,
  and build toward factors, fractions, powers, and factor arithmetic.
  The course ends after equal groups and roots. You can read and calculate
  with UFN numbers without continuing into the extensions.
- **[Act II: Build with the language](index.html#extensions).** Choose an
  optional exploration: musical changes, directions, reusable recipes, or
  endless processes. Each chapter tells you what to practice first.
  [Hear the factor instructions](index.html#music) starts directly from core
  factors and shares. Sound is approximate; interval arithmetic stays exact.
- **Use the playground.** Type an expression or open an example. Symbol
  buttons and keyboard shortcuts help with input: `0` inserts `○`, `_`
  inserts `⌊⌋`, and `^` inserts `⌈⌉` with the cursor between them.
  Type `\turn` for `⟳`, the amount of a turn, or `\exp` for `┌┘`, the
  exponential constant. The two marks of `┌┘` form one name.
  Use `#` or `\component` to read a value's amount along a labeled axis.
  Use `\define` for `≔()` and `\form` for `⟦⟧`. Put declarations before
  the expression; they give new written forms a meaning within that input.
  Parentheses retain sequences. Type `(` or `\sequence` to insert the pair.
  Type `\box` or `\counter` for `□`, the guide's choice of counter name.
  You can supply other word or symbol names; their spelling is preserved.
  Lower corners after a sequence select an entry: `(◠ ◡)⌊○⌋` reads `◡`.
  Places count from the right at `○`.

Sequence results show each entry separately. Open an entry to inspect nested
sequences, copy its UFN writing, or request a decimal reading. **Show expansion**
follows a defined form through substitution to its result.

In the guided exercises, **Help me read this** lets you choose a complete
part of an example and inspect its spelling and job. It explains the structure
before you calculate. The early lessons follow the same six-step value through
different spellings and compare the grouped quarter with the two-entry sixth.

The playground's definition library includes entry counts, row and matrix operations, positional digits,
polynomials, selection counts, Pascal rows, individual Fourier coefficients,
and complete Fourier transforms. The matrix walkthrough names reusable changes,
combines two tables, and contrasts undoing a change with losing an input entry.
The input-finding puzzles show why a requested output can allow one input,
several inputs, or none. A row-changing walkthrough then simplifies clues
by changing both their instructions and their requested answers together.
A solution-family view describes every split of a fixed total, with one or two
independently chosen amounts.
Each example includes its declarations; their meanings remain yours to edit.

Try [equal groups and roots](index.html#factor-comparison) to compare factor
instructions before revealing the answers. The [Pascal experiment](index.html#pascal)
retains rows through declared factorial ratios and shows which instructions cancel.
A row can also supply the coefficients for the polynomial form.

The result stays in UFN. Shorter spellings skip unused factor places;
**Show dense spelling** reveals every place. Decimal readings are optional.
Hover, focus, or tap a displayed angle-bracket number to see its decimal
reading. The names `⟳` and `┌┘`, and their complete defining recipes, have
limit tooltips too. Both names describe complete values, independent of
preview terms; an `@` attachment supplies a direction.

## What the calculator can do

| Try | What happens |
| --- | --- |
| Join, combine, or share finite numbers | Exact factor arithmetic, including fractions and four directed components |
| Define a written form with `≔(…)` | Expand it using existing arithmetic; captured sequences support ordered folds and a user-defined positional notation |
| Retain a range with `(…)` | Keep each result in order, pass the sequence to another range, or return it from a definition; nested sequences stay nested |
| Select an entry with `sequence⌊place⌋` | Read from the right at `○`; select nested entries with successive attachments. The library derives equal-length pairing and rearrangement from visits and lookup |
| Combine roots | Exact cancellation and square-root sharing; surviving roots can stay joined in an exact expression |
| Turn with `┌┘` and `⟳` | Whole, half, quarter, and eighth turns reduce exactly along each turning axis; four- and eight-sample Fourier transforms use those rules |
| Read a component with `#` | Get its forward or backward amount; reading a turn's original and sideways components gives cosine and sine |
| Find an exponent with `BASE⌈\|X⌉` | Exact rational logarithms and recovery by a matching power; principal directed logarithms keep recipes with optional decimal readings |
| Use an endless counter | A finite preview by default; **Find the limit** asks for an exact proof |
| Attach a measuring place | Requests a limit under that measurement; finite visits remain a separate view |
| Build an integral from smaller pieces | Exact finite totals and proved correction limits for the lesson's three recipes |
| Find a derivative | Enter a recipe, starting input, and movement direction; the calculator applies exact differentiation rules |
| Extend factorial beyond whole counts | Exact whole-count answers; finite stages and complete limit recipes for other inputs |

The limit rules cover geometric sums, fixed-factor products, and supported
rational telescoping sums and products. Differentiation handles joining,
ordered multiplication, sharing, fixed powers, and finite counters with
fixed bounds.

**An unfinished reduction keeps its recipe.** A finite preview is labeled
as partial. Neither a decimal approximation nor an apparently stable sequence
is used as an exact answer.

General directed powers, non-rational p-adic arithmetic, and many limits
still need more rules. The [evaluator reference](docs/evaluator.md) describes
these boundaries and the API.

## Explore the lessons

The interactive examples let you:

- line up factor instructions to follow addition and multiplication;
- rotate a direction diagram and compare size with direction;
- unfold a finite grid of factor choices into whole numbers, then follow
  it toward the Riemann zeta function's Euler product;
- change how the gaps in one sequence are measured;
- shrink integral pieces and derivative changes while keeping exact values
  beside the picture.

The [language guide](DESIGN.md) gives the full definitions and arguments.

## Use it from JavaScript

```js
const UFN = require(".");

UFN.compute("[⟨◡⟩ ⟨◡○⟩]").canonical; // ⟨◠◡◡⟩ — a half plus a third
UFN.compute("⟨◠⟩⌈|⟨⟨◠○⟩⟩⌉").canonical; // ⟨◠○⟩ — which power of two gives eight?
UFN.limit("[□ : ◠ … : {|□ [□ ◠]}]").canonical; // ◠
UFN.differentiate("{□ □}", { at: "◠" }).canonical; // ⟨◠⟩

const library = require("./src/library.js");
const source = library.example("fourier");
UFN.compute(source).ufn; // (◠ ◡@◠ ◡ ◠@◠)
UFN.expand(source).expanded; // Copyable recipe with arguments substituted.
```

See the [evaluator reference](docs/evaluator.md) for browser loading,
result fields, limits, lesson helpers, and work bounds.

## Check the implementation

With Node.js installed:

```sh
npm test
```

No dependencies need installing. The tests cover arithmetic, parser errors,
counter scope, worked lesson examples, logarithms, exact limit proofs, derivatives,
root cancellation, and resource boundaries. Independent checks compare the
string arithmetic with native `BigInt`; the engine itself does not use it.

## Find your way around

| Location | Contents |
| --- | --- |
| [DESIGN.md](DESIGN.md) | The language, taught from its first marks |
| [docs/evaluator.md](docs/evaluator.md) | API, supported reductions, and implementation limits |
| [index.html](index.html), [assets/styles.css](assets/styles.css) | Browser lessons and presentation |
| [src/ufn.js](src/ufn.js) | Parser, exact evaluator, differentiation, and formatting |
| [src/string-arithmetic.js](src/string-arithmetic.js) | Exact counts written as strings of marks |
| [src/rational-functions.js](src/rational-functions.js) | Exact polynomial identities used to prove limits |
| [src/definitions.js](src/definitions.js) | Written-pattern matching and capture-avoiding definition expansion |
| [src/matrix.js](src/matrix.js) | Exact row pairing and an interactive matrix walkthrough |
| [src/transformations.js](src/transformations.js) | Successive changes, combined tables, and recovery examples |
| [src/input-puzzles.js](src/input-puzzles.js) | Exact guess checks for input-finding puzzles |
| [src/row-clues.js](src/row-clues.js) | Reversible row changes and worked elimination examples |
| [src/solution-families.js](src/solution-families.js) | Exact compensation recipes and independent input choices |
| [src/library.js](src/library.js) | Reusable declarations written in UFN |
| [src/result-view.js](src/result-view.js) | Sequence entries, expansion view, and library controls |
| [src/](src/) | Editor, diagrams, tooltips, and lesson helpers |
| [tests/](tests/) | Shared-engine tests |
| [tools/build_ligatures.py](tools/build_ligatures.py) | Draws and builds the optional symbol font |

## Joined shapes

The local symbol font uses the OpenType `dlig` feature. Both display modes use
the original Unicode text: font shaping changes the drawing, while parsing,
selection, and copying continue to use that text.

ASCII angle brackets and single spaces between a pattern's marks also work.
Extra spaces or line breaks can leave a pattern expanded. Larger patterns
take priority over their inner ligatures, so eight and nine each
join as a complete number.

The shapes join the original arches and loops. Skipped factor places remain
visible as loops; an inner pair of brackets still encloses a nested count.
Eight encloses both its arch and loop in the inner brackets, while nine leaves
its loop outside them. The guide pairs every joined shape with its expanded
spelling and includes examples at a smaller size inside longer numbers.

Five, seven, and eleven use smaller loops, each still showing a skipped
factor place. The third and sixth join downward curves with the same rules.
The quarter `⟨[◡ ◡]⟩` groups its two lower curves inside a small square
enclosure. They give one factor instruction: undo a doubling twice.
The sixth `⟨◡◡⟩` has two separate factor instructions. The equivalent
quarter spelling `⟨[|⟨◠⟩]⟩` shares the same joined shape.

Three halves `⟨◠◡⟩` joins its upper and lower curves into a wave between
two angle wings, a compact mark for the musical fifth. Two thirds `⟨◡◠⟩`
reverses the wave: lower curve, then upper. Combining the two changes gives
`◠`. Factor-alignment tables still show their separate instructions.

The font is included, works offline, and needs no installation. If it cannot
load, the expanded symbols remain readable using the fallback fonts. All of
its outlines are drawn by the generator; none are taken from another font.

To change the shapes, edit `tools/build_ligatures.py`. With Python and
[FontTools](https://github.com/fonttools/fonttools) installed, rebuild with:

```sh
python3 tools/build_ligatures.py
```

FontTools is needed only to rebuild the font. The playground and Node.js tests
have no added runtime dependencies.
