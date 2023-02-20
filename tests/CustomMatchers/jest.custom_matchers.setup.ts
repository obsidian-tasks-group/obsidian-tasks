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
