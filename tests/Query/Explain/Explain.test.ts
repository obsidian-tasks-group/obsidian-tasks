import { Explanation } from '../../../src/Query/Explain/Explanation';

describe('Explain', () => {
    it('Explains single filter', () => {
        const description = 'due date is before 2022-10-28';
        const explanation = new Explanation(description);
        expect(explanation.description).toEqual(description);
    });

    it('Explains a boolean combination', () => {
        // const instruction = '(description includes A) OR (description includes B)';
        const description = 'All Of';
        const children: Explanation[] = [
            new Explanation('description includes A'),
            new Explanation('description includes B'),
        ];
        const explanation = new Explanation(description, children);
        expect(explanation.description).toEqual(description);
        expect(explanation.children).toEqual(children);
    });
});
