import { StatusConfiguration, StatusType } from '../src/StatusConfiguration';
import { StatusValidator } from '../src/StatusValidator';
import type { StatusCollectionEntry } from '../src/StatusCollection';

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
    });

    describe('validate StatusCollectionEntry', () => {
        it('should produce no messages for valid entry', () => {
            const entry: StatusCollectionEntry = ['x', 'Name', ' ', 'DONE'];
            expect(statusValidator.validateStatusCollectionEntry(entry)).toStrictEqual([]);
        });

        it('should validate type', () => {
            const entry: StatusCollectionEntry = ['!', 'Name', ' ', 'Done'];
            expect(statusValidator.validateStatusCollectionEntry(entry)).toStrictEqual([
                'Status Type "Done" is not a valid type',
            ]);
        });

        it('should recognise inconsistent symbol and type', () => {
            const entry: StatusCollectionEntry = ['x', 'Name', ' ', 'TODO'];
            expect(statusValidator.validateStatusCollectionEntry(entry)).toStrictEqual([
                "Status Type for symbol 'x': 'TODO' is inconsistent with convention 'DONE'",
            ]);
        });

        it('should recognise symbol toggling to itsel', () => {
            const entry: StatusCollectionEntry = ['!', 'Name', '!', 'TODO'];
            expect(statusValidator.validateStatusCollectionEntry(entry)).toStrictEqual([
                "Status symbol '!' toggles to itself",
            ]);
        });

        it('should recognise an error in created StatusConfiguration', () => {
            const entry: StatusCollectionEntry = ['x', 'Name', 'cc', 'DONE'];
            expect(statusValidator.validateStatusCollectionEntry(entry)).toStrictEqual([
                'Task Next Status Symbol ("cc") must be a single character.',
            ]);
        });
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

        it('should forbid type EMPTY', () => {
            expect(statusValidator.validateType('EMPTY')).toStrictEqual([
                'Status Type "EMPTY" is not permitted in user data',
            ]);
        });
    });

    describe('validate symbol/type consistency for convention', () => {
        function checkSymbolTypeConsistent(symbol: string, type: StatusType) {
            const configuration = new StatusConfiguration(symbol, 'Any old name', 'x', false, type);
            expect(statusValidator.validateSymbolTypeConventions(configuration)).toEqual([]);
        }

        function checkSymbolTypeInconsistent(symbol: string, actualType: StatusType, expectedType: StatusType) {
            const configuration = new StatusConfiguration(symbol, 'Any old name', 'x', false, actualType);
            const expectation = [
                `Status Type for symbol '${symbol}': '${actualType}' is inconsistent with convention '${expectedType}'`,
            ];
            // ""
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
            checkSymbolTypeInconsistent(' ', StatusType.NON_TASK, StatusType.TODO);
            checkSymbolTypeInconsistent('x', StatusType.NON_TASK, StatusType.DONE);
            checkSymbolTypeInconsistent('X', StatusType.NON_TASK, StatusType.DONE);
            checkSymbolTypeInconsistent('/', StatusType.NON_TASK, StatusType.IN_PROGRESS);
            checkSymbolTypeInconsistent('-', StatusType.NON_TASK, StatusType.CANCELLED);
        });
    });
});
