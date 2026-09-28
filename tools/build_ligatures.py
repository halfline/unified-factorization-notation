"""Build the original UFN symbol font. Requires FontTools; viewing needs no build.

The sixteen discretionary ligatures substitute glyphs only. Their Unicode source,
including spaces, remains available to selection, copying, and the evaluator.
"""

from itertools import product
from math import cos, hypot, pi, sin
from pathlib import Path

from fontTools.feaLib.builder import addOpenTypeFeaturesFromString
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen


ROOT = Path(__file__).resolve().parent.parent
STROKE = 48
glyphs = {}
widths = {}


def polygon(pen, points):
    pen.moveTo(points[0])
    for point in points[1:]:
        pen.lineTo(point)
    pen.closePath()


def disk(pen, center, radius):
    polygon(pen, [(center[0] + radius * cos(-2 * pi * n / 16),
                   center[1] + radius * sin(-2 * pi * n / 16)) for n in range(16)])


def stroke(pen, points, width=STROKE):
    """Round strokes made from overlapping, equally wound filled contours."""
    radius = width / 2
    for start, end in zip(points, points[1:]):
        dx, dy = end[0] - start[0], end[1] - start[1]
        length = hypot(dx, dy)
        nx, ny = -dy * radius / length, dx * radius / length
        polygon(pen, [(start[0] + nx, start[1] + ny),
                      (end[0] + nx, end[1] + ny),
                      (end[0] - nx, end[1] - ny),
                      (start[0] - nx, start[1] - ny)])
    for point in points:
        disk(pen, point, radius)


def arc(pen, left, right, center=375, height=205, downward=False):
    middle, radius = (left + right) / 2, (right - left) / 2
    sign = -1 if downward else 1
    stroke(pen, [(middle - radius * cos(pi * n / 32),
                  center + sign * height * sin(pi * n / 32)) for n in range(33)])


def circle(pen, x, y, radius):
    stroke(pen, [(x + radius * cos(2 * pi * n / 48),
                  y + radius * sin(2 * pi * n / 48)) for n in range(49)])


def brackets(pen, left, right, inset=135, bottom=100, top=650):
    stroke(pen, [(left + inset, top), (left, 375), (left + inset, bottom)])
    stroke(pen, [(right - inset, top), (right, 375), (right - inset, bottom)])


def glyph(name, advance, draw):
    pen = TTGlyphPen(None)
    draw(pen)
    outline = pen.glyph()
    if outline.numberOfContours:
        outline.flags[0] |= 0x40  # OVERLAP_SIMPLE: intentional stroke intersections.
    glyphs[name] = outline
    widths[name] = advance


glyph(".notdef", 600, lambda p: stroke(p, [(90, 100), (90, 650), (510, 650), (510, 100), (90, 100)]))
glyph("space", 300, lambda p: None)
glyph("circle", 600, lambda p: circle(p, 300, 375, 210))
glyph("up", 600, lambda p: arc(p, 80, 520, center=270, height=220))
glyph("down", 600, lambda p: arc(p, 80, 520, center=480, height=220, downward=True))
glyph("left", 340, lambda p: stroke(p, [(265, 680), (80, 375), (265, 70)]))
glyph("right", 340, lambda p: stroke(p, [(75, 680), (260, 375), (75, 70)]))
# A ligature can only match characters supplied by this font. Keep the square
# brackets and bar available as ordinary glyphs too, including in expanded mode.
glyph("square_left", 600, lambda p: stroke(p, [(430, 700), (185, 700), (185, 50), (430, 50)]))
glyph("square_right", 600, lambda p: stroke(p, [(170, 700), (415, 700), (415, 50), (170, 50)]))
glyph("bar", 600, lambda p: stroke(p, [(300, 700), (300, 50)]))


def joined_step(pen, downward=False):
    brackets(pen, 85, 675)
    arc(pen, 85, 675, downward=downward)


ENTRY_WIDTHS = {"up": 440, "down": 440, "circle": 360, "small_circle": 220,
                "nested_up": 730, "nested_up_circle": 990}


def joined_entries(pen, entries):
    """Join the original factor entries without erasing their nesting or skips."""
    right = 85 + sum(ENTRY_WIDTHS[entry] for entry in entries)
    nested = any(entry.startswith("nested_") for entry in entries)
    brackets(pen, 85, right, inset=160 if nested else 135,
             bottom=50 if nested else 100, top=700 if nested else 650)
    left = 85
    for entry in entries:
        end = left + ENTRY_WIDTHS[entry]
        if entry in ("up", "down"):
            arc(pen, left, end, downward=entry == "down")
        elif entry in ("circle", "small_circle"):
            circle(pen, (left + end) / 2, 375, ENTRY_WIDTHS[entry] / 2)
        else:
            inner_left, inner_right = left + 110, end - 110
            brackets(pen, inner_left, inner_right, inset=120, bottom=145, top=605)
            stroke(pen, [(left, 375), (inner_left, 375)])
            stroke(pen, [(inner_right, 375), (end, 375)])
            arc(pen, inner_left, inner_left + 510, height=170)
            if entry == "nested_up_circle":
                circle(pen, inner_right - 130, 375, 130)
        left = end


def joined_three_halves(pen, reciprocal=False):
    """The up/down entries form a wave; reverse them for two thirds."""
    brackets(pen, 85, 675)
    arc(pen, 85, 380, height=160, downward=reciprocal)
    arc(pen, 380, 675, height=160, downward=not reciprocal)


