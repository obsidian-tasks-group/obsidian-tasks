/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { Query } from '../../src/Query/Query';
import { explainResults, getQueryForQueryRenderer } from '../../src/Query/QueryRendererHelper';
import { GlobalFilter } from '../../src/Config/GlobalFilter';
import { GlobalQuery } from '../../src/Config/GlobalQuery';
import { TasksFile } from '../../src/Scripting/TasksFile';
import { getTasksFileFromMockData } from '../TestingTools/MockDataHelpers';
import query_file_defaults_short_mode from '../Obsidian/__test_data__/query_file_defaults_short_mode.json';
import query_file_defaults_all_options_true from '../Obsidian/__test_data__/query_file_defaults_all_options_true.json';
import query_file_defaults_ignore_global_query from '../Obsidian/__test_data__/query_file_defaults_ignore_global_query.json';

window.moment = moment;

describe('explain', () => {
    it('should explain a search', () => {
        const source = '';
        const query = new Query(source);
        expect(explainResults(query.source, new GlobalFilter(), new GlobalQuery())).toMatchInlineSnapshot(`
            "Explanation of this Tasks code block query:

              No filters supplied. All tasks will match the query.
            "
        `);
    });

    it('should explain a search with global filter active', () => {
        const globalFilter = new GlobalFilter();
        globalFilter.set('#task');

        const source = '';
        const query = new Query(source);
        expect(explainResults(query.source, globalFilter, new GlobalQuery())).toMatchInlineSnapshot(`
            "Only tasks containing the global filter '#task'.

            Explanation of this Tasks code block query:

              No filters supplied. All tasks will match the query.
            "
        `);
    });

    it('should explain a search with global query active', () => {
        const globalQuery = new GlobalQuery('description includes hello');

        const source = '';
        const query = new Query(source);
        expect(explainResults(query.source, new GlobalFilter(), globalQuery)).toMatchInlineSnapshot(`
            "Explanation of the global query:

              description includes hello

            Explanation of this Tasks code block query:

              No filters supplied. All tasks will match the query.
            "
        `);
    });

    it('should explain a search with global query and query file defaults active', () => {
        const globalQuery = new GlobalQuery('description includes hello');

        const source = '';
        const query = new Query(source);
        const tasksFile = getTasksFileFromMockData(query_file_defaults_all_options_true);
        expect(explainResults(query.source, new GlobalFilter(), globalQuery, tasksFile)).toMatchInlineSnapshot(`
            "Explanation of the global query:

              description includes hello

            Explanation of the Query File Defaults (from properties/frontmatter in the query's file):

              not done

              short mode

              show tree

              show tags

              show id

              show depends on

              show priority

              show recurrence rule

              show on completion

              show created date

              show start date

              show scheduled date

              show due date

              show cancelled date

              show done date

              show urgency

              show backlink

              show edit button

              show postpone button

              show task count

            Explanation of this Tasks code block query:

              No filters supplied. All tasks will match the query.
            "
        `);
    });

    it('should explain a search with global query and global filter active', () => {
        const globalQuery = new GlobalQuery('description includes hello');
        const globalFilter = new GlobalFilter();
        globalFilter.set('#task');

        const source = '';
        const query = new Query(source);
        expect(explainResults(query.source, globalFilter, globalQuery)).toMatchInlineSnapshot(`
            "Only tasks containing the global filter '#task'.

            Explanation of the global query:

              description includes hello

            Explanation of this Tasks code block query:

              No filters supplied. All tasks will match the query.
            "
        `);
    });

    it('should explain a search with global query set but ignored without the global query', () => {
        const globalQuery = new GlobalQuery('description includes hello');

        const source = 'ignore global query';
        const query = new Query(source);
        expect(explainResults(query.source, new GlobalFilter(), globalQuery)).toMatchInlineSnapshot(`
            "Explanation of this Tasks code block query:

              ignore global query

              No filters supplied. All tasks will match the query.
            "
        `);
    });

    it('should explain a search with global query set but ignored via TQ_extra_instructions saying to ignore it', () => {
        const globalQuery = new GlobalQuery('description includes hello');

        const source = 'description includes I came from the code block';
        const queryFile = getTasksFileFromMockData(query_file_defaults_ignore_global_query);
        expect(queryFile.property('TQ_extra_instructions')).toContain('ignore global query');
        const query = new Query(source, queryFile);
        expect(explainResults(query.source, new GlobalFilter(), globalQuery, queryFile)).toMatchInlineSnapshot(`
            "Explanation of the Query File Defaults (from properties/frontmatter in the query's file):

              ignore global query

              description includes I came from the TQ_extra_instructions property

            Explanation of this Tasks code block query:

              description includes I came from the code block
            "
        `);
    });

    it('should discard "ignore global query" from explanation if present in the global query itself', () => {
        const globalQuery = new GlobalQuery('ignore global query');
        const querySource = 'description includes from query';

        const explanation = explainResults(querySource, new GlobalFilter(), globalQuery);

        // It does not make sense to put 'ignore global query' in the global query.
        // If the user did so, we should ignore it in any explanations.
        expect(explanation).not.toContain('ignore global query');
        expect(explanation).toMatchInlineSnapshot(`
            "Explanation of the global query:

              No filters supplied. All tasks will match the query.

            Explanation of this Tasks code block query:

              description includes from query
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
        const tasksFile = new TasksFile('a/b/c.md');

        // Act
        const globalQuery = new GlobalQuery(globalQuerySource);
        const query = getQueryForQueryRenderer(querySource, globalQuery, tasksFile);

        // Assert
        expect(query.source).toEqual(`${globalQuerySource}\n${querySource}`);
        expect(query.tasksFile).toBe(tasksFile);
    });

    it('should ignore the global query if "ignore global query" is set', () => {
        // Arrange
        const globalQuery = new GlobalQuery('path includes from_global_query');
        const tasksFile = new TasksFile('a/b/c.md');

        // Act
        const query = getQueryForQueryRenderer(
            'description includes from_block_query\nignore global query',
            globalQuery,
            tasksFile,
        );

        // Assert
        expect(query.source).toEqual('description includes from_block_query\nignore global query');
        expect(query.tasksFile).toBe(tasksFile);
    });

    it('should add QueryFileDefaults', () => {
        // Arrange
        const globalQuery = new GlobalQuery('path includes from_global_query');
        const tasksFile = getTasksFileFromMockData(query_file_defaults_short_mode);

        // Act
        const query = getQueryForQueryRenderer('description includes from_block_query', globalQuery, tasksFile);

        // Assert
        expect(query.source).toEqual(`path includes from_global_query
short mode
description includes from_block_query`);
        expect(query.tasksFile).toBe(tasksFile);
    });
});
