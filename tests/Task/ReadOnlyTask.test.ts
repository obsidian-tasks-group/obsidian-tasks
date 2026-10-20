import moment from 'moment';

import { TasksDate } from '../../src/DateTime/TasksDate';
import { StatusType } from '../../src/Statuses/StatusConfiguration';
import { OnCompletion } from '../../src/Task/OnCompletion';
import { Priority } from '../../src/Task/Priority';
import { taskToReadOnlyTask } from '../../src/Task/ReadOnlyTask';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

window.moment = moment;

describe('ReadOnlyTask field values', () => {
    it('should copy all fields from a fully populated task', () => {
        const task = TaskBuilder.createFullyPopulatedTask();

        const readOnlyTask = taskToReadOnlyTask(task);

        // Location
        expect(readOnlyTask.path).toEqual('some/folder/fileName.md');
        expect(readOnlyTask.lineNumber).toEqual(17);
        expect(readOnlyTask.sectionStart).toEqual(5);
        expect(readOnlyTask.sectionIndex).toEqual(3);
        expect(readOnlyTask.precedingHeader).toEqual('My Header');

        // Identity and content
        // If this fails, a new field may have been added to Task and TaskBuilder.
        // See also the 'detects if ReadOnlyTask may be missing a new Task field' test below.
        expect(readOnlyTask.originalMarkdown).toEqual(task.originalMarkdown);
        expect(readOnlyTask.description).toEqual('Do exercises #todo #health');

        // Status
        expect(readOnlyTask.status).toEqual({
            symbol: ' ',
            name: 'Todo',
            type: StatusType.TODO,
            nextStatusSymbol: 'x',
        });

        // Dates
        expect(readOnlyTask.created.formatAsDate()).toEqual('2023-07-01');
        expect(readOnlyTask.start.formatAsDate()).toEqual('2023-07-02');
        expect(readOnlyTask.scheduled.formatAsDate()).toEqual('2023-07-03');
        expect(readOnlyTask.due.formatAsDate()).toEqual('2023-07-04');
        expect(readOnlyTask.done.formatAsDate()).toEqual('2023-07-05');
        expect(readOnlyTask.cancelled.formatAsDate()).toEqual('2023-07-06');
        expect(readOnlyTask.scheduledDateIsInferred).toEqual(false);

        // Priority
        expect(readOnlyTask.priority).toEqual(Priority.Medium);

        // Recurrence and completion behaviour
        expect(readOnlyTask.recurrenceRule).toEqual('every day when done');
        expect(readOnlyTask.onCompletion).toEqual(OnCompletion.Delete);

        // Dependencies
        expect(readOnlyTask.id).toEqual('abcdef');
        expect(readOnlyTask.dependsOn).toEqual(['123456', 'abc123']);
        expect(readOnlyTask.blockLink).toEqual(' ^dcf64c');

        // Tags
        expect(readOnlyTask.tags).toEqual(['#todo', '#health']);
    });

    it('should represent an unpopulated task', () => {
        const task = new TaskBuilder().build();

        const readOnlyTask = taskToReadOnlyTask(task);

        expect(readOnlyTask.path).toEqual('');
        expect(readOnlyTask.lineNumber).toEqual(0);
        expect(readOnlyTask.sectionStart).toEqual(0);
        expect(readOnlyTask.sectionIndex).toEqual(0);
        expect(readOnlyTask.precedingHeader).toBeNull();

        expect(readOnlyTask.description).toEqual('my description');
        expect(readOnlyTask.status.type).toEqual(StatusType.TODO);

        expect(readOnlyTask.created.formatAsDate()).toEqual('');
        expect(readOnlyTask.start.formatAsDate()).toEqual('');
        expect(readOnlyTask.scheduled.formatAsDate()).toEqual('');
        expect(readOnlyTask.due.formatAsDate()).toEqual('');
        expect(readOnlyTask.done.formatAsDate()).toEqual('');
        expect(readOnlyTask.cancelled.formatAsDate()).toEqual('');

        expect(readOnlyTask.priority).toEqual(Priority.None);
        expect(readOnlyTask.recurrenceRule).toEqual('');
        expect(readOnlyTask.onCompletion).toEqual(OnCompletion.Ignore);
        expect(readOnlyTask.id).toEqual('');
        expect(readOnlyTask.dependsOn).toEqual([]);
        expect(readOnlyTask.blockLink).toEqual('');
        expect(readOnlyTask.tags).toEqual([]);
    });

    it('should copy all fields of a custom status', () => {
        const task = new TaskBuilder().statusValues('P', 'In Progress', 'x', false, StatusType.IN_PROGRESS).build();

        const readOnlyTask = taskToReadOnlyTask(task);

        expect(readOnlyTask.status).toEqual({
            symbol: 'P',
            name: 'In Progress',
            type: StatusType.IN_PROGRESS,
            nextStatusSymbol: 'x',
        });
    });

    it('detects if ReadOnlyTask may be missing a new Task field', () => {
        // If this fails, it probably means that a new field has been added to Task and therefore to TaskBuilder.
        // And so ReadOnlyTask needs to be reviewed, the new field added and then this test updated.
        const readOnlyTask = taskToReadOnlyTask(TaskBuilder.createFullyPopulatedTask());
        expect(readOnlyTask.originalMarkdown).toMatchInlineSnapshot(
            '"  - [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03 📅 2023-07-04 ❌ 2023-07-06 ✅ 2023-07-05 ^dcf64c"',
        );
    });
});

