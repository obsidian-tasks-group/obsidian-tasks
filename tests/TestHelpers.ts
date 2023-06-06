import { Priority, Task } from '../src/Task';
import { TaskLocation } from '../src/TaskLocation';
import { Status } from './../src/Status';
import { StatusType } from './../src/StatusConfiguration';
import { PriorityField } from './../src/Query/Filter/PriorityField';
import { TaskBuilder } from './TestingTools/TaskBuilder';

export function fromLine({
    line,
    path = '',
    precedingHeader = null,
}: {
    line: string;
    path?: string;
    precedingHeader?: string | null;
}) {
    return Task.fromLine({
        line,
        taskLocation: new TaskLocation(path, 0, 0, 0, precedingHeader),
        fallbackDate: null,
    })!;
}

export function createTasksFromMarkdown(tasksAsMarkdown: string, path: string, precedingHeader: string): Task[] {
    const taskLines = tasksAsMarkdown.split('\n');
    const tasks: Task[] = [];
    for (const line of taskLines) {
        const task = Task.fromLine({
            line: line,
            taskLocation: new TaskLocation(path, 0, 0, 0, precedingHeader),
            fallbackDate: null,
        });
        if (task) {
            tasks.push(task);
        }
    }
    return tasks;
}

const representativeDates = ['2023-05-30', '2023-05-31', '2023-06-01', '2023-02-32', null];

export class SampleTasks {
    public static withAllRootsPathsHeadings(): Task[] {
        const allPathsAndHeadings: [string, string | null][] = [
            ['', 'heading'],

            // no heading supplied
            ['a/b/c.md', null],

            // File and heading, nominal case
            ['a/d/c.md', 'heading'],
            ['e/d/c.md', 'heading'],

            // If file name and heading are identical, avoid duplication ('c > c')
            ['a/b/c.md', 'c'],

            // If file name and heading are identical, avoid duplication, even if there are underscores in the file name
            ['a_b_c.md', 'a_b_c'],

            // Underscores in file name component are escaped
            ['a/b/_c_.md', null],

            // But underscores in the heading component are not
            ['a/b/_c_.md', 'heading _italic text_'],
        ];
        const t = '- [ ] xyz';

        const tasks = allPathsAndHeadings.map(([path, heading]) => {
            return fromLine({ line: t, path: path, precedingHeader: heading });
        });

        return tasks;
    }

    public static withAllRepresentativeCreatedDates(): Task[] {
        const tasks = representativeDates.map((date) => {
            return new TaskBuilder().createdDate(date).build();
        });

        return tasks;
    }

    public static withAllRepresentativeDoneDates(): Task[] {
        const tasks = representativeDates.map((date) => {
            return new TaskBuilder().doneDate(date).build();
        });

        return tasks;
    }

    public static withAllRepresentativeDueDates(): Task[] {
        const tasks = representativeDates.map((date) => {
            return new TaskBuilder().dueDate(date).build();
        });

        return tasks;
    }

    public static withAllRepresentativeScheduledDates(): Task[] {
        const tasks = representativeDates.map((date) => {
            return new TaskBuilder().scheduledDate(date).build();
        });

        return tasks;
    }

    public static withAllRepresentativeStartDates(): Task[] {
        const tasks = representativeDates.map((date) => {
            return new TaskBuilder().startDate(date).build();
        });

        return tasks;
    }

    public static withAllStatuses(): Task[] {
        const statuses = [
            Status.makeCancelled(),
            Status.makeDone(),
            Status.makeEmpty(),
            Status.makeInProgress(),
            Status.makeTodo(),
        ];

        const tasks = statuses.map((status) => {
            return new TaskBuilder().status(status).build();
        });

        return tasks;
    }

    public static withAllStatusTypes(): Task[] {
        // Abbreviated names so that the markdown text is aligned
        const todoTask = fromLine({ line: '- [ ] Todo' });
        const inprTask = fromLine({ line: '- [/] In progress' });
        const doneTask = fromLine({ line: '- [x] Done' });
        const cancTask = fromLine({ line: '- [-] Cancelled' });
        const unknTask = fromLine({ line: '- [%] Unknown' });
        const non_Task = new TaskBuilder()
            .statusValues('^', 'non-task', 'x', false, StatusType.NON_TASK)
            .description('Non-task')
            .build();
        const emptTask = new TaskBuilder().status(Status.makeEmpty()).description('Empty task').build();

        return [todoTask, inprTask, doneTask, cancTask, unknTask, non_Task, emptTask];
    }

    public static withAllPriorities(): Task[] {
        const tasks: Task[] = [];
        const allPriorities = Object.values(Priority);
        allPriorities.forEach((priority) => {
            // This description is chosen to be useful for including tasks in user docs, so
            // changing it will change documentation and sample vault content.
            const priorityName = PriorityField.priorityNameUsingNormal(priority);
            const description = `#task ${priorityName} priority`;

            const task = new TaskBuilder().priority(priority).description(description).build();
            tasks.push(task);
        });
        return tasks;
    }
}
