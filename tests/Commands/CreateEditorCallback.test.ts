import { type Editor, type MarkdownFileInfo, MarkdownView } from 'obsidian';

import {
    applyInstructionToLine,
    createApplyInstructionEditorCallback,
    selectedLineNumbers,
} from 'Commands/CreateEditorCallback';
import { SetStatus } from 'ui/EditInstructions/StatusInstructions';
import { Status } from 'Statuses/Status';
import { resetSettings, updateSettings } from 'Config/Settings';
import { GlobalFilter } from 'Config/GlobalFilter';
import moment from 'moment/moment';
import { Task } from 'Task/Task';
import { BaseTaskEditingInstruction } from 'ui/EditInstructions/BaseTaskEditingInstruction';
import { noticeMessages } from '../__mocks__/obsidian';
import { makeFakeEditor, makeFakeMarkdownView } from './CreateEditorCallbackHelpers';

window.moment = moment;

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-27'));
});

afterEach(() => {
    vi.useRealTimers();
    resetSettings();
    GlobalFilter.getInstance().reset();
});

class CapitaliseDescriptionEditingInstruction extends BaseTaskEditingInstruction {
    public apply(task: Task): Task[] {
        return [
            new Task({
                ...task,
                description: task.description.toUpperCase(),
            }),
        ];
    }

    public instructionDisplayName(): string {
        return 'capitalise description';
    }

    public isCheckedForTask(_task: Task): boolean {
        return false;
    }
}

describe('selectedLineNumbers', () => {
    const at = (line: number, ch: number) => ({ line, ch });

    it('should return the cursor line for an empty selection', () => {
        expect(selectedLineNumbers([{ anchor: at(2, 3), head: at(2, 3) }])).toEqual([2]);
    });

    it('should return every line in a selection, whichever direction it was made', () => {
        expect(selectedLineNumbers([{ anchor: at(1, 2), head: at(3, 1) }])).toEqual([1, 2, 3]);
        expect(selectedLineNumbers([{ anchor: at(3, 1), head: at(1, 2) }])).toEqual([1, 2, 3]);
    });

    it('should not include a line where the selection ends at its start', () => {
        expect(selectedLineNumbers([{ anchor: at(1, 0), head: at(3, 0) }])).toEqual([1, 2]);
    });

    it('should combine multiple selections, without duplicates', () => {
        expect(
            selectedLineNumbers([
                { anchor: at(4, 0), head: at(4, 2) },
                { anchor: at(0, 1), head: at(1, 1) },
                { anchor: at(1, 3), head: at(1, 4) },
            ]),
        ).toEqual([0, 1, 4]);
    });
});

describe('with a TaskEditingInstruction that is not SetStatus', () => {
    const instruction = new CapitaliseDescriptionEditingInstruction();

    describe('applyInstructionToLine', () => {
        it('should apply the instruction to a task line', () => {
            const result = applyInstructionToLine('- [ ] A simple task 📅 2022-09-04', 'file.md', instruction);

            expect(result).toEqual({ text: '- [ ] A SIMPLE TASK 📅 2022-09-04', moveTo: { line: 0 } });
        });

        it('should refuse to act on a non-task line', () => {
            expect(applyInstructionToLine('This is not a task', 'file.md', instruction)).toBeUndefined();
        });
    });

    describe('createApplyInstructionEditorCallback', () => {
        function runCommand(lines: string[], fromLine: number, toLine: number) {
            const { editor, getText } = makeFakeEditor(lines, fromLine, toLine);
            createApplyInstructionEditorCallback(instruction, 'Cannot capitalise: not a task')(
                false,
                editor as unknown as Editor,
                makeFakeMarkdownView(),
            );
            return getText();
        }

        it('should apply the instruction to the task on a single line', () => {
            const text = runCommand(['- [ ] task 1', '- [ ] task 2'], 1, 1);

            expect(text).toEqual(['- [ ] task 1', '- [ ] TASK 2'].join('\n'));
            expect(noticeMessages).toEqual([]);
        });

        it('should apply the instruction to every task in a multi-line selection', () => {
            const text = runCommand(['- [ ] task 1', 'Not a task', '- [x] task 2 ✅ 2026-01-01'], 0, 2);

            expect(text).toEqual(['- [ ] TASK 1', 'Not a task', '- [x] TASK 2 ✅ 2026-01-01'].join('\n'));
            expect(noticeMessages).toEqual([]);
        });

        it('should show the supplied message when the line is not a task', () => {
            const text = runCommand(['Not a task'], 0, 0);

            expect(text).toEqual('Not a task');
            expect(noticeMessages).toEqual(['Cannot capitalise: not a task']);
        });
    });
});

