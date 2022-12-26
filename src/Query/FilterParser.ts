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
import { FilenameField } from './Filter/FilenameField';
import { UrgencyField } from './Filter/UrgencyField';

import type { FilterOrErrorMessage } from './Filter/Filter';
import type { Sorter } from './Sorter';

const fieldCreators = [
    () => new StatusField(),
    () => new RecurringField(),
    () => new PriorityField(),
    () => new HappensDateField(),
    () => new StartDateField(),
    () => new ScheduledDateField(),
    () => new DueDateField(),
    () => new DoneDateField(),
    () => new PathField(),
    () => new DescriptionField(),
    () => new TagsField(),
    () => new HeadingField(),
    () => new ExcludeSubItemsField(),
    () => new BooleanField(),
    () => new FilenameField(),
    () => new UrgencyField(),
];

export function parseFilter(filterString: string): FilterOrErrorMessage | null {
    for (const creator of fieldCreators) {
        const field = creator();
        if (field.canCreateFilterForLine(filterString)) return field.createFilterOrErrorMessage(filterString);
    }
    return null;
}

export function parseSorter(sorterString: string): Sorter | null {
    // New style parsing, using sorting which is done by the Field classes.

    // Optimisation: Check whether line begins with 'sort by'
    const sortByRegexp = /^sort by /;
    if (sorterString.match(sortByRegexp) === null) {
        return null;
    }

    // See if any of the fields can parse the line.
    for (const creator of fieldCreators) {
        const field = creator();
        const sorter = field.parseSortLine(sorterString);
        if (sorter) {
            return sorter;
        }
    }
    return null;
}
