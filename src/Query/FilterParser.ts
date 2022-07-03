import { DescriptionField } from './Filter/DescriptionField';
import { DoneDateField } from './Filter/DoneDateField';
import { DueDateField } from './Filter/DueDateField';
import { ExcludeSubItemsField } from './Filter/ExcludeSubItemsField';
import { HeadingField } from './Filter/HeadingField';
import { PathField } from './Filter/PathField';
import { PriorityField } from './Filter/PriorityField';
import { ScheduledDateField } from './Filter/ScheduledDateField';
import { StartDateField } from './Filter/StartDateField';
import { HappensDateField } from './Filter/HappensDateField';
import { RecurringField } from './Filter/RecurringField';
import { StatusField } from './Filter/StatusField';
import { TagsField } from './Filter/TagsField';
import { BooleanField } from './Filter/BooleanField';

import type { FilterOrErrorMessage } from './Filter/Filter';

const fieldTypes = [
    BooleanField,
    StatusField,
    RecurringField,
    PriorityField,
    HappensDateField,
    StartDateField,
    ScheduledDateField,
    DueDateField,
    DoneDateField,
    PathField,
    DescriptionField,
    TagsField,
    HeadingField,
    ExcludeSubItemsField,
];

export function parseFilter(filterString: string): FilterOrErrorMessage | null {
    for (const fieldType of fieldTypes) {
        const field = new fieldType();
        if (field.canCreateFilterForLine(filterString))
            return field.createFilterOrErrorMessage(filterString);
    }
    return null;
}
