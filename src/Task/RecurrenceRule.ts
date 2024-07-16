import { RRule } from 'rrule';
import type { Options } from 'rrule';

type RecurrenceRuleOptions = {
    freq: Options['freq'] | CustomRecurrenceRuleName;
    dtstart?: Date;
};

export type CustomRecurrenceRuleRegistryEntry = CustomRecurrenceRuleStatic & {
    new (options: RecurrenceRuleOptions): CustomRecurrenceRule;
};
export const customRecurrenceRuleRegistry: {
    [freq: CustomRecurrenceRuleName]: CustomRecurrenceRuleRegistryEntry;
} = {};

export class RecurrenceRule {
    private rule: RRule | CustomRecurrenceRule;

    constructor(public readonly origOptions: RecurrenceRuleOptions) {
        const freq = this.origOptions.freq;
        if (customRecurrenceRuleRegistry[freq]) {
            this.rule = new customRecurrenceRuleRegistry[freq](this.origOptions);
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
        if (this.rule instanceof CustomRecurrenceRule) {
            const nextOptions = this.rule.next();
            return new RecurrenceRule(nextOptions);
        }
        return this;
    }

    static parseText(text: string): RecurrenceRuleOptions {
        // Try parsing text with the custom parsers first
        // If none of them work, then fallback to the default recurrence
        for (const customRecurrenceRule of Object.values(customRecurrenceRuleRegistry)) {
            const optionsParsedByCustomRule = customRecurrenceRule.parseText(text);
            if (optionsParsedByCustomRule !== null) {
                return optionsParsedByCustomRule;
            }
        }

        return RRule.parseText(text) as RecurrenceRuleOptions;
    }
}

export type CustomRecurrenceRuleOptions = {
    freq: CustomRecurrenceRuleName;
    dtstart?: Date;
};
export type CustomRecurrenceRuleName = string;
export abstract class CustomRecurrenceRule {
    abstract after(dt: Date): Date | null;
    abstract toText(): string;
    abstract next(): CustomRecurrenceRuleOptions;
}
export interface CustomRecurrenceRuleStatic {
    parseText(_text: string): CustomRecurrenceRuleOptions | null;
}

// class SpacedRule {
//     private readonly spacedRepetitionProgression = [1, 3, 10];

//     constructor(public readonly repetition: number) {}

//     after(dt: Date): Date | null {
//         const daysToNextRepetition = this.spacedRepetitionProgression[this.repetition];
//         if (!daysToNextRepetition) {
//             return null;
//         }
//         return moment(dt).add(daysToNextRepetition, 'days').toDate();
//     }

//     toText() {
//         let serialized = 'spaced';
//         if (this.repetition > 0) {
//             serialized += `${this.repetition}`;
//         }
//         return serialized;
//     }

//     static parseText(text: string): RecurrenceRuleOptions | null {
//         if (text.startsWith('spaced')) {
//             const countCandidate = parseInt(text.at(-1)!);
//             return {
//                 freq: 'spaced',
//                 count: Number.isInteger(countCandidate) ? countCandidate : 0,
//             };
//         }

//         return null;
//     }
// }
