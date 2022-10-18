import { Explanation } from '../../../src/Query/Explain/Explanation';

describe('Explain', () => {
    it('Explains single filter', () => {
        const description = 'due date is before 2022-10-28';
        const explanation = new Explanation(description);
        expect(explanation.description).toEqual(description);
        expect(explanation.children).toEqual([]);
        expect(explanation.asString()).toEqual(description);
    });

    it('Explains an AND boolean combination', () => {
        const children: Explanation[] = [new Explanation('x includes A'), new Explanation('x includes B')];
        const explanation = Explanation.booleanAnd(children);
        expect(explanation.description).toEqual('All of');
        expect(explanation.children).toEqual(children);
        const expected = `All of:
  x includes A
  x includes B
`;
        expect(explanation.asString()).toEqual(expected);
    });

    it('Explains an OR boolean combination', () => {
        const children: Explanation[] = [new Explanation('x includes A'), new Explanation('x includes B')];
        const explanation = Explanation.booleanOr(children);
        expect(explanation.description).toEqual('At least one of');
        expect(explanation.children).toEqual(children);
    });

    it('Explains a NOT boolean combination', () => {
        const children: Explanation[] = [new Explanation('x includes A'), new Explanation('x includes B')];
        const explanation = Explanation.booleanNot(children);
        expect(explanation.description).toEqual('None of');
        expect(explanation.children).toEqual(children);
    });

    it('Explains a nested boolean combination', () => {
        const not = Explanation.booleanOr([new Explanation('x1 includes A'), new Explanation('x1 includes B')]);
        const or = Explanation.booleanOr([new Explanation('x2 includes C'), new Explanation('x2 includes D')]);
        const and = Explanation.booleanAnd([not, or]);
        const expected = `All of:
  At least one of:
    x1 includes A
    x1 includes B

  At least one of:
    x2 includes C
    x2 includes D

`;
        expect(and.asString()).toEqual(expected);
    });
});