def joined_quarter(pen):
    """Two backward steps grouped as one factor instruction: ⟨[◡◡]⟩."""
    brackets(pen, 85, 1115, inset=120, bottom=75, top=675)
    stroke(pen, [(315, 600), (225, 600), (225, 150), (315, 150)])
    stroke(pen, [(885, 600), (975, 600), (975, 150), (885, 150)])
    arc(pen, 280, 600, height=160, downward=True)
    arc(pen, 600, 920, height=160, downward=True)


glyph("angle_up", 760, joined_step)
glyph("angle_down", 760, lambda p: joined_step(p, downward=True))
glyph("angle_negative_two", 1200, joined_quarter)
glyph("angle_up_down", 760, joined_three_halves)
glyph("angle_down_up", 760, lambda p: joined_three_halves(p, reciprocal=True))
joined = [
    ("⟨◠○⟩", "angle_up_circle", ("up", "circle")),
    ("⟨⟨◠⟩⟩", "angle_angle_up", ("nested_up",)),
    ("⟨◠○○⟩", "angle_up_two_circles", ("up", "small_circle", "small_circle")),
    ("⟨◠◠⟩", "angle_up_up", ("up", "up")),
    ("⟨◠○○○⟩", "angle_up_three_circles", ("up", "small_circle", "small_circle", "small_circle")),
    ("⟨⟨◠○⟩⟩", "angle_nested_three", ("nested_up_circle",)),
    ("⟨⟨◠⟩○⟩", "angle_nested_two_circle", ("nested_up", "circle")),
    ("⟨◠○◠⟩", "angle_up_circle_up", ("up", "circle", "up")),
    ("⟨◠○○○○⟩", "angle_up_four_circles", ("up", "small_circle", "small_circle", "small_circle", "small_circle")),
    ("⟨◡○⟩", "angle_down_circle", ("down", "circle")),
    ("⟨◡◡⟩", "angle_down_down", ("down", "down")),
]
for source, name, entries in joined:
    glyph(name, 170 + sum(ENTRY_WIDTHS[entry] for entry in entries),
          lambda pen, entries=entries: joined_entries(pen, entries))

font = FontBuilder(1000, isTTF=True)
font.setupGlyphOrder(list(glyphs))
font.setupCharacterMap({
    0x20: "space", ord("○"): "circle", ord("◠"): "up", ord("◡"): "down",
    ord("⟨"): "left", ord("⟩"): "right", ord("<"): "left", ord(">"): "right",
    ord("["): "square_left", ord("]"): "square_right", ord("|"): "bar",
})
font.setupGlyf(glyphs)
font.setupHorizontalMetrics({name: (widths[name], getattr(outline, "xMin", 0))
                             for name, outline in glyphs.items()})
font.setupHorizontalHeader(ascent=850, descent=-200)
font.setupNameTable({
    "familyName": "UFN Symbols", "styleName": "Regular",
    "uniqueFontIdentifier": "UFN Symbols 1.6", "fullName": "UFN Symbols Regular",
    "psName": "UFNSymbols-Regular", "version": "Version 1.6",
    "description": "Original UFN outlines with joined whole counts two through eleven, halves, thirds, quarters, sixths, three halves, and two thirds.",
})
font.setupOS2(sTypoAscender=850, sTypoDescender=-200, sTypoLineGap=0,
              usWinAscent=850, usWinDescent=200, fsType=0, sxHeight=500, sCapHeight=700)
font.setupPost()
font.setupMaxp()
font.setupHead(created=2082844800, modified=2082844800)
font.font.recalcTimestamp = False

# Match the larger pattern first, before its inner angle_up can be joined.
# Optional single spaces cover the encoder's spelling and ordinary spaced input.
characters = {"⟨": "left", "⟩": "right", "◠": "up", "◡": "down", "○": "circle",
              "[": "square_left", "]": "square_right", "|": "bar"}
spellings = [(source, name) for source, name, _ in joined]
spellings.extend([("⟨◠◡⟩", "angle_up_down"), ("⟨◡◠⟩", "angle_down_up"), ("⟨◠⟩", "angle_up"), ("⟨◡⟩", "angle_down"),
                  ("⟨[|⟨◠⟩]⟩", "angle_negative_two"),
                  ("⟨[◡◡]⟩", "angle_negative_two")])
patterns = [(tuple(characters[mark] for mark in source), name)
            for source, name in sorted(spellings, key=lambda item: len(item[0]), reverse=True)]
rules = []
for components, result in patterns:
    for spaces in product((False, True), repeat=len(components) - 1):
        sequence = [components[0]]
        for spaced, component in zip(spaces, components[1:]):
            if spaced:
                sequence.append("space")
            sequence.append(component)
        rules.append("sub " + " ".join(sequence) + " by " + result + ";")
features = "languagesystem DFLT dflt;\nlanguagesystem latn dflt;\nfeature dlig {\n"
features += "\n".join(rules) + "\n} dlig;"
addOpenTypeFeaturesFromString(font.font, features)
font.font.flavor = "woff"
destination = ROOT / "assets" / "ufn-ligatures.woff"
destination.parent.mkdir(exist_ok=True)
font.save(destination)
print(f"Wrote {destination.relative_to(ROOT)} ({destination.stat().st_size} bytes)")
