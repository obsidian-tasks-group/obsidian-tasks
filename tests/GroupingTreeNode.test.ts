/**
 * @jest-environment jsdom
 */
import { GroupingTreeNode } from '../src/Query/GroupingTreeNode';

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
        const tree = new GroupingTreeNode<number>([1, 2, 3, 4, 5, 6]);
        const b = new GroupingTreeNode<number>([1, 5, 6]);
        const c = new GroupingTreeNode<number>([3, 4, 5, 6]);
        const d = new GroupingTreeNode<number>([1]);
        const e = new GroupingTreeNode<number>([3, 4]);
        const f = new GroupingTreeNode<number>([4, 5, 6]);
        const g = new GroupingTreeNode<number>([4]);
        const h = new GroupingTreeNode<number>([5, 6]);
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
        const expected = new Map<string[], number[]>();
        expected.set(['B', 'D'], [1]);
        expected.set(['C', 'E'], [3, 4]);
        expected.set(['C', 'F', 'G'], [4]);
        expected.set(['C', 'F', 'H'], [5, 6]);
        expect(allLeafs).toEqual(expected);
    });

    it("generates correct map when the node doesn't have children", () => {
        // Arrange
        const tree = new GroupingTreeNode<number>([1, 2, 3, 4, 5, 6]);

        // Act
        const allLeafs = tree.generateAllPaths();

        // Assert
        const expected = new Map<string[], number[]>();
        expected.set([], [1, 2, 3, 4, 5, 6]);
        expect(allLeafs).toEqual(expected);
    });
});
