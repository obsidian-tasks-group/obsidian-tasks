/**
 * @jest-environment jsdom
 */
import moment from 'moment/moment';
import type { CachedMetadata } from 'obsidian';
import { GlobalFilter } from '../../src/Config/GlobalFilter';
import type { ListItem } from '../../src/Task/ListItem';
import { getTasksFileFromMockData, listPathAndData } from '../TestingTools/MockDataHelpers';
import { AllMockDataNames, type MockDataName } from './AllCacheSampleData';
import { getMockDataAndReadTasks, readTasksFromSimulatedFile } from './SimulatedFile';

window.moment = moment;

function testRootAndChildren(root: ListItem, children: ListItem[]) {
    expect(root.parent).toEqual(null);

    testChildren(root, children);
}

function testChildren(parent: ListItem, childList: ListItem[]) {
    expect(parent.children).toEqual(childList);
    for (const child of childList) {
        expect(child.parent?.originalMarkdown).toEqual(parent.originalMarkdown);
        expect(child.parent).toEqual(parent);
    }
}

/**
 * Print a snapshot of a {@link ListItem} hierarchy based on parent-child relationships. To achieve this,
 * any indentation in {@link ListItem.originalMarkdown} will be trimmed and new indentation based
 * on parent-child relationships will be added to the snapshot.
 *
 * The type of the {@link ListItem} will be printed as well to avoid type mismatch with {@link Task}
 * since {@link Task} extends {@link ListItem}.
 *
 * @param listItem
 * @param depth of the starting tree. Set to 0 for root {@link ListItem}.
 */
function printHierarchy(listItem: ListItem, depth: number): string {
    const indentation = ' '.repeat(depth * 4);
    const trimmedMarkdown = listItem.originalMarkdown.trim();
    const type = listItem.constructor.name;

    const listItemLine = `${indentation}${trimmedMarkdown} : ${type}`;
    const childrenLines = listItem.children.map((child) => printHierarchy(child, depth + 1)).join('');

    return [listItemLine, childrenLines].join('\n');
}

/**
 * Print hierarchies from root {@link ListItem}s found in a {@link ListItem} array. A {@link ListItem} is considered
 * a root if it has no parent:
 * @example
 * ListItem.parent === null
 *
 * @param listItems
 */
function printRoots(listItems: ListItem[]) {
    const roots: ListItem[] = [];
    for (const listItem of listItems) {
        if (!roots.includes(listItem.root)) {
            roots.push(listItem.root);
        }
    }

    let rootHierarchies = '';
    roots.forEach((root) => {
        rootHierarchies += printHierarchy(root, 0);
    });
    return rootHierarchies;
}

afterEach(() => {
    GlobalFilter.getInstance().reset();
});

