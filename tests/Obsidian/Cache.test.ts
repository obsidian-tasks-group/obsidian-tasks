/**
 * @jest-environment jsdom
 */
import moment from 'moment/moment';
import type { CachedMetadata } from 'obsidian';
import type { ListItem } from '../../src/Task/ListItem';
import { getTasksFileFromMockData, listPathAndData } from '../TestingTools/MockDataHelpers';
import inheritance_1parent1child from './__test_data__/inheritance_1parent1child.json';
import inheritance_1parent1child1newroot_after_header from './__test_data__/inheritance_1parent1child1newroot_after_header.json';
import inheritance_1parent1child1sibling_emptystring from './__test_data__/inheritance_1parent1child1sibling_emptystring.json';
import inheritance_1parent2children from './__test_data__/inheritance_1parent2children.json';
import inheritance_1parent2children1grandchild from './__test_data__/inheritance_1parent2children1grandchild.json';
import inheritance_1parent2children1sibling from './__test_data__/inheritance_1parent2children1sibling.json';
import inheritance_1parent2children2grandchildren from './__test_data__/inheritance_1parent2children2grandchildren.json';
import inheritance_1parent2children2grandchildren1sibling from './__test_data__/inheritance_1parent2children2grandchildren1sibling.json';
import inheritance_1parent2children2grandchildren1sibling_start_with_heading from './__test_data__/inheritance_1parent2children2grandchildren1sibling_start_with_heading.json';
import inheritance_2roots_listitem_listitem_task from './__test_data__/inheritance_2roots_listitem_listitem_task.json';
import inheritance_2siblings from './__test_data__/inheritance_2siblings.json';
import inheritance_listitem_listitem_task from './__test_data__/inheritance_listitem_listitem_task.json';
import inheritance_listitem_task from './__test_data__/inheritance_listitem_task.json';
import inheritance_listitem_task_siblings from './__test_data__/inheritance_listitem_task_siblings.json';
import inheritance_task_2listitem_3task from './__test_data__/inheritance_task_2listitem_3task.json';
import inheritance_task_listitem from './__test_data__/inheritance_task_listitem.json';
import inheritance_task_listitem_mixed_grandchildren from './__test_data__/inheritance_task_listitem_mixed_grandchildren.json';
import inheritance_task_listitem_task from './__test_data__/inheritance_task_listitem_task.json';
import inheritance_task_mixed_children from './__test_data__/inheritance_task_mixed_children.json';
import one_task from './__test_data__/one_task.json';
import callouts_nested_issue_2890_labelled from './__test_data__/callouts_nested_issue_2890_labelled.json';
import callout from './__test_data__/callout.json';
import callout_labelled from './__test_data__/callout_labelled.json';
import callout_custom from './__test_data__/callout_custom.json';
import callouts_nested_issue_2890_unlabelled from './__test_data__/callouts_nested_issue_2890_unlabelled.json';
import links_everywhere from './__test_data__/links_everywhere.json';
import { allCacheSampleData } from './AllCacheSampleData';
import { type SimulatedFile, readTasksFromSimulatedFile } from './SimulatedFile';

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

        expect(printRoots(tasks)).toMatchInlineSnapshot(`
            "- parent list item : ListItem
                - [ ] child task : Task
            "
        `);
    });

    it('should read grandchild task under parent and child listItem', () => {
        const tasks = readTasksFromSimulatedFile(inheritance_listitem_listitem_task);
        expect(inheritance_listitem_listitem_task.fileContents).toMatchInlineSnapshot(`
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
        const tasks = readTasksFromSimulatedFile(inheritance_2roots_listitem_listitem_task);
        expect(inheritance_2roots_listitem_listitem_task.fileContents).toMatchInlineSnapshot(`
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
        const tasks = readTasksFromSimulatedFile(inheritance_task_listitem);
        expect(inheritance_task_listitem.fileContents).toMatchInlineSnapshot(`
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
        const tasks = readTasksFromSimulatedFile(inheritance_task_listitem_task);
        expect(inheritance_task_listitem_task.fileContents).toMatchInlineSnapshot(`
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
        const tasks = readTasksFromSimulatedFile(inheritance_task_mixed_children);
        expect(inheritance_task_mixed_children.fileContents).toMatchInlineSnapshot(`
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
        const tasks = readTasksFromSimulatedFile(inheritance_task_listitem_mixed_grandchildren);
        expect(inheritance_task_listitem_mixed_grandchildren.fileContents).toMatchInlineSnapshot(`
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

    it('callout', () => {
        const tasks = readTasksFromSimulatedFile(callout);
        expect(callout.fileContents).toMatchInlineSnapshot(`
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
        const tasks = readTasksFromSimulatedFile(callout_custom);
        expect(callout_custom.fileContents).toMatchInlineSnapshot(`
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
        const tasks = readTasksFromSimulatedFile(callout_labelled);
        expect(callout_labelled.fileContents).toMatchInlineSnapshot(`
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
        const tasks = readTasksFromSimulatedFile(callouts_nested_issue_2890_unlabelled);
        expect(callouts_nested_issue_2890_unlabelled.fileContents).toMatchInlineSnapshot(`
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
        const tasks = readTasksFromSimulatedFile(callouts_nested_issue_2890_labelled);
        expect(callouts_nested_issue_2890_labelled.fileContents).toMatchInlineSnapshot(`
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
        const data = links_everywhere as unknown as SimulatedFile;

        const tasks = readTasksFromSimulatedFile(data);
        expect(tasks.length).toEqual(1);
        const task = tasks[0];

        const cachedMetadata: CachedMetadata = task.file.cachedMetadata;

        /**
         * I am thinking of the following, to evantually make links accessible to users.
         * 1. Provide a class or interface called Link, with fields:
         *      - displayText, e.g. "link_in_yaml"
         *      - link, e.g. "link_in_yaml"
         *      - original, e.g. "[[link_in_yaml]]"
         * 2. Add some getters that construct the relevant Link objects from cached metadata on demand, such as:
         *      - task.file.linksInBody
         *      - task.file.linksInFrontMatter
         *      - task.file.allLinks
         *      - task.links
         * 3. Consider the vocabulary - some dataview users talk about inlines and outlinks.
         *    The above are all outlinks - but do we want to name them as such, to prepare
         *    for if or when inlinks are also supported?
         */

        it('see source', () => {
            expect(data.fileContents).toMatchInlineSnapshot(`
                            "---
                            link-in-frontmatter: "[[link_in_yaml]]"
                            ---
                            # links_everywhere

                            A link in the file body: [[link_in_file_body]]

                            ## A link in a [[link_in_heading]]

                            - [ ] #task Task in 'links_everywhere' - a link on the task: [[link_in_task_wikilink]]
                            "
                    `);
        });

        it('should access links in frontmatter', () => {
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

        it('should access links in file body', () => {
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
                                  "line": 5,
                                  "offset": 114,
                                },
                                "start": {
                                  "col": 25,
                                  "line": 5,
                                  "offset": 93,
                                },
                              },
                            }
                    `);
        });

        it('should access links in task line', () => {
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
                      "line": 9,
                      "offset": 238,
                    },
                    "start": {
                      "col": 61,
                      "line": 9,
                      "offset": 213,
                    },
                  },
                }
            `);
        });
    });
});

describe('all mock files', () => {
    const files: any = allCacheSampleData();

    it.each(listPathAndData(files))(
        'should create valid TasksFile for all mock files: "%s"',
        (_path: string, file: any) => {
            const tasksFile = getTasksFileFromMockData(file);

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

    it.each(listPathAndData(files))(
        'should be able to read tasks from all mock files: "%s"',
        (path: string, file: any) => {
            const tasks = readTasksFromSimulatedFile(file);
            if (path === 'Test Data/non_tasks.md') {
                expect(tasks.length).toEqual(0);
            } else {
                expect(tasks.length).toBeGreaterThan(0);
            }
        },
    );
});
