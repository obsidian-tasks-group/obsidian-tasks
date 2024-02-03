import { diff } from 'jest-diff';
import type { MatcherFunction } from 'expect';
import moment from 'moment';
import type { TaskDetails } from '../../src/TaskSerializer';
import { Recurrence } from '../../src/Task/Recurrence';
import { Priority } from '../../src/Task/Priority';
import { TaskRegularExpressions } from '../../src/Task/TaskRegularExpressions';

declare global {
    namespace jest {
        interface Matchers<R> {
            toMatchTaskDetails(partial_expected_details: Partial<TaskDetails>): R;
        }
    }
}

/** A custom jest {@link Tester} that computes whether two recurrences are equal
 *
 * @note Support for custom equality testers publically landed in jest 29.4.0, but yarn
 *       currently resolves jest to 29.3.1 for this project.
 * @todo When the version of jest is bumped, consider adding `import type {Tester} from 'expect'`
 *       and using that type to typecheckt this function.
 */
const recurrencesAreEqual = function (a: any, b: any) {
    if (!(a instanceof Recurrence && b instanceof Recurrence)) {
        return undefined;
    }
    return a.identicalTo(b);
};

/* A type guard for {@link TaskDetails}
 */
function isTaskDetails(val: any): val is TaskDetails {
    if (typeof val !== 'object') {
        return false;
    }

    const dates: ReadonlyArray<keyof TaskDetails> = [
        // NEW_TASK_FIELD_EDIT_REQUIRED
        'startDate',
        'createdDate',
        'scheduledDate',
        'dueDate',
        'doneDate',
        'cancelledDate',
    ] as const;

    for (const d of dates) {
        if (!(moment.isMoment(val[d]) || val[d] === null)) {
            return false;
        }
    }
    if (!(typeof val.description === 'string')) {
        return false;
    }
    if (!(Array.isArray(val.tags) && val.tags.every((v: unknown) => typeof v === 'string'))) {
        return false;
    }

    if (!Object.values(Priority).includes(val.priority)) {
        return false;
    }

    return true;
}

type AsString<T> = T extends string | string[] | null | undefined ? T : string;
type SummarizedTaskDetails = { [K in keyof TaskDetails]: AsString<TaskDetails[K]> };
/**
 * Helper function that replaces non-primitive members of {@link TaskDetails} with
 * a short string indicating its value. Meant to be used when showing a diff when a test fails.
 *
 * @param t A {@link TaskDetails} or null
 * @returns {SummarizedTaskDetails} if {@link t} was not null, otherwise null
 */
function summarizeTaskDetails(t: TaskDetails | null): SummarizedTaskDetails | null {
    if (t === null) return null;
    return {
        // NEW_TASK_FIELD_EDIT_REQUIRED
        ...t,
        startDate: t.startDate?.format(TaskRegularExpressions.dateFormat) ?? null,
        createdDate: t.createdDate?.format(TaskRegularExpressions.dateFormat) ?? null,
        scheduledDate: t.scheduledDate?.format(TaskRegularExpressions.dateFormat) ?? null,
        dueDate: t.dueDate?.format(TaskRegularExpressions.dateFormat) ?? null,
        doneDate: t.doneDate?.format(TaskRegularExpressions.dateFormat) ?? null,
        cancelledDate: t.cancelledDate?.format(TaskRegularExpressions.dateFormat) ?? null,
        recurrence: t.recurrence?.toText() ?? null,
        id: t.id?.valueOf().toString() ?? null,
    };
}

/**
 * Helper function that tries to build a {@link TaskDetails} from a partial one.
 *
 * The only way this fails (and returns null) is if {@link t} sets a key of {@link TaskDetails}
 * to an unexpected type. Example: {startDate: true, description: null}
 *
 * @param t A Partial {@link TaskDetails} or null
 * @returns {TaskDetails} if TaskDetails was build successfully, null otherwise
 */
function tryBuildTaskDetails(t: object): TaskDetails | null {
    const toReturn = {
        // NEW_TASK_FIELD_EDIT_REQUIRED
        description: '',
        priority: Priority.None,
        startDate: null,
        createdDate: null,
        scheduledDate: null,
        dueDate: null,
        doneDate: null,
        cancelledDate: null,
        recurrence: null,
        dependsOn: [],
        id: '',
        tags: [],
        ...t,
    };
    if (!isTaskDetails(toReturn)) return null;

    return toReturn;
}

/**
 * A custom jest {@link MatcherFunction} for checking if two {@link TaskDetails} match
 *
 * The expected {@link TaskDetail} may be defined partially for convenience, and missing values
 * assume a default value:
 *      {@link string} - The empty string
 *      {@link Array} - The empty array
 *      {@link Priority} - {@link Priority.None}
 *      nullable types - null
 *
 * @todo Figure out why throwing an Error in a custom matcher shows a traceback that points back to this function.
 *       Built-in matchers can throw exceptions, and it effectly looks like a test failed.
 * @param received A {@TaskDetails} or null
 * @param partial_expected A Partial {@link TaskDetails}
 */
export const toMatchTaskDetails: MatcherFunction<[partial_expected: unknown]> = function (
    received: unknown,
    partial_expected: unknown,
) {
    const {
        matcherErrorMessage,
        matcherHint,
        printWithType,
        printExpected,
        printReceived,
        RECEIVED_COLOR,
        EXPECTED_COLOR,
    } = this.utils;
    const matcherInvocation = matcherHint('toMatchTaskDetails', undefined, undefined, this);

    // Message to print when parameter does not have type TaskDetails | null
    function wrongTypeMessage(what: 'expected' | 'received', val: any, typeDescription: string) {
        const [printfn, PARAM_COLOR] = (<const>{
            expected: [printExpected, EXPECTED_COLOR],
            received: [printReceived, RECEIVED_COLOR],
        })[what];

        return matcherErrorMessage(
            matcherInvocation,
            `${PARAM_COLOR(what)} value must be ${typeDescription}`,
            printWithType(capitalize(what), val, printfn),
        );
    }

    if (!(received === null || isTaskDetails(received)))
        throw new Error(wrongTypeMessage('received', received, 'null or TaskDetails'));

    const expected = (function () {
        if (partial_expected !== null && typeof partial_expected === 'object') {
            // Try to build a TaskDetail
            const result = tryBuildTaskDetails(partial_expected);
            if (result !== null) return result;
        }
        // partial_expected was not actually null or a Partial<TaskDetails>
        throw new Error(wrongTypeMessage('expected', partial_expected, 'TaskDetails'));
    })();

    // Generate a diff to show when this matcher fails
    const objDiff = this.expand /* jest --expand */
        ? () => diff(expected, received)
        : () => diff(summarizeTaskDetails(expected), summarizeTaskDetails(received));

    const pass = this.equals(expected, received, [recurrencesAreEqual]);

    return {
        pass,
        message: pass
            ? () =>
                  matcherInvocation +
                  '\n\n' +
                  `${EXPECTED_COLOR('expected')} should not match ${RECEIVED_COLOR('received')}`
            : () =>
                  matcherInvocation +
                  '\n\n' +
                  `${EXPECTED_COLOR('expected')} does not match ${RECEIVED_COLOR('received')}:` +
                  '\n\n' +
                  objDiff(),
    };
};

const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1);
