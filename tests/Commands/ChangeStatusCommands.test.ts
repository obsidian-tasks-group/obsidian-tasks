import moment from 'moment';
import { type Editor, type EditorChange, type EditorPosition, MarkdownView, Notice } from 'obsidian';
import {
    createSetStatusCommands,
    createSetStatusEditorCallback,
    createSetStatusLineTransformer,
    selectedLineNumbers,
    setStatusOnLine,
} from '../../src/Commands/ChangeStatusCommands';
import { Status } from '../../src/Statuses/Status';
import { StatusRegistry } from '../../src/Statuses/StatusRegistry';
import { StatusConfiguration, StatusType } from '../../src/Statuses/StatusConfiguration';
import { resetSettings, updateSettings } from '../../src/Config/Settings';

vi.mock('obsidian', () => ({
    MarkdownView: class MarkdownView {},
    Notice: vi.fn(),
}));

window.moment = moment;

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-27'));
});

afterEach(() => {
    vi.useRealTimers();
    resetSettings();
});

describe('setStatusOnLine', () => {
    it('should return refuse to act on a non-task line', () => {
        const result = setStatusOnLine('This is not a task', 'file.md', Status.DONE);
        expect(result).toBeUndefined();
    });

    it('should return refuse to act on an empty line', () => {
        const result = setStatusOnLine('', 'file.md', Status.DONE);
        expect(result).toBeUndefined();
    });

    it('should return an EditorInsertion for a valid task line', () => {
        const result = setStatusOnLine('- [ ] A simple task', 'file.md', Status.DONE);
        expect(result).toBeDefined();
        expect(result).toHaveProperty('text');
        expect(result).toHaveProperty('moveTo');
    });

    it('should set moveTo.line to 0 for a single-line result', () => {
        const result = setStatusOnLine('- [ ] A simple task', 'file.md', Status.DONE);
        expect(result).toBeDefined();
        expect(result!.moveTo).toEqual({ line: 0 });
    });

    it('should return multiple lines with moveTo.line as last line index for a recurring task', () => {
        const result = setStatusOnLine('- [ ] A recurring task 🔁 every day 📅 2022-09-04', 'file.md', Status.DONE);
        expect(result).toBeDefined();
        const lines = result!.text.split('\n');
        expect(lines.length).toBeGreaterThan(1);
        expect(result!.moveTo).toEqual({ line: lines.length - 1 });
    });

    it('should honour user settings for recurrence', () => {
        updateSettings({ recurrenceOnNextLine: true });

        const result = setStatusOnLine('- [ ] A recurring task 🔁 every day 📅 2022-09-04', 'file.md', Status.DONE);
        expect(result).toBeDefined();
        expect(result?.text).toEqual(
            [
                '- [x] A recurring task 🔁 every day 📅 2022-09-04 ✅ 2026-02-27',
                '- [ ] A recurring task 🔁 every day 📅 2022-09-05',
            ].join('\n'),
        );
    });
});

describe('createSetStatusLineTransformer', () => {
    const MockedNotice = vi.mocked(Notice);

    beforeEach(() => {
        MockedNotice.mockClear();
    });

    it('should change the status of a task line', () => {
        const transformer = createSetStatusLineTransformer(Status.DONE);
        const result = transformer('- [ ] A simple task', 'file.md');
        expect(result).toBeDefined();
        expect(result).toHaveProperty('text');
        expect(result).toHaveProperty('moveTo');
    });

    it('should mark a task as done', () => {
        const transformer = createSetStatusLineTransformer(Status.DONE);
        const result = transformer('- [ ] A simple task', 'file.md');
        expect(result!.text).toContain('- [x] A simple task');
    });

    it('should do nothing when the line is not a task', () => {
        const transformer = createSetStatusLineTransformer(Status.DONE);
        const result = transformer('This is not a task', 'file.md');
        expect(result).toBeUndefined();
    });

    it('should notify the user when the line is not a task', () => {
        const transformer = createSetStatusLineTransformer(Status.DONE);
        transformer('This is not a task', 'file.md');
        expect(MockedNotice).toHaveBeenCalledWith(
            'Cannot set status: line is not a task or does not match global filter',
        );
    });

    it('should not notify the user when changing a valid task', () => {
        const transformer = createSetStatusLineTransformer(Status.DONE);
        transformer('- [ ] A simple task', 'file.md');
        expect(MockedNotice).not.toHaveBeenCalled();
    });
});

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
});

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

