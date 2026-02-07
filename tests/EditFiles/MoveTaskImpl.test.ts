/**
 * @jest-environment jsdom
 */

import { moveTaskBetweenFiles, moveTaskWithinSameFile } from '../../src/EditFiles/MoveTaskImpl';

describe('moveTaskWithinSameFile', () => {
    describe('moving task forward (to later position)', () => {
        it('should move single task forward', () => {
            const lines = ['# Heading 1', '- [ ] Task to move', '# Heading 2', '- [ ] Other task'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "# Heading 1
                - [ ] Task to move
                # Heading 2
                - [ ] Other task"
            `);

            // Move task from line 1 to line 3 (after "# Heading 2")
            const result = moveTaskWithinSameFile(lines, 1, 3, ['- [ ] Task to move']);

            expect(result.join('\n')).toMatchInlineSnapshot(`
                "# Heading 1
                # Heading 2
                - [ ] Task to move
                - [ ] Other task"
            `);
        });

        it('should move task with children forward', () => {
            const lines = [
                '# Heading 1',
                '- [ ] Task to move',
                '    - Child 1',
                '    - Child 2',
                '# Heading 2',
                '- [ ] Other task',
            ];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "# Heading 1
                - [ ] Task to move
                    - Child 1
                    - Child 2
                # Heading 2
                - [ ] Other task"
            `);

            // Move task + 2 children from line 1 to line 5 (after "# Heading 2")
            const result = moveTaskWithinSameFile(lines, 1, 5, [
                '- [ ] Task to move',
                '    - Child 1',
                '    - Child 2',
            ]);

            expect(result.join('\n')).toMatchInlineSnapshot(`
                "# Heading 1
                # Heading 2
                - [ ] Task to move
                    - Child 1
                    - Child 2
                - [ ] Other task"
            `);
        });

        it('should move task to end of file', () => {
            const lines = ['- [ ] Task to move', '# Heading', '- [ ] Other task'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "- [ ] Task to move
                # Heading
                - [ ] Other task"
            `);

            const result = moveTaskWithinSameFile(lines, 0, 3, ['- [ ] Task to move']);

            expect(result.join('\n')).toMatchInlineSnapshot(`
                "# Heading
                - [ ] Other task
                - [ ] Task to move"
            `);
        });
    });

    describe('moving task backward (to earlier position)', () => {
        it('should move single task backward', () => {
            const lines = ['# Heading 1', '- [ ] Other task', '# Heading 2', '- [ ] Task to move'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "# Heading 1
                - [ ] Other task
                # Heading 2
                - [ ] Task to move"
            `);

            // Move task from line 3 to line 1 (after "# Heading 1")
            const result = moveTaskWithinSameFile(lines, 3, 1, ['- [ ] Task to move']);

            expect(result.join('\n')).toMatchInlineSnapshot(`
                "# Heading 1
                - [ ] Task to move
                - [ ] Other task
                # Heading 2"
            `);
        });

        it('should move task with children backward', () => {
            const lines = [
                '# Heading 1',
                '- [ ] Other task',
                '# Heading 2',
                '- [ ] Task to move',
                '    - Child 1',
                '    - Child 2',
            ];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "# Heading 1
                - [ ] Other task
                # Heading 2
                - [ ] Task to move
                    - Child 1
                    - Child 2"
            `);

            // Move task + children from line 3 to line 1 (after "# Heading 1")
            const result = moveTaskWithinSameFile(lines, 3, 1, [
                '- [ ] Task to move',
                '    - Child 1',
                '    - Child 2',
            ]);

            expect(result.join('\n')).toMatchInlineSnapshot(`
                "# Heading 1
                - [ ] Task to move
                    - Child 1
                    - Child 2
                - [ ] Other task
                # Heading 2"
            `);
        });

        it('should move task to beginning of file', () => {
            const lines = ['# Heading', '- [ ] Other task', '- [ ] Task to move'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "# Heading
                - [ ] Other task
                - [ ] Task to move"
            `);

            const result = moveTaskWithinSameFile(lines, 2, 0, ['- [ ] Task to move']);

            expect(result.join('\n')).toMatchInlineSnapshot(`
                "- [ ] Task to move
                # Heading
                - [ ] Other task"
            `);
        });
    });

    describe('edge cases', () => {
        it('should handle moving task to adjacent position forward', () => {
            const lines = ['- [ ] Task 1', '- [ ] Task 2', '- [ ] Task 3'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "- [ ] Task 1
                - [ ] Task 2
                - [ ] Task 3"
            `);

            // Move task 1 to after task 2
            const result = moveTaskWithinSameFile(lines, 0, 2, ['- [ ] Task 1']);

            expect(result.join('\n')).toMatchInlineSnapshot(`
                "- [ ] Task 2
                - [ ] Task 1
                - [ ] Task 3"
            `);
        });

        it('should handle moving task to adjacent position backward', () => {
            const lines = ['- [ ] Task 1', '- [ ] Task 2', '- [ ] Task 3'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "- [ ] Task 1
                - [ ] Task 2
                - [ ] Task 3"
            `);

            // Move task 2 to before task 1
            const result = moveTaskWithinSameFile(lines, 1, 0, ['- [ ] Task 2']);

            expect(result.join('\n')).toMatchInlineSnapshot(`
                "- [ ] Task 2
                - [ ] Task 1
                - [ ] Task 3"
            `);
        });

        it('should preserve content between source and destination when moving forward', () => {
            const lines = ['Line 0', '- [ ] Task to move', 'Line 2', 'Line 3', 'Line 4', 'Line 5'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "Line 0
                - [ ] Task to move
                Line 2
                Line 3
                Line 4
                Line 5"
            `);

            const result = moveTaskWithinSameFile(lines, 1, 5, ['- [ ] Task to move']);

            expect(result.join('\n')).toMatchInlineSnapshot(`
                "Line 0
                Line 2
                Line 3
                Line 4
                - [ ] Task to move
                Line 5"
            `);
        });

        it('should preserve content between source and destination when moving backward', () => {
            const lines = ['Line 0', 'Line 1', 'Line 2', 'Line 3', '- [ ] Task to move', 'Line 5'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "Line 0
                Line 1
                Line 2
                Line 3
                - [ ] Task to move
                Line 5"
            `);

            const result = moveTaskWithinSameFile(lines, 4, 1, ['- [ ] Task to move']);

            expect(result.join('\n')).toMatchInlineSnapshot(`
                "Line 0
                - [ ] Task to move
                Line 1
                Line 2
                Line 3
                Line 5"
            `);
        });

        it('should return unchanged array when insertion point is immediately after task', () => {
            // This is effectively a no-op: moving a task to the position right after itself
            const lines = ['- [ ] Only task'];

            expect(lines.join('\n')).toMatchInlineSnapshot('"- [ ] Only task"');

            const result = moveTaskWithinSameFile(lines, 0, 1, ['- [ ] Only task']);

            expect(result.join('\n')).toMatchInlineSnapshot('"- [ ] Only task"');
        });

        it('should handle no-op when insertion line equals task line', () => {
            // Edge case: what if someone tries to move a task to its own position?
            const lines = ['- [ ] Task 1', '- [ ] Task 2', '- [ ] Task 3'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "- [ ] Task 1
                - [ ] Task 2
                - [ ] Task 3"
            `);

            // Moving task at line 1 to insertion point 1 (same position)
            const result = moveTaskWithinSameFile(lines, 1, 1, ['- [ ] Task 2']);

            // The task should remain in place, file unchanged
            expect(result.join('\n')).toMatchInlineSnapshot(`
                "- [ ] Task 1
                - [ ] Task 2
                - [ ] Task 3"
            `);
        });
    });
});

describe('moveTaskBetweenFiles', () => {
    describe('basic moves', () => {
        it('should remove task from source and add to target', () => {
            const sourceLines = ['# Source', '- [ ] Task to move', '- [ ] Remaining task'];
            const targetLines = ['# Target', '- [ ] Existing task'];

            expect(sourceLines.join('\n')).toMatchInlineSnapshot(`
                "# Source
                - [ ] Task to move
                - [ ] Remaining task"
            `);
            expect(targetLines.join('\n')).toMatchInlineSnapshot(`
                "# Target
                - [ ] Existing task"
            `);

            const { newSourceLines, newTargetLines } = moveTaskBetweenFiles(
                sourceLines,
                targetLines,
                1, // taskLineIndex in source
                2, // insertionLine in target (after existing task)
                ['- [ ] Task to move'],
            );

            expect(newSourceLines.join('\n')).toMatchInlineSnapshot(`
                "# Source
                - [ ] Remaining task"
            `);
            expect(newTargetLines.join('\n')).toMatchInlineSnapshot(`
                "# Target
                - [ ] Existing task
                - [ ] Task to move"
            `);
        });

        it('should move task with children between files', () => {
            const sourceLines = [
                '# Source',
                '- [ ] Task to move',
                '    - Child 1',
                '    - Child 2',
                '- [ ] Remaining task',
            ];
            const targetLines = ['# Target', '- [ ] Existing task'];

            expect(sourceLines.join('\n')).toMatchInlineSnapshot(`
                "# Source
                - [ ] Task to move
                    - Child 1
                    - Child 2
                - [ ] Remaining task"
            `);
            expect(targetLines.join('\n')).toMatchInlineSnapshot(`
                "# Target
                - [ ] Existing task"
            `);

            const { newSourceLines, newTargetLines } = moveTaskBetweenFiles(sourceLines, targetLines, 1, 2, [
                '- [ ] Task to move',
                '    - Child 1',
                '    - Child 2',
            ]);

            expect(newSourceLines.join('\n')).toMatchInlineSnapshot(`
                "# Source
                - [ ] Remaining task"
            `);
            expect(newTargetLines.join('\n')).toMatchInlineSnapshot(`
                "# Target
                - [ ] Existing task
                - [ ] Task to move
                    - Child 1
                    - Child 2"
            `);
        });
    });

    describe('edge cases', () => {
        it('should handle empty target file', () => {
            const sourceLines = ['# Source', '- [ ] Task to move'];
            const targetLines: string[] = [];

            expect(sourceLines.join('\n')).toMatchInlineSnapshot(`
                "# Source
                - [ ] Task to move"
            `);
            expect(targetLines.join('\n')).toMatchInlineSnapshot('""');

            const { newSourceLines, newTargetLines } = moveTaskBetweenFiles(sourceLines, targetLines, 1, 0, [
                '- [ ] Task to move',
            ]);

            expect(newSourceLines.join('\n')).toMatchInlineSnapshot('"# Source"');
            expect(newTargetLines.join('\n')).toMatchInlineSnapshot('"- [ ] Task to move"');
        });

        it('should handle inserting at beginning of target', () => {
            const sourceLines = ['- [ ] Task to move', '- [ ] Source task'];
            const targetLines = ['# Target heading', '- [ ] Target task'];

            expect(sourceLines.join('\n')).toMatchInlineSnapshot(`
                "- [ ] Task to move
                - [ ] Source task"
            `);
            expect(targetLines.join('\n')).toMatchInlineSnapshot(`
                "# Target heading
                - [ ] Target task"
            `);

            const { newSourceLines, newTargetLines } = moveTaskBetweenFiles(
                sourceLines,
                targetLines,
                0,
                0, // Insert at beginning
                ['- [ ] Task to move'],
            );

            expect(newSourceLines.join('\n')).toMatchInlineSnapshot('"- [ ] Source task"');
            expect(newTargetLines.join('\n')).toMatchInlineSnapshot(`
                "- [ ] Task to move
                # Target heading
                - [ ] Target task"
            `);
        });

        it('should handle inserting at end of target', () => {
            const sourceLines = ['- [ ] Task to move', '- [ ] Source task'];
            const targetLines = ['# Target', '- [ ] Target task'];

            expect(sourceLines.join('\n')).toMatchInlineSnapshot(`
                "- [ ] Task to move
                - [ ] Source task"
            `);
            expect(targetLines.join('\n')).toMatchInlineSnapshot(`
                "# Target
                - [ ] Target task"
            `);

            const { newSourceLines, newTargetLines } = moveTaskBetweenFiles(
                sourceLines,
                targetLines,
                0,
                2, // Insert at end
                ['- [ ] Task to move'],
            );

            expect(newSourceLines.join('\n')).toMatchInlineSnapshot('"- [ ] Source task"');
            expect(newTargetLines.join('\n')).toMatchInlineSnapshot(`
                "# Target
                - [ ] Target task
                - [ ] Task to move"
            `);
        });

        it('should handle source file becoming empty after move', () => {
            const sourceLines = ['- [ ] Only task'];
            const targetLines = ['# Target'];

            expect(sourceLines.join('\n')).toMatchInlineSnapshot('"- [ ] Only task"');
            expect(targetLines.join('\n')).toMatchInlineSnapshot('"# Target"');

            const { newSourceLines, newTargetLines } = moveTaskBetweenFiles(sourceLines, targetLines, 0, 1, [
                '- [ ] Only task',
            ]);

            expect(newSourceLines).toEqual([]);
            expect(newTargetLines.join('\n')).toMatchInlineSnapshot(`
                "# Target
                - [ ] Only task"
            `);
        });

        it('should insert into middle of target file', () => {
            const sourceLines = ['- [ ] Task to move'];
            const targetLines = ['Line 0', 'Line 1', 'Line 2', 'Line 3'];

            expect(sourceLines.join('\n')).toMatchInlineSnapshot('"- [ ] Task to move"');
            expect(targetLines.join('\n')).toMatchInlineSnapshot(`
                "Line 0
                Line 1
                Line 2
                Line 3"
            `);

            const { newSourceLines, newTargetLines } = moveTaskBetweenFiles(
                sourceLines,
                targetLines,
                0,
                2, // Insert between Line 1 and Line 2
                ['- [ ] Task to move'],
            );

            expect(newSourceLines).toEqual([]);
            expect(newTargetLines.join('\n')).toMatchInlineSnapshot(`
                "Line 0
                Line 1
                - [ ] Task to move
                Line 2
                Line 3"
            `);
        });

        it('should preserve all content in both files after move', () => {
            // Verifies no content is lost or duplicated during the move
            const sourceLines = ['Source line 0', 'Source line 1', '- [ ] Task', 'Source line 3', 'Source line 4'];
            const targetLines = ['Target line 0', 'Target line 1', 'Target line 2'];

            expect(sourceLines.join('\n')).toMatchInlineSnapshot(`
                "Source line 0
                Source line 1
                - [ ] Task
                Source line 3
                Source line 4"
            `);
            expect(targetLines.join('\n')).toMatchInlineSnapshot(`
                "Target line 0
                Target line 1
                Target line 2"
            `);

            const { newSourceLines, newTargetLines } = moveTaskBetweenFiles(sourceLines, targetLines, 2, 2, [
                '- [ ] Task',
            ]);

            // Source should have all original lines except the moved task
            expect(newSourceLines.join('\n')).toMatchInlineSnapshot(`
                "Source line 0
                Source line 1
                Source line 3
                Source line 4"
            `);
            // Target should have all original lines plus the moved task at insertion point
            expect(newTargetLines.join('\n')).toMatchInlineSnapshot(`
                "Target line 0
                Target line 1
                - [ ] Task
                Target line 2"
            `);
        });
    });
});