// These tests mostly use the 'Change status to' commands, simply because:
// 1. multi-line editing was first implemented for that command
// 2. it's a non-trivial test case, as recurring tasks can change the number of lines.

describe('applyInstructionToLine', () => {
    it('should refuse to act on a non-task line', () => {
        const result = applyInstructionToLine('This is not a task', 'file.md', new SetStatus(Status.DONE));
        expect(result).toBeUndefined();
    });

    it('should refuse to act on an empty line', () => {
        const result = applyInstructionToLine('', 'file.md', new SetStatus(Status.DONE));
        expect(result).toBeUndefined();
    });

    it('should return an EditorInsertion for a valid task line', () => {
        const result = applyInstructionToLine('- [ ] A simple task', 'file.md', new SetStatus(Status.DONE));
        expect(result).toBeDefined();
        expect(result).toHaveProperty('text');
        expect(result).toHaveProperty('moveTo');
    });

    it('should set moveTo.line to 0 for a single-line result', () => {
        const result = applyInstructionToLine('- [ ] A simple task', 'file.md', new SetStatus(Status.DONE));
        expect(result).toBeDefined();
        expect(result!.moveTo).toEqual({ line: 0 });
    });

    it('should return multiple lines with moveTo.line as last line index for a recurring task', () => {
        const result = applyInstructionToLine(
            '- [ ] A recurring task 🔁 every day 📅 2022-09-04',
            'file.md',
            new SetStatus(Status.DONE),
        );
        expect(result).toBeDefined();
        const lines = result!.text.split('\n');
        expect(lines.length).toBeGreaterThan(1);
        expect(result!.moveTo).toEqual({ line: lines.length - 1 });
    });

    it('should put the next recurrence before the completed task by default', () => {
        const result = applyInstructionToLine(
            '- [ ] A recurring task 🔁 every day 📅 2022-09-04',
            'file.md',
            new SetStatus(Status.DONE),
        );
        expect(result?.text).toEqual(
            [
                '- [ ] A recurring task 🔁 every day 📅 2022-09-05',
                '- [x] A recurring task 🔁 every day 📅 2022-09-04 ✅ 2026-02-27',
            ].join('\n'),
        );
    });

    it('should honour user settings for recurrence order', () => {
        updateSettings({ recurrenceOnNextLine: true });

        const result = applyInstructionToLine(
            '- [ ] A recurring task 🔁 every day 📅 2022-09-04',
            'file.md',
            new SetStatus(Status.DONE),
        );
        expect(result).toBeDefined();
        expect(result?.text).toEqual(
            [
                '- [x] A recurring task 🔁 every day 📅 2022-09-04 ✅ 2026-02-27',
                '- [ ] A recurring task 🔁 every day 📅 2022-09-05',
            ].join('\n'),
        );
    });

    it('should refuse to act on a task line that does not match the global filter', () => {
        GlobalFilter.getInstance().set('#task');

        expect(applyInstructionToLine('- [ ] A simple task', 'file.md', new SetStatus(Status.DONE))).toBeUndefined();
    });

    it('should act on a task line that matches the global filter', () => {
        GlobalFilter.getInstance().set('#task');

        const result = applyInstructionToLine('- [ ] A simple task #task', 'file.md', new SetStatus(Status.DONE));
        expect(result?.text).toEqual('- [x] A simple task #task ✅ 2026-02-27');
    });

    it('should not add a done date when setting a status that is not done', () => {
        const result = applyInstructionToLine('- [ ] A simple task', 'file.md', new SetStatus(Status.IN_PROGRESS));

        expect(result?.text).toEqual('- [/] A simple task');
    });

    it('should add a cancelled date when cancelling a task', () => {
        const result = applyInstructionToLine('- [ ] A simple task', 'file.md', new SetStatus(Status.CANCELLED));

        expect(result?.text).toEqual('- [-] A simple task ❌ 2026-02-27');
    });

    it('should leave a done task unchanged when setting it to done again', () => {
        const result = applyInstructionToLine(
            '- [x] A simple task ✅ 2026-01-01',
            'file.md',
            new SetStatus(Status.DONE),
        );

        expect(result?.text).toEqual('- [x] A simple task ✅ 2026-01-01');
    });
});

