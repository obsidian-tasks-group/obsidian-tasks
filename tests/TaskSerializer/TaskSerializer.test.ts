/**
 * @jest-environment jsdom
 */

import moment from 'moment';
import { Task } from '../../src/Task/Task';
import type { TaskDetails, TaskSerializer } from '../../src/TaskSerializer';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { Priority } from '../../src/Task/Priority';
import { TaskRegularExpressions } from '../../src/Task/TaskRegularExpressions';

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
     * The format that it recognizes is a priority and due date in that order, then a description.
     * Priority and due date are optional
     */
    class TestingTaskSerializer implements TaskSerializer {
        /* Attempts to parse a string into a TaskDetails */
        deserialize(line: string): TaskDetails {
            // Parse tokens
            const parsedTokens = line.trim().split(/\s+/);
            const [priorityString, dueDateString, ...descriptionParts] = parsedTokens;

            // Validate dueDate
            let dueDate = null;
            if (dueDateString) {
                const parsedDueDate = moment(dueDateString, TaskRegularExpressions.dateFormat);
                if (parsedDueDate.isValid()) {
                    dueDate = parsedDueDate;
                } else {
                    // Add back to description if invalid
                    descriptionParts.unshift(dueDateString);
                }
            }

            // Validate priority
            let priority = Priority.None;
            if (priorityString) {
                if (Object.values(Priority).includes(priorityString as Priority)) {
                    priority = priorityString as Priority;
                } else {
                    // Add back to description if invalid
                    descriptionParts.unshift(priorityString);
                }
            }
            const description = descriptionParts.join(' ');
            return {
                // NEW_TASK_FIELD_EDIT_REQUIRED
                description,
                tags: Task.extractHashtags(description),
                dueDate,
                priority,
                startDate: null,
                createdDate: null,
                scheduledDate: null,
                doneDate: null,
                cancelledDate: null,
                recurrence: null,
                dependsOn: [],
                id: '',
            };
        }

        /* Represents task as a string */
        serialize(task: Task): string {
            return [task.priority, task.dueDate?.format(TaskRegularExpressions.dateFormat), task.description]
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

        it('should parse just a description', () => {
            expect(ts.deserialize('Hello World, this is a task description')).toMatchTaskDetails({
                description: 'Hello World, this is a task description',
            });
        });

        it('should parse a priority and dueDate', () => {
            expect(ts.deserialize('1 1978-09-21')).toMatchTaskDetails({
                priority: Priority.High,
                dueDate: moment('1978-09-21', 'YYYY-MM-DD'),
            });
        });

        it('should parse a priority and description', () => {
            expect(ts.deserialize('1 Wobble')).toMatchTaskDetails({ priority: Priority.High, description: 'Wobble' });
        });

        it('should parse a full task', () => {
            expect(ts.deserialize('1 1978-09-21 Wobble')).toMatchTaskDetails({
                priority: Priority.High,
                description: 'Wobble',
                dueDate: moment('1978-09-21', 'YYYY-MM-DD'),
            });
        });
    });

    describe('serialize', () => {
        it('should serialize a task', () => {
            const tb = new TaskBuilder().description('');
            expect(ts.serialize(tb.priority(Priority.High).build())).toEqual('1');
            expect(ts.serialize(tb.description('Wobble').build())).toEqual('1 Wobble');
            expect(ts.serialize(tb.dueDate('1978-09-21').build())).toEqual('1 1978-09-21 Wobble');
        });
    });
});