describe('ReadOnlyTask runtime immutability', () => {
    it('should be frozen, including its nested status and arrays', () => {
        const task = TaskBuilder.createFullyPopulatedTask();

        const readOnlyTask = taskToReadOnlyTask(task);

        expect(Object.isFrozen(readOnlyTask)).toBe(true);
        expect(Object.isFrozen(readOnlyTask.status)).toBe(true);
        expect(Object.isFrozen(readOnlyTask.tags)).toBe(true);
        expect(Object.isFrozen(readOnlyTask.dependsOn)).toBe(true);
    });

    it('should reject assignment to any of its properties', () => {
        const readOnlyTask = taskToReadOnlyTask(new TaskBuilder().build());

        // These rely on test code running in strict mode:
        expect(() => {
            (readOnlyTask as any).description = 'edited description';
        }).toThrow(TypeError);
        expect(() => {
            (readOnlyTask as any).tags = ['#edited'];
        }).toThrow(TypeError);
        expect(readOnlyTask.description).toEqual('my description');
    });

    it('should reject assignment to nested status properties', () => {
        const readOnlyTask = taskToReadOnlyTask(new TaskBuilder().build());

        expect(() => {
            (readOnlyTask.status as any).symbol = 'x';
        }).toThrow(TypeError);
        expect(readOnlyTask.status.symbol).toEqual(' ');
    });

    it('should reject modification of the tags and dependsOn arrays', () => {
        const readOnlyTask = taskToReadOnlyTask(new TaskBuilder().tags(['#todo']).dependsOn(['123456']).build());

        expect(() => {
            (readOnlyTask.tags as string[]).push('#edited');
        }).toThrow(TypeError);
        expect(() => {
            (readOnlyTask.dependsOn as string[]).push('edited');
        }).toThrow(TypeError);
        expect(readOnlyTask.tags).toEqual(['#todo']);
        expect(readOnlyTask.dependsOn).toEqual(['123456']);
    });
});

describe('ReadOnlyTask isolation from source data', () => {
    it('should not be affected by later edits to the source task collections', () => {
        const task = new TaskBuilder().tags(['#todo']).dependsOn(['123456']).build();
        const readOnlyTask = taskToReadOnlyTask(task);

        // Mutate the source arrays after the snapshot was made:
        task.tags.push('#late-addition');
        task.dependsOn.push('late-addition');

        expect(readOnlyTask.tags).toEqual(['#todo']);
        expect(readOnlyTask.dependsOn).toEqual(['123456']);
    });

    it('should not allow edits to the source task dates via its TasksDate objects', () => {
        const task = new TaskBuilder().dueDate('2023-07-04').build();
        const readOnlyTask = taskToReadOnlyTask(task);

        // The Moment returned by TasksDate.moment is a clone, so editing it
        // affects neither the snapshot nor the source task:
        const snapshotMoment = readOnlyTask.due.moment;
        expect(snapshotMoment).not.toBeNull();
        snapshotMoment!.add(10, 'days');

        expect(readOnlyTask.due.formatAsDate()).toEqual('2023-07-04');
        expect(task.dueDate!.format('YYYY-MM-DD')).toEqual('2023-07-04');
    });

    it('should expose dates as TasksDate objects, even for tasks without dates', () => {
        const readOnlyTask = taskToReadOnlyTask(new TaskBuilder().build());

        expect(readOnlyTask.due).toBeInstanceOf(TasksDate);
        expect(readOnlyTask.due.moment).toBeNull();
    });
});
