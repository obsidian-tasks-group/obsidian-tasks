import { TASK_FORMATS, updateSettings } from '../../src/Config/Settings';
import { verifyMarkdown } from '../TestingTools/VerifyMarkdownTable';
import { withAllPriorities } from '../Query/Filter/PriorityField.test';

describe('Serializer', () => {
    it.each(Object.keys(TASK_FORMATS))('%s - priorities', (key: string) => {
        // Arrange
        updateSettings({ taskFormat: key as keyof TASK_FORMATS });

        const tasks = withAllPriorities().reverse();
        const taskLines = tasks.map((t) => t.toFileLineString()).join('\n');

        // Assert
        verifyMarkdown(taskLines);
    });
});
