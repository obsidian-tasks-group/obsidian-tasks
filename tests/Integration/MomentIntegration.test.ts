// begin-snippet: declare-moment-in-tests
/**
 * @jest-environment jsdom
 */

import moment from 'moment';
// end-snippet

// Some test code to show how to use moment

describe('moment integration', () => {
    it('use moment in tests', () => {
        // begin-snippet: use-moment-in-tests
        const date = moment('2003-10-12');
        const now = moment();
        // end-snippet
        expect(date.isBefore(now)).toEqual(true);
    });
});
