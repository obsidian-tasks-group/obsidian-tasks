import { type Editor } from 'obsidian';
import { createSetStatusCommands } from 'Commands/ChangeStatusCommands';
import { Status } from 'Statuses/Status';
import { StatusRegistry } from 'Statuses/StatusRegistry';
import { StatusConfiguration, StatusType } from 'Statuses/StatusConfiguration';
import { noticeMessages } from '../__mocks__/obsidian';
import { verifyCommandsAsMarkdownForDocs } from '../TestingTools/VerifyMarkdown';
import { makeFakeEditor, makeFakeMarkdownView } from './CreateEditorCallbackHelpers';

describe('Change status commands', () => {
    let registry: StatusRegistry;
    beforeEach(() => {
        registry = new StatusRegistry();
        registry.clearStatuses();
    });

    it('should generate expected id and name', () => {
        registry.add(Status.TODO);
        registry.add(Status.IN_PROGRESS);

        const commands = createSetStatusCommands(registry);

        expect(commands.length).toBe(2);

        expect(commands[0].id).toBe('set-status-symbol-to-space');
        expect(commands[0].name).toBe('Change status to: [ ] Todo');

        expect(commands[1].id).toBe('set-status-symbol-to-/');
        expect(commands[1].name).toBe('Change status to: [/] In Progress');
    });

    it('should only create commands for the first of any statuses with duplicate symbols', () => {
        registry.add(new StatusConfiguration('A', 'Status 1', ' ', true, StatusType.TODO));
        registry.add(new StatusConfiguration('A', 'Status 2 - I should be ignored', ' ', true, StatusType.TODO));

        const commands = createSetStatusCommands(registry);
        expect(commands.length).toBe(1);
        expect(commands[0].name).toBe('Change status to: [A] Status 1');
    });

    it('should not create commands for Empty statuses', () => {
        // Users can create a new status, and then not populate it.
        // These are 'empty' statuses; the status symbol is an empty string.
        registry.add(Status.EMPTY);

        const commands = createSetStatusCommands(registry);
        expect(commands.length).toBe(0);
    });

    it('should notify the user with a status-specific message when the line is not a task', () => {
        registry.add(Status.TODO);
        const command = createSetStatusCommands(registry)[0];

        const { editor } = makeFakeEditor(['This is not a task'], 0, 0);
        const view = makeFakeMarkdownView();

        command.editorCheckCallback!(false, editor as unknown as Editor, view);

        expect(noticeMessages).toEqual(['Cannot set status: line is not a task or does not match global filter']);
    });

    describe('reference', () => {
        it('table', () => {
            registry.resetToDefaultStatuses();
            verifyCommandsAsMarkdownForDocs(createSetStatusCommands(registry));
        });
    });
});
