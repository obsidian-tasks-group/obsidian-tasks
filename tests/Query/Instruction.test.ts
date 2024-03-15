import { Instruction } from '../../src/Query/Instruction';

describe('Instruction', () => {
    it('should store the instruction', () => {
        const raw = `hello \\
world`;
        const final = 'hello world';
        const instruction = new Instruction(raw, final);
        expect(instruction.rawInstruction).toEqual(raw);
        expect(instruction.instruction).toEqual('hello world');
    });
});
