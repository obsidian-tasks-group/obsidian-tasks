import { TASK_FORMATS, updateSettings } from '../../src/Config/Settings';
import { verifyMarkdown } from '../TestingTools/VerifyMarkdownTable';
import { Priority, Task } from '../../src/Task';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { PriorityField } from '../../src/Query/Filter/PriorityField';

describe('Serializer', () => {
    it.each(Object.keys(TASK_FORMATS))('%s - priorities', (key: string) => {
        // Arrange
        updateSettings({ taskFormat: key as keyof TASK_FORMATS });

        const tasks: Task[] = [];
        const allPriorities = Object.values(Priority).reverse();
        allPriorities.forEach((priority) => {
            const priorityName = PriorityField.priorityNameUsingNormal(priority);
            const description = `#task ${priorityName} priority`;
            const task = new TaskBuilder().priority(priority).description(description).build();
            tasks.push(task);
        });
        const taskLines = tasks.map((t) => t.toFileLineString()).join('\n');

        // Assert
        verifyMarkdown(taskLines);
    });
});
