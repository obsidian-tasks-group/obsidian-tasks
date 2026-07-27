import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import {
    SetPriority,
    allPriorityInstructions,
    createEditingInstructionForPriorityGroups,
} from '../../../src/ui/EditInstructions/PriorityInstructions';
import { Priority } from '../../../src/Task/Priority';
import type { TaskEditingInstruction } from '../../../src/ui/EditInstructions/TaskEditingInstruction';

describe('SetPriority', () => {
    const lowPriorityTask = new TaskBuilder().priority(Priority.Low).build();
    const normalPriorityTask = new TaskBuilder().priority(Priority.None).build();
    const highPriorityTask = new TaskBuilder().priority(Priority.High).build();

    it('should provide information to set up a menu item for setting priority', () => {
        // Arrange
        const instruction = new SetPriority(Priority.None);

        // Assert
        expect(instruction.instructionDisplayName()).toEqual('Priority: Normal');
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
});

describe('All Priority Instructions', () => {
    it('should supply all priority instructions', () => {
        // Arrange
        const allInstructions = allPriorityInstructions();

        // Assert
        expect(allInstructions.length).toBe(6);
        expect(allInstructions[0].newPriority).toBe(Priority.Highest);
        expect(allInstructions[5].newPriority).toBe(Priority.Lowest);
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
