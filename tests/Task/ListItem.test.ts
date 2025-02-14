/**
 * @jest-environment jsdom
 */
import moment from 'moment/moment';
import { TasksFile } from '../../src/Scripting/TasksFile';
import { ListItem } from '../../src/Task/ListItem';
import { Task } from '../../src/Task/Task';
import { TaskLocation } from '../../src/Task/TaskLocation';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { fromLine } from '../TestingTools/TestHelpers';
import { createChildListItem } from './ListItemHelpers';

window.moment = moment;

const taskLocation = TaskLocation.fromUnknownPosition(new TasksFile('anything.md'));

describe('list item tests', () => {
    it('should create list item with empty children and absent parent', () => {
        const listItem = new ListItem('', null, taskLocation);
        expect(listItem).toBeDefined();
        expect(listItem.children).toEqual([]);
        expect(listItem.parent).toEqual(null);
        expect(listItem.taskLocation).toBe(taskLocation);
    });

    it('should create a list item with 2 children', () => {
        const listItem = new ListItem('', null, taskLocation);
        const childItem1 = new ListItem('', listItem, taskLocation);
        const childItem2 = new ListItem('', listItem, taskLocation);
        expect(listItem).toBeDefined();
        expect(childItem1.parent).toEqual(listItem);
        expect(childItem2.parent).toEqual(listItem);
        expect(listItem.children).toEqual([childItem1, childItem2]);
    });

    it('should create a list item with a parent', () => {
        const parentItem = new ListItem('', null, taskLocation);
        const listItem = new ListItem('', parentItem, taskLocation);
        expect(listItem).toBeDefined();
        expect(listItem.parent).toEqual(parentItem);
        expect(parentItem.children).toEqual([listItem]);
    });

    it('should create a task child for a list item parent', () => {
        const parentListItem = new ListItem('- parent item', null, taskLocation);
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
        const childListItem = new ListItem('    - child item', parentTask, taskLocation);

        expect(parentTask!.children).toEqual([childListItem]);
        expect(childListItem.parent).toBe(parentTask);
    });

    it('should identify root of the hierarchy', () => {
        const grandParent = new ListItem('- grand parent', null, taskLocation);
        const parent = new ListItem('- parent', grandParent, taskLocation);
        const child = new ListItem('- child', parent, taskLocation);

        expect(grandParent.root.originalMarkdown).toEqual('- grand parent');
        expect(parent.root.originalMarkdown).toEqual('- grand parent');
        expect(child.root.originalMarkdown).toEqual('- grand parent');

        expect(grandParent.isRoot).toEqual(true);
        expect(parent.isRoot).toEqual(false);
        expect(child.isRoot).toEqual(false);
    });

    it('should not be a task', () => {
        const listItem = new ListItem('- list item', null, taskLocation);
        expect(listItem.isTask).toBe(false);
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
        const listItem = new ListItem(line, null, taskLocation);
        expect(listItem.originalMarkdown).toEqual(line);
        if (shouldPass) {
            expect(listItem.description).toEqual(description);
        } else {
            expect(listItem.description).not.toEqual(description);
        }
    });
});

