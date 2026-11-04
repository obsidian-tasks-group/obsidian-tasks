import type { Field } from 'Query/Filter/Field';
import { DescriptionField } from 'Query/Filter/DescriptionField';
import { CreatedDateField } from 'Query/Filter/CreatedDateField';
import { DoneDateField } from 'Query/Filter/DoneDateField';
import { DueDateField } from 'Query/Filter/DueDateField';
import { ExcludeSubItemsField } from 'Query/Filter/ExcludeSubItemsField';
import { FunctionField } from 'Query/Filter/FunctionField';
import { HeadingField } from 'Query/Filter/HeadingField';
import { PathField } from 'Query/Filter/PathField';
import { PriorityField } from 'Query/Filter/PriorityField';
import { ScheduledDateField } from 'Query/Filter/ScheduledDateField';
import { StartDateField } from 'Query/Filter/StartDateField';
import { HappensDateField } from 'Query/Filter/HappensDateField';
import { RecurringField } from 'Query/Filter/RecurringField';
import { StatusField } from 'Query/Filter/StatusField';
import { TagsField } from 'Query/Filter/TagsField';
import { BooleanField } from 'Query/Filter/BooleanField';
import { FilenameField } from 'Query/Filter/FilenameField';
import { UrgencyField } from 'Query/Filter/UrgencyField';
import { StatusNameField } from 'Query/Filter/StatusNameField';
import { StatusTypeField } from 'Query/Filter/StatusTypeField';

import { RecurrenceField } from 'Query/Filter/RecurrenceField';
import type { FilterOrErrorMessage } from 'Query/Filter/FilterOrErrorMessage';
import type { Sorter } from 'Query/Sort/Sorter';
import type { Grouper } from 'Query/Group/Grouper';
import { FolderField } from 'Query/Filter/FolderField';
import { RootField } from 'Query/Filter/RootField';
import { BacklinkField } from 'Query/Filter/BacklinkField';
import { CancelledDateField } from 'Query/Filter/CancelledDateField';
import { BlockingField } from 'Query/Filter/BlockingField';
import { IdField } from 'Query/Filter/IdField';
import { DependsOnField } from 'Query/Filter/DependsOnField';
import { RandomField } from 'Query/Filter/RandomField';

// When parsing a query the fields are tested one by one according to this order.
// Since BooleanField is a meta-field, which needs to aggregate a few fields together, it is intended to
// be kept last.
// When adding new fields keep this order in mind, putting fields that are more specific before fields that
// may contain them, and keep BooleanField last.
export const fieldCreators: EndsWith<BooleanField> = [
    // NEW_QUERY_INSTRUCTION_EDIT_REQUIRED
    () => new StatusNameField(), // status.name is before status, to avoid ambiguity
    () => new StatusTypeField(), // status.type is before status, to avoid ambiguity
    () => new StatusField(),
    () => new RecurringField(),
    () => new PriorityField(),
    () => new HappensDateField(),
    () => new CancelledDateField(),
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
    () => new FunctionField(),
    () => new IdField(),
    () => new DependsOnField(),
    () => new BlockingField(),
    () => new RandomField(),
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
    const sortByRegexp = /^sort by /i;
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
    const groupByRegexp = /^group by /i;
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
