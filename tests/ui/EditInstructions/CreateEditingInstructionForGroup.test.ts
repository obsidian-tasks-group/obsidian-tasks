/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { verify } from 'approvals/lib/Providers/Jest/JestApprovals';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { Priority } from '../../../src/Task/Priority';
import {
    allViewInstructionsSupportingEditing,
    createEditingInstructionForGroup,
} from '../../../src/ui/EditInstructions/CreateEditingInstructionForGroup';
import { Query } from '../../../src/Query/Query';

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
    const allInstructions = allViewInstructionsSupportingEditing()
        .split('\n')
        .filter((line) => line.length > 0);
    const taskWithAllFields = TaskBuilder.createFullyPopulatedTask();

    it('all view groups that support editing', () => {
        verify(allViewInstructionsSupportingEditing().trim());
    });

    it.each(allInstructions)('can parse instruction: "%s"', (viewInstruction: string) => {
        const query = new Query(viewInstruction);
        expect(query.error).toBeUndefined();
    });

    it.each(allInstructions)('can create editing instruction: "%s"', (viewInstruction: string) => {
        const query = new Query(viewInstruction);

        const grouper = query.viewLayoutOptions.grouper;
        expect(grouper).not.toBeNull();
        expect(grouper?.property).toBeDefined();

        const instruction = createEditingInstructionForGroup(grouper!.property, taskWithAllFields);
        expect(instruction).not.toBeNull();
    });
});
