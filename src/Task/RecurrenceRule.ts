import { RRule } from 'rrule';
import type { Options } from 'rrule';
import moment from 'moment';

type RecurrenceRuleOptions = Omit<Options, 'freq'> & { freq: Options['freq'] | 'spaced' };

type SpacedRule = { freq: 'spaced'; iteration: number };

export class RecurrenceRule {
    private rule: RRule | SpacedRule;
    private readonly spacedRepetitionProgression = [1, 3, 10];

    constructor(public readonly origOptions: Partial<RecurrenceRuleOptions>) {
        if (this.origOptions.freq === 'spaced') {
            this.rule = { freq: 'spaced', iteration: 0 };
        } else {
            this.rule = new RRule(this.origOptions as Options);
        }
    }

    after(dt: Date): Date | null {
        if (this.isSpacedRule(this.rule)) {
            const daysToNextRepetition = this.spacedRepetitionProgression.slice(this.rule.iteration).at(0);
            if (!daysToNextRepetition) {
                return null;
            }
            this.rule.iteration++;
            return moment(dt).add(daysToNextRepetition, 'days').toDate();
        }
        return this.rule.after(dt);
    }

    toText() {
        if (this.isSpacedRule(this.rule)) {
            let serialized = 'spaced';
            if (this.rule.iteration > 0) {
                serialized += ` (${this.rule.iteration})`;
            }
            return serialized;
        }
        return this.rule.toText();
    }

    static parseText(text: string): Partial<RecurrenceRuleOptions> {
        if (text.startsWith('spaced')) {
            let count = 0;
            if (text.startsWith('spaced (')) {
                try {
                    count = parseInt(text.charAt(8));
                    // eslint-disable-next-line no-empty
                } catch {}
            }

            return {
                freq: 'spaced',
                count,
            };
        }

        return RRule.parseText(text);
    }

    private isSpacedRule(rule: RRule | SpacedRule): rule is SpacedRule {
        return (rule as SpacedRule).freq === 'spaced';
    }
}
