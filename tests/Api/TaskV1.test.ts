import moment from 'moment';
import { taskFromTaskV1, taskToTaskV1 } from '../../src/Api/TaskV1';
import { GlobalFilter } from '../../src/Config/GlobalFilter';
import { OnCompletion } from '../../src/Task/OnCompletion';
import { Priority } from '../../src/Task/Priority';
import { Task } from '../../src/Task/Task';
import { Status } from '../../src/Statuses/Status';
import { RecurrenceBuilder } from '../TestingTools/RecurrenceBuilder';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

window.moment = moment;

describe('TaskV1 mapping', () => {
    afterEach(() => {
        GlobalFilter.getInstance().reset();
    });

    it('maps task fields to TaskV1', () => {
        const task = new TaskBuilder()
            .description('Do the thing')
            .status(Status.IN_PROGRESS)
            .id('task-id')
            .dependsOn(['first-id', 'second-id'])
            .path('folder/file.md')
            .lineNumber(42)
            .tags(['#alpha', '#beta'])
            .priority(Priority.High)
            .recurrence(new RecurrenceBuilder().rule('every day').build())
            .onCompletion(OnCompletion.Delete)
            .blockLink(' ^block-id')
            .build();

        const taskV1 = taskToTaskV1(task);

        expect(taskV1).toMatchObject({
            id: 'task-id',
            description: 'Do the thing #alpha #beta',
            status: '/',
            dependsOn: ['first-id', 'second-id'],
            path: 'folder/file.md',
            lineNumber: 42,
            originalMarkdown: task.originalMarkdown,
            tags: ['#alpha', '#beta'],
            priority: '1',
            recurrenceRule: task.recurrenceRule,
            onCompletion: OnCompletion.Delete,
            blockLink: ' ^block-id',
            createdDate: null,
            startDate: null,
            scheduledDate: null,
            dueDate: null,
            doneDate: null,
            cancelledDate: null,
        });
    });

    it('removes the global filter from the public description but keeps original markdown unchanged', () => {
        GlobalFilter.getInstance().set('#task');
        const task = new TaskBuilder().description('#task Do the thing').build();

        const taskV1 = taskToTaskV1(task);

        expect(taskV1.description).toBe('Do the thing');
        expect(taskV1.originalMarkdown).toBe('- [ ] #task Do the thing');
    });

    it('maps valid dates to YYYY-MM-DD', () => {
        const task = new TaskBuilder().dueDate('2026-02-03').build();

        const taskV1 = taskToTaskV1(task);

        expect(taskV1.dueDate).toBe('2026-02-03');
    });

    it('maps invalid dates to null', () => {
        const task = new TaskBuilder().build();
        const taskWithInvalidDueDate = new Task({
            ...task,
            dueDate: moment.invalid(),
        });

        const taskV1 = taskToTaskV1(taskWithInvalidDueDate);

        expect(taskV1.dueDate).toBeNull();
    });

    it('copies array fields', () => {
        const task = new TaskBuilder().dependsOn(['first-id']).tags(['#alpha']).build();

        const taskV1 = taskToTaskV1(task);
        taskV1.dependsOn.push('second-id');
        taskV1.tags.push('#beta');

        expect(task.dependsOn).toEqual(['first-id']);
        expect(task.tags).toEqual(['#alpha']);
    });

    it('creates an internal task from a description with parser defaults', () => {
        const task = taskFromTaskV1({
            description: 'Do the thing',
            path: 'tasks.md',
        });

        expect(task.toFileLineString()).toBe('- [ ] Do the thing');
        expect(task.description).toBe('Do the thing');
        expect(task.status).toBe(Status.TODO);
        expect(task.path).toBe('tasks.md');
    });

    it('applies TaskV1 fields as overrides when creating an internal task', () => {
        const task = taskFromTaskV1({
            description: 'Default description',
            path: 'tasks.md',
            taskData: {
                description: 'Overridden description',
                status: '/',
                priority: Priority.High,
                createdDate: '2026-01-02',
                startDate: '2026-01-03',
                scheduledDate: '2026-01-04',
                dueDate: '2026-01-05',
                doneDate: '2026-01-06',
                cancelledDate: '2026-01-07',
                recurrenceRule: 'every day',
                onCompletion: OnCompletion.Delete,
                dependsOn: ['abc123'],
                id: 'def456',
                tags: ['#alpha', '#beta'],
                blockLink: ' ^block-id',
            },
        });

        expect(taskToTaskV1(task)).toMatchObject({
            description: 'Overridden description #alpha #beta',
            status: '/',
            priority: Priority.High,
            createdDate: '2026-01-02',
            startDate: '2026-01-03',
            scheduledDate: '2026-01-04',
            dueDate: '2026-01-05',
            doneDate: '2026-01-06',
            cancelledDate: '2026-01-07',
            recurrenceRule: 'every day',
            onCompletion: OnCompletion.Delete,
            dependsOn: ['abc123'],
            id: 'def456',
            tags: ['#alpha', '#beta'],
            blockLink: ' ^block-id',
        });
    });

    it('prepends the global filter when creating an internal task', () => {
        GlobalFilter.getInstance().set('#task');

        const task = taskFromTaskV1({
            description: 'Do the thing',
            path: 'tasks.md',
        });

        expect(task.description).toBe('#task Do the thing');
        expect(taskToTaskV1(task).description).toBe('Do the thing');
        expect(task.toFileLineString()).toBe('- [ ] #task Do the thing');
    });

    it('does not duplicate the global filter when creating an internal task', () => {
        GlobalFilter.getInstance().set('#task');

        const task = taskFromTaskV1({
            description: '#task Do the thing',
            path: 'tasks.md',
        });

        expect(task.description).toBe('#task Do the thing');
    });

    it('rejects invalid TaskV1 dates', () => {
        expect(() =>
            taskFromTaskV1({
                description: 'Do the thing',
                path: 'tasks.md',
                taskData: { dueDate: 'not-a-date' },
            }),
        ).toThrow("Invalid TaskV1 dueDate: 'not-a-date'. Expected YYYY-MM-DD.");
    });

    it('rejects invalid TaskV1 priorities', () => {
        expect(() =>
            taskFromTaskV1({
                description: 'Do the thing',
                path: 'tasks.md',
                taskData: { priority: 'urgent' },
            }),
        ).toThrow("Invalid TaskV1 priority: 'urgent'.");
    });
});
