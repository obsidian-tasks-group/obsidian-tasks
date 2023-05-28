import type moment from 'moment';
import { diff } from 'jest-diff';

declare global {
    namespace jest {
        interface Matchers<R> {
            toBeSameMoment(expected: moment.Moment): CustomMatcherResult;
        }
    }
}

// From https://stackoverflow.com/a/60229956/104370
export function toBeSameMoment(received: moment.Moment, expected: moment.Moment): jest.CustomMatcherResult {
    const pass: boolean = received.isSame(expected);
    const expectedAsText = expected.toISOString();
    const receivedAsText = received.toISOString();
    const message: () => string = () =>
        pass
            ? `Received moment should not be ${expectedAsText}`
            : `Received moment is not the same as expected: ${diff(expectedAsText, receivedAsText)}`;

    return {
        message,
        pass,
    };
}
