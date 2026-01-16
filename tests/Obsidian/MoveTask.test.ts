/**
 * @jest-environment jsdom
 */

import { MockDataLoader } from '../TestingTools/MockDataLoader';
import { findInsertionPoint } from '../../src/EditFiles/FindInsertionPoint';
import type { SimulatedFile } from './SimulatedFile';

function insertionPointFor(simulatedFile: SimulatedFile, targetSectionHeader: null, appendToEnd: boolean): number {
    const fileLines = simulatedFile.fileContents.split('\n');
    return findInsertionPoint(fileLines, simulatedFile.cachedMetadata, targetSectionHeader, appendToEnd);
}

describe('findInsertionPoint', () => {
    describe('appendToEnd is true', () => {
        it('should always return end of file when appendToEnd is true', () => {
            const fileLines = ['# Heading', '- [ ] Task 1', '- [ ] Task 2', ''];

            const fileCache = null;
            const targetSectionHeader = null;
            const appendToEnd = true;
            const result = findInsertionPoint(fileLines, fileCache, targetSectionHeader, appendToEnd);

            expect(result).toBe(4);
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
            expect(insertionPointFor(simulatedFile, null, false)).toEqual(2);
        });

        it('should append to end if no tasks before first heading', () => {
            const simulatedFile = MockDataLoader.get('editing_tasks_no_tasks_before_first_heading');
            expect(simulatedFile.fileContents).toMatchInlineSnapshot(`
                "# Heading 1
                - [ ] Task in heading
                "
            `);

            const fileLines = simulatedFile.fileContents.split('\n');

            const result = findInsertionPoint(fileLines, simulatedFile.cachedMetadata, null, false);
            expect(result).toBe(3);
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
            const fileLines = simulatedFile.fileContents.split('\n');
            const result = findInsertionPoint(fileLines, simulatedFile.cachedMetadata, 'Section 1', false);

            // Should insert after line 2 (last task in Section 1)
            expect(result).toBe(3);
        });

        it('should insert right after heading if section has no tasks', () => {
            const simulatedFile = MockDataLoader.get('editing_tasks_section_has_no_tasks');
            expect(simulatedFile.fileContents).toMatchInlineSnapshot(`
                "# Section 1

                # Section 2
                - [ ] Task in S2
                "
            `);
            const fileLines = simulatedFile.fileContents.split('\n');
            const result = findInsertionPoint(fileLines, simulatedFile.cachedMetadata, 'Section 1', false);

            // Should insert right after the Section 1 heading (line 0)
            expect(result).toBe(1);
        });

        it('should append to end if target heading not found', () => {
            const simulatedFile = MockDataLoader.get('editing_tasks_one_heading_one_task');
            expect(simulatedFile.fileContents).toMatchInlineSnapshot(`
                "# Section 1
                - [ ] Task
                "
            `);
            const fileLines = simulatedFile.fileContents.split('\n');
            const result = findInsertionPoint(fileLines, simulatedFile.cachedMetadata, 'Non-existent Section', false);

            expect(result).toBe(3);
        });
    });

    describe('edge cases', () => {
        it('should handle empty file', () => {
            const fileLines: string[] = [];
            const result = findInsertionPoint(fileLines, {}, null, false);
            expect(result).toBe(0);
        });

        it('should handle file with no tasks', () => {
            const simulatedFile = MockDataLoader.get('editing_tasks_one_heading_no_tasks');
            expect(simulatedFile.fileContents).toMatchInlineSnapshot(`
                "# Just a heading

                Some text
                "
            `);
            const fileLines2 = simulatedFile.fileContents.split('\n');
            const result = findInsertionPoint(fileLines2, simulatedFile.cachedMetadata, null, false);

            expect(result).toBe(4);
        });

        it('should handle file with no headings', () => {
            const simulatedFile = MockDataLoader.get('editing_tasks_no_headings_two_tasks');
            expect(simulatedFile.fileContents).toMatchInlineSnapshot(`
                "- [ ] Task 1
                - [ ] Task 2
                "
            `);
            const fileLines2 = simulatedFile.fileContents.split('\n');
            const result = findInsertionPoint(fileLines2, simulatedFile.cachedMetadata, null, false);

            // With no headings, all tasks are "before first heading"
            expect(result).toBe(2);
        });
    });
});
