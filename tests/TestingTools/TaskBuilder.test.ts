/**
 * @jest-environment jsdom
 */

import moment from 'moment';
import type { Task } from '../../src/Task/Task';
import { TaskBuilder } from './TaskBuilder';

export {};

window.moment = moment;

describe('TaskBuilder', () => {
    it('should add the tags to the description', () => {
        const builder = new TaskBuilder().description('hello').tags(['#tag1', '#tag2']);
        const task = builder.build();
        expect(task.toFileLineString()).toStrictEqual('- [ ] hello #tag1 #tag2');
    });

    it('should populate originalMarkdown', () => {
        const builder = new TaskBuilder();
        const task = builder.description('hello').build();
        expect(task.originalMarkdown).toEqual('- [ ] hello');
    });

    function hasValue<Type>(value: Type[keyof Type]): boolean {
        if (typeof value === 'boolean') {
            // false is valid for booleans...
            return true;
        }

        if (Array.isArray(value)) {
            // Check for empty arrays:
            return value.length > 0;
        }

        // Check that values are non-null, strings are not empty...
        return !!value;
    }

    function getNullOrUnsetFields<Type>(type: Type) {
        // @ts-ignore
        const args: Array<keyof Type> = Object.getOwnPropertyDescriptors(type);
        const nullOrUnsetFields: string[] = [];
        for (const key in args) {
            const value = type[key as keyof Type];
            if (!hasValue(value)) {
                nullOrUnsetFields.push(key);
            }
        }
        return nullOrUnsetFields;
    }

    it('createFullyPopulatedTask() should populate every field', () => {
        const task: Task = TaskBuilder.createFullyPopulatedTask();

        expect(getNullOrUnsetFields(task)).toEqual(['parent', 'children']);
        expect(getNullOrUnsetFields(task.taskLocation)).toEqual([]);

        expect(task.originalMarkdown).toEqual(
            '  - [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03 📅 2023-07-04 ❌ 2023-07-06 ✅ 2023-07-05 ^dcf64c',
        );
    });
});
