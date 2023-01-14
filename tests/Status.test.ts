/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { Status } from '../src/Status';
import { StatusConfiguration } from '../src/StatusConfiguration';

jest.mock('obsidian');
window.moment = moment;

describe('StatusConfiguration', () => {
    function checkValidation(statusConfiguration: StatusConfiguration, expectedMessages: string[]) {
        const errors = statusConfiguration.validate();
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

        describe('validate indicator', () => {
            it('valid indicator', () => {
                const config = new StatusConfiguration('X', 'Completed', 'c', false);
                expect(config.validateIndicator()).toStrictEqual([]);
            });

            it('invalid indicator', () => {
                const config = new StatusConfiguration('XYZ', 'Completed', 'c', false);
                expect(config.validateIndicator()).toStrictEqual([
                    'Task Status Symbol ("XYZ") must be a single character.',
                ]);
            });
        });

        describe('validate next indicator', () => {
            it('valid indicator', () => {
                const config = new StatusConfiguration('c', 'Completed', 'X', false);
                expect(config.validateNextIndicator()).toStrictEqual([]);
            });

            it('invalid next indicator', () => {
                const config = new StatusConfiguration('c', 'Completed', 'XYZ', false);
                expect(config.validateNextIndicator()).toStrictEqual([
                    'Task Next Status Symbol ("XYZ") must be a single character.',
                ]);
            });
        });
    });
});

describe('Status', () => {
    it('should initialize with valid properties', () => {
        // Arrange
        const indicator = '/';
        const name = 'In Progress';
        const next = 'x';

        // Act
        const status = new Status(new StatusConfiguration(indicator, name, next, false));

        // Assert
        expect(status).not.toBeNull();
        expect(status!.indicator).toEqual(indicator);
        expect(status!.name).toEqual(name);
        expect(status!.nextStatusIndicator).toEqual(next);
        expect(status!.isCompleted()).toEqual(false);
    });

    it('should be complete when indicator is "x"', () => {
        // Arrange
        const indicator = 'x';
        const name = 'Done';
        const next = ' ';

        // Act
        const status = new Status(new StatusConfiguration(indicator, name, next, false));

        // Assert
        expect(status).not.toBeNull();
        expect(status!.indicator).toEqual(indicator);
        expect(status!.name).toEqual(name);
        expect(status!.nextStatusIndicator).toEqual(next);
        expect(status!.isCompleted()).toEqual(true);
    });

    it('should construct a Status for unknown symbol', () => {
        // Arrange
        const indicator = 'U';

        // Act
        const status = Status.createUnknownStatus(indicator);

        // Assert
        expect(status).not.toBeNull();
        expect(status!.indicator).toEqual(indicator);
        expect(status!.name).toEqual('Unknown');
        expect(status!.nextStatusIndicator).toEqual('x');
        expect(status!.isCompleted()).toEqual(false);
    });
});
