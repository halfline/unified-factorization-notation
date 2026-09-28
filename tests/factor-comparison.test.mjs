import test from 'node:test';
import assert from 'node:assert/strict';
import UFN from '../src/ufn.js';
import comparison from '../src/factor-comparison.js';

const canonical = source => UFN.compute(source).canonical;
test('twelve and eighteen reveal shared groups and their smallest common count', () => {
  const result = comparison.compare([2, 1, 0], [1, 2, 0]);
  assert.equal(result.shared.canonical, UFN.encodeInteger(6));
  assert.equal(result.common.canonical, UFN.encodeInteger(36));
  assert.equal(result.fits, false);
  assert.equal(result.blocked, 0);
  assert.equal(result.firstGroups.canonical, UFN.encodeInteger(2));
  assert.equal(result.secondGroups.canonical, UFN.encodeInteger(3));
});

test('comparison decisions agree with whole quotients, including unit and missing places', () => {
  const values = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [2, 1, 0], [1, 2, 0], [2, 1, 1]];
  for (const a of values) for (const b of values) {
    const result = comparison.compare(a, b);
    assert.equal(result.fits, Number.isInteger(result.second.decimal / result.first.decimal));
    assert.equal(canonical(`{${result.shared.source} ${result.firstGroups.source}}`), result.first.canonical);
    assert.equal(canonical(`{${result.shared.source} ${result.secondGroups.source}}`), result.second.canonical);
    assert.equal(canonical(`{${result.shared.source} ${result.common.source}}`), canonical(`{${result.first.source} ${result.second.source}}`));
  }
  assert.throws(() => comparison.compare([-1, 0, 0], [0, 0, 0]), RangeError);
});

test('perfect powers split every instruction, while nonperfect roots still recover their inputs', () => {
  for (const [uses, stages, whole] of [[[3, 2, 0], 2, false], [[4, 2, 0], 2, true], [[0, 3, 0], 3, true], [[0, 3, 0], 2, false], [[0, 0, 0], 4, true]]) {
    const result = comparison.compare(uses, [0, 0, 0], stages);
    assert.equal(result.wholeRoot, whole);
    assert.equal(canonical(result.root.canonical + '⌈' + UFN.encodeInteger(stages) + '⌉'), result.first.canonical);
  }
});
