/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { verify } from 'approvals/lib/Providers/Jest/JestApprovals';
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

describe('docs', () => {
    const allViewInstructionsSupportingEditing = `
view columns by priority

view columns by cancelled
view columns by created
view columns by done
view columns by due
view columns by scheduled
view columns by starts
`;

    it('all view groups that support editing', () => {
        verify(allViewInstructionsSupportingEditing.trim());
    });
});
