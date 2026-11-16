import {
    SetPriority,
    ShiftPriority,
    allPriorityInstructions,
    createEditingInstructionForPriorityGroups,
} from 'ui/EditInstructions/PriorityInstructions';
import { Priority } from 'Task/Priority';
import type { TaskEditingInstruction } from 'ui/EditInstructions/TaskEditingInstruction';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';

describe('SetPriority', () => {
    const lowPriorityTask = new TaskBuilder().priority(Priority.Low).build();
    const normalPriorityTask = new TaskBuilder().priority(Priority.None).build();
    const highPriorityTask = new TaskBuilder().priority(Priority.High).build();

    it('should provide information to set up a menu item for setting priority', () => {
        // Arrange
        const instruction = new SetPriority(Priority.None);

        // Assert
        expect(instruction.instructionDisplayName()).toEqual('Change Priority to: Normal');
        expect(instruction.isCheckedForTask(highPriorityTask)).toEqual(false);
        expect(instruction.isCheckedForTask(normalPriorityTask)).toEqual(true);
    });

    it('should edit priority', () => {
        // Arrange
        const instruction = new SetPriority(Priority.High);

        // Act
        const newTasks = instruction.apply(lowPriorityTask);

        // Assert
        expect(newTasks.length).toEqual(1);
        expect(newTasks[0].priority).toEqual(Priority.High);
    });

    it('should not edit task if already has chosen priority', () => {
        // Arrange
        const instruction = new SetPriority(Priority.High);

        // Act
        const newTasks = instruction.apply(highPriorityTask);

        // Assert
        expect(newTasks.length).toEqual(1);
        // Expect it is the same object
        expect(Object.is(newTasks[0], highPriorityTask)).toBe(true);
    });

    it('should use lower-case priority name for commandId()', () => {
        expect(new SetPriority(Priority.High).commandId()).toBe('set-priority-to-high');
        expect(new SetPriority(Priority.Highest).commandId()).toBe('set-priority-to-highest');
    });

    it('should use "normal" for commandId() of Priority.None command', () => {
        expect(new SetPriority(Priority.None).commandId()).toBe('set-priority-to-normal');
    });
});

describe('ShiftPriority - Increase', () => {
    const instruction = new ShiftPriority('increase');

    it('should have correct name and id', () => {
        expect(instruction.instructionDisplayName()).toEqual('Increase Priority');
        expect(instruction.commandId()).toEqual('increase-priority');
    });

    function shouldIncreasePriorityTo(originalPriority: Priority, expectedPriority: Priority): void {
        const task = new TaskBuilder().priority(originalPriority).build();
        const edited = instruction.apply(task);
        expect(edited[0].priority).toEqual(expectedPriority);
    }

    it('should increase Lowest priority to Low', () => {
        shouldIncreasePriorityTo(Priority.Lowest, Priority.Low);
    });

    it('should increase High priority to Highest', () => {
        shouldIncreasePriorityTo(Priority.High, Priority.Highest);
    });

    it('should not increase beyond Highest', () => {
        shouldIncreasePriorityTo(Priority.Highest, Priority.Highest);
    });

    it('should return the same task of priority was already highest', () => {
        const task = new TaskBuilder().priority(Priority.Highest).build();
        const edited = instruction.apply(task);
        expect(edited[0]).toBe(task);
    });
});

describe('ShiftPriority - Decrease', () => {
    const instruction = new ShiftPriority('decrease');

    it('should have correct name and id', () => {
        expect(instruction.instructionDisplayName()).toEqual('Decrease Priority');
        expect(instruction.commandId()).toEqual('decrease-priority');
    });

    function shouldDecreasePriorityTo(originalPriority: Priority, expectedPriority: Priority): void {
        const task = new TaskBuilder().priority(originalPriority).build();
        const edited = instruction.apply(task);
        expect(edited[0].priority).toEqual(expectedPriority);
    }

    it('should decrease Highest priority to High', () => {
        shouldDecreasePriorityTo(Priority.Highest, Priority.High);
    });

    it('should decrease Low priority to Lowest', () => {
        shouldDecreasePriorityTo(Priority.Low, Priority.Lowest);
    });

    it('should not decrease beyond Lowest', () => {
        shouldDecreasePriorityTo(Priority.Lowest, Priority.Lowest);
    });

    it('should return the same task of priority was already lowest', () => {
        const task = new TaskBuilder().priority(Priority.Lowest).build();
        const edited = instruction.apply(task);
        expect(edited[0]).toBe(task);
    });
});

describe('All Priority Instructions', () => {
    it('should supply all priority instructions', () => {
        // Arrange
        const allInstructions = allPriorityInstructions();

        // Assert
        expect(allInstructions.length).toBe(8);
        expect(allInstructions[0].instructionDisplayName()).toBe('Change Priority to: Highest');
        expect(allInstructions[5].instructionDisplayName()).toBe('Change Priority to: Lowest');
        expect(allInstructions[6].instructionDisplayName()).toBe('Increase Priority');
        expect(allInstructions[7].instructionDisplayName()).toBe('Decrease Priority');
    });
});

describe('Creating Editing Instruction', () => {
    it("should create an instruction that copies a task's priority", () => {
        const sampleTask = new TaskBuilder().priority(Priority.Highest).build();
        const instruction: TaskEditingInstruction = createEditingInstructionForPriorityGroups(sampleTask);

        const taskToEdit = new TaskBuilder().priority(Priority.Lowest).build();
        const newTasks = instruction.apply(taskToEdit);

        expect(newTasks).toHaveLength(1);
        expect(newTasks[0].priority).toEqual(Priority.Highest);
    });
});
