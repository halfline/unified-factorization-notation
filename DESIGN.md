# Unique Factorization Numbers

A few marks let us write journeys, change the length of their steps,
and describe where they lead. Start with a path and try each new rule
before moving to the next.

Try the examples in the [browser playground](index.html). Readers who already
know arithmetic can start with the [short comparison](README.md#if-you-already-know-arithmetic).
The [evaluator reference](docs/evaluator.md) describes what the calculator
can currently establish.

## Choose your route

**Act I teaches you to read and calculate with UFN numbers.** Begin with
steps, joining, and sharing. Learn factor spellings, powers, and arithmetic.
Finish with equal groups and roots at [A good place to pause](#a-good-place-to-pause).
That is a complete course. You can use those rules in the playground.

Pause at the practice questions. Try an answer on paper before opening
its explanation. Continue when you can describe what each bracket does.
Read a worked example, fill a missing step, then write one of your own.
Keep the counts small while learning a mark. If you get stuck, use
“Help me read this” before opening the answer.

**Act II is a collection of optional explorations.** Choose a question at
[Build with the language](#act-ii-build-with-the-language), then follow its
reminders about earlier rules. The reference at the end is for looking
things up. Directions, matrices, and calculus are not prerequisites for
reading UFN numbers.

<details>
<summary>Already know arithmetic? Read the factor structure first.</summary>

The **Fundamental Theorem of Arithmetic** says every positive whole number
greater than one has a unique factorization into primes, apart from order.
UFN makes that factorization the number’s spelling. Each place identifies a
prime; its entry gives the exponent, itself written in UFN. The teaching
route calls these primes *unique factors*.

Decimal places describe powers of ten. UFN places describe powers of
successive primes, beginning with two at the right, then three, then five.

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

Multiplication adds corresponding factor entries. Division subtracts them.
For whole numbers, divisibility compares entries; greatest common factors
keep the smaller entries, and least common multiples the larger. Addition
can use shared factors, but an arbitrary sum may require new factor discovery.

**Where unique spelling ends.** Finite products of primes raised to rational
powers have unique factor coordinates. This includes positive fractions and
products of roots: clear the exponent denominators, then apply the theorem.
Arbitrary exponents need not give unique coordinates: `3 = 2^(log₂ 3)`.
General sums and limits need not have a factor spelling at all. The language
can keep them as exact recipes.

</details>

## Act I: Read and calculate UFN numbers

### Begin at a starting place

Imagine a path that continues in both directions. Choose a step length
and mark a starting place `○`. Write `◠` for a journey of one step
forward and `◡` for a journey of one step backward.

You can start by going backward. You can also stay where you are:
`○` describes no change of place. Going out and coming back also
leaves you at `○`. We care about where a journey finishes compared
with where it started.

Keep the step length the same whenever you count steps. Later we will
learn to describe parts of a step too.

### Join journeys in square brackets

Where do these journeys finish together?

Put journeys inside square brackets to follow them one after another.
For `[◠ ◠]`, take a forward step, then another forward step from
where you have arrived.

The mark `=` means "finishes at the same place":

```text
[◠ ◡] = ○
[◠ ◠ ◡] = ◠
```

Try walking each example. In the second, a forward step and a backward
step bring you back to where you were before taking that pair. We say
those steps *cancel*.

In the playground, enter either side of `=` to try its journey. The guide
uses `=` to compare the two expressions.

<details>
<summary>Explore further: two more walks</summary>

```text
[○ ◠] = ◠
```

```text
[◡ ◡ ◠] = ◡
```

Staying put changes nothing. Starting backward works by the same cancellation rule.

</details>

A complete written journey, such as `[◠ ◠ ◡]`, is an *expression*.
Its *value* is the change from its start to its finish: here, one step
forward. The route can be longer than that change. These journey values
are numbers. Different expressions can write the same number.

Joining journeys this way is called *addition*. You can keep saying
“join” as you practice. An arithmetic reference calls the joined result
a *sum*.

#### Put a journey inside a journey

A whole bracketed journey can be an entry in another:

```text
[[◠ ◠] [◡ ◠]] = [◠ ◠]
```

Read the inner brackets first. The second inner journey comes back to
its own start, so it adds no change of place to the first.

Changing the order of the journeys changes your route, but you still
finish at the same place. An empty list `[]` gives you no journeys
to follow and leaves you at `○`.

#### A routine for reading brackets

When an expression looks busy, read it in three passes:

1. Find the outer brackets.
2. Find their complete *entries*: the pieces directly inside them.
   Keep each inner bracketed expression together as one entry.
3. Read what the outer brackets ask you to do with those entries.
   Square brackets ask you to join their journeys.

For `[[◠ ◠] ◡]`, the two outer entries are `[◠ ◠]` and `◡`.
The first entry contains two steps, but it is still one outer entry.

The outside brackets tell you what to do. Work out an inner entry before
doing that job. Cover the rest of the line or draw a box around the entry
you are reading.

#### Undo a journey

A bar in square brackets says to undo the journeys after it:

```text
[[◠ ◠ ◠] | [◠ ◠]] = ◠
[|[◠ ◠]] = [◡ ◡]
[|◡] = ◠
```

In the first example, go forward three steps and then undo two forward
steps. One forward step remains.

Undoing a backward step takes you forward. This action is called
*subtraction*. The journey `[|[◠ ◠]]` is the *opposite* of
`[◠ ◠]`: following both brings you back to `○`.

Use `[|…]` to reverse a whole journey. The mark `◡` is itself a
backward step; it is not a prefix to put in front of another number.

There may be several journeys on each side of the bar. An empty side
contributes `○`.

#### Pause and practice: join and undo

**Marks so far — reminders for this checkpoint**

- `○ · ◠ · ◡`: stay, step forward, step backward. Example: `[◠ ◡] = ○`.
- `[…]`: join journeys. Example: `[◠ ◠]`.
- `[… | …]`: undo the journey after the bar. Example: `[|◡] = ◠`.

Try each question before opening its answer. Write or sketch your
reasoning first.

Where does `[◠ ◠ ◡]` finish?

<details>
<summary>Check your answer</summary>

A forward and a backward step cancel. One forward step remains.

```text
[◠ ◠ ◡] = ◠
```

</details>

Write two steps backward by undoing a whole forward journey.

<details>
<summary>Check your answer</summary>

One spelling is:

```text
[|[◠ ◠]] = [◡ ◡]
```

</details>

Does `[◠ | ◡]` move forward or backward? How far?

<details>
<summary>Check your answer</summary>

Undoing the backward step takes you forward. Join it with the first step.

```text
[◠ | ◡] = [◠ ◠]
```

</details>

### Let a named counter write a list

How can one recipe write several journeys?

The places reached by taking only full forward steps give us a list of
counts: `○`, `◠`, `[◠ ◠]`, `[◠ ◠ ◠]`, and so on.

Begin with the three journeys you want to join:

```text
[◠ [◠ ◠] [◠ ◠ ◠]] = [◠ ◠ ◠ ◠ ◠ ◠]
```

Their lengths advance from one through three. Name that changing length □. The recipe only needs to write its current value. The square brackets will still join the three journeys.

Give that changing count the name `□`. Let it visit
each count from `◠` through `[◠ ◠ ◠]`:

```text
[□ : ◠ … [◠ ◠ ◠] : □]
```

Read this in parts:

- `□` before the first colon names the counter.
- `◠ … [◠ ◠ ◠]` gives the first and last counts to visit.
- `□` after the second colon tells what to write on each visit.
- The outside square brackets join the entries that were written.

Here is what happens:

| Count being visited | Entry written |
| --- | --- |
| `◠` | `◠` |
| `[◠ ◠]` | `[◠ ◠]` |
| `[◠ ◠ ◠]` | `[◠ ◠ ◠]` |

Thus the instruction and the list it writes have the same value:

```text
[□ : ◠ … [◠ ◠ ◠] : □] = [◠ [◠ ◠] [◠ ◠ ◠]]
```

The part after the second colon is a *recipe*. This whole instruction
is a *range*: it visits counts, using the recipe at each one.

#### Change the recipe

The recipe can contain a whole journey. Wherever its counter appears,
use the count being visited now:

```text
[□ : ◠ … [◠ ◠] : [□ ◠]] = [[◠ ◠] [◠ ◠ ◠]]
```

A recipe without the counter writes the same journey each time:

```text
[□ : ◠ … [◠ ◠] : [◠ ◠ ◠]] = [[◠ ◠ ◠] [◠ ◠ ◠]]
[□ : ◠ … [◠ ◠] : ◡] = [◡ ◡]
```

#### Where to start and stop

The first and last counts are called the *bounds*. Each must be `○`
or a place reached with full forward steps. The counter includes both
ends and always advances by `◠`.

```text
[□ : ○ … ◠ : ◠] = [◠ ◠]
[□ : ◠ … ○ : □] = ○
```

The first range visits `○` and `◠`, writing a step on each visit.
The second makes no visits: its last count comes before its first.
There are no journeys to join, so it gives `○`. With no visits,
we never use the recipe.

The name `□` gets its value from the range whose recipe it is in.
Outside a range that supplies a value, `□` has no value to read.
We will give different counters different names later.

The spelling `...` can stand for `…`. The dots tell the counter
to keep taking forward steps through the chosen counts.

#### Read a counter, then write one

Keep the visits at one and two while you learn the recipe. Only the recipe will change.

```text
[□ : ◠ … [◠ ◠] : [□ ◠]]
```

<details>
<summary>Help me read this</summary>

The outer square brackets join the entries. The first □ names the counter. The dots give its visits, one through two. After the second colon, [□ ◠] is one complete recipe: join the visited count with a forward step.

</details>

Read the first row. Complete the second using the same recipe.

| Visited count | Recipe writes | Spoken reading |
| --- | --- | --- |
| `◠` | `[◠ ◠]` | Two steps |
| `[◠ ◠]` | Fill this entry | Three steps |

Read and complete: which expression belongs in the missing cell? Write it before opening the answer.

<details>
<summary>Check the missing step</summary>

Write `[[◠ ◠] ◠]`. Replace only □ with the visited count; keep the recipe’s extra ◠. If you wrote `[◠ ◠]`, you copied the visit but left out that extra step.

</details>

Write your own: keep the same visits, but write a backward step at each visit. Start with the same header and choose the new recipe.

<details>
<summary>Check your expression</summary>

The recipe is ◡. It does not need to use □. Changing the recipe does not change the two visits.

```text
[□ : ◠ … [◠ ◠] : ◡] = [◡ ◡]
```

</details>

Recall joining: where does `[◠ ◡]` finish?

<details>
<summary>Check the earlier rule</summary>

At ○. The backward step undoes the forward step.

```text
[◠ ◡] = ○
```

</details>

#### Pause and practice: follow the visits

Marks to use: `□` takes the current count; `…` includes both ends; the recipe comes after the second colon; `[…]` joins the entries.

For `[□ : ◠ … [◠ ◠] : [□ ◠]]`, write each visited count and the entry it makes.

<details>
<summary>Check your answer</summary>

The recipe adds a step to the visited count.

| Visited count | Entry written | Reading |
| --- | --- | --- |
| `◠` | `[◠ ◠]` | One visited; two steps written. |
| `[◠ ◠]` | `[[◠ ◠] ◠]` | Two visited; three steps written. |

```text
[□ : ◠ … [◠ ◠] : [□ ◠]] = [[◠ ◠] [◠ ◠ ◠]]
```

Join the two entries to reach five steps. The counter itself visits only one and two.

</details>

Change only the recipe to `◡`. Which counts are visited, and what journey is written?

<details>
<summary>Check your answer</summary>

The same counts, one and two, are visited. Each visit writes one backward step.

```text
[□ : ◠ … [◠ ◠] : ◡] = [◡ ◡]
```

</details>

Does `[□ : ○ … ◠ : ◠]` visit once or twice? What changes if its bounds are `◠ … ○`?

<details>
<summary>Check your answer</summary>

It visits twice: first ○, then ◠. Reversing the bounds makes no visits because the counter only counts forward.

```text
[□ : ○ … ◠ : ◠] = [◠ ◠]
```

```text
[□ : ◠ … ○ : ◠] = ○
```

</details>

Write a square range that visits zero, one, and two, writing a backward step on each visit.

<details>
<summary>Check your answer</summary>

Start at ○, stop at the two-step count, and use ◡ as the recipe.

```text
[□ : ○ … [◠ ◠] : ◡] = [◡ ◡ ◡]
```

</details>

### Change the length of each step

What happens when each step changes size?

Take the three-step journey `[◠ ◠ ◠]`. Now make each step as
long as the two-step journey `[◠ ◠]`. You reach as far as six
of your original steps.

Curly brackets write this change:

```text
{[◠ ◠ ◠] [◠ ◠]} = [◠ ◠ ◠ ◠ ◠ ◠]
```

The first entry gives the journey. The second tells what each of its
forward steps becomes. Each backward step changes in the opposite way.

With a whole forward count as the second entry, we can also reach the
same place by joining copies of the first journey:

```text
{[◠ ◠ ◠] [◠ ◠]} = [[◠ ◠ ◠] [◠ ◠ ◠]]
[□ : ◠ … [◠ ◠] : [◠ ◠ ◠]] = {[◠ ◠ ◠] [◠ ◠]}
```

Changing a journey's size is called *scaling*. For now, every journey
stays on our original path. Later, we will give journeys other
directions and learn how curly brackets can turn them too.

#### Keep, reverse, or remove a step

If a forward step becomes `◠`, the journey stays as it was. If it
becomes `◡`, the journey reverses. If it becomes `○`, each step
makes no change of place:

```text
{[◠ ◠] ◠} = [◠ ◠]
{[◠ ◠] ◡} = [◡ ◡]
{[◠ ◠] ○} = ○
{◡ ◡} = ◠
```

In the last example, a backward step is reversed, so it goes forward.

Changing a joined journey gives the same result as changing each of its
parts and then joining those:

```text
{[◠ ◡ ◠] [◠ ◠]} = [[◠ ◠] [◡ ◡] [◠ ◠]]
```

#### Make several changes in a row

With more entries, continue from left to right:

```text
{[◠ ◠] [◠ ◠ ◠] [◠ ◠]}
    = {{[◠ ◠] [◠ ◠ ◠]} [◠ ◠]}
```

First make each step of the two-step journey three times as long.
Then double the length of the steps in that result.

For a rule that also works with an empty list, begin with `◠` and
apply every entry in order. With no entries, you still have `◠`.
An entry `○` does give an instruction: each step becomes no change
of place, so the whole journey finishes at `○`.

```text
{} = ◠
{○} = ○
```

For journeys on our original path, swapping the entries leaves the same
answer. When we introduce turns, their order will matter.

#### Let the counter choose the changes

The counter you already know can write a curly list:

```text
{□ : ◠ … [◠ ◠ ◠ ◠] : □}
    = {◠ [◠ ◠] [◠ ◠ ◠] [◠ ◠ ◠ ◠]}
```

Begin with `◠`. Keep it as it is, double its length, make that
result three times as long, then make that result four times as long.
The counter supplies each new instruction in order.

If the range has no visits, there are no changes to make:

```text
{□ : ◠ … ○ : □} = ◠
```

#### Share a step into equal pieces

Mark a point halfway along a forward step. Two journeys of that length,
joined together, reach `◠`.

A bar in curly brackets lets us write the length of a piece:

```text
{◠ | [◠ ◠]}
```

Read it as "share one forward step into two equal pieces; take one."
Joining the pieces puts the original step back together:

```text
[{◠ | [◠ ◠]} {◠ | [◠ ◠]}] = ◠
```

The same rule works with a longer journey or a different whole count of
pieces. These shares are called *fractions*. For example,
`{[◠ ◠ ◠] | [◠ ◠]}` shares a three-step journey into two
equal pieces; each piece is longer than a single step.

A share can also tell us how to change each step:

```text
{[◠ ◠] {◠ | [◠ ◠]}} = ◠
```

Each step in the two-step journey becomes half as long.

#### Undo a change of size

More generally, the bar asks us to undo the change described after it.
`{◠ | [◠ ◠]}` asks: what journey becomes `◠` when each
step is made twice as long?

An empty side of curly brackets contributes `◠`. So `{|[◠ ◠]}`
is another spelling of the same share. For any journey other than `○`,
`{|journey}` gives the change that restores `◠` when combined
with that journey. This restoring change is called its *reciprocal*.

Compare the two ways to undo something:

```text
{{|[◠ ◠]} [◠ ◠]} = ◠
[[|[◠ ◠]] [◠ ◠]] = ○
```

The first restores the original step length. The second walks back to
the starting place.

We cannot undo changing every step to `○`: all starting journeys
would have ended at `○`, so there is no way to recover a particular
one. A curly bar followed by a value of `○` has no answer, including
when the value before it is also `○`.

#### Names for the actions we have tried

The action of combining entries in curly brackets is called
*multiplication*. The entries are its *factors*, and the result is
their *product*. In `{[◠ ◠ ◠] [◠ ◠]}`, the three-step and
two-step journeys are the factors. The six-step journey is their product.

Undoing the change after a curly bar is called *division*. With several
entries on either side, first find each side's product, then undo the
change described by the entire side after the bar.

#### Read a share, then write one

Use the same half-step amount for both rows. Change only the outside brackets.

```text
{◠ | [◠ ◠]}
```

<details>
<summary>Help me read this</summary>

The outside curly brackets apply changes, beginning with one step. Before the bar, ◠ keeps that step as it is. After the bar, [◠ ◠] is one complete two-step count. The bar asks to undo its doubling change.

</details>

The amount stays the same; the outside operation changes.

| Action | Amount used | Destination |
| --- | --- | --- |
| Join two copies | A half step each | One step |
| Apply the change twice | A half-size change each time | Fill this destination |

Read and complete: does the second row finish at a whole, a half, or a quarter step?

<details>
<summary>Check the missing step</summary>

A quarter step. The first change halves the starting step; the second halves that result. If you got one step, you joined two halves. This row asks you to apply two changes.

</details>

Write your own: share one step into two equal pieces, then join two copies of that piece. Use square brackets for the joining.

<details>
<summary>Check your expression</summary>

Keep each complete curly expression together inside the square brackets. If you used curly brackets outside, you asked for two successive size changes instead.

```text
[{◠ | [◠ ◠]} {◠ | [◠ ◠]}] = ◠
```

</details>

Recall undoing: what does `[|◡]` do?

<details>
<summary>Check the earlier rule</summary>

It undoes a backward step, so it goes forward one step.

```text
[|◡] = ◠
```

</details>

#### Pause and practice: change and share

**Marks so far — reminders for this checkpoint**

- `□ : … :`: visit counts and write the recipe. Example: `[□ : ◠ … [◠ ◠] : □]`.
- `{…}`: apply changes in order. Example: `{[◠ ◠] [◠ ◠]}`.
- `{… | …}`: undo a change; here, share into equal pieces. Example: `{◠ | [◠ ◠]}`.

Try each question before opening its answer. Write or sketch your
reasoning first.

Write the result of `{[◠ ◠ ◠] [◠ ◠]}` using only steps.

<details>
<summary>Check your answer</summary>

Each of the three steps becomes twice as long.

```text
{[◠ ◠ ◠] [◠ ◠]} = [◠ ◠ ◠ ◠ ◠ ◠]
```

</details>

Share a forward step into four equal pieces. Write one piece, then explain how to recover the whole step.

<details>
<summary>Check your answer</summary>

One piece is `{◠ | [◠ ◠ ◠ ◠]}`. Join four of these pieces to recover `◠`.

</details>

Why does an empty square list give `○`, while an empty curly list gives `◠`?

<details>
<summary>Check your answer</summary>

With no journeys to join, you stay at `○`. Curly lists start with `◠` and apply changes; with no changes it stays `◠`.

</details>

Expand `{□ : ◠ … [◠ ◠] : [□ ◠]}`. Why does it finish at six steps?

<details>
<summary>Check your answer</summary>

The two visits write the two-step and three-step changes. Curly brackets apply those changes in order.

```text
{□ : ◠ … [◠ ◠] : [□ ◠]} = {[◠ ◠] [◠ ◠ ◠]}
```

Begin with one step, double it, then make each of those steps three times as long.

</details>

### Find counts that cannot make smaller whole groups

Some whole forward counts can be arranged into several equal groups,
with several steps in each group:

```text
[◠ ◠ ◠ ◠] = {[◠ ◠] [◠ ◠]}
```

Draw five marks. Try making groups of two, then groups of three, then groups of four. Every group must be full, with no marks left over. Try four marks the same way.

<details>
<summary>Check the group arrangements</summary>

Which arrangements make several equal whole groups?

| Steps in each group | Using five marks | Using four marks |
| --- | --- | --- |
| Two | Two full groups, one mark left | Two full groups, nothing left |
| Three | One full group, two marks left | One full group, one mark left |
| Four | One full group, one mark left | One group only |

Five marks cannot do it. Groups larger than five cannot be filled even once. Four marks can: two groups of two. Try three marks yourself before reading the answer.

</details>

Can three marks make several groups with several marks in each?

<details>
<summary>Check your answer</summary>

Groups of two leave one mark. A group of three uses all the marks but makes only one group. Larger groups cannot be filled. So three cannot split this way.

</details>

The four-step count makes two groups of two. The two-step, three-step,
and five-step counts cannot make groups this way. Every arrangement
has either a single group or just a single step in each group.

Call a whole forward count beyond `◠` with this property a *unique factor*.
The first few unique factors, with their counts, are:

| Journey | Step count |
| --- | --- |
| `[◠ ◠]` | Two |
| `[◠ ◠ ◠]` | Three |
| `[◠ ◠ ◠ ◠ ◠]` | Five |
| `[◠ ◠ ◠ ◠ ◠ ◠ ◠]` | Seven |

Keep splitting groups into smaller equal whole groups wherever you can.
Eventually only unique factors remain. Putting them in curly brackets
rebuilds the original count.

Every whole forward count beyond `◠` can be built this way. The
unique factors used, including how often each occurs, are fixed for that
count. The word *unique* refers to this fixed collection. A factor can
occur more than once, as the two-step factor does in the four-step count.
This fact is called *unique factorization*.

Give each unique factor a position, from smallest to largest, counting from
`◠`. We can write a count compactly by recording which unique factors it uses.

### Write numbers with angle brackets

How can a number show the building blocks it uses?

Before calculating, find the complete outer entries. Angle brackets give
those entries a new job.

Angle brackets give each unique factor its own place. Start on the right with
the smallest unique factor. The next place to the left belongs to the next
unique factor, and so on.

At a place marked `◠`, use its unique factor once in a curly list.
At a place marked `○`, skip that unique factor:

```text
⟨◠⟩ = [◠ ◠]
```

Two forward steps.

```text
⟨◠○⟩ = [◠ ◠ ◠]
```

Three forward steps.

```text
⟨◠◠⟩ = {⟨◠⟩ ⟨◠○⟩}
```

Six steps: three groups of two.

These are compact ways to write numbers we already know. The angle
brackets tell how to build each number from its unique factors.

#### Use a whole expression in a place

To use the first unique factor twice, put the two-step count in its place:

```text
⟨[◠ ◠]⟩ = {⟨◠⟩ ⟨◠⟩}
```

Four steps: two groups of two.

But `[◠ ◠]` and `⟨◠⟩` have the same value. Either spelling
can go between the angle brackets:

```text
⟨[◠ ◠]⟩ = ⟨⟨◠⟩⟩
```

Four steps: use the two-step factor twice.

```text
⟨◠⟨◠⟩⟩ = {⟨◠○⟩ ⟨◠⟩ ⟨◠⟩}
```

Twelve steps: double three steps, then double again.

Read an inner expression first. Its entire result occupies one place
inside the outer angle brackets. The entry in that role is called an
*exponent*. In these examples, its whole forward count tells how many
copies of the unique factor to use. We will also learn entries that
undo a change or ask for part of it.

There is no separate place for `◠` itself: putting `◠` in a
curly list makes no change. Empty angle brackets and angle brackets
containing only skipped places both leave the starting step `◠`:

```text
⟨⟩ = ◠
⟨○○⟩ = ◠
```

One step: no factor changes have been applied.

```text
⟨○◠⟩ = ⟨◠⟩
```

Two steps: the unused place on the left changes nothing.

A skipped place may still be needed to hold the place of an entry
farther left.

#### Keep the value while changing its spelling

Follow the same six-step value through four spellings. Only the written
instructions change.

| Spelling | What to do |
| --- | --- |
| `[◠ ◠ ◠ ◠ ◠ ◠]` | Walk six forward steps. |
| `[□ : ◠ … [◠ ◠ ◠] : □]` | Join one step, two steps, and three steps. |
| `{[◠ ◠] [◠ ◠ ◠]}` | Make each of two steps three steps long. |
| `⟨◠◠⟩` | Use the three-step factor once and the two-step factor once. |

A new spelling does not make a new value. Choose the spelling that shows
the part of the calculation you want to see.

#### Read from the outside, then the inside

Use three steps to read an angle-bracket number:

1. Find the outer brackets and count their complete entries. A number
   inside its own brackets occupies one outer place.
2. Read each entry's value, beginning with any inner numbers.
3. Apply those counts at the matching unique-factor places.

For `⟨⟨◠⟩⟩`, there is one outer entry: `⟨◠⟩`. It says twice,
so use the two-step factor twice: four steps. For `⟨◠◠⟩`, there
are two outer entries. Use the three-step factor once and the two-step
factor once: six steps. For `⟨◠⟨◠⟩⟩`, there are also two outer
entries. Its right entry says twice; its left says once: twelve steps.

Before reading further, draw boxes around the outer entries of each
example. Then write the curly list that those entries describe.

#### Undo a factor instruction

A backward exponent tells us to undo the change made by its unique factor:

```text
⟨◡⟩ = {|⟨◠⟩}
```

A forward half step: the share that undoes a doubling.

```text
⟨[◡ ◡]⟩ = {|⟨◠⟩ ⟨◠⟩}
```

A quarter step: undo a doubling, then undo another.

```text
⟨◡◠⟩ = {⟨◠⟩ | ⟨◠○⟩}
```

Two thirds of a step: share two steps into three equal pieces.

The backward mark is still a backward step. Its place between the
angle brackets tells us what that step is counting: changes to undo.
The number `⟨◡⟩` describes a forward share, halfway along
the starting step.

Compare `⟨◡⟩` with `[|⟨◠⟩]`. The first undoes a doubling,
giving a forward half step. The second reverses the whole two-step
journey, giving two steps backward. To decide what a backward step
does, look at the brackets around it.

When numbers are written with angle brackets, combining them in curly
brackets joins the exponent instructions at each matching place. A curly
bar undoes the instructions after it:

```text
{⟨◠◠⟩ ⟨◠⟩} = ⟨◠[◠ ◠]⟩
```

Twelve steps: double six steps.

```text
{⟨◡⟩ ⟨◠⟩} = ◠
```

Double a half step to recover one whole step.

#### Keep a grouped instruction together

These spellings contain the same two backward marks. Their outer entries
give the marks different jobs:

| Spelling | Complete outer entries | Instruction | Value |
| --- | --- | --- | --- |
| `⟨[◡ ◡]⟩` | One: `[◡ ◡]` | Undo the two-step change twice. | A quarter step |
| `⟨◡◡⟩` | Two: `◡` and `◡` | Undo the three-step change once and the two-step change once. | A sixth of a step |

Before calculating, count the outer entries. Inner brackets keep the two
backward steps together as one instruction in the quarter-step spelling.

#### Read the places, then build a number

Keep the entries ◠ and ○. Swap their places and check which factor changes.

```text
⟨◠○⟩
```

<details>
<summary>Help me read this</summary>

The outer angle brackets contain two complete entries. Count places from the right: ○ is at the two-step factor and skips it; ◠ is at the three-step factor and uses it once. Read these places before working out the whole number.

</details>

Read the rightmost place first. The entries stay the same.

| Number | At the three-step factor | At the two-step factor |
| --- | --- | --- |
| `⟨◠○⟩` | Once | Skip |
| `⟨○◠⟩` | Skip | Fill this instruction |

Read and complete: what does the missing instruction say? Which row describes two steps?

<details>
<summary>Check the missing step</summary>

The missing instruction says once. The second row describes two steps. If you got three, you read the places from the left; the two-step factor always belongs to the rightmost place.

</details>

Write your own: use each of these two factors once. Draw two outer places first, then fill each with its instruction.

<details>
<summary>Check your expression</summary>

Both entries are ◠. If you wrote `⟨⟨◠⟩⟩`, you put a two-step instruction in just one outer place. That asks for two uses of the two-step factor.

```text
⟨◠◠⟩ = {⟨◠○⟩ ⟨◠⟩}
```

</details>

Recall empty lists: why do `[]` and `⟨⟩` have different values?

<details>
<summary>Check the earlier rule</summary>

Square brackets with no journeys leave you at ○. Angle brackets with no factor changes leave the starting step ◠.

```text
[⟨⟩] = ◠
```

</details>

#### Pause and practice: read and build a number

**Marks so far — reminders for this checkpoint**

- `⟨…⟩`: read complete factor instructions, starting at the right. Example: `⟨◠◠⟩ = {⟨◠○⟩ ⟨◠⟩}`.
- `◡ inside ⟨…⟩`: undo one use of that place’s factor. Example: `⟨◡⟩ = {|⟨◠⟩}`.
- `[|…]`: reverse the whole journey. Example: `[|⟨◠⟩]`.

Try each question before opening its answer. Write or sketch your
reasoning first.

How many entries are inside the outer brackets of `⟨⟨◠⟩⟩`? Expand the number into a curly list.

<details>
<summary>Check your answer</summary>

There is one outer entry: the complete inner number `⟨◠⟩`. It asks for two uses of the first factor.

```text
⟨⟨◠⟩⟩ = {⟨◠⟩ ⟨◠⟩}
```

Four steps: two groups of two.

</details>

Build an angle-bracket number using the three-step factor twice and the two-step factor once.

<details>
<summary>Check your answer</summary>

The left entry says twice; the right entry says once.

```text
⟨⟨◠⟩◠⟩ = {⟨◠○⟩ ⟨◠○⟩ ⟨◠⟩}
```

Eighteen steps: three groups of three, doubled.

</details>

Which is a forward half step: `⟨◡⟩` or `[|⟨◠⟩]`? Explain what gets undone in each.

<details>
<summary>Check your answer</summary>

`⟨◡⟩` undoes a doubling and gives a forward half step. `[|⟨◠⟩]` reverses the whole two-step journey.

</details>

Read `⟨◠○⟩` and `⟨○◠⟩` from the right. Which gives three steps, and which gives two?

<details>
<summary>Check your answer</summary>

In the first, skip the two-step factor and use the three-step factor once. In the second, use the two-step factor once and skip the next place.

```text
⟨○◠⟩ = ⟨◠⟩
```

</details>

Why do `⟨⟩` and `[]` give different answers?

<details>
<summary>Check your answer</summary>

Angle brackets describe factor changes. With none, the starting step stays one step. Square brackets join journeys. With none, you stay at the starting place.

```text
⟨⟩ = ◠
```

```text
[] = ○
```

</details>

#### Join numbers by finding shared groups

Suppose one journey has two groups of six steps and another has three
groups of six steps. Join the group counts, then keep the shared group size:

For twelve and eighteen, the two-step factor is used twice and once. The three-step factor is used once and twice. Fill each “keep in both” count before reading the table.

<details>
<summary>Check your answer</summary>

Keep one use at each place. That makes a shared six-step group.

</details>

Read the places from right to left; keep the smaller count in each row.

| Factor place | In twelve steps | In eighteen steps | Keep in both |
| --- | --- | --- | --- |
| Two-step factor | `⟨◠⟩` — twice | `◠` — once | `◠` — once |
| Three-step factor | `◠` — once | `⟨◠⟩` — twice | `◠` — once |

The kept instructions use the two-step and three-step factors once each: `⟨◠◠⟩`, six steps. Taking one use of each out of twelve leaves two groups. Taking them out of eighteen leaves three.

Six steps are `⟨◠◠⟩`; the group counts two and three are
`⟨◠⟩` and `⟨◠○⟩`. First write the groups explicitly:

```text
[{⟨◠◠⟩ ⟨◠⟩} {⟨◠◠⟩ ⟨◠○⟩}] = {⟨◠◠⟩ [⟨◠⟩ ⟨◠○⟩]}
```

Now write twelve and eighteen using their factor places:

```text
[⟨◠⟨◠⟩⟩ ⟨⟨◠⟩◠⟩] = {⟨◠◠⟩ [⟨◠⟩ ⟨◠○⟩]}
```

Twelve steps and eighteen steps: two groups of six joined with three groups of six.

```text
{⟨◠◠⟩ [⟨◠⟩ ⟨◠○⟩]} = ⟨◠◠◠⟩
```

Thirty steps: five groups of six.

Find the shared group by comparing the instructions at each position.
Take the smaller count of copies at each place, using `○` for a missing
place. Together these copies make the largest whole group size that fits
both journeys. This is their *greatest common factor*.

Remove those shared instructions from each number. Join the remaining
group counts, find their unique factors, then restore the shared group.
New unique factors can appear in the smaller sum: two steps joined with
three steps give the five-step unique factor.

#### Give shares matching pieces

A half step and a third of a step have different-sized pieces. Split the
step into six equal pieces instead. The half contains three of these
pieces; the third contains two. A half is `⟨◡⟩`, a third is
`⟨◡○⟩`, and a sixth is `⟨◡◡⟩`:

A half step fills three sixths. A third fills two sixths. Predict their joined count of sixths before reading the table.

<details>
<summary>Check your answer</summary>

Five sixths. The piece size stays one sixth; the counts three and two join to five.

```text
[⟨◡⟩ ⟨◡○⟩] = ⟨◠◡◡⟩
```

</details>

Compare the whole piece counts, two and three. Keep the larger instruction in each row.

| Factor place | To make halves | To make thirds | Keep for matching pieces |
| --- | --- | --- | --- |
| Two-step factor | `◠` — once | `○` — skip | `◠` — once |
| Three-step factor | `○` — skip | `◠` — once | `◠` — once |

The kept instructions make six pieces per step. One sixth is `⟨◡◡⟩`. A half fills three of those pieces; a third fills two.

Once the pieces match, join their counts.

| Journey | Count of sixths | Same journey in matching pieces |
| --- | --- | --- |
| Half a step | Three | `{⟨◡◡⟩ ⟨◠○⟩}` |
| Third of a step | Two | `{⟨◡◡⟩ ⟨◠⟩}` |
| Both joined | Five | `{⟨◡◡⟩ ⟨◠○○⟩}` |

```text
[⟨◡⟩ ⟨◡○⟩] = {⟨◡◡⟩ [⟨◠○⟩ ⟨◠⟩]}
```

A half step and a third of a step: three sixths joined with two sixths.

```text
{⟨◡◡⟩ [⟨◠○⟩ ⟨◠⟩]} = ⟨◠◡◡⟩
```

Five sixths of a forward step.

To find a shared division of the step, compare the unique factors used
by each piece count. Keep the larger count at each position. This makes
the smallest whole count that both piece counts fit into evenly: their
*least common multiple*. Use it to give the fractions equal-sized pieces,
then join the counts of those pieces.

These grouping rules apply to amounts along the original path. With
several direction labels, join the amounts at each matching label.

#### Choose the first place to write

A long run of `○` can be shortened by giving the rightmost entry
a different starting position. Put that position between lower corners
after the angle brackets:

```text
⟨◠⟩⌊⟨◠⟩⌋ = ⟨◠○⟩
```

Three steps: use the second unique factor once.

```text
⟨◠⟩⌊⟨◠○○⟩⌋ = ⟨◠○○○○⟩
```

Eleven steps: use the fifth unique factor once.

The first starts at the second unique factor; the second starts at the fifth.
Positions are whole forward counts beginning at `◠`. Without lower
corners, begin at `◠`.

The corners set the positions only for the angle brackets immediately
before them. Angle brackets inside those keep their own starting position:

```text
⟨⟨◠⟩⟩⌊⟨◠⟩⌋ = ⟨⟨◠⟩○⟩
```

Nine steps: use the three-step factor twice.

The number inside still says "twice." The outer angle brackets now apply
that instruction to the second unique factor.

The position can be any complete expression giving a whole count beyond
`○`. A backward count, `○`, or part of a count cannot name a
factor position, even when the angle brackets are empty.

Several numbers with lower attachments can name distant unique factors in one curly list.
If their angle-bracket positions overlap, join the instructions at the
shared places:

```text
{⟨◠⟩⌊⟨◠⟩⌋ ⟨◠⟩⌊⟨◠⟩⌋} = ⟨⟨◠⟩○⟩
```

Nine steps: each shifted number gives three steps; combine the two changes.

The benefit grows when the chosen factor is far along the list. Suppose you need only the sixteenth factor. The dense spelling has fifteen skipped places; the attachment gives the position once:

```text
⟨◠○○○○○○○○○○○○○○○⟩ = ⟨◠⟩⌊⟨⟨⟨◠⟩⟩⟩⌋
```

Both use the same factor once. The lower corners contain the sixteen-step count. You can read which place is selected without counting fifteen empty places.

#### Ask for a unique factor's position

Put `*` before a unique factor to ask where it sits in the list. Read
the mark as "the position of":

```text
*⟨◠⟩ = ◠
```

The two-step factor has the first position.

```text
*⟨◠○⟩ = ⟨◠⟩
```

The three-step factor has position two.

```text
*⟨◠○○⟩ = ⟨◠○⟩
```

The value after `*` must be a unique factor. The answer can be used
between lower corners:

```text
⟨◠⟩⌊*⟨◠○○⟩⌋ = ⟨◠○○⟩
```

Five steps: find the five-step factor’s place, then use it once.

Lower corners on the number being looked up belong to that number:

```text
*⟨◠⟩⌊⟨◠○⟩⌋ = ⟨◠○⟩
```

The shifted number is five steps; its factor position is three.

Use square brackets to ask about the answer to a longer expression:

```text
*[⟨◠⟩ ◠] = ⟨◠⟩
```

The lookup uses the value. Different spellings of the same unique factor
give the same position.

### Choose how much of a change to make

What change, applied twice, gives a doubling?

Suppose a change should make each step nine times as long, and we want
to reach that size in two equal stages. Making each step three times
as long, then doing the same again, reaches the goal:

```text
{⟨◠○⟩ ⟨◠○⟩} = ⟨⟨◠⟩○⟩
```

Nine steps: three groups of three.

Upper corners let us ask for one of those equal stages. Put the full
change before the corners and a half inside:

```text
⟨⟨◠⟩○⟩⌈⟨◡⟩⌉ = ⟨◠○⟩
```

The change that makes a step nine times as long splits into two equal stages. Each stage makes it three times as long.

Each stage makes the current steps three times as long. Combining two
of these stages in curly brackets recovers the full change.

The expression before the corners is called the *base*. The instruction
inside is its *exponent*. The complete expression is called a *power*.
An exponent can choose a whole change, part of a change, or a change that undoes it.
Later, exponents with directions will also let us choose turns.

The base must be forward of `○` on our original path. Our first
examples also use exponents on that path. A base at `○` or behind
it has no upper-corner rule here.

#### Use whole or backward stages

With a whole forward count as the exponent, we can find the answer
by writing that many copies of the base in curly brackets:

```text
⟨◠○⟩⌈⟨◠⟩⌉ = {⟨◠○⟩ ⟨◠○⟩}
```

Nine steps: make a step three times as long, then do it again.

This gives the repetition shortcut for whole forward exponents.
Use `◠` for the full change, `○` for no change, and
`◡` to undo the full change:

```text
⟨◠○⟩⌈◠⌉ = ⟨◠○⟩
```

Three steps: apply the three-step change once.

```text
⟨◠○⟩⌈○⌉ = ◠
```

One step: apply none of the change.

```text
⟨◠○⟩⌈◡⌉ = {|⟨◠○⟩}
```

A third of a step: undo making a step three times as long.

A longer backward count undoes that many stages. A backward share
undoes the corresponding part of the change.

#### Find a change that does part of the work

What forward journey, combined with itself in curly brackets, gives
the two-step count?

It must be longer than `◠` and shorter than `⟨◠⟩`. We
can name it by putting a half between upper corners:

```text
⟨◠⟩⌈⟨◡⟩⌉
```

Using that change twice does the work of using `⟨◠⟩` once:

```text
{⟨◠⟩⌈⟨◡⟩⌉ ⟨◠⟩⌈⟨◡⟩⌉} = ⟨◠⟩
```

Two steps: the two equal stages together complete a doubling.

This value is called the *square root* of `⟨◠⟩`. "Square"
here means combining a value with itself. A third in the upper corners
asks for a change whose three equal uses recover the base; this is
a *cube root*. Other equal shares work in the same way.

For several shares, repeat that root change the requested number of times.
For example, three half shares mean using the square root three times in
curly brackets. A backward share undoes the corresponding forward change.

Some of these lengths cannot be written as a share of whole counts.
A root expression still names the length exactly.

An entry between angle brackets can contain the same instruction:

```text
⟨⟨◡⟩⟩ = ⟨◠⟩⌈⟨◡⟩⌉
```

The inner number means a half. The outer angle brackets apply that half to the
first unique factor. The mark `◡` keeps its meaning at every level.

<details>
<summary>Explore further: successive attachments</summary>

#### Keep clear which value the upper corners use

Upper corners apply to the entire preceding expression, including any
lower corners:

```text
⟨◠⟩⌊⟨◠⟩⌋⌈⟨◠⟩⌉ = {⟨◠○⟩ ⟨◠○⟩}
```

Nine steps: choose the three-step factor, then apply it twice.

Upper attachments can follow one another. Work from left to right, using
each result as the next base:

```text
⟨◠⟩⌈⟨◠○⟩⌉⌈⟨◠⟩⌉ = [⟨◠⟩⌈⟨◠○⟩⌉]⌈⟨◠⟩⌉
```

Sixty-four steps: three doublings make eight, then use that eight-step change twice.

Here the first power gives the eight-step count. The next squares it.
Putting a power *inside* the first pair of corners would instead change
the exponent. Those are different instructions.

A square bracket with one entry has that entry's value, so the extra
square brackets on the right are optional.
The corner shapes already mark their contents; no underscore or caret
belongs in the expression.

</details>

#### Read a power, then choose its stages

Keep the base at the two-step count. Change only the instruction between upper corners.

```text
⟨◠⟩⌈⟨◠⟩⌉
```

<details>
<summary>Help me read this</summary>

The base is the complete number ⟨◠⟩ before the corners. The complete number ⟨◠⟩ inside them asks for two stages. Use the base as a change at each stage. The angle brackets inside the corners still spell a count.

</details>

Keep the same doubling change for every row.

| Instruction in the corners | Stages | Destination |
| --- | --- | --- |
| `○` | None | One step |
| `◠` | One | Two steps |
| `⟨◠⟩` | Two | Fill this destination |

Read and complete: where do two stages of the doubling change finish?

<details>
<summary>Check the missing step</summary>

At four steps. Double the starting step, then double that result. If you got two, you applied the doubling only once. The two-step count inside the corners asks for two stages.

</details>

Write your own: ask for one of two equal stages of that same doubling. Keep the base and replace only the instruction in the corners.

<details>
<summary>Check your expression</summary>

Put the half-step count inside the upper corners. The half tells how much of the doubling change to make; it does not say the resulting journey is a half step.

```text
⟨◠⟩⌈⟨◡⟩⌉ = ⟨⟨◡⟩⟩
```

</details>

Recall joining: what does `[⟨◡⟩ ⟨◡⟩]` give?

<details>
<summary>Check the earlier rule</summary>

One whole step. If you got a quarter, you applied the half-size change twice. These square brackets join the two half-step journeys.

```text
[⟨◡⟩ ⟨◡⟩] = ◠
```

</details>

#### Pause and practice: read the attachments

Marks to use: `⌊…⌋` after a number chooses a factor place; `*` asks for its position; `⌈…⌉` chooses how much of a change to make.

Read `⟨◠⟩⌊⟨◠⟩⌋`. Which factor does it use? Write it without lower corners.

<details>
<summary>Check your answer</summary>

The attachment says position two. That belongs to the three-step factor, used once. If you chose the two-step factor, you read the attachment as the factor itself. Lower corners here give its position in the factor list.

```text
⟨◠⟩⌊⟨◠⟩⌋ = ⟨◠○⟩
```

</details>

What does `*⟨◠○○⟩` ask? Is the answer five or three?

<details>
<summary>Check your answer</summary>

It asks for the position of the five-step factor. Two, three, and five are the first three unique factors, so its position is three.

```text
*⟨◠○○⟩ = ⟨◠○⟩
```

</details>

Read `⟨◠⟩⌈⟨◡⟩⌉`. Is it a half step? How can you check its meaning?

<details>
<summary>Check your answer</summary>

It asks for one of two equal stages of a doubling. Its amount is between one and two steps. Applying the change twice must give two steps.

```text
{⟨◠⟩⌈⟨◡⟩⌉ ⟨◠⟩⌈⟨◡⟩⌉} = ⟨◠⟩
```

Curly brackets apply the half-size change twice, giving a quarter. Square brackets join two half-step journeys, giving a whole step. Read the outside brackets first:

```text
{⟨◡⟩ ⟨◡⟩} = ⟨[◡ ◡]⟩
```

```text
[⟨◡⟩ ⟨◡⟩] = ◠
```

</details>

#### Pause and practice: calculate with factor places

**Marks so far — reminders for this checkpoint**

- `{…}`: combine changes by joining instructions at matching factor places.
- `[…]`: join journeys, keeping any shared group.
- `⟨◡⟩`: a half step; two of these journeys join to `◠`.

Try each question before opening its answer. Write or sketch your
reasoning first.

Combine `⟨◠⟩` with itself. What stays in the first factor place?

<details>
<summary>Check your answer</summary>

Join its two instructions. The new count stays in that same place.

```text
{⟨◠⟩ ⟨◠⟩} = ⟨⟨◠⟩⟩
```

Four steps: two groups of two.

</details>

Join `⟨◠⟩` and `⟨◠○⟩`. Must the answer use only their factor places?

<details>
<summary>Check your answer</summary>

Two steps joined with three make five. A new unique factor can appear.

```text
[⟨◠⟩ ⟨◠○⟩] = ⟨◠○○⟩
```

Five steps: join two and three.

</details>

Join two half steps. Try writing the answer before calculating it in the playground.

<details>
<summary>Check your answer</summary>

Two halves recover a whole step.

```text
[⟨◡⟩ ⟨◡⟩] = ◠
```

</details>

### Can this count make equal groups?

This is optional practice with factor places and powers. Stay with forward
whole counts. At every place, the instruction is a whole count or `○`.
Try the [factor comparison experiment](index.html#factor-comparison).

#### See whether a group fits

A three-step group fits into twelve steps four times, with nothing left over.
A five-step group leaves two steps after two groups. When whole groups use
up the count exactly, we say the group count *divides* the larger count.

Compare their factor instructions. Every instruction needed by the group
must be available in the larger count. A missing use at even one place
prevents a whole fit.

```text
{⟨◠⟨◠⟩⟩ | ⟨◠○⟩} = ⟨⟨◠⟩⟩
```

Twelve shared into three-step groups gives four groups. Undo the one use
of three; the two uses of two remain.

#### Keep the smaller; keep the larger

Begin with twelve and eighteen. Read their instructions from right to left:

| Count | At three | At two |
|---|---|---|
| Twelve: `⟨◠⟨◠⟩⟩` | Once | Twice |
| Eighteen: `⟨⟨◠⟩◠⟩` | Twice | Once |
| Keep the smaller | Once | Once |
| Keep the larger | Twice | Twice |

To find the largest whole group that fits into both counts, keep the
smaller instruction at every place. Here it makes six, `⟨◠◠⟩`.
This is the *greatest common factor*.

Six fits twice into twelve and three times into eighteen. That also gives
the shared-group step for joining them: keep the six-step group and join
the two group counts.

```text
[⟨◠⟨◠⟩⟩ ⟨⟨◠⟩◠⟩] = {⟨◠◠⟩ [⟨◠⟩ ⟨◠○⟩]}
```

Thirty steps: five groups of six.

To find the smallest forward whole count that both inputs fit into, keep
the larger instruction at every place. Here it makes thirty-six,
`⟨⟨◠⟩⟨◠⟩⟩`. This is the *least common multiple*.
Three groups of twelve or two groups of eighteen each fill it:

```text
{⟨◠⟨◠⟩⟩ ⟨◠○⟩} = {⟨⟨◠⟩◠⟩ ⟨◠⟩}
```

These rules apply to forward whole counts. We are comparing how many uses
each count has at every factor place.

#### Share every instruction equally

A whole count made by combining two identical whole counts is a *perfect
square*. Three identical whole counts make a *perfect cube*. The identical
count is its *root*.

| Count | At three | At two | Can both instructions split into two whole parts? |
|---|---|---|---|
| Seventy-two: `⟨⟨◠⟩⟨◠○⟩⟩` | Twice | Three times | No: the three uses of two need a share |
| One hundred forty-four: `⟨⟨◠⟩⟨⟨◠⟩⟩⟩` | Twice | Four times | Yes: once at three and twice at two |

The square root of one hundred forty-four is twelve:

```text
⟨⟨◠⟩⟨⟨◠⟩⟩⟩⌈⟨◡⟩⌉ = ⟨◠⟨◠⟩⟩
```

A root still exists when an instruction needs a share. It simply is not
a whole count. The square root of seventy-two needs a one-and-a-half
instruction at two:

```text
⟨⟨◠⟩⟨◠○⟩⟩⌈⟨◡⟩⌉ = ⟨◠⟨◠◡⟩⟩
```

For any chosen whole count of identical changes, share every instruction
by that count. For these forward whole inputs, the root is a whole count
exactly when every resulting instruction is a whole count. Skipped places
split into `○` at every stage.

#### Pause and practice: compare the places

Six uses two and three once each. Ten uses two and five once each.
What is their largest shared whole group?

<details>
<summary>Check your answer</summary>

Two. Keep one use of two; at three and five, one input has no use, so keep none.

</details>

Twenty-seven uses three three times. Is it a perfect square? A perfect cube?

<details>
<summary>Check your answer</summary>

It is not a perfect square: three uses cannot split into two whole parts.
It is a perfect cube: three equal parts each use three once.

```text
⟨⟨◠○⟩○⟩⌈⟨◡○⟩⌉ = ⟨◠○⟩
```

</details>

### A good place to pause

**You can now read UFN numbers and understand their arithmetic.** You can
join and undo journeys, change and share their size, read factor places,
and take equal stages of a change. You also know why joining can require
finding new factors.

Try the checkpoints with examples of your own. Explain each bracket’s job.
This is a complete place to stop and use the [playground](index.html#playground).

For forward amounts built from whole factor instructions or equal shares,
each factor has one settled instruction. A broader recipe may have no factor
spelling. You can still write it and keep its meaning. The optional arithmetic introduction above
states the exact boundary; [Preferred spellings](#preferred-spellings)
is the reference for it.

## Act II: Build with the language

You have learned the number representation. These chapters explore the
language around it. Choose one question and follow its reminders about
what to practice first. You do not need to read every exploration.

Some chapters use factor instructions directly. Others add rules for
directions, lists, or how endless recipes settle. Those rules add mathematical
structure; they do not follow from factorization alone.

- **Use factor instructions:** [musical changes](#hear-the-factor-instructions).
  Start directly from the core course; factors and shares are enough.
- **Give amounts directions:** [a second path](#give-a-journey-another-direction),
  then [two more paths](#keep-track-of-two-more-directions), or
  [exponents](#ask-which-exponent-reaches-a-target) and
  [turns](#let-an-exponent-choose-a-turn).
- **Build reusable recipes:** start with
  [counter names](#give-different-counters-different-names), then definitions
  and retained lists. These lead to digit forms, tables, and selections.
  Fourier patterns also use directions and turns.
- **Follow endless processes:** start with [endless lists](#let-a-list-keep-going)
  and their remaining gaps. Before integrals or derivatives, practice explaining
  why a gap gets smaller. Work through the small tables before opening the
  general arguments.

The [browser exploration map](index.html#extensions) links each chapter.
The reference at the end is for looking things up.

### Give a journey another direction

How can we keep a forward amount and a sideways amount together?

We will keep amounts on different paths separate, then read or combine
them using the brackets we already know.

Draw a second path through the starting place, at right angles to the
first. A step along the first path and a step along the second now
lead to different places. We need to say which path a journey uses.

A labeled straight path is called an *axis*. A flat surface containing
both paths is their *plane*.

Write `@○` for the original path and `@◠` for the new path:

```text
◠@○
◠@◠
```

The *amount* before `@` tells how far to go along the chosen path,
and whether to go forward or backward. The label after `@` chooses
the path. A backward amount goes the opposite way along that same path.

These labels name directions; their values do not measure an angle.
`@○` names a direction just as `@◠` does. Leaving off the label
is a short way to write `@○`:

```text
◠ = ◠@○
[◠@◠ ◡@◠] = ○
```

#### Take steps along both paths

Join labeled journeys in square brackets:

```text
[⟨◠⟩@○ ◠@◠]
```

Take two steps along the original path, then one along the new path.
The destination lies away from both drawn paths. Each contribution
along a labeled path is called a *component*. The amount before its
`@` label is called its *coefficient*.

To join two such journeys, join their amounts at each matching label.
A value can have a contribution in several directions at once.

The values using these two directions are conventionally called
*complex numbers*. That name describes the whole system of two
components; the `@` labels still tell us exactly where each part goes.

#### Read an amount along a path

Use `#` to read how much of a journey lies along one labeled path.
The answer keeps the amount's forward or backward direction. It is written on the
original path, ready to use in another calculation.

```text
[⟨◠⟩@○ ⟨◠○⟩@◠]#○ = ⟨◠⟩
```

Read two forward steps along the original path.

```text
[⟨◠⟩@○ ⟨◠○⟩@◠]#◠ = ⟨◠○⟩
```

Read three forward steps along the sideways path.

```text
◡@◠#◠ = ◡
◠@○#◠ = ○
```

`@` puts an amount along a path. `#` reads the amount along a path.
Reading a path with no contribution gives `○`. Reading one path does
not retain the other contributions, so one reading cannot recover a whole
journey. Read each path and put each amount back to rebuild it.

Attachments apply from left to right. To move the sideways amount onto
the original path, write:

```text
[⟨◠⟩@○ ⟨◠○⟩@◠]#◠@○ = ⟨◠○⟩@○
```

Read three sideways steps and put that amount along the original path.

For now, the label after `#` chooses either of our two paths: `○`
or `◠`, just as it does after `@`.

#### Enlarge a journey or turn it

Combining a journey with `⟨◠⟩@○` doubles its length while
keeping its direction:

```text
{◠@◠ ⟨◠⟩@○} = [◠@◠ ◠@◠]
```

Here we can still find the answer by joining copies. This works for
any journey when the other entry is a whole forward count on `@○`.

Divide a circle into four equal parts. Moving around one part is a
*quarter turn*. Now give `◠@◠` a new job in curly brackets: turn
a journey a quarter turn from `@○` toward `@◠`. Applying it again
continues the same turn:

```text
{◠@○ ◠@◠} = ◠@◠
{◠@◠ ◠@◠} = ◡@○
{◠@◠ ◠@◠ ◠@◠ ◠@◠} = ◠@○
```

After two quarter turns we point backward along the original path.
After four we face the original way again.

Curly brackets now describe changes of size and direction together.
Two entries with matching `@` labels can turn the answer onto a
different path, as the second example shows.

#### One value can have two jobs

On its own, `◠@◠` describes a sideways step. In a curly list it
supplies the quarter-turn change we have just chosen. The brackets
tell you which job to use.

Compare the same pair of values in two contexts:

```text
[◠@○ ◠@◠]
{◠@○ ◠@◠}
```

The square list walks forward, then sideways. Its answer has both
components. The curly list turns the first journey a quarter turn;
its answer is `◠@◠`. Sketch both destinations before trying them.

#### Measure size separately from direction

Picture an arrow from the starting place to a destination. Its length
is the journey's *size*: how far its finish is from its start. Size does
not say which way the arrow points. A backward two-step amount has size
two, just as a forward two-step amount does.

Turning the arrow can reduce its amount along one path and increase its
amount along the other, while keeping its total size. Walking out and
back has size `○`, even though you took steps.

To find total size, combine each coefficient with itself in curly
brackets, join those results, and take their forward square root.
When every contribution is `○`, the total size is `○`.

Draw three steps along the original path, then four along the sideways path. The journey is `[⟨◠○⟩@○ ⟨⟨◠⟩⟩@◠]`. Draw the straight arrow from the start to its destination. Its length is the size we want.

Fill in the size rule one operation at a time.

| What to do | UFN | Reading |
| --- | --- | --- |
| Combine the original-path amount with itself | `{⟨◠○⟩ ⟨◠○⟩} = ⟨⟨◠⟩○⟩` | Three groups of three: nine. |
| Combine the sideways amount with itself | `{⟨⟨◠⟩⟩ ⟨⟨◠⟩⟩} = ⟨⟨⟨◠⟩⟩⟩` | Four groups of four: sixteen. |
| Join those results | `[⟨⟨◠⟩○⟩ ⟨⟨⟨◠⟩⟩⟩] = ⟨⟨◠⟩○○⟩` | Nine and sixteen: twenty-five. |
| Find the forward square root | `⟨⟨◠⟩○○⟩⌈⟨◡⟩⌉ = ⟨◠○○⟩` | Five: five groups of five give twenty-five. |

The straight arrow is five steps long. The two legs of the walk cover seven steps. Measure the arrow using the same step length to check the drawing. This example illustrates the size rule; it does not prove the rule for every drawing.

In curly brackets, the sizes combine just as forward amounts do on
the original path. A change with size `◠` therefore keeps total size,
even when it turns the result. Size is always `○` or a forward amount;
a component read with `#` can be backward.

#### Pause and practice: amounts and directions

**Marks so far — reminders for this checkpoint**

- `@`: put an amount along a named path. Example: `⟨◠⟩@◠`.
- `#`: read the amount along a named path. Example: `⟨◠⟩@◠#◠ = ⟨◠⟩`.
- `[…] with directions`: join journeys along the paths. Example: `[◠@○ ◠@◠]`.
- `{…} with directions`: apply changes of size and direction. Example: `{◠@○ ◠@◠} = ◠@◠`.

Try each question before opening its answer. Write or sketch your
reasoning first.

What does `[⟨◠⟩@○ ◡@◠]#◠` give?

<details>
<summary>Check your answer</summary>

Read the backward amount on the sideways path. The reading is written on the original path.

```text
[⟨◠⟩@○ ◡@◠]#◠ = ◡
```

</details>

Begin at `◠@○`. Combine with `◠@◠` twice. Where do you finish?

<details>
<summary>Check your answer</summary>

Two quarter turns make a half turn, leaving the backward step on the original path.

```text
{◠@○ ◠@◠ ◠@◠} = ◡@○
```

</details>

Write a journey with two forward steps along `@○` and one backward step along `@◠`. How could you check both amounts?

<details>
<summary>Check your answer</summary>

One spelling is `[⟨◠⟩@○ ◡@◠]`. Read it with `#○` to get `⟨◠⟩`, and with `#◠` to get `◡`.

</details>

If the sideways four steps point backward instead, does this journey’s total size change?

<details>
<summary>Check your answer</summary>

No. The sideways amount becomes backward four. Combined with itself, it still gives forward sixteen. The straight arrow still has size five; it points to the other side of the original path.

</details>

### Hear the factor instructions

Try this after factor spellings and sharing feel familiar. No music vocabulary
is needed. The [browser experiment](index.html#music) adds sound and aligned
factor tables; the written examples work without sound.

#### Change how fast a sound repeats

A steady musical sound comes from a repeating vibration. Its *frequency*
tells how often that vibration repeats. Faster repetition gives a higher pitch.
Keep one sound as your starting point.

`⟨◠⟩` makes another sound repeat twice as fast. Musicians call this distance
an *octave*. `⟨◠◡⟩` makes three repetitions in the time the starting sound
makes two. In Western music theory, this distance is called a *fifth*.

The name comes from counting positions in a *scale*: a chosen sequence of
notes from lower to higher pitch. In the familiar do–re–mi scale, count from
do to sol: do, re, mi, fa, sol. That is five positions, including both ends.
The three-halves ratio gives the exact tuning of this distance.

The number changes repetition rate. It does not change loudness or duration.
These changes are positive amounts on the original path; factor places do
not stand for `@` directions.

| Change | Spelling | Instruction at five | At three | At two |
|---|---|---|---|---|
| Three halves | `⟨◠◡⟩` | Leave alone | Use once | Undo once |
| Five quarters | `⟨◠○[◡ ◡]⟩` | Use once | Leave alone | Undo twice |
| Six fifths | `⟨◡◠◠⟩` | Undo once | Use once | Use once |

Read the places from the right. Reversing the entries in `⟨◠◡⟩` gives
`⟨◡◠⟩`: two thirds times as fast, a lower sound.

#### Combine two changes

Make the starting rate three halves times as fast. Then make that new rate five
quarters times as fast. Curly brackets combine the changes:

```text
{⟨◠◡⟩ ⟨◠○[◡ ◡]⟩} = ⟨◠◠[|⟨◠○⟩]⟩
```

At five and three, use once. At two, undo once and then twice: undo three
times altogether. The rate is fifteen eighths of the starting rate.
Building musical distances from whole-number shares is called *just intonation*.

To choose a rate within one octave, keep it at least as fast as the starting
rate but slower than twice that rate. Bring a higher sound down by undoing
doublings. Only the instruction at two changes. Keep the original result
as well: bringing it down changes its actual pitch.

Musicians often group octave-related sounds into the same *pitch class*.
For this grouping, differences at the two-place are set aside. Choosing a
representative within one octave adjusts that place; clearing it does not
always put the sound in this range.

#### Reach almost the same sound by two routes

| Action | Repetition rate compared with the starting sound |
|---|---|
| Apply one three-halves change | Three halves |
| Apply four such changes | Eighty-one sixteenths |
| Bring that result down two octaves | Eighty-one sixty-fourths |
| Take the other route: one five-quarters change | Five quarters, or eighty sixty-fourths |

The routes nearly agree. To compare their rates, undo one from the other
with a curly bar:

```text
{{⟨◠◡⟩⌈⟨⟨◠⟩⟩⌉ | ⟨⟨◠⟩⟩} | ⟨◠○[◡ ◡]⟩}
= ⟨◡⟨⟨◠⟩⟩[|⟨⟨◠⟩⟩]⟩
```

The remaining change is eighty-one eightieths, slightly faster than unchanged.
It is called the *syntonic comma*. Four uses of three remain; undo four uses
of two and one use of five. The sounds are close, and the instructions say
exactly where they differ.

When nearby tones play together, their waves repeatedly line up and separate.
You may hear a slow pulse, called *beating*. The browser plays approximate
frequencies derived from exact results. Sound does not feed back into reduction.

#### Pause and practice: read a sound change

Combine a three-halves change with a four-thirds change. What instructions remain?

<details>
<summary>Check your answer</summary>

The uses of three cancel. At two, undo once and use twice: one use remains.
The sound repeats twice as fast.

```text
{⟨◠◡⟩ ⟨◡⟨◠⟩⟩} = ⟨◠⟩
```

</details>

If you bring a sound down an octave, do the instructions at three and five change?

<details>
<summary>Check your answer</summary>

No. Undo one use at two. Leave all other instructions as they were.

</details>

<details>
<summary>Another question: divide a doubling into equal changes</summary>

Suppose twelve identical changes together double the repetition rate.
Each change uses one twelfth of the instruction at two:

```text
⟨{◠|⟨◠⟨◠⟩⟩}⟩⌈⟨◠⟨◠⟩⟩⌉ = ⟨◠⟩
```

This is the equal subdivision used by twelve-tone equal temperament.
Its frequency change is a root rather than a whole-number share. The same
factor rule still works.

</details>

Music references in conventional notation:
[How musical distances get their names](https://viva.pressbooks.pub/openmusictheory/chapter/intervals/),
[Just intonation and musical ratios](https://casfaculty.case.edu/ross-duffin/just-intonation-in-renaissance-theory-practice/theoretical-background/),
[the two routes and the syntonic comma](https://www.mtosmt.org/issues/mto.98.4.4/mto.98.4.4.scholtz_notes.html).

### Keep track of two more directions

Add labels `@⟨◠⟩` and `@⟨◠○⟩` for two more paths, each at right
angles to the paths already introduced. Neither new direction can be
reached by joining journeys along the earlier paths. Such directions are
*independent*.

Together with `@○` and `@◠`, these give four components. All four
meet at the same starting place. A flat drawing cannot show every independent
direction, but the labels let us keep track of them. The system with the
following combination rules is called *quaternions*.

One forward step on any of the other three paths, combined with itself,
gives `◡@○`.
The two-path picture does not determine how these new directions combine.
We choose the following rules as part of the language. Use them as a
lookup table first; you do not need to picture four paths at once.

For different labels, choose the following rules:

```text
{◠@◠ ◠@⟨◠⟩} = ◠@⟨◠○⟩
{◠@⟨◠⟩ ◠@⟨◠○⟩} = ◠@◠
{◠@⟨◠○⟩ ◠@◠} = ◠@⟨◠⟩
```

Swapping either pair makes the answer point backward:

```text
{◠@⟨◠⟩ ◠@◠} = ◡@⟨◠○⟩
```

The same size rule still holds. Order matters for the direction.

To combine values that have several components, combine every component
from the first with every component from the second, then join all
the answers. This extends the rule we learned for scaling joined journeys.

#### Undo changes in the written order

Curly lists apply their entries from left to right. Curly ranges do
the same, following the counter's visits.

With a bar, first combine each side in its written order. Then undo
the entire change after the bar. The answer must recover the first
side when followed, on the right, by that second side:

```text
{{◠@◠ | ◠@⟨◠⟩} ◠@⟨◠⟩} = ◠@◠
```

The restoring change is still called a reciprocal, or *inverse*.
In `{A B | C D}`, the letters stand for complete expressions:
combine `A` with `B`, then combine that result on the right with
`{|{C D}}`. We undo `{C D}` as a whole. Its value must be
different from `○`.

#### Pause and practice: use the direction rules

**Marks so far:** `@` chooses a path; curly brackets keep their written order. Consult the three combination rules above.

In `⟨◠○⟩@⟨◠⟩`, which part says three steps? Does the label make it six steps?

<details>
<summary>Check your answer</summary>

The amount before @ is three. The label after @ chooses the third path in our list of four; it does not multiply by two. Reading that path returns three.

```text
⟨◠○⟩@⟨◠⟩#⟨◠⟩ = ⟨◠○⟩
```

</details>

Combine `[◠@○ ◠@◠]` with `◠@⟨◠⟩`. What does each part contribute?

<details>
<summary>Check your answer</summary>

The original-path step contributes ◠@⟨◠⟩. The sideways step uses the first combination rule and contributes ◠@⟨◠○⟩. Join them.

```text
{[◠@○ ◠@◠] ◠@⟨◠⟩} = [◠@⟨◠⟩ ◠@⟨◠○⟩]
```

</details>

### Give different counters different names

How can an inner recipe use two changing counts?

A lower-corner attachment after an angle-bracket number chooses a factor place. Here it follows a box and gives that counter a fixed name. Check what the corners follow before reading their contents.

First keep the outside count fixed at one. The inner counter visits one, two, and three, combining each with that fixed count:

```text
[□⌊⟨◠⟩⌋ : ◠ … ⟨◠○⟩ : {◠ □⌊⟨◠⟩⌋}] = ⟨◠◠⟩
```

That gives six steps. Now let an outer counter supply the first curly entry. It will supply one on its first visit and two on its second. Keep the inner counter’s name, bounds, and visits as they were.

An inner recipe sometimes needs both its own changing count and the
count being visited outside it. Give the counters different names:

```text
[□ : ◠ … ⟨◠⟩ :
  [□⌊⟨◠⟩⌋ : ◠ … ⟨◠○⟩ :
    {□ □⌊⟨◠⟩⌋}
  ]
]
```

For each outer visit, the inner counter starts again. The outer `□`
visits `◠` and `⟨◠⟩`. At each of those visits, the inner
`□⌊⟨◠⟩⌋` visits `◠`, `⟨◠⟩`, and `⟨◠○⟩`.
Its recipe uses both current counts.

Restart the inner visits for each outer count.

| Outer count | Inner counts, restarting here | Entries made | Their joined amount |
| --- | --- | --- | --- |
| `◠` — one | One, two, three | `◠`, `⟨◠⟩`, `⟨◠○⟩` | `⟨◠◠⟩` — six |
| `⟨◠⟩` — two | One, two, three | `⟨◠⟩`, `⟨⟨◠⟩⟩`, `⟨◠◠⟩` | `⟨◠⟨◠⟩⟩` — twelve |

```text
[□ : ◠ … ⟨◠⟩ : [□⌊⟨◠⟩⌋ : ◠ … ⟨◠○⟩ : {□ □⌊⟨◠⟩⌋}]] = ⟨⟨◠⟩◠⟩
```

Six steps joined with twelve give eighteen. The tag on the inner box remains the same through all six visits.

The lower corners on a box are a fixed name tag. The tag stays the
same as its counter changes. `□`, `□⌊○⌋`, and `□⌊◠⌋` are distinct names.

This guide uses boxes with familiar count spellings as tags, so the names
are easy to tell apart. You can choose other names. The name supplies no
arithmetic; the range supplies its value. For example:

```text
[✦ : ◠ … ⟨◠⟩ : ✦] = ⟨◠○⟩
```

The star-shaped name visits one and two, just as a box could. A name may
also be a word. Keep names separate with spaces, and leave the language's
brackets and operation marks available for their usual jobs.

A tag is fixed writing and is never evaluated. Different spellings give
different names, even when those spellings would describe the same
number elsewhere. For example, `□⌊[◠ ◠]⌋` and `□⌊⟨◠⟩⌋` are different
names. Spaces within a tag are ignored. A bare name and a tagged name are
distinct; no tag is supplied automatically.

#### Read a name where it belongs

Read a range's first and last counts using the surrounding names.
Then give the new counter its value inside the recipe.

If an inner range reuses an outer name, that name refers to the inner
counter inside its recipe. After the inner range ends, the outer
counter still has its own value. Give them different names when the
recipe needs both.

This region in which a name supplies a value is called its *scope*.
A name with no surrounding range to supply its value is undefined:
there is no value to read.

#### Join results made by another counter

Combining every forward whole count through an endpoint gives its
*factorial*. Here the outside range chooses the endpoint and the inside
range makes that product:

```text
[□ : ○ … ⟨◠○⟩ : {□⌊⟨◠⟩⌋ : ◠ … □ : □⌊⟨◠⟩⌋}]
    = [◠ ◠ ⟨◠⟩ ⟨◠◠⟩]
```

The first inner range has no visits, so it contributes `◠`.

The empty inner product is one of the four answers, not a missing row.

| Outer count | Inner visits | Inner curly list | Answer |
| --- | --- | --- | --- |
| `○` — none | No visits | `{}` | `◠` — one |
| `◠` — one | One | `{◠}` | `◠` — one |
| `⟨◠⟩` — two | One, two | `{◠ ⟨◠⟩}` | `⟨◠⟩` — two |
| `⟨◠○⟩` — three | One, two, three | `{◠ ⟨◠⟩ ⟨◠○⟩}` | `⟨◠◠⟩` — six |

```text
[◠ ◠ ⟨◠⟩ ⟨◠◠⟩] = ⟨◠○◠⟩
```

One, one, two, and six join to ten steps.

#### Pause and practice: keep the names apart

**Marks so far:** Lower corners after a number select a factor place; after a box they give a fixed name. A square range joins; a curly range combines.

Compare `⟨◠⟩⌊⟨◠⟩⌋` and `□⌊⟨◠⟩⌋`. Does the second always have the same three-step value as the first?

<details>
<summary>Check your answer</summary>

No. The first is the three-step factor used once. The second is a counter’s name. Its current value is supplied by its own range; its tag stays fixed while the value changes.

</details>

When the outer count is ○ in the factorial table, does the inner range contribute ○ or ◠? What do all four rows join to?

<details>
<summary>Check your answer</summary>

There are no inner visits, so the empty curly list contributes ◠. The four answers are one, one, two, and six.

```text
[◠ ◠ ⟨◠⟩ ⟨◠◠⟩] = ⟨◠○◠⟩
```

</details>

### Define a shorthand

How can we give a useful recipe a shorter spelling?

Sometimes a useful recipe is long enough to deserve a shorter written form.
Begin a definition with `≔`, then put its contents in parentheses.
Put the pattern before a colon and its meaning after it:

```text
≔(pattern : meaning)
```

Read `≔` as “define.” The words above label the two parts; they are not
names to use in an expression. For example:

```text
≔(◇ : [◠ ◠ ◠])
{◇ ⟨◠⟩}
```

Here `◇` means a three-step journey. The expression below the
declaration doubles that journey.

The `≔` marks a declaration; the parentheses show where it ends.
A declaration gives a replacement rule. The expression below it is the
part that describes a value.

We will use parentheses without `≔` to keep a list of entries, rather
than join them. Try the definition above first; the next chapter teaches
that separate job.

After replacing a shorthand, read the resulting expression by the ordinary
rules. That replacement is called *expansion*. The shorthand has exactly
the meaning of its expansion.

#### Let a form take one supplied value

Suppose we often want to combine a supplied number with itself. We can
name that recipe without fixing the number in advance:

Build the meaning first, then name it.

| Build the recipe | What this step does |
| --- | --- |
| `{⟨◠○⟩ ⟨◠○⟩}` | Combine one known number with itself. |
| `{□⌊◠⌋ □⌊◠⌋}` | Use the supplied piece in both places. |
| `≔(⟦□⌊◠⌋⟧ : {□⌊◠⌋ □⌊◠⌋})` | Give that recipe a written form. |

The middle row is a recipe template. The declaration supplies its box’s value when you use the form.

```text
≔(⟦□⌊◠⌋⟧ : {□⌊◠⌋ □⌊◠⌋})
⟦⟨◠○⟩⟧
```

The tagged box names the piece supplied between the new marks. Such
a supplied piece is called an *argument*. Put the same piece wherever
that box appears in the meaning. Here the three-step count goes in
both places:

```text
{⟨◠○⟩ ⟨◠○⟩} = ⟨⟨◠⟩○⟩
```

Try a two-step input instead. First write its ordinary curly recipe,
then work out its answer. The definition is the same; only the supplied
piece changes.

<details>
<summary>Explore further: other meanings for a written form</summary>

#### Give a written form its meaning

The marks `⟦` and `⟧` can be part of a definition's pattern, like `◇`.
The declaration decides what the whole form means.

The later digit definition is one possible use of those marks. Another
document can use them for a different recipe. A form using them needs its
matching declaration; the brackets alone supply no numerical rule.

For example, a document could give the empty pair this meaning:

```text
≔(⟦⟧ : ⟨◠○○⟩)
⟦⟧
```

Here the final form gives the five-step count. There are no digits or
sequence arguments in this definition.

For now, use a fresh starting symbol and balanced marks, as in these
examples. Each argument has its own tagged box. Counters introduced
inside a definition keep their own names; the writer's supplied names
keep their meanings. The [reference rules](#keep-a-definitions-names-separate)
explain how replacement preserves them.

In the playground, put definitions first and one expression below them.
The definitions apply within that input. Try the short examples above
before using a form that takes a list of entries.

</details>

#### Pause and practice: expand a definition

**Marks so far:** `≔(… : …)` declares a written meaning. A tagged box in its pattern captures what you supply.

With `≔(◇ : [◠ ◠ ◠])`, compare `[◇ ⟨◠⟩]` and `{◇ ⟨◠⟩}`. Which joins, and which changes size?

<details>
<summary>Check your answer</summary>

Replace ◇ with the three-step journey. Square brackets join three steps with two. Curly brackets double the three-step journey.

```text
[[◠ ◠ ◠] ⟨◠⟩] = ⟨◠○○⟩
```

```text
{[◠ ◠ ◠] ⟨◠⟩} = ⟨◠◠⟩
```

</details>

With `≔(⟦□⌊◠⌋⟧ : {□⌊◠⌋ □⌊◠⌋})`, what does `⟦⟨◠⟩⟧` become? What supplies its meaning?

<details>
<summary>Check your answer</summary>

It expands to {⟨◠⟩ ⟨◠⟩}, giving four steps. The declaration supplies that meaning. The same marks need their declaration in a new input.

</details>

### Keep what a range makes

How can we keep every answer instead of joining them?

Sometimes we need every result, in order. Put a range in parentheses to
retain its results as a *sequence*:

```text
(□ : ◠ … ⟨⟨◠⟩⟩ : □)
    = (◠ ⟨◠⟩ ⟨◠○⟩ ⟨⟨◠⟩⟩)
```

A sequence's value keeps every entry in order. For sequences, `=` means
the same entry values in the same order, with nested sequences kept in
their matching places.

The same visits can have three different outcomes:

| Outside marks | What to do with the visit results |
| --- | --- |
| `[ ]` | Join them into one journey |
| `{ }` | Combine their changes in written order |
| `( )` | Keep each result in written order |

Here the square range gives the ten-step count. The curly range gives
the twenty-four-step count. The parenthesized range keeps four entries.
None of those entries disappears into a total.

You can write retained entries directly, too:

```text
(○ ○ ◠ ◠)
```

This sequence has four entries. Its two leading `○` entries stay present;
they are entries with a value, not missing entries. A definition can give
the sequence a positional reading.

`()` is an empty sequence. `(◠)` has one entry. It is different from
the number `◠`. Parentheses do not act as numerical grouping.

#### Use a sequence as the source of another range

Give a sequence range two names. On each visit, the first receives the
entry and the second receives the number of entries to its right, called
its *place*. Visit entries in written order; the last has place `○`.
The recipe after the final colon doubles the entry:

```text
(
  □⌊◠⌋ □⌊⟨◠⟩⌋ : (◠ ⟨◠⟩ ⟨◠○⟩) :
  {□⌊◠⌋ ⟨◠⟩}
)
    = (⟨◠⟩ ⟨⟨◠⟩⟩ ⟨◠◠⟩)
```

Change the outside parentheses to square brackets to join those doubled
entries. Change them to curly brackets to combine them. The header,
visiting order, and names keep their meanings.

The source can itself be a generated sequence. Read that complete source
first; then use its entries as the visits of the surrounding range:

```text
[□⌊◠⌋ □⌊⟨◠⟩⌋ : (□ : ◠ … ⟨◠○⟩ : □) : □⌊◠⌋]
    = ⟨◠◠⟩
```

Read the source once, using the surrounding names. Then give the entry
and place names their values inside the recipe. An empty source makes no
visits: parentheses keep `()`, square brackets give `○`, and curly
brackets give `◠`.

#### Select one entry

Put lower corners after a sequence to read one entry. The place counts how
many entries lie to its right, just as it does during a sequence visit.
Start at `○` for the rightmost entry:

| Writing | Entry read | Why |
| --- | --- | --- |
| `(⟨◠⟩ ◡ ◠)⌊○⌋` | `◠` — one step forward | No entries to its right |
| `(⟨◠⟩ ◡ ◠)⌊◠⌋` | `◡` — one step backward | One entry to its right |
| `(⟨◠⟩ ◡ ◠)⌊⟨◠⟩⌋` | `⟨◠⟩` — two steps forward | Two entries to its right |

This operation is called *entry lookup* or *indexing*. It reads one complete
entry. It leaves the source's order and contents unchanged.

The source can be a range or a defined form that produces a sequence:

```text
(□ : ◠ … ⟨◠○⟩ : {□ □})⌊◠⌋ = ⟨⟨◠⟩⟩
```

The range keeps one, four, and nine steps. The lookup reads the middle
entry: four steps.

A place must be a whole count from `○` upward, on the original path.
It must name an entry that exists. `()` has no entry places.
An out-of-range place gives no value; it does not wrap around or supply `○`.

Read the complete source once before selecting. Every entry must have a
defined value, including entries that are not chosen. For example,
`({|○} ◠)⌊○⌋` cannot give `◠`: its source contains an undefined sharing
operation. A calculator may retain an unfinished recipe when it cannot
yet establish its value. That is not a proof that the value exists.

#### Read a nested entry

If the chosen entry is another sequence, another pair of corners can
select inside it:

```text
((◠ ○) (◡ ⟨◠⟩))⌊○⌋ = (◡ ⟨◠⟩)
((◠ ○) (◡ ⟨◠⟩))⌊○⌋⌊◠⌋ = ◡
```

First take the rightmost inner list. Then take its entry with one entry to
the right. Each attachment works on the result immediately before it.

The first lower corners after a box still belong to its name. To read an
entry of the sequence that name holds, add a second pair:

```text
(□⌊◠⌋ □⌊⟨◠⟩⌋ : ((◠ ○) (◡ ⟨◠⟩)) : □⌊◠⌋⌊○⌋)
    = (○ ⟨◠⟩)
```

The entry name is `□⌊◠⌋`. On each visit, the final `⌊○⌋` reads the
rightmost entry of that inner list: first no steps, then two steps.
Choose a tagged name when you will read its entries: the first corners
name the counter, and the second corners select an entry.

| What the lower corners follow | Their job |
| --- | --- |
| `⟨◠⟩⌊⟨◠⟩⌋` | Start factor instructions at the second factor place |
| `□⌊⟨◠⟩⌋` | Give a counter its fixed name |
| `(◠ ◡)⌊○⌋` | Read the rightmost sequence entry |
| `□⌊⟨◠⟩⌋⌊○⌋` | Read the rightmost entry of the sequence held by that name |

These are different jobs. Check what the corners follow.

<details>
<summary>Explore further: nested sequences and definitions that return lists</summary>

#### Keep nested sequences separate

One entry can itself be a sequence:

```text
((◠ ⟨◠⟩) (⟨◠○⟩))
```

There are two outer entries. The first contains two entries; the second
contains one. Visiting the outer sequence does not flatten them.
A body can visit each inner sequence explicitly when that is wanted.

Numerical operations require numbers. For example, `{(◠ ⟨◠⟩) ⟨◠⟩}`
does not mean “double each entry.” Write a parenthesized range to make that
choice. To obtain a number from a sequence, select a numerical entry or
use a square or curly range to combine entries.

These sequence ranges are finite. A count range in parentheses needs both
endpoints; a sequence source must have an end. Retaining infinitely
many entries would need further rules. Limits may still occur inside finite
sequences, following their existing rules.

#### Let a definition return a sequence

A definition's meaning can retain results:

```text
≔(◇ : (□ : ◠ … ⟨◠○⟩ : □))
◇
    = (◠ ⟨◠⟩ ⟨◠○⟩)
```

An argument that captures one expression can receive an expression producing
a number or a sequence. The operations in the meaning decide which is needed.

A sequence argument accepts either written entries or one expression that
supplies the whole sequence. For example, under a definition that captures
the contents of `⟦…⟧` as a sequence, `⟦◠ ○⟧` and `⟦(◠ ○)⟧` supply
the same two entries. `⟦((◠ ○))⟧` supplies one entry that is itself a sequence.
In `⟦◠ (○ ◠)⟧`, the supplied entries are a number and a nested sequence.

Definitions retain their scope rules when they produce sequences. A
generated entry keeps the counter values from its own visit, including
when that entry remains an exact recipe the evaluator cannot yet reduce.

</details>

#### Pause and practice: keep or join

**Marks so far:** `(…)` keeps entries in order; `[…]` joins them. A sequence range visits left to right and reports each entry’s place from the right.

Lower corners after a sequence read an entry at that same place.

Compare `(◠ ◡)` and `[◠ ◡]`. Which keeps two entries, and which finishes at ○?

<details>
<summary>Check your answer</summary>

Parentheses keep the two entries as a sequence. Square brackets join the journeys, which cancel.

</details>

For `(◠ ⟨◠⟩ ⟨◠○⟩)`, which entry is visited first, and what is its place from the right?

<details>
<summary>Check your answer</summary>

The one-step entry is visited first. Two entries lie to its right, so its place is ⟨◠⟩. The last, three-step entry has place ○.

</details>

In `((◠ ○) (◡ ⟨◠⟩))⌊◠⌋⌊○⌋`, which inner list is chosen first?
Which entry is the final answer?

<details>
<summary>Check your answer</summary>

The first lookup chooses `(◠ ○)`, which has one outer entry to its right.
The second chooses its rightmost entry, `○`. The entries themselves do
not move.

</details>

#### Pair entries or choose a new order

Lookup and sequence visits work together. Visit one list, then use its
place to read the matching entry of another:

```text
(□⌊◠⌋ □⌊⟨◠⟩⌋ : (◠ ⟨◠⟩) :
  (□⌊◠⌋ (⟨◠○⟩ ⟨⟨◠⟩⟩)⌊□⌊⟨◠⟩⌋⌋)
)
    = ((◠ ⟨◠○⟩) (⟨◠⟩ ⟨⟨◠⟩⟩))
```

| Visit | Place | Matching entry | Pair kept |
| --- | --- | --- | --- |
| `◠` — one | `◠` | `⟨◠○⟩` — three | `(◠ ⟨◠○⟩)` — one with three |
| `⟨◠⟩` — two | `○` | `⟨⟨◠⟩⟩` — four | `(⟨◠⟩ ⟨⟨◠⟩⟩)` — two with four |

This example uses lists of equal length. The reusable pairing declaration
in the playground checks that requirement before keeping the pairs.
It gives `⋈⟪… : …⟫` this meaning. Two empty lists give `()`.

To choose a new order, visit a list of requested places instead. The
playground's rearrangement declaration gives `↷⟪… : …⟫` that meaning:

```text
↷⟪◠ ⟨◠⟩ ⟨◠○⟩ : ○ ◠ ⟨◠⟩⟫
    = (⟨◠○⟩ ⟨◠⟩ ◠)
```

Read the rightmost entry first, then the middle, then the leftmost. This
reverses the list. Repeating a requested place repeats its entry; an empty
request keeps `()`. Nested entries stay together. Both written forms need
their declarations, available in the playground's definition library.

<details>
<summary>How the declarations check their inputs</summary>

The existing length declaration visits a sequence and joins one step per
entry. To check that two lengths match, undo one from the other. Use that
difference as a lookup into `(◠)`. Its only place is `○`, so the lookup
succeeds exactly when the lengths match.

The pairing declaration puts the list of pairs in a one-entry outer
sequence. The check gives `◠` when the lengths match. Undo that step to
get `○`, the place that reads the list. The check must finish before that
place can be read, even when the list of pairs is empty.

The rearrangement declaration similarly counts the source entries, then
combines that count with `○` to obtain the outer lookup's place. It must
finish reading the source even when no places are requested. Each lookup
reads its own source; these declarations do not promise to cache repeated
source expressions.

The counters still visit in written order. Inside a pair the first list's
entry comes first. If you later combine the paired entries using curly
brackets, keep that order: directed changes can depend on it.

</details>

### Apply a table of rows

This is an optional application after retained sequences, entry lookup,
and pairing. Try one row before opening the complete declaration.

A **matrix** is a table whose rows all have the same number of entries.
Write each row as a sequence, then keep the rows in an outer sequence:

```text
((◠ ○) (◡ ◠))
```

Give both rows the same input:

```text
(⟨◠⟩ ◠)
```

The input has two entries: two steps, then one step. Match each row entry
with the input entry in the same written position. Combine the row entry
first, then the input entry. Join that row's contributions.

| Row | First pair | Second pair | Joined answer |
| --- | --- | --- | --- |
| `(◠ ○)` | `{◠ ⟨◠⟩}`: two forward steps | `{○ ◠}`: no steps | `⟨◠⟩`: two forward steps |
| `(◡ ◠)` | `{◡ ⟨◠⟩}`: two backward steps | `{◠ ◠}`: one forward step | `◡`: one backward step |

The first row keeps the first input and makes no contribution from the
second. The second row reverses the first input, then joins the second:

```text
[{◠ ⟨◠⟩} {○ ◠}] = ⟨◠⟩
[{◡ ⟨◠⟩} {◠ ◠}] = ◡
```

Keep one answer per row, in the rows' written order:

```text
(⟨◠⟩ ◡)
```

The zero entry is still an entry. Dropping it from `(◠ ○)` would leave
that row too short to match the input. A table can have more or fewer
rows than its input has entries; only each row's length must match.

#### Give the operation a written form

The playground library declares `⋄⟪… : …⟫` for one row and
`▦⟪… : …⟫` for the table. The marks get these meanings from their
declarations. The calculations use pairing, entry lookup, and ranges.

```text
⋄⟪◡ ◠ : ⟨◠⟩ ◠⟫ = ◡
▦⟪((◠ ○) (◡ ◠)) : (⟨◠⟩ ◠)⟫ = (⟨◠⟩ ◡)
```

Put the row or table before the colon and the input after it.
The [browser walkthrough](index.html#matrices) highlights each matching
pair. Predict its contribution, then visit it to see the joined amount.

<details>
<summary>Read the declarations</summary>

Open the row or table declaration in the playground's definition library.
Its dependencies supply the length and pairing declarations.

The row visits the checked list of pairs. Each pair keeps the row entry
on the left, at place `◠`, and the input entry on the right, at place `○`.
The square range joins their curly combinations.

The table visits the rows in order. Each row is itself visited as a sequence,
then passed to the row operation. Parentheses keep its answer. A final
square visit of the input joins `{○ entry}` for each entry; this must give
`○` before the outer lookup returns the answers. It checks that the input
contains numbers even when the table has no rows.

```text
≔(⋄⟪□⌊◠⌋ : □⌊⟨◠⟩⌋⟫ :
  [□⌊⟨◠○⟩⌋ □⌊⟨⟨◠⟩⟩⌋ : ⋈⟪□⌊◠⌋ : □⌊⟨◠⟩⌋⟫ :
    {□⌊⟨◠○⟩⌋⌊◠⌋ □⌊⟨◠○⟩⌋⌊○⌋}
  ]
)

≔(▦⟪□⌊◠⌋ : □⌊⟨◠⟩⌋⟫ :
  (
    (□⌊⟨◠○⟩⌋ □⌊⟨⟨◠⟩⟩⌋ : □⌊◠⌋ :
      ⋄⟪(□⌊⟨◠○○⟩⌋ □⌊⟨◠◠⟩⌋ : □⌊⟨◠○⟩⌋ : □⌊⟨◠○○⟩⌋) : □⌊⟨◠⟩⌋⟫
    )
  )⌊[□⌊⟨◠○⟩⌋ □⌊⟨⟨◠⟩⟩⌋ : □⌊⟨◠⟩⌋ : {○ □⌊⟨◠○⟩⌋}]⌋
)
```

</details>

#### Keep shapes and order

Every row must be a finite sequence of numbers, with one entry for each
input entry. Numbers may include backward amounts, fractions, roots,
and directed amounts. Another nested sequence is not a row amount.

An empty row with an empty input has no contributions to join, so it gives
`○`. Two empty rows keep two answers, `(○ ○)`. A table with no rows keeps
`()`. Every required entry still needs a value: an undefined sharing operation
in an input or row cannot disappear because it meets `○` or there are no rows.
An answer the calculator cannot establish remains a recipe.

For directed entries, keep the row entry first. The direction rules give:

```text
{◠@◠ ◠@⟨◠⟩} = ◠@⟨◠○⟩
{◠@⟨◠⟩ ◠@◠} = ◡@⟨◠○⟩
```

Those answers point opposite ways. Applying a matrix here means this ordered
recipe. It does not assign new direction labels to the table's rows or columns.

#### Pause and practice: match the entries

Marks to use: parentheses keep entries, pairing matches their places,
curly brackets combine each pair, and square brackets join a row's contributions.

Keep the table `((◠ ○) (◡ ◠))`, but use input `(⟨◠⟩ ⟨◠○⟩)`.
What does each row give?

<details>
<summary>Check the row answers</summary>

The first row gives two forward steps. The second joins two backward steps
with three forward steps, giving one forward step. Keep `(⟨◠⟩ ◠)`.

</details>

Can you remove the `○` from `(◠ ○)` while keeping a two-entry input?

<details>
<summary>Check the matching places</summary>

No. It occupies the second position and contributes no steps there.
Removing it leaves a row with no entry to match that input position.

</details>

#### Name a change and its input

A table can describe the same change for many input lists. Use a declaration
to give that recipe a convenient written name:

```text
≔(⇄⟪□⌊◠⌋⟫ : ▦⟪((○ ◠) (◠ ○)) : □⌊◠⌋⟫)
⇄⟪(⟨◠⟩ ⟨◠○⟩)⟫
```

Include the matrix declarations before this declaration. The box names the
complete input supplied between the paired marks. The first row takes the
second entry; the second row takes the first. The answer is three steps,
then two steps: `(⟨◠○⟩ ⟨◠⟩)`.

Supply `(◡ ◠)` instead and the same recipe gives `(◠ ◡)`. Its input still
needs two numerical entries. The declaration chooses the meaning of `⇄`.
It is a written name for the existing recipe.

#### Follow one change with another

Begin with `(⟨◠⟩ ⟨◠○⟩)`: two steps, then three. Swap the entries, then
double the first answer and keep the second.

| Stage | List | Spoken reading |
| --- | --- | --- |
| Original input | `(⟨◠⟩ ⟨◠○⟩)` | Two steps, then three |
| Swap | `(⟨◠○⟩ ⟨◠⟩)` | Three steps, then two |
| Resize the first | `(⟨◠◠⟩ ⟨◠⟩)` | Six steps, then two |

The intermediate list becomes the next recipe's input. Doing changes in
succession is called **composition**. Nesting the written forms shows it:
read the inner recipe first, then use its answer in the outer one.

```text
≔(↟⟪□⌊◠⌋⟫ : ▦⟪((⟨◠⟩ ○) (○ ◠)) : □⌊◠⌋⟫)
↟⟪⇄⟪(⟨◠⟩ ⟨◠○⟩)⟫⟫
```

Keep the swap declaration too. The new declaration doubles the first entry.
A single table can describe both changes:

```text
((○ ⟨◠⟩) (◠ ○))
```

Its first row takes twice the original second entry. Its second row keeps
the original first entry. Thus it gives the same six-step, two-step answer.

To build this table, let just one input entry contribute a forward step
while the other contributes no steps. Follow each through both changes:

| Original input | After swapping | After resizing |
| --- | --- | --- |
| `(◠ ○)` | `(○ ◠)` | `(○ ◠)` |
| `(○ ◠)` | `(◠ ○)` | `(⟨◠⟩ ○)` |

Each answer supplies one **column**: entries stacked below one another.
The first column is no steps above one step. The second is two steps above
no steps. Reading across them gives the rows `(○ ⟨◠⟩)` and `(◠ ○)`.

#### Declare the combined table

The library declares `▧⟪later table : earlier table⟫` to build the
single table. Keep the later table first, just as the outer recipe acts
on the inner recipe's answer.

```text
▧⟪((⟨◠⟩ ○) (○ ◠)) : ((○ ◠) (◠ ○))⟫
    = ((○ ⟨◠⟩) (◠ ○))
```

Both tables have numerical entries in equal-length rows. Every later row
needs one entry per earlier row. The earlier table needs at least one row:
even an empty row shows its input width. A table with no rows does not
record that width, so this written form cannot compose it as the earlier
table. You can still apply such a table to a supplied input with `▦`.

An earlier table of empty rows is allowed. With matching later rows, the
combined table keeps the correct number of empty rows. An empty later
table gives `()`, after checking the earlier table.

<details>
<summary>Read the general column recipe</summary>

For each later row, visit the earlier table's column places in written
order. Read one entry from each earlier row at that place; these make the
column. The row operation pairs the later row with that column, combines
each pair, and joins the contributions. Keep one answer per column to
make a combined row, then keep the rows.

The earlier table's rightmost row supplies the visit places. Two validation
folds separately check every earlier row and every later row, including
when the answer has no rows or columns. An undefined required entry stays
undefined; an unfinished calculation keeps a recipe.

The library contains the complete declaration and its dependencies. It
uses ordinary ranges, row pairing, and lower-corner lookup.

```text
≔(▧⟪□⌊◠⌋ : □⌊⟨◠⟩⌋⟫ :
  (
    (□⌊⟨◠○⟩⌋ □⌊⟨⟨◠⟩⟩⌋ : □⌊◠⌋ :
      (□⌊⟨◠○○⟩⌋ □⌊⟨◠◠⟩⌋ : □⌊⟨◠⟩⌋⌊○⌋ :
        ⋄⟪□⌊⟨◠○⟩⌋ : (□⌊⟨◠○○○⟩⌋ □⌊⟨⟨◠⟩○⟩⌋ : □⌊⟨◠⟩⌋ : □⌊⟨◠○○○⟩⌋⌊□⌊⟨◠◠⟩⌋⌋)⟫
      )
    )
  )⌊[
    [□⌊⟨◠○⟩⌋ □⌊⟨⟨◠⟩⟩⌋ : ▦⟪□⌊⟨◠⟩⌋ : □⌊⟨◠⟩⌋⌊○⌋⟫ : {○ □⌊⟨◠○⟩⌋}]
    [□⌊⟨◠○⟩⌋ □⌊⟨⟨◠⟩⟩⌋ : ▦⟪□⌊◠⌋ : (□⌊⟨◠○○○⟩⌋ □⌊⟨⟨◠⟩○⟩⌋ : □⌊⟨◠⟩⌋ : ○)⟫ : {○ □⌊⟨◠○⟩⌋}]
  ]⌋
)
```

</details>

For directed entries, preserve which change acts first. Applying `◠@◠`
and then `◠@⟨◠⟩` combines them in this order:

```text
{◠@⟨◠⟩ ◠@◠} = ◡@⟨◠○⟩
```

The later entry goes first because it acts on the earlier answer. Reversing
the changes gives `◠@⟨◠○⟩` instead. The combined table preserves that
order. Its equality to the successive recipe follows by distributing the
later changes over the earlier joined contributions and regrouping each
ordered curly combination. No swap of directed entries is needed.

#### Undo the last change first

The swap-and-resize example can be undone. Halve the first output, then
swap back:

| Stage | List | Spoken reading |
| --- | --- | --- |
| Final output | `(⟨◠◠⟩ ⟨◠⟩)` | Six steps, then two |
| Halve the first | `(⟨◠○⟩ ⟨◠⟩)` | Three steps, then two |
| Swap back | `(⟨◠⟩ ⟨◠○⟩)` | The original two steps, then three |

An **inverse** is a change that restores the input for every allowed input.
One recovered example is a useful check. To establish an inverse, doing
and undoing must keep every input entry unchanged, in both orders.

For two entries, this **identity table** keeps each entry:

```text
((◠ ○) (○ ◠))
```

The first row keeps the first input. The second keeps the second input.
For our example, the combined forward table and undoing table are:

| Job | Table |
| --- | --- |
| Swap, then double the first | `((○ ⟨◠⟩) (◠ ○))` |
| Halve the first, then swap | `((○ ◠) (⟨◡⟩ ○))` |

Combining these tables in either order gives the identity table. That
establishes recovery for every allowed two-entry input, including directed
amounts. The walkthrough also offers directed changes with their ordered
undoing changes. It does not attempt to find an inverse for an arbitrary table.

#### See a change lose information

The table `((◠ ○))` keeps only the first entry. These two inputs both give
`(⟨◠⟩)`:

```text
(⟨◠⟩ ◠)
(⟨◠⟩ ⟨◠○⟩)
```

The output cannot tell you which second entry was supplied. No recipe that
uses only that output can restore both inputs. Resizing the output later
does not bring back the missing information.

#### Pause and practice: compose and undo

Marks to use: a declaration names a recipe, its argument supplies an input,
and an inner recipe acts first. An identity table keeps every entry unchanged.

Double the first entry of `(⟨◠⟩ ⟨◠○⟩)`, then swap. Is that the same as
swapping first, then doubling the first entry?

<details>
<summary>Check the order</summary>

Doubling first gives four steps, then three. Swapping gives three steps,
then four: `(⟨◠○⟩ ⟨⟨◠⟩⟩)`. Swapping first and then doubling gave
six steps, then two. The order decides which original entry is doubled.

</details>

If you keep only the first entry and then double it, can you recover the
second entry from that final output?

<details>
<summary>Check what remains</summary>

No. Different second entries still give the same output. A later change
that uses only that output cannot distinguish them.

</details>

### Find an input from its output

This is an optional exploration after applying a table of rows. The table
and requested output stay fixed; the input is the part to find.

Earlier we supplied an input and followed a recipe. Now turn the question
around: this table gave three steps and one step. What input did it receive?

```text
((◠ ○) (◡ ◠))
```

The first answer keeps the first input. That input must be three steps.
The second answer reverses the first input and joins the second. To finish
one step forward after those three backward steps, the second input must
be four steps forward.

| What we know | What it tells us |
| --- | --- |
| First output: `⟨◠○⟩` — three steps | First input: `⟨◠○⟩` — three steps |
| Second output: `◠` — one step | Second input: `⟨⟨◠⟩⟩` — four steps |

Check it:

```text
[{◡ ⟨◠○⟩} {◠ ⟨⟨◠⟩⟩}] = ◠
```

With the matrix declarations, the complete check is:

```text
▦⟪((◠ ○) (◡ ◠)) : (⟨◠○⟩ ⟨⟨◠⟩⟩)⟫ = (⟨◠○⟩ ◠)
```

An **equation** asks for values that make two expressions equal. Here we
ask for an input whose table output equals a requested list. An input that
fits is a **solution**. Both entries in this example are fixed by the
request, so exactly one input fits.

#### Several inputs can fit

The table `((◠ ◠))` joins two input entries into one answer. Request
three steps, `(⟨◠○⟩)`:

| Input | Spoken reading | Output |
| --- | --- | --- |
| `(◠ ⟨◠⟩)` | One step joined with two | `(⟨◠○⟩)` |
| `(⟨◠⟩ ◠)` | Two steps joined with one | `(⟨◠○⟩)` |
| `(○ ⟨◠○⟩)` | No steps joined with three | `(⟨◠○⟩)` |

Choose the first amount. Join its undoing with three steps to find the
second. There are more possibilities than the ones listed, including
fractions and backward amounts. Directed amounts work too: a sideways
part in the first input can be undone by the second.

The output fixes the joined amount, but it does not tell how that amount
was split. This is the loss of information from the earlier recovery lesson.

#### No input may fit

The table `((◠ ○) (◠ ○))` copies the first input into both answers.
Every possible output has equal entries. Requesting `(⟨◠○⟩ ◠)` asks
for three steps and one step, which differ. No input can meet both requests.

Changing the second input cannot help: both rows give it no contribution.
A failed guess alone would not prove impossibility. The identical rows
explain why every guess fails.

#### Try a guess and read the gaps

The [browser puzzle](index.html#unknown-inputs) supplies these three tables
and their requests. Write two input entries, then check what the table gives.
Hints and explanations stay hidden until you open them.

Undo each requested answer from its matching output. If every gap is `○`,
the input fits. For example, trying `(⟨◠○⟩ ⟨◠○⟩)` in the first puzzle
gives `(⟨◠○⟩ ○)`. The first gap is `○`; the second is `◡`, one step
behind the requested answer. The first entry fits, but the second does not.

The checks use exact UFN arithmetic. An unresolved gap remains a recipe;
a decimal picture does not decide whether the input fits. The puzzle checks
guesses and explains these examples. It does not search for a solution of
an arbitrary table.

#### Pause and practice: what does a guess prove?

Marks to use: the table describes the change, the requested output stays
fixed, and your input is the part to find. Every gap must be `○` for it to fit.

One input missed the target. Does that prove no input fits?

<details>
<summary>Check what you learned</summary>

It rules out that input. Another may work. To show none fit, explain a rule
every output must obey, such as the equal answers from identical rows.

</details>

The copy-twice table was asked for three steps and one step. Change the
request to three steps and three steps. How many inputs fit now?

<details>
<summary>Check the new request</summary>

Several fit. The first input must be three steps; the second can be any
allowed amount. The table alone does not decide how many inputs fit: the
requested output matters too.

</details>

### Simplify the clues

This is an optional exploration after finding an input. A row and its
requested answer form one **clue**. Keep them together as you change the clues.

Can we find the input without guessing? Begin with these two clues:

| Clue | Input instructions | Requested answer | Spoken reading |
| --- | --- | --- | --- |
| First | `(◠ ◠)` | `⟨◠○⟩` | Join the first input with the second to get three steps |
| Second | `(◠ ⟨◠⟩)` | `⟨⟨◠⟩⟩` | Join the first input with twice the second to get four steps |

Undo the first clue from the second. Their shared first input cancels.
One copy of the second input remains. Four steps with three undone give
one step. So the second input must be one step.

Keep the first clue. Undo the new second clue from it. Its three-step
answer with one step undone gives two steps. That is the first input.

#### Make the same change in every part

For the first row change, keep the first clue unchanged. In the second
clue, undo the matching part of the first clue in every position:

| Part | Calculation | What remains |
| --- | --- | --- |
| First input instruction | `[◠ | ◠] = ○` | No contribution from the first input |
| Second input instruction | `[⟨◠⟩ | ◠] = ◠` | One copy of the second input |
| Requested answer | `[⟨⟨◠⟩⟩ | ⟨◠○⟩] = ◠` | One forward step |

The new second clue is `(○ ◠)` requesting `◠`. Now undo it from the
first clue too. The first becomes `(◠ ○)` requesting `⟨◠⟩`.

| Stage | Table | Requested answers |
| --- | --- | --- |
| Original clues | `((◠ ◠) (◠ ⟨◠⟩))` | `(⟨◠○⟩ ⟨⟨◠⟩⟩)` |
| Undo the first from the second | `((◠ ◠) (○ ◠))` | `(⟨◠○⟩ ◠)` |
| Undo the second from the first | `((◠ ○) (○ ◠))` | `(⟨◠⟩ ◠)` |

The last table keeps each input separately. Read the input directly from
the request: two steps, then one. This removal of shared contributions
is called **elimination**.

Check the input against both original clues:

```text
[{◠ ⟨◠⟩} {◠ ◠}] = ⟨◠○⟩
[{◠ ⟨◠⟩} {⟨◠⟩ ◠}] = ⟨⟨◠⟩⟩
```

#### Keep the same possible inputs

We kept the first clue while changing the second. Join it back to the
changed second clue and the original second returns, including its
requested answer. We can go in either direction.

An input therefore fits the original clues exactly when it fits the
changed clues. Changing only the instructions or only the requested
answer would ask a different question.

Three useful changes preserve which inputs fit:

- Swap complete clues. Each requested answer travels with its row.
- Resize a complete clue by a nonzero amount on the original path.
  Apply the same resizing to its requested answer. The reciprocal resizing
  undoes it.
- Join a resized copy of another clue into this one, while keeping that
  other clue. Undo that copy to restore the previous clue.

Resizing by `○` cannot be undone. It turns every instruction and its
request into `○`, losing the restriction the clue supplied.

#### Express a row change with a table

The table `((◠ ○) (◡ ◠))` keeps the first row and undoes it from the
second. Use the existing combined-table declaration on the instructions,
and apply that same change to the requested answers:

```text
▧⟪((◠ ○) (◡ ◠)) : ((◠ ◠) (◠ ⟨◠⟩))⟫
    = ((◠ ◠) (○ ◠))

▦⟪((◠ ○) (◡ ◠)) : (⟨◠○⟩ ⟨⟨◠⟩⟩)⟫
    = (⟨◠○⟩ ◠)
```

Include the library declarations to give those written forms their meanings.
The row change uses ordinary row combinations and sequence operations.

The [browser walkthrough](index.html#simplify-clues) highlights the changed
row and shows a calculation for each instruction and the requested answer.
Predict the result before revealing the change. You can edit the request
and start again. Its short row-change plans belong to the examples; the
calculator does not search for a simplification of an arbitrary table.

#### Read a clue with no contributions

Begin instead with `(◠ ◠)` requesting three steps, and `(⟨◠⟩ ⟨◠⟩)`
requesting six. Undo twice the first clue from the second:

```text
((◠ ◠) (○ ○))
(⟨◠○⟩ ○)
```

The second row contributes no steps and requests no steps. It is true for
every input and adds no restriction. The first still fixes the joined
amount at three steps. Several input pairs fit, such as `(○ ⟨◠○⟩)`
and `(◠ ⟨◠⟩)`.

Keep those original row instructions but request seven steps in the
second clue. The same row change leaves:

```text
((◠ ◠) (○ ○))
(⟨◠○⟩ ◠)
```

No input can make a row with no contributions give one step. The changed
clues cannot both hold. Since the changes are reversible, the original
clues cannot both hold either.

A row of `○` instructions does not mean the inputs are `○`. It says
that this row receives no contribution from them. Its requested answer
is what decides whether it adds no restriction or is impossible.

#### Pause and practice: preserve the clues

Keep a row's input instructions and its requested answer together.
Keep the other clue when using it to change this one.

You halve both instructions in a clue but keep its requested answer.
Have you preserved the clue?

<details>
<summary>Check the request</summary>

Generally no. Halve the requested answer too. Otherwise the resized
contributions are asked to reach the old amount.

</details>

Does a changed row `(○ ○)` tell you both inputs must be `○`?

<details>
<summary>Check what the row says</summary>

No. It contributes no steps whatever the inputs are. A requested answer
of `○` adds no restriction; a nonzero requested answer is impossible.

</details>

Could resizing a complete clue by `○` be undone?

<details>
<summary>Check what was lost</summary>

No. The original restriction has disappeared. Use a nonzero resizing
when you need to preserve the possible inputs.

</details>

### Describe every input that fits

This is an optional exploration after finding an input and simplifying clues.
We will describe every input for one joined-amount request.

Two inputs must join to three steps. Choose the first amount. Undo it
from three steps to find the second:

```text
(□ [⟨◠○⟩ | □])
```

This is a recipe with an input named `□`. Its box needs the chosen value
before the recipe can run. A declaration below supplies that value.

| First choice | Second amount | Spoken reading |
| --- | --- | --- |
| `◠` | `⟨◠⟩` | One step and two steps |
| `⟨◠⟩` | `◠` | Two steps and one step |
| `⟨⟨◠⟩⟩` | `◡` | Four steps and one backward step |
| `⟨◡⟩` | `⟨◠○◡⟩` | A half step and two and a half steps |

A backward amount is allowed. Four steps joined with one backward step
still give three:

```text
[⟨⟨◠⟩⟩ ◡] = ⟨◠○⟩
```

#### Why every pair is covered

Every allowed choice of the first amount supplies a pair that joins to
three steps. The first amount's undoing in the second cancels it.

Conversely, take any pair that joins to three steps. Once its first amount
is known, undo it from the total. What remains must be its second amount.
So no pair that fits is missing from the recipe.

All the inputs together form a **family of solutions**. The freely supplied
amount is called a **parameter**. It is a numerical input you choose,
not an extra kind of number.

#### Choose two amounts independently

Now let three inputs join to three steps. Choose the first two independently
and undo both from the total to find the third:

```text
(□⌊◠⌋ □⌊⟨◠⟩⌋ [⟨◠○⟩ | □⌊◠⌋ □⌊⟨◠⟩⌋])
```

The fixed tags distinguish the two inputs; they do not restrict their values.

| First choice | Second choice | Remaining amount | Kept inputs |
| --- | --- | --- | --- |
| `◠` | `◠` | `◠` | `(◠ ◠ ◠)` |
| `⟨◠⟩` | `◠` | `○` | `(⟨◠⟩ ◠ ○)` |
| `⟨◠⟩` | `⟨◠○⟩` | `[|⟨◠⟩]` | `(⟨◠⟩ ⟨◠○⟩ [|⟨◠⟩])` |

You can change the first while keeping the second fixed, or change the
second while keeping the first fixed. The third compensates for either
change. Once the first two are supplied, the third is determined.

Every triple that fits is covered too. Read its first two amounts, undo
them from the total, and the remaining amount is its third.

The [browser view](index.html#solution-families) lets you move one or two
chosen amounts while the total stays fixed. Its sliders show only half-step
choices from two steps backward through six forward. The recipes cover
other amounts too; type numerical expressions to explore them.

#### Count the independent choices

For the line picture, each amount lies on the original path. The two-input
recipe lets one amount vary freely. We say the family has **one dimension**
of choice. The three-input recipe has **two dimensions** of choice:
two amounts can vary independently. The remaining amount adds no freedom.

These dimensions describe choices among inputs. An `@` label describes
a path inside one input value. Check which kind of choice is being counted.

<details>
<summary>Let the chosen amounts have several path components</summary>

The same recipes accept directed amounts. Choose `◠@◠` first.
The second must give three steps along `@○` and undo that sideways step:

```text
[⟨◠○⟩@○ ◡@◠]
[◠@◠ [⟨◠○⟩@○ ◡@◠]] = ⟨◠○⟩
```

Each freely chosen four-component amount can itself have four independently
chosen original-path components. One free directed amount therefore has
four such choices, and two have eight. The earlier one- and two-dimensional
counts apply when the chosen amounts stay on the original path.

</details>

#### Give the family a usable written name

A declaration supplies the chosen amount to the recipe. Here the first
tag names the total, and the second names the free amount:

```text
≔(↔⟪□⌊◠⌋ : □⌊⟨◠⟩⌋⟫ :
  (□⌊⟨◠⟩⌋ [□⌊◠⌋ | □⌊⟨◠⟩⌋])
)
↔⟪⟨◠○⟩ : ⟨⟨◠⟩⟩⟫
```

That gives four steps, then one backward step. The declaration chooses
the symbol's meaning. The operations are the ones already learned.
A second declaration accepts two independently supplied amounts:

```text
≔(↕⟪□⌊◠⌋ : □⌊⟨◠⟩⌋ : □⌊⟨◠○⟩⌋⟫ :
  (□⌊⟨◠⟩⌋ □⌊⟨◠○⟩⌋ [□⌊◠⌋ | □⌊⟨◠⟩⌋ □⌊⟨◠○⟩⌋])
)
↕⟪⟨◠○⟩ : ◠ : ◠⟫
```

The browser checks each constructed input using the all-joining row
`((◠ ◠))` or `((◠ ◠ ◠))`. Unsupported reductions keep a recipe;
a decimal line picture does not establish equality. Every chosen expression
still needs a value. Undefined sharing cannot disappear because the same
expression is later undone.

#### Pause and practice: count the choices

Keep the joined amount fixed. Chosen inputs are supplied to the recipe;
its remaining amount compensates.

Two inputs join to three steps. Choose five steps first. What is the second?

<details>
<summary>Check the compensation</summary>

Two steps backward, `[|⟨◠⟩]`. Five forward with two undone gives three.

</details>

Three inputs join to three steps. Choose two steps and three steps first.
Is the last input also free?

<details>
<summary>Check what remains</summary>

No. It must be two steps backward. The first two choices determine it.

</details>

Two freely chosen amounts both stay on `@○`. Does sharing that path
force the family to have just one dimension?

<details>
<summary>Check what is independent</summary>

No. They are two separate input choices. Either can change while the
other stays fixed; the remaining amount compensates.

</details>

### Keep captured entries in order

This is an optional application of definitions and sequences. Try visiting
a directly written sequence before learning to capture one in a pattern.

A pattern can capture several complete expressions as one ordered
sequence. For example, a capture might contain the four entries written
`◠ ○ ◠ ◠`. It keeps each entry separate, including its original place
in the sequence. A nested expression still occupies only one entry.
A capture can also contain no entries.

This sequence belongs to the captured argument. Its meaning comes from
the definition's matching rules. Double square brackets still have no
inherent meaning. Parentheses, introduced above, can explicitly retain
entries or generate a sequence to supply as an argument.

A sequence is not a number. A range can visit the captured entries to
build a numerical result. These sequence ranges must end: there must
be a last entry to count places from.

#### Give each entry its place

A sequence range gives two names a value on each visit: the entry and its *place*.
Inside a definition where `□⌊⟨◠⟩⌋` captures a sequence, write:

```text
[□⌊⟨◠○⟩⌋ □⌊⟨◠○○⟩⌋ : □⌊⟨◠⟩⌋ : □⌊⟨◠○⟩⌋]
```

The two names have these jobs:

| Name | Value on this visit |
| --- | --- |
| `□⌊⟨◠○⟩⌋` | The current entry |
| `□⌊⟨◠○○⟩⌋` | The count of entries to its right |

The recipe uses the entry itself, so the square range joins the entries.
Visit entries from left to right, but count their places from the right,
starting at `○`. For the captured entries `◠ ○ ◠ ◠`:

| Captured entry | Place |
| --- | --- |
| `◠` | `⟨◠○⟩` |
| `○` | `⟨◠⟩` |
| `◠` | `◠` |
| `◠` | `○` |

The rightmost entry has no entries after it, so its place is `○`.
Moving one entry to the left adds `◠` to the place. This is a distance
from the right edge, distinct from the factor positions inside angle brackets.

For the same capture, this range joins the entries' places:

```text
[□⌊⟨◠○⟩⌋ □⌊⟨◠○○⟩⌋ : □⌊⟨◠⟩⌋ : □⌊⟨◠○○⟩⌋]
    = [⟨◠○⟩ ⟨◠⟩ ◠ ○]
    = ⟨◠◠⟩
```

Read the source sequence's entries using the surrounding names, before
giving either visit name a value. The two names must be distinct. Their
values apply only inside the recipe, where they take over from any outer
names with the same spelling, just as in a count range. Work out each
source entry's value once, in written order;
every entry must have a value even if the recipe does not use it.

Square brackets join the visit results. Put the same header and recipe
inside curly brackets to combine them instead. The visits and places stay
the same, and the results keep their written order. Counting places from
the right does not reverse the order of changes.

An empty sequence makes no visits. Its square range gives `○`; its curly
range gives `◠`. Neither evaluates its recipe.

### Define a positional digit form

One application of definitions is a positional digit notation. Choose
this written pattern:

```text
⟦□⌊◠⌋ : □⌊⟨◠⟩⌋⟧
```

For this definition, let the first argument capture a base expression
and the second capture all the digit entries after the colon. This
division into arguments is part of the chosen pattern. The brackets
and colon do not impose that interpretation on other forms.

Each place has an amount called its *weight*. Moving one place left
makes that place's contribution larger by the chosen base.
With the two-step count as the base, moving left doubles the weight.
The rightmost entry has weight `◠`; the next has weight `⟨◠⟩`, then
`⟨⟨◠⟩⟩`, then `⟨⟨◠○⟩⟩`. An entry in this role is called a *digit*.
Each digit scales its place's weight by that whole count. Equivalently,
it tells how many copies of that weight to join.

For this digit definition, the base must be a whole count ahead of `◠`
on the original path.
Each digit must be a whole count from `○` up to, but not including, the
base. In the two-step base, the allowed digits are `○` and `◠`;
these are called *bits*. Larger bases can use whole UFN expressions
as digits. A nested expression still occupies only one place.

An entry's place is its exponent on the base. Use `□⌊◠⌋` for the base,
`□⌊⟨◠○⟩⌋` for the digit, and `□⌊⟨◠○○⟩⌋` for its place.
The digit contributes:

```text
{□⌊⟨◠○⟩⌋ □⌊◠⌋⌈□⌊⟨◠○○⟩⌋⌉}
```

The final digit uses the exponent `○`, so its weight is `◠`.
Write the digit with the largest place weight first and the one with
weight `◠` last.
The sequence range's existing place rule supplies the exponents in that order.

#### Define the positional shorthand

Let `□⌊◠⌋` capture one base expression and `□⌊⟨◠⟩⌋` capture the
sequence of digit entries after the colon. Use fresh local names
`□⌊⟨◠○⟩⌋` and `□⌊⟨◠○○⟩⌋` for the current digit and its place.

With bases and digits satisfying the rules above, this definition gives
the usual positional reading. An empty sequence has value `○`.
The shorthand adds no arithmetic operation: its expansion
uses the ordinary powers, curly changes, and square joining.

These conditions explain when to call the entries *digits*. The declaration
does not add a hidden check for them. Other entries still follow the same
weighted-sum recipe wherever its ordinary operations have a value. With
no entries, the expansion does not use the base. Restrictions on argument
values would need their own explicit language rule.

The definition is:

```text
≔(
  ⟦□⌊◠⌋ : □⌊⟨◠⟩⌋⟧ :
  [
    □⌊⟨◠○⟩⌋ □⌊⟨◠○○⟩⌋ :
    □⌊⟨◠⟩⌋ :
    {□⌊⟨◠○⟩⌋ □⌊◠⌋⌈□⌊⟨◠○○⟩⌋⌉}
  ]
)
```

The capture `□⌊⟨◠⟩⌋` keeps the whole sequence, including its order
and length. In the range's source slot it supplies the captured entries
directly. It does not need a separate bracket spelling, and it does not
become a sum or a run of text pasted into a numerical expression.

Once this declaration is in effect, matching forms have the positional
meaning just defined. The same marks have no such meaning on their own.

| Name | Role in this definition |
| --- | --- |
| `□⌊◠⌋` | Captured base expression |
| `□⌊⟨◠⟩⌋` | Captured digit sequence |
| `□⌊⟨◠○⟩⌋` | Current digit |
| `□⌊⟨◠○○⟩⌋` | Current digit's place |

The tags distinguish the four named pieces; their particular counts have no
mathematical significance. If a supplied expression already uses one of
the local visit names, expansion renames that local counter and its uses.
It preserves the supplied expression's original references.

#### Follow the contributions

Under this declaration, the four digits of `⟦⟨◠⟩ : ◠ ○ ◠ ◠⟧` expand to:

```text
[
  {◠ ⟨◠⟩⌈⟨◠○⟩⌉}
  {○ ⟨◠⟩⌈⟨◠⟩⌉}
  {◠ ⟨◠⟩⌈◠⌉}
  {◠ ⟨◠⟩⌈○⌉}
]
    = [⟨⟨◠○⟩⟩ ○ ⟨◠⟩ ◠]
    = ⟨◠○○○○⟩
```

Their contributions are the eight-step count, no steps, the two-step count,
and one step. Joining them gives the eleven-step count.

#### Use the ten-step base

Keep the same declaration. Change the base to the ten-step count,
`⟨◠○◠⟩`, and supply two digits:

```text
⟦⟨◠○◠⟩ : ⟨⟨◠⟩⟩ ⟨◠⟩⟧
```

The digits are four and two. The whole nested number `⟨⟨◠⟩⟩`
is one digit, not several places. The rightmost digit has weight one;
the next has weight ten.

| Digit | Place | Weight | Contribution |
| --- | --- | --- | --- |
| `⟨⟨◠⟩⟩` — four | `◠` | `⟨◠○◠⟩` — ten | Four tens: forty steps |
| `⟨◠⟩` — two | `○` | `◠` — one | Two ones: two steps |

Join four tens and two ones to reach forty-two:

```text
[
  {⟨⟨◠⟩⟩ ⟨◠○◠⟩⌈◠⌉}
  {⟨◠⟩ ⟨◠○◠⟩⌈○⌉}
] = ⟨◠○◠◠⟩
```

The rule is unchanged. Moving one place left now makes the weight ten
times as large, rather than twice as large. The base and every digit
are still written in UFN.

#### Keep leading empty places

Under the digit declaration, these written forms have different lengths:

```text
⟦⟨◠⟩ : ○ ○ ◠ ◠⟧
⟦⟨◠⟩ : ◠ ◠⟧
```

The first has four digit places; the second has two. Both numerical
readings give `⟨◠○⟩`. Reading a value can discard details of its spelling.

If a bit string's width matters, preserve the matched writing or its
captured entry sequence. The common numerical result cannot recover
the leading empty places. Further definitions could use that preserved
sequence for operations where width matters.

This declaration only defines the pattern with a base and colon. It gives
no meaning to `⟦○ ○ ◠ ◠⟧` or `⟦⟧`. Either form would need its own
declaration; neither is a built-in sequence literal.

**Try it:** put the declaration above into the playground, followed by
`⟦⟨◠⟩ : ◠ ○ ◠ ◠⟧`. The evaluator expands the form and returns
`⟨◠○○○○⟩`. Include the declaration each time; the brackets alone
do not enable digit notation.

#### Pause and practice: read positional digits

Find the outer brackets first. Keep each complete entry together,
then decide what job it has.

**Marks so far:** The declaration gives `⟦base : entries⟧` its meaning. A place counts entries to the right; leading ○ entries remain in the written list.

Under the digit declaration, read `⟦⟨◠⟩ : ◠ ○ ◠⟧`. What does each place contribute?

<details>
<summary>Check your answer</summary>

With base two, the places give weights four, two, and one. The entries contribute four, no steps, and one: five steps.

```text
[{◠ ⟨◠⟩⌈⟨◠⟩⌉} {○ ⟨◠⟩⌈◠⌉} {◠ ⟨◠⟩⌈○⌉}] = ⟨◠○○⟩
```

</details>

Add ○ at the left of that digit list. Does its numerical value change? Does its length change?

<details>
<summary>Check your answer</summary>

The value stays five: the new left entry contributes no steps and the old entries have the same number of entries to their right. The length grows from three entries to four.

</details>

### Count selections and keep a triangle

Try this after finite curly counters, definitions, and retained sequences.
Recall: an empty curly range gives `◠`. The
[browser experiment](index.html#pascal) builds rows and shows their cancellations.

#### Pick two from three

Set out three differently colored counters: red, blue, and green. Pick two.
The possible groups are red with blue, red with green, and blue with green:
three groups. Picking red and then blue gives the same group as picking
blue and then red. We count the group once.
A selection count like this is called a *binomial coefficient*.

One way to count is to arrange all the counters first. Three counters have
six orders. Each picked pair appears twice because its two counters can
swap places:

| Orders | Same picked group |
|---|---|
| Red, blue, green · Blue, red, green | Red and blue |
| Red, green, blue · Green, red, blue | Red and green |
| Blue, green, red · Green, blue, red | Blue and green |

Share the six orders by the two orders of the picked pair and the one
order of the remaining counter:

```text
{{□ : ◠ … ⟨◠○⟩ : □} | {□ : ◠ … ⟨◠⟩ : □} {□ : ◠ … ◠ : □}}
= ⟨◠○⟩
```

Three selections.

#### Undo the repeated orders

For a larger set, combine every whole count through the available count:
its factorial. Undo the factorial of how many you picked, and the factorial
of how many remain. These remove repeated orders within each group.

The following declaration gives `◆⟪… : …⟫` this meaning. Put the available
count before the colon and the picked count after it. Both must be whole
counts from `○` upward, and you cannot pick more than are available.

```text
≔(◆⟪□⌊◠⌋ : □⌊⟨◠⟩⌋⟫ :
  { {□⌊⟨◠○○⟩⌋ : ◠ … □⌊◠⌋ : □⌊⟨◠○○⟩⌋} |
    {□⌊⟨◠○○⟩⌋ : ◠ … □⌊⟨◠⟩⌋ : □⌊⟨◠○○⟩⌋}
    {□⌊⟨◠○○⟩⌋ : ◠ … [□⌊◠⌋ | □⌊⟨◠⟩⌋] : □⌊⟨◠○○⟩⌋}
  }
)
```

The name tags keep the supplied counts separate from the visiting count:

| Name | Job |
|---|---|
| `□⌊◠⌋` | Available count |
| `□⌊⟨◠⟩⌋` | Count to pick |
| `□⌊⟨◠○○⟩⌋` | Visiting count, local to each finite curly range |

Each range starts at one; an endpoint of `○` gives the empty product, `◠`.

For five available and two picked, the factorials are one hundred twenty,
two, and six. Their ratio is ten. Its cancellation is visible at each place:

| Place | Available factorial | Picked factorial | Left-out factorial | Undo both | Keep |
|---|---|---|---|---|---|
| Five | Once | None | None | None | Once |
| Three | Once | None | Once | Once | None |
| Two | Three times | Once | Once | Twice | Once |

The remaining instructions use five and two once each: `⟨◠○◠⟩`, ten.
The exact evaluator combines and undoes factor instructions. The display
gets its answers from that reducer.

#### Retain every choice count

Define a second form for the entire row. Its round range retains each
selection count, from picking none through picking all:

```text
≔(▱⟪□⌊◠⌋⟫ : (□⌊⟨◠○○⟩⌋ : ○ … □⌊◠⌋ : ◆⟪□⌊◠⌋ : □⌊⟨◠○○⟩⌋⟫))
```

With five available, `▱⟪⟨◠○○⟩⟫` retains:

```text
(◠ ⟨◠○○⟩ ⟨◠○◠⟩ ⟨◠○◠⟩ ⟨◠○○⟩ ◠)
```

One, five, ten, ten, five, one. These count picking none, one, two, three,
four, and all five. Picking nothing is one selection: the empty group.
Picking everything is also one selection. Choosing two to keep gives the
same count as choosing three to leave out.

The marks `◆` and `▱` get their meanings from these declarations.
They add no primitive arithmetic operation.

#### Why the rows make a triangle

Place each row’s entries between those in the row above. A new entry joins
its two neighbors above. The edge entries stay one. These rows are called
*Pascal’s triangle*.

Imagine adding one new colored counter. A picked group either leaves it
out, or includes it. If it leaves it out, pick the whole group from the old
counters. If it includes it, pick one fewer from the old counters. Joining
those two counts gives the new entry.

To pick two from four, three ways leave the new counter out. Three ways
include it and choose one old counter. There are six ways altogether.

The browser evaluates the factorial definition of each row. The
factorial recipe and the two-neighbor rule count the same groups.

#### Pause and practice: count each group once

How many groups pick no counters from five? How many pick all five?

<details>
<summary>Check your answer</summary>

One each. There is one empty group and one group containing every counter.
Empty factorial ranges give `◠`, so both recipes also give `◠`.

</details>

A row begins one, four, six, four, one. Predict the next row’s second and
third entries.

<details>
<summary>Check your answer</summary>

One joined with four gives five. Four joined with six gives ten.
The next row begins one, five, ten.

</details>

<details>
<summary>Use a row in a polynomial</summary>

A polynomial joins powers of an input, scaled by the amounts you supply.
Give the polynomial declaration a Pascal row. It gives the same result as
joining one with the input, then combining that change as many times as
the row’s available count. The row supplies how many times each contribution
occurs when the choices are distributed.

For the two-available row, the amounts are one, two, one. At input two,
the contributions are four, four, one: nine altogether. This is also three
combined with three. Include the polynomial, selection, and row declarations
before using the composed form:

```text
△⟪⟨◠⟩ : ▱⟪⟨◠⟩⟫⟫
```

The browser’s polynomial button includes all the required declarations.

</details>

### Let a list keep going

Can the destinations settle even when visits never stop?

Leave out the last count of a square range:

```text
[□ : ○ … : ⟨◡⟩⌈□⌉]
```

Its first entry is `◠`. The next is a half step, the next a quarter
step, and each new entry is half as long as the one before.

Each entry comes from combining the previous one with the same fixed
amount. Such a list is called *geometric*. The fixed amount is its *ratio*;
here it is a half step.

After any chosen number of visits, we can join the entries written so
far. This result is called a *partial sum*. Each entry is also called
a *term*.

Follow the first three visits and measure what remains.

| Visits so far | New entry | Sum so far | Gap below two steps |
| --- | --- | --- | --- |
| One | `◠` — one step | `◠` — one step | `◠` — one step |
| Two | `⟨◡⟩` — a half | `⟨◠◡⟩` — one and a half | `⟨◡⟩` — a half |
| Three | `⟨[◡ ◡]⟩` — a quarter | `⟨◠○○[\|⟨◠⟩]⟩` — one and three quarters | `⟨[◡ ◡]⟩` — a quarter |

The next entry always fills half the remaining gap. The gap therefore halves again on every visit. Whatever forward distance you choose, repeated halving eventually makes this gap smaller, and later gaps remain smaller.

```text
[⟨◠◡⟩ ⟨[◡ ◡]⟩] = ⟨◠○○[|⟨◠⟩]⟩
```

These partial sums get closer to `⟨◠⟩`. Choose any small
forward distance. After enough visits, the remaining gap is smaller
than that distance, and it stays smaller on every later visit.

That is what it means to *approach a limit*. The limit of this list is
`⟨◠⟩`. We give the whole endless expression that value, even
though no last visit reaches it.

Approaching a limit this way is called *convergence*. We say the partial
sums *converge* to that limit.

An endless list, also called an *unbounded range*, has a value only
when every entry is defined and its partial sums approach a finite
limit. "Finite" rules out an endless distance.

For example, `[□ : ◠ … : ◠]` keeps taking full steps away from
the start, so it has no finite limit. Even entries that get smaller
do not guarantee one: `[□ : ◠ … : {|□}]` also keeps growing
beyond every chosen distance.

The browser begins with a finite preview. Choose **Find the limit** to
ask for an exact proof. A partial sum alone does not establish a limit.

When endless lists contain other endless lists, find their limits from
the inside outward, in written order.

After one more visit, how large is the gap below two steps? Does that visit reach two?

<details>
<summary>Check your answer</summary>

The gap halves from a quarter to an eighth. It is still a forward share, so this finite visit has not reached two.

</details>

#### Read a partial sum, then choose a stopping point

Keep the halving recipe. First complete one gap; then give the same recipe an endpoint.

```text
[□ : ○ … : ⟨◡⟩⌈□⌉]
```

<details>
<summary>Help me read this</summary>

The outer square range joins its entries. The counter starts at ○; the missing last count leaves the range endless. The recipe is the complete power ⟨◡⟩⌈□⌉. Its base stays fixed, while the visited count supplies the instruction between upper corners.

</details>

Each new entry fills half the gap that was left.

| Entries joined so far | Gap below two steps |
| --- | --- |
| One | One step |
| Two | A half step |
| Three | Fill this gap |

Read and complete: what gap remains after three entries? Has that finite sum reached two steps?

<details>
<summary>Check the missing step</summary>

A quarter step remains, so it has not reached two. If you wrote ○, you used the destination of the endless sum as the answer for a finite visit count.

</details>

Write your own: keep the recipe but stop after its first two visits, at ○ and ◠. Add only the missing last count.

<details>
<summary>Check your expression</summary>

Put ◠ after the dots. There are two visits because both ends are included. If you stopped at ⟨◠⟩, you included a third visit.

```text
[□ : ○ … ◠ : ⟨◡⟩⌈□⌉] = ⟨◠◡⟩
```

</details>

Recall powers: what is `⟨◡⟩⌈○⌉`? This is why the first entry is a whole step.

<details>
<summary>Check the earlier rule</summary>

Making none of the base change leaves the starting step ◠.

```text
⟨◡⟩⌈○⌉ = ◠
```

</details>

#### Let a curly counter keep going

Curly ranges may omit their endpoint too. Start with `◠`. On each
visit, combine the new entry on the right of the result so far. Each
finite result is a *partial product*. The endless expression has the
limit of those partial products, provided every entry is defined and
the limit is finite.

Here is a product whose shares cancel across successive visits:

```text
{□ : ◠ … : {[□ ◠] [□ ◠] | □ [□ ⟨◠⟩]}}
```

Apply the first three changes in order.

| Visit | New change | Product so far | Gap below two |
| --- | --- | --- | --- |
| First | `{⟨⟨◠⟩⟩ \| ⟨◠○⟩}` — four thirds | `{⟨⟨◠⟩⟩ \| ⟨◠○⟩}` — four thirds | `{⟨◠⟩ \| ⟨◠○⟩}` — two thirds |
| Second | `{⟨⟨◠⟩○⟩ \| ⟨⟨◠○⟩⟩}` — nine eighths | `{⟨◠○⟩ \| ⟨◠⟩}` — three halves | `⟨◡⟩` — a half |
| Third | `{⟨⟨⟨◠⟩⟩⟩ \| ⟨◠◠○⟩}` — sixteen fifteenths | `{⟨⟨◠○⟩⟩ \| ⟨◠○○⟩}` — eight fifths | `{⟨◠⟩ \| ⟨◠○○⟩}` — two fifths |

Look at the first two changes as factor instructions. Their unused factors cancel in matching places:

```text
{{⟨⟨◠⟩⟩ | ⟨◠○⟩} {⟨⟨◠⟩○⟩ | ⟨⟨◠○⟩⟩}} = {⟨◠○⟩ | ⟨◠⟩}
```

The four in the first share removes two of the three doublings in the eight below the second share. The three below the first removes one of the two three-step factors in the nine above the second. That leaves three shared by two.

<details>
<summary>Why the cancellation continues at every visit</summary>

After a forward whole count `N` of visits, its value is
`{⟨◠⟩ [N ◠] | [N ⟨◠⟩]}`. Here `N` is an explanatory
placeholder. Its gap below `⟨◠⟩` is `{⟨◠⟩ | [N ⟨◠⟩]}`,
which keeps shrinking toward `○`. The product's limit is `⟨◠⟩`.

At each new visit, the old boundary factors cancel with matching factors
in the new share. Only the next boundary factors remain. This gives the
formula above, and its shrinking gap establishes the limit.

</details>

A limit of `○` is allowed. For example, `{□ : ◠ … : ⟨◡⟩}`
keeps halving its partial product. This convention defines a product by
its finite-stage limit, including zero. Some conventional definitions
reserve the phrase “convergent infinite product” for a limit different
from `○`, also called a *nonzero* limit.
An entry of `○` never excuses an undefined later entry.

Neither shrinking nor nearly unchanged entries alone establish a limit.
`{□ : ◠ … : ◡}` alternates between opposing steps, and
`{□ : ◠ … : {[□ ◠] | □}}` grows to the next whole count after
each visit, even though its entries approach `◠`.

Always keep written order. This will also apply to changes along different
directions. A nested limit is found from the inside outward, for each
fixed value of its surrounding counters. In preview mode, the browser
uses a finite visit count at each previewed range. Increasing all those
counts together need not approach the nested limit.

#### Unfold finite factor choices

Begin with only the first two unique factors. Allow each of their
instructions to be `○`, `◠`, or `⟨◠⟩`: no uses, one use,
or two uses. Choose one instruction for each place. The resulting grid is:

| Uses of the second factor ↓ / first factor → | `○` | `◠` | `⟨◠⟩` |
| --- | --- | --- | --- |
| `○` | `⟨○○⟩` | `⟨○◠⟩` | `⟨○⟨◠⟩⟩` |
| `◠` | `⟨◠○⟩` | `⟨◠◠⟩` | `⟨◠⟨◠⟩⟩` |
| `⟨◠⟩` | `⟨⟨◠⟩○⟩` | `⟨⟨◠⟩◠⟩` | `⟨⟨◠⟩⟨◠⟩⟩` |

Every cell makes a different whole count. A third factor adds another
direction of choices to the grid. Allowing more uses extends each side.
The browser animates these choices unfolding into a collection of whole
numbers, with familiar decimal readings alongside the factor instructions.

Small grids leave gaps. A grid using only the first two factors cannot
reach the third unique factor. As both the available factors and their
allowed uses increase, every forward whole count appears exactly once.

This is the **Fundamental Theorem of Arithmetic** expressed as choices
at factor places: every such count has one set of whole factor instructions.
The all-`○` choice supplies `◠`.

#### From the finite grid to an Euler product

Give each grid cell a contribution: combine its count with itself, then
take the reciprocal. There are two ways to find the total:

- Visit every cell and join its contribution.
- For each available factor, list the reciprocal-square powers for its
  allowed uses. Then combine those lists.

Distributing the lists chooses exactly one use count at every place and
visits the same grid. The two methods give the same finite total.

Use only zero or one copy of each of the first two factors.

| Uses of two | Uses of three | Whole count | Reciprocal of its square |
| --- | --- | --- | --- |
| None | None | `◠` — one | `◠` — one |
| Once | None | `⟨◠⟩` — two | `{\|⟨⟨◠⟩⟩}` — one quarter |
| None | Once | `⟨◠○⟩` — three | `{\|⟨⟨◠⟩○⟩}` — one ninth |
| Once | Once | `⟨◠◠⟩` — six | `{\|⟨⟨◠⟩⟨◠⟩⟩}` — one thirty-sixth |

In thirty-sixths, the four contributions are thirty-six, nine, four, and one. They join to fifty thirty-sixths, or twenty-five eighteenths. Now find the same total by combining the two short lists:

```text
{[◠ {|⟨⟨◠⟩⟩}] [◠ {|⟨⟨◠⟩○⟩}]} = [◠ {|⟨⟨◠⟩⟩} {|⟨⟨◠⟩○⟩} {|⟨⟨◠⟩⟨◠⟩⟩}]
```

```text
[◠ {|⟨⟨◠⟩⟩} {|⟨⟨◠⟩○⟩} {|⟨⟨◠⟩⟨◠⟩⟩}] = {⟨⟨◠⟩○○⟩ | ⟨⟨◠⟩◠⟩}
```

<details>
<summary>Explore further: the complete Euler product and its domain</summary>

For a factor `P`, allowing every whole use count makes the list
`[◠ P⌈[|⟨◠⟩]⌉ P⌈[|⟨⟨◠⟩⟩]⌉ …]` in explanatory
expanded writing. It is a geometric sum with value
`{|[◠ | P⌈[|⟨◠⟩]⌉]}`. The ellipsis in this expanded illustration
is prose shorthand; a full counter expression supplies the formal recipe.

Now allow every factor position. The matching sum and product are:

```text
[□ : ◠ … : {|□⌈⟨◠⟩⌉}]

{□ : ◠ … : {|[◠ | ⟨[◡ ◡]⟩⌊□⌋]}}
```

The square counter visits whole counts. The curly counter visits factor
positions: `⟨◠⟩⌊□⌋` selects the current unique factor, while
`⟨[◡ ◡]⟩⌊□⌋` gives its reciprocal square. Each factor's
geometric list permits all whole instructions at that position. Unique
factorization ensures every whole count's reciprocal square occurs once.

These contributions all point forward and have a finite total. One way to see it is
to group the whole counts between successive doublings: each group's
total is bounded by a geometric sequence of halves. The finite grids
increase to the same total as the whole-count sum. Thus the two limits
agree.

Their equality is an **Euler product**, and the shared value is
the **Riemann zeta function** at the two-step input.

A recipe that takes an input and supplies an answer is called a
*function*. Here the input chooses the exponent in the recipe.

The first few visits do not give equal partial results:

- The finite product already includes every whole number of uses of its
  selected factors.
- The finite sum includes only whole counts through its endpoint.

Their common limit is about 1.64493406685. The evaluator can preview these
expressions; it does not yet establish their equality of limits. See the
[Euler-product equality](https://dlmf.nist.gov/27.4.E3).

For a general fixed exponent, use `Q` as an explanatory placeholder:

```text
[□ : ◠ … : □⌈[|Q]⌉]
{□ : ◠ … : {|[◠ | ⟨◠⟩⌊□⌋⌈[|Q]⌉]}}
```

Here `Q` must be ahead of `◠` on the original path. The power form
lets us choose any such fixed exponent.

The sum of contribution sizes is finite in this region, which justifies
expanding and regrouping the factor choices. At the one-step input the
sum and product grow without a finite limit. The broader conventional
zeta function has a separate extension to other inputs; these recipes
define it only where their limits exist. See the
[definition and its domain](https://dlmf.nist.gov/25.2#i).

</details>

#### Join the shares made by factorials

Take the reciprocal of each factorial, beginning with the empty product,
and join the results:

```text
[□ : ○ … : {|{□⌊⟨◠⟩⌋ : ◠ … □ : □⌊⟨◠⟩⌋}}]
```

Keep the two counters' jobs separate. The outer count chooses the
endpoint; the inner range makes its whole-count factorial. The curly bar
then takes that answer's reciprocal.

| Outer count | Inner factorial | Contribution to join | Sum so far |
| --- | --- | --- | --- |
| `○` — zero | `◠` — empty product | `◠` — one | `◠` — one |
| `◠` — one | `◠` — one | `◠` — one | `⟨◠⟩` — two |
| `⟨◠⟩` — two | `⟨◠⟩` — two | `⟨◡⟩` — a half | `⟨◠○◡⟩` — two and a half |
| `⟨◠○⟩` — three | `⟨◠◠⟩` — six | `⟨◡◡⟩` — a sixth | `⟨◡⟨◠○⟩⟩` — two and two thirds |

The first inner range has no visits. Its product is `◠`, so its
reciprocal is also `◠`. Starting at zero supplies an entry; it does not
skip the first visit.

Each later contribution is the preceding share divided into as many
pieces as the new outer count. After the first two entries, every such
count is at least two. The remaining contributions fit beneath a shrinking
halving tail, so the partial sums settle.

The partial sums approach a finite limit called the *exponential constant*.
Write `┌┘` as its short name. The two marks together name one value;
they do not enclose anything.

A *constant* is a fixed value. We can give this one its name with a
declaration, just as we named the shorter journeys earlier:

```text
≔(
  ┌┘ :
  [□ : ○ … : {|{□⌊⟨◠⟩⌋ : ◠ … □ : □⌊⟨◠⟩⌋}}]
)
```

The name means the complete limit, independent of any finite preview.
The calculator already knows this name, so you can use it without copying
the declaration. Its meaning is fixed, as is the turn name introduced next.
The written declaration shows the recipe that defines the value.
The calculator keeps it in exact recipes and offers an optional decimal
reading. Type `\exp` in the editor to insert both marks at once.

#### Measure a whole turn

Draw a circle. Measure the distance from its center to its rim.
Then ask how many lengths of that size fit along the whole rim.

The answer is the same for every circle. Call that amount *a turn*,
and write `⟳` as its short name.
Measuring part of a turn works the same way: use the distance along that
part of the rim, shared by the center-to-rim length.

Here is an endless recipe whose limit is the amount of a turn:

```text
[□ : ○ … : {⟨⟨⟨◠⟩⟩⟩ | [{⟨⟨◠⟩⟩ □} ◠] [{⟨⟨◠⟩⟩ □} ⟨◠○⟩]}]
```

Read one visit in these steps:

1. Make four copies of the current count.
2. Join one step to that result for the first count.
3. Join three steps to the same result for the second count.
4. Combine those two counts in curly brackets.
5. Share sixteen steps by that answer.

The outside square range joins the shares from all visits.

First turn recipe: combine the two counts, then share sixteen by the result.

| Counter | Four times that count | The two counts to combine | New share |
| --- | --- | --- | --- |
| `○` — zero | Zero | One and three | `{⟨⟨⟨◠⟩⟩⟩ \| ⟨◠○⟩}` — sixteen thirds |
| `◠` — one | Four | Five and seven | `{⟨⟨⟨◠⟩⟩⟩ \| ⟨◠◠○○⟩}` — sixteen thirty-fifths |
| `⟨◠⟩` — two | Eight | Nine and eleven | `{⟨⟨⟨◠⟩⟩⟩ \| ⟨◠○○⟨◠⟩○⟩}` — sixteen ninety-ninths |

<details>
<summary>Explore further: a second recipe for a turn</summary>

Another recipe for a turn starts with four and makes each next entry
from the preceding one:

```text
[□ : ○ … :
  {⟨⟨◠⟩⟩
    {□⌊⟨◠⟩⌋ : ◠ … □ :
      {□⌊⟨◠⟩⌋ | [{⟨◠⟩ □⌊⟨◠⟩⌋} ◠]}
    }
  }
]
```

To make the next entry, combine the preceding entry with the new
counter value, then share by twice that counter with another step
joined to it. The empty inner range supplies the first entry.

Second turn recipe: apply the new inner change to the preceding entry.

| Outer count | New inner change | Entry to join |
| --- | --- | --- |
| `○` — zero | No inner visits | `⟨⟨◠⟩⟩` — four |
| `◠` — one | `{◠ \| ⟨◠○⟩}` — one third | `{⟨⟨◠⟩⟩ \| ⟨◠○⟩}` — four thirds |
| `⟨◠⟩` — two | `{⟨◠⟩ \| ⟨◠○○⟩}` — two fifths | `{⟨⟨◠○⟩⟩ \| ⟨◠◠○⟩}` — eight fifteenths |

The first three entries join to four plus four thirds plus eight fifteenths:
sixty fifteenths, twenty fifteenths, and eight fifteenths.

```text
[⟨⟨◠⟩⟩ {⟨⟨◠⟩⟩ | ⟨◠○⟩} {⟨⟨◠○⟩⟩ | ⟨◠◠○⟩}] = {⟨◠○○○⟨◠○⟩⟩ | ⟨◠◠○⟩}
```

The total is eighty-eight fifteenths, still a finite approximation.
These tables check how the recipes run. Showing that their complete
limits equal the rim measurement needs a further geometric argument.

</details>

The symbol `⟳` names the complete amount. It can take part in a recipe:
`{⟳ | ⟨⟨◠⟩⟩}` is a quarter of a turn. The circular arrow reminds us
of the whole rim; it does not choose where or which way to turn.
Direction attachments will supply that information.

The browser keeps `⟳` in exact expressions and can show its decimal
reading. It does not replace it with a finite sum or a rounded number.
Type `\turn` in the editor, or use the turn button, to insert the symbol.

These formulas describe the amount of a turn exactly. The browser shows
finite partial sums as approximations; its current rules do not establish
these limits.

The earlier reciprocal-square sum has a useful relationship to this amount:
its limit is a turn squared, shared by twenty-four. See the
[relationship between these limits](https://dlmf.nist.gov/25.6.E1).

#### Pause and practice: finite visits and endless values

**Marks so far:** An omitted endpoint keeps a counter going. Square ranges join; curly ranges combine. A finite preview is the result of only the visits you chose.

The first three visits of the halving sum leave a quarter-step gap below two. Predict the next gap and explain why later gaps stay smaller.

<details>
<summary>Check your answer</summary>

The next gap is an eighth. Every new entry fills half the remaining gap, so every later gap is another half as large.

</details>

The finite factor grid uses the two-step and three-step factors at most once each. Does its total already include a contribution from five, or from four?

<details>
<summary>Check your answer</summary>

Neither. Five needs another factor place. Four needs two uses of the two-step factor. Expanding the choices adds those cells; the four-cell total is a finite calculation.

</details>

### Ask which exponent reaches a target

Which exponent reaches the target we chose?

A bar asks an undoing question inside the brackets that hold it: square brackets undo a journey; curly brackets undo a change. Inside upper corners, the question is which exponent would reach the target.

We know the change we want to repeat, and we know where we want to finish.
Which exponent connects them? Put a bar inside the upper corners, followed
by the target:

```text
⟨◠⟩⌈|⟨⟨◠○⟩⟩⌉ = ⟨◠○⟩
```

The base is the two-step factor and the target is the eight-step count.
Three full changes reach that target, so the answer is the three-step count.
This answer is called a *logarithm*.

The answer can also ask for part of a change, or for undoing a change:

```text
⟨⟨◠⟩⟩⌈|⟨◠⟩⌉ = ⟨◡⟩
⟨◠⟩⌈|⟨◡⟩⌉ = ◡
⟨◠⟩⌈|◠⌉ = ○
```

The first asks how much of a fourfold change gives a twofold change: a half.
The second reaches a half by undoing a twofold change.
The last reaches `◠` by making no change at all.

Begin with both base and target forward of `○` on the original path.
The base cannot be `◠`: every power of `◠` gives `◠`, so it cannot
pick out one exponent. With these rules the answer is unique on that path.
For targets in other directions, we will [choose a turn](#find-an-exponent-that-turns)
as well as a size change.

When the factor instructions are whole counts or shares of whole counts,
try to find an exponent of that same kind:

1. Choose a place where the base instruction differs from `○`.
2. Share the target instruction by that base instruction. This proposes
   an exponent.
3. Apply that exponent to every base instruction. Check that each reaches
   its matching target instruction, including the skipped places.

For example:

```text
⟨◠◠⟩⌈|⟨⟨◠⟩⟨◠⟩⟩⌉ = ⟨◠⟩
```

Both places change from `◠` to `⟨◠⟩`, so the answer is `⟨◠⟩`.
A *rational number* is a whole count or a share of whole counts,
forward or backward, including `○`.

A failed comparison does not make the logarithm undefined. Some questions
have no rational answer, such as asking which exponent takes the two-step
base to the three-step target:

```text
⟨◠⟩⌈|⟨◠○⟩⌉
```

That expression still names an exact value under the forward-base and
forward-target rules. The calculator tries to replace it with a simpler
expression of the same value, a process called *reduction*. If it cannot
finish, it keeps the recipe.

#### Change the base, then ask

An expression before the bar first raises the base to that exponent.
The resulting value becomes the base of the logarithm:

```text
BASE⌈E|X⌉ = BASE⌈E⌉⌈|X⌉
```

The words and letters here are placeholders for complete expressions.
For example, first turn the two-step base into the eight-step base,
then ask which exponent reaches the four-step target:

```text
⟨◠⟩⌈⟨◠○⟩|⟨⟨◠⟩⟩⌉ = ⟨◡◠⟩
```

The answer is two thirds. The changed base must satisfy the same logarithm
rules. In particular, a `○` before the bar would make the base `◠`,
which cannot be used for a logarithm.

#### Pause and practice: ask for the exponent

Marks to use: `⌈…⌉` supplies an exponent; `⌈|…⌉` asks which exponent reaches a target.

What exponent takes the two-step base to four steps? Check by using that exponent.

<details>
<summary>Check your answer</summary>

Two uses of the doubling change reach four.

```text
⟨◠⟩⌈|⟨⟨◠⟩⟩⌉ = ⟨◠⟩
```

```text
⟨◠⟩⌈⟨◠⟩⌉ = ⟨⟨◠⟩⟩
```

</details>

What exponent takes the same base to a half step: a half, or a backward step?

<details>
<summary>Check your answer</summary>

A backward step: undo the doubling once. A half exponent asks for one equal stage of doubling, which is a different change.

```text
⟨◠⟩⌈|⟨◡⟩⌉ = ◡
```

```text
⟨◠⟩⌈◡⌉ = ⟨◡⟩
```

</details>

### Let an exponent choose a turn

We can now give the exponent a direction. The base still describes a
forward amount along `@○`.

For example, `⟨◠⟩⌈◠@○⌉` gives the full doubling change:

```text
⟨◠⟩⌈◠@○⌉ = ⟨◠⟩@○
```

Change the exponent to `◠@◠`. The result of
`⟨◠⟩⌈◠@◠⌉` has size `◠` and points between `@○` and
`@◠`. It describes part of a turn. Both the base and the exponent determine
how far it turns.

A backward amount along the same exponent direction undoes that turn:

```text
{⟨◠⟩⌈◠@◠⌉ ⟨◠⟩⌈◡@◠⌉} = ◠@○
```

An exponent can ask for size and direction changes together. Here the
part along `@○` supplies the doubling, and the part along `@◠`
supplies the same turn as before:

```text
⟨◠⟩⌈[◠@○ ◠@◠]⌉ = {⟨◠⟩@○ ⟨◠⟩⌈◠@◠⌉}
```

Curly brackets combine the changes supplied as entries. Upper corners
derive a change from a base and an exponent. Whole forward exponents
on `@○` allow us to find that change by repeating curly entries.
Shares and directional exponents use the broader power rule given below.

#### Find an exponent that turns

A logarithm can ask for a target away from the original path too:

```text
⟨◠⟩⌈|◠@◠⌉
```

This asks for an exponent that turns the two-step base into one step along
`@◠`. Turning farther by a whole turn could reach the same destination.
We choose the exponent with the smallest amount away from `@○`.
This choice is called the *principal logarithm*.

A rule for choosing among exponents that reach the same target is called
a *branch*. The principal choice is the branch used here.

The target's contributions along the other three paths choose a direction
for the turn. It can be a mixture of those paths; no one path is preferred.
Together with `@○`, that direction gives the plane in which to turn.

- A forward target on `@○` needs no turn. Use its path logarithm.
- A target with any nonzero part away from `@○` uses the principal choice.
- A backward target on `@○` needs a half turn, but does not choose a plane.
  An explicit plane or branch choice is required; there is no syntax for it yet.
- `○` has no logarithm. No finite exponent reaches it from an allowed base.

The base stays forward of `○` on `@○` and different from `◠`.
These rules also apply after the base change in `BASE⌈E|X⌉`.

Taking the logarithm and then using its exponent recovers the target:

```text
⟨◠⟩⌈⟨◠⟩⌈|◠@◠⌉⌉ = ◠@◠
```

This equality holds for every allowed base and target. Such a general
equality is called an *identity*. The evaluator can reduce this identity
exactly. A directed logarithm by
itself currently stays as a recipe, with an optional decimal reading.

Reversing the order has a different effect. A power may make extra whole
turns; its principal logarithm does not remember them. So `B⌈|B⌈Q⌉⌉`
need not give back a directed `Q`. It can also land on the backward path,
where the logarithm still needs a plane choice.

#### Make a full turn through an exponent

Use the exponential constant as the base. Put the amount of a turn
along `@◠` in its exponent. This carries the result all the way around
in the plane of `@○` and `@◠`, returning to the forward step `◠@○`.

Writing both recipes out gives:

```text
[[□ : ○ … : {|{□⌊⟨◠⟩⌋ : ◠ … □ : □⌊⟨◠⟩⌋}}]@○]⌈
  [□ : ○ … : {⟨⟨⟨◠⟩⟩⟩ | [{⟨⟨◠⟩⟩ □} ◠] [{⟨⟨◠⟩⟩ □} ⟨◠○⟩]}]@◠
⌉ = ◠@○
```

Replacing the exponent's direction label by `⟨◠⟩` or `⟨◠○⟩`
gives the same result for a full turn in either of the other planes
containing `@○`.

Using the short names for the exponential constant and a turn:

```text
┌┘⌈⟳@◠⌉ = ┌┘⌈⟳@⟨◠⟩⌉ = ┌┘⌈⟳@⟨◠○⟩⌉ = ◠@○
```

Putting `⟳` along `@○` instead changes size: `┌┘⌈⟳@○⌉` grows along
the original path. It does not make a turn or return to `◠`.

The turn cases also show why a logarithm cannot recover every exponent:

```text
┌┘⌈|┌┘⌈⟳@◠⌉⌉ = ○
```

After the full turn the target is `◠`, whose principal logarithm is `○`.
The original exponent `⟳@◠` has made a turn that the target does not record.

The calculator reduces the short full-turn expression exactly. Expanding
both constants into unbounded sums still needs a limit argument; finite
previews of those sums only approximate the identity.

#### Stop partway around

A quarter turn reaches the other forward axis in the chosen plane. A half
turn reaches the backward step on the original path. Another quarter turn
reaches the other backward axis. A full turn brings us home.

```text
┌┘⌈{⟳ | ⟨⟨◠⟩⟩}@◠⌉ = ◠@◠
┌┘⌈{⟳ | ⟨◠⟩}@◠⌉ = ◡
┌┘⌈[|{⟳ | ⟨⟨◠⟩⟩}]@◠⌉ = ◡@◠
```

An eighth turn is halfway to the quarter-turn destination. Its two forward
components are equal. Their squares join to `◠`, so each component is
`⟨[|⟨◡⟩]⟩`: the reciprocal of the root of the two-step count.

```text
┌┘⌈{⟳ | ⟨⟨◠○⟩⟩}@◠⌉ = [⟨[|⟨◡⟩]⟩@○ ⟨[|⟨◡⟩]⟩@◠]
```

The same rules work on either of the other turning axes. Extra whole turns
do not change the destination. These eighth-turn steps reduce exactly in
the evaluator, including backward turns. Other turn amounts may keep their
recipes.

#### Read the components of a turn

Start at `◠@○`, then turn in the plane of `@○` and `@◠`.
Its amount along the original path is called the **cosine** of the turn
amount. Its amount along the other path is called the **sine**.
Either reading can be forward, backward, or `○`. A backward reading is
written with a backward step or a whole journey reversed by `[|…]`.

With `□` standing for the supplied turn amount, the two recipes are:

```text
┌┘⌈□@◠⌉#○
┌┘⌈□@◠⌉#◠
```

The amount `⟳` makes a complete turn. For a quarter turn, the original
path's reading is `○` and the other path's reading is `◠`:

```text
┌┘⌈{⟳ | ⟨⟨◠⟩⟩}@◠⌉#○ = ○
┌┘⌈{⟳ | ⟨⟨◠⟩⟩}@◠⌉#◠ = ◠
```

Share the sine by the cosine to get the **tangent**:

```text
{┌┘⌈□@◠⌉#◠ | ┌┘⌈□@◠⌉#○}
```

At an eighth turn the two readings are equal, so the tangent is `◠`.
At a quarter turn the amount after the curly bar is `○`, so the tangent
has no value.
These recipes use powers, components, and sharing; they need no new
operators. The study of these turn readings is called *trigonometry*.

To find the turn amount of a journey in the plane of `@○` and `@◠`,
take its principal logarithm with
base `┌┘`, then read the `@◠` amount. Here the first named box supplies
the original-path amount and the second supplies the sideways amount:

```text
┌┘⌈|[□⌊◠⌋@○ □⌊⟨◠⟩⌋@◠]⌉#◠
```

When the sideways amount differs from `○`, this gives a turn between a backward
half turn and a forward half turn. A forward journey on the original path
has turn amount `○`. A backward journey on that path still needs a branch
choice, and the zero journey has no angle. Thus this serves the usual
two-component angle calculation away from that unresolved branch.

Extraction is exact when its input reduces. General powers and logarithms
can still keep their recipes, with optional decimal readings.

<details>
<summary>Explore further: directed inputs in the Euler product</summary>

#### Return to the Euler product with directions

The earlier [Euler-product construction](#from-the-finite-grid-to-an-euler-product)
also accepts a directed exponent. Its `@○` coefficient must be ahead of `◠`.
Use the complete power form: a directed exponent cannot occupy an
angle-bracket place.

For example, choose `[⟨◠⟩@○ ◠@◠]` as that exponent. All the bases are
forward amounts on `@○`. Their powers stay in the same plane, formed by
`@○` and the chosen exponent's other direction. These particular powers
can be combined in either order.

Their contribution sizes have a finite total, so the usual complex-plane
Euler-product argument applies in that plane. Other directed products
still need their written order. See the
[Euler-product identity](https://dlmf.nist.gov/27.4.E3).

</details>

#### Pause and practice: amounts and turns

**Marks so far:** `⟳` is the amount of a whole turn; the exponent’s @ label chooses a turning axis. `#` reads a component.

A half turn along @◠ sends a forward step where? Read the original-path component afterward.

<details>
<summary>Check your answer</summary>

It reaches the backward step on the original path; that component is ◡.

```text
┌┘⌈{⟳ | ⟨◠⟩}@◠⌉#○ = ◡
```

</details>

Does `┌┘⌈⟳@○⌉` return to a forward step, just as `┌┘⌈⟳@◠⌉` does?

<details>
<summary>Check your answer</summary>

No. An exponent along @○ changes size. Along @◠ it turns; a whole turn returns to the starting step. The same amount has different effects because of its direction label.

</details>

### Retain a complete Fourier transform

Which turning pattern makes these samples line up?

A sequence of measurements or other supplied values gives us *samples*.
The Fourier recipe makes a new sequence from them. Each output entry,
called a *Fourier coefficient*, joins the samples after giving each one
a chosen turn. An outside range retains these outputs separately.

A *frequency count* chooses how quickly the turns advance through the
sample positions. At `○`, none of the samples turn. At `◠`, each next
sample turns backward by a whole turn shared by the sample count. At
`⟨◠⟩`, that change is twice as large, and so on.

A useful question is: what repeating pattern does a list contain?
Start with samples `(◠ ◡ ◠ ◡)`. Their ordinary sum is `○`,
even though they alternate forward and backward.

Choose turns that advance by a half turn at each entry. The first and
third samples stay as they are. The second and fourth turn halfway
around, so every contribution becomes `◠`. Joining them gives
`⟨⟨◠⟩⟩`. This is the output at frequency count `⟨◠⟩`.
The complete output sequence is `(○ ○ ⟨⟨◠⟩⟩ ○)`.

At frequency count two, advance by half a turn for each sample.

| Sample place from left | Sample | Backward turn | Change to apply | Contribution |
| --- | --- | --- | --- | --- |
| `○` — zero | `◠` | None | `◠` | `◠` |
| `◠` — one | `◡` | Half a turn | `◡` | `◠` |
| `⟨◠⟩` — two | `◠` | A whole turn | `◠` | `◠` |
| `⟨◠○⟩` — three | `◡` | One and a half turns | `◡` | `◠` |

```text
[{◠ ◠} {◡ ◡} {◠ ◠} {◡ ◡}] = ⟨⟨◠⟩⟩
```

All four contributions point forward, giving four steps. At frequency count zero, every change is ◠; the original forward and backward samples then cancel.

Each output asks how strongly the samples line up with its chosen
turning pattern. Matching contributions reinforce one another; other
contributions can cancel. That gives the new list a purpose beyond
simply computing another set of numbers.

<details>
<summary>Explore further: build the complete Fourier recipe</summary>

First define a convenient spelling for a sequence's length. The marks `◇⟪…⟫`
get this meaning from the declaration:

```text
≔(
  ◇⟪□⌊◠⌋⟫ :
  [□⌊⟨◠⟩⌋ □⌊⟨◠○⟩⌋ : □⌊◠⌋ : ◠]
)
```

The sequence header gives a place from the right. Undo that place and `◠`
from the length to obtain a place from the left. The first sample therefore
has left place `○`.

Now declare the transform:

```text
≔(
  ⟦□⌊◠⌋⟧ :
  (
    □⌊⟨⟨◠⟩⟩⌋ : ◠ … ◇⟪□⌊◠⌋⟫ :
    [
      □⌊⟨◠⟩⌋ □⌊⟨◠○⟩⌋ : □⌊◠⌋ :
      {
        □⌊⟨◠⟩⌋
        ┌┘⌈[|{
          ⟳
          [□⌊⟨⟨◠⟩⟩⌋ | ◠]
          [◇⟪□⌊◠⌋⟫ | ◠ □⌊⟨◠○⟩⌋]
          | ◇⟪□⌊◠⌋⟫
        }]@◠⌉
      }
    ]
  )
)
⟦○ ◠ ○ ○⟧
```

Read the layers from outside inward:

1. Retain one coefficient per sample. The outside count starts at `◠`;
   undoing `◠` gives frequency positions starting at `○`.
2. For each coefficient, visit the samples in written order.
3. Combine the frequency position with the sample's left place, and share
   by the sample count. Take that fraction of a turn backward along `@◠`.
4. Apply the resulting change on the right of the sample, then join the
   contributions for that coefficient.

The example has one forward step in its second sample. Its four coefficients
are `◠`, `◡@◠`, `◡`, and `◠@◠`. The evaluator reduces all four exactly.
Eight samples introduce eighth turns, whose components use the roots above.
Their coefficients also reduce exactly when the sample arithmetic can reduce.

</details>

For samples in the plane of `@○` and `@◠`, this is the conventional forward
discrete Fourier transform (DFT). We keep the joined amounts as they are,
without sharing them by the sample count or applying any other overall
size change. The recipe also accepts samples along the other
directions, using the explicitly written right-side changes. Moving those
changes to the left can give a different transform.

An empty sample sequence makes no outer visits and returns `()`. Double
square brackets have the meaning given by this declaration within its
document; use a separate document for the earlier digit declaration.

#### Keep useful definitions together

A library can choose distinct written forms so its declarations work in one
document. One useful recipe joins whole powers of an input, each scaled by
a supplied amount. This is called a *polynomial*; those supplied amounts
are its *coefficients*. The playground supplies this small set:

| Form | What to supply | What it gives |
| --- | --- | --- |
| `◇⟪…⟫` | A sequence | Its number of outer entries |
| `⟦… : …⟧` | A base, then digits | Their positional reading |
| `△⟪… : …⟫` | An input, then coefficients | A polynomial's value |
| `∿⟪… : …⟫` | A frequency count, then samples | One Fourier coefficient |
| `⟪…⟫` | Samples | A sequence of all Fourier coefficients |

Each form still needs its declaration. Open a library example to see that
declaration and any earlier forms it uses. **Show expansion** replaces the
arguments with the supplied expressions and shows the resulting recipe.
The result appears as a separate step.

For a polynomial, write the highest-power coefficient first and the constant
last. For each coefficient, combine the input with itself once per place to
its right, then apply that change on the coefficient's right. Join the
contributions. Finite curly repetition makes this work for directed inputs
too. For instance, coefficients `(◠ ○ ◠)` describe the input combined with
itself, joined with `◠`. At input `◠@◠`, the two contributions cancel.

The library's complete Fourier form uses the single-coefficient form inside
its outer range. Both apply turns on the right, as in the full recipe above.
Their marks are convenient names for these declarations; they add no
arithmetic rules.

#### Pause and practice: follow the samples

**Marks so far:** The frequency count chooses a turning pattern. Keep sample order, apply each change on the right, then join for one output.

The half-turn change is ◡. Do we join that backward step to a sample, or apply it in curly brackets? Try a backward sample both ways.

<details>
<summary>Check your answer</summary>

The Fourier recipe applies the change. Reversing a backward sample gives a forward contribution. Joining would walk farther backward.

```text
{◡ ◡} = ◠
```

```text
[◡ ◡] = [|⟨◠⟩]
```

</details>

At frequency count two, replace the second sample by ○. Keep four sample places. Which row changes, and what is the new output there?

<details>
<summary>Check your answer</summary>

Only the second row loses its forward contribution. The other three still contribute ◠, giving three steps. Keeping four places preserves the turning pattern.

```text
[{◠ ◠} {○ ◡} {◠ ◠} {◡ ◡}] = ⟨◠○⟩
```

</details>

### Choose a measuring place

Can we judge a gap by its factors instead of its length?

Lower corners can select a number’s factor position, tag a box’s name, or read a sequence entry. After a completed endless range, they select how to measure gaps. The object before the corners tells you which job applies.

An endless journey needs a rule for deciding whether its destinations
settle somewhere. Begin by finding the difference between two destinations.
That difference is their *gap*.

Ordinary distance measures the gap's length. Another rule chooses one
unique factor: every extra forward use of that factor in the gap makes
the measured distance smaller by that factor. A zero gap has distance
`○`. Reversing a gap with `[|…]` leaves its distance unchanged.

For example, at the first factor place, a gap of `⟨⟨◠○⟩⟩`
has measured size `⟨[|⟨◠○⟩]⟩`: its three uses become three
backward uses when measuring. A gap of `⟨◡⟩` has measured size
`⟨◠⟩`. Two numbers' closeness is determined by their difference.

#### Select the measurement of an endless range

Put lower corners after the complete square or curly range:

```text
[□ : ○ … : ⟨◠⟩⌈□⌉]⌊◠⌋
{□ : ◠ … : ⟨◠⟩}⌊◠⌋
```

This is a *measuring-place attachment*. It selects a factor position,
using the same positions as angle-bracket numbers:

| Attachment | How to measure |
| --- | --- |
| Omitted, or `⌊○⌋` | Ordinary distance |
| `⌊◠⌋` | The first unique factor |
| `⌊⟨◠⟩⌋` | The second unique factor |
| `⌊⟨◠○⟩⌋` | The third unique factor |
| `⌊*⟨◠○○⟩⌋` | The third place, found from its unique factor |

The reserved label `○` means ordinary measurement. It does not supply
a factor before the first one. A measuring place must be `○` or a
forward whole count. It is selected once, outside the attached range's own counter
binding. An enclosing counter may supply it. The range's own counter cannot
change its measuring place from visit to visit.

The counter still visits ordinary whole counts and generates exactly the
same entries. For a square range, measure the partial sums' gaps. For a
curly range, measure the partial products' gaps, keeping written order.
The attachment applies before an upper attachment, `@`, or `#`.
It is allowed on endless ranges; finite ranges and ordinary bracketed lists
have no measuring-place attachment.

#### Find a destination under the selected measurement

The same gaps grow in ordinary length and shrink under the first factor’s measurement.

| Entries joined | Destination so far | Gap from backward one | Size at the first factor place |
| --- | --- | --- | --- |
| `◠` | `◠` — one | `⟨◠⟩` — two | `⟨◡⟩` — a half |
| `[◠ ⟨◠⟩]` | `⟨◠○⟩` — three | `⟨⟨◠⟩⟩` — four | `⟨[◡ ◡]⟩` — a quarter |
| `[◠ ⟨◠⟩ ⟨⟨◠⟩⟩]` | `⟨◠○○○⟩` — seven | `⟨⟨◠○⟩⟩` — eight | `⟨[\|⟨◠○⟩]⟩` — an eighth |

To check the first row, walk from backward one to forward one: the gap is two steps. The next gap is four, then eight. Each gap adds another use of the two-step factor, so its measured size halves. That repeated rule is why the results approach backward one under this measurement.

For the first square example, the partial sum after a whole number of
visits is one step before the corresponding power of the first factor.
Its gap from `◡` is that power. The selected factor's instruction in
the gap keeps growing, so its measured size keeps shrinking toward `○`:

```text
[□ : ○ … : ⟨◠⟩⌈□⌉]⌊◠⌋ = ◡
[□ : ○ … : ⟨◠○⟩⌈□⌉]⌊⟨◠⟩⌋ = [|⟨◡⟩]
{□ : ◠ … : ⟨◠⟩}⌊◠⌋ = ○
```

The second sum works the same way. Its gap from the backward half-step is
the current power of the second factor shared by the first factor. The
second factor's instruction still grows with the visit count.

The product repeatedly adds an instruction at the first place. Its gap
from `○` is the whole partial product, whose measured size tends to
`○`. All three examples fail to settle under ordinary measurement.

The playground compares the same finite partial results using two
measurements. It shows a candidate destination, the gaps' exact UFN sizes,
and a scaling plot. Changing the measurement changes neither the entries
nor their finite results. The plot is an optional decimal drawing of those exact distances,
separate from the limit proof.

#### Keep values and measurements together

Recall that a *rational number* can be written as a journey of whole
steps, forward or backward, shared by a forward whole count. The initial factor-measurement rules accept
these entries on the original path. A rational gap other than `○` has
whole instructions at its factor places. An overall backward direction
does not change which factors it uses. At the first measuring place,
`⟨◠⟩` and `[|⟨◠⟩]` both have measured size `⟨◡⟩`.

To measure a nonzero gap at one chosen place, reverse that place's
instruction and apply it to that factor alone. Other factor places do
not affect this selected measurement.

In conventional notation, for the prime `p` at that place and the
instruction `e` in a nonzero gap, this distance is `p^(−e)`.

Imagine a sequence of rational values. For every chosen small distance,
suppose all its sufficiently late entries are within that distance of
each other under this measurement. We supply a destination for every such
sequence. Some destinations are new values that cannot be written as
shares of whole counts. Together with the rational values, these are
called *p-adic numbers*. Supplying the destinations is called *completion*.

<details>
<summary>Reference in conventional notation</summary>

See [p-adic distance and completion, sections 3–10](https://math.mit.edu/~poonen/782/782notes.pdf).

This reference uses conventional symbols. The examples above can be
worked without it.

</details>

Each attachment is local. Inner endless ranges retain their own attachments,
or ordinary measurement if none is written. Their limits must be resolved
before their values can serve as rational entries of an outer measured
range. A finite inner preview cannot take the place of that limit.

A limit proved equal to a rational number can use its existing spelling.
That rational can participate in arithmetic under any of these measurements.

An unresolved p-adic value keeps its measuring place and its exact recipe.
Further arithmetic on general values using the same measuring place requires
additional rules. Combining values from different measuring places requires an
explicit interpretation. Roots, arbitrary powers, and directed coefficients
do not acquire a p-adic meaning automatically.

<details>
<summary>Calculator support and general limit rules</summary>

#### Exact rules and finite previews

The calculator can establish some limits directly from their recipes.
It checks how every visit is related to the next.

For the halving list, the first entry is one step and the repeated change is a half. Undo that half from one step, leaving a half; share the first entry by that remainder:

```text
{◠ | [◠ | ⟨◡⟩]} = ⟨◠⟩
```

For the doubling list measured at the first factor place, the first entry is again one step. Undo two steps from one, leaving a backward step; undo that change from the first entry:

```text
{◠ | [◠ | ⟨◠⟩]} = ◡
```

Both examples use the same arithmetic. Each has a limit because its repeated change makes the measured gap smaller in its chosen measurement. The sharing formula alone cannot establish convergence.

A nonzero geometric sum converges when its ratio has measured size below
`◠`. Its limit is the first entry shared by the difference between `◠`
and the ratio. A constant product converges to `○` when its factor has
measured size below `◠`; a constant factor of `◠` gives `◠`.
Other constant rational factors do not settle. An all-zero geometric sum
gives `○`.

Under ordinary measurement, the calculator can also:

- join several supported geometric sums, including exact roots and directed
  coefficients;
- settle a fixed directed product by checking its size;
- cancel successive parts of a sum or product and find the remaining limit.

The last rule is called *telescoping*. For example:

```text
[□ : ◠ … : {|□ [□ ◠]}]⌊○⌋ = ◠
```

Each entry is the reciprocal of the current count with the reciprocal of
the next count undone. Inside a finite partial sum, those middle shares
cancel. Only the first share and the final undoing share remain. The final
share shrinks toward `○`, leaving `◠`.

Ordinary geometric sums can use square-root ratios too. Start with `◠`
and share each next entry by the square root of the two-step count.
The limit is two steps joined with that root. Undo the two steps:

```text
[[□ : ○ … : ⟨⟨◡⟩⟩⌈[|□]⌉]⌊○⌋ | ⟨◠⟩] = ⟨⟨◡⟩⟩
```

The calculator establishes this non-rational answer using exact root
arithmetic.

At a measuring place ahead of `○`, the current proof rules use rational
geometric sums and fixed rational products. Other roots and directed values
still need their own meaning under that measurement.

An explicit measuring attachment requests these proof rules. A proved limit
gets an exact UFN value. A proved failure to settle reports that the limit
does not exist. Other cases keep their complete recipes and a reason.

The workbench's finite-visits choice, and the `preview` API, show a selected
prefix separately. Its rational result can have an ordinary decimal reading;
that reading describes the prefix. An unresolved limit has no ordinary
decimal projection. Exact rational limits may enter the existing ordinary
arithmetic, including its optional decimal projection.

An omitted attachment and `⌊○⌋` give the same mathematical measurement.
With no attachment, the workbench starts by showing finite visits. Choose
**Find the limit** to request a proof, or write `⌊○⌋` explicitly.
The two spellings have the same mathematical limit when it exists.

</details>

#### Pause and practice: choose the measurement

**Marks so far:** After an angle-bracket number, lower corners choose a factor place; after a box they name it; after an endless range they choose the gap measurement.

The doubling sum’s first three gaps from backward one are two, four, and eight. Predict the next gap and its measured size at the first factor place.

<details>
<summary>Check your answer</summary>

The next gap is sixteen: one more doubling. Its measured size is a sixteenth, half the previous measured size. Its ordinary length grows.

</details>

Compare `⟨◠⟩⌊◠⌋`, `□⌊◠⌋`, and `[□ : ○ … : ⟨◠⟩⌈□⌉]⌊◠⌋`. Does each lower attachment make the value two?

<details>
<summary>Check your answer</summary>

Only the first expression names two steps. The second is a counter name with a value supplied by its range. The third chooses a measurement for an endless sum; under that measurement the sum settles at backward one. The attachment does not change its finite sums.

</details>

### Make finer pieces of a journey

Where do the contributions settle as the pieces get smaller?

Share the journey from `○` to `◠` into equal pieces. Let `□`
name how many pieces there are. It must be a whole forward count
beginning at `◠`. A piece's change from start to end, including its
direction, is called its *displacement*. Here ordinary sharing gives it:

```text
{|□}
```

Use another counter, `□⌊⟨◠⟩⌋`, to visit the pieces from `◠`
through `□`. At the far end of the piece being visited, our progress
along the whole journey is:

```text
{□⌊⟨◠⟩⌋ | □}
```

Both names have their ordinary meanings and scopes. One counts the
pieces; the other counts visits. The piece's displacement is computed
by sharing. Neither counter names an extra direction or an indefinitely
small number.

Here is a complete expression. The outside range makes one visit at
the two-step count, supplying the number of pieces. The inside range
joins those pieces back into a step:

```text
[□ : ⟨◠⟩ … ⟨◠⟩ :
  [□⌊⟨◠⟩⌋ : ◠ … □ : {|□}]
] = ◠
```

The dots retain their ordinary rule: visit full counts, including both
bounds. Beginning the inside range at `◠` gives exactly as many visits
as pieces. The starting position `○` is a boundary; it does not call
for an extra piece.

#### Use the position to choose a contribution

At each piece, combine the far-end position with the piece's displacement.
Then join all the contributions:

```text
[□ : ⟨◠⟩ … ⟨◠⟩ :
  [□⌊⟨◠⟩⌋ : ◠ … □ :
    {{□⌊⟨◠⟩⌋ | □} {|□}}
  ]
] = [⟨[◡ ◡]⟩ ⟨◡⟩]
```

The first position is a half step, the second a whole step. Each piece
is half a step long. They contribute a quarter step and a half step.

Changing both outside bounds chooses another number of pieces. The
inside recipe can also sample another position within each piece:

| Where to sample | Progress along the journey |
| --- | --- |
| Near end | `{[□⌊⟨◠⟩⌋ | ◠] | □}` |
| Middle | `{[□⌊⟨◠⟩⌋ | ⟨◡⟩] | □}` |
| Far end | `{□⌊⟨◠⟩⌋ | □}` |

These fragments read both counter names from their surrounding ranges.
The displacement remains `{|□}` for every choice of sample.

#### Approach a destination by making smaller pieces

Split the journey into pieces, choose a sample within each, and join
the contributions. Repeat with finer divisions. If all such choices
approach the same finite destination as the largest piece shrinks,
that destination is the *integral* of the recipe along the journey,
using these displacements in the written order.

More precisely, choose any small forward distance. There must be a
maximum piece size greater than `○` such that every division with smaller
pieces, and every choice of samples in those pieces, puts the total
within that distance of the destination. For directed answers,
measure the size of the difference using all four components.

Equal pieces and far-end samples give one useful sequence of
approximations. Its convergence alone does not establish the integral
for an arbitrary recipe. The destination must also be independent of
the divisions and sample choices.

A recipe is *continuous* when, near each input, a small enough input
change makes the answer change as little as desired. Continuous recipes
on a finite straight journey have an integral. The playground's three
recipes are continuous.

<details>
<summary>Explore further: why every sample choice reaches the same integral</summary>

#### Why the lesson recipes settle

A recipe that always returns `◠` contributes each piece unchanged.
Joining the pieces reconstructs `◠` at every division.

For the recipe that returns its progress, pair the visiting counts
in forward and backward order. Each pair reaches the piece count
with another step joined. This proves, with `□` supplied by an
outside range:

```text
[□⌊⟨◠⟩⌋ : ◠ … □ : □⌊⟨◠⟩⌋]
  = {□ [□ ◠] | ⟨◠⟩}
```

Sharing once to find each sampled position and again to weight it by
its piece gives the far-end total:

```text
[⟨◡⟩ {⟨◡⟩ | □}]
```

The near-end total is `[⟨◡⟩ | {⟨◡⟩ | □}]`. Their gap is
one piece's width. Every sample choice lies between these totals, and
the shrinking gap pins the destination to `⟨◡⟩`. Middle samples
happen to give this answer at every division.

For progress combined with itself, the grouping identity is:

```text
[□⌊⟨◠⟩⌋ : ◠ … □ : {□⌊⟨◠⟩⌋ □⌊⟨◠⟩⌋}]
  = {□ [□ ◠] [{⟨◠⟩ □} ◠] | ⟨◠◠⟩}
```

At `□ = ◠`, both sides give `◠`. Increasing the count by a
step changes the right side by the new count combined with itself,
which is exactly the next entry of the left side. This establishes
the identity at every forward whole count.

Sharing the sum by the piece count three times gives the far-end total:

```text
[⟨◡○⟩ {⟨◡⟩ | □} {⟨◡◡⟩ | □ □}]
```

The last two parts shrink away, leaving `⟨◡○⟩`.

These destinations also hold when pieces have unequal widths. Within each
piece, progress changes by no more than its width. Progress combined with
itself changes by no more than twice that width.

After weighting and joining, the gap between near-end and far-end totals
is at most the largest width for the first recipe, and twice that width
for the second. Comparing divisions using all their boundaries together
shows that every sample choice approaches the same destination.

</details>

#### Write a limit by joining corrections

Start with an approximation. Join the next approximation with the
old one undone. The result is the new approximation. Repeat for
every later approximation. All earlier answers cancel with their
undoing instructions. This is called a *telescoping sum*.

A quarter joined with a half is the two-piece guess:

```text
[⟨[◡ ◡]⟩ ⟨◡⟩] = ⟨◠[|⟨◠⟩]⟩
```

Three quarters. Undoing one from it gives a backward quarter.

The progress recipe with far-end samples: each guess replaces the previous one.

| Pieces | New guess | Change from the previous guess |
| --- | --- | --- |
| One | `◠` — one step | Start here. |
| Two | `⟨◠[\|⟨◠⟩]⟩` — three quarters | `[⟨◠[\|⟨◠⟩]⟩ \| ◠]` — undo a quarter. |
| Three | `⟨◡◠⟩` — two thirds | `[⟨◡◠⟩ \| ⟨◠[\|⟨◠⟩]⟩]` — undo one twelfth. |

```text
[◠ [⟨◠[|⟨◠⟩]⟩ | ◠] [⟨◡◠⟩ | ⟨◠[|⟨◠⟩]⟩]] = ⟨◡◠⟩
```

Find the first ◠ and the instruction that undoes it. They cancel. Then find three quarters and its undoing. They cancel too. Only the newest guess, two thirds, remains.

For this particular recipe, each correction undoes a share of a step.
We can write those corrections compactly:

```text
[◠ | [□ : ⟨◠⟩ … : {|⟨◠⟩ □ [□ | ◠]}]]
```

Its limit is `⟨◡⟩`. Choose **Find the limit**, or attach `⌊○⌋`
to the endless range, to have the calculator prove it. Its exact rules
reduce the inner finite sums and cancel the successive corrections.

The finite-preview choice shows only the selected corrections. Joining the
successive approximations themselves would give a different series: the
correction construction works because each earlier approximation is undone.

<details>
<summary>Expand every guess into its counter recipe</summary>

It expresses a sequence's limit using our existing endless square
ranges. For far-end samples of the progress recipe, the complete
expression is described in the table below.

Read the complete expression by its four jobs. These descriptions are labels for reading, not extra syntax.

| Find this block | Its job |
| --- | --- |
| The first inner range, with bounds `◠ … ◠` | Make the one-piece guess. |
| The outer range, starting at `⟨◠⟩` | Visit two pieces, three pieces, and so on. |
| The inner range before the square bar, ending at `□` | Make the new guess using this many pieces. |
| The inner range after the square bar, ending at `[□ \| ◠]` | Make the previous guess, then undo it. |

```text
[
  [□⌊⟨◠⟩⌋ : ◠ … ◠ : {{□⌊⟨◠⟩⌋ | ◠} {|◠}}]
  [□ : ⟨◠⟩ … :
    [
      [□⌊⟨◠⟩⌋ : ◠ … □ : {{□⌊⟨◠⟩⌋ | □} {|□}}]
      |
      [□⌊⟨◠⟩⌋ : ◠ … [□ | ◠] :
        {{□⌊⟨◠⟩⌋ | [□ | ◠]} {|[□ | ◠]}}
      ]
    ]
  ]
]
```

The first entry supplies the one-piece approximation. Each outer
visit joins the new approximation with the previous one undone.
The inside counter is separately scoped in each approximation.
After any finite number of corrections, the result equals the latest
finite approximation exactly. If these approximations have a limit,
the endless correction sum has that same limit.

</details>

#### Keep the piece's direction and the written order

For any straight journey, undo its starting position from its ending
position to find its displacement. Share that displacement by the
number of pieces. Find a sample by combining a progress fraction with
the whole displacement, then joining the starting position.

For example, sharing a journey of `◠@⟨◠⟩` gives pieces of
`{◠@⟨◠⟩ | □}`. A recipe that returns `◠@◠` can be combined
with those pieces in either order:

```text
[□ : ⟨◠⟩ … ⟨◠⟩ :
  [□⌊⟨◠⟩⌋ : ◠ … □ : {◠@◠ {◠@⟨◠⟩ | □}}]
] = ◠@⟨◠○⟩

[□ : ⟨◠⟩ … ⟨◠⟩ :
  [□⌊⟨◠⟩⌋ : ◠ … □ : {{◠@⟨◠⟩ | □} ◠@◠}]
] = ◡@⟨◠○⟩
```

The sharing count lies along `@○`; the pieces can use any direction.
Backward journeys have backward displacements. Their visiting
counters still run forward through whole counts.

A curved journey needs a recipe giving its position at each progress value:

1. Divide the span between the first and last progress values—the
   *progress interval*—into pieces. Choose a position within each piece
   at which to read the recipe; this is called *sampling*.
2. Find each piece's directed displacement: its ending position with its
   starting position undone.
3. Combine each recipe answer with its displacement, in the chosen order.
4. Join the contributions and make the progress pieces smaller.

The largest **progress interval** must shrink. Endpoint displacements alone
can miss loops. Suppose the route has a continuous rate of change on
each of finitely many sections, and the recipe is continuous along it.
Then this construction gives a directed path integral. The next lesson
explains rates of change.

Directed displacement, distance traveled, and elapsed time supply
different contributions. The recipe must specify which it uses. The
browser demonstration uses directed displacement along a straight
journey; its graph draws progress and recipe amounts before their
direction labels are attached.

The calculator proves these correction limits for all three lesson recipes,
including either order of directed contributions. The argument about every
sufficiently fine division establishes their meaning as integrals.

Other integrals may need further proof rules. An unbounded journey also
needs limits at its ends. These constructions use the existing grammar;
a compact integral abbreviation remains open design work.

#### Pause and practice: replace a guess

**Marks so far:** A square bar undoes the previous guess. The endless range joins changes between guesses, starting from the first guess.

The one-piece guess is one, and the two-piece guess is three quarters. Is their correction forward or backward?

<details>
<summary>Check your answer</summary>

Backward by a quarter. Joining it to the first guess reaches three quarters.

```text
[⟨◠[|⟨◠⟩]⟩ | ◠] = [|⟨[◡ ◡]⟩]
```

</details>

What happens if you join the guesses one, three quarters, and two thirds directly, instead of joining their corrections?

<details>
<summary>Check your answer</summary>

You count all three guesses. Their total is two and five twelfths. The correction construction cancels the first two guesses and leaves only the newest, two thirds.

</details>

### Watch how a small change spreads

How much does the answer change when the input moves a little?

In a range, a box receives each visited count. In the derivative playground, the recipe’s box receives the input you choose. In either setting, look for what supplies the box’s value before reading the recipe.

Take a recipe that combines its input with itself. At `◠`, it returns
`{◠ ◠}`, which is `◠`. Change the input by a half step and run it
again. Undo the starting answer from the changed answer. Then share
that output change by the input change:

```text
{[{[◠ ⟨◡⟩] [◠ ⟨◡⟩]} | {◠ ◠}] | ⟨◡⟩} = ⟨◠○◡⟩
```

This says how much output change we got per input step. It is called
an *average rate of change*. Recall that a recipe taking an input and
supplying an answer is a *function*. Sharing its output change by its input
change gives a *difference quotient*.

Try a quarter-step change instead. The rate becomes two steps with a
quarter joined. A backward half-step gives two steps with a half undone:

```text
{[{[◠ | ⟨◡⟩] [◠ | ⟨◡⟩]} | {◠ ◠}] | [|⟨◡⟩]} = ⟨◠◡⟩
```

If the rate approaches the same destination however a nonzero input
change approaches `○` along this path, that destination is the
function's *derivative* at this input. Here the derivative is `⟨◠⟩`.
We never share by `○`. Every finite quotient uses a nonzero change;
the derivative describes the limit of those quotients.

#### Follow the four contributions

Start at one step and add a half. Combining this new input with itself pairs each part of the first input with each part of the second. Write all four pairs:

Every part of the first input meets every part of the second.

| First part | Second part | Combined contribution |
| --- | --- | --- |
| `◠` | `◠` | `{◠ ◠} = ◠` — one |
| `◠` | `⟨◡⟩` | `{◠ ⟨◡⟩} = ⟨◡⟩` — a half |
| `⟨◡⟩` | `◠` | `{⟨◡⟩ ◠} = ⟨◡⟩` — a half |
| `⟨◡⟩` | `⟨◡⟩` | `{⟨◡⟩ ⟨◡⟩} = ⟨[◡ ◡]⟩` — a quarter |

```text
{[◠ ⟨◡⟩] [◠ ⟨◡⟩]} = [◠ ⟨◡⟩ ⟨◡⟩ ⟨[◡ ◡]⟩]
```

Undo the original answer, one step. The half, half, and quarter remain. Share each by the input change, a half: they become one, one, and a half.

```text
{[⟨◡⟩ ⟨◡⟩ ⟨[◡ ◡]⟩] | ⟨◡⟩} = [◠ ◠ ⟨◡⟩]
```

So the rate is two and a half output steps per input step. Try a quarter-step input change: the four contributions become one, a quarter, a quarter, and a sixteenth.

#### Read the pairs, then write the output change

Keep the input change at a half step. Complete the last pair before assembling the whole expression.

```text
{[{[◠ ⟨◡⟩] [◠ ⟨◡⟩]} | {◠ ◠}] | ⟨◡⟩}
```

<details>
<summary>Help me read this</summary>

Read the outer curly brackets first: they share by the input change ⟨◡⟩. The complete square expression before that bar is the output change. Inside it, the first curly expression gives the changed answer; the square bar undoes the original answer {◠ ◠}. Work through these complete blocks one at a time.

</details>

Use the same two parts on both sides; account for all four pairs.

| First part | Second part | Combined contribution |
| --- | --- | --- |
| One | One | One |
| One | A half | A half |
| A half | One | A half |
| A half | A half | Fill this contribution |

Read and complete: what does the last pair contribute?

<details>
<summary>Check the missing step</summary>

A quarter step. This pair uses curly combining. If you got a whole step, you joined two half-step journeys instead.

</details>

Write your own: at input one, add a half, run the recipe that combines its input with itself, then undo its original answer. Write just that output change; leave sharing for the next step.

<details>
<summary>Check your expression</summary>

Put the changed answer before a square bar and the original answer after it. The two copies of [◠ ⟨◡⟩] stay together inside the first curly block.

```text
[{[◠ ⟨◡⟩] [◠ ⟨◡⟩]} | {◠ ◠}] = [⟨◡⟩ ⟨◡⟩ ⟨[◡ ◡]⟩]
```

</details>

Recall sharing: what happens when a quarter-step amount is shared by a half-step amount?

<details>
<summary>Check the earlier rule</summary>

It gives a half step. Halving that answer recovers the quarter, which checks the sharing.

```text
{⟨[◡ ◡]⟩ | ⟨◡⟩} = ⟨◡⟩
```

</details>

#### Establish the rate for every small change

<details>
<summary>Why this works for every starting input and change</summary>

For this explanation, `X` and `H` stand for complete values along `@○`:
the starting input and its change. These letters are placeholders in
the explanation, not new marks in the grammar. Substitute UFN expressions
for them before giving the recipe to the evaluator. Require `H` different
from `○`.

```text
{[{[X H] [X H]} | {X X}] | H} = [{⟨◠⟩ X} H]
```

Pair each part with each part, just as in the table above:

| First part | Second part | Contribution |
| --- | --- | --- |
| `X` | `X` | `{X X}` — the original answer |
| `X` | `H` | `{X H}` |
| `H` | `X` | `{H X}` |
| `H` | `H` | `{H H}` |

Undo the original answer `{X X}`. That contribution cancels.
The remaining three terms are `{X H}`, `{H X}`, and `{H H}`.
Sharing by `H` leaves `X`, `X`, and `H`.

The difference between the quotient and `{⟨◠⟩ X}` is exactly `H`.
As `H` approaches `○`, that difference does too, from either side and
through every sequence of nonzero changes. This proves the derivative
at every starting input on this path, including `○` and backward values.

Curly brackets express the square even at those inputs; an upper-corner
power would require a base ahead of `○` under the present power rules.

A finite table of rates can illustrate this result. The identity is what
establishes it. Convergence along one selected sequence alone does not
establish a derivative.

</details>

Some functions have no derivative at a particular input. Consider the
recipe that returns the ordinary distance from `○` along this path.
At `○`, its quotient is `◠` for every forward change and `◡` for every
backward change. The two approaches do not agree. The curve has a corner.
This example describes a function in words; it adds no distance-function
token to UFN.

On a graph, put the input across the page and the output up the page.
The line through the starting and changed points is a *secant*. Its
*slope* is the output change shared by the input change. When that slope
settles, the line through the starting point with the limiting slope
is a *tangent line*. The browser draws these lines for the square
recipe, using decimal projection only for the picture. See the
[difference-quotient definition](https://openstax.org/books/calculus-volume-1/pages/3-1-defining-the-derivative)
for its conventional formulation.

#### Let the input change in a chosen direction

The starting input and its displacement can use any of the four components.
Choose a fixed direction `V`. Let `H` describe progress along `@○`,
forward or backward. A backward half-step of progress is `[|⟨◡⟩]`.
Combining that progress with `V` gives the actual change in the input.

1. Form the displacement `{H V}`.
2. Find the output at `[X {H V}]` and undo the output at `X`.
3. Share that difference by `H`.
4. Let nonzero `H` approach `○` from either side.

If the rates have a limit, it is the *directional derivative* along `V`.
When `V` has size `◠`, called *unit size*, this is a rate per step
of input travel. Otherwise it includes the size change described by `V`.

For the square recipe, distributing and preserving the written order gives:

```text
{[{[X {H V}] [X {H V}]} | {X X}] | H}
  = [{X V} {V X} {H V V}]
```

Here `X` and `V` can be directed. Because `H` lies on `@○`, it can swap
places with any component in a curly product without changing the answer.
This is called *commuting*. The final term approaches `○` as `H` does.
The directional derivative is therefore:

```text
[{X V} {V X}]
```

Direction lookup: swapping a listed pair reverses its answer.

| Combine in this order | Answer |
| --- | --- |
| `{◠@◠ ◠@⟨◠⟩}` | `◠@⟨◠○⟩` |
| `{◠@⟨◠⟩ ◠@⟨◠○⟩}` | `◠@◠` |
| `{◠@⟨◠○⟩ ◠@◠}` | `◠@⟨◠⟩` |

A forward step on any one of these three paths, combined with itself, gives ◡@○. The label after @ names the path; it does not scale the amount.

These two terms need not be equal. For example:

```text
[{◠@◠ ◠@⟨◠⟩} {◠@⟨◠⟩ ◠@◠}] = ○
[{◠@◠ ◠@◠} {◠@◠ ◠@◠}] = [|⟨◠⟩]
```

In the first case, a finite progress change still leaves the term
`{H ◠@⟨◠⟩ ◠@⟨◠⟩}`, which is `[|H]`, in the quotient.
The limiting rate is zero because that extra term shrinks away.

The amount after the sharing bar is the progress `H`. Sharing by the
complete displacement `{H V}` would give a different rate; its definition
would also need to specify the order of the directed changes.
The fixed-route construction is the usual
[directional derivative](https://math.mit.edu/~djk/18_022/chapter03/section02.html),
applied component by component to the output.

The derivative on the whole four-component space gives a rule for small
changes. Joining input changes joins its predictions; scaling a change
along `@○` scales the prediction by the same amount. Such a rule is called
*linear*.

For the square recipe, apply `[{X V} {V X}]` to an arbitrary displacement
`V`. The answer may need both terms: a single coefficient on one side need
not express it. Expanding the changed input gives:

```text
{[X V] [X V]} = [{X X} {X V} {V X} {V V}]
```

After undoing the starting output and the linear prediction, the error
is `{V V}`. Under the ordinary four-component size rule, its size is the square
of the displacement's size. Dividing that error size by the displacement
size therefore approaches zero through all directions. This establishes
the full derivative, a stronger condition than checking individual routes.

The same small-change test applies to all four components together.

#### Write one derivative value as a correction limit

At `X = ◠` with `V = ◠`, a whole-step change gives the rate `⟨◠○⟩`.
Halving the change removes a half from that rate; halving again removes
a quarter, then an eighth, and so on. Join the successive corrections:

```text
[⟨◠○⟩ | [□ : ◠ … : ⟨[|□]⟩]⌊○⌋] = ⟨◠⟩
```

The counter visits ordinary whole counts. Its recipe supplies the
shrinking amounts. The explicit ordinary measuring place lets the
reducer prove this geometric limit. With that attachment omitted, the
workbench begins with a finite preview; **Find the limit** requests proof.

This is a spelling of this particular derivative value. The preceding
identity proves that the full derivative has this value; one correction
sequence by itself would only test one approach.

<details>
<summary>Explore further: calculator differentiation and other measurements</summary>

#### Let the calculator follow the recipe

The derivative form accepts a recipe, a starting input, and a movement
direction. Write `□` for the supplied input. For example, `{□ □}` combines
it with itself, and `{|□}` takes its reciprocal.

Here the form supplies `□` directly. It may be a share or a directed value;
it is not stepping through a range of whole counts. A counter inside the
recipe still has its own local name and scope.

The calculator follows each operation and carries its first change along
with its value. For curly brackets it keeps both ordered changes: change
the first entry while keeping the second, then keep the first while changing
the second. That gives the two terms used in the square lesson.

Joining, sharing, fixed powers, and finite counters with fixed bounds also
have exact rules. A changing exponent or an input-dependent endless range
needs further rules. The form reports when it cannot establish the derivative.
It does not estimate an answer from nearby samples.

The resulting derivative value is an ordinary UFN expression. No new
derivative symbol is added to the written language. The JavaScript API is
documented in the [evaluator reference](docs/evaluator.md#differentiate-a-recipe).

#### Let the measurement govern the approach

Shrinking is always relative to the chosen measurement. Repeatedly
halving a step makes it small under ordinary distance. At the first
factor's measuring place, those same steps grow in measured size.
Instead, changes with more and more copies of that factor approach `○`.
For example, `⟨◠⟩⌈□⌉` supplies such changes as the counter advances.

For rational `X` and nonzero rational `H`, the square identity still
leaves exactly `H` as the error in its rate. If `H` approaches `○` under
the selected factor measurement, so does the error. Thus the square
recipe again has derivative `{⟨◠⟩ X}`. The same algebra extends to the
completion at that factor. The measurement changes which input changes
approach zero, not the finite arithmetic identity.

A measuring-place attachment continues to belong to its own endless
range. It does not turn every inner recipe into a function on the new values supplied by that
completion, or silently extend directed operations to it. The browser's
derivative calculator uses ordinary distance. General p-adic differentiation
needs further evaluation rules.

An integral joins small contributions. A derivative describes the local
response to a small change.

Along `@○`, integrating a continuous derivative over an interval recovers
the function's ending value with its starting value undone. This is the
[fundamental theorem of calculus](https://openstax.org/books/calculus-volume-1/pages/5-3-the-fundamental-theorem-of-calculus).
For example, integrating the square recipe's rate from `○` to `◠` gives `◠`.

For directed recipes whose progress stays on `@○`, the same statement
applies to each output component. Here the integral uses progress along `@○`.
An integral using directed path displacements must keep its chosen
multiplication order explicit.

</details>

#### Pause and practice: shrink the input change

Find the outer brackets first. Keep each complete entry together,
then decide what job it has.

**Marks so far:** Read the four-pair table for changes on the original path. For other paths, use the direction lookup and keep curly order.

Start at one and change the input by a quarter. In the square recipe, what remains after undoing the original answer and sharing by the change?

<details>
<summary>Check your answer</summary>

The three remaining contributions are a quarter, a quarter, and a sixteenth. Sharing by a quarter gives one, one, and a quarter. The rate is two and a quarter, with a quarter-step gap from two.

</details>

At input ◠@◠, move along ◠@⟨◠⟩. Do the two terms of the limiting rate reinforce each other or cancel? Use the lookup.

<details>
<summary>Check your answer</summary>

The first ordered pair gives ◠@⟨◠○⟩; the reversed pair gives ◡@⟨◠○⟩. They cancel, so this directional rate is ○. A finite change still has the extra shrinking term.

```text
[{◠@◠ ◠@⟨◠⟩} {◠@⟨◠⟩ ◠@◠}] = ○
```

</details>

### Extend the factorial to other journeys

What can replace the whole-count recipe at a half-step input?

The whole-count factorial combines every forward count through its
input. At `○`, its empty curly list gives `◠`. Moving the input
forward by a step appends the new count to the changes.

What should happen when the input is a half step, or lies along another
path? A half step cannot be an endpoint of an ordinary whole-count
range. We need another recipe whose counters still visit whole counts.

We choose an extension that keeps every whole-count answer and accepts
these other inputs. Matching the whole counts alone permits several
extensions. The limit recipe below chooses this one; the original finite
rule becomes an exact case of the extended function.

#### Build stages using counts and shares

Keep the chosen input fixed while increasing the stage count. For one
forward whole stage count:

1. Raise the stage count to the chosen input.
2. Visit the whole counts from `◠` through that stage count.
3. On each visit, join the input with the visiting count. Share the
   visiting count by that joined amount.
4. Combine the leading power with all those shares, in visit order.

In this template, `Q` stands for the complete chosen input, grouped
if needed. It is a placeholder in the explanation, not a new UFN
symbol. With `□` supplied as the stage count, one stage is:

```text
{
  □⌈Q⌉
  {□⌊⟨◠⟩⌋ : ◠ … □ : {□⌊⟨◠⟩⌋ | [Q □⌊⟨◠⟩⌋]}}
}
```

The **factorial of the input is the limit of these stages** as the
stage count grows without bound. The input can have contributions
along all four directions. The stage and visiting counters keep
their ordinary whole-count rule.

The stage count is a whole count; the input remains a half step.

| Stage | Power at half-step input | Changes from the visits | Stage result |
| --- | --- | --- | --- |
| One | `◠⌈⟨◡⟩⌉ = ◠` | `{◠ \| [⟨◡⟩ ◠]} = ⟨◡◠⟩` — two thirds | `⟨◡◠⟩` — two thirds |
| Two | `⟨◠⟩⌈⟨◡⟩⌉ = ⟨⟨◡⟩⟩` | Two thirds, then `{⟨◠⟩ \| [⟨◡⟩ ⟨◠⟩]}` — four fifths | Eight fifteenths of the square-root-of-two amount |

```text
{⟨◡◠⟩ {⟨◠⟩ | [⟨◡⟩ ⟨◠⟩]}} = {⟨⟨◠○⟩⟩ | ⟨◠◠○⟩}
```

```text
{⟨◠⟩⌈⟨◡⟩⌉ {□ : ◠ … ⟨◠⟩ : {□ | [⟨◡⟩ □]}}} = {⟨⟨◡⟩⟩ {⟨⟨◠○⟩⟩ | ⟨◠◠○⟩}}
```

The first stage is two thirds of a step. The second is about three quarters of a step. Both are finite guesses for the same half-step input; neither is its completed factorial.

Here is the complete eight-stage approximation for a half-step input:

```text
{⟨⟨◠○⟩⟩⌈⟨◡⟩⌉
  {□ : ◠ … ⟨⟨◠○⟩⟩ : {□ | [⟨◡⟩ □]}}
}
```

Each finite stage has an exact UFN expression. The evaluator can
reduce many such stages, including fractional inputs, using its
factor instructions. Directed powers can remain written as recipes.
An optional decimal reading is a projection of that finite stage;
it is never used to construct the exact expression.

<details>
<summary>Expand the complete factorial limit</summary>

#### Write the whole definition

The first stage is `{|[Q ◠]}`. Start there, then join the change
from each stage to the next using the correction construction:

```text
[
  {|[Q ◠]}
  [□ : ⟨◠⟩ … :
    [
      {□⌈Q⌉
        {□⌊⟨◠⟩⌋ : ◠ … □ : {□⌊⟨◠⟩⌋ | [Q □⌊⟨◠⟩⌋]}}
      }
      |
      {[□ | ◠]⌈Q⌉
        {□⌊⟨◠⟩⌋ : ◠ … [□ | ◠] : {□⌊⟨◠⟩⌋ | [Q □⌊⟨◠⟩⌋]}}
      }
    ]
  ]
]
```

Replace every `Q` by the same input expression. The generated recipe
uses counter names that are separate from any names inside that input.
An input must be closed: every counter it reads has a surrounding
range that supplies it. The definition uses finite curly ranges inside
an endless square range.

After a finite number of corrections, the partial sum equals the
latest stage. The evaluator marks a finite preview as partial even when
the stage itself has a preferred spelling. Choose **Find the limit** to
request the full value. The definition does not promise a preferred
angle-bracket spelling for every input's factorial.

</details>

#### Recover the whole-count rule

At input `○`, every share in every stage is `◠`, as is the power.
The factorial is therefore `◠`.

At a forward whole input, the visiting counts cancel against most of
the shifted counts after the sharing bars. What remains is its
finite factorial, combined with a fixed number of shares. Each share
has the stage count above the bar and the stage count with a fixed
forward amount joined below it. Every such share approaches `◠`.
The limit is exactly the familiar finite factorial.

This also gives a useful recurrence. The factorial at an input with
`◠` joined is the new input combined with the old factorial.
The rule holds wherever both factorials have values. It does not
uniquely choose a function by itself; the stage-limit definition
selects the extension used here.

The playground recognizes whole-count inputs in their preferred spelling without a
decimal conversion and uses their finite curly recipe directly.
This exact case includes any input expression that reduces to the
same whole count. The evaluator's existing range bound still applies.

For small whole inputs, the calculator can also prove the complete
stage-limit definition by cancelling the shifted counts. That proof
currently takes more work than the direct finite factorial rule.

#### Keep the directions together

The value after a sharing bar is called its *denominator*. Here each
shifted denominator uses the complete input. So does every power.
All these values lie in the plane containing `@○` and the input's
combined direction away from `@○`. Within that plane these particular
factors commute; UFN still writes and evaluates their order explicitly.

Rotating the input's part away from `@○` rotates the answer's
corresponding part with it. The function is not defined by taking four separate
factorials of its coefficients. The first stage at input `◠@◠`
already shows the two directions together:

```text
{◠⌈◠@◠⌉ {□ : ◠ … ◠ : {□ | [◠@◠ □]}}}
  = [⟨◡⟩@○ [|⟨◡⟩]@◠]
```

#### Identify the excluded inputs

At a backward whole input along `@○`, one visit eventually makes
the shifted denominator `○`. The factorial has no finite value
there. These inputs, beginning at `◡`, are its *poles*.

A backward fraction is allowed unless it is a whole count. A journey
with a backward whole component along `@○` and a component away from
`@○` that differs from `○` is also allowed: its complete denominator
is different from `○`. The definition applies to all finite four-component
inputs except those backward whole counts on `@○`.

<details>
<summary>Explore further: another factorial recipe and half-step identities</summary>

#### Reach the same function through an integral

Choose a short forward lower endpoint and a finite upper endpoint
farther along `@○`. At a sample position, raise that position to
the chosen input. Raise the exponential constant to the sample position
taken backward. Combine these two answers, then the piece's width. Join
the contributions and refine the divisions as in the integral chapter.

Take the limits in this order:

1. Refine the pieces on the fixed interval.
2. Bring the lower endpoint toward `○`.
3. Take the upper endpoint without bound.

Both endpoint limits must exist. This integral equals the factorial when
the input's `@○` coefficient is ahead of `◡`. Near `○`, that condition
makes the total contribution small enough. At the far end, the backward
exponential controls its growth.

A component away from `@○` changes the turning, but the same endpoint
condition applies. The product-limit definition also covers the other
allowed inputs.

For reference, in conventional notation this is the shifted gamma function,
`F(q) = Γ(q + 1)`. Its stages are `N^q ∏(k / (q + k))`, with `k` running
from `1` through `N`. The integral is `∫ exp(−t) t^q dt` from zero to infinity
in the stated domain. These reference spellings are not part of the UFN grammar.

The construction uses the [gamma product limit](https://dlmf.nist.gov/5.8.E1)
and [integral definition](https://dlmf.nist.gov/5.2.E1). Its treatment of
directions agrees with the quaternionic extension described by
[Hogan and Massopust, sections 4 and 6](https://arxiv.org/html/1608.08428v1).

#### Check half-step inputs against a turn

The factorial of `⟨◡⟩` is the forward value whose square is an
eighth of a turn's amount. The factorial of `[|⟨◡⟩]` is the
forward value whose square is half of a turn's amount. Their ratio
is a half step, as the recurrence requires.

These are exact relationships between limit values. Their finite
stage approximations need not satisfy them exactly. The conventional
[half-step gamma values](https://dlmf.nist.gov/5.4) give these relations
after the forward shift and the conversion from a half turn to a turn.

The reciprocal factorials used to build the exponential constant
all have whole-count inputs. Their finite curly expressions are
already the exact cases of this general function.

</details>

#### Pause and practice: distinguish the input from the stage

**Marks so far:** The input stays fixed. The stage count and its visiting counter advance through whole counts. A completed factorial uses the limit of the stages.

Keep the input at a half step. When the stage advances from one to two, does the input also become two?

<details>
<summary>Check your answer</summary>

No. The input remains a half. The leading power changes from one raised to a half to two raised to a half, and the inner product now includes the visit at two.

</details>

At input ○, what does the first stage give? What about the second stage?

<details>
<summary>Check your answer</summary>

Both give ◠. Every visiting count is shared by itself, giving ◠, and the leading power also gives ◠. This agrees with the empty product in the whole-count factorial rule.

</details>

## Reference for complete expressions

Use this section when you want to check a rule. You do not need to memorize
it before returning to the playground.

### Words to keep apart

| Word | Meaning here | Small example |
| --- | --- | --- |
| Expression | Written instructions that describe a value | `[◠ ◠ ◡]` |
| Value | What those instructions describe | The expression above describes one forward step. Later, a value can also be a retained sequence. |
| Journey | A change from a start to a finish | Going out and back describes `○`. |
| Amount | A forward, backward, or staying-put value on one path | `◡` is a backward amount. |
| Size | Distance from the start under the chosen measurement, without a direction | `◡` has size `◠`. |
| Entry | One complete piece directly inside a list | `[⟨◠⟩ ◡]` has two entries. |
| Factor position | Which unique factor an angle entry uses | The rightmost position belongs to the two-step factor. |
| Visit | One use of a range's recipe | The visited value replaces its named box. |
| Sequence place | How many entries lie to the right of this entry | The last entry has place `○`. |
| Counter name | A fixed label for a changing visited value | The tag in `□⌊◠⌋` stays fixed. |

“Place” in the opening means a destination on a drawn path. When reading
factor instructions or sequences, use the more specific meanings above.
A direction label names a path; it is neither an amount nor an angle.

The following sections collect the precise rules for combining the
forms we have learned. Letters and words used as placeholders stand for
whole UFN expressions.

### Rules, names, and definitions

The core forms tell us how to build and combine values:

| Forms | Job |
| --- | --- |
| `○`, `◠`, `◡` | Stay, step forward, step backward |
| `[…]`, `{…}`, with an optional bar | Join journeys or combine changes; a bar asks for undoing |
| `⟨…⟩` | Build a number from factor instructions |
| `⌊…⌋` after an angle-bracket number; `*` | Choose its starting factor place; ask for a unique factor’s position |
| `⌊…⌋` after a sequence | Read one entry, counting its place from the right at `○` |
| `⌈…⌉`, including its bar forms | Choose an exponent or ask which exponent reaches a target |
| `@`, `#` | Put an amount along a direction or read a component |
| `□`, name tags, `:`, `…` in ranges | Name a visit and use its value in a recipe |
| `(…)` and parenthesized ranges | Retain entries as a sequence |
| `⌊…⌋` after an endless range | Choose how to measure convergence |

A declaration `≔(pattern : meaning)` supplies a replacement rule outside
that numerical grammar. Digit and Fourier forms get their meanings this
way. They need their declarations, and those declarations can be edited.

The two names `┌┘` and `⟳` have recipes built from the core forms.
The calculator supplies them as fixed constants and recognizes their names
directly. It accepts their supplied declarations unchanged; it does not let
a new declaration give either name a different meaning. Recognition of a
name does not establish the limit of its defining recipe.

### Read a calculator result

The playground uses these labels:

| Label | What it tells you |
| --- | --- |
| Value or exact expression | The displayed result has been established. Some exact answers still need several roots joined together. |
| Recipe | Exact writing has been retained. A constant can stay named; another recipe may need further reduction or proof. Read the reason; an unfinished calculation is not the same as an undefined one. |
| Partial sum, partial product, or partial evaluation | Only the stated finite visits have been evaluated. More visits can change the result. |
| Proved limit | An exact rule establishes where the partial results settle under the chosen measurement. |
| Check expression | A message identifies a spelling problem or an operation with no defined value. |

A decimal reading is a separate approximation. It never supplies the exact
UFN result. For example, `{|○}` has no value; it is not merely a long
calculation that needs more time.

### Rules that every rewriting must keep

These are *invariants*: rules that stay true while we change a spelling,
expand a definition, or work out a value.

**Keep the written structure.**

- An inner expression is one complete entry in its surrounding list.
  `⟨[◡ ◡]⟩` has one outer entry; `⟨◡◡⟩` has two.
- Apply curly entries and visit sequences in their written order.
  Reorder changes only when a rule permits it, as with a finite curly
  list entirely on the original path. A curly bar undoes its entire
  right side; restore that side on the right to recover the left side.
  A retained sequence preserves the order of its entry values.
- A direction label chooses a path without scaling its amount.
  `⟨◠○⟩@⟨◠⟩` has amount three and size three, not six.
- A counter's name stays fixed while its visited value changes. Expansion
  keeps its local names separate from supplied expressions' names, so
  those expressions keep the bindings they had before substitution.

**Keep the value and the conditions for having one.**

- A valid rewriting preserves the value, including every component or
  retained entry. Reading one component with `#` is an operation that
  can discard information; it is not a new spelling of the whole input.
- Every required input must have a value. For example, `{○ {|○}}` is
  undefined: the first entry cannot make the undefined second entry
  valid. An empty range, in contrast, has no recipe entries to evaluate.
- A finite preview is the value after its stated visits. It is not the
  value of an endless recipe. Finding a limit requires an argument about
  every later visit, under the recipe's chosen measurement.
- The calculator's failure to finish a reduction does not make the
  expression undefined. Preserve the exact recipe when a result has
  not been established. A decimal picture supplies no exact proof.

**Keep writing separate from display.**

- Stretching brackets or joining marks into a font ligature changes
  their drawing, not their source text or meaning. Copying returns the
  written marks. Choosing a shorter equivalent result spelling changes
  the written expression, so copying that result returns the shorter form.
- Preferred spellings apply to the classes described below. Do not infer
  that arbitrary sums, exponents, or limits have unique factor coordinates.

Undoing also has conditions. A curly inverse needs a nonzero value. A
logarithm uses its stated branch; it does not undo every possible directed
exponent. Check those conditions before cancelling operations.

### Values allowed in each place

A value made from full steps along the original path, in either direction,
is called an *integer*. A *positive* path value is ahead of `○`;
a *negative* one is behind it. A *nonnegative* value is at `○` or ahead.
These terms describe positions on that path. They do not introduce a
sign prefix: use `◡` for a backward step and `[|…]` to reverse a whole
expression.

- A factor position must be a positive integer, even with empty angle brackets.
- An entry between angle brackets must have a finite value on `@○`. Apply it
  as an exponent to the unique factor at that place, then combine the results.
- A range's first and last counts must be nonnegative integers.
- A sequence-range source must be a finite sequence. Its two visit names
  must be distinct. Parenthesized entries may be numbers or sequences;
  entries joined by square brackets or combined by curly brackets must be numbers.
- An entry lookup needs a finite sequence and a nonnegative integer place
  smaller than its outer length. All source entries must be defined. The
  selected entry keeps its kind: number or sequence.
- A measuring-place attachment belongs to an unbounded range and selects a
  nonnegative integer outside that range's binding. A positive measuring place
  currently requires rational entries on `@○`.
- A direction label after `@` or `#` must give `○`, `◠`, `⟨◠⟩`, or `⟨◠○⟩`.
- The amount before `@` must be a finite value on `@○`. Use square
  brackets to assemble contributions in several directions.
- The input before `#` must be a finite four-component value. Its result is
  the coefficient at the selected label, keeping its forward or backward
  direction and writing it on `@○`. All input
  components must be defined, even those not selected. A sequence must be
  visited explicitly to read a component of each entry.
- A power's base must be a finite positive value on `@○`. The
  following extension permits any finite four-component exponent.
- A logarithm's base must be finite and positive on `@○`, and differ
  from `◠`. A finite positive target on `@○` gives its path logarithm.
  A finite target with any nonzero part away from `@○` gives its principal
  quaternion logarithm. Zero is undefined; a negative target on `@○`
  requires a plane or branch choice that has no syntax yet. In `B⌈E|X⌉`,
  these conditions apply to the changed base `B⌈E⌉` and the target `X`.

Every supplied bound of a range must have a value, even if it has no visits.
An empty range never evaluates its recipe. An empty square range gives
`○`; an empty curly range gives `◠`; an empty parenthesized range gives `()`.

Every entry in an ordinary list must have a value, including every entry
in a curly list containing `○`. A bar cannot undo a curly side
whose value is `○`.

Under ordinary measurement, a limit of four-component partial sums or ordered
partial products exists exactly when each component approaches a finite limit.
Zero limits are permitted. Every entry must be defined. Keep nested limits in
their written order, from the inside outward.

### How the power cases fit together

For an exponent on the original path that cannot be written as a
share of whole counts, use increasingly close fractions. Their powers
approach a unique limit. That limit defines the power.

For exponents with several components, begin with another recipe.
Given any finite value `X`, start with `◠`. Join one copy of
`X`, then two copies combined in curly brackets and shared by the
second factorial, then three copies shared by the third factorial,
and continue:

```text
[□ : ○ … :
  {
    {□⌊⟨◠⟩⌋ : ◠ … □ : X}
    |
    {□⌊⟨◠⟩⌋ : ◠ … □ : □⌊⟨◠⟩⌋}
  }
]
```

`X` is a placeholder for the chosen expression. The first visit has
empty curly lists on both sides of the bar, so it contributes `◠`.
This recipe has a finite limit for every finite `X`. It is called the
*exponential function*.

For a positive value `B` on `@○`, there is exactly one value
`L` on that path whose exponential-function result is `B`.
This `L` is called the *natural logarithm* of `B`.
It is the logarithm of `B` with the exponential constant as its base:
`┌┘⌈|B⌉`.

To find `B⌈Q⌉` for any finite four-component value `Q`, find
that `L` and use `{L Q}` as the exponential function's input.
This agrees with the earlier power rules on the original path.
There is no power rule for other bases in this notation.

Joining exponents along one fixed direction corresponds to combining
the resulting powers in curly brackets. For exponents in different turn
directions, that shortcut does not hold in general: the order of those
changes can matter.

For a unique factor `P` and an exponent `E` on `@○`, these spellings
have the same value:

```text
⟨E⟩⌊*P⌋
P⌈E⌉
```

The first assigns an instruction at a factor position. The second applies
an upper attachment to a whole value. Only the second form permits
an exponent with components away from `@○`.

### The principal logarithm rule

For a target `X` with a nonzero part away from `@○`, let `R` be its
ordinary total size. Join its three components away from `@○`, then
share that value by its own size to get a direction `U` of size `◠`.

In the plane of `@○` and `U`, let `A` be the turn amount from `◠@○`
toward `U` that reaches `{X | R}`. It is strictly between no turn and
a half turn. Then:

```text
B⌈|X⌉ = {[┌┘⌈|R⌉ {A U}] | ┌┘⌈|B⌉}
```

The first contribution sets the size; the second sets the turn.
The share by the natural logarithm of `B` adjusts both for the chosen base.
For a base between `○` and `◠`, this share reverses both contributions.

This is the conventional principal quaternion logarithm divided by the
natural logarithm of the base. The
[Quaternionic reference](https://moble.github.io/Quaternionic.jl/dev/manual/#Base.log)
describes the principal choice and the ambiguity on the backward path.
UFN leaves that path undefined until a plane choice can be written.

For every allowed base and target, `B⌈B⌈|X⌉⌉ = X`.
The reverse identity holds for exponents on `@○`, but not for arbitrary
directed exponents. Logs of curly products also cannot generally be split
into sums: ordered changes and branch choices still matter.

### Match a definition's arguments

The pieces supplied by the writer are called *arguments*. A name in the
pattern keeps one complete piece for use in the meaning; this is called
*capturing* it. A name captures one expression unless the meaning uses it
as the source of a sequence range or an entry lookup.
In either role it captures a sequence of entries. Passing it to an earlier
definition's sequence argument also gives it that role. A name cannot serve
both roles in one definition.
Every occurrence of that name in the meaning refers to the captured piece.
Match whole pieces, not parts of their symbols.

The guide uses named boxes for the captured pieces. Their lower-corner tags keep
the pieces distinct. Inside a pattern, those boxes name the pieces being
captured. They are not counters visiting numerical bounds.

Use each argument name once in the pattern. It may appear as often as
needed in the meaning. A repeated expression argument is substituted at
each use; a sequence range reads its source entries once before visiting them.

Begin a new pattern with a symbol that does not already start another
form. Keep its literal brackets balanced. In this first version, each
leading symbol selects one pattern within a document. A sequence capture
must end at a written closing mark, such as `⟧`, so its end is unambiguous.
Spaces around symbols do not affect matching.

### Keep a definition's names separate

A supplied expression keeps its surrounding names. A counter introduced
by the definition must not accidentally give those names new meanings.
When necessary, rename the definition's local counters to fresh names
before making the replacement. Every use supplied by those counters changes
with them; the writer's supplied names keep their meanings.
This is called *capture-avoiding expansion*.

Definitions apply to following forms in the document. Give a new form one
meaning, using forms already known. Do not overwrite existing meanings or
make a chain of definitions that leads back to itself. A `≔(…)` declaration
stands separately from numerical expressions; it cannot be a numerical
entry or an exponent.

Every name in the meaning must get its value either from an argument
captured by the pattern or from a range surrounding that use.
An earlier definition can be used in a later meaning; a later definition
cannot be used before it has been declared.

In the calculator, put declarations first and one expression after them.
Their scope is that input. Opening another example starts a new document.
Declarations alone are accepted, but have no numerical answer. The two
constant names `┌┘` and `⟳` are supplied and recognized directly.
Their defining declarations can be written out again unchanged, but their
meanings cannot be replaced.

### The written language

A *grammar* lists the allowed shapes of expressions. In the grammar
below, quoted symbols are literal UFN text. Names such as `expression`
describe a shape to fill in. A question mark permits omission; an unquoted star
permits any number of repetitions, including none. A bar separates
alternatives.

The declaration form belongs outside the expression grammar:

```text
document   := definition* expression?
definition := "≔" "(" pattern ":" meaning ")"
```

Here `pattern` and `meaning` are the templates described in
[Define a shorthand](#define-a-shorthand), with tagged boxes for captured
pieces and local bindings. A declaration is not an `expression` below.
User-defined forms acquire meaning through their matching declarations.
Double square brackets have no built-in production or interpretation here.
The grammar below describes the core after replacing user-defined forms.

```text
expression   := power (("@" | "#") power)*
power        := primary (upper | selection)*
selection    := "⌊" expression "⌋"
upper        := "⌈" expression "⌉"
              | "⌈" "|" expression "⌉"
              | "⌈" expression "|" expression "⌉"
primary      := "○" | "◠" | "◡"
              | "⟳" | "┌" "┘"
              | counter_name
              | "⟨" expression* "⟩" ("⌊" expression "⌋")?
              | "[" expression* ("|" expression*)? "]"
              | "{" expression* ("|" expression*)? "}"
              | "(" expression* ")"
              | "[" counter_name ":" expression ellipsis expression ":" expression "]"
              | "{" counter_name ":" expression ellipsis expression ":" expression "}"
              | "(" counter_name ":" expression ellipsis expression ":" expression ")"
              | "[" counter_name ":" expression ellipsis ":" expression "]" measurement?
              | "{" counter_name ":" expression ellipsis ":" expression "}" measurement?
              | "[" counter_name counter_name ":" sequence_source ":" expression "]"
              | "{" counter_name counter_name ":" sequence_source ":" expression "}"
              | "(" counter_name counter_name ":" sequence_source ":" expression ")"
              | "*" primary
              | "index" "(" expression ")"
counter_name := identifier ("⌊" name_tag "⌋")?
measurement  := "⌊" expression "⌋"
ellipsis     := "…" | "..."
sequence_source := expression
```

A sequence source must produce a finite sequence. Inside a definition it
may name a captured sequence argument. Other sources include parentheses,
generated sequences, and defined forms that produce sequences.
The two counter names in its header must be distinct. They bind the current
entry and the number of entries to its right, respectively.

Expressions can produce numbers or sequences. Numerical positions, such as
power bases, angle-bracket entries, range endpoints, and entries being joined
or multiplied, require numbers. A parenthesized entry may produce either
kind. A sequence with one entry is still a sequence.

`primary` means an expression before any upper attachment, entry lookup, `@`, or `#`
label. `⟳` and `┌┘` are defined names for the complete turn and exponential
constant values, independent of any surrounding counter. Each can be
replaced by its defining limit, with its counters bound inside that definition.
The two marks of `┌┘` form one name; they cannot contain an expression.

`identifier` is a nonempty run of name characters. Words and symbols are
allowed. Whitespace, numeric digits, primitive values and constant names,
brackets, `:`, `@`, `#`, `|`, `*`, `…`, `≔`, and `=` delimit names.
A declared form's leading symbol is reserved for that form in its document.
The input alias `index(…)` is also recognized before names.

`name_tag` is nonempty fixed text with balanced brackets. Its spelling,
with spaces ignored, distinguishes names; it is never evaluated.
A bare identifier and a tagged identifier name different bindings.
Differences in their normalized writing distinguish names, including case
and the choice of counter glyph. The guide's `□`
is a writing convention. It has no special arithmetic meaning.

Inside a definition pattern, its leading symbol introduces the form;
subsequent identifiers capture arguments. Literal delimiters keep those
captures separate. Numerical constants and operation marks retain their
ordinary meanings.

Range colons and dots appear directly inside their enclosing square,
curly, or round brackets. They distinguish a range from an ordinary list.
Each list entry contains one complete expression. An upper attachment
contains one expression, or two sides separated by a single bar. The left
side of that bar may be empty; the target on the right is required.

Spaces may separate entries or surround punctuation. They do not change
a value. The syntax needs no numeric digits.

Upper attachments and entry lookups apply in written order, before `@`
and `#`. For example, `(⟨◠⟩)⌊○⌋⌈⟨◠⟩⌉` selects two, then squares it.
The first lower attachment after angle brackets, a counter box, or an
unbounded square or curly range belongs to that primary: it supplies the
factor position, name tag, or measuring place. A further lower attachment
is an entry lookup and requires a sequence result.

To raise a whole labeled
component, group it: `[A@I]⌈E⌉`. Its base must still meet the power
rule. Successive upper attachments apply from left to right:
`B⌈E⌉⌈F⌉` means `[B⌈E⌉]⌈F⌉`. A bar asks for a logarithm:
`B⌈|X⌉` uses base `B`, and `B⌈E|X⌉` means `B⌈E⌉⌈|X⌉`.
The `@` and `#` attachments apply from left to right. Each label consumes
one `power`; use square brackets for a more complex label. Thus
`X#I@J` means `[X#I]@J`. In `X#I⌈E⌉`, the upper attachment belongs to
the label; write `[X#I]⌈E⌉` to raise the selected amount instead.
Each `@` still requires an amount on the original path. For example,
`◠@◠@◠` parses but fails that value rule at its second `@`.

The `*` prefix takes one `primary`, including the first lower attachment on
angle brackets. Upper attachments, entry lookups, direction labels, and component selections following it
apply to the lookup's answer: `*P⌈E⌉` means `[*P]⌈E⌉`, and
`*P@I` means `[*P]@I`, and `*P#I` means `[*P]#I`. To include those
operations in the input, group them after the star, as in `*[P⌈E⌉]`,
`*[P@I]`, or `*[P#I]`. To ask for a selected entry's factor position,
write `*[(⟨◠○○⟩ ◠)⌊◠⌋]`.

The parser also accepts `index(expression)` as an input alias for
`*[expression]`. The contents of its parentheses are one complete expression;
an upper attachment or direction label after the closing parenthesis applies
to the lookup's answer. Use `*` in the notation's ordinary written form.

The equals mark compares expressions; it is not part of an expression.

Some well-formed expressions have no value: an invalid position,
direction label, divisor, power base, logarithm base or target, or `*` input; a counter
without a value in its scope; or an endless sum or product without a finite limit.
Writing an expression does not supply a method for deciding every
question about its value or equality to another expression.

## Preferred spellings

A value that can be written as a journey of whole steps, forward or
backward, shared by a forward whole count is called *rational*. It can have
many spellings. For example, a half step is also two quarters of a step.

For these values we choose one preferred spelling, also called the
*canonical* spelling:

1. Keep `○`, `◠`, and `◡` for the starting place and the two
   opposite steps.
2. Write any other backward rational value as `[|P]`, where `P`
   is the preferred spelling of its size.
3. For another forward rational value, write the whole counts on either
   side of its sharing bar as products of unique factors. At each factor position,
   subtract the number of copies after the bar from the number before
   it. That difference is the exponent at that place. Spell each exponent by
   these same rules.
4. Keep entries through the leftmost place that has work to do.
   Put `○` in skipped places between it and the first unique factor.

Shared factor instructions cancel, so different fractions describing
the same value get the same spelling. Repeating the rule inside an
exponent eventually reaches the single marks.

Numbers with lower attachments and expressions using other brackets remain
valid spellings. The preference gives counter tags an unambiguous written
form; it does not require every expression to be rewritten this way.

Numbers written with angle brackets and rational exponents likewise have
a unique list of exponents for their value. This does not give a preferred spelling
for every possible sum, root, or endless expression. Deciding that two
such expressions have the same value can require a separate argument.

Allowing arbitrary exponents also allows different angle expressions for
the same value. For example, an exponent that makes the two-step factor
reach the three-step factor describes the latter using the former's place.
The uniqueness claim here is specifically for rational exponent entries.
Raise both expressions to a common whole power that makes all their
exponents whole. Then apply unique factorization of whole counts. The wider language supplies other descriptions of values.

### Choose a comfortable display spelling

The *dense* form writes every factor place through the first one, including
empty places. This canonical form serves as a reference spelling. A displayed result can
use lower attachments to skip empty factor places. For example:

```text
⟨◠⟩⌊⟨⟨◠○⟩○⟨⟨◠⟩⟩⟩⌋
```

This writes the unique factor at the two-thousandth position. Its dense
form has nineteen hundred ninety-nine empty places following the forward
entry; the attached form has seventeen marks in total.

Separated groups of occupied places can be written as several positioned
numbers combined in curly brackets. The display chooses this form when
its brackets and position labels take less writing than the skipped places.
The same shortening can happen inside exponents and position expressions.
To reverse the complete value, enclose its whole spelling in `[|…]`.
A direction label likewise applies to the whole value before it.

This is a choice among equivalent expressions. Counter name tags continue
to use their fixed dense canonical form. Tables that align factor entries
show the dense entries so the columns retain their meaning. The playground
offers a dense-result switch alongside the shorter display; copying the
result copies the spelling being shown. Font ligatures are a separate
choice about drawing those marks.

### Cancel roots inside a larger calculation

Different roots in an intermediate sum can still cancel in a larger
calculation. Combine every entry of the first square list with every entry
of the second, keeping each undoing in place, and join the results:

```text
{[⟨⟨◡⟩⟩ ⟨⟨◡⟩○⟩] [⟨⟨◡⟩⟩ | ⟨⟨◡⟩○⟩]} = ◡
```

The two mixed pairs undo each other. The remaining pairs give the two-step
count with the three-step count undone. The evaluator can perform this
reduction exactly. Combining this result with `⟨⟨◡⟩⟩` gives
`[|⟨⟨◡⟩⟩]`, a preferred spelling that is not rational. An intermediate
sum need not have a preferred spelling for the final answer to have one.

Sharing by a sum of square roots can use the same cancellation. To undo
`[◠ ⟨⟨◡⟩⟩]`, try `[⟨⟨◡⟩⟩ | ◠]`:

```text
{[◠ ⟨⟨◡⟩⟩] [⟨⟨◡⟩⟩ | ◠]} = ◠
```

The mixed terms cancel, leaving the two-step count with one step undone.
So the second expression is the first one's reciprocal. The calculator
extends this method to larger sums of square roots.

An exact answer can still need several roots joined in square brackets.
The workbench displays that reduced expression and labels it as exact.
It does not claim that every such value has one preferred factor spelling.

## Exact recipes for some useful values

Here are a few more values to explore. Each has a complete recipe using
the forms already introduced.

### Try other recipes

| Expression | What it gives |
| --- | --- |
| `{[◠ ⟨◠○○⟩⌈⟨◡⟩⌉] | ⟨◠⟩}` | A forward length whose square equals that length with `◠` joined to it; called the golden ratio |
| `[□ : ◠ … : {|□ ⟨◠⟩⌈□⌉}]` | The input on `@○` whose exponential-function result is `⟨◠⟩`: its natural logarithm |
| `[□ : ◠ … : {|□⌈⟨◠⟩⌉}]` | The square of a turn's amount shared by `⟨◠⟨◠○⟩⟩` |
| `[□ : ◠ … ⟨◠○◠⟩ : {|□ [□ ◠]}]` | `{⟨◠○◠⟩ | ⟨◠○○○○⟩}` |
| `[□ : ◠ … : {|□ [□ ◠]}]` | `◠` |
| `[□ : ◠ … ⟨◠○○⟩ : ⟨◠⟩⌊□⌋]` | The first five unique factors joined together: `⟨◠○○⟨◠⟩⟩` |

The expression `◡⌈⟨◡⟩⌉` has no value under the power rule:
its base points backward. Writing a well-formed expression does not
guarantee that its requested operation is defined.

## Display

A font may draw several marks as a single joined shape, called a
*ligature*. Begin with the expanded spelling, then learn its joined
shape as a quicker way to recognize and write the same marks.

Joined shapes cover the whole counts from two through eleven, plus a half,
third, quarter, sixth, three halves, and two thirds of a step. The marks `○` and `◠` keep their
existing shapes. Some examples are:

| Expanded spelling | Joined shape |
| --- | --- |
| `⟨◠⟩` | An upper curve meeting the two angle corners |
| `⟨◡⟩` | A lower curve meeting the same corners |
| `⟨◠○⟩` | An upper curve joined to a circle between the corners |
| `⟨⟨◠⟩⟩` | An upper curve with two pairs of joined corners |
| `⟨◠◠⟩` | Two upper curves sharing a join between the outer corners |
| `⟨◠○◠⟩` | An upper curve, a skipped-place loop, and another upper curve |
| `⟨◡○⟩` | A lower curve joined to a skipped-place loop |
| `⟨[◡ ◡]⟩` | Two lower curves grouped inside a small square enclosure, between the outer corners |
| `⟨◡◡⟩` | Two lower curves sharing a join between the outer corners |
| `⟨◠◡⟩` | An upper curve followed by a lower curve, forming a wave between two angle wings |
| `⟨◡◠⟩` | The reversed wave: a lower curve followed by an upper curve between the same wings |

Five, seven, and eleven use smaller loops to fit their skipped places
closer together. Each skipped place still has its own loop.

The quarter groups two backward steps in square brackets, making one
factor instruction: undo a doubling twice. Without the square brackets,
`⟨◡◡⟩` gives two factor instructions and names a sixth.
The equivalent spelling `⟨[|⟨◠⟩]⟩` uses the same joined quarter shape.

Inner brackets show which marks belong to a nested count. In `⟨⟨◠○⟩⟩`
they enclose both the arch and loop. In `⟨⟨◠⟩○⟩` the loop stays outside.
Tables that line up unique-factor entries keep every spelling expanded,
even when compact display is selected.

Joined spellings can appear inside larger numbers, upper and lower
attachments, counter names, and direction labels. The surrounding marks
still do their usual work. For example, the lower attachment in
`⟨◠⟩⌊⟨◠⟩⌋` sets the first number's position even when either
angle-bracket spelling is drawn as a joined shape.

The joined shape stands for exactly the original text and follows the
same rules. The expanded Unicode spelling remains enough to read, copy,
edit, and preserve every expression without special font support.
Readers can choose expanded or compact display. Joining marks never
evaluates or rewrites an expression.
