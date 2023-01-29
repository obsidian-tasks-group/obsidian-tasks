import type { StatusConfiguration } from './StatusConfiguration';
import { StatusType } from './StatusConfiguration';
import type { StatusCollectionEntry } from './StatusCollection';
import { Status } from './Status';

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

    public validateStatusCollectionEntry(entry: StatusCollectionEntry) {
        const [_symbol, _name, _nextSymbol, typeAsString] = entry;

        const errors: string[] = [];

        // Checks that can only be done on the raw data.
        // Status.createFromImportedValue() falls back to StatusType.TODO if the
        // type string is not recognised, so we have to test that first.
        errors.push(...this.validateType(typeAsString));

        // If the raw data was not valid, return now, to avoid potentially misleading
        // errors from later checks.
        if (errors.length > 0) {
            return errors;
        }

        const configuration = Status.createFromImportedValue(entry).configuration;
        errors.push(...this.validateSymbolTypeConventions(configuration));
        errors.push(...this.validate(configuration));

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

    public validateType(symbolName: string): string[] {
        const statusTypeElement = StatusType[symbolName as keyof typeof StatusType];
        const errors: string[] = [];
        if (!statusTypeElement) {
            errors.push(`Status Type "${symbolName}" is not a valid type`);
        }
        if (statusTypeElement == StatusType.EMPTY) {
            errors.push('Status Type "EMPTY" is not permitted in user data');
        }
        return errors;
    }

    public validateSymbolTypeConventions(configuration: StatusConfiguration): string[] {
        const symbol = configuration.symbol;
        const type = configuration.type;
        let suspect = false;
        if (symbol === ' ' && type !== StatusType.TODO) {
            suspect = true;
        }
        if (symbol === 'x' && type !== StatusType.DONE) {
            suspect = true;
        }
        if (symbol === 'X' && type !== StatusType.DONE) {
            suspect = true;
        }
        if (symbol === '/' && type !== StatusType.IN_PROGRESS) {
            suspect = true;
        }
        if (symbol === '-' && type !== StatusType.CANCELLED) {
            suspect = true;
        }
        if (suspect) {
            return [`Status Type '${type}' is not consistent with conventions for symbol '${symbol}'`];
        } else {
            return [];
        }
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
