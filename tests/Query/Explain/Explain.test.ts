import { Explanation } from '../../../src/Query/Explain/Explanation';

describe('Explain', () => {
    it('Explains single filter', () => {
        const description = 'due date is before 2022-10-28';
        const explanation = new Explanation(description);
        expect(explanation.description).toEqual(description);
    });

    it('Explains an AND boolean combination - All Of', () => {
        const children: Explanation[] = [new Explanation('x includes A'), new Explanation('x includes B')];
        const explanation = Explanation.allOf(children);
        expect(explanation.description).toEqual('All Of');
        expect(explanation.children).toEqual(children);
    });

    it('Explains an OR boolean combination - At least one of', () => {
        const children: Explanation[] = [new Explanation('x includes A'), new Explanation('x includes B')];
        const explanation = Explanation.booleanOr(children);
        expect(explanation.description).toEqual('At least one of');
        expect(explanation.children).toEqual(children);
    });
});
