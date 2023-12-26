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
    it('should explain a task', () => {
        const source = '';
        const query = new Query(source);
        expect(explainResults(query.source, new GlobalFilter(), new GlobalQuery())).toMatchInlineSnapshot(`
            "Explanation of this Tasks code block query:

              No filters supplied. All tasks will match the query.

              No grouping instructions supplied.

              No sorting instructions supplied.
            "
        `);
    });

    it('should explain a task with global filter active', () => {
        const globalFilter = new GlobalFilter();
        globalFilter.set('#task');

        const source = '';
        const query = new Query(source);
        expect(explainResults(query.source, globalFilter, new GlobalQuery())).toMatchInlineSnapshot(`
            "Only tasks containing the global filter '#task'.

            Explanation of this Tasks code block query:

              No filters supplied. All tasks will match the query.

              No grouping instructions supplied.

              No sorting instructions supplied.
            "
        `);
    });

    it('should explain a task with global query active', () => {
        const globalQuery = new GlobalQuery('description includes hello');

        const source = '';
        const query = new Query(source);
        expect(explainResults(query.source, new GlobalFilter(), globalQuery)).toMatchInlineSnapshot(`
            "Explanation of the global query:

              description includes hello

              No grouping instructions supplied.

              No sorting instructions supplied.

            Explanation of this Tasks code block query:

              No filters supplied. All tasks will match the query.

              No grouping instructions supplied.

              No sorting instructions supplied.
            "
        `);
    });

    it('should explain a task with global query and global filter active', () => {
        const globalQuery = new GlobalQuery('description includes hello');
        const globalFilter = new GlobalFilter();
        globalFilter.set('#task');

        const source = '';
        const query = new Query(source);
        expect(explainResults(query.source, globalFilter, globalQuery)).toMatchInlineSnapshot(`
            "Only tasks containing the global filter '#task'.

            Explanation of the global query:

              description includes hello

              No grouping instructions supplied.

              No sorting instructions supplied.

            Explanation of this Tasks code block query:

              No filters supplied. All tasks will match the query.

              No grouping instructions supplied.

              No sorting instructions supplied.
            "
        `);
    });

    it('should explain a task with global query set but ignored without the global query', () => {
        const globalQuery = new GlobalQuery('description includes hello');

        const source = 'ignore global query';
        const query = new Query(source);
        expect(explainResults(query.source, new GlobalFilter(), globalQuery)).toMatchInlineSnapshot(`
            "Explanation of this Tasks code block query:

              No filters supplied. All tasks will match the query.

              No grouping instructions supplied.

              No sorting instructions supplied.
            "
        `);
    });
});

/**
 * @note Test suite deliberately omits any tests on the functionality of the query the QueryRenderer uses.
 *       Since it is just running a Query, we defer to the Query tests. We just check that we're getting
 *       the right query.
 */
describe('query used for QueryRenderer', () => {
    it('should be the result of combining the global query and the actual query', () => {
        // Arrange
        const querySource = 'description includes world';
        const globalQuerySource = 'description includes hello';
        const filePath = 'a/b/c.md';

        // Act
        const globalQuery = new GlobalQuery(globalQuerySource);
        const query = getQueryForQueryRenderer(querySource, globalQuery, filePath);

        // Assert
        expect(query.source).toEqual(`${globalQuerySource}\n${querySource}`);
        expect(query.filePath).toEqual(filePath);
    });

    it('should ignore the global query if "ignore global query" is set', () => {
        // Arrange
        const globalQuery = new GlobalQuery('path includes from_global_query');
        const filePath = 'a/b/c.md';

        // Act
        const query = getQueryForQueryRenderer(
            'description includes from_block_query\nignore global query',
            globalQuery,
            filePath,
        );

        // Assert
        expect(query.source).toEqual('description includes from_block_query\nignore global query');
        expect(query.filePath).toEqual(filePath);
    });
});
