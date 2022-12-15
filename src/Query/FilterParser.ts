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

import type { FilterOrErrorMessage } from './Filter/Filter';
import type { Sorting } from './Sort';

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
];

export function parseFilter(filterString: string): FilterOrErrorMessage | null {
    for (const creator of fieldCreators) {
        const field = creator();
        if (field.canCreateFilterForLine(filterString)) return field.createFilterOrErrorMessage(filterString);
    }
    return null;
}

export function parseSorter(sorterString: string): Sorting | null {
    // New style parsing, which is done by the Field classes.
    // Initially this is only implemented for a few fields.
    // TODO Once a few more Field classes have comparator implementations,
    //      convert this to look like parseFilter(), looping over all field types.

    const sortByRegexp = /^sort by (\S+)( reverse)?/;
    const fieldMatch = sorterString.match(sortByRegexp);
    if (fieldMatch === null) {
        return null;
    }
    const propertyName = fieldMatch[1];
    const reverse = !!fieldMatch[2];

    let field;
    switch (propertyName) {
        case 'status':
            field = new StatusField();
            break;
        case 'due':
            field = new DueDateField();
            break;
    }

    if (!field) {
        return null;
    }

    let sorter;
    if (reverse) {
        sorter = field.createReverseSorter();
    } else {
        sorter = field.createNormalSorter();
    }

    if (!sorter) {
        return null;
    }
    return sorter;
}
