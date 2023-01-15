import type { StatusConfiguration } from './StatusConfiguration';

export class StatusValidator {
    /**
     * Determine whether the date in this object is valid, and return error message(s) for display if not.
     */
    public validate(statusConfiguration: StatusConfiguration): string[] {
        const errors: string[] = [];

        // Messages are added in the order fields are shown when editing statuses.
        errors.push(...this.validateIndicator(statusConfiguration));
        errors.push(...this.validateName(statusConfiguration));
        errors.push(...this.validateNextIndicator(statusConfiguration));

        return errors;
    }

    public validateIndicator(statusConfiguration: StatusConfiguration): string[] {
        return StatusValidator.validateOneIndicator(statusConfiguration.indicator, 'Task Status Symbol');
    }

    public validateNextIndicator(statusConfiguration: StatusConfiguration): string[] {
        return StatusValidator.validateOneIndicator(statusConfiguration.nextStatusIndicator, 'Task Next Status Symbol');
    }

    public validateName(statusConfiguration: StatusConfiguration) {
        const errors: string[] = [];
        if (statusConfiguration.name.length === 0) {
            errors.push('Task Status Name cannot be empty.');
        }
        return errors;
    }

    private static validateOneIndicator(indicator: string, indicatorName: string): string[] {
        const errors: string[] = [];
        if (indicator.length === 0) {
            errors.push(`${indicatorName} cannot be empty.`);
        }

        if (indicator.length > 1) {
            errors.push(`${indicatorName} ("${indicator}") must be a single character.`);
        }
        return errors;
    }
}
