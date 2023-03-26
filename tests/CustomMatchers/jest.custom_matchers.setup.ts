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

import { toMatchTaskDetails } from './CustomMatchersForTaskSerializer';

expect.extend({
    toBeValid,
    toHaveExplanation,
    toMatchTask,
    toMatchTaskFromLine,
    toMatchTaskWithHeading,
    toMatchTaskWithPath,
    toMatchTaskWithStatus,
    toMatchTaskDetails,
});
