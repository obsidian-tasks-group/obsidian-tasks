/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { Occurrence } from '../../src/Task/Occurrence';
import { Recurrence } from '../../src/Task/Recurrence';

window.moment = moment;

describe('Recurrence Bug 609', () => {
    it('every 4 weeks on Sunday when done - completed on Tuesday', () => {
        // Arrange
        // "every 4 weeks on Sunday when done"
        const recurrence = Recurrence.fromText({
            recurrenceRuleText: 'every 4 weeks on Sunday when done',
            occurrence: new Occurrence({
                dueDate: moment('2022-04-10').startOf('day'),
            }),
        });

        // Completed on Tuesday 19th April 2022
        const completionDate = moment('2022-04-19').startOf('day');

        // Act
        const next = recurrence!.next(completionDate);

        // Assert
        // Expected: 4th Sunday after Tuesday 19th April
        // Week 0: Apr 18 - Apr 24. (Sunday is Apr 24).
        // Week 1: Apr 25 - May 1.
        // Week 2: May 2 - May 8.
        // Week 3: May 9 - May 15.
        // Week 4: May 16 - May 22.
        
        // If we want "every 4 weeks" (Interval 4), we normally expect ~28 days.
        // Next should be May 15??
        // Apr 19 + 28 = May 17.
        // May 17 is Tuesday. Sunday before is May 15. Sunday after is May 22.
        // User expects May 15.
        
        expect(next!.dueDate).toEqualMoment(moment('2022-05-15'));
    });
});
