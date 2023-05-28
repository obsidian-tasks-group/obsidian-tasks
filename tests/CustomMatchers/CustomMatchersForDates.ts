import type moment from 'moment';

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
    const message: () => string = () =>
        pass
            ? ''
            : `Received moment (${received.toISOString()}) is not the same as expected (${expected.toISOString()})`;

    return {
        message,
        pass,
    };
}
