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
            const line = '(not done) OR (done)';
            shouldDelimitWithParentheses(line);
        });

        it('from line with "" delimiters', () => {
            const line = '"not done" OR "done"';
            shouldDelimitWithDoubleQuotes(line);
        });

        it.failing('from line with mixed delimiters', () => {
            const line = '(not done) OR "done"';
            const t = () => {
                BooleanDelimiters.fromInstructionLine(line);
            };
            expect(t).toThrow(Error);
            expect(t).toThrowError(
                "All filters in a Boolean instruction be surrounded with either '(' and ')' or '\"'. Combinations of those delimiters are no longer supported.",
            );
        });

        it.failing('from line with unknown delimiters', () => {
            const line = '{not done} OR "done"';
            const t = () => {
                BooleanDelimiters.fromInstructionLine(line);
            };
            expect(t).toThrow(Error);
            expect(t).toThrowError(
                "All filters in a Boolean instruction be surrounded with either '(' and ')' or '\"'. Combinations of those delimiters are no longer supported.",
            );
        });
    });

    describe('construct from line starting with NOT', () => {
        it('from line with () delimiters', () => {
            const line = 'NOT (not done)';
            shouldDelimitWithParentheses(line);
        });

        it('from line with "" delimiters', () => {
            const line = 'NOT "not done"';
            shouldDelimitWithDoubleQuotes(line);
        });

        it.failing('from line with mixed delimiters', () => {
            const line = 'NOT (not done"';
            const t = () => {
                BooleanDelimiters.fromInstructionLine(line);
            };
            expect(t).toThrow(Error);
            expect(t).toThrowError(
                "All filters in a Boolean instruction be surrounded with either '(' and ')' or '\"'. Combinations of those delimiters are no longer supported.",
            );
        });

        it('from line with unknown delimiters', () => {
            const line = 'NOT {not done}';
            const t = () => {
                BooleanDelimiters.fromInstructionLine(line);
            };
            expect(t).toThrow(Error);
            expect(t).toThrowError(
                "All filters in a Boolean instruction be surrounded with either '(' and ')' or '\"'. Combinations of those delimiters are no longer supported.",
            );
        });
    });
});
