import moment from 'moment';
import { MoveTaskDate, SetTaskDateRelativeToToday } from 'ui/EditInstructions/DateCommandInstructions';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { fromLine } from '../../TestingTools/TestHelpers';

window.moment = moment;

const today = '2024-10-01';

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(today));
});

afterEach(() => {
    vi.useRealTimers();
});

function applyToLine(instruction: { apply: (task: any) => any[] }, line: string) {
    return instruction
        .apply(fromLine({ line }))
        .map((t: any) => t.toFileLineString())
        .join('\n');
}

describe('SetTaskDateRelativeToToday', () => {
    it('should name the command', () => {
        const instruction = new SetTaskDateRelativeToToday('dueDate', 0);
        expect(instruction.instructionDisplayName()).toEqual('Change Due date to: Today');
        expect(instruction.commandId()).toEqual('set-due-date-to-today');
    });

    it('should name tomorrow and yesterday commands', () => {
        expect(new SetTaskDateRelativeToToday('dueDate', 1).instructionDisplayName()).toEqual(
            'Change Due date to: Tomorrow',
        );
        expect(new SetTaskDateRelativeToToday('dueDate', 1).commandId()).toEqual('set-due-date-to-today-plus-1-day');
        expect(new SetTaskDateRelativeToToday('createdDate', -1).instructionDisplayName()).toEqual(
            'Change Created date to: Yesterday',
        );
        expect(new SetTaskDateRelativeToToday('createdDate', -1).commandId()).toEqual(
            'set-created-date-to-today-minus-1-day',
        );
    });

    it('should set the date relative to today', () => {
        expect(applyToLine(new SetTaskDateRelativeToToday('dueDate', 1), '- [ ] task')).toEqual(
            '- [ ] task 📅 2024-10-02',
        );
        expect(applyToLine(new SetTaskDateRelativeToToday('dueDate', 0), '- [ ] task 📅 2023-01-01')).toEqual(
            '- [ ] task 📅 2024-10-01',
        );
    });

    it('should return the same task if the date is already set', () => {
        const task = new TaskBuilder().dueDate(today).build();
        expect(new SetTaskDateRelativeToToday('dueDate', 0).apply(task)).toEqual([task]);
    });

    it('should use the date when applied, not when constructed', () => {
        const instruction = new SetTaskDateRelativeToToday('dueDate', 0);
        vi.setSystemTime(new Date('2024-10-05'));
        expect(applyToLine(instruction, '- [ ] task')).toEqual('- [ ] task 📅 2024-10-05');
    });

    it('should replace an invalid date', () => {
        expect(applyToLine(new SetTaskDateRelativeToToday('dueDate', 0), '- [ ] task 📅 2024-02-30')).toEqual(
            '- [ ] task 📅 2024-10-01',
        );
    });
});

describe('MoveTaskDate', () => {
    it('should name the commands', () => {
        expect(new MoveTaskDate('dueDate', 1, 'week').instructionDisplayName()).toEqual('Move Due date by: +1 week');
        expect(new MoveTaskDate('dueDate', 1, 'week').commandId()).toEqual('move-due-date-by-plus-1-week');
        expect(new MoveTaskDate('dueDate', -1, 'day').instructionDisplayName()).toEqual('Move Due date by: -1 day');
        expect(new MoveTaskDate('dueDate', -1, 'day').commandId()).toEqual('move-due-date-by-minus-1-day');
    });

    it('should move the date relative to its current value', () => {
        expect(applyToLine(new MoveTaskDate('startDate', 1, 'week'), '- [ ] task 🛫 2023-12-28')).toEqual(
            '- [ ] task 🛫 2024-01-04',
        );
        expect(applyToLine(new MoveTaskDate('startDate', -1, 'day'), '- [ ] task 🛫 2024-03-01')).toEqual(
            '- [ ] task 🛫 2024-02-29',
        );
    });

    it('should leave tasks without the field unchanged', () => {
        const task = new TaskBuilder().build();
        expect(new MoveTaskDate('dueDate', 1, 'day').apply(task)).toEqual([task]);
    });

    it('should leave tasks with an invalid date unchanged', () => {
        const task = fromLine({ line: '- [ ] task 📅 2024-02-30' });
        expect(new MoveTaskDate('dueDate', 1, 'day').apply(task)).toEqual([task]);
    });
});
