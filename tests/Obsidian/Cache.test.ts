/**
 * @jest-environment jsdom
 */
import moment from 'moment/moment';
import type { CachedMetadata } from 'obsidian';
import type { Task } from 'Task/Task';
import { logging } from '../../src/lib/logging';
import { getTasksFromFileContent2 } from '../../src/Obsidian/Cache';
import { inheritance_1parent1child } from './__test_data__/inheritance_1parent1child';
import { inheritance_1parent1child1newroot_after_header } from './__test_data__/inheritance_1parent1child1newroot_after_header';
import { inheritance_1parent1child1sibling_emptystring } from './__test_data__/inheritance_1parent1child1sibling_emptystring';
import { inheritance_1parent2children } from './__test_data__/inheritance_1parent2children';
import { inheritance_1parent2children1grandchild } from './__test_data__/inheritance_1parent2children1grandchild';
import { inheritance_1parent2children1sibling } from './__test_data__/inheritance_1parent2children1sibling';
import { inheritance_1parent2children2grandchildren } from './__test_data__/inheritance_1parent2children2grandchildren';
import { inheritance_1parent2children2grandchildren1sibling } from './__test_data__/inheritance_1parent2children2grandchildren1sibling';
import { inheritance_1parent2children2grandchildren1sibling_start_with_heading } from './__test_data__/inheritance_1parent2children2grandchildren1sibling_start_with_heading';
import { inheritance_2siblings } from './__test_data__/inheritance_2siblings';
import { inheritance_listitem_task } from './__test_data__/inheritance_listitem_task';
import { inheritance_listitem_task_siblings } from './__test_data__/inheritance_listitem_task_siblings';
import { inheritance_task_2listitem_3task } from './__test_data__/inheritance_task_2listitem_3task';
import { inheritance_task_listitem } from './__test_data__/inheritance_task_listitem';
import { inheritance_task_listitem_task } from './__test_data__/inheritance_task_listitem_task';
import { one_task } from './__test_data__/one_task';

window.moment = moment;

function errorReporter() {
    return;
}

/* Test creation sequence:

- Create a sample markdown file in Tasks demo vault (root/Test Data/) with the simplest content
to represent your test case. Choose a meaningful file name in snake case. See example in 'Test Data/one_task.md'.

    - There is a Templater template that may help with creating a new file, for single-tasks cases:
      `resources/sample_vaults/Tasks-Demo/_meta/templates/Test Data file.md`

- Open any other note in the vault, just so that Templater will run.

    - The Templater plugin requires a note to be open. The script won't edit the file, so it
      doesn't matter which file you have open.

- Run the command 'Templater: Insert _meta/templates/convert_test_data_markdown_to_js.md'
    - Or type the short-cut 'Ctrl + Cmd + Alt + T' / 'Ctrl + Ctrl + Alt + T'

- This will convert all the files 'root/Test Data/*.md' to test functions in 'tests/Obsidian/__test_data__/*.ts'

- Run 'yarn lint:test-data' to standardise the formatting in the generated TypeScript files.

- Use the data in the test with `readTasksFromSimulatedFile()`, the argument is the constant you
created in the previous step.

- Remember to commit the markdown file in the demo vault and the file with the simulated data.

 */

interface SimulatedFile {
    cachedMetadata: CachedMetadata;
    filePath: string;
    fileContents: string;
}

function readTasksFromSimulatedFile(testData: SimulatedFile) {
    const logger = logging.getLogger('testCache');
    return getTasksFromFileContent2(
        testData.filePath,
        testData.fileContents,
        testData.cachedMetadata.listItems!,
        logger,
        testData.cachedMetadata,
        errorReporter,
    );
}

function testRootAndChildren(root: Task, children: Task[]) {
    expect(root.parent).toEqual(null);

    testChildren(root, children);
}

function testChildren(parent: Task, childList: Task[]) {
    expect(parent.children).toEqual(childList);
    for (const child of childList) {
        expect(child.parent?.originalMarkdown).toEqual(parent.originalMarkdown);
        expect(child.parent).toEqual(parent);
    }
}

