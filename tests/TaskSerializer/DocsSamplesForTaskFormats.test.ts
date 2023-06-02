import { TASK_FORMATS, updateSettings } from '../../src/Config/Settings';
import { verifyMarkdown } from '../TestingTools/VerifyMarkdownTable';
import { withAllPriorities } from '../Query/Filter/PriorityField.test';

describe('Serializer', () => {
    function allPriorityLines() {
        const tasks = withAllPriorities().reverse();
        return tasks.map((t) => t.toFileLineString()).join('\n');
    }

    it.each(Object.keys(TASK_FORMATS))('%s - priorities', (key: string) => {
        updateSettings({ taskFormat: key as keyof TASK_FORMATS });
        verifyMarkdown(allPriorityLines());
    });
});
