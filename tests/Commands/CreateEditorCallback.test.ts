import { applyInstructionToLine, selectedLineNumbers } from 'Commands/CreateEditorCallback';
import { SetStatus } from 'ui/EditInstructions/StatusInstructions';
import { Status } from 'Statuses/Status';
import { resetSettings, updateSettings } from 'Config/Settings';
import { GlobalFilter } from 'Config/GlobalFilter';
import moment from 'moment/moment';

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
