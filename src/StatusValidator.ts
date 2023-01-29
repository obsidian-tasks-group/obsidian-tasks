import type { StatusConfiguration } from './StatusConfiguration';
import { StatusType } from './StatusConfiguration';
import type { StatusCollectionEntry } from './StatusCollection';
import { Status } from './Status';
import { StatusRegistry } from './StatusRegistry';

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

    /**
     * Validate data in StatusCollection lists. These are the descriptions of statuses in various themes,
     * that are imported via one-click buttons in the Custom Status settings.
     *
     * This does a few checks to guard against human error when creating the lists, and then
     * also calls {@link validate} too.
     * @param entry
     */
    public validateStatusCollectionEntry(entry: StatusCollectionEntry) {
        const [symbol, _name, nextStatusSymbol, typeAsString] = entry;

        const errors: string[] = [];

        // Checks that can only be done on the raw data.
        // Status.createFromImportedValue() falls back to StatusType.TODO if the
        // type string is not recognised, so we have to test that first.
        errors.push(...this.validateType(typeAsString));

        // For users, it is valid to have a status that toggles to itself.
        // For imported data for themes, it seems worth preventing that situation,
        // to guard against human error when setting up the status collections.
        // But make an exception for any non-tasks in imported data.
        if (symbol === nextStatusSymbol && typeAsString !== 'NON_TASK') {
            errors.push(`Status symbol '${symbol}' toggles to itself`);
        }

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
        const errors: string[] = [];

        const symbol = configuration.symbol;
        const registry = new StatusRegistry();
        const symbolToSearchFor = symbol === 'X' ? 'x' : symbol;
        const defaultStatusFromRegistry = registry.bySymbol(symbolToSearchFor);
        if (defaultStatusFromRegistry.type !== StatusType.EMPTY) {
            if (configuration.nextStatusSymbol !== defaultStatusFromRegistry.nextStatusSymbol) {
                errors.push(
                    `Next Status Symbol for symbol '${symbol}': '${configuration.nextStatusSymbol}' is inconsistent with convention '${defaultStatusFromRegistry.nextStatusSymbol}'`,
                );
            }
            if (configuration.type !== defaultStatusFromRegistry.type) {
                errors.push(
                    `Status Type for symbol '${symbol}': '${configuration.type}' is inconsistent with convention '${defaultStatusFromRegistry.type}'`,
                );
            }
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
