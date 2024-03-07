import { allTaskPluginEmojis } from '../../src/TaskSerializer/DefaultTaskSerializer';
import { verifyWithFileExtension } from '../TestingTools/ApprovalTestHelpers';
import { Task } from '../../src/Task/Task';

function createTasksValidationCodeBlock(filters: string[]) {
    return `
\`\`\`\`text
\`\`\`tasks
# These instructions need to be all on one line:
${filters.join(' OR ')}

# Optionally, uncomment this line and exclude your templates location
# path does not include _templates

group by path
\`\`\`
\`\`\`\`
`;
}

describe('validate-tasks', () => {
    it('find-unread-emojis', () => {
        const allEmojis = allTaskPluginEmojis();

        const descriptionInstructions = allEmojis.map((emoji) => `(description includes ${emoji})`);
        const output = createTasksValidationCodeBlock(descriptionInstructions);
        verifyWithFileExtension(output, 'text');
    });

    it('find problem dates', () => {
        const dateFields = Task.allDateFields();
        const instructions = dateFields.sort().map((field) => `(${field.replace('Date', ' date')} is invalid)`);
        const output = createTasksValidationCodeBlock(instructions);
        verifyWithFileExtension(output, 'text');
    });
});
