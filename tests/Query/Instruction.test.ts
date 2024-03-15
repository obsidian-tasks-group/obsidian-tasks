import { Instruction } from '../../src/Query/Instruction';

describe('Instruction', () => {
    it('should store the instruction', () => {
        const instruction = new Instruction('hello world');
        expect(instruction.instruction).toEqual('hello world');
    });
});
