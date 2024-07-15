import { RRule } from 'rrule';
import type { Options } from 'rrule';
import moment from 'moment';

type RecurrenceRuleOptions = Omit<Options, 'freq'> & { freq: Options['freq'] | 'spaced' };

type SpacedRule = { freq: 'spaced'; repetition: number };

export class RecurrenceRule {
    private rule: RRule | SpacedRule;
    private readonly spacedRepetitionProgression = [1, 3, 10];

    constructor(public readonly origOptions: Partial<RecurrenceRuleOptions>) {
        if (this.origOptions.freq === 'spaced') {
            this.rule = { freq: 'spaced', repetition: this.origOptions.count ?? 0 };
        } else {
            this.rule = new RRule(this.origOptions as Options);
        }
    }

    after(dt: Date): Date | null {
        if (RecurrenceRule.isSpacedRule(this.rule)) {
            const daysToNextRepetition = this.spacedRepetitionProgression[this.rule.repetition];
            if (!daysToNextRepetition) {
                return null;
            }
            return moment(dt).add(daysToNextRepetition, 'days').toDate();
        }
        return this.rule.after(dt);
    }

    toText() {
        if (RecurrenceRule.isSpacedRule(this.rule)) {
            let serialized = 'spaced';
            if (this.rule.repetition > 0) {
                serialized += `${this.rule.repetition}`;
            }
            return serialized;
        }
        return this.rule.toText();
    }

    nextIteration() {
        if (!RecurrenceRule.isSpacedRule(this.rule)) {
            return null;
        }
        return new RecurrenceRule({ freq: 'spaced', count: this.rule.repetition + 1 });
    }

    public get isSpacedRule() {
        return RecurrenceRule.isSpacedRule(this.rule);
    }

    static parseText(text: string): Partial<RecurrenceRuleOptions> {
        if (text.startsWith('spaced')) {
            const countCandidate = parseInt(text.at(-1)!);
            return {
                freq: 'spaced',
                count: Number.isInteger(countCandidate) ? countCandidate : 0,
            };
        }

        return RRule.parseText(text);
    }

    static isSpacedRule(rule: RRule | SpacedRule): rule is SpacedRule {
        return (rule as SpacedRule).freq === 'spaced';
    }
}
