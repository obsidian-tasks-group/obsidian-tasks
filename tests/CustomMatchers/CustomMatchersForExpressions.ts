import { diff } from 'jest-diff';
import { evaluateExpression, parseExpression } from '../../src/Scripting/Expression';

declare global {
    namespace jest {
        interface Matchers<R> {
            toEvaluateAs(expected: any): CustomMatcherResult;
        }
    }
}

// Based on https://stackoverflow.com/a/60229956/104370
export function toEvaluateAs(instruction: string, expected: any): jest.CustomMatcherResult {
    const functionOrError = parseExpression([], instruction);
    expect(functionOrError.queryComponent).not.toBeUndefined();
    const received = evaluateExpression(functionOrError.queryComponent!, []);

    const pass: boolean = received === expected;
    const expectedAsText = expected.toString();
    const receivedAsText = received ? received.toString() : 'null';

    const message: () => string = () =>
        pass
            ? `Expression result should not be ${expectedAsText}`
            : `Expression result is not the same as expected: ${diff(expectedAsText, receivedAsText)}`;

    return {
        message,
        pass,
    };
}