describe('cache', () => {
    it('should read one task', () => {
        const tasks = readTasksFromSimulatedFile(one_task);
        expect(tasks.length).toEqual(1);
        expect(tasks[0].description).toEqual('#task the only task here');
    });

    it('should read two sibling tasks', () => {
        const tasks = readTasksFromSimulatedFile(inheritance_2siblings);
        expect(inheritance_2siblings.fileContents).toMatchInlineSnapshot(`
            "- [ ] #task sibling 1
            - [ ] #task sibling 2
            "
        `);

        expect(tasks.length).toEqual(2);

        const [sibling1, sibling2] = tasks;

        testRootAndChildren(sibling1, []);
        testRootAndChildren(sibling2, []);
    });

    it('should read one parent and one child task', () => {
        const tasks = readTasksFromSimulatedFile(inheritance_1parent1child);
        expect(inheritance_1parent1child.fileContents).toMatchInlineSnapshot(`
            "- [ ] #task parent
                - [ ] #task child
            "
        `);

        expect(tasks.length).toEqual(2);

        const [parent, child] = tasks;

        testRootAndChildren(parent, [child]);
    });

    it('should read one parent and two children task', () => {
        const tasks = readTasksFromSimulatedFile(inheritance_1parent2children);
        expect(inheritance_1parent2children.fileContents).toMatchInlineSnapshot(`
            "- [ ] #task parent
                - [ ] #task child 1
                - [ ] #task child 2
            "
        `);

        expect(tasks.length).toEqual(3);

        const [parent, child1, child2] = tasks;

        testRootAndChildren(parent, [child1, child2]);
    });

    it('should read one parent, two children and one grandchild', () => {
        const tasks = readTasksFromSimulatedFile(inheritance_1parent2children1grandchild);
        expect(inheritance_1parent2children1grandchild.fileContents).toMatchInlineSnapshot(`
            "- [ ] #task parent task
                - [ ] #task child task 1
                - [ ] #task child task 2
                    - [ ] #task grandchild 1
            "
        `);

        expect(tasks.length).toEqual(4);

        const [parent, child1, child2, grandchild1] = tasks;

        testRootAndChildren(parent, [child1, child2]);
        testChildren(child2, [grandchild1]);
    });

    it('should read one parent, two children and two grandchildren', () => {
        const tasks = readTasksFromSimulatedFile(inheritance_1parent2children2grandchildren);
        expect(inheritance_1parent2children2grandchildren.fileContents).toMatchInlineSnapshot(`
            "- [ ] #task parent task
                - [ ] #task child task 1
                    - [ ] #task grandchild 1
                - [ ] #task child task 2
                    - [ ] #task grandchild 2
            "
        `);

        expect(tasks.length).toEqual(5);

        const [parent, child1, grandchild1, child2, grandchild2] = tasks;

        testRootAndChildren(parent, [child1, child2]);
        testChildren(child1, [grandchild1]);
        testChildren(child2, [grandchild2]);
    });

    it('should read one parent, two children, two grandchildren and one sibling', () => {
        const tasks = readTasksFromSimulatedFile(inheritance_1parent2children2grandchildren1sibling);
        expect(inheritance_1parent2children2grandchildren1sibling.fileContents).toMatchInlineSnapshot(`
            "- [ ] #task parent task
                - [ ] #task child task 1
                    - [ ] #task grandchild 1
                - [ ] #task child task 2
                    - [ ] #task grandchild 2
            - [ ] #task sibling
            "
        `);

        expect(tasks.length).toEqual(6);

        const [parent, child1, grandchild1, child2, grandchild2, sibling] = tasks;

        testRootAndChildren(parent, [child1, child2]);
        testChildren(child1, [grandchild1]);
        testChildren(child2, [grandchild2]);

        testRootAndChildren(sibling, []);
    });

    it('should read one parent, 2 children and a sibling', () => {
        const tasks = readTasksFromSimulatedFile(inheritance_1parent2children1sibling);
        expect(inheritance_1parent2children1sibling.fileContents).toMatchInlineSnapshot(`
            "- [ ] #task parent
                - [ ] #task child 1
                - [ ] #task child 2
            - [ ] #task sibling
            "
        `);

        expect(tasks.length).toEqual(4);

        const [parent, child1, child2, sibling] = tasks;

        testRootAndChildren(parent, [child1, child2]);
        testRootAndChildren(sibling, []);
    });

    it('should read sibling separated by empty line', () => {
        const tasks = readTasksFromSimulatedFile(inheritance_1parent1child1sibling_emptystring);
        expect(inheritance_1parent1child1sibling_emptystring.fileContents).toMatchInlineSnapshot(`
            "- [ ] #task parent task
                - [ ] #task child task 1

             - [ ] #task sibling
            "
        `);

        expect(tasks.length).toEqual(3);

        const [parent, child, sibling] = tasks;

        testRootAndChildren(parent, [child]);
        testChildren(child, []);

        testRootAndChildren(sibling, []);
    });

    it('should read new root task after header', () => {
        const tasks = readTasksFromSimulatedFile(inheritance_1parent1child1newroot_after_header);
        expect(inheritance_1parent1child1newroot_after_header.fileContents).toMatchInlineSnapshot(`
            "# first header

            - [ ] #task parent task
                - [ ] #task child task 1

            ## second header

            - [ ] #task root task
            "
        `);

        expect(tasks.length).toEqual(3);

        const [parent, child, newRoot] = tasks;

        testRootAndChildren(parent, [child]);
        testChildren(child, []);

        testRootAndChildren(newRoot, []);
    });

    it('should read root on non-starting line', () => {
        const tasks = readTasksFromSimulatedFile(inheritance_1parent2children2grandchildren1sibling_start_with_heading);
        expect(inheritance_1parent2children2grandchildren1sibling_start_with_heading.fileContents)
            .toMatchInlineSnapshot(`
            "# Test heading

            - [ ] #task parent task
                - [ ] #task child task 1
                    - [ ] #task grandchild 1
                - [ ] #task child task 2
                    - [ ] #task grandchild 2
            - [ ] #task sibling
            "
        `);

        expect(tasks.length).toEqual(6);

        const [parent, child1, grandchild1, child2, grandchild2, sibling] = tasks;

        testRootAndChildren(parent, [child1, child2]);
        testChildren(child1, [grandchild1]);
        testChildren(child2, [grandchild2]);

        testRootAndChildren(sibling, []);
    });

    it('should read task and listItem siblings', () => {
        const tasks = readTasksFromSimulatedFile(inheritance_listitem_task_siblings);
        expect(inheritance_listitem_task_siblings.fileContents).toMatchInlineSnapshot(`
            "- list item
            - [ ] task
            "
        `);

        expect(tasks.length).toEqual(1);

        const [task] = tasks;

        testRootAndChildren(task, []);
    });

    it('should read child task and parent listItem', () => {
        const tasks = readTasksFromSimulatedFile(inheritance_listitem_task);
        expect(inheritance_listitem_task.fileContents).toMatchInlineSnapshot(`
            "- parent list item
                - [ ] child task
            "
        `);

        expect(tasks.length).toEqual(1);

        const [task] = tasks;

        testRootAndChildren(task, []);
    });

    it('should read parent task and child listItem', () => {
        const tasks = readTasksFromSimulatedFile(inheritance_task_listitem);
        expect(inheritance_task_listitem.fileContents).toMatchInlineSnapshot(`
            "- [ ] parent task
                - child list item
            "
        `);

        expect(tasks.length).toEqual(1);

        const [task] = tasks;

        expect(task.parent).toEqual(null);

        expect(task.children.length).toEqual(1);

        const listItem = task.children[0];

        expect(listItem.parent).toEqual(task);
        expect(listItem.children.length).toEqual(0);
        expect(listItem.originalMarkdown).toEqual('    - child list item');
    });

    it('should read parent task, child listItem and grandchild task', () => {
        const tasks = readTasksFromSimulatedFile(inheritance_task_listitem_task);
        expect(inheritance_task_listitem_task.fileContents).toMatchInlineSnapshot(`
            "- [ ] parent task
                - child list item
                    - [ ] grandchild task
            "
        `);

        expect(tasks.length).toEqual(2);

        const [parentTask, grandChildTask] = tasks;

        expect(parentTask.parent).toEqual(null);

        expect(parentTask.children.length).toEqual(1);

        const childListItem = parentTask.children[0];

        expect(childListItem.parent).toEqual(parentTask);
        expect(childListItem.children).toEqual([grandChildTask]);
        expect(childListItem.originalMarkdown).toEqual('    - child list item');

        expect(grandChildTask.parent).toEqual(childListItem);
        expect(grandChildTask.children).toEqual([]);
    });

    it('should read parent task, two child listItems and 3 grandchild tasks', () => {
        const tasks = readTasksFromSimulatedFile(inheritance_task_2listitem_3task);
        expect(inheritance_task_2listitem_3task.fileContents).toMatchInlineSnapshot(`
            "- [ ] parent task
                - child list item 1
                    - [ ] grandchild task 1
                    - [ ] grandchild task 2
                - child list item 2
                    - [ ] grandchild task 3
            "
        `);

        expect(tasks.length).toEqual(4);

        const [parentTask, grandChildTask1, grandChildTask2, grandChildTask3] = tasks;

        expect(parentTask.parent).toEqual(null);

        expect(parentTask.children.length).toEqual(2);

        const [childListItem1, childListItem2] = parentTask.children;

        expect(childListItem1.parent).toEqual(parentTask);
        expect(childListItem1.children).toEqual([grandChildTask1, grandChildTask2]);
        expect(childListItem1.originalMarkdown).toEqual('    - child list item 1');

        expect(grandChildTask1.parent).toEqual(childListItem1);
        expect(grandChildTask1.children).toEqual([]);

        expect(grandChildTask2.parent).toEqual(childListItem1);
        expect(grandChildTask2.children).toEqual([]);

        expect(childListItem2.parent).toEqual(parentTask);
        expect(childListItem2.children).toEqual([grandChildTask3]);
        expect(childListItem2.originalMarkdown).toEqual('    - child list item 2');

        expect(grandChildTask3.parent).toEqual(childListItem2);
        expect(grandChildTask3.children).toEqual([]);
    });
});
