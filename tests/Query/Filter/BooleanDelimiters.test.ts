import { BooleanDelimiters } from '../../../src/Query/Filter/BooleanDelimiters';

function shouldDelimitWithParentheses(line: string) {
    const delimiters = BooleanDelimiters.fromInstructionLine(line);

    expect(delimiters.openFilterChars).toEqual('(');
    expect(delimiters.closeFilterChars).toEqual(')');
    expect(delimiters.openAndCloseFilterChars).toEqual('()');
}

function shouldDelimitWithDoubleQuotes(line: string) {
    const delimiters = BooleanDelimiters.fromInstructionLine(line);

    expect(delimiters.openFilterChars).toEqual('"');
    expect(delimiters.closeFilterChars).toEqual('"');
    expect(delimiters.openAndCloseFilterChars).toEqual('"');
}

function shouldThrow(line: string) {
    const t = () => {
        BooleanDelimiters.fromInstructionLine(line);
    };
    expect(t).toThrow(Error);
    expect(t).toThrowError(
        "All filters in a Boolean instruction be surrounded with either '(' and ')' or '\"'. Combinations of those delimiters are no longer supported.",
    );
}

describe('BooleanDelimiters', () => {
    it('construction - all delimiters', () => {
        const delimiters = BooleanDelimiters.allSupportedDelimiters();

        expect(delimiters.openFilterChars).toEqual('("');
        expect(delimiters.openFilter).toEqual('[("]');

        expect(delimiters.closeFilterChars).toEqual(')"');
        expect(delimiters.closeFilter).toEqual('[)"]');

        expect(delimiters.openAndCloseFilterChars).toEqual('()"');
    });

    describe('construct from line with binary operators', () => {
        it('from line with () delimiters', () => {
            shouldDelimitWithParentheses('(not done) OR (done)');
        });

        it('from line with "" delimiters', () => {
            shouldDelimitWithDoubleQuotes('"not done" OR "done"');
        });

        it.failing('from line with mixed delimiters', () => {
            shouldThrow('(not done) OR "done"');
        });

        it.failing('from line with unknown delimiters', () => {
            shouldThrow('{not done} OR "done"');
        });
    });

    describe('construct from line starting with NOT', () => {
        it('from line with () delimiters', () => {
            shouldDelimitWithParentheses('NOT (not done)');
        });

        it('from line with "" delimiters', () => {
            shouldDelimitWithDoubleQuotes('NOT "not done"');
        });

        it.failing('from line with mixed delimiters', () => {
            shouldThrow('NOT (not done"');
        });

        it('from line with unknown delimiters', () => {
            shouldThrow('NOT {not done}');
        });
    });
});
