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

    it('should have an empty source by default', () => {
        expect(new GlobalQuery().hasInstructions()).toEqual(false);
    });

    it.each(['', ' ', '\n', '\n     \n    ', '  \n    \n'])(
        'should have empty source if line breaks and spaces were set in the query',
        (globalQuerySource) => {
            const globalQuery = new GlobalQuery(globalQuerySource);

            expect(globalQuery.hasInstructions()).toEqual(false);
        },
    );

    it('should set the query', () => {
        const globalQuery = new GlobalQuery('description includes this should be the source of the query');

        expect(globalQuery.query().source).toEqual('description includes this should be the source of the query');
    });
});
