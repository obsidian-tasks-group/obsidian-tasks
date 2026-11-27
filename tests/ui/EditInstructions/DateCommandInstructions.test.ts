import moment from 'moment';
import { MoveTaskDate } from 'ui/EditInstructions/DateCommandInstructions';
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
