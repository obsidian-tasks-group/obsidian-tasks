/**
 * @jest-environment jsdom
 */

import moment from 'moment';
import type { Task } from '../../src/Task';
import { TaskBuilder } from './TaskBuilder';

export {};

window.moment = moment;

describe('TaskBuilder', () => {
    it('should add the tags to the description', () => {
        const builder = new TaskBuilder().description('hello').tags(['#tag1', '#tag2']);
        const task = builder.build();
        expect(task.toFileLineString()).toStrictEqual('- [ ] hello #tag1 #tag2');
    });

    it('createFullyPopulatedTask() should populate every field', () => {
        const task: Task = TaskBuilder.createFullyPopulatedTask();
        // @ts-ignore
        const args: Array<keyof Task> = Object.getOwnPropertyDescriptors(task);
        const nullOrUnsetFields: string[] = [];
        for (const key in args) {
            if (key[0] === '_') {
                // ignore private fields
                continue;
            }
            const value = task[key as keyof Task];
            if (typeof value === 'boolean') {
                // false is valid for booleans...
                continue;
            }

            if (!value) {
                nullOrUnsetFields.push(key);
            }
        }
        expect(nullOrUnsetFields).toEqual(['originalMarkdown']);

        // Current limitation: TaskBuilder does not yet automatically populate originalMarkdown:
        expect(task.originalMarkdown).toEqual('');

        // Currently the blockLink is not formatted correctly:
        expect(task.toFileLineString()).toEqual(
            '  - [ ] my description 🔁 every day when done ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03 📅 2023-07-04 ✅ 2023-07-05dcf64c',
        );

        // Once blocklink is written correctly, test that we can parse this line, round-trip and get an identical line and task
    });
});
