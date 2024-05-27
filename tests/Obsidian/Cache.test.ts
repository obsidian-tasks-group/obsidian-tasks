import type { CachedMetadata } from 'obsidian';
import type { Task } from 'Task/Task';
import { logging } from '../../src/lib/logging';
import { getTasksFromFileContent2 } from '../../src/Obsidian/Cache';
import { inheritance_1parent1child } from './__test_data__/inheritance_1parent1child';
import { inheritance_1parent2children } from './__test_data__/inheritance_1parent2children';
import { inheritance_2siblings } from './__test_data__/inheritance_2siblings';
import { one_task } from './__test_data__/one_task';
import { tasks_with_inheritance } from './__test_data__/tasks_with_inheritance';

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

function testRootTask(parent: Task) {
    expect(parent.parent).toEqual(null);
}

function testChildToHaveParent(child1: Task, parent: Task) {
    expect(child1.parent?.originalMarkdown).toEqual(parent.originalMarkdown);
    expect(child1.parent).toEqual(parent);
}

describe('cache', () => {
    it('should read one task', () => {
        const tasks = readTasksFromSimulatedFile(one_task);
        expect(tasks.length).toEqual(1);
        expect(tasks[0].description).toEqual('#task the only task here');
    });

    it.failing('should read two sibling tasks', () => {
        const tasks = readTasksFromSimulatedFile(inheritance_2siblings);
        expect(inheritance_2siblings.fileContents).toMatchInlineSnapshot(`
            "- [ ] #task sibling 1
            - [ ] #task sibling 2"
        `);

        expect(tasks.length).toEqual(2);

        const sibling1 = tasks[0];
        const sibling2 = tasks[1];

        testRootTask(sibling1);
        testRootTask(sibling2);

        expect(sibling1.children).toEqual([]);
        expect(sibling2.children).toEqual([]);
    });

    it('should read one parent and one child task', () => {
        const tasks = readTasksFromSimulatedFile(inheritance_1parent1child);
        expect(inheritance_1parent1child.fileContents).toMatchInlineSnapshot(`
            "- [ ] #task parent
                - [ ] #task child"
        `);

        expect(tasks.length).toEqual(2);

        const parent = tasks[0];
        const child = tasks[1];

        testRootTask(parent);

        testChildToHaveParent(child, parent);
    });

    it('should read one parent and two children task', () => {
        const tasks = readTasksFromSimulatedFile(inheritance_1parent2children);
        expect(inheritance_1parent2children.fileContents).toMatchInlineSnapshot(`
            "- [ ] #task parent
                - [ ] #task child 1
                - [ ] #task child 2"
        `);

        expect(tasks.length).toEqual(3);

        const parent = tasks[0];
        const child1 = tasks[1];
        const child2 = tasks[2];

        testRootTask(parent);

        testChildToHaveParent(child1, parent);
        testChildToHaveParent(child2, parent);
    });

    it('should read parent and child tasks', () => {
        const tasks = readTasksFromSimulatedFile(tasks_with_inheritance);
        expect(tasks_with_inheritance.fileContents).toMatchInlineSnapshot(`
            "- [ ] #task parent task
                - [ ] #task child task 1
                - [ ] #task child task 2
                    - [ ] #task grandchild 1
            "
        `);

        expect(tasks.length).toEqual(4);

        const parent = tasks[0];
        const child1 = tasks[1];
        const child2 = tasks[2];
        const grandchild1 = tasks[3];

        testRootTask(parent);

        testChildToHaveParent(child1, parent);
        testChildToHaveParent(child2, parent);
        testChildToHaveParent(grandchild1, child2);

        // children are not implemented yet
        expect(parent.children).toEqual([]);
    });
});
