/**
 * @jest-environment jsdom
 */
import moment from 'moment/moment';
import { TasksFile } from '../../src/Scripting/TasksFile';
import { Task } from '../../src/Task/Task';
import { TaskLocation } from '../../src/Task/TaskLocation';
import { ListItem } from '../../src/Task/ListItem';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { fromLine } from '../TestingTools/TestHelpers';
import { findClosestParentTask } from '../../src/Renderer/QueryResultsRenderer';
import { createChildListItem } from './ListItemHelpers';

window.moment = moment;

describe('list item tests', () => {
    it('should create list item with empty children and absent parent', () => {
        const listItem = new ListItem('', null);
        expect(listItem).toBeDefined();
        expect(listItem.children).toEqual([]);
        expect(listItem.parent).toEqual(null);
    });

    it('should create a list item with 2 children', () => {
        const listItem = new ListItem('', null);
        const childItem1 = new ListItem('', listItem);
        const childItem2 = new ListItem('', listItem);
        expect(listItem).toBeDefined();
        expect(childItem1.parent).toEqual(listItem);
        expect(childItem2.parent).toEqual(listItem);
        expect(listItem.children).toEqual([childItem1, childItem2]);
    });

    it('should create a list item with a parent', () => {
        const parentItem = new ListItem('', null);
        const listItem = new ListItem('', parentItem);
        expect(listItem).toBeDefined();
        expect(listItem.parent).toEqual(parentItem);
        expect(parentItem.children).toEqual([listItem]);
    });

    it('should create a task child for a list item parent', () => {
        const parentListItem = new ListItem('- parent item', null);
        const firstReadTask = Task.fromLine({
            line: '    - [ ] child task',
            taskLocation: TaskLocation.fromUnknownPosition(new TasksFile('x.md')),
            fallbackDate: null,
        });

        // ListItem.parent is immutable, so we have to create a new task
        const finalTask = new Task({ ...firstReadTask!, parent: parentListItem });

        expect(parentListItem.children).toEqual([finalTask]);
        expect(finalTask.parent).toBe(parentListItem);
    });

    it('should create a list item child for a task parent', () => {
        const parentTask = Task.fromLine({
            line: '- [ ] parent task',
            taskLocation: TaskLocation.fromUnknownPosition(new TasksFile('x.md')),
            fallbackDate: null,
        });
        const childListItem = new ListItem('    - child item', parentTask);

        expect(parentTask!.children).toEqual([childListItem]);
        expect(childListItem.parent).toBe(parentTask);
    });

    it('should identify root of the hierarchy', () => {
        const grandParent = new ListItem('- grand parent', null);
        const parent = new ListItem('- parent', grandParent);
        const child = new ListItem('- child', parent);

        expect(grandParent.root.originalMarkdown).toEqual('- grand parent');
        expect(parent.root.originalMarkdown).toEqual('- grand parent');
        expect(child.root.originalMarkdown).toEqual('- grand parent');

        expect(grandParent.isRoot).toEqual(true);
        expect(parent.isRoot).toEqual(false);
        expect(child.isRoot).toEqual(false);
    });

    it.each([
        ['- ', true],
        ['* ', true],
        ['+ ', true],
        ['17. ', true],
        ['    - ', true],
        ['>   - ', true],
        ['> >   - ', true],
    ])('should parse description with list item prefix: "%s"', (prefix: string, shouldPass) => {
        const description = 'stuff';
        const line = prefix + description;
        const listItem = new ListItem(line, null);
        expect(listItem.originalMarkdown).toEqual(line);
        if (shouldPass) {
            expect(listItem.description).toEqual(description);
        } else {
            expect(listItem.description).not.toEqual(description);
        }
    });
});

describe('related items', () => {
    it('should detect if no closest parent task', () => {
        const task = fromLine({ line: '- [ ] task' });
        const item = new ListItem('- item', null);
        const childOfItem = new ListItem('- child of item', item);

        expect(findClosestParentTask(task)).toEqual(null);
        expect(findClosestParentTask(item)).toEqual(null);
        expect(findClosestParentTask(childOfItem)).toEqual(null);
    });

    it('should find the closest parent task', () => {
        const parentTask = fromLine({ line: '- [ ] task' });
        const child = new ListItem('- item', parentTask);
        const grandChild = new ListItem('- item', child);

        expect(findClosestParentTask(parentTask)).toEqual(null);
        expect(findClosestParentTask(child)).toEqual(parentTask);
        expect(findClosestParentTask(grandChild)).toEqual(parentTask);
    });
});

