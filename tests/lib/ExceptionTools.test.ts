import { errorMessageForException } from '../../src/lib/ExceptionTools';

describe('errorMessageForException()', () => {
    it('should include exception type and text in error message', () => {
        // Arrange
        const exceptionText = 'that was out of range';
        let messageReceived = 'Error - there was no exception thrown - test is invalid';

        // Put the 'throw' in a function, to prevent WebStorm reporting 'throw' of exception caught locally
        // when the throw is directly inside the try block:
        function throwAnException() {
            throw RangeError(exceptionText);
        }

        // Act
        try {
            throwAnException();
        } catch (e) {
            messageReceived = errorMessageForException('testing', e);
        }

        // Assert
        expect(messageReceived).toEqual(
            'Error: testing.\nThe error message was:\n    "RangeError: that was out of range"',
        );
        expect(messageReceived.includes('RangeError')).toEqual(true);
        expect(messageReceived.includes(exceptionText)).toEqual(true);
    });

    it('should give meaningful text for non-exceptions', () => {
        // Arrange
        const nonExceptionValue = 42;
        const messageReceived = errorMessageForException('testing', nonExceptionValue);

        // Assert
        expect(messageReceived).toEqual('Error: testing.\nThe error message was:\n    "Unknown error"');
    });
});
