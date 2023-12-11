import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { Priority } from '../../../src/Task';
import { SetPriority } from '../../../src/ui/EditInstructions/PriorityInstructions';

describe('SetPriority', () => {
    it('should edit priority', () => {
        // Arrange
        const lowPriorityTask = new TaskBuilder().priority(Priority.Low).build();
        const instruction = new SetPriority(Priority.High);

        // Act
        const newTasks = instruction.apply(lowPriorityTask);

        // Assert
        expect(newTasks.length).toEqual(1);
        expect(newTasks[0].priority).toEqual(Priority.High);
    });
});