describe('createSetStatusEditorCallback', () => {
    const MockedNotice = vi.mocked(Notice);

    beforeEach(() => {
        MockedNotice.mockClear();
    });

    /**
     * A minimal fake of Obsidian's Editor, holding the given lines,
     * with the selection running from the start of {@link fromLine} to the end of {@link toLine}.
     */
    function makeEditor(lines: string[], fromLine: number, toLine: number) {
        let text = lines.join('\n');
        const getLines = () => text.split('\n');
        const offset = ({ line, ch }: EditorPosition) =>
            getLines()
                .slice(0, line)
                .reduce((sum, l) => sum + l.length + 1, 0) + ch;
        const editor = {
            getLine: (n: number) => getLines()[n],
            lineCount: () => getLines().length,
            getCursor: () => ({ line: toLine, ch: 0 }),
            setCursor: () => {},
            listSelections: () => [
                { anchor: { line: fromLine, ch: 0 }, head: { line: toLine, ch: lines[toLine].length } },
            ],
            replaceRange: (replacement: string, from: EditorPosition, to: EditorPosition) => {
                text = text.slice(0, offset(from)) + replacement + text.slice(offset(to));
            },
            transaction: vi.fn(({ changes }: { changes: EditorChange[] }) => {
                // Apply from the end of the file backwards, so earlier positions stay valid.
                for (const change of [...changes].reverse()) {
                    editor.replaceRange(change.text, change.from, change.to!);
                }
            }),
        };
        return { editor, getText: () => text };
    }

    const view = Object.assign(Object.create(MarkdownView.prototype) as MarkdownView, { file: { path: 'file.md' } });

    function runCommand(lines: string[], fromLine: number, toLine: number) {
        const { editor, getText } = makeEditor(lines, fromLine, toLine);
        createSetStatusEditorCallback(Status.DONE)(false, editor as unknown as Editor, view);
        return { text: getText(), transaction: editor.transaction };
    }

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
        expect(MockedNotice).not.toHaveBeenCalled();
    });

    it('should add the next recurrence of selected recurring tasks', () => {
        const { text } = runCommand(['- [ ] task 1 🔁 every day 📅 2022-09-04', '- [ ] task 2'], 0, 1);

        expect(text).toEqual(
            [
                '- [ ] task 1 🔁 every day 📅 2022-09-05',
                '- [x] task 1 🔁 every day 📅 2022-09-04 ✅ 2026-02-27',
                '- [x] task 2 ✅ 2026-02-27',
            ].join('\n'),
        );
    });

    it('should notify the user when no selected line is a task', () => {
        const { text, transaction } = runCommand(['Not a task', 'Also not a task'], 0, 1);

        expect(text).toEqual(['Not a task', 'Also not a task'].join('\n'));
        expect(transaction).not.toHaveBeenCalled();
        expect(MockedNotice).toHaveBeenCalledWith(
            'Cannot set status: line is not a task or does not match global filter',
        );
    });

    it('should still change just the cursor line when the selection is on one line', () => {
        const { text, transaction } = runCommand(['- [ ] task 1', '- [ ] task 2'], 1, 1);

        expect(text).toEqual(['- [ ] task 1', '- [x] task 2 ✅ 2026-02-27'].join('\n'));
        expect(transaction).not.toHaveBeenCalled();
    });
});
