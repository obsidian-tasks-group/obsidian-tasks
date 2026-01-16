/**
 * @jest-environment jsdom
 */

import { MockDataLoader } from '../TestingTools/MockDataLoader';
import { findInsertionPoint } from '../../src/EditFiles/FindInsertionPoint';
import { findInsertionPointForTesting } from './MoveTaskTestHelpers';

describe('findInsertionPoint', () => {
    describe('appendToEnd is true', () => {
        it('should always return end of file when appendToEnd is true', () => {
            const fileLines = ['# Heading', '- [ ] Task 1', '- [ ] Task 2', ''];
            const result = findInsertionPointForTesting(fileLines, null, null, true);
            expect(result).toBe(fileLines.length);
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

            const fileLines = simulatedFile.fileContents.split('\n');
            const result = findInsertionPoint(fileLines, simulatedFile.cachedMetadata, null, false);

            // Should insert after line 1 (the last task before first heading)
            expect(result).toBe(2);
        });

        it('should append to end if no tasks before first heading', () => {
            const fileLines = ['# Heading 1', '- [ ] Task in heading', ''];
            const headings = [{ heading: 'Heading 1', position: { start: { line: 0 } } }];
            const listItems = [{ task: 'x', position: { start: { line: 1 } } }];

            const result = findInsertionPointForTesting(fileLines, { headings, listItems }, null, false);
            expect(result).toBe(fileLines.length);
        });
    });

    describe('with target section header', () => {
        it('should insert after last task in target section', () => {
            const fileLines = [
                '# Section 1',
                '- [ ] Task 1 in S1',
                '- [ ] Task 2 in S1',
                '',
                '# Section 2',
                '- [ ] Task 1 in S2',
            ];
            const headings = [
                { heading: 'Section 1', position: { start: { line: 0 } } },
                { heading: 'Section 2', position: { start: { line: 4 } } },
            ];
            const listItems = [
                { task: 'x', position: { start: { line: 1 } } },
                { task: 'x', position: { start: { line: 2 } } },
                { task: 'x', position: { start: { line: 5 } } },
            ];

            const result = findInsertionPointForTesting(fileLines, { headings, listItems }, 'Section 1', false);
            // Should insert after line 2 (last task in Section 1)
            expect(result).toBe(3);
        });

        it('should insert right after heading if section has no tasks', () => {
            const fileLines = ['# Section 1', '', '# Section 2', '- [ ] Task in S2'];
            const headings = [
                { heading: 'Section 1', position: { start: { line: 0 } } },
                { heading: 'Section 2', position: { start: { line: 2 } } },
            ];
            const listItems = [{ task: 'x', position: { start: { line: 3 } } }];

            const result = findInsertionPointForTesting(fileLines, { headings, listItems }, 'Section 1', false);
            // Should insert right after the Section 1 heading (line 0)
            expect(result).toBe(1);
        });

        it('should append to end if target heading not found', () => {
            const fileLines = ['# Section 1', '- [ ] Task'];
            const headings = [{ heading: 'Section 1', position: { start: { line: 0 } } }];
            const listItems = [{ task: 'x', position: { start: { line: 1 } } }];

            const result = findInsertionPointForTesting(
                fileLines,
                { headings, listItems },
                'Non-existent Section',
                false,
            );
            expect(result).toBe(fileLines.length);
        });
    });

    describe('edge cases', () => {
        it('should handle empty file', () => {
            const fileLines: string[] = [];
            const result = findInsertionPointForTesting(fileLines, null, null, false);
            expect(result).toBe(0);
        });

        it('should handle file with no tasks', () => {
            const fileLines = ['# Just a heading', '', 'Some text'];
            const headings = [{ heading: 'Just a heading', position: { start: { line: 0 } } }];

            const result = findInsertionPointForTesting(fileLines, { headings, listItems: [] }, null, false);
            expect(result).toBe(fileLines.length);
        });

        it('should handle file with no headings', () => {
            const fileLines = ['- [ ] Task 1', '- [ ] Task 2', ''];
            const listItems = [
                { task: 'x', position: { start: { line: 0 } } },
                { task: 'x', position: { start: { line: 1 } } },
            ];

            const result = findInsertionPointForTesting(fileLines, { headings: [], listItems }, null, false);
            // With no headings, all tasks are "before first heading"
            expect(result).toBe(2);
        });
    });
});
