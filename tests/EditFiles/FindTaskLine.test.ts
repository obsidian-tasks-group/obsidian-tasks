/**
 * @jest-environment jsdom
 */

import { findTaskLineWithFallbacks } from '../../src/EditFiles/FindTaskLine';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

/**
 * Visualises which line was found in the search.
 * The found line is marked with '==> ', others with '    '.
 */
function visualiseFoundLine(lines: string[], foundIndex: number): string {
    if (foundIndex === -1) {
        return 'Task not found\n\nLines:\n' + lines.map((line, i) => `    ${i}: ${line}`).join('\n');
    }
    return lines.map((line, i) => (i === foundIndex ? '==> ' : '    ') + `${i}: ${line}`).join('\n');
}

describe('findTaskLineWithFallbacks', () => {
    describe('strategy 1: cursor line match', () => {
        it('should find task at cursor line when content matches exactly', () => {
            const lines = ['# Heading', '- [ ] my description', '- [ ] other task'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "# Heading
                - [ ] my description
                - [ ] other task"
            `);

            const task = new TaskBuilder().description('my description').lineNumber(1).build();

            const result = findTaskLineWithFallbacks(lines, task, 1);

            expect(result).toBe(1);
            expect(visualiseFoundLine(lines, result)).toMatchInlineSnapshot(`
                "    0: # Heading
                ==> 1: - [ ] my description
                    2: - [ ] other task"
            `);
        });

        it('should not use cursor line when content does not match', () => {
            const lines = ['# Heading', '- [ ] different task', '- [ ] my description'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "# Heading
                - [ ] different task
                - [ ] my description"
            `);

            const task = new TaskBuilder().description('my description').lineNumber(2).build();

            // Cursor is on line 1, but that doesn't match - should find at line 2 via lineNumber
            const result = findTaskLineWithFallbacks(lines, task, 1);

            expect(result).toBe(2);
            expect(visualiseFoundLine(lines, result)).toMatchInlineSnapshot(`
                "    0: # Heading
                    1: - [ ] different task
                ==> 2: - [ ] my description"
            `);
        });
    });

    describe('strategy 2: task line number match', () => {
        it('should find task at stored line number when content matches', () => {
            const lines = ['# Heading', '- [ ] my description', '- [ ] other task'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "# Heading
                - [ ] my description
                - [ ] other task"
            `);

            const task = new TaskBuilder().description('my description').lineNumber(1).build();

            // No cursor provided, should use lineNumber
            const result = findTaskLineWithFallbacks(lines, task);

            expect(result).toBe(1);
            expect(visualiseFoundLine(lines, result)).toMatchInlineSnapshot(`
                "    0: # Heading
                ==> 1: - [ ] my description
                    2: - [ ] other task"
            `);
        });

        it('should not use line number when content does not match', () => {
            const lines = ['# Heading', '- [ ] different task', '- [ ] my description'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "# Heading
                - [ ] different task
                - [ ] my description"
            `);

            // Task thinks it's on line 1, but content moved to line 2
            const task = new TaskBuilder().description('my description').lineNumber(1).build();

            const result = findTaskLineWithFallbacks(lines, task);

            // Should find via content search at line 2
            expect(result).toBe(2);
            expect(visualiseFoundLine(lines, result)).toMatchInlineSnapshot(`
                "    0: # Heading
                    1: - [ ] different task
                ==> 2: - [ ] my description"
            `);
        });

        it('should find task at line number even when duplicates exist elsewhere', () => {
            // When lineNumber points to matching content, it succeeds even if identical tasks exist elsewhere
            const lines = [
                '- [ ] duplicate task',
                '- [ ] other task',
                '- [ ] duplicate task',
                '- [ ] another task',
                '- [ ] duplicate task',
            ];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "- [ ] duplicate task
                - [ ] other task
                - [ ] duplicate task
                - [ ] another task
                - [ ] duplicate task"
            `);

            // lineNumber(2) points to a line with matching content - found via strategy 2
            const task = new TaskBuilder().description('duplicate task').lineNumber(2).build();

            const result = findTaskLineWithFallbacks(lines, task);

            expect(result).toBe(2);
            expect(visualiseFoundLine(lines, result)).toMatchInlineSnapshot(`
                "    0: - [ ] duplicate task
                    1: - [ ] other task
                ==> 2: - [ ] duplicate task
                    3: - [ ] another task
                    4: - [ ] duplicate task"
            `);
        });
    });

    describe('strategy 3: content search', () => {
        it('should find task by content search when single match exists', () => {
            const lines = [
                '# Heading 1',
                '- [ ] other task 1',
                '# Heading 2',
                '- [ ] my description',
                '- [ ] other task 2',
            ];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "# Heading 1
                - [ ] other task 1
                # Heading 2
                - [ ] my description
                - [ ] other task 2"
            `);

            // Task's lineNumber is wrong (says 1), but content search should find it at 3
            const task = new TaskBuilder().description('my description').lineNumber(1).build();

            const result = findTaskLineWithFallbacks(lines, task);

            expect(result).toBe(3);
            expect(visualiseFoundLine(lines, result)).toMatchInlineSnapshot(`
                "    0: # Heading 1
                    1: - [ ] other task 1
                    2: # Heading 2
                ==> 3: - [ ] my description
                    4: - [ ] other task 2"
            `);
        });

        it('should pick closest match to cursor when multiple identical tasks exist', () => {
            const lines = [
                '- [ ] duplicate task',
                '- [ ] other task',
                '- [ ] duplicate task',
                '- [ ] another task',
                '- [ ] duplicate task',
            ];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "- [ ] duplicate task
                - [ ] other task
                - [ ] duplicate task
                - [ ] another task
                - [ ] duplicate task"
            `);

            // Cursor is on line 3, lineNumber points to non-matching content (line 1)
            // so content search picks the duplicate closest to cursor position 3
            const task = new TaskBuilder().description('duplicate task').lineNumber(1).build();

            const result = findTaskLineWithFallbacks(lines, task, 3);

            // Cursor line 3 doesn't match (it's "- [ ] another task")
            // Line number 1 doesn't match (it's "- [ ] other task")
            // Content search finds 3 matches at lines 0, 2, 4
            // Picks closest to cursor position 3: line 2 (distance 1) or line 4 (distance 1)
            // The reduce picks the first if equidistant, so should be line 2
            expect(result).toBe(2);
            expect(visualiseFoundLine(lines, result)).toMatchInlineSnapshot(`
                "    0: - [ ] duplicate task
                    1: - [ ] other task
                ==> 2: - [ ] duplicate task
                    3: - [ ] another task
                    4: - [ ] duplicate task"
            `);
        });
    });

    describe('strategy 4: flexible search by description', () => {
        it('should find task by description when exact markdown not found', () => {
            const lines = ['# Heading', '- [x] my description', '- [ ] other task'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "# Heading
                - [x] my description
                - [ ] other task"
            `);

            // Task has status [ ] but file has [x] - exact match fails.
            // lineNumber(5) is intentionally out of bounds to force fallback to flexible search.
            const task = new TaskBuilder().description('my description').lineNumber(5).build();

            const result = findTaskLineWithFallbacks(lines, task);

            // Should find via flexible search (contains '- [' and description)
            expect(result).toBe(1);
            expect(visualiseFoundLine(lines, result)).toMatchInlineSnapshot(`
                "    0: # Heading
                ==> 1: - [x] my description
                    2: - [ ] other task"
            `);
        });

        it('should find task when markdown has extra content', () => {
            const lines = ['# Heading', '- [ ] my description with extra stuff', '- [ ] other task'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "# Heading
                - [ ] my description with extra stuff
                - [ ] other task"
            `);

            // lineNumber(5) is intentionally out of bounds to force fallback to flexible search.
            const task = new TaskBuilder().description('my description').lineNumber(5).build();

            const result = findTaskLineWithFallbacks(lines, task);

            // Flexible search finds line containing the description
            expect(result).toBe(1);
            expect(visualiseFoundLine(lines, result)).toMatchInlineSnapshot(`
                "    0: # Heading
                ==> 1: - [ ] my description with extra stuff
                    2: - [ ] other task"
            `);
        });
    });

    describe('strategy 5: cursor line as last resort', () => {
        it('should use cursor line if it contains any task', () => {
            const lines = ['# Heading', '- [ ] completely different task', '- [ ] other task'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "# Heading
                - [ ] completely different task
                - [ ] other task"
            `);

            // Task description doesn't match anything in the file
            const task = new TaskBuilder().description('nonexistent description').lineNumber(5).build();

            // But cursor is on a valid task line
            const result = findTaskLineWithFallbacks(lines, task, 1);

            expect(result).toBe(1);
            expect(visualiseFoundLine(lines, result)).toMatchInlineSnapshot(`
                "    0: # Heading
                ==> 1: - [ ] completely different task
                    2: - [ ] other task"
            `);
        });

        it('should not use cursor line if it does not contain a task', () => {
            const lines = ['# Heading', 'Just some text', '- [ ] a task'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "# Heading
                Just some text
                - [ ] a task"
            `);

            const task = new TaskBuilder().description('nonexistent').lineNumber(5).build();

            // Cursor is on line 1 which is not a task
            const result = findTaskLineWithFallbacks(lines, task, 1);

            expect(result).toBe(-1);
            expect(visualiseFoundLine(lines, result)).toMatchInlineSnapshot(`
                "Task not found

                Lines:
                    0: # Heading
                    1: Just some text
                    2: - [ ] a task"
            `);
        });
    });

    describe('fallback chain', () => {
        it('should prefer cursor line (strategy 1) over line number (strategy 2)', () => {
            // Task exists at BOTH cursor line AND stored line number
            // Should use cursor line (strategy 1) because it's checked first
            const lines = ['- [ ] my description', '- [ ] other task', '- [ ] my description'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "- [ ] my description
                - [ ] other task
                - [ ] my description"
            `);

            // Cursor points to line 0, lineNumber points to line 2 - both have matching content
            const task = new TaskBuilder().description('my description').lineNumber(2).build();

            const result = findTaskLineWithFallbacks(lines, task, 0);

            // Should return 0 (cursor line) not 2 (line number)
            expect(result).toBe(0);
            expect(visualiseFoundLine(lines, result)).toMatchInlineSnapshot(`
                "==> 0: - [ ] my description
                    1: - [ ] other task
                    2: - [ ] my description"
            `);
        });

        it('should prefer line number (strategy 2) over content search (strategy 3)', () => {
            // Task exists at stored line number AND elsewhere via content search
            // Should use line number (strategy 2) because it's checked before content search
            const lines = ['- [ ] my description', '- [ ] other task', '- [ ] my description'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "- [ ] my description
                - [ ] other task
                - [ ] my description"
            `);

            // No cursor, lineNumber points to line 0 which has matching content
            // Content search would also find line 2
            const task = new TaskBuilder().description('my description').lineNumber(0).build();

            const result = findTaskLineWithFallbacks(lines, task);

            // Should return 0 (line number match) - content search isn't needed
            expect(result).toBe(0);
            expect(visualiseFoundLine(lines, result)).toMatchInlineSnapshot(`
                "==> 0: - [ ] my description
                    1: - [ ] other task
                    2: - [ ] my description"
            `);
        });

        it('should return -1 when task cannot be found by any strategy', () => {
            const lines = ['# Heading', 'Some text', 'More text'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "# Heading
                Some text
                More text"
            `);

            // lineNumber(5) is out of bounds, no cursor, description doesn't match
            const task = new TaskBuilder().description('nonexistent task').lineNumber(5).build();

            const result = findTaskLineWithFallbacks(lines, task);

            expect(result).toBe(-1);
            expect(visualiseFoundLine(lines, result)).toMatchInlineSnapshot(`
                "Task not found

                Lines:
                    0: # Heading
                    1: Some text
                    2: More text"
            `);
        });

        it('should return -1 when file is empty', () => {
            const lines: string[] = [];

            expect(lines.join('\n')).toMatchInlineSnapshot('""');

            const task = new TaskBuilder().description('any task').lineNumber(0).build();

            const result = findTaskLineWithFallbacks(lines, task);

            expect(result).toBe(-1);
            expect(visualiseFoundLine(lines, result)).toMatchInlineSnapshot(`
                "Task not found

                Lines:
                "
            `);
        });

        it('should return -1 when cursor line is out of bounds', () => {
            const lines = ['# Heading', 'Some text'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "# Heading
                Some text"
            `);

            // Cursor at 100 is out of bounds, lineNumber(0) doesn't match content
            const task = new TaskBuilder().description('nonexistent').lineNumber(0).build();

            const result = findTaskLineWithFallbacks(lines, task, 100);

            expect(result).toBe(-1);
            expect(visualiseFoundLine(lines, result)).toMatchInlineSnapshot(`
                "Task not found

                Lines:
                    0: # Heading
                    1: Some text"
            `);
        });
    });

    describe('edge cases', () => {
        it('should match indented task by its full markdown including indentation', () => {
            // Indented tasks have indentation as part of their originalMarkdown
            // The search must match the full line including leading spaces
            const lines = ['- [ ] parent', '    - [ ] indented child', '- [ ] sibling'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "- [ ] parent
                    - [ ] indented child
                - [ ] sibling"
            `);

            const task = new TaskBuilder().description('indented child').indentation('    ').lineNumber(1).build();

            // Without cursor, should find via line number match (line 1 content matches)
            const result = findTaskLineWithFallbacks(lines, task);

            expect(result).toBe(1);
            expect(visualiseFoundLine(lines, result)).toMatchInlineSnapshot(`
                "    0: - [ ] parent
                ==> 1:     - [ ] indented child
                    2: - [ ] sibling"
            `);
        });

        it('should not match indented task when indentation differs', () => {
            // If the task's originalMarkdown has different indentation than the file,
            // exact match will fail and it falls back to other strategies
            const lines = ['- [ ] parent', '        - [ ] deeply indented', '- [ ] sibling'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "- [ ] parent
                        - [ ] deeply indented
                - [ ] sibling"
            `);

            // Task expects 4 spaces but file has 8 spaces - exact match fails
            const task = new TaskBuilder().description('deeply indented').indentation('    ').lineNumber(1).build();

            // lineNumber(1) won't match because indentation differs
            // Content search won't find exact match
            // Flexible search WILL find it because it just looks for description
            const result = findTaskLineWithFallbacks(lines, task);

            expect(result).toBe(1); // Found via flexible search
            expect(visualiseFoundLine(lines, result)).toMatchInlineSnapshot(`
                "    0: - [ ] parent
                ==> 1:         - [ ] deeply indented
                    2: - [ ] sibling"
            `);
        });

        it('should handle negative line number gracefully', () => {
            const lines = ['- [ ] task one', '- [ ] task two'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "- [ ] task one
                - [ ] task two"
            `);

            // Negative line number should not cause errors
            const task = new TaskBuilder().description('task one').lineNumber(-1).build();

            // Should fall back to content search
            const result = findTaskLineWithFallbacks(lines, task);

            expect(result).toBe(0);
            expect(visualiseFoundLine(lines, result)).toMatchInlineSnapshot(`
                "==> 0: - [ ] task one
                    1: - [ ] task two"
            `);
        });
    });
});
