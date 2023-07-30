// ---------------------------------------------------------------------
// CustomMatchersForDates
// ---------------------------------------------------------------------
import { toEqualMoment } from './CustomMatchersForDates';
expect.extend({
    toEqualMoment,
});

// ---------------------------------------------------------------------
// CustomMatchersForExpressions
// ---------------------------------------------------------------------
import { toEvaluateAs } from './CustomMatchersForExpressions';
expect.extend({
    toEvaluateAs,
});

// ---------------------------------------------------------------------
// CustomMatchersForFilters
// ---------------------------------------------------------------------
import {
    toBeValid,
    toHaveExplanation,
    toMatchTask,
    toMatchTaskFromLine,
    toMatchTaskWithDescription,
    toMatchTaskWithHeading,
    toMatchTaskWithPath,
    toMatchTaskWithStatus,
} from './CustomMatchersForFilters';
expect.extend({
    toBeValid,
    toHaveExplanation,
    toMatchTask,
    toMatchTaskFromLine,
    toMatchTaskWithDescription,
    toMatchTaskWithHeading,
    toMatchTaskWithPath,
    toMatchTaskWithStatus,
});

// ---------------------------------------------------------------------
// CustomMatchersForGrouping
// ---------------------------------------------------------------------
import { groupHeadingsToBe, toSupportGroupingWithProperty } from './CustomMatchersForGrouping';
expect.extend({
    groupHeadingsToBe,
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
