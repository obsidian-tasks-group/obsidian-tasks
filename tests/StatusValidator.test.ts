import { StatusConfiguration, StatusType } from '../src/StatusConfiguration';
import { StatusValidator } from '../src/StatusValidator';

describe('StatusValidator', () => {
    const statusValidator = new StatusValidator();

    function checkValidation(statusConfiguration: StatusConfiguration, expectedMessages: string[]) {
        const errors = statusValidator.validate(statusConfiguration);
        expect(errors).toEqual(expectedMessages);
    }

    describe('validate StatusConfiguration', () => {
        it('should handle valid input correctly', () => {
            const config = new StatusConfiguration('X', 'Completed', ' ', false);
            checkValidation(config, []);
        });

        it('should handle totally invalid input correctly', () => {
            const config = new StatusConfiguration('Xxx', '', '', false);
            checkValidation(config, [
                'Task Status Symbol ("Xxx") must be a single character.',
                'Task Status Name cannot be empty.',
                'Task Next Status Symbol cannot be empty.',
            ]);
        });

        // Check status name
        it('should detect empty name', () => {
            const config = new StatusConfiguration('X', '', ' ', false);
            checkValidation(config, ['Task Status Name cannot be empty.']);
        });

        // Check Symbol
        it('should detect empty symbol', () => {
            const config = new StatusConfiguration('', 'Completed', ' ', false);
            checkValidation(config, ['Task Status Symbol cannot be empty.']);
        });

        it('should detect too-long symbol', () => {
            const config = new StatusConfiguration('yyy', 'Completed', ' ', false);
            checkValidation(config, ['Task Status Symbol ("yyy") must be a single character.']);
        });

        // Check Next symbol
        it('should detect next empty symbol', () => {
            const config = new StatusConfiguration('X', 'Completed', '', false);
            checkValidation(config, ['Task Next Status Symbol cannot be empty.']);
        });

        it('should detect too-long next symbol', () => {
            const config = new StatusConfiguration('X', 'Completed', 'yyy', false);
            checkValidation(config, ['Task Next Status Symbol ("yyy") must be a single character.']);
        });

        describe('validate symbol', () => {
            it('valid symbol', () => {
                const config = new StatusConfiguration('X', 'Completed', 'c', false);
                expect(statusValidator.validateSymbol(config)).toStrictEqual([]);
            });

            it('invalid symbol', () => {
                const config = new StatusConfiguration('XYZ', 'Completed', 'c', false);
                expect(statusValidator.validateSymbol(config)).toStrictEqual([
                    'Task Status Symbol ("XYZ") must be a single character.',
                ]);
            });
        });

        describe('validate next symbol', () => {
            it('valid symbol', () => {
                const config = new StatusConfiguration('c', 'Completed', 'X', false);
                expect(statusValidator.validateNextSymbol(config)).toStrictEqual([]);
            });

            it('invalid next symbol', () => {
                const config = new StatusConfiguration('c', 'Completed', 'XYZ', false);
                expect(statusValidator.validateNextSymbol(config)).toStrictEqual([
                    'Task Next Status Symbol ("XYZ") must be a single character.',
                ]);
            });
        });
    });

    describe('validate type as raw string', () => {
        it('valid symbol', () => {
            expect(statusValidator.validateType('TODO')).toStrictEqual([]);
            expect(statusValidator.validateType('IN_PROGRESS')).toStrictEqual([]);
        });

        it('invalidate type as raw string', () => {
            expect(statusValidator.validateType('in_progress')).toStrictEqual([
                'Status Type "in_progress" is not a valid type',
            ]);
            expect(statusValidator.validateType('CANCELED')).toStrictEqual([
                'Status Type "CANCELED" is not a valid type',
            ]);
        });
    });

    describe('validate symbol/type consistency for convention', () => {
        function checkSymbolTypeConsistent(symbol: string, type: StatusType) {
            const configuration = new StatusConfiguration(symbol, 'Any old name', 'x', false, type);
            expect(statusValidator.validateSymbolTypeConventions(configuration)).toEqual([]);
        }

        function checkSymbolTypeInconsistent(symbol: string, type: StatusType) {
            const configuration = new StatusConfiguration(symbol, 'Any old name', 'x', false, type);
            const expectation = [`Status Type '${type}' is not consistent with conventions for symbol '${symbol}'`];
            expect(statusValidator.validateSymbolTypeConventions(configuration)).toEqual(expectation);
        }

        it('matches convention', () => {
            checkSymbolTypeConsistent(' ', StatusType.TODO);
            checkSymbolTypeConsistent('x', StatusType.DONE);
            checkSymbolTypeConsistent('X', StatusType.DONE);
            checkSymbolTypeConsistent('/', StatusType.IN_PROGRESS);
            checkSymbolTypeConsistent('-', StatusType.CANCELLED);
        });

        it('does not match convention', () => {
            checkSymbolTypeInconsistent(' ', StatusType.NON_TASK);
            checkSymbolTypeInconsistent('x', StatusType.NON_TASK);
            checkSymbolTypeInconsistent('X', StatusType.NON_TASK);
            checkSymbolTypeInconsistent('/', StatusType.NON_TASK);
            checkSymbolTypeInconsistent('-', StatusType.NON_TASK);
        });
    });
});
