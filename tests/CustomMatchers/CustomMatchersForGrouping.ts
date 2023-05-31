import { diff } from 'jest-diff';
import type { Grouper } from 'Query/Grouper';
import type { Task } from 'Task';
import { TaskGroups } from '../../src/Query/TaskGroups';
import type { Field } from '../../src/Query/Filter/Field';

declare global {
    namespace jest {
        interface Matchers<R> {
            toSupportGroupingWithProperty(property: string): R;
            groupHeadingsToBe(expectedGroupHeadings: string[]): R;
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

export function groupHeadingsToBe(
    { grouper, tasks }: { grouper: Grouper; tasks: Task[] },
    expectedGroupHeadings: string[],
): jest.CustomMatcherResult {
    tasks.sort(() => Math.random() - 0.5);
    const groups = new TaskGroups([grouper], tasks);

    const groupHeadings: string[] = [];
    groups.groups.forEach((taskGroup) => {
        taskGroup.groupHeadings.forEach((heading) => {
            groupHeadings.push(heading.displayName);
        });
    });

    const pass: boolean = groupHeadings.join() === expectedGroupHeadings.join();
    const message: () => string = () =>
        pass
            ? `Group headings should not be\n${expectedGroupHeadings.join('\n')}`
            : `Group headings are not the same as expected: ${diff(expectedGroupHeadings, groupHeadings)}`;

    return {
        message,
        pass,
    };
}
