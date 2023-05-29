import type { TaskGroups } from '../../src/Query/TaskGroups';
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
    if (!field.supportsGrouping()) {
        return {
            message: () => `'${field.fieldName()}' field doesn't support grouping.`,
            pass: false,
        };
    }

    const fieldGrouper = field.createNormalGrouper();
    if (fieldGrouper.property !== property) {
        return {
            message: () =>
                `'${field.fieldName()}' field grouper property set to '${
                    fieldGrouper.property
                }', expected '${property}'.`,
            pass: false,
        };
    }

    return {
        message: () =>
            `'${field.fieldName()}' field supports grouping, grouping property set to '${fieldGrouper.property}'.`,
        pass: true,
    };
}

export function expectGroupHeadingsToBe(groups: TaskGroups, expectedGroupHeadings: string[]) {
    const groupHeadings: string[] = [];
    groups.groups.forEach((taskGroup) => {
        taskGroup.groupHeadings.forEach((heading) => {
            groupHeadings.push(heading.displayName);
        });
    });

    expect(groupHeadings).toEqual(expectedGroupHeadings);
}
