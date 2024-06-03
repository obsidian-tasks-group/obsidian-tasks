/**
 * @jest-environment jsdom
 */
import moment from 'moment/moment';
import { TasksFile } from '../../src/Scripting/TasksFile';
import { Task } from '../../src/Task/Task';
import { TaskLocation } from '../../src/Task/TaskLocation';
import { ListItem } from '../../src/Task/ListItem';

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
});
