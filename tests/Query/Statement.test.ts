import { Statement } from '../../src/Query/Statement';

describe('Statement', () => {
    it('should store the instruction', () => {
        const raw = `hello \\
world`;
        const final = 'hello world';
        const instruction = new Statement(raw, final);
        expect(instruction.rawInstruction).toEqual(raw);
        expect(instruction.anyContinuationLinesRemoved).toEqual('hello world');
        expect(instruction.anyPlaceholdersExpanded).toEqual('hello world');
    });

    describe('explaining statements', () => {
        it('should explain simplest statement', () => {
            const instruction = 'hello world';
            const statement = new Statement(instruction, instruction);
            expect(statement.explainStatement('')).toEqual(instruction);
            expect(statement.explainStatement('  ')).toEqual('  hello world');
        });

        it('should explain statement with extra white space', () => {
            const instruction = '   hello world   ';
            const statement = new Statement(instruction, instruction);
            expect(statement.explainStatement('')).toEqual('hello world');
            expect(statement.explainStatement('  ')).toEqual('  hello world');
        });

        it('should show unexpanded and expanded placeholders, if they differ', () => {
            const instruction = '{{fake placeholder}}';
            const statement = new Statement(instruction, instruction);
            statement.recordExpandedPlaceholders('expanded placeholder');
            expect(statement.explainStatement('  ')).toEqual(`  {{fake placeholder}} =>
  expanded placeholder`);
        });
    });
});
