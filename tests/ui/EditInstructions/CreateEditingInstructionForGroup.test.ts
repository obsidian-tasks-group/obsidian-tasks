/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { Priority } from '../../../src/Task/Priority';
import { createEditingInstructionForGroup } from '../../../src/ui/EditInstructions/CreateEditingInstructionForGroup';

window.moment = moment;

describe('CreateEditingInstructionForGroup', () => {
    it('should create an instruction for priority', () => {
        const task = new TaskBuilder().priority(Priority.Medium).build();
        const instruction = createEditingInstructionForGroup('priority', task);

        expect(instruction).not.toBeNull();
        expect(instruction?.instructionDisplayName()).toBe('Priority: Medium');
    });

    it('should create an instruction for due date', () => {
        const task = new TaskBuilder().dueDate('2025-03-14').build();
        const instruction = createEditingInstructionForGroup('due', task);

        expect(instruction).not.toBeNull();
        expect(instruction?.instructionDisplayName()).toBe('Set Date: Fri Mar 14 2025');
    });
});
