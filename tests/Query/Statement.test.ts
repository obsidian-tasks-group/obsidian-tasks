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
});
