/**
 * @jest-environment jsdom
 */

import { MockDataLoader } from '../TestingTools/MockDataLoader';
import { findInsertionPoint } from '../../src/EditFiles/FindInsertionPoint';
import type { SimulatedFile } from '../Obsidian/SimulatedFile';

function insertionPointFor(
    simulatedFile: SimulatedFile,
    targetSectionHeader: string | null,
    appendToEnd: boolean,
): string {
    const fileLines = simulatedFile.fileContents.split('\n');
    const result = findInsertionPoint(fileLines, simulatedFile.cachedMetadata, targetSectionHeader, appendToEnd);
    return visualiseInsertion(fileLines, result);
}

function visualiseInsertion(lines: string[], insertionIndex: number): string {
    const result: string[] = [];

    for (let i = 0; i <= lines.length; i++) {
        if (i === insertionIndex) {
            result.push('==> insert here');
        }
        if (i < lines.length) {
            result.push(lines[i]);
        }
    }

    return result.join('\n');
}

describe('findInsertionPoint', () => {
    describe('appendToEnd is true', () => {
        it('should always return end of file when appendToEnd is true', () => {
            const fileLines = ['# Heading', '- [ ] Task 1', '- [ ] Task 2', ''];
            expect(fileLines.join('\n')).toMatchInlineSnapshot(`
                "# Heading
                - [ ] Task 1
                - [ ] Task 2
                "
            `);

            const result = findInsertionPoint(fileLines, null, null, true);

            expect(visualiseInsertion(fileLines, result)).toMatchInlineSnapshot(`
                "# Heading
                - [ ] Task 1
                - [ ] Task 2

                ==> insert here"
            `);
        });
    });

    describe('no target section header (null)', () => {
        it('should insert after last task before first heading', () => {
            const simulatedFile = MockDataLoader.get('editing_tests_tasks_before_first_heading');

            // The snapshot makes the test file contents visible, so the test is easier to understand:
            expect(simulatedFile.fileContents).toMatchInlineSnapshot(`
                "- [ ] Task before heading
                - [ ] Another task

                # Heading 1
                - [ ] Task in heading
                "
            `);

            // Should insert after line 1 (the last task before first heading)
            expect(insertionPointFor(simulatedFile, null, false)).toMatchInlineSnapshot(`
                "- [ ] Task before heading
                - [ ] Another task
                ==> insert here

                # Heading 1
                - [ ] Task in heading
                "
            `);
        });

        it('should append to end if no tasks before first heading', () => {
            const simulatedFile = MockDataLoader.get('editing_tasks_no_tasks_before_first_heading');
            expect(simulatedFile.fileContents).toMatchInlineSnapshot(`
                "# Heading 1
                - [ ] Task in heading
                "
            `);

            expect(insertionPointFor(simulatedFile, null, false)).toMatchInlineSnapshot(`
                "# Heading 1
                - [ ] Task in heading

                ==> insert here"
            `);
        });
    });

    describe('with target section header', () => {
        it('should insert after last task in target section', () => {
            const simulatedFile = MockDataLoader.get('editing_tasks_two_sections');
            expect(simulatedFile.fileContents).toMatchInlineSnapshot(`
                "# Section 1
                - [ ] Task 1 in S1
                - [ ] Task 2 in S1

                # Section 2
                - [ ] Task 1 in S2
                "
            `);

            // Should insert after line 2 (last task in Section 1)
            expect(insertionPointFor(simulatedFile, 'Section 1', false)).toMatchInlineSnapshot(`
                "# Section 1
                - [ ] Task 1 in S1
                - [ ] Task 2 in S1
                ==> insert here

                # Section 2
                - [ ] Task 1 in S2
                "
            `);
        });

        it('should insert after last task in target section even if list items are present', () => {
            const simulatedFile = MockDataLoader.get('editing_tasks_mix_of_list_items_and_tasks_with_heading');
            expect(simulatedFile.fileContents).toMatchInlineSnapshot(`
                "# Heading

                - List item 1
                - [ ] #task Task 1
                - List item 2
                - [ ] #task Task 2
                - List item 3
                "
            `);

            expect(insertionPointFor(simulatedFile, 'Heading', false)).toMatchInlineSnapshot(`
                "# Heading

                - List item 1
                - [ ] #task Task 1
                - List item 2
                - [ ] #task Task 2
                ==> insert here
                - List item 3
                "
            `);
        });

        it.failing('should not split a task from its nested list item', () => {
            const simulatedFile = MockDataLoader.get('editing_tasks_task_with_nested_list_item');
            expect(simulatedFile.fileContents).toMatchInlineSnapshot(`
                "# Heading

                - [ ] #task Task 1
                    - Task 1's nested list item
                "
            `);

            // TODO This is an error. It should not insert the line in the middle of an existing task's children.
            //      The likely fix is to refactor the code so that it uses both:
            //          - listItem.position.start.line
            //          - listItem.position.end.line
            const expected = `# Heading

- [ ] #task Task 1
    - Task 1's nested list item
==> insert here
`;
            // Inline snapshots do not support .failing, so this has to be an explicit toEqual() check until the
            // code is fixed.
            expect(insertionPointFor(simulatedFile, 'Heading', false)).toEqual(expected);
        });

        it.failing('should not split a list item when it contains child tasks or list items', () => {
            const simulatedFile = MockDataLoader.get('editing_tasks_list_item_with_nested_task_and_list_item');
            expect(simulatedFile.fileContents).toMatchInlineSnapshot(`
                "# Heading

                - List item 1
                    - [ ] #task List item 1's nested task
                        - List item 1's nested task's nested list item
                "
            `);

            // TODO This is also an error, as the task will be inserted in the middle of list item's children.
            //      The last task is found correctly.
            //      The likely fix will require finding the parent list item or task of the last task, and
            //      then using the last line of that parent item.

            const expected = `# Heading

- List item 1
    - [ ] #task List item 1's nested task
        - List item 1's nested task's nested list item
==> insert here
`;
            // Inline snapshots do not support .failing, so this has to be an explicit toEqual() check until the
            // code is fixed.
            expect(insertionPointFor(simulatedFile, 'Heading', false)).toEqual(expected);
        });

        it('should insert after last task in target section, even if multiple lists in the heading', () => {
            const simulatedFile = MockDataLoader.get('editing_tasks_heading_with_multiple_task_lists');
            expect(simulatedFile.fileContents).toMatchInlineSnapshot(`
                "# heading with multiple task lists

                - [ ] #task Task in 'editing_tasks_heading_with_multiple_task_lists' 1a
                - [ ] #task Task in 'editing_tasks_heading_with_multiple_task_lists' 1b

                Not a task

                - [ ] #task Task in 'editing_tasks_heading_with_multiple_task_lists' 2a
                - [ ] #task Task in 'editing_tasks_heading_with_multiple_task_lists' 2b
                "
            `);

            // Should insert after line 2 (last task in Section 1)
            expect(insertionPointFor(simulatedFile, 'heading with multiple task lists', false)).toMatchInlineSnapshot(`
                "# heading with multiple task lists

                - [ ] #task Task in 'editing_tasks_heading_with_multiple_task_lists' 1a
                - [ ] #task Task in 'editing_tasks_heading_with_multiple_task_lists' 1b

                Not a task

                - [ ] #task Task in 'editing_tasks_heading_with_multiple_task_lists' 2a
                - [ ] #task Task in 'editing_tasks_heading_with_multiple_task_lists' 2b
                ==> insert here
                "
            `);
        });

        it('should insert right after heading if section has no tasks', () => {
            const simulatedFile = MockDataLoader.get('editing_tasks_section_has_no_tasks');
            expect(simulatedFile.fileContents).toMatchInlineSnapshot(`
                "# Section 1

                # Section 2
                - [ ] Task in S2
                "
            `);

            // Should insert right after the Section 1 heading (line 0)
            expect(insertionPointFor(simulatedFile, 'Section 1', false)).toMatchInlineSnapshot(`
                "# Section 1
                ==> insert here

                # Section 2
                - [ ] Task in S2
                "
            `);
        });

        it('should append to end if target heading not found', () => {
            const simulatedFile = MockDataLoader.get('editing_tasks_one_heading_one_task');
            expect(simulatedFile.fileContents).toMatchInlineSnapshot(`
                "# Section 1
                - [ ] Task
                "
            `);

            expect(insertionPointFor(simulatedFile, 'Non-existent Section', false)).toMatchInlineSnapshot(`
                "# Section 1
                - [ ] Task

                ==> insert here"
            `);
        });
    });

    describe('edge cases', () => {
        it('should handle empty file', () => {
            const fileLines: string[] = [];
            const result = findInsertionPoint(fileLines, {}, null, false);

            expect(result).toBe(0);
            expect(visualiseInsertion(fileLines, result)).toMatchInlineSnapshot('"==> insert here"');
        });

        it('should handle file with no tasks', () => {
            const simulatedFile = MockDataLoader.get('editing_tasks_one_heading_no_tasks');
            expect(simulatedFile.fileContents).toMatchInlineSnapshot(`
                "# Just a heading

                Some text
                "
            `);

            expect(insertionPointFor(simulatedFile, null, false)).toMatchInlineSnapshot(`
                "# Just a heading

                Some text

                ==> insert here"
            `);
        });

        it('should handle file with no headings', () => {
            const simulatedFile = MockDataLoader.get('editing_tasks_no_headings_two_tasks');
            expect(simulatedFile.fileContents).toMatchInlineSnapshot(`
                "- [ ] Task 1
                - [ ] Task 2
                "
            `);

            // With no headings, all tasks are "before first heading"
            expect(insertionPointFor(simulatedFile, null, false)).toMatchInlineSnapshot(`
                "- [ ] Task 1
                - [ ] Task 2
                ==> insert here
                "
            `);
        });

        describe('adjacent heading lines', () => {
            const simulatedFile = MockDataLoader.get('editing_tasks_three_adjacent_headings');

            // Demonstrate the input
            expect(simulatedFile.fileContents).toMatchInlineSnapshot(`
                "# heading 1
                # heading 2
                # heading 3
                "
            `);

            it('heading 1', () => {
                expect(insertionPointFor(simulatedFile, 'heading 1', false)).toMatchInlineSnapshot(`
                    "# heading 1
                    ==> insert here
                    # heading 2
                    # heading 3
                    "
                `);
            });

            it('heading 2', () => {
                expect(insertionPointFor(simulatedFile, 'heading 2', false)).toMatchInlineSnapshot(`
                    "# heading 1
                    # heading 2
                    ==> insert here
                    # heading 3
                    "
                `);
            });

            it('heading 3', () => {
                expect(insertionPointFor(simulatedFile, 'heading 3', false)).toMatchInlineSnapshot(`
                    "# heading 1
                    # heading 2
                    # heading 3
                    ==> insert here
                    "
                `);
            });

            it('no such heading', () => {
                expect(insertionPointFor(simulatedFile, 'no such heading', false)).toMatchInlineSnapshot(`
                    "# heading 1
                    # heading 2
                    # heading 3

                    ==> insert here"
                `);
            });
        });
    });
});
