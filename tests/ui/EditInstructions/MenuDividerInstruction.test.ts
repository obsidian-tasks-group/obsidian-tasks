import { MenuDividerInstruction } from '../../../src/ui/EditInstructions/MenuDividerInstruction';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';

describe('MenuDividerInstruction', () => {
    it('should create an instruction to add a divider to a menu', () => {
        const instruction = new MenuDividerInstruction();
        const task = new TaskBuilder().build();

        expect(instruction.instructionDisplayName()).toBe('---');
        expect(instruction.isCheckedForTask(task)).toEqual(false);

        const t = () => {
            instruction.apply(task);
        };
        expect(t).toThrow(Error);
        expect(t).toThrowError('MenuDividerInstruction.apply(): Method not implemented.');
    });
});
