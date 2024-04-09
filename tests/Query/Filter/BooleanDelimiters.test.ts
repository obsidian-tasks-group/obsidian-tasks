import { BooleanDelimiters } from '../../../src/Query/Filter/BooleanDelimiters';

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
            const delimiters = BooleanDelimiters.fromInstructionLine('(not done) OR (done)');

            expect(delimiters.openFilterChars).toEqual('(');
            expect(delimiters.closeFilterChars).toEqual(')');
            expect(delimiters.openAndCloseFilterChars).toEqual('()');
        });

        it('from line with "" delimiters', () => {
            const delimiters = BooleanDelimiters.fromInstructionLine('"not done" OR "done"');

            expect(delimiters.openFilterChars).toEqual('"');
            expect(delimiters.closeFilterChars).toEqual('"');
            expect(delimiters.openAndCloseFilterChars).toEqual('"');
        });

        it.failing('from line with mixed delimiters', () => {
            const t = () => {
                BooleanDelimiters.fromInstructionLine('(not done) OR "done"');
            };
            expect(t).toThrow(Error);
            expect(t).toThrowError(
                "All filters in a Boolean instruction be surrounded with either '(' and ')' or '\"'. Combinations of those delimiters are no longer supported.",
            );
        });

        it.failing('from line with unknown delimiters', () => {
            const t = () => {
                BooleanDelimiters.fromInstructionLine('{not done} OR "done"');
            };
            expect(t).toThrow(Error);
            expect(t).toThrowError(
                "All filters in a Boolean instruction be surrounded with either '(' and ')' or '\"'. Combinations of those delimiters are no longer supported.",
            );
        });
    });

    describe('construct from line starting with NOT', () => {
        it('from line with () delimiters', () => {
            const delimiters = BooleanDelimiters.fromInstructionLine('NOT (not done)');

            expect(delimiters.openFilterChars).toEqual('(');
            expect(delimiters.closeFilterChars).toEqual(')');
            expect(delimiters.openAndCloseFilterChars).toEqual('()');
        });

        it('from line with "" delimiters', () => {
            const delimiters = BooleanDelimiters.fromInstructionLine('NOT "not done"');

            expect(delimiters.openFilterChars).toEqual('"');
            expect(delimiters.closeFilterChars).toEqual('"');
            expect(delimiters.openAndCloseFilterChars).toEqual('"');
        });

        it.failing('from line with mixed delimiters', () => {
            const t = () => {
                BooleanDelimiters.fromInstructionLine('NOT (not done"');
            };
            expect(t).toThrow(Error);
            expect(t).toThrowError(
                "All filters in a Boolean instruction be surrounded with either '(' and ')' or '\"'. Combinations of those delimiters are no longer supported.",
            );
        });

        it('from line with unknown delimiters', () => {
            const t = () => {
                BooleanDelimiters.fromInstructionLine('NOT {not done}');
            };
            expect(t).toThrow(Error);
            expect(t).toThrowError(
                "All filters in a Boolean instruction be surrounded with either '(' and ')' or '\"'. Combinations of those delimiters are no longer supported.",
            );
        });
    });
});