describe('identicalTo', () => {
    it('should test same markdown', () => {
        const listItem1 = new ListItem('- same description', null);
        const listItem2 = new ListItem('- same description', null);
        expect(listItem1.identicalTo(listItem2)).toEqual(true);
    });

    it('should test different markdown', () => {
        const listItem1 = new ListItem('- description', null);
        const listItem2 = new ListItem('- description two', null);
        expect(listItem1.identicalTo(listItem2)).toEqual(false);
    });

    it('should recognise list items with different number of children', () => {
        const item1 = new ListItem('- item', null);
        createChildListItem('- child of item1', item1);

        const item2 = new ListItem('- item', null);

        expect(item2.identicalTo(item1)).toEqual(false);
    });

    it('should recognise list items with different children', () => {
        const item1 = new ListItem('- item', null);
        createChildListItem('- child of item1', item1);

        const item2 = new ListItem('- item', null);
        createChildListItem('- child of item2', item2);

        expect(item2.identicalTo(item1)).toEqual(false);
    });

    it('should recognise ListItem and Task as different', () => {
        const listItem = new ListItem('- [ ] description', null);
        const task = fromLine({ line: '- [ ] description' });

        expect(listItem.identicalTo(task)).toEqual(false);
    });
});

describe('checking if list item lists are identical', () => {
    it('should treat empty lists as identical', () => {
        const list1: ListItem[] = [];
        const list2: ListItem[] = [];
        expect(ListItem.listsAreIdentical(list1, list2)).toBe(true);
    });

    it('should treat different sized lists as different', () => {
        const list1: ListItem[] = [];
        const list2: ListItem[] = [new ListItem('- x', null)];
        expect(ListItem.listsAreIdentical(list1, list2)).toBe(false);
    });

    it('should detect matching list items as same', () => {
        const list1: ListItem[] = [new ListItem('- 1', null)];
        const list2: ListItem[] = [new ListItem('- 1', null)];
        expect(ListItem.listsAreIdentical(list1, list2)).toBe(true);
    });

    it('- should detect non-matching list items as different', () => {
        const list1: ListItem[] = [new ListItem('- 1', null)];
        const list2: ListItem[] = [new ListItem('- 2', null)];
        expect(ListItem.listsAreIdentical(list1, list2)).toBe(false);
    });
});

describe('checking if task lists are identical', () => {
    it('should treat empty lists as identical', () => {
        const list1: Task[] = [];
        const list2: Task[] = [];
        expect(ListItem.listsAreIdentical(list1, list2)).toBe(true);
    });

    it('should treat different sized lists as different', () => {
        const list1: Task[] = [];
        const list2: Task[] = [new TaskBuilder().build()];
        expect(ListItem.listsAreIdentical(list1, list2)).toBe(false);
    });

    it('should detect matching tasks as same', () => {
        const list1: Task[] = [new TaskBuilder().description('1').build()];
        const list2: Task[] = [new TaskBuilder().description('1').build()];
        expect(ListItem.listsAreIdentical(list1, list2)).toBe(true);
    });

    it('should detect non-matching tasks as different', () => {
        const list1: Task[] = [new TaskBuilder().description('1').build()];
        const list2: Task[] = [new TaskBuilder().description('2').build()];
        expect(ListItem.listsAreIdentical(list1, list2)).toBe(false);
    });
});

describe('checking if mixed lists are identical', () => {
    it('should recognise mixed lists as unequal', () => {
        const list1 = [new ListItem('- [ ] description', null)];
        const list2 = [fromLine({ line: '- [ ] description' })];

        expect(ListItem.listsAreIdentical(list1, list1)).toEqual(true);
        expect(ListItem.listsAreIdentical(list1, list2)).toEqual(false);
        expect(ListItem.listsAreIdentical(list2, list1)).toEqual(false);
        expect(ListItem.listsAreIdentical(list2, list2)).toEqual(true);
    });
});
