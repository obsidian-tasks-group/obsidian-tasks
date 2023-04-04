import { Explanation } from '../../../src/Query/Explain/Explanation';

describe('Explain', () => {
    it('Explains single filter', () => {
        const description = 'due date is before 2022-10-28';
        const explanation = new Explanation(description);
        expect(explanation.description).toEqual(description);
        expect(explanation.symbol).toEqual('');
        expect(explanation.children).toEqual([]);
        expect(explanation.asString()).toEqual(description);
    });

    it('Explains an AND boolean combination', () => {
        const children: Explanation[] = [new Explanation('x includes A'), new Explanation('x includes B')];
        const explanation = Explanation.booleanAnd(children);
        expect(explanation.description).toEqual('All of');
        expect(explanation.symbol).toEqual('AND');
        expect(explanation.children).toEqual(children);
        const expected = `AND (All of):
  x includes A
  x includes B`;
        expect(explanation.asString()).toEqual(expected);
    });

    it('Explains an OR boolean combination', () => {
        const children: Explanation[] = [new Explanation('x includes A'), new Explanation('x includes B')];
        const explanation = Explanation.booleanOr(children);
        expect(explanation.description).toEqual('At least one of');
        expect(explanation.symbol).toEqual('OR');
        expect(explanation.children).toEqual(children);
    });

    it('Explains a NOT boolean combination', () => {
        const children: Explanation[] = [new Explanation('x includes A'), new Explanation('x includes B')];
        const explanation = Explanation.booleanNot(children);
        expect(explanation.description).toEqual('None of');
        expect(explanation.symbol).toEqual('NOT');
        expect(explanation.children).toEqual(children);
    });

    it('Explains an XOR boolean combination', () => {
        const children: Explanation[] = [new Explanation('x includes A'), new Explanation('x includes B')];
        const explanation = Explanation.booleanXor(children);
        expect(explanation.description).toEqual('Exactly one of');
        expect(explanation.symbol).toEqual('XOR');
        expect(explanation.children).toEqual(children);
    });

    it('Explains a nested boolean combination', () => {
        const not = Explanation.booleanOr([new Explanation('x1 includes A'), new Explanation('x1 includes B')]);
        const or = Explanation.booleanOr([new Explanation('x2 includes C'), new Explanation('x2 includes D')]);
        const and = Explanation.booleanAnd([not, or]);
        const expected = `AND (All of):
  OR (At least one of):
    x1 includes A
    x1 includes B
  OR (At least one of):
    x2 includes C
    x2 includes D`;
        expect(and.asString()).toEqual(expected);
    });

    it('Explains a nested non-boolean combination (Indent only depending on children)', () => {
        const firstLine = 'Things that happen when you write code:';
        const bottomLevelExplanation = new Explanation('or foobar sauce');
        const nestedExplanations = [
            new Explanation('you eat apple sauce', [bottomLevelExplanation]),
            new Explanation('you enjoy bar'),
            new Explanation('you love foo'),
        ];
        const explanation = new Explanation(firstLine, nestedExplanations);
        const expected = `Things that happen when you write code:
  you eat apple sauce
    or foobar sauce
  you enjoy bar
  you love foo`;
        expect(explanation.asString()).toEqual(expected);
    });
});
