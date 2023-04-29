/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { Query } from '../../src/Query/Query';
import { resetSettings, updateSettings } from '../../src/Config/Settings';
import { explainResults, getQueryForQueryRenderer } from '../../src/lib/QueryRendererHelper';
import { GlobalFilter } from '../../src/Config/GlobalFilter';

window.moment = moment;

describe('explain', () => {
    afterEach(() => {
        resetSettings();
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
        updateSettings({ globalQuery: 'description includes hello' });

        const source = '';
        const query = new Query({ source });

        const expectedDisplayText = `Explanation of the global query:

description includes hello

Explanation of this Tasks code block query:

No filters supplied. All tasks will match the query.`;

        expect(explainResults(query.source)).toEqual(expectedDisplayText);
    });

    it('should explain a task with global query and global filter active', () => {
        updateSettings({ globalQuery: 'description includes hello' });
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
});

/**
 * @note Test suite deliberately omits any tests on the functionality of the query the QueryRenderer uses.
 *       Since it is just running a Query, we defer to the Query tests. We just check that we're getting
 *       the right query.
 */
describe('query used for QueryRenderer', () => {
    afterEach(() => {
        resetSettings();
    });

    it('should be the result of combining the global query and the actual query', () => {
        const querySource = 'description includes world';
        const globalQuerySource = 'description includes hello';
        updateSettings({ globalQuery: globalQuerySource });
        expect(getQueryForQueryRenderer(querySource).source).toEqual(`${globalQuerySource}\n${querySource}`);
    });
});
