import { TaskGroups } from '../../src/Query/TaskGroups';
import type { Field } from '../../src/Query/Filter/Field';
import type { Task } from '../../src/Task';
import type { Grouper } from '../../src/Query/Grouper';

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

export function expectGroupHeadingsToBe(grouper: Grouper, tasks: Task[], expectedGroupHeadings: string[]) {
    tasks.sort(() => Math.random() - 0.5);

    // Act
    const groups = new TaskGroups([grouper], tasks);
    const groupHeadings: string[] = [];
    groups.groups.forEach((taskGroup) => {
        taskGroup.groupHeadings.forEach((heading) => {
            groupHeadings.push(heading.displayName);
        });
    });

    // Assert
    expect(groupHeadings).toEqual(expectedGroupHeadings);
}
