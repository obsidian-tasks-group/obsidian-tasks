/**
 * @jest-environment jsdom
 */

import { getTaskWithChildren } from '../../src/EditFiles/FindTaskWithChildren';

/**
 * Visualises which lines are included when getting a task with its children.
 * Lines that are included are marked with '>>> ', others with '    '.
 */
function visualiseTaskWithChildren(lines: string[], taskLineIndex: number): string {
    const result = getTaskWithChildren(lines, taskLineIndex);
    return lines
        .map((line, i) => {
            const included = i >= taskLineIndex && i < taskLineIndex + result.length;
            return (included ? '>>> ' : '    ') + line;
        })
        .join('\n');
}

describe('getTaskWithChildren', () => {
    describe('task with no children', () => {
        it('should return only the task line when followed by sibling', () => {
            const lines = ['- [ ] Task 1', '- [ ] Task 2'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "- [ ] Task 1
                - [ ] Task 2"
            `);

            const result = getTaskWithChildren(lines, 0);

            expect(result).toEqual(['- [ ] Task 1']);
            expect(visualiseTaskWithChildren(lines, 0)).toMatchInlineSnapshot(`
                ">>> - [ ] Task 1
                    - [ ] Task 2"
            `);
        });

        it('should return only the task line when task is at end of file', () => {
            const lines = ['# Heading', 'Some text', '- [ ] Last task'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "# Heading
                Some text
                - [ ] Last task"
            `);

            const result = getTaskWithChildren(lines, 2);

            expect(result).toEqual(['- [ ] Last task']);
            expect(visualiseTaskWithChildren(lines, 2)).toMatchInlineSnapshot(`
                "    # Heading
                    Some text
                >>> - [ ] Last task"
            `);
        });

        it('should return only the task line when followed by non-indented content', () => {
            const lines = ['- [ ] Task', 'Some paragraph text', 'More text'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "- [ ] Task
                Some paragraph text
                More text"
            `);

            const result = getTaskWithChildren(lines, 0);

            expect(result).toEqual(['- [ ] Task']);
            expect(visualiseTaskWithChildren(lines, 0)).toMatchInlineSnapshot(`
                ">>> - [ ] Task
                    Some paragraph text
                    More text"
            `);
        });
    });

    describe('task with children', () => {
        it('should include one level of indented children', () => {
            const lines = ['- [ ] Parent task', '    - Child item', '- [ ] Next task'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "- [ ] Parent task
                    - Child item
                - [ ] Next task"
            `);

            const result = getTaskWithChildren(lines, 0);

            expect(result).toEqual(['- [ ] Parent task', '    - Child item']);
            expect(visualiseTaskWithChildren(lines, 0)).toMatchInlineSnapshot(`
                ">>> - [ ] Parent task
                >>>     - Child item
                    - [ ] Next task"
            `);
        });

        it('should include multiple children at same level', () => {
            const lines = ['- [ ] Parent task', '    - Child 1', '    - Child 2', '    - Child 3', '- [ ] Next task'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "- [ ] Parent task
                    - Child 1
                    - Child 2
                    - Child 3
                - [ ] Next task"
            `);

            const result = getTaskWithChildren(lines, 0);

            expect(result).toEqual(['- [ ] Parent task', '    - Child 1', '    - Child 2', '    - Child 3']);
            expect(visualiseTaskWithChildren(lines, 0)).toMatchInlineSnapshot(`
                ">>> - [ ] Parent task
                >>>     - Child 1
                >>>     - Child 2
                >>>     - Child 3
                    - [ ] Next task"
            `);
        });

        it('should include multiple levels of nested children', () => {
            const lines = [
                '- [ ] Parent task',
                '    - Child level 1',
                '        - Child level 2',
                '            - Child level 3',
                '- [ ] Next task',
            ];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "- [ ] Parent task
                    - Child level 1
                        - Child level 2
                            - Child level 3
                - [ ] Next task"
            `);

            const result = getTaskWithChildren(lines, 0);

            expect(result).toEqual([
                '- [ ] Parent task',
                '    - Child level 1',
                '        - Child level 2',
                '            - Child level 3',
            ]);
            expect(visualiseTaskWithChildren(lines, 0)).toMatchInlineSnapshot(`
                ">>> - [ ] Parent task
                >>>     - Child level 1
                >>>         - Child level 2
                >>>             - Child level 3
                    - [ ] Next task"
            `);
        });

        it('should stop at same-indented sibling task', () => {
            const lines = ['- [ ] Task 1', '    - Child of task 1', '- [ ] Task 2', '    - Child of task 2'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "- [ ] Task 1
                    - Child of task 1
                - [ ] Task 2
                    - Child of task 2"
            `);

            const result = getTaskWithChildren(lines, 0);

            expect(result).toEqual(['- [ ] Task 1', '    - Child of task 1']);
            expect(visualiseTaskWithChildren(lines, 0)).toMatchInlineSnapshot(`
                ">>> - [ ] Task 1
                >>>     - Child of task 1
                    - [ ] Task 2
                        - Child of task 2"
            `);
        });

        it('should stop at less-indented content', () => {
            // Task is indented; should stop when hitting less-indented line
            const lines = ['    - [ ] Indented task', '        - Child of indented task', '- [ ] Root level task'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "    - [ ] Indented task
                        - Child of indented task
                - [ ] Root level task"
            `);

            const result = getTaskWithChildren(lines, 0);

            expect(result).toEqual(['    - [ ] Indented task', '        - Child of indented task']);
            expect(visualiseTaskWithChildren(lines, 0)).toMatchInlineSnapshot(`
                ">>>     - [ ] Indented task
                >>>         - Child of indented task
                    - [ ] Root level task"
            `);
        });
    });

    describe('empty lines', () => {
        it('should include empty lines between children if more children follow', () => {
            const lines = ['- [ ] Parent task', '    - Child 1', '', '    - Child 2', '- [ ] Next task'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "- [ ] Parent task
                    - Child 1

                    - Child 2
                - [ ] Next task"
            `);

            const result = getTaskWithChildren(lines, 0);

            expect(result).toEqual(['- [ ] Parent task', '    - Child 1', '', '    - Child 2']);
            expect(visualiseTaskWithChildren(lines, 0)).toMatchInlineSnapshot(`
                ">>> - [ ] Parent task
                >>>     - Child 1
                >>> 
                >>>     - Child 2
                    - [ ] Next task"
            `);
        });

        it('should not include trailing empty lines after last child', () => {
            const lines = ['- [ ] Parent task', '    - Child', '', '- [ ] Next task'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "- [ ] Parent task
                    - Child

                - [ ] Next task"
            `);

            const result = getTaskWithChildren(lines, 0);

            expect(result).toEqual(['- [ ] Parent task', '    - Child']);
            expect(visualiseTaskWithChildren(lines, 0)).toMatchInlineSnapshot(`
                ">>> - [ ] Parent task
                >>>     - Child
                    
                    - [ ] Next task"
            `);
        });

        it('should not include trailing empty lines at end of file', () => {
            const lines = ['- [ ] Parent task', '    - Child', '', ''];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "- [ ] Parent task
                    - Child

                "
            `);

            const result = getTaskWithChildren(lines, 0);

            expect(result).toEqual(['- [ ] Parent task', '    - Child']);
            expect(visualiseTaskWithChildren(lines, 0)).toMatchInlineSnapshot(`
                ">>> - [ ] Parent task
                >>>     - Child
                    
                    "
            `);
        });

        it('should include multiple empty lines between children', () => {
            const lines = ['- [ ] Parent task', '    - Child 1', '', '', '    - Child 2', '- [ ] Next task'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "- [ ] Parent task
                    - Child 1


                    - Child 2
                - [ ] Next task"
            `);

            const result = getTaskWithChildren(lines, 0);

            expect(result).toEqual(['- [ ] Parent task', '    - Child 1', '', '', '    - Child 2']);
            expect(visualiseTaskWithChildren(lines, 0)).toMatchInlineSnapshot(`
                ">>> - [ ] Parent task
                >>>     - Child 1
                >>> 
                >>> 
                >>>     - Child 2
                    - [ ] Next task"
            `);
        });
    });

    describe('edge cases', () => {
        it('should handle task at end of file with children', () => {
            const lines = ['# Heading', '- [ ] Last task', '    - Its child'];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "# Heading
                - [ ] Last task
                    - Its child"
            `);

            const result = getTaskWithChildren(lines, 1);

            expect(result).toEqual(['- [ ] Last task', '    - Its child']);
            expect(visualiseTaskWithChildren(lines, 1)).toMatchInlineSnapshot(`
                "    # Heading
                >>> - [ ] Last task
                >>>     - Its child"
            `);
        });

        it('should handle single-line file', () => {
            const lines = ['- [ ] Only task'];

            expect(lines.join('\n')).toMatchInlineSnapshot('"- [ ] Only task"');

            const result = getTaskWithChildren(lines, 0);

            expect(result).toEqual(['- [ ] Only task']);
            expect(visualiseTaskWithChildren(lines, 0)).toMatchInlineSnapshot('">>> - [ ] Only task"');
        });

        it('should include indented non-task content as children', () => {
            // Children don't have to be list items - any indented content counts
            const lines = [
                '- [ ] Task with notes',
                '    - Note 1',
                '    - Note 2',
                '    Some plain text',
                '- [ ] Next task',
            ];

            expect(lines.join('\n')).toMatchInlineSnapshot(`
                "- [ ] Task with notes
                    - Note 1
                    - Note 2
                    Some plain text
                - [ ] Next task"
            `);

            const result = getTaskWithChildren(lines, 0);

            expect(result).toEqual(['- [ ] Task with notes', '    - Note 1', '    - Note 2', '    Some plain text']);
            expect(visualiseTaskWithChildren(lines, 0)).toMatchInlineSnapshot(`
                ">>> - [ ] Task with notes
                >>>     - Note 1
                >>>     - Note 2
                >>>     Some plain text
                    - [ ] Next task"
            `);
        });
    });
});
