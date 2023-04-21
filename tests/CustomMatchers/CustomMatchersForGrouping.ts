import type { Field } from '../../src/Query/Filter/Field';

declare global {
    namespace jest {
        interface Matchers<R> {
            toSupportGroupingWithProperty(property: string): R;
        }

        interface Expect {
            toSupportGroupingWithProperty(property: string): any;
        }

        interface InverseAsymmetricMatchers {
            toSupportGroupingWithProperty(property: string): any;
        }
    }
}

export function toSupportGroupingWithProperty(field: Field, property: string) {
    const fieldGrouper = field.createGrouper();

    const groupingIsSupported = field.supportsGrouping();
    const propertyAsExpected = fieldGrouper.property === property;

    if (groupingIsSupported && propertyAsExpected) {
        return {
            message: () =>
                `'${field.fieldName()}' field supports grouping with property set to '${fieldGrouper.property}'.`,
            pass: true,
        };
    }

    if (groupingIsSupported && !propertyAsExpected) {
        return {
            message: () =>
                `'${field.fieldName()}' field supports grouping but property set to '${property}', expected '${
                    fieldGrouper.property
                }'.`,
            pass: false,
        };
    }

    if (!groupingIsSupported && propertyAsExpected) {
        return {
            message: () =>
                `'${field.fieldName()}' field doesn't support grouping, while property is set to '${
                    fieldGrouper.property
                }' as expected.`,
            pass: false,
        };
    }

    return {
        message: () =>
            `'${field.fieldName()}' field doesn't support grouping and property set to '${property}', expected '${
                fieldGrouper.property
            }'.`,
        pass: false,
    };
}
