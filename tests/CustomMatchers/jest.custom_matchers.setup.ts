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
// CustomMatchersForRendering
// ---------------------------------------------------------------------
import {
    toHaveAChildSpanWithClass,
    toHaveAChildSpanWithClassAndDataAttributes,
    toHaveAmongDataAttributes,
    toHaveDataAttributes,
} from './CustomMatchersForRendering';
expect.extend({
    toHaveAChildSpanWithClass,
    toHaveAChildSpanWithClassAndDataAttributes,
    toHaveAmongDataAttributes,
    toHaveDataAttributes,
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
import { toMatchMarkdownLines, toToggleTo, toToggleWithRecurrenceInUsersOrderTo } from './CustomMatchersForTasks';
expect.extend({
    toMatchMarkdownLines,
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