describe('list item parsing', () => {
    it('should read a list item without checkbox', () => {
        const item = new ListItem('- without checkbox', null, taskLocation);

        expect(item.description).toEqual('without checkbox');
        expect(item.originalMarkdown).toEqual('- without checkbox');
        expect(item.statusCharacter).toEqual(null);
        expect(item.indentation).toEqual('');
        expect(item.listMarker).toEqual('-');
    });

    it('should read a list item with checkbox', () => {
        const item = new ListItem('- [ ] with checkbox', null, taskLocation);

        expect(item.description).toEqual('with checkbox');
        expect(item.originalMarkdown).toEqual('- [ ] with checkbox');
        expect(item.statusCharacter).toEqual(' ');
    });

    it('should read a list item with checkbox', () => {
        const item = new ListItem('- [x] with checked checkbox', null, taskLocation);

        expect(item.description).toEqual('with checked checkbox');
        expect(item.originalMarkdown).toEqual('- [x] with checked checkbox');
        expect(item.statusCharacter).toEqual('x');
    });

    it('should read a list item with indentation', () => {
        const item = new ListItem('  - indented', null, taskLocation);

        expect(item.description).toEqual('indented');
        expect(item.indentation).toEqual('  ');
    });

    it('should read a list marker', () => {
        expect(new ListItem('* xxx', null, taskLocation).listMarker).toEqual('*');
        expect(new ListItem('- xxx', null, taskLocation).listMarker).toEqual('-');
        expect(new ListItem('+ xxx', null, taskLocation).listMarker).toEqual('+');
        expect(new ListItem('2. xxx', null, taskLocation).listMarker).toEqual('2.');
    });

    it('should accept a non list item', () => {
        // we tried making the constructor throw if given a non list item
        // but it broke lots of normal Task uses in the tests (TaskBuilder)
        const item = new ListItem('# Heading', null, taskLocation);

        expect(item.description).toEqual('# Heading');
        expect(item.originalMarkdown).toEqual('# Heading');
        expect(item.statusCharacter).toEqual(null);
    });
});

describe('list item writing', () => {
    it('should write a simple list item', () => {
        const item = new ListItem('- simple', null, taskLocation);

        expect(item.toFileLineString()).toEqual('- simple');
    });

    it('should write a simple check list item', () => {
        const item = new ListItem('- [ ] simple checklist', null, taskLocation);

        expect(item.toFileLineString()).toEqual('- [ ] simple checklist');
    });

    it('should write an indented list item', () => {
        const item = new ListItem('    - indented', null, taskLocation);

        expect(item.toFileLineString()).toEqual('    - indented');
    });

    it('should write a list item with a different list marker', () => {
        const item = new ListItem('* star', null, taskLocation);

        expect(item.toFileLineString()).toEqual('* star');
    });
});

describe('related items', () => {
    it('should detect if no closest parent task', () => {
        const task = fromLine({ line: '- [ ] task' });
        const item = new ListItem('- item', null, taskLocation);
        const childOfItem = new ListItem('- child of item', item, taskLocation);

        expect(task.findClosestParentTask()).toEqual(null);
        expect(item.findClosestParentTask()).toEqual(null);
        expect(childOfItem.findClosestParentTask()).toEqual(null);
    });

    it('should find the closest parent task', () => {
        const parentTask = fromLine({ line: '- [ ] task' });
        const child = new ListItem('- item', parentTask, taskLocation);
        const grandChild = new ListItem('- item', child, taskLocation);

        expect(parentTask.findClosestParentTask()).toEqual(null);
        expect(child.findClosestParentTask()).toEqual(parentTask);
        expect(grandChild.findClosestParentTask()).toEqual(parentTask);
    });
});

