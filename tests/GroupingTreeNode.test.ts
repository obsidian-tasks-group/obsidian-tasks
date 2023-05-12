/**
 * @jest-environment jsdom
 */
import type { Task } from 'Task';
import { GroupingTreeNode } from '../src/Query/GroupingTreeNode';
import { fromLine } from './TestHelpers';

const task1 = fromLine({ line: '-[ ] #task 1' });
const task2 = fromLine({ line: '-[ ] #task 2' });
const task3 = fromLine({ line: '-[ ] #task 3' });
const task4 = fromLine({ line: '-[ ] #task 4' });
const task5 = fromLine({ line: '-[ ] #task 5' });
const task6 = fromLine({ line: '-[ ] #task 6' });

describe('Grouping Tree', () => {
    it('correctly generates all paths', () => {
        // Arrange

        // Build the following tree
        //              Root[1, 2, 3, 4, 5, 6]
        //             /                 \
        //        B[1, 5, 6]              C[3, 4, 5, 6]
        //          |                      /        \
        //        D[1]                  E[3, 4]       F[4, 5, 6]
        //                                            /        \
        //                                          G[4]       H[5, 6]
        const tree = new GroupingTreeNode([task1, task2, task3, task4, task5, task6]);
        const b = new GroupingTreeNode([task1, task5, task6]);
        const c = new GroupingTreeNode([task3, task4, task5, task6]);
        const d = new GroupingTreeNode([task1]);
        const e = new GroupingTreeNode([task3, task4]);
        const f = new GroupingTreeNode([task4, task5, task6]);
        const g = new GroupingTreeNode([task4]);
        const h = new GroupingTreeNode([task5, task6]);
        tree.children.set('B', b);
        tree.children.set('C', c);
        b.children.set('D', d);
        c.children.set('E', e);
        c.children.set('F', f);
        f.children.set('G', g);
        f.children.set('H', h);

        // Act
        const allLeafs = tree.generateAllPaths();

        // Assert
        const expected = new Map<string[], Task[]>();
        expected.set(['B', 'D'], [task1]);
        expected.set(['C', 'E'], [task3, task4]);
        expected.set(['C', 'F', 'G'], [task4]);
        expected.set(['C', 'F', 'H'], [task5, task6]);
        expect(allLeafs).toEqual(expected);
    });

    it("generates correct map when the node doesn't have children", () => {
        // Arrange
        const tree = new GroupingTreeNode([task1, task2, task3, task4, task5, task6]);

        // Act
        const allLeafs = tree.generateAllPaths();

        // Assert
        const expected = new Map<string[], Task[]>();
        expected.set([], [task1, task2, task3, task4, task5, task6]);
        expect(allLeafs).toEqual(expected);
    });
});
