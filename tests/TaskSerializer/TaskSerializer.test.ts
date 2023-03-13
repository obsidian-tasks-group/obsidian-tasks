/**
 * @jest-environment jsdom
 */

import moment from 'moment';
import { Priority, Task, TaskRegularExpressions } from '../../src/Task';
import type { TaskDetails, TaskSerializer } from '../../src/TaskSerializer';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

jest.mock('obsidian');
window.moment = moment;

/**
 @summary
 This file contains a tested, end-to-end example for implementing and using a
 {@link TaskSerializer}.
 <br>
 This file should also contain any {@link TaskSerializer} tests that should be tested 
 against all the {@link TaskSerializer}s defined in this repo. Tests that only
 apply to one should be housed in that serializer's specific test file 
*/

describe('TaskSerializer Example', () => {
    /**
     * A toy {@link TaskSerializer} meant to illustrate the implementation and use of
     * the {@link TaskSerializer} interface.
     *
     * The format that it recognizes is a priority, followed by a single word description (i.e no whitespace), followed by a due date.
     * A task may be partially defined (just a priority, priority and description, etc...)
     */
    class TestingTaskSerializer implements TaskSerializer {
        /* Attempts to parse a string into a TaskDetails */
        deserialize(line: string): TaskDetails | null {
            // Parse tokens
            const parsedTokens = line.split(/\s+/);
            if (parsedTokens.length > 3) return null;
            const [priorityString, description, dueDateString] = parsedTokens;

            // Validate priority
            const priority = (priorityString as Priority) || Priority.None;
            if (!Object.values(Priority).includes(priority)) return null;

            // Validate dueDate
            const dueDate = dueDateString ? moment(dueDateString, TaskRegularExpressions.dateFormat) : null;
            if (dueDate && !dueDate.isValid()) return null;

            return {
                description: description ?? '',
                tags: Task.extractHashtags(description ?? ''),
                dueDate,
                priority,
                startDate: null,
                createdDate: null,
                scheduledDate: null,
                doneDate: null,
                recurrence: null,
            };
        }

        /* Represents task as a string */
        serialize(task: Task): string {
            return [task.priority, task.description, task.dueDate?.format(TaskRegularExpressions.dateFormat)]
                .filter((x) => x)
                .join(' ');
        }
    }

    const ts = new TestingTaskSerializer();

    describe('deserialize', () => {
        it('should parse the empty string', () => {
            expect(ts.deserialize('')).toMatchTaskDetails({});
        });

        it('should parse just a priority', () => {
            expect(ts.deserialize('1')).toMatchTaskDetails({ priority: Priority.High });
        });

        it('should parse a priority and description', () => {
            expect(ts.deserialize('1 Wobble')).toMatchTaskDetails({ priority: Priority.High, description: 'Wobble' });
        });

        it('should parse a full task', () => {
            expect(ts.deserialize('1 Wobble 1978-09-21')).toMatchTaskDetails({
                priority: Priority.High,
                description: 'Wobble',
                dueDate: moment('1978-09-21', 'YYYY-MM-DD'),
            });
        });

        it('should reject a task with more than 3 words', () => {
            expect(ts.deserialize('1 Wobble 1978-09-21 Do you remember?')).toBeNull();
        });

        it('should reject a task with an invalid priority', () => {
            expect(ts.deserialize('999')).toBeNull();
        });

        it('should reject a task with an invalid due date', () => {
            expect(ts.deserialize('1 Wobble NotADate')).toBeNull();
        });
    });

    describe('serialize', () => {
        it('should serialize a task', () => {
            const tb = new TaskBuilder().description('');
            expect(ts.serialize(tb.priority(Priority.High).build())).toEqual('1');
            expect(ts.serialize(tb.description('Wobble').build())).toEqual('1 Wobble');
            expect(ts.serialize(tb.dueDate('1978-09-21').build())).toEqual('1 Wobble 1978-09-21');
        });
    });
});
