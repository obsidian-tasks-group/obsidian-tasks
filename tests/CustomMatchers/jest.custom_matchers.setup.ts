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
    toMatchTaskInTaskList,
    toMatchTaskWithDescription,
    toMatchTaskWithHeading,
    toMatchTaskWithPath,
    toMatchTaskWithSearchInfo,
    toMatchTaskWithStatus,
} from './CustomMatchersForFilters';
expect.extend({
    toBeValid,
    toHaveExplanation,
    toMatchTaskInTaskList,
    toMatchTask,
    toMatchTaskFromLine,
    toMatchTaskWithDescription,
    toMatchTaskWithHeading,
    toMatchTaskWithPath,
    toMatchTaskWithSearchInfo,
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
