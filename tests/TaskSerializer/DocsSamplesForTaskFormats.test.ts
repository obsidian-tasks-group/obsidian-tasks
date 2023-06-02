import { TASK_FORMATS, updateSettings } from '../../src/Config/Settings';
import { verifyMarkdown, verifyMarkdownForDocs } from '../TestingTools/VerifyMarkdownTable';
import { withAllPriorities } from '../Query/Filter/PriorityField.test';

describe('Serializer', () => {
    describe('Priorities', () => {
        function allPriorityLines() {
            const tasks = withAllPriorities().reverse();
            return tasks.map((t) => t.toFileLineString()).join('\n');
        }

        it.each(Object.keys(TASK_FORMATS))('%s-snippet', (key: string) => {
            updateSettings({ taskFormat: key as keyof TASK_FORMATS });
            verifyMarkdown(allPriorityLines());
        });

        it.each(Object.keys(TASK_FORMATS))('%s-include', (key: string) => {
            updateSettings({ taskFormat: key as keyof TASK_FORMATS });
            verifyMarkdownForDocs(allPriorityLines());
        });
    });
});
