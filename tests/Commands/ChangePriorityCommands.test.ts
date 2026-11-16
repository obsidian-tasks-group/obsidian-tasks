import { createSetPriorityCommands } from 'Commands/ChangePriorityCommands';
import type { Editor } from 'obsidian';
import { verifyCommandsAsMarkdownForDocs } from '../TestingTools/VerifyMarkdown';
import { noticeMessages } from '../__mocks__/obsidian';
import { makeFakeEditor, makeFakeMarkdownView } from './CreateEditorCallbackHelpers';

describe('Change priority commands', () => {
    it('should notify the user with a priority-specific message when the line is not a task', () => {
        const command = createSetPriorityCommands()[0];

        const { editor } = makeFakeEditor(['This is not a task'], 0, 0);
        const view = makeFakeMarkdownView();

        command.editorCheckCallback!(false, editor as unknown as Editor, view);

        expect(noticeMessages).toEqual(['Cannot set priority: line is not a task or does not match global filter']);
    });

    describe('reference', () => {
        it('table', () => {
            verifyCommandsAsMarkdownForDocs(createSetPriorityCommands());
        });
    });
});
