import { RRule } from 'rrule';
import type { Options } from 'rrule';
import moment from 'moment';

type RecurrenceRuleOptions = Omit<Options, 'freq'> & { freq: Options['freq'] | 'spaced' };

export class RecurrenceRule {
    private rule: RRule | 'spaced';
    private readonly spacedRepetitionProgression = [1, 3, 10];

    constructor(public readonly origOptions: Partial<RecurrenceRuleOptions>) {
        if (this.origOptions.freq === 'spaced') {
            this.rule = 'spaced';
        } else {
            this.rule = new RRule(this.origOptions as Options);
        }
    }

    after(dt: Date): Date | null {
        if (this.rule === 'spaced') {
            const daysAfterStart = moment(dt).diff(this.origOptions.dtstart, 'days');
            const daysToNextRepetition = this.spacedRepetitionProgression.find((val) => val > daysAfterStart);
            return moment(this.origOptions.dtstart).add(daysToNextRepetition, 'days').toDate();
        }
        return this.rule.after(dt);
    }

    toText() {
        if (this.rule === 'spaced') {
            return 'spaced';
        }
        return this.rule.toText();
    }

    static parseText(text: string): Partial<RecurrenceRuleOptions> {
        if (text === 'spaced') {
            return {
                freq: 'spaced',
            };
        }
        return RRule.parseText(text);
    }
}
