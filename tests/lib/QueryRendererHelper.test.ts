/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { Query } from '../../src/Query/Query';
import { explainResults, getQueryForQueryRenderer } from '../../src/lib/QueryRendererHelper';
import { GlobalFilter } from '../../src/Config/GlobalFilter';
import { GlobalQuery } from '../../src/Config/GlobalQuery';

window.moment = moment;

describe('explain', () => {
    afterEach(() => {
        GlobalQuery.reset();
        GlobalFilter.reset();
    });

    it('should explain a task', () => {
        const source = '';
        const query = new Query({ source });

        const expectedDisplayText = `Explanation of this Tasks code block query:

No filters supplied. All tasks will match the query.`;

        expect(explainResults(query.source)).toEqual(expectedDisplayText);
    });

    it('should explain a task with global filter active', () => {
        GlobalFilter.set('#task');

        const source = '';
        const query = new Query({ source });

        const expectedDisplayText = `Only tasks containing the global filter '#task'.

Explanation of this Tasks code block query:

No filters supplied. All tasks will match the query.`;
        expect(explainResults(query.source)).toEqual(expectedDisplayText);
    });

    it('should explain a task with global query active', () => {
        GlobalQuery.getInstance().new_set('description includes hello');

        const source = '';
        const query = new Query({ source });

        const expectedDisplayText = `Explanation of the global query:

description includes hello

Explanation of this Tasks code block query:

No filters supplied. All tasks will match the query.`;

        expect(explainResults(query.source)).toEqual(expectedDisplayText);
    });

    it('should explain a task with global query and global filter active', () => {
        GlobalQuery.getInstance().new_set('description includes hello');
        GlobalFilter.set('#task');

        const source = '';
        const query = new Query({ source });

        const expectedDisplayText = `Only tasks containing the global filter '#task'.

Explanation of the global query:

description includes hello

Explanation of this Tasks code block query:

No filters supplied. All tasks will match the query.`;

        expect(explainResults(query.source)).toEqual(expectedDisplayText);
    });

    it('should explain a task with global query set but ignored without the global query', () => {
        GlobalQuery.getInstance().new_set('description includes hello');

        const source = 'ignore global query';
        const query = new Query({ source });

        const expectedDisplayText = `Explanation of this Tasks code block query:

No filters supplied. All tasks will match the query.`;

        expect(explainResults(query.source)).toEqual(expectedDisplayText);
    });
});

/**
 * @note Test suite deliberately omits any tests on the functionality of the query the QueryRenderer uses.
 *       Since it is just running a Query, we defer to the Query tests. We just check that we're getting
 *       the right query.
 */
describe('query used for QueryRenderer', () => {
    afterEach(() => {
        GlobalQuery.reset();
    });

    it('should be the result of combining the global query and the actual query', () => {
        const querySource = 'description includes world';
        const globalQuerySource = 'description includes hello';
        GlobalQuery.getInstance().new_set(globalQuerySource);
        expect(getQueryForQueryRenderer(querySource).source).toEqual(`${globalQuerySource}\n${querySource}`);
    });

    it('should ignore the global query if "ignore global query" is set', () => {
        GlobalQuery.getInstance().new_set('path includes from_global_query');
        expect(getQueryForQueryRenderer('description includes from_block_query\nignore global query').source).toEqual(
            'description includes from_block_query\nignore global query',
        );
    });
});
