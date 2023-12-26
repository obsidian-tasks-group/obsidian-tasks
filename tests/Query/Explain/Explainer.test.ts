/**
 * @jest-environment jsdom
 */

import moment from 'moment';

// import { Explainer } from '../../../src/Query/Explain/Explainer';
import { GlobalFilter } from '../../../src/Config/GlobalFilter';
import { Query } from '../../../src/Query/Query';

window.moment = moment;

afterEach(() => {
    GlobalFilter.getInstance().reset();
});

describe('explain errors', () => {
    it('should include any error message in the explanation', () => {
        const source = 'i am a nonsense query';
        const query = new Query(source);
        expect(query.explainQuery()).toMatchInlineSnapshot(`
                "Query has an error:
                do not understand query
                Problem line: "i am a nonsense query"
                "
            `);
    });
});

describe('explain filters', () => {
    it('should explain 0 filters', () => {
        const source = '';
        const query = new Query(source);
        expect(query.explainQuery()).toMatchInlineSnapshot(`
                "No filters supplied. All tasks will match the query.
                No grouping instructions supplied.
                "
            `);
    });

    it('should explain 1 filter', () => {
        const source = 'description includes hello';
        const query = new Query(source);
        expect(query.explainQuery()).toMatchInlineSnapshot(`
                "description includes hello

                No grouping instructions supplied.
                "
            `);
    });

    it('should explain 2 filters', () => {
        const source = 'description includes hello\ndue 2012-01-23';
        const query = new Query(source);
        expect(query.explainQuery()).toMatchInlineSnapshot(`
                "description includes hello

                due 2012-01-23 =>
                  due date is on 2012-01-23 (Monday 23rd January 2012)

                No grouping instructions supplied.
                "
            `);
    });
});

describe('explain groupers', () => {
    it('should explain "group by" options', () => {
        const source = 'group by due\ngroup by status.name reverse\ngroup by function task.description.toUpperCase()';
        const query = new Query(source);
        expect(query.explainQuery()).toMatchInlineSnapshot(`
                "No filters supplied. All tasks will match the query.
                group by due
                group by status.name reverse
                group by function task.description.toUpperCase()"
            `);
    });
});

describe('explain limits', () => {
    it('should explain limit 5', () => {
        const source = 'limit 5';
        const query = new Query(source);
        expect(query.explainQuery()).toMatchInlineSnapshot(`
                "No filters supplied. All tasks will match the query.
                No grouping instructions supplied.


                At most 5 tasks.
                "
            `);
    });

    it('should explain limit 1', () => {
        const source = 'limit 1';
        const query = new Query(source);
        expect(query.explainQuery()).toMatchInlineSnapshot(`
                "No filters supplied. All tasks will match the query.
                No grouping instructions supplied.


                At most 1 task.
                "
            `);
    });

    it('should explain limit 0', () => {
        const source = 'limit 0';
        const query = new Query(source);
        expect(query.explainQuery()).toMatchInlineSnapshot(`
                "No filters supplied. All tasks will match the query.
                No grouping instructions supplied.


                At most 0 tasks.
                "
            `);
    });

    it('should explain group limit 4', () => {
        const source = 'limit groups 4';
        const query = new Query(source);
        expect(query.explainQuery()).toMatchInlineSnapshot(`
                "No filters supplied. All tasks will match the query.
                No grouping instructions supplied.


                At most 4 tasks per group (if any "group by" options are supplied).
                "
            `);
    });

    it('should explain all limit options', () => {
        const source = 'limit 127\nlimit groups to 8 tasks';
        const query = new Query(source);
        expect(query.explainQuery()).toMatchInlineSnapshot(`
                "No filters supplied. All tasks will match the query.
                No grouping instructions supplied.


                At most 127 tasks.


                At most 8 tasks per group (if any "group by" options are supplied).
                "
            `);
    });
});
