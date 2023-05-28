// ---------------------------------------------------------------------
// CustomMatchersForDates
// ---------------------------------------------------------------------
import { toEqualMoment } from './CustomMatchersForDates';
expect.extend({
    toEqualMoment,
});

// ---------------------------------------------------------------------
// CustomMatchersForFilters
// ---------------------------------------------------------------------
import {
    toBeValid,
    toHaveExplanation,
    toMatchTask,
    toMatchTaskFromLine,
    toMatchTaskWithHeading,
    toMatchTaskWithPath,
    toMatchTaskWithStatus,
} from './CustomMatchersForFilters';
expect.extend({
    toBeValid,
    toHaveExplanation,
    toMatchTask,
    toMatchTaskFromLine,
    toMatchTaskWithHeading,
    toMatchTaskWithPath,
    toMatchTaskWithStatus,
});

// ---------------------------------------------------------------------
// CustomMatchersForGrouping
// ---------------------------------------------------------------------
import { toSupportGroupingWithProperty } from './CustomMatchersForGrouping';
expect.extend({
    toSupportGroupingWithProperty,
});

// ---------------------------------------------------------------------
// CustomMatchersForTaskBuilder
// ---------------------------------------------------------------------
import { toBeIdenticalTo } from './CustomMatchersForTaskBuilder';
expect.extend({
    toBeIdenticalTo,
});

// ---------------------------------------------------------------------
// CustomMatchersForTasks
// ---------------------------------------------------------------------
import { toToggleTo, toToggleWithRecurrenceInUsersOrderTo } from './CustomMatchersForTasks';
expect.extend({
    toToggleTo,
    toToggleWithRecurrenceInUsersOrderTo,
});

// ---------------------------------------------------------------------
// CustomMatchersForTaskBuilder
// ---------------------------------------------------------------------
import { toMatchTaskDetails } from './CustomMatchersForTaskSerializer';
expect.extend({
    toMatchTaskDetails,
});
