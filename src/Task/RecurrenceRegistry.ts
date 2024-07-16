import type { Moment } from 'moment';
import type {
    AbstractRecurrence,
    AbstractRecurrenceClassDefinition,
    AbstractRecurrenceOptions,
} from './AbstractRecurrence';
import { Recurrence } from './Recurrence';

const recurrenceRegistry: AbstractRecurrenceClassDefinition<any>[] = [Recurrence];

export const addToRecurrenceRegistry = <Options extends AbstractRecurrenceOptions>(
    recurrenceDefinition: AbstractRecurrenceClassDefinition<Options>,
) => {
    recurrenceRegistry.unshift(recurrenceDefinition);
};

export const parseRecurrenceText = (data: {
    recurrenceRuleText: string;
    startDate: Moment | null;
    scheduledDate: Moment | null;
    dueDate: Moment | null;
}): AbstractRecurrence | null => {
    for (const recurrenceDefinition of recurrenceRegistry) {
        const parsedResult = recurrenceDefinition.fromText(data);

        if (parsedResult !== null) {
            return parsedResult;
        }
    }
    return null;
};
