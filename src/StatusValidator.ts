import type { StatusConfiguration } from './StatusConfiguration';

export class StatusValidator {
    /**
     * Determine whether the date in this object is valid, and return error message(s) for display if not.
     */
    public validate(statusConfiguration: StatusConfiguration): string[] {
        const errors: string[] = [];

        // Messages are added in the order fields are shown when editing statuses.
        errors.push(...this.validateSymbol(statusConfiguration));
        errors.push(...this.validateName(statusConfiguration));
        errors.push(...this.validateNextSymbol(statusConfiguration));

        return errors;
    }

    public validateSymbol(statusConfiguration: StatusConfiguration): string[] {
        return StatusValidator.validateOneSymbol(statusConfiguration.symbol, 'Task Status Symbol');
    }

    public validateNextSymbol(statusConfiguration: StatusConfiguration): string[] {
        return StatusValidator.validateOneSymbol(statusConfiguration.nextStatusSymbol, 'Task Next Status Symbol');
    }

    public validateName(statusConfiguration: StatusConfiguration) {
        const errors: string[] = [];
        if (statusConfiguration.name.length === 0) {
            errors.push('Task Status Name cannot be empty.');
        }
        return errors;
    }

    private static validateOneSymbol(symbol: string, symbolName: string): string[] {
        const errors: string[] = [];
        if (symbol.length === 0) {
            errors.push(`${symbolName} cannot be empty.`);
        }

        if (symbol.length > 1) {
            errors.push(`${symbolName} ("${symbol}") must be a single character.`);
        }
        return errors;
    }
}
