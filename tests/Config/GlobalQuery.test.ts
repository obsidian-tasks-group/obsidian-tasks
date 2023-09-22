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

    it('should have no instructions by default', () => {
        expect(new GlobalQuery().hasInstructions()).toEqual(false);
        expect(new GlobalQuery().query().source).toEqual('');
    });

    it('should set the query', () => {
        const globalQuery = new GlobalQuery('description includes this should be the source of the query');

        expect(globalQuery.query().source).toEqual('description includes this should be the source of the query');
    });

    it.each(['', ' ', '\n', '\n     \n    ', '  \n    \n'])(
        'should have no instructions if line breaks and spaces were set in the query',
        (globalQuerySource) => {
            const globalQuery = new GlobalQuery(globalQuerySource);

            expect(globalQuery.hasInstructions()).toEqual(false);
        },
    );
});
