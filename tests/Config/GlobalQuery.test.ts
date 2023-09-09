/**
 * @jest-environment jsdom
 */

import { GlobalQuery } from '../../src/Config/GlobalQuery';

describe('GlobalQuery tests', () => {
    it('getInstance() should return the same object', () => {
        const globalQuery1 = GlobalQuery.getInstance();
        const globalQuery2 = GlobalQuery.getInstance();

        expect(Object.is(globalQuery1, globalQuery2)).toEqual(true);
    });
});