describe('identicalTo', () => {
    it('should test same markdown', () => {
        const listItem1 = new ListItem('- same description', null, taskLocation);
        const listItem2 = new ListItem('- same description', null, taskLocation);
        expect(listItem1.identicalTo(listItem2)).toEqual(true);
    });

    it('should recognise different descriptions', () => {
        const listItem1 = new ListItem('- description', null, taskLocation);
        const listItem2 = new ListItem('- description two', null, taskLocation);
        expect(listItem1.identicalTo(listItem2)).toEqual(false);
    });

    it('should recognise list items with different number of children', () => {
        const item1 = new ListItem('- item', null, taskLocation);
        createChildListItem('- child of item1', item1);

        const item2 = new ListItem('- item', null, taskLocation);

        expect(item2.identicalTo(item1)).toEqual(false);
    });

    it('should recognise list items with different children', () => {
        const item1 = new ListItem('- item', null, taskLocation);
        createChildListItem('- child of item1', item1);

        const item2 = new ListItem('- item', null, taskLocation);
        createChildListItem('- child of item2', item2);

        expect(item2.identicalTo(item1)).toEqual(false);
    });

    it('should recognise different status characters', () => {
        const item1 = new ListItem('- [1] item', null, taskLocation);
        const item2 = new ListItem('- [2] item', null, taskLocation);

        expect(item2.identicalTo(item1)).toEqual(false);
    });

    it('should recognise ListItem and Task as different', () => {
        const listItem = new ListItem('- [ ] description', null, taskLocation);
        const task = fromLine({ line: '- [ ] description' });

        expect(listItem.identicalTo(task)).toEqual(false);
    });

    it('should recognise different path', () => {
        const item1 = new ListItem('- same', null, TaskLocation.fromUnknownPosition(new TasksFile('anything.md')));
        const item2 = new ListItem('- same', null, TaskLocation.fromUnknownPosition(new TasksFile('something.md')));

        expect(item2.identicalTo(item1)).toEqual(false);
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
        const list2: ListItem[] = [new ListItem('- x', null, taskLocation)];
        expect(ListItem.listsAreIdentical(list1, list2)).toBe(false);
    });

    it('should detect matching list items as same', () => {
        const list1: ListItem[] = [new ListItem('- 1', null, taskLocation)];
        const list2: ListItem[] = [new ListItem('- 1', null, taskLocation)];
        expect(ListItem.listsAreIdentical(list1, list2)).toBe(true);
    });

    it('- should detect non-matching list items as different', () => {
        const list1: ListItem[] = [new ListItem('- 1', null, taskLocation)];
        const list2: ListItem[] = [new ListItem('- 2', null, taskLocation)];
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
        const list1 = [new ListItem('- [ ] description', null, taskLocation)];
        const list2 = [fromLine({ line: '- [ ] description' })];

        expect(ListItem.listsAreIdentical(list1, list1)).toEqual(true);
        expect(ListItem.listsAreIdentical(list1, list2)).toEqual(false);
        expect(ListItem.listsAreIdentical(list2, list1)).toEqual(false);
        expect(ListItem.listsAreIdentical(list2, list2)).toEqual(true);
    });
});

describe('list item checking and unchecking', () => {
    it('should create a checked list item', () => {
        const listItem = new ListItem(
            '- [ ] description',
            new ListItem('- [ ] parent', null, taskLocation),
            taskLocation,
        );

        const checkedListItem = listItem.checkOrUncheck();

        expect(checkedListItem.parent).toEqual(null);
        expect(checkedListItem.taskLocation).toBe(taskLocation);
        expect(checkedListItem.statusCharacter).toEqual('x');
        expect(checkedListItem.originalMarkdown).toEqual('- [x] description');
    });

    it('should create a checked list item and preserve the list marker', () => {
        const listItem = new ListItem('* [ ] check me', null, taskLocation);

        const checkedListItem = listItem.checkOrUncheck();

        expect(checkedListItem.statusCharacter).toEqual('x');
        expect(checkedListItem.originalMarkdown).toEqual('* [x] check me');
    });

    it('should create an unchecked list item', () => {
        const listItem = new ListItem('4. [#] uncheck me', null, taskLocation);

        const checkedListItem = listItem.checkOrUncheck();

        expect(checkedListItem.statusCharacter).toEqual(' ');
        expect(checkedListItem.originalMarkdown).toEqual('4. [ ] uncheck me');
    });

    it('should preserve a non-checklist item', () => {
        const listItem = new ListItem('- no checkbox', null, taskLocation);

        const newListItem = listItem.checkOrUncheck();

        expect(newListItem.statusCharacter).toEqual(null);
        expect(newListItem.originalMarkdown).toEqual('- no checkbox');
    });

    it.failing('should preserve a non-checklist item with checkbox-like string in description', () => {
        const listItem = new ListItem('- this looks like a checkbox [f]', null, taskLocation);

        const newListItem = listItem.checkOrUncheck();

        expect(newListItem.statusCharacter).toEqual(null);
        expect(newListItem.originalMarkdown).toEqual('- this looks like a checkbox [f]');
    });
});
