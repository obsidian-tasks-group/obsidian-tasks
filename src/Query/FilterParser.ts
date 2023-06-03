import type { Field } from './Filter/Field';
import { DescriptionField } from './Filter/DescriptionField';
import { CreatedDateField } from './Filter/CreatedDateField';
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
import { StatusNameField } from './Filter/StatusNameField';
import { StatusTypeField } from './Filter/StatusTypeField';

import { RecurrenceField } from './Filter/RecurrenceField';
import type { FilterOrErrorMessage } from './Filter/Filter';
import type { Sorter } from './Sorter';
import type { Grouper } from './Grouper';
import { FolderField } from './Filter/FolderField';
import { RootField } from './Filter/RootField';
import { BacklinkField } from './Filter/BacklinkField';

// When parsing a query the fields are tested one by one according to this order.
// Since BooleanField is a meta-field, which needs to aggregate a few fields together, it is intended to
// be kept last.
// When adding new fields keep this order in mind, putting fields that are more specific before fields that
// may contain them, and keep BooleanField last.
const fieldCreators: EndsWith<BooleanField> = [
    () => new StatusNameField(), // status.name is before status, to avoid ambiguity
    () => new StatusTypeField(), // status.type is before status, to avoid ambiguity
    () => new StatusField(),
    () => new RecurringField(),
    () => new PriorityField(),
    () => new HappensDateField(),
    () => new CreatedDateField(),
    () => new StartDateField(),
    () => new ScheduledDateField(),
    () => new DueDateField(),
    () => new DoneDateField(),
    () => new PathField(),
    () => new FolderField(),
    () => new RootField(),
    () => new BacklinkField(),
    () => new DescriptionField(),
    () => new TagsField(),
    () => new HeadingField(),
    () => new ExcludeSubItemsField(),
    () => new FilenameField(),
    () => new UrgencyField(),
    () => new RecurrenceField(),
    () => new BooleanField(), // --- Please make sure to keep BooleanField last (see comment above) ---
];

// This type helps verify that BooleanField is kept last
type EndsWith<End, T extends Field = Field> = [...Array<() => T>, () => End];

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
        const sorter = field.createSorterFromLine(sorterString);
        if (sorter) {
            return sorter;
        }
    }
    return null;
}

export function parseGrouper(line: string): Grouper | null {
    // New style parsing, using grouping which is done by the Field classes.

    // Optimisation: Check whether line begins with 'group by'
    const groupByRegexp = /^group by /;
    if (line.match(groupByRegexp) === null) {
        return null;
    }

    // See if any of the fields can parse the line.
    for (const creator of fieldCreators) {
        const field = creator();
        const grouper = field.createGrouperFromLine(line);
        if (grouper) {
            return grouper;
        }
    }
    return null;
}
