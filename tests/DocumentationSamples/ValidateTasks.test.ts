import { DEFAULT_SYMBOLS } from '../../src/TaskSerializer/DefaultTaskSerializer';
import { verifyWithFileExtension } from '../TestingTools/ApprovalTestHelpers';
import { Task } from '../../src/Task/Task';

describe('validate-tasks', () => {
    it('find-unread-emojis', () => {
        const allEmojis: string[] = [];

        // All the priority emojis:
        Object.values(DEFAULT_SYMBOLS.prioritySymbols).forEach((value) => {
            if (value.length > 0) {
                allEmojis.push(value);
            }
        });

        // All the other field emojis:
        Object.values(DEFAULT_SYMBOLS).forEach((value) => {
            if (typeof value === 'string') {
                allEmojis.push(value);
            }
        });

        const descriptionInstructions = allEmojis.map((emoji) => `(description includes ${emoji})`);
        const output = `
\`\`\`\`text
\`\`\`tasks
# These description instructions need to be all on one line:
${descriptionInstructions.join(' OR ')}

# Optionally, uncomment this line and exclude your templates location
# path does not include _templates

group by path
\`\`\`
\`\`\`\`
`;
        verifyWithFileExtension(output, 'text');
    });

    it('find problem dates', () => {
        const dateFields = Task.allDateFields();
        const instructions = dateFields.sort().map((field) => `(${field.replace('Date', ' date')} is invalid)`);
        const output = `
\`\`\`\`text
\`\`\`tasks
${instructions.join(' OR ')}

# Optionally, uncomment this line and exclude your templates location
# path does not include _templates

group by path
\`\`\`
\`\`\`\`
`;
        verifyWithFileExtension(output, 'text');
    });
});
