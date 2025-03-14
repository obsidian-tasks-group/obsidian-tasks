/**
 * @jest-environment jsdom
 */

import moment from 'moment';
import type { Task } from '../../src/Task/Task';
import example_kanban from '../Obsidian/__test_data__/example_kanban.json';
import jason_properties from '../Obsidian/__test_data__/jason_properties.json';
import { ListItem } from '../../src/Task/ListItem';
import { TaskLocation } from '../../src/Task/TaskLocation';
import { TasksFile } from '../../src/Scripting/TasksFile';
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

    it('should allow parent to be supplied', () => {
        const location = TaskLocation.fromUnknownPosition(new TasksFile('somewhere.md'));
        const parent = ListItem.fromListItemLine('- any old list item', null, location);
        const builder = new TaskBuilder();
        const task = builder.parent(parent).build();
        expect(task.parent).toEqual(parent);
    });

    it('should populate CachedMetadata', () => {
        const builder = new TaskBuilder().mockData(example_kanban);
        const task = builder.build();
        expect(task.file.cachedMetadata).toBe(example_kanban.cachedMetadata);
    });

    it('should populate CachedMetadata in two different TaskBuilder objects simultaneously', () => {
        const builder1 = new TaskBuilder().mockData(example_kanban);
        const builder2 = new TaskBuilder().mockData(jason_properties);
        const task1 = builder1.build();
        const task2 = builder2.build();
        expect(task1.file.property('kanban-plugin')).toEqual('basic');
        expect(task2.file.property('publish')).toEqual(false);
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
        return nullOrUnsetFields.sort((a, b) => a.localeCompare(b));
    }

    it('createFullyPopulatedTask() should populate every field', () => {
        const task: Task = TaskBuilder.createFullyPopulatedTask();

        expect(getNullOrUnsetFields(task)).toEqual(['children', 'parent']);
        expect(getNullOrUnsetFields(task.taskLocation)).toEqual([]);

        expect(task.originalMarkdown).toEqual(
            '  - [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03 📅 2023-07-04 ❌ 2023-07-06 ✅ 2023-07-05 ^dcf64c',
        );
    });
});