describe('createApplyInstructionEditorCallback', () => {
    const view = makeFakeMarkdownView();

    function runCommand(lines: string[], fromLine: number, toLine: number, headCh?: number) {
        const { editor, getText } = makeFakeEditor(lines, fromLine, toLine, headCh);
        createApplyInstructionEditorCallback(new SetStatus(Status.DONE), 'placeholder Not A Task message')(
            false,
            editor as unknown as Editor,
            view,
        );
        return { text: getText(), transaction: editor.transaction, setCursor: editor.setCursor };
    }

    it('should change the status of a task line', () => {
        const { text } = runCommand(['- [ ] A simple task'], 0, 0);

        expect(text).toEqual('- [x] A simple task ✅ 2026-02-27');
    });

    it('should mark a task as done', () => {
        const { text } = runCommand(['- [ ] A simple task'], 0, 0);

        expect(text).toContain('- [x] A simple task');
    });

    it('should do nothing when the line is not a task', () => {
        const { text } = runCommand(['This is not a task'], 0, 0);

        expect(text).toEqual('This is not a task');
    });

    it('should notify the user when the line is not a task', () => {
        runCommand(['This is not a task'], 0, 0);

        expect(noticeMessages).toEqual(['placeholder Not A Task message']);
    });

    it('should not notify the user when changing a valid task', () => {
        runCommand(['- [ ] A simple task'], 0, 0);

        expect(noticeMessages).toEqual([]);
    });

    it('should keep the cursor on the same line after changing a single-line task', () => {
        const { setCursor } = runCommand(['- [ ] task 1', '- [ ] task 2'], 1, 1);

        expect(setCursor).toHaveBeenCalledTimes(1);
        expect(setCursor).toHaveBeenCalledWith({ line: 1, ch: 0 });
    });

    it('should move the cursor to the last line when completing a recurring task adds a line', () => {
        const { setCursor } = runCommand(['- [ ] A recurring task 🔁 every day 📅 2022-09-04'], 0, 0);

        expect(setCursor).toHaveBeenCalledTimes(1);
        expect(setCursor).toHaveBeenCalledWith({ line: 1, ch: 0 });
    });

    describe('when checking whether the command is available', () => {
        function checkCommand(checkedView: MarkdownView | MarkdownFileInfo) {
            const { editor } = makeFakeEditor(['- [ ] A simple task'], 0, 0);
            const available = createApplyInstructionEditorCallback(
                new SetStatus(Status.DONE),
                'placeholder Not A Task message',
            )(true, editor as unknown as Editor, checkedView);
            return available;
        }

        it('should be available in a Markdown view, without changing anything', () => {
            const available = checkCommand(view);

            expect(available).toEqual(true);
        });

        it('should not be available outside a Markdown view', () => {
            const available = checkCommand({ file: { path: 'file.md' } } as MarkdownFileInfo);

            expect(available).toEqual(false);
        });
    });

    it('should change the status of every task in a multi-line selection, in one transaction', () => {
        const { text, transaction } = runCommand(
            ['- [ ] task 1', 'Not a task', '- [/] task 2', '- [ ] task 3 outside selection'],
            0,
            2,
        );

        expect(text).toEqual(
            [
                '- [x] task 1 ✅ 2026-02-27',
                'Not a task',
                '- [x] task 2 ✅ 2026-02-27',
                '- [ ] task 3 outside selection',
            ].join('\n'),
        );
        expect(transaction).toHaveBeenCalledTimes(1);
        expect(noticeMessages).toEqual([]);
    });

    it('should notify the user when no selected line is a task', () => {
        const { text, transaction } = runCommand(['Not a task', 'Also not a task'], 0, 1);

        expect(text).toEqual(['Not a task', 'Also not a task'].join('\n'));
        expect(transaction).not.toHaveBeenCalled();
        expect(noticeMessages).toEqual(['placeholder Not A Task message']);
    });

    it('should still change just the cursor line when the selection is on one line', () => {
        const { text, transaction } = runCommand(['- [ ] task 1', '- [ ] task 2'], 1, 1);

        expect(text).toEqual(['- [ ] task 1', '- [x] task 2 ✅ 2026-02-27'].join('\n'));
        expect(transaction).not.toHaveBeenCalled();
    });

    // https://github.com/obsidian-tasks-group/obsidian-tasks/issues/4141
    it('should change the selected line, not the next one, when the selection ends at the start of the next line', () => {
        const { text } = runCommand(['- [ ] line 1', '- [ ] line 2'], 0, 1, 0);

        expect(text).toEqual(['- [x] line 1 ✅ 2026-02-27', '- [ ] line 2'].join('\n'));
    });
});
