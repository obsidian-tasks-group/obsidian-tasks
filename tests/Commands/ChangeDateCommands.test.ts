import moment from 'moment';
import type { Command, Editor } from 'obsidian';
import { createChangeDateCommands, createChangeDateCommandsForField } from 'Commands/ChangeDateCommands';
import { ALL_DATE_FIELDS } from 'DateTime/DateFieldTypes';
import { verifyCommandsAsMarkdownForDocs } from '../TestingTools/VerifyMarkdown';
import { makeFakeEditor, makeFakeMarkdownView } from './CreateEditorCallbackHelpers';

window.moment = moment;

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-10-01'));
});

afterEach(() => {
    vi.useRealTimers();
});

function findCommand(commands: Command[], id: string) {
    const command = commands.find((c) => c.id === id);
    if (!command) {
        throw new Error(`Command not found: ${id}`);
    }
    return command;
}

function runCommand(commands: Command[], id: string, lines: string[]) {
    const { editor, getText } = makeFakeEditor(lines, 0, lines.length - 1);
    findCommand(commands, id).editorCheckCallback!(false, editor as unknown as Editor, makeFakeMarkdownView());
    return getText().split('\n');
}

describe('Change date commands', () => {
    it('should move each selected task by the same amount, skipping tasks without the date', () => {
        const lines = ['- [ ] task 1 ⏳ 2023-05-05', '- [ ] task 2', '- [ ] task 3 ⏳ 2025-01-31'];
        expect(runCommand(createChangeDateCommands(), 'move-scheduled-date-by-plus-1-week', lines)).toEqual([
            '- [ ] task 1 ⏳ 2023-05-12',
            '- [ ] task 2',
            '- [ ] task 3 ⏳ 2025-02-07',
        ]);
    });

    it('should remove the date from every selected task', () => {
        const lines = ['- [ ] task 1 ➕ 2023-05-05', '- [ ] task 2'];
        expect(runCommand(createChangeDateCommands(), 'remove-created-date', lines)).toEqual([
            '- [ ] task 1',
            '- [ ] task 2',
        ]);
    });

    describe('reference', () => {
        it.each(ALL_DATE_FIELDS)('table for %s', (field) => {
            verifyCommandsAsMarkdownForDocs(createChangeDateCommandsForField(field));
        });
    });
});
