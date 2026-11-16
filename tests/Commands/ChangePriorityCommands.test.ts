import { createSetPriorityCommands } from 'Commands/ChangePriorityCommands';
import { verifyCommandsAsMarkdownForDocs } from '../TestingTools/VerifyMarkdown';

describe('Change priority commands', () => {
    describe('reference', () => {
        it('table', () => {
            verifyCommandsAsMarkdownForDocs(createSetPriorityCommands());
        });
    });
});
