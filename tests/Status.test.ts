/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { Status, StatusConfiguration } from '../src/Status';

jest.mock('obsidian');
window.moment = moment;

describe('StatusConfiguration', () => {
    function checkValidation(
        statusConfiguration: StatusConfiguration,
        expectedValid: boolean,
        expectedMessages: string[],
    ) {
        const { valid, errors } = statusConfiguration.validate();
        expect(valid).toEqual(expectedValid);
        expect(errors).toEqual(expectedMessages);
    }

    describe('validation', () => {
        it('should handle valid input correctly', () => {
            const config = new StatusConfiguration('X', 'Completed', ' ', false);
            checkValidation(config, true, []);
        });

        // Check status name
        it('should detect empty name', () => {
            const config = new StatusConfiguration('X', '', ' ', false);
            checkValidation(config, false, ['Name cannot be empty.']);
        });

        // Check Symbol
        it('should detect empty symbol', () => {
            const config = new StatusConfiguration('', 'Completed', ' ', false);
            checkValidation(config, false, ['Symbol cannot be empty.']);
        });

        it('should detect too-long symbol', () => {
            const config = new StatusConfiguration('yyy', 'Completed', ' ', false);
            checkValidation(config, false, ['Symbol ("yyy") must be a single character.']);
        });

        // Check Next symbol
        it('should detect next empty symbol', () => {
            const config = new StatusConfiguration('X', 'Completed', '', false);
            checkValidation(config, false, ['Next symbol cannot be empty.']);
        });

        it('should detect too-long next symbol', () => {
            const config = new StatusConfiguration('X', 'Completed', 'yyy', false);
            checkValidation(config, false, ['Next symbol ("yyy") must be a single character.']);
        });

        describe('validate indicator', () => {
            it('valid indicator', () => {
                const config = new StatusConfiguration('X', 'Completed', 'c', false);
                expect(config.validateIndicator()).toStrictEqual([]);
            });

            it('invalid indicator', () => {
                const config = new StatusConfiguration('XYZ', 'Completed', 'c', false);
                expect(config.validateIndicator()).toStrictEqual(['Symbol ("XYZ") must be a single character.']);
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
                    'Next symbol ("XYZ") must be a single character.',
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
