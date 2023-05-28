import type moment from 'moment';
import { diff } from 'jest-diff';

declare global {
    namespace jest {
        interface Matchers<R> {
            toEqualMoment(expected: moment.Moment): CustomMatcherResult;
        }
    }
}

// Based on https://stackoverflow.com/a/60229956/104370
export function toEqualMoment(received: moment.Moment | null, expected: moment.Moment): jest.CustomMatcherResult {
    const pass: boolean = expected.isSame(received);
    const expectedAsText = expected.toISOString();
    const receivedAsText = received ? received.toISOString() : 'null';
    const message: () => string = () =>
        pass
            ? `Received moment should not be ${expectedAsText}`
            : `Received moment is not the same as expected: ${diff(expectedAsText, receivedAsText)}`;

    return {
        message,
        pass,
    };
}
