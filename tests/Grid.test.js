import test from 'node:test';
import assert from 'node:assert';
import Grid from '../sources/WFC/Grid.js';

class MockRandom {
    next() { return 0.5; }
}

class MockCell {
    constructor(collapsed, entropy) {
        this.collapsed = collapsed;
        this.modules = new Array(entropy);
    }
}

test('Grid.getSmallestEntropyCells', async (t) => {
    await t.test('returns all uncollapsed cells when they have the same entropy', () => {
        const grid = new Grid(new MockRandom(), 2, 2);
        grid.cells = [
            new MockCell(false, 3),
            new MockCell(false, 3),
            new MockCell(false, 3),
            new MockCell(false, 3)
        ];
        const result = grid.getSmallestEntropyCells();
        assert.strictEqual(result.length, 4);
    });

    await t.test('filters out collapsed cells and returns cells with minimum entropy', () => {
        const grid = new Grid(new MockRandom(), 2, 2);
        grid.cells = [
            new MockCell(true, 1),
            new MockCell(false, 3),
            new MockCell(false, 2),
            new MockCell(false, 3)
        ];
        const result = grid.getSmallestEntropyCells();
        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].modules.length, 2);
    });

    await t.test('returns multiple cells when they share the same minimum entropy', () => {
        const grid = new Grid(new MockRandom(), 2, 2);
        grid.cells = [
            new MockCell(false, 3),
            new MockCell(false, 2),
            new MockCell(false, 2),
            new MockCell(false, 3)
        ];
        const result = grid.getSmallestEntropyCells();
        assert.strictEqual(result.length, 2);
        assert.strictEqual(result[0].modules.length, 2);
        assert.strictEqual(result[1].modules.length, 2);
    });

    await t.test('returns null when all cells are collapsed', () => {
        const grid = new Grid(new MockRandom(), 2, 2);
        grid.cells = [
            new MockCell(true, 1),
            new MockCell(true, 1),
            new MockCell(true, 1),
            new MockCell(true, 1)
        ];
        const result = grid.getSmallestEntropyCells();
        assert.strictEqual(result, null);
    });

    await t.test('returns cells with entropy 1 if they are not collapsed', () => {
        const grid = new Grid(new MockRandom(), 2, 2);
        grid.cells = [
            new MockCell(false, 1),
            new MockCell(false, 2),
            new MockCell(true, 1),
            new MockCell(false, 2)
        ];
        const result = grid.getSmallestEntropyCells();
        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].modules.length, 1);
    });
});
