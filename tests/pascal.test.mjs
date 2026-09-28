import test from 'node:test';
import assert from 'node:assert/strict';
import UFN from '../src/ufn.js';
import library from '../src/library.js';
import pascal from '../src/pascal.js';
const n = UFN.encodeInteger;

test('selection declarations produce Pascal rows and satisfy the two-neighbor rule', () => {
  let previous = [];
  for (let available = 0; available <= 12; available++) {
    const row = pascal.row(available).answer;
    assert.equal(row.items.length, available + 1);
    assert.equal(row.items[0].canonical, '◠');
    assert.equal(row.items.at(-1).canonical, '◠');
    for (let picked = 0; picked <= available; picked++) {
      assert.equal(row.items[picked].canonical, row.items[available - picked].canonical);
      if (picked > 0 && picked < available) assert.equal(row.items[picked].canonical, UFN.compute('[' + previous[picked - 1].canonical + ' ' + previous[picked].canonical + ']').canonical);
    }
    previous = row.items;
  }
  assert.equal(pascal.selection(6, 2).result.canonical, n(15));
  assert.throws(() => pascal.selection(2, 3), RangeError);
});

test('factorial cancellation table reconstructs each exact selection count', () => {
  for (const [available, picked] of [[0, 0], [1, 0], [5, 2], [8, 4], [12, 6], [20, 10]]) {
    const result = pascal.selection(available, picked);
    const kept = '⟨' + result.rows.map(row => row.remaining).reverse().join('') + '⟩';
    assert.equal(UFN.compute(kept).canonical, result.result.canonical);
    assert.equal(UFN.compute(`{${result.result.canonical} ${result.denominator.canonical}}`).canonical, result.numerator.canonical);
  }
  assert.equal(pascal.selection(20, 10).result.canonical, n(184756));
});

test('retained rows compose with polynomial declarations and expand without special evaluator features', () => {
  const declarations = library.declarations(['pascal', 'polynomial']);
  for (let available = 0; available <= 6; available++) {
    const source = declarations + `△⟪${n(2)} : ▱⟪${n(available)}⟫⟫`;
    const expected = UFN.compute(`${n(3)}⌈${n(available)}⌉`).canonical;
    assert.equal(UFN.compute(source).canonical, expected);
    assert.equal(UFN.compute(UFN.expand(source).expanded).canonical, expected);
  }
});