describe('cache', () => {
    it('should read one task', () => {
        const tasks = readTasksFromSimulatedFile('one_task');
        expect(tasks.length).toEqual(1);
        expect(tasks[0].description).toEqual('#task the only task here');
    });

    it('should read two sibling tasks', () => {
        const { data, tasks } = getMockDataAndReadTasks('inheritance_2siblings');
        expect(data.fileContents).toMatchInlineSnapshot(`
            "- [ ] #task sibling 1
            - [ ] #task sibling 2
            "
        `);

        expect(tasks.length).toEqual(2);

        const [sibling1, sibling2] = tasks;

        testRootAndChildren(sibling1, []);
        testRootAndChildren(sibling2, []);
    });

    it('should read numbered list items with dot', () => {
        const { data, tasks } = getMockDataAndReadTasks('numbered_list_items_standard');
        expect(data.fileContents).toMatchInlineSnapshot(`
            "# numbered_list_items_standard

            1. [ ] #task Task 1 in 'numbered_list_items_standard'
                1. Sub-item 1
            2. [ ] #task Task 2 in 'numbered_list_items_standard'
                1. Sub-item 2
            3. List item in 'numbered_list_items_standard'
            "
        `);
        expect(tasks[0].file.cachedMetadata.listItems?.length).toEqual(5);

        expect(printRoots(tasks)).toMatchInlineSnapshot(`
            "1. [ ] #task Task 1 in 'numbered_list_items_standard' : Task
                1. Sub-item 1 : ListItem
            2. [ ] #task Task 2 in 'numbered_list_items_standard' : Task
                1. Sub-item 2 : ListItem
            "
        `);
        expect(tasks.length).toEqual(2);
    });

    it('should read numbered list items with closing parenthesis', () => {
        // See https://github.com/obsidian-tasks-group/obsidian-tasks/issues/3401
        //      "Unexpected failure to create a list item from line" warning when parsing "1)" style numbered list
        const { data, tasks } = getMockDataAndReadTasks('numbered_list_items_with_paren');
        expect(data.fileContents).toMatchInlineSnapshot(`
            "# numbered_list_items_with_paren

            1) [ ] #task Task 1 in 'numbered_list_items_with_paren'
                1) Sub-item 1
            2) [ ] #task Task 2 in 'numbered_list_items_with_paren'
                1) Sub-item 2
            3) List item in 'numbered_list_items_with_paren'
            "
        `);

        expect(printRoots(tasks)).toMatchInlineSnapshot(`
            "1) [ ] #task Task 1 in 'numbered_list_items_with_paren' : Task
                1) Sub-item 1 : ListItem
            2) [ ] #task Task 2 in 'numbered_list_items_with_paren' : Task
                1) Sub-item 2 : ListItem
            "
        `);
        expect(tasks.length).toEqual(2);
    });

    it('visualise how Tasks handles sample tasks in issue #3481', () => {
        // This test name does not yet begin 'should', because it is only documenting/visualsing
        // the current behaviour - and not stating that the current behaviour is correct.

        // See https://github.com/obsidian-tasks-group/obsidian-tasks/issues/3481
        //      "Tasks query turns single-line tasks into multi-line tasks"
        const { data, tasks } = getMockDataAndReadTasks('numbered_tasks_issue_3481');
        expect(data.fileContents).toMatchInlineSnapshot(`
            "# numbered_tasks_issue_3481

            See https://github.com/obsidian-tasks-group/obsidian-tasks/issues/3481.

            - [ ] 1. #task Task 1 in 'numbered_tasks_issue_3481'
            - [ ] 2 #task Task 2 in 'numbered_tasks_issue_3481'
            - [ ] 3) #task Task 3 in 'numbered_tasks_issue_3481'
            - [ ] 4 - #task Task 4 in 'numbered_tasks_issue_3481'
            - [ ] 5: #task Task 5 in 'numbered_tasks_issue_3481'
            - [ ] (6) #task Task 6 in 'numbered_tasks_issue_3481'

            The file [[numbered_tasks_issue_3481_searches]] shows how Obsidian and some plugins parse the above data.
            "
        `);

        // This shows the current behaviour of the Tasks code for processing Obsidian listItems.
        // The two nested ListItem lines are not expected.
        // But reviewing the listItems values in numbered_tasks_issue_3481.json, it is plausible
        // to see why Tasks might have created them.
        expect(printRoots(tasks)).toMatchInlineSnapshot(`
            "- [ ] 1. #task Task 1 in 'numbered_tasks_issue_3481' : Task
                - [ ] 1. #task Task 1 in 'numbered_tasks_issue_3481' : ListItem
            - [ ] 2 #task Task 2 in 'numbered_tasks_issue_3481' : Task
            - [ ] 3) #task Task 3 in 'numbered_tasks_issue_3481' : Task
                - [ ] 3) #task Task 3 in 'numbered_tasks_issue_3481' : ListItem
            - [ ] 4 - #task Task 4 in 'numbered_tasks_issue_3481' : Task
            - [ ] 5: #task Task 5 in 'numbered_tasks_issue_3481' : Task
            - [ ] (6) #task Task 6 in 'numbered_tasks_issue_3481' : Task
            "
        `);
        expect(tasks.length).toEqual(6);
    });

    it('should read one parent and one child task', () => {
        const { data, tasks } = getMockDataAndReadTasks('inheritance_1parent1child');
        expect(data.fileContents).toMatchInlineSnapshot(`
            "- [ ] #task parent
                - [ ] #task child
            "
        `);

        expect(tasks.length).toEqual(2);

        const [parent, child] = tasks;

        testRootAndChildren(parent, [child]);
    });

    it('should read one parent and two children task', () => {
        const { data, tasks } = getMockDataAndReadTasks('inheritance_1parent2children');
        expect(data.fileContents).toMatchInlineSnapshot(`
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
        const { data, tasks } = getMockDataAndReadTasks('inheritance_1parent2children1grandchild');
        expect(data.fileContents).toMatchInlineSnapshot(`
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
        const { data, tasks } = getMockDataAndReadTasks('inheritance_1parent2children2grandchildren');
        expect(data.fileContents).toMatchInlineSnapshot(`
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
        const { data, tasks } = getMockDataAndReadTasks('inheritance_1parent2children2grandchildren1sibling');
        expect(data.fileContents).toMatchInlineSnapshot(`
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
        const { data, tasks } = getMockDataAndReadTasks('inheritance_1parent2children1sibling');
        expect(data.fileContents).toMatchInlineSnapshot(`
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
        const { data, tasks } = getMockDataAndReadTasks('inheritance_1parent1child1sibling_emptystring');
        expect(data.fileContents).toMatchInlineSnapshot(`
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
        const { data, tasks } = getMockDataAndReadTasks('inheritance_1parent1child1newroot_after_header');
        expect(data.fileContents).toMatchInlineSnapshot(`
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
        const { data, tasks } = getMockDataAndReadTasks(
            'inheritance_1parent2children2grandchildren1sibling_start_with_heading',
        );
        expect(data.fileContents).toMatchInlineSnapshot(`
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
        const { data, tasks } = getMockDataAndReadTasks('inheritance_listitem_task_siblings');
        expect(data.fileContents).toMatchInlineSnapshot(`
            "- list item
            - [ ] task
            "
        `);

        expect(tasks.length).toEqual(1);

        const [task] = tasks;

        testRootAndChildren(task, []);
    });

    it('should read child task and parent listItem', () => {
        const { data, tasks } = getMockDataAndReadTasks('inheritance_listitem_task');
        expect(data.fileContents).toMatchInlineSnapshot(`
            "- parent list item
                - [ ] child task
            "
        `);

        expect(tasks.length).toEqual(1);

        expect(printRoots(tasks)).toMatchInlineSnapshot(`
            "- parent list item : ListItem
                - [ ] child task : Task
            "
        `);
    });

    it('should read grandchild task under parent and child listItem', () => {
        const { data, tasks } = getMockDataAndReadTasks('inheritance_listitem_listitem_task');
        expect(data.fileContents).toMatchInlineSnapshot(`
            "- parent list item
                - child list item
                    - [ ] grandchild task
            "
        `);

        expect(tasks.length).toEqual(1);

        expect(printRoots(tasks)).toMatchInlineSnapshot(`
            "- parent list item : ListItem
                - child list item : ListItem
                    - [ ] grandchild task : Task
            "
        `);
    });

    it('should read 2 roots with grandchild task under parent and child listItem', () => {
        const { data, tasks } = getMockDataAndReadTasks('inheritance_2roots_listitem_listitem_task');
        expect(data.fileContents).toMatchInlineSnapshot(`
            "- parent list item 1
                - child list item 1
                    - [ ] grandchild task 1

            - parent list item 2
                - child list item 2
                    - [ ] grandchild task 2
            "
        `);

        expect(tasks.length).toEqual(2);

        expect(printRoots(tasks)).toMatchInlineSnapshot(`
            "- parent list item 1 : ListItem
                - child list item 1 : ListItem
                    - [ ] grandchild task 1 : Task
            - parent list item 2 : ListItem
                - child list item 2 : ListItem
                    - [ ] grandchild task 2 : Task
            "
        `);
    });

    it('should read parent task and child listItem', () => {
        const { data, tasks } = getMockDataAndReadTasks('inheritance_task_listitem');
        expect(data.fileContents).toMatchInlineSnapshot(`
            "- [ ] parent task
                - child list item
            "
        `);

        expect(tasks.length).toEqual(1);

        expect(printRoots(tasks)).toMatchInlineSnapshot(`
            "- [ ] parent task : Task
                - child list item : ListItem
            "
        `);
    });

    it('should read parent task, child listItem and grandchild task', () => {
        const { data, tasks } = getMockDataAndReadTasks('inheritance_task_listitem_task');
        expect(data.fileContents).toMatchInlineSnapshot(`
            "- [ ] parent task
                - child list item
                    - [ ] grandchild task
            "
        `);

        expect(tasks.length).toEqual(2);

        expect(printRoots(tasks)).toMatchInlineSnapshot(`
            "- [ ] parent task : Task
                - child list item : ListItem
                    - [ ] grandchild task : Task
            "
        `);
    });

    it('should read parent task, two child listItems and 3 grandchild tasks', () => {
        const { data, tasks } = getMockDataAndReadTasks('inheritance_task_2listitem_3task');
        expect(data.fileContents).toMatchInlineSnapshot(`
            "- [ ] parent task
                - child list item 1
                    - [ ] grandchild task 1
                    - [ ] grandchild task 2
                - child list item 2
                    - [ ] grandchild task 3
            "
        `);

        expect(tasks.length).toEqual(4);

        expect(printRoots(tasks)).toMatchInlineSnapshot(`
            "- [ ] parent task : Task
                - child list item 1 : ListItem
                    - [ ] grandchild task 1 : Task
                    - [ ] grandchild task 2 : Task
                - child list item 2 : ListItem
                    - [ ] grandchild task 3 : Task
            "
        `);
    });

    it('should read parent task with mixed children', () => {
        const { data, tasks } = getMockDataAndReadTasks('inheritance_task_mixed_children');
        expect(data.fileContents).toMatchInlineSnapshot(`
            "- [ ] parent task
                - [ ] child task 1
                - child list item 1
                - [ ] child task 2
            "
        `);

        expect(tasks.length).toEqual(3);

        expect(printRoots(tasks)).toMatchInlineSnapshot(`
            "- [ ] parent task : Task
                - [ ] child task 1 : Task
                - child list item 1 : ListItem
                - [ ] child task 2 : Task
            "
        `);
    });

    it('should read parent task and child list item with mixed children', () => {
        const { data, tasks } = getMockDataAndReadTasks('inheritance_task_listitem_mixed_grandchildren');
        expect(data.fileContents).toMatchInlineSnapshot(`
            "- [ ] parent task
                - child list item
                    - grandchild list item 1
                    - [ ] grandchild task
                    - grandchild list item 2
            "
        `);

        expect(tasks.length).toEqual(2);

        expect(printRoots(tasks)).toMatchInlineSnapshot(`
            "- [ ] parent task : Task
                - child list item : ListItem
                    - grandchild list item 1 : ListItem
                    - [ ] grandchild task : Task
                    - grandchild list item 2 : ListItem
            "
        `);
    });

    it('should read non task check box when global filter is enabled', () => {
        GlobalFilter.getInstance().set('#task');

        const { data, tasks } = getMockDataAndReadTasks('inheritance_non_task_child');
        expect(data.fileContents).toMatchInlineSnapshot(`
            "-  [ ] #task task parent
                - [ ] #task task child
                - [ ] non-task child
                - [x] non-task child status x
                - list item child

            \`\`\`tasks
            filename includes {{query.file.filename}}
            show tree
            \`\`\`
            "
        `);

        expect(tasks.length).toEqual(2);

        expect(printRoots(tasks)).toMatchInlineSnapshot(`
            "-  [ ] #task task parent : Task
                - [ ] #task task child : Task
                - [ ] non-task child : ListItem
                - [x] non-task child status x : ListItem
                - list item child : ListItem
            "
        `);

        const task = tasks[0];
        expect(task.taskLocation.lineNumber).toEqual(0);
        expect(task.children[0].taskLocation.lineNumber).toEqual(1);
        expect(task.children[1].taskLocation.lineNumber).toEqual(2);
        expect(task.children[2].taskLocation.lineNumber).toEqual(3);
    });

    it('callout', () => {
        const { data, tasks } = getMockDataAndReadTasks('callout');
        expect(data.fileContents).toMatchInlineSnapshot(`
            "# callout

            > [!todo]
            > - [ ] #task Task in 'callout'
            >     - [ ] #task Task indented in 'callout'

            \`\`\`tasks
            not done
            path includes {{query.file.path}}
            \`\`\`
            "
        `);
        expect(printRoots(tasks)).toMatchInlineSnapshot(`
            "> - [ ] #task Task in 'callout' : Task
                >     - [ ] #task Task indented in 'callout' : Task
            "
        `);
        expect(tasks.length).toEqual(2);
    });

    it('callout_custom', () => {
        const { data, tasks } = getMockDataAndReadTasks('callout_custom');
        expect(data.fileContents).toMatchInlineSnapshot(`
            "# callout_custom

            > [!callout_custom]
            > - [ ] #task Task in 'callout_custom'
            >     - [ ] #task Task indented in 'callout_custom'

            \`\`\`tasks
            not done
            path includes {{query.file.path}}
            \`\`\`
            "
        `);
        expect(printRoots(tasks)).toMatchInlineSnapshot(`
            "> - [ ] #task Task in 'callout_custom' : Task
                >     - [ ] #task Task indented in 'callout_custom' : Task
            "
        `);
        expect(tasks.length).toEqual(2);
    });

    it('callout_labelled', () => {
        // begin-snippet: getMockDataAndReadTasks
        const { data, tasks } = getMockDataAndReadTasks('callout_labelled');
        // end-snippet
        expect(data.fileContents).toMatchInlineSnapshot(`
            "# callout_labelled

            > [!todo] callout_labelled
            > - [ ] #task Task in 'callout_labelled'
            >     - [ ] #task Task indented in 'callout_labelled'

            \`\`\`tasks
            not done
            path includes {{query.file.path}}
            \`\`\`
            "
        `);
        expect(printRoots(tasks)).toMatchInlineSnapshot(`
            "> - [ ] #task Task in 'callout_labelled' : Task
                >     - [ ] #task Task indented in 'callout_labelled' : Task
            "
        `);
        expect(tasks.length).toEqual(2);
    });

    it('callouts_nested_issue_2890_unlabelled', () => {
        const { data, tasks } = getMockDataAndReadTasks('callouts_nested_issue_2890_unlabelled');
        expect(data.fileContents).toMatchInlineSnapshot(`
            " > [!Calendar]+
             >> [!Check]+
             >>> [!Attention]+
             >>> Some stuff goes here
             >>> - [ ] #task Correction1
             >>> - [ ] #task Correction2
             >>> - [ ] #task Correction3
             >>> - [ ] #task Correction4

            \`\`\`tasks
            not done
            path includes {{query.file.path}}
            \`\`\`
            "
        `);
        expect(printRoots(tasks)).toMatchInlineSnapshot(`
            ">>> - [ ] #task Correction1 : Task
            >>> - [ ] #task Correction2 : Task
            >>> - [ ] #task Correction3 : Task
            >>> - [ ] #task Correction4 : Task
            "
        `);
        expect(tasks.length).toEqual(4);
    });

    it('callouts_nested_issue_2890_labelled', () => {
        const { data, tasks } = getMockDataAndReadTasks('callouts_nested_issue_2890_labelled');
        expect(data.fileContents).toMatchInlineSnapshot(`
            " > [!Calendar]+ MONTH
             >> [!Check]+ GROUP
             >>> [!Attention]+ Correction TITLE
             >>> Some stuff goes here
             >>> - [ ] #task Correction1
             >>> - [ ] #task Correction2
             >>> - [ ] #task Correction3
             >>> - [ ] #task Correction4

            \`\`\`tasks
            not done
            path includes {{query.file.path}}
            \`\`\`
            "
        `);
        expect(printRoots(tasks)).toMatchInlineSnapshot(`
            ">>> - [ ] #task Correction1 : Task
            >>> - [ ] #task Correction2 : Task
            >>> - [ ] #task Correction3 : Task
            >>> - [ ] #task Correction4 : Task
            "
        `);
        expect(tasks.length).toEqual(4);
    });
});

describe('accessing links in file', function () {
    describe('explore accessing links in file "links_everywhere.md"', () => {
        const { data, tasks } = getMockDataAndReadTasks('links_everywhere');
        expect(tasks.length).toEqual(1);
        const task = tasks[0];

        const cachedMetadata: CachedMetadata = task.file.cachedMetadata;

        // Usability note:
        //    These tests are for visualising how Obsidian caches link properties.
        //    See TasksFile and ListItem classes for accessing links via the Link class in Tasks cvode

        it('see source', () => {
            expect(data.fileContents).toMatchInlineSnapshot(`
                "---
                link-in-frontmatter: "[[link_in_yaml]]"
                link-in-frontmatter-to-heading: "[[#A link in a link_in_heading]]"
                ---
                # links_everywhere

                A link in the file body: [[link_in_file_body]]

                ## A link in a [[link_in_heading]]

                - [ ] #task Task in 'links_everywhere' - a link on the task: [[link_in_task_wikilink]]
                "
            `);
        });

        it('visualise raw links in frontmatter', () => {
            const frontMatterLinks = cachedMetadata['frontmatterLinks'];
            expect(frontMatterLinks).toBeDefined();

            const firstFrontMatterLink = frontMatterLinks![0];
            expect(firstFrontMatterLink.original).toEqual('[[link_in_yaml]]');
            expect(firstFrontMatterLink).toMatchInlineSnapshot(`
                            {
                              "displayText": "link_in_yaml",
                              "key": "link-in-frontmatter",
                              "link": "link_in_yaml",
                              "original": "[[link_in_yaml]]",
                            }
                    `);
        });

        it('visualise raw links in file body', () => {
            const fileBodyLinks = cachedMetadata.links;

            const originalLinkText = fileBodyLinks?.map((link) => link.original).join('\n');
            expect(originalLinkText).toMatchInlineSnapshot(`
                            "[[link_in_file_body]]
                            [[link_in_heading]]
                            [[link_in_task_wikilink]]"
                    `);

            const firstFileBodyLink = fileBodyLinks![0];
            expect(firstFileBodyLink).toMatchInlineSnapshot(`
                {
                  "displayText": "link_in_file_body",
                  "link": "link_in_file_body",
                  "original": "[[link_in_file_body]]",
                  "position": {
                    "end": {
                      "col": 46,
                      "line": 6,
                      "offset": 181,
                    },
                    "start": {
                      "col": 25,
                      "line": 6,
                      "offset": 160,
                    },
                  },
                }
            `);
        });

        it('visualise raw links in task line', () => {
            const fileBodyLinks = cachedMetadata.links;
            const linksOnTask = fileBodyLinks?.filter((link) => link.position.start.line === task.lineNumber);

            expect(linksOnTask).toBeDefined();
            expect(linksOnTask?.length).toEqual(1);

            const firstLinkOnTask = linksOnTask![0];
            expect(firstLinkOnTask.original).toEqual('[[link_in_task_wikilink]]');
            expect(firstLinkOnTask).toMatchInlineSnapshot(`
                {
                  "displayText": "link_in_task_wikilink",
                  "link": "link_in_task_wikilink",
                  "original": "[[link_in_task_wikilink]]",
                  "position": {
                    "end": {
                      "col": 86,
                      "line": 10,
                      "offset": 305,
                    },
                    "start": {
                      "col": 61,
                      "line": 10,
                      "offset": 280,
                    },
                  },
                }
            `);
        });
    });
});

describe('all mock files', () => {
    it.each(AllMockDataNames)(
        'should create valid TasksFile for all mock files: "%s"',
        (testDataName: MockDataName) => {
            const tasksFile = getTasksFileFromMockData(testDataName);

            const frontmatter = tasksFile.frontmatter;
            expect(frontmatter).not.toBeUndefined();
            expect(frontmatter).not.toBeNull();

            // We always define frontmatter.tags, even if there was no frontmatter,
            // to simplify a common user operation in custom filters.
            expect(frontmatter.tags).not.toBeUndefined();
            expect(frontmatter.tags).not.toBeNull();
            expect(frontmatter.tags).not.toContain(null);
            expect(frontmatter.tags).not.toContain(undefined);
        },
    );

    it.each(listPathAndData(AllMockDataNames))(
        'should be able to read tasks from all mock files: "%s"',
        (path: string, testDataName: MockDataName) => {
            const tasks = readTasksFromSimulatedFile(testDataName);
            const files_without_tasks = [
                'Test Data/docs_sample_for_explain_query_file_defaults.md',
                'Test Data/non_tasks.md',
                'Test Data/numbered_tasks_issue_3481_searches.md',
            ];
            if (files_without_tasks.includes(path)) {
                expect(tasks.length).toEqual(0);
            } else {
                expect(tasks.length).toBeGreaterThan(0);
            }
        },
    );
});
