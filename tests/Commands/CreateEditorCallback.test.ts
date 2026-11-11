import { selectedLineNumbers } from 'Commands/CreateEditorCallback';

describe('selectedLineNumbers', () => {
    const at = (line: number, ch: number) => ({ line, ch });

    it('should return the cursor line for an empty selection', () => {
        expect(selectedLineNumbers([{ anchor: at(2, 3), head: at(2, 3) }])).toEqual([2]);
    });

    it('should return every line in a selection, whichever direction it was made', () => {
        expect(selectedLineNumbers([{ anchor: at(1, 2), head: at(3, 1) }])).toEqual([1, 2, 3]);
        expect(selectedLineNumbers([{ anchor: at(3, 1), head: at(1, 2) }])).toEqual([1, 2, 3]);
    });

    it('should not include a line where the selection ends at its start', () => {
        expect(selectedLineNumbers([{ anchor: at(1, 0), head: at(3, 0) }])).toEqual([1, 2]);
    });

    it('should combine multiple selections, without duplicates', () => {
        expect(
            selectedLineNumbers([
                { anchor: at(4, 0), head: at(4, 2) },
                { anchor: at(0, 1), head: at(1, 1) },
                { anchor: at(1, 3), head: at(1, 4) },
            ]),
        ).toEqual([0, 1, 4]);
    });
});
