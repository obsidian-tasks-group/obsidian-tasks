import { RRule } from 'rrule';
import type { Options } from 'rrule';
import moment from 'moment';

type RecurrenceRuleOptions = Omit<Options, 'freq'> & { freq: Options['freq'] | 'spaced' };

export class RecurrenceRule {
    private rule: RRule | SpacedRule;

    constructor(public readonly origOptions: Partial<RecurrenceRuleOptions>) {
        if (this.origOptions.freq === 'spaced') {
            this.rule = new SpacedRule(this.origOptions.count ?? 0);
        } else {
            this.rule = new RRule(this.origOptions as Options);
        }
    }

    after(dt: Date): Date | null {
        return this.rule.after(dt);
    }

    toText() {
        return this.rule.toText();
    }

    next() {
        if (this.rule instanceof SpacedRule) {
            return new RecurrenceRule({ freq: 'spaced', count: this.rule.repetition + 1 });
        }
        return this;
    }

    static parseText(text: string): Partial<RecurrenceRuleOptions> {
        const optionsParsedBySpacedRule = SpacedRule.parseText(text);
        if (optionsParsedBySpacedRule !== null) {
            return optionsParsedBySpacedRule;
        }

        return RRule.parseText(text);
    }
}

class SpacedRule {
    private readonly spacedRepetitionProgression = [1, 3, 10];

    constructor(public readonly repetition: number) {}

    after(dt: Date): Date | null {
        const daysToNextRepetition = this.spacedRepetitionProgression[this.repetition];
        if (!daysToNextRepetition) {
            return null;
        }
        return moment(dt).add(daysToNextRepetition, 'days').toDate();
    }

    toText() {
        let serialized = 'spaced';
        if (this.repetition > 0) {
            serialized += `${this.repetition}`;
        }
        return serialized;
    }

    static parseText(text: string): Partial<RecurrenceRuleOptions> | null {
        if (text.startsWith('spaced')) {
            const countCandidate = parseInt(text.at(-1)!);
            return {
                freq: 'spaced',
                count: Number.isInteger(countCandidate) ? countCandidate : 0,
            };
        }

        return null;
    }
}
