import { StatusConfiguration } from '../src/StatusConfiguration';
import { StatusValidator } from '../src/StatusValidator';

describe('StatusValidator', () => {
    const statusValidator = new StatusValidator();

    function checkValidation(statusConfiguration: StatusConfiguration, expectedMessages: string[]) {
        const errors = statusValidator.validate(statusConfiguration);
        expect(errors).toEqual(expectedMessages);
    }

    describe('validation', () => {
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
                expect(statusValidator.validateNextSynbol(config)).toStrictEqual([]);
            });

            it('invalid next symbol', () => {
                const config = new StatusConfiguration('c', 'Completed', 'XYZ', false);
                expect(statusValidator.validateNextSynbol(config)).toStrictEqual([
                    'Task Next Status Symbol ("XYZ") must be a single character.',
                ]);
            });
        });
    });
});
