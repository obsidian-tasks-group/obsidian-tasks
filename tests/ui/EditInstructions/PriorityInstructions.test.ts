import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { Priority } from '../../../src/Task';
import { SetPriority } from '../../../src/ui/EditInstructions/PriorityInstructions';

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
