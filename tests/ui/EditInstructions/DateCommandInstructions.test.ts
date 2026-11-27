import moment from 'moment';
import {
    MoveTaskDate,
    OnlyIfStatusAllowsEditingDate,
    SetTaskDateRelativeToToday,
} from 'ui/EditInstructions/DateCommandInstructions';
import { RemoveTaskDate } from 'ui/EditInstructions/DateInstructions';
import { Status } from 'Statuses/Status';
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
        const instruction = new SetTaskDateRelativeToToday('dueDate', 0, 'always');
        expect(instruction.instructionDisplayName()).toEqual('Change Due date to: Today');
        expect(instruction.commandId()).toEqual('set-due-date-to-today');
    });

    it('should name tomorrow and yesterday commands', () => {
        expect(new SetTaskDateRelativeToToday('dueDate', 1, 'always').instructionDisplayName()).toEqual(
            'Change Due date to: Tomorrow',
        );
        expect(new SetTaskDateRelativeToToday('dueDate', 1, 'always').commandId()).toEqual(
            'set-due-date-to-today-plus-1-day',
        );
        expect(new SetTaskDateRelativeToToday('createdDate', -1, 'always').instructionDisplayName()).toEqual(
            'Change Created date to: Yesterday',
        );
        expect(new SetTaskDateRelativeToToday('createdDate', -1, 'always').commandId()).toEqual(
            'set-created-date-to-today-minus-1-day',
        );
    });

    it('should set the date relative to today', () => {
        expect(applyToLine(new SetTaskDateRelativeToToday('dueDate', 1, 'always'), '- [ ] task')).toEqual(
            '- [ ] task 📅 2024-10-02',
        );
        expect(applyToLine(new SetTaskDateRelativeToToday('dueDate', 0, 'always'), '- [ ] task 📅 2023-01-01')).toEqual(
            '- [ ] task 📅 2024-10-01',
        );
    });

    it('should return the same task if the date is already set', () => {
        const task = new TaskBuilder().dueDate(today).build();
        expect(new SetTaskDateRelativeToToday('dueDate', 0, 'always').apply(task)).toEqual([task]);
    });

    it('should use the date when applied, not when constructed', () => {
        const instruction = new SetTaskDateRelativeToToday('dueDate', 0, 'always');
        vi.setSystemTime(new Date('2024-10-05'));
        expect(applyToLine(instruction, '- [ ] task')).toEqual('- [ ] task 📅 2024-10-05');
    });

    it('should replace an invalid date', () => {
        expect(applyToLine(new SetTaskDateRelativeToToday('dueDate', 0, 'always'), '- [ ] task 📅 2024-02-30')).toEqual(
            '- [ ] task 📅 2024-10-01',
        );
    });
});

describe('SetTaskDateRelativeToToday, only if missing', () => {
    it('should name the commands', () => {
        expect(new SetTaskDateRelativeToToday('createdDate', 0, 'if_missing').instructionDisplayName()).toEqual(
            'Add Created date: Today',
        );
        expect(new SetTaskDateRelativeToToday('createdDate', 0, 'if_missing').commandId()).toEqual(
            'add-created-date-today',
        );
        expect(new SetTaskDateRelativeToToday('dueDate', 1, 'if_missing').instructionDisplayName()).toEqual(
            'Add Due date: Tomorrow',
        );
        expect(new SetTaskDateRelativeToToday('dueDate', 1, 'if_missing').commandId()).toEqual(
            'add-due-date-today-plus-1-day',
        );
    });

    it('should add the date to a task without one', () => {
        expect(applyToLine(new SetTaskDateRelativeToToday('createdDate', -1, 'if_missing'), '- [ ] task')).toEqual(
            '- [ ] task ➕ 2024-09-30',
        );
    });

    it('should leave a task with an existing date unchanged', () => {
        const task = fromLine({ line: '- [ ] task ➕ 2023-01-01' });
        expect(new SetTaskDateRelativeToToday('createdDate', 0, 'if_missing').apply(task)).toEqual([task]);
    });

    it('should leave a task with an invalid date unchanged', () => {
        const task = fromLine({ line: '- [ ] task ➕ 2024-02-30' });
        expect(new SetTaskDateRelativeToToday('createdDate', 0, 'if_missing').apply(task)).toEqual([task]);
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

describe('OnlyIfStatusAllowsEditingDate', () => {
    const setDone = new OnlyIfStatusAllowsEditingDate(
        'doneDate',
        new SetTaskDateRelativeToToday('doneDate', 0, 'always'),
    );
    const setCancelled = new OnlyIfStatusAllowsEditingDate(
        'cancelledDate',
        new SetTaskDateRelativeToToday('cancelledDate', 0, 'always'),
    );

    it('should delegate the name and id', () => {
        expect(setDone.instructionDisplayName()).toEqual('Change Done date to: Today');
        expect(setDone.commandId()).toEqual('set-done-date-to-today');
    });

    it('should only edit done dates on done tasks', () => {
        expect(applyToLine(setDone, '- [x] task')).toEqual('- [x] task ✅ 2024-10-01');
        expect(applyToLine(setDone, '- [ ] task')).toEqual('- [ ] task');
        expect(applyToLine(setDone, '- [-] task')).toEqual('- [-] task');
    });

    it('should only edit cancelled dates on cancelled tasks', () => {
        expect(applyToLine(setCancelled, '- [-] task')).toEqual('- [-] task ❌ 2024-10-01');
        expect(applyToLine(setCancelled, '- [x] task')).toEqual('- [x] task');
    });

    it('should not remove a done date from a task that is not done', () => {
        const remove = new OnlyIfStatusAllowsEditingDate('doneDate', new RemoveTaskDate('doneDate', 'Remove'));
        const task = new TaskBuilder().status(Status.TODO).doneDate(today).build();
        expect(remove.apply(task)).toEqual([task]);
    });

    it('should edit other date fields regardless of status', () => {
        const setDue = new OnlyIfStatusAllowsEditingDate(
            'dueDate',
            new SetTaskDateRelativeToToday('dueDate', 0, 'always'),
        );
        expect(applyToLine(setDue, '- [x] task')).toEqual('- [x] task 📅 2024-10-01');
    });
});
