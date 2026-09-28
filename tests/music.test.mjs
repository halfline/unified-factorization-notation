import test from 'node:test';
import assert from 'node:assert/strict';
import UFN from '../src/ufn.js';
import music from '../src/music.js';

function fromInstructions(uses) {
  return UFN.compute('⟨' + [...uses].reverse().map(UFN.encodeInteger).join('') + '⟩').canonical;
}

test('musical factor columns describe exactly the ratios shown', () => {
  for (const interval of music.intervals) {
    assert.equal(UFN.compute(interval.source).canonical, fromInstructions(interval.uses));
    const [numerator, denominator = '1'] = interval.ratio.split('/');
    assert.ok(Math.abs(UFN.compute(interval.source).value[0] - Number(numerator) / Number(denominator)) < 1e-12);
  }
  for (const row of music.route) assert.equal(row.canonical, fromInstructions(row.uses));
  assert.equal(music.route.at(-1).decimal, 81 / 80);
});

test('every composition keeps its value and adjusts only the octave coordinate', () => {
  for (let a = 0; a < music.intervals.length; a++) {
    for (let b = 0; b < music.intervals.length; b++) {
      const { joined, normalized, octaves } = music.combine(a, b);
      assert.equal(joined.canonical, fromInstructions(joined.uses));
      assert.equal(normalized.canonical, fromInstructions(normalized.uses));
      assert.ok(normalized.decimal >= 1 && normalized.decimal < 2);
      assert.equal(joined.decimal, normalized.decimal * 2 ** octaves);
      assert.deepEqual(normalized.uses.slice(1), joined.uses.slice(1));
    }
  }
  assert.equal(music.combine(1, 1).octaves, 2);
  assert.equal(music.combine(0, 0).octaves, 0);
});
